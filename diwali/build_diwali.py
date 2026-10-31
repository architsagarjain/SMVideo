"""Composes a Diwali reel: source clip + festive text + animated end card + music and firework SFX.
usage: python3 build_diwali.py <scratch_dir> [diya|lantern]   (needs ffmpeg, numpy, Pillow)
  diya    (default): source.mp4         -> diwali_reel.mp4
  lantern          : source_lantern.mp4 -> diwali_reel_lantern.mp4"""
import numpy as np, subprocess, sys, os, math
from PIL import Image, ImageDraw, ImageFont, ImageFilter
HERE = os.path.dirname(os.path.abspath(__file__))
SCR = sys.argv[1]
VARIANT = sys.argv[2] if len(sys.argv) > 2 else "diya"
# per clip: source, output, and firework SFX (file, start time, gain) placed so each bang lands on a burst in that clip
VARIANTS = {
    "diya": ("source.mp4", "diwali_reel.mp4",
             [("fw_clear_explosions.mp3", 6.70, 0.42), ("fw_bang_in_sky.mp3", 7.19, 0.35),
              ("fw_small_explosion.mp3", 8.10, 0.3), ("fw_rockets_exploding.mp3", 8.65, 0.22)]),
    "lantern": ("source_lantern.mp4", "diwali_reel_lantern.mp4",
                [("fw_clear_explosions.mp3", 7.20, 0.42), ("fw_bang_in_sky.mp3", 7.39, 0.35),
                 ("fw_small_explosion.mp3", 7.80, 0.3), ("fw_rockets_exploding.mp3", 8.64, 0.22)]),
}
SRC, OUT_NAME, SFX = VARIANTS[VARIANT]
W, H, FPS, TOTAL = 1080, 1920, 24, 15.0
T_END = 9.375            # bar 6 downbeat: end card starts dissolving in on the crash
DISS = 0.65
F = lambda n: os.path.join(HERE, "fonts", n)
# (font file, named weight) - Montserrat, SIL OFL (see fonts/): light caps + extra-bold gold caps
LIGHT = (F("Montserrat[wght].ttf"), "Light")
BOLD = (F("Montserrat[wght].ttf"), "ExtraBold")
SMALL = (F("Montserrat[wght].ttf"), "SemiBold")
def load_font(spec, size):
    f = ImageFont.truetype(spec[0], size); f.set_variation_by_name(spec[1]); return f
GOLD_TOP, GOLD_BOT = (242, 188, 60), (214, 150, 22)  # mustard gold, as in the reference

def ease(x): x = np.clip(x, 0, 1); return x * x * (3 - 2 * x)
def eout(x): x = np.clip(x, 0, 1); return 1 - (1 - x) ** 3

# ---------- text layers for the clip ----------
def tracked(draw, xy, s, font, fill, track):
    x, y = xy
    if track == 0: draw.text((x, y), s, font=font, fill=fill); return
    for ch in s:
        draw.text((x, y), ch, font=font, fill=fill); x += draw.textlength(ch, font=font) + track
def twidth(s, font, track):
    d = ImageDraw.Draw(Image.new("L", (1, 1)))
    if track == 0: return d.textlength(s, font=font)
    return sum(d.textlength(c, font=font) + track for c in s) - track
def text_layer(lines, right=False):
    """lines: list of (text, fontpath, size, track, color|'gold', gap_after). Returns RGBA (W x h) centred."""
    items = []; total = 0
    for s, fp, sz, tr, col, gap in lines:
        f = load_font(fp, sz); w = twidth(s, f, tr)
        bb = f.getbbox("Hg|ा"); h = bb[3] + 10
        items.append((s, f, tr, col, w, h, gap)); total += h + gap
    pad = 80
    lay = Image.new("RGBA", (W, total + pad * 2), (0, 0, 0, 0))
    sh = Image.new("RGBA", lay.size, (0, 0, 0, 0))
    y = pad
    for s, f, tr, col, w, h, gap in items:
        x = (W - 46 - w) if right else (W - w) / 2
        m = Image.new("L", lay.size, 0); tracked(ImageDraw.Draw(m), (x, y), s, f, 255, tr)
        shadow = Image.new("RGBA", lay.size, (40, 12, 0, 0)); shadow.putalpha(m.filter(ImageFilter.GaussianBlur(10)).point(lambda v: min(255, int(v * 1.1))))
        sh = Image.alpha_composite(sh, shadow)
        if col == "gold":
            g = np.zeros((lay.size[1], W, 3), np.uint8)
            t = np.clip((np.arange(lay.size[1]) - y) / max(h, 1), 0, 1)[:, None]
            for c in range(3): g[:, :, c] = (GOLD_TOP[c] * (1 - t) + GOLD_BOT[c] * t)
            fill = Image.fromarray(g, "RGB")
        else: fill = Image.new("RGB", lay.size, col)
        fl = fill.convert("RGBA"); fl.putalpha(m); sh = Image.alpha_composite(sh, fl)
        y += h + gap
    return np.asarray(sh).astype(np.float32)
