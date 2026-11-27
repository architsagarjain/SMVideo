import React from 'react';
import {AdReel} from '../ads/AdReel';
import {dahi} from './config';
import {Cta, HIDE, Hook, RatingPanel} from './graphics';

export const DahiReel: React.FC = () => (
  <AdReel a={{...dahi, pills: HIDE.map((w) => ({...w, items: []})), layers: <><Hook /><Cta /></>, topLayers: <RatingPanel />}} />
);
