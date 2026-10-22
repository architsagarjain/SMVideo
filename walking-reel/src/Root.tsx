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
import {V5Reel} from './v5/Reel';
import {V5_FRAMES} from './v5/config';
import {V6Reel} from './v6/Reel';
import {V6_FRAMES} from './v6/config';
import {V7Reel} from './v7/Reel';
import {V7_FRAMES} from './v7/config';
import {PhoneReel} from './v7b/Reel';
import {PHONE_FRAMES} from './v7b/config';
import {V8Reel} from './v8/Reel';
import {V8_FRAMES} from './v8/config';
import {V9Reel} from './v9/Reel';
import {V9_FRAMES} from './v9/config';
import {V10Reel} from './v10/Reel';
import {V10_FRAMES} from './v10/config';
import {SLEEP_FRAMES} from './sleep/config';
import {DURATION_FRAMES, FPS, HEIGHT, WIDTH} from './theme';

export const Root: React.FC = () => {
  return (
    <>
    <Composition id="MithaiBox" component={V10Reel} durationInFrames={V10_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Composition id="CheckIn" component={V9Reel} durationInFrames={V9_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Composition id="TravelReel" component={V8Reel} durationInFrames={V8_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Composition id="SnackPhone" component={PhoneReel} durationInFrames={PHONE_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Composition id="SnackReel" component={V7Reel} durationInFrames={V7_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Composition id="CardioReel" component={V6Reel} durationInFrames={V6_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Composition id="BusyTips" component={V5Reel} durationInFrames={V5_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
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
