import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { totalFrames, Shell8, timing, R8Data, Span, Media, Headline, Chip, Frame } from './common8';
import { Logo } from '../components/Logo';
import { lerp, E } from '../lib';
import { C, F } from '../theme';
import data from '../data/r8/v3.json';

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
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 100% 70% at 50% 40%, #0A4A31 0%, ${C.forest} 45%, #03180F 100%)` }}>
      <Headline text={'WHICH ONE\nSHOULD YOU MAKE?'} at={T.q} top={420} size={92} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 720, textAlign: 'center', fontFamily: F.label, fontWeight: 600, fontSize: 28, letterSpacing: '0.2em', color: C.harvest, opacity: lerp(f, [T.dep, T.dep + 10], [0, 1]) }}>IT DEPENDS ON</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 800, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26 }}>
        {chips.map(([txt, at]) => {
          const t = lerp(f, [at - 3, at + 10], [0, 1], E.back);
          return <div key={txt} style={{ opacity: Math.min(1, t), transform: `scale(${0.8 + 0.2 * t})`, fontFamily: F.display, fontWeight: 800, fontSize: 52, color: C.ink, background: C.harvest, borderRadius: 999, padding: '20px 44px' }}>{txt}</div>;
        })}
      </div>
    </AbsoluteFill>
  );
};

export const V3: React.FC = () => {
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
      <Span from={T.brand} to={END}>
        <AbsoluteFill style={{ background: `radial-gradient(ellipse 100% 70% at 50% 45%, #0A4A31 0%, ${C.forest} 40%, #03180F 100%)` }} />
        <Headline text={'PELLET MAKERS.\nBRIQUETTE MAKERS.\nTHE BUYERS FOR BOTH.'} at={T.brand + 4} top={300} size={66} />
      </Span>
    </Shell8>
  );
};
export const V3_FRAMES = totalFrames(D);
