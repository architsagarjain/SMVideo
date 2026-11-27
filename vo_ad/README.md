# Shaadi Mangalam family ad (16:9) - re-paced and re-voiced

`output/shaadi_mangalam_family_ad.mp4`: 1920x1080, 30 fps, 40.7 s, H.264 + AAC, -14 LUFS.

- **Pace:** the ad plays at 0.88x (pitch preserved). The two shots that carry the long "kundli" lines play at 0.62x and 0.70x so their lines fit. See `timemap.py`.
- **Pronunciation:** the lines containing "biodata" and "kundli" were regenerated with ElevenLabs (eleven_v3) and warped onto the original timing with DTW, so mouths stay roughly in sync (`redub.py`).
  - Young man (line 1): voice "Amit".
  - Dadi (both lines): voice "Dulari Didi".
  - Neha (both lines): voice "Palak M", so each character keeps one voice.
  - Mom, Dad and the aunt keep their original voices.
  - The takes are in `assets/elevenlabs_takes/`.
- **Extras:**
  - Burned-in Hinglish subtitles, with key words in gold.
  - A soft instrumental music bed ("Gul De Pa Zulfo", from the Drive folder) that ducks under the dialogue.
  - A 5 s Shaadi Mangalam end card (the animated "Your Forever Starts Here" screen on a blurred background).
- **Rebuild:**
  1. `python3 redub.py ORIG.wav TAKES_DIR DIALOGUE.wav`
  2. `python3 build_ad.py IN.mp4 DIALOGUE.wav END_SCREEN.mp4 assets/music_bed.mp3 OUT.mp4`
