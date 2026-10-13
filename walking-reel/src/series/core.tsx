import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, staticFile} from 'remotion';
import {X, useT} from '../explainer/kit';
import {EASE_IN_OUT, EASE_OUT, FPS, SANS, lerp, tween} from '../theme';

/**
 * Shared engine for the Bhavika series reels (same look as Reel2):
 * footage -> wall wash -> graphics behind her head / split chart -> her cut-out
 * -> B-roll cutaways -> full-screen explainer scenes -> captions.
 * Each reel provides a ReelConfig with its own timing.
 */
export type Win = {start: number; end: number};
export type Move = {origin: [number, number]; inStart: number; inDur: number; scale: number; outStart: number; outDur: number; panel?: boolean};
export type Broll = {start: number; end: number; src: string};
type Word = {text: string; start: number; end: number};

export type ReelConfig = {
  dir: string; // public/<dir>/footage_1080.mp4 and subject_1080.webm
  gfx: Win[]; // full-screen explainer scenes (captions hidden)
  behind: Win[]; // wall washed, graphics behind her head
  panel?: Win; // split layout
  moves: Move[];
  broll: Broll[]; // full-screen cutaways (captions stay)
  captions: Word[][];
};

const FACE: [number, number] = [540, 820];
export const BOTTOM: [number, number] = [540, 1920];
export const FACE_ORIGIN = FACE;

export const inWin = (t: number, ws: Win[]) => ws.some((w) => t >= w.start && t < w.end);

export const washAt = (cfg: ReelConfig, t: number) => {
  let w = 0;
  for (const b of [...cfg.behind, ...(cfg.panel ? [cfg.panel] : [])]) {
    if (t >= b.start - 0.01 && t < b.end) w = Math.max(w, b.start < 0.05 ? 1 : tween(t, b.start, 0.22));
  }
  return w;
};

export const cameraAt = (cfg: ReelConfig, t: number) => {
  for (const m of cfg.moves) {
    if (t < m.inStart || t > m.outStart + m.outDur) continue;
    const inP = tween(t, m.inStart, m.inDur, EASE_IN_OUT);
    const outP = tween(t, m.outStart, m.outDur, EASE_IN_OUT);
    const s = t < m.outStart ? lerp(inP, 1, m.scale) : lerp(outP, m.scale, 1);
    return {scale: s, ox: m.origin[0], oy: m.origin[1], panel: m.panel ? (t < m.outStart ? inP : 1 - outP) : 0};
  }
  return {scale: 1, ox: FACE[0], oy: FACE[1], panel: 0};
};

const PANEL_CROP_Y = 1150;
const PANEL_RADIUS = 46;
const camStyle = (cfg: ReelConfig, t: number): React.CSSProperties => {
  const c = cameraAt(cfg, t);
  return {transformOrigin: `${c.ox}px ${c.oy}px`, scale: c.scale};
};

export const Footage: React.FC<{cfg: ReelConfig}> = ({cfg}) => {
  const t = useT();
  const c = cameraAt(cfg, t);
  const crop = PANEL_CROP_Y * c.panel;
  const r = (PANEL_RADIUS * c.panel) / c.scale;
  return (
    <AbsoluteFill style={camStyle(cfg, t)}>
      {c.panel > 0 ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: crop, bottom: 0, borderRadius: r, boxShadow: `0 ${40 / c.scale}px ${90 / c.scale}px -${20 / c.scale}px rgba(0,0,0,${0.35 * c.panel})`}} />
      ) : null}
      <AbsoluteFill style={{clipPath: c.panel > 0 ? `inset(${crop}px 0px 0px 0px round ${r}px)` : undefined}}>
        <OffthreadVideo src={staticFile(`${cfg.dir}/footage_1080.mp4`)} muted style={{width: '100%', height: '100%'}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Wash: React.FC<{cfg: ReelConfig}> = ({cfg}) => {
  const t = useT();
  const w = washAt(cfg, t);
  if (w <= 0) return null;
  if (cfg.panel && t >= cfg.panel.start && t < cfg.panel.end) return null;
  return (
    <AbsoluteFill style={{backgroundColor: X.stage, opacity: 0.93 * w}}>
      <AbsoluteFill style={{background: 'radial-gradient(80% 50% at 50% 30%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 70%)'}} />
    </AbsoluteFill>
  );
};

export const Subject: React.FC<{cfg: ReelConfig}> = ({cfg}) => {
  const t = useT();
  if (washAt(cfg, t) <= 0) return null;
  return (
    <AbsoluteFill style={camStyle(cfg, t)}>
      <OffthreadVideo src={staticFile(`${cfg.dir}/subject_1080.webm`)} transparent muted style={{width: '100%', height: '100%'}} />
    </AbsoluteFill>
  );
};

/** Full-screen B-roll with a short push-in; `overlay` renders on top (gets global time). */
export const BrollCuts: React.FC<{cfg: ReelConfig; overlay?: (t: number) => React.ReactNode}> = ({cfg, overlay}) => {
  const t = useT();
  return (
    <>
      {cfg.broll.map((b, i) => {
        const from = Math.round(b.start * FPS);
        const dur = Math.round(b.end * FPS) - from;
        return (
          <Sequence key={i} from={from} durationInFrames={dur} premountFor={FPS}>
            <AbsoluteFill style={{backgroundColor: '#000'}}>
              <AbsoluteFill style={{scale: lerp(tween(t, b.start, 0.5, EASE_OUT), 1.1, 1) * lerp(tween(t, b.start, b.end - b.start), 1, 1.04)}}>
                <OffthreadVideo src={staticFile(`${cfg.dir}/${b.src}`)} muted style={{width: '100%', height: '100%'}} />
              </AbsoluteFill>
              <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.35) 100%)'}} />
            </AbsoluteFill>
          </Sequence>
        );
      })}
      {inWin(t, cfg.broll) && overlay ? overlay(t) : null}
    </>
  );
};

/** Plain white bold captions, 1-3 words, hidden on full-screen explainer scenes. */
export const Captions: React.FC<{cfg: ReelConfig}> = ({cfg}) => {
  const t = useT();
  if (inWin(t, cfg.gfx)) return null;
  const CH = cfg.captions;
  let ci = -1;
  for (let i = 0; i < CH.length; i++) if (CH[i][0].start - 0.04 <= t) ci = i;
  if (ci < 0) return null;
  const chunk = CH[ci];
  const next = CH[ci + 1];
  if (t > chunk[chunk.length - 1].end + 0.6 && (!next || t < next[0].start - 0.04)) return null;
  const p = tween(t, chunk[0].start - 0.04, 0.12);
  const c = cameraAt(cfg, t);
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

/** Light-grey full-screen stage with a white flash in and a slow drift. */
export const Stage: React.FC<{w: Win; children: React.ReactNode}> = ({w, children}) => {
  const t = useT();
  if (t < w.start || t >= w.end) return null;
  const flash = 1 - tween(t, w.start, 0.16, EASE_OUT);
  const drift = lerp(tween(t, w.start, w.end - w.start), 1, 1.045);
  return (
    <AbsoluteFill style={{backgroundColor: X.stage, overflow: 'hidden'}}>
      <AbsoluteFill style={{scale: drift}}>{children}</AbsoluteFill>
      <AbsoluteFill style={{backgroundColor: '#fff', opacity: flash * 0.9}} />
    </AbsoluteFill>
  );
};

export const Base: React.FC<{children: React.ReactNode}> = ({children}) => <AbsoluteFill style={{backgroundColor: X.stage}}>{children}</AbsoluteFill>;
