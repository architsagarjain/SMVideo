import { Composition } from 'remotion';
import { Film } from './Film';

export const RemotionRoot: React.FC = () => (
  <Composition id="BrandFilm" component={Film} durationInFrames={1800} fps={30} width={1080} height={1920} />
);
