"""Synthesises an original 120 BPM wedding-reel score + whoosh/impact SFX (rights-free, no samples).
Usage: python3 make_music.py out.wav"""
import sys
import numpy as np
from scipy import signal
from plan import TRANSITIONS, DUR, BPM

SR = 44100
N = int(DUR * SR)
BEAT = 60.0 / BPM
BAR = BEAT * 4
rng = np.random.default_rng(7)


def mid2hz(m): return 440.0 * 2 ** ((m - 69) / 12)
def place(buf, snd, t, gain=1.0):
    i = int(t * SR)
    if i >= len(buf) or i < -len(snd): return
    a, b = max(i, 0), min(i + len(snd), len(buf))
    buf[a:b] += snd[a - i:b - i] * gain
def stereo(mono, pan=0.0):
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    return np.stack([mono * l, mono * r], 1)
def lp(x, fc, order=2): return signal.sosfilt(signal.butter(order, fc, 'low', fs=SR, output='sos'), x)
def hp(x, fc, order=2): return signal.sosfilt(signal.butter(order, fc, 'high', fs=SR, output='sos'), x)
def bp(x, lo, hi, order=2): return signal.sosfilt(signal.butter(order, [lo, hi], 'band', fs=SR, output='sos'), x)
def tt(d): return np.arange(int(d * SR)) / SR


def kick(vol=1.0):
    t = tt(0.45); f = 45 + 95 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) * np.exp(-t * 9) + 0.25 * np.sin(ph * 2) * np.exp(-t * 30)) * vol
def clap(vol=1.0):
    t = tt(0.3); n = bp(rng.standard_normal(len(t)), 900, 3800)
    env = sum(np.exp(-np.clip(t - d, 0, None) * 90) * (t >= d) for d in (0, .011, .022)) * 0.5 + np.exp(-t * 16) * 0.6
    return n * env * vol
def hat(open_=False, vol=1.0):
    t = tt(0.25 if open_ else 0.06); n = hp(rng.standard_normal(len(t)), 7000)
    return n * np.exp(-t * (14 if open_ else 70)) * vol
def tom(f0, vol=1.0):  # dholak-ish low hit
    t = tt(0.35); f = f0 * (1 + 0.6 * np.exp(-t * 30))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 14) * vol
def saw(f, d, detune=(0,), a=0.4, r=0.6, cutoff=2000):
    t = tt(d + r); y = np.zeros_like(t)
    for dt in detune:
        y += signal.sawtooth(2 * np.pi * f * (1 + dt) * t + rng.uniform(0, 6.28))
    env = np.minimum(t / a, 1) * np.where(t < d, 1, np.exp(-(t - d) * 5 / r))
    return lp(y / len(detune), cutoff) * env
def bell(f, d=1.6, vol=1.0):
    t = tt(d); mod = np.sin(2 * np.pi * f * 3.5 * t) * 2.2 * np.exp(-t * 6)
    y = np.sin(2 * np.pi * f * t + mod) * np.exp(-t * 3.2)
    return (y + 0.3 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t * 5)) * vol
def pluck(f, d=0.6, vol=1.0):  # Karplus-Strong with a little drive: sitar-ish
    n = int(SR / f); L = int(d * SR); y = np.zeros(L + n)
    y[:n] = rng.uniform(-1, 1, n) * np.hanning(n * 2)[n:].clip(0.2, 1) * 0 + lp(rng.uniform(-1, 1, n), 6000)
    for s in range(n, L, n):
        seg = y[s - n:s]; prev = np.concatenate(([y[s - n - 1]], seg[:-1]))
        y[s:s + n] = 0.996 * 0.5 * (seg + prev)
    y = np.tanh(2.2 * y[:L]) * np.minimum(tt(d) / 0.004, 1) * np.exp(-tt(d) * 2.2)
    return y * vol
def reverb(x, rt=2.4, wet=1.0):
    n = int(rt * SR); t = np.arange(n) / SR
    out = []
    for ch in range(2):
        ir = rng.standard_normal(n) * np.exp(-t * 6.9 / rt)
        ir = lp(ir, 5500) * np.minimum(t / 0.02, 1)
        out.append(signal.fftconvolve(x[:, ch], ir)[:len(x)])
    y = np.stack(out, 1); return y / (np.abs(y).max() + 1e-9) * np.abs(x).max() * wet * 1.6
def whoosh(d=0.6, up=True, vol=1.0):
    t = tt(d); n = rng.standard_normal(len(t))
    fc = (400 + 5200 * (t / d) ** 2) if up else (5600 - 5000 * (t / d) ** 0.7)
    out = np.zeros_like(n); blk = 512
    for i in range(0, len(t), blk):
        c = min(max(fc[i], 200), 9000); out[i:i + blk] = bp(n[i:i + blk * 4][:blk] if False else n[i:i + blk], c * .6, min(c * 1.5, 18000), 1)
    env = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 1.8
    return out * env * vol * 6
def impact(vol=1.0):
    t = tt(1.6); f = 32 + 90 * np.exp(-t * 12)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.6)
    air = lp(rng.standard_normal(len(t)), 900) * np.exp(-t * 4) * .5
    return (boom + air) * vol
