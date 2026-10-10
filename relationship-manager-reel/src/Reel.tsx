import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {easeInOut, progress} from './anim';
import {CaptionScrim, Captions} from './Captions';
import {Callout, HeartIcon, PersonIcon} from './Callout';
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

/** "With Shaadi Mangalam": the brand mark settles onto the empty wall in shot 2. */
const BrandMoment: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const IN = 4.3;
  const OUT = 5.98; // gone before the cut at 6.33 s
  if (t < IN || t > OUT + 0.4) return null;
  const k = progress(t, IN, 0.8);
  const out = progress(t, OUT, 0.32, easeInOut);
  const w = 304 * 0.84;
  return (
    <Img
      src={staticFile('endscreen/brand_logo.png')}
      style={{
        position: 'absolute',
        left: 640 - w / 2,
        top: 228,
        width: w,
        opacity: k * (1 - out),
        transform: `translateY(${(1 - k) * 14 - out * 6}px)`,
        filter: 'drop-shadow(0 2px 10px rgba(255, 244, 228, 0.55))',
      }}
    />
  );
};

export const Reel: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    <Sequence durationInFrames={Math.round(VIDEO_END * FPS)} name="Footage">
      <Footage />
    </Sequence>
    <CaptionScrim />
    <BrandMoment />
    {/* "…a dedicated relationship manager." - she is on screen from the cut at 6.33 s. */}
    <Callout inAt={6.78} outAt={9.95} x={64} y={262} eyebrow="Dedicated" title="Relationship Manager" Icon={PersonIcon} />
    {/* "…brings you matches that actually fit." */}
    <Callout inAt={13.78} outAt={15.62} x={64} y={262} eyebrow="Curated" title="Matches" Icon={HeartIcon} />
    <Captions />
    <EndScreen />
  </AbsoluteFill>
);
