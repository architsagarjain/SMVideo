import React from 'react';
import {AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';
import {cameraAt} from './camera';
import {Captions} from './components/Captions';
import {G1Pill} from './graphics/G1Pill';
import {G2Walking} from './graphics/G2Walking';
import {G4Day} from './graphics/G4Day';
import {G5Pedometer} from './graphics/G5Pedometer';
import {G6Curve} from './graphics/G6Curve';
import {G7FatLoss} from './graphics/G7FatLoss';
import {G8BloodSugar} from './graphics/G8BloodSugar';
import {G9Cta} from './graphics/G9Cta';
import {FPS} from './theme';

const Footage: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const cam = cameraAt(t);
  return (
    <AbsoluteFill style={{transformOrigin: `${cam.ox}px ${cam.oy}px`, scale: cam.scale}}>
      {/* source with the old burned-in captions removed, upscaled to 1080x1920 */}
      <OffthreadVideo src={staticFile('footage_clean_1080.mp4')} muted style={{width: '100%', height: '100%'}} />
    </AbsoluteFill>
  );
};

export const WalkingReel: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: '#111'}}>
      <Footage />
      <G1Pill />
      <G2Walking />
      <G4Day />
      <G5Pedometer />
      <G6Curve />
      <G7FatLoss />
      <G8BloodSugar />
      <G9Cta />
      <Captions />
    </AbsoluteFill>
  );
};
