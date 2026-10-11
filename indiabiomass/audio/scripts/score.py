"""Original score for the IndiaBiomass brand film (60 s, 120 BPM, D minor).

Every section boundary sits on a picture event (see TIMES). Output:
audio/stems/music.wav (48 kHz stereo float).

  0-6    atmosphere: sub drone, shimmer, a rising synth into the field reveal (2.6 s)
  6-15   tension: pulsing bass, ticking percussion, Dm-Bb-Gm-A, cut dead at 15.0
  15-20  near silence, then a pinging arpeggio that accelerates as the network connects
  20     first impact on the logo; the groove arrives
  23-37  confident main rhythm: Bb-F-C-Dm, lead motif, mechanical textures for machinery
  37-47  16th-note arps, four-on-the-floor, filter opening, riser into 47
  47-55  expansive half-time, wide pads, brass-like motif, toms
  55-60  build, final hit at 56.73 on D major, three-note sonic signature, natural decay
"""
import os
import numpy as np
from synth import *  # noqa

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DUR = 60.0
B = 0.5  # one beat at 120 BPM
TIMES = dict(reveal=2.6, s2=6.0, s3=15.0, wave=16.13, condense=18.93, logo=20.0, s4=23.0,
             a=26.5, b=30.5, c=34.0, s5=37.0, q=40.5, r=43.0, s6=47.0, s7=55.0, end=56.733)

drums, bass, pads, keys, lead, fxb = (Track(DUR) for _ in range(6))

CH = {  # pad voicings (MIDI)
    'Dm': ['D4', 'F4', 'A4', 'E5'], 'Bb': ['Bb3', 'D4', 'F4', 'C5'], 'Gm': ['G3', 'Bb3', 'D4', 'A4'],
    'A': ['A3', 'C#4', 'E4', 'A4'], 'Asus': ['A3', 'D4', 'E4', 'A4'], 'F': ['F3', 'A3', 'C4', 'G4'],
    'C': ['C4', 'E4', 'G4', 'D5'], 'D': ['D4', 'F#4', 'A4', 'E5'],
}
ROOTN = {'Dm': 'D2', 'Bb': 'Bb1', 'Gm': 'G1', 'A': 'A1', 'Asus': 'A1', 'F': 'F2', 'C': 'C2', 'D': 'D2'}
ARP = {k: [m(n) for n in v] for k, v in CH.items()}
mm = lambda names: [m(n) for n in names]

# ------------------------------------------------------------------ 0-6 atmosphere
drone = sub(m('D1'), 6.6, a=1.5, r=1.2) * 0.28 + sub(m('A1'), 6.6, a=2.5, r=1.2) * 0.12
bass.add(0.0, drone * np.linspace(0.4, 1, len(drone)))
pads.add(0.2, supersaw(mm(['D4', 'A4', 'E5']), 6.0, a=2.5, r=1.5, detune=0.12) * 0.3)
fxb.add(0.0, shimmer(6.0, density=10, lo=3000, hi=8000) * 0.8)
fxb.add(0.9, riser(1.7, f0=150, f1=6000, noisy=0.5, tonal=0.6, curve=1.6) * 0.5)
# bloom chord as the field appears
pads.add(TIMES['reveal'], supersaw(mm(['F3', 'A3', 'D4', 'E4', 'A4']), 3.6, a=0.05, r=2.0, detune=0.2) * 0.28)
bass.add(TIMES['reveal'], sub(m('D1'), 3.4, a=0.01, r=1.5, drive=0.5) * 0.32)

