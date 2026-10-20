#!/usr/bin/env bash
# Rebuilds the wedding reel. Usage: ./build.sh RAW_DIR   (RAW_DIR holds the 8 Drive clips renamed c1.mp4 ... c8.mp4, in Drive-listing order)
set -euo pipefail
RAW=${1:?raw clip dir}; cd "$(dirname "$0")"; W=$(mktemp -d)
python3 make_music.py "$W/score.wav"
for r in "0 210" "210 420" "420 630" "630 840"; do set -- $r; python3 render_reel.py "$RAW" "$W/c$1.mp4" $1 $2 & done; wait
printf "file '$W/c0.mp4'\nfile '$W/c210.mp4'\nfile '$W/c420.mp4'\nfile '$W/c630.mp4'\n" > "$W/list.txt"
ffmpeg -y -f concat -safe 0 -i "$W/list.txt" -c copy "$W/v.mp4"
ffmpeg -y -i "$W/v.mp4" -i "$W/score.wav" -filter_complex "[1:a]loudnorm=I=-14:TP=-1.5:LRA=11,afade=t=out:st=27.2:d=0.8[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -ar 48000 -movflags +faststart -t 28 output/shaadi_mangalam_wedding_reel.mp4
