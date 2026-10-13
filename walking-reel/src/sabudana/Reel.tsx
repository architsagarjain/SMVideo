import React from 'react';
import {Base, BrollCuts, Captions, Footage, Subject, Wash} from '../series/core';
import {sabudanaConfig as cfg} from './config';
import {SabudanaBehind, SabudanaBrollOverlay, SabudanaPanel, SabudanaScenes} from './graphics';

export const SabudanaReel: React.FC = () => (
  <Base>
    <Footage cfg={cfg} />
    <Wash cfg={cfg} />
    <SabudanaBehind />
    <SabudanaPanel />
    <Subject cfg={cfg} />
    <BrollCuts cfg={cfg} overlay={SabudanaBrollOverlay} />
    <SabudanaScenes />
    <Captions cfg={cfg} />
  </Base>
);
