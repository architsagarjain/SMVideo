"""Animates the Chhath Puja poster into chhath_puja_reel.mp4, timed like reference_sunday.mp4
(1080x1350, 30 fps, 12.01 s) and using that video's audio track unchanged.
Run layers.py first. usage: python3 animate.py <scratch_dir>   (needs ffmpeg, numpy, opencv)"""
import os, sys, math, subprocess, numpy as np, cv2

HERE = os.path.dirname(os.path.abspath(__file__))
SCR = sys.argv[1]
W, H, FPS = 1080, 1350, 30
NF = 360                         # 12.0 s of video; the reference audio (12.01 s) is copied as is
REF = os.path.join(HERE, "reference_sunday.mp4")
K = W / 1122                     # poster -> 1080 scale

def ease(x): x = min(max(x, 0.0), 1.0); return x * x * (3 - 2 * x)
def eout(x): x = min(max(x, 0.0), 1.0); return 1 - (1 - x) ** 3
def back(x):  # ease-out with a small overshoot, for the "pop"
    x = min(max(x, 0.0), 1.0); c = 1.7; return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2

L = lambda n: cv2.imread(os.path.join(HERE, "layers", n), cv2.IMREAD_UNCHANGED).astype(np.float32)
BG = L("background.png")[:, :, :3]
LAY = {n: L(n + ".png") for n in ("logo", "title", "underline", "body", "sunicon", "happy", "chhath", "diya")}

def bbox(a):
    ys, xs = np.where(a[:, :, 3] > 8)
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
BOX = {n: bbox(l) for n, l in LAY.items()}

# the three message lines: split the body layer at its empty rows
_rows = LAY["body"][:, :, 3].max(1) > 8
_bands, _in = [], False
for y, r in enumerate(_rows):
    if r and not _in: s0 = y; _in = True
    if not r and _in: _bands.append((s0, y)); _in = False
BODY_LINES = [b for b in _bands if b[1] - b[0] > 8][:3]

def put(fr, lay, a, dx=0, dy=0, scale=1.0, blur=0.0, mask=None):
    """alpha-blend the layer's bbox region onto fr, with optional offset/scale/blur and extra mask."""
    if a <= 0.003: return
    x0, y0, x1, y1 = BOX_CUR
    pad = 40
    X0, Y0, X1, Y1 = max(0, x0 - pad), max(0, y0 - pad), min(W, x1 + pad), min(H, y1 + pad)
    src = lay[Y0:Y1, X0:X1]
    if scale != 1.0 or dx or dy:
        cx, cy = (x0 + x1) / 2 - X0, (y0 + y1) / 2 - Y0
        M = np.float32([[scale, 0, cx * (1 - scale) + dx], [0, scale, cy * (1 - scale) + dy]])
        src = cv2.warpAffine(src, M, (X1 - X0, Y1 - Y0), flags=cv2.INTER_LINEAR, borderValue=(0, 0, 0, 0))
    if blur > 0.3:
        k = int(blur * 3) | 1
        src = cv2.GaussianBlur(src, (k, k), blur)
    al = src[:, :, 3:4] / 255.0 * a
    if mask is not None: al = al * mask[Y0:Y1, X0:X1, None]
    fr[Y0:Y1, X0:X1] = fr[Y0:Y1, X0:X1] * (1 - al) + src[:, :, :3] * al

def shine(fr, name, p, width=70, strength=0.75):
    """a soft diagonal light band sweeping across one element's own pixels"""
    if not 0 < p < 1: return
    x0, y0, x1, y1 = BOX[name]
    lay = LAY[name]
    reg = lay[y0:y1, x0:x1, 3] / 255.0
    xs = np.arange(x1 - x0)[None, :] + np.arange(y1 - y0)[:, None] * 0.45
    pos = -width * 2 + p * (x1 - x0 + (y1 - y0) * 0.45 + width * 4)
    band = np.exp(-((xs - pos) ** 2) / (2 * width ** 2)) * reg * strength
    fr[y0:y1, x0:x1] += band[:, :, None] * np.array([235, 245, 255], np.float32)  # BGR, warm white

yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
SUN = (318 * K, 963 * K)
r2 = (xx - SUN[0]) ** 2 + (yy - SUN[1]) ** 2
SUN_GLOW = np.exp(-r2 / (2 * 150 ** 2))[:, :, None]
SUN_ANG = np.arctan2(yy - SUN[1], xx - SUN[0])
SUN_FALL = np.exp(-np.sqrt(r2) / 520)
FLAME = (638 * K, 1213 * K)
FLAME_GLOW = np.exp(-((xx - FLAME[0]) ** 2 + (yy - FLAME[1]) ** 2) / (2 * 38 ** 2))[:, :, None]
WARM = np.array([120, 200, 255], np.float32)   # BGR

