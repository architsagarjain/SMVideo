"""Sound cues for the sleep reel (times match src/sleep, source seconds)."""
GFX = [(7.25, 14.1), (21.7, 36.6), (81.9, 88.95), (88.95, 95.4)]
BEHIND = [(0.0, 7.25), (14.1, 18.1), (18.1, 21.7), (36.6, 44.1), (70.1, 75.4), (95.4, 99)]
PANEL = (44.1, 70.1)
BROLL = [(75.4, 79.4), (79.4, 81.9)]


def cues(cue, rng):
    # hook: zoom snap, title, -1 HR slam, moon, fire
    cue(0.55, "whoosh", -22)
    cue(0.55, "pop", -18)
    cue(0.62, "pop_lo", -21)  # clock sticker
    cue(2.24, "rwhoosh", -22)  # clock rewinds an hour
    for i in range(8):
        cue(2.24 + i * 0.1, "click_hi", -30)
    cue(2.5, "pop", -19)  # -1 HOUR pill
    cue(2.9, "pop_lo", -21)
    cue(2.95, "chirp", -30)
    cue(5.46, "pop", -20)
    cue(5.5, "chirp", -30)
    # two places: scale, branches, fire / barbell
    cue(7.96, "pop_lo", -19)
    cue(8.2, "chirp", -29)
    cue(9.9, "chirp", -30)
    cue(10.2, "whoosh", -27)
    cue(11.4, "pop", -20)
    cue(11.9, "ding", -27)
    cue(12.48, "clank", -24)
    cue(13.0, "buzz", -26)
    # SLEEP in control
    for i in range(5):
        cue(14.66 + i * 0.06, "click", -25)
    cue(14.66, "thump", -17)
    cue(15.74, "pop", -21)
    cue(17.2, "pop_lo", -23)
    cue(17.25, "chirp", -30)
    # 1 HOUR?
    cue(18.84, "pop_lo", -22)
    cue(20.02, "beep", -27)
    cue(20.22, "beep", -29)
    for i in range(7):
        cue(20.88 + i * 0.05, "click", -25)
    cue(20.88, "thump", -17)
    # the study
    cue(21.74, "pop", -20)
    cue(22.0, "chirp_big", -26)
    cue(25.24, "pop", -21)
    cue(25.5, "pop", -21)
    cue(27.4, "whoosh", -27)
    cue(27.58, "pop_lo", -20)
    cue(31.2, "beep", -25)
    cue(31.4, "beep", -27)
    cue(31.66, "chirp", -29)
    cue(32.64, "chirp", -31)
    cue(34.46, "pop_lo", -22)
    cue(35.28, "ding", -26)
    # 8 weeks, SAME on the scale
    cue(37.04, "pop", -20)
    for i in range(4):
        cue(40.26 + i * 0.06, "click", -25)
    cue(40.26, "thump", -17)
    cue(41.24, "pop_lo", -21)
    cue(43.5, "ding", -27)
    # split chart: counting bars
    cue(44.74, "chirp", -29)
    cue(46.0, "chirp_big", -26)
    cue(49.0, "pop", -22)
    for t0, n in ((53.28, 10), (57.3, 5), (64.4, 10), (67.92, 5)):
        cue(t0, "whoosh", -27)
        for j in range(n):
            cue(t0 + 0.05 + j * 0.06, "click_hi", -31)
    cue(54.0, "ding", -26)
    cue(60.76, "beep", -25)
    cue(64.45, "thump", -15)
    cue(64.6, "buzz", -24)
    # no weights
    cue(70.8, "pop", -20)
    cue(72.32, "page", -24)
    cue(73.64, "clank", -22)
    cue(74.2, "buzz", -22)
    for i in range(10):
        cue(74.56 + i * 0.035, "click", -26)
    cue(74.56, "thump", -17)
    # B-roll: dumbbell clank on the cut, chip, shield
    cue(75.42, "clank", -22)
    cue(75.6, "pop", -20)
    cue(79.0, "ding", -26)
    # adapt
    cue(81.95, "pop_lo", -20)  # low battery
    cue(84.06, "ding", -24)  # battery charges
    cue(82.44, "chirp", -30)
    cue(83.54, "pop", -22)
    cue(84.06, "chirp_big", -25)
    cue(85.38, "whoosh", -26)
    cue(88.34, "pop", -19)
    cue(88.4, "chirp", -29)
    # dialed in: ticks, then SLEEP misses
    cue(90.26, "chirp", -30)
    for t0 in (90.3, 90.75, 91.2):
        cue(t0, "pop", -21)
        cue(t0 + 0.25, "ding", -28)
    cue(91.36, "chirp_big", -26)
    cue(92.18, "pop_lo", -20)
    cue(93.28, "chirp", -29)
    cue(93.98, "buzz", -21)
    # CTA
    cue(95.52, "pop", -20)
    for i in range(5):
        cue(96.0 + i * 0.09, "key", -24)
    cue(96.0, "thump", -19)
    cue(97.62, "pop", -21)
    for t0 in (97.62, 98.06, 98.48):
        cue(t0, "chirp", -30)
