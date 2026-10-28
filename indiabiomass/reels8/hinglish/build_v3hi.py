"""Hinglish voiceover for Video 3 with English subtitles.
Splices the re-taken sentence (line 4) into the full take, then times the ENGLISH script (reels8/scripts/v3.txt)
to the Hinglish audio line by line (words spread through each line by length). Writes reels8/audio/vo/v3hi.wav and
film/src/data/r8/v3hi.json (reel r8v3hi)."""
import json, os, re, subprocess
import numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__)); R8 = os.path.dirname(HERE)
SR, FPS, OFFSET, TAIL = 48000, 30, 0.3, 3.2
def load(p): return np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout, np.float32).copy()
a, b = load(f'{HERE}/v3_hi.mp3'), load(f'{HERE}/v3_hi_line3.mp3')
C1, C2 = 26.2694, 36.5568                     # quiet points around the garbled sentence in the full take
z = lambda s: np.zeros(int(s * SR), np.float32)
new = np.concatenate([a[:int(C1 * SR)], z(0.08), b[:int(8.40 * SR)], z(0.30), a[int(C2 * SR):]])
shift = (C1 + 0.08 + 8.40 + 0.30) - C2       # how much everything after the splice moved
L3s = C1 + 0.08
# Hinglish line spans (seconds) from Whisper + silence detection on the full take
spans = [(0.05, 6.54), (7.10, 19.14), (19.38, 26.10), (L3s, L3s + 8.31),
         (36.68 + shift, 41.72 + shift), (42.14 + shift, 43.90 + shift), (44.23 + shift, 51.81 + shift), (52.27 + shift, 58.94 + shift)]
sf.write(f'{R8}/audio/vo/v3hi.wav', new, SR, subtype='PCM_24')
lines = [l.strip() for l in open(f'{R8}/scripts/v3.txt') if l.strip()]
assert len(lines) == len(spans)
F = lambda t: round((t + OFFSET) * FPS)
words = []
for li, (l, (s, e)) in enumerate(zip(lines, spans)):
    ws = l.split(); wt = [len(w) + 2 for w in ws]; tot = sum(wt); c = 0
    for w, k in zip(ws, wt):
        t0 = s + (e - s) * c / tot; c += k; t1 = s + (e - s) * c / tot
        words.append(dict(w=w, li=li, s=F(t0), e=F(t1)))
L = [dict(i=li, t=l, s=min(w['s'] for w in words if w['li'] == li), e=max(w['e'] for w in words if w['li'] == li)) for li, l in enumerate(lines)]
WEAK = {'in', 'of', 'the', 'a', 'an', 'to', 'with', 'for', 'and', 'your', 'their', 'is', 'can', 'only', 'every', 'you', 'at', 'by', 'from', 'into', 'that', 'it', 'they', 'how', 'what', 'its'}
clauses, cur = [], []
for w in words:
    cur.append(w)
    if re.search(r'[.,?:]$', w['w']) or w is words[-1]: clauses.append(cur); cur = []
chunks = []
for c in clauses:
    while len(c) > 6:
        target = len(c) / -(-len(c) // 6)
        cut = min(range(2, len(c) - 1), key=lambda k: (c[k - 1]['w'].lower().strip('.,?') in WEAK, abs(k - target)))
        chunks.append(c[:cut]); c = c[cut:]
    chunks.append(c)
cues = [{'s': c[0]['s'] - 2, 'e': c[-1]['e'] + 8, 't': ' '.join(x['w'] for x in c), 'w': [x['s'] for x in c], 'hl': []} for c in chunks]
for x, y in zip(cues, cues[1:]): x['e'] = min(x['e'], y['s'])
total = round((OFFSET + len(new) / SR + TAIL) * FPS)
json.dump({'reel': 'r8v3hi', 'offset': OFFSET, 'frames': total, 'words': words, 'lines': L, 'cues': cues}, open(f'{R8}/../film/src/data/r8/v3hi.json', 'w'), indent=1)
print(f'{len(new) / SR:.2f}s audio, {len(cues)} cues')
for l in L: print(f'  L{l["i"]} {l["s"] / FPS:5.1f}-{l["e"] / FPS:5.1f} {l["t"][:60]}')
