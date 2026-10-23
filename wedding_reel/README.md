# Shaadi Mangalam wedding reel

`output/shaadi_mangalam_reel_v4.mp4`: 1080x1920 (9:16), 60 fps, 30.4 s, H.264 (about 21 Mbps) + AAC, -14 LUFS.

## What's in it
- **Story order:** strip-cascade intro and title, the groom waits, the bride arrives, the beat drop (7.0 s), then the rituals, the celebration, the romance, and your supplied end cut (`assets/end_cut.mp4`, used untouched).
- **Music:** "Where's The Party Tonight", trimmed from the quiet pad into the drop. Music only, no sound effects. Every cut lands on a beat of the song's 137.42 BPM grid.
- **Velocity edit:** shots ease slow on the beat and whip fast before the next one. Fast ramps get shutter blur; slow-motion is frame-interpolated.
- **Transitions:** whip-pans with motion blur, zoom-through, smooth spin, heart-shaped reveal with a gold ring, iris, diagonal glow wipe, light leaks, flash dips with an anamorphic lens streak, soft cross-zoom. A three-panel split screen pumps on the beat.
- **Type:** only the opening title. "WHERE BEAUTIFUL" (Cinzel capitals, tracked) reveals letter by letter, "Stories Begin." (Pinyon Script) writes on left to right with a gold glint, then "SHAADI MANGALAM" fades in. It sits in the lower third on a soft scrim, clear of faces, and comes off before the first cut.
- **Look:** per-shot exposure matching across clips, a split-toned cinematic grade, warm halation, fine film grain, a light vignette and sharpening of the 720p footage. Each source segment is checked so no shot straddles a different scene (`check_plan.py`).

## Rebuild
Footage is not stored in the repo. Download the Drive folder, rename the clips to `c1.mp4`-`c8.mp4` in listing order, then run `./build4.sh RAW_DIR SONG.mp3`. Needs ffmpeg, python3, numpy, scipy, opencv-python-headless and pillow. Edit `plan4.py` to change cuts, transitions or timing.

The song is a commercial track. Check licensing before you publish; Instagram's own audio library covers it when you pick the sound in the app.

Fonts: Cinzel and Pinyon Script (SIL OFL).
