"""Previews of the out-of-the-box caption styles over reel 2 footage. Usage: python3 preview_text_styles2.py CLIP_DIR OUT_DIR MODNET.onnx [keys...]"""
import sys, os, subprocess
import numpy as np, cv2
from text_styles import W, H, smooth
from text_styles2 import STYLES2
RAW, OUT, MODEL = sys.argv[1], sys.argv[2], sys.argv[3]; keys = sys.argv[4:] or list(STYLES2); os.makedirs(OUT, exist_ok=True)
FPS = 30; DURP = 5.4
CAPS = [("Every love story starts", "quietly", .35, 2.95), ("...then comes the", "colour", 2.8, 5.25)]
def seg(clip, ss, speed, dur):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(ss), "-t", str(dur * speed + .2), "-i", os.path.join(RAW, clip), "-vf", f"setpts=PTS/{speed},fps={FPS}", "-t", str(dur), "-an", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, 1280, 720, 3)
A = seg("c4.mp4", 12.95, .6, 3.1); B = seg("c1.mp4", 1.5, .8, 2.6)
def bg(i):
    t = i / FPS
    if t < 2.8: f = A[min(i, len(A) - 1)]; c = .3
    else: f = B[min(int((t - 2.8) * FPS), len(B) - 1)]; c = .3 + .7 * smooth((t - 2.8) / .4)
    return f, c
mattes = None
if "1" in keys:
    import onnxruntime as ort
    sess = ort.InferenceSession(MODEL, providers=["CPUExecutionProvider"]); mattes = []; prev = None
    for i in range(int(DURP * FPS)):
        f, _ = bg(i); x = (cv2.resize(f, (448, 800), interpolation=cv2.INTER_AREA).astype(np.float32) / 255 - .5) / .5
        m = sess.run(None, {"input": x.transpose(2, 0, 1)[None]})[0][0, 0]; m = cv2.resize(m, (540, 960))
        prev = m if prev is None else .55 * m + .45 * prev; mattes.append(prev.astype(np.float16))           # temporal smoothing against flicker
def frame(i):
    f, c = bg(i); f = cv2.resize(f, (W, H), interpolation=cv2.INTER_CUBIC).astype(np.float32); l = f.mean(2, keepdims=True); f = l + (f - l) * c
    return np.clip(f * np.float32([1.03, 1.0, .96]), 0, 255)
for key in keys:
    cls = STYLES2[key]; st = cls(CAPS); path = os.path.join(OUT, f"text_idea_{key}_{cls.name.replace(' ', '_')}.mp4")
    ff = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", "720x1280", "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-crf", "20", "-pix_fmt", "yuv420p", path], stdin=subprocess.PIPE)
    for i in range(int(DURP * FPS)):
        img = frame(i); t = i / FPS
        img = st.apply(img, t, cv2.resize(mattes[i].astype(np.float32), (W, H), interpolation=cv2.INTER_LINEAR)) if key == "1" else st.apply(img, t)
        ff.stdin.write(cv2.resize(np.clip(img, 0, 255).astype(np.uint8), (720, 1280), interpolation=cv2.INTER_AREA).tobytes())
    ff.stdin.close(); ff.wait(); print("wrote", path, flush=True)
