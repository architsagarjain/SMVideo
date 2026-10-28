#!/usr/bin/env bash
# Rebuild the Diwali animation from assets/poster.webp:  ./build.sh
# Needs: python3 with numpy, scipy, opencv-python-headless, pillow; ffmpeg with libx264 + aac.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output .work
python3 src/music.py .work/music.wav
python3 src/render.py .work/silent.mp4
ffmpeg -y -loglevel error -i .work/silent.mp4 -i .work/music.wav \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -ar 44100 -t 10.000 -movflags +faststart \
  output/pandit_crane_diwali_1080x1350.mp4
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,duration -of default=nw=1 output/pandit_crane_diwali_1080x1350.mp4
