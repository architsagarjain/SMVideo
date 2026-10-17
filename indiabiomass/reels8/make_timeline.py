"""Build the visual-timeline review page (HTML) from plan.json + scouted B-roll candidates."""
import json, os, base64, subprocess, html, glob
HERE = os.path.dirname(os.path.abspath(__file__))
SP = '/tmp/claude-0/-home-user-SMVideo/dea5613d-59d0-569e-9e5f-fab7f2a5b5e9/scratchpad/broll'
OUT = os.path.join(os.path.dirname(SP), 'timeline', 'reels_timeline.html')
os.makedirs(os.path.dirname(OUT), exist_ok=True)
plan = json.load(open(f'{HERE}/plan.json'))
cands = []
for f in glob.glob(f'{SP}/candidates_*.json'):
    cands += json.load(open(f))
pick = json.load(open(f'{HERE}/broll_pick.json')) if os.path.exists(f'{HERE}/broll_pick.json') else {}

def thumb(path, w=320):
    if not path or not os.path.exists(path): return ''
    small = path.replace('.jpg', f'_w{w}.jpg')
    if not os.path.exists(small):
        subprocess.run(['convert', path, '-resize', f'{w}x{w*2}>', '-quality', '72', small], check=True)
    return 'data:image/jpeg;base64,' + base64.b64encode(open(small, 'rb').read()).decode()

def broll_for(n, need):
    if need is None: return None
    key = f'V{n}_{need}'
    pool = [c for c in cands if c.get('video') in (f'V{n}', n, str(n)) and int(c.get('need_index', -1)) == need]
    if key in pick: pool = [c for c in pool if c.get('candidate') == pick[key]] or pool
    return pool[0] if pool else None

E = html.escape
KIND = {'open': 'Hook', 'footage': 'B-roll', 'graphic': 'Graphic', 'split': 'Split screen', 'map': 'Map', 'quiz': 'Quiz', 'brand': 'Brand'}
sec = []
for v in plan:
    n, total = v['n'], v['total']
    bar = ''.join(f'<span class="seg k-{b["kind"]}" style="flex:{max(0.5, b["t1"] - b["t0"]):.2f}" title="{b["t0"]:.0f}–{b["t1"]:.0f} s">{i + 1}</span>' for i, b in enumerate(v['beats']))
    ticks = ''.join(f'<span style="left:{t / total * 100:.2f}%">{t}s</span>' for t in range(0, int(total) + 1, 10))
    rows = []
    for i, b in enumerate(v['beats']):
        c = broll_for(n, b['need'])
        media = ''
        if c:
            src = thumb(c.get('thumb'))
            lic = f'{E(c.get("license_name", ""))} · {E(str(c.get("author", "")))}'
            media = (f'<figure><img src="{src}" alt="{E(c.get("title", ""))}" loading="lazy">'
                     f'<figcaption>{"Video" if c.get("kind") == "video" else "Photo"} · {lic}</figcaption></figure>') if src else ''
        elif b['kind'] in ('graphic', 'brand', 'map', 'quiz', 'split'):
            media = f'<div class="gfx k-{b["kind"]}">{E(KIND[b["kind"]])}<small>animated in Remotion</small></div>'
        rows.append(f'''<li class="beat">
  <div class="when"><b>V{n}·{i + 1}</b><span>{b["t0"]:.0f}–{b["t1"]:.0f} s</span><em class="chip k-{b["kind"]}">{KIND[b["kind"]]}</em></div>
  <div class="what"><p class="vo">“{E(b["vo"])}”</p><p class="vis">{E(b["visual"])}</p></div>
  <div class="media">{media}</div>
</li>''')
    sec.append(f'''<section class="video" id="video{n}">
  <header><div class="num">Video {n}</div><div><h2>{E(v["title"])}</h2><p class="meta">{E(v["fmt"])} · about {total:.0f} s · {len(v["beats"])} beats</p></div></header>
  <p class="look"><b>Look:</b> {E(v["look"])}</p>
  <div class="bar" role="img" aria-label="Timeline of video {n}">{bar}</div><div class="ticks">{ticks}</div>
  <ol class="beats">{"".join(rows)}</ol>
</section>''')

