import {FACE_ORIGIN, Move, ReelConfig, Win, retime} from '../series/core';
import {TimeMap} from '../series/timemap';
import timemap from './timemap.json';
import captions from './captions.json';

/**
 * Busy-women reel, simplified (reference-reel style): blurred background, small clean captions,
 * one straight word or image at a time, B-roll for the things she names. Source seconds.
 */
export const TM2 = timemap as TimeMap;
export const V4B_FRAMES = TM2.frames;

export const C = {
  open: {start: 0, end: 2.6}, // B-roll desk: "If you're a BUSY WOMAN"
  stop: {start: 2.6, end: 8.6}, // STOP, then 5 different meals
  work: {start: 8.6, end: 9.75}, // B-roll: work
  meet: {start: 9.75, end: 10.5}, // B-roll: meetings
  commute: {start: 10.5, end: 11.45}, // her, word only
  social: {start: 11.45, end: 12.3}, // B-roll: friends at night
  says: {start: 12.3, end: 14.6}, // her
  chicken: {start: 14.6, end: 15.4}, // photo cutaways
  broccoli: {start: 15.4, end: 16.4},
  salad: {start: 16.4, end: 17.7},
  smoothie: {start: 17.7, end: 19.3},
  everyday: {start: 19.3, end: 20.6}, // her
  cant: {start: 20.6, end: 22.5}, // close-up, nothing else
  perfect: {start: 22.5, end: 24.3}, // "perfect" behind her
  meals: {start: 24.3, end: 28.0}, // 5-6 meals you actually like
  eat: {start: 28.0, end: 31.2}, // B-roll eating: easy to make / fits your targets
  insta: {start: 31.2, end: 36.4}, // a straight phone with an Instagram post
  follow: {start: 36.4, end: 40.2}, // still follow when you're busy
  lift: {start: 40.2, end: 41.9}, // B-roll
  push: {start: 41.9, end: 43.05}, // B-roll: 30 days
  longrun: {start: 43.05, end: 46.3}, // the long run
  cta: {start: 46.3, end: 999},
};
// windows are shared objects, so retime() below moves these too
export const FOOD: {w: Win; img: string; label: string}[] = [
  {w: C.chicken, img: 'big_chicken', label: 'Chicken'},
  {w: C.broccoli, img: 'big_broccoli', label: 'Broccoli'},
  {w: C.salad, img: 'big_salad', label: 'Fancy salad'},
  {w: C.smoothie, img: 'big_smoothie', label: 'Smoothie'},
];

retime(TM2, C, []);
const hold = (a: number, b: number, scale: number, inDur = 0.001): Move => ({origin: FACE_ORIGIN, inStart: a, inDur, scale, outStart: b - 0.0003, outDur: 0.0001});
const moves: Move[] = [
  hold(C.stop.start, C.stop.end, 1.06, 6), // slow push while she sets it up
  hold(C.cant.start, C.cant.end, 1.18), // the one close-up
  hold(C.follow.start, C.follow.end, 1.06, 3.5),
  {origin: FACE_ORIGIN, inStart: C.cta.start, inDur: 4.5, scale: 1.08, outStart: 9999, outDur: 1},
];
retime(TM2, {}, moves);

export const v4bConfig: ReelConfig = {
  dir: 'v4',
  gfx: [C.chicken, C.broccoli, C.salad, C.smoothie, C.insta, C.longrun],
  behind: [],
  moves,
  broll: [
    {start: C.open.start, end: C.open.end, src: 'broll_desk.mp4'},
    {start: C.work.start, end: C.work.end, src: 'broll_desk2.mp4'},
    {start: C.meet.start, end: C.meet.end, src: 'broll_tablet.mp4'},
    {start: C.social.start, end: C.social.end, src: 'broll_cricket.mp4'},
    {start: C.eat.start, end: C.eat.end, src: 'broll_eat.mp4'},
    {start: C.lift.start, end: C.lift.end, src: 'broll_deadlift.mp4'},
    {start: C.push.start, end: C.push.end, src: 'broll_pushups.mp4'},
  ],
  captions: captions as ReelConfig['captions'],
  tm: TM2,
  blur: 9,
  clean: true,
  noCaptions: [{start: C.work.start, end: C.social.end}],
};
