"""Separate the speaker from the background with Robust Video Matting (RVM).

Writes a grayscale alpha matte video (same size/fps as the input) that the
Remotion project uses to put graphics *behind* her head.
Usage: matte.py <RVM code dir> <weights.pth> <in.mp4> <out_alpha.mp4> [max_frames]
"""
import sys, time, subprocess
import numpy as np, torch, cv2

code, weights, src, out = sys.argv[1:5]
limit = int(sys.argv[5]) if len(sys.argv) > 5 else None
sys.path.insert(0, code)
from model import MattingNetwork

variant = 'resnet50' if 'resnet50' in weights else 'mobilenetv3'
model = MattingNetwork(variant).eval()
model.load_state_dict(torch.load(weights, map_location='cpu'))
torch.set_num_threads(4)

cap = cv2.VideoCapture(src)
w, h = int(cap.get(3)), int(cap.get(4))
ff = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'gray', '-s', f'{w}x{h}', '-r', '30', '-i', '-',
                       '-c:v', 'libx264', '-crf', '8', '-pix_fmt', 'yuv420p', out], stdin=subprocess.PIPE)
rec = [None] * 4
n, t0 = 0, time.time()
with torch.no_grad():
    while True:
        ok, im = cap.read()
        if not ok or (limit and n >= limit):
            break
        x = torch.from_numpy(cv2.cvtColor(im, cv2.COLOR_BGR2RGB)).permute(2, 0, 1).float().div(255).unsqueeze(0)
        fgr, pha, *rec = model(x, *rec, downsample_ratio=0.4)
        a = (pha[0, 0].clamp(0, 1).numpy() * 255).astype(np.uint8)
        ff.stdin.write(a.tobytes())
        n += 1
        if n % 100 == 0:
            print(n, f'{(time.time() - t0) / n:.2f}s/frame', flush=True)
ff.stdin.close(); ff.wait()
print('done', n, f'{(time.time() - t0) / max(n, 1):.2f}s/frame')
