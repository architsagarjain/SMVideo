import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, staticFile} from 'remotion';
import {FACE_ORIGIN, Move, ReelConfig, Win, inWin} from '../series/core';
import {TimeMap, outAt} from '../series/timemap';
import {useT} from '../explainer/kit';
import {chunkAt} from '../series/kit2';
import {EASE_IN, EASE_OUT, FPS, SANS, SERIF, lerp, tween} from '../theme';

/**
 * Minimal reel style (after the reference reel): her talking head full screen with quick punch-ins,
 * full-screen B-roll cutaways that carry one white key line revealed word by word, soft blur
 * transitions in and out, and small serif captions. Times are source seconds.
 */
export const WHITE = '#FFFFFF';
export const ACCENT = '#F5C451';
export const SHADOW_TXT = '0 2px 14px rgba(0,0,0,0.55), 0 1px 3px rgba(0,0,0,0.5)';
/** Captions sit on her light sweater: a wider, darker glow keeps the thin serif readable. */
export const SHADOW_CAP = '0 0 26px rgba(0,0,0,0.85), 0 0 10px rgba(0,0,0,0.7), 0 2px 4px rgba(0,0,0,0.8)';

/** A quick punch-in: snaps in over 0.14 s, holds, snaps back on the next cut. */
export const punch = (at: number, end: number, scale = 1.12): Move => ({origin: FACE_ORIGIN, inStart: at, inDur: 0.14, scale, outStart: end - 0.12, outDur: 0.12});

export type Cut = {start: number; end: number; src: string; line?: string; lineAt?: number; y?: number; times?: number[]};

const TRANS = 0.22;
/** Blur-bloom amount at a window edge (1 = fully blurred / bright, 0 = clean). */
const edge = (t: number, w: Win) => Math.max(1 - tween(t, w.start, TRANS, EASE_OUT), tween(t, w.end - TRANS, TRANS, EASE_IN));

