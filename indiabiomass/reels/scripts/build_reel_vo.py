"""Turn a reel's voiceover + word timings into film/src/data/<reel>.json:
VO offset, total length, every word (absolute seconds/frames) and short subtitle cues.
usage: python3 build_reel_vo.py reel1 0.3 3.4      (offset s, end-card tail s)
"""
import json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
R = os.path.join(HERE, '..')
reel, offset, tail = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])
FPS = 30
W = json.load(open(f'{R}/audio/vo/{reel}_whisper.json'))
# merge whisper's split tokens ("co", "-firing" / "E", "-M", "-D." / "2", ".5")
words = []
for w in W:
    t = w['w']
    if words and (t.startswith('-') or t.startswith('.') and t[1:2].isdigit() or (words[-1]['w'] == 'M-S-E.' and t == 'Exemption.')):
        if t == 'Exemption.':
            words[-1]['w'] = 'MSE exemption.'
            words[-1]['end'] = w['end']
            continue
        words[-1]['w'] += t
        words[-1]['end'] = w['end']
    else:
        words.append(dict(w))
for w in words:
    w['s'] = round((w['start'] + offset) * FPS)
    w['e'] = round((w['end'] + offset) * FPS)
# display spelling fixes (how a word is shown, not how it was spoken)
FIX = {'India biomass': 'IndiaBiomass', 'tons': 'tonnes', 'E-M-D.': 'EMD.', 'G-C-V.': 'GCV.', 'L-1.': 'L1.',
       'L-1': 'L1', 'M-S-E.': 'MSE', 'Exemption.': 'exemption.', '5 words': 'Five words'}
WEAK = {'in', 'of', 'the', 'a', 'an', 'to', 'with', 'for', 'and', 'your', 'their', 'is', 'can', 'only', 'around', 'every', 'you'}
def fix(t):
    for a_, b_ in FIX.items():
        t = t.replace(a_, b_)
    return t
# clauses = runs ending in punctuation; long clauses split near the middle, never after a weak word
clauses, cur = [], []
for w in words:
    cur.append(w)
    if re.search(r'[.,?:]$', w['w']):
        clauses.append(cur); cur = []
if cur:
    clauses.append(cur)
chunks = []
for c in clauses:
    while len(c) > 6:
        target = len(c) / -(-len(c) // 6)  # even split into ceil(n/6) parts
        cut = min(range(2, len(c) - 1), key=lambda k: (c[k - 1]['w'].lower().strip('.,') in WEAK, abs(k - target)))
        chunks.append(c[:cut]); c = c[cut:]
    chunks.append(c)
merged = chunks
cues = [{'s': c[0]['s'] - 2, 'e': c[-1]['e'] + 8, 't': fix(' '.join(x['w'] for x in c)), 'w': [x['s'] for x in c], 'hl': []} for c in merged]
for a, b in zip(cues, cues[1:]):
    a['e'] = min(a['e'], b['s'])
vo_dur = W[-1]['end']
total = round((offset + vo_dur + tail) * FPS)
out = {'reel': reel, 'offset': offset, 'frames': total, 'words': words, 'cues': cues}
json.dump(out, open(os.path.join(R, '..', 'film', 'src', 'data', f'{reel}.json'), 'w'), indent=1)
print(reel, 'frames', total, f'({total / FPS:.2f}s)', 'cues', len(cues))
for c in cues:
    print(f"  {c['s'] / FPS:6.2f}  {c['t']}")
