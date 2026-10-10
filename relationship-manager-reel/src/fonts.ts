import {continueRender, delayRender, staticFile} from 'remotion';

// Montserrat (SIL OFL 1.1), served locally so renders never depend on the network.
// The ₹ sign lives in the latin-ext subset.
const LATIN = 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';
const LATIN_EXT = 'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF';

export const FONT = 'Montserrat';

let loaded = false;
export const loadFonts = () => {
  if (loaded) return;
  loaded = true;
  const handle = delayRender('Loading Montserrat');
  const faces = [500, 600, 700].flatMap((w) => [
    new FontFace(FONT, `url(${staticFile(`fonts/montserrat-latin-${w}-normal.woff2`)}) format('woff2')`, {weight: String(w), unicodeRange: LATIN}),
    new FontFace(FONT, `url(${staticFile(`fonts/montserrat-latin-ext-${w}-normal.woff2`)}) format('woff2')`, {weight: String(w), unicodeRange: LATIN_EXT}),
  ]);
  Promise.all(faces.map((f) => f.load()))
    .then((fs) => {
      fs.forEach((f) => document.fonts.add(f));
      continueRender(handle);
    })
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
};
