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
  search: {start: 0.9, end: 3.66, query: 'Free Diet Plans', typeFrom: 0.95, typeTo: 2.2, results: [{title: 'Fat-Loss Diet Plan', at: 2.4}, {title: 'Home Workout Plan', at: 3.28}, {title: '7-Day Meal Chart', at: 3.42}]},
  pills: [
  ],
  behind: {start: 5.92, end: 7.75, lines: [{text: 'why pay for', at: 6.04, size: 130, serif: true}, {text: 'A COACH?', at: 6.92, size: 190}]},
  women: {start: 8.22, end: 10.6, popFrom: 8.26, at: 9.08, value: 500, label: 'women coached'},
  neon: {start: 10.62, end: 13.1, at: 11.1, y: 1010},
  cards: {start: 35.5, end: 38.85, dir: 'ad7', items: [{img: 'pizza', label: 'Pizza Nights', at: 35.78, keep: true, stamp: 'YES'}, {img: 'chole', label: 'Chole Bhature', at: 37.26, keep: true, stamp: 'YES'}]},
  cuts: [
    {start: 0.85, end: 3.68, src: 'b_typing.mp4'}, // the search bar types over it
    {start: 3.7, end: 5.9, src: 'b_ipad.mp4', line: 'Everywhere | online.', times: [4.48, 5.22], y: 1185, mix: true, flash: 'abstract-orange-glow.mp4'},
    {start: 10.62, end: 13.5, src: 'b_ts_photos.mp4', flash: 'soothing-yellow-light-shapes.mp4'}, // her Times Square billboard photos
    {start: 15.1, end: 20.0, src: 'b_notes.mp4', line: '_Having _a Plan', times: [15.2, 15.56, 15.8], lineEnd: 17.3, line2: '_Making _it Work | _for _your Lifestyle', times2: [17.58, 17.92, 18.18, 18.38, 18.58, 18.78], y: 420, mix: true, flash: 'soothing-yellow-light-shapes.mp4'},
    {start: 21.7, end: 22.4, src: 'b_airport.mp4', line: 'Busy?', lineAt: 21.82, y: 380, mix: true},
    {start: 22.4, end: 23.7, src: 'b_eatout.mp4', line: 'Eating Out?', lineAt: 22.45, y: 380, mix: true},
    {start: 23.7, end: 26.1, src: 'b_bed.mp4', line: "Can't Stick | _to _the Routine?", lineAt: 23.8, y: 700, mix: true},
    {start: 28.28, end: 32.5, src: 'b_home.mp4', line: '_A Workout + Diet | _that Fits _your Routine', times: [29.1, 29.3, 29.46, 30.52, 30.74, 31.0, 31.28, 31.56], y: 1180, mix: true, flash: 'abstract-orange-glow.mp4'},
  ],
  testimonial: {at: 38.7, gap: 10.41, file: 'ad7/testimonial.mp4', t0: 0.3, native: 576, crop: [12, 138, 540, 309], lines: [
    [{text: "Every", s: 0.32}, {text: "time", s: 0.76}, {text: "I", s: 1.04}, {text: "would", s: 1.18}, {text: "take", s: 1.34}, {text: "a", s: 1.5}, {text: "picture,", s: 1.68}],
    [{text: "I", s: 1.94}, {text: "would", s: 2.02}, {text: "inhale", s: 2.32}, {text: "my", s: 2.9}, {text: "tummy,", s: 3.22}],
    [{text: "just", s: 3.8}, {text: "to", s: 3.92}, {text: "get", s: 4.14}, {text: "that", s: 4.56}, {text: "picture,", s: 4.82}],
    [{text: "but", s: 5.14}, {text: "now", s: 5.26}, {text: "I", s: 5.44}, {text: "don't", s: 5.6}, {text: "do", s: 5.94}, {text: "that", s: 6.16}, {text: "anymore.", s: 6.38}],
    [{text: "It's", s: 7.06}, {text: "much", s: 7.5}, {text: "flatter", s: 7.74}],
    [{text: "and", s: 8.2}, {text: "I", s: 8.54}, {text: "don't", s: 8.66}, {text: "feel", s: 9.0}, {text: "that", s: 9.36}, {text: "much", s: 9.62}, {text: "bloated.", s: 9.76}],
  ]},
  cta: {start: 38.94, bookAt: 40.84, priceAt: 44.24, tapAt: 46.74, price: '₹99', closing: "Let's talk", color: BRAND, grot: true},
};
