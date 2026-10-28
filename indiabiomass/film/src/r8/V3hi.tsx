// Video 3 Hinglish: generated from V3.tsx (same picture, timed to the Hinglish voiceover, English subtitles).
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { totalFrames, Shell8, timing, R8Data, Span, Media, Headline, Chip, Frame } from './common8';
import { Logo } from '../components/Logo';
import { lerp, E } from '../lib';
import { C, F } from '../theme';
import data from '../data/r8/v3hi.json';

// Video 3 · Pellet or briquette? (this or that). Look: the frame is split vertically, a VS chip on the seam,
// the side being talked about widens; a scoreboard fills row by row.
const D = data as unknown as R8Data;
const { L, W, END } = timing(D);
const T = { pel: L(1), bri: L(2), cost: L(3), simple: L(4), q: L(5), dep: L(6), brand: L(7), kilns: W('kilns'), boilers: W('boilers') };
const ROWS = [
  { k: 'SIZE', a: 'Pencil stub', b: 'Short log', at: W('pencil') },
  { k: 'BEST FOR', a: 'Power plants, auto-feed', b: 'Boilers, kilns, factories', at: W('popular') },
  { k: 'RAW MATERIAL', a: 'Finer and drier', b: 'Less processing', at: W('finer') },
  { k: 'SETUP', a: 'Costs more', b: 'Simpler machines', at: W('machines') },
];

const Split: React.FC = () => {
  const f = useCurrentFrame();
  // share of the width for the pellet side
  const w = lerp(f, [T.pel - 10, T.pel + 10, T.bri - 10, T.bri + 10, T.cost - 10, T.cost + 10, T.simple - 10, T.simple + 10, T.q - 10, T.q], [0.5, 0.64, 0.64, 0.36, 0.36, 0.64, 0.64, 0.36, 0.36, 0.5], E.inOut);
  const X = 1080 * w;
  const leftSrc = f < T.cost ? 'V3_1.jpg' : 'V3_1.jpg';
  const rightSrc = f < T.simple ? 'V3_2.jpg' : 'V3_5.jpg';
  const label = (txt: string, x0: number, x1: number, on: number) => (
    <div style={{ position: 'absolute', left: x0, width: x1 - x0, top: 190, textAlign: 'center', fontFamily: F.display, fontWeight: 800, fontSize: 70 + 18 * on, letterSpacing: '-0.02em', color: on > 0.5 ? C.harvest : '#fff', textShadow: '0 4px 24px rgba(0,0,0,0.7)' }}>{txt}</div>
  );
  const pOn = lerp(w, [0.5, 0.64], [0, 1]), bOn = lerp(w, [0.36, 0.5], [1, 0]);
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 0, top: 0, width: X, height: 1920, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: X / 2 - 540, width: 1080, height: 1920 }}>
          <Media src={leftSrc} from={0} to={T.q} a={[1.35, 0, 0]} b={[1.15, 0, 0]} grade="golden" />
        </div>
        <AbsoluteFill style={{ background: `rgba(4,20,12,${0.45 - 0.2 * pOn})` }} />
      </div>
      <div style={{ position: 'absolute', left: X, top: 0, width: 1080 - X, height: 1920, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: (1080 - X) / 2 - 540, width: 1080, height: 1920 }}>
          <Media src={rightSrc} from={f < T.simple ? 0 : T.simple} to={f < T.simple ? T.simple : T.q} a={[1.3, 0, 0]} b={[1.12, 0, 0]} grade="warm" />
        </div>
        <AbsoluteFill style={{ background: `rgba(4,20,12,${0.45 - 0.2 * bOn})` }} />
      </div>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(4,20,12,0.7) 0%, rgba(4,20,12,0) 22%, rgba(4,20,12,0) 50%, rgba(4,20,12,0.85) 72%)' }} />
      <div style={{ position: 'absolute', left: X - 2, top: 0, width: 4, height: 1920, background: C.harvest, boxShadow: '0 0 20px rgba(232,176,75,0.8)' }} />
      <div style={{ position: 'absolute', left: X - 56, top: 640, width: 112, height: 112, borderRadius: 56, background: C.harvest, display: 'grid', placeItems: 'center', fontFamily: F.display, fontWeight: 800, fontSize: 44, color: C.ink, boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>VS</div>
      {label('PELLET', 0, X, pOn)}
      {label('BRIQUETTE', X, 1080, bOn)}
    </AbsoluteFill>
  );
};

