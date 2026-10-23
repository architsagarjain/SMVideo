"""Sound cues for the split-week reel (src/v12/config.ts) (source seconds). Only sounds from the user's SFX pack (sfx/pack)."""
GFX = []
BEHIND = []
PANEL = None
BROLL = []


def cues(cue, rng):
    cue(0.9, "pack:whoosh_soft", -24)
    for j in range(7):
        cue(0.95 + j * 0.09, "pack:tick", -27)
    cue(5.28, "pack:hit", -19)
    for j in range(3):
        cue(5.3 + j * 0.06, "pack:key", -26)
    cue(5.4, "pack:whoosh_soft", -25)  # knocked-off cells fall
    cue(6.2, "pack:whoosh_fast2", -23)
    cue(6.52, "pack:tick", -24)
    cue(8.2, "pack:whoosh_soft", -26)
    cue(12.66, "pack:whoosh_soft", -27)
    cue(14.5, "pack:hit", -21)
    cue(16.64, "pack:tick", -26)
    cue(17.42, "pack:tick", -26)
    cue(19.9, "pack:whoosh_fast", -24)
    for j in range(8):
        cue(20.6 + j * 0.2, "pack:tick", -29)
    cue(23.34, "pack:chime2", -25)
    cue(25.5, "pack:whoosh_fast", -24)
    cue(27.76, "pack:hit", -22)
    cue(30.18, "pack:tick", -24)
    cue(31.96, "pack:tick", -24)
    cue(32.8, "pack:whoosh_fast2", -23)
    cue(34.28, "pack:whoosh_soft", -25)
    for j in range(3):
        cue(34.4 + j * 0.16, "pack:tick", -25)
    cue(41.8, "pack:whoosh_fast", -24)
    cue(44.22, "pack:hit", -20)
    cue(45.24, "pack:whoosh_soft", -25)
    cue(46.14, "pack:chime", -24)
    cue(49.8, "pack:whoosh_fast2", -23)
    for at in (52.2, 52.98, 53.9):
        cue(at, "pack:whoosh_cine", -24)
    for at in (52.8, 53.58, 54.5):
        cue(at, "pack:tick", -23)
    cue(55.6, "pack:whoosh_fast", -24)
    for at in (56.84, 59.54, 60.88):
        cue(at, "pack:tick", -24)
    cue(62.3, "pack:whoosh_fast", -24)
    cue(62.9, "pack:whoosh_soft", -26)  # page flip
    cue(64.6, "pack:chime2", -26)
    cue(66.6, "pack:whoosh_fast2", -23)
    cue(67.42, "pack:tick", -25)
    cue(68.68, "pack:tick", -25)
    cue(69.58, "pack:hit", -21)
    cue(73.3, "pack:whoosh_soft", -25)
    cue(73.32, "pack:whoosh_soft", -26)
    for j in range(5):
        cue(73.9 + j * 0.13, "pack:tick", -22)  # tiles flip to G-U-I-D-E
    cue(75.1, "pack:notif", -21)
