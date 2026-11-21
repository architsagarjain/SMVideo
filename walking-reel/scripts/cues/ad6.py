"""Sound cues for ad A (IMG_2606), source seconds. All from the user's SFX pack."""
GFX = []
BEHIND = []
PANEL = None
BROLL = []


def cues(cue, rng):
    cue(0.95, "pack:x_fast", -27)
    for at in (1.2, 3.7):  # free diet plans / free workouts
        cue(at, "pack:x_blip", -26)
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
    for at in (35.16, 36.44):  # pizza nights / chole bhature
        cue(at, "pack:x_blip", -26)
    # end card: book pill, ₹99 rises, tap below
    cue(39.54, "pack:x_whip", -25)
    for j in range(3):
        cue(41.96 + j * 0.07, "pack:x_fast", -26)
    cue(42.3, "pack:x_clickhit", -23)
    cue(44.5, "pack:x_notify", -24)
