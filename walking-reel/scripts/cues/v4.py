"""Sound cues for the busy-women reel (source seconds, match src/v4).

The fast montage (8.6-12.3) is left out of BROLL/GFX on purpose: the shared riser+boom on every
0.7 s cut would be too much, so it gets its own whoosh + slam per word below.
"""
GFX = [(31.2, 40.2), (43.05, 46.3)]
BEHIND = []
PANEL = (24.3, 31.2)
BROLL = [(0.0, 2.6), (40.2, 41.9), (41.9, 43.05)]


def cues(cue, rng):
    # hook: notifications stack up on the desk clip
    for t0 in (0.12, 0.62, 1.12, 1.62):
        cue(t0, "ding", -22)
        cue(t0, "pop", -25)
    cue(0.05, "whoosh", -24)
    # STOP
    cue(2.64, "thump", -12)
    cue(2.66, "clank", -27)
    # five meals + the week lighting up
    for i in range(5):
        cue(5.66 + i * 0.13, "pop", -21)
    for i in range(7):
        cue(6.85 + i * 0.12, "click_hi", -29)
    # montage: a whoosh into every cut, a slam on every word, the day bar ticking
    for t0 in (8.6, 9.75, 10.5, 11.45):
        cue(t0, "whoosh", -22, -0.12)
    for t0 in (9.12, 9.82, 10.56, 11.52):
        cue(t0, "thump", -16)
        cue(t0 + 0.02, "click", -26)
    cue(10.6, "rwhoosh", -24)  # the train rides the route
    cue(12.3, "rwhoosh", -24, -0.25)
    cue(12.3, "boom", -18)
    # the diet's shopping list
    cue(13.5, "page", -23)
    for t0 in (14.72, 15.48, 17.3, 18.82):
        cue(t0, "pop_lo", -19)
        cue(t0 + 0.04, "chirp", -30)
    cue(19.38, "thump", -15)
    cue(19.4, "chirp_big", -25)
    # it all falls off; can't stick to it
    cue(20.92, "rwhoosh", -20)
    cue(21.45, "thump", -18)
    cue(21.56, "buzz", -21)
    # PERFECT (behind her), struck out
    for i in range(7):
        cue(22.8 + i * 0.035, "click", -26)
    cue(22.8, "thump", -17)
    cue(23.95, "whoosh", -22)
    cue(24.0, "buzz", -25)
    # split: 5-6 meals, three ticks
    cue(24.4, "chirp", -30)
    cue(25.12, "chirp_big", -25)
    for i in range(6):
        cue(26.18 + i * 0.09, "pop", -24)
    for t0 in (26.74, 28.14, 29.14):
        cue(t0, "pop", -21)
        cue(t0 + 0.3, "ding", -26)
    # Instagram vs real life
    cue(32.14, "chirp", -29)
    cue(33.44, "chirp", -31)
    cue(34.08, "whoosh", -24)
    cue(34.12, "pop_lo", -20)
    for j in range(10):
        cue(35.06 + j * 0.08, "click_hi", -31)
    cue(35.6, "buzz", -21)
    cue(36.6, "chirp", -30)
    cue(36.74, "whoosh", -24)
    cue(36.78, "pop_lo", -20)
    cue(38.54, "ding", -21)
    for j in range(8):
        cue(38.92 + j * 0.09, "click_hi", -31)
    # training clips
    cue(40.22, "clank", -22)
    cue(41.92, "thump", -20)
    # keeping it off
    cue(43.1, "whoosh", -26)
    cue(43.3, "chirp_big", -26)
    cue(43.9, "whoosh", -26)
    cue(44.0, "pop", -21)
    cue(44.9, "pop", -21)
    cue(45.0, "ding", -25)
    # CTA: comment box types BUSY, send, the guide flies in
    cue(46.42, "pop", -19)
    for i in range(4):
        cue(46.56 + i * 0.1, "key", -22)
    cue(46.56, "thump", -19)
    cue(47.3, "whoosh", -22)
    cue(47.32, "pop", -19)
    cue(48.16, "chirp_big", -24)
    cue(48.18, "pop_lo", -19)
