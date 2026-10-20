"""Renders the Shaadi Mangalam wedding reel frame by frame (transitions, speed ramps, punch zooms,
colour grade, text) and pipes it into x264.
Usage: python3 render_reel.py RAW_DIR OUT.mp4 [start_frame end_frame] [--stills t1,t2,... STILL_DIR]"""
import sys, os, subprocess, math
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from plan import *

HERE = os.path.dirname(os.path.abspath(__file__))
FONT_SERIF = "/usr/share/fonts/truetype/freefont/FreeSerifItalic.ttf"
FONT_SANS = os.path.join(HERE, "..", "fonts", "Montserrat_600SemiBold.ttf")
CHAMPAGNE = (243, 226, 192)
GOLD = (232, 203, 143)
WARM_WHITE = np.array([255, 241, 222], np.float32)

clamp = lambda x, a, b: max(a, min(b, x))
def smooth(x): x = clamp(x, 0, 1); return x * x * (3 - 2 * x)
def ease_io(x): x = clamp(x, 0, 1); return 4 * x ** 3 if x < .5 else 1 - (-2 * x + 2) ** 3 / 2
def ease_out(x): x = clamp(x, 0, 1); return 1 - (1 - x) ** 3
def kf(keys, f):
    xs, ys = zip(*keys); return float(np.interp(f, xs, ys))


# ---------------------------------------------------------------- source clips
class Clip:
    """Decodes a time window of a source clip into memory (RGB, original resolution)."""
    def __init__(self, path):
        self.path = path
        pr = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=r_frame_rate,width,height,duration",
                             "-of", "csv=p=0", path], capture_output=True, text=True).stdout.strip().split(",")
        n, d = pr[2].split("/"); self.fps = float(n) / float(d)
        self.w, self.h, self.dur = int(pr[0]), int(pr[1]), float(pr[3])
        self.t0 = 0; self.frames = None
    def load(self, a, b):
        a = max(0, a); b = min(self.dur, b)
        if self.frames is not None and self.t0 <= a and self.t0 + len(self.frames) / self.fps >= b: return
        out = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{a:.3f}", "-t", f"{b - a:.3f}", "-i", self.path, "-an", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                             capture_output=True).stdout
        self.frames = np.frombuffer(out, np.uint8).reshape(-1, self.h, self.w, 3); self.t0 = a
    def get(self, ts, blend):
        x = (ts - self.t0) * self.fps; n = len(self.frames)
        i0 = int(math.floor(x)); fr = x - i0
        i0c, i1c = clamp(i0, 0, n - 1), clamp(i0 + 1, 0, n - 1)
        if not blend or fr < .02: return self.frames[i0c if fr < .5 or not blend else i0c].astype(np.float32)
        return self.frames[i0c].astype(np.float32) * (1 - fr) + self.frames[i1c].astype(np.float32) * fr


