import React from 'react';
import {Base, BrollCuts, Captions, Footage, Subject} from '../series/core';
import {v4bConfig as cfg} from './config2';
import {V4bBehind, V4bBroll, V4bFood, V4bInsta, V4bTalk} from './graphics2';
import {V4cChart, V4cComment, V4cDays, V4cMealDots, V4cNotes} from './graphics3';

/** Busy-women reel, simplified: blurred background, one straight element at a time. */
export const V4bReel: React.FC = () => (
  <Base cfg={cfg}>
    <Footage cfg={cfg} />
    <V4bBehind />
    <Subject cfg={cfg} />
    <V4bTalk />
    <V4cMealDots />
    <BrollCuts cfg={cfg} />
    <V4bBroll />
    <V4cNotes />
    <V4cDays />
    <V4bFood />
    <V4bInsta />
    <V4cChart />
    <V4cComment />
    <Captions cfg={cfg} />
  </Base>
);
