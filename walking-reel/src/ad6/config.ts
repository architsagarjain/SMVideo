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
  neon: {start: 11.05, end: 13.5, at: 11.66, y: 1010},
  cuts: [
    {start: 11.05, end: 13.9, src: 'b_ts_photos.mp4', flash: 'soothing-yellow-light-shapes.mp4'}, // her Times Square billboard photos under the neon line
    {start: 4.98, end: 6.4, src: 'b_typing.mp4', line: '_All _over | _the Internet', lineAt: 5.0, y: 420, mix: true, flash: 'abstract-orange-glow.mp4'},
    {start: 15.3, end: 20.3, src: 'b_notes.mp4', line: '_Having _a Plan', times: [15.4, 15.8, 16.04], lineEnd: 17.3, line2: '_Making _it Work | _for _your Lifestyle', times2: [17.38, 17.86, 18.2, 18.58, 18.86, 19.12], y: 420, mix: true, flash: 'soothing-yellow-light-shapes.mp4'},
    {start: 21.44, end: 22.22, src: 'b_airport.mp4', line: 'Busy?', lineAt: 21.46, y: 380, mix: true},
    {start: 22.22, end: 23.48, src: 'b_eatout.mp4', line: 'Eating Out?', lineAt: 22.26, y: 380, mix: true},
    {start: 23.48, end: 26.4, src: 'b_bed.mp4', line: "Can't Stick | _to _the Routine?", lineAt: 23.52, y: 700, mix: true},
    {start: 28.2, end: 32.3, src: 'b_call.mp4', line: '_A Workout + Diet | _that Fits _your Routine', times: [29.34, 29.5, 29.66, 30.42, 30.6, 30.84, 31.16, 31.5], y: 1120, mix: true, flash: 'abstract-orange-glow.mp4'},
  ],
  testimonial: {at: 37.45, gap: 7.9, file: 'ad6/testimonial.mp4', t0: 0.3, native: 480, crop: [7, 112, 456, 260], lines: [
    [{text: "I'm", s: 0.35}, {text: 'more', s: 0.53}, {text: 'positive', s: 0.63}, {text: 'about', s: 0.97}, {text: '2026,', s: 1.29}],
    [{text: 'with', s: 1.95}, {text: 'the', s: 2.17}, {text: 'fact', s: 2.29}, {text: 'that', s: 2.63}, {text: 'I', s: 3.09}, {text: 'know', s: 3.27}],
    [{text: "I'm", s: 3.55}, {text: 'already', s: 4.11}, {text: 'doing', s: 4.41}, {text: 'the', s: 4.67}, {text: 'things', s: 4.87}],
    [{text: 'that', s: 5.19}, {text: 'people', s: 5.67}, {text: 'who', s: 5.91}, {text: 'started', s: 6.11}],
    [{text: 'on', s: 6.45}, {text: '1st', s: 6.79}, {text: 'of', s: 7.11}, {text: 'January.', s: 7.21}],
  ]},
  cta: {start: 37.62, bookAt: 39.54, priceAt: 41.96, tapAt: 44.5, price: '₹99', closing: "Let's talk", color: BRAND, grot: true},
};
