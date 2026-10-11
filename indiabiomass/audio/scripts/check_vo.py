"""Report narration vs bed level per phrase, in the speech band (300 Hz-4 kHz)."""
import json, numpy as np, soundfile as sf, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from synth import bp
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
vo, sr = sf.read(f'{R}/narration.wav'); fm, _ = sf.read(f'{R}/final_mix.wav')
n = min(len(vo), len(fm)); fm = fm[:n].mean(1); vo = vo[:n]
g = np.dot(fm, vo) / np.dot(vo, vo)
resid = bp(fm - g * vo, 300, 4000); vb = bp(g * vo, 300, 4000)
ms = []
for p in json.load(open(f'{R}/../film/src/data/vo.json'))['phrases']:
    a, b = int(p['start'] * sr), int(p['end'] * sr)
    v = 20 * np.log10(np.sqrt((vb[a:b] ** 2).mean())); r = 20 * np.log10(np.sqrt((resid[a:b] ** 2).mean()))
    ms.append(v - r)
    print(f"{p['start']:6.2f} margin {v - r:5.1f} dB  {p['text'][:44]}")
print('min margin', round(min(ms), 1), 'median', round(float(np.median(ms)), 1))
