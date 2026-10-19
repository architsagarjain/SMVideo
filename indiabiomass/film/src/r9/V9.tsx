import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { totalFrames, Shell8, timing, R8Data, Span, Media, Headline } from '../r8/common8';
import { r9, BrandBeat, Pellets, Tag } from './common9';
import { lerp, E } from '../lib';
import { C, F } from '../theme';
import data from '../data/r9/v9.json';

// Video 9 · Straw to pellet in six steps. Look: a factory line. Full-bleed machine footage per stage, a giant
// step number slams in, and a steel conveyor along the bottom carries the material from station 1 to 6.
const D = data as unknown as R8Data;
const { L, W, FIN } = timing(D);
const STEEL = '#10171A';
const STEPS = [
  { k: 'CLEANING', note: 'Stones and metal out', src: 'V9_2.mp4', at: L(1) },
  { k: 'DRYING', note: 'Low moisture, so it holds together', src: 'V9_3.jpg', at: L(2) },
  { k: 'GRINDING', note: 'Hammer mill: straw to powder', src: 'V9_4.mp4', at: L(3) },
  { k: 'PRESSING', note: 'Rollers push it through a steel die', src: 'V9_5.jpg', at: L(4) },
  { k: 'COOLING', note: 'Hot and soft turns hard', src: 'V9_6.mp4', at: L(5) },
  { k: 'BAGGING', note: 'Screened, bagged, ready for the buyer', src: 'V9_7.mp4', at: L(6) },
];
const BELT_Y = 1200;

/** Steel conveyor strip: rollers scroll, six stations, the current one lit. */
const Conveyor: React.FC<{ y?: number; big?: boolean; litAll?: number }> = ({ y = BELT_Y, big, litAll }) => {
  const f = useCurrentFrame();
  const cur = STEPS.reduce((a, s, i) => (f >= s.at ? i : a), -1);
  const x0 = 110, x1 = 970, gap = (x1 - x0) / 5;
  const tokenX = cur < 0 ? x0 - 60 : x0 + gap * (cur - 1 + lerp(f, [STEPS[cur].at, STEPS[cur].at + 18], [0, 1], E.inOut));
  const sz = big ? 92 : 64;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: y, height: 170 }}>
      <div style={{ position: 'absolute', left: 50, right: 50, top: 70, height: 26, borderRadius: 13, background: 'linear-gradient(180deg,#59656B,#2A3236)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(90deg, rgba(0,0,0,0.45) 0 6px, transparent 6px 40px)', backgroundPositionX: -f * 4 }} />
      </div>
      {STEPS.map((s, i) => {
        const lit = litAll !== undefined ? f >= litAll + i * 5 : i === cur;
        const done = litAll === undefined && i < cur;
        return (
          <div key={s.k} style={{ position: 'absolute', left: x0 + gap * i - sz / 2, top: 83 - sz / 2, width: sz, height: sz, borderRadius: '50%', display: 'grid', placeItems: 'center',
            background: lit ? C.harvest : done ? '#3B4A3F' : '#1B2326', border: `3px solid ${lit || done ? C.harvest : '#4A565B'}`, boxShadow: lit ? '0 0 30px rgba(232,176,75,0.7)' : 'none',
            fontFamily: F.display, fontWeight: 800, fontSize: big ? 44 : 30, color: lit ? C.ink : '#CFD6D2' }}>{i + 1}</div>
        );
      })}
      {litAll === undefined && cur >= 0 && (
        <div style={{ position: 'absolute', left: tokenX + gap / 2 - 22, top: 26, width: 44, height: 30, borderRadius: 8, background: cur < 3 ? '#C9A86A' : '#8A5A2B', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }} />
      )}
    </div>
  );
};

const Step: React.FC<{ i: number; to: number }> = ({ i, to }) => {
  const f = useCurrentFrame();
  const s = STEPS[i];
  const slam = lerp(f, [s.at, s.at + 7], [0, 1], E.out);
  const shake = f < s.at + 10 ? Math.sin((f - s.at) * 2.6) * 10 * (1 - lerp(f, [s.at, s.at + 10], [0, 1])) : 0;
  const t = lerp(f, [s.at + 4, s.at + 16], [0, 1], E.out);
  const still = s.src.endsWith('.jpg');
  return (
    <AbsoluteFill>
      <Media src={r9(s.src)} from={s.at} to={to} a={still ? [1.22, -30, 0] : [1.25, 0, 0]} b={still ? [1.08, 30, 0] : [1.08, 0, 0]} grade={i === 4 ? 'golden' : 'industrial'} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(10,16,18,0.94) 0%, rgba(10,16,18,0.72) 30%, rgba(10,16,18,0.2) 48%, rgba(10,16,18,0.9) 78%, rgba(10,16,18,0.96) 100%)' }} />
      <div style={{ position: 'absolute', left: 70, top: 140, transform: `translateX(${shake}px) scale(${2.2 - 1.2 * slam})`, transformOrigin: '0% 50%', opacity: Math.min(1, slam * 1.5),
        fontFamily: F.display, fontWeight: 800, fontSize: 300, lineHeight: 1, color: C.harvest, letterSpacing: '-0.05em', textShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>0{i + 1}</div>
      <div style={{ position: 'absolute', left: 80, top: 450, opacity: t, transform: `translateY(${(1 - t) * 30}px)` }}>
        <div style={{ fontFamily: F.label, fontWeight: 600, fontSize: 28, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.75)' }}>STEP {i + 1} OF 6</div>
        <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 112, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.0, marginTop: 6 }}>{s.k}</div>
        <div style={{ fontFamily: F.text, fontWeight: 600, fontSize: 38, color: C.harvest, marginTop: 12, opacity: lerp(f, [s.at + 12, s.at + 22], [0, 1]) }}>{s.note}</div>
      </div>
      {i === 1 && <Meter at={s.at + 14} label="MOISTURE" from={0.85} to={0.25} />}
      {i === 4 && <Meter at={s.at + 14} label="TEMPERATURE" from={0.9} to={0.3} hot />}
      {i === 0 && <Tag text="STONES ✕   METAL ✕" at={W('Stones') } x={540} y={1060} align="center" />}
      {i === 3 && <Tag text="HEAT + PRESSURE = BIND" at={W('Heat')} x={540} y={1060} align="center" />}
    </AbsoluteFill>
  );
};

