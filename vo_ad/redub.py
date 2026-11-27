"""Slows the ad to a normal pace and re-voices the lines with the mispronounced words, from ElevenLabs takes.
Each take is DTW-aligned to the original line and warped chunk by chunk onto its timing, so mouths stay roughly in sync.
Pace is a piecewise speed map over the source timeline (SEGS); shots carrying a long re-voiced line get a little more time.
Usage: python3 redub.py ORIG.wav TAKES_DIR OUT.wav"""
import sys, numpy as np, librosa, soundfile as sf
ORIG, TAKES, OUT = sys.argv[1:4]
from timemap import SEGS, new_t
sr = 44100
y, _ = librosa.load(ORIG, sr=sr, mono=False)
# pace: pitch-preserving slow-down of the whole dialogue track
parts = []
for a, b, sp in SEGS:
    seg = y[:, int(a * sr):int(b * sr)]; want = int(round((b - a) / sp * sr))
    st = np.stack([librosa.effects.time_stretch(c, rate=sp) for c in seg]); parts.append(librosa.util.fix_length(st, size=want, axis=1))
ys = np.concatenate(parts, 1); mono = ys.mean(0)
# (take, original speech span in source seconds, speaker f0 range)
LINES = [("g1.wav", (1.38, 3.72), "Arre Neha, biodata aaya hai tumhare liye ek"), ("g3.wav", (9.74, 11.12), "Kundli bhi milwa lena, bas"),
         ("g6.wav", (14.22, 16.40), "Meri shaadi hai ya family ka group project?"), ("g4.wav", (24.26, 26.28), "Achha, kundli matching bhi hai?"),
         ("g5.wav", (26.66, 30.02), "Haan dadi, ab profile se lekar kundli matching tak, sab ek hi jagah")]
def trim(x, th=.02):
    i = np.where(np.abs(x) > th)[0]; return x[max(0, i[0] - 400):i[-1] + 800]
def warp(take, target):
    """Warp `take` onto the timing of `target` (same words, other voice) by DTW on MFCCs + per-chunk time-stretch."""
    hop = 441
    A = librosa.feature.mfcc(y=take, sr=sr, n_mfcc=20, hop_length=hop)[1:]; B = librosa.feature.mfcc(y=target, sr=sr, n_mfcc=20, hop_length=hop)[1:]
    A = (A - A.mean(1, keepdims=True)) / (A.std(1, keepdims=True) + 1e-6); B = (B - B.mean(1, keepdims=True)) / (B.std(1, keepdims=True) + 1e-6)
    _, wp = librosa.sequence.dtw(A, B, metric="cosine", step_sizes_sigma=np.array([[1, 1], [1, 2], [2, 1]]), weights_add=np.array([0, 0, 0]))
    wp = wp[::-1]; ta = wp[:, 0] * hop / sr; tb = wp[:, 1] * hop / sr
    anchors = np.arange(0, len(take) / sr, .18)
    tgt = np.interp(anchors, ta, tb); tgt = np.maximum.accumulate(tgt)
    anchors = np.append(anchors, len(take) / sr); tgt = np.append(tgt, len(target) / sr)
    out = []
    for k in range(len(anchors) - 1):
        a, b = int(anchors[k] * sr), int(anchors[k + 1] * sr); want = max(1, int((tgt[k + 1] - tgt[k]) * sr)); seg = take[a:b]
        if len(seg) < 64: continue
        rate = np.clip(len(seg) / want, .6, 1.7); s2 = librosa.effects.time_stretch(seg, rate=rate) if abs(rate - 1) > .02 else seg
        out.append(s2)
    xf = int(.008 * sr); res = out[0]
    for s2 in out[1:]:
        if len(res) > xf and len(s2) > xf:
            f = np.linspace(0, 1, xf); s2 = s2.copy(); s2[:xf] = res[-xf:] * (1 - f) + s2[:xf] * f; res = np.concatenate([res[:-xf], s2])
        else: res = np.concatenate([res, s2])
    return librosa.util.fix_length(res, size=len(target))
for tk, (a, b), txt in LINES:
    A, B = int(new_t(a) * sr), int(new_t(b) * sr); target = mono[A:B]
    take, _ = librosa.load(f"{TAKES}/{tk}", sr=sr); take = trim(take)
    w = warp(take, target); w *= np.sqrt((target ** 2).mean()) / (np.sqrt((w ** 2).mean()) + 1e-9)
    f = int(.02 * sr); env = np.ones(B - A); env[:f] = np.linspace(0, 1, f); env[-f:] = np.linspace(1, 0, f)
    for ch in range(ys.shape[0]): ys[ch, A:B] = ys[ch, A:B] * (1 - env) + w * env
    print(f"re-voiced {a:.2f}-{b:.2f}s -> {A / sr:.2f}-{B / sr:.2f}s  '{txt}'  take {len(take) / sr:.2f}s onto {(B - A) / sr:.2f}s")
sf.write(OUT, ys.T, sr); print("wrote", OUT, ys.shape[1] / sr)
