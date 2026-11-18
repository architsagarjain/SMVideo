"""Splits poster.webp (resized to 1080x1350) into a clean background plus one RGBA layer per element.
Writes layers/*.png. usage: python3 layers.py"""
import os, numpy as np, cv2
HERE = os.path.dirname(os.path.abspath(__file__))
W, H = 1080, 1350
img = cv2.resize(cv2.imread(os.path.join(HERE, "poster.webp")), (W, H), interpolation=cv2.INTER_LANCZOS4)
k = W / 1122
# (name, box in original poster coordinates, colour filter, difference threshold); later entries win
BOXES = [
    ("logo", (312, 58, 808, 188), None, 34),
    ("portrait", (418, 182, 700, 398), "warm", 14),     # fine gold line drawing of Guru Nanak Dev Ji
    ("lines", (325, 432, 445, 452), None, 30),
    ("lines", (675, 432, 795, 452), None, 30),
    ("happy", (455, 395, 668, 475), "navy", 34),
    ("title", (215, 472, 920, 560), "orange", 34),
    ("arrows", (365, 583, 520, 605), None, 30),
    ("arrows", (600, 583, 755, 605), None, 30),
    ("khanda", (515, 562, 605, 632), None, 30),
    ("body", (345, 630, 780, 708), "navy", 34),
]
NAMES = list(dict.fromkeys(b[0] for b in BOXES))
bg_est = cv2.medianBlur(img, 45)
diff = np.abs(img.astype(np.int16) - bg_est.astype(np.int16)).max(2)
Bc, Rc = img[:, :, 0].astype(np.int16), img[:, :, 2].astype(np.int16)
owner = np.full((H, W), -1, np.int16)
for name, b, col, thr in BOXES:
    x0, y0, x1, y1 = [int(round(v * k)) for v in b]
    region = diff[y0:y1, x0:x1] > thr
    if col == "orange": region &= (Rc - Bc)[y0:y1, x0:x1] > 40
    if col == "navy": region &= (Bc - Rc)[y0:y1, x0:x1] > 15
    if col == "warm": region &= (Rc - Bc)[y0:y1, x0:x1] > 25
    o = owner[y0:y1, x0:x1]; o[region] = NAMES.index(name)
os.makedirs(os.path.join(HERE, "layers"), exist_ok=True)
full = np.zeros((H, W), np.uint8)
for i, name in enumerate(NAMES):
    m = (owner == i).astype(np.uint8) * 255
    if name == "logo":  # hexagon and name plate are filled with white: take whole solid shapes
        c = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((17, 17), np.uint8))
        cs, _ = cv2.findContours(c, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        m = np.zeros_like(m); cv2.drawContours(m, cs, -1, 255, -1)
    m = cv2.dilate(m, np.ones((5, 5), np.uint8))
    full |= m
    cv2.imwrite(os.path.join(HERE, "layers", f"{name}.png"), np.dstack([img, cv2.GaussianBlur(m, (3, 3), 0)]))
clean = cv2.inpaint(img, cv2.dilate(full, np.ones((5, 5), np.uint8)), 9, cv2.INPAINT_TELEA)
cv2.imwrite(os.path.join(HERE, "layers", "background.png"), clean)
cv2.imwrite(os.path.join(HERE, "layers", "poster_1080.png"), img)
print("ok")
