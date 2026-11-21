import {TimeMap} from '../series/timemap';
import {punch} from '../minimal/kit';
import {AdConfig} from '../ads/AdReel';
import {adConfig} from '../ads/make';
import timemap from './timemap.json';
import captions from './captions.json';

/** Ad C - client transformation (IMG_2608). Source seconds.
 *  PLACEHOLDERS: the client photos and the figures below are hypothetical until the real ones come in. */
export const TM_AD8 = timemap as TimeMap;
export const AD8_FRAMES = TM_AD8.frames;
const moves = [punch(4.7, 6.1, 1.08), punch(11.56, 15.0, 1.08), punch(20.96, 24.7, 1.08), punch(47.28, 49.9, 1.12)];

export const ad8: AdConfig = {
  tm: TM_AD8,
  cfg: adConfig('ad8', TM_AD8, captions, moves, [{start: 6.0, end: 8.0}, {start: 50.2, end: 999}]),
  beforeAfter: {start: 0.72, end: 4.65, beforeAt: 0.8, afterAt: 2.86, statsAt: 4.0, before: 'DAY 1', after: 'DAY 7', stats: ['−1.2 kg', '−3 cm waist']},
  behind: {start: 6.18, end: 7.95, lines: [{text: 'NOT JUST', at: 6.56, size: 140}, {text: 'PHYSICAL', at: 7.18, size: 230}]},
  counter: {start: 8.08, end: 11.0, at: 8.76, value: 500, suffix: '+', label: 'women helped'},
  badge: {start: 38.12, end: 41.75, at: 40.58},
  pills: [
    {start: 25.4, end: 30.05, items: [{text: 'Give up roti', at: 25.52, kind: 'cross'}, {text: 'Cut out favourite foods', at: 26.56, kind: 'cross'}, {text: 'Hours in the gym', at: 28.48, kind: 'cross'}]},
  ],
  cuts: [
    {start: 38.12, end: 41.75, src: 'b_timessquare.mp4', flash: 'soothing-yellow-light-shapes.mp4'}, // real Times Square footage under the badge
    {start: 15.62, end: 16.82, src: 'b_gym.mp4', line: 'STRONGER', lineAt: 15.68, y: 380, dive: true},
    {start: 16.82, end: 18.22, src: 'b_walk.mp4', line: 'CONFIDENT', lineAt: 16.86, y: 420, dive: true},
    {start: 18.22, end: 20.9, src: 'b_home.mp4', line: 'A ROUTINE THAT | WORKS FOR YOU', times: [18.82, 18.9, 19.1, 19.82, 20.12, 20.3], y: 1180, dive: true, flash: 'abstract-orange-glow.mp4'},
    {start: 30.14, end: 33.6, src: 'b_call.mp4', line: 'BUILT AROUND | YOUR LIFESTYLE', times: [30.32, 32.18, 32.56, 32.82, 33.16], y: 1120, dive: true, flash: 'soothing-yellow-light-shapes.mp4'},
    {start: 33.6, end: 37.5, src: 'b_airport.mp4', line: 'PROGRESS WITHOUT | PUTTING LIFE ON HOLD', times: [34.94, 35.4, 35.92, 36.58, 36.88, 37.1], y: 380, dive: true},
    {start: 41.82, end: 46.6, src: 'b_night.mp4', line: 'HELPING WOMEN | FEEL THEIR BEST', times: [44.44, 45.14, 45.48, 45.9, 46.1], y: 640, dive: true, flash: 'abstract-orange-glow.mp4'},
  ],
  cta: {start: 50.42, bookAt: 50.42, priceAt: 53.2, tapAt: 56.0, price: '₹99', closing: "Let's get started"},
};
