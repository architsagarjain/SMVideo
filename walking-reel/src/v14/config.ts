import {FACE_ORIGIN, Move, ReelConfig, retime} from '../series/core';
import {TimeMap} from '../series/timemap';
import timemap from './timemap.json';
import captions from './captions.json';

/**
 * "Desk job: move between workouts". Batch look (kit3). Signature piece: a day ribbon (9 am - 9 pm)
 * that fills with sitting, an evening workout, and 3-minute walking breaks every 30 minutes; plus a
 * post-meal glucose curve card. Her desk and treadmill B-roll. Times are source seconds.
 */
export const TM14 = timemap as TimeMap;
export const V14_FRAMES = TM14.frames;

export const C = {
  hook: {start: 1.02, end: 10.4}, // a desk day: one workout, many seated hours
  deskBroll: {start: 1.02, end: 5.2}, // B-roll opener: her at the desk, the sitting clock racing
  trial: {start: 10.4, end: 21.0}, // 24 adults, breaks every 30 min vs seated
  glucose: {start: 21.0, end: 29.9}, // post-meal glucose curve, -39% incremental response
  not: {start: 29.9, end: 37.9}, // what -39% is NOT (true / false swipe cards)
  promise: {start: 37.9, end: 45.9}, // results vary; but a pattern to try
  reminder: {start: 45.9, end: 53.4}, // set a reminder: a few minutes of light movement
  walk: {start: 53.4, end: 56.7}, // B-roll: walking (indoor route / water station)
  meeting: {start: 56.7, end: 60.8}, // meeting blocks a break -> do it after
  build: {start: 60.8, end: 70.6}, // breaks + training, not one evening workout
  cta: {start: 70.6, end: 999},
};
retime(TM14, C, []);

const hold = (a: number, b: number, scale: number): Move => ({origin: FACE_ORIGIN, inStart: a, inDur: 0.3, scale, outStart: b - 0.35, outDur: 0.35});
const moves: Move[] = [hold(8.52, C.hook.end, 1.07), hold(35.12, C.not.end, 1.07), hold(64.88, 67.4, 1.06)];
retime(TM14, {}, moves);

export const v14Config: ReelConfig = {
  dir: 'v14',
  gfx: [],
  behind: [],
  moves,
  broll: [
    {start: C.deskBroll.start, end: C.deskBroll.end, src: 'b_desk.mp4'},
    {start: C.walk.start, end: C.walk.end, src: 'b_walk.mp4'},
  ],
  captions: captions as ReelConfig['captions'],
  tm: TM14,
  grade: {filter: 'brightness(1.03) contrast(1.06) saturate(1.08)'},
  cut: [{start: 0, end: 999}],
};
