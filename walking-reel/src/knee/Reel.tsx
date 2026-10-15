import React from 'react';
import {Base, BrollCuts, Captions, Footage, Subject, Wash} from '../series/core';
import {HookTitle2 as HookTitle} from '../series/hook';
import {X} from '../explainer/kit';
import {kneeConfig as cfg} from './config';
import {KneeBehind, KneeHook, KneeBrollOverlay, KneePanel, KneeScenes} from './graphics';

export const KneeReel: React.FC = () => (
  <Base cfg={cfg}>
    <Footage cfg={cfg} />
    <Wash cfg={cfg} />
    <KneeBehind />
    <KneePanel />
    <Subject cfg={cfg} />
    <KneeHook />
    <BrollCuts cfg={cfg} overlay={KneeBrollOverlay} />
    <KneeScenes />
    <HookTitle at={cfg.tm!.segs[0].s0} out={5.95} lines={[[["WHY I WON'T GIVE YOU"]], [['A WEIGHT-LOSS '], ['DEADLINE', X.pink]]]} />
    <Captions cfg={cfg} />
  </Base>
);
