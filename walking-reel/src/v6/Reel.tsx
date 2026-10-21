import React from 'react';
import {Base, BrollCuts, Captions, Footage, GradeOverlay, Subject} from '../series/core';
import {v6Config as cfg} from './config';
import {V6Behind, V6Broll, V6Card, V6Comment, V6Stage, V6Talk} from './graphics';

/** "More cardio isn't the answer": white stage with a B-roll card on top while she talks below. */
export const V6Reel: React.FC = () => (
  <Base cfg={cfg}>
    <Footage cfg={cfg} />
    <V6Stage />
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
