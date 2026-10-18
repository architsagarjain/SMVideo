# Shaadi Mangalam: "Registration Fee? Ab Nahi." (WhatsApp biodata ad)

| File | What it is |
|---|---|
| `output/ShaadiMangalam_WhatsApp_Biodata_Ad.mp4` | The finished Meta ad: 1080×1920 (9:16), 30 fps, H.264 + AAC, 29.5 s, −14 LUFS |
| `output/captions.srt` | The voiceover as Hinglish captions, as a sidecar file |
| `voiceover/` | The ElevenLabs voiceover (Monika Sogam – Premium Hindi Commercial); the raw take is used |
| `src/Beats.tsx` | The ten beats, the sticky offer badge and the grain overlay (Remotion) |
| `scripts/` | Logo keying, caption timing, music, sound design and QC |

To rebuild, run `npm install && ./build.sh` (about 6 minutes on 4 cores). To preview, run `npm run studio`.
It needs ffmpeg, python3 (numpy, pillow, mido), FluidSynth with the FluidR3_GM soundfont, and Node 18+.

## Why it looks like this (conversion choices)
This is version 2. Version 1 was a pale, app-explainer style, and it was rejected. This version follows what Meta Reels and click-to-WhatsApp guidance says converts:

- **A hook from frame 0.** "REGISTRATION FEE?" is huge and visible on the very first frame, over a fee slip with a hovering thumb on PAY NOW.
- **The offer within 4 seconds.** "AB NAHI." and a ₹0 stamp land at 3.2 s.
- **The offer stays on screen.** A "FREE REGISTRATION" badge sits at the top from 4 s to the end card, so anyone who scrolls away mid-ad has still seen it.
- **One idea per beat.** Each beat is huge Hinglish text (Poppins ExtraBold with Reels-style highlight boxes) that follows the voiceover, so the ad reads with the sound off. There is a hard cut every 1.2–4 s, and a short push-in on every beat.
- **It shows what happens after the tap.** A big phone with the WhatsApp chat shows Biodata.pdf being sent. Then the match, then the team's incoming call.
- **The CTA arrives with the end card.** The green "WhatsApp par bhejiye" button appears at 25.2 s and pulses. "100% FREE · Bas 1 message" follows, then "Neeche 'Send Message' dabaiye" with an arrow pointing at Meta's own button.
- **Real-world imagery without footage.** The biodata envelope comes from the campaign creative, and the family photo from the Relationship Manager end screen.
- **Safe zones.** All key content sits between y≈200 and 1250. The bottom of a Reels ad is covered by the caption and the CTA button.

## Beats (cut on the voiceover)
| Time | Voiceover | On screen |
|---|---|---|
| 0–3.2 | Rishta dhoondhne ke liye registration fee? | REGISTRATION **FEE?** over a fee slip with PAY NOW and a hesitant thumb |
| 3.2–4.4 | Ab nahi. | **AB NAHI.** and a ₹0 registration stamp; the FREE REGISTRATION badge appears |
| 4.4–6.7 | Ho sakta hai, abhi koi family… | **KOI FAMILY**, with a family's "Searching for a good match" card |
| 6.7–9.2 | …bilkul aap jaisa rishta dhoondh rahi ho. | **AAP JAISA** in gold, then "rishta dhoondh rahi ho" |
| 9.2–12.1 | Bas aapka biodata wahan hona chahiye. | BAS AAPKA **BIODATA**, the envelope photo, and "✔ wahan hona chahiye" |
| 12.1–16.3 | Shaadi Mangalam par apna biodata bilkul free register karein. | Garland and logo, then "par apna biodata bilkul", then **FREE REGISTRATION** |
| 16.3–18.2 | Bas WhatsApp par bhejiye. | BAS **WHATSAPP** PAR BHEJIYE, with the phone chat sending Biodata.pdf |
| 18.2–22.3 | Agar aapki profile kisi family ki requirement se match hui, | Profile and requirement cards snap together on **MATCH** |
| 22.3–24.8 | toh hamari team aapko call karegi. | **CALL KAREGI**, with an incoming call from the Shaadi Mangalam Matchmaking Team |
| 24.8–29.5 | Aaj hi apna biodata WhatsApp par bhejiye. | **AAJ HI**, the WhatsApp button, 100% FREE, and the "tap below" prompt, over the family photo |

The ad never promises a match ("ho sakta hai" and "agar… match hui"). The fee amount on the slip is blurred, so no real price is shown.

## Sound
- **Voiceover:** the raw take, with a 70 Hz high-pass and light compression.
- **Music:** an original score (`scripts/compose_music.py`) with a santoor-like dulcimer, strings and a soft shaker. It lifts at the brand beat and resolves on the CTA, and sits about 15 LU under the voice.
- **Sound design:** synthesised in `scripts/make_sfx.py`. It has soft whooshes on the cuts, a stamp thud, a "sent" pop, two call buzzes and a chime on the CTA button.
- **Final mix:** −14 LUFS with a −1.5 dBTP ceiling.

## Licensing
- **Music and sound effects:** original. The score is rendered with the FluidR3_GM soundfont, which is under the MIT licence.
- **Fonts:** Playfair Display and Poppins, both under SIL OFL 1.1. The icons are Lucide-style paths under the ISC licence.
- **Voiceover:** generated on the client's ElevenLabs account with a library voice. The account's plan terms govern commercial use.
- **Photos:** crops of Shaadi Mangalam's own campaign creatives.
- **Remotion:** free for individuals and companies with up to 3 people. Larger companies need a Remotion company licence to keep using the project files.
- **WhatsApp chat and call screens:** illustrative recreations, not screenshots.
