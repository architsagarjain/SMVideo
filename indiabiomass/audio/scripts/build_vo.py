"""Assemble the narration track from per-line TTS takes and emit subtitle cues.

Each line is cut at word boundaries into phrases, and each phrase is placed at an
absolute time chosen to land on the picture (see PLACE). Writes:
  audio/narration.wav           48 kHz mono, 54.5 s
  film/src/data/vo.json         subtitle cues in frames + phrase placement
"""
import json, os, sys
import numpy as np
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOICE = sys.argv[1] if len(sys.argv) > 1 else 'prabhat'
SRC = os.path.join(ROOT, 'vo_candidates')
SR, DUR, FPS = 48000, 54.5, 30

# (line, first word idx, last word idx inclusive, start time of first word in film seconds)
PLACE = [
    ('L01', 0, 2, 0.60),    # India has biomass.
    ('L01', 3, 5, 2.62),    # Plenty of it.          (lands on the field reveal)
    ('L02', 0, 8, 6.18),    # But buyers and suppliers don't always find each other.
    ('L03', 0, 2, 10.75),   # Prices are unclear.
    ('L03', 3, 5, 12.70),   # Opportunities are scattered.
    ('L04', 0, 6, 15.72),   # What if the entire ecosystem could connect?
    ('L05', 0, 1, 19.12),   # Introducing IndiaBiomass.  ("IndiaBiomass" hits the logo at 20.0)
    ('L06', 0, 4, 23.30),   # Connecting verified buyers and sellers
    ('L06', 5, 7, 25.70),   # of biomass fuels,
    ('L06', 8, 9, 28.20),   # raw materials,
    ('L06', 10, 11, 30.70), # and machinery.
    ('L07', 0, 1, 33.30),   # Discover tenders.
    ('L08', 0, 2, 35.65),   # Follow regional prices.
    ('L09', 0, 7, 37.70),   # Track supply and policies, all in one place.
    ('L10', 0, 6, 41.70),   # Our mission: simpler, more transparent biomass trade.
    ('L11', 0, 5, 46.12),   # Our vision: a connected biomass economy.
    ('L12', 0, 0, 49.75),   # IndiaBiomass.
    ('L12', 1, 4, 51.35),   # Connecting India's biomass economy.
]

# Subtitle phrases: (line, first word, last word, display text, highlight words)
CUES = [
    ('L01', 0, 2, 'India has biomass.', ['biomass']),
    ('L01', 3, 5, 'Plenty of it.', []),
    ('L02', 0, 3, 'But buyers and suppliers', []),
    ('L02', 4, 8, "don't always find each other.", []),
    ('L03', 0, 2, 'Prices are unclear.', []),
    ('L03', 3, 5, 'Opportunities are scattered.', []),
    ('L04', 0, 4, 'What if the entire ecosystem', []),
    ('L04', 5, 6, 'could connect?', ['connect']),
    ('L05', 0, 1, 'Introducing IndiaBiomass.', ['IndiaBiomass']),
    ('L06', 0, 1, 'Connecting verified', ['verified']),
    ('L06', 2, 4, 'buyers and sellers', []),
    ('L06', 5, 7, 'of biomass fuels,', ['fuels']),
    ('L06', 8, 9, 'raw materials,', ['materials']),
    ('L06', 10, 11, 'and machinery.', ['machinery']),
    ('L07', 0, 1, 'Discover tenders.', ['tenders']),
    ('L08', 0, 2, 'Follow regional prices.', ['prices']),
    ('L09', 0, 3, 'Track supply and policies,', []),
    ('L09', 4, 7, 'all in one place.', ['one', 'place']),
    ('L10', 0, 2, 'Our mission: simpler,', ['mission']),
    ('L10', 3, 6, 'more transparent biomass trade.', []),
    ('L11', 0, 1, 'Our vision:', ['vision']),
    ('L11', 2, 5, 'a connected biomass economy.', []),
    ('L12', 0, 0, 'IndiaBiomass.', ['IndiaBiomass']),
    ('L12', 1, 4, "Connecting India's biomass economy.", []),
]

words = json.load(open(os.path.join(SRC, f'{VOICE}_words.json')))
out = np.zeros(int(SR * DUR), dtype=np.float64)
offset = {}  # (line, first) -> film time of clip t=0
placed = []
for line, a, b, at in PLACE:
    audio, sr = sf.read(os.path.join(SRC, f'{VOICE}_{line}.wav'), always_2d=False)
    if audio.ndim > 1:
        audio = audio.mean(axis=1)
    assert sr == SR, sr
    ws = words[line]['words']
    # cut halfway into the gaps around the phrase, so no syllable is clipped
    s0 = 0.0 if a == 0 else (ws[a - 1]['end'] + ws[a]['start']) / 2
    s1 = len(audio) / SR if b == len(ws) - 1 else (ws[b]['end'] + ws[b + 1]['start']) / 2
    seg = audio[int(s0 * SR):int(s1 * SR)].copy()
    fade = int(0.012 * SR)
    seg[:fade] *= np.linspace(0, 1, fade)
    seg[-fade:] *= np.linspace(1, 0, fade)
    t0 = at - (ws[a]['start'] - s0)  # film time where seg starts
    i0 = int(round(t0 * SR))
    out[i0:i0 + len(seg)] += seg
    for k in range(a, b + 1):
        offset[(line, k)] = at - ws[a]['start']
    placed.append({'line': line, 'text': ' '.join(w['w'] for w in ws[a:b + 1]), 'start': round(at, 3),
                   'end': round(at - ws[a]['start'] + ws[b]['end'], 3)})

peak = np.abs(out).max()
sf.write(os.path.join(ROOT, 'narration.wav'), out.astype(np.float32), SR, subtype='PCM_24')

cues = []
for line, a, b, text, hl in CUES:
    ws = words[line]['words']
    s = offset[(line, a)] + ws[a]['start'] - 0.06
    e = offset[(line, b)] + ws[b]['end'] + 0.30
    # per-word frame times for the karaoke-style highlight (display words map 1:1 to spoken words)
    shown = text.split()
    spoken = ws[a:b + 1]
    wt = [int(round((offset[(line, a + i)] + spoken[min(i, len(spoken) - 1)]['start']) * FPS)) for i in range(len(shown))]
    cues.append({'s': int(round(s * FPS)), 'e': int(round(e * FPS)), 't': text, 'hl': hl, 'w': wt})
for i in range(len(cues) - 1):  # never overlap the next cue
    cues[i]['e'] = min(cues[i]['e'], cues[i + 1]['s'])
json.dump({'voice': VOICE, 'phrases': placed, 'cues': cues},
          open(os.path.join(ROOT, '..', 'film', 'src', 'data', 'vo.json'), 'w'), indent=1)
print('peak', round(float(peak), 3), 'phrases', len(placed), 'cues', len(cues))
for p in placed:
    print(f"{p['start']:6.2f}-{p['end']:6.2f}  {p['text']}")
