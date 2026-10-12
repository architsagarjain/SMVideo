"""Audio for the reference-style (v4) edit.

Modelled on the reference reel's soundtrack:
  * an original score in three acts that change with the edit: a dark
    bass-and-pad pulse (0-24.5 s), a light plucked arpeggio for the explainer
    middle (24.5-52.8 s) and warm chords for the ending; E minor, 112 BPM
  * every cut between the talking head and the graphics gets a riser into a
    deep sub boom
  * every scrambling label gets a short "data" chirp, every icon a pop, ticks
    and crosses a ding / buzz, dotted lines a tick run, the people grid a
    patter of clicks
  * effects and music sit close under the voice, as in the reference
Everything is synthesised here (no samples). Master: -14 LUFS, peaks -1.5 dBFS.

Usage: python3 scripts/make_audio_explainer.py <source video> <out.wav> [--stems]
"""
import json, subprocess, sys, wave
import numpy as np
from scipy import signal

SR = 48000
src, out = sys.argv[1], sys.argv[2]
rng = np.random.default_rng(11)


def db(x):
    return 10 ** (x / 20)


def T(d):
    return np.arange(int(d * SR)) / SR


def norm(y):
    return y / (np.abs(y).max() + 1e-12)


def midi(m):
    return 440 * 2 ** ((m - 69) / 12)


# ---------------------------------------------------------------------------
# Voice
# ---------------------------------------------------------------------------
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", src, "-vn", "-ac", "2", "-ar", str(SR), "-af", "highpass=f=70",
                      "-f", "f32le", "-"], capture_output=True, check=True).stdout
voice = np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).astype(np.float64)
N = len(voice)
DUR = N / SR

# ---------------------------------------------------------------------------
# Edit structure (keep in sync with src/explainer/timeline.ts)
# ---------------------------------------------------------------------------
GFX = [(4.14, 10.25), (15.0, 21.75), (24.55, 35.3), (36.72, 52.75), (55.55, 62.55)]
ACT_B, ACT_C = 24.55, 52.75
BPM = 112
BEAT = 60 / BPM

# ---------------------------------------------------------------------------
# Instruments
# ---------------------------------------------------------------------------
def pluck(f, d=1.2, bright=0.5, decay=0.996):
    """Karplus-Strong plucked string via an IIR comb (fast with lfilter)."""
    n = int(d * SR)
    L = max(2, int(round(SR / f)))
    exc = np.zeros(n)
    burst = rng.standard_normal(L)
    b0, a0 = signal.butter(1, 1500 + 6000 * bright, fs=SR)
    exc[:L] = signal.lfilter(b0, a0, burst)
    a = np.zeros(L + 2); a[0] = 1; a[L] = -0.5 * decay; a[L + 1] = -0.5 * decay
    y = signal.lfilter([1.0], a, exc)
    y *= np.exp(-T(d) / (d * 0.45))
    return norm(y)


def pad_note(f, d):
    tt = T(d)
    y = np.zeros(len(tt))
    for det in (-6, 0, 6):
        ff = f * 2 ** (det / 1200)
        y += np.sin(2 * np.pi * ff * tt + rng.uniform(0, 6)) + 0.3 * np.sin(4 * np.pi * ff * tt) + 0.12 * np.sin(6 * np.pi * ff * tt)
    env = np.minimum(1, tt / 0.35) * np.clip((d - tt) / 0.5, 0, 1)
    return y * env


def bass_note(f, d):
    tt = T(d)
    saw = 2 * ((f * tt) % 1) - 1
    b, a = signal.butter(2, 260, fs=SR)
    y = signal.lfilter(b, a, saw) * 1.2 + 0.6 * np.sin(2 * np.pi * f * tt)
    env = np.minimum(1, tt / 0.01) * np.exp(-tt / (d * 0.9))
    return y * env


def kick(d=0.35):
    tt = T(d)
    f = 45 + 110 * np.exp(-tt / 0.03)
    return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.12))


def hat(d=0.05):
    n = rng.standard_normal(int(d * SR))
    b, a = signal.butter(2, 7000, btype="high", fs=SR)
    return norm(signal.lfilter(b, a, n) * np.exp(-T(d) / 0.012))


