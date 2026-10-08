"""Remove the burned-in pink word captions from the source footage.

Masked pixels are filled from nearby frames (aligned with ECC translation) where
those pixels were not covered by a word; anything left over is spatially inpainted.
Writes the cleaned caption region (ROI) of every frame as PNG; compose_clean.py pastes them back.
Usage: clean_captions.py in.mp4 out_roi_dir [range a b | frame numbers...]
"""
import cv2, numpy as np, sys, os, subprocess

X0, X1, Y0, Y1 = 100, 640, 760, 1020          # region that can contain the old captions
src, out = sys.argv[1], sys.argv[2]
only = [int(a) for a in sys.argv[3:] if a.isdigit()] if (len(sys.argv) > 3 and sys.argv[3] != 'range') else []
rng = (int(sys.argv[4]), int(sys.argv[5])) if len(sys.argv) > 3 and sys.argv[3] == 'range' else None

def pink_mask(roi):
    b, g, r = [roi[:, :, i].astype(np.int16) for i in range(3)]
    m = ((r > 170) & (b > 120) & (r - g > 40) & (b - g > 10)).astype(np.uint8) * 255
    # keep only blobs in the caption band (drops stray pinkish pixels elsewhere)
    m[:, :] = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8))
    return m

cap = cv2.VideoCapture(src)
frames = []
while True:
    ok, im = cap.read()
    if not ok: break
    frames.append(im[Y0:Y1, X0:X1].copy())
N = len(frames)
rois = frames
raw = [pink_mask(r) for r in rois]
K_OUT = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (11, 11))
masks = []
for i, m in enumerate(raw):
    if cv2.countNonZero(m) < 40:
        masks.append(np.zeros_like(m)); continue
    # the dark outline + anti-aliasing sits around the pink fill: grow the mask
    # and also close the holes inside letters (counters of O, A, %, 0 ...)
    d = cv2.dilate(m, K_OUT)
    # fill the small enclosed counters (inside O, A, 0, %) but keep the gaps between letters
    inv = 255 - d
    n, lab, st, _ = cv2.connectedComponentsWithStats(inv, connectivity=4)
    for j in range(1, n):
        x, y, w, h, a = st[j]
        if a < 400 and x > 0 and y > 0 and x + w < d.shape[1] and y + h < d.shape[0]:
            d[lab == j] = 255
    masks.append(d)
grays = [cv2.cvtColor(r, cv2.COLOR_BGR2GRAY).astype(np.float32) for r in rois]
crit = (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 40, 1e-4)
RING = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (21, 21))

def align(t, s, valid):
    warp = np.eye(2, 3, dtype=np.float32)
    try:
        _, warp = cv2.findTransformECC(grays[t], grays[s], warp, cv2.MOTION_TRANSLATION, crit, valid, 3)
    except cv2.error:
        return None
    return warp

os.makedirs(out, exist_ok=True)
todo = only if only else (range(*rng) if rng else range(N))
stats = {'temporal': 0, 'telea': 0}
for t in todo:
    need = masks[t] > 0
    if need.any():
        tgt = rois[t].copy()
        ys, xs = np.nonzero(need)
        # local window around the text for alignment + quality check
        wy0, wy1 = max(0, ys.min() - 40), min(need.shape[0], ys.max() + 40)
        wx0, wx1 = max(0, xs.min() - 60), min(need.shape[1], xs.max() + 60)
        ring = (cv2.dilate(masks[t], RING) > 0) & ~need
        remaining = need.copy()
        for k in sorted([k for k in range(-40, 41) if k], key=abs):
            s = t + k
            if s < 0 or s >= N: continue
            valid = ((masks[t] == 0) & (masks[s] == 0)).astype(np.uint8)
            vw = np.zeros_like(valid); vw[wy0:wy1, wx0:wx1] = valid[wy0:wy1, wx0:wx1]
            warp = align(t, s, vw)
            if warp is None or abs(warp[0, 2]) > 25 or abs(warp[1, 2]) > 25: continue
            ws = cv2.warpAffine(rois[s], warp, (rois[s].shape[1], rois[s].shape[0]), flags=cv2.INTER_LINEAR | cv2.WARP_INVERSE_MAP, borderMode=cv2.BORDER_REPLICATE)
            wm = cv2.warpAffine(masks[s], warp, (rois[s].shape[1], rois[s].shape[0]), flags=cv2.INTER_NEAREST | cv2.WARP_INVERSE_MAP, borderValue=255) > 0
            r = ring & ~wm
            if r.sum() < 50: continue
            bw = cv2.GaussianBlur(ws, (7, 7), 0); bt = cv2.GaussianBlur(tgt, (7, 7), 0)
            err = np.abs(bw[r].astype(np.int16) - bt[r].astype(np.int16)).mean()
            if err > 8: continue
            take = remaining & ~wm
            tgt[take] = ws[take]
            remaining &= ~take
            if not remaining.any(): break
        if remaining.any():
            tgt = cv2.inpaint(tgt, remaining.astype(np.uint8) * 255, 4, cv2.INPAINT_TELEA)
            stats['telea'] += 1
        else:
            stats['temporal'] += 1
        # soften the seam: blend the filled region in with a feathered alpha
        alpha = cv2.GaussianBlur(cv2.dilate(masks[t], np.ones((3, 3), np.uint8)).astype(np.float32) / 255, (7, 7), 0)[..., None]
        roi = (tgt * alpha + rois[t] * (1 - alpha)).astype(np.uint8)
    else:
        roi = rois[t]
    cv2.imwrite(os.path.join(out, f"{t:05d}.png"), roi, [cv2.IMWRITE_PNG_COMPRESSION, 1])
    if t % 200 == 0: print(t, stats, flush=True)
print(stats)
