#!/usr/bin/env python3
"""Synthesised sound design for the ad (no samples, nothing to license):
soft whooshes on the beat cuts, a low thud on the "Ab nahi" stamp, a "sent" pop,
two phone-vibration buzzes on the incoming call, and a light chime on the CTA button.
Usage: make_sfx.py out.wav total_seconds"""
import sys, wave
import numpy as np

SR = 48000
out, total = sys.argv[1], float(sys.argv[2])
mix = np.zeros((int(total * SR), 2))
rng = np.random.default_rng(11)

def place(sig, at, gain_db, pan=0.0):
    i = int(at * SR)
    sig = sig[: len(mix) - i] * 10 ** (gain_db / 20)
    mix[i:i + len(sig), 0] += sig * (1 - pan)
    mix[i:i + len(sig), 1] += sig * (1 + pan)

def whoosh(d=0.32):
    n = int(d * SR); t = np.arange(n) / SR
    noise = rng.normal(0, 1, n)
    # band-pass sweep: a one-pole low-pass whose cutoff rises then falls, minus its slower twin
    fc = 600 + 3800 * np.sin(np.pi * t / d) ** 2
    a = np.exp(-2 * np.pi * fc / SR)
    lp, y = 0.0, np.zeros(n)
    for k in range(n):
        lp = (1 - a[k]) * noise[k] + a[k] * lp
        y[k] = lp
    env = np.sin(np.pi * t / d) ** 2
    return y * env / (np.abs(y).max() + 1e-9)

def thud():
    n = int(0.5 * SR); t = np.arange(n) / SR
    f = 95 * np.exp(-t * 6) + 45
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9) + 0.15 * rng.normal(0, 1, n) * np.exp(-t * 60)

def pop():
    n = int(0.12 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * (700 * t + 2600 * t * t)) * np.exp(-t * 45)

def buzz(d=0.45):
    n = int(d * SR); t = np.arange(n) / SR
    return np.sign(np.sin(2 * np.pi * 150 * t)) * 0.4 * (np.sin(np.pi * t / d)) * (0.6 + 0.4 * np.sin(2 * np.pi * 22 * t))

def chime():
    n = int(1.2 * SR); t = np.arange(n) / SR
    return sum(np.sin(2 * np.pi * f * t) * np.exp(-t * dcy) * g for f, dcy, g in [(1318.5, 4, 0.6), (1975.5, 5, 0.35), (2637, 7, 0.2)])

for at in [3.17, 4.4, 6.65, 9.22, 12.1, 16.32, 18.2, 22.25, 24.8]:
    place(whoosh(), at - 0.16, -24, pan=rng.uniform(-0.3, 0.3))
place(thud(), 3.17, -12)
place(pop(), 16.95, -16)
for at in [22.45, 23.25]:
    place(buzz(), at, -28)
place(chime(), 26.66, -20)  # first pulse of the CTA button

peak = np.abs(mix).max()
pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
with wave.open(out, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print("sfx peak %.2f" % peak)
