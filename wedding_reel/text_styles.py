"""Minimal animated caption styles (motion graphics). Each style takes the caption schedule [(text, t_in, t_out), ...]
and draws onto a float RGB frame (1080x1920) with .apply(img, t). Enter/exit animations live inside [t_in, t_out]."""
import math, os
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1920
FD = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "fonts")
IVORY = np.array([255, 250, 240], np.float32); GOLD = np.array([236, 205, 140], np.float32)
clamp = lambda x, a=0.0, b=1.0: max(a, min(b, x))
def smooth(x): x = clamp(x); return x * x * (3 - 2 * x)
def ease_out(x): x = clamp(x); return 1 - (1 - x) ** 3
def ease_io(x): x = clamp(x); return 4 * x ** 3 if x < .5 else 1 - (-2 * x + 2) ** 3 / 2
def back_out(x, c1=1.6):
    x = clamp(x); c3 = c1 + 1; return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2

_fonts = {}
def fnt(name, size):
    if (name, size) not in _fonts: _fonts[(name, size)] = ImageFont.truetype(os.path.join(FD, name), size)
    return _fonts[(name, size)]
def line_mask(text, font, tracking=0.0, pad=12):
    """Soft float mask of one line; the text origin sits at (pad, pad). Returns (mask, advance width)."""
    d0 = ImageDraw.Draw(Image.new("L", (4, 4)))
    if tracking == 0: adv = d0.textlength(text, font=font); ws = None
    else: ws = [d0.textlength(c, font=font) for c in text]; adv = sum(ws) + tracking * (len(text) - 1)
    asc, desc = font.getmetrics(); im = Image.new("L", (int(adv) + 2 * pad + 2, asc + desc + 2 * pad), 0); d = ImageDraw.Draw(im)
    if ws is None: d.text((pad, pad), text, font=font, fill=255)
    else:
        x = pad
        for c, w in zip(text, ws): d.text((x, pad), c, font=font, fill=255); x += w + tracking
    return np.asarray(im, np.float32) / 255, adv
def cap_center(font): bb = font.getbbox("H"); return (bb[1] + bb[3]) / 2        # centre of the capital-letter band, from the text origin
def paste(img, m, x, y, color, a=1.0, shadow=.4):
    """Composite a float mask onto img at (x, y) in `color`, with a faint soft shadow so it holds on bright footage."""
    x, y = int(round(x)), int(round(y)); h, w = m.shape; xs, ys, xe, ye = max(0, x), max(0, y), min(W, x + w), min(H, y + h)
    if xe <= xs or ye <= ys or a <= 0: return
    mm = m[ys - y:ye - y, xs - x:xe - x] * a
    if shadow > 0: img[ys:ye, xs:xe] *= (1 - shadow * cv2.GaussianBlur(mm, (0, 0), 5))[..., None]
    img[ys:ye, xs:xe] = img[ys:ye, xs:xe] * (1 - mm[..., None]) + np.asarray(color, np.float32) * mm[..., None]


def scrim(img, caps, t, where):
    """Very soft dark gradient behind the caption area (top or bottom) so light text holds on bright footage; fades with the captions."""
    cov = 0.0
    for _, t0, t1 in caps: cov = max(cov, smooth((t - t0 + .15) / .45) * (1 - smooth((t - (t1 - .4)) / .4)))
    if cov <= 0: return
    y = np.arange(H, dtype=np.float32)
    g = (np.clip(1 - y / 760, 0, 1) if where == "top" else np.clip((y - 1120) / 800, 0, 1)) ** 1.4
    img *= (1 - .42 * cov * g)[:, None, None]


