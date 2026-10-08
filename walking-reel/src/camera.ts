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
};

const FACE: [number, number] = [540, 860];
const TOP: [number, number] = [540, 0];

export const MOVES: Move[] = [
  // opening: settle from a slightly tighter frame
  {origin: FACE, inStart: 0, inDur: 0, scale: 1.045, outStart: 0, outDur: 1.1, from: 1.045},
  // "how many would you take?" ... "That drug exists."
  {origin: FACE, inStart: 9.1, inDur: 0.75, scale: 1.1, outStart: 12.15, outDur: 0.8},
  // "And I used to think walking didn't count." - slow, quiet push
  {origin: FACE, inStart: 21.9, inDur: 2.6, scale: 1.055, outStart: 24.55, outDur: 0.75},
  // reframe for the step-curve chart: zoom anchored at the top edge pushes her
  // down in frame and opens room above her head
  {origin: TOP, inStart: 40.75, inDur: 0.75, scale: 1.15, outStart: 52.65, outDur: 0.8},
  // call to action
  {origin: FACE, inStart: 62.75, inDur: 0.9, scale: 1.06, outStart: 999, outDur: 1},
];

export const cameraAt = (t: number) => {
  for (const m of MOVES) {
    if (t < m.inStart || t > m.outStart + m.outDur) continue;
    const base = m.from ?? 1;
    const inP = m.inDur > 0 ? tween(t, m.inStart, m.inDur, EASE_IN_OUT) : 1;
    const outP = tween(t, m.outStart, m.outDur, EASE_IN_OUT);
    const s = t < m.outStart ? lerp(inP, base, m.scale) : lerp(outP, m.scale, 1);
    return {scale: s, ox: m.origin[0], oy: m.origin[1]};
  }
  return {scale: 1, ox: FACE[0], oy: FACE[1]};
};

/** Where a point of the un-zoomed frame ends up on screen at time t. */
export const project = (t: number, x: number, y: number) => {
  const c = cameraAt(t);
  return {x: c.ox + (x - c.ox) * c.scale, y: c.oy + (y - c.oy) * c.scale, scale: c.scale};
};
