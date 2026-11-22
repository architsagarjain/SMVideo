"""Sound cues for ad A (IMG_2606), source seconds. All from the user's SFX pack."""
GFX = []
BEHIND = []
PANEL = None
BROLL = []
MUSIC = ("footage/ads/music/m801.mp3", 4.5, -14)  # Mixkit "Dreaming Big" (Mixkit Stock Music Free License), ducked under speech
INSERTS = [(37.45, "footage/ads/testimonials/Client T 2.mp4", 7.30, 12.75, 0.25)]  # (source time of the gap, clip, from, to, lead-in)


def cues(cue, rng):
    cue(0.95, "pack:x_fast", -27)
    for at in (2.16, 2.68, 3.16, 3.5, 3.7):  # Free Diet Plans & Workouts, word by word
        cue(at, "pack:x_blip", -27)
    cue(4.16, "pack:x_clickhit", -24)  # zero-cost tag
    for j in range(11):  # the wall of women pops in
        cue(8.7 + j * 0.06, "pack:click", -31)
    for j in range(6):  # neon flickers on
        cue(11.62 + j * 0.05, "pack:click", -32)
    # B-roll cutaways: whip in, letters land
    for at in (4.98, 15.3, 21.44, 22.22, 23.48, 28.2):
        cue(at - 0.06, "pack:x_whip", -23)
    for at in (5.3, 15.7, 17.68, 21.76, 22.56, 23.82, 29.64):
        cue(at, "pack:x_clickhit", -26)
    # dolly zoom + WHY PAY FOR A COACH? rising behind her
    cue(6.44, "pack:x_riser", -25)
    for j in range(4):
        cue(6.5 + j * 0.05, "pack:x_fast", -29)
    cue(7.4, "pack:x_boom", -27)
    # 500+ counts up, Times Square badge
    cue(9.5, "pack:x_camwhoosh", -27)
    cue(10.4, "pack:x_clickhit", -24)
    cue(11.6, "pack:x_cine", -26)
    cue(26.58, "pack:x_fast", -26)
    for at in (35.16, 36.44):  # pizza nights / chole bhature photo cards, YES stamps
        cue(at, "pack:x_whip", -27)
        cue(at + 0.35, "pack:x_clickhit", -25)
    # end card: book pill, ₹99 rises, tap below
    cue(39.54, "pack:x_whip", -25)
    for j in range(3):
        cue(41.96 + j * 0.07, "pack:x_fast", -26)
    cue(42.3, "pack:x_clickhit", -23)
    cue(44.5, "pack:x_notify", -24)
    # client testimonial: whoosh into the call, soft hit on the stars, whoosh back to her
    cue(37.45, "pack:x_camwhoosh", -25)
    cue(37.45, "pack:x_blip", -28, 0.3)
    cue(37.45, "pack:x_whip", -27, 5.95 - 0.3)
