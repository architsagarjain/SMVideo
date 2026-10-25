"""Sound cues for the rice / water-weight reel (source seconds, src/v11/config.ts). Only sounds from
the user's SFX pack (sfx/pack): ticks for the bathroom-scale digits, a hit on NOT PROVEN, soft whooshes
for the sponge filling and squeezing, a hit when the no-rice bar snaps back, a chime for the average."""
GFX = []
BEHIND = []
PANEL = None
BROLL = []


def cues(cue, rng):
    # hook: the scale, the drop, confetti, the blank reading
    cue(1.0, "pack:whoosh_soft", -24)
    cue(1.1, "pack:tick", -23)
    for j in range(8):
        cue(4.5 + j * 0.1, "pack:tick", -29)
    cue(5.2, "pack:chime", -23)
    cue(5.72, "pack:hit", -22)
    cue(9.52, "pack:key", -21)
    # rice: bowl crossed out, number falls, not proven
    cue(10.8, "pack:whoosh_fast2", -24)
    cue(11.64, "pack:whoosh_fast", -24)
    for j in range(6):
        cue(12.8 + j * 0.12, "pack:tick", -29)
    cue(14.4, "pack:whoosh_soft", -26)
    cue(15.3, "pack:hit", -19)
    # glycogen sponge: shrinks, soaks up water, squeezed, scale falls
    cue(18.9, "pack:whoosh_fast2", -24)
    cue(20.72, "pack:whoosh_soft", -27)
    cue(22.42, "pack:tick", -24)
    cue(24.9, "pack:whoosh_soft", -26)
    for j in range(8):
        cue(26.54 + j * 0.12, "pack:key", -31)
    cue(28.18, "pack:whoosh_deep", -22)
    for j in range(10):
        cue(28.6 + j * 0.13, "pack:tick", -30)
    # 1 g ~ 3 g
    cue(31.8, "pack:whoosh_fast", -24)
    cue(32.3, "pack:tick", -23)
    for j in range(3):
        cue(33.64 + j * 0.16, "pack:key", -25)
    cue(40.0, "pack:whoosh_soft", -28)
    # one week, no rice until December, snaps back
    cue(42.0, "pack:whoosh_fast2", -24)
    cue(43.74, "pack:tick", -23)
    cue(46.6, "pack:whoosh_cine", -24)
    cue(48.28, "pack:whoosh_fast", -24)
    cue(48.8, "pack:hit", -20)
    # weigh-ins, average
    cue(50.0, "pack:whoosh_fast", -24)
    for j in range(7):
        cue(50.3 + j * 0.22, "pack:tick", -26)
    cue(53.74, "pack:chime2", -24)
    # carbs back: sponge refills, scale up, water not fat
    cue(55.2, "pack:whoosh_fast2", -24)
    for j in range(10):
        cue(56.2 + j * 0.12, "pack:key", -31)
    cue(57.8, "pack:tick", -23)
    cue(60.68, "pack:chime", -23)
    # food list, the near strike-through
    cue(64.6, "pack:whoosh_fast", -24)
    for j in range(3):
        cue(65.2 + j * 0.25, "pack:tick", -26)
    cue(68.62, "pack:tick", -23)
    cue(69.82, "pack:whoosh_fast", -24)
    cue(70.7, "pack:whoosh_soft", -25)
    cue(71.0, "pack:chime2", -24)
    # ending: the scale spells GUIDE
    cue(73.3, "pack:whoosh_soft", -24)
    for j in range(5):
        cue(73.66 + j * 0.09, "pack:tick", -22)
    cue(74.8, "pack:notif", -20)
