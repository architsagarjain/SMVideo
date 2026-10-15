"""Sound cues for the knee-injury reel (times match src/knee)."""
GFX = [(16.9, 28.4), (43.9, 50.35), (61.85, 70.55)]
BEHIND = [(0.0, 3.6), (10.4, 16.9), (57.55, 61.85), (70.55, 99)]
PANEL = (33.2, 43.9)
BROLL = [(3.6, 6.0), (50.35, 53.9), (53.9, 57.55)]


def cues(cue, rng):
    # hook
    cue(0.77, "whoosh", -22)  # first-frame zoom snap
    cue(0.77, "pop", -18)  # hook title
    cue(0.95, "pop_lo", -21)  # scales sticker
    cue(3.08, "pop", -20)  # bandaid sticker
    for i in range(3):  # "+15" characters rising
        cue(1.62 + i * 0.12, "click", -24)
    cue(1.62, "thump", -19)
    cue(2.26, "chirp", -29)
    cue(3.16, "chirp", -29)
    # bed-rest cutaway: quiet hospital-monitor beeps
    for i in range(3):
        cue(3.9 + i * 0.75, "beep", -33)
    # deadline: quote typed, calendar, DEADLINE stamp + cross
    for i in range(22):
        cue(12.0 + i * 0.045, "key", -33)
    for i in range(16):
        cue(13.22 + i * 0.05, "key", -33)
    cue(13.66, "page", -24)
    cue(13.8, "chirp", -30)
    cue(15.55, "thump", -18)
    cue(15.55, "chirp_big", -25)
    cue(16.0, "buzz", -22)
    # questions
    cue(17.0, "pop", -21)
    cue(17.66, "chirp_big", -25)
    cue(18.26, "chirp", -29)
    for t0 in (20.02, 22.5, 24.5, 26.36):
        cue(t0, "pop", -21)
        cue(t0 + 0.4, "chirp", -30)
    cue(19.3, "whoosh", -27)
    # split layout chart
    cue(33.5, "chirp", -30)
    cue(36.18, "chirp", -29)
    cue(38.0, "chirp", -29)
    cue(39.85, "whoosh", -27)  # predicted line draws
    cue(39.88, "chirp", -30)
    cue(42.1, "whoosh", -25)  # actual line draws
    cue(42.54, "chirp_big", -25)
    cue(43.0, "buzz", -27)
    # weeks
    cue(44.3, "pop", -19)
    cue(44.86, "pop_lo", -22)
    cue(45.66, "chirp", -29)
    for i in range(5):
        cue(47.66 + i * 0.12, "pop_lo", -22)
    cue(48.24, "chirp_big", -26)
    cue(46.4, "whoosh", -27)
    # gym cutaway: dumbbell clank on the cut, steps as chips
    cue(50.38, "clank", -22)
    cue(53.92, "clank", -26)
    for t0 in (51.78, 53.06, 55.62):
        cue(t0, "pop", -20)
    for t0 in (52.8, 55.4):
        for j in range(5):
            cue(t0 + j * 0.06, "click_hi", -32)
    # 2026
    cue(58.9, "pop", -22)
    for i in range(4):
        cue(59.34 + i * 0.1, "click", -24)
    cue(59.34, "thump", -19)
    cue(60.64, "pop", -21)
    cue(60.7, "chirp", -30)
    # attention: flag, heartbeat on HEALTH, clock tick on TIME
    cue(62.16, "chirp", -30)
    for t0 in (62.92, 63.88, 65.04):  # her three things land on the scale
        cue(t0, "thump", -17)
        cue(t0, "pop_lo", -24)
    cue(63.56, "heartbeat", -18)
    cue(64.72, "ticktock", -22)
    for t0 in (62.7, 63.66, 64.82):
        cue(t0, "chirp", -30)
    cue(66.14, "chirp_big", -25)
    cue(66.16, "thump", -14)  # "more attention" slams the scale down
    cue(68.1, "pop_lo", -20)  # their deadline card lands
    cue(66.66, "ding", -25)
    cue(67.9, "chirp", -30)
    cue(69.12, "chirp", -29)
    cue(69.7, "buzz", -22)
    cue(66.0, "whoosh", -27)
    # CTA
    cue(70.92, "pop", -20)
    for i in range(5):
        cue(71.2 + i * 0.09, "key", -24)
    cue(71.2, "thump", -19)
    cue(72.86, "pop", -21)
    for t0 in (72.86, 73.18, 73.68):
        cue(t0, "chirp", -30)
