import React from 'react';
import {AdReel, graphicWins} from '../ads/AdReel';
import {BodyFigures, BodyTags, CommentLine, DiseaseCards, IndiaLine, TitleView, VisceralInsert} from './graphics';
import captions from './captions.json';
import {BODIES, COMMENT_AT, DISEASES, INDIA, SYNDROME, VISCERAL, d4} from './config';

const a = {
  ...d4,
  layers: (
    <>
      <BodyTags b={BODIES} />
      <TitleView d={SYNDROME} />
      <IndiaLine w={INDIA} />
      <DiseaseCards d={DISEASES} />
      <CommentLine at={COMMENT_AT} />
    </>
  ),
  under: <BodyFigures b={BODIES} />,
  topLayers: <VisceralInsert v={VISCERAL} captions={captions} />,
};
// captions step aside under the graphics
const extraHide = [SYNDROME, INDIA, DISEASES, VISCERAL, {start: COMMENT_AT - 0.4, end: 999}];
const orig = graphicWins;
void orig;
export const D4Reel: React.FC = () => <AdReel a={{...a, pills: [...a.pills, ...extraHide.map((w) => ({start: w.start, end: w.end, items: []}))]}} />;
