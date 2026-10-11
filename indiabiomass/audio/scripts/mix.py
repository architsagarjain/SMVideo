"""Sound design + final mix for the IndiaBiomass film.

Inputs:  audio/narration.wav (build_vo.py), audio/stems/music.wav (score.py),
         audio/sfx/*.wav (licensed recordings, optional; see sfx_manifest.json)
Outputs: audio/stems/sfx.wav
         audio/music_and_sfx.wav        music + sound design, no narration
         audio/final_mix.wav            everything, -14 LUFS integrated, <= -1 dBTP
"""
import glob, os
import numpy as np
import soundfile as sf
import pyloudnorm as pyln
from synth import *  # noqa

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DUR = 60.0
N = int(DUR * SR)
fps = 30.0
F = lambda frame: frame / fps  # film frame -> seconds


def rec(name, gain=1.0, start=0.0, dur=None, fade=0.05):
    """Load a licensed recording from audio/sfx (stereo), trimmed and faded."""
    path = os.path.join(ROOT, 'sfx', name)
    if not os.path.exists(path):
        return None
    x, sr = sf.read(path, always_2d=True)
    assert sr == SR, (name, sr)
    x = x.T[:, int(start * SR):]
    if dur:
        x = x[:, :int(dur * SR)]
    if x.shape[0] == 1:
        x = np.vstack([x, x])
    fn = min(int(fade * SR), x.shape[1] // 2)
    if fn:
        x[:, :fn] *= np.linspace(0, 1, fn)
        x[:, -fn:] *= np.linspace(1, 0, fn)
    return x * gain


def first(*names, **kw):
    for n in names:
        y = rec(n, **kw)
        if y is not None:
            return y
    return None


S = Track(DUR)
add = S.add


def add_rec_or(t, names, synth_fn, gain=1.0, **kw):
    y = first(*names, **kw) if names else None
    add(t, y if y is not None else synth_fn(), gain)


def rumble(dur, lo=25, hi=110):
    n = int(dur * SR)
    y = bp(noise(n), lo, hi) * 3
    y += sine(38, n) * 0.25 * (0.6 + 0.4 * np.sin(np.arange(n) / SR * 2 * np.pi * 0.7))
    return y * adsr(n, dur * 0.6, 0.1, 0.9, dur * 0.3)


def wind(dur, gain=1.0, seed=0):
    n = int(dur * SR)
    r = np.random.default_rng(seed)
    base = bp(r.standard_normal(n), 150, 2500)
    gust = np.interp(np.arange(n), np.linspace(0, n, 12), r.uniform(0.4, 1.0, 12))
    return np.stack([base * gust, bp(r.standard_normal(n), 150, 2500) * gust]) * 0.18 * gain * adsr(n, 0.4, 0.1, 1, 0.6)


def rustle_to_data(dur):
    """Crop rustle that gradually becomes digital: noise grains -> bit-crushed blips."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.zeros((2, n))
    r = np.random.default_rng(8)
    for _ in range(int(dur * 70)):
        i = r.integers(0, n - 4000)
        u = i / n  # 0 = organic, 1 = digital
        g = int(r.uniform(0.01, 0.05) * SR)
        if r.random() > u:
            s = hp(r.standard_normal(g), 2500) * np.hanning(g) * 0.25
        else:
            f = r.choice([1760, 2093, 2637, 3136, 3520])
            s = np.sign(np.sin(2 * np.pi * f * np.arange(g) / SR)) * np.hanning(g) * 0.06
        out[:, i:i + g] += pan(s, r.uniform(-0.8, 0.8))
    return out


def crackle(dur, density0=10, density1=120, seed=4):
    """Network spreading: tiny electric clicks, accelerating."""
    n = int(dur * SR)
    out = np.zeros((2, n))
    r = np.random.default_rng(seed)
    t = 0.0
    while t < dur - 0.02:
        u = t / dur
        dens = density0 + (density1 - density0) * u ** 1.5
        g = int(0.012 * SR)
        f = r.uniform(2500, 7000)
        s = np.sin(2 * np.pi * f * np.arange(g) / SR) * np.exp(-np.arange(g) / SR * 500) * r.uniform(0.05, 0.16)
        i = int(t * SR)
        out[:, i:i + g] += pan(s, r.uniform(-0.9, 0.9))
        t += r.exponential(1 / dens)
    return out


def zap(dur=0.35, f0=900, f1=3200):
    n = int(dur * SR)
    tt_ = np.arange(n) / SR
    f = f0 * (f1 / f0) ** (tt_ / dur)
    y = sine(f, n) * np.exp(-tt_ * 9) * 0.3 + hp(noise(n), 4000) * np.exp(-tt_ * 40) * 0.08
    return y


def pop():
    n = int(0.09 * SR)
    t_ = np.arange(n) / SR
    return sine(900 * np.exp(-t_ * 30) + 500, n) * np.exp(-t_ * 45) * 0.35


def fail_fizzle(seed):
    return glitch(0.22, seed=seed) * 0.6


# =========================================================== S1 00:00-00:06
add(0.0, rumble(3.0), 0.6)
add(0.12, bell(96, 1.5) * 0.25)                                  # the first point of light
add(0.45, shimmer(2.3, density=55, lo=5000, hi=11000, seed=11) * 0.6)  # it multiplies
add(1.4, whoosh(1.3, f0=120, f1=5000, peak=0.85, pan_from=0, pan_to=0), 0.45)  # acceleration
add_rec_or(2.48, ['whoosh_cinematic_fast.wav'], lambda: whoosh(0.5, 400, 6000, 0.4), 0.5)
add(2.6, impact(2.0, 0.5), 0.35)
add_rec_or(2.6, ['amb_wind_wild_land.wav'], lambda: wind(3.6), 0.35, dur=3.6, fade=0.5)
add_rec_or(3.85, ['rustle_grass_handling.wav'], lambda: np.zeros(10), 0.6, start=1.0, dur=1.6, fade=0.4)
add(3.9, rustle_to_data(2.2), 1.0)                                 # hero moment 1 in sound

# =========================================================== S2 00:06-00:15
add_rec_or(5.95, ['whoosh_air_quick.wav'], lambda: whoosh(0.45, 300, 4000, 0.5, 0.8, -0.8), 0.45)
add(6.0, impact(1.2, 0.4), 0.3)
for i in range(9):  # reaching lines, each one failing
    t0 = 6.0 + F(18 + i * 19 + (i * 7 % 8))
    add(t0, pan(zap(0.4, 600, 1800), -0.6 if i % 2 == 0 else 0.6), 0.5)
    add(t0 + 0.75, pan(fail_fizzle(i), 0.6 if i % 2 == 0 else -0.6), 0.55)
for i, tn in enumerate([6.9, 7.6, 8.3, 9.1, 9.8, 10.6, 11.4, 12.1]):  # fragments: paper + notification shards
    if i % 2 == 0:
        add_rec_or(tn, ['paper_moving_wrinkling.wav'], lambda: hp(noise(int(0.25 * SR)), 2000) * np.exp(-np.arange(int(0.25 * SR)) / SR * 14) * 0.15, 0.9, start=i * 0.6, dur=0.6, fade=0.08)
    else:
        add(tn, pan(blip(88 + i, 0.1), (i % 3 - 1) * 0.7), 0.4)
for tn in [F(180 + 44), F(180 + 142), F(180 + 200)]:  # word slams
    add(tn, glitch(0.18, seed=int(tn * 10)), 0.4)
    add_rec_or(tn, ['glitch_static_electric.wav'], lambda: np.zeros(10), 0.3)
    add(tn, kick(0.6, 0.25, 120, 60), 0.25)
add(F(180 + 196), whoosh(0.6, 200, 3000, 0.4, -0.9, 0.9), 0.7)  # panels part, map appears
add(F(180 + 236), whoosh(1.0, 150, 9000, 0.92, 0, 0), 0.95)       # the dive

# =========================================================== S3 00:15-00:23
for k in range(2):  # the seed node pulses in the silence
    add(15.05 + k * 0.33, sub(m('D2'), 0.25, a=0.005, r=0.2), 0.18)
add(F(450 + 34), zap(0.5, 1200, 2400), 0.7)
add(F(450 + 46), zap(0.5, 1400, 2800), 0.6)
add(F(450 + 52), crackle(F(66), 12, 160), 1.0)
add(F(450 + 118), whoosh(1.0, 3000, 200, 0.85, 0, 0), 0.6)      # everything condenses inward
add(20.0, shimmer(2.0, density=40, lo=3000, hi=10000, seed=21), 1.2)
add_rec_or(19.99, ['impact_big_cinematic.wav'], lambda: np.zeros(10), 0.4, dur=4.0, fade=0.01)
add_rec_or(20.0, ['sparkle_light_sweep.wav'], lambda: np.zeros(10), 0.25)

# =========================================================== S4 00:23-00:37
add(23.0, whoosh(0.5, 300, 4000, 0.5, 0, 0), 0.6)
add(F(690 + 18), zap(0.8, 400, 2400), 0.55)                          # the bridge forms
add(F(690 + 40), bell(91, 1.0) * 0.4 + 0, 0.6)                        # ...and locks
add(F(690 + 30), pan(pop(), -0.6), 0.6)                                # verified badges
add(F(690 + 44), pan(pop(), 0.6), 0.6)
for tn in [26.5, 30.5, 34.0]:                                          # iris match cuts
    add(tn - 0.32, whoosh(0.55, 200, 5000, 0.6, -0.5, 0.5), 0.75)
for tn in [F(690 + 105 + 50), F(690 + 225 + 44), F(690 + 330 + 44)]:  # product cards
    add(tn, whoosh(0.35, 800, 6000, 0.4, 0.3, -0.3), 0.35)
    add_rec_or(tn + 0.3, ['ui_select_modern.wav'], lambda: tick(2400, 0.04), 0.5)
add_rec_or(34.0, ['ind_machine_engine_hum_loop.wav'], lambda: np.zeros(10), 0.5, dur=2.9, fade=0.3)
add_rec_or(34.0, ['ind_gear_lock.wav'], lambda: np.zeros(10), 0.5)
add_rec_or(26.45, ['ind_pour_gravel_avalanche.wav'], lambda: np.zeros(10), 0.9)
add_rec_or(34.0, ['ind_factory_metal_hit.wav'], lambda: metal(48, 0.6) * 0.8, 0.35)
add(36.55, whoosh(0.45, 4000, 150, 0.3, 0, 0), 0.5)                  # drop into the dark interface world

# =========================================================== S5 00:37-00:47
add(37.0, whoosh(0.7, 150, 3500, 0.6, 0, 0), 0.6)
for i in range(3):                                                     # tender rows land
    tn = F(1110 + 20 + i * 10) + 0.35
    add_rec_or(tn, ['ui_click_device.wav'], lambda: tick(2600 + i * 300), 0.4)
    add(tn, pan(blip(84 + i * 3, 0.12), -0.3 + i * 0.3), 0.35)
for tn in [F(1110 + 105) - 0.3, F(1110 + 180) - 0.3]:                 # whip pans
    add_rec_or(tn, ['whippan_fast_swipe_zoom.wav'], lambda: whoosh(0.35, 500, 7000, 0.45, 0.9, -0.9), 0.45)
add(F(1110 + 113), zap(1.3, 300, 1500) * 0.6, 0.6)                    # chart line drawing
add(F(1110 + 113), crackle(1.2, 30, 60, seed=9) * 0.6, 1.0)
for i in range(6):                                                     # supply markers
    add(F(1110 + 180 + 14 + i * 5), pan(blip(76 + [0, 3, 7, 10, 12, 15][i], 0.15), -0.5 + i * 0.2), 0.45)
add(F(1110 + 220), whoosh(0.4, 900, 5000, 0.5, 0.4, -0.2), 0.35)
add(F(1110 + 262), whoosh(0.8, 5000, 300, 0.75, 0, 0), 0.5)         # all in one place
add(F(1110 + 286), tick(1800, 0.05), 0.6)

# =========================================================== S6 00:47-00:55
add_rec_or(47.0, ['amb_wind_wild_land.wav'], lambda: wind(2.0, seed=3), 0.28, start=5.0, dur=2.0, fade=0.5)
for i in range(4):
    add(47.0 + ((i + 1) / 5) * F(172), bell(86 + [0, 5, 7, 12][i], 1.2) * 0.35, 0.6)
add(49.0, whoosh(0.4, 300, 3000, 0.5, -0.6, 0.6), 0.4)
add(51.0, whoosh(0.4, 300, 3000, 0.5, 0.6, -0.6), 0.4)
add_rec_or(51.0, ['fire_big_flame_burning.wav'], lambda: lp(noise(int(2 * SR)), 400) * 0.1, 0.35, dur=1.9, fade=0.3)
add(F(1410 + 176), shimmer(1.5, density=50, lo=2500, hi=8000, seed=31), 1.0)

# =========================================================== S7 00:55-01:00
add(55.0, whoosh(1.6, 100, 2500, 0.8, 0, 0), 0.6)                     # rising above the land
add(55.0, crackle(1.6, 10, 140, seed=13), 0.9)
add_rec_or(56.73, ['impact_trailer_epic.wav'], lambda: np.zeros(10), 0.4, dur=3.0, fade=0.01)
add_rec_or(56.73, ['sub_futuristic_bass_hit.wav'], lambda: np.zeros(10), 0.3)

sfx = S.buf[:, :N]
sfx = fx(sfx.astype(np.float32), Pedalboard([Reverb(room_size=0.5, wet_level=0.12, dry_level=1.0, width=1.0)]))

# =========================================================== mix
vo, sr = sf.read(os.path.join(ROOT, 'narration.wav'))
vo = vo[:N]
music, sr2 = sf.read(os.path.join(ROOT, 'stems', 'music.wav'), always_2d=True)
music = music.T[:, :N]
vo_proc = fx(vo.astype(np.float32), Pedalboard([
    HighpassFilter(cutoff_frequency_hz=80),
    Compressor(threshold_db=-20, ratio=3, attack_ms=5, release_ms=80),
    Reverb(room_size=0.25, wet_level=0.06, dry_level=1.0),
]))

# ducking: follow the narration envelope (fast attack, slow release)
env = np.abs(vo_proc)
win = int(0.05 * SR)
env = np.convolve(env, np.ones(win) / win, mode='same')
gate = (env > 0.01).astype(float)
# smooth: attack 60 ms, release 350 ms
duck = np.zeros_like(gate)
a_att, a_rel = np.exp(-1 / (0.06 * SR)), np.exp(-1 / (0.35 * SR))
g = 0.0
for i in range(0, len(gate), 32):  # block-wise for speed
    target = gate[i]
    coef = a_att if target > g else a_rel
    g = target + (g - target) * coef ** 32
    duck[i:i + 32] = g
# speech-band ducking: mids/highs dip ~10 dB under speech, the low end only ~4 dB
music_lo = lp(music, 220)
music_hi = music - music_lo
music_d = music_lo * (1 - 0.38 * duck) + music_hi * (1 - 0.68 * duck)
sfx_d = sfx * (1 - 0.45 * duck)

meter = pyln.Meter(SR)
def lufs(x):
    return meter.integrated_loudness(x.T if x.ndim == 2 else x)

# reference levels before the master: music+sfx bed ~ -19 LUFS, narration ~ -16 LUFS
bed = music_d + sfx_d * 0.9
vo_st = np.stack([vo_proc, vo_proc]) * 0.7071
vo_st *= 10 ** ((-15.5 - lufs(vo_st)) / 20)
bed *= 10 ** ((-20.5 - lufs(bed)) / 20)
full = vo_st + bed

# intelligibility report: speech-band level of narration vs bed, per phrase
import json
vb, bb = bp(vo_st[0], 300, 4000), bp(bed.mean(0), 300, 4000)
margins = []
for p_ in json.load(open(os.path.join(ROOT, '..', 'film', 'src', 'data', 'vo.json')))['phrases']:
    a, b = int(p_['start'] * SR), int(p_['end'] * SR)
    mg = 20 * np.log10(np.sqrt((vb[a:b] ** 2).mean()) / np.sqrt((bb[a:b] ** 2).mean()))
    margins.append(mg)
    print(f"  {p_['start']:6.2f}  {mg:5.1f} dB  {p_['text'][:40]}")
print('speech-band margin min', round(min(margins), 1), 'median', round(float(np.median(margins)), 1))

def master(x, target=-14.0):
    x = x * 10 ** ((target - lufs(x)) / 20)
    # true-peak-safe limiting: oversample x4, limit, back down
    from scipy.signal import resample_poly
    up = resample_poly(x, 4, 1, axis=1)
    lim = fx(up.astype(np.float32), Pedalboard([Limiter(threshold_db=-1.6, release_ms=120)]))
    y = resample_poly(lim, 1, 4, axis=1)
    y = y * 10 ** ((target - lufs(y)) / 20)
    tp = 20 * np.log10(np.abs(resample_poly(y, 4, 1, axis=1)).max())
    if tp > -1.0:
        y *= 10 ** ((-1.0 - tp) / 20)
    return y

final = master(full)
bed_master = master(bed, target=-16.0)
os.makedirs(os.path.join(ROOT, 'stems'), exist_ok=True)
sf.write(os.path.join(ROOT, 'stems', 'sfx.wav'), sfx.T, SR, subtype='FLOAT')
sf.write(os.path.join(ROOT, 'music_and_sfx.wav'), bed_master.T, SR, subtype='PCM_24')
sf.write(os.path.join(ROOT, 'final_mix.wav'), final.T, SR, subtype='PCM_24')
from scipy.signal import resample_poly
tp = 20 * np.log10(np.abs(resample_poly(final, 4, 1, axis=1)).max())
print(f'final: {lufs(final):.2f} LUFS, true peak {tp:.2f} dBTP; bed {lufs(bed_master):.2f} LUFS')
