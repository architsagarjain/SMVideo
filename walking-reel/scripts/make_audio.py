"""Sound design + final audio mix.

Everything here is synthesised from scratch (no samples), so there are no
licensing questions: soft whooshes for card entrances, quiet UI ticks/pops when
numbers or chips land, a few key clicks for the comment field, and a very quiet
ambient pad (F major, 84 BPM) ducked under the voice.

The voice is left natural (it is already clean): high-pass at 70 Hz only.
The final mix is loudness-normalised to -14 LUFS / -1.5 dBTP with ffmpeg.

Usage: python3 scripts/make_audio.py <source video> <out.wav> [--no-music]
"""
import json, os, subprocess, sys
import numpy as np
from scipy import signal

SR = 48000
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src, out = sys.argv[1], sys.argv[2]
MUSIC = "--no-music" not in sys.argv
rng = np.random.default_rng(7)


def db(x):
    return 10 ** (x / 20)


def t_axis(d):
    return np.arange(int(d * SR)) / SR


# --------------------------------------------------------------------------
# SFX synthesis (all mono, peak-normalised to 1.0; gains applied when placed)
# --------------------------------------------------------------------------
def whoosh(d=0.5, lo=350, hi=2200, peak_at=0.55):
    n = int(d * SR)
    noise = rng.standard_normal(n + 2048)
    f, tt, Z = signal.stft(noise, SR, nperseg=1024, noverlap=768)
    pos = np.clip(tt / d, 0, 1)
    # centre frequency sweeps up then settles (log domain), broad gaussian band
    up = np.clip(pos / peak_at, 0, 1)
    down = np.clip((pos - peak_at) / (1 - peak_at), 0, 1)
    logc = np.log(lo) + (np.log(hi) - np.log(lo)) * np.sin(up * np.pi / 2) - 0.6 * (np.log(hi) - np.log(lo)) * down
    lf = np.log(np.maximum(f, 1))[:, None]
    mask = np.exp(-0.5 * ((lf - logc[None, :]) / 0.75) ** 2)
    _, y = signal.istft(Z * mask, SR, nperseg=1024, noverlap=768)
    y = y[:n]
    tt = t_axis(d)
    env = np.where(tt < peak_at * d, np.sin(np.pi / 2 * tt / (peak_at * d)) ** 2,
                   np.cos(np.pi / 2 * np.clip((tt - peak_at * d) / ((1 - peak_at) * d), 0, 1)) ** 2)
    y = y * env
    return y / np.abs(y).max()


def tick(freq=1900, d=0.06):
    tt = t_axis(d)
    y = np.sin(2 * np.pi * freq * tt) * np.exp(-tt / 0.011) + 0.25 * np.sin(2 * np.pi * freq * 2.01 * tt) * np.exp(-tt / 0.006)
    y *= np.minimum(1, tt / 0.0008)
    return y / np.abs(y).max()


def pop(f0=880, f1=520, d=0.09):
    tt = t_axis(d)
    freq = f1 + (f0 - f1) * np.exp(-tt / 0.018)
    y = np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-tt / 0.028)
    y *= np.minimum(1, tt / 0.001)
    return y / np.abs(y).max()


def thud(d=0.22):
    tt = t_axis(d)
    freq = 85 + 70 * np.exp(-tt / 0.03)
    body = np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-tt / 0.06)
    click = rng.standard_normal(len(tt)) * np.exp(-tt / 0.0025)
    b, a = signal.butter(2, [1500, 6000], btype="band", fs=SR)
    y = body + 0.35 * signal.lfilter(b, a, click)
    y *= np.minimum(1, tt / 0.0008)
    return y / np.abs(y).max()


def key(d=0.05):
    tt = t_axis(d)
    n = rng.standard_normal(len(tt)) * np.exp(-tt / 0.004)
    b, a = signal.butter(2, [1800, 7000], btype="band", fs=SR)
    y = signal.lfilter(b, a, n) + 0.5 * np.sin(2 * np.pi * 320 * tt) * np.exp(-tt / 0.01)
    return y / np.abs(y).max()


def swell(d=0.9):
    n = int(d * SR)
    y = rng.standard_normal(n)
    b, a = signal.butter(2, [120, 700], btype="band", fs=SR)
    y = signal.lfilter(b, a, y)
    tt = t_axis(d)
    env = np.sin(np.pi * np.clip(tt / d, 0, 1)) ** 1.5 * np.clip(tt / (0.7 * d), 0, 1)
    y *= env
    return y / np.abs(y).max()


