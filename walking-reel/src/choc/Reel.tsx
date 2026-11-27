import React from 'react';
import {AdReel} from '../ads/AdReel';
import {choc} from './config';
import {CommentPill, HIDE, Intro, Myth, RankCards} from './graphics';

export const ChocReel: React.FC = () => (
  <AdReel a={{...choc, pills: HIDE.map((w) => ({start: w.start, end: w.end, items: []})), layers: <><Intro /><RankCards /><Myth /><CommentPill /></>}} />
);
