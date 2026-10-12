// Render selected frames for review: node scripts/stills.mjs out_dir 0 60 120 ...
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import path from 'node:path';

const [outDir, ...frames] = process.argv.slice(2);
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const composition = await selectComposition({ serveUrl, id: process.env.COMP || 'BrandFilm', browserExecutable });
for (const fr of frames) {
  const out = path.join(outDir, `f${String(fr).padStart(4, '0')}.jpg`);
  await renderStill({ serveUrl, composition, frame: Number(fr), output: out, imageFormat: 'jpeg', jpegQuality: 85, browserExecutable, chromiumOptions: { gl: 'swiftshader' } });
  console.log('ok', out);
}
