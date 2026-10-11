"""Small numpy synthesis toolkit used to compose the IndiaBiomass score and
sound design. Everything is generated from scratch (no samples), so the music
is original and fully owned.
"""
import numpy as np
from pedalboard import (Pedalboard, Reverb, Delay, Compressor, LowpassFilter, HighpassFilter,
                        LadderFilter, Chorus, Distortion, Gain, Limiter)

SR = 48000
rng = np.random.default_rng(1234)


def n2f(n):
    """MIDI note -> Hz"""
    return 440.0 * 2 ** ((n - 69) / 12)


NOTE = {n: i for i, n in enumerate(['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'])}


def m(name):
    """'D3' -> MIDI number; supports sharps ('F#4') and flats ('Bb2')."""
    if name[1] == 'b':
        return NOTE[name[0]] - 1 + 12 * (int(name[2:]) + 1)
    if name[1] == '#':
        return NOTE[name[:2]] + 12 * (int(name[2:]) + 1)
    return NOTE[name[0]] + 12 * (int(name[1:]) + 1)


def tt(dur):
    return np.arange(int(dur * SR)) / SR


def adsr(n, a, d, s, r, sr=SR):
    """Envelope of n samples: attack, decay, sustain level, release (seconds)."""
    A, D, R = int(a * sr), int(d * sr), int(r * sr)
    S = max(0, n - A - D - R)
    env = np.concatenate([
        np.linspace(0, 1, A, endpoint=False) if A else np.zeros(0),
        np.linspace(1, s, D, endpoint=False) if D else np.zeros(0),
        np.full(S, s),
        np.linspace(s, 0, R) if R else np.zeros(0),
    ])
    if len(env) < n:
        env = np.pad(env, (0, n - len(env)))
    return env[:n]


def polyblep_saw(freq, n, phase0=0.0):
    """Band-limited sawtooth; freq may be a scalar or per-sample array."""
    f = np.broadcast_to(np.asarray(freq, dtype=np.float64), (n,))
    dt = f / SR
    ph = (phase0 + np.cumsum(dt)) % 1.0
    y = 2 * ph - 1
    m1 = ph < dt
    t = ph[m1] / dt[m1]
    y[m1] -= t + t - t * t - 1
    m2 = ph > 1 - dt
    t = (ph[m2] - 1) / dt[m2]
    y[m2] -= t * t + t + t + 1
    return y


def sine(freq, n, phase0=0.0):
    f = np.broadcast_to(np.asarray(freq, dtype=np.float64), (n,))
    return np.sin(2 * np.pi * (phase0 + np.cumsum(f) / SR))


def noise(n):
    return rng.standard_normal(n)


def fx(x, board):
    """Run a mono or stereo numpy signal through a pedalboard chain."""
    x2 = x if x.ndim == 2 else x[None, :]
    y = board(x2.astype(np.float32), SR)
    return y if x.ndim == 2 else y[0]


def lp(x, hz):
    return fx(x, Pedalboard([LowpassFilter(cutoff_frequency_hz=hz)]))


def hp(x, hz):
    return fx(x, Pedalboard([HighpassFilter(cutoff_frequency_hz=hz)]))


def bp(x, lo, hi):
    return lp(hp(x, lo), hi)


def sweep_filter(x, cutoffs, block=512, mode='lp', res=0.15):
    """Time-varying ladder filter; `cutoffs` is a function t(seconds)->Hz."""
    filt = LadderFilter(mode=LadderFilter.Mode.LPF24 if mode == 'lp' else LadderFilter.Mode.HPF24,
                        cutoff_hz=1000, resonance=res, drive=1.0)
    stereo = x.ndim == 2
    xs = x if stereo else x[None, :]
    out = np.zeros_like(xs, dtype=np.float32)
    for i in range(0, xs.shape[1], block):
        filt.cutoff_hz = float(np.clip(cutoffs((i + block / 2) / SR), 20, 20000))
        out[:, i:i + block] = filt.process(xs[:, i:i + block].astype(np.float32), SR, reset=(i == 0))
    return out if stereo else out[0]


def pan(x, p):
    """Equal-power pan, p in [-1, 1] -> stereo (2, n)."""
    a = (p + 1) * np.pi / 4
    return np.stack([x * np.cos(a), x * np.sin(a)])


def st(x):
    return x if x.ndim == 2 else np.stack([x, x]) * 0.7071


