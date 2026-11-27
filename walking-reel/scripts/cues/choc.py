"""Dark-chocolate reel cues (output = source seconds). User's SFX pack, no music."""
GFX = []
BEHIND = []
PANEL = None
BROLL = []
RANKS = [(9.772, 9.9, [13.132, 14.432]), (15.706, 16.266, [19.086, 21.386]), (25.216, 25.3, [27.776, 29.216, 31.796]), (34.882, 35.522, [36.842, 39.502]),
         (41.289, 41.4, [43.269, 45.249]), (48.123, 48.2, [50.903, 55.083]), (56.456, 56.876, [59.316, 61.876]), (63.938, 64.0, [67.598, 70.998]),
         (72.971, 73.591, [76.371, 77.211, 79.311]), (82.177, 82.817, [85.677, 88.317])]


def cues(cue, rng):
    cue(0.15, "pack:x_boom", -28)
    cue(0.15, "pack:x_clickhit", -24)
    for at in (5.88, 7.18, 7.88, 9.0):
        cue(at, "pack:y_bubble", -26)
    for i, (start, at, pros) in enumerate(RANKS):
        cue(start - 0.05, "pack:y_swoosh", -22)
        cue(at, "pack:x_clickhit", -23)
        if i == len(RANKS) - 1:  # number one
            cue(at, "pack:y_riser", -30, -1.2)
            cue(at + 0.05, "pack:y_success", -24)
        for p in pros:
            cue(p, "pack:x_blip", -28)
    cue(90.911, "pack:x_whip", -25)
    cue(92.6, "pack:x_clickhit", -24)
    cue(98.331, "pack:x_whip", -25)
    for j in range(5):
        cue(98.811 + j * 0.05, "pack:x_fast", -28)
    cue(99.2, "pack:x_clickhit", -23)
    cue(99.8, "pack:y_notif", -24)
