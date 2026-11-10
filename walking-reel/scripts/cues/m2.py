"""Sound cues for the breakfast-ratios reel (source seconds, src/m2/config.ts). Minimal: a soft whoosh into
each B-roll, clicks on punch-ins and the ratio read-outs, a chime on each new ratio. Sounds from the user's pack."""
GFX = []
BEHIND = []
PANEL = None
BROLL = []

DISH = [(32.48, 35.22, 40.4), (42.4, 44.32, 52.44), (55.5, 58.52, 66.78), (69.44, 71.46, 78.34), (81.22, 84.2, 89.62), (92.64, 96.56, 103.86)]


def cues(cue, rng):
    # B-roll cutaways
    for at in (3.55, 21.5, 24.9, 30.12, 108.0, 112.2):
        cue(at - 0.05, "pack:whoosh_soft", -24)
    # dish names landing in the hook
    for at in (3.66, 4.34, 5.06, 5.7, 6.38):
        cue(at, "pack:click", -28)
    # punch-ins
    for at in (1.92, 7.2, 12.9, 16.12, 106.34, 114.9):
        cue(at, "pack:click", -27)
    # 6 : 1 blocks
    for j in range(7):
        cue(10.4 + j * 0.12, "pack:tick", -31)
    cue(11.66, "pack:hit", -27)
    # each swap: dish in, swap in, new ratio
    for start, swap, now in DISH:
        cue(start, "pack:whoosh_soft", -29)
        cue(swap, "pack:click", -26)
        cue(now, "pack:chime2", -26)
    # ending: the breakfast menu fills in, then Comment BREAKFAST
    cue(116.7, "pack:whoosh_soft", -24)
    for j in range(6):
        cue(116.87 + j * 0.1, "pack:click", -28)
    cue(117.2, "pack:hit", -26)
    cue(118.32, "pack:notif", -22)