/** A vertical gauge on the right that falls (drying, cooling). No numbers, only direction. */
const Meter: React.FC<{ at: number; label: string; from: number; to: number; hot?: boolean }> = ({ at, label, from, to, hot }) => {
  const f = useCurrentFrame();
  const v = lerp(f, [at, at + 40], [from, to], E.inOut);
  const t = lerp(f, [at - 6, at + 6], [0, 1]);
  const col = hot ? `rgb(${Math.round(120 + 135 * v)}, ${Math.round(170 - 60 * v)}, ${Math.round(220 - 170 * v)})` : '#6FB6E8';
  return (
    <div style={{ position: 'absolute', right: 90, top: 640, width: 70, height: 420, opacity: t }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: 35, border: '3px solid rgba(255,255,255,0.8)', background: 'rgba(0,0,0,0.45)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: `${v * 100}%`, background: col }} />
      </div>
      <div style={{ position: 'absolute', top: 440, left: -60, width: 190, textAlign: 'center', fontFamily: F.label, fontWeight: 600, fontSize: 22, letterSpacing: '0.18em', color: '#fff' }}>{label}</div>
      <div style={{ position: 'absolute', top: 160, left: -70, fontFamily: F.display, fontSize: 60, color: '#fff', opacity: lerp(f, [at + 20, at + 30], [0, 1]) }}>↓</div>
    </div>
  );
};

const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const hard = W('Hard');
  const wipe = lerp(f, [hard - 4, hard + 10], [0, 1], E.inOut);
  return (
    <AbsoluteFill style={{ background: STEEL }}>
      <Media src={r9('V9_1.jpg')} from={0} to={L(1)} a={[1.25, 0, 40]} b={[1.08, 0, 0]} grade="golden" />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(10,16,18,0.85) 0%, rgba(10,16,18,0.2) 40%, rgba(10,16,18,0.85) 100%)' }} />
      <AbsoluteFill style={{ clipPath: `inset(0 0 0 ${(1 - wipe) * 100}%)`, background: `radial-gradient(ellipse 80% 50% at 50% 60%, #2C3A35 0%, ${STEEL} 70%)` }}>
        <Pellets at={hard} n={90} y={1080} w={760} />
      </AbsoluteFill>
      {wipe > 0 && wipe < 1 && <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${(1 - wipe) * 100}%`, width: 8, background: C.harvest, boxShadow: '0 0 30px rgba(232,176,75,0.9)' }} />}
      <Headline text={'LOOSE STRAW IN.'} at={4} out={hard - 6} top={250} size={88} />
      <Headline text={'HARD PELLETS OUT.'} at={hard} out={W('Here') - 4} top={250} size={88} color={C.harvest} />
      <Headline text={'6 STEPS\nIN BETWEEN'} at={W('Here')} top={250} size={120} />
    </AbsoluteFill>
  );
};

const Finale: React.FC = () => {
  const f = useCurrentFrame();
  const t0 = L(7);
  return (
    <AbsoluteFill style={{ background: STEEL }}>
      <Media src={r9('V9_8.mp4')} from={t0} to={L(8)} a={[1.2, 0, 0]} b={[1.05, 0, 0]} grade="golden" />
      <AbsoluteFill style={{ background: 'rgba(10,16,18,0.7)' }} />
      <Conveyor y={620} big litAll={t0 + 2} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 880, textAlign: 'center', fontFamily: F.display, fontWeight: 800, fontSize: 130, letterSpacing: '-0.03em', lineHeight: 1 }}>
        <span style={{ color: 'rgba(255,255,255,0.85)', opacity: lerp(f, [W('waste'), W('waste') + 8], [0, 1]) }}>WASTE </span>
        <span style={{ color: C.harvest, opacity: lerp(f, [W('fuel') - 6, W('fuel') + 4], [0, 1]) }}>→ FUEL</span>
      </div>
      <Headline text={'SIX STEPS'} at={t0} top={300} size={96} />
    </AbsoluteFill>
  );
};

export const V9: React.FC = () => (
  <Shell8 d={D} bg={STEEL}>
    <Span from={0} to={L(1)} fade={4}><Hook /></Span>
    {STEPS.map((s, i) => {
      const to = i < 5 ? STEPS[i + 1].at : L(7);
      return <Span key={s.k} from={s.at} to={to} fade={3}><Step i={i} to={to} /></Span>;
    })}
    <Span from={L(1)} to={L(7)} fade={4}><Conveyor /></Span>
    <Span from={L(7)} to={L(8)} fade={5}><Finale /></Span>
    <Span from={L(8)} to={FIN + 2} fade={6}><BrandBeat at={L(8)} chips={['PELLET MAKERS', 'MACHINERY SUPPLIERS', 'BUYERS']} text={'INDIABIOMASS IS\nBRINGING THEM TOGETHER'} /></Span>
  </Shell8>
);
export const V9_FRAMES = totalFrames(D);
