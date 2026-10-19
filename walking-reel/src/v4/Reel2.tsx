import React from 'react';
import {Base, BrollCuts, Captions, Footage, Subject} from '../series/core';
import {v4bConfig as cfg} from './config2';
import {V4bBehind, V4bBroll, V4bFood, V4bInsta, V4bTalk} from './graphics2';

/** Busy-women reel, simplified: blurred background, one straight element at a time. */
export const V4bReel: React.FC = () => (
  <Base cfg={cfg}>
    <Footage cfg={cfg} />
    <V4bBehind />
    <Subject cfg={cfg} />
    <V4bTalk />
    <BrollCuts cfg={cfg} />
    <V4bBroll />
    <V4bFood />
    <V4bInsta />
    <Captions cfg={cfg} />
  </Base>
);
