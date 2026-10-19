import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { totalFrames, Shell8, timing, R8Data, Span, Media, Headline } from '../r8/common8';
import { r9, BrandBeat } from './common9';
import { lerp, E } from '../lib';
import { C, F } from '../theme';
import data from '../data/r9/v12.json';

// Video 12 · The biomass calendar. Look: a 12-month year wheel. Each season lights its arc of months
// (the wheel turns so the season sits on top) with that crop's photo in the centre; it ends on a
// stacked-ring calendar of all five residues.
const D = data as unknown as R8Data;
const { L, W, FIN } = timing(D);
const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const DEEP = '#062A1B';
const SEASONS = [
  { when: 'OCT – NOV', crop: 'PADDY STRAW', note: 'North India · little time', m: [9, 10], col: '#E8B04B', src: 'V12_1.jpg', at: L(1) },
  { when: 'NOV – SPRING', crop: 'BAGASSE', note: 'Sugar mills crushing', m: [10, 11, 0, 1, 2], col: '#9FD07A', src: 'V12_2.jpg', at: L(2) },
  { when: 'WINTER', crop: 'COTTON STALKS', note: 'Cleared from the fields', m: [11, 0, 1], col: '#F2EDE2', src: 'V12_3.jpg', at: L(3) },
  { when: 'FEB – APR', crop: 'MUSTARD HUSK · WHEAT STRAW', note: 'Mustard first, then wheat', m: [1, 2, 3], col: '#F0D03C', src: 'V12_4.mp4', at: L(4) },
  { when: 'ALL YEAR', crop: 'RICE HUSK', note: 'Wherever rice mills run', m: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], col: '#E39A5B', src: 'V12_5.mp4', at: L(5) },
];
const CX = 540, CY = 880, RO = 370, RI = 300;
const pol = (r: number, a: number) => [CX + r * Math.cos(a), CY + r * Math.sin(a)];
const arc = (r0: number, r1: number, a0: number, a1: number) => {
  const [x0, y0] = pol(r1, a0), [x1, y1] = pol(r1, a1), [x2, y2] = pol(r0, a1), [x3, y3] = pol(r0, a0);
  const big = a1 - a0 > Math.PI ? 1 : 0;
  return `M${x0} ${y0} A${r1} ${r1} 0 ${big} 1 ${x1} ${y1} L${x2} ${y2} A${r0} ${r0} 0 ${big} 0 ${x3} ${y3} Z`;
};
const mAng = (i: number, rot: number) => ((i / 12) * 360 - 90 + rot - 15) * (Math.PI / 180);

const Wheel: React.FC = () => {
  const f = useCurrentFrame();
  const k = SEASONS.reduce((a, s, i) => (f >= s.at ? i : a), -1);
  // rotate so the middle of the active season sits at 12 o'clock
  const target = (s: (typeof SEASONS)[number]) => {
    if (s.m.length === 12) return 0;
    const mid = s.m[0] + (s.m.length - 1) / 2;
    return -(mid / 12) * 360;
  };
  let rot = 0;
  SEASONS.forEach((s, i) => { if (i <= k) rot = rot + (target(s) - rot) * lerp(f, [s.at, s.at + 20], [0, 1], E.inOut); });
  const draw = lerp(f, [4, 30], [0, 12]);
  const s = k >= 0 ? SEASONS[k] : null;
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
      {MON.map((mn, i) => {
        if (i >= draw) return null;
        const on = s && s.m.includes(i);
        const lit = on ? lerp(f, [s!.at + 6 + s!.m.indexOf(i) * 2, s!.at + 14 + s!.m.indexOf(i) * 2], [0, 1]) : 0;
        const a0 = mAng(i, rot) + 0.02, a1 = mAng(i + 1, rot) - 0.02, am = (a0 + a1) / 2;
        const [tx, ty] = pol((RO + RI) / 2, am);
        return (
          <g key={mn}>
            <path d={arc(RI, RO, a0, a1)} fill={on ? s!.col : 'rgba(255,255,255,0.08)'} fillOpacity={on ? 0.25 + 0.75 * lit : 1} stroke="rgba(255,255,255,0.18)" strokeWidth={2} />
            <text x={tx} y={ty + 11} textAnchor="middle" fontFamily="Archivo, sans-serif" fontWeight={700} fontSize={30} letterSpacing={2} fill={on && lit > 0.5 ? C.ink : 'rgba(255,255,255,0.8)'}
              transform={`rotate(${(am * 180) / Math.PI + 90} ${tx} ${ty})`}>{mn}</text>
          </g>
        );
      })}
      <polygon points={`${CX - 22},${CY - RO - 34} ${CX + 22},${CY - RO - 34} ${CX},${CY - RO - 6}`} fill={C.harvest} opacity={k >= 0 ? 1 : 0} />
    </svg>
  );
};

const Centre: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {SEASONS.map((s, i) => {
        const to = i < 4 ? SEASONS[i + 1].at : L(6);
        if (f < s.at - 6 || f > to + 6) return null;
        const o = Math.min(lerp(f, [s.at - 6, s.at + 4], [0, 1]), lerp(f, [to, to + 6], [1, 0]));
        return (
          <div key={i} style={{ position: 'absolute', left: CX - RI + 14, top: CY - RI + 14, width: 2 * (RI - 14), height: 2 * (RI - 14), borderRadius: '50%', overflow: 'hidden', opacity: o }}>
            <Media src={r9(s.src)} from={s.at} to={to} a={[1.3, 0, 0]} b={[1.1, 0, 0]} grade="golden" />
          </div>
        );
      })}
    </>
  );
};

