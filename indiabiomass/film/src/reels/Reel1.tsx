import { AbsoluteFill, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ReelShell, BrandBg, EndCard, ReelData, wordAt, CenterTitle, Glass } from './common';
import { Footage } from '../components/Footage';
import { Kinetic, Label } from '../components/Type';
import { MapCanvas } from '../components/MapCanvas';
import { LightLeak } from '../components/LightLeak';
import { nodes, edges, outline, CITY_COUNT, MAP_W, MAP_H, nodeSeed } from '../components/graph';
import { Logo } from '../components/Logo';
import { clip } from '../clips';
import { lerp, E } from '../lib';
import { C, F } from '../theme';
import data from '../data/reel1.json';

// Reel 1, "Co-firing". Everything is centre-aligned on one grid:
// titles from y=300, the main graphic in the 600-1300 band, subtitles at 1430.
const D = data as unknown as ReelData;
const T = {
  burn: wordAt(D, 'burn'),
  cofiring: wordAt(D, 'its'),
  pct: wordAt(D, '7%'),
  rule: wordAt(D, 'that'),
  estimated: wordAt(D, 'an'),
  fifteen: wordAt(D, '15'),
  twoFive: wordAt(D, '2.5'),
  gap: wordAt(D, 'that', 1),
  pellet: wordAt(D, 'pellet'),
  straw: wordAt(D, 'straw'),
  machinery: wordAt(D, 'machinery'),
  brand: wordAt(D, 'india', 2),
  end: D.words[D.words.length - 1].e + 10,
};
const shade = (top = 0.78, mid = 0.18, bottom = 0.7) =>
  `linear-gradient(180deg, rgba(4,20,12,${top}) 0%, rgba(4,20,12,${mid}) 38%, rgba(4,20,12,${mid}) 62%, rgba(4,20,12,${bottom}) 100%)`;

// ------------------------------------------------------------------ 1. hook
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const fire = lerp(f, [T.burn - 6, T.burn + 8], [0, 1], E.inOut);
  return (
    <AbsoluteFill>
      <Sequence><Footage src={clip('r_plant_sunset')} dur={T.cofiring} from={[1.22, 0, 0]} to={[1.06, 0, -30]} grade="golden" /></Sequence>
      <AbsoluteFill style={{ opacity: fire }}>
        <Sequence from={T.burn - 6}><Footage src={clip('r_sparks')} dur={T.cofiring - T.burn + 6} from={[1.15, 0, 0]} to={[1.05, 0, 0]} grade="warm" /></Sequence>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: shade(0.8, 0.12, 0.65) }} />
      <div style={{ position: 'absolute', left: 60, right: 60, top: 300 }}>
        <Kinetic lines={['EVERY COAL PLANT', 'IN INDIA']} at={4} out={T.cofiring - 6} size={100} align="center" stagger={0.9} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center', opacity: lerp(f, [T.burn, T.burn + 8], [0, 1]) * lerp(f, [T.cofiring - 8, T.cofiring], [1, 0]) }}>
        <div style={{ background: 'rgba(4,20,12,0.82)', border: `2px solid ${C.harvest}`, borderRadius: 999, padding: '18px 40px', transform: `scale(${lerp(f, [T.burn, T.burn + 12], [0.85, 1], E.back)})` }}>
          <span style={{ fontFamily: F.display, fontWeight: 800, fontSize: 56, letterSpacing: '-0.02em', color: C.harvest }}>MUST NOW BURN BIOMASS</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ 2. co-firing + the 7 % grid
const CELL = 54, GAP = 9, N = 10;
const Waffle: React.FC = () => {
  const f = useCurrentFrame();
  const W = N * CELL + (N - 1) * GAP;
  const left = (1080 - W) / 2, top = 640;
  const base = T.pct - 16; // builds only after the definition has faded out
  const tex = staticFile('reels/pellet_tex.jpg');
  return (
    <div style={{ position: 'absolute', left, top, width: W, height: W }}>
      {Array.from({ length: N * N }, (_, i) => {
        const r = Math.floor(i / N), c = i % N;
        const isBio = i >= N * N - 7; // the last 7 cells: biomass
        const appear = lerp(f, [base + (r + c) * 0.9, base + (r + c) * 0.9 + 8], [0, 1], E.out);
        const lit = isBio ? lerp(f, [T.pct - 4 + (i - 93) * 2, T.pct + 6 + (i - 93) * 2], [0, 1], E.back) : 0;
        return (
          <div key={i} style={{
            position: 'absolute', left: c * (CELL + GAP), top: r * (CELL + GAP), width: CELL, height: CELL, borderRadius: 10,
            opacity: appear, transform: `scale(${(0.6 + 0.4 * appear) * (1 + 0.12 * lit * (1 - lit) * 4)})`,
            background: isBio && lit > 0 ? `url(${tex}) ${(c * 37) % 100}% ${(r * 53) % 100}% / 340px` : '#3A403C',
            boxShadow: lit > 0 ? `0 0 0 3px ${C.harvest}, 0 0 ${22 * lit}px rgba(232,176,75,0.8)` : 'inset 0 0 0 1px rgba(255,255,255,0.06)',
          }} />
        );
      })}
    </div>
  );
};

