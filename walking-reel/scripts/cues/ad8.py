"""Sound cues for ad C (IMG_2608), source seconds. All from the user's SFX pack."""
GFX = []
BEHIND = []
PANEL = None
BROLL = []


def cues(cue, rng):
    # "from this to this": two photo slots pop, then the figures
    cue(0.8, "pack:x_blip", -25)
    cue(2.86, "pack:x_whip", -25)
    cue(2.9, "pack:x_clickhit", -25)
    for j in range(2):
        cue(4.0 + j * 0.12, "pack:x_blip", -27)
    cue(4.7, "pack:x_fast", -27)
    # NOT JUST PHYSICAL rises behind her head
    for j in range(4):
        cue(6.56 + j * 0.05, "pack:x_fast", -29)
    cue(7.18, "pack:x_boom", -28)
    cue(8.76, "pack:x_camwhoosh", -27)
    cue(9.66, "pack:x_clickhit", -24)
    # quick B-roll run: stronger / confident / routine; lifestyle / life not on hold; feel their best
    for at in (15.62, 16.82, 18.22, 30.14, 33.6, 41.82):
        cue(at - 0.06, "pack:x_whip", -23)
    for at in (15.98, 17.1, 19.1, 30.6, 35.2, 44.7):
        cue(at, "pack:x_clickhit", -26)
    # ✕ roti / favourite foods / hours in the gym
    for at in (25.52, 26.56, 28.48):
        cue(at, "pack:x_blip", -26)
        cue(at + 0.3, "pack:click", -26)
    cue(40.5, "pack:x_cine", -26)
    cue(47.28, "pack:x_fast", -26)
    cue(50.42, "pack:x_whip", -25)
    for j in range(3):
        cue(53.2 + j * 0.07, "pack:x_fast", -26)
    cue(53.54, "pack:x_clickhit", -23)
    cue(56.0, "pack:x_notify", -24)
