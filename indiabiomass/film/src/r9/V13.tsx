import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { totalFrames, Shell8, timing, R8Data, Span, Media, Headline } from '../r8/common8';
import { r9, BrandBeat, Pellets, Icon, Tag } from './common9';
import { lerp, E } from '../lib';
import { C, F } from '../theme';
import data from '../data/r9/v13.json';

// Video 13 · One new word: torrefaction. Look: word of the day. A dictionary entry types out over a furnace,
// then a before/after roast comparison, then three benefit icons that light up one by one.
const D = data as unknown as R8Data;
const { L, W, FIN } = timing(D);
const PAPER = '#F5EFE3', EMBER = '#E9772E';

const typed = (f: number, at: number, s: string, cps = 1.4) => s.slice(0, Math.max(0, Math.floor((f - at) * cps)));

const Card: React.FC = () => {
  const f = useCurrentFrame();
  const t = lerp(f, [2, 14], [0, 1], E.out);
  const up = lerp(f, [L(1) - 4, L(1) + 12], [0, 1], E.inOut);
  const word = typed(f, W('Torrefaction') - 4, 'tor·re·fac·tion', 0.9);
  const def = typed(f, L(1) + 4, 'roasting biomass at high temperature, with very little oxygen.', 2.2);
  return (
    <div style={{ position: 'absolute', left: 90, width: 900, top: 760 - up * 420, background: PAPER, borderRadius: 24, padding: '40px 46px', boxShadow: '0 40px 100px rgba(0,0,0,0.55)', opacity: t, transform: `translateY(${(1 - t) * 50}px) scale(${1 - 0.1 * up})`, transformOrigin: '50% 0%' }}>
      <div style={{ fontFamily: F.label, fontWeight: 700, fontSize: 24, letterSpacing: '0.3em', color: '#8C6B3E' }}>WORD OF THE DAY</div>
      <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 96, color: C.ink, letterSpacing: '-0.03em', lineHeight: 1.05, marginTop: 10, minHeight: 100 }}>
        {word}<span style={{ opacity: Math.floor(f / 8) % 2 ? 1 : 0, color: EMBER }}>|</span>
      </div>
      <div style={{ fontFamily: F.text, fontSize: 34, color: '#6E6458', marginTop: 4, opacity: lerp(f, [W('Torrefaction') + 14, W('Torrefaction') + 22], [0, 1]) }}><i>noun</i> · /ˌtɒr.ɪˈfæk.ʃən/</div>
      {up > 0 && <div style={{ fontFamily: F.text, fontWeight: 500, fontSize: 40, lineHeight: 1.3, color: C.ink, marginTop: 18, borderTop: '2px solid #E2D7C3', paddingTop: 18 }}>{def}</div>}
    </div>
  );
};

const Roast: React.FC = () => {
  const f = useCurrentFrame();
  const t0 = L(1);
  return (
    <AbsoluteFill>
      <Media src={r9('V13_1.mp4')} from={t0} to={L(2)} a={[1.3, 0, 0]} b={[1.1, 0, 0]} grade="golden" />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(20,8,2,0.75) 0%, rgba(20,8,2,0.2) 45%, rgba(20,8,2,0.85) 100%)' }} />
      <Tag text="HIGH HEAT" at={W('high')} x={540} y={960} align="center" color={C.ink} bg={C.harvest} size={34} />
      <Tag text="LITTLE OXYGEN" at={W('little')} x={540} y={1050} align="center" color={C.ink} bg="#fff" size={34} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1150, textAlign: 'center', fontFamily: F.display, fontWeight: 800, fontSize: 70, letterSpacing: '-0.02em' }}>
        <span style={{ color: '#fff', opacity: lerp(f, [W('Not') - 2, W('Not') + 4], [0, 1]), textDecoration: 'line-through', textDecorationColor: EMBER, textDecorationThickness: 8 }}>BURNING</span>
        <span style={{ color: C.harvest, opacity: lerp(f, [W('roasting', 1) - 2, W('roasting', 1) + 4], [0, 1]) }}>  ROASTING</span>
      </div>
    </AbsoluteFill>
  );
};

const BeforeAfter: React.FC = () => {
  const f = useCurrentFrame();
  const t0 = L(2);
  const split = lerp(f, [t0, t0 + 14], [0, 1], E.inOut);
  return (
    <AbsoluteFill style={{ background: '#1A120C' }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 960, background: 'radial-gradient(ellipse 80% 70% at 50% 60%, #E9DCC0 0%, #CDB98F 100%)', overflow: 'hidden' }}>
        <Pellets at={t0 - 30} n={60} y={760} w={700} color="#C9A267" fall={false} />
        <div style={{ position: 'absolute', left: 60, top: 190, fontFamily: F.label, fontWeight: 700, fontSize: 32, letterSpacing: '0.24em', color: '#5B4423' }}>BEFORE · RAW BIOMASS</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 960, height: 960, overflow: 'hidden', clipPath: `inset(0 ${(1 - split) * 100}% 0 0)` }}>
        <Media src={r9('V13_2.mp4')} from={t0} to={L(3)} a={[1.5, 0, 0]} b={[1.3, 0, 0]} grade="industrial" style={{ top: -480 }} />
        <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.7) 100%)' }} />
        <div style={{ position: 'absolute', left: 60, top: 40, fontFamily: F.label, fontWeight: 700, fontSize: 32, letterSpacing: '0.24em', color: C.harvest }}>AFTER · TORREFIED</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 952, height: 16, background: EMBER, transform: `scaleX(${split})` }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1090, display: 'flex', justifyContent: 'center', gap: 16 }}>
        {(['DARK', 'DRY', 'BRITTLE'] as const).map((w) => {
          const at = W(w.toLowerCase(), 0, 2);
          const t = lerp(f, [at - 2, at + 8], [0, 1], E.back);
          return <div key={w} style={{ fontFamily: F.label, fontWeight: 700, fontSize: 36, letterSpacing: '0.16em', color: C.ink, background: '#fff', borderRadius: 14, padding: '12px 26px', opacity: Math.min(1, t), transform: `scale(${0.7 + 0.3 * t})` }}>{w}</div>;
        })}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1230, textAlign: 'center', fontFamily: F.display, fontWeight: 800, fontSize: 76, color: C.harvest, letterSpacing: '-0.02em', opacity: lerp(f, [W('Almost') - 2, W('Almost') + 8], [0, 1]) }}>ALMOST LIKE COAL</div>
    </AbsoluteFill>
  );
};

