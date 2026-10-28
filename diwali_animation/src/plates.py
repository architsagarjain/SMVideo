"""Build the locked layers from the poster.

Nothing is regenerated: every moving or fading element is the *difference* between the original
poster and a reconstructed clean sky (P - S). Adding that difference back at full strength and
zero offset reproduces the poster pixel for pixel, so the first/last states match the artwork.
"""
import os
import numpy as np, cv2
from PIL import Image

POSTER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "poster.webp")

TEXT_BOXES = dict(            # (x0, y0, x1, y1) in poster pixels
    happy=(690, 284, 930, 332),
    diwali=(590, 330, 1056, 452),
    divider=(636, 442, 1004, 492),
    tagline=(616, 500, 1032, 565),
)
LOGO_BOX = (598, 100, 1062, 248)

DIYA_BOX = (170, 484, 342, 696)      # x0, y0, x1, y1
DIYA_SEED = (258, 600)
PLATE_BOTTOM = 693                    # last row of the diya's underside plate
CABLE_X = (258, 278)                  # columns spanning the twin hoist cable
CABLE_TILE = (462, 489)               # clean rows of cable used to extend it
CABLE_TIP_Y = 492                     # where the cable meets the diya's tip


def load():
    return np.asarray(Image.open(POSTER).convert("RGB")).astype(np.float32)


def fill_holes(m):
    m8 = (m > 0).astype(np.uint8)
    ff = m8.copy()
    h, w = m8.shape
    pad = np.zeros((h + 2, w + 2), np.uint8)
    cv2.floodFill(ff, pad, (0, 0), 2)
    return (ff != 2).astype(np.uint8)


def _sky_fill(roi_u8, thr_pass1=10):
    """Detect dark/saturated content on bright sky and replace it with smooth inpainted sky."""
    m0 = ((roi_u8[..., 2] < 195) | (roi_u8.astype(int).sum(2) < 520)).astype(np.uint8)
    m0 = cv2.dilate(m0, np.ones((9, 9), np.uint8))
    s = cv2.inpaint(roi_u8, m0, 9, cv2.INPAINT_NS)
    s = np.where(m0[..., None] > 0, cv2.GaussianBlur(s, (0, 0), 2), roi_u8)
    d = np.abs(roi_u8.astype(np.int16) - s.astype(np.int16)).max(2)
    m = cv2.dilate((d > thr_pass1).astype(np.uint8), np.ones((5, 5), np.uint8))
    s2 = cv2.inpaint(roi_u8, m, 9, cv2.INPAINT_NS)
    s2 = np.where(m[..., None] > 0, cv2.GaussianBlur(s2, (0, 0), 2), roi_u8)
    return m, s2.astype(np.float32)


def build_text(P):
    """Clean sky plate (B) + per-element signed difference layers for the typography."""
    B = P.copy()
    owner = np.full(P.shape[:2], -1, np.int8)
    names = list(TEXT_BOXES)
    for i, k in enumerate(names):
        x0, y0, x1, y1 = TEXT_BOXES[k]
        roi = P[y0:y1, x0:x1].astype(np.uint8)
        m, s = _sky_fill(roi)
        sel = (m > 0) & (owner[y0:y1, x0:x1] < 0)
        owner[y0:y1, x0:x1][sel] = i
        B[y0:y1, x0:x1] = np.where(m[..., None] > 0, s, B[y0:y1, x0:x1])
    layers = {}
    for i, k in enumerate(names):
        x0, y0, x1, y1 = TEXT_BOXES[k]
        own = (owner[y0:y1, x0:x1] == i)
        D = (P[y0:y1, x0:x1] - B[y0:y1, x0:x1]) * own[..., None]
        layers[k] = dict(box=(x0, y0, x1, y1), D=D.astype(np.float32), mask=own.astype(np.float32))
    return B, layers


def build_logo(P):
    x0, y0, x1, y1 = LOGO_BOX
    roi = P[y0:y1, x0:x1].astype(np.uint8)
    m, _ = _sky_fill(roi)
    # fill the hexagon interior and the orange pill, keep the blue strapline letter-shaped
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    hexa = fill_holes(m)
    full = np.zeros(P.shape[:2], np.float32)
    full[y0:y1, x0:x1] = cv2.GaussianBlur(hexa.astype(np.float32), (0, 0), 0.8)
    return full


