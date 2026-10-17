"""Download the picked B-roll (one file per V<n>_<need>) into reels8/footage/raw. Wikimedia photos via 2160px thumbs."""
import json, os, re, subprocess, time, urllib.parse
HERE = os.path.dirname(os.path.abspath(__file__))
RAW = f'{HERE}/footage/raw'; os.makedirs(RAW, exist_ok=True)
cands = json.load(open(f'{HERE}/candidates_V1-4.json')) + json.load(open(f'{HERE}/candidates_V5-8.json'))
pick = json.load(open(f'{HERE}/broll_pick.json'))
UA = 'IndiaBiomassReels/1.0 (social video production; contact via commons talk)'

def get(url, out):
    for k in range(6):
        r = subprocess.run(['curl', '-sSL', '-A', UA, '-o', out, '-w', '%{http_code}', url], capture_output=True, text=True)
        if r.stdout.strip() == '200' and os.path.getsize(out) > 10000: return True
        time.sleep(5 * (k + 1))
    return False

def wm_thumb(url, w=2160):
    # https://upload.wikimedia.org/wikipedia/commons/a/ab/File.jpg -> .../thumb/a/ab/File.jpg/2160px-File.jpg
    m = re.match(r'(https://upload\.wikimedia\.org/wikipedia/commons)/(\w)/(\w\w)/(.+)$', url)
    if not m: return url
    return f'{m[1]}/thumb/{m[2]}/{m[3]}/{m[4]}/{w}px-{m[4]}'

manifest = []
for key, letter in sorted(pick.items()):
    v, n = key.split('_')
    c = next((c for c in cands if str(c['video']) in (v, v[1:]) and int(c['need_index']) == int(n) and c['candidate'] == letter), None)
    if not c: print('MISSING', key); continue
    url = c['download_url']; ext = os.path.splitext(urllib.parse.urlparse(url).path)[1].lower() or '.mp4'
    out = f'{RAW}/{key}{ext}'
    if not os.path.exists(out) or os.path.getsize(out) < 10000:
        ok = False
        if 'upload.wikimedia.org' in url and c.get('width', 0) and max(c.get('width', 0), c.get('height', 0)) > 2160:
            ok = get(wm_thumb(url, 2160 if c['width'] >= c['height'] else int(2160 * c['width'] / c['height'])), out)
        if not ok: ok = get(url, out)
        print(('OK  ' if ok else 'FAIL'), key, url[:90]); time.sleep(1.5)
    manifest.append({**c, 'role': key, 'file': os.path.relpath(out, HERE)})
json.dump(manifest, open(f'{HERE}/footage/broll_manifest.json', 'w'), indent=1, ensure_ascii=False)
print('done', len(manifest))
