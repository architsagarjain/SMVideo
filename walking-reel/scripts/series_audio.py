"""Sound effects + mix for the Bhavika series reels (no music: she adds it in Instagram).

Everything is synthesised (no samples). Per-reel timing lives in
scripts/cues/<name>.py, which defines GFX, BEHIND, PANEL, BROLL and cues(cue, rng).
Master: -14 LUFS, peaks -1.5 dBFS.

Usage: python3 scripts/series_audio.py <name> <source video> <out.wav> [--stems]
"""
import importlib.util, json, os, subprocess, sys, wave
import numpy as np
from scipy import signal

SR = 48000
NAME, src, out = sys.argv[1], sys.argv[2], sys.argv[3]
ROOT = os.path.dirname(os.path.abspath(__file__))
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
# Voice (normalised to -18 dBFS RMS so effect gains are comparable between reels)
# ---------------------------------------------------------------------------
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", src, "-vn", "-ac", "2", "-ar", str(SR), "-af", "highpass=f=70",
                      "-f", "f32le", "-"], capture_output=True, check=True).stdout
voice = np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).astype(np.float64)

# Optional time map (scripts/make_timemap.py): keep the segments, join them with short
# fades, then speed the whole voice up with pitch preserved. Cue times stay in source
# seconds and are mapped with M().
TMP = os.path.join(os.path.dirname(ROOT), "src", NAME, "timemap.json")
TM = json.load(open(TMP)) if os.path.exists(TMP) else None


def M(t):
    if TM is None:
        return t
    for g in TM["segs"]:
        if t < g["s0"]:
            return g["o0"]
        if t <= g["s1"]:
            return g["o0"] + (t - g["s0"]) / TM["speed"]
    return TM["dur"]


if TM is not None:
    fade = int(0.006 * SR)
    ramp = np.linspace(0, 1, fade)[:, None]
    parts = []
    for g in TM["segs"]:
        seg = voice[int(round(g["s0"] * SR)):int(round(g["s1"] * SR))].copy()
        seg[:fade] *= ramp
        seg[-fade:] *= ramp[::-1]
        parts.append(seg)
    joined = np.concatenate(parts).astype(np.float32)
    sped = subprocess.run(["ffmpeg", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-",
                           "-af", f"rubberband=tempo={TM['speed']}:pitchq=quality:transients=mixed:window=standard",
                           "-f", "f32le", "-ar", str(SR), "-ac", "2", "-"], input=joined.tobytes(), capture_output=True, check=True).stdout
    voice = np.frombuffer(sped, dtype=np.float32).reshape(-1, 2).astype(np.float64)
    n_out = int(round(TM["frames"] / TM["fps"] * SR))
    voice = np.pad(voice, ((0, max(0, n_out - len(voice))), (0, 0)))[:n_out]
voice *= db(-18 - 20 * np.log10(np.sqrt((voice ** 2).mean()) + 1e-12))
N = len(voice)
DUR = N / SR
tt = np.arange(N) / SR


def put(buf, t0, y, g=1.0):
    i0 = int(t0 * SR)
    if i0 >= len(buf) or i0 < 0:
        return
    i1 = min(len(buf), i0 + len(y))
    buf[i0:i1] += y[: i1 - i0] * g



# ---------------------------------------------------------------------------
# Synths
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



def clank(d=0.7):
    """Dumbbell / metal clank: inharmonic partials with fast decay."""
    t_ = T(d)
    y = sum(np.sin(2 * np.pi * f * t_ + rng.uniform(0, 6)) * np.exp(-t_ / dec) * g
            for f, dec, g in ((420, 0.25, 1), (1130, 0.16, 0.7), (2270, 0.08, 0.5), (3610, 0.05, 0.35)))
    hit = rng.standard_normal(len(t_)) * np.exp(-t_ / 0.004)
    return norm(y + 0.4 * hit)


def beep(d=0.12, f=1000):
    t_ = T(d)
    return norm(np.sin(2 * np.pi * f * t_) * np.minimum(1, t_ / 0.004) * np.clip((d - t_) / 0.01, 0, 1))


def heartbeat():
    y = np.zeros(int(0.5 * SR))
    for t0, g in ((0, 1.0), (0.2, 0.7)):
        t_ = T(0.18)
        put(y, t0, np.sin(2 * np.pi * np.cumsum(55 + 40 * np.exp(-t_ / 0.02)) / SR) * np.exp(-t_ / 0.05) * g)
    return norm(y)


def tick_tock():
    y = np.zeros(int(0.7 * SR))
    put(y, 0, click(3200, 0.02))
    put(y, 0.35, click(2300, 0.02) * 0.8)
    return norm(y)


