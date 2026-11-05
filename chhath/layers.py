"""Splits poster.webp (resized to 1080x1350) into a clean background plus one RGBA layer per text element.
Writes layers/*.png. usage: python3 layers.py"""
import os, numpy as np, cv2
HERE = os.path.dirname(os.path.abspath(__file__))
W, H = 1080, 1350
img = cv2.imread(os.path.join(HERE, "poster.webp"))
img = cv2.resize(img, (W, H), interpolation=cv2.INTER_LANCZOS4)
k = W / 1122
# element boxes in original poster coordinates (x0, y0, x1, y1); later entries win where boxes overlap
# element boxes in original poster coordinates (x0, y0, x1, y1) and an optional colour filter;
# later entries win where boxes overlap
BOXES = [
    ("logo", (330, 15, 790, 150), None),
    ("title", (305, 250, 820, 322), None),
    ("underline", (495, 322, 625, 342), None),
    ("body", (280, 345, 845, 452), None),
    ("sunicon", (430, 448, 700, 538), "orange"),
    ("chhath", (315, 540, 832, 702), "orange"),
    ("happy", (488, 522, 642, 568), "navy"),       # navy "Happy" overlaps the orange script and rays
    ("diya", (525, 640, 612, 694), None),           # bowl + flame, between the two swashes
    ("diya", (488, 693, 642, 726), None),           # waves
]
NAMES = list(dict.fromkeys(n for n, _, _ in BOXES))
bg_est = cv2.medianBlur(img, 45)
diff = np.abs(img.astype(np.int16) - bg_est.astype(np.int16)).max(2)
owner = np.full((H, W), -1, np.int16)
Bc, Rc = img[:, :, 0].astype(np.int16), img[:, :, 2].astype(np.int16)
for name, b, col in BOXES:
    x0, y0, x1, y1 = [int(round(v * k)) for v in b]
    region = diff[y0:y1, x0:x1] > 34
    if col == "orange": region &= (Rc - Bc)[y0:y1, x0:x1] > 40
    if col == "navy": region &= (Bc - Rc)[y0:y1, x0:x1] > 20
    o = owner[y0:y1, x0:x1]; o[region] = NAMES.index(name)
os.makedirs(os.path.join(HERE, "layers"), exist_ok=True)
full = np.zeros((H, W), np.uint8)
for i, name in enumerate(NAMES):
    m = (owner == i).astype(np.uint8) * 255
    if name == "logo":  # the hexagon and the name plate are filled with white: take whole solid shapes
        c = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((17, 17), np.uint8))
        cs, _ = cv2.findContours(c, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        m = np.zeros_like(m); cv2.drawContours(m, cs, -1, 255, -1)
    m = cv2.dilate(m, np.ones((5, 5), np.uint8))
    full |= m
    alpha = cv2.GaussianBlur(m, (3, 3), 0)
    rgba = np.dstack([img, alpha])
    cv2.imwrite(os.path.join(HERE, "layers", f"{name}.png"), rgba)
clean = cv2.inpaint(img, cv2.dilate(full, np.ones((5, 5), np.uint8)), 9, cv2.INPAINT_TELEA)
cv2.imwrite(os.path.join(HERE, "layers", "background.png"), clean)
cv2.imwrite(os.path.join(HERE, "layers", "poster_1080.png"), img)
print("ok")
