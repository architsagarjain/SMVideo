"""Small synth toolkit for transition sound effects (whoosh, impact, shimmer, riser, bell, reverb)."""
import numpy as np
from scipy import signal
SR = 44100
rng = np.random.default_rng(11)
def tt(d): return np.arange(int(d * SR)) / SR
def mid2hz(m): return 440.0 * 2 ** ((m - 69) / 12)
def lp(x, fc, o=2): return signal.sosfilt(signal.butter(o, fc, 'low', fs=SR, output='sos'), x)
def hp(x, fc, o=2): return signal.sosfilt(signal.butter(o, fc, 'high', fs=SR, output='sos'), x)
def bp(x, lo, hi, o=1): return signal.sosfilt(signal.butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def stereo(m, pan=0.0):
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4); return np.stack([m * l, m * r], 1)
def place(buf, snd, t, g=1.0):
    i = int(t * SR); a, b = max(i, 0), min(i + len(snd), len(buf))
    if b > a: buf[a:b] += snd[a - i:b - i] * g
def whoosh(d=.5, up=True, vol=1.0):
    t = tt(d); n = rng.standard_normal(len(t)); out = np.zeros_like(n); blk = 512
    fc = (350 + 5200 * (t / d) ** 2) if up else (5600 - 5000 * (t / d) ** .7)
    for i in range(0, len(t), blk):
        c = min(max(fc[i], 200), 9000); out[i:i + blk] = bp(n[i:i + blk], c * .6, min(c * 1.5, 18000))
    return out * np.sin(np.pi * np.clip(t / d, 0, 1)) ** 1.8 * vol * 6
def impact(vol=1.0, d=1.6):
    t = tt(d); f = 32 + 90 * np.exp(-t * 12)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.6) + lp(rng.standard_normal(len(t)), 900) * np.exp(-t * 4) * .5) * vol
def bell(f, d=1.6, vol=1.0):
    t = tt(d); mod = np.sin(2 * np.pi * f * 3.5 * t) * 2.2 * np.exp(-t * 6)
    return (np.sin(2 * np.pi * f * t + mod) * np.exp(-t * 3.2) + .3 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t * 5)) * vol
def shimmer(vol=1.0): return sum(bell(mid2hz(m), 1.4, .4) for m in (93, 96, 100)) * vol
def riser(d, vol=1.0):
    t = tt(d); n = rng.standard_normal(len(t)); out = np.zeros_like(n); blk = 1024
    for i in range(0, len(t), blk):
        c = 300 + 7500 * (i / len(t)) ** 2.2; out[i:i + blk] = bp(n[i:i + blk], c * .7, c * 1.6)
    return out * (t / d) ** 2.0 * vol * 5
def glitch_sfx(vol=1.0):
    t = tt(.16); n = rng.standard_normal(len(t)); g = (np.floor(t * 90) % 2) * 1.0
    return hp(n, 1500) * g * np.exp(-t * 14) * vol
def reverb(x, rt=2.4, wet=1.0):
    n = int(rt * SR); t = np.arange(n) / SR; out = []
    for ch in range(2):
        ir = lp(rng.standard_normal(n) * np.exp(-t * 6.9 / rt), 5500) * np.minimum(t / .02, 1)
        out.append(signal.fftconvolve(x[:, ch], ir)[:len(x)])
    y = np.stack(out, 1); return y / (np.abs(y).max() + 1e-9) * np.abs(x).max() * wet * 1.6
