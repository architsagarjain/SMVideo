import React from 'react';
import {random, useCurrentFrame} from 'remotion';
import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';
import {EASE_IN_OUT, EASE_OUT, FPS, lerp, springAt, tween} from '../theme';
import {ICONS} from './icons';

/**
 * Explainer-graphics kit, modelled on the reference reel: flat charcoal glyph
 * icons on a light-grey stage, chunky pixel type that scrambles in, two accents
 * (sky blue = good, pink/red = bad), dotted connectors, tick/cross marks.
 */
export const X = {
  stage: '#F4F4F4',
  ink: '#2E2F33',
  grey: '#C6C7CB',
  greyText: '#A7A9AF',
  blue: '#4DB6F2',
  pink: '#F28AB0',
  red: '#EE6B67',
  green: '#4CB050',
  navy: '#2F3A5C',
};

export const PIXEL = 'Jersey20'; // no space: an unquoted CSS family name can't contain the token "20"
// Jersey 20, stretched 1.3x wide (PIXEL_WIDE) to get the reference's chunky wide pixel caps.
// (Pixelify Sans and Silkscreen were tried: ambiguous 5/S, 2/Z, 4 and %.)
loadFont({family: PIXEL, url: staticFile('fonts/Jersey20-Regular.ttf'), weight: '400'});
export const PIXEL_WIDE = 1.3;

export const useT = () => useCurrentFrame() / FPS;

/** Spring pop: 0 -> slight overshoot -> 1. */
export const pop = (t: number, at: number) => springAt(t, at, 11, 190);

// ---------------------------------------------------------------------------
// Icon: Phosphor glyph that pops in (scale + a little rotation)
// ---------------------------------------------------------------------------
export const Icon: React.FC<{
  name: string;
  at: number;
  size: number;
  x: number;
  y: number;
  color?: string;
  out?: number;
  rot?: number;
  flip?: boolean;
}> = ({name, at, size, x, y, color = X.ink, out, rot = -8, flip}) => {
  const t = useT();
  if (t < at - 0.02) return null;
  const p = pop(t, at);
  const o = out === undefined ? 1 : 1 - tween(t, out, 0.2);
  if (o <= 0) return null;
  return (
    <svg
      viewBox="0 0 256 256"
      width={size}
      height={size}
      style={{
        position: 'absolute',
        left: x - size / 2,
        top: y - size / 2,
        scale: `${(flip ? -1 : 1) * Math.max(0, p) * (out === undefined ? 1 : lerp(1 - o, 1, 0.6))} ${Math.max(0, p) * (out === undefined ? 1 : lerp(1 - o, 1, 0.6))}`,
        rotate: `${lerp(Math.min(p, 1), rot, 0)}deg`,
        opacity: Math.min(1, p * 3) * o,
      }}
    >
      {ICONS[name].map((d, i) => (
        <path key={i} d={d} fill={color} />
      ))}
    </svg>
  );
};

// ---------------------------------------------------------------------------
// Pixel text that scrambles in, character by character
// ---------------------------------------------------------------------------
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%+';
export const Scramble: React.FC<{
  text: string;
  at: number;
  x: number;
  y: number;
  size: number;
  color?: string;
  align?: 'left' | 'center' | 'right';
  out?: number;
  per?: number;
  weight?: number;
  spacing?: number;
}> = ({text, at, x, y, size, color = X.ink, align = 'center', out, per = 0.03, weight = 400, spacing = 0.03}) => {
  const t = useT();
  if (t < at - 0.02) return null;
  const o = out === undefined ? 1 : 1 - tween(t, out, 0.2);
  if (o <= 0) return null;
  const frame = Math.floor(t * FPS);
  const chars = text.split('').map((ch, i) => {
    const start = at + i * per;
    const lock = start + 0.16;
    if (ch === ' ') return ' ';
    if (t < start) return ' ';
    if (t >= lock) return ch;
    return GLYPHS[Math.floor(random(`${text}-${i}-${frame}`) * GLYPHS.length)];
  });
  const translateX = align === 'center' ? '-50%' : align === 'right' ? '-100%' : '0%';
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        translate: `${translateX} -50%`,
        scale: `${PIXEL_WIDE} 1`,
        transformOrigin: align === 'center' ? 'center' : align === 'left' ? 'left center' : 'right center',
        fontFamily: PIXEL,
        fontWeight: weight,
        fontSize: size,
        letterSpacing: size * spacing,
        color,
        whiteSpace: 'pre',
        lineHeight: 1,
        opacity: o,
      }}
    >
      {chars.join('')}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Small triangle marker (▲ / ▼) above a stat
