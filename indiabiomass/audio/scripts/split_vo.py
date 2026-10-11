"""Split a single-take narration (one file, script read top to bottom) into the
per-line takes build_vo.py expects: vo_candidates/<voice>_LNN.wav + <voice>_words.json.

Word timings come from faster-whisper (vo_source/<voice>_whisper_words.json); each
phrase edge is then snapped to the real audio onset/offset using a short-window energy
gate, so no syllable is clipped and no breath is left hanging.
usage: python3 split_vo.py ruhaan vo_source/ruhaan_full.wav vo_source/ruhaan_whisper_words.json
"""
import json, os, re, sys
import numpy as np
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
voice, src, wjson = sys.argv[1], sys.argv[2], sys.argv[3]
SCRIPT = {
    'L01': "India has biomass. Plenty of it.",
    'L02': "But buyers and suppliers don't always find each other.",
    'L03': "Prices are unclear. Opportunities are scattered.",
    'L04': "What if the entire ecosystem could connect?",
    'L05': "Introducing IndiaBiomass.",
    'L06': "Connecting verified buyers and sellers of biomass fuels, raw materials and machinery.",
    'L07': "Discover tenders.",
    'L08': "Follow regional prices.",
    'L09': "Track supply and policies, all in one place.",
    'L10': "Our mission: simpler, more transparent biomass trade.",
    'L11': "Our vision: a connected biomass economy.",
    'L12': "IndiaBiomass. Connecting India's biomass economy.",
}
norm = lambda w: re.sub(r"[^a-z']", '', w.lower())

x, sr = sf.read(src)
if x.ndim > 1:
    x = x.mean(axis=1)
hop = int(0.005 * sr)
rms = np.sqrt(np.convolve(x ** 2, np.ones(int(0.01 * sr)) / int(0.01 * sr), mode='same'))[::hop]
db = 20 * np.log10(rms + 1e-9)
GATE = db.max() - 42  # relative gate: about 42 dB under the loudest speech
t_of = lambda i: i * hop / sr
i_of = lambda t: int(max(0, min(len(db) - 1, t * sr / hop)))

def onset(t_guess, lo):
    """snap back to the true onset only if real silence precedes it within 0.25 s"""
    i0, j = i_of(max(lo, t_guess - 0.25)), i_of(t_guess + 0.12)
    quiet = np.where(db[i0:j] <= GATE)[0]
    if not len(quiet):
        return t_guess
    k = i0 + quiet[-1] if db[min(j, len(db) - 1)] > GATE else i0 + quiet[0]
    # first loud frame after the last quiet frame that precedes the guessed onset
    q = np.where(db[i0:i_of(t_guess + 0.05)] <= GATE)[0]
    return t_of(i0 + q[-1] + 1) if len(q) else t_guess

def offset(t_guess, hi):
    """extend to the true end of the sound, stopping at the first silence (max 0.3 s)"""
    i, j = i_of(t_guess - 0.05), i_of(min(hi, t_guess + 0.3))
    quiet = np.where(db[i:j] <= GATE)[0]
    return t_of(i + quiet[0]) + 0.02 if len(quiet) else min(hi, t_guess + 0.05)

W = json.load(open(wjson))
k = 0
lines = {}
for L, text in SCRIPT.items():
    toks = [norm(t) for t in text.replace('IndiaBiomass', 'IndiaBiomass').split()]
    ws = W[k:k + len(toks)]
    got = [norm(w['w']) for w in ws]
    assert got == toks, (L, got, toks)
    lines[L] = ws
    k += len(toks)
assert k == len(W), f'{len(W) - k} extra words in transcription'

names = list(SCRIPT)
total = len(x) / sr
out = {}
os.makedirs(os.path.join(ROOT, 'vo_candidates'), exist_ok=True)
for n, L in enumerate(names):
    ws = lines[L]
    prev_end = lines[names[n - 1]][-1]['end'] if n else 0.0
    next_start = lines[names[n + 1]][0]['start'] if n + 1 < len(names) else total
    # refine every word edge (needed for phrase cuts inside a line)
    refined = []
    for i, w in enumerate(ws):
        if i == 0 and n > 0:
            # line start: the last quiet frame between the previous line and this word's end
            # line start = end of the last real pause (>= 120 ms below the gate) before the word
            i0, j = i_of(prev_end), i_of(w['end'] - 0.05)
            quiet = db[i0:j] <= GATE
            st, run, MIN = w['start'], 0, int(0.12 * sr / hop)
            for k_, qv in enumerate(quiet):
                run = run + 1 if qv else 0
                if run >= MIN and (k_ + 1 == len(quiet) or not quiet[k_ + 1]):
                    st = t_of(i0 + k_ + 1)
            refined.append({'w': w['w'].strip(' .,?:;'), 'start': st, 'end': w['end']})
            continue
        lo = ws[i - 1]['end'] - 0.05 if i else max(prev_end, w['start'] - 0.35)
        hi = ws[i + 1]['start'] + 0.05 if i + 1 < len(ws) else w['end'] + 0.4  # stops at the first silence
        refined.append({'w': w['w'].strip(' .,?:;'), 'start': onset(w['start'], lo), 'end': offset(w['end'], hi)})
    a = max(0.0, refined[0]['start'] - 0.03)
    b = min(total, refined[-1]['end'] + 0.03)
    seg = x[int(a * sr):int(b * sr)].copy()
    f = int(0.008 * sr)
    seg[:f] *= np.linspace(0, 1, f)
    seg[-f:] *= np.linspace(1, 0, f)
    if sr != 48000:
        from scipy.signal import resample_poly
        seg = resample_poly(seg, 48000, sr)
    sf.write(os.path.join(ROOT, 'vo_candidates', f'{voice}_{L}.wav'), seg, 48000, subtype='PCM_24')
    rel = [{'w': w['w'].replace('IndiaBiomass', 'IndiaBiomass'), 'start': round(w['start'] - a, 3), 'end': round(w['end'] - a, 3)} for w in refined]
    out[L] = {'duration': round(b - a, 3), 'words': rel, 'timing_source': 'faster-whisper small.en + energy-gated edges'}
    print(f"{L} {b - a:5.2f}s  " + ' '.join(f"{w['w']}@{w['start']:.2f}" for w in rel))
json.dump(out, open(os.path.join(ROOT, 'vo_candidates', f'{voice}_words.json'), 'w'), indent=1)
