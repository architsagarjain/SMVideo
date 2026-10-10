import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('png');
Config.setPixelFormat('yuv420p');
Config.setCodec('h264');
Config.setCrf(12);
Config.setConcurrency(4);
Config.setChromiumOpenGlRenderer('angle'); // 'swangle' ghosts layers under the transparent subject video