const BENEFITS = [
  { icon: 'flame' as const, k: 'MORE HEAT', sub: 'in every kilo', src: 'V13_5.mp4', at: L(4) },
  { icon: 'drop' as const, k: 'STORES BETTER', sub: 'does not soak up water', src: 'V13_3.mp4', at: L(5) },
  { icon: 'gear' as const, k: 'GRINDS EASILY', sub: 'power plant mills are built for coal', src: 'V13_4.mp4', at: L(6) },
];

const Matters: React.FC = () => {
  const f = useCurrentFrame();
  const k = BENEFITS.reduce((a, b, i) => (f >= b.at ? i : a), -1);
  return (
    <AbsoluteFill style={{ background: '#0B1612' }}>
      <Span from={L(3)} to={L(4)} fade={4}><Media src={r9('V13_6.mp4')} from={L(3)} to={L(4)} a={[1.25, 0, 0]} b={[1.1, 0, 0]} grade="cool" /></Span>
      {BENEFITS.map((b, i) => {
        const to = i < 2 ? BENEFITS[i + 1].at : L(7);
        return <Span key={i} from={b.at} to={to} fade={4}><Media src={r9(b.src)} from={b.at} to={to} a={[1.25, 0, 0]} b={[1.08, 0, 0]} grade={i === 1 ? 'cool' : 'industrial'} /></Span>;
      })}
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(8,16,12,0.92) 0%, rgba(8,16,12,0.4) 30%, rgba(8,16,12,0.45) 55%, rgba(8,16,12,0.95) 80%)' }} />
      {k < 0 ? <Headline text={'WHY DOES\nTHAT MATTER?'} at={L(3)} top={250} size={104} /> : (
        <div style={{ position: 'absolute', left: 60, right: 60, top: 230, textAlign: 'center' }}>
          <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 104, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>{BENEFITS[k].k}</div>
          <div style={{ fontFamily: F.text, fontWeight: 600, fontSize: 40, color: C.harvest, marginTop: 14 }}>{BENEFITS[k].sub}</div>
        </div>
      )}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1100, display: 'flex', justifyContent: 'center', gap: 60 }}>
        {BENEFITS.map((b, i) => {
          const appear = lerp(f, [L(3) + 6 + i * 4, L(3) + 16 + i * 4], [0, 1], E.back);
          const lit = lerp(f, [b.at, b.at + 8], [0, 1]);
          const now = i === k;
          return (
            <div key={i} style={{ width: 200, height: 200, borderRadius: '50%', display: 'grid', placeItems: 'center', opacity: Math.min(1, appear), transform: `scale(${(0.6 + 0.4 * Math.min(1, appear)) * (now ? 1.12 : 1)})`,
              background: lit > 0 ? `rgba(233,119,46,${0.25 + 0.6 * lit * (now ? 1 : 0.6)})` : 'rgba(255,255,255,0.06)', border: `5px solid ${lit > 0 ? EMBER : 'rgba(255,255,255,0.4)'}`, boxShadow: now ? '0 0 50px rgba(233,119,46,0.6)' : 'none' }}>
              <Icon name={b.icon} size={110} color={lit > 0 ? '#fff' : 'rgba(255,255,255,0.45)'} sw={7} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Hook: React.FC = () => (
  <AbsoluteFill style={{ background: '#140A04' }}>
    <Media src={r9('V13_1b.mp4')} from={0} to={L(1)} a={[1.25, 0, 0]} b={[1.08, 0, 0]} grade="golden" />
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(20,8,2,0.85) 0%, rgba(20,8,2,0.35) 50%, rgba(20,8,2,0.85) 100%)' }} />
    <Headline text={'ONE WORD YOU WILL\nHEAR MORE OFTEN'} at={4} top={250} size={72} />
  </AbsoluteFill>
);

export const V13: React.FC = () => (
  <Shell8 d={D} bg="#140A04">
    <Span from={0} to={L(1)} fade={4}><Hook /></Span>
    <Span from={L(1)} to={L(2)} fade={4}><Roast /></Span>
    <Span from={0} to={L(2)} fade={6}><Card /></Span>
    <Span from={L(2)} to={L(3)} fade={4}><BeforeAfter /></Span>
    <Span from={L(3)} to={L(7)} fade={5}><Matters /></Span>
    <Span from={L(7)} to={FIN + 2} fade={6}><BrandBeat at={L(7)} chips={['TORREFACTION PLANTS', 'PELLET MAKERS', 'BUYERS']} text={'INDIABIOMASS IS\nBRINGING THEM TOGETHER'} /></Span>
  </Shell8>
);
export const V13_FRAMES = totalFrames(D);
