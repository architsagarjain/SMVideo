import {ReelConfig, retime} from '../series/core';
import {TimeMap} from '../series/timemap';
import timemap from './timemap.json';
import captions from './captions.json';

/**
 * Check-in reel ("your coach cuts your food after every heavier weigh-in").
 * Look: dark LCD-scale hook behind her cut-out, then an editorial split screen: her in a rounded
 * card at the bottom, white infographic cards on top. Bold condensed captions (Anton) with the
 * spoken word in yellow. Her own B-roll for the "all at once" montage. Times are source seconds.
 */
export const TM9 = timemap as TimeMap;
export const V9_FRAMES = TM9.frames;

export const C = {
  hook: {start: 1.03, end: 7.9}, // LCD scale climbing, coach texts "cut 300 kcal", ASK WHAT THEY CHECKED FIRST
  study: {start: 7.9, end: 17.3}, // 42 women, +0.45 kg, mostly water
  single: {start: 17.3, end: 20.9}, // one reading can mislead (noisy chart, one spike)
  review: {start: 20.9, end: 24.1}, // before changing the plan, here's what I'd review
  check: {start: 24.1, end: 36.7}, // 4-step checklist
  real: {start: 36.7, end: 41.7}, // was the plan realistic enough to follow?
  vs: {start: 41.7, end: 51.0}, // followed plan vs too-hard plan (tower falls apart)
  measured: {start: 51.0, end: 57.0}, // one measured change, give it time
  dont: {start: 57.0, end: 58.4}, // don't keep changing...
  montage: {start: 58.4, end: 63.6}, // calories / cardio / workouts, all at once, ? what helped
  decide: {start: 63.6, end: 71.9}, // reasoned decision: KEEP THE PLAN (cursor click)
  cta: {start: 71.9, end: 999},
};
// checklist steps (source s)
export const STEPS = [
  {at: 24.16, label: 'TREND'},
  {at: 26.16, label: 'CONDITIONS'},
  {at: 28.96, label: 'CYCLE'},
  {at: 31.62, label: 'CHANGES'},
];
retime(TM9, C, []);
for (const s of STEPS) s.at = Math.max(s.at, C.check.start);

// her card in split mode (screen px)
export const CARD = {x: 36, y: 880, w: 1008, h: 1000, r: 54, s: 1.0};
export const SPLIT = [C.study, C.single, C.check, C.vs, C.measured];

export const v9Config: ReelConfig = {
  dir: 'v9',
  gfx: [],
  behind: [],
  moves: [],
  broll: [],
  captions: captions as ReelConfig['captions'],
  tm: TM9,
  grade: {filter: 'brightness(1.05) contrast(1.07) saturate(1.12)'},
  cut: [C.hook, C.review, C.real, C.decide, C.cta], // her cut-out over graphics behind her
};
