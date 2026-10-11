import React from 'react';
import { useCurrentFrame } from 'remotion';
import { F, C } from '../theme';
import { lerp, E } from '../lib';

/**
 * Letter-by-letter masked rise with tracking that tightens as it lands.
 * `at` = frame the first letter starts, `out` = frame the exit starts.
 */
export const Kinetic: React.FC<{
  lines: string[];
  at: number;
  out: number;
  size: number;
  weight?: number;
  color?: string;
  stagger?: number;
  lineGap?: number;
  align?: 'left' | 'center';
  sweep?: boolean; // gold light sweep across the letters
  exit?: 'blur' | 'up' | 'cut';
  font?: string;
  tracking?: number; // final tracking in em
}> = ({ lines, at, out, size, weight = 800, color = '#fff', stagger = 1.2, lineGap = 0.98, align = 'center', sweep, exit = 'blur', font = F.display, tracking = -0.03 }) => {
  const f = useCurrentFrame();
  let idx = 0;
  const total = lines.join('').length;
  const exitT = lerp(f, [out, out + 12], [0, 1], E.in);
  const sweepX = lerp(f, [at + 8, at + 8 + total * stagger + 30], [-30, 130], E.inOut);
  return (
    <div
      style={{
        fontFamily: font, fontWeight: weight, fontSize: size, color, lineHeight: lineGap, textAlign: align,
        opacity: exit === 'cut' ? (f >= out ? 0 : 1) : 1 - exitT,
        filter: exit === 'blur' ? `blur(${exitT * 14}px)` : undefined,
        transform: exit === 'up' ? `translateY(${-exitT * 60}px)` : `scale(${1 + exitT * 0.06})`,
      }}
    >
      {lines.map((line, li) => {
        const lineT = lerp(f, [at + li * 6, at + li * 6 + 40], [0.18, 0], E.out);
        return (
          <div key={li} style={{ whiteSpace: 'pre', letterSpacing: `${tracking + lineT}em` }}>
            {line.split('').map((ch, ci) => {
              const i = idx++;
              const s = at + i * stagger;
              const t = lerp(f, [s, s + 16], [0, 1], E.out);
              const glow = sweep ? Math.max(0, 1 - Math.abs((i / Math.max(1, total)) * 100 - sweepX) / 18) : 0;
              return (
                <span key={ci} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', paddingBottom: size * 0.12, marginBottom: -size * 0.12 }}>
                  <span
                    style={{
                      display: 'inline-block',
                      transform: `translateY(${(1 - t) * 105}%) rotate(${(1 - t) * 6}deg)`,
                      opacity: t,
                      color: glow > 0 ? mix(color, C.harvest, glow) : color,
                      textShadow: glow > 0 ? `0 0 ${24 * glow}px rgba(232,176,75,${0.55 * glow}), 0 4px 30px rgba(0,0,0,0.35)` : '0 4px 30px rgba(0,0,0,0.35)',
                    }}
                  >
                    {ch === ' ' ? ' ' : ch}
                  </span>
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
export const mix = (a: string, b: string, t: number) => {
  if (!a.startsWith('#')) return a;
  const A = hex(a), B = hex(b);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`;
};

/** Small spaced-caps label (Archivo), as the brand uses for labels. */
export const Label: React.FC<{ text: string; at: number; out?: number; color?: string; size?: number; rule?: boolean }> = ({ text, at, out = 99999, color = C.harvest, size = 26, rule = true }) => {
  const f = useCurrentFrame();
  const t = lerp(f, [at, at + 18], [0, 1], E.out);
  const o = lerp(f, [out, out + 10], [1, 0]);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, opacity: t * o, fontFamily: F.label, fontWeight: 600, fontSize: size, letterSpacing: '0.22em', color, textTransform: 'uppercase' }}>
      {rule && <div style={{ width: 56 * t, height: 2, background: color }} />}
      <span style={{ transform: `translateX(${(1 - t) * -20}px)`, display: 'inline-block' }}>{text}</span>
    </div>
  );
};

/** Big single word/phrase that slams in with a mask wipe; used for section titles. */
export const Slam: React.FC<{ text: string; at: number; out: number; size?: number; color?: string; sub?: string }> = ({ text, at, out, size = 112, color = '#fff' }) => {
  const f = useCurrentFrame();
  const t = lerp(f, [at, at + 10], [0, 1], E.out);
  const o = lerp(f, [out, out + 8], [1, 0], E.in);
  const sc = lerp(f, [at, at + 40], [1.12, 1], E.out);
  return (
    <div
      style={{
        fontFamily: F.display, fontWeight: 800, fontSize: size, color, letterSpacing: '-0.035em', lineHeight: 0.95,
        clipPath: `inset(0 ${100 - t * 100}% 0 0)`, opacity: o, transform: `scale(${sc}) translateY(${(1 - o) * -30}px)`,
        filter: `blur(${(1 - o) * 10}px)`, whiteSpace: 'pre-line',
      }}
    >
      {text}
    </div>
  );
};
