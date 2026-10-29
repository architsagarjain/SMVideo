"""Synthesises a 15 s upbeat Diwali track (128 BPM, D major) -> music.wav. Pure numpy."""
import numpy as np, wave, sys
SR = 44100
BPM = 128
BEAT = 60 / BPM
STEP = BEAT / 4
TOTAL = 15.0
N = int(SR * (TOTAL + 1.5))
rng = np.random.default_rng(7)

def hz(m): return 440 * 2 ** ((m - 69) / 12)
def put(buf, x, t):
    i = int(t * SR)
    if i >= len(buf): return
    x = x[: len(buf) - i]
    buf[i:i + len(x)] += x
def tt(d): return np.arange(int(d * SR)) / SR
def hp(x, n=2):
    for _ in range(n): x = np.concatenate([[0], np.diff(x)])
    return x

def pluck(m, d=1.2, bright=1.0):
    t = tt(d); f = hz(m); y = np.zeros_like(t)
    for h in range(1, 14):
        y += (1 / h ** 1.1) * np.exp(-t * (2.5 + h * 1.4 / bright)) * np.sin(2 * np.pi * f * h * (1 + 0.0007 * h * h) * t)
    return y * np.minimum(1, t * 800)
def flute(m, d, vib=1.0):
    t = tt(d + 0.15); f = hz(m)
    ph = 2 * np.pi * np.cumsum(f * (1 + 0.004 * vib * np.sin(2 * np.pi * 5.6 * t) * np.minimum(1, t * 4))) / SR
    y = np.sin(ph) + 0.32 * np.sin(2 * ph) + 0.12 * np.sin(3 * ph) + 0.04 * np.sin(4 * ph)
    y += 0.05 * hp(rng.standard_normal(len(t)), 1) * 0.3
    env = np.minimum(1, t / 0.03) * np.where(t < d, 1, np.exp(-(t - d) * 18)) * (0.85 + 0.15 * np.sin(2 * np.pi * 5.6 * t))
    return y * env
def bell(m, d=1.6):
    t = tt(d); f = hz(m)
    y = np.sin(2 * np.pi * f * t + 2.2 * np.exp(-t * 6) * np.sin(2 * np.pi * f * 3.5 * t)) * np.exp(-t * 3.2)
    y += 0.4 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 5)
    return y
def thump(d=0.35, f0=130, f1=52):
    t = tt(d); f = f1 + (f0 - f1) * np.exp(-t * 28)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)
    return y + 0.4 * hp(rng.standard_normal(len(t)), 1) * np.exp(-t * 120) * 0.3
def tak(d=0.09):
    t = tt(d); n = hp(rng.standard_normal(len(t)), 2)
    return (0.6 * n * np.exp(-t * 55) + 0.7 * np.sin(2 * np.pi * 310 * t) * np.exp(-t * 60))
def na(d=0.14):
    t = tt(d); f = 330 + 90 * np.exp(-t * 40)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 30) * 0.8
def clap():
    y = np.zeros(int(0.25 * SR))
    for o in (0, 0.012, 0.025):
        t = tt(0.2); n = hp(rng.standard_normal(len(t)), 1)
        put(y, n * np.exp(-t * (28 if o < 0.025 else 18)) * 0.35, o)
    return y
def shaker(acc=1.0):
    t = tt(0.06); return hp(rng.standard_normal(len(t)), 2) * np.exp(-t * 70) * 0.18 * acc
def crash(d=2.5):
    t = tt(d); return hp(rng.standard_normal(len(t)), 2) * np.exp(-t * 2.2) * 0.35
def riser(d):
    t = tt(d); n = hp(rng.standard_normal(len(t)), 1)
    return n * (t / d) ** 2.2 * 0.5 * np.sin(2 * np.pi * (200 + 1800 * (t / d) ** 2) * t * 0 + 0) + 0.0
def boom(d=1.4):
    t = tt(d); f = 40 + 60 * np.exp(-t * 6)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3.2)
    y += 0.5 * hp(rng.standard_normal(len(t)), 0) * np.exp(-t * 6) * 0.4
    return y
def crackle(d=1.2):
    t = tt(d); y = np.zeros_like(t)
    for _ in range(26):
        o = rng.uniform(0.05, d - 0.1); k = int(0.012 * SR)
        s = hp(rng.standard_normal(k), 1) * np.exp(-np.arange(k) / SR * 300) * rng.uniform(0.1, 0.5)
        y[int(o * SR):int(o * SR) + k] += s
    return y * np.exp(-t * 1.8)

def reverb(x, rt=1.7, wet=0.3):
    L = int(rt * SR); t = np.arange(L) / SR
    ir = rng.standard_normal(L) * np.exp(-t * 6.9 / rt); ir = np.cumsum(ir) * 0 + ir
    ir = ir - np.concatenate([[0], 0.6 * ir[:-1]])  # tame lows
    n = len(x) + L; F = 1 << (n - 1).bit_length()
    y = np.fft.irfft(np.fft.rfft(x, F) * np.fft.rfft(ir / np.sqrt(np.sum(ir ** 2)), F), F)[:len(x)]
    return x * (1 - wet * 0.5) + y * wet

drums = np.zeros(N); perc = np.zeros(N); mel = np.zeros(N); harm = np.zeros(N); bass = np.zeros(N); fx = np.zeros(N); spark = np.zeros(N)