class Segment:
    def __init__(self, idx, d, raw):
        self.idx, self.d = idx, d
        self.start = d["start"]; self.end = SEGMENTS[idx + 1]["start"] if idx + 1 < len(SEGMENTS) else DUR
        self.dur = self.end - self.start
        self.clip = Clip(os.path.join(raw, f"c{d['clip']}.mp4"))
        # source-time table: integrate the speed ramp (with pre/post-roll for transitions)
        dt = 1 / 600; self.tl = np.arange(-1.0, self.dur + 1.0, dt)
        f = np.clip(self.tl / self.dur, 0, 1)
        self.spd = np.interp(f, [k[0] for k in d["speed"]], [k[1] for k in d["speed"]])
        cum = np.cumsum(self.spd) * dt; self.src = d["src"] + cum - cum[np.searchsorted(self.tl, 0)]
        self.loaded = False
        self.gain, self.sat, self.wb = d.get("gain", 1.0), d.get("sat", 1.0), np.array(d.get("wb", (1, 1, 1)), np.float32)
    def ensure(self):
        if not self.loaded:
            self.clip.load(self.src.min() - .3, self.src.max() + .3); self.loaded = True
    def release(self): self.clip.frames = None; self.loaded = False
    def frame(self, t_out):
        self.ensure()
        tl = t_out - self.start
        i = clamp(int(round((tl + 1.0) * 600)), 0, len(self.tl) - 1)
        ts, sp = self.src[i], self.spd[i]
        img = self.clip.get(ts, blend=sp < .93)
        # camera: zoom keyframes + beat punches, glide toward the focus point
        z = kf(self.d["zoom"], clamp(tl / self.dur, 0, 1))
        for pt, amp in PUNCHES:
            if t_out >= pt: z *= 1 + amp * math.exp(-(t_out - pt) / .11)
        z = max(z, 1.0)
        a = W / self.clip.w * z
        ms_x, ms_y = self.clip.w * (1 - 1 / z) / 2, self.clip.h * (1 - 1 / z) / 2
        cx = self.clip.w / 2 + clamp((self.d["focus"][0] - .5) * self.clip.w, -ms_x, ms_x)
        cy = self.clip.h / 2 + clamp((self.d["focus"][1] - .5) * self.clip.h, -ms_y, ms_y)
        M = np.float32([[a, 0, W / 2 - cx * a], [0, a, H / 2 - cy * a]])
        out = cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
        # per-clip colour matching
        out *= self.gain * self.wb
        if self.sat != 1.0:
            l = out.mean(2, keepdims=True); out = l + (out - l) * self.sat
        return out


# ---------------------------------------------------------------- transitions
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
def zoom_img(img, s, cx=W / 2, cy=H / 2):
    M = np.float32([[s, 0, cx - cx * s], [0, s, cy - cy * s]])
    return cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
def zoom_blur(img, s, spread, n=7):
    if spread < 1e-3: return zoom_img(img, s) if s != 1 else img
    acc = np.zeros_like(img)
    for u in np.linspace(-.5, .5, n): acc += zoom_img(img, s * (1 + spread * u))
    return acc / n
def rot_img(img, ang, s):
    M = cv2.getRotationMatrix2D((W / 2, H / 2), ang, s)
    return cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
def rot_blur(img, ang, s, spread, n=7):
    acc = np.zeros_like(img)
    for u in np.linspace(-.5, .5, n): acc += rot_img(img, ang + spread * u, s)
    return acc / n
def screen(a, b): return 255 - (255 - a) * (255 - b) / 255
def hblur(img, k, axis=1):
    k = int(k) | 1
    if k < 3: return img
    return cv2.GaussianBlur(img, (k, 1) if axis == 1 else (1, k), sigmaX=k / 3 if axis == 1 else 0.1, sigmaY=0.1 if axis == 1 else k / 3)
def mix(a, b, m): return a * (1 - m) + b * m
def flash_overlay(img, a): return img * (1 - a) + WARM_WHITE * a


def whip(A, B, p, d):
    e = ease_io(p); de = (3 * (2 * p) ** 2 if p < .5 else 3 * (2 - 2 * p) ** 2) / 2 * 1.0  # velocity of ease_io
    k = min(240, 0.07 * (W if d in "lr" else H) * de)
    if d in "lr":
        o = int(e * W)
        v = np.concatenate([A[:, o:], B[:, :o]], 1) if d == "l" else np.concatenate([B[:, W - o:], A[:, :W - o]], 1)
        v = hblur(v, k, 1)
    else:
        o = int(e * H)
        v = np.concatenate([A[o:], B[:o]], 0) if d == "u" else np.concatenate([B[H - o:], A[:H - o]], 0)
        v = hblur(v, k * .75, 0)
    return v * (1 + .08 * math.sin(math.pi * p))
def tr_zoomin(A, B, p, flash=0.0):
    e = ease_io(p); st = math.sin(math.pi * p)
    a = zoom_blur(A, 1 + .85 * e ** 1.6, .25 * st + .02 * e)
    b = zoom_blur(B, 1 + .75 * (1 - e) ** 1.8, .22 * st + .02 * (1 - e))
    out = mix(a, b, smooth((p - .38) / .24))
    return flash_overlay(out, flash * st ** 2) if flash else out
