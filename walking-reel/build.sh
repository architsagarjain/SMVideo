#!/usr/bin/env bash
# Rebuild the edited reel from the source video.
#
#   ./build.sh path/to/source.mp4            full rebuild (caption cleanup takes ~35 min on 4 cores)
#   ./build.sh path/to/source.mp4 --skip-clean   reuse footage/clean_720.mp4
#
# Needs: node 18+, ffmpeg, python3 with numpy, scipy, opencv-python-headless, pillow.
# Chromium: set REMOTION_BROWSER to a headless Chrome/Chromium binary if Remotion
# cannot download its own.
set -euo pipefail
cd "$(dirname "$0")"

SRC=${1:?usage: ./build.sh source.mp4 [--skip-clean]}
SKIP_CLEAN=${2:-}
mkdir -p out footage

if [[ "$SKIP_CLEAN" != "--skip-clean" ]]; then
  echo "== 1/5 removing the old burned-in captions"
  python3 scripts/scan_pink.py "$SRC" analysis/old_caption_bbox.json
  rm -rf out/roi && mkdir -p out/roi
  N=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$SRC")
  Q=$(( (N + 3) / 4 ))
  for i in 0 1 2 3; do
    python3 scripts/clean_captions.py "$SRC" out/roi range $((i * Q)) $(( (i + 1) * Q < N ? (i + 1) * Q : N )) &
  done
  wait
  python3 scripts/compose_clean.py "$SRC" out/roi footage/clean_720.mp4
fi

echo "== 2/5 upscaling the clean footage to 1080x1920"
ffmpeg -v error -y -i footage/clean_720.mp4 -vf "scale=1080:1920:flags=lanczos" \
  -c:v libx264 -preset slow -crf 10 -pix_fmt yuv420p -an public/footage_clean_1080.mp4

echo "== 3/5 caption data"
python3 scripts/build_captions.py > /dev/null

echo "== 4/5 rendering graphics + footage (Remotion)"
npm install --no-audit --no-fund > /dev/null
npx remotion render WalkingReel out/video_only.mp4 --muted ${REMOTION_BROWSER:+--browser-executable="$REMOTION_BROWSER"}

echo "== 5/5 sound design, mix and final encode"
python3 scripts/make_audio.py "$SRC" out/mix.wav
ffmpeg -v error -y -i out/video_only.mp4 -i out/mix.wav -map 0:v -map 1:a \
  -c:v libx264 -preset slow -crf 16 -profile:v high -level 4.2 -pix_fmt yuv420p -r 30 \
  -c:a aac -b:a 320k -ar 48000 -movflags +faststart -shortest ../output/walking_reel_final.mp4
echo "done: ../output/walking_reel_final.mp4"
