"""Music bed + sound design + narration for the IndiaBiomass reels, cut to the
picture's beats (taken from the same word timings the visuals use).

usage: python3 reel_audio.py reel1|reel2
writes reels/audio/<reel>_music.wav, <reel>_mix.wav (-14 LUFS, <= -1 dBTP) and
film/public/audio/<reel>_mix.wav for Studio previews.
"""
import json, os, sys
import numpy as np
import soundfile as sf
import pyloudnorm as pyln

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'audio', 'scripts'))
from synth import *  # noqa  (same instruments as the brand film)
from scipy.signal import resample_poly

R = os.path.join(HERE, '..')
FILM = os.path.join(R, '..', 'film')
SFX = os.path.join(R, '..', 'audio', 'sfx')
reel = sys.argv[1]
data = json.load(open(os.path.join(FILM, 'src', 'data', f'{reel}.json')))
FPS = 30
DUR = data['frames'] / FPS
W = data['words']
norm = lambda t: ''.join(ch for ch in t.lower() if ch.isalnum() or ch in '%.-').rstrip('.')
def at(word, nth=0):
    hits = [w for w in W if norm(w['w']) == norm(word)]
    return hits[nth]['s'] / FPS
END = (W[-1]['e'] + 10) / FPS  # end-card / brand moment, as in the picture

