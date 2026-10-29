"""Synthesises the soundtrack (128 BPM festive groove + firework / text sound effects). Writes music.wav."""
import numpy as np, wave, sys
import schedule as S

SR = 44100
N = int(S.DURATION * SR)
rng = np.random.RandomState(5)
BEAT, BAR = S.BEAT, S.BAR
S16 = BEAT / 4

L = np.zeros(N, np.float32); R = np.zeros(N, np.float32)
buses = {k: [np.zeros(N, np.float32), np.zeros(N, np.float32)] for k in ('drums', 'bass', 'lead', 'pad', 'bells', 'sfx', 'boom')}

def put(bus, sig, t0, gain=1.0, pan=0.0):
    i0 = int(t0 * SR)
    if i0 >= N or i0 + len(sig) <= 0: return
    a = max(0, -i0); b = min(len(sig), N - i0)
    s = sig[a:b] * gain
    pl, pr = np.sqrt(0.5 * (1 - pan)), np.sqrt(0.5 * (1 + pan))
    buses[bus][0][i0 + a:i0 + b] += s * pl
    buses[bus][1][i0 + a:i0 + b] += s * pr

def tt(d): return np.arange(int(d * SR)) / SR
def midi(m): return 440.0 * 2 ** ((m - 69) / 12)

def lowpass(x, fc):
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x); acc = 0.0
    # one-pole via lfilter-free loop is slow; use FFT-domain filter instead
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X / (1 + (f / fc) ** 4) ** 0.5 ** 1, len(x)).astype(np.float32)

def highpass(x, fc):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X * (1 - 1 / (1 + (f / fc) ** 4)) ** 0.5, len(x)).astype(np.float32)

def bandpass(x, lo, hi): return lowpass(highpass(x, lo), hi)

# ---------------------------------------------------------------- instruments
def kick(vel=1.0):
    t = tt(0.42)
    f = 52 + 120 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t * 9)
    click = np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 180) * 0.25
    return ((body + click) * vel).astype(np.float32)

def dhol_bass(vel=1.0):
    t = tt(0.55)
    f = 78 + 70 * np.exp(-t * 22)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-t * 6.5) + 0.35 * np.sin(2 * ph) * np.exp(-t * 11)
    stick = rng.randn(len(t)) * np.exp(-t * 120) * 0.25
    return ((s + stick) * vel).astype(np.float32)

def tilli(vel=1.0):
    t = tt(0.16)
    n = bandpass(rng.randn(len(t)).astype(np.float32), 2200, 7500) * np.exp(-t * 55)
    ping = np.sin(2 * np.pi * 520 * t) * np.exp(-t * 40) * 0.35
    return ((n * 1.6 + ping) * vel).astype(np.float32)

def clap(vel=1.0):
    t = tt(0.30)
    n = bandpass(rng.randn(len(t)).astype(np.float32), 900, 4800)
    env = np.exp(-t * 18) + 0.7 * np.exp(-((t - 0.012) % 0.02) * 0) * 0
    for k in (0.0, 0.011, 0.023):
        env = env + np.where(t >= k, np.exp(-(t - k) * 90), 0) * 0.8
    env = env * np.minimum(1, t * 2000)
    body = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 28) * 0.4
    return ((n * env * 0.55 + body) * vel).astype(np.float32)

def hat(vel=1.0, open_=False):
    d = 0.22 if open_ else 0.06
    t = tt(d)
    n = highpass(rng.randn(len(t)).astype(np.float32), 7000) * np.exp(-t * (14 if open_ else 70))
    return (n * vel).astype(np.float32)

def pluck(f, d=0.9, bright=1.0, buzz=2.5):
    """sitar-ish: decaying harmonic stack with a bit of jawari buzz and a quick meend into the note"""
    t = tt(d)
    f_t = f * (1 + 0.035 * np.exp(-t * 40))
    ph = 2 * np.pi * np.cumsum(f_t) / SR
    s = np.zeros_like(t)
    for k in range(1, 15):
        if f * k > 11000: break
        s += (bright ** (k > 3)) / k ** 0.9 * np.sin(k * ph) * np.exp(-t * (2.2 + 1.1 * k))
    s = np.tanh(s * buzz) * 0.8
    s *= np.minimum(1, t * 600)
    return s.astype(np.float32)

