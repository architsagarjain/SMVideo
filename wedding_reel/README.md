# Shaadi Mangalam wedding reel (Instagram, 9:16)

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