def clap(d=0.18):
    n = rng.standard_normal(int(d * SR))
    b, a = signal.butter(2, [900, 4000], btype="band", fs=SR)
    tt = T(d)
    env = np.exp(-tt / 0.05) * (1 + 0.6 * np.sin(2 * np.pi * 90 * tt).clip(0))
    return norm(signal.lfilter(b, a, n) * env)


music = np.zeros(N)


def put(buf, t0, y, g=1.0):
    i0 = int(t0 * SR)
    if i0 >= len(buf) or i0 < 0:
        return
    i1 = min(len(buf), i0 + len(y))
    buf[i0:i1] += y[: i1 - i0] * g


# E minor progression, 2 bars each: Em - C - G - D
PROG = [(40, [52, 55, 59, 62, 66]), (36, [48, 52, 55, 59, 64]), (43, [50, 55, 59, 62, 67]), (38, [50, 54, 57, 62, 66])]
BAR = 4 * BEAT


def chord_at(k):
    return PROG[(k // 2) % 4]


# Act A: dark pulse (bass 8ths, pad, hats, soft kick)
k = 0
while k * BAR < ACT_B:
    t0 = k * BAR
    root, tones = chord_at(k)
    put(music, t0, pad_note(midi(tones[0]), BAR + 0.4) + pad_note(midi(tones[2]), BAR + 0.4) * 0.8 + pad_note(midi(tones[3]), BAR + 0.4) * 0.6 + pad_note(midi(tones[4] + 12), BAR + 0.4) * 0.5, 0.07)
    for e in range(8):
        tb = t0 + e * BEAT / 2
        if tb < ACT_B:
            put(music, tb, bass_note(midi(root - 12 + (12 if e % 4 == 3 else 0)), BEAT * 0.5), 0.10)
    for b in range(4):
        tb = t0 + b * BEAT
        if tb >= ACT_B:
            break
        if b in (0, 2) and k >= 2:
            put(music, tb, kick(), 0.16)
        put(music, tb + BEAT / 2, hat(), 0.07)
    k += 1

# Act B: plucked arpeggio (16ths), bass, kick + clap
k = 0
while ACT_B + k * BAR < ACT_C:
    t0 = ACT_B + k * BAR
    root, tones = chord_at(k)
    arp = tones + [x + 12 for x in tones[1:4]]
    pattern = [0, 2, 4, 6, 3, 5, 1, 4]
    for s in range(16):
        ts = t0 + s * BEAT / 4
        if ts >= ACT_C:
            break
        m = arp[pattern[s % 8]] + (12 if s in (6, 14) else 0)
        put(music, ts, pluck(midi(m), 0.9, bright=0.65 if s % 4 == 0 else 0.45), 0.2 if s % 4 == 0 else 0.13)
    put(music, t0, bass_note(midi(root - 12), BAR * 0.95), 0.09)
    for b in range(4):
        tb = t0 + b * BEAT
        if tb >= ACT_C:
            break
        if b in (0, 2):
            put(music, tb, kick(), 0.14)
        else:
            put(music, tb, clap(), 0.08)
        put(music, tb + BEAT / 2, hat(), 0.06)
    k += 1

# Act C: warm resolve (pad chords + slow plucks, no drums)
k = 0
while ACT_C + k * BAR < DUR + BAR:
    t0 = ACT_C + k * BAR
    root, tones = chord_at(k + 2)  # start on G for a lift
    put(music, t0, sum(pad_note(midi(x), BAR + 0.6) * w for x, w in zip(tones[:4], (1, 0.8, 0.7, 0.5))), 0.045)
    put(music, t0, bass_note(midi(root - 12), BAR * 0.95), 0.07)
    for e in range(8):
        te = t0 + e * BEAT / 2
        put(music, te, pluck(midi(tones[(e * 2) % 5] + 12), 1.2, bright=0.45), 0.12)
    k += 1

b, a = signal.butter(2, [45, 9000], btype='band', fs=SR)
music = signal.lfilter(b, a, music)
tt = np.arange(N) / SR
music *= np.minimum(1, tt / 0.4) * np.clip((DUR - tt) / 1.0, 0, 1)

# ---------------------------------------------------------------------------
# Sound effects
# ---------------------------------------------------------------------------
def whoosh(d=0.5, lo=300, hi=3000, peak=0.6, reverse=False):
    n = int(d * SR)
    f, ts, Z = signal.stft(rng.standard_normal(n + 2048), SR, nperseg=1024, noverlap=768)
    pos = np.clip(ts / d, 0, 1)
    logc = np.log(lo) + (np.log(hi) - np.log(lo)) * np.where(pos < peak, np.sin(np.pi / 2 * pos / peak), 1 - 0.5 * (pos - peak) / (1 - peak))
    mask = np.exp(-0.5 * ((np.log(np.maximum(f, 1))[:, None] - logc[None, :]) / 0.7) ** 2)
    _, y = signal.istft(Z * mask, SR, nperseg=1024, noverlap=768)
    y = y[:n]
    t_ = T(d)
    env = np.where(t_ < peak * d, (t_ / (peak * d)) ** 2, np.clip((d - t_) / ((1 - peak) * d), 0, 1) ** 1.5)
    y = norm(y * env)
    return y[::-1] if reverse else y


def riser(d=0.5):
    return whoosh(d, 400, 7000, peak=0.95)


def boom(d=1.6, f0=95, f1=36):
    t_ = T(d)
    f = f1 + (f0 - f1) * np.exp(-t_ / 0.12)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t_ / 0.55)
    y += 0.25 * whoosh(d, 80, 600, peak=0.02)[: len(y)]
    return norm(y)


def pop_(f0=1000, f1=500, d=0.08):
    t_ = T(d)
    f = f1 + (f0 - f1) * np.exp(-t_ / 0.015)
    return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t_ / 0.025) * np.minimum(1, t_ / 0.001))


