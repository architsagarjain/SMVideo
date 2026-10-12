import React from 'react';
import {AbsoluteFill, OffthreadVideo, staticFile} from 'remotion';
import {X, useT} from '../explainer/kit';
import {SANS, lerp, tween} from '../theme';
import captions from './captions.json';
import {cameraAt2, inGfx2, PANEL, washAt} from './timeline';

/** Footage panel is cropped from this source-y down in split mode, so her head pops out above it. */
const PANEL_CROP_Y = 1150;
const PANEL_RADIUS = 46;

const camStyle = (t: number): React.CSSProperties => {
  const c = cameraAt2(t);
  return {transformOrigin: `${c.ox}px ${c.oy}px`, scale: c.scale};
};

export const Footage2: React.FC = () => {
  const t = useT();
  const c = cameraAt2(t);
  const crop = PANEL_CROP_Y * c.panel;
  const r = (PANEL_RADIUS * c.panel) / c.scale;
  return (
    <AbsoluteFill style={camStyle(t)}>
      {c.panel > 0 ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: crop, bottom: 0, borderRadius: r, boxShadow: `0 ${40 / c.scale}px ${90 / c.scale}px -${20 / c.scale}px rgba(0,0,0,${0.35 * c.panel})`}} />
      ) : null}
      <AbsoluteFill style={{clipPath: c.panel > 0 ? `inset(${crop}px 0px 0px 0px round ${r}px)` : undefined}}>
        <OffthreadVideo src={staticFile('reel2/footage_1080.mp4')} muted style={{width: '100%', height: '100%'}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Light-grey wash over the wall (her cut-out is drawn on top). Outside the panel it is full-screen. */
export const Wash: React.FC = () => {
  const t = useT();
  const w = washAt(t);
  if (w <= 0) return null;
  // in split mode the footage is already clipped to the panel and the stage shows around it
  if (t >= PANEL.start && t < PANEL.end) return null;
  return (
    <AbsoluteFill style={{backgroundColor: X.stage, opacity: 0.93 * w}}>
      <AbsoluteFill style={{background: 'radial-gradient(80% 50% at 50% 30%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 70%)'}} />
    </AbsoluteFill>
  );
};

/** The speaker cut out with the RVM matte; only needed while the wall is washed. */
export const Subject2: React.FC = () => {
  const t = useT();
  if (washAt(t) <= 0) return null;
  return (
    <AbsoluteFill style={camStyle(t)}>
      <OffthreadVideo src={staticFile('reel2/subject_1080.webm')} transparent muted style={{width: '100%', height: '100%'}} />
    </AbsoluteFill>
  );
};

/** Black stage behind everything (only visible around the panel). */
export const Base: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{backgroundColor: X.stage}}>{children}</AbsoluteFill>
);

// ---------------------------------------------------------------------------
// Captions: plain white bold, 1-3 words, only on the talking head
// ---------------------------------------------------------------------------
type Word = {text: string; start: number; end: number};
const CHUNKS = captions as Word[][];

export const Captions2: React.FC = () => {
  const t = useT();
  if (inGfx2(t)) return null;
  let ci = -1;
  for (let i = 0; i < CHUNKS.length; i++) if (CHUNKS[i][0].start - 0.04 <= t) ci = i;
  if (ci < 0) return null;
  const chunk = CHUNKS[ci];
  const next = CHUNKS[ci + 1];
  if (t > chunk[chunk.length - 1].end + 0.6 && (!next || t < next[0].start - 0.04)) return null;
  const p = tween(t, chunk[0].start - 0.04, 0.12);
  const c = cameraAt2(t);
  const y = lerp(c.panel, 1330, 1600);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: 60,
          right: 60,
          top: y,
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
