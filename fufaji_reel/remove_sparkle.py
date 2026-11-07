"""Removes the static semi-transparent white sparkle (bottom right) by reverse alpha blending.
The overlay's per-pixel alpha is estimated from all frames (observed vs. an inpainted background), then each frame is
un-blended exactly: bg = (obs - a*255) / (1 - a). A light inpaint cleans the last few edge pixels.
Usage: python3 remove_sparkle.py IN.mp4 OUT.mp4"""
import sys, subprocess
import numpy as np, cv2
IN, OUT = sys.argv[1:3]; W, H = 1080, 1920
X0, Y0, X1, Y1 = 850, 1690, 950, 1790                     # box around the sparkle (centre ~ 900, 1740)
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", IN, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)
reg = fr[:, Y0:Y1, X0:X1].astype(np.float32)
# star mask from the 10th-percentile image (the overlay is always there, the scene is not)
mn = np.percentile(reg.mean(3), 10, axis=0); hp = mn - cv2.GaussianBlur(mn, (0, 0), 12)
m = (hp > 5).astype(np.uint8); n, lab, st, _ = cv2.connectedComponentsWithStats(m); k = 1 + int(np.argmax(st[1:, 4])); star = (lab == k).astype(np.uint8)
star = cv2.morphologyEx(star, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8)); zone = cv2.dilate(star, np.ones((9, 9), np.uint8))
# alpha estimate: per frame, background from inpainting the zone; alpha = (obs - bg) / (255 - bg), median over frames
al = []
for f in reg[::3]:
    bg = cv2.inpaint(np.clip(f, 0, 255).astype(np.uint8), zone, 6, cv2.INPAINT_TELEA).astype(np.float32)
    al.append(np.clip((f - bg) / np.maximum(255 - bg, 12), 0, .95).mean(2))
alpha = np.median(np.stack(al), 0) * zone; alpha = cv2.GaussianBlur(alpha, (0, 0), .6) * zone
print("star px", int(star.sum()), "alpha median inside", round(float(np.median(alpha[star > 0])), 3))
edge = (cv2.dilate(zone, np.ones((3, 3), np.uint8)) - cv2.erode(star, np.ones((5, 5), np.uint8))).astype(np.uint8)
enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", "24", "-i", "-", "-i", IN,
                        "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-preset", "slow", "-crf", "14", "-pix_fmt", "yuv420p", "-c:a", "copy", OUT], stdin=subprocess.PIPE)
a3 = alpha[..., None]
for f in fr:
    f = f.copy(); r = f[Y0:Y1, X0:X1].astype(np.float32)
    un = np.clip((r - a3 * 255) / np.maximum(1 - a3, .05), 0, 255).astype(np.uint8)
    un = cv2.inpaint(un, edge, 3, cv2.INPAINT_TELEA)                         # tidy the anti-aliased rim
    f[Y0:Y1, X0:X1] = un; enc.stdin.write(f.tobytes())
enc.stdin.close(); enc.wait(); print("wrote", OUT)
