import { useEffect, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';

const faces: [string, string, string][] = [
  ['Plus Jakarta Sans', 'fonts/PlusJakartaSans.ttf', '200 800'],
  ['Geist', 'fonts/Geist.ttf', '100 900'],
  ['Archivo', 'fonts/Archivo.ttf', '100 900'],
];

/** Loads the brand's three typefaces (all SIL OFL) before any frame renders. */
export const useBrandFonts = () => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all(
      faces.map(([family, file, weight]) => {
        const ff = new FontFace(family, `url(${staticFile(file)})`, { weight });
        return ff.load().then((f) => document.fonts.add(f));
      }),
    ).then(() => continueRender(handle));
  }, [handle]);
};
