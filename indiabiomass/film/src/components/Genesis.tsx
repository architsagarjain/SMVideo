import { useLayoutEffect, useMemo, useRef } from 'react';
import { useCurrentFrame } from 'remotion';
import { rng, lerp, E } from '../lib';

/**
 * Opening particle field: one point of light -> it multiplies into a 3D cloud ->
 * the camera accelerates through it. Deterministic (seeded) and frame-pure.
 */
const N = 1100;
const DEPTH = 4200;

export const Genesis: React.FC<{ split: number; launch: number; bloom: number }> = ({ split, launch, bloom }) => {
  const f = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const pts = useMemo(() => {
    const r = rng(42);
    return Array.from({ length: N }, (_, i) => {
      const a = r() * Math.PI * 2;
      const rad = 60 + Math.pow(r(), 0.7) * 1500;
      return {
        x: Math.cos(a) * rad,
        y: Math.sin(a) * rad * 1.25,
        z: 300 + r() * DEPTH,
        born: i === 0 ? 0 : Math.log2(i + 1) * 3.2 + r() * 3, // doubling cascade
        size: 0.7 + r() * 1.8,
        warm: r(),
        tw: r() * Math.PI * 2,
      };
    });
  }, []);

  // camera z: slow drift, then accelerating flight
  const camZ = (fr: number) => {
    const drift = fr * 2.2;
    const t = Math.max(0, fr - launch);
    return drift + 0.9 * t * t * 1.15 + 6 * t;
  };

  useLayoutEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext('2d')!;
    ctx.clearRect(0, 0, 1080, 1920);
    ctx.globalCompositeOperation = 'lighter';
    const FOC = 900;
    const cz = camZ(f), czPrev = camZ(f - 1.6);
    const sp = f - split; // frames since split began
    for (let i = 0; i < N; i++) {
      const p = pts[i];
      if (i > 0 && sp < p.born) continue;
      // spread outward from the origin point as each particle is born
      const grow = i === 0 ? 1 : E.out(Math.min(1, (sp - p.born) / 26));
      const x = p.x * grow, y = p.y * grow;
      const baseZ = i === 0 ? 1400 : 1400 + (p.z - 1400) * grow;
      let z = baseZ - cz;
      z = ((z % DEPTH) + DEPTH) % DEPTH + 10;
      let zp = baseZ - czPrev;
      zp = ((zp % DEPTH) + DEPTH) % DEPTH + 10;
      const s = FOC / z, sPrev = FOC / zp;
      const sx = 540 + x * s, sy = 960 + y * s;
      if (sx < -200 || sx > 1280 || sy < -200 || sy > 2120) continue;
      const near = Math.min(1, 1500 / z);
      const tw = 0.75 + 0.25 * Math.sin(f * 0.25 + p.tw);
      let a = Math.min(1, near * 1.2) * tw * (i === 0 ? lerp(f, [2, 12], [0, 1]) : Math.min(1, (sp - p.born) / 6));
      const col = p.warm > 0.35 ? `255,${190 + Math.round(p.warm * 40)},${110 + Math.round(p.warm * 60)}` : '255,244,220';
      const r0 = Math.min(26, Math.max(0.6, p.size * s * 3.2)) * (i === 0 ? 2.6 + 0.4 * Math.sin(f * 0.4) : 1);
      // streak when moving fast (simple motion blur)
      const speed = cz - czPrev;
      if (speed > 6 && zp > z) {
        const psx = 540 + x * sPrev, psy = 960 + y * sPrev;
        ctx.strokeStyle = `rgba(${col},${a * 0.8})`;
        ctx.lineWidth = r0 * 0.9;
        ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(psx, psy); ctx.lineTo(sx, sy); ctx.stroke();
      }
      const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, r0 * 4);
      g.addColorStop(0, `rgba(${col},${a})`);
      g.addColorStop(0.25, `rgba(${col},${a * 0.5})`);
      g.addColorStop(1, `rgba(${col},0)`);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(sx, sy, r0 * 4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  });

  return (
    <canvas ref={ref} width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: 1 - bloom }} />
  );
};