def tr_spin(A, B, p, sgn=1):
    e = ease_io(p); st = math.sin(math.pi * p); ang = 9 * sgn
    sc = lambda th: math.cos(math.radians(abs(th))) + math.sin(math.radians(abs(th))) * H / W + .03
    ta, tb = ang * e, -ang * (1 - e)
    a = rot_blur(A, ta, sc(ta) + .1 * e, 4.5 * st * sgn)
    b = rot_blur(B, tb, sc(tb) + .1 * (1 - e), 4.5 * st * sgn)
    return mix(a, b, smooth((p - .4) / .2))
def tr_flash(A, B, p, peak=.8, zoom=.10):
    st = 1 - abs(2 * p - 1); base = A if p < .5 else B
    s = 1 + zoom * (p * 2 if p < .5 else (1 - p) * 2) ** 1.5
    img = zoom_blur(base, s, .06 * st)
    return flash_overlay(img, peak * st ** 1.5)
def tr_iris(A, B, p):
    e = ease_io(p); R = math.hypot(W / 2, H / 2) * 1.05; cx, cy = W / 2, H * .46
    dist = np.hypot(xx - cx, yy - cy); r = e * R; fe = 110
    m = np.clip((r - dist) / fe + .5, 0, 1)[..., None]
    a = zoom_img(A, 1 + .10 * e); b = zoom_img(B, 1 + .22 * (1 - e), cx, cy)
    out = mix(a, b, m)
    ring = np.exp(-((dist - r) / 24) ** 2)[..., None] * .45 * math.sin(math.pi * p) ** .5
    return out + ring * WARM_WHITE
def tr_diag(A, B, p):
    e = ease_io(p); d = np.array([.62, -.78], np.float32)
    s = ((xx - W / 2) * d[0] + (yy - H / 2) * d[1]); s = (s - s.min()) / (s.max() - s.min())
    fe = .14; t = e * (1 + 2 * fe) - fe
    m = np.clip((t - s) / fe + .5, 0, 1)[..., None]
    shift = int((1 - e) * 60)
    a = zoom_img(A, 1 + .06 * e); b = zoom_img(B, 1 + .08 * (1 - e))
    out = mix(a, b, m)
    glow = np.exp(-((s - t) / .045) ** 2)[..., None] * .55 * math.sin(math.pi * p) ** .6
    return out + glow * WARM_WHITE * np.float32([1, .93, .85])
def tr_lightleak(A, B, p):
    st = math.sin(math.pi * p)
    a = cv2.GaussianBlur(zoom_img(A, 1 + .05 * p), (0, 0), 6 * st + .01); b = cv2.GaussianBlur(zoom_img(B, 1 + .05 * (1 - p)), (0, 0), 6 * st + .01)
    out = mix(a, b, smooth((p - .15) / .7))
    cx = W * (1.25 - 1.5 * p)
    leak = np.exp(-(((xx - cx) + (yy - H * .3) * .35) / (W * .32)) ** 2)
    col = np.stack([leak * 255, leak * 150, leak * 70], -1)
    out = screen(out, col * .85 * st ** 1.1)
    return flash_overlay(out, .22 * st ** 2)
def tr_softzoom(A, B, p):
    e = ease_io(p)
    a = zoom_img(A, 1 + .16 * e); b = zoom_img(B, 1 + .12 * (1 - e))
    return mix(a, b, smooth((p - .1) / .8))
def transition(kind, A, B, p):
    if kind.startswith("whip"): return whip(A, B, p, kind[-1])
    if kind == "zoomin": return tr_zoomin(A, B, p)
    if kind == "zoomflash": return tr_zoomin(A, B, p, flash=.7)
    if kind.startswith("spin"): return tr_spin(A, B, p, 1 if kind.endswith("+") else -1)
    if kind == "flash": return tr_flash(A, B, p)
    if kind == "glowdip": return tr_flash(A, B, p, peak=.55, zoom=.05)
    if kind == "iris": return tr_iris(A, B, p)
    if kind == "diag": return tr_diag(A, B, p)
    if kind == "lightleak": return tr_lightleak(A, B, p)
    if kind == "softzoom": return tr_softzoom(A, B, p)
    raise ValueError(kind)


