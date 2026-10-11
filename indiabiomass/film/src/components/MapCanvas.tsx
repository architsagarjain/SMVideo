import { useLayoutEffect, useMemo, useRef } from 'react';
import { useCurrentFrame } from 'remotion';
import { MAP_W, MAP_H, polys, Pt } from './graph';

export type Cam = { cx: number; cy: number; zoom: number; tilt: number; rot?: number; ox?: number; oy?: number };

export type Helpers = {
  ctx: CanvasRenderingContext2D;
  P: (x: number, y: number, z?: number) => [number, number, number];
  glow: (x: number, y: number, r: number, color: string, a: number) => void;
  land: (fill: string, fa: number, stroke: string, sa: number, lw: number, glowA?: number) => void;
  line: (a: [number, number], b: [number, number], color: string, alpha: number, w: number) => void;
  frame: number;
};

const spriteCache: Record<string, HTMLCanvasElement> = {};
const sprite = (color: string) => {
  if (spriteCache[color]) return spriteCache[color];
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, color);
  gr.addColorStop(0.18, color);
  gr.addColorStop(0.4, color.replace(/,\s*1\)$/, ',0.35)'));
  gr.addColorStop(1, color.replace(/,\s*1\)$/, ',0)'));
  g.fillStyle = gr;
  g.fillRect(0, 0, 128, 128);
  spriteCache[color] = c;
  return c;
};

/**
 * Perspective "camera" over the official India outline. Map units are the
 * 1000-wide projection from scripts/build_geo.py. Everything is redrawn per frame.
 */
export const MapCanvas: React.FC<{ cam: Cam; draw: (h: Helpers) => void; width?: number; height?: number; style?: React.CSSProperties }> = ({ cam, draw, width = 1080, height = 1920, style }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const frame = useCurrentFrame();
  const D = 1700;
  const P = useMemo(() => {
    const t = (cam.tilt * Math.PI) / 180;
    const rr = ((cam.rot ?? 0) * Math.PI) / 180;
    const ct = Math.cos(t), st = Math.sin(t), cr = Math.cos(rr), sr = Math.sin(rr);
    const ox = width / 2 + (cam.ox ?? 0), oy = height / 2 + (cam.oy ?? 0);
    return (x: number, y: number, z = 0): [number, number, number] => {
      let X = (x - cam.cx) * cam.zoom, Y = (y - cam.cy) * cam.zoom;
      const X2 = X * cr - Y * sr, Y2 = X * sr + Y * cr;
      const Z = z * cam.zoom;
      // tilt about the horizontal axis (north recedes)
      const yy = Y2 * ct - Z * st;
      const zz = Y2 * st + Z * ct;
      const s = D / (D + zz);
      return [ox + X2 * s, oy + yy * s, s];
    };
  }, [cam.cx, cam.cy, cam.zoom, cam.tilt, cam.rot, cam.ox, cam.oy, width, height]);

  useLayoutEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext('2d')!;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, width, height);
    const h: Helpers = {
      ctx, P, frame,
      glow: (x, y, r, color, a) => {
        if (a <= 0.003 || r <= 0) return;
        ctx.globalAlpha = Math.min(1, a);
        ctx.drawImage(sprite(color), x - r, y - r, r * 2, r * 2);
        ctx.globalAlpha = 1;
      },
      land: (fill, fa, stroke, sa, lw, glowA = 0) => {
        ctx.beginPath();
        for (const poly of polys) {
          poly.forEach(([x, y], i) => {
            const [sx, sy] = P(x, y);
            i ? ctx.lineTo(sx, sy) : ctx.moveTo(sx, sy);
          });
          ctx.closePath();
        }
        if (fa > 0) { ctx.globalAlpha = fa; ctx.fillStyle = fill; ctx.fill(); }
        if (glowA > 0) {
          ctx.globalAlpha = glowA; ctx.strokeStyle = stroke; ctx.lineWidth = lw * 7; ctx.lineJoin = 'round';
          ctx.filter = 'blur(10px)'; ctx.stroke(); ctx.filter = 'none';
        }
        if (sa > 0) { ctx.globalAlpha = sa; ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.stroke(); }
        ctx.globalAlpha = 1;
      },
      line: (a, b, color, alpha, w) => {
        if (alpha <= 0.003) return;
        ctx.globalAlpha = Math.min(1, alpha);
        ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
        ctx.globalAlpha = 1;
      },
    };
    draw(h);
  });
  return <canvas ref={ref} width={width} height={height} style={{ position: 'absolute', left: 0, top: 0, width, height, ...style }} />;
};

export const MAP_CENTER: Pt = [MAP_W * 0.47, MAP_H * 0.52];
