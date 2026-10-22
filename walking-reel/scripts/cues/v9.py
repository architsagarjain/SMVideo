"""Sound cues for the check-in reel (source seconds, src/v9/config.ts). Only sounds from the user's
SFX pack (sfx/pack): LCD beeps for the scale, notification pings for the coach, pops and ticks for
the infographic cards, whooshes on the split-screen moves."""
GFX = []
BEHIND = []
PANEL = None
BROLL = []


def cues(cue, rng):
    # hook: scale boots, digits climb, coach texts arrive, the question slams
    cue(1.03, "pack:whoosh_deep", -20)
    for j in range(3):
        cue(1.05 + j * 0.09, "pack:tick", -22)
    for j in range(5):
        cue(1.44 + j * 0.06, "pack:key", -27)
    cue(1.72, "pack:notif", -18)
    for j in range(5):
        cue(3.1 + j * 0.14, "pack:key", -27)
    cue(3.08, "pack:notif", -18)
    cue(3.82, "pack:tick", -22)
    cue(5.0, "pack:whoosh_fast2", -22)
    cue(5.14, "pack:hit", -17)
    cue(6.66, "pack:hit", -22)
    cue(6.92, "pack:whoosh_soft", -27)
    # study card
    cue(7.9, "pack:whoosh_cine", -22)
    for j in range(8):
        cue(8.74 + j * 0.09, "pack:tick", -29)
    cue(10.16, "pack:whoosh_soft", -26)
    for j in range(6):
        cue(10.92 + j * 0.16, "pack:tick", -28)
    cue(11.96, "pack:chime", -24)
    cue(13.0, "pack:tick", -27)
    cue(15.44, "pack:whoosh_soft", -26)
    cue(16.44, "pack:chime2", -26)
    # one reading
    cue(17.4, "pack:whoosh_soft", -26)
    cue(18.56, "pack:hit", -24)
    cue(19.84, "pack:shutter", -24)
    # review heading
    cue(20.9, "pack:whoosh_cine", -22)
    cue(21.4, "pack:hit", -24)
    cue(22.68, "pack:tick", -24)
    # checklist
    cue(24.1, "pack:whoosh_cine", -22)
    cue(24.66, "pack:whoosh_soft", -27)
    cue(25.24, "pack:chime", -25)
    for at in (26.16, 28.96, 31.62):
        cue(at, "pack:whoosh_fast", -25)
        cue(at + 0.05, "pack:chime2", -27)
    for at in (26.66, 27.48, 27.96):
        cue(at, "pack:tick", -24)
    cue(29.1, "pack:whoosh_soft", -27)
    cue(30.56, "pack:tick", -24)
    for at in (33.18, 34.06, 34.9, 35.84):
        cue(at, "pack:tick", -23)
    # realistic?
    cue(36.7, "pack:whoosh_cine", -22)
    cue(39.22, "pack:hit", -23)
    cue(40.52, "pack:tick", -24)
    cue(40.96, "pack:tick", -24)
    # vs
    cue(41.7, "pack:whoosh_cine", -22)
    cue(42.22, "pack:hit", -24)
    for j in range(10):
        cue(44.0 + j * 0.1, "pack:tick", -30)
    cue(45.88, "pack:chime", -26)
    for j in range(6):
        cue(47.6 + j * 0.16, "pack:key", -26)
    cue(49.86, "pack:hit", -19)
    cue(49.9, "pack:whoosh_deep", -22)
    # measured change
    cue(51.0, "pack:whoosh_soft", -25)
    cue(55.2, "pack:key", -22)
    cue(55.94, "pack:whoosh_soft", -26)
    cue(56.3, "pack:chime2", -25)
    # montage
    cue(58.4, "pack:whoosh_fast2", -22)
    cue(59.18, "pack:whoosh_fast", -22)
    cue(59.82, "pack:whoosh_fast2", -22)
    cue(60.28, "pack:hit", -19)
    cue(62.2, "pack:whoosh_soft", -25)
    for at in (62.4, 62.65, 62.9):
        cue(at, "pack:tick", -23)
    cue(63.6, "pack:whoosh_cine", -22)
    # decision
    cue(64.36, "pack:whoosh_soft", -26)
    cue(66.28, "pack:tick", -25)
    cue(69.56, "pack:key", -18)
    cue(69.6, "pack:chime", -23)
    cue(71.06, "pack:tick", -24)
    # cta
    cue(72.14, "pack:whoosh_soft", -25)
    cue(72.38, "pack:hit", -23)
    cue(73.56, "pack:whoosh_fast", -24)
    cue(73.9, "pack:notif", -22)
