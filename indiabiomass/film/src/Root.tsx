import { Composition } from 'remotion';
import { Film } from './Film';
import { Reel1, REEL1_FRAMES } from './reels/Reel1';
import { Reel2, REEL2_FRAMES } from './reels/Reel2';
import { V1, V1_FRAMES } from './r8/V1';
import { V2, V2_FRAMES } from './r8/V2';
import { V3, V3_FRAMES } from './r8/V3';
import { V4, V4_FRAMES } from './r8/V4';
import { V5, V5_FRAMES } from './r8/V5';
import { V6, V6_FRAMES } from './r8/V6';
import { V7, V7_FRAMES } from './r8/V7';
import { V8, V8_FRAMES } from './r8/V8';
import { V9, V9_FRAMES } from './r9/V9';
import { V10, V10_FRAMES } from './r9/V10';
import { V11, V11_FRAMES } from './r9/V11';
import { V12, V12_FRAMES } from './r9/V12';
import { V13, V13_FRAMES } from './r9/V13';
import { V14, V14_FRAMES } from './r9/V14';
import { V15, V15_FRAMES } from './r9/V15';
import { V16, V16_FRAMES } from './r9/V16';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="BrandFilm" component={Film} durationInFrames={1635} fps={30} width={1080} height={1920} />
    <Composition id="Reel1-CoFiring" component={Reel1} durationInFrames={REEL1_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Reel2-TenderWords" component={Reel2} durationInFrames={REEL2_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Video1" component={V1} durationInFrames={V1_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Video2" component={V2} durationInFrames={V2_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Video3" component={V3} durationInFrames={V3_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Video4" component={V4} durationInFrames={V4_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Video5" component={V5} durationInFrames={V5_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Video6" component={V6} durationInFrames={V6_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Video7" component={V7} durationInFrames={V7_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Video8" component={V8} durationInFrames={V8_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Video9" component={V9} durationInFrames={V9_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Video10" component={V10} durationInFrames={V10_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Video11" component={V11} durationInFrames={V11_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Video12" component={V12} durationInFrames={V12_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Video13" component={V13} durationInFrames={V13_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Video14" component={V14} durationInFrames={V14_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Video15" component={V15} durationInFrames={V15_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Video16" component={V16} durationInFrames={V16_FRAMES} fps={30} width={1080} height={1920} />
  </>
);
