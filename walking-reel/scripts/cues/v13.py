"""Sound cues for the one-change reel (src/v13/config.ts) (source seconds). Only sounds from the user's SFX pack (sfx/pack)."""
GFX = []
BEHIND = []
PANEL = None
BROLL = []


def cues(cue, rng):
    cue(1.0, "pack:whoosh_soft", -24)
    for at in (3.92, 4.64, 5.48):
        cue(at, "pack:whoosh_fast", -25)
        cue(at + 0.05, "pack:key", -24)
    cue(6.62, "pack:hit", -18)
    cue(7.3, "pack:whoosh_fast2", -24)
    cue(9.8, "pack:chime", -25)
    for j in range(3):
        cue(11.38 + j * 0.22, "pack:tick", -24)
    cue(13.6, "pack:whoosh_fast", -24)
    for j in range(6):
        cue(14.58 + j * 0.3, "pack:tick", -27)
    cue(15.98, "pack:hit", -23)
    cue(17.4, "pack:whoosh_cine", -23)
    for at in (19.86, 23.42, 27.56):
        cue(at, "pack:whoosh_soft", -26)
        cue(at + 0.05, "pack:chime2", -27)
    cue(21.6, "pack:whoosh_soft", -28)
    for j in range(7):
        cue(24.4 + j * 0.1, "pack:tick", -29)
    for at in (30.74, 32.16, 33.74, 35.16):
        cue(at, "pack:tick", -24)
    cue(36.0, "pack:hit", -21)
    cue(36.8, "pack:whoosh_fast2", -24)
    cue(39.9, "pack:chime2", -25)
    cue(43.38, "pack:whoosh_soft", -26)
    cue(45.56, "pack:chime2", -25)
    cue(46.4, "pack:whoosh_fast", -24)
    cue(48.68, "pack:tick", -24)
    cue(50.62, "pack:tick", -24)
    cue(51.62, "pack:key", -22)
    cue(54.8, "pack:whoosh_fast2", -24)
    cue(55.84, "pack:tick", -25)
    cue(61.9, "pack:whoosh_fast", -24)
    for j in range(2):
        cue(63.75 + j * 0.15, "pack:key", -24)
    cue(66.3, "pack:whoosh_fast2", -24)
    cue(69.18, "pack:tick", -24)
    cue(71.36, "pack:tick", -24)
    cue(73.0, "pack:whoosh_soft", -25)
    for j in range(5):
        cue(73.56 + j * 0.07, "pack:key", -27)
    cue(74.2, "pack:whoosh_fast", -25)
    cue(74.86, "pack:notif", -21)
