import React from 'react';
import {Base, BrollCuts, Captions, Footage, GradeOverlay, Subject} from '../series/core';
import {v8Config as cfg} from './config';
import {V8Behind, V8Broll, V8Chip, V8Comment, V8Hook, V8PlaneBehind, V8Talk} from './graphics';

/** Travel-day reel: departures-board hook, then the 3-tips style. */
export const V8Reel: React.FC = () => (
  <Base cfg={cfg}>
    <Footage cfg={cfg} />
    <V8PlaneBehind />
    <V8Behind />
    <Subject cfg={cfg} />
    <GradeOverlay cfg={cfg} />
    <V8Talk />
    <V8Chip />
    <BrollCuts cfg={cfg} />
    <V8Broll />
    <V8Comment />
    <Captions cfg={cfg} />
    <V8Hook />
  </Base>
);
