import {TimeMap} from '../series/timemap';
import {punch} from '../minimal/kit';
import {AdConfig} from '../ads/AdReel';
import {adConfig} from '../ads/make';
import {BRAND} from '../ads/extras';
import timemap from './timemap.json';
import captions from './captions.json';

/** Ad A - "Why pay for a coach?" (IMG_2606). Hook: her face + "free plans" pills, then COACH? behind her head. Source seconds. */
export const TM_AD6 = timemap as TimeMap;
export const AD6_FRAMES = TM_AD6.frames;
const moves = [punch(0.95, 2.1, 1.08), punch(13.94, 15.3, 1.08), punch(26.58, 28.1, 1.14), punch(32.36, 35.1, 1.08)];

export const ad6: AdConfig = {
  tm: TM_AD6,
  cfg: adConfig('ad6', TM_AD6, captions, moves, [{start: 6.3, end: 8.4}, {start: 39.3, end: 999}]),
  mix: true,
  zoom: {start: 6.44, end: 8.25},
  pills: [],
  freeType: {start: 1.95, end: 4.95, l1: [{text: '_Free', at: 2.16}, {text: 'Diet', at: 2.68}, {text: 'Plans', at: 3.16}], l2: [{text: '_&', at: 3.5}, {text: 'Workouts', at: 3.7}], tagAt: 4.16, tag: '_cost'},
  cards: {start: 34.9, end: 37.55, dir: 'ad6', items: [{img: 'pizza', label: 'Pizza Nights', at: 35.16, keep: true, stamp: 'YES'}, {img: 'chole', label: 'Chole Bhature', at: 36.44, keep: true, stamp: 'YES'}]},
  behind: {start: 6.44, end: 8.25, lines: [{text: 'why pay for', at: 6.5, size: 130, serif: true}, {text: 'A COACH?', at: 7.4, size: 190}]},
  women: {start: 8.66, end: 11.0, popFrom: 8.7, at: 9.5, value: 500, label: 'women coached'},
  neon: {start: 11.05, end: 13.9, at: 11.66, y: 1010},
  cuts: [
    {start: 11.05, end: 13.9, src: 'b_ts_photos.mp4', flash: 'soothing-yellow-light-shapes.mp4'}, // her Times Square billboard photos under the neon line
    {start: 4.98, end: 6.4, src: 'b_typing.mp4', line: '_All _over | _the internet', lineAt: 5.0, y: 420, mix: true, flash: 'abstract-orange-glow.mp4'},
    {start: 15.3, end: 20.3, src: 'b_notes.mp4', line: '_Having _a plan', times: [15.4, 15.8, 16.04], lineEnd: 17.3, line2: '_Making _it work | _for _your life', times2: [17.38, 17.86, 18.2, 18.58, 18.86, 19.12], y: 420, mix: true, flash: 'soothing-yellow-light-shapes.mp4'},
    {start: 21.44, end: 22.22, src: 'b_airport.mp4', line: 'Busy?', lineAt: 21.46, y: 380, mix: true},
    {start: 22.22, end: 23.48, src: 'b_eatout.mp4', line: 'Eating out?', lineAt: 22.26, y: 380, mix: true},
    {start: 23.48, end: 26.4, src: 'b_bed.mp4', line: "Can't stick | _to _the routine?", lineAt: 23.52, y: 700, mix: true},
    {start: 28.2, end: 32.3, src: 'b_call.mp4', line: '_A workout + diet | _that fits _your routine', times: [29.34, 29.5, 29.66, 30.42, 30.6, 30.84, 31.16, 31.5], y: 1120, mix: true, flash: 'abstract-orange-glow.mp4'},
  ],
  testimonial: {at: 37.45, gap: 5.95, file: 'ad6/testimonial.mp4', t0: 0.3, native: 576, crop: [12, 138, 540, 309], lines: [
      [{text: 'I', s: 0.54}, {text: "don't", s: 0.62}, {text: 'crave', s: 0.94}, {text: 'for', s: 1.16}, {text: 'sugar', s: 1.38}, {text: 'anymore.', s: 1.64}],
      [{text: 'Like', s: 2.94}, {text: 'even', s: 2.98}, {text: 'if', s: 3.18}, {text: "it's", s: 3.32}],
      [{text: 'in', s: 3.44}, {text: 'front', s: 3.62}, {text: 'of', s: 3.72}, {text: 'me,', s: 3.86}],
      [{text: "I'm", s: 4.02}, {text: 'like', s: 4.12}, {text: 'nah,', s: 4.24}],
      [{text: 'I', s: 4.66}, {text: 'might', s: 4.86}, {text: 'just', s: 4.98}, {text: 'skip', s: 5.16}, {text: 'it.', s: 5.34}],
    ]},
  cta: {start: 37.62, bookAt: 39.54, priceAt: 41.96, tapAt: 44.5, price: '₹99', closing: "Let's talk", color: BRAND, grot: true},
};
