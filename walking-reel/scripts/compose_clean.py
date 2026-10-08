"""Paste the cleaned caption region back into every source frame and encode a
near-lossless intermediate (x264 CRF 8) with the original audio.
Usage: compose_clean.py src.mp4 roi_dir out.mp4"""
import cv2, sys, subprocess
X0, Y0 = 100, 760   # must match clean_captions.py
src, roidir, out = sys.argv[1:4]
cap = cv2.VideoCapture(src)
w, h = int(cap.get(3)), int(cap.get(4))
ff = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{w}x{h}", "-r", "30",
                       "-i", "-", "-i", src, "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-preset", "slow", "-crf", "8",
                       "-pix_fmt", "yuv420p", "-c:a", "copy", out], stdin=subprocess.PIPE)
t = 0
while True:
    ok, im = cap.read()
    if not ok: break
    roi = cv2.imread(f"{roidir}/{t:05d}.png")
    im[Y0:Y0 + roi.shape[0], X0:X0 + roi.shape[1]] = roi
    ff.stdin.write(im.tobytes()); t += 1
ff.stdin.close(); ff.wait()
print("frames", t)
