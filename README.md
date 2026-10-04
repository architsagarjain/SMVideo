# Shaadi Mangalam reel

| File | What it is |
|---|---|
| `output/shaadi_mangalam_reel.mp4` | Finished reel with burned-in subtitles |
| `output/shaadi_mangalam_reel_no_subtitles.mp4` | The same edit without subtitles |
| `subtitles/captions.srt` | Caption file for the clean version, to upload as captions instead of burning them in |

Both videos are 1080x1920 (9:16), 30 fps, H.264 + AAC, about 31.8 s, with loudness at -14 LUFS.

To rebuild them from the source clips in `clips/` (1 → 2 → 3 → 4), run `./build_reel.sh`. It needs ffmpeg with libass, plus python3.

## Edit decisions
| Clip | Kept (source) | Notes |
|---|---|---|
| 1 | 1.07–8.57 s | Dead air before "I'm not gonna lie" removed; ends on the laugh after "terrifying" |
| 2 | 0.80–8.67 s | Starts just before "I didn't want that"; ends on her smile after "connect with" |
| 3 | 0.00–6.60 s | Full take, held on the soft smile at the end |
| 4 | 0.00–11.40 s | Wedding scene and end card; the silent tail is trimmed |

- Transitions: soft cross-dissolves only. 1→2 is 0.35 s and 2→3 is 0.40 s, both placed in natural pauses. 3→4 is 0.80 s, so her smile dissolves into the bride.
- Audio: each clip has an equal-power crossfade under its dissolve and a per-clip gain so the dialogue sits at an even level. A linear EBU R128 pass brings the mix to -14 LUFS with a -1.5 dBTP ceiling, and the audio fades gently over the last 0.6 s.
- Colour: clip 1 (cooler indoor light) gets a slight warm and brightness lift to match the golden-hour clips 2 and 3. All other clips are untouched.
- Quality: the footage is decoded and encoded once (x264 CRF 15, preset slow). It is not scaled or cropped, because the sources are already 1080x1920.

## Subtitles
Transcript:
1. "I'm not gonna lie, I genuinely thought matrimony apps were going to be… terrifying."
2. "I didn't want random biodatas being sent around. I just wanted to meet someone I'd actually connect with."
3. "Then I tried Shaadi Mangalam, and honestly, it felt way more like me."
4. "And now there's someone I get to spend my life with."

- Captions are short phrases of 2–5 words that follow the natural breaks in her speech, timed to the spoken words using forced alignment.
- Style: Montserrat SemiBold in white with a soft blurred shadow and a short fade in and out. "Shaadi Mangalam" is tinted soft gold (#F4CF8C). Captions sit bottom-centre, above Instagram's caption and button area.
- To fix wording or timing, edit `CUES` in `make_captions.py` and run `./build_reel.sh` again. Cue times are in each source clip's own timeline, so the captions stay in sync if you change the cut points.
- Font: Montserrat is licensed under the SIL OFL 1.1 (see `licenses/Montserrat-OFL.txt`).
