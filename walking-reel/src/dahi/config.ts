import {TimeMap} from '../series/timemap';
import {punch} from '../minimal/kit';
import {AdConfig} from '../ads/AdReel';
import {adConfig} from '../ads/make';
import timemap from './timemap.json';
import captions from './captions.json';

/** Dahi reel (Video 2): 7 clips joined (landscape, cropped to 9:16). Output = source seconds. No music. */
export const TM_DAHI = timemap as TimeMap;
export const DAHI_FRAMES = TM_DAHI.frames;

/** Photos: drop the file in public/dahi/ and set `img` (e.g. 'dahi/p1.jpg'). */
export type Rating = {n: number; start: number; end: number; img?: string; name: string; score: string; scoreAt: number; good: boolean; tags: {text: string; at: number}[]};
export const RATINGS: Rating[] = [
  {n: 1, img: 'dahi/dahi_1.png', start: 4.067, end: 6.433, name: 'Plain Dahi', score: '5/10', scoreAt: 5.087, good: false, tags: []},
  {n: 2, img: 'dahi/dahi_2.png', start: 6.433, end: 10.533, name: 'Dahi + Bhuna Jeera', score: '10/10', scoreAt: 8.593, good: true, tags: [{text: 'Gut Health', at: 9.813}]},
  {n: 3, img: 'dahi/dahi_3.png', start: 10.533, end: 15.533, name: 'Dahi + 1 Banana', score: '10/10', scoreAt: 12.413, good: true, tags: [{text: 'Weight Gain', at: 13.533}, {text: 'Muscle Recovery', at: 14.533}]},
  {n: 4, img: 'dahi/dahi_4.png', start: 15.533, end: 20.901, name: 'Dahi + 1 tsp Roasted Flaxseed', score: '10/10', scoreAt: 19.493, good: true, tags: [{text: 'Menopause', at: 20.033}]},
  {n: 5, img: 'dahi/dahi_5.png', start: 20.901, end: 29.0, name: 'Dahi + Soaked Methi Seeds', score: '1000/10', scoreAt: 25.041, good: true, tags: [{text: 'Weight Loss', at: 25.941}, {text: 'Blood Sugar', at: 26.881}, {text: 'Diabetes', at: 28.301}]},
];
export const SPLIT = {start: 4.067, end: 29.0, panel: 760, dy: 150};
export const HOOK = {start: 2.3, end: 4.0, at: 3.02};
export const CTA_AT = 31.835;

const moves = [punch(0.0, 2.6, 1.03), punch(3.02, 4.05, 1.05), punch(29.035, 31.7, 1.03)];

export const dahi: AdConfig = {
  tm: TM_DAHI,
  cfg: adConfig('dahi', TM_DAHI, captions, moves, [{start: 31.4, end: 999}]),
  behindLine: 830,
  behind: [{start: CTA_AT + 0.3, end: 999, lines: [{text: 'DAHI', at: CTA_AT + 0.6, size: 330, color: '#3DBE57'}]}],
  mix: true,
  capY: 1480,
  shift: {start: SPLIT.start, end: SPLIT.end, dy: SPLIT.dy},
  pills: [],
  cuts: [],
  leaks: [4.067, 29.0],
};
