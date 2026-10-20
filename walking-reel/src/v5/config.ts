import {FACE_ORIGIN, Move, ReelConfig, retime} from '../series/core';
import {TimeMap} from '../series/timemap';
import timemap from './timemap.json';
import captions from './captions.json';

/**
 * "3 tips for busy people" reel, same style as the busy-women reel: sharp footage with the Bright &
 * Clean grade, one straight element at a time, B-roll for what she names, tip headings with a giant
 * number behind her head. Times are source seconds.
 */
export const TM5 = timemap as TimeMap;
export const V5_FRAMES = TM5.frames;

export const C = {
  open: {start: 0.85, end: 2.62}, // B-roll desk: BUSY? no time for health?
  three: {start: 2.62, end: 4.25}, // "here are my 3 tips": a giant 3 behind her
  third: {start: 4.25, end: 7.2}, // "the third one changed things for me the most"
  tip1: {start: 7.2, end: 9.7}, // heading: 01 PICK EASY TASKS
  wins: {start: 9.7, end: 12.13}, // small wins build momentum
  gym: {start: 12.13, end: 13.6}, // B-roll gym: can't get to the gym?
  home: {start: 13.6, end: 14.6}, // B-roll home: work out at home
  cantEven: {start: 14.82, end: 16.2}, // her, punch-in
  hiit: {start: 16.2, end: 18.4}, // B-roll push-ups + 10 min timer
  something: {start: 18.66, end: 21.82}, // just do something
  tip2: {start: 22.19, end: 24.1}, // heading: 02 EAT ON TIME
  skip: {start: 24.1, end: 26.0}, // B-roll work: stop skipping meals
  loop: {start: 26.0, end: 30.07}, // white cutaway: skip lunch -> overeat at night -> repeat
  tip3: {start: 30.28, end: 33.43}, // heading: 03 START YOUR DAY with something you dislike
  should: {start: 33.52, end: 36.54}, // don't want to / know you should
  morning: {start: 36.9, end: 41.13}, // B-roll gym + 5:30 AM
  hated: {start: 41.19, end: 42.9}, // her, close-up
  focus: {start: 43.04, end: 45.95}, // B-roll desk: focus on work
  done: {start: 45.95, end: 48.11}, // the hard thing: done
  cta: {start: 48.45, end: 999},
};
export const TIPS = [
  {w: C.tip1, n: '01', at: 7.36, title: 'PICK EASY TASKS', titleAt: 8.24, sub: undefined as string | undefined, subAt: 0, chip: 'Pick easy tasks', chipEnd: C.something.end},
  {w: C.tip2, n: '02', at: 22.34, title: 'EAT ON TIME', titleAt: 23.12, sub: undefined as string | undefined, subAt: 0, chip: 'Eat on time', chipEnd: C.loop.start},
  {w: C.tip3, n: '03', at: 30.46, title: 'START YOUR DAY', titleAt: 31.32, sub: 'with something you dislike' as string | undefined, subAt: 31.96, chip: 'Hard thing first', chipEnd: C.done.end},
];

retime(TM5, C, []);
const hold = (a: number, b: number, scale: number, inDur = 0.001): Move => ({origin: FACE_ORIGIN, inStart: a, inDur, scale, outStart: b - 0.0003, outDur: 0.0001});
const moves: Move[] = [
  hold(C.tip1.start, C.tip1.end, 1.05, 2.4), // slow push under each heading
  hold(C.cantEven.start, C.cantEven.end, 1.12), // jump-zoom: "can't even do that?"
  hold(20.68, C.something.end, 1.1), // "just do something"
  hold(C.tip2.start, C.tip2.end, 1.05, 1.9),
  hold(C.tip3.start, C.tip3.end, 1.05, 3.1),
  hold(C.hated.start, C.hated.end, 1.18), // the one close-up
  {origin: FACE_ORIGIN, inStart: C.cta.start, inDur: 3.5, scale: 1.08, outStart: 9999, outDur: 1},
];
retime(TM5, {}, moves);

export const v5Config: ReelConfig = {
  dir: 'v5',
  gfx: [C.loop],
  behind: [],
  moves,
  broll: [
    {start: C.open.start, end: C.open.end, src: 'broll_desk.mp4'},
    {start: C.gym.start, end: C.gym.end, src: 'broll_gym.mp4'},
    {start: C.home.start, end: C.home.end, src: 'broll_home.mp4'},
    {start: C.hiit.start, end: C.hiit.end, src: 'broll_pushups.mp4'},
    {start: C.skip.start, end: C.skip.end, src: 'broll_work.mp4'},
    {start: C.morning.start, end: C.morning.end, src: 'broll_morning.mp4'},
    {start: C.focus.start, end: C.focus.end, src: 'broll_focus.mp4'},
  ],
  captions: captions as ReelConfig['captions'],
  tm: TM5,
  // her cut-out on top where a number or word sits behind her head
  cut: [C.three, C.third, C.tip1, C.wins, C.something, C.tip2, C.tip3, C.should, C.done, C.cta],
  clean: true,
  grade: {filter: 'brightness(1.08) contrast(1.08) saturate(1.18)'}, // "Bright & Clean"
  noCaptions: [C.open, C.tip1, C.tip2, C.tip3, C.skip, C.cta],
};