// ---------------------------------------------------------------------------
export const Marker: React.FC<{at: number; x: number; y: number; dir: 'up' | 'down'; color: string; size?: number}> = ({at, x, y, dir, color, size = 26}) => {
  const t = useT();
  if (t < at) return null;
  const p = pop(t, at);
  const bob = Math.sin((t - at) * 5) * 3;
  return (
    <svg width={size} height={size * 0.7} viewBox="0 0 20 14" style={{position: 'absolute', left: x - size / 2, top: y + bob, scale: Math.max(0, p)}}>
      <path d={dir === 'down' ? 'M0 0 H20 L10 14 Z' : 'M0 14 H20 L10 0 Z'} fill={color} />
    </svg>
  );
};

// ---------------------------------------------------------------------------
// Tick / cross marks
// ---------------------------------------------------------------------------
export const Tick: React.FC<{at: number; x: number; y: number; size?: number; color?: string; out?: number}> = ({at, x, y, size = 60, color = X.green, out}) => {
  const t = useT();
  if (t < at || (out !== undefined && t > out)) return null;
  const d = tween(t, at, 0.25, EASE_OUT);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{position: 'absolute', left: x - size / 2, top: y - size / 2, scale: lerp(pop(t, at), 0.6, 1)}}>
      <path d="M3.5 12.5 L9.5 18 L20.5 6" fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - d} />
    </svg>
  );
};

export const Cross: React.FC<{at: number; x: number; y: number; size?: number; color?: string; out?: number}> = ({at, x, y, size = 56, color = X.red, out}) => {
  const t = useT();
  if (t < at || (out !== undefined && t > out)) return null;
  const a = tween(t, at, 0.14, EASE_OUT);
  const b = tween(t, at + 0.1, 0.14, EASE_OUT);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{position: 'absolute', left: x - size / 2, top: y - size / 2, scale: lerp(pop(t, at), 0.6, 1)}}>
      <path d="M5 5 L19 19" stroke={color} strokeWidth={4} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - a} />
      <path d="M19 5 L5 19" stroke={color} strokeWidth={4} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - b} />
    </svg>
  );
};

// ---------------------------------------------------------------------------
// Dotted connector that draws from (x1,y1) to (x2,y2)
// ---------------------------------------------------------------------------
export const Dotted: React.FC<{at: number; x1: number; y1: number; x2: number; y2: number; dur?: number; color?: string; arrow?: boolean; width?: number}> = ({
  at,
  x1,
  y1,
  x2,
  y2,
  dur = 0.4,
  color = X.grey,
  arrow,
  width = 6,
}) => {
  const t = useT();
  if (t < at) return null;
  const p = tween(t, at, dur, EASE_IN_OUT);
  const ex = lerp(p, x1, x2);
  const ey = lerp(p, y1, y2);
  const ang = Math.atan2(y2 - y1, x2 - x1);
  return (
    <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1} height={1}>
      <line x1={x1} y1={y1} x2={ex} y2={ey} stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray={`0.1 ${width * 2.4}`} />
      {arrow && p > 0.95 ? (
        <path
          d={`M${x2} ${y2} L${x2 - 22 * Math.cos(ang - 0.5)} ${y2 - 22 * Math.sin(ang - 0.5)} M${x2} ${y2} L${x2 - 22 * Math.cos(ang + 0.5)} ${y2 - 22 * Math.sin(ang + 0.5)}`}
          stroke={color}
          strokeWidth={width}
          strokeLinecap="round"
        />
      ) : null}
    </svg>
  );
};

