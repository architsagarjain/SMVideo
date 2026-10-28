"""Original 10 s festive instrumental, synthesised in numpy (no samples, no third-party music).

Raga Yaman-flavoured, Sa = D, 96 bpm (16 beats = one teental cycle = 10.0 s):
tanpura drone, santoor melody, restrained tabla, bell chimes on the headline reveals,
a warm pad that swells during the lowering, and a resolved final Sa that rings out.
"""
import sys
import numpy as np
from scipy.io import wavfile
from scipy.signal import fftconvolve, butter, sosfilt

SR, DUR = 44100, 10.0
N = int(SR * DUR)
BEAT = 60 / 96
rng = np.random.default_rng(7)
SA = 146.83                     # D3


def hz(semi): return SA * 2 ** (semi / 12)


def env_exp(n, tau, attack=0.003):
    t = np.arange(n) / SR
    e = np.exp(-t / tau)
    a = int(attack * SR)
    e[:a] *= np.linspace(0, 1, a)
    return e


def add(buf, sig, t0, pan=0.0, gain=1.0):
    i = int(t0 * SR)
    if i >= N: return
    sig = sig[:N - i]
    l, r = np.sqrt(0.5 * (1 - pan)), np.sqrt(0.5 * (1 + pan))
    buf[0, i:i + len(sig)] += sig * gain * l
    buf[1, i:i + len(sig)] += sig * gain * r


def santoor(f, dur=1.6):
    n = int(SR * dur); t = np.arange(n) / SR
    s = np.zeros(n)
    for det in (-1.6, 0.0, 1.8):                     # 3 courses per note, slightly detuned
        ff = f * 2 ** (det / 1200)
        for k, (a, tau) in enumerate([(1, .9), (.55, .45), (.35, .28), (.2, .18), (.12, .12)], 1):
            s += a * np.sin(2 * np.pi * ff * k * (1 + 0.0004 * k * k) * t) * np.exp(-t / tau)
    click = rng.standard_normal(n) * np.exp(-t / 0.004) * 0.25
    return (s / 3 + click) * env_exp(n, 5, 0.001)


def bell(f, dur=3.0):
    n = int(SR * dur); t = np.arange(n) / SR
    s = np.zeros(n)
    for r, a, tau in [(1, 1, 1.6), (2.76, .5, 1.0), (5.40, .3, .6), (8.93, .15, .35)]:
        s += a * np.sin(2 * np.pi * f * r * t) * np.exp(-t / tau)
    return s * env_exp(n, 9, 0.002) * 0.5


def tanpura_pluck(f, dur=3.2):
    n = int(SR * dur); t = np.arange(n) / SR
    s = np.zeros(n)
    for k in range(1, 18):                           # bright jawari-like spectrum
        s += (1 / k ** 0.9) * np.sin(2 * np.pi * f * k * t + k * 0.3) * np.exp(-t / (2.4 / (1 + 0.12 * k)))
    return s * env_exp(n, 9, 0.01) * 0.28


def dayan(f=300, dur=0.3, gain=1.0):                 # tabla treble 'na'
    n = int(SR * dur); t = np.arange(n) / SR
    s = (np.sin(2 * np.pi * f * t) + .5 * np.sin(2 * np.pi * f * 2.3 * t)) * np.exp(-t / .07)
    return (s + rng.standard_normal(n) * np.exp(-t / .006) * .4) * gain * 0.5


def bayan(f0=110, dur=0.5):                          # bass 'ge' with pitch bend
    n = int(SR * dur); t = np.arange(n) / SR
    f = f0 * (1 + 0.55 * np.exp(-t / 0.08))
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t / .16) * 0.7


def pad(t0, t1, gain_curve):
    n = N; t = np.arange(n) / SR
    s = np.zeros(n)
    for semi in (0, 7, 12, 16):                      # Sa Pa Sa Ga: open, warm
        f = hz(semi)
        s += (np.sin(2 * np.pi * f * t) + .3 * np.sin(2 * np.pi * f * 2 * t) + .1 * np.sin(2 * np.pi * f * 3 * t)) * (0.25 if semi < 12 else 0.15)
    env = np.interp(t, *gain_curve)
    sos = butter(2, 1800, "low", fs=SR, output="sos")
    return sosfilt(sos, s) * env