# ---------------------------------------------------------------- grade
_r = np.hypot((xx - W / 2) / (W / 2), (yy - H / 2) / (H / 2))
VIGNETTE = (1 - .20 * np.clip(_r - .35, 0, 1) ** 1.6)[..., None].astype(np.float32)
_lut_x = np.linspace(0, 1, 256)
_curve = _lut_x + .20 * (_lut_x * _lut_x * (3 - 2 * _lut_x) - _lut_x)       # soft S-curve
_curve = 6 / 255 + _curve * (247 - 6) / 255                                   # lifted blacks, gentle highlight roll-off
LUT = np.clip(_curve * 255, 0, 255).astype(np.uint8)
def grade(img):
    img = img * np.float32([1.035, 1.0, .955])                                # warm, romantic balance
    l = img.mean(2, keepdims=True); img = l + (img - l) * 1.05                # slight richness, no heavy saturation
    img = np.clip(img, 0, 255).astype(np.uint8)
    img = cv2.LUT(img, LUT).astype(np.float32)
    # soft highlight glow
    small = cv2.resize(img, (W // 4, H // 4), interpolation=cv2.INTER_AREA)
    hi = np.clip(small - 175, 0, None) * 1.6
    glow = cv2.resize(cv2.GaussianBlur(hi, (0, 0), 9), (W, H), interpolation=cv2.INTER_LINEAR)
    img = screen(img, np.clip(glow, 0, 255) * .55)
    return img * VIGNETTE


# ---------------------------------------------------------------- text
def tracked(draw, text, font, cx, y, tracking, fill):
    widths = [draw.textlength(c, font=font) for c in text]
    total = sum(widths) + tracking * (len(text) - 1); x = cx - total / 2
    for c, w in zip(text, widths):
        draw.text((x, y), c, font=font, fill=fill); x += w + tracking
    return total
FONTS = {}
def font(path, size):
    k = (path, size)
    if k not in FONTS: FONTS[k] = ImageFont.truetype(path, size)
    return FONTS[k]

def text_layer(t):
    """Returns (rgba float array HxWx4 or None, scrim strength 0..1)."""
    items = []  # (text, fontpath, size, y, tracking_from, tracking_to, color, t_in, dur_in, t_out, dur_out, rise)
    items.append(("Where Beautiful", FONT_SERIF, 112, 1290, 26, 2, CHAMPAGNE, .35, 1.1, 2.75, .35, 34))
    items.append(("Stories Begin.", FONT_SERIF, 112, 1420, 26, 2, CHAMPAGNE, .60, 1.1, 2.75, .35, 34))
    items.append(("SHAADI MANGALAM", FONT_SANS, 40, 1575, 34, 15, GOLD, 1.20, 1.0, 2.75, .35, 14))
    items.append(("SHAADI MANGALAM", FONT_SANS, 58, 1180, 34, 18, GOLD, 24.75, 1.4, 99, 1, 18))
    vis = [it for it in items if it[7] <= t < it[9] + it[10] + .01]
    line = 24.75 + .35 < t
    if not vis and not line: return None, 0
    lay = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    scrim = 0
    for (txt, fp, size, y, tr0, tr1, col, ti, di, to, do, rise) in vis:
        a_in = ease_out((t - ti) / di); a_out = 1 - clamp((t - to) / do, 0, 1); a = a_in * a_out
        if a <= 0: continue
        tracking = tr0 + (tr1 - tr0) * ease_out((t - ti) / (di * 1.3))
        yo = y + rise * (1 - a_in)
        sh = Image.new("RGBA", (W, H), (0, 0, 0, 0)); sd = ImageDraw.Draw(sh)
        tracked(sd, txt, font(fp, size), W / 2 + 2, yo + 4, tracking, (20, 8, 4, int(150 * a)))
        lay.alpha_composite(sh.filter(ImageFilter.GaussianBlur(7)))
        tmp = Image.new("RGBA", (W, H), (0, 0, 0, 0)); td = ImageDraw.Draw(tmp)
        tracked(td, txt, font(fp, size), W / 2, yo, tracking, col + (int(255 * a),))
        lay.alpha_composite(tmp)
        scrim = max(scrim, a if size > 100 else a * .8)
    if line:  # end card: hairline grows from the centre under the wordmark
        a = ease_out((t - 25.05) / 1.2); ln = int(300 * a)
        if ln > 0: d.line([(W / 2 - ln / 2, 1262), (W / 2 + ln / 2, 1262)], fill=GOLD + (int(210 * a),), width=2)
        scrim = max(scrim, a * .9)
    arr = np.asarray(lay, np.float32)
    return arr, scrim

_scrim_shape = np.clip((yy - 1000) / 900, 0, 1) ** 1.4
def apply_text(img, t):
    lay, scrim = text_layer(t)
    if lay is None: return img
    img = img * (1 - .38 * scrim * _scrim_shape[..., None])        # soft bottom scrim so text stays readable
    a = lay[..., 3:4] / 255
    return img * (1 - a) + lay[..., :3] * a


# ---------------------------------------------------------------- compose
class Reel:
    def __init__(self, raw):
        self.segs = [Segment(i, d, raw) for i, d in enumerate(SEGMENTS)]
        self.cuts = {i: TRANSITIONS[i] for i in range(len(TRANSITIONS))}
    def seg_at(self, t):
        for i in range(len(self.segs) - 1, -1, -1):
            if t >= self.segs[i].start - 1e-6: return i
    def frame(self, n):
        t = n / FPS + .5 / FPS * 0  # frame timestamp
        i = self.seg_at(t); img = None
        for ti, (tc, kind, L) in self.cuts.items():
            if tc - L / 2 <= t < tc + L / 2:
                p = (t - (tc - L / 2)) / L
                A, B = self.segs[ti].frame(t), self.segs[ti + 1].frame(t)
                img = transition(kind, A, B, p); i = ti if p < .5 else ti + 1
                break
        if img is None: img = self.segs[i].frame(t)
        for j, s in enumerate(self.segs):          # free memory of segments we've left behind
            if j < i - 1 and s.loaded: s.release()
        if t < .4:                                  # opening: warm flash + zoom-blur reveal
            st = 1 - t / .4
            img = zoom_blur(img, 1, .22 * st ** 2)
            img = flash_overlay(img, .75 * st ** 3)
        img = grade(img)
        img = apply_text(img, t)
        if t > FADE_OUT_START: img = img * (1 - smooth((t - FADE_OUT_START) / (DUR - FADE_OUT_START)))
        return np.clip(img, 0, 255).astype(np.uint8)


def main():
    raw, out = sys.argv[1], sys.argv[2]
    args = sys.argv[3:]
    reel = Reel(raw)
    if "--stills" in args:
        k = args.index("--stills"); times = [float(x) for x in args[k + 1].split(",")]; d = args[k + 2]; os.makedirs(d, exist_ok=True)
        for t in times:
            Image.fromarray(reel.frame(int(round(t * FPS)))).save(os.path.join(d, f"t{t:06.2f}.jpg"), quality=88)
        return
    a, b = (int(args[0]), int(args[1])) if len(args) >= 2 else (0, int(DUR * FPS))
    ff = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                           "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-pix_fmt", "yuv420p", "-profile:v", "high", "-g", "30",
                           "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", out], stdin=subprocess.PIPE)
    for n in range(a, b):
        ff.stdin.write(reel.frame(n).tobytes())
        if n % 30 == 0: print("frame", n, flush=True)
    ff.stdin.close(); ff.wait()

if __name__ == "__main__": main()
