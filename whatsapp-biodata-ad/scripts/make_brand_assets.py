#!/usr/bin/env python3
"""Keys the supplied logo (red artwork on white) to transparent PNGs:
  logo_red.png    - original colours, for cream backgrounds
  logo_cream.png  - same shapes in cream, for the maroon brand screens
  lotus_mark.png  - the lotus alone (no wordmark), for the faint background watermark
Shapes are untouched; only the white background is removed (alpha = ink density)."""
import sys
import numpy as np
from PIL import Image

src, out = sys.argv[1], sys.argv[2]
im = np.asarray(Image.open(src).convert("RGB")).astype(np.float32)
# Ink density from distance to white, using the channel where red ink differs most (green).
a = np.clip((255 - im[..., 1]) / (255 - 18), 0, 1)
a[a < 0.03] = 0
# Un-mix the colour from white: C = (I - (1-a)*255) / a
col = np.clip((im - (1 - a[..., None]) * 255) / np.maximum(a[..., None], 1e-3), 0, 255)
ys, xs = np.where(a > 0.05)
y0, y1, x0, x1 = ys.min() - 6, ys.max() + 7, xs.min() - 6, xs.max() + 7
def save(rgb, alpha, name, box=(x0, y0, x1, y1)):
    bx0, by0, bx1, by1 = box
    rgba = np.dstack([rgb, alpha * 255])[by0:by1, bx0:bx1].astype(np.uint8)
    Image.fromarray(rgba, "RGBA").save(f"{out}/{name}")
    print(name, bx1 - bx0, "x", by1 - by0)
save(col, a, "logo_red.png")
cream = np.zeros_like(col) + np.array([252, 240, 222], np.float32)
save(cream, a, "logo_cream.png")
# Lotus only: rows above the wordmark (find the first big gap in ink rows below the lotus).
rows = (a > 0.2).sum(1)
lotus_end = next(y for y in range(int(y0 + (y1 - y0) * 0.35), y1) if rows[y] == 0)
save(col, a, "lotus_mark.png", (x0, y0, x1, lotus_end + 4))
