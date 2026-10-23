"""Sound cues for the sleep reel re-edit (src/v15/config.ts) (source seconds). Only sounds from the user's SFX pack (sfx/pack)."""
GFX = []
BEHIND = []
PANEL = None
BROLL = []


def cues(cue, rng):
    cue(0.96, "pack:whoosh_soft", -24)
    for j in range(8):
        cue(1.1 + j * 0.06, "pack:tick", -29)
    cue(2.56, "pack:key", -16)  # light switch off
    cue(2.6, "pack:hit", -19)
    cue(2.62, "pack:whoosh_deep", -24)
    cue(5.46, "pack:whoosh_soft", -27)
    cue(7.0, "pack:key", -17)  # lights back on
    cue(7.2, "pack:whoosh_fast2", -24)
    cue(7.96, "pack:tick", -24)
    cue(10.12, "pack:whoosh_soft", -26)
    cue(11.4, "pack:tick", -23)
    cue(12.48, "pack:tick", -23)
    cue(14.0, "pack:whoosh_fast", -24)
    cue(15.0, "pack:whoosh_soft", -27)
    cue(18.0, "pack:whoosh_fast2", -24)
    cue(21.74, "pack:tick", -24)
    cue(24.98, "pack:whoosh_soft", -26)
    for j in range(14):
        cue(25.1 + j * 0.06, "pack:tick", -31)
    cue(27.58, "pack:chime2", -26)
    for j in range(5):
        cue(32.7 + j * 0.08, "pack:key", -27)
    cue(35.7, "pack:whoosh_fast", -24)
    cue(37.04, "pack:tick", -24)
    cue(40.26, "pack:hit", -21)
    cue(44.0, "pack:whoosh_fast2", -24)
    cue(52.6, "pack:whoosh_soft", -25)  # fat pours in
    cue(54.0, "pack:chime", -24)
    cue(57.3, "pack:whoosh_soft", -27)
    cue(64.4, "pack:whoosh_soft", -26)
    cue(65.2, "pack:hit", -21)
    cue(67.92, "pack:whoosh_soft", -27)
    cue(70.0, "pack:whoosh_fast", -24)
    cue(73.64, "pack:tick", -23)
    cue(74.4, "pack:whoosh_fast2", -22)
    cue(78.5, "pack:whoosh_fast", -24)
    cue(81.6, "pack:whoosh_fast2", -24)
    cue(83.0, "pack:whoosh_soft", -27)
    cue(88.34, "pack:tick", -24)
    cue(88.9, "pack:whoosh_fast", -24)
    for at in (90.3, 90.6, 90.9):
        cue(at, "pack:tick", -24)
    cue(92.18, "pack:hit", -21)
    cue(95.32, "pack:key", -16)  # lights out
    cue(95.4, "pack:whoosh_deep", -26)
    cue(97.35, "pack:tick", -20)  # clock flips to 11:00
    for j in range(5):
        cue(96.26 + j * 0.07, "pack:key", -27)
    cue(96.9, "pack:whoosh_fast", -25)
    cue(97.4, "pack:notif", -21)
