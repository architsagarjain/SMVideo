import {BOTTOM, FACE_ORIGIN, Move, ReelConfig, retime} from '../series/core';
import {TimeMap} from '../series/timemap';
import timemap from './timemap.json';
import captions from './captions.json';

/**
 * "More cardio isn't the answer" reel. Talking head with the Bright & Clean grade; for the B-roll
 * moments the frame turns into a white stage: her cut-out shrinks into the lower half (body visible)
 * and a rounded B-roll / graphic card sits on top. Kinetic keyword text, one word behind her head
 * per section. Times are source seconds.
 */
export const TM6 = timemap as TimeMap;
export const V6_FRAMES = TM6.frames;

export const C = {
  hookA: {start: 1.13, end: 2.75}, // her: stopped losing FAT?
  hookB: {start: 2.75, end: 4.85}, // white stage + treadmill card: MORE CARDIO? x
  happens: {start: 4.85, end: 7.83}, // here's what usually happens
  scale: {start: 7.83, end: 9.75}, // card: the scale doesn't move
  esc1: {start: 9.75, end: 12.36}, // card: treadmill, +20 MIN CARDIO
  esc2: {start: 12.36, end: 13.7}, // card: deadlift, +1 WORKOUT
  esc3: {start: 13.7, end: 16.4}, // card: treadmill, CARDIO EVERY DAY
  crash: {start: 16.4, end: 23.78}, // meters: energy down, hunger up, movement down
  notBad: {start: 24.13, end: 25.8}, // cardio isn't bad
  benefits: {start: 25.8, end: 28.12}, // full-frame B-roll: it has its benefits
  punish: {start: 28.44, end: 31.6}, // PUNISH behind her head
  p1: {start: 31.6, end: 34.2}, // card: eating, 1 calorie deficit
  p2: {start: 34.2, end: 35.3}, // card: eating, 2 protein
  p3: {start: 35.3, end: 36.7}, // card: machine, 3 strength training
  p4: {start: 36.7, end: 37.72}, // card: cricket, 4 daily movement
  more: {start: 38.06, end: 40.0}, // MORE isn't always BETTER
  strategy: {start: 40.0, end: 42.37}, // the right STRATEGY
  cta: {start: 42.68, end: 999},
};
export const PILLARS = [
  {w: C.p1, n: '1', label: 'Calorie deficit', at: 33.08},
  {w: C.p2, n: '2', label: 'Enough protein', at: 34.38},
  {w: C.p3, n: '3', label: 'Strength training', at: 35.36},
  {w: C.p4, n: '4', label: 'Daily movement', at: 36.74},
];

retime(TM6, C, []);
// built after retime so the spans use the snapped windows
/** The card spans: one rounded B-roll card on top of the white stage; `from` = seconds into the clip. */
export const CARD = [
  {w: C.hookB, src: 'c_tread1.mp4', from: 0},
  {w: C.esc1, src: 'c_tread2.mp4', from: 0},
  {w: C.esc2, src: 'c_lift.mp4', from: 0},
  {w: C.esc3, src: 'c_tread2.mp4', from: 2.6},
  {w: {start: C.p1.start, end: C.p2.end}, src: 'c_eat.mp4', from: 0},
  {w: C.p3, src: 'c_machine.mp4', from: 0},
  {w: C.p4, src: 'c_cricket2.mp4', from: 0},
];
/** Continuous card runs (the card slides in at the first and out at the last). */
export const CARD_RUNS = [
  {start: C.hookB.start, end: C.hookB.end},
  {start: C.scale.start, end: C.esc3.end},
  {start: C.p1.start, end: C.p4.end},
];
const hold = (a: number, b: number, scale: number, inDur = 0.001): Move => ({origin: FACE_ORIGIN, inStart: a, inDur, scale, outStart: b - 0.0003, outDur: 0.0001});
// white stage: she shrinks into the lower half from the bottom edge, then grows back
const stage = (w: {start: number; end: number}): Move => ({origin: BOTTOM, inStart: w.start, inDur: 0.45, scale: 0.76, outStart: w.end - 0.4, outDur: 0.4});
const moves: Move[] = [
  ...CARD_RUNS.map(stage),
  hold(C.notBad.start, C.notBad.end, 1.1), // jump-zoom: "I'm not saying cardio is bad"
  {origin: FACE_ORIGIN, inStart: 29.62, inDur: 0.28, scale: 1.1, outStart: C.punish.end - 0.4, outDur: 0.4}, // punch on "punish"
  hold(C.more.start, C.more.end, 1.08),
  {origin: FACE_ORIGIN, inStart: C.cta.start, inDur: 3.0, scale: 1.08, outStart: 9999, outDur: 1},
];
retime(TM6, {}, moves);

export const v6Config: ReelConfig = {
  dir: 'v6',
  gfx: [],
  behind: [],
  moves,
  broll: [{start: C.benefits.start, end: C.benefits.end, src: 'c_cricket.mp4'}],
  captions: captions as ReelConfig['captions'],
  tm: TM6,
  // her cut-out on top for the white stage and where a word sits behind her head
  cut: [...CARD_RUNS, C.punish, C.cta],
  clean: true,
  grade: {filter: 'brightness(1.08) contrast(1.08) saturate(1.18)'}, // "Bright & Clean"
  noCaptions: [C.scale, C.cta], // the scale card carries its own line
};
