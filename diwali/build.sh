#!/usr/bin/env bash
# Rebuilds the animated Diwali poster video: clean sky plate -> soundtrack -> frames -> mp4.
# Needs python3 with numpy + opencv-python-headless, and ffmpeg (libx264, aac).
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output
python3 prep.py                       # removes the baked-in text from source.webp -> clean_plate.png
python3 music.py output/soundtrack.wav
python3 render.py output/express_cranes_diwali.mp4 output/soundtrack.wav
