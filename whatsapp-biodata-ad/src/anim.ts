import {Easing, interpolate} from 'remotion';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const easeOut = Easing.bezier(0.22, 1, 0.36, 1); // smooth deceleration, no overshoot
export const easeInOut = Easing.bezier(0.45, 0, 0.25, 1);

/** 0 -> 1 progress of an animation that starts at `start` and lasts `dur` seconds. */
export const progress = (t: number, start: number, dur: number, easing = easeOut) =>
  interpolate(t, [start, start + dur], [0, 1], {...clamp, easing});

/** Linear map with clamping. */
export const lerp = (t: number, inRange: [number, number], outRange: [number, number], easing = easeOut) =>
  interpolate(t, inRange, outRange, {...clamp, easing});