/** Full-screen B-roll cutaways (her own clips), each with an optional key line. */
export const Cutaways: React.FC<{cuts: Cut[]; tm: TimeMap; dir: string}> = ({cuts, tm, dir}) => {
  const t = useT();
  return (
    <>
      {cuts.map((c, i) => {
        const from = Math.round(outAt(tm, c.start) * FPS);
        const dur = Math.max(1, Math.round(outAt(tm, c.end) * FPS) - from);
        const on = t >= c.start && t < c.end;
        const e = on ? edge(t, c) : 1;
        const push = lerp(tween(t, c.start, c.end - c.start, (x) => x), 1.04, 1.12);
        // timed overlays stay outside the Sequence (its clock restarts at zero); only the video is inside
        return (
          <React.Fragment key={i}>
            <AbsoluteFill style={{opacity: on ? 1 - e * 0.85 : 0, filter: `blur(${e * 18}px) brightness(${1 + e * 0.35})`}}>
              <AbsoluteFill style={{scale: push}}>
                <Sequence from={from} durationInFrames={dur} layout="none">
                  <OffthreadVideo src={staticFile(`${dir}/${c.src}`)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                </Sequence>
              </AbsoluteFill>
              {c.line ? <AbsoluteFill style={{background: 'radial-gradient(90% 45% at 50% 50%, rgba(0,0,0,0.32), rgba(0,0,0,0) 75%)'}} /> : null}
            </AbsoluteFill>
            {c.line && on ? <KeyLine text={c.line} at={c.lineAt ?? c.start + 0.15} times={c.times} y={c.y ?? 900} out={c.end - 0.18} /> : null}
          </React.Fragment>
        );
      })}
    </>
  );
};

/** White uppercase key line, words fading in one by one with a little blur. Breaks on "|". */
export const KeyLine: React.FC<{text: string; at: number; times?: number[]; y?: number; out?: number; size?: number; color?: string}> = ({text, at, times, y = 900, out = 1e9, size = 74, color = WHITE}) => {
  const t = useT();
  const lines = text.split('|').map((l) => l.trim().split(/\s+/));
  let k = 0;
  const o = 1 - tween(t, out, 0.18, EASE_IN);
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: y, translate: '0 -50%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: size * 0.12, opacity: o}}>
      {lines.map((ws, li) => (
        <div key={li} style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: size * 0.26}}>
          {ws.map((w, wi) => {
            const idx = k++;
            const p = tween(t, times?.[idx] ?? at + idx * 0.11, 0.32, EASE_OUT); // per-word times when given (synced to speech)
            return (
              <span key={wi} style={{fontFamily: SANS, fontWeight: 700, fontSize: size, lineHeight: 1.05, letterSpacing: -size * 0.02, color, textShadow: SHADOW_TXT, opacity: p, filter: `blur(${(1 - p) * 8}px)`, translate: `0 ${lerp(p, 14, 0)}px`, display: 'inline-block'}}>
                {w}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/** Small serif captions (reference style), hidden over key lines and graphics. */
export const SerifCaps: React.FC<{cfg: ReelConfig; hide: Win[]; y?: number}> = ({cfg, hide, y = 1390}) => {
  const t = useT();
  if (inWin(t, hide)) return null;
  const chunk = chunkAt(cfg.captions, t);
  if (!chunk) return null;
  const k = tween(t, chunk[0].start - 0.04, 0.12);
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: y, translate: `0 ${lerp(k, 8, 0)}px`, textAlign: 'center', opacity: k}}>
      <span style={{fontFamily: SERIF, fontStyle: 'normal', fontSize: 78, lineHeight: 1.1, color: WHITE, letterSpacing: 0.2, textShadow: SHADOW_CAP, whiteSpace: 'nowrap'}}>{chunk.map((w) => w.text).join(' ')}</span>
    </div>
  );
};

/** A soft dark gradient at the top, for text that sits over her footage. */
export const TopShade: React.FC<{wins: Win[]; reach?: number}> = ({wins, reach = 34}) => {
  const t = useT();
  let o = 0;
  for (const w of wins) if (t >= w.start && t < w.end + 0.3) o = Math.max(o, tween(t, w.start, 0.3) * (1 - tween(t, w.end - 0.1, 0.3)));
  if (o <= 0) return null;
  return <AbsoluteFill style={{opacity: o, background: `linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) ${reach * 0.6}%, rgba(0,0,0,0) ${reach}%)`}} />;
};

/** Ending: a clean comment line - "Comment WORD" - in the middle of the frame. */
export const CommentEnd: React.FC<{start: number; word: string; wordAt: number; note: string; noteAt: number; y?: number; size?: number}> = ({start, word, wordAt, note, noteAt, y = 520, size = 150}) => {
  const t = useT();
  if (t < start) return null;
  const a = tween(t, start, 0.35, EASE_OUT);
  const w = tween(t, wordAt, 0.4, EASE_OUT);
  const n = tween(t, noteAt, 0.4, EASE_OUT);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{opacity: a, background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 26%, rgba(0,0,0,0) 40%)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: y, translate: '0 -50%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}}>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 64, color: WHITE, textShadow: SHADOW_TXT, opacity: a, translate: `0 ${lerp(a, 16, 0)}px`}}>Comment</div>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: size, lineHeight: 1, letterSpacing: size * 0.04, color: WHITE, textShadow: SHADOW_TXT, opacity: w, filter: `blur(${(1 - w) * 10}px)`, scale: lerp(w, 0.92, 1)}}>{word}</div>
        <div style={{marginTop: 10, padding: '12px 30px', borderRadius: 999, background: 'rgba(255,255,255,0.94)', color: '#141414', fontFamily: SANS, fontWeight: 700, fontSize: 36, opacity: n, translate: `0 ${lerp(n, 14, 0)}px`, boxShadow: '0 12px 30px -12px rgba(0,0,0,0.5)'}}>{note}</div>
      </div>
    </AbsoluteFill>
  );
};
