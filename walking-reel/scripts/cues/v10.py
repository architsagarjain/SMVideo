"""Sound cues for the mithai reel (source seconds, src/v10/config.ts). Only sounds from the user's
SFX pack (sfx/pack): fairy lights ticking on, the box whooshing in and spinning, chimes on the gold
words, scale beeps for the calculation."""
GFX = []
BEHIND = []
PANEL = None
BROLL = []


def cues(cue, rng):
    # hook: lights on, box handed in, sparkle, spin
    for j in range(6):
        cue(1.1 + j * 0.09, "pack:tick", -30)
    cue(1.12, "pack:whoosh_cine", -19)
    cue(1.92, "pack:hit", -19)
    cue(1.95, "pack:chime", -24)
    cue(2.5, "pack:chime2", -25)
    cue(3.62, "pack:whoosh_soft", -27)
    cue(5.42, "pack:whoosh_fast2", -20)
    cue(6.15, "pack:hit", -24)
    # up top: claims glow, spin to the label
    cue(6.66, "pack:whoosh_deep", -22)
    cue(9.2, "pack:chime", -24)
    cue(11.3, "pack:whoosh_fast2", -22)
    cue(12.7, "pack:chime2", -25)
    cue(14.5, "pack:whoosh_fast", -24)
    # journey
    cue(16.24, "pack:whoosh_soft", -26)
    # reputation / permission
    cue(19.1, "pack:tick", -24)
    cue(20.12, "pack:chime", -24)
    cue(21.76, "pack:hit", -24)
    for at in (22.3, 22.9, 23.6, 24.2):
        cue(at, "pack:tick", -23)
    # nuts and fat
    cue(24.92, "pack:whoosh_soft", -26)
    cue(26.8, "pack:whoosh_soft", -27)
    cue(29.9, "pack:tick", -22)
    cue(30.8, "pack:tick", -22)
    # 9 kcal
    cue(33.5, "pack:hit", -21)
    cue(34.04, "pack:tick", -25)
    # per 100 g -> portion
    cue(37.4, "pack:whoosh_soft", -25)
    cue(38.48, "pack:tick", -24)
    cue(40.14, "pack:chime2", -25)
    # calculation
    cue(42.6, "pack:whoosh_cine", -22)
    cue(44.0, "pack:tick", -22)
    for j in range(6):
        cue(44.12 + j * 0.08, "pack:key", -29)
    cue(46.14, "pack:tick", -24)
    cue(48.36, "pack:tick", -24)
    cue(49.66, "pack:hit", -18)
    cue(49.72, "pack:chime", -22)
    cue(52.4, "pack:tick", -26)
    # B-roll in and out
    cue(56.2, "pack:whoosh_fast2", -22)
    cue(62.0, "pack:whoosh_fast", -24)
    # serve a portion
    cue(60.12, "pack:chime2", -25)
    # diwali
    cue(62.3, "pack:whoosh_cine", -23)
    for j in range(5):
        cue(63.9 + j * 0.12, "pack:tick", -27)
    cue(64.0, "pack:chime", -25)
    cue(67.6, "pack:whoosh_soft", -25)
    # cta
    cue(70.06, "pack:whoosh_soft", -25)
    cue(70.32, "pack:hit", -22)
    cue(70.36, "pack:chime", -24)
    cue(71.66, "pack:whoosh_fast", -24)
    cue(72.0, "pack:notif", -22)
