import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {Pill} from '../components/Icons';
import {PILL_RAIN} from '../timeline';
import {C, EASE_IN, EASE_IN_OUT, EASE_OUT, FPS, SANS, lerp, springAt, tween} from '../theme';

/**
 * Everything here is drawn BETWEEN the background footage and the cut-out of
 * her, so it sits behind her head. A dim + blur "spotlight" over the wall keeps
 * the big type readable over both the white wall and the dark posters.
 */

// moments when the wall is dimmed (start, end)
const SPOTLIGHT: [number, number][] = [
  [PILL_RAIN.start - 0.05, PILL_RAIN.end],
  [23.12, 24.76],
  [35.62, 37.56],
  [65.02, 99],
];

const Spotlight: React.FC<{t: number}> = ({t}) => {
  let o = 0;
  for (const [a, b] of SPOTLIGHT) o = Math.max(o, tween(t, a, 0.35) * (1 - tween(t, b - 0.3, 0.3, EASE_IN)));
  if (o <= 0) return null;
  return (
    <AbsoluteFill
      style={{
        opacity: o,
        background: 'radial-gradient(120% 60% at 50% 30%, rgba(10,11,13,0.62) 0%, rgba(10,11,13,0.78) 100%)',
        backdropFilter: 'blur(10px) saturate(0.7)',
        WebkitBackdropFilter: 'blur(10px) saturate(0.7)',
      }}
    />
  );
};

/** Giant word behind her head with a staggered rise per character. */
const BigWord: React.FC<{
  t: number;
  text: string;
  at: number;
  out: number;
  size: number;
  y: number;
  stagger?: number;
  visibleChars?: number;
  children?: React.ReactNode;
}> = ({t, text, at, out, size, y, stagger = 0.045, visibleChars, children}) => {
  if (t < at - 0.05 || t > out + 0.4) return null;
  const o = 1 - tween(t, out - 0.25, 0.3, EASE_IN);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', opacity: o}}>
      <div style={{position: 'relative', fontFamily: SANS, fontWeight: 800, fontSize: size, lineHeight: 0.86, letterSpacing: -size * 0.045, color: C.ink, whiteSpace: 'pre'}}>
        {text.split('').map((ch, i) => {
          if (visibleChars !== undefined && i >= visibleChars) return null;
          const p = springAt(t, at + i * stagger, 18, 170);
          return (
            <span key={i} style={{display: 'inline-block', overflow: 'hidden', verticalAlign: 'top'}}>
              <span style={{display: 'inline-block', translate: `0px ${lerp(Math.min(p, 1.2), 100, 0)}%`}}>{ch}</span>
            </span>
          );
        })}
        {children}
      </div>
    </div>
  );
};

// "how many would you take?" - pills rain down behind her, counter climbs
const N_PILLS = 46;
const PillRain: React.FC<{t: number}> = ({t}) => {
  if (t < PILL_RAIN.start || t > PILL_RAIN.end + 0.3) return null;
  const fade = 1 - tween(t, PILL_RAIN.end - 0.2, 0.3, EASE_IN);
  const spawned = Array.from({length: N_PILLS}, (_, i) => PILL_RAIN.start + 0.05 + i * 0.019).filter((s) => s <= t).length;
  const count = Math.round(lerp(tween(t, PILL_RAIN.start + 0.15, 0.9, EASE_OUT), 0, 40));
  return (
    <AbsoluteFill style={{opacity: fade}}>
      {Array.from({length: N_PILLS}, (_, i) => {
        const s = PILL_RAIN.start + 0.05 + i * 0.019;
        if (t < s) return null;
        const dt = t - s;
        const x = 40 + random(`px${i}`) * 1000;
        const y = -140 + (900 + random(`pv${i}`) * 500) * dt + 0.5 * 2600 * dt * dt;
        const rot = random(`pr${i}`) * 360 + (random(`ps${i}`) - 0.5) * 900 * dt;
        const w = 70 + random(`pw${i}`) * 70;
        return <Pill key={i} width={w} rotate={rot} style={{position: 'absolute', left: x - w / 2, top: y, filter: w < 95 ? 'blur(1.5px)' : undefined, opacity: 0.95}} />;
      })}
      <div style={{position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 300, letterSpacing: -14, color: C.accent, lineHeight: 1, opacity: spawned > 0 ? 1 : 0}}>
        <span style={{fontSize: 170, verticalAlign: 'top', marginRight: 10, color: C.ink}}>×</span>
        {count}
      </div>
    </AbsoluteFill>
  );
};

export const Behind: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const strike = tween(t, 24.02, 0.35, EASE_IN_OUT);
  const typed = '2026'.split('').filter((_, i) => t >= 65.32 + i * 0.19).length;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <Spotlight t={t} />
      <PillRain t={t} />

      {/* "And I used to think walking didn't count." */}
      <BigWord t={t} text="WALKING" at={23.18} out={24.76} size={232} y={350}>
        <div
          style={{
            position: 'absolute',
            left: -20,
            top: '46%',
            height: 18,
            width: `calc((100% + 40px) * ${strike})`,
            background: C.accent,
            borderRadius: 9,
            rotate: '-4deg',
          }}
        />
      </BigWord>

      {/* "The 10,000 number" */}
      <BigWord t={t} text="10,000" at={35.66} out={37.56} size={330} y={300} stagger={0.05} />

      {/* "Comment 2026" */}
      {t > 65.02 ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: 205, display: 'flex', justifyContent: 'center', opacity: tween(t, 65.05, 0.3)}}>
          <div style={{padding: '12px 26px', borderRadius: 999, background: C.accent, color: C.dark, fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: 3, translate: `0px ${lerp(springAt(t, 65.05), 20, 0)}px`}}>
            COMMENT
          </div>
        </div>
      ) : null}
      <BigWord t={t} text="2026" at={65.3} out={999} size={420} y={300} stagger={0.19} visibleChars={typed}>
        <span
          style={{
            display: 'inline-block',
            width: 16,
            height: 300,
            marginLeft: 14,
            background: C.accent,
            verticalAlign: 'top',
            marginTop: 30,
            opacity: t < 66.2 || Math.floor((t - 66.2) * 2.2) % 2 === 0 ? 1 : 0,
          }}
        />
      </BigWord>
    </AbsoluteFill>
  );
};