# ------------------------------------------------------------------ 6-15 tension
prog = [('Dm', 6.0), ('Bb', 8.0), ('Gm', 10.0), ('Asus', 12.0), ('A', 13.0), ('A', 14.0)]
for k, (c, t0) in enumerate(prog):
    dur = (prog[k + 1][1] if k + 1 < len(prog) else 15.0) - t0
    pads.add(t0, supersaw([m(n) for n in CH[c][:3]], dur + 0.05, a=0.05, r=0.05, detune=0.1) * 0.2)
    # pulsing 8th-note bass (filtered saw, short notes)
    for i in range(int(dur / (B / 2))):
        tn = t0 + i * B / 2
        if tn >= 14.98:
            break
        note = m(ROOTN[c]) + (12 if i % 4 == 3 else 0)
        n = int(0.2 * SR)
        y = lp(polyblep_saw(n2f(note), n), 600 + 900 * (tn - 6) / 9) * adsr(n, 0.003, 0.08, 0.4, 0.06)
        bass.add(tn, y * 0.33)
        bass.add(tn, sub(note, 0.2, a=0.002, r=0.08) * 0.16)
# drums: kick on 1, the & of 2 and 3; ticking 16th hats that thicken
for bar in range(5):
    t0 = 6.0 + bar * 2
    for bt in [0, 1.5, 2]:
        if t0 + bt * B < 15:
            drums.add(t0 + bt * B, kick(0.9) * 0.8)
    for s16 in range(16):
        tn = t0 + s16 * B / 4
        if tn >= 14.95:
            break
        accent = 0.5 if s16 % 4 == 2 else 0.25
        drums.add(tn, hat() * accent * (0.6 + 0.4 * bar / 4))
    if t0 + 3 * B < 15:
        drums.add(t0 + 3 * B, snare() * 0.25)
fxb.add(13.0, riser(2.0, f0=300, f1=9000, curve=2.4) * 0.45)
drums.add(14.5, np.concatenate([snare(0.12) * (0.1 + 0.08 * i) for i in range(4)]))  # small fill into the cut

# ------------------------------------------------------------------ 15-20 silence -> connection
bass.add(15.0, sub(m('A0'), 1.2, a=0.005, r=1.0) * 0.35)  # only the sub tail survives the cut
pads.add(15.55, supersaw(mm(['D3', 'A3', 'D4', 'F4']), 4.5, a=2.5, r=0.4, detune=0.14) * 0.24)
# pings: each new connection plays a note, faster and faster
arp_notes = mm(['D5', 'A5', 'F5', 'E5', 'A4', 'D5', 'F5', 'C6'])
t, step, i = TIMES['wave'], 0.5, 0
while t < 19.85:
    keys.add(t, pluck(arp_notes[i % len(arp_notes)], 0.9, bright=0.55, decay=4) * (0.32 + 0.25 * (t - 16) / 4))
    i += 1
    step = max(0.125, step * 0.86)
    t += step
fxb.add(17.9, riser(2.1, f0=200, f1=12000, noisy=0.8, tonal=0.5, curve=2.2) * 0.55)
fxb.add(TIMES['logo'] - 1.2, reverse_swell(1.2) * 0.9)

# ------------------------------------------------------------------ 20 the reveal
fxb.add(TIMES['logo'], impact(4.5, 1.1) * 1.5)
pads.add(TIMES['logo'], supersaw(mm(['Bb2', 'F3', 'Bb3', 'D4', 'F4', 'C5']), 3.0, a=0.01, r=1.6, detune=0.22) * 0.45)
bass.add(TIMES['logo'], sub(m('Bb0'), 2.8, a=0.005, r=1.2, drive=0.8) * 0.4)
keys.add(TIMES['logo'] + 0.02, bell(m('D6'), 3) * 0.28)
# soft groove intro 21-23
for bt in range(0, 8):
    tn = 21.0 + bt * B
    if bt % 2 == 0:
        drums.add(tn, kick(0.8) * 0.65)
    drums.add(tn + B / 2, hat() * 0.3)
drums.add(22.5, snare() * 0.25)
pads.add(22.0, supersaw([m(n) for n in CH['F'][:3]], 1.05, a=0.3, r=0.3) * 0.15)