const CoFiring: React.FC = () => {
  const f = useCurrentFrame();
  const swap = lerp(f, [T.pct - 30, T.pct - 18], [0, 1], E.inOut);
  return (
    <AbsoluteFill>
      <Sequence from={T.cofiring}><Footage src={clip('r_furnace')} dur={T.rule - T.cofiring} from={[1.15, 0, 0]} to={[1.05, 0, 0]} grade="warm" /></Sequence>
      <AbsoluteFill style={{ background: `rgba(3,22,14,${0.62 + 0.25 * swap})` }} />
      <div style={{ opacity: 1 - swap }}>
        <CenterTitle label="It's called" text="CO-FIRING" at={T.cofiring + 4} out={T.pct - 24} size={150} />
        <div style={{ position: 'absolute', left: 120, right: 120, top: 640, textAlign: 'center', fontFamily: F.text, fontWeight: 500, fontSize: 46, lineHeight: 1.3, color: 'rgba(255,255,255,0.9)', opacity: lerp(f, [T.cofiring + 16, T.cofiring + 28], [0, 1]) }}>
          Burning biomass together with coal in power plants
        </div>
      </div>
      {f >= T.pct - 40 && (
        <>
          <CenterTitle text="7%" at={T.pct - 2} out={T.rule + 40} size={200} color={C.harvest} top={250} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: 500, textAlign: 'center', fontFamily: F.text, fontWeight: 600, fontSize: 40, color: '#fff', opacity: lerp(f, [T.pct + 4, T.pct + 14], [0, 1]) }}>
            biomass in the fuel mix
          </div>
          <Waffle />
          <div style={{ position: 'absolute', left: 0, right: 0, top: 1300, display: 'flex', justifyContent: 'center', opacity: lerp(f, [T.pct + 8, T.pct + 18], [0, 1]) }}>
            <Label text="7 in every 100 parts · target from FY 2025–26" at={T.pct + 8} color={C.harvest} size={28} rule={false} />
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ 3. demand vs supply, one block = 1 million tonnes
const B = 70, G = 12, COLS = 4;
const Blocks: React.FC<{ x: number; count: number; solid: number; at: number; color: string; ghostTo?: number; ghostAt?: number }> = ({ x, count, solid, at, color, ghostTo = 0, ghostAt = 0 }) => {
  const f = useCurrentFrame();
  const baseY = 1180;
  const cells = Math.max(Math.ceil(count), ghostTo);
  return (
    <>
      {Array.from({ length: cells }, (_, i) => {
        const r = Math.floor(i / COLS), c = i % COLS;
        const y = baseY - (r + 1) * B - r * G;
        const isReal = i < Math.ceil(count);
        const frac = isReal ? Math.min(1, count - i) : 0;
        const a = isReal ? lerp(f, [at + i * 1.4, at + i * 1.4 + 8], [0, 1], E.back) : lerp(f, [ghostAt + (i - Math.ceil(count)) * 0.8, ghostAt + (i - Math.ceil(count)) * 0.8 + 8], [0, 1], E.out);
        const range = isReal && i >= solid; // 15-20: the upper five are the range
        return (
          <div key={i} style={{ position: 'absolute', left: x + c * (B + G), top: y, width: B, height: B, transform: `scale(${a})`, opacity: Math.min(1, a * 1.4) }}>
            {isReal ? (
              <div style={{ position: 'absolute', left: 0, bottom: 0, width: B * frac, height: B, borderRadius: 12, background: range ? 'transparent' : color, border: range ? `3px dashed ${color}` : undefined, boxSizing: 'border-box' }} />
            ) : (
              <div style={{ position: 'absolute', inset: 0, borderRadius: 12, border: `3px dashed ${C.harvest}`, background: 'rgba(232,176,75,0.12)', boxShadow: '0 0 18px rgba(232,176,75,0.35)' }} />
            )}
          </div>
        );
      })}
    </>
  );
};

const Demand: React.FC = () => {
  const f = useCurrentFrame();
  const gridIn = lerp(f, [T.estimated - 6, T.estimated + 6], [0, 1], E.out);
  const GW = COLS * B + (COLS - 1) * G, SP = 130;
  const xL = (1080 - (GW * 2 + SP)) / 2, xR = xL + GW + SP;
  const gap = f >= T.gap - 2;
  return (
    <AbsoluteFill>
      {/* "huge, repeating demand": trucks on the road, every year */}
      <AbsoluteFill style={{ opacity: 1 - gridIn }}>
        <Sequence from={T.rule}><Footage src={clip('r_trucks')} dur={T.estimated - T.rule + 10} from={[1.2, 0, 0]} to={[1.05, 0, 40]} grade="golden" /></Sequence>
        <AbsoluteFill style={{ background: shade(0.8, 0.15, 0.7) }} />
        <CenterTitle text={'HUGE,\nREPEATING\nDEMAND.'} at={T.rule + 2} out={T.estimated - 4} size={120} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 820, display: 'flex', justifyContent: 'center', opacity: lerp(f, [T.rule + 20, T.rule + 32], [0, 1]) }}>
          <svg width={200} height={200} viewBox="0 0 200 200" style={{ transform: `rotate(${f * 4}deg)` }}>
            <path d="M100 30 A70 70 0 1 1 30 100" fill="none" stroke={C.harvest} strokeWidth={12} strokeLinecap="round" />
            <path d="M14 84 L30 112 L52 88" fill="none" stroke={C.harvest} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 1040, textAlign: 'center', fontFamily: F.label, fontWeight: 600, fontSize: 30, letterSpacing: '0.2em', color: '#fff', opacity: lerp(f, [T.rule + 26, T.rule + 38], [0, 1]) }}>EVERY YEAR</div>
      </AbsoluteFill>
      {/* the blocks */}
      <AbsoluteFill style={{ opacity: gridIn }}>
        <BrandBg />
        {!gap && <CenterTitle label="Biomass pellets per year" text="NEEDED VS MADE" at={T.estimated} out={T.gap - 2} size={84} />}
        {gap && <CenterTitle text={'THE GAP IS THE\nOPPORTUNITY.'} at={T.gap} out={T.pellet + 30} size={86} color={C.harvest} />}
        <Blocks x={xL} count={20} solid={15} at={T.fifteen - 4} color={C.harvest} />
        <Blocks x={xR} count={2.5} solid={3} at={T.twoFive - 6} color="#78DCA0" ghostTo={17} ghostAt={T.gap + 4} />
        {[[xL, '15–20', C.harvest, T.fifteen, 'Needed'], [xR, '~2.5', '#78DCA0', T.twoFive, 'Made today']].map(([x, num, col, at, lab]) => {
          const a = lerp(f, [(at as number) - 2, (at as number) + 10], [0, 1], E.out);
          return (
            <div key={lab as string} style={{ position: 'absolute', left: (x as number) - 40, width: GW + 80, top: 1200, textAlign: 'center', opacity: a }}>
              <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 64, color: col as string, letterSpacing: '-0.03em', lineHeight: 1 }}>{num as string}</div>
              <div style={{ fontFamily: F.text, fontWeight: 600, fontSize: 28, color: '#fff', marginTop: 8 }}>{lab as string}</div>
            </div>
          );
        })}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center', opacity: lerp(f, [T.fifteen, T.fifteen + 12], [0, 1]) * (gap ? 0 : 1) }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: F.text, fontSize: 26, color: 'rgba(255,255,255,0.75)' }}>
            <span style={{ width: 26, height: 26, borderRadius: 6, background: C.harvest }} /> = 1 million tonnes
          </span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ 4. who it's for: three cards that build a list
