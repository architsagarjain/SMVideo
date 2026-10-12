import { Config } from '@remotion/cli/config';
import fs from 'node:fs';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setOverwriteOutput(true);

// Cloud build machine only: use its pre-installed headless Chromium.
// On your own computer Remotion downloads and uses its own browser automatically.
const CLOUD_CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
if (fs.existsSync(CLOUD_CHROME)) {
  Config.setBrowserExecutable(CLOUD_CHROME);
  Config.setChromiumOpenGlRenderer('swiftshader');
  Config.setConcurrency(4);
}
