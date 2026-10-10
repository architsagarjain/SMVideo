#!/usr/bin/env python3
"""Splits the static end-screen image into animatable layers.

Output (public/endscreen/):
  full.png        - the original image, upscaled 900x1600 -> 1080x1920 (Lanczos)
  plate.png       - the same image with the text / logo / CTA removed (inpainted background)
  <element>.png   - each element cut from the ORIGINAL pixels, with a soft alpha matte
  layers.json     - position and size of every element layer (1080x1920 space)

Nothing is redrawn: every element layer is a crop of the original pixels, so when all
layers are fully visible the composite is the original design. Only the background
behind the elements is synthesised, and it is visible only while an element is
fading in.
"""
import json, os, sys
import cv2
import numpy as np
from PIL import Image

SRC = sys.argv[1] if len(sys.argv) > 1 else "assets/end_screen_original.webp"
OUT = sys.argv[2] if len(sys.argv) > 2 else "public/endscreen"
W, H = 1080, 1920
K = W / 900.0  # boxes below are measured on the 900x1600 original

# (name, x0, y0, x1, y1) in original 900x1600 pixels.
TEXT_BOXES = [
    ("logo", 325, 52, 578, 292),
    ("divider", 400, 304, 500, 332),
    ("headline1", 138, 352, 762, 428),
    ("headline2", 100, 428, 806, 512),
    ("subhead", 72, 530, 830, 606),
    ("feature1", 60, 648, 350, 722),
    ("rule1", 362, 650, 378, 720),
    ("feature2", 396, 648, 568, 722),
    ("rule2", 590, 650, 606, 720),
    ("feature3", 628, 648, 838, 722),
]
CTA_BOX = ("cta", 168, 748, 742, 836)


def to_px(b):
    n, x0, y0, x1, y1 = b
    return n, int(round(x0 * K)), int(round(y0 * K)), int(round(x1 * K)), int(round(y1 * K))


def main():
    os.makedirs(OUT, exist_ok=True)
    im = Image.open(SRC).convert("RGB").resize((W, H), Image.LANCZOS)
    img = np.asarray(im).copy()
    im.save(f"{OUT}/full.png")

    lum = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY).astype(np.float32)
    # Background luminance: a morphological closing removes thin dark strokes (text).
    closed = cv2.morphologyEx(lum, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (31, 31)))
    ink = np.clip((closed - lum - 6) / 30.0, 0, 1)  # 0 = background, 1 = full ink

    mask_all = np.zeros((H, W), np.uint8)
    alphas = {}
    for b in TEXT_BOXES:
        n, x0, y0, x1, y1 = to_px(b)
        m = np.zeros((H, W), np.float32)
        m[y0:y1, x0:x1] = ink[y0:y1, x0:x1]
        hard = (m > 0.02).astype(np.uint8)
        # Remove-from-plate mask: generous, so no anti-aliased fringe is left behind.
        mask_all |= cv2.dilate(hard, np.ones((7, 7), np.uint8))
        # Layer alpha: dilated + feathered, so the cut-out carries its own edge pixels.
        a = cv2.dilate(hard, np.ones((9, 9), np.uint8)).astype(np.float32)
        a = cv2.GaussianBlur(a, (0, 0), 1.6)
        a[:y0, :] = 0; a[y1:, :] = 0; a[:, :x0] = 0; a[:, x1:] = 0
        alphas[n] = (a, (x0, y0, x1, y1))

    # CTA pill: a solid maroon shape. Select red-dominant dark pixels, fill holes (the
    # white lettering), grow it a little to take the soft shadow with it.
    n, x0, y0, x1, y1 = to_px(CTA_BOX)
    r, g = img[..., 0].astype(int), img[..., 1].astype(int)
    pill = ((r - g > 60) & (lum < 170)).astype(np.uint8)
    pill[:y0, :] = 0; pill[y1:, :] = 0; pill[:, :x0] = 0; pill[:, x1:] = 0
    cnts, _ = cv2.findContours(pill, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    big = max(cnts, key=cv2.contourArea)
    filled = np.zeros_like(pill)
    cv2.drawContours(filled, [big], -1, 1, -1)
    px, py, pw, ph = cv2.boundingRect(big)
    print("cta pill bbox", px, py, pw, ph)
    pill_remove = cv2.dilate(filled, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (17, 17)))
    a = cv2.dilate(filled, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (13, 13))).astype(np.float32)
    a = cv2.GaussianBlur(a, (0, 0), 3.0)
    alphas["cta"] = (a, (px - 14, py - 14, px + pw + 14, py + ph + 14))

    # Plate: inpaint the thin text strokes (Telea works well on a smooth gradient).
    plate = cv2.inpaint(img, mask_all * 255, 6, cv2.INPAINT_TELEA)
    # The pill is too large for diffusion inpainting: fill each row by blending the
    # background just left and right of it, then match the image's fine grain.
    ys, xs = np.where(pill_remove > 0)
    for y in range(ys.min(), ys.max() + 1):
        row = np.where(pill_remove[y] > 0)[0]
        if len(row) == 0:
            continue
        l, rr = row.min(), row.max()
        cl = plate[y, max(l - 8, 0):l - 2].mean(0)
        cr = plate[y, rr + 3:min(rr + 9, W)].mean(0)
        t = np.linspace(0, 1, rr - l + 1)[:, None]
        plate[y, l:rr + 1] = (cl * (1 - t) + cr * t)
    rng = np.random.default_rng(7)
    grain = rng.normal(0, 1.2, plate.shape)
    sel = pill_remove > 0
    plate = plate.astype(np.float32)
    plate[sel] += grain[sel]
    # Soften the seam between the filled rows and the original background.
    sm = cv2.GaussianBlur(plate, (0, 0), 2.0)
    seam = cv2.GaussianBlur(sel.astype(np.float32), (0, 0), 3) * (1 - sel)
    plate = plate * (1 - seam[..., None]) + sm * seam[..., None]
    plate = np.clip(plate, 0, 255).astype(np.uint8)
    Image.fromarray(plate).save(f"{OUT}/plate.png")

    layers = {}
    for name, (a, (x0, y0, x1, y1)) in alphas.items():
        x0, y0 = max(x0, 0), max(y0, 0)
        x1, y1 = min(x1, W), min(y1, H)
        rgba = np.dstack([img[y0:y1, x0:x1], (np.clip(a[y0:y1, x0:x1], 0, 1) * 255).astype(np.uint8)])
        Image.fromarray(rgba, "RGBA").save(f"{OUT}/{name}.png")
        layers[name] = {"x": x0, "y": y0, "w": x1 - x0, "h": y1 - y0}
    json.dump(layers, open(f"{OUT}/layers.json", "w"), indent=2)


    # Check: plate + all layers at rest should reproduce the original image.
    comp = plate.astype(np.float32)
    for name, (a, _) in alphas.items():
        a3 = np.clip(a, 0, 1)[..., None]
        comp = comp * (1 - a3) + img.astype(np.float32) * a3
    err = np.abs(comp - img.astype(np.float32))
    print("recomposite error: mean %.3f  max %.1f  p99.9 %.1f" % (err.mean(), err.max(), np.percentile(err, 99.9)))


if __name__ == "__main__":
    main()