def click(f=2600, d=0.03):
    t_ = T(d)
    return norm(np.sin(2 * np.pi * f * t_) * np.exp(-t_ / 0.005))


def chirp(d=0.32, base=2600):
    """'Data' sound under scrambling text: fast random square-wave beeps."""
    y = np.zeros(int(d * SR))
    step = 0.022
    for i in range(int(d / step)):
        f = base * rng.choice([1, 1.25, 1.5, 2, 2.5, 3])
        t_ = T(step * 0.8)
        sq = np.sign(np.sin(2 * np.pi * f * t_)) * 0.5
        put(y, i * step, sq * np.exp(-t_ / 0.012) * (1 - i * step / d * 0.6))
    b, a = signal.butter(2, [1200, 9000], btype="band", fs=SR)
    return norm(signal.lfilter(b, a, y))


def ding(d=0.6):
    t_ = T(d)
    y = sum(np.sin(2 * np.pi * f * t_) * np.exp(-t_ / dec) * g for f, dec, g in ((1318.5, 0.25, 1), (1975.5, 0.18, 0.5), (2637, 0.1, 0.3)))
    return norm(y * np.minimum(1, t_ / 0.002))


def buzz(d=0.22):
    t_ = T(d)
    y = np.sign(np.sin(2 * np.pi * 130 * t_)) * 0.6 + np.sin(2 * np.pi * 170 * t_)
    b, a = signal.butter(2, 1800, fs=SR)
    return norm(signal.lfilter(b, a, y) * np.exp(-t_ / 0.09))


def thump(d=0.3):
    t_ = T(d)
    f = 60 + 80 * np.exp(-t_ / 0.02)
    return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t_ / 0.08))


sfx = np.zeros(N)
SFX = {"pop": pop_(), "pop_lo": pop_(700, 330, 0.1), "click": click(), "click_hi": click(3800, 0.02), "chirp": None,
       "ding": ding(), "buzz": buzz(), "thump": thump(), "whoosh": whoosh(0.45), "boom": boom(), "boom_big": boom(2.0, 110, 32),
       "riser": riser(0.5), "rwhoosh": whoosh(0.5, reverse=True)}


def cue(t0, name, g):
    y = chirp() if name == "chirp" else (chirp(0.45, 1900) if name == "chirp_big" else SFX[name])
    put(sfx, t0, y, db(g))


# cuts: talking head -> graphics (riser into boom), graphics -> talking head (reverse whoosh + big boom)
for a0, a1 in GFX:
    cue(a0 - 0.5, "riser", -22)
    cue(a0, "boom", -12)
    cue(a1 - 0.35, "rwhoosh", -22)
    cue(a1, "boom_big", -13)

