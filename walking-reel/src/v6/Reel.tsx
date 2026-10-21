import React from 'react';
import {Base, BrollCuts, Captions, Footage, GradeOverlay, Subject} from '../series/core';
import {v6Config as cfg} from './config';
import {V6Behind, V6Broll, V6Card, V6Comment, V6Talk} from './graphics';

/** "More cardio isn't the answer": lower-half B-roll card while she talks, blurred background. */
export const V6Reel: React.FC = () => (
  <Base cfg={cfg}>
    <Footage cfg={cfg} />
    <V6Behind />
    <Subject cfg={cfg} />
    <GradeOverlay cfg={cfg} />
    <V6Talk />
    <V6Card />
    <BrollCuts cfg={cfg} />
    <V6Broll />
    <V6Comment />
    <Captions cfg={cfg} />
  </Base>
);
