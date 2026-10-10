import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Captions} from './components/Captions';
import {Footage, Subject} from './components/Footage';
import {Behind} from './graphics/Behind';
import {Cutaways} from './graphics/Cutaways';
import {G1Pill} from './graphics/G1Pill';
import {G2Walking} from './graphics/G2Walking';
import {G4Day} from './graphics/G4Day';
import {G6Curve} from './graphics/G6Curve';
import {G8BloodSugar} from './graphics/G8BloodSugar';
import {G9Cta} from './graphics/G9Cta';
import {C} from './theme';

/**
 * Layer order (bottom to top):
 *   footage -> "behind" graphics (cards, giant type, pill rain) -> cut-out of her
 *   -> full-screen cutaways -> overlays on cutaways -> captions
 * Putting the cards under the cut-out means they can never cover her head.
 */
export const WalkingReel: React.FC = () => {
  return (
    <AbsoluteFill style={{background: `radial-gradient(120% 70% at 50% 25%, #1B1D21 0%, ${C.stage} 100%)`}}>
      <Footage />
      <Behind />
      <G1Pill />
      <G2Walking />
      <G4Day />
      <G6Curve />
      <G9Cta />
      <Subject />
      <Cutaways />
      <G8BloodSugar />
      <Captions />
    </AbsoluteFill>
  );
};
