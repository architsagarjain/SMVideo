import React from 'react';
import {Base, BrollCuts, Captions, Footage, Subject, Wash} from '../series/core';
import {HookTitle2 as HookTitle} from '../series/hook';
import {X} from '../explainer/kit';
import {sabudanaConfig as cfg} from './config';
import {SabudanaBehind, SabudanaHook, SabudanaBrollOverlay, SabudanaPanel, SabudanaScenes} from './graphics';

export const SabudanaReel: React.FC = () => (
  <Base cfg={cfg}>
    <Footage cfg={cfg} />
    <Wash cfg={cfg} />
    <SabudanaBehind />
    <SabudanaPanel />
    <Subject cfg={cfg} />
    <SabudanaHook />
    <BrollCuts cfg={cfg} overlay={SabudanaBrollOverlay} />
    <SabudanaScenes />
    <HookTitle at={cfg.tm!.segs[0].s0} out={6.45} size={62} lines={[[['THIS "LIGHT" FASTING FOOD']], [['HAS '], ['ALMOST NO PROTEIN', X.pink]]]} />
    <Captions cfg={cfg} />
  </Base>
);
