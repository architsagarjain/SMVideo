"""Builds the final ad: re-paced video (same time map as the audio), re-voiced dialogue, ducked music bed,
burned-in Hinglish subtitles and a Shaadi Mangalam end card.
Usage: python3 build_ad.py IN.mp4 DIALOGUE.wav END_SCREEN_9x16.mp4 MUSIC.mp3 OUT.mp4"""
import sys, os, subprocess
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont
from timemap import SEGS, new_t
IN, DIA, END, MUS, OUT = sys.argv[1:6]
W, H, FPS = 1920, 1080, 30
HERE = os.path.dirname(os.path.abspath(__file__)); FONT = os.path.join(HERE, "..", "fonts", "Poppins-SemiBold.ttf")
GOLD = (244, 207, 140)
# (source start, source end or None = use the re-voiced placement end in output seconds, text)
SUBS = [(1.38, 3.72, "Arre Neha, *biodata* aaya hai tumhare liye!"), (3.98, 6.00, "Family achhi honi chahiye, values bhi match honi chahiye."),
        (6.05, 7.85, "Career stable hona chahiye, location bhi dekh lena."), (7.95, 9.55, "Aur education, family background..."),
        (9.74, 11.12, "*Kundli* bhi milwa lena, bas!"), (14.22, 16.40, "Meri shaadi hai ya family ka group project?"),
        (16.73, 19.66, "*Shaadi Mangalam* pe verified profiles dekho, apni preferences ke hisaab se."),
        (20.08, 23.04, "Aur pasand aaye toh shortlist karo, voice ya video call pe baat bhi karo."),
        (24.26, 26.28, "Achha, *kundli* matching bhi hai?"), (26.66, 30.02, "Haan dadi! Ab profile se lekar *kundli* matching tak, sab ek hi jagah.")]
FOOT = new_t(30.16); END_S, XF = 5.0, .5; TOTAL = FOOT - XF + END_S
# --- video: piecewise speed, frames blended up to 30 fps
tmp = OUT + ".v.mp4"; fc = []; ins = []
for i, (a, b, sp) in enumerate(SEGS):
    fc.append(f"[0:v]trim={a}:{b},setpts=(PTS-STARTPTS)/{sp}[s{i}]"); ins.append(f"[s{i}]")
fc.append(f"{''.join(ins)}concat=n={len(SEGS)}:v=1:a=0,framerate=fps={FPS}:interp_start=0:interp_end=255:scene=8[v]")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", IN, "-filter_complex", ";".join(fc), "-map", "[v]", "-c:v", "libx264", "-crf", "12", "-preset", "fast", "-pix_fmt", "yuv420p", tmp], check=True)
# --- captions
f = ImageFont.truetype(FONT, 44)
def caption(text):
    parts = []; bold = False
    for k, chunk in enumerate(text.split("*")): parts.append((chunk, k % 2 == 1))
    words = [(w, g) for chunk, g in parts for w in chunk.split(" ") if w]
    d0 = ImageDraw.Draw(Image.new("L", (4, 4))); sp = d0.textlength(" ", font=f); lines = [[]]; wcur = 0
    for w, g in words:
        ww = d0.textlength(w, font=f)
        if wcur + ww > 1400 and lines[-1]: lines.append([]); wcur = 0
        lines[-1].append((w, g, ww)); wcur += ww + sp
    lh = 62; im = Image.new("RGBA", (W, lh * len(lines) + 40), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    for li, ln in enumerate(lines):
        tw = sum(x[2] for x in ln) + sp * (len(ln) - 1); x = W / 2 - tw / 2; y = 20 + li * lh
        for w, g, ww in ln:
            d.text((x, y), w, font=f, fill=GOLD + (255,) if g else (255, 255, 255, 255), stroke_width=3, stroke_fill=(0, 0, 0, 200)); x += ww + sp
    a = np.asarray(im, np.float32) / 255; sh = cv2.GaussianBlur(a[..., 3], (0, 0), 6)
    return a, sh
CAPS = [(caption(t), new_t(a) - .05, new_t(b) + .35) for a, b, t in SUBS]
# re-voiced lines can run a little past the original span: hold their captions to the end of the take
CAPS[4] = (CAPS[4][0], CAPS[4][1], new_t(11.12) + .9); CAPS[9] = (CAPS[9][0], CAPS[9][1], FOOT - .1)
endf = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", END, "-vf", "scale=608:1080", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True).stdout, np.uint8).reshape(-1, 1080, 608, 3)
bgsrc = cv2.resize(endf[-1], (W, int(W * 1080 / 608)))[(int(W * 1080 / 608) - H) // 2:][:H].astype(np.float32)
BG = cv2.GaussianBlur(bgsrc, (0, 0), 40) * .9 + 25
src = subprocess.Popen(["ffmpeg", "-v", "error", "-i", tmp, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
tmpv = OUT + ".v2.mp4"
enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-crf", "16", "-preset", "slow",
                        "-pix_fmt", "yuv420p", tmpv], stdin=subprocess.PIPE)
last = None
for n in range(int(round(TOTAL * FPS))):
    t = n / FPS
    if t < FOOT:
        buf = src.stdout.read(W * H * 3)
        if len(buf) == W * H * 3: last = np.frombuffer(buf, np.uint8).reshape(H, W, 3).astype(np.float32)
        img = last.copy()
        for (a, sh), t0, t1 in CAPS:
            al = min(1, (t - t0) / .15, (t1 - t) / .15)
            if al <= 0: continue
            h = a.shape[0]; y0 = H - 70 - h; reg = img[y0:y0 + h]
            reg *= (1 - .5 * sh * al)[..., None]; m = a[..., 3:4] * al; img[y0:y0 + h] = reg * (1 - m) + a[..., :3] * 255 * m
    if t >= FOOT - XF:
        e = BG.copy(); k = min(int((t - (FOOT - XF)) * FPS), len(endf) - 1); x0 = (W - 608) // 2
        e[:, x0:x0 + 608] = endf[k]; p = min(1, (t - (FOOT - XF)) / XF)
        img = e if t >= FOOT else img * (1 - p) + e * p
    enc.stdin.write(np.clip(img, 0, 255).astype(np.uint8).tobytes())
enc.stdin.close(); enc.wait(); src.kill()
# --- audio: dialogue + music bed ducked under speech, music up on the end card
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmpv, "-i", DIA, "-ss", "4.97", "-i", MUS, "-filter_complex",
                f"[1:a]apad=whole_dur={TOTAL:.3f},asplit=2[d][sc];[2:a]atrim=0:{TOTAL:.3f},volume=0.33,afade=t=in:d=1,afade=t=out:st={TOTAL - 1.8:.3f}:d=1.8[m];"
                f"[m][sc]sidechaincompress=threshold=0.02:ratio=8:attack=20:release=400[md];[d][md]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[a]",
                "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-t", f"{TOTAL:.3f}", "-movflags", "+faststart", OUT], check=True)
os.remove(tmp); os.remove(tmpv); print("wrote", OUT, round(TOTAL, 2))
