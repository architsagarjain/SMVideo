"""Renders the animated Diwali poster. Usage: python3 render.py [out.mp4 | --stills t1 t2 ...]"""
import sys, subprocess, numpy as np, cv2
import assets as A
from assets import W, H, GRADED, SKY, TEXT_MASK
import fx
import schedule as S

FPS, DUR = S.FPS, S.DURATION
NF = int(round(FPS * DUR))

def clamp01(x): return min(1.0, max(0.0, x))
def ease_out(u): u = clamp01(u); return 1 - (1 - u) ** 3
def ease_io(u): u = clamp01(u); return u * u * (3 - 2 * u)
def ease_back(u, k=1.9):
    u = clamp01(u) - 1
    return 1 + (k + 1) * u ** 3 + k * u ** 2

# static helpers ---------------------------------------------------------------------------
_lum = 0.299 * GRADED[..., 0] + 0.587 * GRADED[..., 1] + 0.114 * GRADED[..., 2]
SKY_DARK = (SKY * np.clip((0.33 - cv2.GaussianBlur(_lum, (0, 0), 3)) / 0.2, 0, 1)).astype(np.float32)
FW_GATE = (np.clip(SKY, 0, 1) ** 0.7)[..., None].astype(np.float32)
_yy, _xx = np.mgrid[0:H, 0:W].astype(np.float32)
VIGNETTE = (1 - 0.38 * (((_xx - W / 2) / (W * 0.72)) ** 2 + ((_yy - H * 0.48) / (H * 0.74)) ** 2) ** 1.3)[..., None].astype(np.float32)
BOWL = (832, 960)
BOWL_GLOW = np.exp(-(((_xx - BOWL[0]) / 300) ** 2 + ((_yy - BOWL[1]) / 230) ** 2))[..., None].astype(np.float32)
DIW_C = (A.diwali.cx, A.diwali.cy)

def beat_pulse(t):
    if t < S.GROOVE_IN: return 0.25 + 0.15 * np.sin(t * 3)
    ph = ((t - S.GROOVE_IN) / S.BEAT) % 1.0
    return float(np.exp(-4.5 * ph))

# text compositing ---------------------------------------------------------------------------
def draw_layer(cv, L, op=1.0, dx=0.0, dy=0.0, scale=1.0, wipe=None, shine=None, glow=0.0, glow_col=(1, .9, .6),
               shadow=0.5, tint=None):
    """Composite a text layer. wipe=(kind, edge, soft); shine=(pos 0..1, width, strength)."""
    if op <= 0.003: return
    p, a = L.p, L.a
    h, w = a.shape
    if wipe is not None:
        kind, edge, soft = wipe
        xs = np.arange(w, dtype=np.float32)
        if kind == 'ltr':
            m = np.clip((edge - xs) / soft, 0, 1)
        else:                                        # centre-out
            m = np.clip((edge - np.abs(xs - w / 2)) / soft, 0, 1)
        m = m * m * (3 - 2 * m)
        p = p * m[None, :, None]; a = a * m[None, :]
    pad = int(max(w, h) * max(0, scale - 1) / 2) + 26
    nw, nh = w + 2 * pad, h + 2 * pad
    ox, oy = L.cx + dx - nw / 2, L.cy + dy - nh / 2
    ix, iy = int(np.floor(ox)), int(np.floor(oy))
    fx_, fy_ = ox - ix, oy - iy
    M = np.array([[scale, 0, nw / 2 - scale * w / 2 + fx_ - (0)], [0, scale, nh / 2 - scale * h / 2 + fy_]], np.float32)
    src = np.dstack([p, a])
    wp = cv2.warpAffine(src, M, (nw, nh), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT)
    P, Aa = wp[..., :3], wp[..., 3]
    if tint is not None:
        P = Aa[..., None] * np.array(tint, np.float32)
    x0, y0 = max(ix, 0), max(iy, 0); x1, y1 = min(ix + nw, W), min(iy + nh, H)
    if x1 <= x0 or y1 <= y0: return
    sl = (slice(y0 - iy, y1 - iy), slice(x0 - ix, x1 - ix))
    P, Aa = P[sl], Aa[sl]
    reg = cv2.getRectSubPix if False else None
    dst = cv[y0:y1, x0:x1]
    if shadow > 0:
        sh = cv2.GaussianBlur(Aa, (0, 0), 5) * shadow * op
        sh = np.roll(sh, 4, axis=0)
        dst *= (1 - sh)[..., None]
    if glow > 0:
        g = cv2.GaussianBlur(Aa, (0, 0), 12) * glow * op
        dst += g[..., None] * np.array(glow_col, np.float32)
    dst *= (1 - Aa * op)[..., None]
    dst += P * op
    if shine is not None:
        pos, wd, st = shine
        yy, xx = np.mgrid[0:Aa.shape[0], 0:Aa.shape[1]].astype(np.float32)
        u = (xx + 0.55 * yy + x0 - ix) / (nw + 0.55 * nh)
        band = np.exp(-((u - pos) / wd) ** 2)
        dst += (band * Aa * st * op)[..., None] * np.array([1.0, 0.93, 0.75], np.float32)

