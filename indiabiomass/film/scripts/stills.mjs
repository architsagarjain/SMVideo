// Render selected frames for review: node scripts/stills.mjs out_dir 0 60 120 ...
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import path from 'node:path';

const [outDir, ...frames] = process.argv.slice(2);
import fs from 'node:fs';
// Playwright's headless shell; the folder name changes with its version, so look it up.
const shellDir = fs.readdirSync('/opt/pw-browsers').filter((d) => d.startsWith('chromium_headless_shell-')).sort().pop();
const browserExecutable = ['chrome-linux/headless_shell', 'chrome-headless-shell-linux64/chrome-headless-shell']
  .map((p) => `/opt/pw-browsers/${shellDir}/${p}`).find((p) => fs.existsSync(p)) ?? null;
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const composition = await selectComposition({ serveUrl, id: process.env.COMP || 'BrandFilm', browserExecutable });
for (const fr of frames) {
  const out = path.join(outDir, `f${String(fr).padStart(4, '0')}.jpg`);
  await renderStill({ serveUrl, composition, frame: Number(fr), output: out, imageFormat: 'jpeg', jpegQuality: 85, browserExecutable, chromiumOptions: { gl: 'swiftshader' } });
  console.log('ok', out);
}
