"""Overlays the CTA (maroon 'Start Your Journey' pill + website) on the held logo card. Audio is copied untouched.
Usage: python3 add_cta.py IN.mp4 OUT.mp4"""
import sys, os, subprocess, math
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont
IN, OUT = sys.argv[1:3]; W, H, FPS = 1080, 1920, 30
FD = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "fonts")
T_IN = 11.6                                            # the logo card has fully appeared by now
MAROON = (91, 10, 31); IVORY = (255, 250, 240)
def ease_out(x): x = min(max(x, 0.0), 1.0); return 1 - (1 - x) ** 3
def back_out(x, c1=1.6): x = min(max(x, 0.0), 1.0); c3 = c1 + 1; return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2
def layer(draw_fn):
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0)); draw_fn(ImageDraw.Draw(im)); return np.asarray(im, np.float32) / 255
fb, fu = ImageFont.truetype(os.path.join(FD, "Poppins-Medium.ttf"), 34), ImageFont.truetype(os.path.join(FD, "Poppins-Medium.ttf"), 30)
PILL = (540 - 190, 1318, 540 + 190, 1392)
def pill(d):
    d.rounded_rectangle(PILL, radius=37, fill=MAROON + (255,))
    tw = d.textlength("Start Your Journey", font=fb); bb = fb.getbbox("H"); cy = (PILL[1] + PILL[3]) / 2
    d.text((540 - tw / 2, cy - (bb[1] + bb[3]) / 2), "Start Your Journey", font=fb, fill=IVORY + (255,))
def url(d):
    t = "www.shaadimangalam.com"; tw = d.textlength(t, font=fu); d.text((540 - tw / 2, 1418), t, font=fu, fill=MAROON + (255,))
P, U = layer(pill), layer(url)
pmask = np.zeros((H, W), np.uint8); cv2.rounded = None
cv2.rectangle(pmask, (PILL[0] + 37, PILL[1]), (PILL[2] - 37, PILL[3]), 255, -1)
for cx in (PILL[0] + 37, PILL[2] - 37): cv2.circle(pmask, (cx, (PILL[1] + PILL[3]) // 2), 37, 255, -1)
pmask = pmask.astype(np.float32) / 255
xx = np.arange(W, dtype=np.float32)[None, :]; yy = np.arange(H, dtype=np.float32)[:, None]
def comp(img, L, a, s=1.0, cx=540, cy=1355, dy=0.0):
    if a <= 0: return img
    if abs(s - 1) > 1e-3 or dy:
        M = np.float32([[s, 0, cx - cx * s], [0, s, cy - cy * s + dy]]); L = cv2.warpAffine(L, M, (W, H), flags=cv2.INTER_LINEAR)
    al = L[..., 3:4] * a; return img * (1 - al) + L[..., :3] * 255 * al
src = subprocess.Popen(["ffmpeg", "-v", "error", "-i", IN, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-i", IN,
                        "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p", "-profile:v", "high",
                        "-c:a", "copy", "-movflags", "+faststart", OUT], stdin=subprocess.PIPE)
n = 0
while True:
    buf = src.stdout.read(W * H * 3)
    if len(buf) < W * H * 3: break
    t = n / FPS; img = np.frombuffer(buf, np.uint8).reshape(H, W, 3).astype(np.float32)
    if t >= T_IN:
        p = (t - T_IN) / .45
        img = comp(img, P, min(1.0, p * 2.5), .82 + .18 * back_out(p))                                   # button pops in
        u = (t - T_IN - .3) / .5; img = comp(img, U, ease_out(u), 1.0, dy=(1 - ease_out(u)) * 14)        # website rises in
        g = (t - T_IN - 1.0) / .7                                                                          # one shine sweep across the button
        if 0 <= g <= 1:
            sx = PILL[0] - 80 + (PILL[2] - PILL[0] + 160) * g
            sh = np.exp(-(((xx - sx) + (yy - 1355) * .5) / 40) ** 2) * pmask * .35
            img = img + (255 - img) * sh[..., None]
    enc.stdin.write(np.clip(img, 0, 255).astype(np.uint8).tobytes()); n += 1
enc.stdin.close(); enc.wait(); src.wait(); print("frames", n, "->", OUT)
