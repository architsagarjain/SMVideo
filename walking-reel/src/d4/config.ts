import {TimeMap} from '../series/timemap';
import {punch} from '../minimal/kit';
import {AdConfig} from '../ads/AdReel';
import {adConfig} from '../ads/make';
import timemap from './timemap.json';
import captions from './captions.json';

/** Skinny-fat reel: IMG_3236 -> 3240 -> 3241 -> 3242 joined (order from the reference reel), real-time voice,
 *  no music. Clip joins at 10.40, 22.633, 30.933 (source = output seconds). */
export const TM_D4 = timemap as TimeMap;
export const D4_FRAMES = TM_D4.frames;
const moves = [
  punch(8.36, 10.38, 1.12), // "It's called the skinny fat syndrome."
  punch(16.87, 18.6, 1.08), // "mostly seen in Indians"
  punch(22.633, 24.6, 1.08), // hides the join into IMG_3241
  punch(26.26, 27.6, 1.16), // "then you're absolutely wrong."
];

export const VISCERAL = {start: 10.38, end: 16.75, thinAt: 10.9, fatAt: 13.6, nameAt: 16.03};
export const BODIES = {start: 0.7, end: 3.65, aAt: 0.96, bAt: 2.04, eqAt: 2.92};
export const SYNDROME = {start: 8.5, end: 10.38, y: 300, size: 110, rows: [[{text: 'Skinny', at: 9.16}, {text: 'Fat', at: 9.5, color: '#E5484D'}], [{text: '_syndrome', at: 9.92}]]};
export const INDIA = {start: 17.3, end: 18.65, at: 17.41, flagAt: 18.11};
export const DISEASES = {start: 19.3, end: 22.6, items: [{label: 'Diabetes', at: 19.87, kind: 'drop' as const}, {label: 'Fatty Liver', at: 20.57, kind: 'liver' as const}, {label: 'Metabolic Diseases', at: 21.55, kind: 'pulse' as const}]};
export const COMMENT_AT = 33.93;

export const d4: AdConfig = {
  tm: TM_D4,
  cfg: adConfig('d4', TM_D4, captions, moves, [{start: 5.3, end: 8.3}, {start: 33.2, end: 999}]),
  mix: true,
  capY: 1060,
  behindLine: 640,
  behind: [
    {start: 5.5, end: 8.1, lines: [{text: 'the most', at: 6.12, size: 110, serif: true}, {text: 'DANGEROUS', at: 6.42, size: 170, color: '#E5484D'}]},
    {start: 34.2, end: 99, lines: [{text: 'CHANGE', at: 34.33, size: 230}]},
  ],
  pills: [
    {start: 23.7, end: 27.0, items: [{text: 'Excessive Cardio', at: 23.78, kind: 'cross'}, {text: 'Crash Dieting', at: 24.98, kind: 'cross'}]},
  ],
  cuts: [
    {start: 28.55, end: 29.75, src: 'b_gym.mp4', line: 'Strength Training', times: [28.72, 29.06], y: 380, mix: true},
    {start: 29.75, end: 30.95, src: 'b_bowl.mp4', line: 'Protein-Rich Diet', times: [30.06, 30.52], y: 380, mix: true},
  ],
  leaks: [8.36, 22.633, 28.55, 29.75, 30.95, 33.93],
};
