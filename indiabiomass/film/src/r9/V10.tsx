import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { totalFrames, Shell8, timing, R8Data, Media } from '../r8/common8';
import { r9, BrandBeat, Icon } from './common9';
import { lerp, E } from '../lib';
import { C, F } from '../theme';
import data from '../data/r9/v10.json';

// Video 10 · A day in the life of an aggregator. Look: a clock day. A huge timestamp leads each scene, the sky
// behind it shifts from dawn to night, and the footage sits in a round window ringed by a clock arc that fills.
const D = data as unknown as R8Data;
const { L, W, FIN } = timing(D);
const SCENES = [
  { time: '5:00', ap: 'AM', h: 5, at: L(0), shots: [{ src: 'V10_1.mp4', at: 0 }, { src: 'V10_2.mp4', at: W('calls') - 6 }], chips: [['WHICH FARMS HAVE HARVESTED?', W('Which', 0)], ['WHICH BALERS ARE FREE?', W('Which', 1)]] },
  { time: '8:00', ap: 'AM', h: 8, at: L(1), shots: [{ src: 'V10_3.mp4', at: L(1) }], chips: [['CHECKING THE STRAW', L(1) + 10], ['WET BALES LOSE VALUE', W('Wet')]] },
  { time: '11:00', ap: 'AM', h: 11, at: L(2), shots: [{ src: 'V10_4.mp4', at: L(2) }], chips: [['AGREEING TERMS', L(2) + 10], ['ONE FIELD AT A TIME', W('one', 0, 2)]] },
  { time: '2:00', ap: 'PM', h: 14, at: L(3), shots: [{ src: 'V10_5.mp4', at: L(3) }], chips: [['ARRANGING TRUCKS', L(3) + 10], ['TOO FEW: BALES IN THE RAIN', W('few')], ['TOO MANY: TRUCKS WAIT EMPTY', W('many')]] },
  { time: '5:00', ap: 'PM', h: 17, at: L(4), shots: [{ src: 'V10_6.mp4', at: L(4) }], chips: [['CALLING BUYERS', L(4) + 10], ['WHO NEEDS HOW MUCH?', W('Who', 0, 4)], ['WHO PAYS ON TIME?', W('who', 1, 4)]] },
  { time: '9:00', ap: 'PM', h: 21, at: L(5), shots: [{ src: 'V10_7.mp4', at: L(5) }], chips: [['PLANNING TOMORROW', L(5) + 10]] },
] as const;
const SKY: [number, string, string][] = [
  [5, '#1C2A55', '#C9786A'], [8, '#4E86B8', '#F2D3A0'], [11, '#3E8FC9', '#BFE0F2'], [14, '#3C86BE', '#F4E2B8'], [17, '#3B3A6E', '#F0955A'], [21, '#070B1E', '#1B2550'],
];
const mix = (a: string, b: string, t: number) => {
  const p = (s: string) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
  const A = p(a), B = p(b);
  return `rgb(${A.map((x, i) => Math.round(x + (B[i] - x) * t)).join(',')})`;
};
const CX = 540, CY = 930, R = 360;

const Sky: React.FC = () => {
  const f = useCurrentFrame();
  const k = SCENES.reduce((a, s, i) => (f >= s.at ? i : a), 0);
  const nx = Math.min(k + 1, SKY.length - 1);
  const t = k === nx ? 0 : lerp(f, [SCENES[nx].at - 14, SCENES[nx].at + 6], [0, 1], E.inOut);
  const top = mix(SKY[k][1], SKY[nx][1], t), bot = mix(SKY[k][2], SKY[nx][2], t);
  return <AbsoluteFill style={{ background: `linear-gradient(180deg, ${top} 0%, ${bot} 75%, ${bot} 100%)` }} />;
};

/** Progress arc around the window: 5 AM to 9 PM is a full circle. */
const Ring: React.FC<{ full?: number }> = ({ full }) => {
  const f = useCurrentFrame();
  const k = SCENES.reduce((a, s, i) => (f >= s.at ? i : a), 0);
  const hNow = SCENES[k].h + (k < 5 ? (SCENES[k + 1].h - SCENES[k].h) * lerp(f, [SCENES[k].at, SCENES[k + 1].at], [0, 1]) : 0);
  let p = (hNow - 5) / 16;
  if (full !== undefined) p = Math.max(p, lerp(f, [full, full + 30], [p, 1], E.inOut));
  const r = R + 34, c = 2 * Math.PI * r;
  const ang = -90 + p * 360;
  const sx = CX + r * Math.cos((ang * Math.PI) / 180), sy = CY + r * Math.sin((ang * Math.PI) / 180);
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
      <circle cx={CX} cy={CY} r={r} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth={10} />
      <circle cx={CX} cy={CY} r={r} fill="none" stroke={C.harvest} strokeWidth={10} strokeLinecap="round" strokeDasharray={`${c * p} ${c}`} transform={`rotate(-90 ${CX} ${CY})`} />
      {Array.from({ length: 16 }, (_, i) => {
        const a = ((-90 + (i / 16) * 360) * Math.PI) / 180;
        return <line key={i} x1={CX + (r + 22) * Math.cos(a)} y1={CY + (r + 22) * Math.sin(a)} x2={CX + (r + 34) * Math.cos(a)} y2={CY + (r + 34) * Math.sin(a)} stroke="rgba(255,255,255,0.6)" strokeWidth={4} />;
      })}
      <circle cx={sx} cy={sy} r={18} fill={C.harvest} stroke="#fff" strokeWidth={4} />
    </svg>
  );
};

