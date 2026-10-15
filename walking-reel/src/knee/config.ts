import {BOTTOM, FACE_ORIGIN, Move, ReelConfig, retime} from '../series/core';
import {TimeMap} from '../series/timemap';
import timemap from './timemap.json';
import captions from './captions.json';

/**
 * Knee-injury reel. Every cut sits in a pause between her sentences.
 * Source: 74.9 s (2247 frames).
 */
export const TM = timemap as TimeMap;
export const KNEE_FRAMES = TM.frames; // after trims, pause cuts and speed-up

export const K = {
  hook: {start: 0, end: 3.6},
  rehab: {start: 3.6, end: 6.0}, // B-roll: resistance band in bed ("prolonged bed rest")
  deadline: {start: 10.4, end: 16.9}, // behind her head
  questions: {start: 16.9, end: 28.4}, // full-screen
  panel: {start: 33.2, end: 43.9}, // split layout: predicted vs actual
  weeks: {start: 43.9, end: 50.35}, // full-screen
  gym: {start: 50.35, end: 57.55}, // B-roll: deadlift + leg extension
  year: {start: 57.55, end: 61.85}, // behind her head: 2026
  attention: {start: 61.85, end: 70.55}, // full-screen
  cta: {start: 70.55, end: 99},
};

retime(TM, K, []);
const moves: Move[] = [
  // first frame: opens punched in, snaps back out (pattern interrupt)
  {origin: FACE_ORIGIN, inStart: TM.segs[0].s0, inDur: 0.01, scale: 1.22, outStart: TM.segs[0].s0, outDur: 0.42},
  // "There's science behind reviewing the response too."
  {origin: FACE_ORIGIN, inStart: 28.6, inDur: 0.6, scale: 1.08, outStart: 33.15, outDur: 0.05},
  {origin: BOTTOM, inStart: K.panel.start, inDur: 0.7, scale: 0.72, outStart: K.panel.end - 0.05, outDur: 0.05, panel: true},
  // "So I know how personal a weight loss starting point can be."
  {origin: FACE_ORIGIN, inStart: 7.0, inDur: 2.4, scale: 1.05, outStart: 10.35, outDur: 0.05},
  {origin: FACE_ORIGIN, inStart: K.cta.start, inDur: 3.8, scale: 1.05, outStart: 999, outDur: 1},
];
retime(TM, {}, moves);

export const kneeConfig: ReelConfig = {
  dir: 'knee',
  gfx: [K.questions, K.weeks, K.attention],
  behind: [K.hook, K.deadline, K.year, K.cta],
  panel: K.panel,
  moves,
  broll: [
    {start: K.rehab.start, end: K.rehab.end, src: 'broll_rehab.mp4'},
    {start: K.gym.start, end: 53.9, src: 'broll_deadlift.mp4'},
    {start: 53.9, end: K.gym.end, src: 'broll_legext.mp4'},
  ],
  captions: captions as ReelConfig['captions'],
  tm: TM,
  shakes: [1.62, 15.55, 59.34, 66.14, 69.7],
};
