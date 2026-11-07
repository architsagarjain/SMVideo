"""Overlays the 'Kaleshi Fufaji' chat card on the dancing video, with a pop-in animation, and adds the music hook.
Usage: python3 make_fufaji.py VIDEO.mp4 CARD.png SONG.wav OUT.mp4"""
import sys, subprocess, math
import numpy as np, cv2
VID, CARD, SONG, OUT = sys.argv[1:5]
W, H, FPS = 1080, 1920, 24
SONG_FROM = 54.55                     # "Mauja hi mauja" chorus in the song
CARD_Y = 40                           # top of the card, above the dancers' faces
def ease_out_back(x, c1=1.7):
    x = min(max(x, 0.0), 1.0); c3 = c1 + 1; return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2

card = cv2.imread(CARD, cv2.IMREAD_UNCHANGED).astype(np.float32)
card = cv2.cvtColor(card, cv2.COLOR_BGRA2RGBA); ch, cw = card.shape[:2]
pad = 40; shadow = np.zeros((ch + 2 * pad, cw + 2 * pad), np.float32); shadow[pad:pad + ch, pad:pad + cw] = card[..., 3] / 255
shadow = cv2.GaussianBlur(shadow, (0, 0), 14)

dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", VID], capture_output=True, text=True).stdout)
src = subprocess.Popen(["ffmpeg", "-v", "error", "-i", VID, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                        "-ss", str(SONG_FROM), "-t", f"{dur:.3f}", "-i", SONG,
                        "-filter_complex", f"[1:a]afade=t=in:d=0.05,afade=t=out:st={dur - .7:.3f}:d=0.7,loudnorm=I=-14:TP=-1.5:LRA=11[a]",
                        "-map", "0:v", "-map", "[a]", "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p", "-profile:v", "high",
                        "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-shortest", "-movflags", "+faststart", OUT], stdin=subprocess.PIPE)
n = 0
while True:
    buf = src.stdout.read(W * H * 3)
    if len(buf) < W * H * 3: break
    img = np.frombuffer(buf, np.uint8).reshape(H, W, 3).astype(np.float32); t = n / FPS
    p = (t - .25) / .45                                                     # pop in at 0.25 s
    if p > 0:
        s = .55 + .45 * ease_out_back(p); a = min(1.0, p * 3); dy = (1 - min(1.0, p)) * -40
        wob = math.sin(max(0.0, t - .25) * 18) * math.exp(-max(0.0, t - .25) * 5) * 2.2   # small settle wobble (degrees)
        cx, cy = W / 2, CARD_Y + ch / 2 + dy
        M = cv2.getRotationMatrix2D((cw / 2, ch / 2), wob, s); M[0, 2] += cx - cw / 2; M[1, 2] += cy - ch / 2
        layer = cv2.warpAffine(card, M, (W, H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_CONSTANT)
        Ms = cv2.getRotationMatrix2D(((cw + 2 * pad) / 2, (ch + 2 * pad) / 2), wob, s); Ms[0, 2] += cx - (cw + 2 * pad) / 2; Ms[1, 2] += cy - (ch + 2 * pad) / 2 + 10
        sh = cv2.warpAffine(shadow, Ms, (W, H), flags=cv2.INTER_LINEAR)
        img *= (1 - .45 * sh * a)[..., None]
        al = layer[..., 3:4] / 255 * a; img = img * (1 - al) + layer[..., :3] * al
    enc.stdin.write(np.clip(img, 0, 255).astype(np.uint8).tobytes()); n += 1
enc.stdin.close(); enc.wait(); src.wait(); print("frames", n, "->", OUT)
