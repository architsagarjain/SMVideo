import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { Footage } from '../components/Footage';
import { MapCanvas } from '../components/MapCanvas';
import { nodes, edges, arcs, CITY_COUNT } from '../components/graph';
import { Label } from '../components/Type';
import { clip } from '../clips';
import { lerp, E } from '../lib';
import { C, F } from '../theme';

// 00:47-00:55  local 0-240. Field -> supplier -> industry -> the whole country.
const SHOTS = [
  { role: 's6_field', at: 0, dur: 60, grade: 'golden' as const },
  { role: 's6_supplier', at: 60, dur: 60, grade: 'warm' as const },
  { role: 's6_industry', at: 120, dur: 60, grade: 'industrial' as const },
];
// one continuous gold thread that runs through every shot (screen space)
const THREAD: [number, number][] = [[-40, 1260], [260, 1150], [430, 1210], [640, 1020], [820, 1080], [1120, 900]];

const Statement: React.FC<{ label: string; text: string; at: number; out: number }> = ({ label, text, at, out }) => {
  const f = useCurrentFrame();
  const t = lerp(f, [at + 4, at + 26], [0, 1], E.out);
  const o = lerp(f, [out, out + 12], [1, 0], E.in);
  return (
    <div style={{ position: 'absolute', left: 84, right: 84, top: 300, opacity: o }}>
      <Label text={label} at={at} color={C.harvest} size={26} />
      <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 84, lineHeight: 1.02, letterSpacing: '-0.035em', color: '#fff', marginTop: 26, whiteSpace: 'pre-line', clipPath: `inset(0 0 ${(1 - t) * 100}% 0)`, transform: `translateY(${(1 - t) * 40}px)`, textShadow: '0 6px 40px rgba(0,0,0,0.35)' }}>
        {text}
      </div>
    </div>
  );
};

export const S6Purpose: React.FC = () => {
  const f = useCurrentFrame();
  const thread = lerp(f, [4, 176], [0, 1], E.inOut);
  const net = lerp(f, [176, 186], [0, 1], E.out);
  // thread polyline up to progress
  const segs = THREAD.length - 1;
  const head = thread * segs;
  const pts: [number, number][] = [];
  for (let i = 0; i <= Math.floor(head) && i < THREAD.length; i++) pts.push(THREAD[i]);
  const hi = Math.min(Math.floor(head), segs - 1), hf = head - hi;
  const hp: [number, number] = [THREAD[hi][0] + (THREAD[hi + 1][0] - THREAD[hi][0]) * hf, THREAD[hi][1] + (THREAD[hi + 1][1] - THREAD[hi][1]) * hf];
  pts.push(hp);
  const zoomOut = lerp(f, [176, 240], [0, 1], E.out);
  return (
    <AbsoluteFill style={{ background: C.night }}>
      {SHOTS.map((s) => (
        <Sequence key={s.role} from={s.at} durationInFrames={s.dur}>
          <Footage src={clip(s.role)} dur={s.dur} from={[1.14, 0, 0]} to={[1.04, 0, 0]} grade={s.grade} />
        </Sequence>
      ))}
      {/* final beat: the thread joins the national network */}
      <AbsoluteFill style={{ opacity: net, background: `radial-gradient(ellipse at 50% 55%, ${C.forest} 0%, ${C.deep} 50%, ${C.night} 100%)` }}>
        <MapCanvas
          cam={{ cx: 480, cy: 600, zoom: 1.9 - zoomOut * 0.85, tilt: 38, rot: -6, oy: 60 }}
          draw={({ P, glow, land, line, ctx }) => {
            land('rgba(30,90,60,1)', 0.25, 'rgba(232,176,75,1)', 0.5, 1.6, 0.3);
            ctx.globalCompositeOperation = 'lighter';
            for (const [a, b] of edges) {
              const A = P(nodes[a][0], nodes[a][1]), B = P(nodes[b][0], nodes[b][1]);
              line([A[0], A[1]], [B[0], B[1]], 'rgba(232,176,75,1)', 0.45, 1.3);
            }
            arcs.forEach(([a, b]) => {
              const na = nodes[a], nb = nodes[b];
              const dist = Math.hypot(nb[0] - na[0], nb[1] - na[1]);
              ctx.beginPath();
              for (let s = 0; s <= 24; s++) {
                const u = s / 24;
                const [x, y] = P(na[0] + (nb[0] - na[0]) * u, na[1] + (nb[1] - na[1]) * u, -Math.sin(u * Math.PI) * dist * 0.28);
                s ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
              }
              ctx.globalAlpha = 0.5; ctx.strokeStyle = 'rgba(255,226,168,1)'; ctx.lineWidth = 1.6; ctx.stroke(); ctx.globalAlpha = 1;
            });
            nodes.forEach((n, i) => { const [x, y, s] = P(n[0], n[1]); glow(x, y, (i < CITY_COUNT ? 16 : 7) * s, 'rgba(232,176,75,1)', 0.9); });
            ctx.globalCompositeOperation = 'source-over';
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(4,20,12,0.72) 0%, rgba(4,20,12,0.25) 38%, rgba(0,0,0,0) 55%, rgba(4,20,12,0.5) 100%)' }} />
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: 1 - net }}>
        <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke={C.harvest} strokeWidth={16} strokeOpacity={0.2} strokeLinejoin="round" />
        <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke="#FFD58A" strokeWidth={4} strokeLinejoin="round" />
        {THREAD.slice(1, -1).map((p, i) => {
          const on = head >= i + 1;
          const age = f - ((i + 1) / segs) * 172;
          return on ? (
            <g key={i}>
              <circle cx={p[0]} cy={p[1]} r={11} fill="#FFF3D6" />
              <circle cx={p[0]} cy={p[1]} r={11 + Math.min(40, age * 1.6)} fill="none" stroke={C.harvest} strokeWidth={3} strokeOpacity={Math.max(0, 1 - age / 25)} />
            </g>
          ) : null;
        })}
        <circle cx={hp[0]} cy={hp[1]} r={10} fill="#FFF3D6" />
        <circle cx={hp[0]} cy={hp[1]} r={34} fill={C.harvest} opacity={0.3} />
      </svg>
      <Statement label="Our mission" text={'Simplify.\nConnect.\nBuild trust.'} at={6} out={122} />
      <Statement label="Our vision" text={'One connected\nbiomass\necosystem.'} at={136} out={236} />
    </AbsoluteFill>
  );
};
