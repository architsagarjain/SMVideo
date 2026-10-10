#!/usr/bin/env bash
# Technical QC of the exported reel: format, loudness, true peak, black/frozen frames,
# sync check (voice in the export vs the source), and a contact sheet for visual review.
# Usage: scripts/qc.sh [file] [contact-sheet.png]
set -euo pipefail
cd "$(dirname "$0")/.."
F=${1:-output/ShaadiMangalam_RM_Reel_final.mp4}
SHEET=${2:-build/qc_contact.png}

echo "-- streams"
ffprobe -v error -show_entries stream=codec_name,profile,width,height,r_frame_rate,pix_fmt,color_space,sample_rate,channels,bit_rate \
  -show_entries format=duration,size,bit_rate -of default=nw=1 "$F"
echo "-- loudness"
ffmpeg -hide_banner -nostats -i "$F" -af ebur128=peak=true -f null - 2>&1 | sed -n '/Summary/,$p' | grep -E "I:|LRA:|Peak:"
echo "-- black frames (none expected)"
ffmpeg -hide_banner -nostats -i "$F" -vf blackdetect=d=0.05:pix_th=0.08 -an -f null - 2>&1 | grep -o "black_start.*" || echo "none"
echo "-- frozen frames longer than 0.5 s before the end screen (none expected)"
ffmpeg -hide_banner -nostats -t 21.2 -i "$F" -vf freezedetect=n=0.001:d=0.5 -an -f null - 2>&1 | grep -o "freeze_start.*" || echo "none"
echo "-- sync: cross-correlate the export's audio with the source voice (lag should be 0 ms)"
python3 - "$F" assets/SM_Reel_source.mp4 <<'EOF'
import subprocess, sys, numpy as np
def pcm(f):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", f, "-t", "20", "-ac", "1", "-ar", "8000", "-f", "s16le", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.int16).astype(float)
a, b = pcm(sys.argv[1]), pcm(sys.argv[2])
n = min(len(a), len(b)); a, b = a[:n], b[:n]
lags = range(-400, 401)
c = [np.dot(a[max(0, l):n + min(0, l)], b[max(0, -l):n - max(0, l)]) for l in lags]
print("lag: %.1f ms" % (lags[int(np.argmax(c))] / 8.0))
EOF
ffmpeg -v error -y -i "$F" -vf "fps=1,scale=216:384,tile=9x3:padding=4" -frames:v 1 "$SHEET"
echo "contact sheet: $SHEET"