CREAM = (255, 244, 226)
BEATS = [  # (t_in, t_out, y_top, layer) - right-aligned, in the clear sky beside the boom
 (1.0, 4.5, 130, text_layer([("LIFTING", LIGHT, 72, 0, CREAM, -8), ("SPIRITS", LIGHT, 72, 0, CREAM, -8), ("HIGHER", BOLD, 88, 0, "gold", 4), ("FESTIVAL OF LIGHTS", SMALL, 22, 5, CREAM, 0)], True)),
 (5.0, 9.0, 130, text_layer([("MAY YOUR LIFE", LIGHT, 46, 0, CREAM, -6), ("GLOW WITH", LIGHT, 46, 0, CREAM, 2), ("JOY &", BOLD, 54, 0, "gold", -6), ("PROSPERITY", BOLD, 54, 0, "gold", 0)], True)),
]
yy = np.arange(H)[:, None]
SHADE = (1 - 0.5 * np.clip((yy - 1000) / 700, 0, 1) ** 1.3).astype(np.float32)[:, :, None]

def blend_layer(fr, layer, yc, a, rise):
    if a <= 0.003: return
    h = layer.shape[0]; y0 = int(yc + rise * 30)
    ys, ye = max(0, y0), min(H, y0 + h)
    if ye <= ys: return
    L = layer[ys - y0: ye - y0]; al = (L[:, :, 3:4] / 255.0) * a
    fr[ys:ye] = fr[ys:ye] * (1 - al) + L[:, :, :3] * al

# ---------- watermark removal ----------
# The clip carries a static semi-transparent white sparkle at bottom right. Its alpha is estimated from
# the time-averaged crop (the scene moves under it, the mark does not), then divided back out of every
# frame; the anti-aliased rim is filled from its neighbours.
WX0, WY0, WX1, WY1 = 840, 1680, 960, 1800
def _dil(m, n):
    for _ in range(n):
        p = np.pad(m, 1); m = p[:-2, 1:-1] | p[2:, 1:-1] | p[1:-1, :-2] | p[1:-1, 2:] | m
    return m
def _diffuse(img, mask, it):
    out = img.copy()
    for _ in range(it):
        p = np.pad(out, [(1, 1), (1, 1)] + [(0, 0)] * (img.ndim - 2), mode="edge")
        out[mask] = ((p[:-2, 1:-1] + p[2:, 1:-1] + p[1:-1, :-2] + p[1:-1, 2:]) / 4)[mask]
    return out
def watermark_model():
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.join(HERE, SRC), "-vf", f"crop={WX1-WX0}:{WY1-WY0}:{WX0}:{WY0}",
                        "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True, check=True).stdout
    mean = np.frombuffer(r, np.uint8).reshape(-1, WY1 - WY0, WX1 - WX0, 3).astype(np.float32).mean((0, 3))
    box = np.zeros_like(mean, bool); box[15:105, 15:105] = True
    start = mean.copy(); start[box] = mean[~box].mean()
    bg = _diffuse(start, box, 400)
    a = np.clip((mean - bg) / (255 - bg) * 1.05, 0, 0.95); a[a < 0.04] = 0
    core = a > 0.3
    rim = _dil(a > 0.02, 2) & ~(~_dil(~core, 3))
    return a[:, :, None], rim
WM_A, WM_RIM = watermark_model()
def remove_watermark(fr):
    reg = (fr[WY0:WY1, WX0:WX1] - 250 * WM_A) / (1 - WM_A)
    fr[WY0:WY1, WX0:WX1] = np.clip(_diffuse(reg, WM_RIM, 40), 0, 255)

