"""Sound cues for the skinny-fat reel (4 clips joined), output = source seconds. User's SFX pack, no music."""
GFX = []
BEHIND = []
PANEL = None
BROLL = []


def cues(cue, rng):
    # photo cards snap in like photos, "=" lands, then "This Type" on the skinny-fat card
    cue(0.96, "pack:y_shutter2", -22)
    cue(0.98, "pack:y_swoosh", -27)
    cue(2.04, "pack:y_shutter2", -22)
    cue(2.06, "pack:y_swoosh", -27)
    cue(2.92, "pack:x_clickhit", -23)
    cue(3.8, "pack:x_whip", -27)
    cue(4.05, "pack:y_ping", -25)
    # "the most DANGEROUS" rises from behind her head
    cue(6.0, "pack:y_riser", -27)
    for j in range(5):
        cue(6.42 + j * 0.05, "pack:x_fast", -29)
    cue(6.7, "pack:x_boom", -26)
    # skinny fat syndrome
    cue(8.36, "pack:x_fast", -26)
    for at in (9.16, 9.5, 9.92):
        cue(at, "pack:x_blip", -26)
    # body scan: whoosh in, scanner hum, ring locks with a ping, colour floods in, VISCERAL FAT stamps, whoosh out
    cue(10.36, "pack:x_camwhoosh", -23)
    cue(10.45, "pack:y_lab", -31)
    cue(10.91, "pack:y_mouse", -26)
    cue(12.83, "pack:y_scanbeep", -27)
    cue(13.35, "pack:y_ping", -24)
    cue(13.61, "pack:x_riser", -29)
    cue(14.2, "pack:x_clickhit", -26)
    cue(15.98, "pack:x_clickhit", -21)
    cue(16.0, "pack:x_boom", -28)
    cue(16.72, "pack:x_whip", -25)
    # mostly seen in Indians, then the three conditions
    cue(18.11, "pack:y_ding", -27)
    cue(19.3, "pack:x_whip", -28)
    for at in (19.87, 20.57, 21.55):
        cue(at, "pack:y_bubble", -23)
        cue(at + 0.06, "pack:x_clickhit", -28)
    # excessive cardio / crash dieting crossed out
    cue(22.633, "pack:x_fast", -27)
    for at in (23.78, 24.98):
        cue(at, "pack:x_blip", -26)
        cue(at + 0.3, "pack:click", -25)
    cue(26.26, "pack:x_fast", -25)
    # B-roll: strength training, protein-rich diet
    for at in (28.55, 29.75):
        cue(at - 0.06, "pack:y_swoosh", -22)
    for at in (28.9, 30.1):
        cue(at, "pack:x_clickhit", -26)
    cue(30.93, "pack:x_whip", -26)
    # comment CHANGE
    cue(33.93, "pack:x_whip", -25)
    for j in range(6):
        cue(34.33 + j * 0.05, "pack:x_fast", -27)
    cue(34.7, "pack:x_clickhit", -23)
    cue(34.83, "pack:y_notif", -24)
