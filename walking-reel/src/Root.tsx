import {Composition} from 'remotion';
import {WalkingReel} from './WalkingReel';
import {ExplainerReel} from './explainer/ExplainerReel';
import {DURATION_FRAMES, FPS, HEIGHT, WIDTH} from './theme';

export const Root: React.FC = () => {
  return (
    <>
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
