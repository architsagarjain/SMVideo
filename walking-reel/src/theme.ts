import {loadFont} from '@remotion/fonts';
import {Easing, interpolate, spring, staticFile} from 'remotion';

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
// source footage is 67.23 s (2017 frames at 30 fps)
export const DURATION_FRAMES = 2017;

// ---------------------------------------------------------------------------
// Palette: warm off-white + charcoal, one accent (the coral-red from the poster
// on her wall). ACCENT_ON_DARK is the same hue lifted for contrast on charcoal.
// ---------------------------------------------------------------------------
export const C = {
  paper: '#F7F4EF',
  paperEdge: 'rgba(23, 21, 19, 0.07)',
  ink: '#161514',
  inkSoft: 'rgba(22, 21, 20, 0.62)',
  inkFaint: 'rgba(22, 21, 20, 0.38)',
  hairline: 'rgba(22, 21, 20, 0.10)',
  accent: '#E5502F',
  accentOnDark: '#FF7556',
  accentWash: 'rgba(229, 80, 47, 0.10)',
  glass: 'rgba(17, 16, 15, 0.72)',
  glassEdge: 'rgba(255, 255, 255, 0.10)',
  onDark: '#F7F4EF',
};

export const SANS = 'Manrope';
export const SERIF = 'Instrument Serif';

loadFont({family: SANS, url: staticFile('fonts/Manrope-Variable.ttf'), weight: '200 800'});
loadFont({family: SERIF, url: staticFile('fonts/InstrumentSerif-Italic.ttf'), style: 'italic'});
loadFont({family: SERIF, url: staticFile('fonts/InstrumentSerif-Regular.ttf'), style: 'normal'});

// Caption type (keep in sync with scripts/build_captions.py, which measures it)
export const CAPTION = {size: 44, weight: 620, letterSpacing: -0.3, serifSize: 60};

// ---------------------------------------------------------------------------
// Motion language
// ---------------------------------------------------------------------------
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1); // entrances
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1); // camera, morphs
export const EASE_IN = Easing.bezier(0.5, 0, 0.75, 0); // exits

/** 0..1 progress of an eased tween that starts at `start` seconds. */
export const tween = (t: number, start: number, dur: number, easing = EASE_OUT) =>
  interpolate(t, [start, start + dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

/** Refined spring (slight settle, no visible bounce) starting at `start` seconds. */
export const springAt = (t: number, start: number, damping = 19, stiffness = 150) =>
  spring({
    frame: Math.round((t - start) * FPS * 1000) / 1000,
    fps: FPS,
    config: {damping, stiffness, mass: 0.9},
  });

/** Linear map with clamping. */
export const lerp = (p: number, a: number, b: number) => a + (b - a) * p;

export const fmtInt = (n: number) => Math.round(n).toLocaleString('en-US');
