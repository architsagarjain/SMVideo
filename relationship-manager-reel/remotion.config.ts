import {Config} from '@remotion/cli/config';

// Render settings for the master. build.sh passes the same values on the command line.
Config.setVideoImageFormat('png');
Config.setColorSpace('bt709');
Config.setConcurrency(4);
// Use the Chromium headless shell that ships with this environment when present.
if (process.env.REMOTION_BROWSER) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
}
