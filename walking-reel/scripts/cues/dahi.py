"""Dahi reel cues (output = source seconds). User's SFX pack, no music."""
GFX = []
BEHIND = []
PANEL = None
BROLL = []
SCORES = [(4.067, 5.087, False), (6.433, 8.593, True), (10.533, 12.413, True), (15.533, 19.493, True), (20.901, 25.041, True)]
TAGS = [9.813, 13.533, 14.533, 20.033, 25.941, 26.881, 28.301]


def cues(cue, rng):
    cue(0.0, "pack:x_fast", -27)
    cue(3.02, "pack:x_clickhit", -22)  # WRONG WAY?
    cue(3.0, "pack:x_boom", -30)
    for start, at, good in SCORES:
        cue(start - 0.05, "pack:x_camwhoosh" if start > 5 else "pack:x_whip", -24)
        cue(at, "pack:y_ding" if good else "pack:x_clickhit", -23)
        cue(at + 0.02, "pack:y_success" if good else "pack:click", -27)
    for at in TAGS:
        cue(at, "pack:y_bubble", -26)
    cue(29.0, "pack:x_whip", -25)
    cue(32.4, "pack:x_clickhit", -23)  # DAHI
    cue(32.95, "pack:y_notif", -24)
