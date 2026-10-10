#!/usr/bin/env python3
"""Builds src/data/captions.json (+ captions.srt) from the Whisper large-v3 word timings.

Whisper's word onsets at the start of each breath group run 0.3-0.45 s early, so every
phrase is linearly re-timed onto the speech region measured from the audio envelope
(SPEECH below, -45 dBFS threshold). Display spelling is corrected where Whisper got it
wrong ("Shadi" -> "Shaadi") and the spoken "5,100 rupees" is written as "₹5,100".
"""
import json

words = json.load(open("assets/whisper_words.json"))  # [start, end, word, prob]

# (whisper span) -> (measured speech span), one per breath group.
SPEECH = [((0.00, 3.50), (0.07, 3.81)), ((3.82, 5.12), (4.24, 5.32)), ((5.24, 7.58), (5.59, 7.90)),
          ((7.96, 10.12), (8.32, 10.54)), ((10.46, 12.48), (10.82, 12.71)), ((12.64, 15.08), (13.06, 15.20)),
          ((15.28, 17.80), (15.78, 18.17)), ((18.16, 20.78), (18.53, 21.24))]

def remap(t):
    for (a, b), (c, d) in SPEECH:
        if a - 0.01 <= t <= b + 0.01:
            return round(c + (t - a) * (d - c) / (b - a), 3)
    raise ValueError(t)

w = [[remap(s), remap(e), txt.strip()] for s, e, txt, _ in words]
# Merge Whisper's split tokens: "full" + "-time", "5" + ",100", then fold "rupees" into the price.
merged = []
for s, e, t in w:
    if merged and (t.startswith("-") or t.startswith(",")):
        merged[-1][1], merged[-1][2] = e, merged[-1][2] + t
    else:
        merged.append([s, e, t])
fix = {"Shadi": "Shaadi"}
out = []
for s, e, t in merged:
    if t == "rupees.":
        out[-1][1] = e; out[-1][2] = "₹" + out[-1][2] + "."
        continue
    out.append([s, e, fix.get(t, t)])

# Phrases (word index ranges) and the line break inside each; * marks accent words.
PHRASES = [
    ("Finding the right person", None),
    ("shouldn't feel like | another *full-time *job.", None),
    ("With *Shaadi *Mangalam,", None),
    ("you get a dedicated | *relationship *manager.", None),
    ("A real person who listens,", None),
    ("who understands | what you're looking for,", None),
    ("and brings you matches", None),
    ("that *actually *fit.", None),
    ("For professionals | serious about marriage.", None),
    ("Plans start at *₹5,100.", None),
]
i = 0
phrases = []
for spec, _ in PHRASES:
    lines = [l.split() for l in spec.split("|")]
    pw = []
    for li, line in enumerate(lines):
        for tok in line:
            accent = tok.startswith("*")
            tok = tok.lstrip("*")
            s, e, t = out[i]
            assert t == tok, (t, tok)
            pw.append({"text": t, "start": s, "end": e, "accent": accent, "line": li})
            i += 1
    phrases.append({"start": pw[0]["start"], "end": pw[-1]["end"], "words": pw})
assert i == len(out), (i, len(out))

# Display window: from the first word until the next phrase (or +0.45 s after the last word).
for k, p in enumerate(phrases):
    nxt = phrases[k + 1]["start"] if k + 1 < len(phrases) else 99
    p["show"] = round(p["start"] - 0.06, 3)
    p["hide"] = round(min(p["end"] + 0.45, nxt - 0.08), 3)
json.dump(phrases, open("src/data/captions.json", "w"), indent=1, ensure_ascii=False)

def ts(t):
    ms = round(t * 1000)
    return f"{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02},{ms % 1000:03}"
with open("output/captions.srt", "w") as f:
    for n, p in enumerate(phrases, 1):
        lines = {}
        for x in p["words"]:
            lines.setdefault(x["line"], []).append(x["text"])
        f.write(f"{n}\n{ts(p['show'])} --> {ts(p['hide'])}\n" + "\n".join(" ".join(v) for v in lines.values()) + "\n\n")
for p in phrases:
    print(f"{p['show']:6.2f}-{p['hide']:6.2f}  " + " ".join(("*" if x["accent"] else "") + x["text"] for x in p["words"]))
