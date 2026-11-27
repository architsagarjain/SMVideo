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
    'ad6': {(9.50, '500'): '500+', (9.92, 'plus'): None, (41.96, 'Rs.'): '₹99', (42.50, '99'): None, (36.68, 'choliaboty.'): 'chole bhature.'},
    'ad7': {(9.08, '500'): '500+', (9.58, 'plus'): None, (44.24, 'Rs.'): '₹99', (44.80, '99'): None, (38.06, 'bhatoori.'): 'bhature.'},
    'ad8': {(8.76, '500'): '500+', (9.38, 'plus'): None, (53.20, 'rupees'): '₹99', (27.42, 'favorite'): 'favourite', (24.12, 'Piquettes.'): 'PeakX.', (53.66, '99'): None,
            (50.92, 'one'): 'one-on-one', (51.08, 'on'): None, (51.24, 'one'): None},
    'd4': {(33.093, 'transform'): 'transform,', (30.063, 'protein'): 'protein', (31.653, 'if'): 'if'},
    'dahi': {(2.38, 'dhai'): 'dahi', (7.573, 'Buna'): 'bhuna', (7.933, 'Jira'): 'jeera', (15.533, 'The'): 'Dahi', (16.133, 'heat'): None,
             (20.901, 'The'): 'Dahi', (21.541, 'heat'): None, (25.041, '1'): '10 on 10', (25.121, ',010'): None,
             (31.975, 'come'): 'comment', (32.275, 'in'): None, (32.435, 'dahi'): '"DAHI"'},
    'choc': {(16.666, 'lint'): 'Lindt', (17.246, '70'): '70%', (17.706, '%'): None, (26.556, 'Bonewell.'): 'Bournville.', (28.036, 'foldable'): 'affordable',
             (46.849, 'Kraft'): 'craft', (57.516, 'Smur'): 'Smoor', (74.051, 'the'): 'The', (74.111, 'whole'): 'Whole', (74.371, 'truth'): 'Truth',
             (83.697, 'bitter'): 'Bitter', (83.917, '75'): '75%', (84.537, '%'): None, (98.811, 'cacao'): '"CACAO"'},
    'lp': {(1.22, 'Garwal,'): 'Agarwal,', (3.54, 'Peakex.'): 'PeakX.', (11.82, 'NFS.'): 'INFS.', (13.46, '500'): '500+', (13.96, 'plus'): None,
           (46.577, 'client'): 'clients', (88.084, 'rupees'): '₹99.', (88.424, '99.'): None, (91.684, 'PeekX'): 'PeakX', (148.684, 'PICACS.'): 'PeakX.',
           (290.21, 'TKX.'): 'PeakX.', (297.497, 'rupees'): '₹99.', (297.897, '99.'): None, (315.897, 'in'): None, (22.04, 'favorite'): 'favourite'},
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
    if NUM.match(w["text"]) and i + 2 < len(ws) and ws[i + 1]["text"] in ("to", "on") and NUM.match(ws[i + 2]["text"]):
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
# ads: never leave one word on its own ("another.") - it joins the chunk before it, or takes its last word
if NAME.startswith('ad') or NAME in ('d4', 'dahi', 'choc', 'lp'):
    fixed = []
    for c in out:
        if fixed and len(c) == 1 and c[0]["start"] - fixed[-1][-1]["end"] < 0.6:
            if len(fixed[-1]) <= 3:
                fixed[-1] = fixed[-1] + c
                continue
            c = [fixed[-1].pop()] + c
        fixed.append(c)
    out = fixed
os.makedirs(f"{ROOT}/src/{NAME}", exist_ok=True)
json.dump(out, open(f"{ROOT}/src/{NAME}/captions.json", "w"), indent=1)
print(len(out), 'chunks')
print(' | '.join(' '.join(w['text'] for w in c) for c in out))
