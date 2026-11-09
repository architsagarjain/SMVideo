"""Caption chunks for the minimal-style reels (m1, m2): 2-3 words, a ratio like "6 to 1" or
"1.5 to 1" never split, text fixes by start time, optional cut-off after a given time.

Usage: python3 scripts/minimal_captions.py <name>
reads analysis/<name>/whisper_transcript.json, writes src/<name>/captions.json
"""
import json, os, re, sys

NAME = sys.argv[1]
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FIX = {
    # (start_s, whisper text) -> shown text (None drops the word)
    'm1': {(45.86, 'Third,'): 'Tired,', (53.40, '3SH'): 'TSH', (68.28, 'Comment,'): 'Comment', (68.82, 'test'): 'TEST'},
    'm2': {(4.34, 'ukma,'): 'upma,', (5.06, 'igli'): 'idli,', (5.28, '-fi,'): None, (37.40, 'pesar'): 'pesarattu', (37.88, 'or'): None,
           (38.06, 'two'): None, (50.62, 'curled'): 'curd', (65.22, 'budji'): 'bhurji', (88.18, 'budji'): 'bhurji', (94.44, 'prantha,'): 'paratha,',
           (96.86, 'prantha,'): 'paratha,', (100.26, '2'): 'aloo', (117.20, 'breakfast'): 'BREAKFAST', (120.24, 'swaps'): 'swaps.'},
}
END = {'m2': 120.6}  # the recording stops mid-sentence; end on "swaps."

words = [w for s in json.load(open(f"{ROOT}/analysis/{NAME}/whisper_transcript.json")) for w in s["words"]]
fix = FIX.get(NAME, {})
ws = []
for w in words:
    t = w["w"].strip()
    if w["s"] >= END.get(NAME, 1e9):
        break
    key = next((k for k in fix if abs(k[0] - w["s"]) < 0.05 and k[1] == t), None)
    if key:
        t = fix[key]
        if t is None:
            continue
    if (t.startswith("-") or (t.startswith(".") and len(t) > 1 and t[1].isdigit())) and ws:  # glue "1" + ".5"
        ws[-1]["text"] += t
        ws[-1]["end"] = round(w["e"], 3)
        continue
    ws.append({"text": t, "start": round(w["s"], 3), "end": round(w["e"], 3)})

NUM = re.compile(r"^\d+(\.\d+)?[.,]?$")
chunks, cur = [], []
i = 0
while i < len(ws):
    w = ws[i]
    # a ratio "A to B" travels as one unit
    if NUM.match(w["text"]) and i + 2 < len(ws) and ws[i + 1]["text"] == "to" and NUM.match(ws[i + 2]["text"]):
        unit = ws[i:i + 3]
        i += 3
    else:
        unit = [w]
        i += 1
    if cur and (len(cur) + len(unit) > 3 or unit[0]["start"] - cur[-1]["end"] > 0.45):
        chunks.append(cur)
        cur = []
    cur += unit
    if re.search(r"[.?!]$", cur[-1]["text"]) or (cur[-1]["text"].endswith(",") and len(cur) >= 2):
        chunks.append(cur)
        cur = []
if cur:
    chunks.append(cur)
# fold a lone trailing word into the chunk before it when they run together
out = []
for c in chunks:
    if out and len(c) == 1 and len(out[-1]) <= 2 and c[0]["start"] - out[-1][-1]["end"] < 0.25 and not re.search(r"[.?!,]$", out[-1][-1]["text"]):
        out[-1] += c
    else:
        out.append(c)
# a lone word just before a ratio joins it ("is | 6 to 1." -> "is 6 to 1.")
merged = []
for c in out:
    if merged and len(merged[-1]) == 1 and len(merged[-1]) + len(c) <= 4 and c[0]["start"] - merged[-1][-1]["end"] < 0.35 and NUM.match(c[0]["text"]):
        merged[-1] = merged[-1] + c
    else:
        merged.append(c)
out = merged
os.makedirs(f"{ROOT}/src/{NAME}", exist_ok=True)
json.dump(out, open(f"{ROOT}/src/{NAME}/captions.json", "w"), indent=1)
print(len(out), 'chunks')
print(' | '.join(' '.join(w['text'] for w in c) for c in out))
