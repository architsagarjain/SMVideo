import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { lerp, E } from '../lib';

/**
 * A warm, filmic light leak that sweeps across a cut (peaks on `at`).
 * Screen-blended so it lifts the image instead of covering it.
 */
export const LightLeak: React.FC<{ at: number; dur?: number; from?: 'left' | 'right'; strength?: number }> = ({ at, dur = 20, from = 'left', strength = 0.85 }) => {
  const f = useCurrentFrame();
  if (f < at - dur / 2 || f > at + dur / 2) return null;
  const t = lerp(f, [at - dur / 2, at + dur / 2], [0, 1], E.inOut);
  const a = lerp(f, [at - dur / 2, at, at + dur / 2], [0, strength, 0], E.soft);
  const x = from === 'left' ? -30 + t * 160 : 130 - t * 160;
  return (
    <AbsoluteFill style={{ mixBlendMode: 'screen', opacity: a, pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 60% 85% at ${x}% 40%, rgba(255,214,150,1) 0%, rgba(232,150,60,0.75) 28%, rgba(169,103,20,0.25) 55%, rgba(0,0,0,0) 75%)` }} />
      <AbsoluteFill style={{ background: `linear-gradient(${from === 'left' ? 100 : 260}deg, rgba(0,0,0,0) ${t * 100 - 30}%, rgba(255,240,215,0.55) ${t * 100}%, rgba(0,0,0,0) ${t * 100 + 25}%)` }} />
    </AbsoluteFill>
  );
};
