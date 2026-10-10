#!/usr/bin/env bash
# Builds the Shaadi Mangalam "Relationship Manager" reel end to end:
#   output/ShaadiMangalam_RM_Reel_final.mp4   1080x1920, 30 fps, H.264 High + AAC, -14 LUFS
#   output/captions.srt                       caption file (same text and timing as the burned-in captions)
# Needs: ffmpeg, python3 (numpy, opencv-python-headless, pillow, mido), fluidsynth with
# the FluidR3_GM soundfont, node + npm (Remotion). See README.md.
set -euo pipefail
cd "$(dirname "$0")"

SRC=assets/SM_Reel_source.mp4
OUT=output/ShaadiMangalam_RM_Reel_final.mp4
SF2=${SF2:-/usr/share/sounds/sf2/FluidR3_GM.sf2}
TOTAL=26.2            # must match TOTAL in src/timeline.ts
ES_START=21.2         # end-screen dissolve start (src/timeline.ts)
mkdir -p build output

# Chromium for Remotion: use the environment's headless shell if there is one, otherwise
# let Remotion download its own.
BROWSER_ARGS=()
for b in "${REMOTION_BROWSER:-}" /opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell; do
  if [[ -n "$b" && -x "$b" ]]; then BROWSER_ARGS=(--browser-executable="$b"); break; fi
done

echo "== 1/6 End-screen layers and captions"
python3 scripts/make_endscreen_layers.py assets/end_screen_original.webp public/endscreen
python3 scripts/make_captions.py

echo "== 2/6 Colour: warm the cooler office shot (frames 190-347) to sit with the golden-hour shots"
GRADE="colorbalance=rm=0.03:gm=0.005:bm=-0.035:rh=0.02:bh=-0.025:enable='between(n,190,347)',eq=brightness=0.018:contrast=1.02:saturation=1.05:enable='between(n,190,347)'"
ffmpeg -v error -y -i "$SRC" -an -vf "$GRADE" -c:v libx264 -preset medium -crf 4 -pix_fmt yuv420p \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv public/source_graded.mp4

echo "== 3/6 Music: compose and render the original score"
python3 scripts/compose_music.py build/score.mid
fluidsynth -ni -q -r 48000 -g 0.6 -R 1 -C 1 -o synth.reverb.room-size=0.75 -o synth.reverb.width=0.9 \
  -o synth.reverb.level=0.6 -F build/score_raw.wav "$SF2" build/score.mid

echo "== 4/6 Picture: render the Remotion composition (ProRes HQ master, no audio)"
npx remotion render src/index.ts Reel build/picture_master.mov "${BROWSER_ARGS[@]}" \
  --codec=prores --prores-profile=hq --image-format=png --color-space=bt709 --muted --concurrency=4 --log=error

echo "== 5/6 Sound: voice + ducked music bed, loudness-normalised"
# Voice: rumble filter and a light, transparent compressor (the VO is already clean;
# no noise reduction needed - noise floor is below -75 dBFS).
VOICE="[0:a]aresample=48000,aformat=channel_layouts=stereo,highpass=f=70,acompressor=threshold=-20dB:ratio=2:attack=8:release=120:makeup=1,apad,atrim=0:$TOTAL[v]"
# Music: remove sub rumble, open a small pocket around voice presence, then ride the
# level (a smooth automation curve rather than a pumping compressor): fade in over
# 0.8 s, sit ~15 LU under the voice while she speaks (measured: voice -20.2 LUFS,
# score body -31.4 LUFS raw), rise by 6.6 dB into the end screen as the voice stops,
# and fade out over the last 1.7 s.
G_BODY=-3.6; G_END=3.0
RA=$(awk -v s=$ES_START 'BEGIN{print s+0.05}'); RB=$(awk -v s=$ES_START 'BEGIN{print s+0.9}')
FADE_ST=$(awk -v t=$TOTAL 'BEGIN{print t-1.7}')
P="clip((t-$RA)/($RB-$RA),0,1)"
MUSIC="[1:a]atrim=0:$TOTAL,asetpts=PTS-STARTPTS,highpass=f=55,highpass=f=55,equalizer=f=2800:t=o:w=1.4:g=-3,\
volume='pow(10,($G_BODY+($G_END-($G_BODY))*$P*$P*(3-2*$P))/20)':eval=frame,\
afade=t=in:st=0:d=0.8:curve=qsin,afade=t=out:st=$FADE_ST:d=1.7:curve=qsin[m]"
MIX="$VOICE;$MUSIC;[v][m]amix=inputs=2:normalize=0:duration=first[mix]"
MEAS=$(ffmpeg -hide_banner -nostats -i "$SRC" -i build/score_raw.wav -filter_complex "$MIX;[mix]loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json[out]" \
  -map "[out]" -f null - 2>&1 | sed -n '/^{/,/^}/p')
get() { echo "$MEAS" | grep "\"$1\"" | sed -E 's/.*: "([^"]+)".*/\1/'; }
ffmpeg -v error -y -i "$SRC" -i build/score_raw.wav -filter_complex "$MIX;[mix]loudnorm=I=-14:TP=-1.5:LRA=11:\
measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):\
offset=$(get target_offset):linear=true,aresample=48000[out]" -map "[out]" -c:a pcm_s24le build/mix.wav

echo "== 6/6 Final encode"
ffmpeg -v error -y -i build/picture_master.mov -i build/mix.wav -map 0:v -map 1:a \
  -c:v libx264 -preset slow -crf 16 -profile:v high -level 4.2 -pix_fmt yuv420p -r 30 -g 60 -bf 2 \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv \
  -c:a aac -b:a 256k -ar 48000 -ac 2 -t $TOTAL -movflags +faststart "$OUT"
echo "Done: $OUT"
