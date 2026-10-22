import {FACE_ORIGIN, Move, ReelConfig, retime} from '../series/core';
import {TimeMap} from '../series/timemap';
import timemap from './timemap.json';
import captions from './captions.json';

/**
 * "6-day split vs full body for busy women". Batch look (kit3: white top wash, ink headlines with a
 * yellow highlight, white cards, dark-pill subtitles). Signature piece: a weekly planner card that
 * morphs between a 6-day split, a crowded work week and three full-body days. Times are source s.
 */
export const TM12 = timemap as TimeMap;
export const V12_FRAMES = TM12.frames;

export const C = {
  hook: {start: 0.82, end: 6.2}, // the 6-day split planner, then a busy week crashes into it
  study: {start: 6.2, end: 19.9}, // 2024 meta-analysis: split vs full body, volume matched -> same
  volume: {start: 19.9, end: 25.5}, // volume = how much training; matching it is the condition
  names: {start: 25.5, end: 32.8}, // the label on a program doesn't make it equivalent
  three: {start: 32.8, end: 41.8}, // 3 full-body days vs a body part per weekday
  meeting: {start: 41.8, end: 49.8}, // a late meeting moves Wednesday -> Thursday, nothing skipped
  moves: {start: 49.8, end: 55.6}, // push / pull / lower (her B-roll cards)
  keep: {start: 55.6, end: 62.3}, // consistent, challenging, tracked
  enjoy: {start: 62.3, end: 66.6}, // enjoy a split? fine
  calendar: {start: 66.6, end: 73.3}, // busy-looking calendar vs simple one
  cta: {start: 73.3, end: 999},
};
retime(TM12, C, []);

const hold = (a: number, b: number, scale: number): Move => ({origin: FACE_ORIGIN, inStart: a, inDur: 0.3, scale, outStart: b - 0.35, outDur: 0.35});
const moves: Move[] = [hold(2.92, C.hook.end, 1.08), hold(14.5, 16.0, 1.06), hold(44.22, 46.0, 1.08), hold(69.58, C.calendar.end, 1.07)];
retime(TM12, {}, moves);

export const v12Config: ReelConfig = {
  dir: 'v12',
  gfx: [],
  behind: [],
  moves,
  broll: [],
  captions: captions as ReelConfig['captions'],
  tm: TM12,
  grade: {filter: 'brightness(1.03) contrast(1.06) saturate(1.08)'},
  cut: [{start: 0, end: 999}],
};
