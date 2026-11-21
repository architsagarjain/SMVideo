import {TimeMap} from '../series/timemap';
import {punch} from '../minimal/kit';
import {AdConfig} from '../ads/AdReel';
import {adConfig} from '../ads/make';
import timemap from './timemap.json';
import captions from './captions.json';

/** Ad B - same script (IMG_2607), different hook for A/B testing: opens on B-roll with the line already on
 *  screen, a City-walk "featured" cutaway, ? pills for the objections. Source seconds. */
export const TM_AD7 = timemap as TimeMap;
export const AD7_FRAMES = TM_AD7.frames;
const moves = [punch(13.6, 15.1, 1.08), punch(26.18, 28.2, 1.14), punch(32.62, 35.4, 1.08), punch(38.94, 40.7, 1.08)];

export const ad7: AdConfig = {
  tm: TM_AD7,
  cfg: adConfig('ad7', TM_AD7, captions, moves, [{start: 5.8, end: 8.0}, {start: 40.6, end: 999}]),
  dolly: {start: 5.92, end: 7.8},
  pills: [
    {start: 15.1, end: 19.95, items: [{text: 'Having a plan', at: 15.2, kind: 'check'}, {text: 'Making it work for your life', at: 17.58, kind: 'dot'}]},
    {start: 21.5, end: 26.1, items: [{text: 'Busy?', at: 21.82, kind: 'q'}, {text: 'Eating out?', at: 22.12, kind: 'q'}, {text: "Can't stick to it?", at: 23.8, kind: 'q'}]},
    {start: 35.5, end: 38.85, items: [{text: 'Pizza nights', at: 35.78, kind: 'check'}, {text: 'Chole bhature', at: 37.26, kind: 'check'}]},
  ],
  behind: {start: 5.92, end: 7.75, lines: [{text: 'WHY PAY FOR', at: 6.04, size: 130}, {text: 'A COACH?', at: 6.92, size: 215}]},
  counter: {start: 8.22, end: 10.6, at: 9.08, value: 500, suffix: '+', label: 'women coached'},
  cuts: [
    {start: 0.85, end: 3.68, src: 'b_typing.mp4', line: 'FREE DIET PLANS. | FREE WORKOUTS.', times: [0.9, 1.0, 1.1, 3.28, 3.38], y: 1120, dive: true},
    {start: 3.7, end: 5.9, src: 'b_ipad.mp4', line: 'EVERYWHERE | ONLINE.', times: [4.48, 5.22], y: 1150, dive: true, flash: 'abstract-orange-glow.mp4'},
    {start: 10.62, end: 13.5, src: 'b_timessquare.mp4', line: 'FEATURED IN | TIMES SQUARE, NYC', times: [11.1, 11.3, 11.88, 12.16, 12.5], y: 560, dive: true, flash: 'soothing-yellow-light-shapes.mp4'},
    {start: 28.28, end: 32.5, src: 'b_home.mp4', line: 'A WORKOUT + DIET | THAT FITS YOUR ROUTINE', times: [29.1, 29.3, 29.46, 30.52, 30.74, 31.0, 31.28, 31.56], y: 1180, dive: true, flash: 'abstract-orange-glow.mp4'},
  ],
  cta: {start: 38.94, bookAt: 40.84, priceAt: 44.24, tapAt: 46.74, price: '₹99', closing: "Let's talk"},
};
