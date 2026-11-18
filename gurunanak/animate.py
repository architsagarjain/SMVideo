"""Animates the Guru Nanak Jayanti poster into guru_nanak_jayanti_reel.mp4 (1080x1350, 30 fps, 10 s)
with "Indian Music" by Alex Morgan (CC BY 4.0, see audio/LICENSES.txt).
Run layers.py first. usage: python3 animate.py   (needs ffmpeg, numpy, opencv)"""
import os, math, subprocess, numpy as np, cv2

HERE = os.path.dirname(os.path.abspath(__file__))
W, H, FPS, DUR = 1080, 1350, 30, 10.0
NF = int(DUR * FPS)
K = W / 1122                     # poster -> 1080 scale
MUSIC_START = 15.0               # the track's full groove enters 2 s in; its big hit lands at 3 s,
                                 # as "Guru Nanak Jayanti" finishes revealing

def ease(x): x = min(max(x, 0.0), 1.0); return x * x * (3 - 2 * x)
def eout(x): x = min(max(x, 0.0), 1.0); return 1 - (1 - x) ** 3
def back(x):  # ease-out with a small overshoot, for the "pop"
    x = min(max(x, 0.0), 1.0); c = 1.7; return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2

L = lambda n: cv2.imread(os.path.join(HERE, "layers", n), cv2.IMREAD_UNCHANGED).astype(np.float32)
BG = L("background.png")[:, :, :3]
LAY = {n: L(n + ".png") for n in ("logo", "portrait", "lines", "happy", "title", "arrows", "khanda", "body")}

def bbox(a):
    ys, xs = np.where(a[:, :, 3] > 8)
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
BOX = {n: bbox(l) for n, l in LAY.items()}

_rows = LAY["body"][:, :, 3].max(1) > 8
_bands, _in = [], False
for y, r in enumerate(_rows):
    if r and not _in: s0 = y; _in = True
    if not r and _in: _bands.append((s0, y)); _in = False
BODY_LINES = [b for b in _bands if b[1] - b[0] > 8][:2]

yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)

def put(fr, name, a, box=None, dx=0, dy=0, scale=1.0, blur=0.0, mask=None):
    """alpha-blend a layer (region around its bbox) onto fr, with optional offset/scale/blur and extra mask"""
    if a <= 0.003: return
    lay = LAY[name]
    x0, y0, x1, y1 = box or BOX[name]
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

def grow_out(name, p, soft=6):
    """mask that reveals a pair of side elements from the centre outwards"""
    x0, y0, x1, y1 = BOX[name]; cx = W / 2
    cols = np.where(LAY[name][y0:y1, :, 3].max(0) > 8)[0]
    gap = np.abs(cols - cx).min()                     # distance from centre to the inner ends
    reach = gap + p * (max(cx - x0, x1 - cx) - gap)
    return np.clip((reach - np.abs(xx - cx)) / soft, 0, 1)

def shine(fr, name, p, width=70, strength=0.7):
    """a soft diagonal light band sweeping across one element's own pixels"""
    if not 0 < p < 1: return
    x0, y0, x1, y1 = BOX[name]
    reg = LAY[name][y0:y1, x0:x1, 3] / 255.0
    xs = np.arange(x1 - x0)[None, :] + np.arange(y1 - y0)[:, None] * 0.45
    pos = -width * 2 + p * (x1 - x0 + (y1 - y0) * 0.45 + width * 4)
    band = np.exp(-((xs - pos) ** 2) / (2 * width ** 2)) * reg * strength
    fr[y0:y1, x0:x1] += band[:, :, None] * np.array([215, 240, 255], np.float32)   # BGR warm white

SUN = (672 * K, 872 * K)
r2 = (xx - SUN[0]) ** 2 + (yy - SUN[1]) ** 2
SUN_GLOW = np.exp(-r2 / (2 * 170 ** 2))[:, :, None]
SUN_ANG = np.arctan2(yy - SUN[1], xx - SUN[0])
SUN_FALL = np.exp(-np.sqrt(r2) / 560)
WARM = np.array([110, 190, 255], np.float32)   # BGR

# floating golden dust motes
rng = np.random.default_rng(11)
NP = 46
MX, MY = rng.uniform(0, W, NP), rng.uniform(0, H, NP)
MS, MPH, MR = rng.uniform(14, 40, NP), rng.uniform(0, 6.3, NP), rng.uniform(2.5, 7, NP)
def mote(r):
    n = int(r * 6) | 1; c = n // 2; y, x = np.mgrid[:n, :n] - c
    return np.exp(-(x * x + y * y) / (2 * (r * 0.6) ** 2)).astype(np.float32)
