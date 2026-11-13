"""Animates the 'Your Forever Starts Here' end screen: logo, headline and subline are lifted off the sky (inpainted) and come in
one after another over a slow push-in; the button (always on the photo) gives a gentle pulse and a shine.
Usage: python3 animate_end_screen.py END_SCREEN.png OUT.mp4 [seconds]"""
import sys, subprocess, math
import numpy as np, cv2
SRC, OUT = sys.argv[1:3]; DUR = float(sys.argv[3]) if len(sys.argv) > 3 else 7.5
W, H, FPS = 1080, 1920, 30
def clamp(x): return min(max(x, 0.0), 1.0)
def ease_out(x): x = clamp(x); return 1 - (1 - x) ** 3
def back_out(x, c1=1.5): x = clamp(x); c3 = c1 + 1; return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2
src = cv2.cvtColor(cv2.imread(SRC), cv2.COLOR_BGR2RGB); h0, w0 = src.shape[:2]
r, g, b = [src[..., i].astype(int) for i in range(3)]
ink = (((r - g > 45) & (r < 200) & (g < 110)) | ((r < 90) & (g < 90) & (b < 90))).astype(np.uint8)
# (key, box in source px, start s, duration s, kind)
ITEMS = [("logo", (340, 105, 620, 385), .15, .6, "rise"), ("head", (205, 392, 755, 595), .65, .7, "rise"),
         ("sub", (180, 632, 770, 695), 1.25, .55, "rise"), ("btn", (195, 1435, 745, 1550), 1.75, .5, "pop"), ("url", (170, 1552, 775, 1610), 2.15, .5, "glow")]
masks, fg = {}, np.zeros((h0, w0), np.uint8)
for k, (x0, y0, x1, y1), *_ in ITEMS:
    m = np.zeros((h0, w0), np.uint8)
    if k == "btn":                                              # the whole pill, text included
        sub = ink[y0:y1, x0:x1]; m[y0:y1, x0:x1] = cv2.morphologyEx(sub, cv2.MORPH_CLOSE, np.ones((35, 35), np.uint8))
    else: m[y0:y1, x0:x1] = ink[y0:y1, x0:x1]
    m = cv2.dilate(m, np.ones((9, 9) if k in ("logo", "head", "sub") else (5, 5), np.uint8)); masks[k] = m
    if k == "logo":                                              # also catch the thin divider lines (light maroon, anti-aliased)
        lt = ((r - g > 25) & (g < 200)).astype(np.uint8); m[y0:y1, x0:x1] |= cv2.dilate(lt[y0:y1, x0:x1], np.ones((7, 7), np.uint8))
    if k in ("logo", "head", "sub"): fg |= m                     # button + website stay on the photo (the floor is never rebuilt)
clean = cv2.inpaint(src, cv2.dilate(fg, np.ones((7, 7), np.uint8)), 9, cv2.INPAINT_TELEA)
sc = W / w0; up = lambda im, interp=cv2.INTER_LANCZOS4: cv2.resize(im, (W, int(round(h0 * sc))), interpolation=interp)[:H]
def sharpen(im): bl = cv2.GaussianBlur(im, (0, 0), 1.2); return np.clip(im * 1.4 - bl * .4, 0, 255)
orig, base = sharpen(up(src).astype(np.float32)), sharpen(up(clean).astype(np.float32))
layers = {}
for k, (x0, y0, x1, y1), t0, d, kind in ITEMS:
    X0, Y0, X1, Y1 = [int(v * sc) for v in (x0, y0, x1, y1)]
    al = cv2.GaussianBlur(up(masks[k].astype(np.float32), cv2.INTER_LINEAR), (0, 0), 1.0)[Y0:Y1, X0:X1]
    layers[k] = (orig[Y0:Y1, X0:X1], np.clip(al, 0, 1)[..., None], (X0, Y0, X1, Y1), t0, d, kind)
enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                        "-c:v", "libx264", "-crf", "12", "-pix_fmt", "yuv420p", OUT], stdin=subprocess.PIPE)
for n in range(int(round(DUR * FPS))):
    t = n / FPS; img = base.copy()
    for k, (crop, al, (X0, Y0, X1, Y1), t0, d, kind) in layers.items():
        p = (t - t0) / d
        if p <= 0 and kind not in ("pop", "glow"): continue
        cw, ch = X1 - X0, Y1 - Y0
        if kind == "pop": s = 1 + .07 * math.sin(math.pi * clamp(p)); dy = 0                 # gentle pulse
        elif kind == "glow": s = 1.0; dy = 0
        else: s = .97 + .03 * ease_out(p); dy = (1 - ease_out(p)) * 26
        M = np.float32([[s, 0, cw / 2 * (1 - s)], [0, s, ch / 2 * (1 - s) + dy]])
        c2 = cv2.warpAffine(crop, M, (cw, ch), borderMode=cv2.BORDER_REFLECT); a2 = cv2.warpAffine(al, M, (cw, ch))[..., None] * (1.0 if kind in ('pop', 'glow') else clamp(p * 1.8))
        img[Y0:Y1, X0:X1] = img[Y0:Y1, X0:X1] * (1 - a2) + c2 * a2
        if k == "btn":                                                                    # one soft shine across the button
            g = (t - 2.8) / .8
            if 0 <= g <= 1:
                xs = np.arange(cw)[None, :] + np.arange(ch)[:, None] * .5; c = -60 + (cw + 120) * g
                shine = np.exp(-((xs - c) / 45) ** 2)[..., None] * a2 * .35; img[Y0:Y1, X0:X1] += (255 - img[Y0:Y1, X0:X1]) * shine
    x = t / DUR; z = 1 + .045 * (x * x * (3 - 2 * x)); cy = 1150                         # slow push-in toward the couple
    img = cv2.warpAffine(img, np.float32([[z, 0, 540 - 540 * z], [0, z, cy - cy * z]]), (W, H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
    enc.stdin.write(np.clip(img, 0, 255).astype(np.uint8).tobytes())
enc.stdin.close(); enc.wait(); print("wrote", OUT)
