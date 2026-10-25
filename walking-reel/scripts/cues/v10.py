"""Sound cues for the sugar-free mithai reel (source seconds, src/v10/config.ts). Only sounds from the
user's SFX pack (sfx/pack): a hit on the SUGAR FREE badge, whooshes for every turn of the 3D box,
chimes for the halo and the Diwali lights, the receipt's key clicks (kept), a notif for the guide."""
GFX = []
BEHIND = []
PANEL = None
BROLL = []


def cues(cue, rng):
    # hook: photo, badge, collapse into the box, the box turns
    cue(1.08, "pack:whoosh_soft", -25)
    cue(2.54, "pack:hit", -17)
    cue(3.62, "pack:whoosh_cine", -22)
    for at in (5.48, 7.0, 11.34):
        cue(at, "pack:whoosh_deep", -23)
        cue(at + 0.85, "pack:tick", -25)
    cue(9.2, "pack:tick", -23)
    cue(9.9, "pack:tick", -23)
    cue(13.86, "pack:whoosh_soft", -27)
    # push-up clip
    cue(14.6, "pack:whoosh_fast2", -22)
    cue(18.5, "pack:whoosh_fast", -24)
    # health halo
    cue(19.0, "pack:chime", -22)
    cue(19.1, "pack:whoosh_soft", -27)
    # sugar free != low cal, cashew + ghee
    cue(24.92, "pack:whoosh_fast", -24)
    cue(25.1, "pack:hit", -21)
    cue(29.9, "pack:whoosh_fast", -24)
    cue(30.8, "pack:hit", -19)
    # 9 vs 4
    cue(31.5, "pack:whoosh_fast2", -24)
    for j in range(9):
        cue(33.58 + j * 0.055, "pack:tick", -28)
    cue(34.1, "pack:hit", -21)
    cue(35.0, "pack:whoosh_soft", -26)
    # two boxes turn
    cue(36.5, "pack:whoosh_fast", -24)
    cue(37.48, "pack:whoosh_deep", -23)
    cue(37.6, "pack:whoosh_deep", -26)
    cue(38.6, "pack:chime2", -26)
    # receipt (kept)
    cue(42.6, "pack:whoosh_soft", -25)
    for at in (42.9, 44.18, 46.14, 48.36, 49.72, 54.0):
        for j in range(4):
            cue(at + j * 0.05, "pack:key", -29)
    cue(49.72, "pack:chime", -22)
    cue(52.56, "pack:hit", -21)
    # sweet shop, her clip
    cue(56.2, "pack:whoosh_fast2", -22)
    cue(59.3, "pack:whoosh_fast", -23)
    # Diwali: the box returns, lights come on, it turns to the label
    cue(62.3, "pack:whoosh_fast2", -24)
    for j in range(15):
        cue(63.86 + j * 0.05, "pack:tick", -31)
    cue(63.9, "pack:chime2", -24)
    cue(68.04, "pack:tick", -23)
    cue(68.64, "pack:whoosh_fast", -25)
    cue(68.9, "pack:whoosh_deep", -22)
    # ending: comment, the gift box opens
    cue(70.0, "pack:whoosh_soft", -25)
    for j in range(5):
        cue(70.32 + j * 0.07, "pack:key", -26)
    cue(70.92, "pack:whoosh_fast", -24)
    cue(71.24, "pack:whoosh_soft", -23)
    cue(71.5, "pack:chime", -21)
    cue(72.2, "pack:notif", -20)
