/**
 * Edit structure (reference-style): talking head bookends, full-screen
 * explainer graphics in between while her voice continues.
 * Cut points sit in the pauses between her sentences.
 */
export const SCENES = {
  pills: {start: 4.14, end: 10.25},
  steps: {start: 15.0, end: 21.75},
  desk: {start: 24.55, end: 35.3},
  origin: {start: 36.72, end: 52.75},
  calories: {start: 55.55, end: 62.55},
};

export type Window = {start: number; end: number};
export const GFX: Window[] = Object.values(SCENES);
export const inGfx = (t: number) => GFX.some((w) => t >= w.start && t < w.end);