nav = ''.join(f'<a href="#video{v["n"]}"><b>{v["n"]}</b>{E(v["title"])}</a>' for v in plan)
page = f'''<title>IndiaBiomass Videos 1–8</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;800&family=Geist:wght@400;500;600&family=Archivo:wght@500;600&display=swap">
<style>
/* Layout: one column of eight numbered video sections; each has a proportional beat bar and a beat list (time | words + visuals | b-roll). */
:root {{ --bg:#F4F3EE; --surface:#FFFFFF; --ink:#16201A; --muted:#5C655E; --line:#DEDBCF; --forest:#07412A; --gold:#A96714; --gold-soft:#F3E3C4;
  --k-open:#07412A; --k-footage:#3F7A5A; --k-graphic:#A96714; --k-split:#6B5B95; --k-map:#2F6E8C; --k-quiz:#B4533C; --k-brand:#16201A;
  --display:'Plus Jakarta Sans', system-ui, sans-serif; --text:'Geist', system-ui, sans-serif; --label:'Archivo', system-ui, sans-serif; }}
@media (prefers-color-scheme: dark) {{ :root:not([data-theme="light"]) {{ --bg:#0B1510; --surface:#12201A; --ink:#ECEDE6; --muted:#A3ADA6; --line:#25362D; --forest:#7BD9A0; --gold:#E8B04B; --gold-soft:#3A2E17;
  --k-open:#2E8A5E; --k-footage:#4E9B72; --k-graphic:#C8892C; --k-split:#8A79B8; --k-map:#4C93B5; --k-quiz:#CF6B52; --k-brand:#5E6B63; color-scheme:dark }} }}
:root[data-theme="dark"] {{ --bg:#0B1510; --surface:#12201A; --ink:#ECEDE6; --muted:#A3ADA6; --line:#25362D; --forest:#7BD9A0; --gold:#E8B04B; --gold-soft:#3A2E17;
  --k-open:#2E8A5E; --k-footage:#4E9B72; --k-graphic:#C8892C; --k-split:#8A79B8; --k-map:#4C93B5; --k-quiz:#CF6B52; --k-brand:#5E6B63; color-scheme:dark }}
body {{ background:var(--bg); color:var(--ink); font-family:var(--text); font-size:15px; line-height:1.5;
  padding-left:max(16px, env(safe-area-inset-left, 0px)); padding-right:max(16px, env(safe-area-inset-right, 0px)); padding-block:28px 64px; }}
.wrap {{ max-width:1080px; margin:0 auto; display:grid; gap:28px; }}
h1 {{ font-family:var(--display); font-weight:800; font-size:clamp(28px, 5vw, 42px); letter-spacing:-0.02em; margin:0; text-wrap:balance; }}
h2 {{ font-family:var(--display); font-weight:800; font-size:24px; margin:0; letter-spacing:-0.01em; text-wrap:balance; }}
.lede {{ color:var(--muted); max-width:65ch; margin:6px 0 0; }}
nav {{ display:flex; flex-wrap:wrap; gap:8px; }}
nav a {{ display:flex; gap:8px; align-items:center; padding:8px 12px; border:1px solid var(--line); border-radius:999px; color:var(--ink); text-decoration:none; background:var(--surface); font-size:14px; }}
nav a b {{ font-family:var(--label); color:var(--gold); }}
nav a:focus-visible, nav a:hover {{ border-color:var(--gold); outline:none; }}
.panel {{ background:var(--surface); border:1px solid var(--line); border-radius:14px; padding:18px 20px; display:grid; gap:10px; }}
.panel h3 {{ font-family:var(--label); font-size:13px; letter-spacing:.14em; text-transform:uppercase; color:var(--gold); margin:0; }}
.panel ul {{ margin:0; padding-left:20px; display:grid; gap:4px; }}
.tbl {{ overflow-x:auto; }} table {{ border-collapse:collapse; width:100%; font-variant-numeric:tabular-nums; }}
th, td {{ text-align:left; padding:8px 10px; border-bottom:1px solid var(--line); }} th {{ font-family:var(--label); font-size:12px; letter-spacing:.1em; text-transform:uppercase; color:var(--muted); }}
tr.rec td {{ background:var(--gold-soft); }}
.legend {{ display:flex; flex-wrap:wrap; gap:10px 16px; font-size:13px; color:var(--muted); }}
.legend span::before {{ content:""; display:inline-block; width:12px; height:12px; border-radius:3px; margin-right:6px; vertical-align:-1px; background:var(--c); }}
.video {{ background:var(--surface); border:1px solid var(--line); border-radius:16px; padding:22px 22px 10px; display:grid; gap:14px; scroll-margin-top:16px; }}
.video header {{ display:flex; gap:16px; align-items:center; flex-wrap:wrap; }}
.num {{ font-family:var(--display); font-weight:800; font-size:22px; color:var(--bg); background:var(--forest); border-radius:10px; padding:8px 14px; white-space:nowrap; }}
.meta {{ margin:2px 0 0; color:var(--muted); font-size:14px; }}
.look {{ margin:0; max-width:80ch; }}
.bar {{ display:flex; gap:3px; height:34px; }}
.seg {{ border-radius:6px; color:#fff; font-family:var(--label); font-weight:600; font-size:13px; display:flex; align-items:center; justify-content:center; min-width:18px; background:var(--k); }}
.ticks {{ position:relative; height:16px; font-size:11px; color:var(--muted); font-variant-numeric:tabular-nums; margin-top:-8px; }}
.ticks span {{ position:absolute; transform:translateX(-50%); }} .ticks span:first-child {{ transform:none; }}
.k-open {{ --k:var(--k-open); --c:var(--k-open); }} .k-footage {{ --k:var(--k-footage); --c:var(--k-footage); }} .k-graphic {{ --k:var(--k-graphic); --c:var(--k-graphic); }}
.k-split {{ --k:var(--k-split); --c:var(--k-split); }} .k-map {{ --k:var(--k-map); --c:var(--k-map); }} .k-quiz {{ --k:var(--k-quiz); --c:var(--k-quiz); }} .k-brand {{ --k:var(--k-brand); --c:var(--k-brand); }}
.beats {{ list-style:none; margin:0; padding:0; }}
.beat {{ display:grid; grid-template-columns:110px minmax(0, 1fr) 200px; gap:16px; padding:14px 0; border-top:1px solid var(--line); align-items:start; }}
.when {{ display:grid; gap:4px; font-variant-numeric:tabular-nums; }}
.when b {{ font-family:var(--label); font-size:15px; color:var(--gold); }}
.when span {{ font-size:13px; color:var(--muted); }}
.chip {{ font-style:normal; font-size:11px; font-family:var(--label); letter-spacing:.06em; text-transform:uppercase; color:#fff; background:var(--k); border-radius:999px; padding:2px 8px; justify-self:start; }}
.what {{ min-width:0; display:grid; gap:6px; }} .what p {{ margin:0; }}
.vo {{ color:var(--muted); font-size:14px; }}
.vis {{ font-weight:500; }}
.media figure {{ margin:0; display:grid; gap:4px; }}
.media img {{ width:100%; aspect-ratio:16/10; object-fit:cover; border-radius:10px; background:var(--line); }}
.media figcaption {{ font-size:11px; color:var(--muted); line-height:1.3; }}
.gfx {{ aspect-ratio:16/10; border-radius:10px; display:grid; place-content:center; text-align:center; font-family:var(--label); font-weight:600; color:#fff; background:var(--k); font-size:14px; }}
.gfx small {{ display:block; font-weight:400; opacity:.8; font-size:11px; }}
@media (max-width: 720px) {{ .beat {{ grid-template-columns:minmax(0, 1fr); gap:8px; }} .when {{ grid-auto-flow:column; justify-content:start; align-items:center; gap:10px; }} .media {{ max-width:320px; }} }}
@media (prefers-reduced-motion: reduce) {{ * {{ scroll-behavior:auto !important; }} }}
</style>
<div class="wrap">
  <div><h1>IndiaBiomass Videos 1–8</h1>
  <p class="lede">Eight reels in Ruhaan's voice. Each video has its own number, look and B-roll. To ask for a change, quote the beat number, for example <b>“V3·4: use a different machine shot”</b>. Nothing has been generated yet: no ElevenLabs credits are spent until you approve this timeline.</p></div>
  <nav aria-label="Videos">{nav}</nav>
  {{CREDITS}}
  <div class="legend"><span class="k-open">Hook</span><span class="k-footage">B-roll</span><span class="k-graphic">Graphic</span><span class="k-split">Split screen</span><span class="k-map">Map</span><span class="k-quiz">Quiz</span><span class="k-brand">Brand / end card</span></div>
  {"".join(sec)}
</div>'''
credits = open(f'{HERE}/credits.html').read() if os.path.exists(f'{HERE}/credits.html') else ''
open(OUT, 'w').write(page.replace('{CREDITS}', credits))
print(OUT, os.path.getsize(OUT) // 1024, 'KB')