const WHO: [string, string][] = [['r_pellets_hands', 'Pellet makers'], ['r_bales_field', 'Straw aggregators'], ['r_lathe', 'Machinery builders']];
const Who: React.FC = () => {
  const f = useCurrentFrame();
  const ats = [T.pellet - 4, T.straw - 4, T.machinery - 4];
  return (
    <AbsoluteFill>
      <BrandBg />
      <CenterTitle label="Built for" text="THE BIOMASS TRADE" at={T.pellet - 6} out={T.brand} size={72} />
      {WHO.map(([role, label], i) => {
        const a = lerp(f, [ats[i], ats[i] + 12], [0, 1], E.out);
        const active = f >= ats[i] && (i === 2 || f < ats[i + 1]);
        return (
          <div key={role} style={{ position: 'absolute', left: 90, width: 900, top: 560 + i * 260, height: 230, borderRadius: 28, overflow: 'hidden', opacity: a, transform: `translateY(${(1 - a) * 50}px) scale(${active ? 1 : 0.97})`, boxShadow: active ? `0 0 0 3px ${C.harvest}, 0 30px 80px rgba(0,0,0,0.5)` : '0 20px 60px rgba(0,0,0,0.4)' }}>
            <Sequence from={ats[i]}><Footage src={clip(role)} dur={T.brand - ats[i]} from={[1.2, 0, 0]} to={[1.08, 0, 0]} grade="warm" /></Sequence>
            <div style={{ position: 'absolute', inset: 0, background: `rgba(3,22,14,${active ? 0.42 : 0.62})` }} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <div style={{ fontFamily: F.label, fontWeight: 600, fontSize: 22, letterSpacing: '0.2em', color: C.harvest }}>0{i + 1}</div>
              <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 64, color: '#fff', letterSpacing: '-0.02em', textShadow: '0 4px 24px rgba(0,0,0,0.5)' }}>{label}</div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ 5. the road ahead: network draws India, then the logo
const Brand: React.FC = () => {
  const f = useCurrentFrame();
  const L = T.end - T.brand;
  const draw = lerp(f, [T.brand, T.brand + L * 0.55], [0, 1], E.inOut);
  const cx = MAP_W * 0.47, cy = MAP_H * 0.52;
  const logoAt = T.brand + Math.round(L * 0.5);
  const card = lerp(f, [logoAt - 6, logoAt + 8], [0, 1], E.inOut);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: 1 - card }}>
        <Sequence from={T.brand - 6}><Footage src={clip('r_road_sunset')} dur={L + 10} from={[1.3, 0, 60]} to={[1.05, 0, -40]} grade="golden" /></Sequence>
        <AbsoluteFill style={{ background: 'rgba(4,38,26,0.55)' }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: card, background: `radial-gradient(ellipse 100% 70% at 50% 42%, #0A5034 0%, ${C.forest} 45%, #032116 100%)` }} />
      <AbsoluteFill style={{ mixBlendMode: 'screen', opacity: 1 - card * 0.85 }}>
        <MapCanvas
          cam={{ cx: 480, cy: 580, zoom: 1.15 - draw * 0.15, tilt: 30 * (1 - card), rot: 0 }}
          draw={({ P, glow, line, ctx }) => {
            ctx.globalCompositeOperation = 'lighter';
            for (const [a, b] of edges) {
              const na = nodes[a];
              const d = Math.hypot(na[0] - cx, na[1] - cy) / 700 + nodeSeed[a] * 0.12;
              const g = lerp(draw, [d * 0.8, d * 0.8 + 0.18], [0, 1]);
              if (g <= 0) continue;
              const A = P(na[0], na[1]), Bp = P(nodes[b][0], nodes[b][1]);
              line([A[0], A[1]], [A[0] + (Bp[0] - A[0]) * g, A[1] + (Bp[1] - A[1]) * g], 'rgba(232,176,75,1)', 0.65, 1.4);
            }
            ctx.beginPath();
            const n = Math.floor(outline.length * lerp(draw, [0.2, 1], [0, 1]));
            for (let i = 0; i <= n && i < outline.length; i++) { const [x, y] = P(outline[i][0], outline[i][1]); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
            ctx.globalAlpha = 0.9; ctx.strokeStyle = 'rgba(255,214,140,1)'; ctx.lineWidth = 2.4; ctx.stroke(); ctx.globalAlpha = 1;
            nodes.forEach((p, i) => {
              const d = Math.hypot(p[0] - cx, p[1] - cy) / 700 + nodeSeed[i] * 0.12;
              const [x, y, s] = P(p[0], p[1]);
              glow(x, y, (i < CITY_COUNT ? 16 : 7) * s, 'rgba(232,176,75,1)', lerp(draw, [d * 0.8, d * 0.8 + 0.1], [0, 1]));
            });
            ctx.globalCompositeOperation = 'source-over';
          }}
        />
      </AbsoluteFill>
      {f >= logoAt - 2 && (
        <div style={{ position: 'absolute', left: 120, top: 760, width: 840 }}>
          <Logo id="r1" at={logoAt - 2} width={840} desc mode="settle" />
        </div>
      )}
    </AbsoluteFill>
  );
};

export const Reel1: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <ReelShell data={D} endAt={T.end}>
      {f < T.cofiring && <Hook />}
      {f >= T.cofiring && f < T.rule && <CoFiring />}
      {f >= T.rule && f < T.pellet - 6 && <Demand />}
      {f >= T.pellet - 6 && f < T.brand - 6 && <Who />}
      {f >= T.brand - 6 && <Brand />}
      <EndCard at={T.end} logo={false} bg={false} note="Figures are approximate. Sources: Ministry of Power biomass co-firing policy; industry estimates." />
      <LightLeak at={T.cofiring} dur={16} from="left" strength={0.6} />
      <LightLeak at={T.brand - 6} dur={18} from="right" strength={0.7} />
    </ReelShell>
  );
};
export const REEL1_FRAMES = D.frames;
