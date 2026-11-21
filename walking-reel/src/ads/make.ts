import {Move, ReelConfig, Win} from '../series/core';
import {TimeMap} from '../series/timemap';

/** ReelConfig for an ad reel: real-time (speed 1, no pause cuts), her cut-out only where text goes behind her head. */
export const adConfig = (dir: string, tm: TimeMap, captions: unknown, moves: Move[], cut: Win[]): ReelConfig => ({
  dir,
  gfx: [],
  behind: [],
  moves,
  broll: [],
  captions: captions as ReelConfig['captions'],
  tm,
  grade: {filter: 'brightness(1.03) contrast(1.06) saturate(1.05)'},
  cut,
});
