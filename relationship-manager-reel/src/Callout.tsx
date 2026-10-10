import React from 'react';
import {useCurrentFrame} from 'remotion';
import {easeInOut, progress} from './anim';
import {FONT} from './fonts';
import {CREAM, FPS, INK, MAROON} from './timeline';

// Line icons in the spirit of the end-screen feature icons (maroon, rounded strokes).
// `draw` (0..1) strokes each path on as the card arrives.
const PATH_LEN = 100;
const Stroke: React.FC<{d: string; draw: number}> = ({d, draw}) => (
  <path d={d} pathLength={PATH_LEN} strokeDasharray={PATH_LEN} strokeDashoffset={PATH_LEN * (1 - draw)} />
);

export const HeartIcon: React.FC<{draw: number}> = ({draw}) => (
  <>
    <Stroke draw={draw} d="M12 20.4C7.6 17.6 3.6 14.2 3.6 9.7C3.6 7 5.6 5 8.1 5c1.6 0 3 0.8 3.9 2.1C12.9 5.8 14.3 5 15.9 5c2.5 0 4.5 2 4.5 4.7c0 4.5-4 7.9-8.4 10.7z" />
    <Stroke draw={draw} d="M8.9 11.2l2.1 2.1l4.1-4.1" />
  </>
);

export const HandHeartIcon: React.FC<{draw: number}> = ({draw}) => (
  <>
    <Stroke draw={draw} d="M12 11.2C9.9 9.9 8.4 8.6 8.4 6.9c0-1.1 0.9-2 2-2c0.7 0 1.3 0.3 1.6 0.9c0.3-0.6 0.9-0.9 1.6-0.9c1.1 0 2 0.9 2 2c0 1.7-1.5 3-3.6 4.3z" />
    <Stroke draw={draw} d="M2.8 14.6h2.9c1.5 0 2.4 0.9 3.8 0.9h3.1a1.25 1.25 0 0 1 0 2.5H9.4" />
    <Stroke draw={draw} d="M12.6 18l5.1-2.4a1.35 1.35 0 0 1 1.4 2.3l-5.6 3.3c-0.9 0.5-2 0.6-3 0.3l-4.3-1.4H2.8" />
  </>
);

type Props = {
  inAt: number;
  outAt: number;
  x: number;
  y: number;
  eyebrow: string;
  title: string;
  Icon: React.FC<{draw: number}>;
};

/** Small cream label card that echoes the end-screen feature row. */
export const Callout: React.FC<Props> = ({inAt, outAt, x, y, eyebrow, title, Icon}) => {
  const t = useCurrentFrame() / FPS;
  if (t < inAt - 0.05 || t > outAt + 0.5) return null;
  const k = progress(t, inAt, 0.55);
  const out = progress(t, outAt, 0.35, easeInOut);
  const iconK = progress(t, inAt + 0.1, 0.45);
  const draw = progress(t, inAt + 0.15, 0.75);
  const textK = progress(t, inAt + 0.16, 0.5);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        opacity: k * (1 - out),
        transform: `translateY(${(1 - k) * 18 - out * 8}px) scale(${0.96 + 0.04 * k})`,
        transformOrigin: 'left center',
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        padding: '18px 38px 18px 18px',
        borderRadius: 999,
        background: CREAM,
        boxShadow: '0 14px 36px rgba(40, 12, 12, 0.24), 0 2px 6px rgba(40, 12, 12, 0.12)',
        border: '1px solid rgba(255,255,255,0.7)',
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 999,
          background: 'rgba(142, 27, 46, 0.08)',
          border: '1.5px solid rgba(142, 27, 46, 0.22)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${0.7 + 0.3 * iconK})`,
          opacity: iconK,
        }}
      >
        <svg width={46} height={46} viewBox="0 0 24 24" fill="none" stroke={MAROON} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
          <Icon draw={draw} />
        </svg>
      </div>
      <div style={{opacity: textK, transform: `translateX(${(1 - textK) * -10}px)`, fontFamily: FONT}}>
        <div style={{fontSize: 23, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: MAROON, lineHeight: 1.25}}>
          {eyebrow}
        </div>
        <div style={{fontSize: 38, fontWeight: 700, color: INK, lineHeight: 1.2, letterSpacing: '-0.005em'}}>{title}</div>
      </div>
    </div>
  );
};

