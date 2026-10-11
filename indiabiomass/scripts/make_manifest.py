"""Write ASSET_MANIFEST.md: every third-party asset in the film and its licence."""
import json, os, re, sys

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(R, 'film', 'scripts'))
from prep_footage import ROLES  # noqa

foot = {e['file'].split('/')[-1]: e for e in json.load(open(f'{R}/footage/footage_manifest.json'))}
sfx = {e['file']: e for e in json.load(open(f'{R}/audio/sfx/sfx_manifest.json'))}
mix_src = open(f'{R}/audio/scripts/mix.py').read()
sfx_used = sorted({n for n in re.findall(r"'([a-z0-9_]+\.wav)'", mix_src) if n in sfx})

L = ['# Asset manifest: IndiaBiomass brand film', '',
     'Every third-party asset in `output/IndiaBiomass_BrandFilm_60s.mp4`, with its source and licence.', '']

L += ['## Footage', '', '| Used as | File | Source clip | Licence | Attribution |', '|---|---|---|---|---|']
by_src = {}
for role, (src, start, dur, *_rest) in ROLES.items():
    by_src.setdefault(src, []).append(f'{role} ({start:g}-{start + dur:g} s)')
for src, roles in by_src.items():
    e = foot[src]
    L.append(f"| {', '.join(roles)} | `{src}` | [{e.get('author', '')}]({e['source_page_url']}) | "
             f"[{e['license_name']}]({e['license_url']}) | {'required' if e['attribution_required'] else 'not required'} |")

L += ['', '## Sound effects (Mixkit)', '', '| File | Mixkit title | Licence |', '|---|---|---|']
for n in sfx_used:
    e = sfx[n]
    L.append(f"| `{n}` | [{e.get('mixkit_title', e['description'])}]({e['source_page_url']}) | [{e['license_name']}]({e['license_url']}) |")
L += ['', 'Many more sounds are synthesised in `audio/scripts/mix.py`: whooshes, zaps, data crackle, the',
      'rustle-to-data transition, pops, ticks, glitches, rumble and shimmer. These are original.']

L += ['', '## Music', '',
      'Original score composed and synthesised for this film in code (`audio/scripts/score.py`,',
      '`audio/scripts/synth.py`), with no samples or loops. It is owned outright and needs no licence.']

L += ['', '## Narration', '',
      '- Voice: Microsoft **en-IN-PrabhatNeural** (Indian English, male), generated with the open-source',
      '  `edge-tts` client (rate -10%, pitch -2 Hz). Word timings come from the service\'s word-boundary events.',
      '- **Licensing caveat:** `edge-tts` uses Microsoft Edge\'s online Read Aloud service. Microsoft publishes',
      '  no terms granting commercial rights to that output. Before a paid public campaign, re-render the',
      '  script with the same voice through **Azure AI Speech** (licensed for commercial use) or record a',
      '  human narrator, then run `audio/scripts/build_vo.py` to re-place it. The timing table there',
      '  handles new takes.',
      '- Other candidate voices (Neerja, NeerjaExpressive, and Indic Parler-TTS Thoma/Rohit, Apache-2.0)',
      '  were generated for comparison and are not in the film.']

L += ['', '## Brand and interface', '',
      '- IndiaBiomass logo: the official SVGs from the live site (`brand/svg/*`), used unaltered. The reveal',
      '  animates masks only, and the final frames show the supplied artwork.',
      '- Interface: element captures of the live preview site (indiabiomassfinal.netlify.app), taken at 2x',
      '  with Playwright (`film/scripts/capture_ui.js`). The site labels its listings, prices and tenders as',
      '  **sample data**, so the film shows them under an "Interface preview · sample data" tag.',
      '  No figures were invented for the film.',
      '- Colours and type follow the IndiaBiomass Brand Guidelines v1.0 (Oct 2026).']

L += ['', '## Fonts (SIL Open Font License 1.1)', '',
      '- Plus Jakarta Sans: display', '- Geist: text and subtitles', '- Archivo: labels',
      '', 'Licence texts are in `film/public/fonts/OFL-*.txt`.']

L += ['', '## Map data', '',
      '- India outline: DataMeet `india-composite.geojson` (github.com/datameet/maps), which shows India\'s',
      '  boundaries as depicted by the Survey of India, including all of Jammu & Kashmir and Ladakh. Licence:',
      '  CC BY 4.0. Attribution: *[India boundaries](https://github.com/datameet/maps/blob/master/Country/india-composite.geojson)',
      '  by [DataMeet India community](http://datameet.org/) ([CC BY 4.0](https://creativecommons.org/licenses/by/4.0/))*.',
      '- Node positions are real city coordinates. The network is illustrative, not data.']

open(f'{R}/ASSET_MANIFEST.md', 'w').write('\n'.join(L) + '\n')
print('wrote ASSET_MANIFEST.md', len(by_src), 'footage sources,', len(sfx_used), 'sfx')