# ------------------------------------------------------------------ helpers for the main groove
def groove(t0, bars, intensity=1.0, four=False, half=False):
    for bar in range(bars):
        tb = t0 + bar * 2
        kicks = [0, 2, 2.75 if bar % 2 else None] if not four else [0, 1, 2, 3]
        if half:
            kicks = [0, 2.5]
        for k in kicks:
            if k is not None:
                drums.add(tb + k * B, kick(1.0) * 0.85 * intensity)
        snares = [1, 3] if not half else [2]
        for s_ in snares:
            drums.add(tb + s_ * B, clap() * 0.5 * intensity)
            drums.add(tb + s_ * B, snare() * (0.35 if half else 0.2) * intensity)
        for e in range(8 if not four else 16):
            stepb = 0.5 if not four else 0.25
            drums.add(tb + e * stepb * B, hat() * (0.32 if e % 2 else 0.18) * intensity)


def chords(seq, t0, gain=0.15, a=0.08, r=0.4, detune=0.14, octave=0):
    for k, c in enumerate(seq):
        notes = [m(n) + 12 * octave for n in CH[c]]
        pads.add(t0 + k * 2, supersaw(notes, 2.05, a=a, r=r, detune=detune) * gain)


def bassline(seq, t0, gain=0.4, pattern=(0, 0.5, 1.5, 2, 2.5, 3, 3.5)):
    for k, c in enumerate(seq):
        root = m(ROOTN[c])
        for j, bt in enumerate(pattern):
            note = root + (12 if j in (2, 5) else 0)
            n = int(0.22 * SR)
            y = lp(polyblep_saw(n2f(note), n), 900) * adsr(n, 0.003, 0.1, 0.5, 0.05)
            bass.add(t0 + k * 2 + bt * B, y * gain * 0.7)
            bass.add(t0 + k * 2 + bt * B, sub(note, 0.22, a=0.002, r=0.06) * gain * 0.32)


