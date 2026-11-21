import {TimeMap} from '../series/timemap';
import {punch} from '../minimal/kit';
import {AdConfig} from '../ads/AdReel';
import {adConfig} from '../ads/make';
import {BRAND} from '../ads/extras';
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
  mix: true,
  zoom: {start: 5.92, end: 7.75},
  search: {start: 0.9, end: 3.66, query: 'free diet plans', typeFrom: 0.95, typeTo: 2.2, results: [{title: 'Fat-loss diet plan', at: 2.4}, {title: 'Home workout plan', at: 3.28}, {title: '7-day meal chart', at: 3.42}]},
  pills: [
    {start: 15.1, end: 19.95, items: [{text: 'Having a plan', at: 15.2, kind: 'check'}, {text: 'Making it work for your life', at: 17.58, kind: 'dot'}]},
    {start: 21.5, end: 26.1, items: [{text: 'Busy?', at: 21.82, kind: 'q'}, {text: 'Eating out?', at: 22.12, kind: 'q'}, {text: "Can't stick to it?", at: 23.8, kind: 'q'}]},
  ],
  behind: {start: 5.92, end: 7.75, lines: [{text: 'why pay for', at: 6.04, size: 130, serif: true}, {text: 'A COACH?', at: 6.92, size: 190}]},
  women: {start: 8.22, end: 10.6, popFrom: 8.26, at: 9.08, value: 500, label: 'women coached'},
  neon: {start: 10.62, end: 13.5, at: 11.1},
  cards: {start: 35.5, end: 38.85, dir: 'ad7', items: [{img: 'pizza', label: 'Pizza nights', at: 35.78, keep: true, stamp: 'YES'}, {img: 'chole', label: 'Chole bhature', at: 37.26, keep: true, stamp: 'YES'}]},
  cuts: [
    {start: 0.85, end: 3.68, src: 'b_typing.mp4'}, // the search bar types over it
    {start: 3.7, end: 5.9, src: 'b_ipad.mp4', line: 'Everywhere | online.', times: [4.48, 5.22], y: 1185, mix: true, flash: 'abstract-orange-glow.mp4'},
    {start: 10.62, end: 13.5, src: 'b_timessquare.mp4', flash: 'soothing-yellow-light-shapes.mp4'}, // neon sign on top
    {start: 28.28, end: 32.5, src: 'b_home.mp4', line: '_A workout + diet | _that fits _your routine', times: [29.1, 29.3, 29.46, 30.52, 30.74, 31.0, 31.28, 31.56], y: 1180, mix: true, flash: 'abstract-orange-glow.mp4'},
  ],
  cta: {start: 38.94, bookAt: 40.84, priceAt: 44.24, tapAt: 46.74, price: '₹99', closing: "Let's talk", color: BRAND, grot: true},
};
