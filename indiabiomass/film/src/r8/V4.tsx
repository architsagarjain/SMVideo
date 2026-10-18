import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { totalFrames, Shell8, timing, R8Data, Span, Media, Shade, Headline, Chip } from './common8';
import { MapCanvas, Cam } from '../components/MapCanvas';
import { nodes, edges, cities } from '../components/graph';
import { lerp, E } from '../lib';
import { C, F } from '../theme';
import data from '../data/r8/v4.json';

// Video 4 · Biomass map of India (map tour). Look: the India map fills the screen; the camera flies to each
// region and a photo card with the residue pops out below it.
const D = data as unknown as R8Data;
const { L, W, END } = timing(D);
type Reg = { name: string; sub: string; at: number; cities: string[]; color: string; photo?: string; zoom: number };
const REG: Reg[] = [
  { name: 'PADDY STRAW', sub: 'Punjab · Haryana', at: L(1), cities: ['Ludhiana', 'Amritsar', 'Bathinda', 'Karnal', 'Panipat'], color: 'rgba(232,176,75,1)', photo: 'V4_paddy.jpg', zoom: 2.4 },
  { name: 'MUSTARD HUSK', sub: 'Rajasthan', at: L(2), cities: ['Jodhpur', 'Jaipur', 'Kota'], color: 'rgba(242,210,60,1)', photo: 'V4_1.jpg', zoom: 2.0 },
  { name: 'COTTON STALKS', sub: 'Gujarat · Maharashtra', at: L(3), cities: ['Ahmedabad', 'Rajkot', 'Aurangabad', 'Nagpur'], color: 'rgba(245,242,234,1)', photo: 'V4_2.jpg', zoom: 1.8 },
  { name: 'GROUNDNUT SHELLS', sub: 'Gujarat · Maharashtra', at: W('groundnut'), cities: ['Rajkot', 'Ahmedabad', 'Surat'], color: 'rgba(214,150,90,1)', photo: 'V4_6.jpg', zoom: 1.8 },
  { name: 'BAGASSE', sub: 'Uttar Pradesh · Maharashtra', at: L(4), cities: ['Lucknow', 'Kanpur', 'Gorakhpur', 'Pune'], color: 'rgba(158,212,122,1)', photo: 'V4_3.jpg', zoom: 1.5 },
  { name: 'COCONUT SHELLS', sub: 'South India', at: L(5), cities: ['Kochi', 'Coimbatore', 'Madurai', 'Mangaluru'], color: 'rgba(217,160,102,1)', photo: 'V4_4.jpg', zoom: 2.0 },
  { name: 'RICE HUSK', sub: 'Wherever rice is milled', at: W('rice', 0, 5), cities: ['Vijayawada', 'Bhubaneswar', 'Raipur', 'Patna', 'Kolkata', 'Ludhiana'], color: 'rgba(227,194,122,1)', photo: 'V4_5.jpg', zoom: 1.15 },
];
const centroid = (cs: string[]) => cs.reduce((a, c) => [a[0] + cities[c][0] / cs.length, a[1] + cities[c][1] / cs.length], [0, 0]);
const FULL: Cam = { cx: 500, cy: 560, zoom: 0.9, tilt: 0, rot: 0, oy: -110 };
const KEYS: [number, Cam][] = [[0, FULL], ...REG.map((r): [number, Cam] => { const [x, y] = centroid(r.cities); return [r.at - 6, { cx: x, cy: y, zoom: r.zoom, tilt: 0, rot: 0, oy: -260 }]; }), [L(6) - 6, FULL]];
const camAt = (f: number): Cam => {
  let k = 0;
  while (k + 1 < KEYS.length && f >= KEYS[k + 1][0]) k++;
  const [t0, a] = KEYS[k];
  const prev = k > 0 ? KEYS[k - 1][1] : a;
  const p = lerp(f, [t0, t0 + 18], [0, 1], E.inOut);
  const mix = (u: number, v: number) => u + (v - u) * p;
  return { cx: mix(prev.cx, a.cx), cy: mix(prev.cy, a.cy), zoom: mix(prev.zoom, a.zoom), tilt: 0, rot: 0, oy: mix(prev.oy ?? 0, a.oy ?? 0) };
};

const IndiaMap: React.FC<{ net?: number }> = ({ net = 0 }) => {
  const f = useCurrentFrame();
  const cam = camAt(f);
  return (
    <MapCanvas cam={cam} draw={({ P, land, glow, line }) => {
      land('rgba(30,90,60,1)', 0.55, 'rgba(232,176,75,1)', 0.7, 2, 0.2);
      nodes.forEach((n) => { const [x, y] = P(n[0], n[1]); glow(x, y, 5 * cam.zoom, 'rgba(232,176,75,1)', 0.25); });
      if (net > 0) for (const [a, b] of edges) { const A = P(nodes[a][0], nodes[a][1]), B = P(nodes[b][0], nodes[b][1]); line([A[0], A[1]], [B[0], B[1]], 'rgba(232,176,75,1)', 0.5 * net, 1.4); }
      REG.forEach((r) => {
        const on = lerp(f, [r.at - 4, r.at + 10], [0, 1]);
        const all = lerp(f, [4, 30], [0, 1]) * (f < REG[0].at - 6 ? 1 : 0);
        const a = Math.max(on, all * 0.8);
        r.cities.forEach((c) => { const [x, y] = P(cities[c][0], cities[c][1]); glow(x, y, (14 + 8 * Math.sin(f * 0.15)) * Math.min(2, cam.zoom), r.color, a); });
      });
    }} />
  );
};

