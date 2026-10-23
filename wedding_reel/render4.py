"""Renderer v4 (60 fps, 1080x1920). Story-ordered, velocity-ramped, beat-locked wedding reel.
Usage: python3 render4.py RAW_DIR OUT.mp4 START END                (render frames START..END-1)
       python3 render4.py RAW_DIR - --stills t1,t2,... DIR         (write still frames)"""
import sys, os, math, subprocess
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont
from plan4 import *
import render_reel as rr
from render_reel import (Clip, zoom_img, screen, hblur, mix, flash_overlay, smooth, ease_io, ease_out, clamp, kf,
                         whip, tr_zoomin, tr_spin, tr_flash, tr_iris, tr_diag, tr_lightleak, tr_softzoom, xx, yy)

HERE = os.path.dirname(os.path.abspath(__file__)); FD = os.path.join(HERE, "..", "fonts")
F_CINZEL, F_PINYON = os.path.join(FD, "Cinzel-Var.ttf"), os.path.join(FD, "PinyonScript-Regular.ttf")
IVORY = np.array([255, 250, 240], np.float32); GOLD = np.array([236, 205, 140], np.float32)
_fc = {}
def font(p, s, wght=None):
    k = (p, s, wght)
    if k not in _fc:
        f = ImageFont.truetype(p, s)
        if wght: f.set_variation_by_axes([wght])
        _fc[k] = f
    return _fc[k]


# ------------------------------------------------------------------ source clips and shots
class Clip2(Clip):
    def fr(self, i): return self.frames[int(clamp(i, 0, len(self.frames) - 1))]
    def sample(self, ts, speed):
        """Frame at source time ts; slow-mo is interpolated, fast ramps get a 3-tap shutter blur."""
        x = (ts - self.t0) * self.fps
        if speed > 1.1:
            s = clamp(speed * self.fps / FPS, .8, 1.6)
            return (self.fr(round(x - .55 * s)).astype(np.float32) + self.fr(round(x)).astype(np.float32) + self.fr(round(x + .55 * s)).astype(np.float32)) / 3
        i0 = int(math.floor(x)); fr = x - i0; a = self.fr(i0).astype(np.float32)
        return a if fr < .03 else a * (1 - fr) + self.fr(i0 + 1).astype(np.float32) * fr

