#!/usr/bin/env bash
# Trim, auto-rotate (phone rotation flag), fill-crop to 1080x1920, light grade, drop audio.
# Usage: prep_broll_series.sh <src> <start> <dur> <out>
set -euo pipefail
G="eq=contrast=1.04:saturation=1.03"
ffmpeg -v error -y -ss "$2" -t "$3" -i "$1" -an -vf \
  "scale=1080:1920:force_original_aspect_ratio=increase:flags=lanczos,crop=1080:1920,$G,fps=30" \
  -c:v libx264 -preset slow -crf 14 -pix_fmt yuv420p "$4"
