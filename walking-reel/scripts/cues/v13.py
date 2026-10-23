"""Sound cues for the one-change reel (src/v13/config.ts) (source seconds). Only sounds from the user's SFX pack (sfx/pack)."""
GFX = []
BEHIND = []
PANEL = None
BROLL = []


def cues(cue, rng):
    # hook: tablet B-roll, plateau card, then the three-way split
    cue(1.12, "pack:whoosh_soft", -25)
    cue(1.82, "pack:tick", -24)
    cue(2.36, "pack:whoosh_fast", -25)
    for at in (3.68, 4.64, 5.48):
        cue(at - 0.05, "pack:whoosh_fast2", -23)
        cue(at + 0.15, "pack:tick", -24)
    cue(6.0, "pack:hit", -17)  # SAME DAY stamp
    cue(6.62, "pack:whoosh_deep", -22)  # panels split away
    # lineup
    cue(7.45, "pack:whoosh_soft", -25)
    for j in range(3):
        cue(7.7 + j * 0.16, "pack:hit", -29)
    cue(9.8, "pack:chime", -25)
    cue(11.06, "pack:whoosh_soft", -27)
    for j in range(3):
        cue(12.06 + j * 0.12, "pack:tick", -24)
    # sticky notes
    cue(13.95, "pack:whoosh_fast", -24)
    for j in range(6):
        cue(14.5 + j * 0.26, "pack:key", -24)
    cue(15.84, "pack:hit", -23)
    # case board
    cue(17.7, "pack:whoosh_cine", -23)
    for j in range(3):
        cue(18.3 + j * 0.15, "pack:tick", -27)
    for at in (19.86, 23.42, 27.56):
        cue(at - 0.05, "pack:whoosh_fast2", -25)
        cue(at + 0.05, "pack:chime2", -28)
    cue(21.6, "pack:whoosh_soft", -28)
    for j in range(7):
        cue(24.2 + j * 0.1, "pack:tick", -29)
    for at in (30.74, 32.16, 33.74, 35.16):
        cue(at - 0.2, "pack:whoosh_soft", -29)
        cue(at, "pack:tick", -23)
    cue(36.3, "pack:hit", -19)  # FOUND
    # fixes
    cue(37.0, "pack:whoosh_fast2", -24)
    cue(39.9, "pack:chime2", -25)
    for j in range(5):
        cue(41.52 + j * 0.08, "pack:tick", -29)
    cue(42.9, "pack:whoosh_fast2", -25)
    cue(44.0, "pack:hit", -22)  # workout lands on the meeting
    cue(45.56, "pack:whoosh_soft", -25)
    cue(46.06, "pack:chime", -25)
    # nudge, pattern, locks
    cue(46.7, "pack:whoosh_fast", -24)
    cue(48.68, "pack:tick", -24)
    cue(49.86, "pack:tick", -24)
    cue(51.62, "pack:key", -22)
    for j in range(2):
        cue(52.05 + j * 0.15, "pack:key", -25)
    cue(55.0, "pack:whoosh_fast2", -24)
    for j in range(16):
        cue(55.3 + j * 0.16, "pack:tick", -31)
    cue(58.06, "pack:whoosh_soft", -26)
    cue(59.46, "pack:tick", -24)
    cue(62.2, "pack:whoosh_fast", -24)
    for j in range(2):
        cue(63.75 + j * 0.15, "pack:key", -24)
    # typed note, CASE CLOSED
    cue(66.64, "pack:whoosh_fast2", -24)
    for j in range(11):
        cue(68.9 + j * 0.08, "pack:key", -30)
    for j in range(10):
        cue(71.1 + j * 0.08, "pack:key", -30)
    cue(72.75, "pack:hit", -16)
    # ending
    cue(73.4, "pack:whoosh_soft", -25)
    for j in range(5):
        cue(73.56 + j * 0.07, "pack:key", -26)
    cue(74.16, "pack:whoosh_fast", -24)
    cue(74.86, "pack:whoosh_soft", -24)
    cue(75.6, "pack:notif", -20)
