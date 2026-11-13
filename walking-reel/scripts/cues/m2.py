"""Sound cues for the breakfast-ratios reel v2 (source seconds, src/m2/config.ts). All from the user's SFX pack:
riser + low boom on the dolly zoom, a cinematic whoosh + blips as the dishes orbit her, deep whooshes for the
ink card, whip + click-hit on each B-roll letter dive, a chime per new ratio, and the comment-sheet ending."""
GFX = []
BEHIND = []
PANEL = None
BROLL = []

# (before start, before ratio, after start, after ratio, chained into the next dish's photo)
SHOTS = [(32.48, 33.98, 40.35, 41.06, True), (42.4, 43.22, 52.4, 53.08, True), (55.5, 56.64, 66.75, 67.32, True), (69.44, 69.98, 78.3, 79.36, True), (81.22, 82.82, 89.55, 90.44, True), (92.64, 95.14, 103.8, 104.38, False)]
PILLS = [36.06, 37.4, 38.74, 45.64, 48.26, 50.62, 60.82, 64.16, 71.94, 73.94, 75.52, 96.86, 99.02, 101.4]


def cues(cue, rng):
    # dolly zoom on "desserts for breakfast."
    cue(1.92, "pack:x_riser", -25)
    cue(3.35, "pack:x_boom", -27)
    # the dish photos pop in as she names them
    for at in (3.66, 4.34, 5.06, 5.7, 6.38):
        cue(at, "pack:x_blip", -26)
    # punch-ins
    for at in (7.2, 12.9, 106.34, 114.9):
        cue(at, "pack:x_fast", -26)
    # the whole frame flips on "flip", then FLIP THE RATIO dives in
    cue(16.22, "pack:x_whip", -21)
    cue(16.55, "pack:x_camwhoosh", -25)
    cue(16.95, "pack:x_clickhit", -24)
    # 6 : 1 card, then poha = dessert
    cue(9.8, "pack:x_whip", -26)
    for j in range(6):
        cue(9.98 + j * 0.07, "pack:click", -30)
    cue(10.42, "pack:x_blip", -26)
    cue(11.66, "pack:x_clickhit", -24)
    cue(12.26, "pack:x_clickhit", -25)
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
    # each swap: full-screen dish photo (whip in) + red ratio; quantity pills pop; full-screen swap photo + green ratio
    for i, (b0, bat, a0, aat, chain) in enumerate(SHOTS):
        cue(b0 - 0.06, "pack:x_camwhoosh" if i > 0 else "pack:x_whip", -24)
        cue(bat, "pack:x_clickhit", -24)
        cue(a0 - 0.06, "pack:x_whip", -23)
        cue(aat, "pack:x_clickhit", -24)
        cue(aat + 0.08, "pack:chime2", -27)
    for at in PILLS:
        cue(at, "pack:x_blip", -27)
    # idli: four pop in, two get crossed out
    for j in range(4):
        cue(58.5 + j * 0.09, "pack:click", -28)
    cue(59.4, "pack:x_clickhit", -24)
    # sandwich: the top slice flies off, the egg lands
    cue(84.2, "pack:click", -27)
    cue(85.24, "pack:x_whip", -24)
    cue(87.5, "pack:x_clickhit", -25)
    cue(88.18, "pack:x_blip", -28)
    # ending: BREAK / FAST rise from behind her head
    cue(116.75, "pack:x_whip", -25)
    for j in range(5):
        cue(117.2 + j * 0.06, "pack:x_fast", -27)
    cue(117.5, "pack:x_clickhit", -24)
    for j in range(4):
        cue(117.5 + j * 0.06, "pack:x_fast", -27)
    cue(118.32, "pack:x_notify", -24)
