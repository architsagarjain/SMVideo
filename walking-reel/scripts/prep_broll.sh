#!/usr/bin/env bash
# Trim + crop the cutaway clips to 1080x1920 (audio dropped).
# Mixkit clips: Mixkit Stock Video Free License (commercial use, no attribution).
set -euo pipefail
cd "$(dirname "$0")/.."
# the Mixkit originals are not kept in git; fetch them if missing
fetch() { [ -f "$2" ] || curl -sfL -A "Mozilla/5.0" -o "$2" "https://assets.mixkit.co/videos/$1/$1-1080.mp4"; }
fetch 4893 footage/broll/mixkit_4893_footsteps.mp4
fetch 4401 footage/broll/mixkit_4401_shibuya.mp4
fetch 4629 footage/broll/mixkit_4629_sunset_walk.mp4
G="eq=contrast=1.04:saturation=1.02"
cut() { # src start dur cropx(0-1 centre) out
  ffmpeg -v error -y -ss "$2" -t "$3" -i "$1" -an -vf \
    "crop=ih*9/16:ih:(iw-ih*9/16)*$4:0,scale=1080:1920:flags=lanczos,$G,fps=30" \
    -c:v libx264 -preset slow -crf 14 -pix_fmt yuv420p "$5"
}
cut footage/broll/mixkit_4893_footsteps.mp4   0.6 2.8 0.50 public/broll/walking.mp4
cut footage/broll/mixkit_4401_shibuya.mp4     3.0 2.8 0.45 public/broll/shibuya.mp4
cut footage/broll/mixkit_4629_sunset_walk.mp4 0.4 4.6 0.70 public/broll/sunset_walk.mp4
ffmpeg -v error -y -ss 1.5 -t 2.4 -i footage/broll/user_treadmill.mp4 -an -vf "scale=1080:1920:flags=lanczos,$G,fps=30" \
  -c:v libx264 -preset slow -crf 14 -pix_fmt yuv420p public/broll/treadmill.mp4