const Title: React.FC = () => {
  const f = useCurrentFrame();
  const k = SEASONS.reduce((a, s, i) => (f >= s.at ? i : a), -1);
  if (k < 0) return null;
  const s = SEASONS[k];
  const t = lerp(f, [s.at, s.at + 10], [0, 1], E.out);
  return (
    <div style={{ position: 'absolute', left: 50, right: 50, top: 150, textAlign: 'center', opacity: t, transform: `translateY(${(1 - t) * 24}px)` }}>
      <div style={{ fontFamily: F.label, fontWeight: 700, fontSize: 40, letterSpacing: '0.24em', color: s.col === '#F2EDE2' ? '#fff' : s.col }}>{s.when}</div>
      <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: s.crop.length > 14 ? 64 : 96, lineHeight: 1.02, color: '#fff', letterSpacing: '-0.03em', marginTop: 8 }}>{s.crop}</div>
      <div style={{ fontFamily: F.text, fontWeight: 500, fontSize: 34, color: 'rgba(255,255,255,0.75)', marginTop: 8 }}>{s.note}</div>
    </div>
  );
};

/** All five residues as concentric rings: the year at a glance. */
const Stack: React.FC = () => {
  const f = useCurrentFrame();
  const t0 = L(6);
  const RS = [380, 330, 280, 230, 180];
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 90% 60% at 50% 45%, #0C4A31 0%, ${DEEP} 70%)` }}>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        {MON.map((mn, i) => {
          const a = mAng(i, 0) + (Math.PI / 12);
          const [tx, ty] = pol(420, a);
          return <text key={mn} x={tx} y={ty + 10} textAnchor="middle" fontFamily="Archivo, sans-serif" fontWeight={700} fontSize={26} fill="rgba(255,255,255,0.7)">{mn}</text>;
        })}
        {SEASONS.map((s, j) => {
          const g = lerp(f, [t0 + j * 6, t0 + j * 6 + 16], [0, 1], E.out);
          return s.m.map((i) => i < 12 && (
            <path key={`${j}-${i}`} d={arc(RS[j] - 40, RS[j], mAng(i, 0) + 0.015, mAng(i, 0) + 0.015 + (Math.PI / 6 - 0.03) * g)} fill={s.col} opacity={0.9} />
          ));
        })}
      </svg>
      <div style={{ position: 'absolute', left: 50, right: 50, top: 1330, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px 22px', opacity: lerp(f, [t0 + 30, t0 + 40], [0, 1]) }}>
        {SEASONS.map((s) => <span key={s.crop} style={{ fontFamily: F.label, fontWeight: 600, fontSize: 28, letterSpacing: '0.08em', color: '#fff' }}><span style={{ display: 'inline-block', width: 20, height: 20, borderRadius: 4, background: s.col, marginRight: 8 }} />{s.crop.split(' · ')[0]}</span>)}
      </div>
      <Headline text={'BUY IN SEASON'} at={t0} out={L(7) - 4} top={170} size={86} color={C.harvest} />
      <Headline text={'PLAN YOUR YEAR\nAROUND THE CALENDAR'} at={L(7)} top={130} size={74} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 290, textAlign: 'center', fontFamily: F.text, fontWeight: 600, fontSize: 36, color: '#fff', opacity: lerp(f, [W('easy'), W('easy') + 8], [0, 1]) * lerp(f, [L(7) - 4, L(7)], [1, 0]) }}>
        supply is easy · <span style={{ color: '#F08A6A', opacity: lerp(f, [W('compete'), W('compete') + 8], [0, 1]) }}>out of season, you compete</span>
      </div>
    </AbsoluteFill>
  );
};

export const V12: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Shell8 d={D} bg={DEEP}>
      <Span from={0} to={L(6)} fade={6}>
        <AbsoluteFill style={{ background: `radial-gradient(ellipse 90% 60% at 50% 45%, #0C4A31 0%, ${DEEP} 70%)` }} />
        {f < L(1) + 10 && (
          <AbsoluteFill style={{ opacity: lerp(f, [L(1) - 4, L(1) + 8], [0.55, 0]) }}>
            <Media src={r9('V12_6.mp4')} from={0} to={L(1) + 10} a={[1.2, 0, 0]} b={[1.05, 0, 0]} grade="golden" />
          </AbsoluteFill>
        )}
        <Wheel />
        <Centre />
        <Title />
        <AbsoluteFill style={{ opacity: lerp(f, [L(1) - 6, L(1)], [1, 0]) }}><Headline text={'BIOMASS\nHAS SEASONS'} at={4} top={170} size={110} /></AbsoluteFill>
      </Span>
      <Span from={L(6)} to={L(8)} fade={6}><Stack /></Span>
      <Span from={L(8)} to={FIN + 2} fade={6}><BrandBeat at={L(8)} text={'SEE WHAT IS\nAVAILABLE, AND WHERE'} /></Span>
    </Shell8>
  );
};
export const V12_FRAMES = totalFrames(D);
