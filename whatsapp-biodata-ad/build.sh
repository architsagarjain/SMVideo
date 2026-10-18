#!/usr/bin/env bash
# Builds the Shaadi Mangalam "Registration Fee? Ab Nahi." WhatsApp biodata ad:
#   output/ShaadiMangalam_WhatsApp_Biodata_Ad.mp4   1080x1920, 30 fps, H.264 + AAC, -14 LUFS
#   output/captions.srt                             the Hinglish captions as a sidecar file
# Needs: ffmpeg, python3 (numpy, pillow, mido), fluidsynth + FluidR3_GM soundfont, node + npm.
set -euo pipefail
cd "$(dirname "$0")"

VO=voiceover/vo_monika_take1_raw.mp3
OUT=output/ShaadiMangalam_WhatsApp_Biodata_Ad.mp4
SF2=${SF2:-/usr/share/sounds/sf2/FluidR3_GM.sf2}
TOTAL=29.5        # must match TOTAL in src/theme.ts
VO_END=27.68      # last word of the voiceover ends here
mkdir -p build output public/brand

BROWSER_ARGS=()
for b in "${REMOTION_BROWSER:-}" /opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell; do
  if [[ -n "$b" && -x "$b" ]]; then BROWSER_ARGS=(--browser-executable="$b"); break; fi
done

echo "== 1/5 Brand assets and captions"
python3 scripts/make_brand_assets.py assets/logo_original.png public/brand
python3 scripts/make_captions.py > /dev/null

echo "== 2/5 Music: compose and render the original score"
python3 scripts/compose_music.py build/score.mid
fluidsynth -ni -q -r 48000 -g 0.6 -R 1 -C 1 -o synth.reverb.room-size=0.7 -o synth.reverb.width=0.9 \
  -o synth.reverb.level=0.55 -F build/score_raw.wav "$SF2" build/score.mid
# MIDI time 0 is 0.6 s before the picture starts (see compose_music.py).
ffmpeg -v error -y -ss 0.6 -t $TOTAL -i build/score_raw.wav build/score.wav

echo "== 3/5 Picture: render the Remotion composition"
npx remotion render src/index.ts Ad build/picture_master.mov "${BROWSER_ARGS[@]}" \
  --codec=prores --prores-profile=hq --image-format=png --color-space=bt709 --muted --concurrency=4 --log=error

echo "== 4/5 Sound: voice, ducked music bed, one soft 'sent' pop"
# Voice: rumble filter + light compression (clean studio-quality TTS; no noise reduction).
VOICE="[0:a]aresample=48000,aformat=channel_layouts=stereo,highpass=f=70,acompressor=threshold=-22dB:ratio=2:attack=8:release=120:makeup=1,apad,atrim=0:$TOTAL[v]"
# Music: sits ~15 LU under the voice (voice -23.8 LUFS raw, score body -31.4 LUFS raw),
# then rises 5 dB once the last word ends and fades out over the last 1.2 s.
RA=$(awk -v e=$VO_END 'BEGIN{print e+0.05}'); RB=$(awk -v e=$VO_END 'BEGIN{print e+0.6}')
FADE_ST=$(awk -v t=$TOTAL 'BEGIN{print t-1.2}')
P="clip((t-$RA)/($RB-$RA),0,1)"
MUSIC="[1:a]highpass=f=55,highpass=f=55,equalizer=f=2800:t=o:w=1.4:g=-3,\
volume='pow(10,(-7.5+5*$P*$P*(3-2*$P))/20)':eval=frame,afade=t=in:st=0:d=0.5:curve=qsin,afade=t=out:st=$FADE_ST:d=1.2:curve=qsin[m]"
# "Sent" pop as the biodata bubble lands in the chat (16.95 s): a short rising sine blip.
POP="aevalsrc='0.5*sin(2*PI*(700*t+2600*t*t))*exp(-45*t)':s=48000:d=0.12,aformat=channel_layouts=stereo,adelay=16950|16950,apad,atrim=0:$TOTAL,volume=-14dB[p]"
MIX="$VOICE;$MUSIC;$POP;[v][m][p]amix=inputs=3:normalize=0:duration=first[mix]"
MEAS=$(ffmpeg -hide_banner -nostats -i "$VO" -i build/score.wav -filter_complex "$MIX;[mix]loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json[out]" \
  -map "[out]" -f null - 2>&1 | sed -n '/^{/,/^}/p')
get() { echo "$MEAS" | grep "\"$1\"" | sed -E 's/.*: "([^"]+)".*/\1/'; }
ffmpeg -v error -y -i "$VO" -i build/score.wav -filter_complex "$MIX;[mix]loudnorm=I=-14:TP=-1.5:LRA=11:\
measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):\
offset=$(get target_offset):linear=true,aresample=48000[out]" -map "[out]" -c:a pcm_s24le build/mix.wav

echo "== 5/5 Final encode"
ffmpeg -v error -y -i build/picture_master.mov -i build/mix.wav -map 0:v -map 1:a \
  -c:v libx264 -preset slow -crf 17 -profile:v high -level 4.2 -pix_fmt yuv420p -r 30 -g 60 -bf 2 \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv \
  -c:a aac -b:a 256k -ar 48000 -ac 2 -t $TOTAL -movflags +faststart "$OUT"
echo "Done: $OUT"