def swipe(d=0.16):
    return whoosh(d, lo=1500, hi=6000, peak_at=0.4)


SFX = {
    "whoosh": whoosh(0.5),
    "whoosh_s": whoosh(0.32, lo=600, hi=3000, peak_at=0.5),
    "tick": tick(),
    "tick_hi": tick(2400, 0.05),
    "pop": pop(),
    "thud": thud(),
    "key": key(),
    "swell": swell(),
    "swipe": swipe(),
}

# (time s, sound, gain dB, pan -1..1). Times match the graphics in src/graphics.
CUES = [
    # card entrances
    (0.98, "whoosh", -27, -0.2), (13.24, "whoosh", -27, 0.2), (25.16, "whoosh", -27, -0.2),
    (35.56, "whoosh", -27, 0.2), (41.05, "whoosh", -26, 0), (54.1, "whoosh", -27, -0.2),
    (58.55, "whoosh", -27, 0.2), (62.86, "whoosh", -27, 0),
    # card state changes
    (2.96, "whoosh_s", -31, 0.25), (5.06, "whoosh_s", -32, -0.2), (14.16, "whoosh_s", -29, 0),
    (15.84, "whoosh_s", -31, 0.2), (29.53, "whoosh_s", -32, -0.2), (65.02, "whoosh_s", -30, 0.2),
    # numbers landing / chips
    (3.14, "tick", -30, 0.1), (7.04, "tick", -30, 0.1), (8.32, "pop", -29, 0),
    (18.24, "tick", -30, 0.15), (29.84, "tick", -30, -0.1), (33.44, "thud", -27, 0.15),
    (39.46, "thud", -26, 0.1), (48.3, "tick_hi", -31, -0.2), (51.0, "tick_hi", -31, 0.2),
    (54.42, "tick", -30, -0.1), (56.48, "tick", -30, 0.15), (61.5, "tick_hi", -33, 0),
    # bottle strike, walking reveal
    (13.74, "swipe", -30, 0.1),
    # camera moves (barely there)
    (9.1, "swell", -33, 0), (40.75, "swell", -32, 0),
    # comment field: typing + send
    (65.34, "key", -31, 0.05), (65.53, "key", -32, 0.05), (65.72, "key", -31, 0.05), (65.91, "key", -32, 0.05),
    (66.25, "pop", -31, 0.2),
]
# pedometer LCD counting up (very quiet)
CUES += [(35.76 + i * 0.075, "tick_hi", -40, -0.3) for i in range(11)]
# week dots lighting up
CUES += [(64.05 + i * 0.09, "tick_hi", -38 + i * 0.3, -0.45 + i * 0.15) for i in range(7)]


# --------------------------------------------------------------------------
# Voice
# --------------------------------------------------------------------------
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", src, "-vn", "-ac", "2", "-ar", str(SR),
                      "-af", "highpass=f=70", "-f", "f32le", "-"], capture_output=True, check=True).stdout
voice = np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).astype(np.float64)
N = len(voice)
mix = voice.copy()

sfx_bus = np.zeros((N, 2))
for t0, name, g, pan in CUES:
    s = SFX[name] * db(g)
    i0 = int(t0 * SR)
    i1 = min(N, i0 + len(s))
    if i0 >= N:
        continue
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    sfx_bus[i0:i1, 0] += s[: i1 - i0] * l * np.sqrt(2)
    sfx_bus[i0:i1, 1] += s[: i1 - i0] * r * np.sqrt(2)
mix += sfx_bus


# --------------------------------------------------------------------------
# Music bed: soft pad + sparse plucks, F major, 84 BPM
# --------------------------------------------------------------------------
def midi(m):
    return 440 * 2 ** ((m - 69) / 12)


