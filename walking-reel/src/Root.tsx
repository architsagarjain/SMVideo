import {Composition} from 'remotion';
import {WalkingReel} from './WalkingReel';
import {ExplainerReel} from './explainer/ExplainerReel';
import {Reel2} from './reel2/Reel2';
import {DURATION_FRAMES_2} from './reel2/timeline';
import {KneeReel} from './knee/Reel';
import {KNEE_FRAMES} from './knee/config';
import {SabudanaReel} from './sabudana/Reel';
import {SABUDANA_FRAMES} from './sabudana/config';
import {DURATION_FRAMES, FPS, HEIGHT, WIDTH} from './theme';

export const Root: React.FC = () => {
  return (
    <>
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
