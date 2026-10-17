#!/bin/bash
# Quick review drafts: half resolution, muted render + the video's mix. usage: ./drafts.sh [n ...]
cd "$(dirname "$0")/../film"
for n in ${@:-1 2 3 4 5 6 7 8}; do
  T=$(mktemp -d)
  npx remotion render src/index.ts Video$n $T/v.mp4 --scale=0.5 --crf=24 --muted --log=error --concurrency=4 > $T/log 2>&1 || { echo "FAIL Video$n"; grep -iv "memory" $T/log | tail -5; continue; }
  ffmpeg -y -v error -i $T/v.mp4 -i ../reels8/audio/mix/v${n}_mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 160k -shortest ../reels8/previews/Video${n}_draft.mp4
  rm -rf $T; echo "ok Video$n $(du -h ../reels8/previews/Video${n}_draft.mp4 | cut -f1)"
done
