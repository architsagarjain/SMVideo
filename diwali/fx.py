"""Procedural effects: fireworks (stateless, any frame can be rendered on its own), stars, embers, flares."""
import cv2, numpy as np
from assets import W, H
from schedule import FIREWORKS, COLORS

def splat(canvas, xs, ys, cols, w):
    """Bilinear additive splat of points into an HxWx3 float canvas. cols: (n,3), w: (n,)"""
    ok = (xs > 0) & (xs < W - 1) & (ys > 0) & (ys < H - 1) & (w > 0.002)
    if not ok.any():
        return
    xs, ys, cols, w = xs[ok], ys[ok], cols[ok], w[ok]
    x0 = np.floor(xs).astype(np.int64); y0 = np.floor(ys).astype(np.int64)
    fx = xs - x0; fy = ys - y0
    for dx, dy, wt in ((0, 0, (1 - fx) * (1 - fy)), (1, 0, fx * (1 - fy)), (0, 1, (1 - fx) * fy), (1, 1, fx * fy)):
        idx = (y0 + dy) * W + (x0 + dx)
        for c in range(3):
            canvas[..., c] += np.bincount(idx, weights=cols[:, c] * w * wt, minlength=H * W).reshape(H, W)

class Burst:
    def __init__(self, i, spec):
        t, x, y, size, kind, cname = spec
        rng = np.random.RandomState(100 + i)
        self.t, self.x, self.y, self.size, self.kind = t, x, y, size, kind
        c1, c2 = COLORS[cname]
        self.c1, self.c2 = np.array(c1, np.float32), np.array(c2, np.float32)
        n = {'peony': 300, 'ring': 240, 'willow': 280}[kind]
        ang = rng.uniform(0, 2 * np.pi, n)
        if kind == 'ring':
            ang = np.linspace(0, 2 * np.pi, n, endpoint=False) + rng.normal(0, .01, n)
            sp = 0.92 + rng.normal(0, 0.03, n)
            # tilt: squash the ring into an ellipse
            self.sq = 0.45 + 0.4 * rng.rand()
            self.tilt = rng.uniform(-0.6, 0.6)
        elif kind == 'willow':
            sp = 0.45 + 0.55 * rng.rand(n) ** 0.7
            self.sq = 1.0; self.tilt = 0.0
        else:
            sp = 1.0 - 0.55 * rng.rand(n) ** 2
            self.sq = 1.0; self.tilt = 0.0
        self.k = 1.1 if kind == 'willow' else 1.7              # air drag (1/s)
        self.g = 150.0 if kind == 'willow' else 95.0           # gravity px/s^2
        self.life = 3.4 if kind == 'willow' else 2.1
        self.life_j = self.life * (0.75 + 0.25 * rng.rand(n))
        speed = size * self.k * sp
        vx, vy = np.cos(ang) * speed, np.sin(ang) * speed
        if kind == 'ring':
            vy = vy * self.sq
            ca, sa = np.cos(self.tilt), np.sin(self.tilt)
            vx, vy = vx * ca - vy * sa, vx * sa + vy * ca
        self.vx, self.vy = vx.astype(np.float32), vy.astype(np.float32)
        self.mix = (sp - sp.min()) / (np.ptp(sp) + 1e-6)
        self.phase = rng.uniform(0, 100, n).astype(np.float32)
        self.fr = rng.uniform(14, 30, n).astype(np.float32)
        self.n = n
        self.trail_n = 16 if kind == 'willow' else 10
        self.trail_dt = 0.04 if kind == 'willow' else 0.022

    def pos(self, a):
        """position at age a (array). Closed form of drag + gravity."""
        e = (1 - np.exp(-self.k * a)) / self.k
        x = self.x + self.vx[:, None] * e
        y = self.y + self.vy[:, None] * e + self.g * (a / self.k - e) / self.k
        return x, y

    def draw(self, canvas, t, light):
        a0 = t - self.t
        # rocket
        rt = 0.55
        if -rt <= a0 < 0:
            u = (a0 + rt) / rt
            e = 1 - (1 - u) ** 2
            sx, sy = self.x + (self.x - 540) * 0.0, min(self.y + 560, 900)
            hx = sx + (self.x - sx) * e
            hy = sy + (self.y - sy) * e
            n = 14
            j = np.arange(n, dtype=np.float32)
            ages = u - j * 0.012
            ee = 1 - (1 - np.clip(ages, 0, 1)) ** 2
            px = sx + (self.x - sx) * ee + np.sin(j * 5 + t * 40) * 1.2
            py = sy + (self.y - sy) * ee
            w = (0.9 * (1 - j / n) ** 1.6) * np.where(ages > 0, 1, 0)
            splat(canvas, px, py, np.tile(np.array([[1.0, 0.85, 0.55]], np.float32), (n, 1)), w.astype(np.float32))
            return
        if a0 < 0 or a0 > self.life + 0.3:
            return
        # flash light at the moment of the burst
        if a0 < 0.45:
            f = (1 - a0 / 0.45) ** 2
            light.append((self.x, self.y, self.size * 1.5, tuple(self.c1 * 0.9 * f)))
        j = np.arange(self.trail_n, dtype=np.float32)[None, :]
        ages = a0 - j * self.trail_dt                              # (1, T)
        ages = np.broadcast_to(ages, (self.n, self.trail_n))
        valid = ages > 0
        life = self.life_j[:, None]
        x, y = self.pos(np.maximum(ages, 0))
        fade = np.clip(1 - ages / life, 0, 1)
        w = fade ** 1.4
        flick = 0.55 + 0.45 * np.sin(self.phase[:, None] + ages * self.fr[:, None])
        late = np.clip((ages / life - 0.45) / 0.4, 0, 1)
        w = w * (1 - late * (1 - flick))
        w = w * (0.88 ** j) * valid
        core = np.clip(1 - ages / 0.18, 0, 1)[..., None]            # white-hot at birth
        cm = self.mix[:, None, None]
        col = self.c1 * (1 - cm * 0.0) * (1 - np.clip(ages / life, 0, 1)[..., None]) + self.c2 * np.clip(ages / life, 0, 1)[..., None]
        col = col * (1 - core) + np.array([1.0, 0.97, 0.9], np.float32) * core
        if self.kind == 'willow':
            col = np.array([1.0, 0.72, 0.28], np.float32) * (1 - np.clip(ages / life, 0, 1)[..., None] * 0.35) * (1 - core) + core
        inten = (3.4 if self.kind == 'willow' else 3.0) * (0.04 + 0.96 * min(1.0, a0 / 0.30) ** 2.2)
        splat(canvas, x.ravel(), y.ravel(), col.reshape(-1, 3).astype(np.float32), (w * inten).ravel().astype(np.float32))