def sunlight(fr, t, extra=0.0):
    rays = (0.5 + 0.5 * np.cos(SUN_ANG * 14 + t * 0.35)) ** 6 * SUN_FALL
    pulse = 0.85 + 0.15 * math.sin(t * 1.6)
    fr += (SUN_GLOW * (0.22 * pulse + extra) + rays[:, :, None] * 0.10) * WARM

rd = None
cmd = ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
       "-i", REF, "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-crf", "15", "-preset", "slow", "-pix_fmt", "yuv420p",
       "-c:a", "copy", "-movflags", "+faststart", os.path.join(HERE, "chhath_puja_reel.mp4")]
wr = subprocess.Popen(cmd, stdin=subprocess.PIPE)
for i in range(NF):
    t = i / FPS
    fr = BG.copy()
    # ambient light: sun glow + slowly turning rays, diya flame flicker
    sunlight(fr, t, extra=0.18 * math.exp(-((t - 0.45) / 0.35) ** 2))
    fl = 0.8 + 0.2 * math.sin(t * 13) * math.sin(t * 7.7)
    fr += FLAME_GLOW * 0.55 * fl * np.array([60, 160, 255], np.float32)

    # 0.45 s logo
    BOX_CUR = BOX["logo"]; put(fr, LAY["logo"], ease((t - 0.45) / 0.4), scale=0.94 + 0.06 * eout((t - 0.45) / 0.5))
    # 0.95 s title: comes into focus
    BOX_CUR = BOX["title"]; p = (t - 0.95) / 0.45
    put(fr, LAY["title"], ease(p), blur=9 * (1 - eout(p)), scale=1.04 - 0.04 * eout(p))
    # 1.3 s underline grows from the centre
    BOX_CUR = BOX["underline"]; p = eout((t - 1.3) / 0.3)
    if p > 0:
        x0, _, x1, _ = BOX["underline"]; cx = (x0 + x1) / 2
        m = (np.abs(xx - cx) <= p * (x1 - x0) / 2 + 1).astype(np.float32)
        put(fr, LAY["underline"], 1.0, mask=m)
    # 1.45 s message lines, one after another
    for j, (a0, a1) in enumerate(BODY_LINES):
        p = (t - (1.45 + 0.17 * j)) / 0.35
        if p <= 0: continue
        m = ((yy >= a0 - 2) & (yy < a1 + 2)).astype(np.float32)
        BOX_CUR = (BOX["body"][0], a0, BOX["body"][2], a1)
        put(fr, LAY["body"], ease(p), dy=10 * (1 - eout(p)), mask=m)
    # 2.4 s sun-ray icon sweeps on left to right
    BOX_CUR = BOX["sunicon"]; p = (t - 2.4) / 0.4
    if p > 0:
        x0, y0, x1, y1 = BOX["sunicon"]; cx, cy = (x0 + x1) / 2, y1 + 10
        from_left = math.pi - np.arctan2(cy - yy, xx - cx)     # 0 on the left .. pi on the right
        m = np.clip((ease(p) * (math.pi + 0.3) - from_left) / 0.25, 0, 1)
        put(fr, LAY["sunicon"], 1.0, mask=m)
    # 2.55 s "Happy"
    BOX_CUR = BOX["happy"]; p = (t - 2.55) / 0.35
    put(fr, LAY["happy"], ease(p), dy=12 * (1 - eout(p)))
    # 3.05 s "Chhath Puja" writes on left to right
    p = (t - 3.05) / 0.95
    if p > 0:
        x0, _, x1, _ = BOX["chhath"]; edge = 45
        front = x0 - edge + ease(p) * (x1 - x0 + 2 * edge)
        m = np.clip((front - xx) / edge, 0, 1)
        BOX_CUR = BOX["chhath"]; put(fr, LAY["chhath"], 1.0, mask=m)
    # 3.65 s diya and waves pop in
    BOX_CUR = BOX["diya"]; p = (t - 3.65) / 0.4
    if p > 0: put(fr, LAY["diya"], ease(p * 1.5), scale=0.75 + 0.25 * back(p))

    # hold: light sweeps across the key elements
    shine(fr, "title", (t - 5.2) / 0.8)
    shine(fr, "chhath", (t - 6.3) / 1.0, width=80)
    shine(fr, "logo", (t - 8.3) / 0.8, width=60, strength=0.5)
    shine(fr, "chhath", (t - 10.0) / 1.0, width=80)

    # whole frame: open from black with a bright sunrise bloom, slow push-in
    z = 1.0 + 0.035 * ease(t / 12.0)
    M = np.float32([[z, 0, W / 2 * (1 - z)], [0, z, H * 0.55 * (1 - z)]])
    fr = cv2.warpAffine(fr, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    fr = fr * ease(t / 0.4) + 255 * 0.1 * math.exp(-((t - 0.4) / 0.3) ** 2)
    wr.stdin.write(np.clip(fr, 0, 255).astype(np.uint8).tobytes())
wr.stdin.close(); wr.wait()
print("done")