class Track:
    """A stereo buffer you can drop sounds into at absolute times."""

    def __init__(self, dur):
        self.buf = np.zeros((2, int(dur * SR) + SR), dtype=np.float64)

    def add(self, t, sig, gain=1.0):
        s = st(sig) * gain
        i = int(round(t * SR))
        if i < 0:
            s = s[:, -i:]
            i = 0
        j = min(self.buf.shape[1], i + s.shape[1])
        if j > i:
            self.buf[:, i:j] += s[:, :j - i]


# ---------------------------------------------------------------- instruments

def supersaw(notes, dur, voices=7, detune=0.18, a=0.8, r=1.2, s=1.0, bright=1.0):
    """Wide detuned pad. notes: list of MIDI numbers."""
    n = int(dur * SR)
    L = np.zeros(n); R = np.zeros(n)
    for note in notes:
        for v in range(voices):
            dv = (v - (voices - 1) / 2) / ((voices - 1) / 2)
            f = n2f(note) * 2 ** (dv * detune / 12)
            w = polyblep_saw(f, n, phase0=rng.random())
            p = dv * 0.8
            L += w * np.cos((p + 1) * np.pi / 4)
            R += w * np.sin((p + 1) * np.pi / 4)
    env = adsr(n, a, 0.2, s, r)
    out = np.stack([L, R]) * env / (voices * len(notes)) * 1.6
    return out


def pluck(note, dur=1.2, bright=1.0, decay=3.5, harm=14, inharm=0.0):
    """Additive pluck: upper harmonics decay faster (a natural filter envelope)."""
    t = tt(dur)
    f0 = n2f(note)
    y = np.zeros_like(t)
    for h in range(1, harm + 1):
        fh = f0 * h * (1 + inharm * h * h)
        if fh > SR / 2.2:
            break
        y += np.sin(2 * np.pi * fh * t + rng.random() * 6.28) * (bright ** (h - 1)) / h * np.exp(-t * decay * (0.6 + 0.4 * h))
    att = np.minimum(1, t / 0.003)
    return y * att * 0.5


def bell(note, dur=3.0):
    """Glassy FM-ish bell for the sonic signature."""
    t = tt(dur)
    f = n2f(note)
    mod = np.sin(2 * np.pi * f * 3.5 * t) * 1.8 * np.exp(-t * 3)
    y = np.sin(2 * np.pi * f * t + mod) * np.exp(-t * 1.4)
    y += 0.35 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 3.2)
    y += 0.2 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t * 6)
    return y * np.minimum(1, t / 0.002) * 0.45


def sub(note, dur, a=0.02, r=0.3, drive=0.0):
    n = int(dur * SR)
    y = sine(n2f(note), n) + 0.12 * sine(n2f(note) * 2, n)
    if drive:
        y = np.tanh(y * (1 + drive)) / np.tanh(1 + drive)
    return y * adsr(n, a, 0.05, 1.0, r)


def kick(punch=1.0, dur=0.6, f0=150, f1=44):
    t = tt(dur)
    f = f1 + (f0 - f1) * np.exp(-t * 28)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6.5)
    click = noise(len(t)) * np.exp(-t * 400) * 0.25
    y = np.tanh((y + click) * 1.6 * punch) * 0.9
    return y


def snare(dur=0.35, tone=190):
    t = tt(dur)
    nz = bp(noise(len(t)), 1200, 9000) * np.exp(-t * 18)
    tn = np.sin(2 * np.pi * tone * t) * np.exp(-t * 30)
    return (nz * 0.8 + tn * 0.6) * 0.8


def clap(dur=0.4):
    t = tt(dur)
    env = np.zeros_like(t)
    for k, d in enumerate([0, 0.011, 0.022]):
        i = int(d * SR)
        env[i:] += np.exp(-(t[: len(t) - i]) * (90 if k < 2 else 14))
    return bp(noise(len(t)), 900, 7000) * env * 0.6


def hat(open_=False, dur=None):
    dur = dur or (0.35 if open_ else 0.06)
    t = tt(dur)
    y = hp(noise(len(t)), 7500) * np.exp(-t * (9 if open_ else 70))
    return y * 0.35


def tom(note, dur=0.7):
    t = tt(dur)
    f = n2f(note) * (1 + 0.6 * np.exp(-t * 20))
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 5)
    y += lp(noise(len(t)), 2500) * np.exp(-t * 25) * 0.2
    return np.tanh(y * 1.4) * 0.8


def riser(dur, f0=200, f1=4000, noisy=0.7, tonal=0.3, curve=2.0):
    n = int(dur * SR)
    t = np.linspace(0, 1, n)
    nz = noise(n)
    y_n = sweep_filter(nz, lambda s: f0 * (f1 / f0) ** ((s / dur) ** curve), mode='lp', res=0.35)
    fr = 60 * 2 ** (t ** curve * 4)
    y_t = polyblep_saw(fr, n) * 0.3 + polyblep_saw(fr * 1.5, n) * 0.2
    y_t = lp(y_t, 3000)
    env = t ** 2.2
    return (y_n * noisy + y_t * tonal) * env


