/**
 * Shared timing for the v3 edit (seconds of the source; the voice never moves).
 * Cutaways cover the talking head while her voice continues underneath.
 */
export const CUT = {
  // "it's walking."
  walking: {start: 13.84, end: 15.78, src: 'broll/walking.mp4'},
  // "I do my workout"
  treadmill: {start: 24.76, end: 26.3, src: 'broll/treadmill.mp4'},
  // "an old Japanese pedometer"
  shibuya: {start: 37.56, end: 39.44, src: 'broll/shibuya.mp4'},
  // "A walk after meal also softens the blood sugar spike."
  sunset: {start: 58.52, end: 62.36, src: 'broll/sunset_walk.mp4'},
};

/** "marketing campaign." - freeze-frame, black and white, record scratch */
export const FREEZE = {start: 39.44, end: 40.74};

/** "how many would you take?" - pills rain down behind her */
export const PILL_RAIN = {start: 9.12, end: 10.9};

/** True while a full-screen cutaway hides the talking head. */
export const inCutaway = (t: number) => Object.values(CUT).some((c) => t >= c.start && t < c.end);
