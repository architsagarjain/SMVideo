"""Hinglish voiceover for one of Videos 9-16, with ENGLISH subtitles.
usage: python3 build_hi.py <n> '<spans json>'   spans = [[start, end], ...] in seconds, one per script line
Times the English script (reels9/scripts/v<n>.txt) to the Hinglish audio (reels9/hinglish/v<n>_hi.mp3) line by
line, words spread through each line by length. Writes reels9/audio/vo/v<n>hi.wav and film/src/data/r9/v<n>hi.json."""
import json, os, re, subprocess, sys
import numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__)); R9 = os.path.dirname(HERE)
SR, FPS, OFFSET, TAIL = 48000, 30, 0.3, 3.2
DISPLAY = {'C-B-G.': 'CBG.', 'C-B-G': 'CBG'}
n = int(sys.argv[1]); spans = json.loads(sys.argv[2])
audio = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', f'{HERE}/v{n}_hi.mp3', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout, np.float32).copy()
sf.write(f'{R9}/audio/vo/v{n}hi.wav', audio, SR, subtype='PCM_24')
lines = [l.strip() for l in open(f'{R9}/scripts/v{n}.txt') if l.strip()]
assert len(lines) == len(spans), (len(lines), len(spans))
F = lambda t: round((t + OFFSET) * FPS)
words = []
for li, (l, (s, e)) in enumerate(zip(lines, spans)):
    ws = l.split(); wt = [len(w) + 2 for w in ws]; tot = sum(wt); c = 0
    for w, k in zip(ws, wt):
        t0 = s + (e - s) * c / tot; c += k; t1 = s + (e - s) * c / tot
        words.append(dict(w=DISPLAY.get(w, w), li=li, s=F(t0), e=F(t1)))
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
total = round((OFFSET + len(audio) / SR + TAIL) * FPS)
json.dump({'reel': f'r9v{n}hi', 'offset': OFFSET, 'frames': total, 'words': words, 'lines': L, 'cues': cues}, open(f'{R9}/../film/src/data/r9/v{n}hi.json', 'w'), indent=1)
print(f'v{n}hi: {len(audio) / SR:.2f}s audio, {len(cues)} cues')
for l in L: print(f'  L{l["i"]} {l["s"] / FPS:5.1f}-{l["e"] / FPS:5.1f} {l["t"][:60]}')
