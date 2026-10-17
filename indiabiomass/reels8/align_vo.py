"""VO -> timed words, lines and subtitle cues for each of the 8 reels.
Script text is the display truth; Whisper only supplies timings. Optional pauses are cut into the VO
(e.g. guessing time in video 7) before timing, so everything downstream follows the edited audio.
Writes reels8/audio/vo/v<n>.wav (48 kHz, edited) and film/src/data/r8/v<n>.json.
usage: python3 align_vo.py [n ...]
"""
import json, os, re, sys, subprocess, difflib
import numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'film', 'src', 'data', 'r8')
FPS, OFFSET, TAIL, SR = 30, 0.3, 3.2, 48000
# seconds of silence inserted before a given script line (0-based)
PAUSES = {6: {5: 0.7}, 7: {2: 1.6, 4: 1.6, 6: 1.6, 8: 1.6}}
DISPLAY = {'G-C-V.': 'GCV.', 'G-C-V': 'GCV', 'M-S-Es': 'MSEs'}
WEAK = {'in', 'of', 'the', 'a', 'an', 'to', 'with', 'for', 'and', 'your', 'their', 'is', 'can', 'only', 'every', 'you', 'at', 'by', 'from', 'into', 'that', 'it', 'they', 'how', 'what', 'its'}

_model = None
def whisper(a16):
    global _model
    if _model is None:
        from faster_whisper import WhisperModel
        _model = WhisperModel('small.en', compute_type='int8')
    segs, _ = _model.transcribe(a16, word_timestamps=True, language='en')
    return [dict(w=w.word.strip(), start=w.start, end=w.end) for s in segs for w in s.words]

norm = lambda t: re.sub(r'[^a-z0-9]', '', t.lower().replace('bio-mass', 'biomass'))

def align(script_words, heard):
    """Give each script word (start, end) from the matching heard word; interpolate the rest."""
    A = [norm(w) for w in script_words]; B = [norm(h['w']) for h in heard]
    times = [None] * len(A)
    for tag, i1, i2, j1, j2 in difflib.SequenceMatcher(None, A, B, autojunk=False).get_opcodes():
        if tag == 'equal':
            for k in range(i2 - i1): times[i1 + k] = (heard[j1 + k]['start'], heard[j1 + k]['end'])
        elif tag == 'replace' and j2 > j1:   # spread the heard span over the script span
            t0, t1 = heard[j1]['start'], heard[j2 - 1]['end']; n = i2 - i1
            for k in range(n): times[i1 + k] = (t0 + (t1 - t0) * k / n, t0 + (t1 - t0) * (k + 1) / n)
    for i in range(len(times)):              # leftovers: squeeze between neighbours
        if times[i] is None:
            prev = next((times[j][1] for j in range(i - 1, -1, -1) if times[j]), 0.0)
            nxt = next((times[j][0] for j in range(i + 1, len(times)) if times[j]), prev + 0.3)
            times[i] = (prev, max(prev + 0.05, min(nxt, prev + 0.3)))
    return times

def build(n):
    lines = [l.strip() for l in open(f'{HERE}/scripts/v{n}.txt') if l.strip()]
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f'{HERE}/audio/vo/v{n}.mp3', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    a = np.frombuffer(raw, np.float32).copy()
    to16 = lambda x: x[::3].copy()
    heard = whisper(to16(a))
    sw = [(li, w) for li, l in enumerate(lines) for w in l.split()]
    times = align([w for _, w in sw], heard)
    # cut pauses into the audio at the first word of chosen lines (cut in the silence just before it)
    pauses = PAUSES.get(n, {})
    if pauses:
        pieces, last, shift, shifts = [], 0, 0.0, []
        for li in sorted(pauses):
            k = next(i for i, (l, _) in enumerate(sw) if l == li)
            cut_t = (times[k - 1][1] + times[k][0]) / 2 if k else times[k][0]
            c = int(cut_t * SR); pieces += [a[last:c], np.zeros(int(pauses[li] * SR), np.float32)]; last = c
            shifts.append((cut_t, pauses[li]))
        pieces.append(a[last:]); a = np.concatenate(pieces)
        def sh(t): return t + sum(d for ct, d in shifts if t >= ct)
        times = [(sh(s), sh(e)) for s, e in times]
    sf.write(f'{HERE}/audio/vo/v{n}.wav', a, SR, subtype='PCM_24')
    F = lambda t: round((t + OFFSET) * FPS)
    words = [dict(w=DISPLAY.get(w, w), li=li, s=F(s), e=F(e)) for (li, w), (s, e) in zip(sw, times)]
    L = [dict(i=li, t=l, s=min(w['s'] for w in words if w['li'] == li), e=max(w['e'] for w in words if w['li'] == li)) for li, l in enumerate(lines)]
    # cues: clauses (punctuation) split to <= 6 words, never ending on a weak word
    clauses, cur = [], []
    for w in words:
        cur.append(w)
        if re.search(r'[.,?:]$', w['w']) or (cur and w is words[-1]): clauses.append(cur); cur = []
    chunks = []
    for c in clauses:
        while len(c) > 6:
            target = len(c) / -(-len(c) // 6)
            cut = min(range(2, len(c) - 1), key=lambda k: (c[k - 1]['w'].lower().strip('.,?') in WEAK, abs(k - target)))
            chunks.append(c[:cut]); c = c[cut:]
        chunks.append(c)
    cues = [{'s': c[0]['s'] - 2, 'e': c[-1]['e'] + 8, 't': ' '.join(x['w'] for x in c), 'w': [x['s'] for x in c], 'hl': []} for c in chunks]
    for x, y in zip(cues, cues[1:]): x['e'] = min(x['e'], y['s'])
    total = round((OFFSET + len(a) / SR + TAIL) * FPS)
    json.dump({'reel': f'r8v{n}', 'offset': OFFSET, 'frames': total, 'words': words, 'lines': L, 'cues': cues}, open(f'{OUT}/v{n}.json', 'w'), indent=1)
    miss = sum(1 for (_, w), h in zip(sw, times) if h is None)
    print(f'v{n}: {total / FPS:.1f}s, {len(words)} words, {len(cues)} cues; heard {len(heard)} words')
    for l in L: print(f'   L{l["i"]:<2} {l["s"] / FPS:5.1f}-{l["e"] / FPS:5.1f}  {l["t"][:70]}')

if __name__ == '__main__':
    for n in (map(int, sys.argv[1:]) if len(sys.argv) > 1 else range(1, 9)): build(n)
