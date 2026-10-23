# Shaadi Mangalam wedding reel

`output/shaadi_mangalam_reel_v5.mp4`: 1080x1920 (9:16), 60 fps, 30.4 s, H.264 (about 16 Mbps) + AAC, -14 LUFS.

## What's in it
- **Calm pacing:** 14 shots, each at least 4 beats (about 1.75 s) and most about 1.75 to 2.6 s, instead of the sub-second cuts in v4. Every cut lands on a beat of the song's 137.42 BPM grid.
- **Story order:** hero shot with the title, the groom waits, the bride arrives, the drop (7.0 s), the rituals, the celebration, the romance, then the supplied end cut (`assets/end_cut.mp4`, used untouched).
- **Clean effects:** a small, consistent transition set (whip-pan, zoom-through, soft dissolve, light leak, flash dip) and one hit on the drop. No strip cascade, split screen, spin, heart, iris, glitch, per-beat zoom or shake.
- **Title:** "Where Beautiful / Stories Begin." in Poppins Medium, ivory white, fading up line by line, then "SHAADI MANGALAM". It sits on a soft scrim in the lower third, clear of faces, and fades out before the first cut.
- **Music:** "Where's The Party Tonight", trimmed from the quiet pad into the drop. Music only, no sound effects.
- **Look:** per-shot exposure matching, a split-toned cinematic grade, soft warm glow, fine film grain, sharpening of the 720p footage. Each source window is checked so no shot straddles a different scene (`check_plan.py`).

## Rebuild
Footage is not stored in the repo. Download the Drive folder, rename the clips to `c1.mp4`-`c8.mp4` in listing order, then run `./build5.sh RAW_DIR SONG.mp3`. Needs ffmpeg, python3, numpy, scipy, opencv-python-headless and pillow. Edit `plan5.py` to change cuts, transitions or timing.

The song is a commercial track. Check licensing before you publish; Instagram's own audio library covers it when you pick the sound in the app.

Fonts: Poppins (SIL OFL).
