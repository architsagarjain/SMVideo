"""Sound cues for ad B (IMG_2607), source seconds. All from the user's SFX pack."""
GFX = []
BEHIND = []
PANEL = None
BROLL = []


def cues(cue, rng):
    # search bar types "free diet plans", results drop in
    for j in range(15):
        cue(0.95 + j * 1.25 / 15, "pack:key", -29)
    for at in (2.4, 3.28, 3.42):
        cue(at, "pack:x_blip", -27)
    for j in range(11):  # the wall of women pops in
        cue(8.26 + j * 0.06, "pack:click", -31)
    for j in range(6):  # neon flickers on
        cue(11.06 + j * 0.05, "pack:click", -32)
    cue(11.1, "pack:x_cine", -26)
    for at in (3.7, 10.62, 28.28):
        cue(at - 0.06, "pack:x_whip", -23)
    for at in (5.22, 29.4):
        cue(at, "pack:x_clickhit", -26)
    cue(5.92, "pack:x_riser", -25)
    for j in range(4):
        cue(6.04 + j * 0.05, "pack:x_fast", -29)
    cue(6.92, "pack:x_boom", -27)
    cue(9.08, "pack:x_camwhoosh", -27)
    cue(9.98, "pack:x_clickhit", -24)
    for at in (15.2, 17.58, 21.82, 22.12, 23.8):
        cue(at, "pack:x_blip", -26)
    for at in (35.78, 37.26):  # pizza nights / chole bhature photo cards, YES stamps
        cue(at, "pack:x_whip", -27)
        cue(at + 0.35, "pack:x_clickhit", -25)
    cue(26.18, "pack:x_fast", -26)
    cue(40.84, "pack:x_whip", -25)
    for j in range(3):
        cue(44.24 + j * 0.07, "pack:x_fast", -26)
    cue(44.58, "pack:x_clickhit", -23)
    cue(46.74, "pack:x_notify", -24)
