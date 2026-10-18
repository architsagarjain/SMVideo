import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { totalFrames, Shell8, timing, R8Data, Span, Media, Shade, Headline, Chip } from './common8';
import { Logo } from '../components/Logo';
import { lerp, E } from '../lib';
import { C, F } from '../theme';
import data from '../data/r8/v1.json';

// Video 1 · One bale's journey (story). Look: full-bleed documentary stills/footage, a gold route bar on top.
const D = data as unknown as R8Data;
const { L, W, END } = timing(D);
const T = {
  baler: L(1), depot: L(2), truck: L(3), plant: W('shredded'), tested: L(4), power: W('loaded'),
  chain: L(5), farmer: W('farmer'), baler2: W('baler', 0, 5), agg: W('aggregator', 0, 5), maker: W('maker'), buyer: W('buyer', 0, 5),
  link: L(6), brand: L(7), name: W('indiabiomass'),
};
const STOPS = [['BALER', T.baler], ['DEPOT', T.depot], ['TRUCK', T.truck], ['PELLET PLANT', T.plant], ['POWER PLANT', T.power]] as const;

const Route: React.FC = () => {
  const f = useCurrentFrame();
  const a = lerp(f, [T.baler - 6, T.baler + 8], [0, 1], E.out) * lerp(f, [T.chain - 8, T.chain], [1, 0]);
  const X0 = 120, X1 = 960, step = (X1 - X0) / 4;
  const reached = STOPS.filter(([, t]) => f >= t).length;
  const prog = reached === 0 ? 0 : (reached - 1 + lerp(f, [STOPS[Math.min(reached, 4)][1] - 12, STOPS[Math.min(reached, 4)][1]], [0, reached < 5 ? 1 : 0])) / 4;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 160, height: 140, opacity: a }}>
      <div style={{ position: 'absolute', left: X0, width: X1 - X0, top: 28, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.22)' }} />
      <div style={{ position: 'absolute', left: X0, width: (X1 - X0) * Math.min(1, prog), top: 28, height: 6, borderRadius: 3, background: C.harvest, boxShadow: '0 0 14px rgba(232,176,75,0.7)' }} />
      {STOPS.map(([name, t], i) => {
        const on = lerp(f, [t - 2, t + 8], [0, 1], E.back);
        const cur = f >= t && (i === 4 || f < STOPS[i + 1][1]);
        return (
          <div key={name} style={{ position: 'absolute', left: X0 + i * step - 90, width: 180, top: 0, textAlign: 'center' }}>
            <div style={{ margin: '0 auto', width: 62, height: 62, borderRadius: 31, background: on > 0.5 ? C.harvest : 'rgba(10,25,18,0.85)', border: `3px solid ${on > 0.5 ? C.harvest : 'rgba(255,255,255,0.4)'}`,
              transform: `scale(${0.8 + 0.2 * Math.min(1, on) + (cur ? 0.08 : 0)})`, display: 'grid', placeItems: 'center', fontFamily: F.display, fontWeight: 800, fontSize: 26, color: on > 0.5 ? C.ink : '#fff', boxShadow: cur ? '0 0 26px rgba(232,176,75,0.8)' : undefined }}>{i + 1}</div>
            <div style={{ marginTop: 10, fontFamily: F.label, fontWeight: 600, fontSize: 21, letterSpacing: '0.1em', color: on > 0.5 ? '#fff' : 'rgba(255,255,255,0.55)', textShadow: '0 2px 10px rgba(0,0,0,0.7)' }}>{name}</div>
          </div>
        );
      })}
    </div>
  );
};

const Spec: React.FC = () => {
  const f = useCurrentFrame();
  const items = [['HEAT VALUE', W('heat')], ['MOISTURE', W('moisture')], ['ASH', W('ash')]] as const;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 820, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
      {items.map(([k, t]) => {
        const s = lerp(f, [t - 3, t + 9], [0, 1], E.back);
        return (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 18, opacity: Math.min(1, s), transform: `scale(${0.8 + 0.2 * s})`, background: 'rgba(5,26,17,0.86)', border: `2px solid ${C.harvest}`, borderRadius: 999, padding: '16px 34px' }}>
            <span style={{ width: 38, height: 38, borderRadius: 19, background: C.harvest, display: 'grid', placeItems: 'center', fontSize: 24, color: C.ink, fontWeight: 800 }}>✓</span>
            <span style={{ fontFamily: F.display, fontWeight: 800, fontSize: 46, color: '#fff', letterSpacing: '-0.01em' }}>{k}</span>
          </div>
        );
      })}
    </div>
  );
};

