"""Sound design + final audio mix (v3).

- Voice: left natural (already clean), 70 Hz high-pass.
- Music: "Digital Lemonade" by Kevin MacLeod (incompetech.com), CC BY 4.0.
  Two sections, each starting on a downbeat: the first puts a downbeat on the
  cut to the walking clip (13.84 s); it tape-stops into a record scratch at the
  freeze (39.44 s) and the second section drops back in at 40.74 s. Ducked
  under the voice, lifted a little under the full-screen cutaways.
- Effects (all synthesised): whooshes, cut impacts, UI ticks, footsteps synced
  to the walking clip, a pill rattle, record scratch, stamps, key clicks.
- Master: linear gain to -14 LUFS, transparent limiter at -1.5 dBFS.

Usage: python3 scripts/make_audio.py <source video> <out.wav> [--no-music] [--stems]
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


def footstep(d=0.22):
    tt = t_axis(d)
    body = np.sin(2 * np.pi * np.cumsum(70 + 60 * np.exp(-tt / 0.02)) / SR) * np.exp(-tt / 0.035)
    n = rng.standard_normal(len(tt))
    b, a = signal.butter(2, [350, 2600], btype="band", fs=SR)
    scuff = signal.lfilter(b, a, n) * np.exp(-tt / 0.045) * np.minimum(1, tt / 0.006)
    b2, a2 = signal.butter(2, [2500, 8000], btype="band", fs=SR)
    click = signal.lfilter(b2, a2, n) * np.exp(-tt / 0.004)
    y = 0.9 * body + 0.55 * scuff + 0.25 * click
    return y / np.abs(y).max()


def rattle(d=1.1, n_hits=70):
    """Pills tumbling: many tiny plastic ticks, thinning out."""
    y = np.zeros(int(d * SR))
    times = np.sort(rng.beta(1.2, 2.2, n_hits) * (d - 0.06))
    for t0 in times:
        f = rng.uniform(2200, 5200)
        tt = t_axis(0.03)
        hit = np.sin(2 * np.pi * f * tt) * np.exp(-tt / 0.004) * rng.uniform(0.3, 1.0)
        i = int(t0 * SR)
        y[i:i + len(hit)] += hit[: len(y) - i]
    return y / np.abs(y).max()


def impact(d=0.6):
    """Cut accent: short sub thump + air."""
    tt = t_axis(d)
    sub = np.sin(2 * np.pi * np.cumsum(48 + 70 * np.exp(-tt / 0.05)) / SR) * np.exp(-tt / 0.18)
    air = whoosh(d, lo=900, hi=5000, peak_at=0.08)
    y = sub + 0.45 * air[: len(sub)]
    return y / np.abs(y).max()


def scratch(d=0.42):
    """Record scratch: a band-limited buzz whose pitch whips down, up, down."""
    tt = t_axis(d)
    rate = np.interp(tt, [0, 0.12, 0.2, 0.32, d], [1.0, -0.3, 0.9, -0.6, 0.0])
    ph = np.cumsum(rate) / SR
    saw = 2 * ((ph * 180) % 1) - 1
    n = rng.standard_normal(len(tt)) * np.abs(rate)
    b, a = signal.butter(2, [600, 5000], btype="band", fs=SR)
    y = signal.lfilter(b, a, 0.6 * saw * np.abs(rate) + 0.8 * n)
    y *= np.minimum(1, tt / 0.005) * np.clip((d - tt) / 0.05, 0, 1)
    return y / np.abs(y).max()


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
    "step": footstep(),
    "rattle": rattle(),
    "impact": impact(),
    "scratch": scratch(),
}

# (time s, sound, gain dB, pan -1..1). Times match src/graphics and src/timeline.ts.
CUES = [
    # card entrances
    (0.2, "whoosh", -27, -0.2), (13.24, "whoosh_s", -30, 0.2), (15.8, "whoosh", -28, 0.2), (26.26, "whoosh", -28, -0.2),
    (40.74, "whoosh", -25, 0), (58.6, "whoosh_s", -30, 0.2), (62.86, "whoosh", -27, 0),
    # card state changes
    (2.96, "whoosh_s", -31, 0.25), (5.06, "whoosh_s", -32, -0.2), (29.53, "whoosh_s", -32, -0.2),
    # numbers landing / chips / stamps
    (3.14, "tick", -30, 0.1), (7.04, "tick", -30, 0.1), (8.32, "pop", -29, 0),
    (18.24, "tick", -30, 0.15), (29.84, "tick", -30, -0.1), (33.44, "thud", -27, 0.15),
    (48.3, "tick_hi", -31, -0.2), (51.0, "tick_hi", -31, 0.2), (56.48, "tick", -32, 0.1), (61.5, "tick_hi", -33, 0),
    (13.74, "swipe", -30, 0.1),
    # hard cuts to full-screen clips, and back
    (13.84, "impact", -24, 0), (24.76, "impact", -25, 0), (37.56, "impact", -25, 0), (58.52, "impact", -25, 0),
    (26.3, "whoosh_s", -31, 0), (62.36, "whoosh_s", -31, 0),
    # footsteps synced to the walking clip
    (14.29, "step", -22, -0.15), (14.89, "step", -23, 0.15), (15.49, "step", -22, -0.15),
    # pill rain
    (9.14, "rattle", -26, 0), (9.1, "swell", -32, 0),
    # giant type behind her
    (23.16, "whoosh", -28, 0), (24.0, "swipe", -29, 0), (35.64, "whoosh", -28, 0),
    # myth-busted freeze
    (39.44, "scratch", -21, 0), (39.56, "thud", -23, 0.1),
    (55.85, "swell", -34, 0),
    # comment chip + typing 2026
    (65.05, "pop", -29, 0), (65.32, "key", -29, 0.05), (65.51, "key", -30, 0.05), (65.7, "key", -29, 0.05), (65.89, "key", -30, 0.05),
]
# 万歩計 characters landing
CUES += [(37.78 + i * 0.12, "tick", -33 - i, 0.2 * (i - 1)) for i in range(3)]
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
# Music: Digital Lemonade (Kevin MacLeod, CC BY 4.0), cut on downbeats
# --------------------------------------------------------------------------
MUSIC_FILE = os.path.join(ROOT, "music", "digital_lemonade_kevin_macleod.mp3")
BEAT = 60 / 123.05          # measured tempo
FIRST_DOWNBEAT = 0.0697     # first downbeat in the track (s)
FREEZE_AT, RESUME_AT = 39.44, 40.74
music = np.zeros((N, 2))
if MUSIC:
    mraw = subprocess.run(["ffmpeg", "-v", "error", "-i", MUSIC_FILE, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"],
                          capture_output=True, check=True).stdout
    track = np.frombuffer(mraw, dtype=np.float32).reshape(-1, 2).astype(np.float64)
    downbeat = lambda k: FIRST_DOWNBEAT + 4 * BEAT * k
    # section A: bar 22 of the track lands on the walking cut (13.84 s)
    off_a = downbeat(22) - 13.84
    # section B: bar 70 drops in when the split layout opens
    off_b = downbeat(70) - RESUME_AT

    def place(t0, t1, offset):
        i0, i1 = int(t0 * SR), min(N, int(t1 * SR))
        j0 = int((t0 + offset) * SR)
        music[i0:i1] = track[j0:j0 + (i1 - i0)]

    place(0, FREEZE_AT, off_a)
    place(RESUME_AT, N / SR, off_b)
    # tape-stop into the freeze: the last 0.35 s slows to a halt
    ts = int(0.35 * SR)
    i_end = int(FREEZE_AT * SR)
    seg_src = track[int((FREEZE_AT - 0.35 + off_a) * SR):]
    pos = np.cumsum(np.linspace(1.0, 0.0, ts))  # playback position, decelerating
    for c in range(2):
        music[i_end - ts:i_end, c] = np.interp(pos, np.arange(len(seg_src)), seg_src[:, c]) * np.linspace(1, 0.2, ts)
    tt = np.arange(N) / SR
    # fade in over the hook, fade out at the very end, soft attack on the drop-in
    fades = np.minimum(1, tt / 0.6) * np.clip((N / SR - tt) / 0.9, 0, 1)
    fades *= np.where(tt >= RESUME_AT, np.minimum(1, (tt - RESUME_AT) / 0.05 + 0.0), 1)
    music *= fades[:, None]
    # duck under the voice; lift under the full-screen cutaways
    env = np.abs(voice).mean(axis=1)
    win = int(0.2 * SR)
    env = np.convolve(env, np.ones(win) / win, mode="same")
    speaking = np.clip(env / (np.percentile(env, 70) + 1e-9), 0, 1)
    cut_lift = np.zeros(N)
    for a0, a1 in [(13.84, 15.78), (24.76, 26.3), (37.56, 39.44), (58.52, 62.36)]:
        cut_lift = np.maximum(cut_lift, np.clip(np.minimum((tt - a0) / 0.08, (a1 - tt) / 0.3), 0, 1))
    gain_db = -7 * speaking + 3.5 * cut_lift
    music *= db(gain_db)[:, None]
    # overall: about 15 dB under the voice
    vr = np.sqrt((voice ** 2).mean())
    mr = np.sqrt((music ** 2).mean())
    music *= vr / mr * db(-15)
    mix += music

if "--stems" in sys.argv:
    np.save(out.replace(".wav", "_stems.npy"), np.stack([voice.mean(1), sfx_bus.mean(1), music.mean(1)]).astype(np.float32))

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
