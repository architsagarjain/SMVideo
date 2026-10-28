"""Composite the animation frame by frame and pipe raw video to ffmpeg (no audio here)."""
import math, sys, subprocess
import numpy as np, cv2
import plates as PL

FPS, DUR = 30, 10.0
OUT_W, OUT_H = 1080, 1350
DESCENT_PX = 38.0           # total lowering of the diya, in poster pixels
DESC_T0, DESC_ACC, DESC_END, DESC_DEC = 1.0, 2.5, 6.6, 8.4   # start, cruise start, decel start, stop


def ease(x):                       # smootherstep, clamped
    x = min(max(x, 0.0), 1.0)
    return x * x * x * (x * (6 * x - 15) + 10)


def ease_out(x):
    x = min(max(x, 0.0), 1.0)
    return 1 - (1 - x) ** 3


def _vel(t):
    if t < DESC_T0 or t > DESC_DEC: return 0.0
    if t < DESC_ACC: return ease((t - DESC_T0) / (DESC_ACC - DESC_T0))
    if t < DESC_END: return 1.0
    return 1 - ease((t - DESC_END) / (DESC_DEC - DESC_END))


_ts = np.linspace(0, DUR, 6001)
_cum = np.cumsum([_vel(t) for t in _ts]) * (_ts[1] - _ts[0])
_scale = DESCENT_PX / _cum[-1]


def descent(t):
    """Smooth lowering distance (poster px) with a barely perceptible settle at the end."""
    d = float(np.interp(t, _ts, _cum)) * _scale
    ts = t - DESC_DEC
    if ts > 0:
        d -= 0.45 * math.exp(-ts * 5.5) * math.sin(ts * 9.0)   # <0.5 px natural settle
    return d


def glow_level(t):
    k = np.interp(t, [0, 1, 2, 4, 7, 10], [0, 0.18, 0.45, 0.78, 1.0, 1.0])
    if 6.0 < t < 8.0:                         # slow, non-flickering shimmer
        k *= 1 + 0.04 * math.sin((t - 6.0) * 2 * math.pi * 0.5) * math.sin((t - 6.0) / 2 * math.pi)
    return float(k)


def shifted(img, dy, size):
    M = np.float32([[1, 0, 0], [0, 1, dy]])
    return cv2.warpAffine(img, M, size, flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_CONSTANT, borderValue=0)