# ---------- end card ----------
card = np.asarray(Image.open(os.path.join(HERE, "end_card.png")).convert("RGB").resize((W, H), Image.LANCZOS)).astype(np.float32)
clean = card.copy()
def inpaint(y0, y1):
    l = card[y0:y1, 10:50].mean(1); r = card[y0:y1, W - 50:W - 10].mean(1)
    t = np.linspace(0, 1, W)[None, :, None]; clean[y0:y1] = l[:, None] * (1 - t) + r[:, None] * t
LOGO = (215, 480); TITLE = (525, 960)
inpaint(*LOGO); inpaint(*TITLE)
tmask = np.clip(np.abs(card - clean).sum(2) / 60, 0, 1)  # where the card text/logo actually is
for (a, b) in (LOGO, TITLE): pass
rng = np.random.default_rng(3)
# sparkles
NP = 70
px = rng.uniform(0, W, NP); py0 = rng.uniform(0, H, NP); sp = rng.uniform(25, 90, NP); ph = rng.uniform(0, 6.28, NP); sz = rng.uniform(5, 15, NP)
def sprite(r):
    n = int(r * 6) | 1; c = n // 2; y, x = np.mgrid[:n, :n] - c
    core = np.exp(-(x * x + y * y) / (2 * (r * .35) ** 2)); cross = np.exp(-(x * x) / (2 * (r * .09) ** 2)) * np.exp(-np.abs(y) / (r * 1.2)) + np.exp(-(y * y) / (2 * (r * .09) ** 2)) * np.exp(-np.abs(x) / (r * 1.2))
    return np.clip(core + 0.8 * cross, 0, 1)
SPR = {int(s): sprite(s) for s in range(5, 16)}
def add_sparkles(fr, u, alpha):
    for i in range(NP):
        y = (py0[i] - sp[i] * u) % H; x = px[i] + 12 * math.sin(u * 1.3 + ph[i])
        tw = 0.5 + 0.5 * math.sin(u * 4.5 + ph[i] * 3); a = alpha * tw * 0.9
        s = SPR[int(sz[i])]; n = s.shape[0]; x0, y0 = int(x - n / 2), int(y - n / 2)
        if x0 < 0 or y0 < 0 or x0 + n > W or y0 + n > H: continue
        fr[y0:y0 + n, x0:x0 + n] += s[:, :, None] * np.array([255, 205, 110], np.float32) * a
FLAMES = [(143, 1699, 1.0), (993, 1582, .55), (909, 1630, .6)]
def glow(fr, z, u, alpha):
    ys, xs = np.mgrid[0:H:4, 0:W:4]
    for k, (fx, fy, s) in enumerate(FLAMES):
        cx, cy = W / 2 + (fx - W / 2) * z, H / 2 + (fy - H / 2) * z
        fl = 0.75 + 0.25 * math.sin(u * 11 + k * 2) * math.sin(u * 7.3 + k) + 0.1 * math.sin(u * 23 + k)
        r = 230 * s * z
        g = np.exp(-((xs - cx) ** 2 + (ys - cy) ** 2) / (2 * (r * .55) ** 2)) * fl * alpha * 0.55
        g = np.asarray(Image.fromarray((g * 255).astype(np.uint8)).resize((W, H), Image.BILINEAR)).astype(np.float32) / 255
        fr += g[:, :, None] * np.array([255, 170, 70], np.float32)
def end_frame(u):
    z = 1.0 + 0.055 * ease(u / 5.6)
    f = clean.copy()
    # logo: drop in
    a = ease((u - 0.25) / 0.7); dy = int((1 - eout((u - 0.25) / 0.7)) * -50)
    y0, y1 = LOGO; src = np.roll(card, dy, axis=0)[y0:y1]; m = tmask[y0:y1]
    f[y0:y1] = clean[y0:y1] + (src - clean[y0:y1]) * a
    # title: soft left->right wipe + rise
    y0, y1 = TITLE; p = (u - 0.9) / 1.3; xs = np.arange(W)[None, :]
    wipe = np.clip((p * (W + 260) - xs + 0) / 260, 0, 1) if p > 0 else np.zeros((1, W))
    wipe = (wipe * wipe * (3 - 2 * wipe))[:, :, None]
    dy = int((1 - eout(p)) * 40) if p < 1 else 0
    src = np.roll(card, dy, axis=0)[y0:y1]
    f[y0:y1] = clean[y0:y1] + (src - clean[y0:y1]) * wipe
    # gold shine sweep across the lettering
    sh = (u - 2.4) / 1.0
    if 0 < sh < 1:
        xs2 = np.arange(W)[None, :] + np.arange(y1 - y0)[:, None] * 0.35
        band = np.exp(-((xs2 - (-200 + sh * (W + 600))) ** 2) / (2 * 55 ** 2))
        f[y0:y1] += (band * tmask[y0:y1])[:, :, None] * np.array([255, 215, 130], np.float32) * 0.85
    # ken burns
    if z > 1.0001:
        cw, ch = W / z, H / z; x0, y0_ = (W - cw) / 2, (H - ch) / 2
        im = Image.fromarray(np.clip(f, 0, 255).astype(np.uint8)).transform((W, H), Image.AFFINE, (cw / W, 0, x0, 0, ch / H, y0_), Image.BICUBIC)
        f = np.asarray(im).astype(np.float32)
    glow(f, z, u, ease(u / 0.8))
    add_sparkles(f, u, ease((u - 0.2) / 0.8))
    return f

