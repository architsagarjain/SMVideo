"""Renders short previews of each caption style over real footage. Usage: python3 preview_text_styles.py CLIP_DIR OUT_DIR"""
import sys, os, subprocess
import numpy as np, cv2
from text_styles import STYLES, W, H, smooth
RAW, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
FPS = 30; DURP = 5.4
CAPS = [("Every love story starts quietly...", .35, 2.95), ("...then comes the colour.", 2.8, 5.25)]
def seg(clip, ss, speed, dur):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(ss), "-t", str(dur * speed + .2), "-i", os.path.join(RAW, clip), "-vf", f"setpts=PTS/{speed},fps={FPS}", "-t", str(dur), "-an", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, 1280, 720, 3)
A = seg("c4.mp4", 12.95, .6, 3.1); B = seg("c1.mp4", 1.5, .8, 2.6)          # muted portrait, then the haldi colour
def bg(i):
    t = i / FPS
    if t < 2.8: f = A[min(i, len(A) - 1)].astype(np.float32); c = .3
    else: f = B[min(int((t - 2.8) * FPS), len(B) - 1)].astype(np.float32); c = .3 + .7 * smooth((t - 2.8) / .4)
    f = cv2.resize(f, (W, H), interpolation=cv2.INTER_CUBIC); l = f.mean(2, keepdims=True); f = l + (f - l) * c
    return np.clip(f * np.float32([1.03, 1.0, .96]), 0, 255)
for key, cls in STYLES.items():
    st = cls(CAPS); path = os.path.join(OUT, f"caption_style_{key}_{cls.name.replace(' ', '_')}.mp4")
    ff = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", "720x1280", "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-crf", "20", "-pix_fmt", "yuv420p", path], stdin=subprocess.PIPE)
    for i in range(int(DURP * FPS)):
        img = st.apply(bg(i), i / FPS); ff.stdin.write(cv2.resize(np.clip(img, 0, 255).astype(np.uint8), (720, 1280), interpolation=cv2.INTER_AREA).tobytes())
    ff.stdin.close(); ff.wait(); print("wrote", path)
