import {BOTTOM, FACE_ORIGIN, Move, ReelConfig, retime} from '../series/core';
import {TimeMap} from '../series/timemap';
import timemap from './timemap.json';
import captions from './captions.json';

/**
 * Sleep and fat loss reel (IMG_9344). Times are source seconds; the time map trims the
 * camera on/off, shortens pauses and speeds her up.
 */
export const TM = timemap as TimeMap;
export const SLEEP_FRAMES = TM.frames;

export const L = {
  hook: {start: 0, end: 7.25}, // behind: -1 HR, sleep vs fat loss
  places: {start: 7.25, end: 14.1}, // full-screen: weight lost = body fat or lean mass
  control: {start: 14.1, end: 18.1}, // behind: SLEEP is in control
  hour: {start: 18.1, end: 21.7}, // behind: 1 HOUR?
  study: {start: 21.7, end: 36.6}, // full-screen: two groups, same deficit, one sleeps 1 h less
  scale: {start: 36.6, end: 44.1}, // behind: 8 weeks, SAME on the scale
  panel: {start: 44.1, end: 70.1}, // split: where the weight came from (83/17 vs 15/85)
  panic: {start: 70.1, end: 75.4}, // behind: they weren't lifting weights
  lift: {start: 75.4, end: 79.4}, // B-roll: deadlift
  push: {start: 79.4, end: 81.9}, // B-roll: push-ups
  adapt: {start: 81.9, end: 88.95}, // full-screen: body adapts somewhat (new parents)
  dialed: {start: 88.95, end: 95.4}, // full-screen: everything else dialed in, sleep is not
  cta: {start: 95.4, end: 999},
};

retime(TM, L, []);
const moves: Move[] = [
  // first frame: opens punched in, snaps back out (pattern interrupt)
  {origin: FACE_ORIGIN, inStart: TM.segs[0].s0, inDur: 0.01, scale: 1.22, outStart: TM.segs[0].s0, outDur: 0.42},
  // "But how much of a big difference could just one hour make?"
  {origin: FACE_ORIGIN, inStart: L.hour.start, inDur: 0.5, scale: 1.08, outStart: L.hour.end - 0.05, outDur: 0.05},
  {origin: BOTTOM, inStart: L.panel.start, inDur: 0.7, scale: 0.72, outStart: L.panel.end - 0.05, outDur: 0.05, panel: true},
  {origin: FACE_ORIGIN, inStart: L.cta.start, inDur: 3.2, scale: 1.05, outStart: 9999, outDur: 1},
];
retime(TM, {}, moves);

export const sleepConfig: ReelConfig = {
  dir: 'sleep',
  gfx: [L.places, L.study, L.adapt, L.dialed],
  behind: [L.control, L.hour, L.scale, L.panic, L.cta], // hook plays on her real footage
  panel: L.panel,
  moves,
  broll: [
    {start: L.lift.start, end: L.lift.end, src: 'broll_deadlift.mp4'},
    {start: L.push.start, end: L.push.end, src: 'broll_pushups.mp4'},
  ],
  captions: captions as ReelConfig['captions'],
  tm: TM,
  shakes: [2.24, 14.66, 20.88, 40.26, 64.4, 74.56, 96.0],
};