class LineDraw:
    """Top centre. A hairline frame draws itself around the words, the letters tighten into place, then the frame erases."""
    name = "Line Draw"
    def __init__(self, caps): self.caps = caps; self.f = fnt("Poppins-Medium.ttf", 36)
    def apply(self, img, t):
        scrim(img, self.caps, t, "top")
        for text, t0, t1 in self.caps:
            if not (t0 - .01 <= t < t1 + .01): continue
            q = clamp((t - (t1 - .5)) / .5); a_in = ease_out((t - t0 - .4) / .5); tr = 3 + 10 * (1 - ease_out((t - t0 - .4) / .6))
            m, adv = line_mask(text, self.f, tr); cx, cy = 540, 300
            paste(img, m, cx - adv / 2 - 12, cy - cap_center(self.f) - 12, IVORY, a_in * (1 - q))
            bw, bh = line_mask(text, self.f, 3)[1] + 110, 86; x0, y0 = cx - bw / 2, cy - bh / 2
            P = [(0, 0), (bw, 0), (bw, bh), (0, bh), (0, 0)]; cum = [0]
            for (ax, ay), (bx, by) in zip(P[:-1], P[1:]): cum.append(cum[-1] + math.hypot(bx - ax, by - ay))
            L = cum[-1]; s0, s1 = L * ease_io(q), L * ease_io((t - t0) / .8)
            if s1 > s0:
                pts = []
                for i in range(4):
                    a, b = max(s0, cum[i]), min(s1, cum[i + 1])
                    if b > a:
                        fa, fb = (a - cum[i]) / (cum[i + 1] - cum[i]), (b - cum[i]) / (cum[i + 1] - cum[i]); (ax, ay), (bx, by) = P[i], P[i + 1]
                        pts += [(ax + (bx - ax) * fa, ay + (by - ay) * fa), (ax + (bx - ax) * fb, ay + (by - ay) * fb)]
                cv = np.zeros((int(bh) + 24, int(bw) + 24), np.uint8)
                for (ax, ay), (bx, by) in zip(pts[::2], pts[1::2]): cv2.line(cv, (int(ax + 12), int(ay + 12)), (int(bx + 12), int(by + 12)), 255, 3, cv2.LINE_AA)
                paste(img, cv.astype(np.float32) / 255, x0 - 12, y0 - 12, IVORY, .95, shadow=.4)
        return img


class RiseUnderline:
    """Lower left. Words rise out from behind an invisible line, one after another; a gold underline sweeps beneath."""
    name = "Rise and Underline"
    def __init__(self, caps):
        self.caps = caps; self.f = fnt("Poppins-Medium.ttf", 40); self.x0, self.top = 96, 1400; self.words = {}
        sp = ImageDraw.Draw(Image.new("L", (4, 4))).textlength(" ", font=self.f)
        for text, _, _ in caps:
            x = 0; lst = []
            for w in text.split(" "):
                m, adv = line_mask(w, self.f); lst.append((m, x)); x += adv + sp
            self.words[text] = (lst, x - sp)
    def apply(self, img, t):
        scrim(img, self.caps, t, "bottom")
        asc = self.f.getmetrics()[0]; base = self.top + asc
        for text, t0, t1 in self.caps:
            if not (t0 - .01 <= t < t1 + .01): continue
            lst, total = self.words[text]; q = clamp((t - (t1 - .45)) / .45)
            for i, (m, wx) in enumerate(lst):
                e = ease_out((t - t0 - i * .09) / .55)
                if e <= 0: continue
                y_off = (1 - e) * 56 - ease_io(q) * 44; mm = m.copy()
                if q == 0:                                                                   # hide the part still below the baseline line
                    top_abs = self.top - 12 + y_off; cut = int(base + 6 - top_abs)
                    if cut < mm.shape[0]: mm[max(cut, 0):] = 0
                paste(img, mm, self.x0 + wx - 12, self.top - 12 + y_off, IVORY, e * (1 - q))
            u = ease_io((t - t0 - .2) / .7); xa = self.x0 + total * ease_io(q); xb = self.x0 + total * u; yl = int(base + 24)
            if xb > xa + 1:
                img[yl:yl + 3, int(xa):int(xb)] = GOLD
                if u < 1 and q == 0: cv2.circle(img, (int(xb), yl + 1), 5, tuple(float(c) for c in GOLD), -1, cv2.LINE_AA)
        return img