// ---------------------------------------------------------------------------
// Dark rounded "?" box (reference: question tiles)
// ---------------------------------------------------------------------------
export const QBox: React.FC<{at: number; x: number; y: number; size?: number; out?: number}> = ({at, x, y, size = 150, out}) => {
  const t = useT();
  if (t < at) return null;
  const p = pop(t, at);
  const o = out === undefined ? 1 : 1 - tween(t, out, 0.2);
  return (
    <div
      style={{
        position: 'absolute',
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        borderRadius: size * 0.12,
        background: X.ink,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        scale: Math.max(0, p),
        rotate: `${lerp(Math.min(1, p), -10, 0)}deg`,
        opacity: o,
        boxShadow: '0 12px 30px -12px rgba(0,0,0,0.35)',
      }}
    >
      <span style={{fontFamily: PIXEL, fontSize: size * 0.8, color: X.blue, lineHeight: 1, scale: `${PIXEL_WIDE} 1`}}>?</span>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Grid of person pictograms that fills in one by one
// ---------------------------------------------------------------------------
export const PeopleGrid: React.FC<{
  at: number;
  x: number;
  y: number;
  cols: number;
  rows: number;
  size: number;
  gap: number;
  dur?: number;
  colorOf?: (i: number, t: number) => string;
}> = ({at, x, y, cols, rows, size, gap, dur = 0.9, colorOf}) => {
  const t = useT();
  if (t < at) return null;
  const n = cols * rows;
  const order = Array.from({length: n}, (_, i) => i).sort((a, b) => random(`pg${a}`) - random(`pg${b}`));
  const rank: number[] = [];
  order.forEach((idx, r) => (rank[idx] = r));
  const w = cols * size + (cols - 1) * gap;
  return (
    <>
      {Array.from({length: n}, (_, i) => {
        const c = i % cols;
        const r = Math.floor(i / cols);
        const s = at + (rank[i] / n) * dur;
        if (t < s) return null;
        const p = pop(t, s);
        return (
          <svg
            key={i}
            viewBox="0 0 256 256"
            width={size}
            height={size * 1.25}
            style={{position: 'absolute', left: x - w / 2 + c * (size + gap), top: y + r * (size * 1.25 + gap * 0.4), scale: Math.max(0, p), opacity: Math.min(1, p * 2)}}
          >
            <path d={ICONS.person[0]} fill={colorOf ? colorOf(i, t) : X.grey} />
          </svg>
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------------------
// Camera over a 1080x1920 canvas: keyframes of {t, x, y, s} (x/y = canvas point
// shown at the centre of the screen).
// ---------------------------------------------------------------------------
export type CamKey = {t: number; x: number; y: number; s: number};
export const camAt = (t: number, keys: CamKey[]) => {
  if (t <= keys[0].t) return keys[0];
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (t <= b.t) {
      const p = tween(t, a.t, b.t - a.t, EASE_IN_OUT);
      return {t, x: lerp(p, a.x, b.x), y: lerp(p, a.y, b.y), s: lerp(p, a.s, b.s)};
    }
  }
  return keys[keys.length - 1];
};

export const Canvas: React.FC<{keys: CamKey[]; children: React.ReactNode}> = ({keys, children}) => {
  const t = useT();
  const c = camAt(t, keys);
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transformOrigin: '0 0', transform: `translate(540px, 960px) scale(${c.s}) translate(${-c.x}px, ${-c.y}px)`}}>
      {children}
    </div>
  );
};
