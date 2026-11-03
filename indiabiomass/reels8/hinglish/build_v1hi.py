"""Hinglish voiceover for Video 1 (Taksh – Reels & Shorts voice) with English subtitles.
Times the ENGLISH script (reels8/scripts/v1.txt) to the Hinglish audio line by line (words spread through each
line by length). Writes reels8/audio/vo/v1hi.wav and film/src/data/r8/v1hi.json (reel r8v1hi)."""
import json, os, re, subprocess
import numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__)); R8 = os.path.dirname(HERE)
SR, FPS, OFFSET, TAIL = 48000, 30, 0.3, 3.2
def load(p): return np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout, np.float32).copy()
new = load(f'{HERE}/v1_hi.mp3')
# Hinglish line spans (seconds) from Whisper + silence detection
spans = [(0.05, 7.78), (8.34, 16.93), (18.29, 24.89), (25.83, 33.77), (35.40, 46.90), (47.46, 53.38), (53.84, 55.95), (56.44, 60.59)]
sf.write(f'{R8}/audio/vo/v1hi.wav', new, SR, subtype='PCM_24')
lines = [l.strip() for l in open(f'{R8}/scripts/v1.txt') if l.strip()]
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
json.dump({'reel': 'r8v1hi', 'offset': OFFSET, 'frames': total, 'words': words, 'lines': L, 'cues': cues}, open(f'{R8}/../film/src/data/r8/v1hi.json', 'w'), indent=1)
print(f'{len(new) / SR:.2f}s audio, {len(cues)} cues')
for l in L: print(f'  L{l["i"]} {l["s"] / FPS:5.1f}-{l["e"] / FPS:5.1f} {l["t"][:60]}')
