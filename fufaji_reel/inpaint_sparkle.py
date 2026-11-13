"""For static shots on bright, smooth backgrounds: rebuild the sparkle area from its surroundings in every frame (no un-blending).
The star shape is taken from SHAPE_FROM (a clip with the same mark and a moving background).
Usage: python3 inpaint_sparkle.py IN.mp4 OUT.mp4 SHAPE_FROM.mp4 [FPS]"""
import sys, subprocess
import numpy as np, cv2
IN, OUT, SHAPE = sys.argv[1:4]; FPS = sys.argv[4] if len(sys.argv) > 4 else "24"; W, H = 1080, 1920
X0, Y0, X1, Y1 = 850, 1690, 950, 1790
def frames(p): return np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True).stdout, np.uint8).reshape(-1, H, W, 3)
reg = frames(SHAPE)[:, Y0:Y1, X0:X1].astype(np.float32)
mn = np.percentile(reg.mean(3), 10, axis=0); hp = mn - cv2.GaussianBlur(mn, (0, 0), 12)
m = (hp > 5).astype(np.uint8); n, lab, st, _ = cv2.connectedComponentsWithStats(m); k = 1 + int(np.argmax(st[1:, 4]))
star = cv2.morphologyEx((lab == k).astype(np.uint8), cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
hole = cv2.dilate(star, np.ones((9, 9), np.uint8))                                  # star plus its soft rim
feather = cv2.GaussianBlur(cv2.dilate(hole, np.ones((5, 5), np.uint8)).astype(np.float32), (0, 0), 2)[..., None]
enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", FPS, "-i", "-", "-i", IN,
                        "-map", "0:v", "-map", "1:a?", "-c:v", "libx264", "-preset", "slow", "-crf", "14", "-pix_fmt", "yuv420p", "-c:a", "copy", OUT], stdin=subprocess.PIPE)
for f in frames(IN):
    f = f.copy(); r = f[Y0:Y1, X0:X1]
    fill = cv2.inpaint(r, hole, 9, cv2.INPAINT_TELEA).astype(np.float32)
    f[Y0:Y1, X0:X1] = np.clip(r * (1 - feather) + fill * feather, 0, 255).astype(np.uint8); enc.stdin.write(f.tobytes())
enc.stdin.close(); enc.wait(); print("wrote", OUT)
