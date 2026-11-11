import {ReelConfig, retime} from '../series/core';
import {TimeMap} from '../series/timemap';
import {Cut, punch} from '../minimal/kit';
import timemap from './timemap.json';
import captions from './captions.json';

/** Blood tests reel, minimal style (reference: talking head + B-roll key lines + punch-ins). Source seconds. */
export const TM_M1 = timemap as TimeMap;
export const M1_FRAMES = TM_M1.frames;

export const C = {
  report: {start: 1.62, end: 3.0}, // "says everything's normal" - lab report insert
  inkA: {start: 1.12, end: 2.2}, // ink wipe into the report
  dolly: {start: 7.07, end: 8.38}, // "That's not normal." - dolly zoom (her cut-out holds, the room pulls away)
  orbit: {start: 10.25, end: 12.6}, // "get these four things checked" - the four tests orbit her
  inkB: {start: 49.45, end: 50.55}, // ink wipe into the thyroid panel
  panel: {start: 49.96, end: 53.38}, // 4 · thyroid: the full panel, not just TSH
  vitd: {start: 14.44, end: 21.2}, // range: lab normal 30 -> aim for 60
  sugar: {start: 25.2, end: 29.6}, // HbA1c < 5.4, insulin < 7
  liver: {start: 36.52, end: 42.2}, // SGOT, SGPT < 25
  thyroid: {start: 54.8, end: 60.4}, // symptoms + antibodies
  cta: {start: 68.2, end: 999},
};
export const CUTS: Cut[] = [
  {start: 3.0, end: 4.2, src: 'b_tired.mp4', line: "BUT YOU'RE EXHAUSTED", lineAt: 3.05, y: 560, dive: true, flash: 'abstract-orange-glow.mp4'},
  {start: 8.4, end: 10.28, src: 'b_supp.mp4', line: 'BEFORE YOU BUY | ANOTHER SUPPLEMENT', lineAt: 8.45, y: 960, dive: true, flash: 'soothing-yellow-light-shapes.mp4'},
  {start: 12.66, end: 14.42, src: 'b_sun.mp4', line: '1 · VITAMIN D', lineAt: 12.75, y: 330, dive: true, flash: 'abstract-orange-glow.mp4'},
  {start: 21.3, end: 24.9, src: 'b_food.mp4', line: '2 · HbA1c | + FASTING INSULIN', lineAt: 21.4, y: 280, dive: true, flash: 'soothing-yellow-light-shapes.mp4'},
  {start: 43.3, end: 45.84, src: 'b_fit.mp4', line: 'NOT ONLY FOR PEOPLE | WHO ARE OVERWEIGHT', lineAt: 43.35, y: 1480, dive: true, flash: 'abstract-orange-glow.mp4'},
  {start: 60.86, end: 64.9, src: 'b_notes.mp4', line: '₹1,500 ON TESTS | COULD SAVE YOU LAKHS', lineAt: 60.95, y: 1560, dive: true, flash: 'soothing-yellow-light-shapes.mp4'},
];
const wins = {...C};
retime(TM_M1, wins, []);
for (const c of CUTS) retime(TM_M1, {c}, []);

const moves = [
  punch(0.45, 1.62, 1.1),
  punch(30.46, 33.9, 1.1), // "a little sneaky"
  punch(34.92, 36.5, 1.16), // "struggling underneath"
  punch(48.56, 49.94, 1.14), // "Get this one checked."
  punch(65.24, 68.1, 1.1), // "So test first"
];
retime(TM_M1, {}, moves);

export const m1Config: ReelConfig = {
  dir: 'm1',
  gfx: [],
  behind: [],
  moves,
  broll: [],
  captions: captions as ReelConfig['captions'],
  tm: TM_M1,
  grade: {filter: 'brightness(1.02) contrast(1.05) saturate(1.04)'},
  cut: [{start: 7.07, end: 8.38}, {start: 10.25, end: 12.6}], // her cut-out only where the dolly zoom / orbit need it
};
