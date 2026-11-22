import {TimeMap} from '../series/timemap';
import {punch} from '../minimal/kit';
import {AdConfig} from '../ads/AdReel';
import {adConfig} from '../ads/make';
import {BRAND} from '../ads/extras';
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
  beforeAfter: {start: 0.72, end: 4.65, beforeAt: 0.8, afterAt: 2.86, statsAt: 4.0, before: 'BEFORE', after: 'AFTER', stats: ['−1.2 kg', '−3 cm waist'], img0: 'ad8/before.jpg', img1: 'ad8/after.jpg'},
  mix: true,
  behind: {start: 6.18, end: 7.95, lines: [{text: 'not just', at: 6.56, size: 150, serif: true}, {text: 'PHYSICAL', at: 7.18, size: 230}]},
  women: {start: 8.0, end: 11.0, popFrom: 8.1, at: 8.76, value: 500, label: 'women helped'},
  logo: {start: 23.95, end: 25.38, at: 24.12},
  neon: {start: 38.12, end: 41.75, at: 40.58, y: 1010},
  cards: {start: 25.42, end: 30.05, items: [{img: 'roti', label: 'Roti', at: 25.52, keep: true}, {img: 'pizza', label: 'Favourite foods', at: 26.56, keep: true}, {img: 'gym', label: 'Hours in the gym', at: 28.48, keep: false}]},
  pills: [],
  cuts: [
    {start: 15.62, end: 16.82, src: 'b_gym.mp4', line: '_Getting stronger', times: [15.68, 15.98], y: 380, mix: true},
    {start: 16.82, end: 18.22, src: 'b_walk.mp4', line: '_Building confidence', times: [16.84, 17.06], y: 420, mix: true},
    {start: 18.22, end: 20.9, src: 'b_home.mp4', line: '_A routine _that | works _for _you', times: [18.62, 18.82, 19.1, 19.82, 20.12, 20.3], y: 1180, mix: true, flash: 'abstract-orange-glow.mp4'},
    {start: 30.14, end: 33.6, src: 'b_call.mp4', line: '_Built _around | _your lifestyle', times: [30.32, 32.18, 32.56, 33.16], y: 1120, mix: true, flash: 'soothing-yellow-light-shapes.mp4'},
    {start: 33.6, end: 37.5, src: 'b_airport.mp4', line: 'Progress _without | _putting life _on hold', times: [34.94, 35.4, 35.92, 36.58, 36.88, 37.1], y: 380, mix: true},
    {start: 38.12, end: 41.75, src: 'b_ts_photos.mp4', flash: 'soothing-yellow-light-shapes.mp4'}, // her Times Square billboard photos
    {start: 41.82, end: 46.6, src: 'b_night.mp4', line: '_Helping women | _feel _their best', times: [44.44, 45.14, 45.48, 45.9, 46.1], y: 640, mix: true, flash: 'abstract-orange-glow.mp4'},
  ],
  testimonial: {at: 46.95, gap: 7.9, file: 'ad8/testimonial.mp4', t0: 0.3, native: 480, crop: [7, 112, 456, 260], lines: [
    [{text: "I'm", s: 0.35}, {text: 'more', s: 0.53}, {text: 'positive', s: 0.63}, {text: 'about', s: 0.97}, {text: '2026,', s: 1.29}],
    [{text: 'with', s: 1.95}, {text: 'the', s: 2.17}, {text: 'fact', s: 2.29}, {text: 'that', s: 2.63}, {text: 'I', s: 3.09}, {text: 'know', s: 3.27}],
    [{text: "I'm", s: 3.55}, {text: 'already', s: 4.11}, {text: 'doing', s: 4.41}, {text: 'the', s: 4.67}, {text: 'things', s: 4.87}],
    [{text: 'that', s: 5.19}, {text: 'people', s: 5.67}, {text: 'who', s: 5.91}, {text: 'started', s: 6.11}],
    [{text: 'on', s: 6.45}, {text: '1st', s: 6.79}, {text: 'of', s: 7.11}, {text: 'January.', s: 7.21}],
  ]},
  cta: {start: 50.42, bookAt: 50.42, priceAt: 53.2, tapAt: 56.0, price: '₹99', closing: "Let's get started", color: BRAND, grot: true},
};
