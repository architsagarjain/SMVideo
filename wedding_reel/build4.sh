#!/usr/bin/env bash
# Rebuilds the v4 reel (1080x1920, 60 fps).
# Usage: ./build4.sh RAW_DIR SONG.mp3
#   RAW_DIR holds the Drive clips renamed c1.mp4 ... c8.mp4 (Drive-listing order); SONG.mp3 is "Where's The Party Tonight".
set -euo pipefail
RAW=${1:?raw clip dir}; SONG=${2:?song mp3}; cd "$(dirname "$0")"; W=$(mktemp -d)
ffmpeg -v error -y -i "$SONG" -ac 2 -ar 44100 "$W/song.wav"
python3 make_audio4.py "$W/song.wav" "$W/mix.wav"
N=$(python3 -c "from plan4 import NFRAMES; print(NFRAMES)"); Q=$(( (N + 3) / 4 ))
for i in 0 1 2 3; do a=$((i*Q)); b=$(( (i+1)*Q )); [ $b -gt $N ] && b=$N; python3 render4.py "$RAW" "$W/c$a.mp4" $a $b & done; wait
for i in 0 1 2 3; do echo "file '$W/c$((i*Q)).mp4'"; done > "$W/list.txt"
ffmpeg -v error -y -f concat -safe 0 -i "$W/list.txt" -c copy "$W/v.mp4"
mkdir -p output
ffmpeg -y -i "$W/v.mp4" -i "$W/mix.wav" -filter_complex "[1:a]loudnorm=I=-14:TP=-1.5:LRA=11,afade=t=out:st=30.05:d=0.35[a]" \
  -map 0:v -map "[a]" -c:v libx264 -preset slow -crf 19 -maxrate 22M -bufsize 44M -pix_fmt yuv420p -profile:v high -c:a aac -b:a 192k -ar 48000 -movflags +faststart output/shaadi_mangalam_reel_v4.mp4
