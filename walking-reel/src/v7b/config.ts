import {Move, ReelConfig, retime} from '../series/core';
import {TimeMap} from '../series/timemap';
import timemap from '../v7/timemap.json';
import captions from '../v7/captions.json';

/**
 * Snack reel, phone-screen style: the whole reel plays inside an iPhone. She is on a FaceTime call;
 * the snacks get typed into Notes, the extra calories added up in Calculator, the day of picking shown
 * in Calendar, the meal B-roll plays as an Instagram story, and the CTA is an Instagram comment.
 * Same footage, time map and captions as src/v7. Times are source seconds.
 */
export const TMP = timemap as TimeMap;
export const PHONE_FRAMES = TMP.frames;

export const C = {
  face1: {start: 0.9, end: 7.2}, // FaceTime: notification banner hook, then chat bubbles
  notes: {start: 7.2, end: 19.84}, // Notes: what I ate today, typed as she lists it
  calc: {start: 19.84, end: 23.86}, // Calculator: 80+160+170+110 = 520
  face2: {start: 23.86, end: 28.6}, // FaceTime: felt like nothing / I've done this too
  notes2: {start: 28.6, end: 33.3}, // Notes: the foods aren't the problem, green checks
  alert: {start: 33.3, end: 38.5}, // FaceTime + iOS alert: Healthy is not Unlimited
  story: {start: 38.5, end: 40.85}, // Instagram story: B-roll of her eating, REAL MEALS sticker
  cal: {start: 40.85, end: 44.9}, // Calendar: snacking all day vs three meals
  cta: {start: 44.9, end: 999}, // Instagram reel + comment sheet: SNACK, then a DM with the guide
};
export const ITEMS = [
  {at: 7.72, label: 'Breakfast', kcal: 'meal'},
  {at: 9.3, label: 'Fruit', kcal: '+80 kcal'},
  {at: 12.0, label: 'Handful of almonds', kcal: '+160 kcal'},
  {at: 14.18, label: 'Protein bar', kcal: '+170 kcal'},
  {at: 17.18, label: 'Dark chocolate', kcal: '+110 kcal'},
];

retime(TMP, C, []);

// her video rectangle inside the phone screen (900 x 1600)
export type Rect = {x: number; y: number; w: number; h: number; r: number};
export const FULL: Rect = {x: 0, y: 0, w: 900, h: 1600, r: 0};
export const PIP_BR: Rect = {x: 592, y: 930, w: 276, h: 491, r: 34};
export const PIP_TL: Rect = {x: 28, y: 128, w: 200, h: 356, r: 28};
export type App = 'facetime' | 'notes' | 'notes2' | 'calc' | 'story' | 'calendar' | 'reel';
export const SCENES: {w: {start: number; end: number}; app: App; her: Rect | null}[] = [
  {w: C.face1, app: 'facetime', her: FULL},
  {w: C.notes, app: 'notes', her: PIP_BR},
  {w: C.calc, app: 'calc', her: PIP_TL},
  {w: C.face2, app: 'facetime', her: FULL},
  {w: C.notes2, app: 'notes2', her: PIP_BR},
  {w: C.alert, app: 'facetime', her: FULL},
  {w: C.story, app: 'story', her: null},
  {w: C.cal, app: 'calendar', her: PIP_BR},
  {w: C.cta, app: 'reel', her: FULL},
];

const ORIGIN: [number, number] = [450, 690]; // her face inside the phone screen
const hold = (a: number, b: number, scale: number): Move => ({origin: ORIGIN, inStart: a, inDur: 0.001, scale, outStart: b - 0.0003, outDur: 0.0001});
const moves: Move[] = [
  hold(5.98, C.face1.end, 1.1), // "hear me out"
  hold(27.36, C.face2.end, 1.12), // "I have done this too"
];
retime(TMP, {}, moves);

export const phoneConfig: ReelConfig = {
  dir: 'v7',
  gfx: [],
  behind: [],
  moves,
  broll: [],
  captions: captions as ReelConfig['captions'],
  tm: TMP,
  clean: true,
  grade: {filter: 'brightness(1.08) contrast(1.08) saturate(1.18)'}, // "Bright & Clean"
};
