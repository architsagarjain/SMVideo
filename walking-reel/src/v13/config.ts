import {FACE_ORIGIN, Move, ReelConfig, retime} from '../series/core';
import {TimeMap} from '../series/timemap';
import timemap from './timemap.json';
import captions from './captions.json';

/**
 * "Don't change everything at once - narrow it down". Batch look (kit3). Signature piece: a mixing
 * desk of three faders (food / steps / training) that all get yanked at once, then a funnel that
 * narrows to the one real obstacle. Times are source seconds.
 */
export const TM13 = timemap as TimeMap;
export const V13_FRAMES = TM13.frames;

export const C = {
  hook: {start: 0.95, end: 7.3}, // three faders, all moved on the same day
  which: {start: 7.3, end: 13.6}, // better result, but which fader did it?
  work: {start: 13.6, end: 17.4}, // to-do list for the person following the plan
  funnel: {start: 17.4, end: 36.8}, // 3-step funnel: trend flat? followed (weekends)? one obstacle
  fixes: {start: 36.8, end: 46.4}, // portions -> one repeatable meal; calendar -> move the schedule
  adjust: {start: 46.4, end: 54.8}, // still flat -> one measured nudge
  review: {start: 54.8, end: 61.9}, // review after a pattern; interval depends
  stable: {start: 61.9, end: 66.3}, // other faders locked
  note: {start: 66.3, end: 73.0}, // check-in note: why + what next
  cta: {start: 73.0, end: 999},
};
retime(TM13, C, []);

const hold = (a: number, b: number, scale: number): Move => ({origin: FACE_ORIGIN, inStart: a, inDur: 0.3, scale, outStart: b - 0.35, outDur: 0.35});
const moves: Move[] = [hold(6.62, C.hook.end, 1.08), hold(12.38, C.which.end, 1.06), hold(29.24, 30.6, 1.07), hold(64.36, C.stable.end, 1.06)];
retime(TM13, {}, moves);

export const v13Config: ReelConfig = {
  dir: 'v13',
  gfx: [],
  behind: [],
  moves,
  broll: [],
  captions: captions as ReelConfig['captions'],
  tm: TM13,
  grade: {filter: 'brightness(1.03) contrast(1.06) saturate(1.08)'},
  cut: [{start: 0, end: 999}],
};