class Shot:
    def __init__(self, d, raw, t0, t1):
        self.d, self.t0, self.t1 = d, t0, t1; self.dur = t1 - t0
        self.clip = Clip2(os.path.join(raw, f"c{d['clip']}.mp4"))
        dt = 1 / 600; self.tl = np.arange(-1.0, self.dur + 1.0, dt)
        f = np.clip(self.tl / self.dur, 0, 1); sp = d["speed"]
        self.spd = np.interp(f, [k[0] for k in sp], [k[1] for k in sp])
        cum = np.cumsum(self.spd) * dt; self.src = d["src"] + cum - cum[np.searchsorted(self.tl, 0)]
        self.gain, self.sat = d.get("gain", 1.0), d.get("sat", 1.0); self.wb = np.array(d.get("wb", (1, 1, 1)), np.float32)
        self.loaded = False; self.auto = 1.0
    def ensure(self):
        if self.loaded: return
        self.clip.load(self.src.min() - .3, self.src.max() + .3); self.loaded = True
        fr = self.clip.frames; idx = np.linspace(0, len(fr) - 1, min(6, len(fr))).astype(int); h, w = fr.shape[1:3]
        m = float(fr[idx][:, int(h * .2):int(h * .8), int(w * .2):int(w * .8)].mean())
        self.auto = clamp((118.0 / max(m, 1)) ** .55, .78, 1.45)          # match exposure across clips
    def release(self): self.clip.frames = None; self.loaded = False
    free = release
    def frame(self, t, size=(W, H), zmul=1.0):
        self.ensure(); tl = t - self.t0
        i = int(clamp(round((tl + 1.0) * 600), 0, len(self.tl) - 1)); ts, sp = self.src[i], self.spd[i]
        img = self.clip.sample(ts, sp)
        z = max(kf(self.d["zoom"], clamp(tl / self.dur, 0, 1)) * zmul, 1.0)
        ow, oh = size; a = max(ow / self.clip.w, oh / self.clip.h) * z; fx, fy = self.d["focus"]
        msx, msy = max(0, (self.clip.w - ow / a) / 2), max(0, (self.clip.h - oh / a) / 2)
        cx = self.clip.w / 2 + clamp((fx - .5) * self.clip.w, -msx, msx); cy = self.clip.h / 2 + clamp((fy - .5) * self.clip.h, -msy, msy)
        M = np.float32([[a, 0, ow / 2 - cx * a], [0, a, oh / 2 - cy * a]])
        out = cv2.warpAffine(img, M, (ow, oh), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
        out *= self.gain * self.auto * self.wb
        if self.sat != 1.0: l = out.mean(2, keepdims=True); out = l + (out - l) * self.sat
        return out

BG = np.zeros((H, W, 3), np.float32) + np.array([30, 8, 18], np.float32)
class Tiles:
    """Opening: three strips cascade in on beats 0/1/2, alternating sides, with motion blur."""
    def __init__(self, d, raw, t0, t1): self.t0, self.t1 = t0, t1; self.subs = [Shot(t, raw, t0, t1) for t in d["tiles"]]
    def frame(self, t, zmul=1.0):
        out = BG.copy(); th = H // 3
        for i, sub in enumerate(self.subs):
            ti = tb(i); p = ease_out((t - ti) / .34)
            if t < ti - 1e-6: continue
            tile = sub.frame(t, (W, th), zmul)
            if p < 1: tile = hblur(tile, int(260 * (1 - p)) | 1, 1)
            off = int((1 - p) * W) * (1 if i % 2 == 0 else -1); y0 = i * th
            if off > 0: out[y0:y0 + th, off:] = tile[:, :W - off]
            elif off < 0: out[y0:y0 + th, :W + off] = tile[:, -off:]
            else: out[y0:y0 + th] = tile
            line = int(4 * smooth((p - .7) / .3))
            if line and i > 0: out[y0 - line:y0 + line] = GOLD
        return out
    def free(self): [s.release() for s in self.subs]
class Split:
    """Three vertical panels whose widths pump on every beat."""
    STATES = [[1 / 3, 1 / 3, 1 / 3], [.54, .23, .23], [.23, .54, .23], [.23, .23, .54]]
    def __init__(self, d, raw, t0, t1): self.t0, self.t1 = t0, t1; self.subs = [Shot(p, raw, t0, t1) for p in d["panels"]]
    def widths(self, t):
        k = int(clamp((t - self.t0) / BEAT, 0, 3)); tk = self.t0 + k * BEAT
        p = ease_io((t - tk) / .2); return np.array(self.STATES[max(k - 1, 0)]) * (1 - p) + np.array(self.STATES[k]) * p
    def frame(self, t, zmul=1.0):
        wd = self.widths(t); e = np.round(np.concatenate([[0], np.cumsum(wd)]) * W).astype(int); e[-1] = W; out = np.zeros((H, W, 3), np.float32)
        for i, sub in enumerate(self.subs):
            if e[i + 1] - e[i] < 4: continue
            out[:, e[i]:e[i + 1]] = sub.frame(t, (e[i + 1] - e[i], H), zmul) * (1.0 + .10 * (wd[i] - 1 / 3) * 3)
        for x in e[1:-1]: out[:, x - 3:x + 3] = GOLD
        return out
    def free(self): [s.release() for s in self.subs]
class EndClip:
    """The supplied end cut, played back untouched (100 frames at 30 fps)."""
    def __init__(self, path, t0): self.path, self.t0, self.frames = path, t0, None
    def frame(self, t, zmul=1.0):
        if self.frames is None:
            raw = subprocess.run(["ffmpeg", "-v", "error", "-i", self.path, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True).stdout
            self.frames = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)
        return self.frames[int(clamp(math.floor((t - self.t0) * 30 + 1e-6), 0, len(self.frames) - 1))].astype(np.float32)
    def free(self): pass


# ------------------------------------------------------------------ extra transitions / overlays
def heart_mask(S, hh=H // 2, ww=W // 2, cy=.45):
    X = (np.arange(ww, dtype=np.float32)[None, :] * 2 - W / 2) / max(S, 1e-3); Y = -(np.arange(hh, dtype=np.float32)[:, None] * 2 - H * cy) / max(S, 1e-3)
    return (((X * X + Y * Y - 1) ** 3 - X * X * Y ** 3) <= 0).astype(np.float32)
def tr_heart(A, B, p):
    S = ease_io(p) * 2300 + 1; m1, m2 = heart_mask(S), heart_mask(S * 1.05)
    up = lambda m: cv2.resize(cv2.GaussianBlur(m, (0, 0), 1.6), (W, H))[..., None]
    M1 = up(m1); ring = np.clip(up(m2) - M1, 0, 1)
    return mix(zoom_img(A, 1 + .06 * p), zoom_img(B, 1 + .18 * (1 - p)), M1) * (1 - ring) + GOLD * ring
def streak(img, a):
    """Anamorphic lens streak across the frame: a warm-white core with a cool halo."""
    if a < .02: return img
    cy = H * .45; core = np.exp(-((yy[:, :1] - cy) / 7) ** 2) * np.exp(-((xx[:1, :] - W / 2) / (W * .55)) ** 2)
    halo = np.exp(-((yy[:, :1] - cy) / 55) ** 2) * np.exp(-((xx[:1, :] - W / 2) / (W * .6)) ** 2)
    s = core[..., None] * np.float32([255, 238, 215]) * a + halo[..., None] * np.float32([120, 160, 255]) * .35 * a
    return screen(img, np.clip(s, 0, 255))
def light_leak(img, t, t0, dur, seed=0):
    p = (t - t0) / dur
    if not 0 <= p <= 1: return img
    st = math.sin(math.pi * p); cx = W * (1.3 - 1.7 * p) if seed % 2 == 0 else W * (-.3 + 1.7 * p)
    leak = np.exp(-(((xx - cx) + (yy - H * .3) * .35) / (W * .34)) ** 2)
    return screen(img, np.stack([leak * 255, leak * 140, leak * 60], -1) * .8 * st)


# ------------------------------------------------------------------ beat-driven camera / effects
def beat_amp(k):
    if k == DROP_BEAT: return .09, .20
    if k >= END_BEAT - 4: return 0, .1
    if k > DROP_BEAT: return (.035, .11) if k % 4 == 0 else (.012, .10)
    return (.015, .12) if k % 4 == 0 else (0, .1)
def punch(t):
    z = 1.0; k = int(t / BEAT)
    for kk in (k - 1, k, k + 1):
        dt = t - tb(kk)
        if kk >= 0 and dt >= 0: a, dec = beat_amp(kk); z *= 1 + a * math.exp(-dt / dec)
    return z
def shake(t):
    dx = dy = 0.0; k = int(t / BEAT)
    for kk in (k - 1, k):
        dt = t - tb(kk)
        if kk < DROP_BEAT or kk >= END_BEAT - 4 or dt < 0: continue
        A, dec = (22, .22) if kk == DROP_BEAT else ((5, .12) if kk % 4 == 0 else (0, .1)); e = A * math.exp(-dt / dec)
        dx += e * math.cos(kk * 2.399 + 60 * dt); dy += e * math.sin(kk * 2.399 + 47 * dt)
    return dx, dy
def ca_amount(t):
    dt = t - tb(DROP_BEAT); return 14 * math.exp(-dt / .28) if dt >= 0 else 0.0
def chroma(img, px):
    if px < .7: return img
    out = img.copy()
    out[..., 0] = cv2.warpAffine(img[..., 0], np.float32([[1, 0, px], [0, 1, 0]]), (W, H), borderMode=cv2.BORDER_REFLECT)
    out[..., 2] = cv2.warpAffine(img[..., 2], np.float32([[1, 0, -px], [0, 1, 0]]), (W, H), borderMode=cv2.BORDER_REFLECT); return out
def translate(img, dx, dy):
    return img if abs(dx) + abs(dy) < .5 else cv2.warpAffine(img, np.float32([[1, 0, dx], [0, 1, dy]]), (W, H), borderMode=cv2.BORDER_REFLECT)


# ------------------------------------------------------------------ cinematic grade
_r = np.hypot((xx - W / 2) / (W / 2), (yy - H / 2) / (H / 2))
VIG = (1 - .17 * np.clip(_r - .4, 0, 1) ** 1.5)[..., None].astype(np.float32)
_x = np.linspace(0, 1, 256); _c = _x + .28 * (_x * _x * (3 - 2 * _x) - _x); LUT4 = np.clip((8 + _c * (247 - 8)), 0, 255).astype(np.uint8)
_rng = np.random.default_rng(3); GRAIN = []
for _ in range(8):
    g = cv2.GaussianBlur(_rng.standard_normal((H, W)).astype(np.float32), (0, 0), .7); GRAIN.append(g / g.std())
def sharpen(img, amt=.55, sigma=1.2): return img + (img - cv2.GaussianBlur(img, (0, 0), sigma)) * amt
def grade4(img, n):
    ln = img.mean(2, keepdims=True) / 255; img = img + (1 - ln) ** 2 * np.float32([-3, 0, 4]) + ln ** 2 * np.float32([6, 2, -7])   # split tone
    l = img.mean(2, keepdims=True); img = l + (img - l) * 1.08
    img = cv2.LUT(np.clip(img, 0, 255).astype(np.uint8), LUT4).astype(np.float32)
    small = cv2.resize(img, (W // 4, H // 4), interpolation=cv2.INTER_AREA); hi = np.clip(small - 185, 0, None) * 1.7        # warm halation
    glow = cv2.resize(cv2.GaussianBlur(hi, (0, 0), 10), (W, H)); img = screen(img, np.clip(glow * np.float32([1, .78, .62]), 0, 255) * .6)
    ln = img.mean(2, keepdims=True) / 255; img = img * VIG + GRAIN[n % 8][..., None] * 4.6 * (.55 + .45 * (1 - ln))             # vignette + film grain
    return img


# ------------------------------------------------------------------ title
class Title:
    """Intro title: tracked Cinzel capitals, Pinyon Script line that writes on left to right, brand line, all on a soft scrim."""
    CAPS = "WHERE BEAUTIFUL"
    def __init__(self):
        fc, fb, fs = font(F_CINZEL, 56, 500), font(F_CINZEL, 34, 600), font(F_PINYON, 190)
        d0 = ImageDraw.Draw(Image.new("L", (10, 10))); tr = 16; ws = [d0.textlength(c, font=fc) for c in self.CAPS]
        x = W / 2 - (sum(ws) + tr * (len(self.CAPS) - 1)) / 2; self.letters = []
        for c, w in zip(self.CAPS, ws):
            if c != " ":
                l, t, r, b = fc.getbbox(c); im = Image.new("L", (r - l + 8, b - t + 8), 0); ImageDraw.Draw(im).text((4 - l, 4 - t), c, font=fc, fill=255)
                self.letters.append((np.asarray(im, np.float32) / 255, int(x + l - 4), 1330 + t - 4, len(self.letters)))
            x += w + tr
        l, t, r, b = fs.getbbox("Stories Begin."); im = Image.new("L", (r - l + 60, b - t + 60), 0); ImageDraw.Draw(im).text((30 - l, 30 - t), "Stories Begin.", font=fs, fill=255)
        self.script = np.asarray(im, np.float32) / 255; self.sx = int(W / 2 - self.script.shape[1] / 2); self.sy = 1400 + t - 30
        gm = Image.new("L", (W, H), 0); gd = ImageDraw.Draw(gm); xb = 0; txt = "SHAADI MANGALAM"
        wb = [gd.textlength(c, font=fb) for c in txt]; xb = W / 2 - (sum(wb) + 16 * (len(txt) - 1)) / 2
        for c, w in zip(txt, wb): gd.text((xb, 1700), c, font=fb, fill=255); xb += w + 16
        gd.line([(440, 1660), (640, 1660)], fill=255, width=2); self.brand = np.asarray(gm, np.float32) / 255
        self.scrim = (np.clip((yy[:, :1] - 1050) / 870, 0, 1) ** 1.5).astype(np.float32)
    def apply(self, img, t):
        tA, tS, tB, tE = tb(4.5), tb(5.0), tb(6.0), tb(9)
        if not (tA - .02 <= t < tE): return img
        fade = 1 - smooth((t - (tE - .3)) / .3); ivory = np.zeros((H, W), np.float32); glint = np.zeros((H, W), np.float32)
        for m, x0, y0, i in self.letters:
            a = ease_out((t - tA - i * .04) / .3)
            if a <= 0: continue
            y0 += int((1 - a) * 16); h, w = m.shape; ivory[y0:y0 + h, x0:x0 + w] = np.maximum(ivory[y0:y0 + h, x0:x0 + w], m * a)
        p = smooth((t - tS) / .8)
        if p > 0:
            sm = self.script; h, w = sm.shape; soft = 170; edge = p * (w + soft) - soft; col = np.clip((edge - np.arange(w)) / soft, 0, 1)[None, :]
            y0 = self.sy + int((1 - p) * 22); reg = sm * col; ivory[y0:y0 + h, self.sx:self.sx + w] = np.maximum(ivory[y0:y0 + h, self.sx:self.sx + w], reg)
            gx = (t - (tS + .95)) / .7 * (w + 360) - 180
            if 0 <= (t - (tS + .95)) / .7 <= 1: glint[y0:y0 + h, self.sx:self.sx + w] = np.exp(-((np.arange(w)[None, :] + np.arange(h)[:, None] * .4 - gx) / 70) ** 2) * sm
        ab = ease_out((t - tB) / .5); gold = self.brand * ab
        sc = self.scrim * smooth((t - tA + .25) / .5) * fade * .62; img = img * (1 - sc[..., None])
        both = np.maximum(ivory, gold) * fade; sh = np.roll(cv2.GaussianBlur(both, (0, 0), 10), 6, 0); img = img * (1 - .55 * sh[..., None])
        img = screen(img, IVORY * (cv2.GaussianBlur(ivory * fade, (0, 0), 24)[..., None] * .30))
        ia = (ivory * fade)[..., None]; col = IVORY * (1 - glint[..., None]) + np.float32([255, 205, 120]) * glint[..., None]
        img = img * (1 - ia) + col * ia; ga = (gold * fade)[..., None]; return img * (1 - ga) + GOLD * ga


# ------------------------------------------------------------------ the reel
TRANS_FN = {"zoomin": lambda A, B, p: tr_zoomin(A, B, p), "spin+": lambda A, B, p: tr_spin(A, B, p, 1), "spin-": lambda A, B, p: tr_spin(A, B, p, -1),
            "flash": lambda A, B, p: streak(tr_flash(A, B, p), .55 * math.sin(math.pi * p)), "glowdip": lambda A, B, p: tr_flash(A, B, p, peak=.85, zoom=.05),
            "zoomflash": lambda A, B, p: streak(tr_zoomin(A, B, p, flash=.5), .9 * math.sin(math.pi * p)), "iris": lambda A, B, p: tr_iris(A, B, p),
            "diag": lambda A, B, p: tr_diag(A, B, p), "lightleak": lambda A, B, p: tr_lightleak(A, B, p), "softzoom": lambda A, B, p: tr_softzoom(A, B, p),
            "heart": lambda A, B, p: tr_heart(A, B, p)}
class Reel4:
    def __init__(self, raw):
        self.items = []
        for s in SHOTS:
            k = s["kind"]
            self.items.append(Shot(s, raw, s["t0"], s["t1"]) if k == "single" else Tiles(s, raw, s["t0"], s["t1"]) if k == "tiles3h" else
                              Split(s, raw, s["t0"], s["t1"]) if k == "split3v" else EndClip(os.path.join(HERE, "assets", "end_cut.mp4"), s["t0"]))
        self.title = Title()
    def shot_frame(self, i, t, zmul):
        o = self.items[i]; return o.frame(t, (W, H), zmul) if SHOTS[i]["kind"] == "single" else o.frame(t, zmul)
    def frame(self, n):
        t = n / FPS; zmul = punch(t); idx = max(i for i, s in enumerate(SHOTS) if t >= s["t0"] - 1e-6); img = None; tp = 0; tkind = None
        for j in range(1, len(SHOTS)):
            tr = SHOTS[j]["trans"]; tc = SHOTS[j]["t0"]
            if tr and tc - tr[1] / 2 <= t < tc + tr[1] / 2:
                p = (t - (tc - tr[1] / 2)) / tr[1]; A = self.shot_frame(j - 1, t, zmul); B = self.shot_frame(j, t, zmul); kind = tr[0]; tkind, tp = kind, p
                img = whip(A, B, p, kind[-1]) if kind.startswith("whip") else TRANS_FN[kind](A, B, p); idx = j - 1 if p < .5 else j; break
        if img is None: img = self.shot_frame(idx, t, zmul)
        for j, o in enumerate(self.items):
            if j < idx - 1: o.free()
        if SHOTS[idx]["kind"] != "endclip":
            img = translate(img, *shake(t)); img = chroma(img, ca_amount(t) + (9 * math.sin(math.pi * tp) if tkind and tkind.startswith(("whip", "spin", "zoom")) else 0))
            for i, (b, d) in enumerate(LEAKS): img = light_leak(img, t, tb(b), d, i)
            for k in range(DROP_BEAT, END_BEAT - 4, 4):
                dt = t - tb(k)
                if 0 <= dt < .2: img = flash_overlay(img, (.30 if k == DROP_BEAT else .07) * math.exp(-dt / .06))
            img = grade4(sharpen(img), n); img = self.title.apply(img, t)
        if t < .1: img = img * (t / .1)
        if t > DUR - .25: img = img * (1 - smooth((t - (DUR - .25)) / .25))
        return np.clip(img, 0, 255).astype(np.uint8)

def main():
    raw, out = sys.argv[1], sys.argv[2]; args = sys.argv[3:]; reel = Reel4(raw)
    if "--stills" in args:
        k = args.index("--stills"); ts = [float(x) for x in args[k + 1].split(",")]; d = args[k + 2]; os.makedirs(d, exist_ok=True)
        for t in ts: Image.fromarray(reel.frame(int(round(t * FPS)))).save(os.path.join(d, f"t{t:06.2f}.jpg"), quality=90)
        return
    a, b = int(args[0]), int(args[1])
    ff = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-c:v", "libx264",
                           "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p", "-profile:v", "high", "-g", str(FPS), "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", out], stdin=subprocess.PIPE)
    for n in range(a, b):
        ff.stdin.write(reel.frame(n).tobytes())
        if n % 60 == 0: print("frame", n, flush=True)
    ff.stdin.close(); ff.wait()
if __name__ == "__main__": main()
