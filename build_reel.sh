#!/usr/bin/env bash
# Builds the Shaadi Mangalam reel from clips/1-4.mp4:
#   output/shaadi_mangalam_reel.mp4               - with burned-in subtitles
#   output/shaadi_mangalam_reel_no_subtitles.mp4  - clean version (use with subtitles/captions.srt)
# Requires ffmpeg with libass (tested with 6.1) and python3. Everything happens in one
# filter graph, so the footage is decoded and encoded once.
set -euo pipefail
cd "$(dirname "$0")"

OUT=output/shaadi_mangalam_reel.mp4
OUT_CLEAN=output/shaadi_mangalam_reel_no_subtitles.mp4
FPS=30

# Cut list, in frames at 30 fps (start inclusive, end exclusive).
#  1: start just before "I'm not gonna lie", end after the laugh on "terrifying"
#  2: start just before "I didn't want that", end on her smile after "connect with"
#  3: from "then..." through the held smile at the end of the take
#  4: wedding scene + end card, trimmed before the dead tail
C1_IN=32;  C1_OUT=257
C2_IN=24;  C2_OUT=260
C3_IN=0;   C3_OUT=198
C4_IN=0;   C4_OUT=342

# Dissolve lengths (seconds). Short between the talking-head clips so the story
# keeps moving; longer into the wedding scene so it feels like her imagining it.
X12=0.35; X23=0.40; X34=0.80

# Per-clip gain (dB) to bring the dialogue to an even level before the final
# loudness pass (measured integrated loudness of each trimmed segment).
G1=2.95; G2=-1.40; G3=0.15; G4=4.5

sec() { awk -v f="$1" -v r="$FPS" 'BEGIN{printf "%.6f", f/r}'; }
L1=$(sec $((C1_OUT-C1_IN))); L2=$(sec $((C2_OUT-C2_IN))); L3=$(sec $((C3_OUT-C3_IN))); L4=$(sec $((C4_OUT-C4_IN)))
O1=$(awk -v a=$L1 -v x=$X12 'BEGIN{printf "%.6f", a-x}')
O2=$(awk -v o=$O1 -v b=$L2 -v x=$X23 'BEGIN{printf "%.6f", o+b-x}')
O3=$(awk -v o=$O2 -v c=$L3 -v x=$X34 'BEGIN{printf "%.6f", o+c-x}')
TOTAL=$(awk -v o=$O3 -v d=$L4 'BEGIN{printf "%.6f", o+d}')
FADE_OUT_ST=$(awk -v t=$TOTAL 'BEGIN{printf "%.6f", t-0.6}')

vtrim() { echo "[$1:v]trim=start_frame=$2:end_frame=$3,setpts=PTS-STARTPTS,fps=$FPS,format=yuv420p,settb=AVTB"; }
atrim() { echo "[$1:a]atrim=start=$(sec $2):end=$(sec $3),asetpts=PTS-STARTPTS,aresample=48000,aformat=channel_layouts=stereo"; }

FILTER="
$(vtrim 0 $C1_IN $C1_OUT),colorbalance=rm=0.025:gm=0.0:bm=-0.035:rh=0.015:bh=-0.02,eq=brightness=0.015:saturation=1.04[v1];
$(vtrim 1 $C2_IN $C2_OUT)[v2];
$(vtrim 2 $C3_IN $C3_OUT)[v3];
$(vtrim 3 $C4_IN $C4_OUT)[v4];
[v1][v2]xfade=transition=fade:duration=$X12:offset=$O1[v12];
[v12][v3]xfade=transition=fade:duration=$X23:offset=$O2[v123];
[v123][v4]xfade=transition=fade:duration=$X34:offset=$O3,format=yuv420p[vout];
$(atrim 0 $C1_IN $C1_OUT),highpass=f=70,volume=${G1}dB,afade=t=in:d=0.08[a1];
$(atrim 1 $C2_IN $C2_OUT),highpass=f=70,volume=${G2}dB[a2];
$(atrim 2 $C3_IN $C3_OUT),highpass=f=70,volume=${G3}dB[a3];
$(atrim 3 $C4_IN $C4_OUT),volume=${G4}dB[a4];
[a1][a2]acrossfade=d=$X12:c1=qsin:c2=qsin[a12];
[a12][a3]acrossfade=d=$X23:c1=qsin:c2=qsin[a123];
[a123][a4]acrossfade=d=$X34:c1=qsin:c2=qsin[amix]"

python3 make_captions.py $C1_IN $C1_OUT $C2_IN $C2_OUT $C3_IN $C3_OUT $C4_IN $C4_OUT $X12 $X23 $X34

INPUTS=(-i clips/1.mp4 -i clips/2.mp4 -i clips/3.mp4 -i clips/4.mp4)

# Pass 1: measure loudness of the assembled mix.
echo "Measuring loudness..."
MEAS=$(ffmpeg -hide_banner -nostats "${INPUTS[@]}" -filter_complex "$FILTER;[amix]loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json[aout]" \
  -map "[vout]" -map "[aout]" -f null - 2>&1 | sed -n '/^{/,/^}/p')
get() { echo "$MEAS" | grep "\"$1\"" | sed -E 's/.*: "([^"]+)".*/\1/'; }

# Pass 2: render. Linear loudness normalisation to -14 LUFS (Instagram's target),
# then a gentle fade at the very end.
echo "Rendering..."
mkdir -p output
ENC_V=(-c:v libx264 -preset slow -crf 15 -profile:v high -level 4.2 -pix_fmt yuv420p
  -r $FPS -g 60 -colorspace bt709 -color_primaries bt709 -color_trc bt709)
ENC_A=(-c:a aac -b:a 320k -ar 48000 -ac 2)
ffmpeg -hide_banner -y "${INPUTS[@]}" -filter_complex "$FILTER;
[vout]split=2[vsub_in][vclean];
[vsub_in]subtitles=subtitles/captions.ass:fontsdir=fonts[vsub];
[amix]loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true,aresample=48000,afade=t=out:st=$FADE_OUT_ST:d=0.6,asplit=2[aout][aclean]" \
  -map "[vsub]" -map "[aout]" "${ENC_V[@]}" "${ENC_A[@]}" -movflags +faststart -t "$TOTAL" "$OUT" \
  -map "[vclean]" -map "[aclean]" "${ENC_V[@]}" "${ENC_A[@]}" -movflags +faststart -t "$TOTAL" "$OUT_CLEAN"

echo "Done: $OUT and $OUT_CLEAN (${TOTAL}s)"
