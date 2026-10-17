import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { BrandLogo, Shell8, timing, R8Data, Span, Media, Shade, Headline, Chip, End8 } from './common8';
import { Logo } from '../components/Logo';
import { lerp, E } from '../lib';
import { C, F } from '../theme';
import data from '../data/r8/v2.json';

// Video 2 · Four myths (myth vs fact). Look: a card flips from a red MYTH face to a green FACT face; counter 1/4..4/4.
const D = data as unknown as R8Data;
const { L, END } = timing(D);
const RED = '#C9473D', GREEN = '#5FCB8E';
const M = [
  { myth: L(1), fact: L(2), next: L(3), bg: 'V2_1.jpg', bgFact: 'V2_2.jpg', front: 'Biomass is just waste.', back: 'Collected, dried and processed, it is a fuel.', extra: 'spec' },
  { myth: L(3), fact: L(4), next: L(5), bg: 'V2_3.mp4', bgFact: 'V2_3.mp4', front: 'Only big companies can sell to power plants.', back: 'Many tenders are open to smaller suppliers.', extra: 'mse' },
  { myth: L(5), fact: L(6), next: L(7), bg: 'V2_4.jpg', bgFact: 'V2_4.jpg', front: 'All straw is the same.', back: 'Moisture, ash and heat value set its worth.', extra: 'gauges' },
  { myth: L(7), fact: L(8), next: L(9), bg: 'V2_5.jpg', bgFact: 'V2_5.jpg', front: 'The price is whatever the buyer says.', back: 'Prices move by region and by season.', extra: 'regions' },
] as const;

const Extra: React.FC<{ kind: string; at: number }> = ({ kind, at }) => {
  const f = useCurrentFrame();
  const t = (k: number) => lerp(f, [at + 12 + k * 6, at + 24 + k * 6], [0, 1], E.out);
  if (kind === 'spec') return (
    <div style={{ display: 'flex', gap: 18, justifyContent: 'center' }}>
      {['SPEC SHEET', 'PRICE', 'BUYERS'].map((x, k) => (
        <div key={x} style={{ opacity: t(k), transform: `translateY(${(1 - t(k)) * 20}px)`, fontFamily: F.label, fontWeight: 600, fontSize: 24, letterSpacing: '0.12em', color: C.ink, background: GREEN, borderRadius: 999, padding: '12px 22px' }}>{x}</div>
      ))}
    </div>
  );
  if (kind === 'mse') return (
    <div style={{ opacity: t(0), transform: `scale(${0.9 + 0.1 * t(0)})`, margin: '0 auto', border: `3px solid ${GREEN}`, borderRadius: 18, padding: '14px 26px', fontFamily: F.display, fontWeight: 700, fontSize: 34, color: GREEN, textAlign: 'center' }}>
      Registered MSEs can often skip the deposit
    </div>
  );
  if (kind === 'gauges') return (
    <div style={{ display: 'flex', gap: 34, justifyContent: 'center', alignItems: 'flex-end', height: 190 }}>
      {[['MOISTURE', 0.35], ['ASH', 0.5], ['HEAT', 0.85]].map(([x, v], k) => (
        <div key={x as string} style={{ textAlign: 'center' }}>
          <div style={{ width: 90, height: 140, borderRadius: 14, background: 'rgba(255,255,255,0.12)', position: 'relative', overflow: 'hidden', margin: '0 auto' }}>
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: `${(v as number) * 100 * t(k)}%`, background: GREEN }} />
          </div>
          <div style={{ marginTop: 10, fontFamily: F.label, fontWeight: 600, fontSize: 20, letterSpacing: '0.12em', color: '#fff' }}>{x}</div>
        </div>
      ))}
    </div>
  );
  // regions: dots of different sizes pulsing out of phase (shape only, no prices)
  return (
    <div style={{ position: 'relative', height: 190 }}>
      {[[160, 60, 1.0], [330, 120, 0.6], [470, 40, 1.3], [600, 130, 0.8], [720, 70, 1.1]].map(([x, y, s], k) => {
        const p = 0.5 + 0.5 * Math.sin((f - at) * 0.12 + k * 1.7);
        return <div key={k} style={{ position: 'absolute', left: (x as number) - 40, top: y as number, width: 60 * (s as number) * (0.8 + 0.3 * p), height: 60 * (s as number) * (0.8 + 0.3 * p), borderRadius: '50%', background: GREEN, opacity: t(k) * (0.5 + 0.5 * p), transform: 'translate(-50%,-50%)' }} />;
      })}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: -6, textAlign: 'center', fontFamily: F.label, fontWeight: 600, fontSize: 20, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.75)', opacity: t(5) }}>DIFFERENT REGIONS · DIFFERENT SEASONS</div>
    </div>
  );
};