const RegionCard: React.FC<{ r: Reg; until: number }> = ({ r, until }) => {
  const f = useCurrentFrame();
  const t = lerp(f, [r.at + 2, r.at + 14], [0, 1], E.back) * lerp(f, [until - 6, until], [1, 0]);
  return (
    <div style={{ position: 'absolute', left: 150, width: 780, top: 930, opacity: Math.min(1, t), transform: `translateY(${(1 - Math.min(1, t)) * 50}px) scale(${0.9 + 0.1 * Math.min(1, t)})` }}>
      {r.photo && (
        <div style={{ borderRadius: 26, overflow: 'hidden', border: `3px solid ${r.color}`, boxShadow: '0 30px 80px rgba(0,0,0,0.55)', height: 330, position: 'relative' }}>
          <Media src={r.photo} from={r.at} to={until} a={[1.2, 0, 0]} b={[1.05, 0, 0]} />
        </div>
      )}
      <div style={{ marginTop: r.photo ? -40 : 0, display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
        <div style={{ background: 'rgba(4,20,12,0.92)', border: `2px solid ${r.color}`, borderRadius: 999, padding: '12px 30px', textAlign: 'center' }}>
          <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 50, color: '#fff', letterSpacing: '-0.01em' }}>{r.name}</div>
          <div style={{ fontFamily: F.label, fontWeight: 600, fontSize: 20, letterSpacing: '0.16em', color: r.color.replace(',1)', ',0.95)') }}>{r.sub.toUpperCase()}</div>
        </div>
      </div>
    </div>
  );
};

const Distance: React.FC = () => {
  const f = useCurrentFrame();
  const t0 = L(7);
  const d = lerp(f, [t0 + 20, t0 + 60], [0, 1], E.inOut);
  const pin = (y: number, label: string, at: number) => {
    const s = lerp(f, [at, at + 10], [0, 1], E.back);
    return (
      <div style={{ position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', opacity: Math.min(1, s), transform: `scale(${0.7 + 0.3 * s})` }}>
        <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 44, color: C.ink, background: C.harvest, borderRadius: 999, padding: '14px 34px' }}>{label}</div>
      </div>
    );
  };
  return (
    <AbsoluteFill>
      {pin(420, 'THE STRAW', W('straw', 0, 7))}
      {pin(1150, 'THE FACTORY', W('factory'))}
      <div style={{ position: 'absolute', left: 538, top: 520, width: 4, height: 620 * d, backgroundImage: `linear-gradient(${C.harvest} 50%, transparent 50%)`, backgroundSize: '4px 28px' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 760, textAlign: 'center', fontFamily: F.display, fontWeight: 800, fontSize: 120, color: '#fff', opacity: lerp(f, [W('neither'), W('neither') + 10], [0, 1]), textShadow: '0 4px 30px rgba(0,0,0,0.6)' }}>?</div>
    </AbsoluteFill>
  );
};

export const V4: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Shell8 d={D}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 100% 70% at 50% 45%, #0A3D2A 0%, #062A1C 45%, #02110A 100%)` }} />
      <Span from={0} to={L(7)} fade={10}><IndiaMap /></Span>
      <Headline text={'WHAT DOES\nYOUR STATE GROW?'} at={6} out={REG[0].at - 8} top={190} size={84} />
      {REG.map((r, i) => <Span key={r.name} from={r.at} to={i + 1 < REG.length ? REG[i + 1].at : L(6)} fade={6}><RegionCard r={r} until={i + 1 < REG.length ? REG[i + 1].at : L(6)} /></Span>)}
      <Span from={L(6)} to={L(7)} fade={6}><Headline text={'EVERY ONE\nIS A FUEL'} at={L(6)} top={200} size={88} color={C.harvest} /></Span>
      <Span from={L(7)} to={L(8)}><Media src="V4_7.jpg" from={L(7)} to={L(8)} a={[1.4, 0, 0]} b={[1.15, 0, 0]} /><Shade top={0.6} mid={0.35} bottom={0.75} /><Distance /></Span>
      <Span from={L(8)} to={END} fade={10}>
        <IndiaMap net={lerp(f, [L(8), L(8) + 60], [0, 1])} />
        <Headline text={'WHO HAS WHAT,\nAND WHERE'} at={L(8)} top={190} size={80} color={C.harvest} />
        <Chip text="WHICH ONE GROWS NEAR YOU?" at={L(9)} top={1250} size={30} />
      </Span>
    </Shell8>
  );
};
export const V4_FRAMES = totalFrames(D);
