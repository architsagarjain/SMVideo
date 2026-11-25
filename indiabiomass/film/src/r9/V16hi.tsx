// Video 16 Hinglish: generated from V16.tsx (same picture, timed to the Hinglish voiceover, English subtitles).
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { totalFrames, Shell8, timing, R8Data, Media } from '../r8/common8';
import { r9, BrandBeat } from './common9';
import { lerp, E } from '../lib';
import { C, F } from '../theme';
import data from '../data/r9/v16hi.json';

// Video 16 · Five things you didn't know. Look: light and bright. Warm paper background, a numbered card per
// fact (gold number badge, forest headline, one framed photo with a slow move), progress dots on top, and a
// tidy grid of all the uses at the end. Numbers follow the voice: 1 to 5.
const D = data as unknown as R8Data;
const { L, FIN } = timing(D);
const PAPER = '#F4F0E6';
const FACTS = [
  { k: 'Sugar mills run on\ntheir own waste', sub: 'Bagasse → steam and power', shots: ['V16_1.jpg'], at: L(1) },
  { k: 'Rice husk ash goes into\ncement and steel', sub: 'From fuel to building material', shots: ['V16_2.jpg'], at: L(2) },
  { k: 'Coconut shells become\nactivated carbon', sub: 'Used in water filters', shots: ['V16_6.jpg', 'V16_3.jpg'], at: L(3) },
  { k: 'Paddy straw becomes\ncompressed biogas', sub: 'CBG plants already run on it', shots: ['V16_4.jpg'], at: L(4) },
  { k: 'Pine needles are pressed\ninto briquettes', sub: 'In the hills', shots: ['V16_5.mp4'], at: L(5) },
];
const factAt = (f: number) => FACTS.reduce((a, x, i) => (f >= x.at - 6 ? i : a), -1);

const Dots: React.FC = () => {
  const f = useCurrentFrame();
  const k = factAt(f);
  if (k < 0 || f >= L(6)) return null;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 150, display: 'flex', justifyContent: 'center', gap: 12 }}>
      {FACTS.map((_, i) => <span key={i} style={{ width: i === k ? 48 : 16, height: 16, borderRadius: 8, background: i <= k ? C.forest : 'rgba(7,65,42,0.18)' }} />)}
    </div>
  );
};

const Fact: React.FC<{ i: number; to: number }> = ({ i, to }) => {
  const f = useCurrentFrame();
  const x = FACTS[i];
  const pop = lerp(f, [x.at - 4, x.at + 8], [0, 1], E.back);
  const head = lerp(f, [x.at + 2, x.at + 14], [0, 1], E.out);
  const card = lerp(f, [x.at + 6, x.at + 20], [0, 1], E.out);
  const n = x.shots.length;
  const span = (to - x.at) / n;
  return (
    <AbsoluteFill>
      {/* number badge + headline */}
      <div style={{ position: 'absolute', left: 80, right: 80, top: 230, display: 'flex', alignItems: 'center', gap: 34 }}>
        <div style={{ flex: 'none', width: 150, height: 150, borderRadius: 75, background: C.harvest, display: 'grid', placeItems: 'center', fontFamily: F.display, fontWeight: 800, fontSize: 104, color: C.forest,
          boxShadow: '0 14px 34px rgba(169,103,20,0.35)', transform: `scale(${Math.max(0, pop)})` }}>{i + 1}</div>
        <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 56, lineHeight: 1.06, letterSpacing: '-0.025em', color: C.forest, whiteSpace: 'pre-line', opacity: head, transform: `translateX(${(1 - head) * 30}px)` }}>{x.k}</div>
      </div>
      {/* framed photo */}
      <div style={{ position: 'absolute', left: 80, width: 920, top: 500, height: 720, borderRadius: 34, overflow: 'hidden', border: '6px solid #fff', boxShadow: '0 30px 70px rgba(22,32,26,0.22)',
        opacity: card, transform: `translateY(${(1 - card) * 40}px)` }}>
        {x.shots.map((s, k) => {
          const from = x.at + k * span, until = x.at + (k + 1) * span;
          if (f < from - 8 || f > until + 8) return null;
          const o = k === 0 ? 1 : lerp(f, [from - 8, from + 4], [0, 1]);
          return <div key={s} style={{ position: 'absolute', inset: 0, opacity: o }}><Media src={r9(s)} from={from} to={until} a={[1.18, 0, 0]} b={[1.04, 0, 0]} grade="warm" /></div>;
        })}
      </div>
      {/* sub line */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1250, display: 'flex', justifyContent: 'center', opacity: lerp(f, [x.at + 16, x.at + 26], [0, 1]) }}>
        <div style={{ fontFamily: F.label, fontWeight: 700, fontSize: 30, letterSpacing: '0.14em', color: C.forest, background: 'rgba(232,176,75,0.28)', borderRadius: 999, padding: '12px 30px' }}>{x.sub.toUpperCase()}</div>
      </div>
    </AbsoluteFill>
  );
};

