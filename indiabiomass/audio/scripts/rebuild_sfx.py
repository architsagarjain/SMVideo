"""Rebuild any missing audio/sfx/*.wav from audio/sfx/sfx_manifest.json (the WAVs are not kept in git).
Each entry is downloaded from its Mixkit URL into sfx/raw/, then converted to 48 kHz / 24-bit / stereo,
leading silence trimmed, and cut to the manifest's duration with a 1 s fade-out (as the manifest describes)."""
import json, os, subprocess, time
HERE = os.path.dirname(os.path.abspath(__file__)); SFX = os.path.join(HERE, '..', 'sfx')
os.makedirs(os.path.join(SFX, 'raw'), exist_ok=True)
UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36'
done = fail = 0
for e in json.load(open(os.path.join(SFX, 'sfx_manifest.json'))):
    out = os.path.join(SFX, e['file'])
    if os.path.exists(out) and os.path.getsize(out) > 1000: continue
    raw = os.path.join(SFX, 'raw', f"{e['mixkit_id']}.wav")
    if not os.path.exists(raw) or os.path.getsize(raw) < 1000:
        r = subprocess.run(['curl', '-sSL', '-A', UA, '-o', raw, '-w', '%{http_code}', e['download_url']], capture_output=True, text=True)
        if r.stdout.strip() != '200': print('FAIL download', e['file'], r.stdout.strip()); fail += 1; continue
        time.sleep(0.5)
    d = float(e['duration_s'])
    af = f"silenceremove=start_periods=1:start_threshold=-50dB,atrim=0:{d},afade=t=out:st={max(0, d - 1)}:d=1"
    r = subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', raw, '-af', af, '-ar', '48000', '-ac', '2', '-c:a', 'pcm_s24le', out], capture_output=True, text=True)
    if r.returncode: print('FAIL convert', e['file'], r.stderr[-200:]); fail += 1; continue
    done += 1
print('rebuilt', done, 'failed', fail)
