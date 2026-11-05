#!/bin/bash
# usage: final_hi.sh <n> <Slug>   -> renders VideoNHinglish full res, two-pass 8 Mbps + mix, share copy, English .srt
set -e
n=$1; SLUG=$2
cd /home/user/SMVideo/indiabiomass/film
W=/tmp/claude-0/-home-user-SMVideo/dea5613d-59d0-569e-9e5f-fab7f2a5b5e9/scratchpad/v${n}hi_final; mkdir -p "$W"
npx remotion render src/index.ts Video${n}Hinglish "$W/pic.mp4" --muted --log=error --codec=h264 --crf=16 --pixel-format=yuv420p --concurrency=4 2>&1 | grep -v -i memory || true
cd ..
NAME=IndiaBiomass_Video${n}_${SLUG}_Hinglish; O=reels8/output/$NAME.mp4; S=reels8/output/share/$NAME.mp4; P="$W/x264"
ffmpeg -y -loglevel error -i "$W/pic.mp4" -c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p -b:v 8M -maxrate 12M -bufsize 16M -pass 1 -passlogfile "$P" -an -f mp4 /dev/null
ffmpeg -y -loglevel error -i "$W/pic.mp4" -i reels8/audio/mix/v${n}hi_mix.wav -map 0:v -map 1:a -c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p -b:v 8M -maxrate 12M -bufsize 16M -pass 2 -passlogfile "$P" -c:a aac -b:a 320k -ar 48000 -ac 2 -movflags +faststart -shortest "$O"
dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$O"); vb=$(python3 -c "print(int((27.5*8*1024/$dur) - 200))")k
ffmpeg -y -loglevel error -i "$O" -c:v libx264 -preset slow -b:v $vb -pass 1 -passlogfile "$P" -an -f mp4 /dev/null
ffmpeg -y -loglevel error -i "$O" -c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p -b:v $vb -pass 2 -passlogfile "$P" -c:a aac -b:a 160k -movflags +faststart "$S"
python3 - "$n" "reels8/output/$NAME.srt" <<'PY'
import json, sys
n, out = sys.argv[1:]
d = json.load(open(f'film/src/data/r8/v{n}hi.json')); end = d['words'][-1]['e'] + 4
ts = lambda fr: '%02d:%02d:%02d,%03d' % (0, int(fr / 30) // 60, int(fr / 30) % 60, round((fr / 30 % 1) * 1000))
cues = [c for c in d['cues'] if c['s'] < end]
open(out, 'w').write('\n'.join(f"{i}\n{ts(c['s'])} --> {ts(min(c['e'], end))}\n{c['t']}\n" for i, c in enumerate(cues, 1)))
PY
echo "ok Video${n}Hinglish $(du -h $O | cut -f1) share $(du -h $S | cut -f1) ${dur}s"
