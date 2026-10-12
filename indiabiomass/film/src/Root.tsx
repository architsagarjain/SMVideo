import { Composition } from 'remotion';
import { Film } from './Film';
import { Reel1, REEL1_FRAMES } from './reels/Reel1';
import { Reel2, REEL2_FRAMES } from './reels/Reel2';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="BrandFilm" component={Film} durationInFrames={1635} fps={30} width={1080} height={1920} />
    <Composition id="Reel1-CoFiring" component={Reel1} durationInFrames={REEL1_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Reel2-TenderWords" component={Reel2} durationInFrames={REEL2_FRAMES} fps={30} width={1080} height={1920} />
  </>
);
