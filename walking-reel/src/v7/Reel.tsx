import React from 'react';
import {Base, BrollCuts, Captions, Footage, GradeOverlay, Subject} from '../series/core';
import {v7Config as cfg} from './config';
import {V7Behind, V7Broll, V7Comment, V7Day, V7Receipt, V7Stage, V7Talk} from './graphics';

/** "Stop eating healthy snacks": snack receipt on the white stage, stickers, +500 behind her head. */
export const V7Reel: React.FC = () => (
  <Base cfg={cfg}>
    <Footage cfg={cfg} />
    <V7Stage />
    <V7Behind />
    <Subject cfg={cfg} />
    <GradeOverlay cfg={cfg} />
    <V7Talk />
    <V7Receipt />
    <V7Day />
    <BrollCuts cfg={cfg} />
    <V7Broll />
    <V7Comment />
    <Captions cfg={cfg} />
  </Base>
);
