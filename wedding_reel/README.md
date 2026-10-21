# Shaadi Mangalam wedding reel

## v2 (CapCut-style): `output/shaadi_mangalam_reel_v2.mp4`
1080x1920, 30 fps, 29.7 s, H.264 + AAC, about -14 LUFS. This replaces v1, which was too gentle.

- **Music:** "Where's The Party Tonight" from your Drive folder. I used the 29.7 s window that runs from the quiet pad into the hard drop at about 21.4 s, so the intro is soft and the drop lands at 7.0 s. All 68 beats sit on the song's detected 137.42 BPM grid, and every cut and effect is placed on a beat. I added whoosh, glitch, riser and impact sound effects under the song, a pre-drop dip, and a reverb-tail ending.
- **Pacing:** cuts every 1 to 2 beats (0.44 to 0.87 s) through the drop, with a transition on every cut and no kind repeated back to back. The ending slows to slow motion.
- **Intro:** three strips cascade in on beats 0, 1 and 2. A zoom-through into the hero shot follows, and "Where / Beautiful / Stories / Begin." pops in word by word in gold display serif.
- **Transitions:** whip-pans (L/R/U/D) with motion blur, zoom blur, spin blur, glitch with RGB split, heart-shaped mask reveal with gold ring, ink-bleed wipe, vertical blinds, circular iris, diagonal glow wipe, light leaks, flash dips, soft cross-zoom.
- **Beat-synced motion:** punch zoom on every beat, harder on each bar and the drop, plus screen shake and chromatic split. Bar-line flash pulses, speed ramps, a split-screen accordion with three panels that pump on the beat, falling petals and gold sparkle dust.
- **Branding:** a small brand header sits at the top. The kinetic words "Meet.", "Celebrate." and "Forever." are my own additions. The end card has a lotus mark, the wordmark and the tagline. No Shaadi Mangalam logo file was supplied, so this is a typographic mark that I drew. Swap in the real logo if you have it.
- **Fonts:** DM Serif Display and Poppins, both SIL OFL.

Rebuild with `./build2.sh RAW_DIR SONG.mp3`, where RAW_DIR holds the Drive clips as `c1.mp4`-`c8.mp4`. Edit `plan2.py` to change cuts, transitions, words or timing. The song is a commercial track. Check licensing before you publish; Instagram's own audio library covers it when you pick the sound in the app.

---

## v1: `output/shaadi_mangalam_wedding_reel.mp4`

`output/shaadi_mangalam_wedding_reel.mp4`: 1080x1920, 30 fps, 28 s, H.264 + AAC, about -14 LUFS.

## What's in the edit
- Only the supplied wedding footage is used (original audio removed). The 7 clips used are `c1`-`c7`; `c8` is left out because it carries a watermark. Each cut is placed inside a single source shot, because the source clips are already edited montages.
- 18 shots, every cut on a beat (120 BPM, 0.5 s per beat), in the order opening reveal, groom waits, bride arrives, drop, celebration, rituals, romantic ending.
- Transitions, all rendered frame by frame: zoom-blur, four whip-pans with motion blur (left, right, up, down), spin blur, circular iris mask, diagonal glow wipe, warm light leaks, flash dips, soft cross-zoom.
- Speed ramps (fast -> slow -> fast) on the twirl, varmala and hug shots; slow motion on the romantic beats. Beat-synced punch zooms through the drop; slow push-ins and glides on every shot.
- Grade: per-clip matching, then one warm, soft-contrast grade with lifted blacks, a gentle highlight bloom and a light vignette.
- Text: "Where Beautiful Stories Begin." and "SHAADI MANGALAM" animate in at 0.35 s with a tracking reveal, set in champagne and gold in the lower third clear of faces. The wordmark returns on the end card. Fade-out over the last 0.75 s.

## Music
No licensed track could be downloaded here, so `make_music.py` synthesises an original score. It is rights-free, uses no samples, and is locked to the cut grid: soft intro and build, drop at 8 s, breakdown at 20 s, then a cinematic resolve to a D-major chord. It also generates the whoosh, impact and shimmer effects placed on each transition. `audio/original_score.wav` is the score before mastering. To use a trending track instead, mute the audio and add it in Instagram or CapCut. The cuts sit on a 120 BPM grid.

## Rebuild
Footage is not stored in the repo. Download the Drive folder (`gdown --folder`), rename the files to `c1.mp4`-`c8.mp4` in listing order, then run `./build.sh RAW_DIR`. Needs ffmpeg, python3, numpy, scipy, opencv-python-headless and pillow. Edit `plan.py` to change cuts, transitions or timing.