class FocusPull:
    """Lower centre. Words pull into focus one by one from a soft blur with a gentle glow; gold diamonds and hairlines open outward."""
    name = "Focus Pull"
    def __init__(self, caps):
        self.caps = caps; self.f = fnt("Poppins-Regular.ttf", 40); self.cy = 1480; self.words = {}
        sp = ImageDraw.Draw(Image.new("L", (4, 4))).textlength(" ", font=self.f)
        for text, _, _ in caps:
            x = 0; lst = []
            for w in text.split(" "):
                m, adv = line_mask(w, self.f, pad=44); lst.append((m, x)); x += adv + sp
            self.words[text] = (lst, x - sp)
    def apply(self, img, t):
        scrim(img, self.caps, t, "bottom")
        for text, t0, t1 in self.caps:
            if not (t0 - .01 <= t < t1 + .01): continue
            lst, total = self.words[text]; q = clamp((t - (t1 - .5)) / .5); x_left = 540 - total / 2; oy = self.cy - cap_center(self.f) - 44
            ys, ye = int(oy), int(oy) + lst[0][0].shape[0]; xs, xe = int(x_left) - 120, int(x_left + total) + 140
            canvas = np.zeros((ye - ys, xe - xs), np.float32)
            for i, (m, wx) in enumerate(lst):
                a = ease_out((t - t0 - i * .11) / .7) * (1 - ease_out(q - i * .04)); sig = (1 - ease_out((t - t0 - i * .11) / .7)) * 16 + ease_out(q) * 14
                if a <= 0: continue
                mb = cv2.GaussianBlur(m, (0, 0), sig) if sig > .6 else m; gx = int(x_left + wx) - 44 - xs
                h, w = mb.shape; canvas[0:h, max(gx, 0):gx + w][:, :max(0, min(w, canvas.shape[1] - max(gx, 0)))] = np.maximum(
                    canvas[0:h, max(gx, 0):gx + w][:, :max(0, min(w, canvas.shape[1] - max(gx, 0)))], (mb * a)[:, :max(0, min(w, canvas.shape[1] - max(gx, 0)))])
            reg = img[ys:ye, xs:xe]; glow = cv2.GaussianBlur(canvas, (0, 0), 22) * .5
            reg *= (1 - .38 * cv2.GaussianBlur(canvas, (0, 0), 5))[..., None]
            reg[:] = np.clip(reg + glow[..., None] * np.array([255, 232, 200], np.float32) * .55, 0, 255)
            reg[:] = reg * (1 - canvas[..., None]) + IVORY * canvas[..., None]
            o = ease_out((t - t0 - .45) / .6) * (1 - ease_out(q)); dx = total / 2 + 52
            if o > 0:                                                                              # diamonds + hairlines open outward
                for sgn in (-1, 1):
                    cx = 540 + sgn * dx; r = 7 * o; pts = np.array([[cx, self.cy - r], [cx + r, self.cy], [cx, self.cy + r], [cx - r, self.cy]], np.int32)
                    cv2.fillConvexPoly(img, pts, tuple(float(c) for c in GOLD), cv2.LINE_AA)
                    xa, xb = cx + sgn * 16, cx + sgn * (16 + 110 * o); img[self.cy - 1:self.cy + 1, int(min(xa, xb)):int(max(xa, xb))] = GOLD * .9 + img[self.cy - 1:self.cy + 1, int(min(xa, xb)):int(max(xa, xb))] * .1
        return img


class ChapterCounter:
    """Top left. A big thin chapter number rolls in like a counter, a gold line grows beside it, the words wipe on; next caption rolls 01 -> 02."""
    name = "Chapter Counter"
    def __init__(self, caps):
        self.caps = caps; self.fn = fnt("Poppins-Light.ttf", 76); self.ft = fnt("Poppins-Medium.ttf", 34); self.cy = 300
    def apply(self, img, t):
        scrim(img, self.caps, t, "top")
        for i, (text, t0, t1) in enumerate(self.caps):
            if not (t0 - .01 <= t < t1 + .01): continue
            q = clamp((t - (t1 - .5)) / .5); eq = ease_io(q)
            nm, _ = line_mask("%02d" % (i + 1), self.fn); roll = (1 - ease_out((t - t0) / .6)) * 54 - eq * 54
            paste(img, nm, 96 - 12, self.cy - cap_center(self.fn) - 12 + roll, GOLD, ease_out((t - t0) / .45) * (1 - q), shadow=.5)
            x_line = 232; ln = 92 * ease_io((t - t0 - .12) / .6); ya = self.cy - 46 + 92 * eq; yb = self.cy - 46 + ln
            if yb > ya + 1: img[int(ya):int(yb), x_line:x_line + 2] = GOLD
            tm, adv = line_mask(text, self.ft); w = tm.shape[1]; soft = 90.0
            edge_in = ease_io((t - t0 - .3) / .75) * (w + soft) - soft; edge_out = eq * (w + soft) - soft; cols = np.arange(w, dtype=np.float32)
            colmask = np.clip((edge_in - cols) / soft, 0, 1) * (1 - np.clip((edge_out - cols) / soft, 0, 1))
            paste(img, tm * colmask[None, :], 262 - 12, self.cy - cap_center(self.ft) - 12 + (1 - ease_out((t - t0 - .3) / .6)) * 10, IVORY, 1.0)
        return img


STYLES = {"A": LineDraw, "B": RiseUnderline, "C": FocusPull, "D": ChapterCounter}