/**
 * Hero moment 1 overlay: a scan line rises through the crop residue; above it
 * the material resolves into a gold dot lattice and particles lift off it.
 */
export const Digitise: React.FC<{ start: number; dur: number; seed?: number }> = ({ start, dur, seed = 5 }) => {
  const f = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const t = (f - start) / dur;
  const scanY = lerp(t, [0, 1], [1980, 300], E.inOut);
  const parts = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: 260 }, () => ({ x: r() * 1080, born: r(), vx: (r() - 0.3) * 2.2, vy: -(1.5 + r() * 4), s: 0.8 + r() * 2.2, ph: r() * 6 }));
  }, [seed]);
  useLayoutEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext('2d')!;
    ctx.clearRect(0, 0, 1080, 1920);
    if (t < 0 || t > 1.4) return;
    ctx.globalCompositeOperation = 'lighter';
    const lf = f - start;
    const pos: [number, number][] = [];
    for (const p of parts) {
      const bornF = p.born * dur;
      if (lf < bornF) continue;
      const age = lf - bornF;
      const y0 = lerp(p.born, [0, 1], [1980, 300], E.inOut);
      const x = p.x + p.vx * age + Math.sin(age * 0.05 + p.ph) * 14;
      const y = y0 + p.vy * age;
      const a = Math.max(0, 1 - age / 70) * 0.95;
      if (a <= 0) continue;
      pos.push([x, y]);
      const g = ctx.createRadialGradient(x, y, 0, x, y, p.s * 5);
      g.addColorStop(0, `rgba(255,214,140,${a})`);
      g.addColorStop(1, 'rgba(255,214,140,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, p.s * 5, 0, Math.PI * 2); ctx.fill();
    }
    // faint links between close particles: the "digital" read
    ctx.lineWidth = 1;
    for (let i = 0; i < pos.length; i++) for (let j = i + 1; j < pos.length; j++) {
      const dx = pos[i][0] - pos[j][0], dy = pos[i][1] - pos[j][1];
      const d2 = dx * dx + dy * dy;
      if (d2 < 95 * 95) {
        ctx.strokeStyle = `rgba(232,176,75,${0.35 * (1 - Math.sqrt(d2) / 95)})`;
        ctx.beginPath(); ctx.moveTo(pos[i][0], pos[i][1]); ctx.lineTo(pos[j][0], pos[j][1]); ctx.stroke();
      }
    }
    // the scan line
    const lineA = Math.min(1, Math.min(t, 1 - t) * 8);
    if (lineA > 0) {
      const g = ctx.createLinearGradient(0, scanY - 60, 0, scanY + 4);
      g.addColorStop(0, 'rgba(232,176,75,0)');
      g.addColorStop(1, `rgba(255,220,150,${0.35 * lineA})`);
      ctx.fillStyle = g;
      ctx.fillRect(0, scanY - 60, 1080, 64);
      ctx.fillStyle = `rgba(255,236,200,${0.9 * lineA})`;
      ctx.fillRect(0, scanY, 1080, 2);
    }
    ctx.globalCompositeOperation = 'source-over';
  });
  // dot lattice that appears behind (below) the scan line
  const latticeMask = `linear-gradient(to bottom, rgba(0,0,0,0) ${scanY - 10}px, rgba(0,0,0,1) ${scanY + 40}px, rgba(0,0,0,1) ${scanY + 420}px, rgba(0,0,0,0) ${scanY + 900}px)`;
  return (
    <>
      <div
        style={{
          position: 'absolute', inset: 0, mixBlendMode: 'screen', opacity: 0.55 * Math.max(0, Math.min(1, (1.2 - t) * 3)),
          backgroundImage: 'radial-gradient(circle, rgba(232,176,75,0.9) 1.6px, rgba(0,0,0,0) 2.4px)', backgroundSize: '18px 18px',
          WebkitMaskImage: latticeMask, maskImage: latticeMask,
        }}
      />
      <canvas ref={ref} width={1080} height={1920} style={{ position: 'absolute', inset: 0 }} />
    </>
  );
};
