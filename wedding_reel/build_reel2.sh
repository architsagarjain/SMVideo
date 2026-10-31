#!/usr/bin/env bash
# Rebuilds reel 2 ("quiet to colour", 1080x1920, 60 fps, 22.1 s).
# Usage: ./build_reel2.sh CLIP_DIR SONG.mp3
#   CLIP_DIR holds the five new Drive clips renamed c1..c5.mp4:
#     c1 clicksunlimitedphotography, c2 Flora_13, c3 make_my_wedd, c4 Neerajeditx, c5 zeenatvogue_clothing
#   SONG.mp3 is "Din Shagna Da".
set -euo pipefail
RAW=${1:?clip dir}; SONG=${2:?song mp3}; cd "$(dirname "$0")"; W=$(mktemp -d)
ffmpeg -v error -y -i "$SONG" -ac 2 -ar 44100 "$W/song.wav"
python3 make_audio6.py "$W/song.wav" "$W/mix.wav"
N=$(python3 -c "from plan6 import NFRAMES; print(NFRAMES)"); Q=$(( (N + 3) / 4 ))
for i in 0 1 2 3; do a=$((i*Q)); b=$(( (i+1)*Q )); [ $b -gt $N ] && b=$N; python3 render6.py "$RAW" "$W/c$a.mp4" $a $b & done; wait
for i in 0 1 2 3; do echo "file '$W/c$((i*Q)).mp4'"; done > "$W/list.txt"
ffmpeg -v error -y -f concat -safe 0 -i "$W/list.txt" -c copy "$W/v.mp4"
mkdir -p output
ffmpeg -y -i "$W/v.mp4" -i "$W/mix.wav" -filter_complex "[1:a]loudnorm=I=-14:TP=-1.5:LRA=11,afade=t=out:st=21.73:d=0.35[a]" \
  -map 0:v -map "[a]" -c:v libx264 -preset slow -crf 19 -maxrate 22M -bufsize 44M -pix_fmt yuv420p -profile:v high -c:a aac -b:a 192k -ar 48000 -movflags +faststart output/shaadi_mangalam_reel2_quiet_to_colour.mp4
