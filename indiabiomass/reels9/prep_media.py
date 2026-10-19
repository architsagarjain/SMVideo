"""reels9/footage/raw -> film/public/r9: photos to <=2400 px JPEG; clips to 1080x1920 (centre crop), 30 fps, no audio."""
import os, subprocess, json, glob
HERE = os.path.dirname(os.path.abspath(__file__))
RAW = f'{HERE}/footage/raw'; OUT = os.path.join(HERE, '..', 'film', 'public', 'r9'); os.makedirs(OUT, exist_ok=True)
SKIP = {}  # seconds to skip at the start (black first frames etc.)
def probe(p):
    r = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height:format=duration', '-of', 'json', p], capture_output=True, text=True)
    j = json.loads(r.stdout); s = j['streams'][0]; return s['width'], s['height'], float(j['format'].get('duration', 0))
for p in sorted(glob.glob(f'{RAW}/*')):
    name = os.path.basename(p); out = os.path.join(OUT, name)
    if os.path.getsize(p) < 10000: print('skip (bad download)', name); continue
    if os.path.exists(out) and os.path.getmtime(out) > os.path.getmtime(p): continue
    if name.lower().endswith(('.jpg', '.jpeg', '.png')):
        subprocess.run(['convert', p, '-auto-orient', '-resize', '2400x2400>', '-strip', '-quality', '85', out], check=True)
    else:
        w, h, dur = probe(p); ss = SKIP.get(name, 0.3 if dur > 3 else 0)
        # Video 14 is a top/bottom split screen: keep the clip landscape so each half can crop it
        vf = 'scale=-2:1080,fps=30' if name.startswith('V14_') else (('crop=ih*9/16:ih,' if w / h > 9 / 16 else 'crop=iw:iw*16/9,') + 'scale=1080:1920,fps=30')
        subprocess.run(['ffmpeg', '-y', '-v', 'error', '-ss', str(ss), '-i', p, '-t', str(min(12, max(1, dur - ss))), '-vf', vf, '-an', '-c:v', 'libx264', '-crf', '20', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', out], check=True)
    print('ok', name)
