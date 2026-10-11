#!/bin/bash
# Usage: scripts/sheet.sh out.jpg frame...   -> labelled contact sheet of stills
set -e
OUT=$1; shift
D=$(mktemp -d)
node scripts/stills.mjs $D "$@" > /dev/null
cd $D
montage -label '%f' -font DejaVu-Sans -pointsize 28 f*.jpg -tile 6x -geometry 360x640+6+6 -background '#222' -fill white "$OUT"
rm -rf $D
echo "$OUT"
