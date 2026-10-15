# IndiaBiomass: brand film (54.5 s, 9:16)

**"The missing link":** India's biomass trade goes from fragmented to connected.

| Deliverable | File |
|---|---|
| Final film: 1080x1920, 30 fps, H.264 + AAC 320k stereo, 54.5 s, -14 LUFS / ≤ -1 dBTP, subtitles burned in | `output/IndiaBiomass_BrandFilm_60s.mp4` |
| Narration only (48 kHz, 24-bit) | `audio/narration.wav` |
| Music + sound design, no narration | `audio/music_and_sfx.wav` |
| Full final mix | `audio/final_mix.wav` |
| Stems: score, sound design | `audio/stems/music.wav`, `audio/stems/sfx.wav` |
| Subtitles (sidecar, for platforms that take captions) | `output/IndiaBiomass_BrandFilm_60s.srt` |
| Asset manifest: footage, SFX, music, fonts, map and their licences | `ASSET_MANIFEST.md` |
| Editable project: timeline, motion graphics, source | `film/` (Remotion), `audio/scripts/` |

## Structure

| Time | Scene | What happens |
|---|---|---|
| 0–6 s | Hook | One point of light multiplies into hundreds; the camera flies through them; an iris opens on golden farmland. **Hero 1:** a scan line rises through the crop residue, which resolves into a gold dot lattice and lifts off as linked particles. "AN INDUSTRY OF POSSIBILITIES." |
| 6–15 s | Problem | A split screen of suppliers and buyers. Gold lines reach across and fall short, and stray scraps of tenders and prices drift into darkness. MISSED CONNECTIONS / UNCLEAR PRICES / SCATTERED INFORMATION. Ends on a map of disconnected nodes and a dive into one node. |
| 15–23 s | Reveal | The music cuts to near silence. **Hero 2:** the node pulses and connects to Delhi, then the network spreads hop by hop across India. It condenses into a beam, and the official logo builds from that beam: the stem grows, the ochre bowl slides out, the wordmark wipes in. "The information and trust layer for India's biomass industry." |
| 23–33 s | Offer | Callback to the split screen, now joined: "Verified supplier" and "OTP-verified buyer". Circular match cuts run pellet → briquette → **round bale** → **machine part**. Each category ends on a real IndiaBiomass listing card with product footage in its photo slot. |
| 33–41.5 s | Intelligence | A dark 3D terminal. Tender rows peel off a real site capture; whip pan to a weekly price index line that draws itself; whip pan to one IndiaBiomass window holding a supply map with state markers, the "Agro pellets · this week" supply list and the policy tracker. The window glows on "all in one place". |
| 41.5–49.5 s | Mission/Vision | A gold thread runs through field → supplier → industry and into the national network. |
| 49.5–54.5 s | Finale | **Hero 3:** rising over farmland, connections radiate out and trace the outline of India. The final hit lands on the end card: logo with descriptor, "Connecting India's biomass economy.", "Explore IndiaBiomass", indiabiomass.com. A three-note sonic signature (D–A–D/F♯) closes it. |

Section changes fall on the 120 BPM grid, and the score was composed to the picture: hard cut at 15.0 s, logo hit at 20.0 s, final hit at 51.03 s. The offer and intelligence sections were tightened (14 → 10 s and 10 → 8.5 s) so the narration flows without long pauses. Subtitles light up word by word in time with the narration. Warm light leaks carry the cuts into the offer, mission and finale sections.

## Rebuild

```bash
cd indiabiomass/film && npm install && cd ..
./build_film.sh           # footage prep → narration/cues → score → mix → render → mux
```
Needs ffmpeg, Python 3 (`numpy scipy soundfile pedalboard pyloudnorm`), Node 22. Raw footage is not in git (about 1 GB). Re-download it from the links in `footage/footage_manifest.json`. The prepped 9:16 clips are rebuilt by `film/scripts/prep_footage.py`.

