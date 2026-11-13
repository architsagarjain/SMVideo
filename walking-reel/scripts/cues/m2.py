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
    # the dish photos pop in, then the DESSERT stamp
    for at in (3.66, 4.34, 5.06, 5.7, 6.38):
        cue(at, "pack:x_blip", -26)
    cue(7.52, "pack:x_clickhit", -21)
    cue(7.54, "pack:x_boom", -29)
    # punch-ins
    for at in (7.2, 12.9, 106.34, 114.9):
        cue(at, "pack:x_fast", -26)
    # the whole frame flips on "flip", then FLIP THE RATIO dives in
    cue(16.22, "pack:x_whip", -21)
    cue(16.55, "pack:x_camwhoosh", -25)
    cue(16.95, "pack:x_clickhit", -24)
    # 6 : 1 card, then poha = dessert
    cue(8.46, "pack:x_whip", -26)
    cue(10.4, "pack:whoosh_soft", -28)
    cue(11.66, "pack:x_clickhit", -24)
    cue(12.9, "pack:x_whip", -26)
    cue(13.6, "pack:x_clickhit", -23)
    cue(112.3, "pack:x_clickhit", -26)  # second line lands on the same bowl shot
    # B-roll cutaways: whip in, letters dive and land
    for at, first in ((21.5, 21.56), (24.9, 24.92), (108.0, 109.18)):
        cue(at - 0.08, "pack:x_whip", -22)
        cue(first + 0.3, "pack:x_clickhit", -24)
    # plate rebalances on "just change what's on your plate"
    cue(30.1, "pack:x_whip", -25)
    cue(31.1, "pack:x_camwhoosh", -26)
    cue(31.9, "pack:x_clickhit", -25)
    # each swap: dish in, swap in, new ratio
    for start, swap, now in DISH:
        cue(start, "pack:whoosh_soft", -29)
        cue(swap, "pack:x_whip", -28)
        cue(swap + 0.05, "pack:click", -27)
        cue(now, "pack:x_clickhit", -25)
        cue(now + 0.1, "pack:chime2", -27)
    # ending: BREAK / FAST rise from behind her head
    cue(116.75, "pack:x_whip", -25)
    for j in range(5):
        cue(117.2 + j * 0.06, "pack:x_fast", -27)
    cue(117.5, "pack:x_clickhit", -24)
    for j in range(4):
        cue(117.5 + j * 0.06, "pack:x_fast", -27)
    cue(118.32, "pack:x_notify", -24)
