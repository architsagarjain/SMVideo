#!/bin/bash
# Final renders: 1080x1920 picture (muted, CRF 16) -> two-pass x264 High 8 Mbps + the video's mix (AAC 320k),
# plus an .srt sidecar and a <30 MB share copy for chat. usage: ./finals.sh [n ...]
cd "$(dirname "$0")/../film"
declare -A SLUG=([1]=OneBalesJourney [2]=FourMyths [3]=PelletOrBriquette [4]=BiomassMapOfIndia [5]=WhatBuyersCheck [6]=TheHarvestWindow [7]=GuessTheBiomass [8]=WhyWereBuilding)
OUT=../reels8/output; SHARE=../reels8/output/share; mkdir -p $OUT $SHARE
for n in ${@:-1 2 3 4 5 6 7 8}; do
  T=$(mktemp -d); NAME=IndiaBiomass_Video${n}_${SLUG[$n]}
  npx remotion render src/index.ts Video$n $T/pic.mp4 --muted --log=error --codec=h264 --crf=16 --pixel-format=yuv420p --concurrency=4 > $T/log 2>&1 || { echo "FAIL Video$n"; grep -iv memory $T/log | tail -5; rm -rf "${T:?}"; continue; }
  P=$T/x264
  ffmpeg -y -loglevel error -i $T/pic.mp4 -c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p -b:v 8M -maxrate 12M -bufsize 16M -pass 1 -passlogfile $P -an -f mp4 /dev/null
  ffmpeg -y -loglevel error -i $T/pic.mp4 -i ../reels8/audio/mix/v${n}_mix.wav -map 0:v -map 1:a -c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p -b:v 8M -maxrate 12M -bufsize 16M -pass 2 -passlogfile $P \
    -c:a aac -b:a 320k -ar 48000 -ac 2 -movflags +faststart -shortest $OUT/$NAME.mp4
  dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $OUT/$NAME.mp4)
  vb=$(python3 -c "print(int((27.5*8*1024/$dur) - 200))")k   # share copy sized to ~27.5 MB
  ffmpeg -y -loglevel error -i $OUT/$NAME.mp4 -c:v libx264 -preset slow -b:v $vb -pass 1 -passlogfile $P -an -f mp4 /dev/null
  ffmpeg -y -loglevel error -i $OUT/$NAME.mp4 -c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p -b:v $vb -pass 2 -passlogfile $P -c:a aac -b:a 160k -movflags +faststart $SHARE/$NAME.mp4
  python3 - "$n" "$OUT/$NAME.srt" <<'PY'
import json, sys
n, out = sys.argv[1:]
d = json.load(open(f'src/data/r8/v{n}.json')); end = d['words'][-1]['e'] + 4
ts = lambda fr: '%02d:%02d:%02d,%03d' % (0, int(fr / 30) // 60, int(fr / 30) % 60, round((fr / 30 % 1) * 1000))
cues = [c for c in d['cues'] if c['s'] < end]
open(out, 'w').write('\n'.join(f"{i}\n{ts(c['s'])} --> {ts(min(c['e'], end))}\n{c['t']}\n" for i, c in enumerate(cues, 1)))
PY
  rm -rf "${T:?}"
  echo "ok Video$n $(du -h $OUT/$NAME.mp4 | cut -f1) share $(du -h $SHARE/$NAME.mp4 | cut -f1) $(printf %.1f $dur)s"
done
