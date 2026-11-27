"""Landing-page video cues (output = source seconds). Soft and sparse - it is a website video. No music."""
GFX = []
BEHIND = []
PANEL = None
BROLL = []
PANELS = [0.5, 9.1, 13.0, 17.8, 25.24, 36.9, 46.0, 57.0, 65.7, 85.7, 90.0, 106.3, 108.3, 120.7, 127.6, 136.9, 146.8, 151.8, 152.0, 170.0, 193.0, 203.0, 210.6, 219.6, 260.2, 281.4, 295.3]
CHAPTERS = [42.9, 80.95, 103.85, 149.21, 259.71, 291.08]


def cues(cue, rng):
    for at in PANELS:
        cue(at, "whoosh_soft" if False else "pack:whoosh_soft", -31)
    for at in CHAPTERS:
        cue(at, "pack:x_blip", -30)
    cue(13.46, "pack:y_ding", -30)
    cue(15.88, "pack:y_ding", -30)
    cue(53.97, "pack:click", -29)
    cue(61.4, "pack:click", -29)
    cue(88.0, "pack:y_cash", -29)
    cue(297.6, "pack:y_cash", -29)
    cue(308.28, "pack:y_notif", -27)
