"""Checks that every shot window (including speed ramps and transition pre/post-roll) stays inside one source shot.
Usage: python3 check_plan.py SHOTS_JSON   (JSON of scene-cut times per clip number, from ffmpeg scene detection)"""
import json, sys
import numpy as np
from plan4 import *
cuts = {int(k): v for k, v in json.load(open(sys.argv[1])).items()}
def window(clip, src, speed, dur, pre, post):
    dt = 1 / 600; tl = np.arange(-pre, dur + post, dt); f = np.clip(tl / dur, 0, 1)
    spd = np.interp(f, [k[0] for k in speed], [k[1] for k in speed]); cum = np.cumsum(spd) * dt
    s = src + cum - cum[np.searchsorted(tl, 0)]; return s.min() - .05, s.max() + .05
bad = 0
for i, s in enumerate(SHOTS):
    subs = ([(f"b{s['b']}", s)] if s["kind"] == "single" else [(f"b{s['b']}t{j}", t) for j, t in enumerate(s.get("tiles", []))] +
            [(f"b{s['b']}p{j}", t) for j, t in enumerate(s.get("panels", []))])
    for nm, t in subs:
        pre = (s["trans"][1] / 2 if s["trans"] else 0) + .02; nxt = SHOTS[i + 1]["trans"] if i + 1 < len(SHOTS) else None; post = (nxt[1] / 2 if nxt else 0) + .02
        lo, hi = window(t["clip"], t["src"], t["speed"], s["t1"] - s["t0"], pre, post); hit = [c for c in cuts[t["clip"]] if lo < c < hi]
        end = cuts[t["clip"]][-1]
        if hit or hi > end: bad += 1
        print(f"{nm:8s} c{t['clip']} src {lo:6.2f}-{hi:6.2f}" + (f"  <-- CROSSES CUT {hit}" if hit else "") + ("  <-- PAST END" if hi > end else ""))
print("problems:", bad)
