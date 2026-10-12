import React from 'react';
import {Behind2} from './behind';
import {Base, Captions2, Footage2, Subject2, Wash} from './layers';
import {PanelChart, Scenes2} from './scenes';

/**
 * Reel 2 ("train twice a week"), explainer style:
 * footage -> wall wash -> graphics behind her head / split-layout chart ->
 * her cut-out -> full-screen explainer scenes -> captions.
 */
export const Reel2: React.FC = () => (
  <Base>
    <Footage2 />
    <Wash />
    <Behind2 />
    <PanelChart />
    <Subject2 />
    <Scenes2 />
    <Captions2 />
  </Base>
);
