"""Edit plan v4: story-ordered, velocity-ramped, beat-locked cut list at 60 fps on the 137.42 BPM grid of the song.
Every shot boundary snaps to a whole video frame. The supplied end cut starts at END_BEAT."""
FPS = 60
W, H = 1080, 1920
BPM = 137.42
BEAT = 60.0 / BPM                 # 0.43662 s
DROP_SONG_T = 21.435              # first kick of the drop in the source song
DROP_BEAT = 16
END_BEAT = 62
END_CLIP_S = 100 / 30             # the supplied end cut: 100 frames at 30 fps
SONG_START = DROP_SONG_T - DROP_BEAT * BEAT
def tb(beat): return round(beat * BEAT * FPS) / FPS
DUR = round((tb(END_BEAT) + END_CLIP_S) * FPS) / FPS
NFRAMES = int(round(DUR * FPS))

# velocity presets (fraction of shot, speed): slow on the beat, whip fast before the next one
VA = [(0, .5), (.3, .8), (.62, 1.9), (1, 2.2)]
VB = [(0, .55), (.4, 1.0), (1, 1.7)]
def S(b, n, clip, src, speed=1.0, zoom=(1.0, 1.14), focus=(.5, .5), trans=None, **kw):
    sp = speed if isinstance(speed, list) else [(0, speed), (1, speed)]
    d = dict(kind="single", b=b, n=n, clip=clip, src=src, speed=sp, zoom=[(0, zoom[0]), (1, zoom[1])], focus=focus, trans=trans)
    d.update(kw); return d

SHOTS = [
    # ---- intro: strip cascade -> hero shot with the title
    dict(kind="tiles3h", b=0, n=4, trans=None, tiles=[
        dict(clip=2, src=3.95, speed=[(0, .8), (1, .8)], zoom=[(0, 1.15), (1, 1.3)], focus=(.5, .3)),
        dict(clip=4, src=0.30, speed=[(0, .8), (1, .8)], zoom=[(0, 1.1), (1, 1.25)], focus=(.55, .3)),
        dict(clip=6, src=5.05, speed=[(0, .6), (1, .6)], zoom=[(0, 1.05), (1, 1.2)], focus=(.55, .5))]),
    S(4, 5, 2, 5.4, .6, (1.0, 1.2), (.5, .4), ("zoomin", .34)),
    S(9, 1, 4, .2, .8, (1.05, 1.17), (.55, .4), ("whip_l", .26)),
    S(10, 2, 4, 3.6, .9, (1.1, 1.28), (.42, .55), ("spin+", .30)),
    S(12, 2, 6, 5.3, .65, (1.0, 1.14), (.5, .55), ("zoomin", .30)),
    S(14, 1, 6, 8.4, VA, (1.08, 1.2), (.5, .35), ("whip_r", .22)),
    S(15, 1, 2, 13.3, .9, (1.0, 1.12), (.5, .45), ("flash", .20)),
    # ---- DROP / block A: she arrives
    S(16, 2, 2, 10.9, VB, (1.0, 1.22), (.5, .65), ("zoomflash", .34)),
    S(18, 2, 6, 18.2, VB, (1.0, 1.15), (.5, .55), ("whip_l", .24)),
    S(20, 2, 6, 20.2, .7, (1.0, 1.16), (.5, .6), ("zoomin", .28)),
    S(22, 1, 6, 13.7, VA, (1.0, 1.12), (.5, .5), ("whip_r", .22)),
    S(23, 1, 6, 5.3, .65, (1.0, 1.1), (.5, .55), ("flash", .18)),
    S(24, 2, 2, 1.2, VB, (1.0, 1.15), (.5, .5), ("heart", .46)),
    # ---- block B: the rituals
    S(26, 1, 6, 8.4, VA, (1.08, 1.2), (.5, .35), ("whip_u", .22)),
    S(27, 2, 6, 12.25, [(0, .5), (.5, .8), (1, 1.1)], (1.0, 1.15), (.5, .4), ("iris", .40)),
    S(29, 3, 4, 17.0, .7, (1.12, 1.27), (.5, .5), ("whip_d", .26)),
    S(32, 2, 6, 21.8, 1.0, (1.0, 1.12), (.5, .5), ("diag", .40)),
    S(34, 2, 6, 23.5, .9, (1.0, 1.12), (.5, .55), ("zoomin", .28)),
    S(36, 2, 2, 18.7, .7, (1.05, 1.17), (.62, .45), ("lightleak", .50)),
    S(38, 2, 7, 9.0, VB, (1.0, 1.12), (.55, .6), ("whip_r", .24)),
    # ---- block C: the celebration
    S(40, 1, 5, 1.0, VA, (1.0, 1.12), (.5, .45), ("flash", .18)),
    S(41, 1, 5, 4.6, VA, (1.0, 1.1), (.5, .5), ("whip_l", .22)),
    S(42, 2, 5, 9.5, [(0, .6), (.5, .8), (1, 1.2)], (1.0, 1.12), (.5, .55), ("zoomin", .26)),
    S(44, 1, 5, 17.2, VA, (1.0, 1.1), (.55, .55), ("spin-", .22)),
    S(45, 1, 5, 22.0, VA, (1.0, 1.1), (.55, .55), ("whip_u", .22)),
    S(46, 2, 5, 24.0, [(0, .5), (.5, .7), (1, 1.3)], (1.0, 1.12), (.6, .55), ("iris", .40)),
    dict(kind="split3v", b=48, n=4, trans=("diag", .40), panels=[
        dict(clip=5, src=17.0, speed=[(0, .8), (1, .8)], zoom=[(0, 1.1), (1, 1.25)], focus=(.5, .55)),
        dict(clip=5, src=1.2, speed=[(0, .9), (1, .9)], zoom=[(0, 1.1), (1, 1.25)], focus=(.45, .5)),
        dict(clip=8, src=3.2, speed=[(0, .8), (1, .8)], zoom=[(0, 1.55), (1, 1.7)], focus=(.62, .5), sat=.9)]),
    # ---- block D: the romance
    S(52, 2, 2, 15.7, [(0, 1.3), (.6, .7), (1, .5)], (1.0, 1.12), (.5, .5), ("lightleak", .50)),
    S(54, 2, 4, 24.1, .85, (1.0, 1.1), (.5, .5), ("softzoom", .40)),
    S(56, 2, 2, 23.0, .7, (1.0, 1.14), (.5, .55), ("flash", .30)),
    S(58, 4, 2, 31.9, .55, (1.0, 1.16), (.55, .42), ("softzoom", .50)),
    dict(kind="endclip", b=END_BEAT, n=0, trans=("glowdip", .50)),
]
for i, s in enumerate(SHOTS):
    s["t0"] = tb(s["b"]); s["t1"] = tb(SHOTS[i + 1]["b"]) if i + 1 < len(SHOTS) else DUR
TRANS = [(s["t0"], s["trans"][0], s["trans"][1]) for s in SHOTS if s["trans"]]
LEAKS = [(16, 1.0), (26, .8), (40, .8), (52, .8)]       # (beat, seconds) light-leak sweeps
