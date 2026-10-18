// Canvas, timing and brand tokens. All times are seconds on the ad timeline; the
// voiceover (voiceover/vo_monika_take1_raw.mp3) starts at 0 and ends at 27.68 s.
export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const TOTAL = 29.5;
export const TOTAL_FRAMES = Math.round(TOTAL * FPS);

// Brand palette (from the campaign creative): maroon, blush, cream, with gold accents.
export const C = {
  maroon: '#7A1530',
  maroonDeep: '#5E0F24',
  red: '#B3122E', // logo red, used for small accents on cream
  blush: '#F4DAD3',
  blushSoft: '#F8E8E2',
  cream: '#FBF4EC',
  creamText: '#FCF0DE',
  gold: '#B98526', // gold on cream (contrast-safe)
  goldLight: '#F1C66E', // gold on maroon
  ink: '#33171D',
  muted: '#8B6C70',
  line: 'rgba(122, 21, 48, 0.14)',
  wa: '#1DAA61',
  waDark: '#0B7A55',
  waBubble: '#D9FDD3',
  waBg: '#EFE7DE',
};

export const SERIF = 'Playfair Display';
export const SANS = 'Poppins';
