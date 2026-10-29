"""Builds everything the renderer needs from the poster: graded dusk sky, sky mask, text layers."""
import cv2, numpy as np

W, H = 1080, 1350
SC = W / 1122.0            # source px -> frame px

def smooth(x, a, b):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)

def lerp(a, b, t):
    return a + (b - a) * t

# ----------------------------------------------------------------------------- source
src = cv2.imread('source.webp').astype(np.float32)
clean = cv2.imread('clean_plate.png').astype(np.float32)
sh, sw = src.shape[:2]

def resize(img, interp=cv2.INTER_AREA):
    return cv2.resize(img, (W, H), interpolation=interp)

# ----------------------------------------------------------------------------- sky mask
def build_sky_mask():
    """1 where the pixel is open sky (incl. clouds), 0 on crane / bowl / ground / skyline."""
    p = cv2.GaussianBlur(clean, (0, 0), 1.5)      # float values: no 8-bit banding in the masks
    Bc, Gc, Rc = p[..., 0], p[..., 1], p[..., 2]
    lum = (0.114 * Bc + 0.587 * Gc + 0.299 * Rc) / 255
    blue = Bc - Rc
    m = smooth(blue, 2, 22) * smooth(lum, 0.30, 0.55)
    # white clouds have almost no blue excess: accept bright, neutral pixels as sky too
    white = smooth(lum, 0.74, 0.86) * (1 - smooth(Rc - Bc, 14, 34))
    m = np.maximum(m, white * smooth(lum, 0.6, 0.7))
    yy, xx = np.mgrid[0:sh, 0:sw].astype(np.float32)
    # horizon: below the skyline there is no sky
    m *= 1 - smooth(yy, 1130, 1200)
    # exclude the glowing bowl + its city, but keep the open sky above it
    ell = ((xx - 862) / 245) ** 2 + ((yy - 1010) / 175) ** 2
    m *= smooth(ell, 0.85, 1.15)
    # hazy skyline on the right horizon
    m *= 1 - smooth(yy, 1085, 1130) * smooth(xx, 700, 760)
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    m = cv2.GaussianBlur(m, (0, 0), 1.6)
    return resize(m)

SKY = build_sky_mask()

# ----------------------------------------------------------------------------- grading
def build_graded():
    p = resize(clean) / 255.0          # RGB order below
    p = p[..., ::-1]
    ps = cv2.GaussianBlur(p, (0, 0), 1.5)   # smooth copy for tone decisions (no banding)
    lum = 0.299 * ps[..., 0] + 0.587 * ps[..., 1] + 0.114 * ps[..., 2]
    ty = (np.arange(H, dtype=np.float32) / H)[:, None]
    # dusk palette: deep indigo at the top -> royal blue -> warm horizon glow
    def pal(stops):
        out = np.zeros((H, W, 3), np.float32)
        ys = np.array([s[0] for s in stops])
        for c in range(3):
            col = np.interp(ty[:, 0], ys, [s[1][c] for s in stops])
            out[..., c] = col[:, None]
        return out
    deep = pal([(0.0, (0.020, 0.045, 0.16)), (0.35, (0.05, 0.14, 0.38)),
                (0.62, (0.16, 0.30, 0.58)), (0.86, (0.62, 0.42, 0.50)), (1.0, (0.55, 0.36, 0.34))])
    cloud = pal([(0.0, (0.20, 0.27, 0.52)), (0.35, (0.36, 0.46, 0.72)),
                 (0.62, (0.70, 0.62, 0.80)), (0.86, (1.0, 0.66, 0.50)), (1.0, (1.0, 0.62, 0.45))])
    cloudness = smooth(lum, 0.72, 0.99)[..., None]
    sky = lerp(deep, cloud, cloudness ** 1.15)
    # warm sunset bloom behind the city, bottom right
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    g = np.exp(-(((xx - 850) / 520) ** 2 + ((yy - 1050) / 300) ** 2))[..., None]
    sky = sky + g * np.array([0.45, 0.22, 0.05], np.float32) * 0.9
    # the foreground gets a gentler dusk grade so the crane keeps its punch
    fg = p * np.array([0.92, 0.86, 0.90], np.float32)
    fg = fg ** 1.12
    m = SKY[..., None]
    return np.clip(sky * m + fg * (1 - m), 0, 1).astype(np.float32)

GRADED = build_graded()