def build_diya(P):
    x0, y0, x1, y1 = DIYA_BOX
    H, W = P.shape[:2]
    roi = P[y0:y1, x0:x1]
    warm = roi[..., 0] - roi[..., 2]
    m = (warm > 16).astype(np.uint8)
    m[:, :] = m
    n, lab = cv2.connectedComponents(m, connectivity=8)
    sx, sy = DIYA_SEED
    seed_lab = lab[sy - y0, sx - x0]
    assert seed_lab > 0, "diya seed not on diya"
    comp = (lab == seed_lab).astype(np.uint8)
    comp = cv2.morphologyEx(comp, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)))
    comp = fill_holes(comp)
    H0 = np.zeros((H, W), np.uint8)
    H0[y0:y1, x0:x1] = comp
    H0[PLATE_BOTTOM + 1:, :] = 0
    # worker 1's head/shoulders sit in front of the plate: they are not part of the diya
    head = np.zeros((H, W), np.uint8)
    cv2.fillPoly(head, [np.array([(250, 686), (252, 681), (255, 679.5), (258, 681), (260, 686),
                                  (262, 690), (263, 694.5), (243, 694.5), (244, 690)], np.float32).round().astype(np.int32)], 1)
    head = cv2.dilate(head, np.ones((2, 2), np.uint8))
    H0[head > 0] = 0
    # clip the cable stub / tip noise above the true tip
    H0[:CABLE_TIP_Y - 2, :] = 0
    # everything that is not the diya but is warm (slings, petals, ring) stays put
    other = (P[..., 0] - P[..., 2] > 16).astype(np.uint8)
    other = cv2.dilate(other, np.ones((11, 11), np.uint8))
    V = cv2.dilate(H0, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (45, 45)))
    V[:CABLE_TIP_Y - 24, :] = 0
    V[PLATE_BOTTOM + 8:, :] = 0
    # protect slings: pixels warm but far from the diya silhouette are not part of the layer
    near = cv2.dilate(H0, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))
    V = V & (1 - (other & (1 - near)))
    # sky model by normalised convolution over sky-like pixels only (multi-scale)
    lum = P.mean(2)
    K = ((P[..., 0] - P[..., 2] < 8) & (lum > 175)).astype(np.float32)
    K *= (1 - cv2.dilate(H0, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (37, 37)))).astype(np.float32)
    K *= (1 - other.astype(np.float32))
    K[PLATE_BOTTOM - 4:700, 238:306] = 0          # keep workers out of the sky model
    sky = np.zeros_like(P); done = np.zeros(P.shape[:2], bool)
    for sg in (10, 22, 45, 90):
        num = cv2.GaussianBlur(P * K[..., None], (0, 0), sg)
        den = cv2.GaussianBlur(K, (0, 0), sg)
        ok = (den > 0.06) & ~done
        sky[ok] = num[ok] / den[ok][:, None]
        done |= ok
    Vs = cv2.GaussianBlur(V.astype(np.float32), (0, 0), 3)[..., None]
    S = P * (1 - Vs) + sky * Vs
    S[:CABLE_TIP_Y, CABLE_X[0]:CABLE_X[1]] = P[:CABLE_TIP_Y, CABLE_X[0]:CABLE_X[1]]
    Vf = (Vs > 0.004)
    R = (P - S)
    core = cv2.erode(H0, np.ones((3, 3), np.uint8)).astype(np.float32)
    core = cv2.GaussianBlur(core, (0, 0), 0.7)
    return dict(S=S, R=R.astype(np.float32), core=core, H0=H0, V=V)


def build_workers(P):
    """Foreground figures that stay in front of the descending plate (poster pixels, soft mask)."""
    H, W = P.shape[:2]
    w = np.zeros((H, W), np.uint8)
    # worker 1: head/helmet/shoulders over the plate
    head = np.zeros((H, W), np.uint8)
    cv2.fillPoly(head, [np.array([(250, 686), (252, 681), (255, 679.5), (258, 681), (260, 686),
                                  (262, 690), (263, 694.5), (243, 694.5), (244, 690)], np.float32).round().astype(np.int32)], 1)
    w |= head
    lum = P.mean(2)
    sat = P.max(2) - P.min(2)
    sky = (lum > 205) & (sat < 40)
    sub = np.zeros((H, W), bool)
    # worker 1 body (below the plate edge) and worker 2 (+ joined arms)
    sub[694:738, 238:266] = True
    sub[694:738, 266:304] = True
    sub[736:, :] = False
    ns = sub & ~sky
    ns = cv2.morphologyEx(ns.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8))
    # helmet of worker 2 (light grey, close to sky luminance)
    hel = np.zeros((H, W), np.uint8)
    cv2.ellipse(hel, (288, 698), (5, 4), 0, 0, 360, 1, -1)
    w = (w | ns | hel).astype(np.uint8)
    w = fill_holes(w) | w
    wf = cv2.GaussianBlur(w.astype(np.float32), (0, 0), 0.6)
    return np.clip(wf, 0, 1)


def build_light_mask(P):
    """Warm, bright pixels of the golden installation (static lotus + platform lights)."""
    H, W = P.shape[:2]
    region = np.zeros((H, W), np.float32)
    cv2.fillPoly(region, [np.array([(0, 560), (150, 520), (330, 470), (480, 600), (590, 760), (590, 1000), (0, 1000)], np.int32)], 1)
    region = cv2.GaussianBlur(region, (0, 0), 6)
    return region


def build_all():
    P = load()
    B, text = build_text(P)
    d = build_diya(P)
    # rope extension tile: signed difference of the twin cable against interpolated sky
    cx0, cx1 = CABLE_X
    ta, tb = CABLE_TILE
    rows = np.arange(ta, tb)
    left = P[ta:tb, cx0 - 1:cx0 + 2].mean(1)
    right = P[ta:tb, cx1 - 2:cx1 + 1].mean(1)
    t = np.linspace(0, 1, cx1 - cx0)[None, :, None]
    sky = left[:, None, :] * (1 - t) + right[:, None, :] * t
    Dcab = (P[ta:tb, cx0:cx1] - sky).astype(np.float32)
    return dict(P=P, B=B, text=text, logo=build_logo(P), diya=d, workers=build_workers(P),
                light_region=build_light_mask(P), cable=Dcab)


if __name__ == "__main__":
    import time; t0 = time.time()
    a = build_all()
    print("built", time.time() - t0)
