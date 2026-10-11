"""Write output/IndiaBiomass_BrandFilm_60s.srt from the film's subtitle cues."""
import json, os
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
cues = json.load(open(f'{R}/film/src/data/vo.json'))['cues']
ts = lambda fr: '%02d:%02d:%02d,%03d' % (0, int(fr / 30) // 60, int(fr / 30) % 60, round((fr / 30 % 1) * 1000))
out = [f'{i}\n{ts(c["s"])} --> {ts(c["e"])}\n{c["t"]}\n' for i, c in enumerate(cues, 1)]
os.makedirs(f'{R}/output', exist_ok=True)
open(f'{R}/output/IndiaBiomass_BrandFilm_60s.srt', 'w').write('\n'.join(out))
print(len(out), 'cues')
