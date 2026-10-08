# "Walking is the pill" reel: motion-graphics edit

| File | What it is |
|---|---|
| `../output/walking_reel_final.mp4` | Finished reel: 1080x1920, 30 fps, H.264 High + AAC 320k, 67.2 s, -14 LUFS |
| `src/` | Remotion project (React/TypeScript): every graphic, caption and camera move |
| `scripts/` | Caption cleanup, caption data, sound design/mix, review stills |
| `analysis/` | Whisper word timings and the per-frame position of the old burned-in captions |
| `build.sh` | Rebuilds everything from the source video |

Open the project in Remotion Studio with `npm install && npm run studio`.
`public/footage_clean_1080.mp4` is not in git because it is too large. `./build.sh <source.mp4> --skip-clean` recreates it from `footage/clean_720.mp4`.

## What was done

**Old captions removed.** The source had pink word-by-word captions burned in on the neckline. `scripts/clean_captions.py` finds them per frame. It fills each masked pixel from the nearest frame (up to ±40 frames, aligned with ECC) where that spot was not covered by a word, and inpaints whatever is left. The new caption capsule sits exactly over that spot (`coverHalfWidth` in `src/data/captions.json`), so the small leftover smudges stay hidden.

**Captions.** There are 47 phrase groups. Each word appears when it is spoken, using Whisper word timings. The text was checked against the original captions, which is how "pedometer" was confirmed where Whisper heard "speedometer". The captions use Manrope in a frosted charcoal capsule with numbers and key words in the accent colour. The two pivotal lines ("That drug exists.", "it's walking.") are set in Instrument Serif italic.

**Design system.** Warm off-white cards (`#F7F4EF`), charcoal ink (`#161514`) and a single accent: the coral-red of the poster on her wall (`#E5502F`, lifted to `#FF7556` on dark). Every graphic uses the same card, spring entrance, fade-lift exit, eyebrow labels and tabular counting numbers (`src/theme.ts`, `src/components/Card.tsx`).

**Resolution.** The source is 720x1280. It is upscaled once with Lanczos to 1080x1920 so graphics and type render at Instagram's native resolution, and the frame rate stays at 30 fps.

## Timeline

| Time | Moment | Treatment |
|---|---|---|
| 0.0–1.1 | Open | Frame settles from 104.5% to 100% |
| 1.0–9.5 | "If there was a pill… 12%… every extra pill… no side effects" | Pill card: a capsule pops in, the card opens as **−12%** counts up, a second row adds another pill and **−12%**, then a "No side effects" chip |
| 9.1–12.9 | "How many would you take? / That drug exists." | Punch-in to 110% on her face, clean footage, serif caption |
| 13.3–15.9 | "It doesn't come in a bottle, it's walking." | A pill bottle is drawn in line and struck through in coral. The card widens into **Walking.** with a hand-drawn underline |
| 15.9–21.8 | "Every extra 1,000 steps a day… about 12% lower risk of dying from any cause" | Same card becomes a stat: **+1,000** steps a day → **12%** lower risk |
| 21.9–25.3 | "And I used to think walking didn't count." | Clean footage with a slow 105% push-in |
| 25.2–34.4 | "Workout, then a desk for 9 hours… 2,500 steps… basically sedentary" | Day bar: a coral workout segment, then a charcoal "Desk · 9 hours" segment that fills, a step counter to **2,500**, and a "Basically sedentary" stamp |
| 35.6–40.9 | "The 10,000 number… old Japanese pedometer marketing campaign" | Line-art pedometer whose LCD counts to 10000, a serif "An old Japanese pedometer" line, and a "Marketing campaign" stamp |
| 40.8–53.4 | "Benefit climbs fast… flattens 7,000–10,000… 3,000→5,000 beats 8,000→10,000" | The frame is reframed (zoom anchored at the top) to open space for an illustrative curve. The curve draws in two beats, the 7–10k plateau is shaded, and the 3k→5k (coral) and 8k→10k (charcoal) gains are highlighted |
| 54.2–58.2 | "For fat loss, an extra 4,000 steps is roughly 150 calories a day" | **+4,000** steps ≈ **150** calories a day |
| 58.6–62.4 | "A walk after meal also softens the blood sugar spike" | A schematic glucose spike draws, then morphs into a softer coral curve labelled "With a walk" |
| 62.8–end | "Add 1,000 steps this week. Comment 2026 for the full plan." | Gentle 106% push-in. **+1,000** steps with seven day-dots lighting up, then a comment field typing **2026** and a serif "for the full plan" |

Charts are qualitative: no values are plotted beyond the numbers she says, and the step curve is labelled *Illustrative*.

## Sound
- **Voice:** left natural (it was already clean), with a 70 Hz high-pass and a linear gain to -14 LUFS. A transparent limiter keeps peaks at about -1.5 dBFS.
- **Effects:** soft whooshes on card entrances, quiet ticks when numbers land, a soft thud for the two stamps, and key clicks for "2026". All are synthesised in `scripts/make_audio.py` and sit about 25–30 dB under the voice.
- **Music:** a very quiet synthesised ambient pad (F major, 84 BPM), about 21 dB under the voice and ducked further while she speaks. Turn it off with `python3 scripts/make_audio.py <src> out/mix.wav --no-music`.

## Editing it
- Caption wording and grouping: `GROUPS` in `scripts/build_captions.py`, then run it again.
- Graphic timing: the constants at the top of each `src/graphics/G*.tsx`. Each one is commented with the spoken word it is synced to.
- Camera moves: `MOVES` in `src/camera.ts`.
- Sound cue times: `CUES` in `scripts/make_audio.py`.

Fonts: Manrope and Instrument Serif are licensed under the SIL OFL 1.1 (see `licenses/`).
