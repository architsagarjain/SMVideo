"""Sound cues for the rice / water-weight reel (source seconds, src/v11/config.ts). Only sounds from
the user's SFX pack (sfx/pack): a whoosh as the studio backdrop floods in, pops for every sticker,
ticks for the scale digits, a hit on STOP and on the strike-throughs."""
GFX = []
BEHIND = []
PANEL = None
BROLL = []


def cues(cue, rng):
    # hook: backdrop floods in, scale drops, sparkles, what caused it?
    cue(0.94, "pack:whoosh_cine", -19)
    cue(0.98, "pack:hit", -22)
    cue(1.26, "pack:tick", -25)
    cue(1.82, "pack:tick", -23)
    cue(2.8, "pack:whoosh_soft", -25)
    for j in range(8):
        cue(4.38 + j * 0.1, "pack:key", -28)
    cue(5.0, "pack:chime", -23)
    cue(5.6, "pack:chime2", -25)
    cue(6.86, "pack:whoosh_soft", -26)
    cue(7.2, "pack:tick", -25)
    cue(8.94, "pack:tick", -25)
    cue(9.3, "pack:whoosh_fast", -25)
    cue(9.52, "pack:hit", -22)
    # rice
    cue(10.4, "pack:whoosh_fast2", -23)
    cue(10.9, "pack:tick", -24)
    cue(11.32, "pack:hit", -19)
    cue(12.62, "pack:tick", -25)
    for j in range(6):
        cue(12.78 + j * 0.11, "pack:key", -28)
    cue(13.1, "pack:tick", -25)
    cue(15.3, "pack:whoosh_soft", -26)
    cue(15.6, "pack:hit", -22)
    # glycogen
    cue(18.4, "pack:whoosh_fast2", -23)
    cue(18.9, "pack:tick", -24)
    for at in (19.36, 20.72, 21.26):
        cue(at, "pack:tick", -25)
    for j in range(4):
        cue(20.72 + j * 0.12, "pack:whoosh_soft", -30)
    cue(22.42, "pack:chime2", -26)
    # water
    cue(24.6, "pack:whoosh_fast", -24)
    cue(25.22, "pack:tick", -25)
    for j in range(6):
        cue(27.12 + j * 0.08, "pack:tick", -28)
    cue(28.4, "pack:whoosh_soft", -26)
    cue(29.8, "pack:chime", -24)
    # three grams
    cue(31.3, "pack:whoosh_fast2", -23)
    cue(31.78, "pack:tick", -25)
    for at in (33.64, 34.1, 34.54):
        cue(at, "pack:tick", -23)
    cue(37.1, "pack:hit", -23)
    cue(40.0, "pack:tick", -24)
    # one week vs december
    cue(41.3, "pack:whoosh_fast", -24)
    cue(43.3, "pack:whoosh_soft", -26)
    for j in range(7):
        cue(43.74 + j * 0.07, "pack:tick", -29)
    cue(46.22, "pack:whoosh_soft", -26)
    cue(48.8, "pack:hit", -19)
    # trend
    cue(49.6, "pack:whoosh_fast2", -23)
    cue(53.56, "pack:whoosh_soft", -26)
    cue(53.74, "pack:chime", -24)
    # regain
    cue(54.8, "pack:whoosh_fast", -24)
    for j in range(5):
        cue(56.34 + j * 0.11, "pack:key", -28)
    cue(56.9, "pack:tick", -23)
    cue(57.42, "pack:tick", -25)
    cue(60.12, "pack:whoosh_soft", -26)
    cue(62.56, "pack:tick", -25)
    cue(63.3, "pack:hit", -21)
    # foods
    cue(63.9, "pack:whoosh_fast2", -23)
    cue(65.06, "pack:tick", -25)
    cue(68.16, "pack:tick", -25)
    cue(69.82, "pack:whoosh_soft", -26)
    for at in (70.98, 71.4, 71.88, 72.3):
        cue(at - 0.6, "pack:tick", -26)
        cue(at, "pack:chime2", -28)
    # cta
    cue(73.2, "pack:whoosh_fast", -24)
    cue(73.66, "pack:hit", -21)
    cue(74.8, "pack:whoosh_soft", -25)
    cue(75.1, "pack:notif", -22)
