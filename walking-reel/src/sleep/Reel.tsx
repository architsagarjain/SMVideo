import React from 'react';
import {Base, BrollCuts, Captions, Footage, Subject, Wash} from '../series/core';
import {HookTitle} from '../series/parts';
import {X} from '../explainer/kit';
import {sleepConfig as cfg} from './config';
import {SleepBehind, SleepBrollOverlay, SleepPanel, SleepScenes} from './graphics';

export const SleepReel: React.FC = () => (
  <Base cfg={cfg}>
    <Footage cfg={cfg} />
    <Wash cfg={cfg} />
    <SleepBehind />
    <SleepPanel />
    <Subject cfg={cfg} />
    <BrollCuts cfg={cfg} overlay={SleepBrollOverlay} />
    <SleepScenes />
    <HookTitle at={cfg.tm!.segs[0].s0} out={7.05} lines={[[['LOSING 1 HOUR OF SLEEP']], [['COSTS YOU '], ['MUSCLE', X.pink]]]} />
    <Captions cfg={cfg} />
  </Base>
);
