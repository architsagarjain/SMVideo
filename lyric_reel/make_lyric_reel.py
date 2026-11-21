"""Lyric reel in the style of the reference: hard cuts on the song's phrases, small hand-lettered lyric captions that fade in and
drift, a handwritten CTA on the last shot, then the animated 'Your Forever Starts Here' end screen.
Usage: python3 make_lyric_reel.py CLIP_DIR REF_AUDIO.wav END_SCREEN.mp4 OUT.mp4"""
import sys, os, subprocess, math
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont
CLIPS, AUD, END, OUT = sys.argv[1:5]
W, H, FPS = 1080, 1920, 30
FONT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "fonts", "IndieFlower-Regular.ttf")
# (start, end, clip, source start, speed) — cut points follow the song's phrases (same as the reference edit)
SHOTS = [(0.000, 2.533, "n4", 18.70, .9), (2.533, 5.233, "n1", 17.90, 1.0), (5.233, 6.600, "n2", 27.36, 1.0),
         (6.600, 7.967, "n2", 36.84, 1.0), (7.967, 10.367, "n5", 5.30, 1.0), (10.367, 11.733, "n5", 21.30, 1.0),
         (11.733, 13.533, "n5", 29.40, 1.0), (13.533, 16.100, "n6", 0.40, .9)]
# (text, show from, hide at, centre y)
LYRICS = [("TUM ADAT BANO HUMARI", 0.25, 2.533, 330), ("HUM BIGAD JAYENGE", 2.85, 5.233, 330), ("TUM AANKHON SE BATANA", 5.55, 7.967, 330),
          ("HUM SAMAJH JAYENGE", 8.25, 10.367, 330), ("TUM HALKI SI", 10.6, 11.733, 330), ("SHARMANA", 11.95, 13.533, 330),
          ("HUM TERE HO JAYENGE", 13.75, 16.2, 330)]
CTA = ("find yours on shaadimangalam.com", 14.45, 16.2, 430)
FOOT = 16.1; XF = .45; TOTAL = FOOT - XF + 7.5
rng = np.random.default_rng(4)
def clamp(x): return min(max(x, 0.0), 1.0)
def smooth(x): x = clamp(x); return x * x * (3 - 2 * x)

def lettering(text, size, track, seed):
    """Hand-lettered line: each glyph gets a small random baseline jitter and tilt, like the reference captions."""
    f = ImageFont.truetype(FONT, size); r = np.random.default_rng(seed); glyphs = []; x = 0
    for c in text:
        adv = f.getlength(c)
        if c != " ":
            l, t, rr, b = f.getbbox(c); im = Image.new("L", (rr - l + 16, b - t + 16), 0); ImageDraw.Draw(im).text((8 - l, 8 - t), c, font=f, fill=255)
            im = im.rotate(float(r.uniform(-7, 7)), resample=Image.BICUBIC, expand=True)
            glyphs.append((np.asarray(im, np.float32) / 255, x + l - 8, t - 8 + float(r.uniform(-3, 3))))
        x += adv + track
    width = x - track; hgt = max(g.shape[0] + y for g, _, y in glyphs) + 6
    canvas = np.zeros((int(hgt) + 10, int(width) + 30), np.float32)
    for g, gx, gy in glyphs:
        gx, gy = int(gx) + 10, int(gy) + 5; h, w = g.shape; canvas[gy:gy + h, gx:gx + w] = np.maximum(canvas[gy:gy + h, gx:gx + w], g)
    return canvas
LYR = [(lettering(t, 56, 11, i), a, b, y) for i, (t, a, b, y) in enumerate(LYRICS)]
CTA_M = lettering(CTA[0], 50, 2, 99)
def paste(img, m, cx, cy, a):
    h, w = m.shape; x0, y0 = int(cx - w / 2), int(cy - h / 2)
    sh = np.clip(cv2.GaussianBlur(m, (0, 0), 7) * 1.6, 0, 1) * .55 * a; img[y0:y0 + h, x0:x0 + w] *= (1 - sh)[..., None]
    mm = m[..., None] * a; img[y0:y0 + h, x0:x0 + w] = img[y0:y0 + h, x0:x0 + w] * (1 - mm) + 255 * mm

