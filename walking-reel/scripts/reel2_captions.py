"""Caption chunks (1-3 words) for reel 2 from the Whisper word timings.

Words were cross-checked with a second model (large-v3). Fixes applied here:
"I am" -> "I'm", "meta -analysis" -> "meta-analysis", "year -end" -> "year-end".
Usage: python3 scripts/reel2_captions.py
"""
import json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
words = [w for s in json.load(open(f"{ROOT}/analysis/reel2/whisper_transcript.json")) for w in s["words"]]
ws = []
for w in words:
    text = w["w"].strip()
    if text.startswith("-") and ws:  # glue "meta" + "-analysis", "year" + "-end"
        ws[-1]["text"] += text
        ws[-1]["end"] = round(w["e"], 3)
        continue
    ws.append({"text": text, "start": round(w["s"], 3), "end": round(w["e"], 3)})
# "I" (0.00) "am" (1.18): she starts speaking at ~1.1 s; show it as "I'm"
assert ws[0]["text"] == "I" and ws[1]["text"] == "am"
ws[1] = {"text": "I'm", "start": ws[1]["start"] - 0.08, "end": ws[1]["end"]}
ws.pop(0)

# chunk: break after punctuation, before a long pause, or at 3 words
chunks, cur = [], []
for i, w in enumerate(ws):
    cur.append(w)
    nxt = ws[i + 1] if i + 1 < len(ws) else None
    gap = (nxt["start"] - w["end"]) if nxt else 9
    if len(cur) == 3 or re.search(r"[.,?!]$", w["text"]) or gap > 0.35:
        chunks.append(cur)
        cur = []
if cur:
    chunks.append(cur)
json.dump(chunks, open(f"{ROOT}/src/reel2/captions.json", "w"), indent=1)
print(len(ws), "words,", len(chunks), "chunks")
for c in chunks:
    print(f'{c[0]["start"]:6.2f}  {" ".join(w["text"] for w in c)}')
