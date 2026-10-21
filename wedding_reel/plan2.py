"""Edit plan v2: a CapCut-style, beat-locked cut list on the 137.42 BPM grid of the chosen song.
Every time below derives from BEAT; shot boundaries snap to whole video frames."""
FPS = 30
W, H = 1080, 1920
BPM = 137.42
BEAT = 60.0 / BPM            # 0.43663 s
DROP_SONG_T = 21.435         # first kick of the drop in the source song
N_BEATS = 70
ENDCARD_BEAT = 64
DROP_BEAT = 16
SONG_START = DROP_SONG_T - DROP_BEAT * BEAT
DUR = round(N_BEATS * BEAT * FPS) / FPS
NFRAMES = int(round(DUR * FPS))
def tb(beat): return round(beat * BEAT * FPS) / FPS     # beat -> frame-aligned seconds

# kind of each shot: ("single", ...) uses a source clip; "tiles3h" / "split3v" are multi-clip layouts; "endcard" is the brand card
# clip/src: source clip number + start second; speed/zoom keypoints are (fraction-of-shot, value); focus = (x, y) normalised
def S(b, n, clip, src, speed=1.0, zoom=(1.0, 1.14), focus=(.5, .5), trans=None, **kw):
    sp = speed if isinstance(speed, list) else [(0, speed), (1, speed)]
    d = dict(kind="single", b=b, n=n, clip=clip, src=src, speed=sp, zoom=[(0, zoom[0]), (1, zoom[1])], focus=focus, trans=trans)
    d.update(kw); return d

