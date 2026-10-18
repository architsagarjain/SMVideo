import {continueRender, delayRender} from 'remotion';
import '@fontsource/playfair-display/600.css';
import '@fontsource/playfair-display/700.css';
import '@fontsource/playfair-display/600-italic.css';
import '@fontsource/playfair-display/700-italic.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import {SANS, SERIF} from './theme';

// Fonts are bundled locally (SIL OFL 1.1); wait until every face used is loaded.
let started = false;
export const loadFonts = () => {
  if (started) return;
  started = true;
  const handle = delayRender('Loading fonts');
  const faces = [
    `600 40px "${SERIF}"`, `700 40px "${SERIF}"`, `italic 600 40px "${SERIF}"`, `italic 700 40px "${SERIF}"`,
    `400 40px "${SANS}"`, `500 40px "${SANS}"`, `600 40px "${SANS}"`, `700 40px "${SANS}"`,
  ];
  Promise.all(faces.map((f) => document.fonts.load(f, 'Aa ₹ ✓')))
    .then(() => continueRender(handle))
    .catch((e) => {
      console.error(e);
      continueRender(handle);
    });
};
