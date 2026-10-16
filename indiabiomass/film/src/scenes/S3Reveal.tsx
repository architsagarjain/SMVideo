import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { MapCanvas } from '../components/MapCanvas';
import { nodes, edges, arcs, HOPS, MAX_HOP, SEED, CITY_COUNT, nodeSeed, cityIndex } from '../components/graph';
import { Logo } from '../components/Logo';
import { Label } from '../components/Type';
import { lerp, E } from '../lib';
import { C, F } from '../theme';

// 00:15-00:23  local frames 0-240.
export const WAVE0 = 34; // first connection
export const CONDENSE = 118; // network collapses to a beam
export const LOGO = 150; // brand hit

const GOLD = 'rgba(232,176,75,1)';
const WARM = 'rgba(255,226,168,1)';

export const S3Reveal: React.FC = () => {
  const f = useCurrentFrame();
  const seed = nodes[SEED];
  const pull = lerp(f, [26, 112], [0, 1], E.inOut);
  // dive starts tilted on the seed node, then settles flat and north-up with all of India in frame
  const cam = {
    cx: seed[0] + (500 - seed[0]) * pull,
    cy: seed[1] + (560 - seed[1]) * pull,
    zoom: 6.9 + (0.9 - 6.9) * pull,
    tilt: 32 * (1 - pull) * (1 - pull),
    rot: 0,
    oy: -80 * pull,
  };
  const delhi = cityIndex('Delhi'), bathinda = cityIndex('Bathinda');
  const edgeT = (a: number, b: number) => {
    if ((a === SEED || b === SEED) && (a === delhi || b === delhi)) return WAVE0;
    if ((a === SEED || b === SEED) && (a === bathinda || b === bathinda)) return WAVE0 + 12;
    const h = Math.min(HOPS[a], HOPS[b]);
    return WAVE0 + 22 + (h / MAX_HOP) * 62 + nodeSeed[a] * 10;
  };
  const condense = lerp(f, [CONDENSE, LOGO - 4], [0, 1], E.in);
  const netAlpha = 1 - lerp(f, [LOGO - 6, LOGO], [0, 1]);
  const flash = lerp(f, [LOGO - 4, LOGO, LOGO + 18], [0, 1, 0], E.soft);
  const brand = lerp(f, [LOGO - 2, LOGO + 6], [0, 1]);
  const freezePulse = f < WAVE0 ? 0.5 + 0.5 * Math.sin(f * 0.5) : 1;

  return (
    <AbsoluteFill style={{ background: C.night }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, ${C.deep} 0%, ${C.night} 72%)` }} />
      {/* brand field behind the logo */}
      <AbsoluteFill style={{ opacity: brand, background: `radial-gradient(ellipse 90% 60% at 50% 46%, #0B5537 0%, ${C.forest} 45%, #032517 100%)` }} />
      {f > LOGO && (
        <AbsoluteFill style={{ opacity: lerp(f, [LOGO, LOGO + 30], [0, 0.13]), mixBlendMode: 'screen' }}>
          <MapCanvas
            cam={{ cx: 480, cy: 600, zoom: 1.5 + (f - LOGO) * 0.002, tilt: 45, rot: -10 + (f - LOGO) * 0.03, oy: 120 }}
            draw={({ P, line, glow }) => {
              for (const [a, b] of edges) {
                const A = P(nodes[a][0], nodes[a][1]), B = P(nodes[b][0], nodes[b][1]);
                line([A[0], A[1]], [B[0], B[1]], GOLD, 0.8, 1.2);
              }
              nodes.forEach((n) => { const [x, y] = P(n[0], n[1]); glow(x, y, 8, GOLD, 0.9); });
            }}
          />
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{ opacity: netAlpha }}>
        <MapCanvas
          cam={cam}
          draw={({ P, glow, land, line, ctx }) => {
            const squeeze = (x: number, y: number, i: number): [number, number] => {
              if (condense <= 0) return [x, y];
              const tx = 540, ty = 960 + (nodeSeed[i] - 0.5) * 1500 * (1 - condense) ;
              const k = E.in(condense);
              return [x + (tx - x) * k, y + (ty - y) * k];
            };
            land('rgba(30,90,60,1)', 0.2 * (1 - condense), GOLD, 0.4 * (1 - condense), 1.6, 0.22 * (1 - condense));
            const scr = nodes.map((n, i) => { const [x, y, s] = P(n[0], n[1]); const [qx, qy] = squeeze(x, y, i); return [qx, qy, s] as const; });
            ctx.globalCompositeOperation = 'lighter';
            // connections
            for (const [a, b] of edges) {
              const t0 = edgeT(a, b);
              const g = lerp(f, [t0, t0 + 10], [0, 1], E.out);
              if (g <= 0) continue;
              const A = scr[a], B = scr[b];
              const fromA = HOPS[a] <= HOPS[b];
              const S = fromA ? A : B, T = fromA ? B : A;
              const end: [number, number] = [S[0] + (T[0] - S[0]) * g, S[1] + (T[1] - S[1]) * g];
              const hot = lerp(f, [t0, t0 + 8, t0 + 30], [1, 1, 0.45]);
              line([S[0], S[1]], end, GOLD, 0.7 * hot, 1.4 * Math.max(0.8, S[2]));
              if (g < 1) glow(end[0], end[1], 14, WARM, 0.9);
            }
            // raised trade arcs between cities
            arcs.forEach(([a, b], k) => {
              const t0 = WAVE0 + 46 + k * 1.6;
              const g = lerp(f, [t0, t0 + 18], [0, 1], E.out);
              if (g <= 0 || condense > 0.6) return;
              const na = nodes[a], nb = nodes[b];
              const dist = Math.hypot(nb[0] - na[0], nb[1] - na[1]);
              ctx.beginPath();
              const STEPS = 24;
              for (let s = 0; s <= STEPS * g; s++) {
                const u = s / STEPS;
                const [x, y] = P(na[0] + (nb[0] - na[0]) * u, na[1] + (nb[1] - na[1]) * u, -Math.sin(u * Math.PI) * dist * 0.28);
                const [qx, qy] = squeeze(x, y, a);
                s ? ctx.lineTo(qx, qy) : ctx.moveTo(qx, qy);
              }
              ctx.globalAlpha = 0.55 * (1 - condense);
              ctx.strokeStyle = WARM; ctx.lineWidth = 1.6; ctx.stroke(); ctx.globalAlpha = 1;
            });
            // nodes
            scr.forEach(([x, y, s], i) => {
              const lit = f >= edgeT(i, i) - 4 || i === SEED;
              const city = i < CITY_COUNT;
              const r0 = (city ? 16 : 7) * Math.max(0.7, Math.min(3, s * (1 + (1 - pull) * 2)));
              glow(x, y, r0 * (i === SEED ? 1.8 * freezePulse : 1), i === SEED ? WARM : GOLD, lit ? 0.95 : 0.35);
            });
            // pulse rings on the seed while everything holds still
            if (f < WAVE0 + 30) {
              const [x, y] = scr[SEED];
              for (let k = 0; k < 3; k++) {
                const ph = ((f + k * 10) % 30) / 30;
                ctx.globalAlpha = (1 - ph) * 0.6;
                ctx.strokeStyle = WARM; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.arc(x, y, 20 + ph * 120, 0, Math.PI * 2); ctx.stroke();
              }
              ctx.globalAlpha = 1;
            }
            // the beam
            if (condense > 0) {
              const w = 6 + 60 * (1 - condense);
              const h = 1500 * (1 - E.in(condense) * 0.98);
              const g = ctx.createLinearGradient(0, 960 - h / 2, 0, 960 + h / 2);
              g.addColorStop(0, 'rgba(255,226,168,0)'); g.addColorStop(0.5, `rgba(255,236,200,${0.9 * condense})`); g.addColorStop(1, 'rgba(255,226,168,0)');
              ctx.fillStyle = g; ctx.fillRect(540 - w / 2, 960 - h / 2, w, h);
              glow(540, 960, 120 + 200 * condense, WARM, condense);
            }
            ctx.globalCompositeOperation = 'source-over';
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: 'radial-gradient(circle at 50% 50%, rgba(255,240,210,1) 0%, rgba(232,176,75,0.5) 30%, rgba(0,0,0,0) 65%)', opacity: flash, mixBlendMode: 'screen' }} />
      {/* INTRODUCING */}
      <div style={{ position: 'absolute', top: 700, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: lerp(f, [CONDENSE + 4, CONDENSE + 20], [0, 1]) }}>
        <Label text="Introducing" at={CONDENSE + 4} color={C.harvest} size={28} rule={false} />
      </div>
      {f >= LOGO - 1 && (
        <div style={{ position: 'absolute', top: 810, left: 90, width: 900, transform: `scale(${lerp(f, [LOGO + 40, 240], [1, 1.035])})`, transformOrigin: '50% 50%' }}>
          <Logo id="s3" at={LOGO - 1} width={900} mode="reveal" />
        </div>
      )}
      <div
        style={{
          position: 'absolute', top: 1040, left: 120, right: 120, textAlign: 'center', fontFamily: F.text, fontWeight: 500, fontSize: 40, lineHeight: 1.35,
          color: 'rgba(247,246,242,0.92)', opacity: lerp(f, [LOGO + 52, LOGO + 70], [0, 1]), transform: `translateY(${lerp(f, [LOGO + 52, LOGO + 80], [16, 0], E.out)}px)`,
        }}
      >
        The information and trust layer for India's biomass industry.
      </div>
    </AbsoluteFill>
  );
};