SHOTS = [
    dict(kind="tiles3h", b=0, n=4, trans=None, tiles=[
        dict(clip=2, src=3.95, speed=[(0, .8), (1, .8)], zoom=[(0, 1.15), (1, 1.3)], focus=(.5, .3)),
        dict(clip=4, src=0.30, speed=[(0, .8), (1, .8)], zoom=[(0, 1.1), (1, 1.25)], focus=(.55, .3)),
        dict(clip=6, src=5.20, speed=[(0, .7), (1, .7)], zoom=[(0, 1.05), (1, 1.2)], focus=(.55, .5))]),
    S(4, 5, 2, 5.4, .6, (1.0, 1.2), (.5, .4), ("zoomin", .34)),
    S(9, 1, 4, .2, .8, (1.05, 1.17), (.55, .4), ("whip_l", .26)),
    S(10, 2, 4, 3.6, .9, (1.1, 1.28), (.42, .55), ("spin+", .30)),
    S(12, 2, 6, 5.15, .65, (1.0, 1.14), (.5, .55), ("zoomin", .30)),
    S(14, 1, 6, 8.3, 1.0, (1.08, 1.2), (.5, .35), ("whip_r", .20)),
    S(15, 1, 1, .4, [(0, 1.5), (1, 2.5)], (1.05, 1.17), (.3, .5), ("glitch", .20), gain=1.25, sat=.92),
    # ---- DROP
    S(16, 2, 2, 10.9, 1.0, (1.0, 1.22), (.5, .65), ("zoomflash", .32)),
    S(18, 1, 1, 2.0, 1.3, (1.05, 1.17), (.3, .5), ("whip_u", .20), gain=1.25, sat=.92),
    S(19, 1, 5, 21.2, [(0, 1), (.5, .5), (1, .9)], (1.0, 1.1), (.55, .55), ("glitch", .18)),
    S(20, 2, 6, 8.6, 1.0, (1.08, 1.2), (.5, .35), ("spin-", .26)),
    S(22, 1, 3, 9.2, 1.0, (1.0, 1.14), (.7, .5), ("whip_l", .20), sat=.82, wb=(.96, 1.0, 1.05)),
    S(23, 1, 2, 13.2, .9, (1.0, 1.12), (.5, .45), ("flash", .16)),
    S(24, 2, 6, 20.2, [(0, .9), (1, .5)], (1.0, 1.16), (.5, .6), ("heart", .46)),
    S(26, 1, 7, 9.0, 1.0, (1.0, 1.12), (.55, .6), ("whip_d", .20)),
    S(27, 1, 5, 24.0, .8, (1.0, 1.12), (.6, .55), ("zoomin", .22)),
    S(28, 2, 4, 17.2, .8, (1.15, 1.27), (.5, .5), ("ink", .50)),
    S(30, 1, 6, 21.8, 1.0, (1.0, 1.12), (.5, .5), ("glitch", .18)),
    S(31, 1, 1, 12.2, 1.0, (1.05, 1.15), (.5, .5), ("flash", .18), gain=1.1),
    dict(kind="split3v", b=32, n=4, trans=("zoomin", .26), panels=[
        dict(clip=5, src=25.0, speed=[(0, .9), (1, .9)], zoom=[(0, 1.1), (1, 1.25)], focus=(.5, .55)),
        dict(clip=3, src=12.5, speed=[(0, 1), (1, 1)], zoom=[(0, 1.1), (1, 1.25)], focus=(.6, .5), sat=.85, wb=(.96, 1.0, 1.05)),
        dict(clip=6, src=23.6, speed=[(0, .8), (1, .8)], zoom=[(0, 1.1), (1, 1.25)], focus=(.5, .55))]),
    S(36, 1, 5, 1.0, 1.0, (1.0, 1.12), (.5, .45), ("whip_r", .20)),
    S(37, 1, 5, 9.5, .9, (1.0, 1.12), (.5, .55), ("zoomin", .20)),
    S(38, 2, 2, 15.5, [(0, 1.3), (.6, .7), (1, .5)], (1.0, 1.12), (.5, .5), ("blinds", .36)),
    S(40, 1, 4, 20.2, .8, (1.05, 1.17), (.55, .4), ("flash", .16)),
    S(41, 1, 6, 18.3, 1.0, (1.0, 1.12), (.5, .55), ("whip_l", .20)),
    S(42, 2, 2, 18.7, .7, (1.05, 1.17), (.62, .45), ("iris", .40)),
    S(44, 1, 3, 16.6, 1.0, (1.0, 1.14), (.5, .5), ("glitch", .18), sat=.85, wb=(.96, 1.0, 1.05)),
    S(45, 1, 8, 8.0, 1.0, (1.4, 1.5), (.5, .35), ("whip_u", .20)),
    S(46, 2, 6, 25.6, .8, (1.0, 1.12), (.5, .5), ("zoomin", .26)),
    S(48, 1, 2, 28.0, .8, (1.0, 1.12), (.55, .45), ("spin+", .22)),
    S(49, 1, 6, 33.0, 1.0, (1.0, 1.1), (.5, .5), ("whip_r", .20)),
    S(50, 2, 4, 23.95, .85, (1.0, 1.1), (.5, .5), ("diag", .40)),
    S(52, 4, 2, 23.0, .8, (1.0, 1.14), (.5, .55), ("lightleak", .50)),
    # ---- romantic ending
    S(56, 2, 6, 30.3, .6, (1.0, 1.12), (.5, .5), ("flash", .30)),
    S(58, 2, 2, 20.6, .6, (1.05, 1.17), (.62, .45), ("lightleak", .50)),
    S(60, 4, 2, 32.5, .55, (1.0, 1.16), (.55, .42), ("softzoom", .50)),
    dict(kind="endcard", b=ENDCARD_BEAT, n=6, trans=("glowdip", .46)),
]
for i, s in enumerate(SHOTS):
    s["t0"] = tb(s["b"]); s["t1"] = tb(SHOTS[i + 1]["b"]) if i + 1 < len(SHOTS) else DUR

TRANS = [(s["t0"], s["trans"][0], s["trans"][1]) for s in SHOTS if s["trans"]]

# kinetic words: (text, font key, size, centre y, appear beat, vanish beat)
WORDS = [
    ("Where", "reg", 150, 860, 4, 9), ("Beautiful", "ital", 262, 1035, 4.5, 9),
    ("Stories", "ital", 262, 1250, 5, 9), ("Begin.", "ital", 262, 1480, 5.5, 9),
    ("Meet.", "ital", 340, 1240, 20, 22), ("Celebrate.", "ital", 240, 1000, 32, 36),
    ("Forever.", "ital", 300, 1300, 52, 56),
]
LEAKS = [(16, 1.0), (24, .8), (32, .8), (48, .8)]       # (beat, seconds) light-leak sweeps
HEADER = (8, ENDCARD_BEAT - .2)                                       # brand header visible from..to (beats)