roots = {"D": 38, "A": 45, "Bm": 47, "G": 43}
tri = {"D": (62, 66, 69), "A": (64, 69, 73), "Bm": (62, 66, 71), "G": (62, 67, 71)}
prog = ["D", "A", "Bm", "G", "D", "A", "G", "D"]
hookA = [(74,0,3),(78,3,1),(81,4,3),(78,7,1),(83,8,2),(81,10,2),(78,12,4)]
hookB = [(76,0,3),(81,3,1),(85,4,3),(83,7,1),(81,8,2),(78,10,2),(76,12,4)]
hookC = [(74,0,3),(78,3,1),(83,4,3),(81,7,1),(78,8,2),(74,10,2),(78,12,4)]
hookD = [(79,0,2),(83,2,2),(86,4,4),(83,8,2),(81,10,2),(79,12,4)]
hookE = [(86,0,2),(85,2,2),(83,4,2),(81,6,2),(83,8,4),(86,12,4)]
hooks = [hookA, hookB, hookC, hookD, hookA, hookB, hookE, [(86, 0, 12)]]

for bar in range(8):
    b0 = bar * 4 * BEAT; c = prog[bar]
    last = bar == 7
    # melody (flute + octave bell shimmer)
    for m, s, l in hooks[bar]:
        d = l * STEP * (1.0 if not last else 1.0)
        put(mel, flute(m, d * 0.95) * 0.55, b0 + s * STEP)
        if bar >= 4 or bar == 1 or bar == 3: put(spark, bell(m + 12, 1.0) * 0.07, b0 + s * STEP)
    # chord plucks (sitar-ish)
    if not last:
        for s in (0, 3, 6, 8, 11, 14) if bar >= 1 else (0, 8):
            for k, m in enumerate(tri[c]):
                put(harm, pluck(m, 0.9) * 0.11, b0 + s * STEP + k * 0.012)
    else:
        for k, m in enumerate(tri[c] + (74,)):
            put(harm, pluck(m, 2.4, 0.6) * 0.14, b0 + k * 0.02)
    # drums
    full = bar >= 1 and not last
    for s in range(16):
        t = b0 + s * STEP
        if bar >= 0 and not last: put(perc, shaker(1.4 if s % 4 == 2 else 0.8), t)
        if full:
            if s in (0, 6, 8, 14) or (bar >= 5 and s == 3): put(drums, thump() * 0.9, t); put(bass, np.sin(2*np.pi*hz(roots[c]) * tt(0.36)) * np.exp(-tt(0.36) * 7) * 0.5, t)
            if s in (4, 12): put(drums, tak() * 0.9, t); put(drums, clap() * 0.8, t)
            if s in (2, 10, 15) or (bar >= 3 and s in (7, 11)): put(perc, na() * 0.45, t)
            if s in (5, 13): put(perc, tak() * 0.35, t)
    if bar == 0:
        put(drums, thump() * 0.8, b0 + 8 * STEP); put(drums, thump() * 0.8, b0 + 12 * STEP)
        for s in (4, 12): put(perc, tak() * 0.6, b0 + s * STEP)
    if bar == 3 or bar == 6:  # fill on last beat
        for s in (12, 13, 14, 15): put(drums, tak() * 0.7, b0 + (s + 0.0) * STEP)
        put(drums, thump() * 0.8, b0 + 14 * STEP)
    if last:
        put(drums, thump(0.6, 150, 45) * 1.2, b0); put(drums, tak() * 1.0, b0); put(drums, clap(), b0)
        put(fx, crash(3.0), b0); put(bass, np.sin(2*np.pi*hz(38) * tt(1.5)) * np.exp(-tt(1.5) * 2) * 0.6, b0)
        for k, m in enumerate((86, 90, 93, 98)): put(spark, bell(m, 2.2) * 0.1, b0 + 0.05 + k * 0.09)

# opening sparkle + transition riser/crash into the end card (bar 6 starts at 9.375 s)
for k, m in enumerate((86, 90, 93, 98, 93, 98)): put(spark, bell(m, 1.0) * 0.07, 0.0 + k * STEP * 2)
rt = 5 * 4 * BEAT
t = tt(rt); n = hp(rng.standard_normal(len(t)), 1)
put(fx, n * (t / rt) ** 2.4 * 0.22, rt - rt)  # placeholder alignment below
fx[:] = 0
put(fx, hp(rng.standard_normal(int(1.1 * SR)), 1) * (tt(1.1) / 1.1) ** 2.4 * 0.25, 5 * 4 * BEAT - 1.1 + 0.0)
put(fx, crash(2.4) * 0.9, 5 * 4 * BEAT)
put(drums, thump(0.6, 150, 45) * 1.1, 5 * 4 * BEAT)
# firework booms synced to the video (first bursts ~6.1 s)
for tb, g in ((6.1, .35), (6.85, .4), (7.55, .35), (8.25, .45), (8.95, .4)):
    put(fx, boom() * g, tb); put(fx, crackle() * g * 0.9, tb + 0.15)
fx += 0  # (crash at 9.375 re-added above after clearing)
put(fx, crash(2.4) * 0.9, 5 * 4 * BEAT)
put(fx, hp(rng.standard_normal(int(1.1 * SR)), 1) * (tt(1.1) / 1.1) ** 2.4 * 0.25, 5 * 4 * BEAT - 1.1)
put(fx, crash(3.0), 7 * 4 * BEAT)

wet = reverb(mel * 1.0 + harm * 0.8 + spark * 1.2, rt=1.8, wet=0.35)
mix = wet * 0.9 + drums * 0.9 + perc * 0.7 + bass * 0.9 + fx * 0.8
mix = mix[: int(TOTAL * SR)]
fade = int(1.4 * SR); mix[-fade:] *= np.linspace(1, 0, fade) ** 1.5
mix = np.tanh(mix * 1.1) / np.tanh(1.1)
mix = mix / np.max(np.abs(mix)) * 0.89
with wave.open(sys.argv[1] if len(sys.argv) > 1 else "music.wav", "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype("<i2").tobytes())
