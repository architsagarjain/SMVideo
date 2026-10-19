"""Sound cues for the simplified busy-women reel (source seconds, src/v4/config2.ts).

Only sounds from the user's SFX pack (sfx/pack), used sparingly. No automatic transition
sounds: every whoosh is placed by hand on a cut or a word.
"""
GFX = []
BEHIND = []
PANEL = None
BROLL = []


def cues(cue, rng):
    # hook on the desk clip: a notification, then the words
    cue(0.84, "pack:notif", -17)
    cue(1.64, "pack:whoosh_soft", -25)
    # STOP / 5 different meals
    cue(2.64, "pack:whoosh_deep", -20)
    cue(5.66, "pack:hit", -21)
    # montage: one quick whoosh per cut
    for t0 in (8.6, 9.75, 10.5, 11.45):
        cue(t0, "pack:whoosh_fast", -20)
    cue(12.3, "pack:whoosh_fast2", -23)
    # the food the diet asks for: a camera shutter on each photo
    for t0 in (14.6, 15.4, 16.4, 17.7):
        cue(t0, "pack:shutter", -15)
    cue(19.3, "pack:whoosh_soft", -27)
    # "can't stick to it": silence on purpose
    # perfect (behind her)
    cue(23.6, "pack:whoosh_cine", -24)
    # 5-6 meals you like / easy / fits your targets
    cue(25.12, "pack:chime2", -23)
    cue(28.0, "pack:whoosh_soft", -27)
    cue(28.14, "pack:chime", -25)
    cue(29.14, "pack:chime2", -25)
    # Instagram post
    cue(31.2, "pack:whoosh_cine", -24)
    for j in range(10):
        cue(35.06 + j * 0.08, "pack:tick", -30)
    cue(36.4, "pack:whoosh_fast2", -24)
    cue(37.96, "pack:chime2", -25)
    # training clips, 30 days
    cue(40.2, "pack:whoosh_soft", -24)
    cue(41.9, "pack:whoosh_fast", -23)
    cue(42.44, "pack:hit", -22)
    # keeping it off
    cue(43.05, "pack:whoosh_fast2", -24)
    cue(43.9, "pack:hit", -25)
    # CTA: typing BUSY, then the guide
    cue(46.42, "pack:chime2", -24)
    for i in range(4):
        cue(46.56 + i * 0.09, "pack:key", -18)
    cue(48.16, "pack:notif", -20)
