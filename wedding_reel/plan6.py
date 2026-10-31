"""Reel 2 plan ("quiet to colour"): 18.75 s of footage on an 80 BPM beat grid + the supplied end cut. 60 fps.
Song: Din Shagna Da. The soft intro plays muted and slow; the percussion entry (DROP_BEAT) floods the picture with colour."""
FPS = 60
W, H = 1080, 1920
BPM = 80.0
BEAT = 60.0 / BPM                 # 0.75 s = exactly 45 frames
DROP_SONG_T = 10.20               # riser peak / percussion entry in the song
DROP_BEAT = 8
END_BEAT = 25
END_CLIP_S = 100 / 30
SONG_START = DROP_SONG_T - DROP_BEAT * BEAT
def tb(beat): return round(beat * BEAT * FPS) / FPS
DUR = round((tb(END_BEAT) + END_CLIP_S) * FPS) / FPS
NFRAMES = int(round(DUR * FPS))

def S(b, n, clip, src, speed=1.0, zoom=(1.0, 1.14), focus=(.5, .5), trans=None, **kw):
    sp = speed if isinstance(speed, list) else [(0, speed), (1, speed)]
    d = dict(kind="single", b=b, n=n, clip=clip, src=src, speed=sp, zoom=[(0, zoom[0]), (1, zoom[1])], focus=focus, trans=trans)
    d.update(kw); return d

# clip numbers: 1 haldi (clicksunlimitedphotography), 2 dance dip (Flora_13), 3 garland and embrace (make_my_wedd),
#               4 palace portraits (Neerajeditx), 5 pastel twirl (zeenatvogue_clothing)
SHOTS = [
    # ---- quiet intro (muted, slow)
    S(0, 4, 2, 1.0, .5, (1.0, 1.15), (.5, .5)),
    S(4, 4, 4, 12.95, .55, (1.0, 1.15), (.5, .45), ("softzoom", .50)),
    # ---- the drop: colour floods in with the haldi
    S(8, 2, 1, 1.5, .8, (1.0, 1.12), (.5, .5), ("zoomflash", .34)),
    S(10, 2, 1, 8.2, .8, (1.05, 1.18), (.5, .4), ("whip_l", .26)),
    S(12, 2, 1, 14.2, .5, (1.0, 1.1), (.5, .5), ("zoomin", .28)),
    # ---- the promise
    S(14, 3, 3, 6.0, .8, (1.0, 1.14), (.5, .5), ("whip_r", .28)),
    S(17, 2, 3, 21.0, .7, (1.0, 1.12), (.5, .5), ("lightleak", .50)),
    # ---- the twirl and the portraits
    S(19, 2, 5, .3, .8, (1.0, 1.1), (.5, .5), ("whip_u", .28)),
    S(21, 2, 4, 25.2, .8, (1.0, 1.12), (.5, .55), ("zoomin", .28)),
    S(23, 2, 4, 23.95, .5, (1.05, 1.17), (.55, .42), ("softzoom", .50)),
    dict(kind="endclip", b=END_BEAT, n=0, trans=("glowdip", .50)),
]
for i, s in enumerate(SHOTS):
    s["t0"] = tb(s["b"]); s["t1"] = tb(SHOTS[i + 1]["b"]) if i + 1 < len(SHOTS) else DUR
TRANS = [(s["t0"], s["trans"][0], s["trans"][1]) for s in SHOTS if s["trans"]]
LEAKS = []

# audio edit: after the drop the instrumental plays for a few beats, then the music jumps forward by a whole number of beats
# so the sung line ("Din shagna da chadheya...", first word at 23.6 s in the song) starts as the garland shot begins and
# finishes just as the end cut starts. The jump is a multiple of the beat, so the groove stays in phase.
AUDIO_JUMP_BEATS = 12
AUDIO_JUMP = AUDIO_JUMP_BEATS * BEAT          # 9.0 s
AUDIO_SPLICE = tb(14) - 0.35                  # reel time of the splice (a short crossfade ends here)
AUDIO_XFADE = 0.10
