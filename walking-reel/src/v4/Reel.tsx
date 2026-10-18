import React from 'react';
import {Base, BrollCuts, Captions, Footage, Subject} from '../series/core';
import {HookTitle2 as HookTitle} from '../series/hook';
import {X} from '../explainer/kit';
import {v4Config as cfg} from './config';
import {V4Cta, V4Food, V4Montage, V4Open, V4Panel, V4PerfectBehind, V4Scenes, V4Stop} from './graphics';

/** Busy-women reel: blurred background, her sharp cut-out on top, depth text in between. */
export const V4Reel: React.FC = () => (
  <Base cfg={cfg}>
    <Footage cfg={cfg} />
    <V4PerfectBehind />
    <V4Panel />
    <Subject cfg={cfg} />
    <V4Stop />
    <V4Food />
    <BrollCuts cfg={cfg} />
    <V4Scenes />
    <V4Open />
    <V4Montage />
    <V4Cta />
    <HookTitle at={cfg.tm!.segs[0].s0} out={5.3} size={62} lines={[[['THE DIET MISTAKE']], [['EVERY '], ['BUSY WOMAN', X.pink], [' MAKES']]]} />
    <Captions cfg={cfg} />
  </Base>
);
