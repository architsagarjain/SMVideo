"""Music bed + sound design + Ruhaan VO for the 8 reels. Each video gets its own key, chords and groove;
hits land on the script lines the picture cuts on (film/src/data/r8/v<n>.json).
usage: python3 mix.py [n ...]  ->  reels8/audio/mix/v<n>_mix.wav (-14 LUFS, <= -1 dBTP) + film/public/audio/r8v<n>_mix.wav
"""
import json, os, sys
import numpy as np, soundfile as sf, pyloudnorm as pyln
HERE = os.path.dirname(os.path.abspath(__file__))
ROOTDIR = os.path.join(HERE, '..')
sys.path.insert(0, os.path.join(ROOTDIR, 'audio', 'scripts'))
from synth import *  # noqa
from scipy.signal import resample_poly
SUF = os.environ.get('SUF', '')   # e.g. SUF=hi for the Hinglish Video 3
FILM = os.path.join(ROOTDIR, 'film'); SFX = os.path.join(ROOTDIR, 'audio', 'sfx'); FPS = 30
CH = {'Dm': ['D4', 'F4', 'A4', 'E5'], 'Bb': ['Bb3', 'D4', 'F4', 'C5'], 'F': ['F3', 'A3', 'C4', 'G4'], 'C': ['C4', 'E4', 'G4', 'D5'],
      'Gm': ['G3', 'Bb3', 'D4', 'A4'], 'D': ['D4', 'F#4', 'A4', 'E5'], 'A': ['A3', 'C#4', 'E4', 'B4'], 'Bm': ['B3', 'D4', 'F#4', 'C#5'],
      'G': ['G3', 'B3', 'D4', 'A4'], 'Em': ['E4', 'G4', 'B4', 'F#5'], 'Am': ['A3', 'C4', 'E4', 'B4'], 'Eb': ['Eb4', 'G4', 'Bb4', 'F5']}
ROOT = {'Dm': 'D2', 'Bb': 'Bb1', 'F': 'F2', 'C': 'C2', 'Gm': 'G1', 'D': 'D2', 'A': 'A1', 'Bm': 'B1', 'G': 'G1', 'Em': 'E2', 'Am': 'A1', 'Eb': 'Eb2'}
B = 0.5