def arps(seq, t0, rate=4, gain=0.18, bright=0.6, octaves=2):
    for k, c in enumerate(seq):
        tones = ARP[c][:3]
        pat = [tones[0], tones[1], tones[2], tones[0] + 12, tones[2], tones[1] + 12, tones[0] + 12, tones[2] + 12][: 4 * rate // 2 * 2]
        steps = 4 * rate
        for s_ in range(steps):
            note = pat[s_ % len(pat)] + (12 if (octaves > 1 and (s_ // len(pat)) % 2) else 0)
            keys.add(t0 + k * 2 + s_ * (4 * B / steps), pluck(note, 0.5, bright=bright, decay=6) * gain)


MOTIF = [(0, 'A4', 0.5), (0.5, 'D5', 0.5), (1, 'F5', 1.0), (2, 'E5', 0.5), (2.5, 'D5', 0.5), (3, 'A4', 1.0)]


def motif(t0, gain=0.2, brass=False, transpose=0):
    for bt, nm, ln in MOTIF:
        note = m(nm) + transpose
        n = int((ln * B + 0.25) * SR)
        if brass:
            w = polyblep_saw(n2f(note) * (1 + 0.003 * np.sin(2 * np.pi * 5 * np.arange(n) / SR)), n)
            w = w + polyblep_saw(n2f(note) * 1.004, n)
            y = sweep_filter(w, lambda s: 700 + 2600 * min(1, s / 0.25), mode='lp', res=0.1) * adsr(n, 0.06, 0.2, 0.75, 0.2)
            lead.add(t0 + bt * B, y * gain * 0.5)
        else:
            y = pluck(note, ln * B + 0.6, bright=0.75, decay=2.2) + 0.4 * pluck(note + 12, ln * B + 0.6, bright=0.4, decay=3)
            lead.add(t0 + bt * B, y * gain)


# ------------------------------------------------------------------ 23-37 main
seqD = ['Bb', 'F', 'C', 'Dm', 'Bb', 'F', 'C']
chords(seqD, 23.0, gain=0.2)
bassline(seqD, 23.0, gain=0.42)
groove(23.0, 2, intensity=0.8)
groove(27.0, 5, intensity=1.0)
arps(['C', 'Dm', 'Bb', 'F', 'C'], 27.0, rate=2, gain=0.12, bright=0.5)
for t0 in (26.5, 30.5):
    motif(t0, gain=0.24)
motif(34.0, gain=0.2, transpose=0)
# machinery: metallic 16ths and clanks
for s_ in range(int(3.0 / (B / 4))):
    tn = 34.0 + s_ * B / 4
    drums.add(tn, metal(96 + (s_ % 3) * 2, 0.12, seed=s_) * (0.16 if s_ % 4 else 0.3))
for tn in (34.0, 35.0, 36.0):
    drums.add(tn, metal(48, 0.6, seed=int(tn)) * 0.4)
# granular textures on the match cuts
for tn in (TIMES['a'], TIMES['b'], TIMES['c']):
    fxb.add(tn - 0.02, shimmer(0.8, density=60, lo=1500, hi=6000, seed=int(tn)) * 1.2)

# ------------------------------------------------------------------ 37-47 drive
seqE = ['Dm', 'Bb', 'F', 'C']
chords(seqE, 37.0, gain=0.18)
pads.add(45.0, supersaw([m(n) for n in CH['Asus']], 1.05, a=0.05, r=0.1) * 0.12)
pads.add(46.0, supersaw([m(n) for n in CH['A']], 1.02, a=0.05, r=0.1) * 0.13)
bassline(seqE + ['A'], 37.0, gain=0.45, pattern=(0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5))
groove(37.0, 4, intensity=1.0, four=True)
arps(seqE, 37.0, rate=4, gain=0.15, bright=0.7)
arps(['A'], 45.0, rate=4, gain=0.16, bright=0.8)
for i in range(16):  # snare roll into the expansive section
    drums.add(45.0 + i * B / 4, snare(0.15) * (0.12 + 0.03 * i))
for i in range(8):
    drums.add(46.0 + i * B / 8 + 0.5, snare(0.1) * (0.2 + 0.02 * i))
fxb.add(45.0, riser(2.0, f0=300, f1=12000, curve=2.0) * 0.8)
fxb.add(47.0 - 1.0, reverse_swell(1.0) * 0.7)

# ------------------------------------------------------------------ 47-55 expansive
seqF = ['Bb', 'F', 'Gm', 'C']
fxb.add(47.0, impact(3.0, 0.7) * 0.7)
chords(seqF, 47.0, gain=0.3, a=0.35, r=0.6, detune=0.2)
chords(seqF, 47.0, gain=0.15, a=0.6, r=0.6, detune=0.25, octave=1)
for k, c in enumerate(seqF):
    bass.add(47.0 + k * 2, sub(m(ROOTN[c]), 2.0, a=0.01, r=0.2, drive=0.4) * 0.28)
groove(47.0, 4, intensity=1.0, half=True)
motif(47.0, gain=0.5, brass=True)
motif(51.0, gain=0.52, brass=True, transpose=-2)
arps(seqF, 47.0, rate=2, gain=0.13, bright=0.5)
for i, nt in enumerate(['A2', 'F2', 'D2', 'A1', 'F2', 'D2', 'A1', 'D1']):  # tom fill
    drums.add(53.0 + 1.0 + i * B / 4 + 0.5, tom(m(nt) + 12) * 0.5)

# ------------------------------------------------------------------ 55-60 finale
END = TIMES['end']
pads.add(55.0, supersaw([m(n) for n in CH['Asus']], END - 55.0, a=0.2, r=0.05, detune=0.22) * 0.32)
bass.add(55.0, sub(m('A1'), END - 55.0, a=0.1, r=0.05) * 0.28)
for i in range(int((END - 55.1) / (B / 4))):
    drums.add(55.0 + i * B / 4, snare(0.12) * (0.06 + 0.03 * i))
for i in range(4):
    drums.add(55.0 + i * B, kick(0.9) * 0.7)
fxb.add(END - 1.7, riser(1.7, f0=400, f1=14000, curve=2.5) * 0.55)
fxb.add(END - 1.0, reverse_swell(1.0) * 0.9)
# the hit + D major resolution + sonic signature (D, A, then D/F# together)
fxb.add(END, impact(3.4, 1.25) * 1.7)
pads.add(END, supersaw(mm(['D3', 'A3', 'D4', 'F#4', 'A4', 'E5']), 60.0 - END, a=0.01, r=2.6, detune=0.2) * 0.45)
bass.add(END, sub(m('D1'), 60.0 - END, a=0.005, r=2.6, drive=0.6) * 0.42)
SIG = END + 0.38
keys.add(SIG, bell(m('D5'), 2.6) * 0.42)
keys.add(SIG + 0.19, bell(m('A5'), 2.4) * 0.36)
keys.add(SIG + 0.42, bell(m('D6'), 2.2) * 0.34)
keys.add(SIG + 0.42, bell(m('F#5'), 2.2) * 0.24)
keys.add(SIG + 0.42, pluck(m('D4'), 2.2, bright=0.6, decay=1.2) * 0.25)

# ------------------------------------------------------------------ buses and mix
def bus(track, board):
    return fx(track.buf.astype(np.float32), Pedalboard(board))


d = bus(drums, [Compressor(threshold_db=-14, ratio=3, attack_ms=8, release_ms=120), Reverb(room_size=0.3, wet_level=0.08, dry_level=1.0)])
b_ = bus(bass, [HighpassFilter(cutoff_frequency_hz=28), Compressor(threshold_db=-16, ratio=3, attack_ms=10, release_ms=150)])
p = bus(pads, [HighpassFilter(cutoff_frequency_hz=140), Chorus(rate_hz=0.3, depth=0.2, mix=0.3), Reverb(room_size=0.85, damping=0.4, wet_level=0.35, dry_level=0.8, width=1.0)])
k = bus(keys, [Delay(delay_seconds=0.375, feedback=0.3, mix=0.22), Reverb(room_size=0.7, wet_level=0.3, dry_level=0.9, width=1.0)])
l = bus(lead, [Delay(delay_seconds=0.375, feedback=0.25, mix=0.2), Reverb(room_size=0.8, wet_level=0.3, dry_level=0.85, width=1.0)])
x = bus(fxb, [HighpassFilter(cutoff_frequency_hz=25)])

# sidechain-style pump on pads/bass from the kick pattern of the main sections
mix = d * 0.8 + b_ * 0.8 + p * 1.5 + k * 1.2 + l * 1.3 + x * 0.85
mix = fx(mix, Pedalboard([Compressor(threshold_db=-10, ratio=2, attack_ms=20, release_ms=200)]))
n = int(DUR * SR)
mix = mix[:, :n]
ramp_t = [0, 6, 15, 20, 23, 37, 47, 55, 56.7, 60]
ramp_g = [0.95, 0.9, 0.9, 1.0, 0.82, 0.9, 1.0, 1.0, 1.12, 1.12]
mix = mix * np.interp(np.arange(n) / SR, ramp_t, ramp_g)
# natural fade at the very end
fade = int(1.2 * SR)
mix[:, -fade:] *= np.linspace(1, 0, fade) ** 1.5
peak = np.abs(mix).max()
mix = mix / peak * 0.89
os.makedirs(os.path.join(ROOT, 'stems'), exist_ok=True)
import soundfile as sf
sf.write(os.path.join(ROOT, 'stems', 'music.wav'), mix.T, SR, subtype='FLOAT')
print('music ok, pre-norm peak', round(float(peak), 3))
