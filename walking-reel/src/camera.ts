import {EASE_IN_OUT, lerp, tween} from './theme';

/**
 * Virtual camera over the footage: each move zooms around a fixed origin and
 * returns to 1.0 before the next one starts, so origins never need blending.
 * Times are in seconds of the source.
 */
type Move = {
  origin: [number, number];
  inStart: number;
  inDur: number;
  scale: number;
  outStart: number;
  outDur: number;
  from?: number; // starting scale (for the opening settle)
  panel?: boolean; // shrink into a rounded panel over the paper background
};

const FACE: [number, number] = [540, 860];
const BOTTOM: [number, number] = [540, 1920];

export const MOVES: Move[] = [
  // opening: settle from a slightly tighter frame
  {origin: FACE, inStart: 0, inDur: 0, scale: 1.045, outStart: 0, outDur: 1.1, from: 1.045},
  // "how many would you take?" ... "That drug exists."
  {origin: FACE, inStart: 9.1, inDur: 0.75, scale: 1.1, outStart: 12.15, outDur: 0.8},
  // "And I used to think walking didn't count." - slow, quiet push
  {origin: FACE, inStart: 21.9, inDur: 2.6, scale: 1.055, outStart: 24.55, outDur: 0.75},
  // split layout for the step-curve chart: the footage shrinks into a rounded
  // panel anchored to the bottom edge, the chart takes the top of the frame
  {origin: BOTTOM, inStart: 40.7, inDur: 0.8, scale: 0.66, outStart: 52.6, outDur: 0.85, panel: true},
  // "150 calories a day"
  {origin: FACE, inStart: 55.85, inDur: 0.6, scale: 1.08, outStart: 58.0, outDur: 0.6},
  // call to action; ends at the same 104.5% the video opens on, so the loop is seamless
  {origin: FACE, inStart: 62.75, inDur: 0.9, scale: 1.045, outStart: 999, outDur: 1},
];

export const cameraAt = (t: number) => {
  for (const m of MOVES) {
    if (t < m.inStart || t > m.outStart + m.outDur) continue;
    const base = m.from ?? 1;
    const inP = m.inDur > 0 ? tween(t, m.inStart, m.inDur, EASE_IN_OUT) : 1;
    const outP = tween(t, m.outStart, m.outDur, EASE_IN_OUT);
    const s = t < m.outStart ? lerp(inP, base, m.scale) : lerp(outP, m.scale, 1);
    const panel = m.panel ? (t < m.outStart ? inP : 1 - outP) : 0;
    return {scale: s, ox: m.origin[0], oy: m.origin[1], panel};
  }
  return {scale: 1, ox: FACE[0], oy: FACE[1], panel: 0};
};

/** Where a point of the un-zoomed frame ends up on screen at time t. */
export const project = (t: number, x: number, y: number) => {
  const c = cameraAt(t);
  return {x: c.ox + (x - c.ox) * c.scale, y: c.oy + (y - c.oy) * c.scale, scale: c.scale};
};
