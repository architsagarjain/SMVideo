import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { totalFrames, Shell8, timing, R8Data, Media } from '../r8/common8';
import { r9, Icon } from './common9';
import { lerp, E } from '../lib';
import { C, F } from '../theme';
import data from '../data/r9/v14.json';

// Video 14 · Same morning, two phones. Look: two-screen, split top/bottom. Punjab (her, the pellet maker) on
// top, Haryana (him, the factory manager) below, each with its own clock. The halves drift apart on "they
// never found each other", then a gold line joins them.
const D = data as unknown as R8Data;
const { L, W, FIN } = timing(D);
const NAVY = '#0C1418';
const HALF = 960;

type Shot = { src: string; from: number; to: number; grade?: 'warm' | 'cool' | 'industrial' | 'golden' | 'neutral' };
const TOP: Shot[] = [
  { src: 'V14_1.mp4', from: 0, to: L(3), grade: 'warm' },
  { src: 'V14_3.jpg', from: L(3), to: L(5) },
  { src: 'V14_5.jpg', from: L(5), to: FIN },
];
const BOT: Shot[] = [
  { src: 'V14_2.mp4', from: 0, to: L(3), grade: 'industrial' },
  { src: 'V14_4.jpg', from: L(3), to: L(5) },
  { src: 'V14_6.mp4', from: L(5), to: FIN, grade: 'cool' },
];

const Half: React.FC<{ shots: Shot[]; top: boolean; focus: number; gap: number }> = ({ shots, top, focus, gap }) => {
  const f = useCurrentFrame();
  const y = top ? -gap : HALF + gap;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: y, height: HALF, overflow: 'hidden' }}>
      {shots.map((s, i) => {
        if (f < s.from - 6 || f >= s.to + 6) return null;
        const o = i === 0 ? 1 : lerp(f, [s.from - 6, s.from + 2], [0, 1]);
        const still = s.src.endsWith('.jpg');
        return (
          <div key={i} style={{ position: 'absolute', inset: 0, opacity: o }}>
            <Media src={r9(s.src)} from={s.from} to={s.to} a={still ? [1.18, top ? -20 : 20, 0] : [1.2, 0, 0]} b={still ? [1.06, top ? 20 : -20, 0] : [1.06, 0, 0]} grade={s.grade ?? 'warm'} />
          </div>
        );
      })}
      <AbsoluteFill style={{ background: `rgba(8,12,14,${0.15 + 0.55 * (1 - focus)})`, filter: 'none' }} />
      <AbsoluteFill style={{ background: top ? 'linear-gradient(180deg, rgba(8,12,14,0.75) 0%, rgba(8,12,14,0) 35%)' : 'linear-gradient(0deg, rgba(8,12,14,0.85) 0%, rgba(8,12,14,0) 45%)' }} />
    </div>
  );
};

const Label: React.FC<{ top: boolean; gap: number; place: string; who: string }> = ({ top, gap, place, who }) => {
  const f = useCurrentFrame();
  const evening = f >= L(5);
  const clockT = lerp(f, [L(5), L(5) + 10], [0, 1], E.out);
  const t = lerp(f, [top ? 2 : 8, top ? 14 : 20], [0, 1], E.out);
  const y = top ? 120 - gap : HALF + 40 + gap;
  return (
    <div style={{ position: 'absolute', left: 60, right: 60, top: y, display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: t }}>
      <div>
        <div style={{ fontFamily: F.label, fontWeight: 700, fontSize: 30, letterSpacing: '0.26em', color: C.harvest }}>{place}</div>
        <div style={{ fontFamily: F.text, fontWeight: 600, fontSize: 30, color: '#fff', marginTop: 4 }}>{who}</div>
      </div>
      <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 64, color: '#fff', letterSpacing: '-0.03em', background: 'rgba(8,12,14,0.7)', borderRadius: 16, padding: '6px 22px', position: 'relative', overflow: 'hidden' }}>
        <span style={{ display: 'inline-block', transform: `translateY(${-clockT * 100}%)`, opacity: 1 - clockT }}>7:00 AM</span>
        {evening && <span style={{ position: 'absolute', left: 22, top: 6, transform: `translateY(${(1 - clockT) * 100}%)` }}>EVENING</span>}
      </div>
    </div>
  );
};