def load(clip, t0, dur, speed):
    p = os.path.join(CLIPS, clip + ".mp4")
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t0:.3f}", "-t", f"{dur * speed + .2:.3f}", "-i", p, "-vf",
                          f"setpts=PTS/{speed},fps={FPS},scale={W}:{H}:flags=lanczos", "-an", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)
frames = {i: load(c, s, e - a, sp) for i, (a, e, c, s, sp) in enumerate(SHOTS)}
endf = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", END, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True).stdout, np.uint8).reshape(-1, H, W, 3)

# audio: reference song, extended on the beat by repeating its last 8-beat line (it repeats every 5.39 s)
import wave
w = wave.open(AUD); sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), '<i2').reshape(-1, 2).astype(np.float32)
L, S = 5.39, 15.50; xf = int(.04 * sr)
def seg(a, b): return x[int(a * sr):int(b * sr)].copy()
parts = [seg(0, S), seg(S - L, S), seg(S - L, S)]
out = parts[0]
for p in parts[1:]:
    fo = np.linspace(1, 0, xf)[:, None]; p[:xf] = out[-xf:] * fo + p[:xf] * (1 - fo); out = np.vstack([out[:-xf], p])
n = int(TOTAL * sr); out = out[:n]; fl = int(1.8 * sr); out[-fl:] *= np.linspace(1, 0, fl)[:, None] ** 1.5
tmpa = OUT + ".wav"; ww = wave.open(tmpa, "wb"); ww.setnchannels(2); ww.setsampwidth(2); ww.setframerate(sr); ww.writeframes(np.clip(out, -32768, 32767).astype('<i2').tobytes()); ww.close()

enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-i", tmpa,
                        "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p", "-profile:v", "high",
                        "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", "-metadata", "title=Shaadi Mangalam lyric reel", OUT], stdin=subprocess.PIPE)
for k in range(int(round(TOTAL * FPS))):
    t = k / FPS
    def foot(t):
        i = max(j for j, s in enumerate(SHOTS) if t >= s[0] - 1e-6); fr = frames[i]; img = fr[min(int(round((t - SHOTS[i][0]) * FPS)), len(fr) - 1)].astype(np.float32)
        for m, a, b, cy in LYR:
            if a <= t < b: paste(img, m, 540, cy + 8 * (t - a) / (b - a), smooth((t - a) / .35))
        if CTA[1] <= t:
            a = smooth((t - CTA[1]) / .4); paste(img, CTA_M, 540, CTA[3] + (1 - a) * 12, a)
            u = smooth((t - CTA[1] - .25) / .6); w2 = CTA_M.shape[1] * .86 * u        # hand-drawn underline draws on
            if w2 > 2:
                xs = np.linspace(540 - CTA_M.shape[1] * .43, 540 - CTA_M.shape[1] * .43 + w2, 60); ys = CTA[3] + 40 + 4 * np.sin(xs / 37)
                cv2.polylines(img, [np.stack([xs, ys], 1).astype(np.int32)], False, (255, 255, 255), 3, cv2.LINE_AA)
        return img
    if t < FOOT - XF: img = foot(t)
    else:
        e = endf[min(int(round((t - (FOOT - XF)) * FPS)), len(endf) - 1)].astype(np.float32); p = (t - (FOOT - XF)) / XF
        img = e if p >= 1 else foot(min(t, FOOT - 1 / FPS)) * (1 - p) + e * p
    enc.stdin.write(np.clip(img, 0, 255).astype(np.uint8).tobytes())
enc.stdin.close(); enc.wait(); os.remove(tmpa); print("wrote", OUT, round(TOTAL, 2), "s")