def add_blob(cv, x, y, r, col, amt):
    """Soft additive radial blob (cheap: drawn in a local window)."""
    r = int(r)
    x0, x1 = max(int(x) - 2 * r, 0), min(int(x) + 2 * r, W); y0, y1 = max(int(y) - 2 * r, 0), min(int(y) + 2 * r, H)
    if x1 <= x0 or y1 <= y0: return
    yy, xx = np.mgrid[y0:y1, x0:x1].astype(np.float32)
    g = np.exp(-(((xx - x) ** 2 + (yy - y) ** 2) / (r * r)))
    cv[y0:y1, x0:x1] += g[..., None] * (np.array(col, np.float32) * amt)

def add_ring(cv, x, y, r, thick, col, amt):
    layer = np.zeros((H, W), np.float32)
    cv2.circle(layer, (int(x), int(y)), int(r), 1.0, int(max(1, thick)), lineType=cv2.LINE_AA)
    layer = cv2.GaussianBlur(layer, (0, 0), 2.2)
    cv += layer[..., None] * (np.array(col, np.float32) * amt)

def render(t):
    cv = GRADED.copy()
    bp = beat_pulse(t)

    # --- sky: stars, fireworks ---------------------------------------------------------------
    if t > 0.25:
        cv += fx.stars(t, SKY_DARK)[:]  # stars only show in deep sky
    fwc, light = fx.render_fireworks(t)
    # sparkle fountain behind the DIWALI slam
    tau = t - S.T_DIWALI
    if 0 <= tau < 1.6:
        c2, l2 = DIWALI_BURST.draw_ret(t)
        fwc += c2; light += l2
    fire = fx.glow(fwc)
    dim = (1 - 0.62 * TEXT_MASK)[..., None]
    cv += fire * FW_GATE * dim * 1.15
    # firework light spilling onto crane, clouds and ground
    lw = np.zeros((H // 8, W // 8, 3), np.float32)
    for (x, y, r, col) in light:
        cv2.circle(lw, (int(x / 8), int(y / 8)), max(1, int(r / 8)), tuple(float(v) for v in col), -1)
    lw = cv2.GaussianBlur(lw, (0, 0), 14)
    lw += cv2.resize(cv2.GaussianBlur(cv2.resize(fwc, (W // 8, H // 8), interpolation=cv2.INTER_AREA), (0, 0), 6), (W // 8, H // 8)) * 0.9
    cv += cv2.resize(lw, (W, H), interpolation=cv2.INTER_LINEAR) * 0.45 * (0.35 + 0.65 * (1 - FW_GATE))

    # --- bowl glow + glints ------------------------------------------------------------------
    if t > 0.4:
        k = clamp01((t - 0.4) / 1.2)
        cv += BOWL_GLOW * np.array([1.0, 0.58, 0.18], np.float32) * (0.10 + 0.09 * bp) * k
        cv += fx.flares(t, bp) * k

    # --- text ---------------------------------------------------------------------------------
    cream = (1.0, 0.97, 0.90)
    # logo
    u = (t - S.T_LOGO) / 0.85
    if u > 0:
        L = A.logo_navy
        e = ease_out(u)
        shine = None
        for ts in (1.7, 8.2, 12.4):
            sp = (t - ts) / 0.8
            if 0 <= sp <= 1: shine = (-0.2 + 1.4 * sp, 0.07, 0.9)
        draw_layer(cv, L, op=clamp01(u * 3), dy=(1 - e) * 16, wipe=('ltr', -30 + (L.w + 60) * e, 38), shine=shine,
                   glow=0.25 * e)
    ux = (t - (S.T_LOGO + 0.35)) / 0.5
    if ux > 0:
        sc = 0.4 + 0.6 * ease_back(ux, 2.6)
        draw_layer(cv, A.logo_x, op=clamp01(ux * 3), scale=sc, glow=0.4 * (1 - clamp01(ux)) + 0.1)
    ue = (t - S.T_ESTD) / 0.7
    if ue > 0:
        draw_layer(cv, A.estd, op=ease_out(ue), dy=(1 - ease_out(ue)) * 6, glow=0.8, shadow=0.2)
    uo = (t - S.T_ORN) / 0.9
    if uo > 0:
        L = A.ornament
        draw_layer(cv, L, op=1, wipe=('centre', (L.w / 2 + 40) * ease_out(uo), 36), glow=0.25 + 0.15 * bp,
                   glow_col=(1, .8, .4), shadow=0.35)
        # glints riding the leading edge of the two lines
        if uo < 1.05:
            ex = (L.w / 2) * ease_out(uo)
            for sgn in (-1, 1):
                add_blob(cv, L.cx + sgn * ex, L.cy + 2, 16, (1, .85, .5), 0.9 * (1 - uo * 0.6))
    # HAPPY, letter by letter
    for i, L in enumerate(A.happy):
        u = (t - (S.T_HAPPY + 0.13 * i)) / 0.55
        if u <= 0: continue
        e = ease_back(u, 2.2)
        idle = 0.0
        draw_layer(cv, L, op=clamp01(u * 3.5), dy=-(1 - e) * 70 + idle, scale=0.7 + 0.3 * e,
                   glow=0.35 * (1 - clamp01(u)) + 0.12)
    # DIWALI slam
    if tau >= 0:
        if tau < 0.16:
            s = lerp(1.7, 0.96, ease_io(tau / 0.16))
        elif tau < 0.55:
            s = lerp(0.96, 1.0, ease_back((tau - 0.16) / 0.39, 3.0))
        else:
            s = 1.0 + 0.006 * np.sin((t - S.T_DIWALI) * 2.0)
        op = clamp01(tau / 0.09)
        shine = None
        for ts in (S.T_DIWALI + 0.55, 8.4, 11.0, 13.6):
            sp = (t - ts) / 0.9
            if 0 <= sp <= 1: shine = (-0.2 + 1.4 * sp, 0.06, 1.0)
        draw_layer(cv, A.diwali, op=op, scale=s, shine=shine, glow=0.28 + 0.22 * bp + 0.5 * np.exp(-tau * 5),
                   glow_col=(1, .72, .25), shadow=0.55)
        # flash + shock rings
        if tau < 0.5:
            add_blob(cv, *DIW_C, 380, (1, .85, .5), 0.65 * (1 - tau / 0.5) ** 2)
        if tau < 0.8:
            add_ring(cv, *DIW_C, 40 + 760 * ease_out(tau / 0.8), 5 * (1 - tau / 0.8) + 1, (1, .8, .4), 0.5 * (1 - tau / 0.8) ** 1.5)
        if 0.12 < tau < 1.0:
            q = (tau - 0.12) / 0.88
            add_ring(cv, *DIW_C, 30 + 600 * ease_out(q), 3 * (1 - q) + 1, (1, .95, .8), 0.3 * (1 - q) ** 1.5)
    # taglines
    for words, t0 in ((A.tag1, S.T_TAG1), (A.tag2, S.T_TAG2)):
        for i, L in enumerate(words):
            u = (t - (t0 + 0.16 * i)) / 0.5
            if u <= 0: continue
            e = ease_out(u)
            bob = 2.0 * np.sin(2 * np.pi * (t * 0.3 + 0.2 * i + t0)) * clamp01((t - t0 - 1) / 1.0)
            shine = None
            sp = (t - (9.6 if t0 == S.T_TAG1 else 9.9)) / 0.7
            if 0 <= sp <= 1: shine = (-0.2 + 1.4 * sp, 0.08, 0.8)
            draw_layer(cv, L, op=clamp01(u * 2.2), dy=(1 - e) * 26 + bob, glow=0.55 * (1 - clamp01(u)) + 0.12, shine=shine,
                       glow_col=(0.8, 0.9, 1.0), shadow=0.6)

    # --- front sparkle: embers ----------------------------------------------------------------
    cv += fx.embers(t)

    # --- bloom --------------------------------------------------------------------------------
    sm = cv2.resize(cv, (W // 4, H // 4), interpolation=cv2.INTER_AREA)
    br = np.clip(sm - 0.72, 0, None)
    bloom = cv2.resize(cv2.GaussianBlur(br, (0, 0), 7), (W, H), interpolation=cv2.INTER_LINEAR)
    cv += bloom * 0.9
    # screen-ish soft clip so stacked light never clips harshly
    cv = np.where(cv > 0.85, 0.85 + 0.15 * (1 - np.exp(-(cv - 0.85) / 0.15)), cv)

    # --- camera: slow push-in, handheld drift, impact shake -----------------------------------
    z = 1.0 + 0.055 * ease_io(t / DUR)
    cx, cy = 540, 640
    sx = 3.0 * np.sin(t * 0.9) ; sy = 2.0 * np.sin(t * 1.3 + 1)
    for th, amp in ((S.T_DIWALI, 11), (7 * S.BAR, 7), (7 * S.BAR + 0.25, 5)):
        if t >= th:
            d = t - th
            sx += amp * np.exp(-d * 11) * np.sin(d * 70); sy += amp * 0.8 * np.exp(-d * 11) * np.cos(d * 63)
    M = np.array([[z, 0, cx - z * cx + sx], [0, z, cy - z * cy + sy]], np.float32)
    cv = cv2.warpAffine(cv, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)

    # --- finishing ----------------------------------------------------------------------------
    cv *= VIGNETTE
    fade = clamp01(t / 0.7) * clamp01((DUR - t) / 0.8)
    cv *= fade
    cv = np.clip(cv, 0, 1) ** (1 / 1.04)
    return (cv * 255 + 0.5).astype(np.uint8)

def lerp(a, b, t): return a + (b - a) * t

# a gold sparkle fountain that goes off with DIWALI
class _Diwali(fx.Burst):
    def draw_ret(self, t):
        c = np.zeros((H, W, 3), np.float32); l = []
        self.draw(c, t, l)
        return c, l
DIWALI_BURST = _Diwali(900, (S.T_DIWALI + 0.02, DIW_C[0], DIW_C[1], 330, 'peony', 'gold'))

def frame_rgb(i):
    return render(i / FPS)

def encode(out_path, audio_path):
    from multiprocessing import Pool
    cmd = ['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
           '-i', audio_path,
           '-vf', 'format=yuv420p', '-c:v', 'libx264', '-preset', 'slow', '-crf', '15', '-profile:v', 'high', '-pix_fmt', 'yuv420p',
           '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
           '-af', 'loudnorm=I=-14:TP=-1.5:LRA=9,afade=t=out:st=14.2:d=0.8',
           '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-movflags', '+faststart', '-t', str(DUR), out_path]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    with Pool(4) as pool:
        for i, fr in enumerate(pool.imap(frame_rgb, range(NF), chunksize=3)):
            p.stdin.write(np.ascontiguousarray(fr).tobytes())
            if i % 45 == 0: print('frame', i, '/', NF, flush=True)
    p.stdin.close(); p.wait()

if __name__ == '__main__':
    out = '/tmp/claude-0/-home-user-SMVideo/3ffe50c2-b1bb-52d6-8da7-320a2614f999/scratchpad/'
    if len(sys.argv) > 1 and sys.argv[1] == '--stills':
        for ts in sys.argv[2:]:
            img = render(float(ts))
            cv2.imwrite(f'{out}still_{ts}.png', img[..., ::-1])
    else:
        encode(sys.argv[1], sys.argv[2])
