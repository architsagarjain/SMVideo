"""Build the output<->source time map for a series reel.

Trims the camera on/off frames, shortens long pauses (cut inside real silence, found from
the audio envelope, never inside a word) and plays everything kept at a uniform speed.
Graphics, captions and cues stay written in source seconds; the engine maps them.

Usage: python3 scripts/make_timemap.py <name> <source video> --head 0.77 --tail 74.4 --speed 1.12
Writes src/<name>/timemap.json: {fps, speed, segs: [{s0, s1, o0}], dur, frames}
"""
import argparse, json, os, subprocess
import numpy as np

ap = argparse.ArgumentParser()
ap.add_argument("name")
ap.add_argument("src")
ap.add_argument("--head", type=float, required=True)
ap.add_argument("--tail", type=float, required=True)
ap.add_argument("--speed", type=float, default=1.12)
ap.add_argument("--keep", type=float, default=0.22, help="pause kept inside a sentence (s, source time)")
ap.add_argument("--keep-end", type=float, default=0.30, help="pause kept after . ? ! (s, source time)")
a = ap.parse_args()
FPS = 30
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

words = [w for g in json.load(open(os.path.join(ROOT, "src", a.name, "captions.json"))) for w in g]

# 10 ms RMS envelope of the voice, to find where the silence really is
SR = 16000
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", a.src, "-vn", "-ac", "1", "-ar", str(SR), "-af", "highpass=f=80",
                      "-f", "f32le", "-"], capture_output=True, check=True).stdout
x = np.frombuffer(raw, dtype=np.float32)
hop = SR // 100
env = np.sqrt(np.convolve(x ** 2, np.ones(hop) / hop, mode="same"))[::hop]
env_db = 20 * np.log10(env + 1e-9)
speech_db = np.percentile(env_db[env_db > -70], 90)
quiet = env_db < speech_db - 27


def silent_span(t0, t1):
    """Longest quiet run inside [t0, t1] (s)."""
    i0, i1 = int(t0 * 100), int(t1 * 100)
    best, cur = (t0, t0), None
    for i in range(i0, i1):
        if i < len(quiet) and quiet[i]:
            cur = cur or i
            if (i + 1 - cur) / 100 > best[1] - best[0]:
                best = (cur / 100, (i + 1) / 100)
        else:
            cur = None
    return best


cuts = []
for w, nxt in zip(words, words[1:]):
    keep = a.keep_end if w["text"].rstrip('"').endswith((".", "?", "!")) else a.keep
    if nxt["start"] - w["end"] <= keep:
        continue
    q0, q1 = silent_span(w["end"] - 0.05, nxt["start"] + 0.05)
    if q1 - q0 <= keep:
        continue
    c0 = q0 + keep * 0.55
    c1 = q1 - keep * 0.45
    if c1 - c0 > 0.06:
        cuts.append((round(c0, 3), round(c1, 3)))

segs, s, o = [], a.head, 0.0
for c0, c1 in cuts:
    if c1 <= a.head or c0 >= a.tail:
        continue
    segs.append({"s0": round(s, 4), "s1": round(c0, 4), "o0": round(o, 5)})
    o += (c0 - s) / a.speed
    s = c1
segs.append({"s0": round(s, 4), "s1": a.tail, "o0": round(o, 5)})
o += (a.tail - s) / a.speed
frames = int(np.floor(o * FPS))

out = {"fps": FPS, "speed": a.speed, "segs": segs, "dur": round(o, 4), "frames": frames}
json.dump(out, open(os.path.join(ROOT, "src", a.name, "timemap.json"), "w"), indent=1)
removed = sum(c1 - c0 for c0, c1 in cuts)
span = words[-1]["end"] - words[0]["start"]
print(f"{a.name}: {len(segs)} segments, {removed:.1f}s of pause cut, {a.tail - a.head:.1f}s -> {o:.1f}s "
      f"({frames} frames), ~{len(words) / ((span - removed) / a.speed) * 60:.0f} wpm")
