#!/usr/bin/env python3
"""Original background score for the reel, written as MIDI and rendered with FluidSynth
using the FluidR3 GM soundfont (MIT licence). The composition is original to this
project, so there is no third-party music licence involved.

Form (D major, 4/4, bar = 2.96 s ~ 81 BPM). Bar lines are placed on the edit:
  0.00 - 4.24  intro  : pad swell, sparse piano on Bm9 -> Gmaj9 (the "problem" line)
  4.24         lift   : "With Shaadi Mangalam" lands on D(add9); piano arpeggio starts
  4.24 - 22.0  body   : D - A/C# - Bm7 - Gmaj7 - Em7 Asus4 - Gmaj7 Asus4/A
  22.00        resolve: Dmaj9 as the end screen settles, left to ring out
Usage: compose_music.py out.mid
"""
import sys
import mido

BAR = 2.96
BEAT = BAR / 4
DOWN = 4.24 - BAR          # first full bar starts at 1.28 s
TPB = 480
TEMPO = mido.bpm2tempo(60 / BEAT)

def tick(t):
    return int(round(t / BEAT * TPB))

N = {n: i for i, n in enumerate("C C# D D# E F F# G G# A A# B".split())}
def note(name):  # e.g. "F#4"
    return 12 * (int(name[-1]) + 1) + N[name[:-1]]

events = []  # (time_s, channel, type, a, b)
def play(ch, t, dur, notes, vel):
    for n in notes:
        events.append((t, ch, "on", note(n), vel))
        events.append((t + dur, ch, "off", note(n), 0))

PIANO, STRINGS, PAD, LOW, BELL = 0, 1, 2, 3, 4
PROGRAMS = {PIANO: 0, STRINGS: 49, PAD: 89, LOW: 42, BELL: 8}  # Grand, Slow Strings, Warm Pad, Cello, Celesta

def b(i, beat=0.0):  # time of bar i (0 = 1.28 s), beat offset
    return DOWN + i * BAR + beat * BEAT

# ---- Harmony (bar, beat, length in beats, bass, voicing, arpeggio notes)
CH = [
    (-1, 2.6, 1.4, "B1", ["B3", "D4", "F#4", "C#5"], None),            # pickup (pad only, from t~0)
    (0, 0, 2, "B1", ["B3", "D4", "F#4", "C#5"], ["B3", "F#4", "C#5", "D5"]),
    (0, 2, 2, "G1", ["G3", "B3", "D4", "A4"], ["G3", "D4", "A4", "B4"]),
    (1, 0, 4, "D2", ["D4", "F#4", "A4", "E5"], ["D3", "A3", "E4", "F#4", "A4", "E4", "F#4", "A3"]),
    (2, 0, 4, "C#2", ["C#4", "E4", "A4", "E5"], ["A2", "E3", "C#4", "E4", "A4", "E4", "C#4", "E3"]),
    (3, 0, 4, "B1", ["B3", "D4", "F#4", "A4"], ["B2", "F#3", "D4", "F#4", "A4", "F#4", "D4", "F#3"]),
    (4, 0, 4, "G1", ["G3", "B3", "D4", "F#4"], ["G2", "D3", "B3", "D4", "F#4", "D4", "B3", "D3"]),
    (5, 0, 2, "E2", ["G3", "B3", "D4", "E4"], ["E3", "B3", "D4", "G4"]),
    (5, 2, 2, "A1", ["A3", "D4", "E4", "G4"], ["A2", "E3", "D4", "E4"]),
    (6, 0, 2, "G1", ["G3", "B3", "D4", "F#4"], ["G2", "D3", "B3", "F#4"]),
    (6, 2, 1, "A1", ["A3", "D4", "E4", "G4"], ["A2", "E3"]),
    (6, 3, 1, "A1", ["A3", "C#4", "E4", "G4"], ["D4", "C#4"]),
    (7, 0, 9, "D2", ["D4", "F#4", "A4", "C#5", "E5"], None),           # resolve on the end screen
]