def main(out):
    dry = np.zeros((2, N))
    wet = np.zeros((2, N))
    # tanpura cycle Pa Sa Sa Sa(low): one pluck every ~1.25 s
    for i, (semi, oct_) in enumerate([(7, -1), (0, 0), (0, 0), (0, -1)] * 2):
        add(dry, tanpura_pluck(hz(semi) * 2 ** oct_ * 0.5 if False else hz(semi + 12 * oct_)), i * 1.25 - 0.0 + 0.02, pan=(-0.25 if i % 2 else 0.25), gain=0.7)
    # warm pad swell during the lowering (1 s -> 8 s), gone by the ring-out
    p = pad(0, 10, ([0, 1, 4, 7, 8.6, 10], [0, .0, .5, 1.0, .75, 0.0]))
    dry[0] += p * 0.16; dry[1] += p * 0.16
    # santoor melody: (beat, semitone above Sa, octave up?, velocity). Yaman: 0 2 4 6 7 9 11
    mel = [
        (0, 7, .5), (1, 9, .5), (1.5, 11, .55), (2, 12, .7), (3, 11, .55), (3.5, 9, .5),          # bar 1  (0 - 2.5 s)
        (4, 7, .6), (5, 9, .6), (6, 11, .65), (6.5, 12, .65), (7, 14, .75),                       # bar 2  rising
        (8, 16, .85), (9, 14, .7), (9.5, 12, .7), (10, 11, .75), (10.5, 9, .65), (11, 7, .7),     # bar 3  celebratory peak
        (11.5, 6, .55), (12, 7, .75), (13, 4, .6), (13.5, 2, .55), (14, 0, .95),                   # bar 4  resolve to Sa
    ]
    for b, semi, v in mel:
        f = hz(semi + 12)
        add(dry, santoor(f), b * BEAT, pan=np.clip((semi - 7) / 30, -.5, .5), gain=0.5 * v * (0.75 + 0.5 * b / 15))
        add(wet, santoor(f), b * BEAT, pan=np.clip((semi - 7) / 30, -.5, .5), gain=0.35 * v)
    # soft double-time shimmer on the climb (santoor roll feel)
    for b in (7.75, 9.75):
        add(dry, santoor(hz(14 + 12)), b * BEAT, pan=.2, gain=.12)
    # restrained tabla: sparse teental-ish skeleton, enters after the first beat
    for b in range(2, 16):
        if b in (2, 6, 10, 14):   add(dry, dayan(320, gain=.55), b * BEAT, pan=.35, gain=.42)
        if b in (4, 8, 12):       add(dry, bayan(), b * BEAT, pan=-.3, gain=.32)
        if b in (9, 13, 15):      add(dry, dayan(380, .15, .6), (b + .5) * BEAT, pan=.35, gain=.2)
    # bell chimes on the HAPPY / DIWALI reveals (2.0 s, 2.4 s) and a tiny one on the tagline (4.0 s)
    for t0, semi, g in [(2.0, 19, .55), (2.4, 24, .45), (4.0, 28, .3)]:
        add(dry, bell(hz(semi)), t0, pan=.1, gain=g); add(wet, bell(hz(semi)), t0, pan=.1, gain=g * .8)
    # final resolution: Sa + Pa + Sa chord rings out from beat 14 (8.75 s)
    for semi, g in [(0, .9), (7, .55), (12, .7), (19, .35)]:
        add(dry, santoor(hz(semi + 12), 1.4), 14 * BEAT, pan=0, gain=.28 * g)
    add(wet, bell(hz(24), 1.3), 14 * BEAT, gain=.3)
    # reverb on the wet bus (synthetic exponential-noise impulse response)
    ir_n = int(SR * 1.8); t = np.arange(ir_n) / SR
    ir = np.stack([rng.standard_normal(ir_n) * np.exp(-t / .5) for _ in range(2)])
    ir[:, :int(.012 * SR)] *= np.linspace(0, 1, int(.012 * SR))
    rev = np.stack([fftconvolve(wet[c], ir[c])[:N] for c in range(2)])
    rev *= 0.06
    mix = dry + rev + 0.35 * np.stack([fftconvolve(dry[c], ir[c] * 0.6)[:N] for c in range(2)]) * 0.06
    # gentle master: fade in first 0.25 s, clean fade over the last 0.6 s, peak -> -3 dBFS
    t = np.arange(N) / SR
    mix *= np.clip(t / .25, 0, 1) * np.clip((DUR - t) / .6, 0, 1) ** 1.5
    mix *= 0.708 / np.abs(mix).max()
    wavfile.write(out, SR, (mix.T * 32767).astype(np.int16))


if __name__ == "__main__":
    main(sys.argv[1])