# ---------- main loop ----------
src_cmd = ["ffmpeg", "-v", "error", "-i", os.path.join(HERE, SRC), "-f", "rawvideo", "-pix_fmt", "rgb24", "-r", str(FPS), "-"]
rd = subprocess.Popen(src_cmd, stdout=subprocess.PIPE)
tmpv = os.path.join(SCR, f"video_only_{VARIANT}.mp4")
wr = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                       "-c:v", "libx264", "-crf", "15", "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart", tmpv], stdin=subprocess.PIPE)
last = None; nf = int(TOTAL * FPS)
for i in range(nf):
    t = i / FPS
    raw = rd.stdout.read(W * H * 3) if t < T_END + DISS + 0.1 else b""
    if len(raw) == W * H * 3: last = np.frombuffer(raw, np.uint8).reshape(H, W, 3).astype(np.float32)
    if t < T_END + DISS:
        fr = last.copy()
        remove_watermark(fr)
        for ti, to, yc, lay in BEATS:
            a = ease((t - ti) / 0.4) * (1 - ease((t - (to - 0.35)) / 0.35))
            blend_layer(fr, lay, yc, a, 1 - eout((t - ti) / 0.5))
    if t >= T_END:
        e = end_frame(t - T_END)
        if t < T_END + DISS:
            k = ease((t - T_END) / DISS); fr = fr * (1 - k) + e * k
            # warm light bloom through the dissolve
            fr += (math.sin(math.pi * k) * 38) * np.array([1, .8, .55], np.float32)
        else: fr = e
    if t > TOTAL - 0.5: fr *= 1 - ease((t - (TOTAL - 0.5)) / 0.5)
    wr.stdin.write(np.clip(fr, 0, 255).astype(np.uint8).tobytes())
wr.stdin.close(); wr.wait(); rd.stdout.close()

# ---------- audio mix + mux ----------
# Music: "Krishna Flute Music" by Alex Morgan (CC BY 4.0) - soft bansuri over a drone, started 17.08 s in
# so its gentle percussion enters at 9.5 s, as the end card dissolves in. Firework SFX from Mixkit, each
# placed so its bang lands on a burst visible in the clip. The clip's own audio is not used.
A = lambda n: os.path.join(HERE, "audio", n)
out = os.path.join(HERE, OUT_NAME)
cmd = ["ffmpeg", "-v", "error", "-y", "-i", tmpv, "-ss", "17.08", "-t", "15", "-i", A("krishna_flute_music.mp3")]
for n, _, _ in SFX: cmd += ["-i", A(n)]
fc = "[1:a]aresample=48000,aformat=channel_layouts=stereo,loudnorm=I=-15:TP=-2:LRA=9,afade=t=in:d=0.6,afade=t=out:st=13.5:d=1.5[m];"
labs = ""
for i, (n, t, g) in enumerate(SFX):
    fc += f"[{2+i}:a]aresample=48000,aformat=channel_layouts=stereo,volume={g},adelay={int(t*1000)}|{int(t*1000)}[s{i}];"; labs += f"[s{i}]"
fc += f"[m]{labs}amix=inputs={1+len(SFX)}:duration=first:normalize=0,alimiter=limit=0.89,atrim=0:15[a]"
subprocess.run(cmd + ["-filter_complex", fc, "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-t", "15", out], check=True)
print("done", out)
