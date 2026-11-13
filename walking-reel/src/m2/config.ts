import {ReelConfig, retime} from '../series/core';
import {TimeMap} from '../series/timemap';
import {Cut, punch} from '../minimal/kit';
import timemap from './timemap.json';
import captions from './captions.json';

/** Breakfast ratios reel, minimal style. Signature: a before/after carb:protein read-out per dish. Source seconds. */
export const TM_M2 = timemap as TimeMap;
export const M2_FRAMES = TM_M2.frames;

export type Pill = [text: string, at: number];
/** One dish swap. Before: full-screen photo of the dish with its red ratio (b0-b1, ratio pops at bAt).
 *  Then her talking head with quantity pills (or a special graphic). After: full-screen photo of the
 *  swap with its green ratio (a0-a1, ratio pops at aAt). */
export type Dish = {img0: string; img1: string; n: number; before: string; ratio: string; after: string; result: string; b0: number; b1: number; bAt: number; nameAt?: number; a0: number; a1: number; aAt: number; pills: Pill[]; pillsEnd: number};
export const DISHES: Dish[] = [
  {n: 1, img0: 'dosa', img1: 'chilla', before: 'Dosa + Sambar', ratio: '6 : 1', after: 'Moong Dal Chilla + Curd', result: '1 : 1', b0: 32.48, b1: 35.15, bAt: 33.98, a0: 40.35, a1: 42.4, aAt: 41.06,
    pills: [['Moong dal chilla', 36.06], ['or pesarattu', 37.4], ['+ a katori of curd', 38.74]], pillsEnd: 40.35},
  {n: 2, img0: 'poha', img1: 'paneer', before: 'Poha', ratio: '6 : 1', after: 'Poha + Paneer + Peanuts', result: '1.5 : 1', b0: 42.4, b1: 44.25, bAt: 43.22, a0: 52.4, a1: 55.5, aAt: 53.08,
    pills: [['+ 50 g paneer', 45.64], ['+ 2 tbsp peanuts', 48.26], ['+ curd on the side', 50.62]], pillsEnd: 52.4},
  {n: 3, img0: 'idli', img1: 'eggbhurji', before: 'Idli + Sambar', ratio: '4.5 : 1', after: '2 Idlis + Egg Bhurji', result: '1.1 : 1', b0: 55.5, b1: 58.45, bAt: 56.64, a0: 66.75, a1: 69.44, aAt: 67.32,
    pills: [['+ 2 ladles of thick sambar', 60.82], ['+ egg or paneer bhurji', 64.16]], pillsEnd: 66.75},
  {n: 4, img0: 'upma', img1: 'eggs', before: 'Upma', ratio: '6 : 1', after: 'Half Rava + 2 Eggs', result: '1.1 : 1', b0: 69.44, b1: 71.4, bAt: 69.98, a0: 78.3, a1: 81.22, aAt: 79.36,
    pills: [['Half the rava', 71.94], ['+ green peas', 73.94], ['+ 2 eggs + paneer', 75.52]], pillsEnd: 78.3},
  {n: 5, img0: 'sandwich', img1: 'eggtoast', before: 'Cheese Sandwich', ratio: '4 : 1', after: '1 Slice + Egg', result: 'Protein > Carbs', b0: 81.22, b1: 84.15, bAt: 82.82, a0: 89.55, a1: 92.64, aAt: 90.44,
    pills: [], pillsEnd: 89.55},
  {n: 6, img0: 'paratha', img1: 'paneerparatha', before: 'Aloo Paratha', ratio: '7 : 1', after: 'Paneer Paratha + Curd', result: '1.5 : 1', b0: 92.64, b1: 96.5, bAt: 95.14, nameAt: 93.76, a0: 103.8, a1: 106.3, aAt: 104.38,
    pills: [['1 paratha, not 2', 96.86], ['Stuffed with paneer, not aloo', 99.02], ['+ yogurt, not just pickle', 101.4]], pillsEnd: 103.8},
];
/** The full-screen food photos, in order (before / after of each dish). */
export type FoodShot = {start: number; end: number; img: string; name: string; ratio: string; at: number; nameAt: number; good: boolean};
export const SHOTS: FoodShot[] = DISHES.flatMap((d) => [
  {start: d.b0, end: d.b1, img: d.img0, name: d.before, ratio: d.ratio, at: d.bAt, nameAt: d.nameAt ?? d.b0 + 0.1, good: false},
  {start: d.a0, end: d.a1, img: d.img1, name: d.after, ratio: d.result, at: d.aAt, nameAt: d.a0 + 0.1, good: true},
]);
/** Idli: four idlis, two get struck ("2 idlis instead of 4"). Sandwich: two slices, one flies off, egg lands. */
export const IDLI = {start: 58.45, end: 60.7, strikeAt: 59.4};
export const BREAD = {start: 84.15, end: 89.55, offAt: 85.24, eggAt: 87.24, moreAt: 88.18};
export const C = {
  ratio: {start: 9.8, end: 15.3}, // carb : protein about 6 : 1
  dolly: {start: 1.92, end: 3.5}, // "desserts for breakfast." - dolly zoom
  foods: {start: 3.55, end: 7.3}, // the dishes pop in as photos as she names them
  card: {start: 29.55, end: 32.85}, // ink floods in -> cream card "Just change what's on your plate" -> ink recedes
  cta: {start: 116.75, end: 999},
};
export const CUTS: Cut[] = [
  {start: 21.5, end: 24.86, src: 'b_knee.mp4', line: 'THE KNEES. THE SUGAR. | THE MEDICINES.', y: 760, times: [21.56, 21.7, 22.3, 22.46, 22.9, 23.08], dive: true, flash: 'abstract-orange-glow.mp4'},
  {start: 24.9, end: 27.3, src: 'b_lunge.mp4', line: "I'M NOT | DOING THAT", y: 200, times: [24.92, 25.16, 25.34, 25.58], dive: true, flash: 'soothing-yellow-light-shapes.mp4'},
  {start: 108.0, end: 114.86, src: 'b_bowl_full.mp4', line: 'SAME KITCHEN. | SAME TASTE.', y: 260, times: [109.18, 109.36, 110.04, 110.22], lineEnd: 112.2, line2: 'ONLY THE RATIOS | CHANGED', times2: [112.22, 112.42, 112.66, 113.08], dive: true, flash: 'abstract-orange-glow.mp4'},
];
retime(TM_M2, C, []);
for (const c of CUTS) retime(TM_M2, {c}, []);
for (const sh of SHOTS) retime(TM_M2, {sh}, []);
retime(TM_M2, {IDLI, BREAD}, []);

const moves = [
  punch(0.5, 1.9, 1.08),
  punch(7.2, 8.42, 1.14), // "all dessert."
  punch(12.9, 15.5, 1.1), // "a dessert with a tadka on it"
  punch(19.38, 21.45, 1.08),
  punch(27.44, 30.1, 1.08),
  // mid-explanation of each swap, between the two food photos
  ...DISHES.map((d) => punch(d.b1 + (d.a0 - d.b1) * 0.45, d.a0 - 0.02, 1.08)),
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
  cut: [{start: 1.92, end: 3.5}, {start: 116.75, end: 999}], // her cut-out for the dolly zoom and orbit ring
};
