import React from 'react';
import {AbsoluteFill} from 'remotion';
import captions from '../data/captions.json';
import {SANS, lerp, tween} from '../theme';
import {inGfx} from './timeline';
import {useT} from './kit';

type Word = {text: string; start: number; end: number};
type Group = {words: Word[]};

// Reference style: plain white bold words with a soft shadow, 1-3 at a time,
// only on the talking head. Re-chunk the phrase groups into <= 3 words.
const CHUNKS: Word[][] = [];
for (const g of captions as Group[]) {
  const n = Math.ceil(g.words.length / 3);
  const size = Math.ceil(g.words.length / n);
  for (let i = 0; i < g.words.length; i += size) CHUNKS.push(g.words.slice(i, i + size));
}

export const TalkCaptions: React.FC = () => {
  const t = useT();
  if (inGfx(t)) return null;
  let ci = -1;
  for (let i = 0; i < CHUNKS.length; i++) if (CHUNKS[i][0].start - 0.04 <= t) ci = i;
  if (ci < 0) return null;
  const chunk = CHUNKS[ci];
  const next = CHUNKS[ci + 1];
  // hold until the next chunk, but clear after long pauses
  if (t > chunk[chunk.length - 1].end + 0.6 && (!next || t < next[0].start - 0.04)) return null;
  const p = tween(t, chunk[0].start - 0.04, 0.12);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: 60,
          right: 60,
          top: 1334,
          translate: `0px ${-50 + lerp(p, 6, 0)}%`,
          textAlign: 'center',
          fontFamily: SANS,
          fontWeight: 800,
          fontSize: 76,
          letterSpacing: -1.5,
          lineHeight: 1.05,
          color: '#FFFFFF',
          opacity: p,
          scale: lerp(p, 0.94, 1),
          textShadow: '0 4px 18px rgba(0,0,0,0.55), 0 2px 4px rgba(0,0,0,0.45), 0 0 2px rgba(0,0,0,0.5)',
        }}
      >
        {chunk.map((w) => w.text).join(' ')}
      </div>
    </AbsoluteFill>
  );
};
