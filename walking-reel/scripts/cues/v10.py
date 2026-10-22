"""Sound cues for the mithai reel (source seconds, src/v10/config.ts). Only sounds from the user's
SFX pack (sfx/pack): a hit on the SUGAR FREE sticker, whooshes as the photo shrinks into a card and
flips, pops for stickers and labels, key clicks as the receipt prints."""
GFX = []
BEHIND = []
PANEL = None
BROLL = []


def cues(cue, rng):
    # hook: photo, sticker slap, shrink to a card, flip round
    cue(1.08, "pack:whoosh_soft", -24)
    cue(2.54, "pack:hit", -18)
    cue(2.56, "pack:chime2", -26)
    cue(3.6, "pack:whoosh_cine", -22)
    cue(5.42, "pack:whoosh_fast2", -20)
    cue(6.1, "pack:tick", -24)
    # front / back
    cue(6.66, "pack:whoosh_soft", -24)
    cue(7.16, "pack:tick", -25)
    for at in (9.5, 9.8, 10.1):
        cue(at, "pack:tick", -24)
    cue(11.48, "pack:tick", -25)
    cue(12.9, "pack:whoosh_soft", -28)
    cue(13.4, "pack:whoosh_soft", -28)
    cue(14.2, "pack:whoosh_fast", -24)
    # journey B-roll
    cue(14.6, "pack:whoosh_fast2", -22)
    cue(16.24, "pack:tick", -24)
    cue(18.5, "pack:whoosh_fast", -24)
    # reputation / permission
    cue(19.0, "pack:whoosh_soft", -26)
    cue(20.12, "pack:hit", -20)
    cue(21.6, "pack:whoosh_soft", -27)
    for at in (21.9, 22.3, 22.64, 22.92, 23.3, 23.6, 24.0, 24.24):
        cue(at, "pack:tick", -25)
    # ingredients
    cue(25.2, "pack:whoosh_soft", -25)
    cue(29.9, "pack:whoosh_soft", -27)
    cue(29.95, "pack:tick", -23)
    cue(30.8, "pack:tick", -23)
    # 9 kcal
    cue(31.8, "pack:whoosh_soft", -25)
    cue(33.55, "pack:hit", -20)
    # compare
    cue(36.64, "pack:tick", -24)
    cue(37.0, "pack:tick", -24)
    cue(38.48, "pack:whoosh_soft", -27)
    cue(39.96, "pack:chime2", -25)
    # receipt
    cue(42.6, "pack:whoosh_soft", -25)
    for at in (42.9, 44.18, 46.14, 48.36, 49.72, 54.0):
        for j in range(4):
            cue(at + j * 0.05, "pack:key", -29)
    cue(49.72, "pack:chime", -22)
    cue(52.56, "pack:hit", -21)
    # choose / serve
    cue(56.2, "pack:whoosh_fast2", -22)
    cue(58.72, "pack:chime2", -25)
    cue(59.3, "pack:whoosh_fast", -24)
    cue(60.12, "pack:tick", -23)
    cue(62.0, "pack:whoosh_fast", -24)
    # the box again
    cue(62.3, "pack:whoosh_soft", -25)
    cue(63.86, "pack:tick", -25)
    cue(67.7, "pack:hit", -21)
    cue(68.86, "pack:whoosh_fast2", -21)
    cue(69.5, "pack:chime", -24)
    # cta
    cue(70.06, "pack:whoosh_soft", -25)
    cue(70.32, "pack:hit", -22)
    cue(71.66, "pack:whoosh_fast", -24)
    cue(72.0, "pack:notif", -22)
