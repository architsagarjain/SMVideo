"""Invitation reel: watermark-free clip + 7.5 s end screen (supplied end cut, then its last frame held with a slow push-in)
+ new music. Usage: python3 make_invitation.py CLEAN.mp4 END_CUT.mp4 SONG.wav OUT.mp4"""
import sys, subprocess
import numpy as np, cv2
CLEAN, END, SONG, OUT = sys.argv[1:5]
W, H, FPS = 1080, 1920, 30
END_S, XF = 7.5, 0.4                  # end screen length; crossfade from the invitation into it
SONG_FROM = 38.98                     # on the beat at ~39 s: the big kick lands ~4.5 s in, as the doors open
def smooth(x): x = min(max(x, 0.0), 1.0); return x * x * (3 - 2 * x)
dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", CLEAN], capture_output=True, text=True).stdout)
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", END, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True).stdout
ef = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3); n_end = int(round(END_S * FPS)); hold = n_end - len(ef)
endseg = OUT + ".end.mp4"
enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                        "-c:v", "libx264", "-crf", "12", "-pix_fmt", "yuv420p", endseg], stdin=subprocess.PIPE)
for f in ef: enc.stdin.write(f.tobytes())
last = ef[-1]
for i in range(1, hold + 1):
    z = 1 + .05 * smooth(i / hold); M = np.float32([[z, 0, 540 - 540 * z], [0, z, 900 - 900 * z]])
    enc.stdin.write(cv2.warpAffine(last, M, (W, H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT).tobytes())
enc.stdin.close(); enc.wait()
total = dur + END_S - XF
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", CLEAN, "-i", endseg, "-ss", str(SONG_FROM), "-t", f"{total:.3f}", "-i", SONG, "-filter_complex",
                f"[0:v]fps={FPS},settb=1/{FPS},format=yuv420p[a];[1:v]settb=1/{FPS},format=yuv420p[b];[a][b]xfade=transition=fade:duration={XF}:offset={dur - XF:.3f}[v];"
                f"[2:a]afade=t=in:d=0.04,afade=t=out:st={total - 1.4:.3f}:d=1.4,loudnorm=I=-14:TP=-1.5:LRA=11[au]",
                "-map", "[v]", "-map", "[au]", "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p", "-profile:v", "high",
                "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", "-t", f"{total:.3f}", OUT], check=True)
print("wrote", OUT, "duration", round(total, 2))