for bar, beat, length, bass, voicing, arp in CH:
    t = 0.0 if bar < 0 else b(bar, beat)
    dur = (b(0) if bar < 0 else b(bar, beat) + length * BEAT) - t
    final = bar == 7
    # Warm pad underneath everything (enters first; slightly overlapped for legato).
    play(PAD, t, dur + 0.15, voicing[:3], 52 if bar < 1 else 58)
    if bar < 0:
        continue
    # Piano: soft chord on the downbeat; arpeggio in eighths from the lift onwards.
    if bar == 0:
        play(PIANO, t, dur, [voicing[0], voicing[-1]], 46)
        play(PIANO, t + BEAT, dur - BEAT, [voicing[2]], 40)
    elif final:
        play(PIANO, t, 4.2, [bass.replace("2", "3")] + voicing, 62)
        play(PIANO, t + 0.5 * BEAT, 3.6, ["F#5"], 44)
        play(PIANO, t + 1.0 * BEAT, 3.2, ["A5"], 40)
    else:
        for k, n in enumerate(arp):
            step = length * BEAT / len(arp)
            v = 54 if k == 0 else 44 + (6 if k % 2 == 0 else 0)
            play(PIANO, t + k * step, step * 1.6, [n], v)
        play(PIANO, t, length * BEAT, [voicing[-1]], 44)
    # Strings from the lift; a touch fuller from bar 4.
    if bar >= 1:
        sv = 48 if bar < 4 else 58
        play(STRINGS, t, dur + 0.1, voicing[1:] if not final else voicing, 66 if final else sv)
        play(LOW, t, dur + 0.1, [bass.replace("1", "2") if bass[-1] == "1" else bass], 50 if bar < 4 else 58)
    # A single celesta figure as the end screen resolves.
    if final:
        for k, n in enumerate(["A5", "D6", "F#6", "E6"]):
            play(BELL, t + 0.35 + k * 0.42, 1.6, [n], 34 - 3 * k)

# Expression (CC11) swells: strings fade in under the lift and swell into the end screen.
def cc(ch, t, ctl, val):
    events.append((t, ch, "cc", ctl, int(val)))
for i in range(0, 61):
    t = b(1) - 0.6 + i * 0.05
    cc(STRINGS, t, 11, 40 + 70 * min(i / 40, 1))
for i in range(0, 41):
    t = b(6) + i * (2 * BAR / 40)
    cc(STRINGS, t, 11, 100 + 22 * i / 40)

mid = mido.MidiFile(ticks_per_beat=TPB)
tr = mido.MidiTrack(); mid.tracks.append(tr)
tr.append(mido.MetaMessage("set_tempo", tempo=TEMPO, time=0))
for ch, prog in PROGRAMS.items():
    tr.append(mido.Message("program_change", channel=ch, program=prog, time=0))
    tr.append(mido.Message("control_change", channel=ch, control=91, value=70, time=0))  # reverb send
    tr.append(mido.Message("control_change", channel=ch, control=7, value={PIANO: 100, STRINGS: 78, PAD: 70, LOW: 64, BELL: 72}[ch], time=0))
order = {"off": 0, "cc": 1, "on": 2}
events.sort(key=lambda e: (tick(e[0]), order[e[2]]))
now = 0
for t, ch, kind, a, v in events:
    tk = max(tick(t), 0)
    dt, now = tk - now, tk
    if kind == "on":
        tr.append(mido.Message("note_on", channel=ch, note=a, velocity=v, time=dt))
    elif kind == "off":
        tr.append(mido.Message("note_off", channel=ch, note=a, velocity=0, time=dt))
    else:
        tr.append(mido.Message("control_change", channel=ch, control=a, value=min(v, 127), time=dt))
mid.save(sys.argv[1] if len(sys.argv) > 1 else "music.mid")