SPR = {i: mote(MR[i]) for i in range(NP)}
def motes(fr, t, a):
    for i in range(NP):
        x = MX[i] + 18 * math.sin(t * 0.6 + MPH[i]); y = (MY[i] - MS[i] * t) % H
        s = SPR[i]; n = s.shape[0]; x0, y0 = int(x - n / 2), int(y - n / 2)
        if x0 < 0 or y0 < 0 or x0 + n > W or y0 + n > H: continue
        tw = 0.55 + 0.45 * math.sin(t * 2.2 + MPH[i] * 3)
        fr[y0:y0 + n, x0:x0 + n] += s[:, :, None] * np.array([150, 215, 255], np.float32) * 0.55 * tw * a

vid = os.path.join(HERE, "_video_only.mp4")
wr = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", str(FPS),
                       "-i", "-", "-c:v", "libx264", "-crf", "15", "-preset", "slow", "-pix_fmt", "yuv420p", vid], stdin=subprocess.PIPE)
for i in range(NF):
    t = i / FPS
    fr = BG.copy()
    rays = (0.5 + 0.5 * np.cos(SUN_ANG * 12 + t * 0.35)) ** 6 * SUN_FALL
    fr += (SUN_GLOW * (0.2 * (0.85 + 0.15 * math.sin(t * 1.6)) + 0.07 * math.exp(-((t - 0.45) / 0.35) ** 2))
           + rays[:, :, None] * 0.09) * WARM

    # 0.4 s logo
    put(fr, "logo", ease((t - 0.4) / 0.4), scale=0.94 + 0.06 * eout((t - 0.4) / 0.5))
    # 0.9 s portrait sketch draws in from the top
    p = (t - 0.9) / 0.9
    if p > 0:
        y0, y1 = BOX["portrait"][1], BOX["portrait"][3]; edge = 60
        front = y0 - edge + ease(p) * (y1 - y0 + 2 * edge)
        put(fr, "portrait", min(1, p * 2), mask=np.clip((front - yy) / edge, 0, 1))
    # 1.6 s side rules grow outwards, "Happy" rises in
    put(fr, "lines", 1.0, mask=grow_out("lines", eout((t - 1.6) / 0.45)))
    p = (t - 1.65) / 0.4; put(fr, "happy", ease(p), dy=12 * (1 - eout(p)))
    # 2.15 s "Guru Nanak Jayanti" reveals left to right, coming into focus
    p = (t - 2.15) / 0.85
    if p > 0:
        x0, _, x1, _ = BOX["title"]; edge = 70
        front = x0 - edge + ease(p) * (x1 - x0 + 2 * edge)
        put(fr, "title", 1.0, blur=5 * (1 - eout(p)), mask=np.clip((front - xx) / edge, 0, 1))
    # 3.0 s khanda pops, arrows extend outwards
    p = (t - 3.0) / 0.4
    if p > 0: put(fr, "khanda", ease(p * 1.6), scale=0.7 + 0.3 * back(p))
    put(fr, "arrows", 1.0, mask=grow_out("arrows", eout((t - 3.1) / 0.45)))
    # 3.6 s message lines
    for j, (a0, a1) in enumerate(BODY_LINES):
        p = (t - (3.6 + 0.2 * j)) / 0.4
        if p <= 0: continue
        m = ((yy >= a0 - 2) & (yy < a1 + 2)).astype(np.float32)
        put(fr, "body", ease(p), box=(BOX["body"][0], a0, BOX["body"][2], a1), dy=10 * (1 - eout(p)), mask=m)

    # hold: light sweeps across the key elements
    shine(fr, "title", (t - 4.9) / 0.9, width=80)
    shine(fr, "khanda", (t - 6.1) / 0.6, width=30, strength=0.8)
    shine(fr, "portrait", (t - 6.6) / 0.9, width=60, strength=0.5)
    shine(fr, "logo", (t - 7.7) / 0.8, width=60, strength=0.5)
    shine(fr, "title", (t - 8.6) / 0.9, width=80)
    motes(fr, t, ease((t - 0.6) / 1.0))

    # whole frame: open from black with a warm bloom, slow push-in
    z = 1.0 + 0.035 * ease(t / DUR)
    M = np.float32([[z, 0, W / 2 * (1 - z)], [0, z, H * 0.5 * (1 - z)]])
    fr = cv2.warpAffine(fr, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    fr = fr * ease(t / 0.4) + 255 * 0.04 * math.exp(-((t - 0.4) / 0.3) ** 2)
    wr.stdin.write(np.clip(fr, 0, 255).astype(np.uint8).tobytes())
wr.stdin.close(); wr.wait()

out = os.path.join(HERE, "guru_nanak_jayanti_reel.mp4")
fc = (f"[1:a]aresample=48000,aformat=channel_layouts=stereo,loudnorm=I=-14:TP=-1.5:LRA=9,"
      f"afade=t=in:d=0.4,afade=t=out:st={DUR - 1.4}:d=1.4,atrim=0:{DUR}[a]")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", vid, "-ss", str(MUSIC_START), "-t", str(DUR),
                "-i", os.path.join(HERE, "audio", "indian_music_alex_morgan.mp3"), "-filter_complex", fc,
                "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-ar", "48000",
                "-movflags", "+faststart", "-t", str(DUR), out], check=True)
os.remove(vid)
print("done", out)
