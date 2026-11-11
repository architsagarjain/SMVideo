"""Sound cues for the breakfast-ratios reel v2 (source seconds, src/m2/config.ts). All from the user's SFX pack:
riser + low boom on the dolly zoom, a cinematic whoosh + blips as the dishes orbit her, deep whooshes for the
ink card, whip + click-hit on each B-roll letter dive, a chime per new ratio, and the comment-sheet ending."""
GFX = []
BEHIND = []
PANEL = None
BROLL = []

DISH = [(32.48, 35.22, 40.4), (42.4, 44.32, 52.44), (55.5, 58.52, 66.78), (69.44, 71.46, 78.34), (81.22, 84.2, 89.62), (92.64, 96.56, 103.86)]


def cues(cue, rng):
    # dolly zoom on "desserts for breakfast."
    cue(1.92, "pack:x_riser", -25)
    cue(3.35, "pack:x_boom", -27)
    # the dishes orbit her
    cue(3.55, "pack:x_cine", -25)
    for at in (3.66, 4.34, 5.06, 5.7, 6.38):
        cue(at, "pack:x_blip", -28)
    # punch-ins
    for at in (7.2, 12.9, 16.12, 106.34, 114.9):
        cue(at, "pack:x_fast", -26)
    # 6 : 1 blocks
    for j in range(7):
        cue(10.4 + j * 0.12, "pack:tick", -31)
    cue(11.66, "pack:x_clickhit", -24)
    # B-roll cutaways: whip in, letters dive and land
    for at, first in ((21.5, 21.56), (24.9, 24.92), (108.0, 109.18), (112.2, 112.22)):
        cue(at - 0.08, "pack:x_whip", -22)
        cue(first + 0.3, "pack:x_clickhit", -24)
    # ink floods in, the card, ink recedes
    cue(29.55, "pack:x_deep", -24)
    cue(30.46, "pack:x_clickhit", -25)
    cue(31.82, "pack:x_clickhit", -24)
    cue(31.9, "pack:x_reverse", -27)
    # each swap: dish in, swap in, new ratio
    for start, swap, now in DISH:
        cue(start, "pack:whoosh_soft", -29)
        cue(swap, "pack:click", -26)
        cue(now, "pack:chime2", -26)
    # ending: comment sheet slides up, BREAKFAST typed and posted, her reply
    cue(116.75, "pack:x_whip", -24)
    for j in range(9):
        cue(117.2 + j * 0.07, "pack:key", -25)
    cue(118.08, "pack:x_blip", -22)
    cue(118.4, "pack:x_notify", -23)