class Scene:
    def __init__(self):
        a = PL.build_all()
        self.a = a
        self.P = a["P"]
        self.H, self.W = self.P.shape[:2]
        d = a["diya"]
        self.S = d["S"]
        x0, y0, x1, y1 = PL.DIYA_BOX
        self.dy0, self.dy1 = y0 - 10, y1 + 60     # canvas rows for diya layer + travel
        self.dx0, self.dx1 = x0 - 8, x1 + 8
        sl = (slice(self.dy0, self.dy1), slice(self.dx0, self.dx1))
        self.R = np.ascontiguousarray(d["R"][sl])
        self.core = np.ascontiguousarray(d["core"][sl])
        self.Pc = np.ascontiguousarray(self.P[sl])
        self.sl = sl
        self.sz = (self.dx1 - self.dx0, self.dy1 - self.dy0)
        # text plate: base with all typography removed
        self.Btext = a["B"]
        # light weights
        self.region = a["light_region"][..., None]

    def frame(self, t):
        P, a = self.P, self.a
        # --- base: poster with diya region cleaned, typography removed
        out = self.S.copy()
        tx = np.zeros_like(P[..., :1])
        # typography plate: take B only inside text boxes
        for k, L in a["text"].items():
            x0, y0, x1, y1 = L["box"]
            out[y0:y1, x0:x1] = self.Btext[y0:y1, x0:x1]
        # --- hoist cable extension
        d = descent(t)
        cx0, cx1 = PL.CABLE_X
        ta, tb = PL.CABLE_TILE
        n = tb - ta
        yend = int(round(PL.CABLE_TIP_Y + d)) + 2
        for y in range(PL.CABLE_TIP_Y, yend + 1):
            wgt = 1.0 if y > PL.CABLE_TIP_Y + 2 else min(1.0, d / 1.5)
            out[y, cx0:cx1] = (1 - wgt) * out[y, cx0:cx1] + wgt * (self._sky_row(y, cx0, cx1, y <= tb) + a["cable"][(y - ta) % n])
        # --- diya (+halo) as difference layer, with opaque core
        Rs = shifted(self.R, d, self.sz)
        cs = shifted(self.core, d, self.sz)[..., None]
        Ps = shifted(self.Pc, d, self.sz)
        base = out[self.sl]
        comp = (base + Rs) * (1 - cs) + Ps * cs
        out[self.sl] = comp
        # --- worker figures stay in front of the plate
        w = a["workers"][..., None]
        wy0, wy1, wx0, wx1 = 672, 742, 236, 306
        out[wy0:wy1, wx0:wx1] = out[wy0:wy1, wx0:wx1] * (1 - w[wy0:wy1, wx0:wx1]) + P[wy0:wy1, wx0:wx1] * w[wy0:wy1, wx0:wx1]
        # --- typography reveals (difference layers added back onto the clean sky)
        tm = {
            "happy": (ease((t - 2.0) / 0.6), 0),
            "diwali": (ease((t - 2.3) / 1.3), 0),
            "divider": (ease((t - 3.2) / 0.8), 0),
            "tagline": (ease((t - 4.0) / 1.0), 6.0 * (1 - ease_out((t - 4.0) / 1.1))),
        }
        for k, (al, dy) in tm.items():
            if al <= 0: continue
            L = a["text"][k]
            x0, y0, x1, y1 = L["box"]
            D = L["D"]
            if dy > 0.01:
                pad = 10
                Dp = np.pad(D, ((pad, pad), (0, 0), (0, 0)))
                Dp = shifted(Dp, dy, (D.shape[1], Dp.shape[0]))
                out[y0 - pad:y1 + pad, x0:x1] += al * Dp
            else:
                out[y0:y1, x0:x1] += al * D
        out = self._divider_sweep(out, t)
        out = self._logo_sheen(out, t)
        out = self._glow(out, t)
        return np.clip(out, 0, 255)

    def _sky_row(self, y, cx0, cx1, from_poster):
        src = self.P if from_poster else self.S
        l = src[y, cx0 - 1:cx0 + 2].mean(0) if from_poster else src[y, cx0 - 4:cx0 - 1].mean(0)
        r = src[y, cx1 - 2:cx1 + 1].mean(0) if from_poster else src[y, cx1 + 1:cx1 + 4].mean(0)
        tt = np.linspace(0, 1, cx1 - cx0)[:, None]
        return l * (1 - tt) + r * tt

    def _divider_sweep(self, out, t):
        if not (3.3 < t < 4.3): return out
        L = self.a["text"]["divider"]
        x0, y0, x1, y1 = L["box"]
        u = ease((t - 3.3) / 1.0)
        xs = np.arange(x0, x1)[None, :]
        pos = x0 - 40 + u * (x1 - x0 + 80)
        band = np.exp(-((xs - pos) ** 2) / (2 * 26.0 ** 2))
        m = cv2.GaussianBlur(L["mask"], (0, 0), 0.6)
        env = math.sin(math.pi * u)              # fades in/out with the pass
        gold = np.array([255, 226, 150], np.float32)
        amt = (0.60 * env * band * m)[..., None]
        out[y0:y1, x0:x1] = out[y0:y1, x0:x1] * (1 - amt) + gold * amt
        return out

    def _logo_sheen(self, out, t):
        if not (1.0 < t < 2.3): return out
        x0, y0, x1, y1 = PL.LOGO_BOX
        u = ease((t - 1.0) / 1.2)
        yy, xx = np.mgrid[y0:y1, x0:x1].astype(np.float32)
        proj = xx + 0.45 * yy
        lo, hi = x0 + 0.45 * y0, x1 + 0.45 * y1
        pos = lo - 60 + u * (hi - lo + 120)
        band = np.exp(-((proj - pos) ** 2) / (2 * 34.0 ** 2))
        m = self.a["logo"][y0:y1, x0:x1]
        env = math.sin(math.pi * u)
        amt = (0.30 * env * band * m)[..., None]
        sub = out[y0:y1, x0:x1]
        out[y0:y1, x0:x1] = sub + (255 - sub) * amt
        return out

    def _glow(self, out, t):
        g = glow_level(t)
        if g <= 0.001: return out
        o8 = out
        lum = o8.mean(2)
        warm = o8[..., 0] - o8[..., 2]
        wt = np.clip((lum - 188) / 50, 0, 1) * np.clip((warm - 20) / 40, 0, 1) * np.clip((o8[..., 2] - 100) / 40, 0, 1)
        wt = wt[..., None] * self.region
        src = (o8 * wt) / 255.0
        bloom = cv2.GaussianBlur(src, (0, 0), 4) * 0.55 + cv2.GaussianBlur(src, (0, 0), 14) * 0.9
        bloom = bloom * np.array([1.0, 0.82, 0.45], np.float32)    # keep it golden
        amt = np.clip(bloom * g * 0.42, 0, 1)
        return 255 * (1 - (1 - o8 / 255.0) * (1 - amt))


def to_output(img):
    return cv2.resize(img.astype(np.uint8), (OUT_W, OUT_H), interpolation=cv2.INTER_AREA)


def main(out_path, only=None):
    sc = Scene()
    n = int(round(FPS * DUR))
    if only is not None:
        for t in only:
            f = to_output(sc.frame(t))
            cv2.imwrite(f"{out_path}_{t:05.2f}.png", f[..., ::-1])
        return
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{OUT_W}x{OUT_H}",
           "-r", str(FPS), "-i", "-", "-an", "-c:v", "libx264", "-preset", "slow", "-crf", "14", "-pix_fmt", "yuv420p",
           "-profile:v", "high", "-level", "4.1", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
           "-movflags", "+faststart", out_path]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for i in range(n):
        f = to_output(sc.frame(i / FPS))
        p.stdin.write(f.tobytes())
        if i % 30 == 0: print(f"frame {i}/{n}", flush=True)
    p.stdin.close(); p.wait()


if __name__ == "__main__":
    if sys.argv[1] == "stills":
        main(sys.argv[2], [float(x) for x in sys.argv[3:]])
    else:
        main(sys.argv[1])
