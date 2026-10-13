"""Sound cues for the sabudana reel (times match src/sabudana)."""
GFX = [(6.6, 10.9), (13.4, 22.9), (42.7, 53.6)]
BEHIND = [(0.0, 6.6), (10.9, 13.4), (26.3, 29.95), (64.6, 99)]
PANEL = (30.2, 42.7)
BROLL = [(53.6, 57.95)]


def cues(cue, rng):
    # hook: journey, suspicious eye, "LIGHT" lands
    cue(0.2, "pop", -21)
    cue(2.32, "chirp", -29)
    cue(4.4, "pop", -21)
    cue(4.4, "chirp", -30)
    for i in range(7):
        cue(5.62 + i * 0.05, "click", -26)
    cue(5.62, "thump", -19)
    # light scene: bowl pops, feather floats up (airy whoosh), protein meter barely moves
    cue(6.65, "pop", -20)
    cue(8.4, "whoosh", -25)
    cue(8.46, "chirp_big", -26)
    cue(9.55, "pop_lo", -23)
    cue(9.9, "buzz", -27)
    # SABUDANA / NAVRATRI
    for i in range(8):
        cue(11.5 + i * 0.04, "click", -26)
    cue(11.5, "thump", -19)
    cue(12.52, "pop", -21)
    # pearls pouring into the bowl, then the two meters
    cue(13.68, "chirp", -30)
    cue(14.54, "chirp_big", -26)
    cue(14.6, "pearls", -20)
    cue(15.3, "pearls", -24)
    cue(16.6, "pop", -22)
    cue(16.75, "whoosh", -27)  # carbs bar fills
    cue(16.78, "chirp", -29)
    cue(19.5, "pop_lo", -22)
    cue(19.7, "chirp_big", -25)
    cue(19.75, "buzz", -27)
    cue(22.0, "chirp", -29)
    cue(16.0, "whoosh", -27)
    # PROTEIN?
    cue(26.38, "pop", -21)
    cue(26.56, "chirp", -30)
    cue(27.82, "chirp", -30)
    for i in range(8):
        cue(28.66 + i * 0.04, "click", -26)
    cue(28.66, "thump", -19)
    # split layout: what each ingredient adds (with a sound for each)
    cue(30.3, "chirp", -30)
    cue(30.6, "crunch", -20)  # peanuts
    cue(31.0, "chirp", -29)
    cue(32.82, "chirp", -31)
    cue(34.42, "pop", -21)  # potato
    cue(34.84, "chirp", -29)
    cue(36.78, "sizzle", -24)  # cooking fat
    cue(37.44, "chirp", -29)
    cue(39.24, "drop", -19)  # soaking
    cue(39.55, "drop", -24)
    cue(40.4, "chirp", -29)
    cue(41.64, "chirp", -30)
    cue(41.7, "buzz", -24)
    # build the meal: paneer + curd go in, protein meter rises, check the portion
    cue(43.0, "drop", -24)  # milk drop
    cue(43.42, "chirp_big", -26)
    cue(44.76, "chirp", -30)
    cue(46.38, "pop", -20)
    cue(47.06, "chirp", -29)
    cue(48.96, "pop", -21)
    cue(49.76, "pop", -21)
    for t0 in (49.2, 49.9):
        for j in range(5):
            cue(t0 + j * 0.06, "click_hi", -32)
    cue(49.85, "whoosh", -25)
    cue(50.64, "pop", -20)
    cue(51.5, "chirp", -29)
    cue(52.72, "ding", -24)
    cue(46.0, "whoosh", -27)
    cue(50.3, "whoosh", -27)
    # eating B-roll: spoon clink, then the chips
    cue(53.9, "clink", -24)
    cue(55.5, "pop", -20)
    cue(56.46, "chirp", -29)
    # CTA
    cue(64.88, "pop", -20)
    for i in range(5):
        cue(65.12 + i * 0.09, "key", -24)
    cue(65.12, "thump", -19)
    cue(66.62, "pop", -21)
    for t0 in (66.62, 67.0, 67.56):
        cue(t0, "chirp", -30)
