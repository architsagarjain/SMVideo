#!/usr/bin/env python3
"""Writes subtitles/captions.ass (burned into the reel) and subtitles/captions.srt.

Cue times are in each source clip's own timeline (from a forced alignment of the
transcript), then shifted onto the reel timeline using the cut list passed in by
build_reel.sh, so changing a cut point keeps the captions in sync.
"""
import os, sys

FPS = 30
# Brand name is tinted a soft gold; everything else is white.
BRAND = "Shaadi Mangalam"
BRAND_COLOUR = "&H8CCFF4&"  # ASS is BGR: #F4CF8C

# (clip, start, end, text) - seconds in the source clip.
CUES = [
    (1, 1.30, 2.30, "I'm not gonna lie,"),
    (1, 2.40, 3.95, "I genuinely thought"),
    (1, 4.40, 5.45, "matrimony apps"),
    (1, 5.45, 6.75, "were going to be…"),
    (1, 7.26, 8.30, "terrifying."),
    (2, 1.13, 2.08, "I didn't want"),
    (2, 2.08, 3.20, "random biodatas"),
    (2, 3.20, 4.50, "being sent around."),
    (2, 5.29, 6.21, "I just wanted to meet"),
    (2, 6.21, 7.41, "someone I'd actually"),
    (2, 7.41, 8.45, "connect with."),
    (3, 0.39, 1.04, "Then I tried"),
    (3, 1.04, 2.20, BRAND),
    (3, 2.77, 3.95, "and honestly,"),
    (3, 4.28, 5.95, "it felt way more like me."),
    (4, 2.70, 3.87, "And now there's someone"),
    (4, 3.87, 6.10, "I get to spend my life with."),
]

def main():
    # argv: C1_IN C1_OUT C2_IN C2_OUT C3_IN C3_OUT C4_IN C4_OUT X12 X23 X34
    f = [int(x) for x in sys.argv[1:9]]
    x12, x23, x34 = (float(x) for x in sys.argv[9:12])
    ins = [f[0] / FPS, f[2] / FPS, f[4] / FPS, f[6] / FPS]
    lens = [(f[1] - f[0]) / FPS, (f[3] - f[2]) / FPS, (f[5] - f[4]) / FPS, (f[7] - f[6]) / FPS]
    starts = [0.0]
    for length, x in zip(lens, (x12, x23, x34)):
        starts.append(starts[-1] + length - x)
    ends = [starts[i] + lens[i] for i in range(4)]

    cues = []
    for clip, s, e, text in CUES:
        i = clip - 1
        rs = starts[i] + (s - ins[i])
        re = starts[i] + (e - ins[i])
        # Keep each caption inside the part of the clip that is actually on screen.
        rs, re = max(rs, starts[i]), min(re, ends[i])
        if re > rs:
            cues.append((rs, re, text))

    os.makedirs("subtitles", exist_ok=True)
    with open("subtitles/captions.srt", "w") as out:
        for n, (s, e, t) in enumerate(cues, 1):
            out.write(f"{n}\n{srt_time(s)} --> {srt_time(e)}\n{t}\n\n")
    with open("subtitles/captions.ass", "w") as out:
        out.write(ASS_HEADER)
        for s, e, t in cues:
            t = t.replace(BRAND, f"{{\\c{BRAND_COLOUR}}}{BRAND}{{\\c&HFFFFFF&}}")
            out.write(f"Dialogue: 0,{ass_time(s)},{ass_time(e)},Caption,,0,0,0,,{{\\fad(120,120)\\blur2}}{t}\n")

def srt_time(t):
    ms = round(t * 1000)
    return f"{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02},{ms % 1000:03}"

def ass_time(t):
    cs = round(t * 100)
    return f"{cs // 360000}:{cs // 6000 % 60:02}:{cs // 100 % 60:02}.{cs % 100:02}"

# 1080x1920 canvas. Bottom-centre, lifted clear of Instagram's caption/buttons area.
# Soft blurred dark outline + shadow instead of a box, so it reads on bright frames
# without looking heavy.
ASS_HEADER = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Caption,Montserrat SemiBold,76,&H00FFFFFF,&H00FFFFFF,&H8C000000,&HA0000000,0,0,0,0,100,100,0.5,0,1,3.2,2.5,2,90,90,560,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""

if __name__ == "__main__":
    main()
