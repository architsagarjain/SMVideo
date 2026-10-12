import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {Icon, PIXEL, PIXEL_WIDE, Scramble, Tick, X, pop, useT} from '../explainer/kit';
import {ICONS} from '../explainer/icons';
import {EASE_IN, EASE_IN_OUT, lerp, springAt, tween} from '../theme';
import {BEHIND} from './timeline';

/**
 * Graphics drawn between the washed wall and her cut-out, i.e. behind her head.
 * Her head spans roughly x 360-720, y 560-1060 on screen.
 */

/** Giant pixel word whose characters rise in one by one (optionally typed). */
const Giant: React.FC<{
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
const Rain: React.FC<{start: number; end: number; icons: string[]; colors: string[]; count: number; spread?: number}> = ({start, end, icons, colors, count, spread = 1.2}) => {
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

/** Row of 7 day dots; `lit` days light up blue at `litAt`. */
const DayDots: React.FC<{at: number; y: number; lit: number[]; litAt: number; out?: number}> = ({at, y, lit, litAt, out}) => {
  const t = useT();
  if (t < at) return null;
  const o = out === undefined ? 1 : 1 - tween(t, out, 0.25);
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', gap: 22, opacity: o}}>
      {days.map((d, i) => {
        const p = pop(t, at + i * 0.05);
        const on = lit.includes(i) ? tween(t, litAt + lit.indexOf(i) * 0.15, 0.2) : 0;
        return (
          <div
            key={i}
            style={{
              width: 92,
              height: 92,
              borderRadius: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              scale: Math.max(0, p) * (1 + 0.12 * Math.sin(Math.PI * on)),
              background: on > 0.5 ? X.blue : '#E3E4E7',
              color: on > 0.5 ? '#fff' : X.greyText,
              fontFamily: PIXEL,
              fontSize: 54,
            }}
          >
            <span style={{scale: `${PIXEL_WIDE} 1`}}>{d}</span>
          </div>
        );
      })}
    </div>
  );
};

export const Behind2: React.FC = () => {
  const t = useT();
  const B = BEHIND;
  const typedGuide = 'GUIDE'.split('').filter((_, i) => t >= 70.34 + i * 0.09).length;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {/* hook: "I'm doing an MBA and running my coaching business." */}
      {t < B.hook.end + 0.3 ? (
        <AbsoluteFill style={{opacity: 1 - tween(t, B.hook.end - 0.2, 0.2)}}>
          <Icon name="graduation-cap" at={0.3} size={230} x={215} y={420} rot={-14} />
          <Scramble text="MBA" at={1.72} x={215} y={590} size={64} color={X.blue} />
          <Scramble text="+" at={2.3} x={540} y={300} size={90} color={X.greyText} />
          <Icon name="briefcase" at={3.2} size={220} x={865} y={420} rot={12} />
          <Scramble text="COACHING" at={3.26} x={865} y={590} size={48} color={X.pink} />
          <Scramble text="BUSINESS" at={3.52} x={865} y={650} size={36} color={X.greyText} />
        </AbsoluteFill>
      ) : null}

      {/* "reliably train twice a week ... build around those two days" */}
      <Giant text="2X" at={12.1} y={300} size={430} out={B.twice.end - 0.2} />
      <Scramble text="A WEEK" at={12.82} x={185} y={700} size={56} color={X.blue} out={B.twice.end - 0.2} />
      <DayDots at={13.9} y={110} lit={[1, 4]} litAt={14.42} out={B.twice.end - 0.2} />

      {/* "Two random sessions don't automatically equal six." */}
      <Giant text="2" at={30.38} y={300} size={430} out={B.notSix.end - 0.15}>
        <span style={{display: 'inline-block', width: size2(t), overflow: 'hidden', color: X.pink, textAlign: 'center'}}>
          {/* drawn, not typed: the pixel font has no ≠ glyph */}
          <svg viewBox="0 0 100 100" width="0.62em" height="0.62em" style={{marginTop: '0.12em', scale: Math.max(0, pop(t, 32.6))}}>
            <rect x="10" y="30" width="80" height="12" fill={X.pink} />
            <rect x="10" y="58" width="80" height="12" fill={X.pink} />
            <rect x="44" y="6" width="12" height="88" fill={X.pink} transform="rotate(28 50 50)" />
          </svg>
        </span>
        <span style={{display: 'inline-block', overflow: 'hidden', paddingTop: 17}}>
          <span style={{display: 'inline-block', translate: `0px ${lerp(Math.min(springAt(t, 33.18, 16, 190), 1.15), 100, 0)}%`}}>6</span>
        </span>
      </Giant>
      <Scramble text="RANDOM SESSIONS" at={30.6} x={540} y={200} size={44} color={X.greyText} out={B.notSix.end - 0.15} />

      {/* "If your year-end plan keeps losing to meetings, the schedule needs a review." */}
      <Icon name="calendar-blank" at={60.8} size={230} x={540} y={300} out={61.7} />
      <Scramble text="YEAR-END PLAN" at={61.0} x={540} y={470} size={44} color={X.greyText} out={61.7} />
      <Rain start={61.5} end={63.75} icons={['users-three', 'video-camera', 'calendar-x', 'briefcase']} colors={[X.ink, X.pink, X.ink, X.greyText]} count={30} spread={1.3} />
      <Giant text="MEETINGS" at={61.62} y={400} size={210} color={X.pink} stagger={0.04} out={63.75} />
      <Icon name="calendar-check" at={63.94} size={240} x={540} y={300} out={65.4} />
      <Scramble text="NEEDS A REVIEW" at={64.3} x={540} y={470} size={52} color={X.blue} out={65.45} />
      <Tick at={64.95} x={720} y={210} size={80} out={65.5} />

      {/* "Comment guide and I'll send you my free fat loss guide." */}
      {t >= 70.08 ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: 150, display: 'flex', justifyContent: 'center'}}>
          <div style={{padding: '14px 34px 10px', borderRadius: 999, background: X.blue, color: '#fff', fontFamily: PIXEL, fontSize: 50, scale: Math.max(0, pop(t, 70.08))}}>
            <span style={{display: 'inline-block', scale: `${PIXEL_WIDE} 1`}}>COMMENT</span>
          </div>
        </div>
      ) : null}
      <Giant text="GUIDE" at={70.34} y={300} size={330} stagger={0.09} typed={typedGuide}>
        <span style={{display: 'inline-block', width: 14, height: 250, marginLeft: 16, marginTop: 22, background: X.blue, opacity: t < 71 || Math.floor((t - 71) * 2.2) % 2 === 0 ? 1 : 0}} />
      </Giant>
      <Icon name="file-text" at={71.82} size={150} x={160} y={780} rot={-10} />
      <Scramble text="FREE" at={71.82} x={160} y={905} size={46} color={X.blue} />
      <Scramble text="FAT LOSS" at={72.12} x={890} y={780} size={46} color={X.pink} />
      <Scramble text="GUIDE" at={72.62} x={890} y={840} size={46} color={X.ink} />
    </AbsoluteFill>
  );
};

/** width of the "≠" slot in "2 ≠ 6" (opens when she says "equal") */
const size2 = (t: number) => `${lerp(tween(t, 32.55, 0.3, EASE_IN_OUT), 0.15, 0.9)}em`;