if MUSIC:
    bpm = 84
    bar = 4 * 60 / bpm
    chords = [[53, 57, 60, 64], [57, 60, 64, 67], [50, 57, 60, 65], [46, 53, 57, 62]]  # Fmaj7 Am7 Dm7 Bbmaj7
    roots = [41, 45, 38, 46 - 12]
    music = np.zeros((N, 2))
    total = N / SR
    k = 0
    while k * bar < total + bar:
        start = k * bar
        notes = chords[k % 4]
        d = bar + 1.2
        tt = t_axis(d)
        env = np.minimum(1, tt / 0.9) * np.where(tt > bar, np.cos(np.pi / 2 * np.clip((tt - bar) / 1.2, 0, 1)) ** 2, 1)
        pad = np.zeros((len(tt), 2))
        for j, m in enumerate(notes):
            for c, det in ((0, -4), (1, 4)):
                f = midi(m) * 2 ** (det / 1200)
                ph = rng.uniform(0, 2 * np.pi)
                pad[:, c] += np.sin(2 * np.pi * f * tt + ph) + 0.18 * np.sin(4 * np.pi * f * tt + ph)
        bass = np.sin(2 * np.pi * midi(roots[k % 4]) * tt) * 0.9
        pad = pad * 0.2 + bass[:, None] * 0.1
        pad *= env[:, None]
        # sparse plucks on the off-beats, an octave up
        for b8 in range(8):
            if b8 % 2 == 0 and b8 not in (2, 6):
                continue
            m = notes[(b8 * 3 + k) % 4] + 12
            p0 = int(b8 * bar / 8 * SR)
            pt = t_axis(0.6)
            pl = (np.sin(2 * np.pi * midi(m) * pt) + 0.3 * np.sin(4 * np.pi * midi(m) * pt)) * np.exp(-pt / 0.18) * np.minimum(1, pt / 0.004)
            pan = 0.3 if b8 % 4 == 1 else -0.3
            seg = pad[p0:p0 + len(pl)]
            seg[:, 0] += pl[: len(seg)] * 0.12 * (1 - pan)
            seg[:, 1] += pl[: len(seg)] * 0.12 * (1 + pan)
        i0 = int(start * SR)
        i1 = min(N, i0 + len(pad))
        if i0 < N:
            music[i0:i1] += pad[: i1 - i0]
        k += 1
    b, a = signal.butter(2, 3800, btype="low", fs=SR)
    music = signal.lfilter(b, a, music, axis=0)
    # simple stereo echo for space
    dly = int(bar / 8 * 3 * SR)
    echo = np.zeros_like(music)
    echo[dly:] = music[:-dly] * 0.22
    echo[dly:, [0, 1]] = echo[dly:, [1, 0]]
    music += echo
    # fades
    tt = np.arange(N) / SR
    music *= (np.minimum(1, tt / 1.5) * np.clip((total - tt) / 1.2, 0, 1))[:, None]
    # duck under the voice (smoothed voice envelope)
    env = np.abs(voice).mean(axis=1)
    win = int(0.25 * SR)
    env = np.convolve(env, np.ones(win) / win, mode="same")
    speaking = np.clip(env / (np.percentile(env, 70) + 1e-9), 0, 1)
    duck = db(-5 * speaking)
    music *= duck[:, None]
    # level: about 21 dB under the voice (RMS)
    vr = np.sqrt((voice ** 2).mean())
    mr = np.sqrt((music ** 2).mean())
    music *= vr / mr * db(-21)
    mix += music

if "--stems" in sys.argv:
    np.save(out.replace(".wav", "_stems.npy"), np.stack([voice.mean(1), sfx_bus.mean(1), music.mean(1) if MUSIC else np.zeros(N)]).astype(np.float32))

wav = out.replace(".wav", "_premaster.wav")
mix = np.clip(mix * 0.5, -1, 1)  # 6 dB of headroom in the premaster
import wave
with wave.open(wav, "wb") as w:
    w.setnchannels(2); w.setsampwidth(3); w.setframerate(SR)
    pcm = (mix * (2 ** 23 - 1)).astype(np.int32)
    w.writeframes(np.frombuffer(pcm.astype('<i4').tobytes(), dtype=np.uint8).reshape(-1, 4)[:, :3].tobytes())

# loudness: linear gain to -14 LUFS, then a transparent peak limiter at -1.5 dBFS
meas = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", wav, "-af",
                       "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                      capture_output=True, text=True).stderr
j = json.loads(meas[meas.rindex("{"):meas.rindex("}") + 1])
gain = -13.6 - float(j["input_i"])  # the limiter takes back ~0.4 LU
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", wav, "-af",
                f"volume={gain:.2f}dB,alimiter=limit=0.80:attack=2:release=80:level=disabled:asc=1",
                "-ar", str(SR), "-c:a", "pcm_s24le", out], check=True)
print("wrote", out, f"| premaster {j['input_i']} LUFS, gain {gain:+.2f} dB")
