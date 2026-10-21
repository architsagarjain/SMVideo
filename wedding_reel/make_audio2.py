"""Cuts the chosen song to the reel window, adds whoosh/impact/riser SFX on the transitions, a pre-drop dip and a
reverb-tail ending. Usage: python3 make_audio2.py SONG.wav OUT.wav"""
import sys, wave
import numpy as np
from scipy import signal
from plan2 import *
import sfx
from sfx import SR, place, stereo

w = wave.open(sys.argv[1]); song = np.frombuffer(w.readframes(w.getnframes()), '<i2').reshape(-1, 2).astype(np.float64) / 32768
assert w.getframerate() == SR
N = int(DUR * SR)
a = int(SONG_START * SR); music = song[a:a + N].copy()
t = np.arange(N) / SR
# gentle fade-in, pre-drop dip (duck the pad for the last beat, then the drop lands at full level)
music *= np.minimum(t / .12, 1)[:, None]
dip = np.ones(N); i0, i1 = int((tb(DROP_BEAT) - BEAT * .9) * SR), int(tb(DROP_BEAT) * SR)
dip[i0:i1] = np.linspace(1, .45, i1 - i0)
music *= dip[:, None]

# ending: low-pass sweep + reverb tail from beat 65.5 so the song resolves instead of being chopped
e0 = tb(ENDCARD_BEAT + .4); ei = int(e0 * SR)
tail = music[ei:].copy()
cut = np.linspace(9000, 500, len(tail)); out = np.zeros_like(tail); blk = 2048
for i in range(0, len(tail), blk):
    sos = signal.butter(2, cut[i], 'low', fs=SR, output='sos')
    out[i:i + blk] = signal.sosfilt(sos, tail[i:i + blk], axis=0)
music[ei:] = out * np.linspace(1, .0, len(tail))[:, None] ** 1.3
ring = sfx.reverb(np.vstack([music[ei - int(.45 * SR):ei], np.zeros((len(tail) + int(.1 * SR), 2))]), 1.8, 1.0)
music[ei:] += ring[int(.45 * SR):int(.45 * SR) + len(tail)] * np.linspace(.9, 0, len(tail))[:, None] * .5

fx = np.zeros((N, 2))
place(fx, stereo(sfx.riser(BEAT * 8, 1), 0), tb(8), .10)                       # build riser into the drop
place(fx, stereo(sfx.impact(1, 2.0), 0), tb(DROP_BEAT), 1.1)                    # drop impact
place(fx, stereo(sfx.shimmer(1), 0), tb(DROP_BEAT), .45)
for tc, kind, L in TRANS:
    if kind.startswith("whip") or kind.startswith("spin"):
        place(fx, stereo(sfx.whoosh(L + .22, True), 0), tc - L / 2 - .08, .5)
    elif kind in ("zoomin", "iris", "diag", "heart", "ink", "blinds"):
        place(fx, stereo(sfx.whoosh(L + .3, True), 0), tc - L - .04, .45)
        if kind in ("heart", "ink"): place(fx, stereo(sfx.shimmer(1), 0), tc, .22)
    elif kind == "glitch":
        place(fx, stereo(sfx.glitch_sfx(1), 0), tc - .05, .55)
    elif kind in ("flash", "zoomflash", "glowdip"):
        place(fx, stereo(sfx.whoosh(.45, True), 0), tc - .42, .38)
        place(fx, stereo(sfx.shimmer(1), 0), tc - .02, .4)
    elif kind in ("lightleak", "softzoom"):
        place(fx, stereo(sfx.whoosh(L + .5, True), 0), tc - L / 2 - .3, .28)
        place(fx, stereo(sfx.shimmer(1), 0), tc, .22)
# kinetic-word pops get a soft tick; end card gets a bell chord + low boom
for _, _, _, _, ab, _ in WORDS: place(fx, stereo(sfx.impact(1, .5), 0), tb(ab), .22)
place(fx, stereo(sum(sfx.bell(sfx.mid2hz(m), 2.6, 1) for m in (74, 78, 81, 86)), .0), tb(ENDCARD_BEAT), .30)
place(fx, stereo(sfx.impact(1, 1.6), 0), tb(ENDCARD_BEAT), .45)

# keep the intro airy: SFX sit lower before the drop so the drop clearly lands
fxg = np.where(t < tb(DROP_BEAT) - .05, .30, .50)[:, None]
mix = music * np.where(t >= tb(DROP_BEAT), 1.25, 1.0)[:, None] + fx * fxg
fade = np.ones(N); f0 = int((DUR - .35) * SR); fade[f0:] = np.linspace(1, 0, N - f0)
mix *= fade[:, None]
mix = np.tanh(mix * .85); mix = mix / np.abs(mix).max() * .89
pcm = (mix * 32767).astype('<i2')
with wave.open(sys.argv[2], 'wb') as o:
    o.setnchannels(2); o.setsampwidth(2); o.setframerate(SR); o.writeframes(pcm.tobytes())
print("wrote", sys.argv[2], "dur", N / SR)
