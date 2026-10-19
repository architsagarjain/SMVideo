import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { totalFrames, Shell8, timing, R8Data, Media } from '../r8/common8';
import { r9, BrandBeat, Cut } from './common9';
import { lerp, E } from '../lib';
import { C, F } from '../theme';
import data from '../data/r9/v16.json';

// Video 16 · Five things you didn't know. Look: rapid-fire. A huge number slams in on black for each fact
// (in step with the voice: 1 to 5), then fast punch-in cuts on the shot; the fastest pacing of the series.
// It ends on a grid of all five shots.
const D = data as unknown as R8Data;
const { L, W, FIN } = timing(D);
const BLACK = '#080808';
const FACTS = [
  { k: 'SUGAR MILLS RUN\nON THEIR OWN WASTE', sub: 'Bagasse → steam and power', shots: ['V16_1.jpg'], at: L(1) },
  { k: 'RICE HUSK ASH →\nCEMENT AND STEEL', sub: 'From fuel to building material', shots: ['V16_2.jpg'], at: L(2) },
  { k: 'COCONUT SHELLS →\nACTIVATED CARBON', sub: 'Used in water filters', shots: ['V16_6.jpg', 'V16_3.jpg'], at: L(3) },
  { k: 'PADDY STRAW →\nCOMPRESSED BIOGAS', sub: 'CBG plants already run on it', shots: ['V16_4.jpg'], at: L(4) },
  { k: 'PINE NEEDLES →\nBRIQUETTES', sub: 'In the hills', shots: ['V16_5.mp4'], at: L(5) },
];
// punch-in framings cycled for fast cuts on a single photo: [scale, x, y]
const PUNCH: [number, number, number][] = [[1.15, 0, 0], [1.6, -120, 80], [1.45, 140, -60], [1.9, 40, 160], [1.3, -60, -120]];
const SLAM = 9;   // frames of number-on-black before the shot

const Fact: React.FC<{ i: number; to: number }> = ({ i, to }) => {
  const f = useCurrentFrame();
  const x = FACTS[i];
  const s0 = x.at + SLAM;
  const slam = lerp(f, [x.at - 2, x.at + 5], [0, 1], E.out);
  // fast cuts every ~22 frames across the fact's shots
  const cuts: { src: string; from: number; to: number; p: [number, number, number] }[] = [];
  const step = 22;
  for (let t = s0, k = 0; t < to; t += step, k++) {
    const src = x.shots[Math.min(x.shots.length - 1, Math.floor(((t - s0) / (to - s0)) * x.shots.length))];
    cuts.push({ src, from: t, to: Math.min(to, t + step), p: PUNCH[k % PUNCH.length] });
  }
  const badge = lerp(f, [s0, s0 + 8], [0, 1], E.out);
  const head = lerp(f, [s0 + 2, s0 + 12], [0, 1], E.out);
  return (
    <AbsoluteFill style={{ background: BLACK }}>
      {cuts.map((c, k) => (
        <Cut key={k} from={c.from} to={c.to}>
          {x.shots[0].endsWith('.mp4')
            ? <Media src={r9(c.src)} from={s0} to={to} a={[1.2 + 0.1 * (k % 3), c.p[1] * 0.5, 0]} b={[1.1, 0, 0]} grade="cool" />
            : <Media src={r9(c.src)} from={c.from} to={c.to} a={c.p} b={[c.p[0] * 1.06, c.p[1], c.p[2]]} grade="golden" />}
        </Cut>
      ))}
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.25) 38%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.9) 82%)', opacity: f >= s0 ? 1 : 0 }} />
      {/* flash on the cut from number to shot */}
      <AbsoluteFill style={{ background: '#fff', opacity: lerp(f, [s0 - 1, s0, s0 + 4], [0, 0.7, 0]) }} />
      {/* the number: full-screen slam, then shrinks into a badge */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, display: 'grid', placeItems: 'center', pointerEvents: 'none' }}>
        <div style={{ fontFamily: F.display, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.06em', color: C.harvest,
          fontSize: 900 - 680 * badge, transform: `translate(${-330 * badge}px, ${-600 * badge}px) scale(${1.5 - 0.5 * slam})`, opacity: Math.min(1, slam * 1.4), textShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>{i + 1}</div>
      </div>
      <div style={{ position: 'absolute', left: 60, right: 60, top: 520, opacity: head, transform: `translateX(${(1 - head) * 80}px)` }}>
        {x.k.split('\n').map((ln) => <div key={ln} style={{ fontFamily: F.display, fontWeight: 800, fontSize: 82, lineHeight: 1.02, color: '#fff', letterSpacing: '-0.03em', textShadow: '0 6px 30px rgba(0,0,0,0.6)' }}>{ln}</div>)}
        <div style={{ display: 'inline-block', marginTop: 20, fontFamily: F.label, fontWeight: 700, fontSize: 32, letterSpacing: '0.14em', color: BLACK, background: C.harvest, borderRadius: 12, padding: '10px 22px', opacity: lerp(f, [s0 + 10, s0 + 18], [0, 1]) }}>{x.sub.toUpperCase()}</div>
      </div>
    </AbsoluteFill>
  );
};