# ----------------------------------------------------------------------------- text layers
reg = np.zeros((sh, sw), bool); reg[40:545, 270:870] = True
_d = np.abs(src - clean).sum(2)
_near = cv2.dilate(((_d > 18) & reg).astype(np.uint8), np.ones((5, 5), np.uint8)) > 0
_L = lambda a: 0.114 * a[..., 0] + 0.587 * a[..., 1] + 0.299 * a[..., 2]
_Lbg, _L_px = _L(clean), _L(src)
_rb_bg = clean[..., 2] - clean[..., 0]
_rb = src[..., 2] - src[..., 0]
GOLD_A = np.clip(((_rb - _rb_bg) / 190.0), 0, 1) * _near
NAVY_A = np.clip((_Lbg - _L_px) / np.maximum(_Lbg - 45, 1), 0, 1) * (1 - np.clip((_rb - _rb_bg) / 60.0, 0, 1)) * _near
NAVY_A[NAVY_A < 0.04] = 0
GOLD_A[GOLD_A < 0.04] = 0
GOLD_P = np.clip(src - (1 - GOLD_A[..., None]) * clean, 0, 255)[..., ::-1] / 255.0   # premultiplied RGB

CREAM = np.array([1.0, 0.97, 0.90], np.float32)

class Layer:
    def __init__(self, x0, y0, x1, y1, alpha, prem):
        """Box in source px; alpha/prem are full-size source arrays (cropped here, then scaled to frame px)."""
        m = 6
        bx0, by0, bx1, by1 = x0, y0, x1, y1
        x0, y0, x1, y1 = x0 - m, y0 - m, x1 + m, y1 + m
        a = alpha[y0:y1, x0:x1].astype(np.float32).copy()
        p = prem[y0:y1, x0:x1].astype(np.float32).copy()
        keep = np.zeros(a.shape, np.float32); keep[by0 - y0:by1 - y0, bx0 - x0:bx1 - x0] = 1   # drop neighbouring text in the margin
        a *= keep; p *= keep[..., None]
        w, h = int(round((x1 - x0) * SC)), int(round((y1 - y0) * SC))
        self.a = cv2.resize(a, (w, h), interpolation=cv2.INTER_AREA)
        self.p = cv2.resize(p, (w, h), interpolation=cv2.INTER_AREA)
        self.x, self.y = x0 * SC, y0 * SC              # top-left in frame px
        self.w, self.h = w, h
        self.cx, self.cy = self.x + w / 2, self.y + h / 2

def navy_layer(box):
    x0, y0, x1, y1 = box
    prem = NAVY_A[..., None] * CREAM
    return Layer(x0, y0, x1, y1, NAVY_A, prem)

def gold_layer(box):
    x0, y0, x1, y1 = box
    return Layer(x0, y0, x1, y1, GOLD_A, GOLD_P)

def runs(a, y0, y1, x0, x1, gap):
    cols = (a[y0:y1, x0:x1] > 0.12).any(0)
    out, s, last = [], None, None
    for i, c in enumerate(cols):
        if c:
            if s is None: s = i
            last = i
        elif s is not None and i - last > gap:
            out.append((x0 + s, x0 + last + 1)); s = None
    if s is not None: out.append((x0 + s, x0 + last + 1))
    return out

# bands measured from the poster (source px)
LOGO = (355, 86, 796, 152)
ESTD = (680, 62, 800, 88)
ORNAMENT = (345, 168, 780, 222)
HAPPY_Y = (244, 293)
DIWALI = (272, 304, 848, 426)
TAG1_Y = (441, 487)
TAG2_Y = (488, 536)

logo_navy = navy_layer(LOGO)
logo_x = gold_layer((357, 88, 440, 152))           # the orange X mark
estd = gold_layer(ESTD)
ornament = gold_layer(ORNAMENT)
# ornament: split into centre lotus + two side lines for the grow-out animation
diwali = gold_layer(DIWALI)
happy = [navy_layer((a, HAPPY_Y[0], b, HAPPY_Y[1])) for a, b in runs(NAVY_A, *HAPPY_Y, 420, 710, 6)]
tag1 = [navy_layer((a, TAG1_Y[0], b, TAG1_Y[1])) for a, b in runs(NAVY_A, *TAG1_Y, 300, 830, 8)]
tag2 = [navy_layer((a, TAG2_Y[0], b, TAG2_Y[1])) for a, b in runs(NAVY_A, *TAG2_Y, 300, 830, 8)]

# a combined "everything that is text" mask in frame px, used to dim fireworks behind text
TEXT_MASK = np.zeros((H, W), np.float32)
for L in [logo_navy, logo_x, estd, ornament, diwali, *happy, *tag1, *tag2]:
    x, y = int(round(L.x)), int(round(L.y))
    TEXT_MASK[y:y + L.h, x:x + L.w] = np.maximum(TEXT_MASK[y:y + L.h, x:x + L.w], L.a)
TEXT_MASK = np.clip(cv2.GaussianBlur(TEXT_MASK, (0, 0), 14) * 3.0, 0, 1)

if __name__ == '__main__':
    S = '/tmp/claude-0/-home-user-SMVideo/3ffe50c2-b1bb-52d6-8da7-320a2614f999/scratchpad/'
    print('happy', len(happy), 'tag1', len(tag1), 'tag2', len(tag2))
    cv2.imwrite(S + 'skymask.png', (SKY * 255).astype(np.uint8))
    cv2.imwrite(S + 'graded.png', (GRADED[..., ::-1] * 255).astype(np.uint8))
