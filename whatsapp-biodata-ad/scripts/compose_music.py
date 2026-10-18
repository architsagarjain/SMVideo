#!/usr/bin/env python3
"""Original background score for the WhatsApp biodata ad, written as MIDI and rendered
with FluidSynth + the FluidR3 GM soundfont (MIT licence). Original composition, so no
third-party music licence is involved.

D major, 4/4, bar = 3.18 s (~75 BPM). Bar lines sit on the voiceover:
  -0.54        hook   : Bm(add9) pad, sparse santoor-like dulcimer (tension)
  3.17         stamp  : soft timpani + celesta accent on "Ab nahi"
  2.64 - 12.18 build  : G - Em7 A - Bm7 A/C#  (the "gap" question)
  12.18        lift   : "Shaadi Mangalam" lands on D; dulcimer arpeggio, strings, soft shaker
  12.18 - 24.9 body   : D - A/C# - Bm7 G - Em7 Asus4 A
  24.90        resolve: Dmaj9 on the CTA ("Aaj hi..."), left to ring out to the end
Usage: compose_music.py out.mid
"""
import sys
import mido

BAR = 3.18
BEAT = BAR / 4
B0 = 12.18 - 3 * BAR  # bar 0 starts at 2.64 s; bar -1 (the hook) at -0.54 s; bar 3 = 12.18 s
TPB = 480
TEMPO = mido.bpm2tempo(60 / BEAT)
OFFSET = 0.6  # MIDI time 0 is 0.6 s before the video starts (hook bar starts at -0.54 s)

def tick(t):
    return int(round((t + OFFSET) / BEAT * TPB))

N = {n: i for i, n in enumerate("C C# D D# E F F# G G# A A# B".split())}
def note(name):
    return 12 * (int(name[-1]) + 1) + N[name[:-1]]

events = []
def play(ch, t, dur, notes, vel):
    for n in notes:
        events.append((t, ch, "on", note(n) if isinstance(n, str) else n, vel))
        events.append((t + dur, ch, "off", note(n) if isinstance(n, str) else n, 0))

DUL, STR, PAD, LOW, CEL, TIMP, PERC = 0, 1, 2, 3, 4, 5, 9
PROGRAMS = {DUL: 15, STR: 49, PAD: 89, LOW: 42, CEL: 8, TIMP: 47}
VOLUME = {DUL: 92, STR: 74, PAD: 66, LOW: 62, CEL: 70, TIMP: 70}

def b(i, beat=0.0):
    return B0 + i * BAR + beat * BEAT

# (bar, beat, beats, bass, voicing, arpeggio)
CH = [
    (-1, 0, 4, "B1", ["B3", "D4", "F#4", "C#5"], ["F#4", "C#5", "B4", "F#4"]),
    (0, 0, 4, "G1", ["G3", "B3", "D4", "A4"], ["D4", "A4", "G4", "B4"]),
    (1, 0, 2, "E2", ["G3", "B3", "D4", "E4"], ["B3", "E4", "G4"]),
    (1, 2, 2, "A1", ["A3", "C#4", "E4", "G4"], ["C#4", "E4", "A4"]),
    (2, 0, 2, "B1", ["B3", "D4", "F#4", "A4"], ["D4", "F#4", "B4"]),
    (2, 2, 2, "C#2", ["A3", "C#4", "E4", "A4"], ["E4", "A4", "C#5"]),
    (3, 0, 4, "D2", ["D4", "F#4", "A4", "E5"], ["D4", "A4", "F#5", "A4", "E5", "A4", "F#5", "A4"]),
    (4, 0, 4, "C#2", ["C#4", "E4", "A4", "E5"], ["C#4", "A4", "E5", "A4", "C#5", "A4", "E5", "A4"]),
    (5, 0, 2, "B1", ["B3", "D4", "F#4", "A4"], ["B3", "F#4", "D5", "F#4"]),
    (5, 2, 2, "G1", ["G3", "B3", "D4", "F#4"], ["G3", "D4", "B4", "D4"]),
    (6, 0, 2, "E2", ["G3", "B3", "D4", "E4"], ["E4", "B4", "G4", "B4"]),
    (6, 2, 1, "A1", ["A3", "D4", "E4", "G4"], ["D4", "E4"]),
    (6, 3, 1, "A1", ["A3", "C#4", "E4", "G4"], ["C#4", "E4"]),
    (7, 0, 6, "D2", ["D4", "F#4", "A4", "C#5", "E5"], None),  # resolve on the CTA
]

for bar, beat, beats, bass, voicing, arp in CH:
    t = b(bar, beat)
    dur = beats * BEAT
    final = bar == 7
    lifted = bar >= 3
    play(PAD, t, dur + 0.15, voicing[:3], 50 if not lifted else 58)
    if final:
        play(DUL, t, 4.5, [bass.replace("2", "3")] + voicing, 70)
        for k, n in enumerate(["A5", "D6", "F#6", "E6", "D6"]):
            play(CEL, t + 0.4 + k * 0.38, 1.8, [n], 40 - 3 * k)
        play(STR, t, 4.6, voicing, 70)
        play(LOW, t, 4.6, ["D2"], 58)
        continue
    # Dulcimer: sparse quarter notes before the lift, flowing eighths after it.
    step = beats * BEAT / len(arp)
    for k, n in enumerate(arp):
        v = (60 if k == 0 else 50) if lifted else (46 if k == 0 else 38)
        play(DUL, t + k * step, step * 1.8, [n], v)
    if bar >= 0:
        play(STR, t, dur + 0.1, voicing[1:], 46 if not lifted else 56)
    if bar >= 1:
        play(LOW, t, dur + 0.1, [bass.replace("1", "2") if bass[-1] == "1" else bass], 46 if not lifted else 56)
    # Soft shaker eighths for gentle momentum through the body.
    if lifted:
        for k in range(int(beats * 2)):
            events.append((t + k * BEAT / 2, PERC, "on", 70, 26 if k % 2 else 34))
            events.append((t + k * BEAT / 2 + 0.1, PERC, "off", 70, 0))

# "Ab nahi" stamp at 3.17 s: a soft low timpani and a celesta glint.
play(TIMP, 3.17, 1.6, ["D2"], 72)
play(CEL, 3.19, 1.2, ["D6", "A6"], 34)
# A gentle swell into the brand reveal.
play(STR, 11.2, 1.0, ["A3", "C#4", "E4"], 40)

mid = mido.MidiFile(ticks_per_beat=TPB)
tr = mido.MidiTrack(); mid.tracks.append(tr)
tr.append(mido.MetaMessage("set_tempo", tempo=TEMPO, time=0))
for ch, prog in PROGRAMS.items():
    tr.append(mido.Message("program_change", channel=ch, program=prog, time=0))
    tr.append(mido.Message("control_change", channel=ch, control=91, value=64, time=0))
    tr.append(mido.Message("control_change", channel=ch, control=7, value=VOLUME[ch], time=0))
tr.append(mido.Message("control_change", channel=PERC, control=7, value=50, time=0))
tr.append(mido.Message("control_change", channel=PERC, control=91, value=40, time=0))
order = {"off": 0, "on": 1}
events.sort(key=lambda e: (tick(e[0]), order[e[2]]))
now = 0
for t, ch, kind, n, v in events:
    tk = max(tick(t), 0)
    dt, now = tk - now, tk
    msg = "note_on" if kind == "on" else "note_off"
    tr.append(mido.Message(msg, channel=ch, note=n, velocity=v, time=dt))
mid.save(sys.argv[1] if len(sys.argv) > 1 else "score.mid")
print("MIDI offset (s):", OFFSET)