/** A chip pinned in a half. */
const Pin: React.FC<{ text: string; at: number; out?: number; top: boolean; gap: number; y: number; red?: boolean }> = ({ text, at, out = 1e9, top, gap, y, red }) => {
  const f = useCurrentFrame();
  const t = Math.min(lerp(f, [at, at + 9], [0, 1], E.back), lerp(f, [out, out + 6], [1, 0]));
  if (t <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: (top ? -gap : HALF + gap) + y, display: 'flex', justifyContent: 'center', opacity: Math.min(1, t) }}>
      <div style={{ fontFamily: F.label, fontWeight: 700, fontSize: 38, letterSpacing: '0.14em', color: red ? '#fff' : C.ink, background: red ? '#D2463A' : '#fff', borderRadius: 999, padding: '14px 34px', transform: `scale(${0.8 + 0.2 * t})`, boxShadow: '0 12px 30px rgba(0,0,0,0.4)' }}>{text}</div>
    </div>
  );
};

const Quotes: React.FC<{ gap: number }> = ({ gap }) => {
  const f = useCurrentFrame();
  const at = W('prices') - 8;
  return (
    <>
      {[0, 1, 2].map((i) => {
        const t = lerp(f, [at + i * 5, at + i * 5 + 10], [0, 1], E.back);
        const xs = [190, 540, 890][i], rot = [-6, 3, -2][i], ys = [560, 520, 580][i];
        return (
          <div key={i} style={{ position: 'absolute', left: xs - 130, top: ys - gap, width: 260, opacity: Math.min(1, t), transform: `scale(${0.6 + 0.4 * t}) rotate(${rot * t}deg)` }}>
            <div style={{ background: '#FFF8E7', borderRadius: 18, padding: '16px 18px', textAlign: 'center', boxShadow: '0 12px 30px rgba(0,0,0,0.45)' }}>
              <div style={{ fontFamily: F.label, fontWeight: 700, fontSize: 22, letterSpacing: '0.2em', color: '#8C6B3E' }}>TRADER {i + 1}</div>
              <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 44, color: C.ink }}>₹ {['?', '??', '???'][i]}</div>
            </div>
          </div>
        );
      })}
    </>
  );
};

const NoReply: React.FC<{ gap: number }> = ({ gap }) => {
  const f = useCurrentFrame();
  const at = W('reply') - 10;
  const t = lerp(f, [at, at + 10], [0, 1], E.out);
  return (
    <div style={{ position: 'absolute', right: 90, top: HALF + gap + 190, width: 520, opacity: t, transform: `translateY(${(1 - t) * 30}px)` }}>
      <div style={{ background: '#E9F6EC', borderRadius: '26px 26px 6px 26px', padding: '20px 26px', fontFamily: F.text, fontWeight: 500, fontSize: 36, color: C.ink, boxShadow: '0 12px 30px rgba(0,0,0,0.4)' }}>
        Need fuel by Friday. Anyone?
        <div style={{ textAlign: 'right', fontSize: 26, color: '#8A948D', marginTop: 4 }}>✓</div>
      </div>
      <div style={{ marginTop: 14, textAlign: 'right', fontFamily: F.label, fontWeight: 700, fontSize: 30, letterSpacing: '0.2em', color: '#fff', opacity: lerp(f, [at + 14, at + 22], [0, 1]) }}>NO REPLY</div>
    </div>
  );
};

const Middle: React.FC<{ gap: number }> = ({ gap }) => {
  const f = useCurrentFrame();
  const a = L(6), b = L(7);
  const lines: [string, number, string][] = [['NOT SUPPLY.', W('supply', 0, 7), '#fff'], ['NOT DEMAND.', W('demand', 0, 7), '#fff'], ['THE CONNECTION.', W('connection'), C.harvest]];
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: HALF - gap, height: gap * 2, display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
      <div style={{ textAlign: 'center' }}>
        {f < b && <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 64, lineHeight: 1.05, color: '#fff', letterSpacing: '-0.02em', opacity: Math.min(lerp(f, [a - 2, a + 6], [0, 1]), lerp(f, [b - 5, b], [1, 0])) }}>THEY NEVER FOUND<br />EACH OTHER</div>}
        {f >= b && lines.map(([t, at, col]) => (
          <div key={t} style={{ fontFamily: F.display, fontWeight: 800, fontSize: 76, lineHeight: 1.08, color: col, letterSpacing: '-0.02em', opacity: lerp(f, [at - 3, at + 5], [0.15, 1]) }}>{t}</div>
        ))}
      </div>
    </div>
  );
};

