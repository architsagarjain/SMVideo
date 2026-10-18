import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BeatStage, Grain, OfferBadge} from './Beats';
import {loadFonts} from './fonts';

loadFonts();

// Kinetic-type ad: one idea per beat in huge Hinglish type (the on-screen words follow the
// voiceover, so it reads with the sound off), a sticky offer badge, and a WhatsApp CTA.
export const Ad: React.FC = () => (
  <AbsoluteFill>
    <BeatStage />
    <OfferBadge />
    <Grain />
  </AbsoluteFill>
);
