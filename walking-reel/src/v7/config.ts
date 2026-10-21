import {BOTTOM, FACE_ORIGIN, Move, ReelConfig, retime} from '../series/core';
import {TimeMap} from '../series/timemap';
import timemap from './timemap.json';
import captions from './captions.json';

/**
 * "Stop eating healthy snacks" reel. New idea for this one: a snack receipt that prints line by line
 * as she lists them, on the white stage (her cut-out shrinks into the lower half), illustrated snack
 * stickers, a giant +500 behind her head, and a "your day" timeline. Bright & Clean grade, no blur.
 * Times are source seconds.
 */
export const TM7 = timemap as TimeMap;
export const V7_FRAMES = TM7.frames;

export const C = {
  hook: {start: 0.9, end: 4.3}, // STOP behind her, snack stickers around her get crossed out
  hear: {start: 4.3, end: 7.2}, // sounds wrong? hear me out
  receipt: {start: 7.2, end: 19.6}, // white stage: the snack receipt prints as she lists them
  extra: {start: 19.6, end: 27.2}, // +500 behind her head, felt like nothing
  meToo: {start: 27.2, end: 28.6}, // "I have done this too"
  great: {start: 28.6, end: 33.3}, // the four snacks, each ticked: great foods
  unlimited: {start: 33.3, end: 38.5}, // healthy is not unlimited
  meals: {start: 38.5, end: 40.85}, // full-frame B-roll eating: meals that keep you full
  day: {start: 40.85, end: 44.9}, // white stage: your day, picking vs meals
  cta: {start: 44.9, end: 999},
};
/** Receipt lines (source time each appears). */
export const ITEMS = [
  {at: 7.72, label: 'Breakfast', kcal: 'meal', icon: 'bowl'},
  {at: 9.3, label: 'Fruit', kcal: '+80', icon: 'apple'},
  {at: 12.0, label: 'Handful of almonds', kcal: '+160', icon: 'almond'},
  {at: 14.18, label: 'Protein bar', kcal: '+170', icon: 'bar'},
  {at: 17.18, label: 'Dark chocolate', kcal: '+110', icon: 'choc'},
];
export const TOTAL_AT = 18.68;

retime(TM7, C, []);
// white stage runs (her cut-out shrinks into the lower half while a card sits on top)
export const STAGE_RUNS = [C.receipt, C.day];
const hold = (a: number, b: number, scale: number, inDur = 0.001): Move => ({origin: FACE_ORIGIN, inStart: a, inDur, scale, outStart: b - 0.0003, outDur: 0.0001});
const stage = (w: {start: number; end: number}): Move => ({origin: BOTTOM, inStart: w.start, inDur: 0.45, scale: 0.76, outStart: w.end - 0.4, outDur: 0.4});
const moves: Move[] = [
  ...STAGE_RUNS.map(stage),
  {origin: FACE_ORIGIN, inStart: 0.92, inDur: 0.25, scale: 1.08, outStart: C.hook.end - 0.4, outDur: 0.4}, // punch on STOP
  hold(5.98, C.hear.end, 1.12), // jump-zoom: "hear me out"
  hold(C.meToo.start, C.meToo.end, 1.15), // close-up: "I have done this too"
  {origin: FACE_ORIGIN, inStart: C.cta.start, inDur: 3.0, scale: 1.08, outStart: 9999, outDur: 1},
];
retime(TM7, {}, moves);

export const v7Config: ReelConfig = {
  dir: 'v7',
  gfx: [],
  behind: [],
  moves,
  broll: [{start: C.meals.start, end: C.meals.end, src: 'm_eat.mp4'}],
  captions: captions as ReelConfig['captions'],
  tm: TM7,
  // her cut-out on top for the white stage and where a word sits behind her head
  cut: [C.hook, ...STAGE_RUNS, C.extra, C.cta],
  clean: true,
  grade: {filter: 'brightness(1.08) contrast(1.08) saturate(1.18)'}, // "Bright & Clean"
  noCaptions: [C.cta],
};
