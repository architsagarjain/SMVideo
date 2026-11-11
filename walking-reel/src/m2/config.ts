import {ReelConfig, retime} from '../series/core';
import {TimeMap} from '../series/timemap';
import {Cut, punch} from '../minimal/kit';
import timemap from './timemap.json';
import captions from './captions.json';

/** Breakfast ratios reel, minimal style. Signature: a before/after carb:protein read-out per dish. Source seconds. */
export const TM_M2 = timemap as TimeMap;
export const M2_FRAMES = TM_M2.frames;

export type Dish = {n: number; start: number; end: number; before: string; ratio: string; swapAt: number; after: string; nowAt: number; result: string};
export const DISHES: Dish[] = [
  {n: 1, start: 32.48, end: 42.2, before: 'Dosa + Sambar', ratio: '6 : 1', swapAt: 35.22, after: 'Moong Dal Chilla\n+ Yogurt', nowAt: 40.4, result: '1 : 1'},
  {n: 2, start: 42.4, end: 55.2, before: 'Poha', ratio: '6 : 1', swapAt: 44.32, after: 'Poha + Paneer,\nPeanuts, Curd', nowAt: 52.44, result: '1.5 : 1'},
  {n: 3, start: 55.5, end: 69.2, before: 'Idli + Sambar', ratio: '4.5 : 1', swapAt: 58.52, after: '2 Idlis + Sambar\n+ Egg', nowAt: 66.78, result: '1.1 : 1'},
  {n: 4, start: 69.44, end: 81.0, before: 'Upma', ratio: '6 : 1', swapAt: 71.46, after: 'Half Rava + Peas\n+ 2 Eggs', nowAt: 78.34, result: '1.1 : 1'},
  {n: 5, start: 81.22, end: 92.4, before: 'Bread & Cheese\nSandwich', ratio: '4 : 1', swapAt: 84.2, after: '1 Slice + Egg\nor Chicken', nowAt: 89.62, result: 'Protein > Carbs'},
  {n: 6, start: 92.64, end: 106.2, before: 'Aloo Paratha', ratio: '7 : 1', swapAt: 96.56, after: '1 Paratha,\nPaneer + Yogurt', nowAt: 103.86, result: '1.5 : 1'},
];
export const C = {
  ratio: {start: 8.46, end: 15.3}, // carb : protein about 6 : 1
  dolly: {start: 1.92, end: 3.5}, // "desserts for breakfast." - dolly zoom
  orbit: {start: 3.55, end: 7.18}, // the dishes orbit her as she names them
  card: {start: 29.55, end: 32.85}, // ink floods in -> cream card "Just change what's on your plate" -> ink recedes
  cta: {start: 116.75, end: 999},
};
export const CUTS: Cut[] = [
  {start: 21.5, end: 24.86, src: 'b_knee.mp4', line: 'THE KNEES. THE SUGAR. | THE MEDICINES.', y: 760, times: [21.56, 21.7, 22.3, 22.46, 22.9, 23.08], dive: true, flash: 'abstract-orange-glow.mp4'},
  {start: 24.9, end: 27.3, src: 'b_lunge.mp4', line: "I'M NOT | DOING THAT", y: 200, times: [24.92, 25.16, 25.34, 25.58], dive: true, flash: 'soothing-yellow-light-shapes.mp4'},
  {start: 108.0, end: 112.18, src: 'b_bowl.mp4', line: 'SAME KITCHEN. | SAME TASTE.', y: 260, times: [109.18, 109.36, 110.04, 110.22], dive: true, flash: 'abstract-orange-glow.mp4'},
  {start: 112.2, end: 114.86, src: 'b_bowl2.mp4', line: 'ONLY THE RATIOS | CHANGED', y: 260, times: [112.22, 112.42, 112.66, 113.08], dive: true, flash: 'soothing-yellow-light-shapes.mp4'},
];
retime(TM_M2, C, []);
for (const c of CUTS) retime(TM_M2, {c}, []);
for (const d of DISHES) retime(TM_M2, {d}, []);

const moves = [
  punch(0.5, 1.9, 1.08),
  punch(7.2, 8.42, 1.14), // "all dessert."
  punch(12.9, 15.5, 1.1), // "a dessert with a tadka on it"
  punch(16.12, 18.7, 1.12), // "flip that ratio"
  punch(19.38, 21.45, 1.08),
  punch(27.44, 30.1, 1.08),
  // swap moments in each dish
  punch(40.4, 42.3, 1.1),
  punch(52.44, 55.3, 1.1),
  punch(66.78, 69.3, 1.1),
  punch(78.34, 81.1, 1.1),
  punch(89.62, 92.5, 1.1),
  punch(103.86, 106.2, 1.1),
  punch(106.34, 107.96, 1.12), // "Look at what just happened."
  punch(114.9, 116.7, 1.14), // "That's the whole game."
];
retime(TM_M2, {}, moves);

export const m2Config: ReelConfig = {
  dir: 'm2',
  gfx: [],
  behind: [],
  moves,
  broll: [],
  captions: captions as ReelConfig['captions'],
  tm: TM_M2,
  grade: {filter: 'brightness(1.02) contrast(1.05) saturate(1.04)'},
  cut: [{start: 1.92, end: 3.5}, {start: 3.55, end: 7.18}], // her cut-out for the dolly zoom and orbit ring
};