def rec(name, gain=1.0, dur=None):
    x, sr = sf.read(os.path.join(SFX, name), always_2d=True); x = x.T
    if dur: x = x[:, :int(dur * sr)]
    f = min(int(0.02 * SR), x.shape[1] // 2); x[:, -f:] *= np.linspace(1, 0, f)
    return x * gain

def run(n):
    d = json.load(open(os.path.join(FILM, 'src', 'data', 'r8', f'v{n}{SUF}.json')))
    FIN = d['words'][-1]['e']                     # the shared finale starts as the last word ends (film/src/r8/common8.tsx)
    DUR = (FIN + 165) / FPS; Ls = [(l['s'] / FPS, l['e'] / FPS) for l in d['lines']]
    END = (FIN + 10) / FPS
    HIT = (FIN + 46) / FPS                        # the finale's logo hit (S7Finale END = 46)
    music, sfx = Track(DUR), Track(DUR)

    def bars(t0, t1, seq, drums=True, gain=1.0, four=False, arp=False, pad=0.16, bass=True, swing=0.0):
        k, t = 0, t0
        while t < t1 - 0.05:
            c = seq[k % len(seq)]; dd = min(2.0, t1 - t)
            music.add(t, supersaw([m(x) for x in CH[c]], dd + 0.05, a=0.08, r=0.3, detune=0.15) * pad * gain)
            if bass:
                for j in range(int(dd / (B / 2))):
                    tn = t + j * B / 2 + (swing if j % 2 else 0); nn = int(0.2 * SR); note = m(ROOT[c]) + (12 if j % 4 == 3 else 0)
                    music.add(tn, lp(polyblep_saw(n2f(note), nn), 900) * adsr(nn, 0.003, 0.08, 0.4, 0.05) * 0.2 * gain)
                    music.add(tn, sub(note, 0.2, a=0.002, r=0.06) * 0.11 * gain)
            if drums:
                for bt in range(int(dd / B)):
                    tb = t + bt * B
                    if four or bt % 2 == 0: music.add(tb, kick(0.9) * 0.5 * gain)
                    if bt % 2 == 1: music.add(tb, clap() * 0.28 * gain)
                    music.add(tb + B / 2 + swing, hat() * 0.2 * gain)
            if arp:
                tones = [m(x) for x in CH[c][:3]]; pat = [tones[0], tones[1], tones[2], tones[0] + 12]
                for s_ in range(int(dd / (B / 2))):
                    music.add(t + s_ * B / 2, pluck(pat[s_ % 4] + 12, 0.4, bright=0.6, decay=6) * 0.09 * gain)
            k += 1; t += 2.0

    def sig(t):
        music.add(t, bell(m('D5'), 2.6) * 0.42); music.add(t + 0.19, bell(m('A5'), 2.4) * 0.36)
        music.add(t + 0.42, bell(m('D6'), 2.2) * 0.34); music.add(t + 0.42, bell(m('F#5'), 2.2) * 0.24)

    def ending(hit, chord=('D3', 'A3', 'D4', 'F#4', 'A4', 'E5')):
        music.add(hit - 1.4, riser(1.4, f0=400, f1=12000, curve=2.4) * 0.4)
        music.add(hit - 0.9, reverse_swell(0.9) * 0.6)
        music.add(hit, impact(3.0, 1.0) * 1.0)
        music.add(hit, supersaw([m(x) for x in chord], DUR - hit + 0.5, a=0.01, r=2.4, detune=0.2) * 0.3)
        music.add(hit, sub(m('D1'), DUR - hit + 0.5, a=0.005, r=2.4, drive=0.5) * 0.3)
        sig(hit + 0.38)

    wh = lambda t, g=0.55: sfx.add(t - 0.25, whoosh(0.45, 300, 5500, 0.5, 0.7, -0.7) * g)
    L = lambda i: Ls[i][0]
    brand = Ls[-1][0]
    if n == 1:   # journey: warm D major, steady travelling groove
        music.add(0, supersaw([m(x) for x in ['D3', 'A3', 'D4']], L(1), a=0.5, r=0.4, detune=0.1) * 0.18)
        music.add(0, rec('amb_wind_meadow_light.wav', 0.5, L(1) + 0.5))
        bars(L(1) - 0.05, brand, ['D', 'A', 'Bm', 'G'], drums=True, arp=True, gain=0.85)
        for i in range(1, 5): wh(L(i)); sfx.add(L(i) + 0.15, bell(m('A5'), 0.8) * 0.18)
        for k in range(5): sfx.add(L(5) + 0.9 + k * 0.55, tick(2200, 0.05) * 0.7)
        ending(HIT)
    elif n == 2:  # myth / fact: punchy A minor, card flips
        music.add(0, impact(1.6, 0.5) * 0.4)
        bars(L(1) - 0.05, brand, ['Am', 'F', 'C', 'G'], drums=True, four=True, gain=0.85)
        for i in (1, 3, 5, 7): wh(L(i), 0.6); sfx.add(L(i) + 0.05, rec('glitch_short.wav', 0.25, 0.3))
        for i in (2, 4, 6, 8): sfx.add(L(i) - 0.15, whoosh(0.35, 800, 6000, 0.45, -0.6, 0.6) * 0.5); sfx.add(L(i) + 0.1, bell(m('E6'), 0.7) * 0.25)
        ending(HIT, ('A2', 'E3', 'A3', 'C4', 'E4', 'B4'))
    elif n == 3:  # versus: E minor, split hits
        music.add(0, impact(1.4, 0.5) * 0.45); sfx.add(0.6, rec('hit_drum_deep.wav', 0.5))
        bars(L(1) - 0.05, brand, ['Em', 'C', 'G', 'D'], drums=True, gain=0.8, arp=True)
        for i in (1, 2, 3, 4): wh(L(i), 0.5)
        sfx.add(L(5), impact(0.9, 0.35) * 0.3)
        ending(HIT, ('E3', 'B3', 'E4', 'G4', 'B4', 'F#5'))
    elif n == 4:  # map tour: airy F, arp only until the problem line
        music.add(0, shimmer(3.0, density=30, lo=2500, hi=9000, seed=4) * 0.5)
        bars(0.3, L(7), ['F', 'C', 'Dm', 'Bb'], drums=False, arp=True, gain=0.9, pad=0.13)
        bars(L(7), brand, ['Dm', 'Bb', 'F', 'C'], drums=True, gain=0.85)
        for i in range(1, 6): sfx.add(L(i) - 0.2, whoosh(0.5, 250, 3500, 0.45, 0, 0) * 0.45); sfx.add(L(i) + 0.3, blip(84, 0.12) * 0.35)
        ending(HIT, ('F2', 'C3', 'F3', 'A3', 'C4', 'G4'))
    elif n == 5:  # checklist: bright G, a tick per box
        bars(0.3, brand, ['G', 'D', 'Em', 'C'], drums=True, gain=0.75, swing=0.04)
        for i in range(1, 6):
            sfx.add(L(i) + 0.35, rec('ui_click_device.wav', 0.5) if os.path.exists(os.path.join(SFX, 'ui_click_device.wav')) else tick(2000, 0.05))
            sfx.add(L(i) + 0.4, bell(m('B5'), 0.6) * 0.22)
        sfx.add(L(7), rec('hit_soft_drum_subtle.wav', 0.5))
        ending(HIT, ('G2', 'D3', 'G3', 'B3', 'D4', 'A4'))
    elif n == 6:  # countdown: grey drone + clock, rewind, then warm D with drums
        t_rw = L(5)
        music.add(0, supersaw([m(x) for x in ['D3', 'A3', 'C4']], t_rw, a=1.0, r=0.6, detune=0.25) * 0.15)
        music.add(0, sub(m('D1'), t_rw, a=0.5, r=0.5) * 0.18)
        for k in range(int(t_rw / B)): sfx.add(k * B, tick(1800 if k % 2 else 1400, 0.04) * 0.45)
        sfx.add(L(3) + 2.2, rec('fire_fast_ignition.wav', 0.45, 2.0))
        sfx.add(L(4), rec('amb_wind_blowing.wav', 0.35, 3.0))
        music.add(t_rw - 1.2, reverse_swell(1.2) * 0.8); sfx.add(t_rw - 0.6, rec('glitch_whoosh_stutter.wav', 0.4))
        bars(t_rw + 0.1, brand, ['D', 'A', 'G', 'D'], drums=True, arp=True, gain=0.85)
        ending(HIT)
    elif n == 7:  # quiz: playful C, countdown blips in the pauses, reveal chime
        bars(0.3, brand, ['C', 'Am', 'F', 'G'], drums=True, gain=0.7, arp=True, pad=0.12)
        for i in (2, 4, 6, 8):
            for k in range(3): sfx.add(L(i) - 1.5 + k * 0.45, blip(79 + k * 2, 0.1) * 0.45)
            sfx.add(L(i) - 0.05, bell(m('C6'), 1.0) * 0.32); sfx.add(L(i) - 0.05, bell(m('G6'), 0.9) * 0.2)
        ending(HIT, ('C3', 'G3', 'C4', 'E4', 'G4', 'D5'))
    elif n == 8:  # manifesto: noisy start, then quiet pads; groove enters with the features
        for k, t in enumerate(np.arange(L(1), L(2), 0.35)): sfx.add(t, blip(88 + (k % 3) * 3, 0.08) * 0.3)
        sfx.add(L(1), rec('glitch_static.wav', 0.25, 2.0))
        music.add(L(2), supersaw([m(x) for x in ['Bb2', 'F3', 'D4']], L(6) - L(2), a=1.0, r=0.6, detune=0.12) * 0.14)
        music.add(L(5), shimmer(2.0, density=30, lo=2500, hi=9000, seed=8) * 0.5)
        sfx.add(L(6) - 0.1, impact(1.2, 0.5) * 0.4)
        bars(L(7) - 0.05, brand, ['Bb', 'F', 'Gm', 'D'], drums=True, gain=0.8, arp=True)
        for i in (7, 8, 9, 10): wh(L(i), 0.45)
        ending(HIT)

    # ---------------------------------------------------------------- mix (as in the approved reels)
    N = int(DUR * SR)
    vo, sr = sf.read(os.path.join(HERE, 'audio', 'vo', f'v{n}{SUF}.wav')); assert sr == SR
    voT = np.zeros(N); i0 = int(d['offset'] * SR); voT[i0:i0 + len(vo)] = vo[: N - i0]
    vo_p = fx(voT.astype(np.float32), Pedalboard([HighpassFilter(cutoff_frequency_hz=80), Compressor(threshold_db=-20, ratio=3, attack_ms=5, release_ms=80)]))
    mus = fx(music.buf[:, :N].astype(np.float32), Pedalboard([HighpassFilter(cutoff_frequency_hz=30), Chorus(rate_hz=0.3, depth=0.15, mix=0.2), Reverb(room_size=0.7, wet_level=0.22, dry_level=0.9, width=1.0)]))
    sx = fx(sfx.buf[:, :N].astype(np.float32), Pedalboard([Reverb(room_size=0.4, wet_level=0.12, dry_level=1.0)]))
    env = np.convolve(np.abs(vo_p), np.ones(int(0.05 * SR)) / int(0.05 * SR), mode='same')
    gate = (env > 0.01).astype(float); duck = np.zeros_like(gate); g = 0.0
    for i in range(0, len(gate), 32):
        tgt = gate[i]; c = np.exp(-32 / ((0.06 if tgt > g else 0.35) * SR)); g = tgt + (g - tgt) * c; duck[i:i + 32] = g
    lo = lp(mus, 220); hi_ = mus - lo
    mus_d = lo * (1 - 0.35 * duck) + hi_ * (1 - 0.65 * duck); sx_d = sx * (1 - 0.35 * duck)
    meter = pyln.Meter(SR); LU = lambda x: meter.integrated_loudness(x.T if x.ndim == 2 else x)
    v2 = np.stack([vo_p, vo_p]) * 0.7071; v2 *= 10 ** ((-15.5 - LU(v2)) / 20)
    bed = mus_d + sx_d * 0.9; bed *= 10 ** ((-21 - LU(bed)) / 20)
    full = v2 + bed
    fade = int(1.0 * SR); full[:, -fade:] *= np.linspace(1, 0, fade) ** 1.5
    full *= 10 ** ((-14 - LU(full)) / 20)
    up = resample_poly(full, 4, 1, axis=1); up = fx(up.astype(np.float32), Pedalboard([Limiter(threshold_db=-1.6, release_ms=120)]))
    full = resample_poly(up, 1, 4, axis=1); full *= 10 ** ((-14 - LU(full)) / 20)
    tp = 20 * np.log10(np.abs(resample_poly(full, 4, 1, axis=1)).max())
    if tp > -1.0: full *= 10 ** ((-1.0 - tp) / 20)
    os.makedirs(os.path.join(HERE, 'audio', 'mix'), exist_ok=True)
    sf.write(os.path.join(HERE, 'audio', 'mix', f'v{n}{SUF}_mix.wav'), full.T, SR, subtype='PCM_24')
    os.makedirs(os.path.join(FILM, 'public', 'audio'), exist_ok=True)
    sf.write(os.path.join(FILM, 'public', 'audio', f'r8v{n}{SUF}_mix.wav'), full.T, SR, subtype='PCM_24')
    print(f'v{n}{SUF}: {DUR:.2f}s  {LU(full):.2f} LUFS  TP {20 * np.log10(np.abs(resample_poly(full, 4, 1, axis=1)).max()):.2f} dBTP')

if __name__ == '__main__':
    for n in (map(int, sys.argv[1:]) if len(sys.argv) > 1 else range(1, 9)): run(n)
