// All timings are in seconds on the reel timeline (the source footage is not retimed,
// so source time == reel time until the end screen).
export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

// Source footage: 659 frames. Hard cuts at 3.00, 6.33, 11.60 and 16.00 s.
export const VIDEO_END = 659 / FPS;
export const CUTS = [3.0, 190 / FPS, 11.6, 16.0];

// End screen: the dissolve starts right after the last word ("…rupees" ends 21.24 s)
// and completes as the music resolves (22.0 s).
export const ES_START = 21.2;
export const ES_DISSOLVE = 0.75;
export const TOTAL = 26.2;
export const TOTAL_FRAMES = Math.round(TOTAL * FPS);

// Brand palette, sampled from the end screen artwork.
export const MAROON = '#8E1B2E';
export const INK = '#2E1C1E';
export const CREAM = 'rgba(253, 248, 242, 0.95)';
// Caption accent: warm gold that reads on the footage and suits the wedding palette.
export const GOLD = '#F7CD86';

// Caption block centre (y). Clear of faces, and above the bottom ~35% that the
// Reels / Meta ads UI (caption text, CTA button) covers.
export const CAPTION_Y = 1185;
