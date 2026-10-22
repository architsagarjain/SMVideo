import {FACE_ORIGIN, Move, ReelConfig, retime} from '../series/core';
import {TimeMap} from '../series/timemap';
import timemap from './timemap.json';
import captions from './captions.json';

/**
 * Sleep reel, re-edited in the batch look (kit3). Signature pieces: a night timeline (11 pm - 7 am)
 * that loses its last hour, and two stacked bars that fill with where the weight came from
 * (fat vs lean). Her gym B-roll for "lifting weights". Times are source seconds.
 */
export const TM15 = timemap as TimeMap;
export const V15_FRAMES = TM15.frames;

export const C = {
  hook: {start: 0.92, end: 7.2}, // the night loses an hour; fat loss dims
  two: {start: 7.2, end: 14.0}, // weight lost = fat or lean mass
  control: {start: 14.0, end: 18.0}, // sleep steers the split
  study: {start: 18.0, end: 35.7}, // two groups, same deficit, one sleeps 1 h less x5 nights
  same: {start: 35.7, end: 44.0}, // after 8 weeks: same on the scale
  comp: {start: 44.0, end: 70.0}, // 83 / 17 vs 15 / 85
  lift: {start: 70.0, end: 81.6}, // not lifting weights -> B-roll
  liftBroll: {start: 74.4, end: 78.5},
  adapt: {start: 81.6, end: 88.9}, // the body adapts somewhat (new parents)
  dialed: {start: 88.9, end: 95.3}, // everything else in place -> sleep?
  cta: {start: 95.3, end: 999},
};
retime(TM15, C, []);

const hold = (a: number, b: number, scale: number): Move => ({origin: FACE_ORIGIN, inStart: a, inDur: 0.3, scale, outStart: b - 0.35, outDur: 0.35});
const moves: Move[] = [hold(5.92, C.hook.end, 1.08), hold(42.96, C.same.end, 1.06), hold(71.28, 72.6, 1.08), hold(92.18, C.dialed.end, 1.07)];
retime(TM15, {}, moves);

export const v15Config: ReelConfig = {
  dir: 'v15',
  gfx: [],
  behind: [],
  moves,
  broll: [{start: C.liftBroll.start, end: C.liftBroll.end, src: 'b_lift.mp4'}],
  captions: captions as ReelConfig['captions'],
  tm: TM15,
  grade: {filter: 'brightness(1.03) contrast(1.06) saturate(1.08)'},
  cut: [{start: 0, end: 999}],
};