const Hook: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 60, right: 60, top: 300, textAlign: 'center', opacity: lerp(f, [2, 12], [0, 1]) }}>
        <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 132, lineHeight: 0.95, letterSpacing: '-0.04em', color: C.forest }}>5 THINGS</div>
        <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 64, lineHeight: 1.05, letterSpacing: '-0.02em', color: C.ochre, marginTop: 14 }}>YOU PROBABLY DIDN'T KNOW<br />ABOUT BIOMASS</div>
      </div>
      <div style={{ position: 'absolute', left: 90, right: 90, top: 760, display: 'flex', justifyContent: 'space-between' }}>
        {[1, 2, 3, 4, 5].map((n, i) => {
          const t = lerp(f, [8 + i * 4, 18 + i * 4], [0, 1], E.back);
          return (
            <div key={n} style={{ width: 160, height: 220, borderRadius: 26, background: i % 2 ? C.forest : C.harvest, display: 'grid', placeItems: 'center', fontFamily: F.display, fontWeight: 800, fontSize: 120,
              color: i % 2 ? PAPER : C.forest, boxShadow: '0 18px 40px rgba(22,32,26,0.18)', transform: `translateY(${(1 - Math.min(1, t)) * 60}px) scale(${0.7 + 0.3 * t})`, opacity: Math.min(1, t) }}>{n}</div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** All the uses as a tidy grid: one residue, many ways. */
const Grid: React.FC = () => {
  const f = useCurrentFrame();
  const t0 = L(6);
  const tiles = ['V16_1.jpg', 'V16_2.jpg', 'V16_3.jpg', 'V16_4.jpg', 'V16_5.mp4', 'V16_6.jpg'];
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 60, right: 60, top: 230, textAlign: 'center', fontFamily: F.display, fontWeight: 800, fontSize: 80, lineHeight: 1.02, letterSpacing: '-0.03em', color: C.forest }}>
        <div style={{ opacity: lerp(f, [t0, t0 + 8], [0, 1]) * lerp(f, [L(7) - 4, L(7)], [1, 0]) }}>ONE RESIDUE.<br /><span style={{ color: C.ochre }}>A DOZEN WAYS.</span></div>
      </div>
      <div style={{ position: 'absolute', left: 60, right: 60, top: 230, textAlign: 'center', fontFamily: F.display, fontWeight: 800, fontSize: 80, lineHeight: 1.02, letterSpacing: '-0.03em', color: C.forest, opacity: lerp(f, [L(7), L(7) + 8], [0, 1]) }}>
        WHO NEEDS IT,<br /><span style={{ color: C.ochre }}>AND WHERE?</span>
      </div>
      <div style={{ position: 'absolute', left: 70, right: 70, top: 500, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {tiles.map((s, i) => {
          const t = lerp(f, [t0 + i * 3, t0 + i * 3 + 12], [0, 1], E.back);
          return (
            <div key={s} style={{ position: 'relative', height: 330, borderRadius: 22, overflow: 'hidden', border: '5px solid #fff', boxShadow: '0 14px 34px rgba(22,32,26,0.18)', opacity: Math.min(1, t), transform: `scale(${0.6 + 0.4 * t})` }}>
              <Media src={r9(s)} from={t0} to={FIN} a={[1.2, 0, 0]} b={[1.05, 0, 0]} grade="warm" />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const V16hi: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Shell8 d={D} bg={PAPER} plate vignette={0.1}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 90% 70% at 50% 40%, #FBF8F1 0%, ${PAPER} 60%, #E9E3D4 100%)` }} />
      {f < L(1) && <AbsoluteFill style={{ opacity: lerp(f, [L(1) - 8, L(1)], [1, 0]) }}><Hook /></AbsoluteFill>}
      {FACTS.map((x, i) => {
        const to = i < 4 ? FACTS[i + 1].at : L(6);
        if (f < x.at - 8 || f >= to + 6) return null;
        const o = Math.min(lerp(f, [x.at - 8, x.at], [0, 1]), lerp(f, [to - 2, to + 6], [1, 0]));
        return <AbsoluteFill key={i} style={{ opacity: o }}><Fact i={i} to={to} /></AbsoluteFill>;
      })}
      <Dots />
      {f >= L(6) - 6 && f < L(8) + 6 && <AbsoluteFill style={{ opacity: Math.min(lerp(f, [L(6) - 6, L(6) + 2], [0, 1]), lerp(f, [L(8), L(8) + 6], [1, 0])) }}><Grid /></AbsoluteFill>}
      {f >= L(8) - 6 && <AbsoluteFill style={{ opacity: lerp(f, [L(8) - 6, L(8) + 2], [0, 1]) }}><BrandBeat at={L(8)} text={'INDIABIOMASS IS\nBUILDING THE WAY\nTO FIND OUT'} /></AbsoluteFill>}
    </Shell8>
  );
};
export const V16hi_FRAMES = totalFrames(D);
