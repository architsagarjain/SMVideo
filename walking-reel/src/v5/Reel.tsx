import React from 'react';
import {Base, BrollCuts, Captions, Footage, GradeOverlay, Subject} from '../series/core';
import {v5Config as cfg} from './config';
import {V5Behind, V5Broll, V5Chip, V5Comment, V5Loop, V5Talk} from './graphics';

/** 3 tips for busy people: same style as the busy-women reel. */
export const V5Reel: React.FC = () => (
  <Base cfg={cfg}>
    <Footage cfg={cfg} />
    <V5Behind />
    <Subject cfg={cfg} />
    <GradeOverlay cfg={cfg} />
    <V5Talk />
    <BrollCuts cfg={cfg} />
    <V5Broll />
    <V5Loop />
    <V5Chip />
    <V5Comment />
    <Captions cfg={cfg} />
  </Base>
);
