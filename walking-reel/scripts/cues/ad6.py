"""Sound cues for ad A (IMG_2606), source seconds. All from the user's SFX pack."""
GFX = []
BEHIND = []
PANEL = None
BROLL = []
MUSIC = ("footage/ads/music/m801.mp3", 4.5, -14)  # Mixkit "Dreaming Big" (Mixkit Stock Music Free License), ducked under speech
INSERTS = [(37.45, "footage/ads/testimonials/Client T 2.mp4", 16.43, 25.70, 0.25)]  # (source time of the gap, clip, from, to, lead-in)
GAP = 9.77


def cues(cue, rng):
    cue(0.95, "pack:x_fast", -27)
    # Free Diet Plans & Workouts land word by word, then the ₹0 sticker rings up
    for at in (2.16, 2.68, 3.16, 3.5, 3.7):
        cue(at, "pack:y_bubble", -24)
    cue(4.16, "pack:y_cash", -24)
    # B-roll cutaways: swoosh in, letters land
    cue(4.92, "pack:y_swoosh", -22)
    cue(4.94, "pack:y_key", -27)  # typing clip
    for at in (15.3, 21.44, 22.22, 23.48, 28.2):
        cue(at - 0.06, "pack:x_whip", -23)
    for at in (15.7, 17.68, 21.76, 22.56, 23.82, 29.64):
        cue(at, "pack:x_clickhit", -26)
    cue(22.3, "pack:click", -27)  # fork on the plate
    # zoom + WHY PAY FOR A COACH? rising behind her
    cue(6.44, "pack:y_riser", -26)
    for j in range(4):
        cue(6.5 + j * 0.05, "pack:x_fast", -29)
    cue(7.4, "pack:x_boom", -27)
    # the wall of women pops in, then 500+ lands
    for j in range(11):
        cue(8.7 + j * 0.06, "pack:y_bubble", -27)
    cue(9.5, "pack:x_camwhoosh", -27)
    cue(10.4, "pack:y_ding", -27)
    # Times Square: shutter on the photo, city crowd under it, a taxi horn, neon flickers on
    cue(11.0, "pack:y_shutter", -22)
    cue(11.05, "pack:y_crowd", -27)
    cue(11.4, "pack:y_horn", -33)
    cue(12.36, "pack:y_shutter", -24)
    for j in range(6):
        cue(11.62 + j * 0.05, "pack:click", -32)
    cue(26.58, "pack:x_fast", -26)
    # pizza nights / chole bhature photo cards, YES stamps
    for at in (35.16, 36.44):
        cue(at, "pack:x_whip", -27)
        cue(at + 0.35, "pack:y_success", -27)
    # client testimonial: whoosh into the call, success chime on the stars, whoosh back to her
    cue(37.45, "pack:x_camwhoosh", -25)
    cue(37.45, "pack:y_success", -26, 0.3)
    cue(37.45, "pack:x_whip", -27, GAP - 0.3)
    # end card: book pill, riser into ₹99, cash register, closing pill
    cue(39.54, "pack:x_whip", -25)
    cue(40.6, "pack:y_riser", -29)
    for j in range(3):
        cue(41.96 + j * 0.07, "pack:x_fast", -26)
    cue(42.3, "pack:y_cash", -22)
    cue(44.5, "pack:y_notif", -24)
