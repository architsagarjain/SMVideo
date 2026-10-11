import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Footage } from '../components/Footage';
import { MapCanvas } from '../components/MapCanvas';
import { nodes, edges, outline, CITY_COUNT, MAP_W, MAP_H, nodeSeed } from '../components/graph';
import { Logo } from '../components/Logo';
import { clip } from '../clips';
import { lerp, E } from '../lib';
import { C, F } from '../theme';

// 00:55-01:00  local 0-150. Rise above the land; the network draws India; end card.
export const END = 52;

export const S7Finale: React.FC = () => {
  const f = useCurrentFrame();
  const draw = lerp(f, [0, END - 6], [0, 1], E.inOut);
  const card = lerp(f, [END - 8, END + 6], [0, 1], E.inOut);
  const cx = MAP_W * 0.47, cy = MAP_H * 0.52;
  const cam = { cx: 480, cy: 600, zoom: 2.4 - E.out(Math.min(1, f / (END + 30))) * 1.75, tilt: 40 * (1 - card), rot: -8 * (1 - card), oy: -60 * card };
  const ctaT = (d: number) => lerp(f, [END + d, END + d + 16], [0, 1], E.out);
  return (
    <AbsoluteFill style={{ background: C.night }}>
      <AbsoluteFill style={{ opacity: 1 - card }}>
        <Footage src={clip('s7_aerial')} dur={END + 10} from={[1.25, 0, 60]} to={[1.0, 0, -40]} grade="golden" />
        <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(4,38,26,0.35), rgba(4,38,26,${0.2 + draw * 0.5}))` }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: card, background: `radial-gradient(ellipse 100% 70% at 50% 42%, #0A5034 0%, ${C.forest} 45%, #032116 100%)` }} />
      <AbsoluteFill style={{ mixBlendMode: 'screen' }}>
        <MapCanvas
          cam={cam}
          draw={({ P, glow, line, ctx }) => {
            ctx.globalCompositeOperation = 'lighter';
            const fade = 1 - card * 0.86; // network stays as a quiet texture behind the end card
            // lines radiate from the centre: each edge lights when the wavefront passes it
            for (const [a, b] of edges) {
              const na = nodes[a];
              const d = Math.hypot(na[0] - cx, na[1] - cy) / 700 + nodeSeed[a] * 0.12;
              const g = lerp(draw, [d * 0.8, d * 0.8 + 0.18], [0, 1]);
              if (g <= 0) continue;
              const A = P(na[0], na[1]), B = P(nodes[b][0], nodes[b][1]);
              line([A[0], A[1]], [A[0] + (B[0] - A[0]) * g, A[1] + (B[1] - A[1]) * g], 'rgba(232,176,75,1)', 0.6 * fade, 1.4);
            }
            // the outline of India traces itself out of the wavefront
            ctx.beginPath();
            const n = Math.floor(outline.length * lerp(draw, [0.25, 1], [0, 1]));
            for (let i = 0; i <= n && i < outline.length; i++) {
              const [x, y] = P(outline[i][0], outline[i][1]);
              i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
            }
            if (n >= outline.length - 1) ctx.closePath();
            ctx.lineJoin = 'round';
            ctx.globalAlpha = 0.35 * fade; ctx.strokeStyle = 'rgba(255,214,140,1)'; ctx.lineWidth = 9; ctx.stroke();
            ctx.globalAlpha = 0.95 * fade; ctx.lineWidth = 2.4; ctx.stroke(); ctx.globalAlpha = 1;
            if (n > 0 && n < outline.length) { const [x, y] = P(outline[n][0], outline[n][1]); glow(x, y, 40, 'rgba(255,236,200,1)', 1); }
            nodes.forEach((p, i) => {
              const d = Math.hypot(p[0] - cx, p[1] - cy) / 700 + nodeSeed[i] * 0.12;
              const a = lerp(draw, [d * 0.8, d * 0.8 + 0.1], [0, 1]);
              const [x, y, s] = P(p[0], p[1]);
              glow(x, y, (i < CITY_COUNT ? 16 : 7) * s, 'rgba(232,176,75,1)', a * fade);
            });
            ctx.globalCompositeOperation = 'source-over';
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: 'radial-gradient(circle at 50% 44%, rgba(255,240,210,0.9) 0%, rgba(232,176,75,0.35) 30%, rgba(0,0,0,0) 60%)', opacity: lerp(f, [END - 6, END, END + 20], [0, 0.75, 0]), mixBlendMode: 'screen' }} />
      {f >= END - 2 && (
        <div style={{ position: 'absolute', left: 120, top: 700, width: 840 }}>
          <Logo id="s7" at={END - 2} width={840} desc mode="settle" />
        </div>
      )}
      <div style={{ position: 'absolute', left: 60, right: 60, top: 990, textAlign: 'center', fontFamily: F.display, fontWeight: 800, fontSize: 50, letterSpacing: '-0.02em', color: '#fff', opacity: ctaT(16), transform: `translateY(${(1 - ctaT(16)) * 20}px)` }}>
        Connecting India's biomass economy.
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1110, display: 'flex', justifyContent: 'center', opacity: ctaT(26), transform: `translateY(${(1 - ctaT(26)) * 20}px)` }}>
        <div style={{ background: C.harvest, color: C.ink, fontFamily: F.text, fontWeight: 600, fontSize: 36, padding: '20px 44px', borderRadius: 14 }}>Explore IndiaBiomass</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1236, textAlign: 'center', fontFamily: F.label, fontWeight: 600, fontSize: 32, letterSpacing: '0.12em', color: C.lightOchre, opacity: ctaT(32) }}>
        indiabiomass.com
      </div>
    </AbsoluteFill>
  );
};
