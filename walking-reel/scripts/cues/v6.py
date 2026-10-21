"""Sound cues for the cardio reel (source seconds, src/v6/config.ts). Only sounds from the user's SFX
pack (sfx/pack), placed by hand on cuts, cards and words."""
GFX = []
BEHIND = []
PANEL = None
BROLL = []


def cues(cue, rng):
    # hook: the card slides up on frame one, FAT? lands, a red cross on MORE CARDIO?
    cue(1.13, "pack:whoosh_soft", -24)
    cue(2.0, "pack:hit", -21)
    cue(2.84, "pack:tick", -23)
    cue(3.96, "pack:hit", -19)
    cue(4.85, "pack:whoosh_fast2", -26)
    # here's what usually happens
    cue(6.48, "pack:whoosh_deep", -24)
    # the scale doesn't move: card up, digits flicker, NO CHANGE
    cue(7.83, "pack:whoosh_soft", -24)
    for j in range(5):
        cue(8.4 + j * 0.22, "pack:tick", -29)
    cue(9.06, "pack:hit", -22)
    # the pile-up: a whoosh on each clip change, a click on each chip
    cue(9.75, "pack:whoosh_fast", -23)
    cue(10.7, "pack:chime2", -26)
    cue(12.36, "pack:whoosh_fast", -23)
    cue(12.46, "pack:chime2", -26)
    cue(13.7, "pack:whoosh_fast2", -24)
    cue(15.14, "pack:hit", -22)
    cue(16.4, "pack:whoosh_soft", -26)
    # meters move the wrong way
    cue(17.18, "pack:whoosh_soft", -27)
    for t0 in (18.2, 19.36, 21.06):
        cue(t0, "pack:tick", -21)
    # cardio isn't bad
    cue(24.13, "pack:whoosh_fast", -25)
    cue(24.9, "pack:hit", -24)
    # it has its benefits
    cue(25.8, "pack:whoosh_fast2", -23)
    cue(27.46, "pack:chime", -25)
    # don't punish yourself
    cue(28.44, "pack:whoosh_soft", -27)
    cue(29.62, "pack:whoosh_cine", -21)
    cue(29.77, "pack:hit", -20)
    # the four essentials: card up, a tick and a whoosh per item
    cue(31.6, "pack:whoosh_soft", -24)
    for t0 in (33.08, 34.38, 35.36, 36.74):
        cue(t0, "pack:tick", -20)
    cue(35.3, "pack:whoosh_fast", -25)
    cue(36.7, "pack:whoosh_fast2", -25)
    cue(36.9, "pack:chime", -25)
    # more isn't always better / the right strategy
    cue(38.28, "pack:hit", -23)
    cue(39.0, "pack:hit", -23)
    cue(41.6, "pack:whoosh_deep", -22)
    cue(41.95, "pack:chime2", -25)
    # CTA: CARDIO behind her, the comment box types it and sends
    cue(42.68, "pack:whoosh_deep", -22)
    for i in range(6):
        cue(43.25 + i * 0.08, "pack:key", -19)
    cue(43.9, "pack:tick", -20)
    cue(43.92, "pack:whoosh_soft", -27)
    cue(44.78, "pack:notif", -21)
