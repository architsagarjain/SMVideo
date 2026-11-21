"""Lyric reel v3 (clean type, no badge): Shaadi Mangalam match intro (two profile cards meet -> 'It's a match'), persistent brand badge, lyric captions
in maroon handwriting on cream paper-tape strips (readable on any shot), beat transitions + punch zooms, CTA tape, end screen.
Usage: python3 make_lyric_reel2.py CLIP_DIR REF_AUDIO.wav END_SCREEN.mp4 OUT.mp4"""
import sys, os, subprocess, math, wave
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, "..", "wedding_reel"))
import render_reel as rr                                   # transition library (whip, zoom-through, flash, spin, light leak)
CLIPS, AUD, END, OUT = sys.argv[1:5]
W, H, FPS = 1080, 1920, 30; FD = os.path.join(HERE, "..", "fonts")
HAND, SANS, SANSR = os.path.join(FD, "IndieFlower-Regular.ttf"), os.path.join(FD, "Poppins-SemiBold.ttf"), os.path.join(FD, "Poppins-Regular.ttf")
MAROON = np.array([112, 18, 44], np.float32); CREAM = np.array([252, 244, 230], np.float32)
PAD = .4
SHOTS = [(0.000, 2.533, "n4", 18.70, .9), (2.533, 5.233, "n1", 17.90, 1.0), (5.233, 6.600, "n2", 27.36, 1.0),
         (6.600, 7.967, "n2", 36.84, 1.0), (7.967, 10.367, "n5", 5.30, 1.0), (10.367, 11.733, "n5", 21.30, 1.0),
         (11.733, 13.533, "n5", 29.40, 1.0), (13.533, 16.100, "n6", 0.40, .9)]
TRANS = {1: ("whip_l", .30), 2: ("zoomin", .32), 3: ("flash", .22), 4: ("whip_r", .30), 5: ("spin+", .32), 6: ("lightleak", .55), 7: ("zoomin", .36)}
LYRICS = [("Tum aadat bano humari", .15, 2.533), ("Hum bigad jayenge", 2.75, 5.233), ("Tum aankhon se batana", 5.40, 7.967),
          ("Hum samajh jayenge", 8.10, 10.367), ("Tum halki si", 10.50, 11.733), ("sharmana", 11.85, 13.533), ("Hum tere ho jayenge", 13.70, 16.2)]
FOOT = 16.1; XF = .45; TOTAL = FOOT - XF + 7.5
def clamp(x, a=0.0, b=1.0): return min(max(x, a), b)
def smooth(x): x = clamp(x); return x * x * (3 - 2 * x)
def ease_out(x): x = clamp(x); return 1 - (1 - x) ** 3
def back_out(x, c=1.7): x = clamp(x); return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2

# ---------- graphics ----------
def rgba_layer(w, h, draw): im = Image.new("RGBA", (w, h), (0, 0, 0, 0)); draw(ImageDraw.Draw(im), im); return np.asarray(im, np.float32) / 255
def over(img, L, cx, cy, a=1.0, s=1.0, ang=0.0):
    """Composite an RGBA float layer centred at (cx, cy) with scale and rotation."""
    if a <= 0 or s <= .01: return img
    h, w = L.shape[:2]; M = cv2.getRotationMatrix2D((w / 2, h / 2), ang, s); M[0, 2] += cx - w / 2; M[1, 2] += cy - h / 2
    Lw = cv2.warpAffine(L, M, (W, H), flags=cv2.INTER_LINEAR); al = Lw[..., 3:4] * a
    return img * (1 - al) + Lw[..., :3] * 255 * al
def shadow_of(L, blur=14, strength=.45, dy=10):
    a = cv2.GaussianBlur(L[..., 3], (0, 0), blur) * strength; a = np.roll(a, dy, 0); z = np.zeros_like(L); z[..., 3] = a; return z
