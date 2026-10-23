"""Edit plan v5: calmer, cleaner cut list. Every shot is at least 4 beats (about 1.75 s) and cuts land on the beat of the
137.42 BPM song grid. 60 fps. The supplied end cut starts at END_BEAT."""
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

def S(b, n, clip, src, speed=1.0, zoom=(1.0, 1.14), focus=(.5, .5), trans=None, **kw):
    sp = speed if isinstance(speed, list) else [(0, speed), (1, speed)]
    d = dict(kind="single", b=b, n=n, clip=clip, src=src, speed=sp, zoom=[(0, zoom[0]), (1, zoom[1])], focus=focus, trans=trans)
    d.update(kw); return d

SHOTS = [
    # ---- intro: hero shot with the title, the groom waits, the bride arrives
    S(0, 8, 2, 4.0, .5, (1.0, 1.18), (.5, .4)),
    S(8, 4, 4, .3, .7, (1.05, 1.15), (.55, .4), ("softzoom", .50)),
    S(12, 4, 4, 3.7, .8, (1.08, 1.22), (.42, .55), ("whip_l", .30)),
    # ---- DROP / she arrives
    S(16, 4, 2, 10.9, [(0, .7), (1, 1.0)], (1.0, 1.2), (.5, .65), ("zoomflash", .34)),
    S(20, 4, 6, 18.1, .8, (1.0, 1.14), (.5, .55), ("whip_r", .30)),
    S(24, 4, 6, 20.15, .6, (1.0, 1.14), (.5, .6), ("zoomin", .30)),
    # ---- the rituals
    S(28, 4, 4, 17.0, .75, (1.12, 1.27), (.5, .5), ("whip_l", .30)),
    S(32, 4, 2, 18.7, .7, (1.05, 1.17), (.62, .45), ("lightleak", .60)),
    S(36, 4, 6, 21.75, .6, (1.0, 1.12), (.5, .5), ("zoomin", .30)),
    S(40, 4, 7, 8.0, .9, (1.0, 1.12), (.55, .6), ("whip_r", .30)),
    # ---- the celebration
    S(44, 4, 5, 9.2, .9, (1.0, 1.12), (.5, .55), ("flash", .30)),
    S(48, 4, 5, 21.5, .7, (1.0, 1.12), (.55, .55), ("zoomin", .30)),
    # ---- the romance
    S(52, 4, 2, 15.7, [(0, .8), (1, .55)], (1.0, 1.12), (.5, .5), ("lightleak", .60)),
    S(56, 6, 2, 32.0, .55, (1.0, 1.16), (.55, .42), ("softzoom", .60)),
    dict(kind="endclip", b=END_BEAT, n=0, trans=("glowdip", .50)),
]
for i, s in enumerate(SHOTS):
    s["t0"] = tb(s["b"]); s["t1"] = tb(SHOTS[i + 1]["b"]) if i + 1 < len(SHOTS) else DUR
TRANS = [(s["t0"], s["trans"][0], s["trans"][1]) for s in SHOTS if s["trans"]]
LEAKS = [(16, 1.0)]                                      # (beat, seconds) light-leak sweep on the drop