def shimmer(vol=1.0):
    y = sum(bell(mid2hz(m), 1.4, 0.4) for m in (93, 96, 100))
    return y * vol
def riser(d, vol=1.0):
    t = tt(d); n = rng.standard_normal(len(t)); out = np.zeros_like(n); blk = 1024
    for i in range(0, len(t), blk):
        c = 300 + 7500 * (i / len(t)) ** 2.2
        out[i:i + blk] = bp(n[i:i + blk], c * .7, c * 1.6, 1)
    return out * (t / d) ** 2.0 * vol * 5


# ---- harmony: Dm | Bb | Gm | A  (i-VI-iv-V in D), resolving to D major on the final bar
CH = {"Dm": (50, 53, 57), "Bb": (46, 50, 53), "Gm": (43, 46, 50), "A": (45, 49, 52), "D": (50, 54, 57)}
ROOT = {"Dm": 38, "Bb": 34, "Gm": 31, "A": 33, "D": 38}
PROG = ["Dm", "Bb", "Gm", "A"] * 2 + ["Dm", "Bb", "Gm", "Bb", "A", "D"]
LEAD = {"Dm": [(0, 74, .5), (.5, 72, .5), (1, 69, .5), (1.5, 72, .5), (2, 74, 1), (3, 77, .5), (3.5, 76, .5)],
        "Bb": [(0, 70, .5), (.5, 72, .5), (1, 74, 1), (2, 72, .5), (2.5, 70, .5), (3, 69, 1)],
        "Gm": [(0, 67, .5), (.5, 70, .5), (1, 74, 1), (2, 72, .5), (2.5, 70, .5), (3, 67, 1)],
        "A":  [(0, 69, .5), (.5, 73, .5), (1, 76, 1), (2, 77, .5), (2.5, 76, .5), (3, 73, 1)]}

dry = np.zeros((N, 2)); wetbus = np.zeros((N, 2)); sfx = np.zeros((N, 2)); duckable = np.zeros((N, 2))
bar_t = lambda b: b * BAR

