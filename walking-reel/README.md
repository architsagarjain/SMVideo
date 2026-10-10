# "Walking is the pill" reel: motion-graphics edit (v3)

| File | What it is |
|---|---|
| `../output/walking_reel_final.mp4` | Finished reel: 1080x1920, 30 fps, H.264 High + AAC 320k, 67.2 s, -14 LUFS |
| `src/` | Remotion project (React/TypeScript): graphics, captions, camera, cutaways, layering |
| `scripts/` | Caption cleanup, matting, cutaway prep, caption data, sound design/mix, review stills |
| `analysis/` | Whisper word timings and the per-frame position of the old burned-in captions |
| `footage/` | `source.mp4` (original), `clean_720.mp4` (old captions removed), `alpha_720.mp4` (her matte), `broll/user_treadmill.mp4` |
| `public/broll/` | The four cutaway clips, trimmed and cropped to 1080x1920 |
| `music/` | "Digital Lemonade" by Kevin MacLeod (CC BY 4.0) |
| `build.sh` | Rebuilds everything: `./build.sh footage/source.mp4` (add `--skip-clean` to reuse `clean_720.mp4`) |

Open the project in Remotion Studio with `npm install && npm run studio`.
Two large intermediates are not in git:
- `public/footage_clean_1080.mp4`: recreate it with `./build.sh footage/source.mp4 --skip-clean`.
- `public/subject_1080.webm`: recreate it with `scripts/make_subject.sh public/footage_clean_1080.mp4 footage/alpha_720.mp4 public/subject_1080.webm`.

## Credit to put in the Instagram caption
> Music: "Digital Lemonade" by Kevin MacLeod (incompetech.com), licensed under CC BY 4.0

The cutaway clips are from Mixkit (free licence, commercial use, no attribution required) plus your own treadmill clip.

## How it is built

**Layering (`src/WalkingReel.tsx`).** The layers are stacked in this order, bottom to top:
1. Background footage.
2. "Behind" graphics: cards, giant type and the pill rain.
3. A cut-out of her, made with Robust Video Matting (`scripts/matte.py`, VP9 with alpha via `scripts/make_subject.sh`).
4. Full-screen cutaways.
5. Captions.

Because she is drawn above the graphics, no card or word can ever cover her head; big type sits behind it instead. In the split layout the footage panel is cropped at her neck while the cut-out is not, so her head breaks out of the panel. While the big type is on screen, the wall behind her is dimmed and blurred like a spotlight, so the type reads over both the white wall and the dark posters.

**Design system.** Dark glass cards, near-white type and an electric-lime accent (`#C8F031`), set in Manrope and Instrument Serif. The tokens are in `src/theme.ts`. Cards use a solid dark gradient instead of a live backdrop blur, and Remotion renders with the `angle` GL backend: both `backdrop-filter` on large cards and the `swangle` backend produced ghosting in headless Chrome.

**Old captions removed.** This is unchanged from v1 (`scripts/clean_captions.py`). The caption capsule still covers that spot.

**Resolution and grade.** The 720x1280 source is upscaled once (Lanczos) to 1080x1920 with a subtle grade (`GRADE` in `build.sh`).

## Timeline

| Time | Moment | Treatment |
|---|---|---|
| 0.25–9.0 | The pill hook | Pill card from 0.25 s: **−12%**, a second pill and **−12%**, then "No side effects" |
| 9.1–10.9 | "how many would you take?" | Punch-in; pills rain down behind her while a lime counter climbs to **×40** |
| 13.3–13.8 | "It doesn't come in a bottle" | A line-drawn bottle, struck through |
| 13.8–15.8 | "it's walking." | **Cutaway** to sneakers walking, with **Walking.** in serif and a lime underline; footsteps synced to the heel strikes |
| 15.9–21.8 | "+1,000 steps a day… about 12% lower risk" | Stat card |
| 23.2–24.8 | "walking didn't count" | Spotlight; a giant **WALKING** behind her head, struck through in lime |
| 24.8–26.3 | "I do my workout" | **Cutaway** to the treadmill clip |
| 26.3–34.4 | Desk 9 h, 2,500 steps, sedentary | Day-bar card |
| 35.7–37.6 | "The 10,000 number" | Spotlight; a giant **10,000** behind her head |
| 37.6–39.4 | "an old Japanese pedometer" | **Cutaway** to the Shibuya crossing in Tokyo, with a **万歩計** ("manpo-kei", 10,000-step meter) card |
| 39.4–40.7 | "marketing campaign." | **Myth-busted freeze**: black and white, record scratch, music tape-stops, 10,000 struck through, a **MARKETING CAMPAIGN** stamp |
| 40.7–53.4 | The step curve | The music drops back in; split layout with her head breaking out of the panel; the illustrative curve shows 3k→5k against 8k→10k |
| 53.4–58.5 | Fat loss | Clean footage; a punch-in on "150 calories" |
| 58.5–62.4 | "A walk after meal… blood sugar spike" | **Cutaway** to a sunset walk, with a blood-sugar card whose spike softens into the lime "With a walk" curve |
| 62.9–65.0 | "Add 1,000 steps this week" | Card with seven day-dots |
| 65.0–end | "Comment 2026" | Spotlight; a giant **2026** typed out behind her head under a **COMMENT** chip; the push-in ends at the opening scale so the video loops cleanly |

## Sound (`scripts/make_audio.py`)
- **Music:** cut on downbeats. A bar lands exactly on the walking cut, the track tape-stops into a record scratch at the freeze, and a new section drops in when the split layout opens. It is ducked about 7 dB under speech and lifted 3.5 dB under the cutaways; overall it sits about 15 dB under the voice.
- **Effects:** all synthesised: cut impacts, whooshes, UI ticks, footsteps, a pill rattle, the record scratch, stamps and key clicks.
- **Master:** -14 LUFS, peaks at -1.5 dBFS.

## Editing it
- **Cutaway and freeze times:** `src/timeline.ts`.
- **Camera moves:** `MOVES` in `src/camera.ts`.
- **Graphic timing:** the constants at the top of each `src/graphics/*.tsx`.
- **Caption wording:** `GROUPS` in `scripts/build_captions.py`.
- **Sound cue times:** `CUES` in `scripts/make_audio.py`.

Fonts: Manrope, Instrument Serif and Noto Serif JP (subset) are licensed under the SIL OFL 1.1 (see `licenses/`).