const Card: React.FC<{ i: number }> = ({ i }) => {
  const f = useCurrentFrame();
  const m = M[i];
  const inn = lerp(f, [m.myth - 6, m.myth + 10], [0, 1], E.out);
  const flip = lerp(f, [m.fact - 8, m.fact + 8], [0, 180], E.inOut);
  const stamp = lerp(f, [m.myth + 6, m.myth + 14], [0, 1], E.back);
  const face: React.CSSProperties = { position: 'absolute', inset: 0, borderRadius: 34, backfaceVisibility: 'hidden', padding: '60px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 36, boxShadow: '0 40px 100px rgba(0,0,0,0.55)' };
  return (
    <div style={{ position: 'absolute', left: 110, top: 470, width: 860, height: 820, perspective: 2000, opacity: inn, transform: `translateY(${(1 - inn) * 80}px)` }}>
      <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `rotateY(${flip}deg)` }}>
        <div style={{ ...face, background: 'rgba(28,10,8,0.92)', border: `3px solid ${RED}` }}>
          <div style={{ alignSelf: 'center', transform: `rotate(-8deg) scale(${0.6 + 0.4 * stamp})`, opacity: Math.min(1, stamp), border: `6px solid ${RED}`, color: RED, borderRadius: 14, padding: '6px 26px', fontFamily: F.display, fontWeight: 800, fontSize: 64, letterSpacing: '0.1em' }}>MYTH</div>
          <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 66, lineHeight: 1.08, color: '#fff', textAlign: 'center', letterSpacing: '-0.02em' }}>“{m.front}”</div>
        </div>
        <div style={{ ...face, background: 'rgba(6,30,19,0.94)', border: `3px solid ${GREEN}`, transform: 'rotateY(180deg)' }}>
          <div style={{ alignSelf: 'center', border: `6px solid ${GREEN}`, color: GREEN, borderRadius: 14, padding: '6px 26px', fontFamily: F.display, fontWeight: 800, fontSize: 64, letterSpacing: '0.1em', transform: 'rotate(-4deg)' }}>FACT</div>
          <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 58, lineHeight: 1.1, color: '#fff', textAlign: 'center', letterSpacing: '-0.02em' }}>{m.back}</div>
          {flip > 90 && <Extra kind={m.extra} at={m.fact} />}
        </div>
      </div>
    </div>
  );
};

const Counter: React.FC = () => {
  const f = useCurrentFrame();
  const i = M.findIndex((m) => f >= m.myth - 6 && f < m.next);
  if (i < 0) return null;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 230, display: 'flex', justifyContent: 'center', gap: 14, alignItems: 'center' }}>
      <span style={{ fontFamily: F.label, fontWeight: 600, fontSize: 26, letterSpacing: '0.2em', color: C.harvest, marginRight: 10 }}>MYTH {i + 1} / 4</span>
      {M.map((_, k) => <span key={k} style={{ width: k === i ? 46 : 14, height: 14, borderRadius: 7, background: k <= i ? C.harvest : 'rgba(255,255,255,0.3)' }} />)}
    </div>
  );
};

const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const shots = ['V2_1.jpg', 'V2_2.jpg', 'V2_4.jpg', 'V2_5.jpg'];
  const k = Math.min(3, Math.floor(f / 24));
  return (
    <AbsoluteFill>
      <Media src={shots[k]} from={k * 24} to={k * 24 + 30} a={[1.25, 0, 0]} b={[1.12, 0, 0]} />
      <Shade top={0.85} mid={0.45} bottom={0.8} />
      <Headline text={'4 THINGS\nPEOPLE GET\nWRONG ABOUT\nBIOMASS'} at={4} out={L(1) - 8} top={560} size={104} />
    </AbsoluteFill>
  );
};

export const V2: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Shell8 d={D}>
      <Span from={0} to={L(1)}><Hook /></Span>
      {M.map((m, i) => (
        <React.Fragment key={i}>
          <Span from={m.myth} to={m.fact}><Media src={m.bg} from={m.myth} to={m.fact} a={[1.2, 0, 0]} b={[1.08, 0, 0]} grade="neutral" style={{ filter: 'saturate(0.6)' }} /><Shade top={0.7} mid={0.55} bottom={0.8} /></Span>
          <Span from={m.fact} to={m.next}><Media src={m.bgFact} from={m.fact} to={m.next} a={[1.08, 0, 0]} b={[1.2, 0, 0]} grade="warm" /><Shade top={0.7} mid={0.5} bottom={0.8} tint="2,24,14" /></Span>
          <Span from={m.myth} to={m.next} fade={6}><Card i={i} /></Span>
        </React.Fragment>
      ))}
      <Counter />
      <Span from={L(9)} to={END}>
        <AbsoluteFill style={{ background: `radial-gradient(ellipse 100% 70% at 50% 45%, #0A4A31 0%, ${C.forest} 40%, #03180F 100%)` }} />
        <BrandLogo at={L(9)} />
        <Chip text="SUPPLIERS · TENDERS · PRICES" at={L(9) + 30} top={1180} />
      </Span>
      <End8 at={END} />
    </Shell8>
  );
};
export const V2_FRAMES = D.frames;
