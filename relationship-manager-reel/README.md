# Shaadi Mangalam: "Dedicated Relationship Manager" reel

| File | What it is |
|---|---|
| `output/ShaadiMangalam_RM_Reel_final.mp4` | Finished ad: 1080×1920 (9:16), 30 fps, H.264 High + AAC 48 kHz, 26.2 s, −14 LUFS |
| `output/captions.srt` | The same captions as a sidecar file, if you would rather upload captions than burn them in |
| `src/` | Remotion project: captions, callouts, brand moment, animated end screen |
| `scripts/` | End-screen layer extraction, caption timing, music composition |
| `build.sh` | Rebuilds everything from `assets/` |

## Rebuild

```bash
npm install
./build.sh          # about 10 minutes on 4 cores
npm run studio      # to preview and tweak in Remotion Studio (run build.sh once first)
```

Needs ffmpeg, python3 (numpy, pillow, opencv-python-headless, mido), FluidSynth with the
FluidR3_GM soundfont (`apt install fluidsynth fluid-soundfont-gm`) and Node 18+.

## The edit

**Message.** Problem ("finding the right person shouldn't feel like another full-time job"), then the
brand and its core offer (a dedicated Relationship Manager), then proof points (a real person who listens and
curated matches), then the audience and the price, then the CTA end screen. Nothing was added to or removed
from the script.

**Pacing.** The voiceover is continuous, with natural 0.3–0.4 s breaths and no dead air, and the
footage is already cut on its beats (hard cuts at 3.0, 6.33, 11.6 and 16.0 s). So the footage keeps
its original timing, and the only change is the end: the end screen dissolves in as the last word ends.
The shots also carry their own slow camera push-ins, so no extra zooms were added on top.

**Colour.** The office shot (6.33–11.6 s) was cooler and darker than the golden-hour shots around it.
It gets a small warm-balance and brightness lift so the reel holds together. Everything else is
untouched, and skin tones stay natural.

**Subtitles.** Transcribed with Whisper large-v3 and verified against the audio. Each phrase is
re-timed onto the speech envelope, because Whisper's onsets ran 0.3–0.45 s early. Corrections: "Shadi"
becomes **Shaadi**, and the spoken "5,100 rupees" is written as **₹5,100**.
- Montserrat Bold 64 px, white, with a soft dark outline and shadow plus a faint radial scrim.
- 2–6 words per phrase, at most two lines, centred at y≈1185. That is clear of every face, and above
  the bottom ~35% that the Reels and Meta ads UI covers.
- Words fade and rise 16 px into place as they are spoken. Lines are laid out in advance, so nothing
  reflows.
- Gold (#F7CD86) marks only the key words: *full-time job*, *Shaadi Mangalam*,
  *relationship manager*, *actually fit* and *₹5,100*.

**Graphics (three in total, each tied to a line of the voiceover).**
1. *"With Shaadi Mangalam"* (4.3–6.3 s): the Shaadi Mangalam logo settles onto the empty wall above
   her in shot 2. This puts the brand on screen in the first 5 seconds. The logo is the original
   artwork, keyed off its background, and is otherwise unchanged.
2. *"…a dedicated relationship manager"* (6.8–10.3 s): a small cream label card, "DEDICATED /
   Relationship Manager", whose icon draws itself in. It names the person who has just appeared on
   screen.
3. *"…brings you matches that actually fit"* (13.8–16.0 s): the same card style, "CURATED / Matches".

Both cards use the end screen's own feature wording and palette (cream and maroon), so they set up the
end screen.

**End screen (21.2–26.2 s).** The artwork is split into layers by `scripts/make_endscreen_layers.py`.
The text, logo and CTA are cut from the original pixels, and the background behind them is
reconstructed (inpainted). When fully revealed, the layers reproduce the original image (mean error
0.02/255), and the untouched original then takes over for the hold. Sequence:
- A 0.75 s dissolve from the last shot (which drifts forward and softens) onto the background and
  family photograph.
- Logo, divider, both headline lines (upward mask reveal), subhead, the three features (staggered
  120 ms) and the CTA pill (gentle scale from 93%), with one soft light pass across the pill.
- A slow uniform push-in (2.8%) throughout. Everything is fully legible from 23.9 s, and held for
  2.3 s.

No wording, pricing, logo or proportions were changed.

**Music.** An original score composed for this edit (`scripts/compose_music.py`): warm piano with
slow strings, a pad and cello in D major at about 81 BPM. The structure follows the edit:
- Sparse and unresolved under the problem line.
- The harmony lifts on "With Shaadi Mangalam" at 4.24 s.
- The arpeggio builds gently through the proof points.
- It resolves on D major 9 with a celesta figure as the end screen settles at 22.0 s, then rings out
  and fades.

**Mix.** The voice gets a 70 Hz high-pass and light 2:1 compression. It is a clean studio recording
(noise floor below −75 dBFS), so no noise reduction was applied. The music bed is high-passed, with
a −3 dB presence pocket at 2.8 kHz. Its level follows a smooth automation curve rather than a pumping
compressor: about 15 LU under the voice while she speaks, rising 6.6 dB into the end screen, then
fading over the last 1.7 s. The final mix is linearly normalised to −14 LUFS with a −1.5 dBTP
ceiling.

## Licensing notes
- **Music**: an original composition written for this project, rendered with the FluidR3_GM
  soundfont (MIT licence, `licenses/FluidR3_GM-soundfont.txt`). There is no third-party track, so
  there is nothing to clear for Meta Ads. As with any music, a rights-management system could still
  false-match it in rare cases.
- **Font**: Montserrat, SIL Open Font License 1.1 (`licenses/Montserrat-OFL.txt`).
- **Remotion** is used to render the graphics. Its licence is free for individuals and for companies
  with up to 3 employees; larger companies need a Remotion company licence to keep using the project
  files (see remotion.dev/license).
- The footage, voiceover, logo and end-screen artwork are the client's supplied assets.
