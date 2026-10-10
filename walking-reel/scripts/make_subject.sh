#!/usr/bin/env bash
# Cut the speaker out of the graded footage using the RVM alpha matte, as a
# VP9 WebM with alpha. Remotion draws it above the "behind" graphics layer.
# Usage: scripts/make_subject.sh public/footage_clean_1080.mp4 footage/alpha_720.mp4 public/subject_1080.webm
set -euo pipefail
FOOT=$1; ALPHA=$2; OUT=$3
ffmpeg -v error -y -i "$FOOT" -i "$ALPHA" -filter_complex \
  "[1:v]scale=1080:1920:flags=bicubic,format=gray,lutyuv=y='clip((val-10)*1.04,0,255)'[a];[0:v][a]alphamerge,format=yuva420p[v]" \
  -map "[v]" -c:v libvpx-vp9 -pix_fmt yuva420p -crf 22 -b:v 0 -deadline good -cpu-used 4 -row-mt 1 -threads 4 -auto-alt-ref 0 "$OUT"
