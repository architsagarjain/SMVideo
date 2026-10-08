import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, EASE_IN, FPS, SANS, WIDTH, lerp, springAt, tween} from '../theme';

/**
 * Off-white floating card used by every contextual graphic.
 * Enters with a soft spring rise, leaves with a quick fade-lift.
 * `width`/`height` may change over time; the card stays horizontally centred.
 */
export const Card: React.FC<{
  inAt: number;
  outAt: number;
  top: number;
  width: number;
  height: number;
  children: React.ReactNode;
  radius?: number;
}> = ({inAt, outAt, top, width, height, children, radius = 36}) => {
  const t = useCurrentFrame() / FPS;
  if (t < inAt - 0.05 || t > outAt + 0.5) return null;
  const s = springAt(t, inAt, 20, 140);
  const fadeIn = tween(t, inAt, 0.3);
  const out = tween(t, outAt, 0.36, EASE_IN);
  const ty = (u: number) => lerp(springAt(u, inAt, 20, 140), 36, 0) - 18 * tween(u, outAt, 0.36, EASE_IN);

  // vertical motion blur matched to how far the card moves this frame
  const speed = Math.abs(ty(t) - ty(t - 1 / FPS));
  const blurId = `card-mb-${Math.round(inAt * 1000)}`;
  const softBlur = out > 0 ? 6 * out : fadeIn < 1 ? lerp(fadeIn, 8, 0) : 0;
  const filters = [speed > 0.4 ? `url(#${blurId})` : '', softBlur > 0 ? `blur(${softBlur}px)` : ''].filter(Boolean).join(' ');
  return (
    <>
    <svg style={{position: 'absolute', width: 0, height: 0}}>
      <filter id={blurId} x="-5%" y="-25%" width="110%" height="150%">
        <feGaussianBlur stdDeviation={`0 ${(speed * 0.5).toFixed(2)}`} />
      </filter>
    </svg>
    <div
      style={{
        position: 'absolute',
        left: (WIDTH - width) / 2,
        top,
        width,
        height,
        borderRadius: radius,
        background: C.paper,
        border: `1px solid ${C.paperEdge}`,
        boxShadow:
          '0 40px 80px -30px rgba(28, 20, 12, 0.45), 0 12px 24px -12px rgba(28, 20, 12, 0.18), inset 0 1px 0 rgba(255,255,255,0.9)',
        opacity: fadeIn * (1 - out),
        translate: `0px ${lerp(s, 36, 0) - 18 * out}px`,
        scale: lerp(s, 0.955, 1) - 0.02 * out,
        filter: filters || undefined,
        overflow: 'hidden',
        fontFamily: SANS,
        color: C.ink,
      }}
    >
      {children}
    </div>
    </>
  );
};

/** Small uppercase label used at the top of cards. */
export const Eyebrow: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div
    style={{
      fontFamily: SANS,
      fontSize: 21,
      fontWeight: 700,
      letterSpacing: 3.2,
      textTransform: 'uppercase',
      color: C.inkFaint,
      ...style,
    }}
  >
    {children}
  </div>
);

/** Fade + rise (+ slight blur) for any element, starting at `at` seconds. */
export const Rise: React.FC<{
  at: number;
  children: React.ReactNode;
  dist?: number;
  dur?: number;
  outAt?: number;
  style?: React.CSSProperties;
}> = ({at, children, dist = 18, dur = 0.45, outAt, style}) => {
  const t = useCurrentFrame() / FPS;
  const p = tween(t, at, dur);
  const o = outAt === undefined ? 0 : tween(t, outAt, 0.25, EASE_IN);
  return (
    <div
      style={{
        opacity: p * (1 - o),
        translate: `0px ${lerp(p, dist, 0) - 10 * o}px`,
        filter: p < 1 || o > 0 ? `blur(${lerp(p, 6, 0) + 5 * o}px)` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Masked reveal: content slides up from behind an invisible edge. */
export const MaskReveal: React.FC<{
  at: number;
  children: React.ReactNode;
  dur?: number;
  outAt?: number;
  style?: React.CSSProperties;
}> = ({at, children, dur = 0.55, outAt, style}) => {
  const t = useCurrentFrame() / FPS;
  const p = tween(t, at, dur);
  const o = outAt === undefined ? 0 : tween(t, outAt, 0.32, EASE_IN);
  return (
    <div style={{overflow: 'hidden', paddingBottom: '0.12em', marginBottom: '-0.12em', ...style}}>
      <div style={{translate: `0px ${lerp(p, 105, 0) - 105 * o}%`, opacity: p > 0 ? 1 : 0}}>{children}</div>
    </div>
  );
};

/** Animated number (tabular figures). */
export const Count: React.FC<{
  at: number;
  to: number;
  dur?: number;
  from?: number;
  format?: (n: number) => string;
}> = ({at, to, dur = 0.7, from = 0, format = (n) => Math.round(n).toLocaleString('en-US')}) => {
  const t = useCurrentFrame() / FPS;
  const p = tween(t, at, dur);
  return <span style={{fontVariantNumeric: 'tabular-nums'}}>{format(lerp(p, from, to))}</span>;
};