/** Gold line joining her (top) and him (bottom) through the seam. */
const Join: React.FC = () => {
  const f = useCurrentFrame();
  const at = L(8);
  const g = lerp(f, [at, at + 18], [0, 1], E.inOut);
  if (g <= 0) return null;
  const y0 = 600, y1 = 1320;
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
      <line x1={540} y1={y0} x2={540} y2={y0 + (y1 - y0) * g} stroke={C.harvest} strokeWidth={10} strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 12px rgba(232,176,75,0.9))' }} />
      <circle cx={540} cy={y0} r={22} fill={C.harvest} stroke="#fff" strokeWidth={5} />
      <circle cx={540} cy={y1} r={22 * lerp(f, [at + 16, at + 22], [0, 1], E.back)} fill={C.harvest} stroke="#fff" strokeWidth={5} />
    </svg>
  );
};

export const V14: React.FC = () => {
  const f = useCurrentFrame();
  // focus: 1 = this half is the one being talked about
  const topFocus = f < L(1) ? 1 : f < L(2) ? 1 : f < L(3) ? 0.25 : 1;
  const botFocus = f < L(1) ? 1 : f < L(2) ? 0.25 : 1;
  const tf = lerp(f, [L(2) - 4, L(2) + 6], [1, topFocus]);
  const bf = f < L(2) ? lerp(f, [L(1) - 4, L(1) + 6], [1, 0.25]) : lerp(f, [L(2) - 4, L(2) + 6], [0.25, botFocus]);
  const gap = lerp(f, [L(6), L(6) + 18], [0, 260], E.inOut) * lerp(f, [L(8), L(8) + 16], [1, 0], E.inOut);
  return (
    <Shell8 d={D} bg={NAVY} plate>
      <Half shots={TOP} top focus={f >= L(3) ? 1 : tf} gap={gap} />
      <Half shots={BOT} top={false} focus={f >= L(3) ? 1 : bf} gap={gap} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: HALF - 3, height: 6, background: C.harvest, opacity: gap > 2 ? 0 : 0.9 }} />
      <Label top gap={gap} place="PUNJAB" who="Pellet maker" />
      <Label top={false} gap={gap} place="HARYANA" who="Factory manager" />
      <Pin text="WAREHOUSE FULL · NO BUYER" at={W('warehouse')} out={L(3)} top gap={gap} y={600} red />
      <Pin text="FUEL BY FRIDAY · NO SUPPLIER" at={W('Friday')} out={L(3)} top={false} gap={gap} y={290} red />
      <Pin text="CALLS 3 TRADERS" at={W('calls')} out={L(4)} top gap={gap} y={640} />
      <Pin text="OLD WHATSAPP GROUPS" at={W('checks')} out={L(4)} top={false} gap={gap} y={290} />
      {f >= L(4) && f < L(5) + 4 && <AbsoluteFill style={{ opacity: lerp(f, [L(5), L(5) + 4], [1, 0]) }}><Quotes gap={gap} /><NoReply gap={gap} /></AbsoluteFill>}
      <Pin text="STOCK STILL WAITING" at={W('waiting')} out={L(6)} top gap={gap} y={620} />
      <Pin text="BOILER RUNS SHORT" at={W('boiler')} out={L(6)} top={false} gap={gap} y={290} red />
      {f >= L(6) && <Middle gap={gap} />}
      {f >= L(8) && <Join />}
      {f >= L(8) && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: HALF - 70, display: 'flex', justifyContent: 'center' }}>
          <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 46, color: C.ink, background: C.harvest, borderRadius: 20, padding: '16px 34px', opacity: lerp(f, [L(8) + 12, L(8) + 20], [0, 1]), display: 'flex', alignItems: 'center', gap: 16 }}>
            <Icon name="check" size={44} color={C.ink} sw={14} />INDIABIOMASS IS BUILDING IT
          </div>
        </div>
      )}
    </Shell8>
  );
};
export const V14_FRAMES = totalFrames(D);
