import React from 'react';
import {AbsoluteFill, OffthreadVideo, staticFile} from 'remotion';
import {ExplainerScenes} from './Scenes';
import {TalkCaptions} from './TalkCaptions';

/**
 * v4, modelled on the reference reel: the talking head is static with plain
 * white captions; full-screen explainer graphics take over between her
 * statements while the voice continues.
 */
export const ExplainerReel: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    <OffthreadVideo src={staticFile('footage_clean_1080.mp4')} muted style={{width: '100%', height: '100%'}} />
    <TalkCaptions />
    <ExplainerScenes />
  </AbsoluteFill>
);