def sizzle(d=1.0):
    n = rng.standard_normal(int(d * SR))
    b, a = signal.butter(2, [3000, 11000], btype="band", fs=SR)
    crackle = np.zeros_like(n)
    for _ in range(int(d * 90)):
        put(crackle, rng.uniform(0, d - 0.01), rng.standard_normal(200) * np.exp(-np.arange(200) / 30) * rng.uniform(0.3, 1))
    t_ = T(d)
    env = np.minimum(1, t_ / 0.05) * np.clip((d - t_) / 0.3, 0, 1)
    return norm((signal.lfilter(b, a, n) * 0.5 + crackle) * env)


def drop(d=0.25):
    """Water droplet 'plip': rising sine blip."""
    t_ = T(d)
    f = 700 + 1500 * (1 - np.exp(-t_ / 0.02))
    return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t_ / 0.04) * np.minimum(1, t_ / 0.002))


def pearls(d=1.2, n=90):
    """Tapioca pearls pouring: dense tiny ticks thinning out."""
    y = np.zeros(int(d * SR))
    for t0 in np.sort(rng.beta(1.3, 2.4, n) * (d - 0.03)):
        put(y, t0, click(rng.uniform(3500, 7000), 0.012) * rng.uniform(0.2, 1))
    return norm(y)


def crunch(d=0.25):
    y = np.zeros(int(d * SR))
    for t0 in np.sort(rng.uniform(0, d * 0.6, 14)):
        b = rng.standard_normal(int(0.015 * SR)) * np.exp(-np.arange(int(0.015 * SR)) / 120)
        put(y, t0, b * rng.uniform(0.3, 1))
    bb, aa = signal.butter(2, [800, 6000], btype="band", fs=SR)
    return norm(signal.lfilter(bb, aa, y))


def clink(d=0.6):
    t_ = T(d)
    y = sum(np.sin(2 * np.pi * f * t_) * np.exp(-t_ / dec) * g for f, dec, g in ((2900, 0.12, 1), (4350, 0.08, 0.6), (6100, 0.05, 0.3)))
    return norm(y * np.minimum(1, t_ / 0.001))


def page(d=0.35):
    return whoosh(d, 1500, 7000, peak=0.3)


def key_(d=0.05):
    t_ = T(d)
    n = rng.standard_normal(len(t_)) * np.exp(-t_ / 0.004)
    b, a = signal.butter(2, [1800, 7000], btype="band", fs=SR)
    return norm(signal.lfilter(b, a, n) + 0.5 * np.sin(2 * np.pi * 320 * t_) * np.exp(-t_ / 0.01))


SFX = {"pop": pop_(), "pop_lo": pop_(700, 330, 0.1), "click": click(), "click_hi": click(3800, 0.02),
       "ding": ding(), "buzz": buzz(), "thump": thump(), "whoosh": whoosh(0.45), "boom": boom(), "boom_big": boom(2.0, 110, 32),
       "riser": riser(0.5), "rwhoosh": whoosh(0.5, reverse=True), "clank": clank(), "beep": beep(), "heartbeat": heartbeat(),
       "ticktock": tick_tock(), "sizzle": sizzle(), "drop": drop(), "pearls": pearls(), "crunch": crunch(), "clink": clink(),
       "page": page(), "key": key_()}
sfx = np.zeros(N)


def cue(t0, name, g, off=0.0):
    """t0 in source seconds; `off` is a fixed offset in output seconds (risers lead into a cut)."""
    y = chirp() if name == "chirp" else (chirp(0.45, 1900) if name == "chirp_big" else SFX[name])
    put(sfx, M(t0) + off, y, db(g))


# ---------------------------------------------------------------------------
# Per-reel cues
# ---------------------------------------------------------------------------
spec = importlib.util.spec_from_file_location("cues_mod", os.path.join(ROOT, "cues", f"{NAME}.py"))
C = importlib.util.module_from_spec(spec)
spec.loader.exec_module(C)

# shared transition language (same as Reel2)
for a0, a1 in C.GFX:
    cue(a0, "riser", -22, -0.5)
    cue(a0, "boom", -12)
    cue(a1, "rwhoosh", -22, -0.35)
    cue(a1, "boom_big", -13)
starts_handled = [a for a, _ in C.GFX]
for a0, a1 in C.BEHIND + ([C.PANEL] if C.PANEL else []) + [(b[0], b[1]) for b in C.BROLL]:
    if a0 < 0.05:
        cue(0, "boom", -15, 0.03)
    elif not any(abs(a0 - g) < 0.1 for g in [g1 for _, g1 in C.GFX] + starts_handled):
        cue(a0, "riser", -26, -0.3)
        cue(a0, "boom", -16)
for b in C.BROLL:  # whoosh out of a cutaway
    cue(b[1], "rwhoosh", -25, -0.3)
C.cues(cue, rng)

# ---------------------------------------------------------------------------
# Mix: voice + effects only
# ---------------------------------------------------------------------------
mix = voice + sfx[:, None]
if "--stems" in sys.argv:
    np.save(out.replace(".wav", "_stems.npy"), np.stack([voice.mean(1), sfx]).astype(np.float32))

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
