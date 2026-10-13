import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {PIXEL, PIXEL_WIDE, X, pop, useT} from '../explainer/kit';
import {ICONS} from '../explainer/icons';
import {EASE_IN, EASE_OUT, lerp, springAt, tween} from '../theme';

/** Shared graphic parts for the series reels (from Reel2). */

/** Giant pixel word whose characters rise in one by one (optionally typed). */
export const Giant: React.FC<{
  text: string;
  at: number;
  y: number;
  size: number;
  color?: string;
  stagger?: number;
  typed?: number; // number of visible characters (typewriter mode)
  out?: number;
  children?: React.ReactNode;
}> = ({text, at, y, size, color = X.ink, stagger = 0.06, typed, out, children}) => {
  const t = useT();
  if (t < at - 0.02) return null;
  const o = out === undefined ? 1 : 1 - tween(t, out, 0.25, EASE_IN);
  if (o <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', opacity: o}}>
      <div style={{display: 'flex', alignItems: 'flex-start', scale: `${PIXEL_WIDE} 1`, fontFamily: PIXEL, fontSize: size, lineHeight: 0.82, color, whiteSpace: 'pre'}}>
        {text.split('').map((ch, i) => {
          if (typed !== undefined && i >= typed) return null;
          const p = springAt(t, at + i * stagger, 16, 190);
          return (
            <span key={i} style={{display: 'inline-block', overflow: 'hidden', paddingTop: size * 0.04}}>
              <span style={{display: 'inline-block', translate: `0px ${lerp(Math.min(p, 1.15), 100, 0)}%`}}>{ch}</span>
            </span>
          );
        })}
        {children}
      </div>
    </div>
  );
};

/** Icons raining down with gravity and spin (the "pill rain" element). */
export const Rain: React.FC<{start: number; end: number; icons: string[]; colors: string[]; count: number; spread?: number}> = ({start, end, icons, colors, count, spread = 1.2}) => {
  const t = useT();
  if (t < start || t > end + 0.4) return null;
  const fade = 1 - tween(t, end - 0.2, 0.4, EASE_IN);
  return (
    <AbsoluteFill style={{opacity: fade}}>
      {Array.from({length: count}, (_, i) => {
        const s = start + (i / count) * spread;
        if (t < s) return null;
        const dt = t - s;
        const size = 80 + random(`rs${i}`) * 90;
        const x = 30 + random(`rx${i}`) * 1020;
        const y = -160 + (700 + random(`rv${i}`) * 500) * dt + 0.5 * 2400 * dt * dt;
        if (y > 2000) return null;
        const rot = (random(`rr${i}`) - 0.5) * 80 + (random(`rw${i}`) - 0.5) * 500 * dt;
        const name = icons[i % icons.length];
        return (
          <svg key={i} viewBox="0 0 256 256" width={size} height={size} style={{position: 'absolute', left: x - size / 2, top: y, rotate: `${rot}deg`, filter: size < 110 ? 'blur(1.5px)' : undefined}}>
            {ICONS[name].map((d, k) => (
              <path key={k} d={d} fill={colors[i % colors.length]} />
            ))}
          </svg>
        );
      })}
    </AbsoluteFill>
  );
};

/** Plain pixel label (no scramble) for static axis text. */
export const Label: React.FC<{text: string; x: number; y: number; size: number; color?: string; at?: number; out?: number}> = ({text, x, y, size, color = X.greyText, at = 0, out}) => {
  const t = useT();
  if (t < at) return null;
  const o = tween(t, at, 0.2) * (out === undefined ? 1 : 1 - tween(t, out, 0.2));
  return (
    <div style={{position: 'absolute', left: x, top: y, translate: '-50% -50%', scale: `${PIXEL_WIDE} 1`, fontFamily: PIXEL, fontSize: size, color, opacity: o, whiteSpace: 'pre', lineHeight: 1}}>{text}</div>
  );
};


/** Horizontal meter that fills to `value` (0..1) with a label and value text. */
export const Meter: React.FC<{at: number; x: number; y: number; w: number; value: number; color: string; label: string; text: string; out?: number; dur?: number}> = ({
  at, x, y, w, value, color, label, text, out, dur = 0.8,
}) => {
  const t = useT();
  if (t < at) return null;
  const o = tween(t, at, 0.2) * (out === undefined ? 1 : 1 - tween(t, out, 0.25));
  const p = tween(t, at + 0.1, dur, EASE_OUT);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, opacity: o}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12}}>
        <span style={{fontFamily: PIXEL, fontSize: 40, color: X.ink, scale: `${PIXEL_WIDE} 1`, transformOrigin: 'left', display: 'inline-block'}}>{label}</span>
        <span style={{fontFamily: PIXEL, fontSize: 50, color, scale: `${PIXEL_WIDE} 1`, transformOrigin: 'right', display: 'inline-block'}}>{text}</span>
      </div>
      <div style={{height: 46, borderRadius: 12, background: '#E3E4E7', overflow: 'hidden'}}>
        <div style={{height: '100%', width: `${Math.max(0.6, value * 100 * p)}%`, background: color, borderRadius: 12}} />
      </div>
    </div>
  );
};

/** Rounded pixel chip (e.g. COMMENT). */
export const Chip: React.FC<{at: number; x: number; y: number; text: string; bg?: string; fg?: string; size?: number; out?: number}> = ({at, x, y, text, bg = X.blue, fg = '#fff', size = 50, out}) => {
  const t = useT();
  if (t < at || (out !== undefined && t > out + 0.25)) return null;
  const o = out === undefined ? 1 : 1 - tween(t, out, 0.25);
  return (
    <div style={{position: 'absolute', left: x, top: y, translate: '-50% -50%', padding: `${size * 0.28}px ${size * 0.68}px ${size * 0.2}px`, borderRadius: 999, background: bg, color: fg, fontFamily: PIXEL, fontSize: size, scale: Math.max(0, pop(t, at)), opacity: o, whiteSpace: 'pre'}}>
      <span style={{display: 'inline-block', scale: `${PIXEL_WIDE} 1`}}>{text}</span>
    </div>
  );
};
