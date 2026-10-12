import {EASE_IN_OUT, lerp, tween} from '../theme';

/**
 * Reel 2 ("train twice a week") - edit structure. Times are seconds of the
 * source; her voice never moves. Cut points sit in the pauses between
 * sentences.
 */
export const DURATION_FRAMES_2 = 2211; // 73.7 s at 30 fps

/** Full-screen explainer scenes (light-grey stage, voice continues). */
export const GFX2 = {
  week: {start: 4.4, end: 9.95},
  study: {start: 15.45, end: 27.3},
  body: {start: 43.45, end: 54.55},
  motivation: {start: 65.6, end: 69.85},
};
export const inGfx2 = (t: number) => Object.values(GFX2).some((w) => t >= w.start && t < w.end);

/** Talking head with the wall washed to the stage grey + graphics behind her head. */
export const BEHIND = {
  hook: {start: 0.0, end: 4.4},
  twice: {start: 11.9, end: 15.45},
  notSix: {start: 30.3, end: 34.1},
  meetings: {start: 60.4, end: 65.6},
  cta: {start: 70.0, end: 99},
};

/** Split layout: chart on top, her head breaking out of the footage panel. */
export const PANEL = {start: 34.1, end: 43.45};

/** 0..1 wash of the wall behind her. */
export const washAt = (t: number) => {
  let w = 0;
  for (const b of [...Object.values(BEHIND), PANEL]) {
    if (t >= b.start - 0.01 && t < b.end) w = Math.max(w, b.start < 0.05 ? 1 : tween(t, b.start, 0.22));
  }
  return w;
};

/** Camera on the talking head: {scale, origin, panel 0..1}. */
const FACE: [number, number] = [540, 820];
const BOTTOM: [number, number] = [540, 1920];
type Move = {origin: [number, number]; inStart: number; inDur: number; scale: number; outStart: number; outDur: number; panel?: boolean};
const MOVES: Move[] = [
  // "That last condition matters."
  {origin: FACE, inStart: 27.95, inDur: 0.6, scale: 1.09, outStart: 30.25, outDur: 0.05},
  // split layout
  {origin: BOTTOM, inStart: PANEL.start, inDur: 0.7, scale: 0.72, outStart: 43.4, outDur: 0.05, panel: true},
  // "choose days that exist in your actual week."
  {origin: FACE, inStart: 56.8, inDur: 0.7, scale: 1.08, outStart: 60.35, outDur: 0.05},
  // call to action: slow push
  {origin: FACE, inStart: 70.0, inDur: 3.6, scale: 1.05, outStart: 999, outDur: 1},
];
export const cameraAt2 = (t: number) => {
  for (const m of MOVES) {
    if (t < m.inStart || t > m.outStart + m.outDur) continue;
    const inP = tween(t, m.inStart, m.inDur, EASE_IN_OUT);
    const outP = tween(t, m.outStart, m.outDur, EASE_IN_OUT);
    const s = t < m.outStart ? lerp(inP, 1, m.scale) : lerp(outP, m.scale, 1);
    return {scale: s, ox: m.origin[0], oy: m.origin[1], panel: m.panel ? (t < m.outStart ? inP : 1 - outP) : 0};
  }
  return {scale: 1, ox: FACE[0], oy: FACE[1], panel: 0};
};
