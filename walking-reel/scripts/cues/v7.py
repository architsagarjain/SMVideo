"""Sound cues for the snack reel (source seconds, src/v7/config.ts). Only sounds from the user's SFX
pack (sfx/pack), placed by hand."""
GFX = []
BEHIND = []
PANEL = None
BROLL = []


def cues(cue, rng):
    # hook: STOP behind her, the snack stickers pop in, then get crossed out
    cue(0.92, "pack:whoosh_deep", -20)
    cue(1.0, "pack:hit", -20)
    for i in range(4):
        cue(1.7 + i * 0.14, "pack:tick", -21)
    for i in range(4):
        cue(3.56 + i * 0.08, "pack:whoosh_fast", -30)
    cue(3.6, "pack:hit", -23)
    # sounds wrong? hear me out
    cue(5.98, "pack:hit", -24)
    # the receipt: white stage, a printer tick for every line, the NOT A MEAL stamp
    cue(7.2, "pack:whoosh_soft", -23)
    for t0 in (7.72, 9.3, 12.0, 14.18, 17.18):
        cue(t0, "pack:key", -20)
        cue(t0 + 0.08, "pack:key", -24)
    cue(19.84, "pack:chime2", -25)
    cue(20.29, "pack:hit", -19)
    # +500 behind her head: ticks while it counts
    cue(21.4, "pack:whoosh_deep", -22)
    for j in range(7):
        cue(21.45 + j * 0.13, "pack:tick", -29)
    cue(22.4, "pack:hit", -22)
    # guilty too
    cue(27.92, "pack:chime", -25)
    # great foods: four ticks
    for i in range(4):
        cue(28.9 + i * 0.12, "pack:tick", -25)
    for i in range(4):
        cue(31.98 + i * 0.14, "pack:chime2", -29)
    # healthy is not unlimited
    cue(34.36, "pack:hit", -23)
    cue(36.62, "pack:whoosh_cine", -23)
    # real meals
    cue(38.5, "pack:whoosh_fast2", -23)
    cue(39.08, "pack:hit", -24)
    # your day: picking dots, then the meals
    cue(40.85, "pack:whoosh_soft", -24)
    for i in range(13):
        cue(41.74 + i * 0.09, "pack:tick", -31)
    cue(43.1, "pack:chime", -24)
    # CTA
    cue(44.9, "pack:whoosh_deep", -22)
    for i in range(5):
        cue(45.5 + i * 0.08, "pack:key", -19)
    cue(46.1, "pack:tick", -20)
    cue(46.12, "pack:whoosh_soft", -27)
    cue(47.18, "pack:notif", -21)
