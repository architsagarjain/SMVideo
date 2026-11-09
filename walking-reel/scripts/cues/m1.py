"""Sound cues for the blood-tests reel (source seconds, src/m1/config.ts). Minimal: a soft whoosh into each
B-roll, a light click on punch-ins and reveals, a notification on the ending. Sounds from the user's pack."""
GFX = []
BEHIND = []
PANEL = None
BROLL = []


def cues(cue, rng):
    # report insert
    cue(1.62, "pack:whoosh_soft", -24)
    for j in range(5):
        cue(1.82 + j * 0.12, "pack:click", -31)
    # B-roll cutaways
    for at in (3.0, 8.4, 12.66, 21.3, 43.3, 49.96, 60.86):
        cue(at - 0.05, "pack:whoosh_soft", -24)
    # punch-ins
    for at in (7.22, 10.9, 30.46, 34.92, 48.56, 65.24):
        cue(at, "pack:click", -27)
    # vitamin D range
    cue(14.5, "pack:whoosh_soft", -29)
    cue(16.28, "pack:tick", -24)
    cue(20.7, "pack:chime2", -26)
    # targets
    cue(25.72, "pack:tick", -24)
    cue(29.02, "pack:tick", -24)
    cue(36.6, "pack:whoosh_soft", -29)
    cue(39.86, "pack:tick", -24)
    # thyroid signs
    for at in (54.86, 55.6, 57.08):
        cue(at, "pack:click", -26)
    cue(58.54, "pack:chime2", -26)
    # ending
    cue(68.25, "pack:whoosh_soft", -24)
    cue(68.82, "pack:hit", -27)
    cue(69.6, "pack:notif", -22)
