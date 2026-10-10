import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {easeInOut, progress} from './anim';
import {CaptionScrim, Captions} from './Captions';
import {Callout, HandHeartIcon, HeartIcon} from './Callout';
import {EndScreen} from './EndScreen';
import {loadFonts} from './fonts';
import {ES_DISSOLVE, ES_START, FPS, VIDEO_END} from './timeline';

loadFonts();

/** Footage. During the end-screen dissolve it drifts forward and softens slightly. */
const Footage: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const k = progress(t, ES_START, ES_DISSOLVE, easeInOut);
  return (
    <AbsoluteFill style={{transform: `scale(${1 + 0.035 * k})`, filter: k > 0 ? `blur(${6 * k}px)` : undefined}}>
      <OffthreadVideo src={staticFile('source_graded.mp4')} muted style={{width: '100%', height: '100%'}} />
    </AbsoluteFill>
  );
};

export const Reel: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    <Sequence durationInFrames={Math.round(VIDEO_END * FPS)} name="Footage">
      <Footage />
    </Sequence>
    <CaptionScrim />
    {/* "…personalised matchmaking support." - lands on "matchmaking", just after the cut at 6.33 s. */}
    <Callout inAt={6.7} outAt={9.95} x={64} y={262} eyebrow="Personalised" title="Matchmaking Support" Icon={HandHeartIcon} />
    {/* "…brings you matches that actually fit." */}
    <Callout inAt={13.65} outAt={15.62} x={64} y={262} eyebrow="Curated" title="Matches" Icon={HeartIcon} />
    <Captions />
    <EndScreen />
  </AbsoluteFill>
);