const Board: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: 60, right: 60, top: 1000, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {ROWS.map((r) => {
        const t = lerp(f, [r.at - 4, r.at + 10], [0, 1], E.out);
        return (
          <div key={r.k} style={{ display: 'grid', gridTemplateColumns: '1fr 170px 1fr', alignItems: 'center', gap: 10, background: 'rgba(5,26,17,0.88)', border: '1.5px solid rgba(232,176,75,0.35)', borderRadius: 18, padding: '14px 18px', opacity: t, transform: `translateY(${(1 - t) * 24}px)` }}>
            <span style={{ fontFamily: F.text, fontWeight: 600, fontSize: 35, color: '#fff', textAlign: 'right' }}>{r.a}</span>
            <span style={{ fontFamily: F.label, fontWeight: 600, fontSize: 19, letterSpacing: '0.14em', color: C.harvest, textAlign: 'center' }}>{r.k}</span>
            <span style={{ fontFamily: F.text, fontWeight: 600, fontSize: 35, color: '#fff' }}>{r.b}</span>
          </div>
        );
      })}
    </div>
  );
};

const Question: React.FC = () => {
  const f = useCurrentFrame();
  const chips = [['YOUR RAW MATERIAL', W('raw', 0, 6)], ['BUYERS NEAR YOU', W('buying')]] as const;
  // the two products side by side; they shrink back once "it depends" starts so the answer has room
  const card = (src: string, label: string, x: number, k: number) => {
    const t = lerp(f, [T.q + 4 + k * 5, T.q + 18 + k * 5], [0, 1], E.out);
    return (
      <div style={{ position: 'absolute', left: x, top: 560, width: 420, height: 420, opacity: t, transform: `translateY(${(1 - t) * 50}px)` }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: 28, overflow: 'hidden', border: '3px solid rgba(232,176,75,0.6)', boxShadow: '0 30px 70px rgba(0,0,0,0.5)' }}>
          <Media src={src} from={T.q} to={T.brand} a={[1.25, 0, 0]} b={[1.08, 0, 0]} grade="golden" />
          <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(3,24,15,0) 55%, rgba(3,24,15,0.85) 100%)' }} />
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 22, textAlign: 'center', fontFamily: F.display, fontWeight: 800, fontSize: 46, color: '#fff', letterSpacing: '-0.01em' }}>{label}</div>
      </div>
    );
  };
  const shrink = lerp(f, [T.dep - 6, T.dep + 12], [0, 1], E.inOut);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 100% 70% at 50% 40%, #0A4A31 0%, ${C.forest} 45%, #03180F 100%)` }}>
      <Headline text={'WHICH ONE\nSHOULD YOU MAKE?'} at={T.q} top={250} size={92} />
      <AbsoluteFill style={{ transform: `translateY(${-40 * shrink}px) scale(${1 - 0.2 * shrink})`, transformOrigin: '50% 560px' }}>
        {card('V3_1.jpg', 'PELLET', 90, 0)}
        {card('V3_2.jpg', 'BRIQUETTE', 570, 1)}
        <div style={{ position: 'absolute', left: 540 - 56, top: 714, width: 112, height: 112, borderRadius: 56, background: C.harvest, display: 'grid', placeItems: 'center', fontFamily: F.display, fontWeight: 800, fontSize: 64, color: C.ink, boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          transform: `scale(${lerp(f, [T.q + 14, T.q + 24], [0, 1], E.back)})` }}>?</div>
      </AbsoluteFill>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 960, textAlign: 'center', fontFamily: F.label, fontWeight: 600, fontSize: 30, letterSpacing: '0.2em', color: C.harvest, opacity: lerp(f, [T.dep, T.dep + 10], [0, 1]) }}>IT DEPENDS ON</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1020, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
        {chips.map(([txt, at]) => {
          const t = lerp(f, [at - 3, at + 10], [0, 1], E.back);
          return <div key={txt} style={{ opacity: Math.min(1, t), transform: `scale(${0.8 + 0.2 * t})`, fontFamily: F.display, fontWeight: 800, fontSize: 52, color: C.ink, background: C.harvest, borderRadius: 999, padding: '18px 44px' }}>{txt}</div>;
        })}
      </div>
    </AbsoluteFill>
  );
};

