"""Sound cues for the 3-tips reel (source seconds, src/v5/config.ts). Only sounds from the user's
SFX pack (sfx/pack), placed by hand on cuts, headings and words."""
GFX = []
BEHIND = []
PANEL = None
BROLL = []

TIPS = [(7.36, 8.24, 3), (22.34, 23.12, 3), (30.46, 31.32, 3)]  # (number in, title in, title words)


def cues(cue, rng):
    # hook on the desk clip
    cue(0.86, "pack:hit", -22)
    cue(1.72, "pack:whoosh_soft", -26)
    # "here are my 3 tips"
    cue(2.62, "pack:whoosh_fast", -23)
    cue(3.36, "pack:whoosh_deep", -21)
    cue(3.42, "pack:hit", -22)
    # 1 2 3, the third lights up
    for i in range(3):
        cue(4.3 + i * 0.08, "pack:tick", -25)
    cue(4.42, "pack:chime2", -24)
    # tip headings: deep whoosh into the number, a hit as it lands, a tick per title word
    for num, title, n in TIPS:
        cue(num, "pack:whoosh_cine", -22)
        cue(num + 0.15, "pack:hit", -20)
        for i in range(n):
            cue(title + i * 0.12, "pack:tick", -24)
    # small wins build momentum
    for t0 in (9.96, 10.2, 10.54):
        cue(t0, "pack:tick", -21)
    cue(10.86, "pack:chime", -24)
    # gym / home / back to her
    cue(12.13, "pack:whoosh_fast", -22)
    cue(13.6, "pack:whoosh_fast2", -23)
    cue(14.6, "pack:whoosh_soft", -28)
    # 10 minute HIIT: the timer ticks
    cue(16.2, "pack:whoosh_fast", -22)
    for j in range(8):
        cue(16.5 + j * 0.25, "pack:tick", -29)
    # just do something
    cue(20.68, "pack:hit", -22)
    # stop skipping meals
    cue(24.1, "pack:whoosh_fast", -22)
    cue(24.94, "pack:hit", -24)
    # the skip-lunch loop
    cue(26.0, "pack:whoosh_soft", -25)
    for t0 in (26.04, 27.46, 28.86):
        cue(t0, "pack:tick", -20)
    cue(28.9, "pack:chime2", -25)
    # don't want to / know you should
    cue(35.24, "pack:whoosh_fast", -26)
    cue(36.02, "pack:chime", -24)
    # early morning workouts
    cue(36.9, "pack:whoosh_fast2", -23)
    cue(39.3, "pack:notif", -21)
    cue(40.02, "pack:hit", -24)
    # "I hated it at first": silence on purpose
    # focus
    cue(43.04, "pack:whoosh_soft", -24)
    cue(45.0, "pack:hit", -24)
    # the hard thing: done
    cue(47.64, "pack:chime", -22)
    # CTA: FAT LOSS behind her, the comment box types it and sends
    cue(48.45, "pack:whoosh_deep", -22)
    for i in range(8):
        cue(48.9 + i * 0.07, "pack:key", -19)
    cue(49.62, "pack:tick", -20)
    cue(49.64, "pack:whoosh_soft", -27)
    cue(50.64, "pack:notif", -21)
