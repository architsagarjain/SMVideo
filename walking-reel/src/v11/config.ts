import {FACE_ORIGIN, Move, ReelConfig, retime} from '../series/core';
import {TimeMap} from '../series/timemap';
import timemap from './timemap.json';
import captions from './captions.json';

/**
 * Rice / water-weight reel, in the batch look (her room, soft white wash, white cards, dark-pill
 * captions). Signature: a bathroom scale and a glycogen "sponge". Times are source seconds.
 */
export const TM11 = timemap as TimeMap;
export const V11_FRAMES = TM11.frames;

export const C = {
  hook: {start: 0.92, end: 10.4}, // backdrop floods in; quick scale drop; WHAT CAUSED IT?
  rice: {start: 10.4, end: 18.4}, // stop eating rice -> number falls; rice wasn't stopping fat loss
  glyco: {start: 18.4, end: 24.6}, // less carbs -> glycogen tank drains
  water: {start: 24.6, end: 31.3}, // glycogen is stored with water -> moves the scale
  three: {start: 31.3, end: 41.3}, // 1 g glycogen ~ 3 g water (varies)
  week: {start: 41.3, end: 49.6}, // one low-carb week -> no rice until December? no
  trend: {start: 49.6, end: 54.8}, // consistent intake, longer trend
  regain: {start: 54.8, end: 63.9}, // weight returns with carbs -> check context before calling it fat
  foods: {start: 63.9, end: 73.2}, // one weigh-in shouldn't change your allowed foods
  cta: {start: 73.2, end: 999},
};
retime(TM11, C, []);

const hold = (a: number, b: number, scale: number, inDur = 0.25): Move => ({origin: FACE_ORIGIN, inStart: a, inDur, scale, outStart: b - 0.3, outDur: 0.3});
const moves: Move[] = [
  hold(9.22, C.hook.end, 1.1), // "what caused it?"
  hold(15.3, C.rice.end, 1.08), // "doesn't establish"
  hold(46.22, C.week.end, 1.1), // "must avoid rice until December"
  hold(62.56, C.regain.end, 1.08), // "fat regain"
];
retime(TM11, {}, moves);

export const v11Config: ReelConfig = {
  dir: 'v11',
  gfx: [],
  behind: [],
  moves,
  broll: [],
  captions: captions as ReelConfig['captions'],
  tm: TM11,
  grade: {filter: 'brightness(1.03) contrast(1.06) saturate(1.08)'}, // on the brightened, cleaned footage
  cut: [{start: 0, end: 999}],
};
