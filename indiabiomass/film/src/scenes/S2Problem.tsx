import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { Footage } from '../components/Footage';
import { Fragments } from '../components/Fragments';
import { Label, Slam } from '../components/Type';
import { MapCanvas } from '../components/MapCanvas';
import { nodes, CITY_COUNT, SEED, nodeSeed } from '../components/graph';
import { clip } from '../clips';
import { lerp, E, rng } from '../lib';
import { C } from '../theme';

// 00:06-00:15  local frames 0-270. Problem: two worlds that never meet.
const PW = 534; // panel width
const GAP = 12;

const Panel: React.FC<{ side: 'L' | 'R'; shots: { role: string; at: number; dur: number; start?: number; grade?: any }[] }> = ({ side, shots }) => {
  const f = useCurrentFrame();
  const enter = lerp(f, [0, 16], [1, 0], E.out);
  const leave = lerp(f, [196, 214], [0, 1], E.in);
  const x = side === 'L' ? -leave * 560 : leave * 560;
  const y = side === 'L' ? -enter * 1920 : enter * 1920;
  return (
    <div style={{ position: 'absolute', top: 0, height: 1920, width: PW, left: side === 'L' ? 0 : PW + GAP, overflow: 'hidden', transform: `translate(${x}px, ${y}px)` }}>
      {shots.map((s, i) => (
        <Sequence key={i} from={s.at} durationInFrames={s.dur}>
          <Footage src={clip(s.role)} startFrom={s.start ?? 0} dur={s.dur} from={[1.12, side === 'L' ? 20 : -20, 0]} to={[1.2, side === 'L' ? -20 : 20, 0]} grade={s.grade ?? (side === 'L' ? 'warm' : 'industrial')} />
        </Sequence>
      ))}
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(10,17,13,0.7) 0%, rgba(10,17,13,0.25) 30%, rgba(10,17,13,0.35) 70%, rgba(10,17,13,0.8) 100%)' }} />
    </div>
  );
};

/** Lines that reach for the other side and fall short. */
const Reach: React.FC = () => {
  const f = useCurrentFrame();
  const r = rng(21);
  const tries = Array.from({ length: 9 }, (_, i) => ({
    y1: 520 + r() * 760, y2: 520 + r() * 760, at: 18 + i * 19 + r() * 8, reach: 0.55 + r() * 0.3, fromLeft: i % 2 === 0,
  }));
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
      {tries.map((t, i) => {
        const age = f - t.at;
        if (age < 0 || age > 46) return null;
        const grow = lerp(age, [0, 22], [0, t.reach], E.out);
        const fade = lerp(age, [24, 46], [1, 0]);
        const x1 = t.fromLeft ? 150 : 930, x2 = t.fromLeft ? 930 : 150;
        const xe = x1 + (x2 - x1) * grow, ye = t.y1 + (t.y2 - t.y1) * grow;
        return (
          <g key={i} opacity={fade}>
            <circle cx={x1} cy={t.y1} r={7} fill={C.harvest} />
            <circle cx={x1} cy={t.y1} r={18} fill="none" stroke={C.harvest} strokeOpacity={0.4} />
            <line x1={x1} y1={t.y1} x2={xe} y2={ye} stroke={C.harvest} strokeWidth={2.5} strokeDasharray="2 0" />
            <circle cx={xe} cy={ye} r={4 + (age > 22 ? (age - 22) * 0.6 : 0)} fill="none" stroke="#FFE2A8" strokeOpacity={age > 22 ? 1 - (age - 22) / 24 : 0} />
            <circle cx={x2} cy={t.y2} r={6} fill="none" stroke="#fff" strokeOpacity={0.5} />
          </g>
        );
      })}
    </svg>
  );
};

export const S2Problem: React.FC = () => {
  const f = useCurrentFrame();
  // Map of India with nodes that never connect, then a dive into one node.
  const mapIn = lerp(f, [196, 224], [0, 1], E.out);
  const dive = lerp(f, [244, 270], [0, 1], E.in);
  const seedPt = nodes[SEED];
  const cam = {
    cx: 470 + (seedPt[0] - 470) * dive,
    cy: 600 + (seedPt[1] - 600) * dive,
    zoom: 0.92 * (1 + dive * 6.5) * (0.92 + mapIn * 0.08),
    tilt: 18 + dive * 14,
    rot: -4 + mapIn * 4,
  };
  return (
    <AbsoluteFill style={{ background: C.night }}>
      <AbsoluteFill style={{ opacity: mapIn }}>
        <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, ${C.deep} 0%, ${C.night} 70%)` }} />
        <MapCanvas
          cam={cam}
          draw={({ P, glow, land, frame, line }) => {
            land('rgba(30,90,60,1)', 0.22, 'rgba(232,176,75,1)', 0.45, 1.6, 0.25);
            nodes.forEach((n, i) => {
              const [x, y, s] = P(n[0], n[1]);
              const city = i < CITY_COUNT;
              const flick = 0.55 + 0.45 * Math.sin(frame * 0.3 + nodeSeed[i] * 20);
              glow(x, y, (city ? 20 : 9) * s * (1 + dive * 2), 'rgba(232,176,75,1)', (city ? 0.9 : 0.35) * flick);
              // broken stubs: short lines that go nowhere
              if (city && nodeSeed[i] > 0.4) {
                const a = nodeSeed[i] * 12;
                const len = 18 + 14 * Math.sin(frame * 0.12 + a);
                const [x2, y2] = P(n[0] + Math.cos(a) * len, n[1] + Math.sin(a) * len);
                line([x, y], [x2, y2], 'rgba(232,176,75,1)', 0.35, 1.2);
              }
            });
            const [sx, sy] = P(seedPt[0], seedPt[1]);
            glow(sx, sy, 60 * (1 + dive * 4), 'rgba(255,226,168,1)', 0.5 + dive * 0.5);
          }}
        />
      </AbsoluteFill>
      <Panel side="L" shots={[{ role: 's2_bales', at: 0, dur: 60 }, { role: 's2_pellets', at: 60, dur: 60 }, { role: 's2_tractor', at: 120, dur: 100 }]} />
      <Panel side="R" shots={[{ role: 's2_boiler', at: 0, dur: 75 }, { role: 's2_buyer', at: 75, dur: 60 }, { role: 's2_plant', at: 135, dur: 85 }]} />
      <div style={{ position: 'absolute', left: 48, top: 270, opacity: lerp(f, [196, 206], [1, 0]) }}><Label text="Suppliers" at={10} color="#fff" size={24} /></div>
      <div style={{ position: 'absolute', right: 48, top: 270, opacity: lerp(f, [196, 206], [1, 0]) }}><Label text="Buyers" at={18} color="#fff" size={24} /></div>
      <Reach />
      <Fragments start={20} end={215} />
      <div style={{ position: 'absolute', left: 70, right: 70, top: 840, textAlign: 'center' }}>
        <Slam text={'MISSED\nCONNECTIONS.'} at={44} out={124} size={100} />
      </div>
      <div style={{ position: 'absolute', left: 70, right: 70, top: 840, textAlign: 'center' }}>
        <Slam text={'UNCLEAR\nPRICES.'} at={142} out={186} size={100} />
      </div>
      <div style={{ position: 'absolute', left: 70, right: 70, top: 840, textAlign: 'center' }}>
        <Slam text={'SCATTERED\nINFORMATION.'} at={200} out={240} size={100} />
      </div>
    </AbsoluteFill>
  );
};