for b, ch in enumerate(PROG):
    t0 = bar_t(b)
    # pad: fades in over the intro, full through the drop, swells again in the finale
    padg = 0.2 if b < 2 else 0.22 if b < 4 else .4 if b < 10 else .34 if b < 12 else .5
    for i, m in enumerate(CH[ch]):
        s = saw(mid2hz(m + 12), BAR + .1, detune=(-.006, 0, .006), a=0.7, r=1.0, cutoff=1500 if b < 4 else 2600)
        place(wetbus, stereo(s, -.4 + i * .4), t0, padg * .5)
        place(duckable, stereo(s, -.4 + i * .4), t0, padg * .5)
    # sparkling bell arpeggio (intro, build, breakdown, finale)
    if b < 4 or 10 <= b:
        tones = [CH[ch][0] + 24, CH[ch][1] + 24, CH[ch][2] + 24, CH[ch][1] + 36]
        for k in range(8):
            place(wetbus, stereo(bell(mid2hz(tones[(k * 3 // 2) % 4] if k % 2 else tones[k // 2 % 4]), 1.8, 1), -.5 + .14 * k),
                  t0 + k * BEAT / 2, (.10 if b < 2 else .12) * (1.9 if b >= 12 else 1.3 if b >= 10 else 1))

# build 4-8 s: heartbeat kicks fade in, hats, roll
for k in range(8, 15):  # beats 8..14  (4.0..7.0 s)
    place(dry, stereo(kick(1), 0), k * BEAT, 0.35 + 0.04 * (k - 8))
for k in range(8, 16):
    place(dry, stereo(hat(False, 1), .25), k * BEAT + BEAT / 2, 0.14)
for k in range(12, 15): place(dry, stereo(clap(1), 0), k * BEAT + BEAT, 0.22 + 0.04 * (k - 12)) if k % 2 == 0 else None
for j in range(0, 12):  # snare-ish roll 6.5 -> 7.9 getting denser
    t = 6.5 + j * (1.4 / 12) * (1 - 0.35 * j / 12) * 1.0
    place(dry, stereo(clap(1), 0), t, 0.08 + 0.012 * j)
place(sfx, stereo(riser(1.5, 1), 0), 6.5, 0.16)

# DROP at 8.0 s  (bars 4-9 -> 8..20 s)
drop = int(8 / BAR)
for b in range(drop, 10):
    t0 = bar_t(b); ch = PROG[b]; r = mid2hz(ROOT[ch])
    for k in range(4):
        place(dry, stereo(kick(1), 0), t0 + k * BEAT, 1.25)
        place(dry, stereo(hat(True, 1), .3), t0 + k * BEAT + BEAT / 2, 0.16)
    for k in (1, 3): place(dry, stereo(clap(1), 0), t0 + k * BEAT, 0.5)
    for k in range(8): place(dry, stereo(hat(False, 1), -.25), t0 + k * BEAT / 2 + BEAT / 4, 0.07)
    for k, f in ((.5, 0), (2.75, 1), (3.5, 1.4)): place(dry, stereo(tom(95 * (1 + .12 * f), 1), -.3), t0 + k * BEAT, 0.3)
    # bass: off-beat eighths with sub
    for k in range(8):
        bs = (lp(signal.sawtooth(2 * np.pi * r * tt(BEAT / 2 + .08)), 380) * .55 + np.sin(2 * np.pi * r * tt(BEAT / 2 + .08)) * .8)
        bs *= np.minimum(tt(BEAT / 2 + .08) / .006, 1) * np.exp(-tt(BEAT / 2 + .08) * 5)
        place(duckable, stereo(bs, 0), t0 + k * BEAT / 2, 0.8)
    for n_, (pos, m, dur) in enumerate(LEAD[ch]):
        p = pluck(mid2hz(m), 0.9, 1)
        place(wetbus, stereo(p, .2), t0 + pos * BEAT, 0.42)
        place(dry, stereo(p, .2), t0 + pos * BEAT, 0.42)
# breakdown 20-24: gentle, half-time heartbeat + slow lead
for b in (10, 11):
    t0 = bar_t(b); ch = PROG[b]
    place(dry, stereo(kick(1), 0), t0, 0.5); place(dry, stereo(kick(1), 0), t0 + 2 * BEAT, 0.35)
    place(dry, stereo(clap(1), 0), t0 + 3 * BEAT, 0.15)
    key = "Bb" if ch == "Bb" else ch
    for pos, m, dur in LEAD[key][::2]:
        place(wetbus, stereo(bell(mid2hz(m), 2.2, 1), .15), t0 + pos * BEAT, .32)
# final cinematic bars 24-28: slow bell melody + low swell
for t, m in ((24.0, 81), (25.0, 79), (26.0, 78), (26.5, 81), (27.0, 86)):
    place(wetbus, stereo(bell(mid2hz(m), 3.0, 1), .1), t, .38)
place(dry, stereo(kick(1), 0), 26.0, 0.55)
place(sfx, stereo(tom(60, 1), 0), 26.0, 0.5)
fin = bell(mid2hz(74), 3.5) + bell(mid2hz(78), 3.5) + bell(mid2hz(81), 3.5)
place(wetbus, stereo(fin, 0), 26.0, 0.22)

# sidechain-duck pads+bass against kicks
kick_times = [k * BEAT for k in range(8, 56) if (8 <= k < 15) or (16 <= k < 40) or k in (40, 44)]
duck = np.ones(N)
for kt in kick_times:
    i = int(kt * SR); seg = np.arange(min(int(.3 * SR), N - i)); duck[i:i + len(seg)] *= 1 - .55 * np.exp(-seg / SR / .1)
duckable *= duck[:, None]

# SFX at each transition (whoosh landing on the cut), impacts on key beats
for t, kind, L in TRANSITIONS:
    if kind.startswith("whip") or kind.startswith("spin"):
        place(sfx, stereo(whoosh(L + .25, True), 0), t - L / 2 - .1, .55)
    elif kind in ("zoomin", "iris", "diag"):
        place(sfx, stereo(whoosh(L + .35, True), 0), t - L - .05, .5)
    elif kind in ("flash", "zoomflash", "glowdip"):
        place(sfx, stereo(whoosh(.5, True), 0), t - .45, .4)
        place(sfx, stereo(shimmer(1), 0), t - .02, .5)
    elif kind in ("lightleak", "softzoom"):
        place(sfx, stereo(whoosh(L + .5, True), 0), t - L / 2 - .3, .28)
        place(sfx, stereo(shimmer(1), 0), t, .25)
place(sfx, stereo(impact(1), 0), 8.0, 1.0)
place(sfx, stereo(impact(1), 0), 0.0, 0.35)
place(sfx, stereo(shimmer(1), 0), 0.0, 0.5)
place(sfx, stereo(impact(1), 0), 18.5, 0.45)
place(sfx, stereo(impact(1), 0), 24.0, 0.3)
for t in (13.0, 16.5): place(sfx, stereo(impact(1), 0), t, .35)

wetmix = reverb(wetbus, 2.6, 0.9)
mix = dry + duckable + wetbus * .55 + wetmix * .8 + sfx * 0.6
# pre-drop dip: cut everything but the riser just before the drop
dip = np.ones(N); i0, i1 = int(7.88 * SR), int(8.0 * SR); dip[i0:i1] = 0.12
mix = mix * dip[:, None] + (sfx * 0.2) * (1 - dip)[:, None]
fade = np.ones(N); f0 = int(27.2 * SR); fade[f0:] = np.linspace(1, 0, N - f0) ** 1.6
fadein = np.minimum(np.arange(N) / (0.05 * SR), 1)
mix = np.tanh(mix * 0.9) * fade[:, None] * fadein[:, None]
mix = mix / np.abs(mix).max() * 0.89
import wave
pcm = (mix * 32767).astype('<i2')
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print("wrote", sys.argv[1], mix.shape, "peak", np.abs(mix).max())
