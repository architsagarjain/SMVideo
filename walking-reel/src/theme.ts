import {loadFont} from '@remotion/fonts';
import {Easing, interpolate, spring, staticFile} from 'remotion';

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
// source footage is 67.23 s (2017 frames at 30 fps)
export const DURATION_FRAMES = 2017;

// ---------------------------------------------------------------------------
// Palette: dark frosted glass + near-white type, one electric-lime accent.
// `ink*` are the text tones used on glass; `dark` is for type on lime/light.
// ---------------------------------------------------------------------------
export const C = {
  glassCard: 'rgba(17, 18, 21, 0.86)',
  glassCardEdge: 'rgba(255, 255, 255, 0.13)',
  ink: '#F6F7F2',
  inkSoft: 'rgba(246, 247, 242, 0.70)',
  inkFaint: 'rgba(246, 247, 242, 0.46)',
  hairline: 'rgba(255, 255, 255, 0.12)',
  accent: '#C8F031',
  accentOnDark: '#C8F031',
  accentWash: 'rgba(200, 240, 49, 0.14)',
  glass: 'rgba(14, 15, 17, 0.70)',
  glassEdge: 'rgba(255, 255, 255, 0.12)',
  onDark: '#F6F7F2',
  dark: '#0F1012',
  stage: '#0C0D0F',
};

export const SANS = 'Manrope';
export const SERIF = 'Instrument Serif';
export const JP = 'Noto Serif JP';

loadFont({family: SANS, url: staticFile('fonts/Manrope-Variable.ttf'), weight: '200 800'});
loadFont({family: SERIF, url: staticFile('fonts/InstrumentSerif-Italic.ttf'), style: 'italic'});
loadFont({family: SERIF, url: staticFile('fonts/InstrumentSerif-Regular.ttf'), style: 'normal'});
// subset to the three glyphs 万歩計 (manpo-kei)
loadFont({family: JP, url: staticFile('fonts/NotoSerifJP-subset.ttf'), weight: '200 900'});

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
