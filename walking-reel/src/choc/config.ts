import {TimeMap} from '../series/timemap';
import {punch} from '../minimal/kit';
import {AdConfig} from '../ads/AdReel';
import {adConfig} from '../ads/make';
import timemap from './timemap.json';
import captions from './captions.json';

/** Dark-chocolate ranking reel (Video 3): 12 clips joined. Output = source seconds. No music.
 *  Pack shots: drop the file in public/choc/ and set `img` (e.g. 'choc/r10.jpg'). */
export const TM_CHOC = timemap as TimeMap;
export const CHOC_FRAMES = TM_CHOC.frames;

export type Rank = {r: number; start: number; end: number; img?: string; brand: string; pct?: string; at: number; brandAt: number; pros: {text: string; at: number; good: boolean}[]};
export const RANKS: Rank[] = [
  {r: 10, img: 'choc/packs/choc_1.png', start: 9.772, end: 15.706, brand: 'Galaxy Fusion', pct: '70%', at: 9.9, brandAt: 11.072, pros: [{text: 'Good cacao %', at: 13.132, good: true}, {text: 'A lot of sugar', at: 14.432, good: false}]},
  {r: 9, img: 'choc/packs/choc_2.png', start: 15.706, end: 25.216, brand: 'Lindt', pct: '70%', at: 16.266, brandAt: 16.666, pros: [{text: 'Rich, premium', at: 19.086, good: true}, {text: 'Very expensive', at: 21.386, good: false}]},
  {r: 8, img: 'choc/packs/choc_3.png', start: 25.216, end: 34.882, brand: 'Cadbury Bournville', at: 25.3, brandAt: 26.136, pros: [{text: 'Super affordable', at: 27.776, good: true}, {text: 'Sugar slightly high', at: 29.216, good: false}, {text: 'Cacao % varies', at: 31.796, good: false}]},
  {r: 7, img: 'choc/packs/choc_4.png', start: 34.882, end: 41.289, brand: 'Manam Chocolate', at: 35.522, brandAt: 35.902, pros: [{text: 'Premium Indian craft brand', at: 36.842, good: true}, {text: 'On the expensive side', at: 39.502, good: false}]},
  {r: 6, img: 'choc/packs/choc_5.png', start: 41.289, end: 48.123, brand: 'Mason & Co.', at: 41.4, brandAt: 42.289, pros: [{text: 'Premium bean-to-bar', at: 43.269, good: true}, {text: 'For craft-chocolate fans', at: 45.249, good: true}]},
  {r: 5, img: 'choc/packs/choc_6.png', start: 48.123, end: 56.456, brand: 'Soothys', at: 48.2, brandAt: 49.263, pros: [{text: 'Premium vegan option', at: 50.903, good: true}, {text: 'Dairy-free', at: 55.083, good: true}]},
  {r: 4, img: 'choc/packs/choc_7.png', start: 56.456, end: 63.938, brand: 'Smoor', pct: '70%', at: 56.876, brandAt: 57.516, pros: [{text: 'Indian brand', at: 59.316, good: true}, {text: 'Rich dark cacao taste', at: 61.876, good: true}]},
  {r: 3, img: 'choc/packs/choc_8.png', start: 63.938, end: 72.971, brand: 'Paul & Mike', pct: '72%', at: 64.0, brandAt: 64.958, pros: [{text: 'Homegrown bean-to-bar', at: 67.598, good: true}, {text: 'Exciting cacao options', at: 70.998, good: true}]},
  {r: 2, img: 'choc/packs/choc_9.png', start: 72.971, end: 82.177, brand: 'The Whole Truth', pct: '71%', at: 73.591, brandAt: 74.051, pros: [{text: 'Easy to find', at: 76.371, good: true}, {text: 'Sweetened with dates', at: 77.211, good: true}, {text: '~21 g sugar / 100 g', at: 79.311, good: false}]},
  {r: 1, img: 'choc/packs/choc_10.png', start: 82.177, end: 90.211, brand: 'Amul Bitter', pct: '75%', at: 82.817, brandAt: 83.237, pros: [{text: 'Accessible + affordable', at: 85.677, good: true}, {text: 'Higher cacao %', at: 88.317, good: true}]},
];
export const INTRO = {start: 0.0, end: 9.7, crit: [{text: 'Cacao %', at: 5.88}, {text: 'Sugar', at: 7.18}, {text: 'Ingredients', at: 7.88}, {text: 'Value for Money', at: 9.0}]};
export const MYTH = {start: 90.211, end: 94.1, at: 90.911};
export const CTA_AT = 98.331;

const moves = [punch(0.0, 1.9, 1.06), punch(90.211, 93.9, 1.08), punch(94.191, 97.9, 1.06)];

export const choc: AdConfig = {
  tm: TM_CHOC,
  cfg: adConfig('choc', TM_CHOC, captions, moves, [{start: 97.6, end: 999}]),
  mix: true,
  capY: 1260,
  behindLine: 760,
  behind: [{start: 98.6, end: 999, lines: [{text: 'CACAO', at: 98.811, size: 230}]}],
  pills: [],
  cuts: [],
  leaks: [9.772, 90.211],
};
