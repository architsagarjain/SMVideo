"""Splits the poster into a clean sky plate (text removed) and a text-pixel mask."""
import cv2, numpy as np
import os
S = os.environ.get('DIWALI_TMP', '/tmp/') 
im = cv2.imread('source.webp')            # BGR
H, W = im.shape[:2]
f = im.astype(np.float32)
B, G, R = f[...,0], f[...,1], f[...,2]
lum = 0.114*B + 0.587*G + 0.299*R

reg = np.zeros((H, W), bool); reg[40:545, 270:870] = True
navy = reg & (lum < 175) & (B > R + 3)
gold = reg & ((R - B) > 28) & (R > 110)
txt = (navy | gold).astype(np.uint8)
np.save(S+'txt.npy', txt)
big = cv2.dilate(txt, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (41, 41)))
# smooth polynomial model of the sky glow, fitted on the pixels around the text
y0, y1, x0, x1 = 20, 575, 230, 920
ys, xs = np.mgrid[y0:y1, x0:x1]
u = (xs - (x0+x1)/2)/((x1-x0)/2); v = (ys - (y0+y1)/2)/((y1-y0)/2)
deg = 6
terms = [(i, j) for i in range(deg+1) for j in range(deg+1-i)]
A = np.stack([u**i * v**j for i, j in terms], -1).reshape(-1, len(terms))
ok = (big[y0:y1, x0:x1] == 0).reshape(-1)
# ignore the top-left cloud edge and bottom crane area influences by robust refit
fit = np.zeros((y1-y0, x1-x0, 3), np.float32)
for c in range(3):
    t = f[y0:y1, x0:x1, c].reshape(-1)
    sel = ok.copy()
    for _ in range(3):
        coef, *_ = np.linalg.lstsq(A[sel], t[sel], rcond=None)
        r = np.abs(A @ coef - t)
        sel = ok & (r < 10)
    fit[..., c] = (A @ coef).reshape(y1-y0, x1-x0)
base = f.copy(); base[y0:y1, x0:x1] = fit
fm = cv2.GaussianBlur(big.astype(np.float32), (0,0), 5)[..., None]
clean = np.clip(f*(1-fm) + base*fm, 0, 255).astype(np.uint8)
cv2.imwrite('clean_plate.png', clean)
cv2.imwrite(S+'clean.png', clean)
cv2.imwrite(S+'clean_crop.png', clean[30:560, 250:900])
