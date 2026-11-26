"""Sound cues for the skinny-fat reel (4 clips joined), output = source seconds. User's SFX pack, no music."""
GFX = []
BEHIND = []
PANEL = None
BROLL = []


def cues(cue, rng):
    # two body cards pop, then "="
    cue(0.96, "pack:y_bubble", -24)
    cue(2.04, "pack:y_bubble", -24)
    cue(2.92, "pack:x_clickhit", -24)
    # "the most DANGEROUS" rises from behind her head
    cue(6.0, "pack:y_riser", -27)
    for j in range(5):
        cue(6.42 + j * 0.05, "pack:x_fast", -29)
    cue(6.7, "pack:x_boom", -27)
    # skinny fat syndrome
    cue(8.36, "pack:x_fast", -26)
    for at in (9.16, 9.5, 9.92):
        cue(at, "pack:x_blip", -26)
    # visceral fat diagram: whoosh in, fat fills, name stamps, whoosh out
    cue(10.36, "pack:x_camwhoosh", -24)
    cue(10.9, "pack:y_bubble", -25)
    cue(13.6, "pack:x_deep", -26)
    cue(16.03, "pack:x_clickhit", -22)
    cue(16.0, "pack:x_boom", -29)
    cue(16.72, "pack:x_whip", -26)
    # mostly seen in Indians, then the three diseases
    cue(18.11, "pack:y_ding", -27)
    for at in (19.87, 20.57, 21.55):
        cue(at, "pack:x_whip", -28)
        cue(at + 0.08, "pack:x_clickhit", -27)
    # excessive cardio / crash dieting crossed out
    cue(22.633, "pack:x_fast", -27)
    for at in (23.78, 24.98):
        cue(at, "pack:x_blip", -26)
        cue(at + 0.3, "pack:click", -26)
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
