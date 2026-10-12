import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { ReelShell, BrandBg, EndCard, ReelData, wordAt } from './common';
import { Footage } from '../components/Footage';
import { Kinetic, Label, Slam } from '../components/Type';
import { MapCanvas } from '../components/MapCanvas';
import { LightLeak } from '../components/LightLeak';
import { nodes, edges, outline, CITY_COUNT, MAP_W, MAP_H, nodeSeed } from '../components/graph';
import { Logo } from '../components/Logo';
import { clip } from '../clips';
import { lerp, E } from '../lib';
import { C, F } from '../theme';
import data from '../data/reel1.json';

const D = data as unknown as ReelData;
// beat frames, all taken from the narration's word timings
const T = {
  burn: wordAt(D, 'burn'),
  cofiring: wordAt(D, 'its'),
  pct: wordAt(D, '7%'),
  rule: wordAt(D, 'that'),
  estimated: wordAt(D, 'an'),
  fifteen: wordAt(D, '15'),
  today: wordAt(D, 'today'),
  twoFive: wordAt(D, '2.5'),
  gap: wordAt(D, 'that', 1),
  pellet: wordAt(D, 'pellet'),
  straw: wordAt(D, 'straw'),
  machinery: wordAt(D, 'machinery'),
  brand: wordAt(D, 'india', 2),
  end: D.words[D.words.length - 1].e + 10,
};

const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const wipe = lerp(f, [T.burn - 4, T.burn + 14], [0, 1], E.inOut);
  return (
    <AbsoluteFill>
      <Sequence><Footage src={clip('s2_plant')} dur={T.cofiring} from={[1.25, 0, 0]} to={[1.08, 0, -20]} grade="industrial" /></Sequence>
      {/* biomass arrives: pellets wipe in on a diagonal */}
      <AbsoluteFill style={{ clipPath: `polygon(${100 - wipe * 140}% 0, 100% 0, 100% 100%, ${140 - wipe * 140}% 100%)` }}>
        <Sequence from={T.burn - 6}><Footage src={clip('s4_pellets')} dur={T.cofiring} from={[1.2, 0, 0]} to={[1.1, 0, 0]} grade="warm" /></Sequence>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(4,20,12,0.8) 0%, rgba(4,20,12,0.2) 40%, rgba(4,20,12,0.1) 60%, rgba(4,20,12,0.6) 100%)' }} />
      <div style={{ position: 'absolute', left: 70, right: 70, top: 300 }}>
        <Kinetic lines={['EVERY COAL PLANT', 'IN INDIA']} at={4} out={T.cofiring - 6} size={96} align="left" stagger={0.9} />
      </div>
      <div style={{ position: 'absolute', left: 70, top: 560 }}>
        <Slam text="+ BIOMASS" at={T.burn + 4} out={T.cofiring - 6} size={120} color={C.harvest} />
      </div>
    </AbsoluteFill>
  );
};

const CoFiring: React.FC = () => {
  const f = useCurrentFrame();
  const g = lerp(f, [T.pct - 8, T.pct + 26], [0, 0.07], E.out); // gauge fill to 7 %
  const pctShown = Math.round(lerp(f, [T.pct - 8, T.pct + 20], [0, 7], E.out));
  const R = 250, CIRC = 2 * Math.PI * R;
  const gaugeIn = lerp(f, [T.pct - 14, T.pct], [0, 1], E.out);
  return (
    <AbsoluteFill>
      <BrandBg />
      <div style={{ position: 'absolute', left: 70, right: 70, top: 300, opacity: lerp(f, [T.pct - 16, T.pct - 6], [1, 0]) }}>
        <Label text="It's called" at={T.cofiring} color={C.harvest} size={26} />
        <div style={{ height: 22 }} />
        <Slam text="CO-FIRING" at={T.cofiring + 6} out={T.pct - 16} size={150} />
        <div style={{ fontFamily: F.text, fontSize: 42, color: 'rgba(255,255,255,0.85)', marginTop: 26, opacity: lerp(f, [T.cofiring + 18, T.cofiring + 30], [0, 1]) }}>
          Burning biomass together with coal in power plants.
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 520, display: 'flex', justifyContent: 'center', opacity: gaugeIn, transform: `scale(${0.9 + 0.1 * gaugeIn})` }}>
        <svg width={620} height={620} viewBox="0 0 620 620">
          <circle cx={310} cy={310} r={R} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={34} />
          <circle cx={310} cy={310} r={R} fill="none" stroke={C.harvest} strokeWidth={34} strokeLinecap="round"
            strokeDasharray={`${CIRC * g} ${CIRC}`} transform="rotate(-90 310 310)" style={{ filter: 'drop-shadow(0 0 18px rgba(232,176,75,0.7))' }} />
          <text x={310} y={350} textAnchor="middle" fontFamily={F.display} fontWeight={800} fontSize={190} fill="#fff" letterSpacing="-6">{pctShown}%</text>
        </svg>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1170, display: 'flex', justifyContent: 'center', opacity: lerp(f, [T.pct + 6, T.pct + 18], [0, 1]) }}>
        <Label text="Co-firing target · from FY 2025–26" at={T.pct + 6} color={C.harvest} size={28} rule={false} />
      </div>
    </AbsoluteFill>
  );
};