# icons popping in
for t0 in [4.2, 5.46, 6.5, 15.2, 24.88, 26.04, 27.16, 28.38, 33.3, 37.76, 38.06, 39.48, 56.48, 58.6, 59.0]:
    cue(t0, "pop", -21)
for t0 in [9.3, 9.48, 9.66]:  # ? boxes
    cue(t0, "pop_lo", -19)
for t0 in [15.55, 28.7]:
    cue(t0, "click", -26)
for i in range(7):  # week of barbells
    cue(31.68 + i * 0.1, "click", -27)

# scrambling labels: big stats get a deeper chirp + thump
big = [4.35, 7.04, 15.94, 18.24, 27.16, 29.84, 33.46, 36.76, 39.48, 48.38, 51.0, 56.48]
small = [4.5, 5.2, 7.3, 8.36, 9.5, 16.36, 19.4, 25.0, 30.4, 34.04, 37.0, 38.06, 41.4, 45.66, 49.2, 51.6, 55.6, 55.98, 57.62, 59.3, 60.8, 61.5]
for t0 in big:
    cue(t0, "chirp_big", -24)
    cue(t0, "thump", -20)
for t0 in small:
    cue(t0, "chirp", -30)

# ticks and crosses
for t0 in [8.15, 25.1]:
    cue(t0, "ding", -24)
cue(33.5, "buzz", -24)

# dotted lines draw as a short run of ticks
for t0 in [17.3, 25.66, 38.2, 39.4, 41.3, 58.85]:
    for j in range(6):
        cue(t0 + j * 0.06, "click_hi", -32)

# people grid filling in, then the 12% lighting up
for j in range(26):
    cue(17.2 + j * 0.03 + rng.uniform(0, 0.02), "click", -34)
for j in range(7):
    cue(18.24 + j * 0.08, "click_hi", -28)
# pedometer counting
for j in range(12):
    cue(38.26 + j * 0.06, "click_hi", -33)
# camera moves inside the graphics
for t0 in [9.0, 17.0, 28.1, 31.3, 40.75, 47.6, 58.3]:
    cue(t0, "whoosh", -27)

# ---------------------------------------------------------------------------
# Mix: music a little under the voice (louder in the graphics), effects on top
# ---------------------------------------------------------------------------
env = np.convolve(np.abs(voice).mean(1), np.ones(int(0.2 * SR)) / int(0.2 * SR), mode="same")
speaking = np.clip(env / (np.percentile(env, 70) + 1e-9), 0, 1)
in_gfx = np.zeros(N)
for a0, a1 in GFX:
    in_gfx = np.maximum(in_gfx, np.clip(np.minimum((tt - a0) / 0.1, (a1 - tt) / 0.1), 0, 1))
music *= db(-3 * speaking + 3 * in_gfx)
vr = np.sqrt((voice ** 2).mean())
music *= vr / np.sqrt((music ** 2).mean()) * db(-7)
mix = voice + (music + sfx)[:, None] * np.array([1.0, 1.0])

if "--stems" in sys.argv:
    np.save(out.replace(".wav", "_stems.npy"), np.stack([voice.mean(1), sfx, music]).astype(np.float32))

pre = out.replace(".wav", "_premaster.wav")
m = np.clip(mix * 0.5, -1, 1)
with wave.open(pre, "wb") as w:
    w.setnchannels(2); w.setsampwidth(3); w.setframerate(SR)
    pcm = (m * (2 ** 23 - 1)).astype("<i4")
    w.writeframes(np.frombuffer(pcm.tobytes(), dtype=np.uint8).reshape(-1, 4)[:, :3].tobytes())
meas = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", pre, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json",
                       "-f", "null", "-"], capture_output=True, text=True).stderr
j = json.loads(meas[meas.rindex("{"):meas.rindex("}") + 1])
gain = -13.6 - float(j["input_i"])
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", pre, "-af", f"volume={gain:.2f}dB,alimiter=limit=0.80:attack=2:release=80:level=disabled:asc=1",
                "-ar", str(SR), "-c:a", "pcm_s24le", out], check=True)
print("wrote", out, f"| premaster {j['input_i']} LUFS, gain {gain:+.2f} dB")
