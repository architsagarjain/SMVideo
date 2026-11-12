"""Sound cues for the blood-tests reel v2 (source seconds, src/m1/config.ts). All from the user's SFX pack:
whip whooshes + a soft click-hit for each B-roll (letter dive lands), a deep whoosh for the ink wipes,
a riser + low boom for the dolly zoom, a cinematic whoosh for the orbit ring, a blip for each comment drop
landing and a notification for her reply."""
GFX = []
BEHIND = []
PANEL = None
BROLL = []


def cues(cue, rng):
    # hook: ink floods into the report
    cue(1.12, "pack:x_deep", -24)
    for j in range(5):
        cue(1.82 + j * 0.12, "pack:click", -31)
    # B-roll cutaways: whip into the clip, letters dive and land
    for at, line_at in ((3.0, 3.05), (8.4, 8.45), (12.66, 12.75), (21.3, 21.4), (43.3, 43.35)):
        cue(at - 0.08, "pack:x_whip", -22)
        cue(line_at + 0.3, "pack:x_clickhit", -24)
    # dolly zoom on "That's not normal."
    cue(7.07, "pack:x_riser", -25)
    cue(8.3, "pack:x_boom", -27)
    # orbit ring: the four tests circle her
    cue(10.25, "pack:x_cine", -25)
    for j in range(4):
        cue(10.35 + j * 0.12, "pack:x_blip", -30)
    # punch-ins
    for at in (30.46, 34.92, 48.56, 65.24):
        cue(at, "pack:x_fast", -26)
    # vitamin D range
    cue(14.5, "pack:whoosh_soft", -29)
    cue(16.28, "pack:tick", -24)
    cue(20.7, "pack:chime2", -26)
    # targets
    cue(25.72, "pack:tick", -24)
    cue(29.02, "pack:tick", -24)
    cue(36.6, "pack:whoosh_soft", -29)
    cue(39.86, "pack:tick", -24)
    # ink into the thyroid panel, rows tick in
    cue(49.45, "pack:x_deep", -24)
    for j in range(4):
        cue(50.4 + j * 0.2, "pack:click", -28)
    # thyroid signs
    for at in (54.86, 55.6, 57.08):
        cue(at, "pack:click", -26)
    cue(58.54, "pack:chime2", -26)
    # receipts: lab tests print, then the supplements receipt keeps printing
    cue(60.8, "pack:x_whip", -24)
    for at in (61.0, 61.22, 61.5, 61.86):
        cue(at, "pack:key", -27)
    cue(62.46, "pack:x_clickhit", -25)
    for j in range(9):
        cue(62.88 + j * 0.167, "pack:key", -28)
    cue(63.66, "pack:x_boom", -27)
    # ending: TEST rises from behind her head
    cue(68.25, "pack:x_whip", -25)
    for j in range(4):
        cue(68.72 + j * 0.09, "pack:x_fast", -26)
    cue(69.1, "pack:x_clickhit", -23)
    cue(69.6, "pack:x_notify", -24)