/** Demand vs production bars, then the gap. */
const Gap: React.FC = () => {
  const f = useCurrentFrame();
  const BASE = 1290, X1 = 200, X2 = 620, BW = 260, TALL = 600;
  const demand = lerp(f, [T.fifteen - 6, T.fifteen + 24], [0, 1], E.out);
  const made = lerp(f, [T.twoFive - 10, T.twoFive + 14], [0, 1], E.out);
  const madeH = TALL * (2.5 / 17.5);
  const gapGlow = lerp(f, [T.gap - 4, T.gap + 12], [0, 1], E.out);
  const intro = lerp(f, [T.rule, T.rule + 14], [0, 1], E.out);
  const fadeIntro = lerp(f, [T.estimated - 10, T.estimated], [1, 0]);
  const numA = lerp(f, [T.fifteen - 2, T.fifteen + 12], [0, 1], E.out);
  return (
    <AbsoluteFill>
      <Sequence from={T.rule}><Footage src={clip('s4_pellets')} dur={T.pellet - T.rule} from={[1.35, 0, 0]} to={[1.15, 0, 0]} grade="warm" /></Sequence>
      <AbsoluteFill style={{ background: 'rgba(3,22,14,0.82)' }} />
      {/* "huge, repeating demand": the same order returning every year */}
      <div style={{ position: 'absolute', left: 70, right: 70, top: 300, opacity: intro * fadeIntro }}>
        <Slam text={'HUGE,\nREPEATING\nDEMAND.'} at={T.rule + 2} out={T.estimated - 10} size={118} />
      </div>
      <div style={{ position: 'absolute', left: 70, top: 300, opacity: lerp(f, [T.estimated - 4, T.estimated + 8], [0, 1]) * lerp(f, [T.gap - 8, T.gap], [1, 0]) }}>
        <Label text="Biomass pellets · per year" at={T.estimated - 4} color={C.harvest} size={26} />
      </div>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        {/* demand bar */}
        <rect x={X1} y={BASE - TALL * demand} width={BW} height={TALL * demand} rx={16} fill={C.harvest} opacity={0.95} />
        {/* production bar */}
        <rect x={X2} y={BASE - madeH * made} width={BW} height={madeH * made} rx={16} fill="#78DCA0" opacity={0.95} />
        <line x1={120} x2={960} y1={BASE} y2={BASE} stroke="rgba(255,255,255,0.35)" strokeWidth={3} />
        {/* the gap bracket */}
        <g opacity={gapGlow}>
          <line x1={X2 + BW / 2} x2={X2 + BW / 2} y1={BASE - TALL + 8} y2={BASE - madeH - 170} stroke={C.harvest} strokeWidth={6} strokeDasharray="14 12" />
          <line x1={X1 + BW + 10} x2={X2 + BW + 20} y1={BASE - TALL} y2={BASE - TALL} stroke={C.harvest} strokeWidth={3} strokeDasharray="6 8" />
          <rect x={X2 - 20} y={BASE - TALL} width={BW + 40} height={TALL - madeH - 6} rx={18} fill={C.harvest} opacity={0.12 + 0.08 * Math.sin(f * 0.25)} />
        </g>
      </svg>
      <div style={{ position: 'absolute', left: X1 - 40, width: BW + 80, top: BASE - TALL - 150, textAlign: 'center', opacity: numA }}>
        <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 92, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>15–20</div>
        <div style={{ fontFamily: F.label, fontWeight: 600, fontSize: 24, letterSpacing: '0.14em', color: C.harvest, marginTop: 8 }}>MILLION TONNES</div>
      </div>
      <div style={{ position: 'absolute', left: X1 - 40, width: BW + 80, top: BASE + 26, textAlign: 'center', fontFamily: F.text, fontWeight: 600, fontSize: 30, color: '#fff', opacity: numA }}>Needed</div>
      <div style={{ position: 'absolute', left: X2 - 40, width: BW + 80, top: BASE - madeH - 150, textAlign: 'center', opacity: made }}>
        <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 92, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>~2.5</div>
        <div style={{ fontFamily: F.label, fontWeight: 600, fontSize: 24, letterSpacing: '0.14em', color: '#78DCA0', marginTop: 8 }}>MILLION TONNES</div>
      </div>
      <div style={{ position: 'absolute', left: X2 - 40, width: BW + 80, top: BASE + 26, textAlign: 'center', fontFamily: F.text, fontWeight: 600, fontSize: 30, color: '#fff', opacity: made }}>Made today</div>
      <div style={{ position: 'absolute', left: 70, right: 70, top: 300, opacity: gapGlow }}>
        <Slam text={'THE GAP IS THE\nOPPORTUNITY.'} at={T.gap} out={T.pellet - 8} size={78} color={C.harvest} />
      </div>
    </AbsoluteFill>
  );
};

