# Shaadi Mangalam wedding reel

`output/shaadi_mangalam_reel_v7.mp4`: 1080x1920 (9:16), 60 fps, 30.4 s, H.264 (about 16 Mbps) + AAC, -14 LUFS.

## What's in it
- **Calm pacing:** 14 shots, each at least 4 beats (about 1.75 s) and most about 1.75 to 2.6 s, instead of the sub-second cuts in v4. Every cut lands on a beat of the song's 137.42 BPM grid.
- **Story order:** hero shot, the groom waits, the bride arrives, the drop (7.0 s), the rituals, the celebration, the romance, then the supplied end cut (`assets/end_cut.mp4`, used untouched).
- **Clean effects:** a small, consistent transition set (whip-pan, zoom-through, soft dissolve, light leak, flash dip) and one hit on the drop. No strip cascade, split screen, spin, heart, iris, glitch, per-beat zoom or shake.
- **Captions ("Line Draw" style, `text_styles.py`):** four small Poppins captions at the top. A hairline frame draws itself around the words, the letters tighten into place, and the frame erases before the next caption draws. A very soft shade behind the top of the frame keeps the text readable on bright shots. Wording: "Where Beautiful Stories Begin." (intro), "Meet someone who feels right." (she arrives), "Celebrate with the people you love." (rituals and dance), "Find your forever on Shaadi Mangalam." (romance). Edit `CAPTIONS` in `render5.py` to change the words; `text_styles.py` also has three alternative styles (Rise and Underline, Focus Pull, Chapter Counter), previewed with `preview_text_styles.py`.
- **Music:** "Where's The Party Tonight", trimmed from the quiet pad into the drop. Music only, no sound effects.
- **Look:** per-shot exposure matching, a split-toned cinematic grade, soft warm glow, fine film grain, sharpening of the 720p footage. Each source window is checked so no shot straddles a different scene (`check_plan.py`).

## Rebuild
Footage is not stored in the repo. Download the Drive folder, rename the clips to `c1.mp4`-`c8.mp4` in listing order, then run `./build5.sh RAW_DIR SONG.mp3`. Needs ffmpeg, python3, numpy, scipy, opencv-python-headless and pillow. Edit `plan5.py` to change cuts, transitions or timing.

The song is a commercial track. Check licensing before you publish; Instagram's own audio library covers it when you pick the sound in the app.

Fonts: Poppins (SIL OFL).

---

# Reel 2: "quiet to colour"

`output/shaadi_mangalam_reel2_quiet_to_colour.mp4`: 1080x1920 (9:16), 60 fps, 22.1 s, H.264 (about 14 Mbps) + AAC, -14 LUFS.

- **Idea:** the intro plays muted and slow. When the percussion enters (6.0 s) a haldi-yellow flash lands and the colour floods in.
- **Footage:** only the five clips added to the Drive folder later (haldi, dance dip, garland exchange, palace portraits, pastel twirl); none of the first reel's clips are reused.
- **Music:** "Din Shagna Da" (80 BPM), music only, no sound effects. The soft intro and the percussion entry (6.0 s) play as in the song, then the instrumental runs for a few beats and the track jumps forward exactly 12 beats (a short crossfade, groove stays in phase) so the sung line "Din shagna da chadheya..." starts at 10.4 s, as the garland shot begins, and finishes at 18.5 s, just before the end cut. The instrumental breath after the line carries the ending, so the song never fades out on a lyric. The jump is set by `AUDIO_JUMP_BEATS` and `AUDIO_SPLICE` in `plan6.py`. Every cut lands on a 0.75 s beat.
- **Captions ("Letter Window" style, `letter_window.py`):** each caption is a small lead-in line plus one giant key word. "quietly" and "home" are big outlined words drifting over the picture; "colour" and "Shaadi Mangalam" are windows: the picture is veiled in maroon, the footage plays inside the giant letters, then the camera zooms through a letter and the footage fills the frame, leaving a small caption at the top. The ink turns black on bright footage and white on dark footage automatically (it measures the brightness behind the text). Edit the caption list in `render6.py`.
- **End:** the supplied end cut (`assets/end_cut.mp4`), untouched.
- Plan: `plan6.py`; renderer: `render6.py`; audio: `make_audio6.py`; rebuild: `./build_reel2.sh CLIP_DIR SONG.mp3`. `check_plan.py SHOTS_JSON plan6` checks that no shot straddles a source scene cut.
