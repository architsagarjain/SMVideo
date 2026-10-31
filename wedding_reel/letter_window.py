"""'Letter Window' caption sequence. Two kinds of caption:
  outline: a big outlined key word drifts across the picture (its ink turns black on bright footage, white on dark footage);
  window:  the picture is veiled in maroon with the key word acting as a window onto the footage; the camera then zooms through a letter and a small caption settles at the top."""
import math, os
import numpy as np, cv2
from PIL import Image, ImageDraw
from text_styles import W, H, IVORY, GOLD, clamp, smooth, ease_out, fnt, line_mask, cap_center, paste
from text_styles2 import big_font, tracked_mask, VEIL

INK = np.array([20, 16, 14], np.float32)
def dark_amount(img, box):
    """0 = background is dark (use white ink), 1 = background is bright (use black ink)."""
    x0, y0, x1, y1 = [int(v) for v in box]; x0, y0, x1, y1 = max(0, x0), max(0, y0), min(W, x1), min(H, y1)
    return smooth((float(img[y0:y1:8, x0:x1:8].mean()) - 100) / 18)      # decisive switch: dark scenes -> white ink, bright scenes -> black ink
def ink_paste(img, m, x, y, a, dk):
    """Paste a mask in white or black ink depending on the picture behind it, with a faint opposite-colour halo for legibility."""
    if a <= 0: return
    if dk > .05: paste(img, cv2.GaussianBlur(m, (0, 0), 6), x, y, IVORY, a * .40 * dk, shadow=0)
    paste(img, m, x, y, IVORY * (1 - dk) + INK * dk, a, shadow=(1 - dk) * .55)


class LetterWindowSeq:
    name = "Letter Window"
    def __init__(self, caps):
        self.caps = caps; self.fl = fnt("Poppins-Medium.ttf", 30); self.fs = fnt("Poppins-Medium.ttf", 36); self.items = []
        for c in caps:
            lm, ladv = tracked_mask(c["lead"], self.fl, 12); it = dict(c, lm=lm, ladv=ladv)
            if c["kind"] == "outline":
                f, adv = big_font("DMSerifDisplay-Italic.ttf", c["key"], 960, 380); im = Image.new("L", (int(adv) + 80, int(f.size * 1.6)), 0)
                ImageDraw.Draw(im).text((40, 20), c["key"], font=f, fill=48, stroke_width=4, stroke_fill=255); it["mask"] = np.asarray(im, np.float32) / 255   # outline plus a faint inner tint
            else:
                lines = c["key"].split("\n"); f, _ = big_font("DMSerifDisplay-Regular.ttf", max(lines, key=len), 1000, 420 if len(lines) == 1 else 320)
                im = Image.new("L", (W, H), 0); d = ImageDraw.Draw(im); lh = f.size * 1.1; th = lh * len(lines)
                for i, line in enumerate(lines):
                    adv = d.textlength(line, font=f); bb = f.getbbox(line); yc = 900 - th / 2 + lh * (i + .5); d.text((W / 2 - adv / 2, yc - (bb[1] + bb[3]) / 2), line, font=f, fill=255)
                M = np.asarray(im, np.float32) / 255; dt = cv2.distanceTransform((M > .5).astype(np.uint8), cv2.DIST_L2, 5)
                py, px = np.unravel_index(np.argmax(dt), dt.shape); it.update(M=M, P=(float(px), float(py)), s_end=max(60.0, 1700.0 / float(dt.max())))
                sm, sadv = line_mask(c["small"], self.fs, 3); it.update(sm=sm, sadv=sadv)
            self.items.append(it)
    def apply(self, img, t):
        for it in self.items:
            t0, t1 = it["t0"], it["t1"]
            if not (t0 - .01 <= t < t1 + .01): continue
            q = clamp((t - (t1 - .5)) / .5)
            if it["kind"] == "outline":
                a = ease_out((t - t0) / .8) * (1 - q); mk = it["mask"]; x = 540 - mk.shape[1] / 2 + (t - t0) * 22 - 12; y = 820 - mk.shape[0] / 2
                ink_paste(img, mk, x, y, a, dark_amount(img, (x, y, x + mk.shape[1], y + mk.shape[0])))
                lx, ly = 540 - it["ladv"] / 2 - 12, 380 - cap_center(self.fl) - 12; lm = it["lm"]
                ink_paste(img, lm, lx, ly, ease_out((t - t0 - .3) / .6) * (1 - q), dark_amount(img, (lx, ly, lx + lm.shape[1], ly + lm.shape[0])))
            else:
                tz = t0 + 1.25; u = clamp((t - tz) / .85); v = smooth((t - t0) / .35) * (1 - smooth((u - .82) / .18))
                if v > 0:
                    s = math.exp((u ** 2.2) * math.log(it["s_end"])) if u > 0 else 1 + .05 * clamp((t - t0) / 1.25); px, py = it["P"]
                    Ms = cv2.warpAffine(it["M"], np.float32([[s, 0, px - s * px], [0, s, py - s * py]]), (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT)
                    veil = (1 - Ms) * v; img[:] = img * (1 - veil[..., None]) + VEIL * veil[..., None]
                    if u == 0: paste(img, it["lm"], 540 - it["ladv"] / 2 - 12, 560 - cap_center(self.fl) - 12, IVORY, smooth((t - t0 - .2) / .5), shadow=.5)
                if u >= 1:
                    sm = it["sm"]; x, y = 540 - it["sadv"] / 2 - 12, 300 - cap_center(self.fs) - 12
                    ink_paste(img, sm, x, y, ease_out((t - tz - .85) / .5) * (1 - q), dark_amount(img, (x, y, x + sm.shape[1], y + sm.shape[0])))
        return img
