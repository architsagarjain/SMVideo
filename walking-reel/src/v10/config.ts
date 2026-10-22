import {ReelConfig, retime} from '../series/core';
import {TimeMap} from '../series/timemap';
import timemap from './timemap.json';
import captions from './captions.json';

/**
 * Sugar-free mithai reel ("turn the box around"). Look: Diwali night. Her room is dimmed to a warm
 * plum with golden bokeh and a string of fairy lights behind her cut-out; a 3D mithai box is handed
 * to camera and spun round to its nutrition panel. Mixed type: clean sans + gold serif italics.
 * Times are source seconds.
 */
export const TM10 = timemap as TimeMap;
export const V10_FRAMES = TM10.frames;

export const C = {
  hook: {start: 1.08, end: 6.6}, // box handed to camera, TURN IT AROUND (spin to the label)
  front: {start: 6.6, end: 14.5}, // front = what the brand wants you to notice / panel = what to compare
  journey: {start: 14.5, end: 18.6}, // my weight-loss journey
  rep: {start: 18.6, end: 24.7}, // "healthy" halo, permission -> more pieces
  nuts: {start: 24.7, end: 31.4}, // still contains nuts and fat
  nine: {start: 31.4, end: 36.1}, // fat = 9 kcal per gram
  compare: {start: 36.1, end: 42.5}, // per 100 g -> my portion
  calc: {start: 42.5, end: 56.2}, // 30 g x 400 / 100 = 120 kcal (illustrative)
  enjoy: {start: 56.2, end: 62.0}, // B-roll: her eating - choose the sweet you enjoy, serve a portion
  diwali: {start: 62.0, end: 69.8}, // diyas light up: your Diwali decision
  cta: {start: 69.8, end: 999},
};
retime(TM10, C, []);

export const v10Config: ReelConfig = {
  dir: 'v10',
  gfx: [],
  behind: [],
  moves: [],
  broll: [{start: C.enjoy.start, end: C.enjoy.end, src: 'b_eat.mp4'}],
  captions: captions as ReelConfig['captions'],
  tm: TM10,
  grade: {filter: 'brightness(1.06) contrast(1.08) saturate(1.1)', warm: 0.1},
  cut: [{start: 0, end: 999}], // her cut-out over the night backdrop all the way through
};