const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const flick = Math.floor(f / 3) % 5;
  return (
    <AbsoluteFill style={{ background: BLACK }}>
      <div style={{ position: 'absolute', left: 60, right: 60, top: 560, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
        {[1, 2, 3, 4, 5].map((n, i) => {
          const on = i === flick || f > 50;
          return (
            <div key={n} style={{ height: 300, borderRadius: 18, display: 'grid', placeItems: 'center', fontFamily: F.display, fontWeight: 800, fontSize: 170, letterSpacing: '-0.05em',
              background: on ? C.harvest : '#1A1A1A', color: on ? BLACK : '#3A3A3A', transform: `scale(${lerp(f, [i * 3, i * 3 + 8], [0.4, 1], E.back)})` }}>{n}</div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 60, right: 60, top: 260, textAlign: 'center', fontFamily: F.display, fontWeight: 800, fontSize: 92, lineHeight: 1.0, color: '#fff', letterSpacing: '-0.03em', opacity: lerp(f, [4, 12], [0, 1]) }}>
        5 THINGS YOU<br /><span style={{ color: C.harvest }}>DIDN&apos;T KNOW</span>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 960, textAlign: 'center', fontFamily: F.label, fontWeight: 700, fontSize: 40, letterSpacing: '0.3em', color: '#fff', opacity: lerp(f, [W('biomass') - 4, W('biomass') + 4], [0, 1]) }}>ABOUT BIOMASS</div>
    </AbsoluteFill>
  );
};

/** All five shots shrink into a grid: one residue, many uses. */
const Grid: React.FC = () => {
  const f = useCurrentFrame();
  const t0 = L(6);
  const tiles = ['V16_1.jpg', 'V16_2.jpg', 'V16_3.jpg', 'V16_4.jpg', 'V16_5.mp4', 'V16_6.jpg'];
  return (
    <AbsoluteFill style={{ background: BLACK }}>
      <div style={{ position: 'absolute', left: 60, right: 60, top: 560, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {tiles.map((s, i) => {
          const t = lerp(f, [t0 + i * 3, t0 + i * 3 + 10], [0, 1], E.back);
          return (
            <div key={s} style={{ position: 'relative', height: 300, borderRadius: 18, overflow: 'hidden', opacity: Math.min(1, t), transform: `scale(${0.5 + 0.5 * t})`, border: `3px solid ${i === 5 ? C.harvest : 'transparent'}` }}>
              <Media src={r9(s)} from={t0} to={FIN} a={[1.2, 0, 0]} b={[1.05, 0, 0]} grade="golden" />
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 60, right: 60, top: 230, textAlign: 'center', fontFamily: F.display, fontWeight: 800, fontSize: 86, lineHeight: 1.02, color: '#fff', letterSpacing: '-0.03em' }}>
        <div style={{ opacity: lerp(f, [t0, t0 + 8], [0, 1]) * lerp(f, [L(7) - 4, L(7)], [1, 0]) }}>ONE RESIDUE.<br /><span style={{ color: C.harvest }}>A DOZEN WAYS.</span></div>
      </div>
      <div style={{ position: 'absolute', left: 60, right: 60, top: 230, textAlign: 'center', fontFamily: F.display, fontWeight: 800, fontSize: 86, lineHeight: 1.02, color: '#fff', letterSpacing: '-0.03em', opacity: lerp(f, [L(7), L(7) + 8], [0, 1]) }}>
        WHO NEEDS IT,<br /><span style={{ color: C.harvest }}>AND WHERE?</span>
      </div>
    </AbsoluteFill>
  );
};

export const V16: React.FC = () => (
  <Shell8 d={D} bg={BLACK}>
    <Cut from={0} to={L(1) - 2}><Hook /></Cut>
    {FACTS.map((x, i) => {
      const to = i < 4 ? FACTS[i + 1].at - 2 : L(6);
      return <Cut key={i} from={x.at - 2} to={to}><Fact i={i} to={to} /></Cut>;
    })}
    <Cut from={L(6)} to={L(8)}><Grid /></Cut>
    <Cut from={L(8)} to={FIN + 2}><BrandBeat at={L(8)} text={'INDIABIOMASS IS\nBUILDING THE WAY\nTO FIND OUT'} bg={BLACK} /></Cut>
  </Shell8>
);
export const V16_FRAMES = totalFrames(D);