const Stamp: React.FC = () => {
  const f = useCurrentFrame();
  const k = SCENES.reduce((a, s, i) => (f >= s.at ? i : a), 0);
  const s = SCENES[k];
  const t = lerp(f, [s.at, s.at + 10], [0, 1], E.out);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', color: '#fff', textShadow: '0 6px 30px rgba(0,0,0,0.35)' }}>
      <span style={{ display: 'inline-block', fontFamily: F.display, fontWeight: 800, fontSize: 200, letterSpacing: '-0.05em', lineHeight: 1, transform: `translateY(${(1 - t) * -40}px)`, opacity: t }}>{s.time}</span>
      <span style={{ fontFamily: F.label, fontWeight: 600, fontSize: 64, letterSpacing: '0.08em', marginLeft: 14, opacity: t }}>{s.ap}</span>
    </div>
  );
};

const Chips: React.FC = () => {
  const f = useCurrentFrame();
  const k = SCENES.reduce((a, s, i) => (f >= s.at ? i : a), 0);
  const ch = SCENES[k].chips.filter(([, at]) => f >= at);
  if (!ch.length) return null;
  const [text, at] = ch[ch.length - 1];
  const t = lerp(f, [at, at + 9], [0, 1], E.back);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 400, display: 'flex', justifyContent: 'center' }}>
      <div style={{ fontFamily: F.label, fontWeight: 700, fontSize: 32, letterSpacing: '0.14em', color: C.ink, background: '#fff', borderRadius: 999, padding: '14px 32px', boxShadow: '0 10px 30px rgba(0,0,0,0.25)', opacity: Math.min(1, t), transform: `scale(${0.85 + 0.15 * t})` }}>{text}</div>
    </div>
  );
};

const Window: React.FC = () => {
  const f = useCurrentFrame();
  const shots = SCENES.flatMap((s, i) => s.shots.map((sh) => ({ ...sh, end: 0, k: i })));
  shots.forEach((s, i) => (s.end = i < shots.length - 1 ? shots[i + 1].at : L(6)));
  return (
    <div style={{ position: 'absolute', left: CX - R, top: CY - R, width: 2 * R, height: 2 * R, borderRadius: '50%', overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.35)', border: '6px solid rgba(255,255,255,0.9)' }}>
      {shots.map((s, i) => {
        if (f < s.at - 6 || f >= s.end + 6) return null;
        const o = Math.min(lerp(f, [s.at - 6, s.at + 2], [0, 1]), 1);
        return (
          <div key={i} style={{ position: 'absolute', inset: 0, opacity: i === 0 ? 1 : o }}>
            <Media src={r9(s.src)} from={s.at} to={s.end} a={[1.3, 0, 0]} b={[1.12, 0, 0]} grade={s.k === 5 ? 'cool' : 'warm'} />
          </div>
        );
      })}
    </div>
  );
};

const OneCall: React.FC = () => {
  const f = useCurrentFrame();
  const t0 = L(6);
  const t = lerp(f, [t0, t0 + 14], [0, 1], E.out);
  return (
    <>
      <div style={{ position: 'absolute', left: CX - R, top: CY - R, width: 2 * R, height: 2 * R, borderRadius: '50%', background: C.forest, opacity: t, display: 'grid', placeItems: 'center', border: '6px solid rgba(255,255,255,0.9)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ transform: `rotate(${Math.sin(f * 0.6) * 8 * lerp(f, [t0 + 10, t0 + 40], [1, 0])}deg)` }}><Icon name="phone" size={150} color={C.harvest} /></div>
          <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 74, lineHeight: 1.05, color: '#fff', marginTop: 20, letterSpacing: '-0.02em' }}>ONE CALL<br /><span style={{ color: C.harvest }}>AT A TIME</span></div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 230, textAlign: 'center', fontFamily: F.display, fontWeight: 800, fontSize: 70, lineHeight: 1.05, color: '#fff', letterSpacing: '-0.02em', opacity: t, textShadow: '0 6px 30px rgba(0,0,0,0.4)' }}>AGGREGATORS HOLD<br />THE SUPPLY CHAIN TOGETHER</div>
    </>
  );
};

export const V10: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Shell8 d={D} plate>
      <Sky />
      {f < L(6) + 8 && (
        <AbsoluteFill style={{ opacity: lerp(f, [L(6), L(6) + 8], [1, 0]) }}>
          <Window />
          <Stamp />
          <Chips />
        </AbsoluteFill>
      )}
      {f < L(7) + 6 && <Ring full={L(6)} />}
      {f >= L(6) && f < L(7) + 6 && <AbsoluteFill style={{ opacity: lerp(f, [L(7), L(7) + 6], [1, 0]) }}><OneCall /></AbsoluteFill>}
      {f >= L(7) - 6 && f < FIN + 2 && <AbsoluteFill style={{ opacity: lerp(f, [L(7) - 6, L(7) + 2], [0, 1]) }}><BrandBeat at={L(7)} text={"ONE PLACE FOR THE PEOPLE\nWHO KEEP INDIA'S\nBIOMASS MOVING"} /></AbsoluteFill>}
    </Shell8>
  );
};
export const V10_FRAMES = totalFrames(D);
