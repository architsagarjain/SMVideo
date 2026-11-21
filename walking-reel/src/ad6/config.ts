import {TimeMap} from '../series/timemap';
import {punch} from '../minimal/kit';
import {AdConfig} from '../ads/AdReel';
import {adConfig} from '../ads/make';
import timemap from './timemap.json';
import captions from './captions.json';

/** Ad A - "Why pay for a coach?" (IMG_2606). Hook: her face + "free plans" pills, then COACH? behind her head. Source seconds. */
export const TM_AD6 = timemap as TimeMap;
export const AD6_FRAMES = TM_AD6.frames;
const moves = [punch(0.95, 2.1, 1.08), punch(13.94, 15.3, 1.08), punch(26.58, 28.1, 1.14), punch(32.36, 35.1, 1.08)];

export const ad6: AdConfig = {
  tm: TM_AD6,
  cfg: adConfig('ad6', TM_AD6, captions, moves, [{start: 6.3, end: 8.4}, {start: 39.3, end: 999}]),
  dolly: {start: 6.44, end: 8.3},
  pills: [
    {start: 0.95, end: 4.95, items: [{text: 'Free diet plans', at: 1.2, kind: 'check'}, {text: 'Free workouts', at: 3.7, kind: 'check'}]},
    {start: 34.9, end: 37.55, items: [{text: 'Pizza nights', at: 35.16, kind: 'check'}, {text: 'Chole bhature', at: 36.44, kind: 'check'}]},
  ],
  behind: {start: 6.44, end: 8.25, lines: [{text: 'WHY PAY FOR', at: 6.5, size: 130}, {text: 'A COACH?', at: 7.4, size: 215}]},
  counter: {start: 8.66, end: 11.0, at: 9.5, value: 500, suffix: '+', label: 'women coached'},
  badge: {start: 11.05, end: 13.9, at: 11.66},
  cuts: [
    {start: 4.98, end: 6.4, src: 'b_typing.mp4', line: 'ALL OVER | THE INTERNET', lineAt: 5.0, y: 420, dive: true, flash: 'abstract-orange-glow.mp4'},
    {start: 15.3, end: 20.3, src: 'b_notes.mp4', line: 'HAVING A PLAN', times: [15.4, 15.8, 16.04], lineEnd: 17.3, line2: 'MAKING IT WORK | FOR YOUR LIFE', times2: [17.38, 17.86, 18.2, 18.58, 18.86, 19.12], y: 1150, dive: true, flash: 'soothing-yellow-light-shapes.mp4'},
    {start: 21.44, end: 22.22, src: 'b_airport.mp4', line: 'BUSY?', lineAt: 21.46, y: 380, dive: true},
    {start: 22.22, end: 23.48, src: 'b_eatout.mp4', line: 'EATING OUT?', lineAt: 22.26, y: 380, dive: true},
    {start: 23.48, end: 26.4, src: 'b_bed.mp4', line: "CAN'T STICK | TO THE ROUTINE?", lineAt: 23.52, y: 700, dive: true},
    {start: 28.2, end: 32.3, src: 'b_call.mp4', line: 'A WORKOUT + DIET | THAT FITS YOUR ROUTINE', times: [29.34, 29.5, 29.66, 30.42, 30.6, 30.84, 31.16, 31.5], y: 1120, dive: true, flash: 'abstract-orange-glow.mp4'},
  ],
  cta: {start: 37.62, bookAt: 39.54, priceAt: 41.96, tapAt: 44.5, price: '₹99'},
};