def rec(name, gain=1.0, dur=None):
    x, sr = sf.read(os.path.join(SFX, name), always_2d=True)
    x = x.T
    if dur:
        x = x[:, :int(dur * sr)]
    f = min(int(0.02 * SR), x.shape[1] // 2)
    x[:, -f:] *= np.linspace(1, 0, f)
    return x * gain

def zap(dur=0.35, f0=900, f1=3200):
    n = int(dur * SR); t_ = np.arange(n) / SR
    return sine(f0 * (f1 / f0) ** (t_ / dur), n) * np.exp(-t_ * 9) * 0.3 + hp(noise(n), 4000) * np.exp(-t_ * 40) * 0.08


music, sfx = Track(DUR), Track(DUR)
B = 0.5  # 120 BPM
CH = {'Dm': ['D4', 'F4', 'A4', 'E5'], 'Bb': ['Bb3', 'D4', 'F4', 'C5'], 'F': ['F3', 'A3', 'C4', 'G4'], 'C': ['C4', 'E4', 'G4', 'D5'],
      'Gm': ['G3', 'Bb3', 'D4', 'A4'], 'D': ['D4', 'F#4', 'A4', 'E5']}
ROOT = {'Dm': 'D2', 'Bb': 'Bb1', 'F': 'F2', 'C': 'C2', 'Gm': 'G1', 'D': 'D2'}


def bars(t0, t1, seq, drums=True, gain=1.0, four=False, arp=False):
    """Chord bars of 2 s from t0 to t1 with bass pulse and (optional) drums."""
    k, t = 0, t0
    while t < t1 - 0.05:
        c = seq[k % len(seq)]
        d = min(2.0, t1 - t)
        music.add(t, supersaw([m(n) for n in CH[c]], d + 0.05, a=0.08, r=0.3, detune=0.15) * 0.16 * gain)
        for j in range(int(d / (B / 2))):
            tn = t + j * B / 2
            n = int(0.2 * SR)
            note = m(ROOT[c]) + (12 if j % 4 == 3 else 0)
            music.add(tn, lp(polyblep_saw(n2f(note), n), 900) * adsr(n, 0.003, 0.08, 0.4, 0.05) * 0.22 * gain)
            music.add(tn, sub(note, 0.2, a=0.002, r=0.06) * 0.12 * gain)
        if drums:
            for bt in range(int(d / B)):
                tb = t + bt * B
                if four or bt % 2 == 0:
                    music.add(tb, kick(0.9) * 0.55 * gain)
                if bt % 2 == 1:
                    music.add(tb, clap() * 0.32 * gain)
                music.add(tb + B / 2, hat() * 0.22 * gain)
        if arp:
            tones = [m(n) for n in CH[c][:3]]
            pat = [tones[0], tones[1], tones[2], tones[0] + 12]
            for s_ in range(int(d / (B / 2))):
                music.add(t + s_ * B / 2, pluck(pat[s_ % 4] + 12, 0.4, bright=0.6, decay=6) * 0.1 * gain)
        k += 1
        t += 2.0


def sig(t):
    """Brand sonic signature: D, A, then D/F# (as in the film)."""
    music.add(t, bell(m('D5'), 2.6) * 0.42)
    music.add(t + 0.19, bell(m('A5'), 2.4) * 0.36)
    music.add(t + 0.42, bell(m('D6'), 2.2) * 0.34)
    music.add(t + 0.42, bell(m('F#5'), 2.2) * 0.24)


def ending(hit):
    music.add(hit - 1.4, riser(1.4, f0=400, f1=12000, curve=2.4) * 0.45)
    music.add(hit - 0.9, reverse_swell(0.9) * 0.7)
    music.add(hit, impact(3.0, 1.1) * 1.2)
    music.add(hit, supersaw([m(n) for n in ['D3', 'A3', 'D4', 'F#4', 'A4', 'E5']], DUR - hit + 0.5, a=0.01, r=2.4, detune=0.2) * 0.34)
    music.add(hit, sub(m('D1'), DUR - hit + 0.5, a=0.005, r=2.4, drive=0.5) * 0.35)
    sig(hit + 0.38)


if reel == 'reel1':
    t_cof, t_pct, t_rule, t_est, t_15 = at("its"), at('7%'), at('that'), at('an'), at('15')
    t_25, t_gap, t_pel, t_str, t_mac, t_brand = at('2.5'), at('that', 1), at('pellet'), at('straw'), at('machinery'), at('india', 2)
    L = END * FPS - t_brand * FPS
    t_logo = (t_brand * FPS + round(L * 0.5)) / FPS
    # hook: a hit on frame one, a dark pad, a riser into "co-firing"
    music.add(0.0, impact(2.0, 0.6) * 0.5)
    music.add(0.0, supersaw([m(n) for n in ['D3', 'A3', 'D4']], t_cof + 0.2, a=0.6, r=0.4, detune=0.12) * 0.2)
    music.add(0.0, sub(m('D1'), t_cof, a=0.3, r=0.3) * 0.25)
    music.add(t_cof - 1.5, riser(1.5, f0=300, f1=8000, curve=2.2) * 0.4)
    sfx.add(at('burn') - 0.25, whoosh(0.5, 300, 5000, 0.5, 0.8, -0.8) * 0.7)
    bars(t_cof, t_brand, ['Dm', 'Bb', 'F', 'C'], drums=True, arp=True)
    sfx.add(t_pct - 0.05, impact(1.2, 0.4) * 0.35); music.add(t_pct, bell(m('A5'), 1.4) * 0.25)
    music.add(t_15, impact(1.4, 0.5) * 0.4); sfx.add(t_15 - 0.3, zap(0.6, 300, 1600) * 0.5)
    sfx.add(t_25 - 0.2, zap(0.5, 500, 1200) * 0.4)
    music.add(t_gap, supersaw([m(n) for n in CH['Bb']], 2.2, a=0.05, r=1.0, detune=0.22) * 0.22)
    for t in (t_pel, t_str, t_mac):
        sfx.add(t - 0.3, whoosh(0.45, 250, 5000, 0.55, -0.6, 0.6) * 0.6)
    sfx.add(t_mac, metal(48, 0.5) * 0.3)
    music.add(t_brand - 0.8, reverse_swell(0.8) * 0.6)
    music.add(t_brand, shimmer(2.0, density=40, lo=2500, hi=9000, seed=7) * 0.8)
    ending(t_logo)
else:
    secs = [at('e-m-d'), at('g-c-v'), at('l-1'), at('mseexemption'), at('reverse'), at('save')]
    secs = [s - 8 / FPS for s in secs]
    # light, steady groove under the whole explainer
    music.add(0.0, impact(1.6, 0.5) * 0.4)
    music.add(0.0, supersaw([m(n) for n in ['D3', 'A3', 'D4']], secs[0] + 0.2, a=0.3, r=0.4, detune=0.12) * 0.18)
    bars(secs[0], END - 0.1, ['Dm', 'Bb', 'F', 'C'], drums=True, gain=0.85)
    for s in secs:  # each new word: a whip and a tick
        sfx.add(s - 0.25, whoosh(0.4, 400, 6000, 0.5, 0.7, -0.7) * 0.55)
        sfx.add(s + 0.2, tick(2400, 0.05) * 0.8)
    sfx.add(at('refundable') + 0.35, rec('ui_click_device.wav', 0.6))          # coin lands
    sfx.add(at('refundable') + 0.35, bell(m('E6'), 0.6) * 0.25)
    sfx.add(at('bid'), zap(0.5, 900, 1800) * 0.35)                                # refund loop
    sfx.add(at('heat'), zap(1.0, 200, 900) * 0.45)                                # gauge rising
    sfx.add(at('minimum') - 0.05, tick(1600, 0.06) * 0.8)
    sfx.add(at('lowest'), whoosh(0.5, 300, 3000, 0.5, 0, 0) * 0.4)
    sfx.add(at('wins') - 0.05, bell(m('A5'), 1.0) * 0.35)
    sfx.add(at('registered') - 0.03, impact(0.8, 0.35) * 0.35)                   # stamp
    for k in range(6):                                                             # live price cuts
        sfx.add(at('after') + k * 0.62, blip(84 - k * 2, 0.12) * 0.4)
    sfx.add(at('save'), blip(91, 0.15) * 0.5)
    ending(END)

# ---------------------------------------------------------------- mix
N = int(DUR * SR)
vo, sr = sf.read(os.path.join(R, 'audio', 'vo', f'{reel}_vo.wav'))
assert sr == SR
voT = np.zeros(N)
i0 = int(data['offset'] * SR)
voT[i0:i0 + len(vo)] = vo[: N - i0]
vo_p = fx(voT.astype(np.float32), Pedalboard([HighpassFilter(cutoff_frequency_hz=80), Compressor(threshold_db=-20, ratio=3, attack_ms=5, release_ms=80)]))
mus = fx(music.buf[:, :N].astype(np.float32), Pedalboard([HighpassFilter(cutoff_frequency_hz=30), Chorus(rate_hz=0.3, depth=0.15, mix=0.2), Reverb(room_size=0.7, wet_level=0.22, dry_level=0.9, width=1.0)]))
sx = fx(sfx.buf[:, :N].astype(np.float32), Pedalboard([Reverb(room_size=0.4, wet_level=0.12, dry_level=1.0)]))
# duck music under speech (speech band more than lows)
env = np.convolve(np.abs(vo_p), np.ones(int(0.05 * SR)) / int(0.05 * SR), mode='same')
gate = (env > 0.01).astype(float)
duck = np.zeros_like(gate); g = 0.0
for i in range(0, len(gate), 32):
    tgt = gate[i]; c = np.exp(-32 / ((0.06 if tgt > g else 0.35) * SR)); g = tgt + (g - tgt) * c; duck[i:i + 32] = g
lo = lp(mus, 220); hi_ = mus - lo
mus_d = lo * (1 - 0.35 * duck) + hi_ * (1 - 0.65 * duck)
sx_d = sx * (1 - 0.35 * duck)
meter = pyln.Meter(SR)
L = lambda x: meter.integrated_loudness(x.T if x.ndim == 2 else x)
v2 = np.stack([vo_p, vo_p]) * 0.7071
v2 *= 10 ** ((-15.5 - L(v2)) / 20)
bed = mus_d + sx_d * 0.9
bed *= 10 ** ((-21 - L(bed)) / 20)
full = v2 + bed
fade = int(1.0 * SR); full[:, -fade:] *= np.linspace(1, 0, fade) ** 1.5
full *= 10 ** ((-14 - L(full)) / 20)
up = resample_poly(full, 4, 1, axis=1)
up = fx(up.astype(np.float32), Pedalboard([Limiter(threshold_db=-1.6, release_ms=120)]))
full = resample_poly(up, 1, 4, axis=1)
full *= 10 ** ((-14 - L(full)) / 20)
tp = 20 * np.log10(np.abs(resample_poly(full, 4, 1, axis=1)).max())
if tp > -1.0:
    full *= 10 ** ((-1.0 - tp) / 20)
sf.write(os.path.join(R, 'audio', f'{reel}_music.wav'), (mus + sx).T, SR, subtype='FLOAT')
sf.write(os.path.join(R, 'audio', f'{reel}_mix.wav'), full.T, SR, subtype='PCM_24')
os.makedirs(os.path.join(FILM, 'public', 'audio'), exist_ok=True)
sf.write(os.path.join(FILM, 'public', 'audio', f'{reel}_mix.wav'), full.T, SR, subtype='PCM_24')
print(f'{reel}: {DUR:.2f}s  {L(full):.2f} LUFS  TP {20 * np.log10(np.abs(resample_poly(full, 4, 1, axis=1)).max()):.2f} dBTP')