const WHO: [string, string, number, number][] = [
  ['s2_pellets', 'PELLET MAKERS', 0, 0],
  ['s4_bales', 'STRAW AGGREGATORS', 1, 0],
  ['s4_machine', 'MACHINERY BUILDERS', 2, 0],
];

const Who: React.FC = () => {
  const f = useCurrentFrame();
  const starts = [T.pellet - 4, T.straw - 4, T.machinery - 4, T.brand - 6];
  return (
    <AbsoluteFill>
      {WHO.map(([role, label], i) => {
        const a = starts[i], b = starts[i + 1];
        if (f < a || f >= b) return null;
        return (
          <AbsoluteFill key={role}>
            <Sequence from={a}><Footage src={clip(role)} dur={b - a + 10} from={[1.18, 0, 0]} to={[1.06, 0, 0]} grade={i === 2 ? 'industrial' : 'warm'} /></Sequence>
            <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(4,20,12,0.75) 0%, rgba(4,20,12,0.1) 40%, rgba(4,20,12,0.2) 70%, rgba(4,20,12,0.7) 100%)' }} />
            <div style={{ position: 'absolute', left: 70, right: 70, top: 300 }}>
              <Label text={`0${i + 1} · For`} at={a + 2} color={C.harvest} size={24} />
              <div style={{ height: 18 }} />
              <Slam text={label} at={a + 3} out={b - 4} size={label.length > 14 ? 88 : 104} />
            </div>
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};

/** IndiaBiomass: the network draws India, then the logo. */
const Brand: React.FC = () => {
  const f = useCurrentFrame();
  const L = T.end - T.brand;
  const draw = lerp(f, [T.brand, T.brand + L * 0.55], [0, 1], E.inOut);
  const cx = MAP_W * 0.47, cy = MAP_H * 0.52;
  const logoAt = T.brand + Math.round(L * 0.5);
  const card = lerp(f, [logoAt - 6, logoAt + 8], [0, 1], E.inOut);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 100% 70% at 50% 42%, #0A5034 0%, ${C.forest} 45%, #032116 100%)` }} />
      <AbsoluteFill style={{ mixBlendMode: 'screen', opacity: 1 - card * 0.85 }}>
        <MapCanvas
          cam={{ cx: 480, cy: 580, zoom: 1.15 - draw * 0.15, tilt: 30 * (1 - card), rot: -6 * (1 - card) }}
          draw={({ P, glow, line, ctx }) => {
            ctx.globalCompositeOperation = 'lighter';
            for (const [a, b] of edges) {
              const na = nodes[a];
              const d = Math.hypot(na[0] - cx, na[1] - cy) / 700 + nodeSeed[a] * 0.12;
              const g = lerp(draw, [d * 0.8, d * 0.8 + 0.18], [0, 1]);
              if (g <= 0) continue;
              const A = P(na[0], na[1]), B = P(nodes[b][0], nodes[b][1]);
              line([A[0], A[1]], [A[0] + (B[0] - A[0]) * g, A[1] + (B[1] - A[1]) * g], 'rgba(232,176,75,1)', 0.6, 1.4);
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
      {f >= T.rule && f < T.pellet - 4 && <Gap />}
      {f >= T.pellet - 4 && f < T.brand - 6 && <Who />}
      {f >= T.brand - 6 && <Brand />}
      <EndCard at={T.end} logo={false} bg={false} note="Figures are approximate. Sources: Ministry of Power biomass co-firing policy; industry estimates." />
      <LightLeak at={T.cofiring} dur={16} from="left" strength={0.6} />
      <LightLeak at={T.brand - 6} dur={18} from="right" strength={0.7} />
    </ReelShell>
  );
};
export const REEL1_FRAMES = D.frames;
