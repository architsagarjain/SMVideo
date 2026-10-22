import {FACE_ORIGIN, Move, ReelConfig, retime} from '../series/core';
import {TimeMap} from '../series/timemap';
import timemap from './timemap.json';
import captions from './captions.json';

/**
 * Travel-day reel (cabin crew client). Hook: an airport split-flap departures board where YOUR DIET
 * flips to CANCELLED, then the board splits open on her. The rest follows the 3-tips style: slight
 * background blur, Bright & Clean grade, words behind her head, tip headings with giant numbers,
 * her own B-roll. Times are source seconds.
 */
export const TM8 = timemap as TimeMap;
export const V8_FRAMES = TM8.frames;

export const C = {
  hook: {start: 1.01, end: 4.46}, // the departures board
  reveal: {start: 4.46, end: 6.6}, // board splits open; FLIGHTS? behind her head
  result: {start: 6.6, end: 17.6}, // cabin crew client: 72 -> 66 kg, 34 -> 28 in
  disclaimer: {start: 17.6, end: 22.7}, // her individual results
  travel: {start: 22.7, end: 31.5}, // work around TRAVEL; predictable kitchen / schedule struck out
  process: {start: 31.5, end: 35.3}, // my travel-day decision process
  tip1: {start: 35.3, end: 38.0}, // 01 NEXT MEAL
  meal: {start: 38.0, end: 40.44}, // B-roll eating
  tip2: {start: 40.44, end: 42.3}, // 02 PICK PROTEIN
  protein: {start: 42.3, end: 45.7}, // protein options
  tip3: {start: 45.7, end: 49.6}, // 03 PLAN FOR DELAYS, MEAL DELAYED flap row
  snack: {start: 49.6, end: 54.9}, // carry a practical snack, not airport choices
  train1: {start: 54.9, end: 57.3}, // B-roll push-ups
  train2: {start: 57.3, end: 59.2}, // B-roll dumbbells
  simpler: {start: 59.2, end: 61.9}, // B-roll machine: simpler session
  routine: {start: 61.9, end: 64.9}, // back to your routine
  identical: {start: 64.9, end: 68.3}, // a week of different days
  decisions: {start: 68.3, end: 73.1}, // decisions you can repeat, wherever you are
  cta: {start: 73.1, end: 999},
};
export const TIPS = [
  {w: C.tip1, n: '01', at: 35.52, title: 'NEXT MEAL', titleAt: 36.06, sub: 'where will it come from?', subAt: 36.48, chip: 'Find your next meal', chipEnd: C.meal.end},
  {w: C.tip2, n: '02', at: 40.44, title: 'PICK PROTEIN', titleAt: 41.28, sub: undefined as string | undefined, subAt: 0, chip: 'Pick protein', chipEnd: C.protein.end},
  {w: C.tip3, n: '03', at: 45.96, title: 'PLAN FOR DELAYS', titleAt: 46.52, sub: undefined as string | undefined, subAt: 0, chip: 'Plan for delays', chipEnd: C.snack.end},
];

retime(TM8, C, []);
const hold = (a: number, b: number, scale: number, inDur = 0.001): Move => ({origin: FACE_ORIGIN, inStart: a, inDur, scale, outStart: b - 0.0003, outDur: 0.0001});
// quick punch-in as each tip number lands, easing back out
const punch = (a: number, b: number): Move => ({origin: FACE_ORIGIN, inStart: a, inDur: 0.28, scale: 1.08, outStart: b - 0.5, outDur: 0.5});
const moves: Move[] = [
  {origin: FACE_ORIGIN, inStart: C.reveal.start, inDur: 0.6, scale: 1.0, outStart: 9999, outDur: 1}, // placeholder (no zoom during the reveal)
  hold(19.62, C.disclaimer.end, 1.08), // "not a promise"
  punch(TIPS[0].at, C.tip1.end),
  punch(TIPS[1].at, C.tip2.end),
  punch(TIPS[2].at, C.tip3.end),
  hold(65.84, C.identical.end, 1.1), // "every day"
  {origin: FACE_ORIGIN, inStart: C.cta.start, inDur: 3.0, scale: 1.08, outStart: 9999, outDur: 1},
].filter((m) => m.scale !== 1.0);
retime(TM8, {}, moves);

export const v8Config: ReelConfig = {
  dir: 'v8',
  gfx: [C.hook],
  behind: [],
  moves,
  broll: [
    {start: C.meal.start, end: C.meal.end, src: 'b_eat.mp4'},
    {start: C.train1.start, end: C.train1.end, src: 'b_pushups.mp4'},
    {start: C.train2.start, end: C.train2.end, src: 'b_dumbbell.mp4'},
    {start: C.simpler.start, end: C.simpler.end, src: 'b_machine.mp4'},
  ],
  captions: captions as ReelConfig['captions'],
  tm: TM8,
  blur: 8, // slight portrait-mode blur; her feathered cut-out stays sharp on top
  clean: true,
  grade: {filter: 'brightness(1.08) contrast(1.08) saturate(1.18)'}, // "Bright & Clean"
  noCaptions: [C.hook, C.tip1, C.tip2, C.cta],
};
