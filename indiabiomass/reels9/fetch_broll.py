"""Download the picked B-roll (one file per V<n>_<need>) into reels9/footage/raw. Wikimedia photos via 2160px thumbs."""
import json, os, re, subprocess, time, urllib.parse
HERE = os.path.dirname(os.path.abspath(__file__))
RAW = f'{HERE}/footage/raw'; os.makedirs(RAW, exist_ok=True)
SP = '/tmp/claude-0/-home-user-SMVideo/dea5613d-59d0-569e-9e5f-fab7f2a5b5e9/scratchpad/broll9'
cands = json.load(open(f'{SP}/candidates_V9-12.json')) + json.load(open(f'{SP}/candidates_V13-16.json'))
pick = json.load(open(f'{HERE}/broll_pick.json'))
pick['V13_1b'] = 'b'  # second furnace shot for the hook (plan need '1b')
UA = 'IndiaBiomassReels/1.0 (https://indiabiomassfinal.netlify.app; video production)'

def get(url, out):
    for k in range(6):
        r = subprocess.run(['curl', '-sSL', '-A', UA, '-o', out, '-w', '%{http_code}', url], capture_output=True, text=True)
        if r.stdout.strip() == '200' and os.path.getsize(out) > 10000 and open(out,'rb').read(15)[:15].find(b'<!DOCTYPE') < 0: return True
        time.sleep(5 * (k + 1))
    return False

def wm_thumb(url, w=2160):
    # https://upload.wikimedia.org/wikipedia/commons/a/ab/File.jpg -> .../thumb/a/ab/File.jpg/2160px-File.jpg
    m = re.match(r'(https://upload\.wikimedia\.org/wikipedia/commons)/(\w)/(\w\w)/(.+)$', url)
    if not m: return url
    return f'{m[1]}/thumb/{m[2]}/{m[3]}/{m[4]}/{w}px-{m[4]}'

manifest = []
for key, letter in sorted(pick.items()):
    v, n = key.split('_'); n = n.rstrip('ab')
    c = next((c for c in cands if str(c['video']) in (v, v[1:]) and int(c['need_index']) == int(n) and c['candidate'] == letter), None)
    if not c: print('MISSING', key); continue
    url = c['download_url']; ext = os.path.splitext(urllib.parse.urlparse(url).path)[1].lower() or '.mp4'
    ext = '.jpg' if ext in ('.jpeg', '.jpg') else ext
    out = f'{RAW}/{key}{ext}'
    if not os.path.exists(out) or os.path.getsize(out) < 10000:
        ok = False
        if 'wikimedia.org' in url:
            name = c['source_page_url'].split('File:', 1)[1]
            w, h = c.get('width') or 3000, c.get('height') or 2000
            need = int(2100 * w / h) if w >= h else 1300          # landscape: ~2100 px tall; portrait: 1300 px wide
            under = [x for x in (960, 1280, 1920, 3840) if x < w]  # thumbnails must be smaller than the original
            width = next((x for x in under if x >= need), under[-1] if under else w)
            ok = get(f'https://commons.wikimedia.org/wiki/Special:FilePath/{name}?width={width}', out)
            time.sleep(3)
        else:
            ok = get(url, out)
        print(('OK  ' if ok else 'FAIL'), key, url[:90]); time.sleep(1.5)
    manifest.append({**c, 'role': key, 'file': os.path.relpath(out, HERE)})
json.dump(manifest, open(f'{HERE}/footage/broll_manifest.json', 'w'), indent=1, ensure_ascii=False)
print('done', len(manifest))
