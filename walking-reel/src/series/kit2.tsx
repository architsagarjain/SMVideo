import React from 'react';
import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';
import {EASE_IN, EASE_OUT, lerp, springAt, tween} from '../theme';
import {IC} from './icons2';

/** Shared bits for the v9 / v10 reels. */
export const ANTON = 'Anton';
loadFont({family: ANTON, url: staticFile('fonts/Anton-Regular.ttf'), weight: '400'});

/** 0..1 visibility of a [a, b) window with fade in / fade out. */
export const vis = (t: number, a: number, b: number, fi = 0.25, fo = 0.2) => {
  if (t < a || t > b + fo) return 0;
  return tween(t, a, fi, EASE_OUT) * (1 - tween(t, b, fo, EASE_IN));
};
/** Spring pop 0 -> ~1.08 -> 1. */
export const popAt = (t: number, at: number) => (t < at ? 0 : springAt(t, at, 12, 210));

/** Static Phosphor icon. */
export const Ico: React.FC<{name: string; size: number; color?: string; style?: React.CSSProperties}> = ({name, size, color = '#141414', style}) => (
  <svg viewBox="0 0 256 256" width={size} height={size} style={style}>
    {(IC[name] ?? []).map((d, i) => (
      <path key={i} d={d} fill={color} />
    ))}
  </svg>
);

type Word = {text: string; start: number; end: number};
/** The caption chunk on screen at t (same rules as the series engine), or null. */
export const chunkAt = (CH: Word[][], t: number) => {
  let ci = -1;
  for (let i = 0; i < CH.length; i++) if (CH[i][0].start - 0.04 <= t) ci = i;
  if (ci < 0) return null;
  const chunk = CH[ci];
  const next = CH[ci + 1];
  if (t > chunk[chunk.length - 1].end + 0.6 && (!next || t < next[0].start - 0.04)) return null;
  return chunk;
};

// ---------------------------------------------------------------------------
// Seven-segment LCD digits
// ---------------------------------------------------------------------------
const SEGS: Record<string, string> = {
  '0': 'abcdef', '1': 'bc', '2': 'abged', '3': 'abgcd', '4': 'fgbc', '5': 'afgcd', '6': 'afgedc', '7': 'abc', '8': 'abcdefg', '9': 'abcdfg', '-': 'g', ' ': '',
};
const hseg = (x1: number, x2: number, y: number, T: number) =>
  `${x1},${y} ${x1 + T / 2},${y - T / 2} ${x2 - T / 2},${y - T / 2} ${x2},${y} ${x2 - T / 2},${y + T / 2} ${x1 + T / 2},${y + T / 2}`;
const vseg = (x: number, y1: number, y2: number, T: number) =>
  `${x},${y1} ${x + T / 2},${y1 + T / 2} ${x + T / 2},${y2 - T / 2} ${x},${y2} ${x - T / 2},${y2 - T / 2} ${x - T / 2},${y1 + T / 2}`;

export const SevenSeg: React.FC<{text: string; h: number; on: string; off: string; glow?: string}> = ({text, h, on, off, glow}) => {
  const W = h * 0.56;
  const T = h * 0.11;
  const g = T * 0.18;
  const gap = h * 0.12;
  const dotW = h * 0.16;
  const items: {ch: string; dot: boolean}[] = [];
  for (const ch of text) {
    if (ch === '.') items[items.length - 1].dot = true;
    else items.push({ch, dot: false});
  }
  let x = 0;
  const parts: React.ReactNode[] = [];
  items.forEach((it, i) => {
    const s = SEGS[it.ch] ?? '';
    const P: Record<string, string> = {
      a: hseg(x + T / 2 + g, x + W - T / 2 - g, T / 2, T),
      g: hseg(x + T / 2 + g, x + W - T / 2 - g, h / 2, T),
      d: hseg(x + T / 2 + g, x + W - T / 2 - g, h - T / 2, T),
      f: vseg(x + T / 2, T / 2 + g, h / 2 - g, T),
      e: vseg(x + T / 2, h / 2 + g, h - T / 2 - g, T),
      b: vseg(x + W - T / 2, T / 2 + g, h / 2 - g, T),
      c: vseg(x + W - T / 2, h / 2 + g, h - T / 2 - g, T),
    };
    for (const k of 'abcdefg') parts.push(<polygon key={`${i}${k}`} points={P[k]} fill={s.includes(k) ? on : off} />);
    x += W;
    if (it.dot) {
      parts.push(<circle key={`${i}dot`} cx={x + dotW / 2} cy={h - T / 2} r={T * 0.62} fill={on} />);
      x += dotW;
    } else x += gap;
  });
  return (
    <svg width={x} height={h} viewBox={`0 0 ${x} ${h}`} style={{overflow: 'visible', filter: glow ? `drop-shadow(0 0 ${h * 0.06}px ${glow}) drop-shadow(0 0 ${h * 0.02}px ${glow})` : undefined}}>
      {parts}
    </svg>
  );
};

/** Mouse cursor (macOS style arrow) with a click ripple. */
export const Cursor: React.FC<{x: number; y: number; click?: number; t: number; size?: number}> = ({x, y, click, t, size = 70}) => {
  const k = click !== undefined && t >= click ? tween(t, click, 0.45) : 0;
  const press = click !== undefined && t >= click && t < click + 0.16 ? 0.86 : 1;
  return (
    <>
      {k > 0 && k < 1 ? (
        <div style={{position: 'absolute', left: x - 60 * k, top: y - 60 * k, width: 120 * k, height: 120 * k, borderRadius: '50%', border: `${6 * (1 - k)}px solid rgba(255,255,255,0.9)`, boxShadow: '0 0 0 2px rgba(0,0,0,0.15)'}} />
      ) : null}
      <svg width={size} height={size} viewBox="0 0 24 24" style={{position: 'absolute', left: x - size * 0.18, top: y - size * 0.1, scale: press, filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.35))'}}>
        <path d="M4 2 L4 19 L8.6 14.8 L11.6 21.4 L14.4 20.2 L11.4 13.7 L17.6 13.7 Z" fill="#111" stroke="#fff" strokeWidth={1.4} strokeLinejoin="round" />
      </svg>
    </>
  );
};

