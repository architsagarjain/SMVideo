"""Sound cues for ad B (IMG_2607), source seconds. All from the user's SFX pack."""
GFX = []
BEHIND = []
PANEL = None
BROLL = []
MUSIC = ("footage/ads/music/m801.mp3", 4.5, -14)  # Mixkit "Dreaming Big" (Mixkit Stock Music Free License), ducked under speech
INSERTS = [(38.7, "footage/ads/testimonials/Client T 2.mp4", 30.54, 40.45, 0.25)]  # (source time of the gap, clip, from, to, lead-in)
GAP = 10.41


def cues(cue, rng):
    # search bar types "Free Diet Plans", a click, results drop in
    for j in range(15):
        cue(0.95 + j * 1.25 / 15, "pack:y_key", -26)
    cue(2.3, "pack:y_mouse", -22)
    for at in (2.4, 3.28, 3.42):
        cue(at, "pack:y_notif", -30)
    cue(3.7 - 0.06, "pack:y_swoosh", -22)
    for at in (10.62, 15.1, 21.7, 22.4, 23.7, 28.28):
        cue(at - 0.06, "pack:x_whip", -23)
    for at in (5.22, 15.5, 17.9, 22.0, 22.7, 24.1, 29.4):
        cue(at, "pack:x_clickhit", -26)
    # zoom + WHY PAY FOR A COACH?
    cue(5.92, "pack:y_riser", -26)
    for j in range(4):
        cue(6.04 + j * 0.05, "pack:x_fast", -29)
    cue(6.92, "pack:x_boom", -27)
    # wall of women, 500+
    for j in range(11):
        cue(8.26 + j * 0.06, "pack:y_bubble", -27)
    cue(9.08, "pack:x_camwhoosh", -27)
    cue(9.98, "pack:y_ding", -27)
    # Times Square: shutter, city crowd, taxi horn, neon flickers on
    cue(10.62, "pack:y_shutter", -22)
    cue(10.66, "pack:y_crowd", -27)
    cue(11.0, "pack:y_horn", -33)
    cue(11.92, "pack:y_shutter", -24)
    for j in range(6):
        cue(11.06 + j * 0.05, "pack:click", -32)
    cue(26.18, "pack:x_fast", -26)
    # pizza nights / chole bhature photo cards, YES stamps
    for at in (35.78, 37.26):
        cue(at, "pack:x_whip", -27)
        cue(at + 0.35, "pack:y_success", -27)
    # client testimonial
    cue(38.7, "pack:x_camwhoosh", -25)
    cue(38.7, "pack:y_success", -26, 0.3)
    cue(38.7, "pack:x_whip", -27, GAP - 0.3)
    # end card
    cue(40.84, "pack:x_whip", -25)
    cue(43.0, "pack:y_riser", -29)
    for j in range(3):
        cue(44.24 + j * 0.07, "pack:x_fast", -26)
    cue(44.58, "pack:y_cash", -22)
    cue(46.74, "pack:y_notif", -24)
