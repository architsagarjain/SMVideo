#!/bin/bash
# Final renders of the reels: 1080x1920 picture (muted) -> two-pass x264 8 Mbps + the reel's mix (AAC 320k).
# Usage: ./build_reels.sh [reel1|reel2 ...]   (default: both)
set -e
cd "$(dirname "$0")"
declare -A COMP=([reel1]=Reel1-CoFiring [reel2]=Reel2-TenderWords)
declare -A NAME=([reel1]=IndiaBiomass_Reel1_CoFiring [reel2]=IndiaBiomass_Reel2_TenderWords)
mkdir -p output film/out
for R in "${@:-reel1 reel2}"; do
  for r in $R; do
    echo "== $r"
    (cd film && npx remotion render src/index.ts ${COMP[$r]} out/${r}_picture.mp4 --muted --log=error \
      --codec=h264 --crf=16 --pixel-format=yuv420p --concurrency=4)
    P=$(mktemp -d)/x264
    ffmpeg -y -loglevel error -i film/out/${r}_picture.mp4 -c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p \
      -b:v 8M -maxrate 12M -bufsize 16M -pass 1 -passlogfile "$P" -an -f mp4 /dev/null
    ffmpeg -y -loglevel error -i film/out/${r}_picture.mp4 -i reels/audio/${r}_mix.wav -map 0:v -map 1:a \
      -c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p -b:v 8M -maxrate 12M -bufsize 16M -pass 2 -passlogfile "$P" \
      -c:a aac -b:a 320k -ar 48000 -ac 2 -movflags +faststart -shortest output/${NAME[$r]}.mp4
    python3 - "$r" "${NAME[$r]}" <<'PY'
import json, sys
r, name = sys.argv[1:]
cues = json.load(open(f'film/src/data/{r}.json'))['cues']
ts = lambda fr: '%02d:%02d:%02d,%03d' % (0, int(fr / 30) // 60, int(fr / 30) % 60, round((fr / 30 % 1) * 1000))
open(f'output/{name}.srt', 'w').write('\n'.join(f'{i}\n{ts(c["s"])} --> {ts(c["e"])}\n{c["t"]}\n' for i, c in enumerate(cues, 1)))
PY
    ffprobe -v error -show_entries format=duration,size:stream=codec_name,width,height,r_frame_rate -of compact output/${NAME[$r]}.mp4
  done
done
