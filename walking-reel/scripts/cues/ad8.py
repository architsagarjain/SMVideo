"""Sound cues for ad C (IMG_2608), source seconds. All from the user's SFX pack."""
GFX = []
BEHIND = []
PANEL = None
BROLL = []
MUSIC = ("footage/ads/music/m801.mp3", 4.5, -14)  # Mixkit "Dreaming Big" (Mixkit Stock Music Free License), ducked under speech
INSERTS = [(46.95, "footage/ads/testimonials/Client T 2.mp4", 7.30, 12.75, 0.25)]  # (source time of the gap, clip, from, to, lead-in)


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
    for j in range(11):  # the wall of women pops in
        cue(8.1 + j * 0.06, "pack:click", -31)
    cue(8.76, "pack:x_camwhoosh", -27)
    # PeakX logo slides out of its card
    cue(24.05, "pack:x_whip", -24)
    cue(24.2, "pack:x_boom", -29)
    cue(9.66, "pack:x_clickhit", -24)
    # quick B-roll run: stronger / confident / routine; lifestyle / life not on hold; feel their best
    for at in (15.62, 16.82, 18.22, 30.14, 33.6, 41.82):
        cue(at - 0.06, "pack:x_whip", -23)
    for at in (15.98, 17.1, 19.1, 30.6, 35.2, 44.7):
        cue(at, "pack:x_clickhit", -26)
    # ✕ roti / favourite foods / hours in the gym
    for at in (25.52, 26.56, 28.48):
        cue(at, "pack:x_whip", -27)
        cue(at + 0.35, "pack:x_clickhit", -25)
    cue(40.5, "pack:x_cine", -26)
    for j in range(6):  # neon flickers on
        cue(40.58 + j * 0.05, "pack:click", -32)
    cue(47.28, "pack:x_fast", -26)
    cue(50.42, "pack:x_whip", -25)
    for j in range(3):
        cue(53.2 + j * 0.07, "pack:x_fast", -26)
    cue(53.54, "pack:x_clickhit", -23)
    cue(56.0, "pack:x_notify", -24)
    # client testimonial: whoosh into the call, soft hit on the stars, whoosh back to her
    cue(46.95, "pack:x_camwhoosh", -25)
    cue(46.95, "pack:x_blip", -28, 0.3)
    cue(46.95, "pack:x_whip", -27, 5.95 - 0.3)