def shehnai(f, d, vib=1.0):
    t = tt(d)
    vibr = 1 + 0.006 * vib * np.sin(2 * np.pi * 5.6 * t) * np.minimum(1, t / 0.18)
    ph = 2 * np.pi * np.cumsum(f * vibr) / SR
    s = np.zeros_like(t)
    for k in range(1, 22):
        if f * k > 9000: break
        w = 1 / k ** 0.8 * (0.25 + 1 / (1 + ((k * f - 1500) / 1100) ** 2))
        s += w * np.sin(k * ph + 0.3 * k)
    env = np.minimum(1, t / 0.035) * np.minimum(1, (d - t) / 0.06) * (0.75 + 0.25 * np.exp(-t * 4))
    return (s * env * 0.5).astype(np.float32)

def bell(f, d=1.2):
    t = tt(d)
    mod = 2.2 * np.exp(-t * 4) * np.sin(2 * np.pi * f * 3.5 * t)
    s = np.sin(2 * np.pi * f * t + mod) * np.exp(-t * 3.2) + 0.25 * np.sin(2 * np.pi * f * 2.0 * t) * np.exp(-t * 5)
    return (s * np.minimum(1, t * 800)).astype(np.float32)

def subbass(f, d):
    t = tt(d)
    s = np.sin(2 * np.pi * f * t) + 0.28 * np.sin(4 * np.pi * f * t) * np.exp(-t * 4)
    env = np.minimum(1, t / 0.008) * np.exp(-t * 3.2) * np.minimum(1, (d - t) / 0.03)
    return np.tanh(s * 1.6 * env) * 0.9

def padnote(f, d):
    t = tt(d); s = np.zeros_like(t)
    for det in (-0.007, 0.0, 0.007):
        ph = 2 * np.pi * f * (1 + det) * t
        for k in range(1, 9):
            s += np.sin(k * ph) / k * (0.9 ** k)
    env = np.minimum(1, t / 0.35) * np.minimum(1, (d - t) / 0.5)
    return (s * env * 0.18).astype(np.float32)

def whoosh(d=0.9, up=True, lo=300, hi=6500):
    t = tt(d)
    n = rng.randn(len(t)).astype(np.float32)
    out = np.zeros_like(n)
    segs = 8
    for i in range(segs):
        a, b = i * len(t) // segs, (i + 1) * len(t) // segs
        u = (i + 0.5) / segs if up else 1 - (i + 0.5) / segs
        fc = lo * (hi / lo) ** u
        out[a:b] = bandpass(n[a:b], fc * 0.6, fc * 1.5)
    env = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 1.5
    return (out * env * 2.2).astype(np.float32)

def boom(size=1.0):
    t = tt(1.6)
    f = 38 + 80 * np.exp(-t * 14)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3.6)
    n = lowpass(rng.randn(len(t)).astype(np.float32), 420) * np.exp(-t * 4.2) * 1.6
    return ((s + n) * size).astype(np.float32)

def crackle(d=1.3, density=60, seed=0):
    r = np.random.RandomState(seed)
    out = np.zeros(int(d * SR), np.float32)
    n = int(d * density)
    for _ in range(n):
        u = r.rand() ** 1.6
        i = int(u * (len(out) - 600)); l = r.randint(60, 380)
        out[i:i + l] += (r.randn(l) * np.exp(-np.arange(l) / (l * 0.25)) * r.uniform(0.2, 1.0) * (1 - u) ** 1.2).astype(np.float32)
    return highpass(out, 1500)

def whistle(d=0.55, f0=700, f1=2600):
    t = tt(d)
    f = f0 * (f1 / f0) ** (t / d)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * (t / d) ** 1.2
    return (s * 0.5 * np.minimum(1, (d - t) / 0.02)).astype(np.float32)

def crash(d=2.2):
    t = tt(d)
    n = highpass(rng.randn(len(t)).astype(np.float32), 4200)
    return (n * (np.exp(-t * 2.2) * 0.9 + 0.1 * np.exp(-t * 0.6))).astype(np.float32)

def reverse_riser(d, lo=400, hi=9000):
    w = whoosh(d, True, lo, hi)
    return w * np.linspace(0.1, 1.0, len(w)) ** 1.7