def reverse_swell(dur=1.2, hz=6000):
    """Reversed noise burst through reverb: the 'suck-in' before a hit."""
    n = int(dur * SR)
    t = tt(dur)
    burst = lp(noise(n), hz) * np.exp(-t * 3.0)
    wet = fx(np.stack([burst, burst]), Pedalboard([Reverb(room_size=0.9, wet_level=0.8, dry_level=0.4, width=1.0)]))
    return wet[:, ::-1] * 0.6


def impact(dur=4.0, weight=1.0):
    """Cinematic hit: sub drop + body + noise crack, with a big tail."""
    t = tt(dur)
    f = 30 + 55 * np.exp(-t * 7)
    subb = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.1) * 1.2
    body = np.sin(2 * np.pi * np.cumsum(90 + 120 * np.exp(-t * 18)) / SR) * np.exp(-t * 6) * 0.7
    crack = bp(noise(len(t)), 300, 9000) * np.exp(-t * 14) * 0.6
    y = np.tanh((subb + body) * 1.3 * weight) + crack
    tail = fx(np.stack([crack, crack]) * 0.7, Pedalboard([Reverb(room_size=0.95, damping=0.5, wet_level=0.9, dry_level=0.0, width=1.0)]))
    return st(y) + tail


def whoosh(dur=0.8, f0=300, f1=3000, peak=0.55, pan_from=-0.8, pan_to=0.8):
    n = int(dur * SR)
    t = np.linspace(0, 1, n)
    cut = lambda s: f0 * (f1 / f0) ** min(1, (s / dur) / peak) if (s / dur) < peak else f1 * (f0 / f1) ** (((s / dur) - peak) / (1 - peak))
    y = sweep_filter(noise(n), cut, mode='lp', res=0.25)
    env = np.where(t < peak, (t / peak) ** 2, ((1 - t) / (1 - peak)) ** 1.5)
    y = y * env
    p = pan_from + (pan_to - pan_from) * t
    a = (p + 1) * np.pi / 4
    return np.stack([y * np.cos(a), y * np.sin(a)]) * 0.9


def glitch(dur=0.25, seed=0):
    r = np.random.default_rng(seed)
    n = int(dur * SR)
    y = np.zeros(n)
    i = 0
    while i < n:
        seg = int(r.uniform(0.004, 0.03) * SR)
        kind = r.integers(0, 3)
        tseg = np.arange(seg) / SR
        if kind == 0:
            s = np.sign(np.sin(2 * np.pi * r.uniform(200, 3000) * tseg))
        elif kind == 1:
            s = r.standard_normal(seg)
        else:
            s = np.zeros(seg)
        y[i:i + seg] = s[: n - i] * r.uniform(0.2, 0.8)
        i += seg
    y = np.round(y * 6) / 6  # bit-crush
    return hp(y, 400) * 0.35


def tick(freq=3000, dur=0.03):
    t = tt(dur)
    return np.sin(2 * np.pi * freq * t) * np.exp(-t * 300) * 0.5


def blip(note=84, dur=0.12):
    t = tt(dur)
    return np.sin(2 * np.pi * n2f(note) * t) * np.exp(-t * 40) * 0.4


def shimmer(dur=3.0, density=40, lo=2000, hi=7000, seed=3):
    """Granular sparkles (particles)."""
    r = np.random.default_rng(seed)
    n = int(dur * SR)
    out = np.zeros((2, n))
    for _ in range(int(density * dur)):
        g = int(r.uniform(0.02, 0.09) * SR)
        i = r.integers(0, max(1, n - g))
        f = r.uniform(lo, hi)
        tg = np.arange(g) / SR
        s = np.sin(2 * np.pi * f * tg) * np.hanning(g) * r.uniform(0.05, 0.2)
        out[:, i:i + g] += pan(s, r.uniform(-0.9, 0.9))
    return out


def metal(note=60, dur=0.5, seed=0):
    """Inharmonic metallic clank (machinery)."""
    r = np.random.default_rng(seed)
    t = tt(dur)
    f = n2f(note)
    y = sum(np.sin(2 * np.pi * f * k * t + r.random() * 6) * np.exp(-t * (8 + 4 * k)) / k for k in [1, 2.41, 3.9, 5.43, 6.8])
    y += hp(noise(len(t)), 3000) * np.exp(-t * 80) * 0.4
    return y * 0.5
