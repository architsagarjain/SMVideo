# Shaadi Mangalam wedding reel

## v3 (current): `output/shaadi_mangalam_reel_v3.mp4`
1080x1920, 30 fps, 30.6 s, H.264 + AAC, about -14 LUFS. CapCut-style edit locked to the beat grid of "Where's The Party Tonight" (137.42 BPM, drop at 7.0 s).

- **Audio:** the song only. No sound effects. It is trimmed to the window that runs from the quiet pad into the drop, with a short dip before the drop and a reverb-tail ending.
- **Pacing:** cuts every 1 to 2 beats through the drop, with a transition on every cut: whip-pans with motion blur, zoom blur, spin blur, glitch with RGB split, heart-shaped mask reveal, ink-bleed wipe, blinds, iris, diagonal glow wipe, light leaks, flash dips. Beat-synced punch zoom, screen shake, chromatic split, speed ramps and a three-panel split-screen accordion.
- **Type:** Cormorant Garamond Bold, with a gold gradient on the headline words. "Where Beautiful Stories Begin." lands word by word on a half-beat rhythm and holds for about 1.4 s. "Meet.", "Celebrate." and "Forever." are my own kinetic additions; delete them from `WORDS` in `plan2.py` if unwanted.
- **End screen:** your supplied artwork (`assets/end_screen.png`), animated. The text is separated from the background by inpainting. The logo, tagline and button then reveal in turn, with a gold glint, a shine sweep on the button and a slow push-in. The artwork is cropped from 578x877 to 9:16 and upscaled, so it is a little soft.
- **Removed from v2:** all sound effects, the falling petals and the gold sparkle dust.

Rebuild with `./build2.sh RAW_DIR SONG.mp3`, where RAW_DIR holds the Drive clips as `c1.mp4`-`c8.mp4`. Edit `plan2.py` to change cuts, transitions, words or timing. The song is a commercial track. Check licensing before you publish; Instagram's own audio library covers it when you pick the sound in the app.

Fonts: Cormorant Garamond (SIL OFL).

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