def tape(text, size=52, seed=0):
    """Cream paper-tape strip with torn ends and maroon handwriting."""
    f = ImageFont.truetype(HAND, size); tr = 7; d0 = ImageDraw.Draw(Image.new("L", (4, 4)))
    tw = sum(d0.textlength(c, font=f) for c in text) + tr * (len(text) - 1); w, h = int(tw + 90), int(size * 1.55); r = np.random.default_rng(seed)
    def draw(d, im):
        top = [(x, 6 + r.uniform(-3, 3)) for x in np.linspace(18, w - 18, 30)]; bot = [(x, h - 6 + r.uniform(-3, 3)) for x in np.linspace(w - 18, 18, 30)]
        lft = [(8 + r.uniform(-6, 6), y) for y in np.linspace(h - 6, 6, 9)]; rgt = [(w - 8 + r.uniform(-6, 6), y) for y in np.linspace(6, h - 6, 9)]
        d.polygon(top + rgt + bot + lft, fill=(252, 244, 230, 238)); x = 45; rr_ = np.random.default_rng(seed + 7)
        for c in text:
            g = Image.new("RGBA", (size * 2, size * 2), (0, 0, 0, 0)); ImageDraw.Draw(g).text((size // 2, size // 3), c, font=f, fill=(112, 18, 44, 255))
            g = g.rotate(float(rr_.uniform(-6, 6)), resample=Image.BICUBIC); im.alpha_composite(g, (int(x - size // 2), int(h / 2 - size * .62 + rr_.uniform(-2, 2))))
            x += d.textlength(c, font=f) + tr
    return rgba_layer(w, h, draw)
SERIF = os.path.join(FD, "DMSerifDisplay-Italic.ttf")
def lyric_words(text, size=74):
    """Each word as its own white RGBA layer (serif italic) with its x offset, for a word-by-word reveal."""
    f = ImageFont.truetype(SERIF, size); d0 = ImageDraw.Draw(Image.new("L", (4, 4))); sp = d0.textlength(" ", font=f); out = []; x = 0
    for wd in text.split(" "):
        wdt = d0.textlength(wd, font=f); asc, desc = f.getmetrics()
        L = rgba_layer(int(wdt) + 40, asc + desc + 30, lambda d, im, wd=wd: d.text((20, 15), wd, font=f, fill=(255, 252, 246, 255)))
        out.append((L, x + wdt / 2)); x += wdt + sp
    return out, x - sp
def pill(text, size=40, fill=(112, 18, 44, 240), color=(255, 250, 242, 255)):
    f = ImageFont.truetype(SANS, size); d0 = ImageDraw.Draw(Image.new("L", (4, 4))); tw = d0.textlength(text, font=f); w, h = int(tw + 84), int(size * 2.0)
    def draw(d, im):
        d.rounded_rectangle([0, 0, w - 1, h - 1], h // 2, fill=fill); bb = f.getbbox("Hg"); d.text((42, h / 2 - (bb[1] + bb[3]) / 2), text, font=f, fill=color)
    return rgba_layer(w, h, draw)
def badge():
    lg = np.asarray(Image.open(os.path.join(HERE, "assets", "sm_logo_crop.png")).convert("RGB"), np.float32)
    a = np.clip((235 - lg.mean(2)) / 110, 0, 1); lgA = np.dstack([np.zeros_like(lg) + MAROON / 255, a]); lgA = cv2.resize(lgA, (150, 120), interpolation=cv2.INTER_AREA)
    w, h = 250, 160
    def draw(d, im): d.rounded_rectangle([0, 0, w - 1, h - 1], 30, fill=(252, 244, 230, 225))
    B = rgba_layer(w, h, draw); y0, x0 = 20, 50; al = lgA[..., 3:4]; B[y0:y0 + 120, x0:x0 + 150, :3] = B[y0:y0 + 120, x0:x0 + 150, :3] * (1 - al) + lgA[..., :3] * al
    return B
def profile_card(face, name, sub):
    w, h = 430, 168
    def draw(d, im):
        d.rounded_rectangle([0, 0, w - 1, h - 1], 34, fill=(255, 255, 255, 248))
        d.text((170, 34), name, font=ImageFont.truetype(SANS, 38), fill=(112, 18, 44, 255)); d.text((170, 92), sub, font=ImageFont.truetype(SANSR, 26), fill=(110, 90, 85, 255))
        d.ellipse([28, 24, 148, 144], outline=(112, 18, 44, 255), width=5)
    C = rgba_layer(w, h, draw); fc = cv2.resize(face, (112, 112)).astype(np.float32) / 255
    m = np.zeros((112, 112), np.float32); cv2.circle(m, (56, 56), 55, 1, -1, cv2.LINE_AA); m = m[..., None]
    C[28:140, 32:144, :3] = C[28:140, 32:144, :3] * (1 - m) + fc * m; return C
def heart_layer(size=150):
    def draw(d, im):
        t = np.linspace(0, 2 * np.pi, 200); s = size / 36
        pts = [(size / 2 + s * 16 * math.sin(a) ** 3, size * .45 - s * (13 * math.cos(a) - 5 * math.cos(2 * a) - 2 * math.cos(3 * a) - math.cos(4 * a))) for a in t]
        d.polygon(pts, fill=(200, 30, 70, 255))
    return rgba_layer(size, size, draw)

# ---------- footage ----------
def load(clip, t0, dur, speed):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{max(t0 - PAD * speed, 0):.3f}", "-t", f"{(dur + 2 * PAD) * speed + .2:.3f}", "-i", os.path.join(CLIPS, clip + ".mp4"),
                          "-vf", f"setpts=PTS/{speed},fps={FPS},scale={W}:{H}:flags=lanczos", "-an", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3), min(PAD, t0 / speed)
FR = [load(c, s, e - a, sp) for (a, e, c, s, sp) in SHOTS]
def shot_frame(i, t):
    a, e = SHOTS[i][:2]; fr, pre = FR[i]; k = int(round((t - a + pre) * FPS)); img = fr[int(clamp(k, 0, len(fr) - 1))].astype(np.float32)
    z = 1 + .035 * (t - a) / (e - a) + .06 * math.exp(-max(0, t - a) / .12)            # slow push-in + punch on the cut
    return cv2.warpAffine(img, np.float32([[z, 0, 540 - 540 * z], [0, z, 960 - 960 * z]]), (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
def trans_fn(kind, A, B, p):
    if kind.startswith("whip"): return rr.whip(A, B, p, kind[-1])
    return {"zoomin": rr.tr_zoomin, "flash": rr.tr_flash, "lightleak": rr.tr_lightleak, "spin+": lambda a, b, q: rr.tr_spin(a, b, q, 1)}[kind](A, B, p)
f0 = FR[0][0][int(FR[0][1] * FPS)]
CARD_L = profile_card(cv2.cvtColor(cv2.cvtColor(f0[560:760, 140:340], cv2.COLOR_RGB2BGR), cv2.COLOR_BGR2RGB), "Ananya, 26", "Delhi · Architect")
CARD_R = profile_card(f0[470:690, 710:930], "Kabir, 28", "Jaipur · Doctor")
HEART = heart_layer(); MATCH = pill("It's a match on Shaadi Mangalam", 38)
WORDS = [(lyric_words(t), a, b) for t, a, b in LYRICS]
CTA = pill("Find your match on shaadimangalam.com", 34)
_y = np.arange(H, dtype=np.float32); SCRIM = (np.clip((_y - 1180) / 740, 0, 1) ** 1.3)[:, None, None]
endf = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", END, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True).stdout, np.uint8).reshape(-1, H, W, 3)

def overlays(img, t):
    img = img * (1 - .58 * SCRIM)                                               # soft dark gradient: lower third always reads
    if t < 2.6:                                                                 # match intro
        pin = ease_out((t - .2) / .55); out = smooth((t - 2.05) / .35)
        for C, side in ((CARD_L, -1), (CARD_R, 1)):
            cx = 540 + side * (1100 * (1 - pin) + 235 - 30 * smooth((t - .8) / .3)); cy = 1080 + side * 90
            img = over(img, shadow_of(C), cx, cy, 1 - out, 1 - .4 * out); img = over(img, C, cx, cy, 1 - out, 1 - .4 * out)
        hp = (t - .95) / .35
        if hp > 0: img = over(img, HEART, 540, 1080, 1 - out, back_out(hp) * (1 + .08 * math.sin(max(0, t - 1.3) * 12)) * (1 - .5 * out))
        mp = (t - 1.25) / .35
        if mp > 0: img = over(img, shadow_of(MATCH, 10, .35, 6), 540, 1300, smooth(mp) * (1 - out), .9 + .1 * back_out(mp)); img = over(img, MATCH, 540, 1300, smooth(mp) * (1 - out), .9 + .1 * back_out(mp))
    for (ws, tw), a, b in WORDS:                                                # lyrics: words fade up one by one, lower third
        if not (a <= t < b + .01): continue
        fade = 1 - smooth((t - (b - .15)) / .15); y = 1560
        for j, (L, xc) in enumerate(ws):
            p = (t - a - j * .09) / .4
            if p <= 0: continue
            cx = 540 - tw / 2 + xc; cy = y + (1 - ease_out(p)) * 22
            img = over(img, shadow_of(L, 8, .55, 4), cx, cy, smooth(p) * fade); img = over(img, L, cx, cy, smooth(p) * fade)
    if t >= 14.3:                                                               # CTA pill under the last lyric
        p = (t - 14.3) / .4; img = over(img, shadow_of(CTA, 10, .4, 6), 540, 1710, smooth(p), .9 + .1 * back_out(p)); img = over(img, CTA, 540, 1710, smooth(p), .9 + .1 * back_out(p))
    return img
def footage(t):
    for j, (kind, L) in TRANS.items():
        c = SHOTS[j][0]
        if c - L / 2 <= t < c + L / 2: return trans_fn(kind, shot_frame(j - 1, t), shot_frame(j, t), (t - (c - L / 2)) / L)
    i = max(j for j, s in enumerate(SHOTS) if t >= s[0] - 1e-6); return shot_frame(i, t)

# ---------- audio: reference song, extended on the beat by repeating its last 8-beat line ----------
w = wave.open(AUD); sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), '<i2').reshape(-1, 2).astype(np.float32)
Lb, S = 5.39, 15.50; xf = int(.04 * sr); seg = lambda a, b: x[int(a * sr):int(b * sr)].copy(); out = seg(0, S)
for p in (seg(S - Lb, S), seg(S - Lb, S)):
    fo = np.linspace(1, 0, xf)[:, None]; p[:xf] = out[-xf:] * fo + p[:xf] * (1 - fo); out = np.vstack([out[:-xf], p])
n = int(TOTAL * sr); out = out[:n]; fl = int(1.8 * sr); out[-fl:] *= np.linspace(1, 0, fl)[:, None] ** 1.5
tmpa = OUT + ".wav"; ww = wave.open(tmpa, "wb"); ww.setnchannels(2); ww.setsampwidth(2); ww.setframerate(sr); ww.writeframes(np.clip(out, -32768, 32767).astype('<i2').tobytes()); ww.close()

enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-i", tmpa,
                        "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p", "-profile:v", "high",
                        "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", OUT], stdin=subprocess.PIPE)
for k in range(int(round(TOTAL * FPS))):
    t = k / FPS
    if t < FOOT - XF: img = overlays(rr.grade(footage(t)), t)
    else:
        e = endf[min(int(round((t - (FOOT - XF)) * FPS)), len(endf) - 1)].astype(np.float32); p = (t - (FOOT - XF)) / XF
        img = e if p >= 1 else overlays(rr.grade(footage(FOOT - XF - 1 / FPS)), FOOT - XF - 1 / FPS) * (1 - p) + e * p
    enc.stdin.write(np.clip(img, 0, 255).astype(np.uint8).tobytes())
enc.stdin.close(); enc.wait(); os.remove(tmpa); print("wrote", OUT, round(TOTAL, 2))
