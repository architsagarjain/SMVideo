"""Sound cues for the travel-day reel (source seconds, src/v8/config.ts). Only sounds from the user's
SFX pack (sfx/pack). The hook leans on clacks for the split-flap board."""
GFX = []
BEHIND = []
PANEL = None
BROLL = []


def flaps(cue, at, n, gap=0.035, g=-27):
    """split-flap clatter: a click per tile as it settles"""
    for i in range(n):
        cue(at + 0.3 + i * gap, "pack:tick", g)
        if i % 2 == 0:
            cue(at + 0.05 + i * gap, "pack:key", g - 3)


def cues(cue, rng):
    # sky hook: wind rushing past, the wing slides in, FLIGHTS? lands
    cue(1.01, "pack:whoosh_cine", -20)
    cue(1.92, "pack:hit", -21)
    cue(2.32, "pack:whoosh_deep", -22)
    cue(3.2, "pack:whoosh_soft", -27)
    cue(4.46, "pack:whoosh_fast2", -24)
    cue(5.7, "pack:hit", -20)
    cue(6.15, "pack:whoosh_soft", -25)
    # results card
    cue(7.5, "pack:whoosh_soft", -24)
    for j in range(6):
        cue(10.08 + j * 0.1, "pack:tick", -28)
    cue(10.7, "pack:chime", -24)
    for j in range(6):
        cue(15.48 + j * 0.08, "pack:tick", -28)
    cue(16.0, "pack:chime", -24)
    # not a promise
    cue(19.62, "pack:hit", -24)
    # work around TRAVEL, the assumptions get struck
    cue(26.3, "pack:whoosh_deep", -22)
    cue(28.2, "pack:tick", -23)
    cue(29.56, "pack:tick", -23)
    cue(29.92, "pack:whoosh_fast", -25)
    # travel day
    cue(34.22, "pack:chime2", -24)
    # steps: deep whoosh into the number, a hit as it lands, a tick per title word
    for num, title, n in ((35.52, 36.06, 2), (40.44, 41.28, 2), (45.96, 46.52, 3)):
        cue(num, "pack:whoosh_cine", -22)
        cue(num + 0.15, "pack:hit", -20)
        for i in range(n):
            cue(title + i * 0.12, "pack:tick", -24)
    cue(38.0, "pack:whoosh_fast", -23)
    cue(40.44, "pack:whoosh_fast2", -26)
    for i in range(4):
        cue(42.4 + i * 0.18, "pack:tick", -22)
    flaps(cue, 48.3, 4, g=-26)
    flaps(cue, 48.6, 7, g=-25)
    cue(48.94, "pack:hit", -22)
    # airport X-ray: the bag rolls in, the beam sweeps, labels pop, CLEARED, airport food crossed out
    cue(49.65, "pack:whoosh_soft", -23)
    cue(50.0, "pack:whoosh_fast", -27)
    for t0 in (50.82, 50.98, 51.14):
        cue(t0, "pack:tick", -21)
    cue(51.5, "pack:chime", -23)
    cue(52.16, "pack:whoosh_fast2", -26)
    cue(53.68, "pack:hit", -21)
    # training B-roll
    cue(54.9, "pack:whoosh_fast", -22)
    cue(57.3, "pack:whoosh_fast2", -23)
    cue(59.2, "pack:whoosh_fast", -23)
    cue(60.56, "pack:chime2", -25)
    # back to your routine
    cue(61.9, "pack:whoosh_soft", -25)
    cue(62.9, "pack:whoosh_soft", -26)
    # a week of different days
    for i in range(7):
        cue(65.84 + i * 0.07, "pack:tick", -25)
    cue(67.2, "pack:hit", -24)
    # decisions you can repeat, wherever
    cue(68.9, "pack:hit", -23)
    for t0 in (70.84, 71.0, 71.16):
        cue(t0, "pack:tick", -22)
    # CTA
    cue(73.1, "pack:whoosh_deep", -22)
    for i in range(5):
        cue(73.75 + i * 0.08, "pack:key", -19)
    cue(74.32, "pack:tick", -20)
    cue(74.34, "pack:whoosh_soft", -27)
    cue(75.16, "pack:notif", -21)
