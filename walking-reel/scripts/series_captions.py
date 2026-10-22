"""Caption chunks (1-3 words) for the Bhavika series reels.

Usage: python3 scripts/series_captions.py <name>
reads analysis/<name>/whisper_transcript.json, writes src/<name>/captions.json
Per-reel text fixes live in FIXES (whisper token -> displayed text, by start time).
"""
import json, os, re, sys

NAME = sys.argv[1]
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FIXES = {
    # name: [(start_s, from_text, to_text)]  to_text None = drop the word
    'knee': [(0.00, 'I', 'I'), (42.14, 'over', 'over-'), (42.54, 'predict', 'predict')],
    # large-v3 hears "I've" / "I'm" here
    'v5': [(17.72, 'HIT', 'HIIT')],
    'v8': [(73.52, 'guide', 'GUIDE')],
    'v9': [(24.96, 'tread', 'trend'), (74.98, 'guide', 'GUIDE')],
    'v10': [(70.32, 'guide', 'GUIDE')],
    'v7': [(45.14, 'Come', 'Comment'), (45.26, 'and', None), (45.44, 'snack', 'SNACK')],
    'sabudana': [(5.70, 'light', '"light"'), (3.64, 'I', "I've"), (3.66, 'have', None), (23.84, 'I', "I'm"), (24.04, 'am', None)],
}
words = [w for s in json.load(open(f"{ROOT}/analysis/{NAME}/whisper_transcript.json")) for w in s["words"]]
ws = []
for w in words:
    text = w["w"].strip()
    if (text.startswith("-") or (text.startswith(".") and len(text) > 1 and text[1].isdigit())) and ws:  # glue "year" + "-end", "0" + ".2"
        ws[-1]["text"] += text
        ws[-1]["end"] = round(w["e"], 3)
        continue
    ws.append({"text": text, "start": round(w["s"], 3), "end": round(w["e"], 3)})
for st, frm, to in FIXES.get(NAME, []):
    for w in ws:
        if abs(w["start"] - st) < 0.05 and w["text"].strip(".,?!") == frm.strip(".,?!"):
            w["text"] = w["text"].replace(frm.strip(".,?!"), to) if to is not None else None
ws = [w for w in ws if w["text"]]
# join "over-" + "predict" into one word
out = []
for w in ws:
    if out and out[-1]["text"].endswith("-"):
        out[-1]["text"] += w["text"]; out[-1]["end"] = w["end"]; continue
    out.append(w)
ws = out
# the first word often carries leading silence: start it shortly before the second word
if len(ws) > 1 and ws[1]["start"] - ws[0]["start"] > 0.6:
    ws[0]["start"] = round(ws[1]["start"] - 0.25, 3)

chunks, cur = [], []
for i, w in enumerate(ws):
    cur.append(w)
    nxt = ws[i + 1] if i + 1 < len(ws) else None
    gap = (nxt["start"] - w["end"]) if nxt else 9
    if len(cur) == 3 or re.search(r"[.,?!]$", w["text"]) or gap > 0.35:
        chunks.append(cur); cur = []
if cur:
    chunks.append(cur)
os.makedirs(f"{ROOT}/src/{NAME}", exist_ok=True)
json.dump(chunks, open(f"{ROOT}/src/{NAME}/captions.json", "w"), indent=1)
print(len(ws), "words,", len(chunks), "chunks")
for c in chunks:
    print(f'{c[0]["start"]:6.2f}  {" ".join(w["text"] for w in c)}')
