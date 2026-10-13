import React from 'react';
import {Base, BrollCuts, Captions, Footage, Subject, Wash} from '../series/core';
import {kneeConfig as cfg} from './config';
import {KneeBehind, KneeBrollOverlay, KneePanel, KneeScenes} from './graphics';

export const KneeReel: React.FC = () => (
  <Base>
    <Footage cfg={cfg} />
    <Wash cfg={cfg} />
    <KneeBehind />
    <KneePanel />
    <Subject cfg={cfg} />
    <BrollCuts cfg={cfg} overlay={KneeBrollOverlay} />
    <KneeScenes />
    <Captions cfg={cfg} />
  </Base>
);
