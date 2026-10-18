import {BOTTOM, FACE_ORIGIN, Move, ReelConfig, retime} from '../series/core';
import {TimeMap} from '../series/timemap';
import timemap from './timemap.json';
import captions from './captions.json';

/**
 * "Busy women" reel. Viral-style: opens on B-roll with the voice on frame one, portrait-mode
 * blurred background, punch-in jump zooms every few seconds, word-by-word captions.
 * Times are source seconds; the time map trims the head/tail and the pauses.
 */
export const TM = timemap as TimeMap;
export const V4_FRAMES = TM.frames;

export const B = {
  open: {start: 0, end: 2.6}, // B-roll: at her desk + notifications (visual hook)
  stop: {start: 2.6, end: 8.6}, // STOP + 5 meals + every single day
  work: {start: 8.6, end: 9.75}, // montage: work
  meet: {start: 9.75, end: 10.5}, // montage: meetings
  commute: {start: 10.5, end: 11.45}, // montage: commute (graphic)
  social: {start: 11.45, end: 12.3}, // montage: social life
  food: {start: 12.3, end: 20.6}, // chicken, broccoli, salad, smoothie
  cant: {start: 20.6, end: 22.5}, // tight punch-in, the pile falls
  perfect: {start: 22.5, end: 24.3}, // PERFECT behind her, struck through
  panel: {start: 24.3, end: 31.2}, // split: 5-6 meals you like / easy / fit your targets
  insta: {start: 31.2, end: 40.2}, // full-screen: Instagram vs real life
  lift: {start: 40.2, end: 41.9}, // B-roll deadlift
  push: {start: 41.9, end: 43.05}, // B-roll push-ups
  chart: {start: 43.05, end: 46.3}, // full-screen: 30-day diet vs long run
  cta: {start: 46.3, end: 999},
};
export const MONTAGE = {start: B.work.start, end: B.social.end};

retime(TM, B, []);
const hold = (a: number, b: number, scale: number, inDur = 0.001): Move => ({origin: FACE_ORIGIN, inStart: a, inDur, scale, outStart: b - 0.0003, outDur: 0.0001});
const moves: Move[] = [
  hold(B.stop.start, 5.46, 1.14),
  hold(5.46, B.stop.end, 1.04),
  hold(B.food.start, 14.7, 1.06),
  hold(14.7, B.food.end, 1.12, 0.001),
  hold(B.cant.start, B.cant.end, 1.32),
  hold(B.perfect.start, B.perfect.end, 1.06),
  {origin: BOTTOM, inStart: B.panel.start, inDur: 0.7, scale: 0.72, outStart: B.panel.end - 0.05, outDur: 0.05, panel: true},
  {origin: FACE_ORIGIN, inStart: B.cta.start, inDur: 4.5, scale: 1.12, outStart: 9999, outDur: 1},
];
retime(TM, {}, moves);

export const v4Config: ReelConfig = {
  dir: 'v4',
  gfx: [B.commute, B.insta, B.chart],
  behind: [],
  panel: B.panel,
  moves,
  broll: [
    {start: B.open.start, end: B.open.end, src: 'broll_desk.mp4'},
    {start: B.work.start, end: B.work.end, src: 'broll_desk2.mp4'},
    {start: B.meet.start, end: B.meet.end, src: 'broll_tablet.mp4'},
    {start: B.social.start, end: B.social.end, src: 'broll_social.mp4'},
    {start: B.lift.start, end: B.lift.end, src: 'broll_deadlift.mp4'},
    {start: B.push.start, end: B.push.end, src: 'broll_pushups.mp4'},
  ],
  captions: captions as ReelConfig['captions'],
  tm: TM,
  shakes: [2.64, 21.56, 24.0, 46.56],
  blur: 9,
  pop: true,
  noCaptions: [MONTAGE],
};
