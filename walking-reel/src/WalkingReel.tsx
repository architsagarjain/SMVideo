import React from 'react';
import {AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';
import {cameraAt} from './camera';
import {Captions} from './components/Captions';
import {G1Pill} from './graphics/G1Pill';
import {G2Walking} from './graphics/G2Walking';
import {G4Day} from './graphics/G4Day';
import {G5Pedometer} from './graphics/G5Pedometer';
import {G6Curve} from './graphics/G6Curve';
import {G8BloodSugar} from './graphics/G8BloodSugar';
import {G9Cta} from './graphics/G9Cta';
import {C, FPS} from './theme';

const Footage: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const cam = cameraAt(t);
  return (
    <AbsoluteFill
      style={{
        transformOrigin: `${cam.ox}px ${cam.oy}px`,
        scale: cam.scale,
        // in panel mode the corners round off (kept at ~44 px on screen)
        borderRadius: cam.panel > 0 ? (44 * cam.panel) / cam.scale : 0,
        overflow: 'hidden',
        boxShadow: cam.panel > 0 ? `0 ${40 / cam.scale}px ${90 / cam.scale}px -${30 / cam.scale}px rgba(28,20,12,${0.45 * cam.panel})` : undefined,
      }}
    >
      {/* source with the old burned-in captions removed, graded, upscaled to 1080x1920 */}
      <OffthreadVideo src={staticFile('footage_clean_1080.mp4')} muted style={{width: '100%', height: '100%'}} />
    </AbsoluteFill>
  );
};

export const WalkingReel: React.FC = () => {
  return (
    <AbsoluteFill style={{background: `radial-gradient(120% 70% at 50% 20%, ${C.paper} 0%, #E9E3DA 100%)`}}>
      <Footage />
      <G1Pill />
      <G2Walking />
      <G4Day />
      <G5Pedometer />
      <G6Curve />
      <G8BloodSugar />
      <G9Cta />
      <Captions />
    </AbsoluteFill>
  );
};