def render_fireworks(t):
    """Returns (canvas, light list). canvas: HxWx3 float, light: [(x, y, radius, rgb)]"""
    canvas = np.zeros((H, W, 3), np.float32)
    light = []
    for b in BURSTS:
        if b.t - 0.6 <= t <= b.t + b.life + 0.35:
            b.draw(canvas, t, light)
    return canvas, light

BURSTS = [Burst(i, s) for i, s in enumerate(FIREWORKS)]
# extra: small gold sparkle fountain behind the DIWALI slam is scheduled in render.py as a burst

def glow(canvas, sig_small=1.5, sig_mid=10, sig_big=38, k_mid=1.6, k_big=1.0):
    core = cv2.GaussianBlur(canvas, (0, 0), sig_small)
    sm = cv2.resize(canvas, (W // 4, H // 4), interpolation=cv2.INTER_AREA)
    mid = cv2.resize(cv2.GaussianBlur(sm, (0, 0), sig_mid / 4), (W, H), interpolation=cv2.INTER_LINEAR)
    big = cv2.resize(cv2.GaussianBlur(sm, (0, 0), sig_big / 4), (W, H), interpolation=cv2.INTER_LINEAR)
    return core + k_mid * mid + k_big * big

# ------------------------------------------------------------------ stars, embers, flares
_rng = np.random.RandomState(3)
STAR_N = 170
STAR_X = _rng.uniform(0, W, STAR_N); STAR_Y = (_rng.rand(STAR_N) ** 1.3) * 640
STAR_B = _rng.uniform(0.35, 1.0, STAR_N); STAR_P = _rng.uniform(0, 6.28, STAR_N); STAR_R = _rng.uniform(1.2, 4.0, STAR_N)
STAR_T0 = _rng.uniform(0.3, 2.2, STAR_N)

def stars(t, sky_dark):
    """sky_dark: HxW weight, 1 in deep sky, 0 in bright / foreground"""
    c = np.zeros((H, W, 3), np.float32)
    xi = np.clip(STAR_X.astype(int), 0, W - 1); yi = np.clip(STAR_Y.astype(int), 0, H - 1)
    vis = sky_dark[yi, xi]
    tw = 0.55 + 0.45 * np.sin(STAR_P + t * (1.5 + STAR_R))
    fade = np.clip((t - STAR_T0) / 0.8, 0, 1)
    w = STAR_B * tw * fade * vis
    splat(c, STAR_X.astype(np.float32), STAR_Y.astype(np.float32),
          np.tile(np.array([[0.85, 0.9, 1.0]], np.float32), (STAR_N, 1)), (w * 1.1).astype(np.float32))
    big = (STAR_R > 3.7)
    for x, y, r, ww in zip(STAR_X[big], STAR_Y[big], STAR_R[big], w[big]):
        L = int(3 + 4 * ww)
        cv2.line(c, (int(x) - L, int(y)), (int(x) + L, int(y)), (0.28 * ww,) * 3, 1)
        cv2.line(c, (int(x), int(y) - L), (int(x), int(y) + L), (0.28 * ww,) * 3, 1)
    return cv2.GaussianBlur(c, (0, 0), 0.9) * 1.4

_e = np.random.RandomState(11)
EMB_N = 90
EMB_X = _e.uniform(0, W, EMB_N); EMB_Y0 = _e.uniform(0, H, EMB_N); EMB_V = _e.uniform(14, 48, EMB_N)
EMB_R = _e.uniform(1.5, 6.0, EMB_N); EMB_P = _e.uniform(0, 6.28, EMB_N); EMB_A = _e.uniform(0.25, 0.8, EMB_N)

def embers(t):
    c = np.zeros((H, W, 3), np.float32)
    y = (EMB_Y0 - EMB_V * t) % (H + 40) - 20
    x = EMB_X + np.sin(EMB_P + t * 0.7) * 22
    tw = 0.5 + 0.5 * np.sin(EMB_P * 3 + t * 3.2)
    fade = np.clip(t / 1.5, 0, 1)
    for xx, yy, r, a, tt in zip(x, y, EMB_R, EMB_A, tw):
        cv2.circle(c, (int(xx), int(yy)), int(max(1, r)), (1.0 * a * tt * fade, 0.72 * a * tt * fade, 0.3 * a * tt * fade), -1)
    return cv2.GaussianBlur(c, (0, 0), 2.2) * 1.6

# glints on the bowl rim and the city (frame px)
FLARES = [(675, 945), (745, 940), (905, 942), (980, 940), (1030, 945), (830, 950), (800, 880), (868, 790), (835, 770),
          (700, 1010), (760, 1030), (900, 1030), (960, 1010), (830, 1010), (1015, 975), (640, 960), (880, 860), (940, 880)]

def flares(t, beat_pulse):
    c = np.zeros((H, W, 3), np.float32)
    for i, (x, y) in enumerate(FLARES):
        ph = (t * 0.8 + i * 0.37) % 1.0
        a = max(0.0, np.sin(np.pi * ph)) ** 4 * (0.5 + 0.5 * beat_pulse)
        if a < 0.03: continue
        L = int(10 + 22 * a)
        col = (1.0 * a, 0.9 * a, 0.62 * a)
        cv2.line(c, (x - L, y), (x + L, y), col, 1)
        cv2.line(c, (x, y - L), (x, y + L), col, 1)
        L2 = int(L * 0.55)
        cv2.line(c, (x - L2, y - L2), (x + L2, y + L2), tuple(v * .5 for v in col), 1)
        cv2.line(c, (x - L2, y + L2), (x + L2, y - L2), tuple(v * .5 for v in col), 1)
        cv2.circle(c, (x, y), 2, col, -1)
    return cv2.GaussianBlur(c, (0, 0), 1.1) * 1.8
