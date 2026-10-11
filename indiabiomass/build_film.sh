#!/bin/bash
# Rebuild the IndiaBiomass brand film end to end.
#   1. prep footage clips (9:16, 30 fps) from footage/raw
#   2. narration + subtitle cues, score, sound design + mix
#   3. render picture with Remotion, then mux the final mix (AAC 320k)
set -euo pipefail
cd "$(dirname "$0")"
VOICE=${VOICE:-prabhat}

python3 film/scripts/prep_footage.py
python3 audio/scripts/build_vo.py "$VOICE"
python3 audio/scripts/score.py
python3 audio/scripts/mix.py

(cd film && npx remotion render src/index.ts BrandFilm out/picture.mp4 --log=error \
  --codec=h264 --crf=16 --pixel-format=yuv420p --concurrency=4)

mkdir -p output
# delivery encode: two-pass x264 High @ 8 Mbps (social-platform friendly, ~60 MB)
P=$(mktemp -d)/x264
ffmpeg -y -loglevel error -i film/out/picture.mp4 -c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p \
  -b:v 8M -maxrate 12M -bufsize 16M -pass 1 -passlogfile "$P" -an -f mp4 /dev/null
ffmpeg -y -loglevel error -i film/out/picture.mp4 -i audio/final_mix.wav -map 0:v -map 1:a \
  -c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p -b:v 8M -maxrate 12M -bufsize 16M -pass 2 -passlogfile "$P" \
  -c:a aac -b:a 320k -ar 48000 -ac 2 -movflags +faststart -t 60 output/IndiaBiomass_BrandFilm_60s.mp4
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height,r_frame_rate \
  -of compact output/IndiaBiomass_BrandFilm_60s.mp4

python3 scripts/make_srt.py
python3 scripts/make_manifest.py
