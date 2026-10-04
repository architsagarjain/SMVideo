# Shaadi Mangalam reel

`output/shaadi_mangalam_reel.mp4` is the finished reel: 1080x1920 (9:16), 30 fps, H.264 + AAC, about 31.8 s, loudness -14 LUFS.

To rebuild it from the source clips in `clips/` (1 → 2 → 3 → 4), run `./build_reel.sh`. It needs ffmpeg.

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
