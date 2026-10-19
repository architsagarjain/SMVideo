"""Music bed + sound design + Ruhaan VO for Videos 9-16. Each video gets its own key, chords and groove;
hits land on the script lines the picture cuts on (film/src/data/r9/v<n>.json).
usage: python3 mix.py [n ...]  ->  reels9/audio/mix/v<n>_mix.wav (-14 LUFS, <= -1 dBTP) + film/public/audio/r9v<n>_mix.wav
"""
import json, os, sys
import numpy as np, soundfile as sf, pyloudnorm as pyln
HERE = os.path.dirname(os.path.abspath(__file__))
ROOTDIR = os.path.join(HERE, '..')
sys.path.insert(0, os.path.join(ROOTDIR, 'audio', 'scripts'))
from synth import *  # noqa
from scipy.signal import resample_poly
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
    d = json.load(open(os.path.join(FILM, 'src', 'data', 'r9', f'v{n}.json')))
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
    nrm = lambda t: ''.join(ch for ch in t.lower() if ch.isalnum())
    def Wd(w, nth=0, frm=0):
        hits = [x for x in d['words'] if x['li'] >= frm and nrm(x['w']) == nrm(w)]
        return hits[nth]['s'] / FPS
    brand = Ls[-1][0]
    if n == 9:   # factory line: driving E minor, a metal hit per station
        music.add(0, rec('ind_machine_hum.wav', 0.35, L(1) + 1))
        sfx.add(Wd('Hard') - 0.1, rec('ind_pour_gravel_avalanche.wav', 0.35, 1.6))
        bars(L(1) - 0.05, L(8), ['Em', 'C', 'G', 'D'], drums=True, four=True, gain=0.8)
        for i in range(1, 7): sfx.add(L(i) - 0.02, rec('ind_factory_metal_hit.wav', 0.45)); wh(L(i), 0.35)
        sfx.add(L(7), rec('ind_gear_lock.wav', 0.5))
        bars(L(8), brand + 4, ['G', 'D', 'Em', 'C'], drums=False, arp=True, gain=0.7)
        ending(HIT, ('E3', 'B3', 'E4', 'G4', 'B4', 'F#5'))
    elif n == 10:  # clock day: warm G, a clock tick under the morning, a chime per timestamp
        music.add(0, rec('amb_wind_meadow_light.wav', 0.45, L(1) + 0.5))
        for k in range(int(L(1) / B)): sfx.add(k * B, tick(1700 if k % 2 else 1300, 0.035) * 0.35)
        bars(L(1) - 0.05, L(6), ['G', 'D', 'Em', 'C'], drums=True, arp=True, gain=0.8, swing=0.03)
        for i in range(0, 6): sfx.add(L(i) + 0.02, bell(m('B5'), 0.9) * 0.22); sfx.add(L(i) + 0.14, bell(m('D6'), 0.8) * 0.16)
        for i in range(1, 6): wh(L(i), 0.4)
        music.add(L(6), shimmer(2.5, density=30, lo=2500, hi=9000, seed=10) * 0.5)
        bars(L(6), brand + 4, ['C', 'G', 'D', 'G'], drums=False, gain=0.75)
        ending(HIT, ('G2', 'D3', 'G3', 'B3', 'D4', 'A4'))
    elif n == 11:  # red flags: tense D minor, a deep hit as each flag plants, a clean chime on VERIFY
        music.add(0, rec('sub_undertone_bass.wav', 0.4))
        sfx.add(0.1, rec('impact_whoosh_deep.wav', 0.4))
        for k in range(4): sfx.add(0.25 + k * 0.2, rec('hit_drum_deep.wav', 0.3))
        bars(L(1) - 0.05, L(6), ['Dm', 'Bb', 'Gm', 'A'], drums=True, gain=0.75)
        for i in range(1, 5): sfx.add(L(i) - 0.02, rec('hit_drum_deep.wav', 0.55)); sfx.add(L(i) + 0.05, rec('glitch_short.wav', 0.2, 0.3))
        sfx.add(Wd('Two', 0, 5), impact(1.0, 0.4) * 0.35)
        sfx.add(L(6) + 8 / FPS, rec('ui_notify_hint.wav', 0.5)); sfx.add(L(6) + 8 / FPS, bell(m('A5'), 1.2) * 0.3)
        bars(L(6), brand + 4, ['F', 'C', 'Dm', 'Bb'], drums=False, arp=True, gain=0.7)
        ending(HIT, ('D3', 'A3', 'D4', 'F4', 'A4', 'E5'))
    elif n == 12:  # calendar: airy F, the wheel turns with a soft whoosh, drums arrive with the advice
        music.add(0, shimmer(3.0, density=30, lo=2500, hi=9000, seed=12) * 0.5)
        bars(0.3, L(6), ['F', 'C', 'Dm', 'Bb'], drums=False, arp=True, gain=0.85, pad=0.13)
        for i in range(1, 6): sfx.add(L(i) - 0.25, whoosh(0.6, 250, 3000, 0.4, -0.5, 0.5) * 0.4); sfx.add(L(i) + 0.3, blip(84, 0.12) * 0.3)
        bars(L(6), brand + 4, ['Dm', 'Bb', 'F', 'C'], drums=True, gain=0.8)
        ending(HIT, ('F2', 'C3', 'F3', 'A3', 'C4', 'G4'))
    elif n == 13:  # torrefaction: fire bed, typewriter ticks for the word, an ember chime per benefit
        music.add(0, rec('fire_big_burning.wav', 0.3, L(2)))
        t0 = Wd('Torrefaction') - 4 / FPS
        for k in range(15): sfx.add(t0 + k / (0.9 * FPS), tick(2600, 0.03) * 0.5)
        bars(L(1) - 0.05, L(3), ['Am', 'F', 'C', 'G'], drums=False, arp=True, gain=0.75)
        sfx.add(L(2), rec('hit_soft_drum_subtle.wav', 0.5))
        sfx.add(L(3), rec('hit_rising_thud.wav', 0.4))
        bars(L(3) + 0.3, brand + 4, ['Am', 'F', 'C', 'G'], drums=True, gain=0.8, arp=True)
        for i in (4, 5, 6): sfx.add(L(i), bell(m('E6'), 1.0) * 0.3); sfx.add(L(i), rec('sparkle_touch.wav', 0.3))
        ending(HIT, ('A2', 'E3', 'A3', 'C4', 'E4', 'B4'))
    elif n == 14:  # two phones: moody B minor; the music drops out on "never found each other", then returns
        bars(0.3, L(6), ['Bm', 'G', 'D', 'A'], drums=True, gain=0.7, pad=0.14)
        sfx.add(Wd('calls'), rec('ui_notify_dry_popup.wav', 0.4)); sfx.add(Wd('checks'), rec('ui_click_hover.wav', 0.4))
        for k in range(3): sfx.add(Wd('prices') - 0.25 + k * 0.17, blip(76 + k * 3, 0.1) * 0.35)
        sfx.add(L(6), reverse_swell(0.8) * 0.4)
        music.add(L(6), supersaw([m(x) for x in ['B2', 'F#3', 'D4']], L(7) - L(6) + 0.6, a=0.3, r=0.8, detune=0.1) * 0.12)
        bars(L(7), brand + 4, ['G', 'D', 'A', 'Bm'], drums=True, gain=0.8, arp=True)
        sfx.add(L(8), rec('sparkle_light_sweep.wav', 0.4))
        ending(HIT, ('B2', 'F#3', 'B3', 'D4', 'F#4', 'C#5'))
    elif n == 15:  # inbox: light, bright C with a little swing; a notification on each question
        bars(0.3, L(7), ['C', 'G', 'Am', 'F'], drums=True, gain=0.65, swing=0.05, pad=0.12, arp=True)
        for i in (1, 3, 5): sfx.add(L(i) - 0.05, rec('ui_notify_technology.wav', 0.45))
        for i in (2, 4, 6): sfx.add(L(i), bell(m('G5'), 0.8) * 0.22)
        for k in range(10): sfx.add(Wd('Drop') + k * 0.06, tick(2400, 0.02) * 0.35)
        sfx.add(Wd('comments'), rec('ui_click_device.wav', 0.5))
        bars(L(7), brand + 4, ['F', 'C', 'G', 'C'], drums=False, gain=0.7)
        ending(HIT, ('C3', 'G3', 'C4', 'E4', 'G4', 'D5'))
    elif n == 16:  # rapid fire: high-energy E minor, an impact on every number
        music.add(0, rec('riser_space_stutter.wav', 0.3, L(1)))
        for k in range(5): sfx.add(0.1 * k + 0.05, blip(72 + k * 2, 0.08) * 0.35)
        bars(L(1) - 0.05, L(6), ['Em', 'C', 'G', 'D'], drums=True, four=True, gain=0.85, arp=True)
        for i in range(1, 6):
            sfx.add(L(i) - 0.07, impact(0.8, 0.5) * 0.45); sfx.add(L(i) + 9 / FPS - 0.05, rec('glitch_short.wav', 0.3, 0.3))
            for k in range(3): sfx.add(L(i) + 9 / FPS + (k + 1) * 22 / FPS, tick(3000, 0.02) * 0.3)
        sfx.add(L(6), rec('sparkle_sweep_intro.wav', 0.4))
        bars(L(6), brand + 4, ['C', 'G', 'D', 'Em'], drums=True, gain=0.75)
        ending(HIT, ('E3', 'B3', 'E4', 'G4', 'B4', 'F#5'))

    # ---------------------------------------------------------------- mix (as in the approved reels)
    N = int(DUR * SR)
    vo, sr = sf.read(os.path.join(HERE, 'audio', 'vo', f'v{n}.wav')); assert sr == SR
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
    sf.write(os.path.join(HERE, 'audio', 'mix', f'v{n}_mix.wav'), full.T, SR, subtype='PCM_24')
    os.makedirs(os.path.join(FILM, 'public', 'audio'), exist_ok=True)
    sf.write(os.path.join(FILM, 'public', 'audio', f'r9v{n}_mix.wav'), full.T, SR, subtype='PCM_24')
    print(f'v{n}: {DUR:.2f}s  {LU(full):.2f} LUFS  TP {20 * np.log10(np.abs(resample_poly(full, 4, 1, axis=1)).max()):.2f} dBTP')

if __name__ == '__main__':
    for n in (map(int, sys.argv[1:]) if len(sys.argv) > 1 else range(9, 17)): run(n)
