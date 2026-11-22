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
  testimonial: {at: 38.7, gap: 11.63, file: 'ad7/testimonial.mp4', t0: 0.3, native: 480, crop: [7, 112, 456, 260], lines: [
    [{text: 'People', s: 0.34}, {text: 'are', s: 1.58}, {text: 'able', s: 1.72}, {text: 'to', s: 1.86}, {text: 'respect', s: 1.98}, {text: 'me', s: 2.26}],
    [{text: 'more', s: 2.5}, {text: 'in', s: 2.7}, {text: 'my', s: 2.84}, {text: 'lab,', s: 3.06}],
    [{text: 'because', s: 3.28}, {text: "I'm", s: 3.66}, {text: 'following', s: 3.9}, {text: 'something,', s: 4.2}],
    [{text: 'and', s: 4.64}, {text: 'now', s: 4.82}, {text: "they've", s: 5.0}, {text: 'stopped', s: 5.24}],
    [{text: 'offering', s: 5.4}, {text: 'me', s: 5.74}, {text: 'stuff.', s: 5.94}],
    [{text: 'They', s: 6.34}, {text: 'say,', s: 6.48}, {text: '"Okay,', s: 6.64}, {text: 'you', s: 6.94}, {text: 'are', s: 7.1}],
    [{text: 'doing', s: 7.18}, {text: 'this,', s: 7.38}, {text: "it's", s: 7.66}, {text: 'great,', s: 8.14}],
    [{text: 'we', s: 8.4}, {text: "won't", s: 8.76}, {text: 'offer', s: 9.18}, {text: 'you', s: 9.44}, {text: 'anymore."', s: 9.58}],
    [{text: "It's", s: 10.28}, {text: 'a', s: 10.5}, {text: 'good', s: 10.58}, {text: 'thing', s: 10.7}, {text: 'for', s: 10.94}, {text: 'me.', s: 11.12}],
  ]},
  cta: {start: 38.94, bookAt: 40.84, priceAt: 44.24, tapAt: 46.74, price: '₹99', closing: "Let's talk", color: BRAND, grot: true},
};
