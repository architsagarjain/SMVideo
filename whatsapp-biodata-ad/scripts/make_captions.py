#!/usr/bin/env python3
"""Builds src/data/captions.json (+ output/captions.srt) for the Hinglish voiceover.

Whisper large-v3 (Hindi) gives word timings in Devanagari; captions are shown in Roman
Hinglish exactly as scripted. Each Roman word takes the timing of its Whisper word
(index below). Whisper's onsets at the start of each breath group run early, so every
group is re-timed linearly onto the speech region measured from the audio envelope
(silencedetect, -40 dB)."""
import json, os

W = json.load(open("assets/vo_whisper_words.json"))  # [start, end, word, prob]
# (whisper span) -> (measured speech span), one per breath group.
GROUPS = [((0.00, 1.06), (0.00, 1.257)), ((1.06, 2.38), (1.537, 2.478)), ((2.82, 3.68), (3.174, 4.114)),
          ((4.00, 8.52), (4.459, 8.622)), ((8.86, 11.18), (9.304, 11.318)), ((11.82, 15.82), (12.180, 15.847)),
          ((15.98, 16.60), (16.424, 16.672)), ((16.60, 17.72), (16.955, 17.811)), ((18.20, 21.64), (18.258, 21.784)),
          ((21.76, 24.06), (22.320, 24.157)), ((24.06, 27.54), (24.90, 27.68))]

def remap(t):
    for i, ((a, b), (c, d)) in enumerate(GROUPS):  # half-open, so a boundary word starts its group
        if a - 0.005 <= t < b - 0.005 or (i == len(GROUPS) - 1 and t <= b + 0.005):
            return round(c + (t - a) * (d - c) / (b - a), 3)
    raise ValueError(t)

# Phrases: "roman:whisperIndex" tokens, "|" = line break, "*" = accent colour.
PHRASES = [
    "Rishta:0 dhoondhne:1 ke:2 liye:3",
    "*registration:4 *fee?:5",
    "*Ab:6 *nahi.:7",
    "Ho:8 sakta:9 hai,:10 | abhi:11 koi:12 family:13",
    "bilkul:14 aap:15 jaisa:16 rishta:17 | dhoondh:18 rahi:19 ho.:20",
    "Bas:21 aapka:22 biodata:23 | wahan:25 hona:26 chahiye.:27",
    "Shaadi:28 Mangalam:29 par:30 | apna:31 biodata:32",
    "bilkul:34 *free:35 | register:36 karein.:37",
    "Bas:38 *WhatsApp:39 par:40 bhejiye.:41",
    "Agar:42 aapki:43 profile:44 | kisi:45 family:46 ki:47",
    "requirement:48 se:49 | *match:50 *hui,:51",
    "toh:52 hamari:53 team:54 | aapko:55 *call:56 karegi.:57",
    "Aaj:58 hi:59 apna:60 biodata:61 | *WhatsApp:63 par:64 bhejiye.:65",
]
starts = [remap(w[0]) for w in W]
# The CTA line's word onsets, read directly off the audio envelope (Whisper drifts here).
for i, t in {58: 24.90, 59: 25.45, 60: 25.70, 61: 26.05, 63: 26.70, 64: 27.10, 65: 27.30}.items():
    starts[i] = t
END = 27.68
phrases = []
for spec in PHRASES:
    words = []
    for li, line in enumerate(spec.split("|")):
        for tok in line.split():
            text, idx = tok.rsplit(":", 1)
            idx = int(idx)
            nxt = starts[idx + 1] if idx + 1 < len(starts) else END
            words.append({"text": text.lstrip("*"), "start": starts[idx], "end": nxt if idx >= 58 else min(remap(W[idx][1]), nxt),
                          "accent": text.startswith("*"), "line": li})
    phrases.append({"start": words[0]["start"], "end": words[-1]["end"], "words": words})
for k, p in enumerate(phrases):
    nxt = phrases[k + 1]["start"] if k + 1 < len(phrases) else 99
    p["show"] = round(p["start"] - 0.05, 3)
    p["hide"] = round(min(p["end"] + 0.5, nxt - 0.06), 3)
phrases[-1]["hide"] = 28.6  # the CTA line stays up through the end card
json.dump(phrases, open("src/data/captions.json", "w"), indent=1, ensure_ascii=False)

def ts(t):
    ms = round(t * 1000)
    return f"{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02},{ms % 1000:03}"
os.makedirs("output", exist_ok=True)
with open("output/captions.srt", "w") as f:
    for n, p in enumerate(phrases, 1):
        lines = {}
        for x in p["words"]:
            lines.setdefault(x["line"], []).append(x["text"])
        f.write(f"{n}\n{ts(p['show'])} --> {ts(p['hide'])}\n" + "\n".join(" ".join(v) for v in lines.values()) + "\n\n")
for p in phrases:
    print(f"{p['show']:6.2f}-{p['hide']:6.2f} " + " ".join(f"{w['text']}@{w['start']:.2f}" for w in p["words"]))