# ---------------------------------------------------------------- arrangement
slot = lambda bar, s: bar * BAR + s * S16
GI = 2   # groove enters at bar 2 (3.75 s)

# chord roots (midi) per bar:  D  D  G  A | D  G  A  D
roots = [50, 50, 55, 57, 50, 55, 57, 50]
chords = [(62, 66, 69), (62, 66, 69), (62, 67, 71), (64, 69, 73), (62, 66, 69), (62, 67, 71), (64, 69, 73), (62, 66, 69)]

# drums
for bar in range(GI, 8):
    for beat in range(4):
        put('drums', kick(0.95), slot(bar, beat * 4), 0.9)
    for s_ in (6, 10) if bar < 7 else (6, 10, 11):
        put('drums', dhol_bass(0.8), slot(bar, s_), 0.5, pan=-0.15)
    for s_ in (2, 6, 10, 14):
        put('drums', tilli(0.8), slot(bar, s_), 0.45, pan=0.2)
    for s_ in (4, 12):
        put('drums', clap(0.9), slot(bar, s_), 0.6)
    for s_ in range(16):
        put('drums', hat(0.5 if s_ % 2 else 0.8, open_=(s_ in (14,))), slot(bar, s_), 0.18, pan=0.25 if s_ % 4 else -0.1)
    if bar in (3, 5, 7):                       # tabla-style fill into the next phrase
        for k, s_ in enumerate((13, 14, 15, 15.5)):
            put('drums', tilli(1.0), slot(bar, s_), 0.5 + 0.1 * k, pan=0.0)
# pre-groove: soft pulse + build
for bar in range(0, GI):
    for beat in range(4):
        put('drums', hat(0.7), slot(bar, beat * 4 + 2), 0.12 + 0.03 * bar, pan=0.2)
    if bar == 1:
        for s_ in range(0, 16, 2):
            put('drums', tilli(0.7 + s_ * 0.03), slot(bar, s_), 0.25 + 0.015 * s_)
        for s_ in (12, 13, 14, 15):
            put('drums', kick(0.7), slot(bar, s_), 0.35)

# bass
bass_pat = [(0, 3), (3, 1.5), (6, 1.5), (8, 3), (11, 1.5), (14, 2)]
for bar in range(GI, 8):
    r = roots[bar]
    for k, (s_, ln) in enumerate(bass_pat):
        note = r - 12 + (12 if k in (3, 5) else 0) * 0
        put('bass', subbass(midi(note), ln * S16 * 0.95), slot(bar, s_), 0.75)
# pre-groove bass pad
for bar in range(0, GI):
    put('bass', subbass(midi(roots[bar] - 12), BAR * 0.98), bar * BAR, 0.4)

# drone (tanpura-ish): Sa Pa Sa' Sa for the whole piece
for b in range(8):
    for k, (m, g) in enumerate(((38, 0.7), (45, 0.55), (50, 0.5), (50, 0.5))):
        put('pad', pluck(midi(m), 2.0, bright=0.7, buzz=1.4), b * BAR + k * BEAT * 1.0, 0.16 * g, pan=-0.3 + 0.2 * k)

# pad chords
for bar in range(GI, 8):
    for m in chords[bar]:
        put('pad', padnote(midi(m - 12 if m > 66 else m), BAR + 0.3), bar * BAR - 0.05, 0.6, pan=rng.uniform(-0.5, 0.5))

