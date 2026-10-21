"""Cuts the chosen song to the reel window (music only, no sound effects), with a pre-drop dip and a reverb-tail ending. Usage: python3 make_audio2.py SONG.wav OUT.wav"""
import sys, wave
import numpy as np
from scipy import signal
from plan2 import *
import sfx
from sfx import SR

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

# ending: low-pass sweep + reverb tail over the last 3 beats so the song resolves instead of being chopped
e0 = tb(N_BEATS - 3); ei = int(e0 * SR)
tail = music[ei:].copy()
cut = np.linspace(9000, 500, len(tail)); out = np.zeros_like(tail); blk = 2048
for i in range(0, len(tail), blk):
    sos = signal.butter(2, cut[i], 'low', fs=SR, output='sos')
    out[i:i + blk] = signal.sosfilt(sos, tail[i:i + blk], axis=0)
music[ei:] = out * np.linspace(1, .0, len(tail))[:, None] ** 1.3
ring = sfx.reverb(np.vstack([music[ei - int(.45 * SR):ei], np.zeros((len(tail) + int(.1 * SR), 2))]), 1.8, 1.0)
music[ei:] += ring[int(.45 * SR):int(.45 * SR) + len(tail)] * np.linspace(.9, 0, len(tail))[:, None] * .5

mix = music * np.where(t >= tb(DROP_BEAT), 1.25, 1.0)[:, None]
fade = np.ones(N); f0 = int((DUR - .35) * SR); fade[f0:] = np.linspace(1, 0, N - f0)
mix *= fade[:, None]
mix = np.tanh(mix * .85); mix = mix / np.abs(mix).max() * .89
pcm = (mix * 32767).astype('<i2')
with wave.open(sys.argv[2], 'wb') as o:
    o.setnchannels(2); o.setsampwidth(2); o.setframerate(SR); o.writeframes(pcm.tobytes())
print("wrote", sys.argv[2], "dur", N / SR)
