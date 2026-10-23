"""Sound cues for the desk-day reel (src/v14/config.ts) (source seconds). Only sounds from the user's SFX pack (sfx/pack)."""
GFX = []
BEHIND = []
PANEL = None
BROLL = []


def cues(cue, rng):
    # hook: desk B-roll, the watch's sitting clock racing
    cue(1.02, "pack:whoosh_soft", -24)
    cue(1.25, "pack:tick", -22)
    for j in range(22):
        cue(1.4 + j * 0.16, "pack:tick", -33 + (j // 6))
    cue(4.25, "pack:notif", -26)
    cue(5.2, "pack:whoosh_fast2", -23)
    cue(5.3, "pack:whoosh_cine", -27)  # sun crosses the day
    cue(6.15, "pack:chime2", -26)  # gym hour lights up
    cue(8.52, "pack:hit", -22)
    # trial
    cue(10.94, "pack:whoosh_fast", -24)
    for j in range(8):
        cue(12.3 + j * 0.09, "pack:tick", -30)
    cue(12.74, "pack:tick", -24)
    cue(14.34, "pack:tick", -24)
    cue(16.0, "pack:whoosh_soft", -26)
    for k in range(8):
        cue(16.4 + k * 3.0 / 7, "pack:key", -27)  # walker steps out
    cue(19.9, "pack:whoosh_soft", -28)
    # glucose monitor
    cue(21.6, "pack:whoosh_fast2", -24)
    cue(22.36, "pack:whoosh_soft", -28)
    cue(24.8, "pack:whoosh_soft", -26)
    cue(27.36, "pack:tick", -24)
    cue(28.14, "pack:hit", -19)
    # true / false cards
    cue(30.2, "pack:whoosh_fast", -24)
    cue(31.96, "pack:hit", -21)
    cue(34.3, "pack:whoosh_fast", -24)
    cue(36.22, "pack:hit", -21)
    cue(36.85, "pack:whoosh_fast", -24)
    cue(37.05, "pack:chime", -23)
    # results vary -> pattern
    cue(37.98, "pack:whoosh_fast2", -24)
    for j in range(4):
        cue(38.3 + j * 0.15, "pack:tick", -27)
    cue(43.4, "pack:whoosh_soft", -25)
    # reminder on the watch
    cue(47.2, "pack:whoosh_fast2", -24)
    cue(49.58, "pack:notif", -19)
    for j in range(3):
        cue(51.04 + j, "pack:tick", -27)
    # walk B-roll
    cue(53.4, "pack:whoosh_fast", -22)
    cue(54.06, "pack:tick", -24)
    cue(55.96, "pack:tick", -24)
    # meeting, build
    cue(57.1, "pack:whoosh_fast2", -24)
    cue(57.62, "pack:hit", -24)
    cue(59.24, "pack:whoosh_soft", -26)
    cue(59.84, "pack:chime2", -26)
    cue(61.26, "pack:whoosh_fast2", -24)
    for j in range(18):
        cue(61.86 + j * 0.04, "pack:tick", -33)
    cue(62.72, "pack:chime2", -26)
    cue(64.88, "pack:hit", -22)
    # ending: comment GUIDE, the watch buzzes with the guide
    cue(70.7, "pack:whoosh_soft", -25)
    for j in range(5):
        cue(71.28 + j * 0.07, "pack:key", -26)
    cue(71.88, "pack:whoosh_fast", -24)
    cue(72.46, "pack:notif", -19)
