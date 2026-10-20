"""Shared edit plan: segment cuts, transitions and text timing (all times in output seconds).
BPM is 120, so one beat = 0.5 s = 15 frames and every cut lands on a beat."""

FPS = 30
W, H = 1080, 1920
DUR = 28.0
BPM = 120

# clip: source file number (raw/cN.mp4); src: source start second at the cut;
# speed: (fraction-of-segment, speed) keypoints; zoom: (fraction, zoom) keypoints;
# focus: (x, y) normalised point the camera glides toward; gain/sat/wb: per-clip colour matching.
SEGMENTS = [
    dict(name="bride_reveal",  start=0.0,  clip=2, src=3.4,  speed=[(0, .8), (1, .6)],            zoom=[(0, 1.38), (.22, 1.13), (1, 1.22)], focus=(.5, .45)),
    dict(name="groom_waits",   start=3.0,  clip=4, src=0.2,  speed=[(0, .8), (1, .8)],            zoom=[(0, 1.05), (1, 1.17)],              focus=(.55, .4)),
    dict(name="bride_in_fog",  start=4.5,  clip=4, src=3.2,  speed=[(0, .9), (1, .9)],            zoom=[(0, 1.10), (1, 1.28)],              focus=(.42, .55)),
    dict(name="bride_water",   start=6.5,  clip=6, src=3.8,  speed=[(0, .8), (1, .8)],            zoom=[(0, 1.0), (1, 1.14)],               focus=(.5, .55)),
    dict(name="groom_joy",     start=8.0,  clip=6, src=7.0,  speed=[(0, 1), (1, 1)],              zoom=[(0, 1.08), (1, 1.2)],               focus=(.5, .35)),
    dict(name="aisle_walk",    start=9.0,  clip=2, src=9.4,  speed=[(0, 1), (1, 1)],              zoom=[(0, 1.0), (1, 1.22)],               focus=(.5, .65)),
    dict(name="petals",        start=10.0, clip=1, src=0.4,  speed=[(0, 1.3), (1, 1.3)],          zoom=[(0, 1.05), (1, 1.17)],              focus=(.3, .5),  gain=1.25, sat=.92),
    dict(name="twirl_a",       start=11.0, clip=5, src=21.2, speed=[(0, 1), (.5, .45), (1, .9)],  zoom=[(0, 1.0), (1, 1.1)],                focus=(.55, .55)),
    dict(name="dance_smile",   start=12.0, clip=3, src=9.2,  speed=[(0, 1), (1, 1)],              zoom=[(0, 1.0), (1, 1.14)],               focus=(.7, .5),  sat=.82, wb=(.96, 1.0, 1.05)),
    dict(name="varmala",       start=13.0, clip=6, src=19.0, speed=[(0, .9), (1, .5)],            zoom=[(0, 1.0), (1, 1.16)],               focus=(.5, .6)),
    dict(name="pheras",        start=14.5, clip=7, src=9.0,  speed=[(0, 1), (1, 1)],              zoom=[(0, 1.0), (1, 1.12)],               focus=(.55, .6)),
    dict(name="twirl_b",       start=15.5, clip=5, src=24.0, speed=[(0, .8), (1, .8)],            zoom=[(0, 1.0), (1, 1.12)],               focus=(.6, .55)),
    dict(name="veil_lift",     start=16.5, clip=4, src=17.2, speed=[(0, .8), (1, .8)],            zoom=[(0, 1.15), (1, 1.27)],              focus=(.5, .5)),
    dict(name="hands",         start=17.5, clip=6, src=21.0, speed=[(0, 1), (1, 1)],              zoom=[(0, 1.0), (1, 1.12)],               focus=(.5, .5)),
    dict(name="hug",           start=18.5, clip=2, src=15.0, speed=[(0, 1.3), (.6, .7), (1, .5)], zoom=[(0, 1.0), (1, 1.12)],               focus=(.5, .5)),
    dict(name="garland",       start=20.0, clip=2, src=18.3, speed=[(0, .7), (1, .7)],            zoom=[(0, 1.05), (1, 1.17)],              focus=(.62, .45)),
    dict(name="walk_together", start=22.0, clip=4, src=23.7, speed=[(0, .85), (1, .85)],          zoom=[(0, 1.0), (1, 1.1)],                focus=(.5, .5)),
    dict(name="kiss",          start=24.0, clip=2, src=31.0, speed=[(0, .8), (1, .8)],            zoom=[(0, 1.0), (1, 1.14)],               focus=(.55, .42)),
]

# cut time, transition kind, total length (transition straddles the cut)
TRANSITIONS = [
    (3.0,  "zoomin",    0.40),
    (4.5,  "whip_l",    0.30),
    (6.5,  "flash",     0.25),
    (8.0,  "zoomflash", 0.32),
    (9.0,  "whip_r",    0.27),
    (10.0, "spin+",     0.36),
    (11.0, "whip_u",    0.27),
    (12.0, "flash",     0.20),
    (13.0, "iris",      0.50),
    (14.5, "whip_d",    0.27),
    (15.5, "zoomin",    0.36),
    (16.5, "diag",      0.50),
    (17.5, "whip_r",    0.27),
    (18.5, "spin-",     0.36),
    (20.0, "lightleak", 0.80),
    (22.0, "softzoom",  0.60),
    (24.0, "glowdip",   0.50),
]

# beat-synced punch zooms (time, amplitude)
PUNCHES = [(8.0, .07), (8.5, .045), (9.5, .05), (11.5, .05), (12.5, .05), (14.0, .045),
           (15.0, .05), (16.0, .05), (17.0, .05), (18.0, .05), (19.0, .05)]

FADE_OUT_START = 27.25
