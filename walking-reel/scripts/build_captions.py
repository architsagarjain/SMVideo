"""Build src/data/captions.json from the Whisper word timings.

Each caption group lists its words as they should be displayed (numbers formatted,
ASR mistakes corrected) together with the index range of the Whisper words they
cover, so every displayed word keeps the real spoken timing.

The old burned-in captions are hidden under the caption capsule, so for each
group we also store how wide the old caption got while the group is on screen
(`coverHalfWidth`, in 1080x1920 output pixels).

Usage: python3 scripts/build_captions.py
"""
import json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
words = [w for seg in json.load(open(f"{ROOT}/analysis/whisper_transcript.json")) for w in seg["words"]]
bbox = json.load(open(f"{ROOT}/analysis/old_caption_bbox.json"))
FPS, SCALE = 30, 1.5  # source is 720x1280, output is 1080x1920

# (display text, number of whisper tokens it spans). "*word*" = accent colour,
# a group starting with "~" uses the editorial serif style for key statements.
GROUPS = [
    [("If", 1), ("there", 1), ("was", 1), ("a", 1), ("pill", 1)],
    [("that", 1), ("lowered", 1), ("your", 1), ("risk", 1)],
    [("of", 1), ("death", 1), ("by", 1), ("*12%*", 2)],
    [("and", 1), ("every", 1), ("extra", 1), ("pill", 1)],
    [("lowered", 1), ("it", 1), ("by", 1), ("another", 1), ("12%", 2)],
    [("with", 1), ("no", 1), ("side", 1), ("effects,", 1)],
    [("how", 1), ("many", 1), ("would", 1), ("you", 1), ("take?", 1)],
    [("~That", 1), ("drug", 1), ("exists.", 1)],
    [("It", 1), ("doesn't", 1), ("come", 1), ("in", 1), ("a", 1), ("bottle,", 1)],
    [("~it's", 1), ("*walking.*", 1)],
    [("Every", 1), ("extra", 1), ("*1,000*", 1), ("steps", 1), ("a", 1), ("day", 1)],
    [("is", 1), ("linked", 1), ("to", 1), ("about", 1), ("12%", 2)],
    [("lower", 1), ("risk", 1), ("of", 1), ("dying", 1)],
    [("from", 1), ("any", 1), ("cause.", 1)],
    [("And", 1), ("I", 1), ("used", 1), ("to", 1), ("think", 1)],
    [("walking", 1), ("didn't", 1), ("count.", 1)],
    [("I", 1), ("do", 1), ("my", 1), ("workout", 1)],
    [("then", 1), ("sit", 1), ("at", 1), ("a", 1), ("desk", 1)],
    [("for", 1), ("9", 1), ("hours.", 1)],
    [("I", 1), ("checked", 1), ("once", 1)],
    [("and", 1), ("I", 1), ("was", 1), ("at", 1)],
    [("about", 1), ("*2,500*", 1), ("steps.", 1)],
    [("I", 1), ("trained", 1), ("every", 1), ("day", 1)],
    [("and", 1), ("was", 1), ("basically", 1), ("*sedentary*", 1)],
    [("the", 1), ("rest", 1), ("of", 1), ("it.", 1)],
    [("The", 1), ("10,000", 2), ("number,", 1)],
    [("it", 1), ("came", 1), ("from", 1), ("an", 1), ("old", 1)],
    [("Japanese", 1), ("pedometer", 1)],
    [("marketing", 1), ("campaign.", 1)],
    [("The", 1), ("real", 1), ("benefit", 1)],
    [("climbs", 1), ("fast", 1)],
    [("at", 1), ("the", 1), ("low", 1), ("end", 1)],
    [("and", 1), ("flattens", 1), ("around", 1)],
    [("7,000", 1), ("to", 1), ("10,000.", 2)],
    [("Going", 1), ("from", 1), ("*3,000*", 1), ("to", 1), ("*5,000*", 1)],
    [("beats", 1), ("going", 1), ("from", 1)],
    [("8,000", 1), ("to", 1), ("10,000.", 2)],
    [("For", 1), ("fat", 1), ("loss,", 1)],
    [("an", 1), ("extra", 1), ("4,000", 1), ("steps", 1)],
    [("is", 1), ("roughly", 1)],
    [("*150*", 1), ("*calories*", 1), ("a", 1), ("day.", 1)],
    [("A", 1), ("walk", 1), ("after", 1), ("meal", 1)],
    [("also", 1), ("softens", 1)],
    [("the", 1), ("blood", 1), ("sugar", 1), ("spike.", 1)],
    [("Add", 1), ("1,000", 1), ("steps", 1), ("this", 1), ("week.", 1)],
    [("Comment", 1), ("*2026*", 1)],
    [("for", 1), ("the", 1), ("full", 1), ("plan.", 1)],
]

assert sum(n for g in GROUPS for _, n in g) == len(words), (sum(n for g in GROUPS for _, n in g), len(words))

out, i = [], 0
for g in GROUPS:
    serif = g[0][0].startswith("~")
    items = []
    for text, n in g:
        toks = words[i:i + n]; i += n
        text = text.lstrip("~")
        accent = text.startswith("*")
        items.append({"text": text.strip("*"), "accent": accent,
                      "start": round(toks[0]["s"], 3), "end": round(toks[-1]["e"], 3)})
    out.append({"start": items[0]["start"], "end": items[-1]["end"], "serif": serif, "words": items})

# how long each group stays up: until the next one starts
for k, g in enumerate(out):
    g["hold"] = out[k + 1]["start"] if k + 1 < len(out) else g["end"] + 0.4

# width of the old burned-in caption while each group is shown (98th percentile
# to ignore stray pink pixels from hands etc.), as half-width around x = 540
for g in out:
    f0, f1 = int(g["start"] * FPS) - 3, int(g["hold"] * FPS) + 3
    halves = []
    for f in range(max(0, f0), min(len(bbox), f1)):
        n, x0, x1, y0, y1 = bbox[f]
        # the old captions always sit at y 873-906; a taller box means a hand or
        # other pink-ish pixels were picked up, so skip that frame
        if n > 100 and y0 >= 865 and y1 <= 915:
            halves.append(max(abs(x0 * SCALE - 540), abs(x1 * SCALE - 540)))
    halves.sort()
    g["coverHalfWidth"] = round(halves[int(len(halves) * 0.98) - 1] if halves else 0, 1)

# text widths with the real fonts (must match CAPTION_* in src/theme.ts)
from PIL import ImageFont
sans = ImageFont.truetype(f"{ROOT}/public/fonts/Manrope-Variable.ttf", 44, layout_engine=ImageFont.Layout.RAQM)
sans.set_variation_by_axes([620])
serif = ImageFont.truetype(f"{ROOT}/public/fonts/InstrumentSerif-Italic.ttf", 60, layout_engine=ImageFont.Layout.RAQM)
for g in out:
    text = " ".join(w["text"] for w in g["words"])
    f, ls = (serif, 0.0) if g["serif"] else (sans, -0.3)
    g["textWidth"] = round(f.getlength(text) + ls * len(text), 1)

json.dump(out, open(f"{ROOT}/src/data/captions.json", "w"), indent=1)

# when the old captions are visible at all (the capsule must be up then)
on = [n > 100 for n, *_ in bbox]
print(f"{len(out)} groups; old captions on from {on.index(True) / FPS:.2f}s to {(len(on) - on[::-1].index(True)) / FPS:.2f}s")
for g in out:
    print(f'{g["start"]:6.2f}-{g["hold"]:6.2f} cover±{g["coverHalfWidth"]:5.1f}  {" ".join(w["text"] for w in g["words"])}')
