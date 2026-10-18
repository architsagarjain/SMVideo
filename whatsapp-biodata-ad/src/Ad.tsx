import React from 'react';
import {AbsoluteFill} from 'remotion';
import {loadFonts} from './fonts';
import {BrandScene, CtaScene, GapScene, HookScene, HopeScene, MatchScene, WhatsAppScene} from './Scenes';
import {SCENES} from './theme';
import {Captions, CreamBackground, MaroonPanel} from './ui';

loadFonts();

export const Ad: React.FC = () => (
  <AbsoluteFill>
    <CreamBackground />
    <HookScene />
    <HopeScene />
    <GapScene />
    <WhatsAppScene />
    <MatchScene />
    <MaroonPanel range={SCENES.brand}>
      <BrandScene />
    </MaroonPanel>
    <MaroonPanel range={SCENES.cta} exit={false}>
      <CtaScene />
    </MaroonPanel>
    <Captions />
  </AbsoluteFill>
);