/** Closing line: the three groups as photo cards that link up to one point. */
const Together: React.FC = () => {
  const f = useCurrentFrame();
  const roles = [
    { k: 'PELLET\nMAKERS', src: 'V3_1.jpg', at: T.brand },
    { k: 'BRIQUETTE\nMAKERS', src: 'V3_5.jpg', at: W('briquette', 0, 7) },
    { k: 'THE\nBUYERS', src: 'V3_4.mp4', at: W('buyers', 0, 7) },
  ];
  const join = lerp(f, [W('IndiaBiomass', 0, 7) - 6, W('IndiaBiomass', 0, 7) + 12], [0, 1], E.inOut);
  const xs = [60, 390, 720], top = 560, w = 300, h = 430, hub = 1130;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 100% 70% at 50% 45%, #0A4A31 0%, ${C.forest} 40%, #03180F 100%)` }}>
      <Headline text={'ONE PLACE\nFOR ALL OF THEM'} at={T.brand + 2} top={250} size={84} />
      {roles.map((r, i) => {
        const t = lerp(f, [r.at - 3, r.at + 11], [0, 1], E.back);
        return (
          <div key={r.k} style={{ position: 'absolute', left: xs[i], top, width: w, height: h, borderRadius: 26, overflow: 'hidden', border: `3px solid ${C.harvest}`, boxShadow: '0 30px 70px rgba(0,0,0,0.5)', opacity: Math.min(1, t), transform: `translateY(${(1 - Math.min(1, t)) * 60}px) scale(${0.9 + 0.1 * t})` }}>
            <Media src={r.src} from={r.at} to={END} a={[1.3, 0, 0]} b={[1.1, 0, 0]} grade="golden" />
            <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(3,24,15,0) 45%, rgba(3,24,15,0.9) 100%)' }} />
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 24, textAlign: 'center', fontFamily: F.display, fontWeight: 800, fontSize: 40, lineHeight: 1.02, color: '#fff', whiteSpace: 'pre-line' }}>{r.k}</div>
          </div>
        );
      })}
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        {xs.map((x, i) => {
          const x0 = x + w / 2, y0 = top + h, x1 = 540, y1 = hub;
          return <line key={i} x1={x0} y1={y0} x2={x0 + (x1 - x0) * join} y2={y0 + (y1 - y0) * join} stroke={C.harvest} strokeWidth={6} strokeLinecap="round" opacity={join > 0 ? 1 : 0} />;
        })}
        <circle cx={540} cy={hub} r={20 * lerp(f, [W('IndiaBiomass', 0, 7) + 10, W('IndiaBiomass', 0, 7) + 16], [0, 1], E.back)} fill={C.harvest} stroke="#fff" strokeWidth={4} />
      </svg>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1190, textAlign: 'center', fontFamily: F.display, fontWeight: 800, fontSize: 54, color: C.harvest, letterSpacing: '-0.01em', opacity: lerp(f, [W('together', 0, 7) - 6, W('together', 0, 7) + 4], [0, 1]) }}>BRINGING THEM TOGETHER</div>
    </AbsoluteFill>
  );
};

export const V3hi: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Shell8 d={D}>
      <Span from={0} to={T.q}><Split /></Span>
      <Headline text={'PELLET\nOR BRIQUETTE?'} at={6} out={T.pel - 8} top={860} size={96} />
      <Span from={T.pel} to={T.q} fade={6}><Board /></Span>
      <Span from={T.boilers - 4} to={T.cost} fade={6}>
        <Frame src="V3_4.mp4" from={T.boilers - 4} to={T.cost} x={600} y={330} w={400} h={260} at={T.boilers - 4} />
        <Frame src="V3_3.jpg" from={T.kilns - 4} to={T.cost} x={600} y={620} w={400} h={260} at={T.kilns - 4} />
      </Span>
      <Span from={T.q} to={T.brand}><Question /></Span>
      <Span from={T.brand} to={END}><Together /></Span>
    </Shell8>
  );
};
export const V3hi_FRAMES = totalFrames(D);
