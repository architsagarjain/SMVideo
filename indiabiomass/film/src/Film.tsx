import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { useBrandFonts } from './components/Fonts';
import { Grain, Vignette } from './components/Overlays';
import { LightLeak } from './components/LightLeak';
import { Subtitles, Cue } from './components/Subtitles';
import { S1Hook } from './scenes/S1Hook';
import { S2Problem } from './scenes/S2Problem';
import { S3Reveal } from './scenes/S3Reveal';
import { S4Offer } from './scenes/S4Offer';
import { S5Intel } from './scenes/S5Intel';
import { S6Purpose } from './scenes/S6Purpose';
import { S7Finale, END } from './scenes/S7Finale';
import vo from './data/vo.json';

// Scene boundaries in frames (30 fps). Shared with the audio build via data/timeline.json.
export const SCENES = { s1: 0, s2: 180, s3: 450, s4: 690, s5: 990, s6: 1245, s7: 1485, end: 1635 };

export const Film: React.FC = () => {
  useBrandFonts();
  const f = useCurrentFrame();
  const S = SCENES;
  const cues = (vo.cues as Cue[]).filter((c) => c.s < S.s7 + END - 4).map((c) => ({ ...c, e: Math.min(c.e, S.s7 + END - 4) }));
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {/* final mix (narration + score + sound design) so Studio previews play with sound;
          the delivery render is made muted and the same mix is muxed in by build_film.sh */}
      <Audio src={staticFile('audio/final_mix.wav')} />
      <Sequence from={S.s1} durationInFrames={S.s2 - S.s1}><S1Hook /></Sequence>
      <Sequence from={S.s2} durationInFrames={S.s3 - S.s2}><S2Problem /></Sequence>
      <Sequence from={S.s3} durationInFrames={S.s4 - S.s3}><S3Reveal /></Sequence>
      <Sequence from={S.s4} durationInFrames={S.s5 - S.s4}><S4Offer /></Sequence>
      <Sequence from={S.s5} durationInFrames={S.s6 - S.s5}><S5Intel /></Sequence>
      <Sequence from={S.s6} durationInFrames={S.s7 - S.s6}><S6Purpose /></Sequence>
      <Sequence from={S.s7} durationInFrames={S.end - S.s7}><S7Finale /></Sequence>
      <LightLeak at={S.s4 + 8} dur={16} from="left" strength={0.7} />
      <LightLeak at={S.s6} dur={22} from="right" strength={0.9} />
      <LightLeak at={S.s7} dur={20} from="left" strength={0.75} />
      <Vignette strength={f > S.s7 + END ? 0.25 : 0.5} />
      <Grain opacity={0.06} />
      <Subtitles cues={cues} />
    </AbsoluteFill>
  );
};
