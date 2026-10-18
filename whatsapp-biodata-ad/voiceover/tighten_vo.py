#!/usr/bin/env python3
"""Ad-fit edit of the ElevenLabs take: shortens each pause to a target length (cuts are
made inside silence, with 8 ms fades), then the result is sped up slightly with ffmpeg's
pitch-preserving atempo and loudness-normalised. Usage: tighten_vo.py in.mp3 out_basename"""
import subprocess, sys, numpy as np, wave

SR = 48000
# (silence start, silence end, new pause length) in the raw take, from silencedetect at -40 dB.
GAPS = [(1.257, 1.537, 0.20), (2.478, 3.174, 0.42),  # "...registration fee?"  [beat]  "Ab nahi."
        (4.114, 4.459, 0.30), (8.622, 9.304, 0.30), (11.318, 12.180, 0.34),
        (15.847, 16.424, 0.24), (16.672, 16.955, 0.20), (17.811, 18.258, 0.30),
        (21.784, 22.320, 0.24), (24.157, 24.792, 0.40)]  # last one: beat before the CTA line
TEMPO = 1.06

src, out = sys.argv[1], sys.argv[2]
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", src, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                     capture_output=True, check=True).stdout
x = np.frombuffer(raw, np.float32)
fade = int(0.008 * SR)
parts, pos = [], 0
for s, e, keep in GAPS:
    mid = (s + e) / 2  # keep half the new pause on each side of the cut
    a, b = int((mid - keep / 2) * SR), int((mid + keep / 2) * SR)
    seg = x[pos:a].copy()
    seg[-fade:] *= np.linspace(1, 0, fade)
    if pos:
        seg[:fade] *= np.linspace(0, 1, fade)
    parts.append(seg)
    pos = b
tail = x[pos:].copy(); tail[:fade] *= np.linspace(0, 1, fade)
parts.append(tail)
y = np.concatenate(parts)
tmp = out + "_tight.wav"
with wave.open(tmp, "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes())
print("tightened: %.2f s -> %.2f s" % (len(x) / SR, len(y) / SR))
# Pitch-preserving speed-up, trim trailing silence, normalise (-16 LUFS, -1.5 dBTP) for a VO stem.
chain = f"atempo={TEMPO},areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,apad=pad_dur=0.25"
meas = subprocess.run(["ffmpeg", "-hide_banner", "-i", tmp, "-af", chain + ",loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json",
                       "-f", "null", "-"], capture_output=True, text=True).stderr
import json, re
m = json.loads(re.search(r"\{[^{}]*\}", meas[meas.rfind("Parsed_loudnorm"):], re.S).group(0))
ln = (f"loudnorm=I=-16:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
      f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-af", chain + "," + ln + f",aresample={SR}",
                "-c:a", "pcm_s24le", out + ".wav"], check=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", out + ".wav", "-c:a", "libmp3lame", "-b:a", "320k", out + ".mp3"], check=True)
subprocess.run(["rm", tmp])