# bell arpeggios (intro build + sparkle through)
arp = [0, 1, 2, 1, 2, 3, 2, 1]
for bar in range(8):
    ch = [m + 12 for m in chords[bar]] + [chords[bar][0] + 24]
    step = 2 if bar >= GI else 1
    vel = 0.55 if bar < GI else 0.35
    if bar >= GI:
        for i in range(0, 16, step * 1):
            if i % 2 == 0 or bar >= 4:
                put('bells', bell(midi(ch[arp[(i // step) % 8] % 4])), slot(bar, i), vel * (0.7 + 0.3 * (i % 4 == 0)), pan=0.5 * np.sin(i))
    else:
        for i in range(0, 16, 2):
            put('bells', bell(midi(ch[(i // 2 + bar) % 4])), slot(bar, i), vel * (0.55 + 0.1 * i / 4), pan=0.4 * np.sin(i))

# lead melody (D major) on the grid: (slot, midi, length in 16ths)
A1 = [(0, 81, 2), (2, 78, 1), (3, 81, 1), (4, 83, 2), (6, 81, 2), (8, 78, 2), (10, 76, 2), (12, 74, 4)]
A2 = [(0, 76, 2), (2, 78, 2), (4, 81, 2), (6, 83, 1), (7, 81, 1), (8, 78, 4), (12, 76, 2), (14, 78, 2)]
B1 = [(0, 86, 2), (2, 83, 1), (3, 86, 1), (4, 85, 2), (6, 83, 2), (8, 81, 2), (10, 78, 2), (12, 81, 4)]
B2 = [(0, 83, 2), (2, 85, 2), (4, 86, 2), (6, 85, 1), (7, 83, 1), (8, 86, 4), (12, 85, 2), (14, 83, 2)]
FIN = [(0, 86, 3), (3, 85, 1), (4, 86, 2), (6, 90, 2), (8, 93, 8)]
INTRO = [(0, 74, 4), (4, 78, 4), (8, 81, 4), (12, 86, 4)]
plan = {0: None, 1: INTRO, 2: A1, 3: A2, 4: B1, 5: B2, 6: A1, 7: FIN}
plan[6] = B1
for bar, pat in plan.items():
    if not pat: continue
    for (s_, m, ln) in pat:
        d = ln * S16
        vol = 0.5 if bar >= GI else 0.28
        if bar == 1:
            put('lead', pluck(midi(m), 1.1, 1.0, 3.0), slot(bar, s_), vol)
            continue
        put('lead', pluck(midi(m), min(1.2, d + 0.5), 1.1, 3.0), slot(bar, s_), vol * 1.0, pan=-0.12)
        if bar >= 4 or bar == 2:
            put('lead', shehnai(midi(m), d * 0.96 + 0.05), slot(bar, s_), 0.30 if bar >= 4 else 0.22, pan=0.12)
        if bar == 7 and m >= 86:
            put('lead', shehnai(midi(m - 12), d * 0.96 + 0.05), slot(bar, s_), 0.25)
# a countermelody an octave down in bars 4-6 answering on the off-beats
for bar in (5, 6):
    for (s_, m, ln) in ((14, 74, 2),):
        put('lead', pluck(midi(m - 12 + 12), 0.5, 1.0, 2.0), slot(bar, s_), 0.25)

# ---------------------------------------------------------------- impacts & risers
put('sfx', reverse_riser(S.T_DIWALI - 0.15 - 1.5, 300, 9000), 1.5, 0.55)
put('boom', boom(1.4), S.T_DIWALI - 0.02, 0.95)
put('sfx', crash(2.4), S.T_DIWALI - 0.01, 0.38)
put('bells', bell(midi(86), 2.0), S.T_DIWALI, 0.5); put('bells', bell(midi(93), 2.0), S.T_DIWALI + 0.02, 0.3)
F = 7 * BAR
put('sfx', reverse_riser(BAR * 0.95, 400, 9000), F - BAR * 0.95, 0.5)
put('boom', boom(1.2), F - 0.01, 0.9); put('sfx', crash(3.0), F, 0.4)
# final chord ring + fade
for m in (62, 66, 69, 74, 78, 81):
    put('bells', bell(midi(m), 2.8), F + 0.02, 0.18, pan=rng.uniform(-0.6, 0.6))

# text sfx
put('sfx', whoosh(0.9, True, 500, 7000), S.T_LOGO - 0.1, 0.35)
put('sfx', bell(midi(93), 1.0), S.T_LOGO + 0.45, 0.28)           # X pop
put('bells', bell(midi(88), 1.2), S.T_ESTD, 0.25)
put('sfx', whoosh(0.8, True, 800, 9000), S.T_ORN, 0.2)
pent = [74, 76, 78, 81, 83]
for i in range(5):
    put('bells', bell(midi(pent[i] + 12), 0.9), S.T_HAPPY + 0.13 * i, 0.35, pan=-0.4 + 0.2 * i)
    put('sfx', whoosh(0.25, False, 400, 5000), S.T_HAPPY + 0.13 * i - 0.05, 0.18)
for t0, n in ((S.T_TAG1, 2), (S.T_TAG2, 3)):
    for i in range(n):
        put('sfx', whoosh(0.35, True, 500, 6500), t0 + 0.16 * i - 0.1, 0.16)
        put('bells', bell(midi(81 + 2 * i + 12), 0.8), t0 + 0.16 * i + 0.1, 0.2, pan=-0.3 + 0.3 * i)

# fireworks sfx
for (t, x, y, size, kind, c) in S.FIREWORKS:
    pan = (x - 540) / 540 * 0.8
    put('sfx', whistle(0.5, 800 + 600 * rng.rand(), 2400 + 600 * rng.rand()), t - 0.52, 0.10, pan=pan)
    if abs(t - S.T_DIWALI) > 0.05 and abs(t - F) > 0.05:
        put('boom', boom(0.55 + size / 700), t, 0.45, pan=pan)
    put('sfx', crackle(1.3 if kind != 'willow' else 2.0, 55 if kind != 'ring' else 30, seed=int(t * 100)), t + 0.05, 0.7, pan=pan)

# ---------------------------------------------------------------- reverb, ducking, mix
def reverb(sig2, decay=1.4, wet=0.25, seed=0):
    r = np.random.RandomState(seed)
    n = int(decay * SR)
    ir = [r.randn(n) * np.exp(-np.arange(n) / (decay * SR / 4.5)) for _ in range(2)]
    ir = [lowpass(h.astype(np.float32), 5500) for h in ir]
    ir[0][:int(0.012 * SR)] *= 0.0; ir[1][:int(0.018 * SR)] *= 0.0
    nfft = 1 << int(np.ceil(np.log2(N + n)))
    out = []
    for ch in range(2):
        X = np.fft.rfft(sig2[ch], nfft); H = np.fft.rfft(ir[ch], nfft)
        out.append(np.fft.irfft(X * H, nfft)[:N].astype(np.float32) * 0.03)
    return [sig2[0] * (1 - wet) + out[0] * wet * 2.0, sig2[1] * (1 - wet) + out[1] * wet * 2.0]

# sidechain-style pump on pad / drone / bells from the kick (after the drop)
tgrid = np.arange(N) / SR
duck = np.ones(N, np.float32)
ph = ((tgrid - S.GROOVE_IN) / BEAT) % 1.0
duck = np.where(tgrid >= S.GROOVE_IN, 1 - 0.55 * np.exp(-ph * 7), 1.0).astype(np.float32)
for k in ('pad', 'bells'):
    buses[k][0] *= duck; buses[k][1] *= duck

levels = {'drums': 1.3, 'bass': 0.9, 'lead': 1.0, 'pad': 0.9, 'bells': 0.8, 'sfx': 0.9, 'boom': 0.9}
wets = {'drums': 0.08, 'bass': 0.0, 'lead': 0.28, 'pad': 0.35, 'bells': 0.4, 'sfx': 0.2, 'boom': 0.25}
mix = [np.zeros(N, np.float32), np.zeros(N, np.float32)]
for k, (bl, br) in buses.items():
    b = [bl * levels[k], br * levels[k]]
    if wets[k] > 0: b = reverb(b, 1.5 if k != 'boom' else 2.2, wets[k], seed=hash(k) % 1000)
    mix[0] += b[0]; mix[1] += b[1]

# master: gentle glue, fades, peak normalise
m = np.stack(mix)
m = np.tanh(m * 0.5) / np.tanh(0.5)
env_in = np.minimum(1, tgrid / 0.1); env_out = np.minimum(1, (S.DURATION - tgrid) / 0.9) ** 1.5
m *= (env_in * env_out)[None]
peak = np.abs(m).max()
m = m / peak * 0.89
pcm = (np.clip(m.T, -1, 1) * 32767).astype(np.int16)
with wave.open(sys.argv[1] if len(sys.argv) > 1 else 'music.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('peak before norm', peak, 'rms', float(np.sqrt((m ** 2).mean())))
g0, g1 = int(S.GROOVE_IN * SR), int(13 * SR)
for k, (bl, br) in buses.items():
    print(f'{k:6s} rms {20*np.log10(np.sqrt(((bl[g0:g1]*levels[k])**2).mean())+1e-9):6.1f} dB  peak {np.abs(bl).max():.2f}')