- **Preview/edit visuals:** `cd film && npx remotion studio`. Scenes are in `film/src/scenes/S1…S7`. Scene boundaries are in `film/src/Film.tsx`.
- **Change wording or timing of the narration:** edit `PLACE`/`CUES` in `audio/scripts/build_vo.py`. Subtitles regenerate from word timings.
- **Swap the voice:** for a single take, use `audio/scripts/split_vo.py` (see the narration note below). For per-line takes, drop them into `audio/vo_candidates/<voice>_LNN.wav` with a `<voice>_words.json`, then run `VOICE=<voice> ./build_film.sh`.
- **Interface captures:** run `film/scripts/capture_ui.js` against the live site.

## Brand compliance
- **Logo:** official SVGs, never redrawn. The reveal uses masks only, and the final frames match the supplied artwork. It is shown reversed on Forest, which the guidelines approve.
- **Colour and type:** Forest #07412A, Ochre #A96714, Harvest #E8B04B, Leaf, Ink and Paper. Plus Jakarta Sans for display, Geist for text, Archivo for labels. Brand name is always "IndiaBiomass", and the domain is lower case.
- **Voice:** calm, specific, no hype, no exclamation marks.

## Honest notes and limitations
1. **Narration.** This is your ElevenLabs "Ruhaan" take. `audio/scripts/split_vo.py` splits it into lines and finds word timings, so the word-by-word subtitles follow your read exactly. Commercial use requires the generating ElevenLabs account to be on a paid plan. To swap in a new read, replace `audio/vo_source/ruhaan_elevenlabs.mp3`, regenerate its WAV and word timings, then run `./build_film.sh`.
2. **Interface data.** At the client's request the film no longer carries an "Interface preview · sample data" label. The tender rows, listing prices, price trend and supply statuses come from the site's own preview content, which the site marks as sample data. Swap in live data before using the film as a factual market claim.
3. **Footage.** All licensed stock: Mixkit/Coverr free licences, plus Wikimedia Commons CC0 and one CC BY 3.0 DE photo, credited in the manifest. Free libraries have no pellet or bale *video*, so pellets, briquettes and bales are high-resolution photographs with camera moves. The round-bale photo was only available at 1280 px, so it is slightly soft when full-frame. Most clips are 1080p sources cropped to 9:16 and upscaled about 1.8x. No AI-generated video or imagery is used.
4. **Map.** The India outline follows the Survey of India boundary (DataMeet composite, CC BY 4.0). The network itself is illustrative.
5. **Music** is an original synthesised score. Production-library or session-recorded music would add more orchestral realism; the stems make it easy to replace.
6. **Remotion licence.** Remotion is free for individuals and companies of up to 3 people. A larger company rendering this project needs a Remotion company licence.

## Reels (9:16, approx. 35 s and 40 s)

| Reel | Composition | Final file |
|---|---|---|
| 1 · Co-firing: why every coal plant now needs biomass | `Reel1-CoFiring` | `output/IndiaBiomass_Reel1_CoFiring.mp4` + `.srt` |
| 2 · Tender words: EMD, GCV, L1, MSE exemption, reverse auction | `Reel2-TenderWords` | `output/IndiaBiomass_Reel2_TenderWords.mp4` + `.srt` |

- **Workflow.** Voice is your ElevenLabs take, in `reels/audio/vo/`. Run `reels/scripts/build_reel_vo.py` to make the word timings and subtitle cues, and `reels/scripts/reel_audio.py` to build the music, SFX and voice mix. Review with half-res drafts in `reels/previews/`. After approval, `./build_reels.sh` renders the finals: 1080x1920, two-pass x264 at 8 Mbps, AAC 320k, -14 LUFS.
- **Layout.** Every element is centred: titles from y=300, graphics at y=600-1330, subtitles at y=1430. The code is in `film/src/reels/`.
- **Figures.** Reel 1 says 7% co-firing from FY 2025-26, about 15-20 Mt of pellets needed a year, and about 2.5 Mt made today. Verify these against current Ministry of Power and industry sources before publishing. Reel 2 diagrams show shapes only, with no prices or values.
