"""Sound cues for ad B (IMG_2607), source seconds. All from the user's SFX pack."""
GFX = []
BEHIND = []
PANEL = None
BROLL = []


def cues(cue, rng):
    for at in (0.9, 3.3):  # opens on B-roll, lines land
        cue(at, "pack:x_clickhit", -25)
    for at in (3.7, 10.62, 28.28):
        cue(at - 0.06, "pack:x_whip", -23)
    for at in (5.22, 11.4, 12.2, 29.4):
        cue(at, "pack:x_clickhit", -26)
    cue(5.92, "pack:x_riser", -25)
    for j in range(4):
        cue(6.04 + j * 0.05, "pack:x_fast", -29)
    cue(6.92, "pack:x_boom", -27)
    cue(9.08, "pack:x_camwhoosh", -27)
    cue(9.98, "pack:x_clickhit", -24)
    for at in (15.2, 17.58, 21.82, 22.12, 23.8, 35.78, 37.26):
        cue(at, "pack:x_blip", -26)
    cue(26.18, "pack:x_fast", -26)
    cue(40.84, "pack:x_whip", -25)
    for j in range(3):
        cue(44.24 + j * 0.07, "pack:x_fast", -26)
    cue(44.58, "pack:x_clickhit", -23)
    cue(46.74, "pack:x_notify", -24)
