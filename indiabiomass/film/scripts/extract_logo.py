"""Pull the path data out of the official logo-desc-rev.svg (unaltered geometry)
so the film can reveal the logo piece by piece. The final frame of every reveal
is the logo exactly as supplied."""
import re, json, os
HERE = os.path.dirname(os.path.abspath(__file__))
s = open(os.path.join(HERE, '..', '..', 'brand', 'logo-desc-rev.svg')).read()
s = re.sub(r'<metadata>.*?</metadata>', '', s, flags=re.S)
paths = re.findall(r'<path[^>]*d="([^"]*)"', s)
names = ['markLight', 'markOchre', 'india', 'biomass', 'descLight', 'descOchre']
out = dict(zip(names, paths))
out['viewBox'] = [0, 0, 1765.7, 313.3]
out['wordTransform'] = 'translate(346.5 22)'            # wordmark group, desc lockup
out['wordTransformNoDesc'] = 'translate(346.5 116.4)'   # wordmark group, plain lockup
out['descTransform'] = 'translate(346.5 262.2) scale(0.2482334009655076)'
open(os.path.join(HERE, '..', 'src', 'data', 'logo.json'), 'w').write(json.dumps(out))
print({k: len(v) if isinstance(v, str) else v for k, v in out.items()})
