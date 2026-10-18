# Shaadi Mangalam: "Registration Fee? Ab Nahi." (WhatsApp biodata ad)

| File | What it is |
|---|---|
| `output/ShaadiMangalam_WhatsApp_Biodata_Ad.mp4` | Finished Meta ad: 1080×1920 (9:16), 30 fps, H.264 + AAC, 29.5 s, −14 LUFS |
| `output/captions.srt` | The Hinglish captions as a sidecar file |
| `voiceover/` | ElevenLabs voiceover (Monika Sogam – Premium Hindi Commercial); the raw take is used |
| `src/` | Remotion project: scenes, captions, brand panel, garland |
| `scripts/` | Logo keying, caption timing, music composition, QC |

Rebuild with `npm install && ./build.sh` (about 6 minutes on 4 cores). Use `npm run studio` to preview.
Needs ffmpeg, python3 (numpy, pillow, mido), FluidSynth with the FluidR3_GM soundfont, and Node 18+.

## Structure (cut on the voiceover)
| Time | Voiceover | On screen |
|---|---|---|
| 0.0–4.4 | Rishta dhoondhne ke liye registration fee? Ab nahi. | A generic sign-up card with a "Registration fee" row (amount blurred) and a "Pay & Register" button. Both are struck through on "Ab nahi", and a gold **₹0 · AB NAHI** stamp lands. |
| 4.4–9.2 | Ho sakta hai, abhi koi family bilkul aap jaisa rishta dhoondh rahi ho. | Headline "Koi family *aap jaisa* rishta dhoondh rahi ho…". A family's "Looking for a match" card fills with requirement chips, then "Searching profiles…". |
| 9.2–12.6 | Bas aapka biodata wahan hona chahiye. | "Kya aapka biodata *wahan* hai?" over a grid of profiles with one empty, pulsing "Your biodata" slot. |
| 12.0–16.3 | Shaadi Mangalam par apna biodata bilkul free register karein. | The maroon brand panel wipes up, with a marigold garland and the logo. **FREE REGISTRATION** lands on "free". |
| 16.3–18.2 | Bas WhatsApp par bhejiye. | A WhatsApp chat with Shaadi Mangalam. *Biodata.pdf* is sent and the ticks turn blue. |
| 18.2–25.4 | Agar aapki profile kisi family ki requirement se match hui, toh hamari team aapko call karegi. | "Potential Match *Consideration*". Your profile (Registered Free) and a family's requirement join on "match" with a heart. Then an incoming call from Shaadi Mangalam rings on "call". |
| 24.75–29.5 | Aaj hi apna biodata WhatsApp par bhejiye. | Maroon end card with the logo, "Send Your Biodata on WhatsApp *Today*.", the three campaign benefits, the green **Claim Free Registration** button, and "Tap 'Send Message' below". |

- **Captions:** Roman Hinglish, word by word, exactly as spoken. They are ink on cream and cream on maroon.
- **Caption timing:** taken from Whisper word timings and snapped onto the measured speech regions. The CTA line is timed directly from the audio envelope.
- **Wording:** no match is promised ("ho sakta hai" and "agar… match hui"). The only claims are those in the campaign creative: free registration, potential match consideration, and an easy WhatsApp process.

## Sound
- **Voiceover:** the raw ElevenLabs take (27.9 s, as approved), with a 70 Hz high-pass and light compression.
- **Music:** an original score (`scripts/compose_music.py`) with a santoor-like dulcimer, strings, a pad and a soft shaker, in D major at about 75 BPM.
  - A soft timpani accent lands on "Ab nahi" (3.17 s).
  - The music lifts on "Shaadi Mangalam" (12.18 s) and resolves on the CTA (24.90 s).
  - It sits about 15 LU under the voice and rises after the last word.
- **Sound effect:** one soft "sent" pop when the biodata lands in the chat.
- **Final mix:** −14 LUFS with a −1.5 dBTP ceiling.

## Licensing
- **Music:** an original composition, rendered with the FluidR3_GM soundfont (MIT licence).
- **Fonts:** Playfair Display and Poppins, both SIL OFL 1.1. Icons are Lucide-style paths (ISC licence).
- **Voiceover:** generated on the client's ElevenLabs account with a library voice. The account's plan terms govern commercial use.
- **Remotion:** free for individuals and companies of up to 3 people. Larger companies need a Remotion company licence to keep using the project files.
- **WhatsApp:** the chat screen and button are illustrative recreations, not screenshots.
