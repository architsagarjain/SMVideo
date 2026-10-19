import {Composition} from 'remotion';
import {WalkingReel} from './WalkingReel';
import {ExplainerReel} from './explainer/ExplainerReel';
import {Reel2} from './reel2/Reel2';
import {DURATION_FRAMES_2} from './reel2/timeline';
import {KneeReel} from './knee/Reel';
import {KNEE_FRAMES} from './knee/config';
import {SabudanaReel} from './sabudana/Reel';
import {SABUDANA_FRAMES} from './sabudana/config';
import {SleepReel} from './sleep/Reel';
import {V4Reel} from './v4/Reel';
import {V4_FRAMES} from './v4/config';
import {V4bReel} from './v4/Reel2';
import {V4B_FRAMES} from './v4/config2';
import {SLEEP_FRAMES} from './sleep/config';
import {DURATION_FRAMES, FPS, HEIGHT, WIDTH} from './theme';

export const Root: React.FC = () => {
  return (
    <>
    <Composition id="BusyWomen2" component={V4bReel} durationInFrames={V4B_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Composition id="BusyWomen" component={V4Reel} durationInFrames={V4_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Composition id="Sleep" component={SleepReel} durationInFrames={SLEEP_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Composition id="Sabudana" component={SabudanaReel} durationInFrames={SABUDANA_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Composition id="Knee" component={KneeReel} durationInFrames={KNEE_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Composition id="Reel2" component={Reel2} durationInFrames={DURATION_FRAMES_2} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Composition
      id="ExplainerReel"
      component={ExplainerReel}
      durationInFrames={DURATION_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
    <Composition
      id="WalkingReel"
      component={WalkingReel}
      durationInFrames={DURATION_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
    </>
  );
};