const ROLES = [['Farmer', T.farmer], ['Baler', T.baler2], ['Aggregator', T.agg], ['Pellet maker', T.maker], ['Buyer', T.buyer]] as const;
const Chain: React.FC = () => {
  const f = useCurrentFrame();
  const Y0 = 520, H = 138, G = 30;
  return (
    <AbsoluteFill>
      <Headline text={'ONE BALE.\nFIVE BUSINESSES.'} at={T.chain} out={T.brand - 6} top={250} size={84} />
      {ROLES.map(([name, t], i) => {
        const s = lerp(f, [T.chain + 4 + i * 4, T.chain + 16 + i * 4], [0, 1], E.out);
        const lit = lerp(f, [t - 3, t + 8], [0, 1], E.out);
        const lk = lerp(f, [T.link + i * 7, T.link + i * 7 + 10], [0, 1]);
        const y = Y0 + i * (H + G);
        return (
          <React.Fragment key={name}>
            {i > 0 && (
              <div style={{ position: 'absolute', left: 540 - 3, top: y - G, width: 6, height: G, background: lk > 0 ? `rgba(232,176,75,${0.3 + 0.7 * lk})` : 'rgba(255,255,255,0.18)', boxShadow: lk > 0.5 ? '0 0 16px rgba(232,176,75,0.9)' : undefined, opacity: s }} />
            )}
            <div style={{ position: 'absolute', left: 170, width: 740, top: y, height: H, borderRadius: 28, background: `rgba(5,26,17,${0.75 + 0.15 * lit})`, border: `2px solid rgba(232,176,75,${0.25 + 0.4 * lit + 0.35 * lk})`,
              display: 'flex', alignItems: 'center', gap: 28, padding: '0 38px', transform: `translateX(${(1 - s) * (i % 2 ? 60 : -60)}px) scale(${1 + 0.04 * lit})`, opacity: s }}>
              <span style={{ width: 76, height: 76, borderRadius: 20, background: lit > 0.5 ? C.harvest : 'rgba(232,176,75,0.25)', color: C.ink, display: 'grid', placeItems: 'center', fontFamily: F.display, fontWeight: 800, fontSize: 36 }}>{i + 1}</span>
              <span style={{ fontFamily: F.display, fontWeight: 800, fontSize: 56, color: `rgba(255,255,255,${0.4 + 0.6 * lit})`, letterSpacing: '-0.02em' }}>{name}</span>
            </div>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

export const V1: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Shell8 d={D}>
      <Span from={0} to={T.baler}><Media src="V1_1.jpg" from={0} to={T.baler} a={[1.25, 0, 30]} b={[1.05, 0, 0]} grade="golden" /><Shade /></Span>
      <Span from={T.baler} to={T.depot}><Media src="V1_2r.mp4" from={T.baler} to={T.depot} a={[1.05, 0, 0]} b={[1.12, 0, 0]} grade="golden" /><Shade /></Span>
      <Span from={T.depot} to={T.truck}><Media src="V1_3.jpg" from={T.depot} to={T.truck} a={[1.12, 0, 0]} b={[1.3, 0, -40]} /><Shade /></Span>
      <Span from={T.truck} to={T.plant}><Media src="V1_4.jpg" from={T.truck} to={T.plant} a={[1.35, 0, 0]} b={[1.15, 0, 20]} /><Shade /></Span>
      <Span from={T.plant} to={T.power}><Media src="V1_5.jpg" from={T.plant} to={T.power} a={[1.1, 0, 0]} b={[1.3, 0, 0]} grade="industrial" /><Shade mid={0.35} /></Span>
      <Span from={T.power} to={T.chain}><Media src="V1_6.jpg" from={T.power} to={T.chain} a={[1.15, -60, 0]} b={[1.3, 40, 0]} grade="neutral" /><Shade /></Span>
      <Span from={T.chain} to={END}><AbsoluteFill style={{ background: `radial-gradient(ellipse 100% 70% at 50% 45%, #0A4A31 0%, ${C.forest} 40%, #03180F 100%)` }} /></Span>

      <Headline text={'WHERE DOES\nTHIS BALE GO?'} at={6} out={T.baler - 8} top={300} size={100} />
      <Chip text="PADDY STRAW · PUNJAB" at={W('punjab')} out={T.baler - 8} top={600} />
      <Route />
      <Span from={T.tested} to={T.power} fade={6}><Spec /></Span>
      <Span from={T.chain} to={T.brand} fade={6}><Chain /></Span>
      <Span from={T.brand} to={END} fade={6}>
        <Headline text={'THE CHAIN WE\'RE\nCONNECTING'} at={T.brand} top={420} size={84} color={C.harvest} />
      </Span>
    </Shell8>
  );
};
export const V1_FRAMES = totalFrames(D);
