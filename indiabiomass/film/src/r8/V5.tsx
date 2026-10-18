import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { BrandLogo, Shell8, timing, R8Data, Span, Frame, End8 } from './common8';
import { Logo } from '../components/Logo';
import { lerp, E } from '../lib';
import { C, F } from '../theme';
import data from '../data/r8/v5.json';

// Video 5 · What buyers check (checklist). Look: the one light reel: paper background with forest ink,
// a clipboard of five checks that tick in turn, the B-roll in a rounded frame underneath.
const D = data as unknown as R8Data;
const { L, END } = timing(D);
const ITEMS = [
  { k: 'Moisture', note: 'Wet fuel = transporting water', at: L(1), src: 'V5_1.jpg' },
  { k: 'GCV (heat value)', note: 'Below the minimum: rejected or price cut', at: L(2), src: 'V5_2.mp4' },
  { k: 'Ash', note: 'More cleaning, more boiler wear', at: L(3), src: 'V5_3r.mp4' },
  { k: 'Size', note: 'Must fit the feeding system', at: L(4), src: 'V5_4.jpg' },
  { k: 'Consistency', note: 'Every truck matches the spec', at: L(5), src: 'V5_5.mp4' },
];
const INK = C.forest, PAPER = '#F4F1E8';

const Board: React.FC = () => {
  const f = useCurrentFrame();
  const all = lerp(f, [L(6), L(6) + 14], [0, 1], E.inOut);
  const cur = ITEMS.reduce((a, it, i) => (f >= it.at ? i : a), -1);
  return (
    <div style={{ position: 'absolute', left: 90, right: 90, top: 150, transform: `translateY(${all * 140}px) scale(${1 + 0.06 * all})`, transformOrigin: '50% 0' }}>
      <div style={{ position: 'relative', background: '#FFFFFF', borderRadius: 28, border: `2px solid ${C.line}`, boxShadow: '0 24px 60px rgba(7,65,42,0.16)', padding: '64px 46px 30px' }}>
        <div style={{ position: 'absolute', left: '50%', top: -26, transform: 'translateX(-50%)', width: 230, height: 58, borderRadius: 14, background: INK }} />
        <div style={{ fontFamily: F.label, fontWeight: 600, fontSize: 24, letterSpacing: '0.2em', color: C.ochre, textAlign: 'center' }}>BEFORE A BUYER PAYS YOU</div>
        <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 64, letterSpacing: '-0.03em', color: INK, textAlign: 'center', margin: '6px 0 22px' }}>5 checks</div>
        {ITEMS.map((it, i) => {
          const tick = lerp(f, [it.at + 8, it.at + 16], [0, 1], E.back);
          const active = i === cur && all < 0.5;
          return (
            <div key={it.k} style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '14px 16px', borderTop: `1px solid ${C.line}`, borderRadius: 14, background: active ? 'rgba(232,176,75,0.18)' : 'transparent' }}>
              <div style={{ width: 52, height: 52, borderRadius: 12, border: `3px solid ${INK}`, display: 'grid', placeItems: 'center', background: tick > 0.5 ? INK : 'transparent', flexShrink: 0 }}>
                <span style={{ color: C.harvest, fontSize: 36, fontWeight: 800, transform: `scale(${Math.min(1.2, tick)})`, opacity: Math.min(1, tick) }}>✓</span>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 44, color: f >= it.at ? INK : 'rgba(7,65,42,0.35)', letterSpacing: '-0.02em' }}>{it.k}</div>
                {active && <div style={{ fontFamily: F.text, fontWeight: 500, fontSize: 26, color: C.slate, opacity: lerp(f, [it.at + 10, it.at + 20], [0, 1]) }}>{it.note}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Stamp: React.FC = () => {
  const f = useCurrentFrame();
  const s = lerp(f, [L(7) - 2, L(7) + 8], [0, 1], E.back);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 1160, display: 'flex', justifyContent: 'center', opacity: Math.min(1, s) }}>
      <div style={{ transform: `rotate(-6deg) scale(${1.6 - 0.6 * s})`, border: `6px solid ${C.ochre}`, color: C.ochre, borderRadius: 16, padding: '10px 30px', fontFamily: F.display, fontWeight: 800, fontSize: 56, letterSpacing: '0.06em', background: 'rgba(255,255,255,0.85)' }}>SCREENSHOT THIS</div>
    </div>
  );
};

export const V5: React.FC = () => {
  const f = useCurrentFrame();
  const fr = (src: string, a: number, b: number) => <Frame src={src} from={a} to={b} x={140} y={1040} w={800} h={340} r={24} border={INK} at={a} />;
  return (
    <Shell8 d={D} bg={PAPER} plate vignette={0}>
      <AbsoluteFill style={{ background: PAPER, backgroundImage: `linear-gradient(rgba(7,65,42,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(7,65,42,0.05) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
      <Board />
      <Span from={0} to={L(1)} fade={6}>{fr('V5_6.mp4', 0, L(1))}</Span>
      {ITEMS.map((it, i) => <Span key={it.k} from={it.at} to={i < 4 ? ITEMS[i + 1].at : L(6)} fade={6}>{fr(it.src, it.at, i < 4 ? ITEMS[i + 1].at : L(6))}</Span>)}
      <Span from={L(7)} to={END} fade={4}><Stamp /></Span>
      <Span from={L(8)} to={END} fade={6}>
        <AbsoluteFill style={{ background: PAPER }} />
        <BrandLogo at={L(8)} light />
      </Span>
      <End8 at={END} light />
    </Shell8>
  );
};
export const V5_FRAMES = D.frames;
