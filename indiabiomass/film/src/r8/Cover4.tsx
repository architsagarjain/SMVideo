import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender } from 'remotion';
import { MapCanvas, Cam } from '../components/MapCanvas';
import { nodes, edges, cities } from '../components/graph';
import { Logo } from '../components/Logo';
import { useBrandFonts } from '../components/Fonts';
import { C, F } from '../theme';

// Reel cover for Video 4 (What does your state grow?), 1080x1920 (9:16).
// Everything that matters sits inside the centre 1080x1440 band, which is what the profile grid shows.
const REG = [
  { name: 'PADDY STRAW', cities: ['Ludhiana', 'Amritsar', 'Bathinda', 'Karnal'], color: 'rgba(232,176,75,1)', dx: 150, dy: -70 },
  { name: 'MUSTARD HUSK', cities: ['Jodhpur', 'Jaipur'], color: 'rgba(242,210,60,1)', dx: -175, dy: 0 },
  { name: 'COTTON STALKS', cities: ['Ahmedabad', 'Rajkot'], color: 'rgba(245,242,234,1)', dx: -190, dy: 40 },
  { name: 'BAGASSE', cities: ['Lucknow', 'Kanpur', 'Gorakhpur'], color: 'rgba(158,212,122,1)', dx: 150, dy: -10 },
  { name: 'RICE HUSK', cities: ['Vijayawada', 'Bhubaneswar', 'Raipur'], color: 'rgba(227,194,122,1)', dx: 160, dy: 20 },
  { name: 'COCONUT SHELLS', cities: ['Kochi', 'Coimbatore', 'Madurai'], color: 'rgba(217,160,102,1)', dx: -200, dy: 20 },
];
const centroid = (cs: string[]) => cs.reduce((a, c) => [a[0] + cities[c][0] / cs.length, a[1] + cities[c][1] / cs.length], [0, 0]);
const CAM: Cam = { cx: 500, cy: 560, zoom: 0.62, tilt: 0, rot: 0, oy: 150 };

export const Cover4: React.FC = () => {
  useBrandFonts();
  // the map labels are drawn on a canvas, so wait until the brand font is really available before drawing
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender('cover font'));
  useEffect(() => {
    const id = setInterval(() => { if (document.fonts.check('700 26px Archivo')) { clearInterval(id); setReady(true); } }, 50);
    return () => clearInterval(id);
  }, []);
  useEffect(() => { if (ready) requestAnimationFrame(() => continueRender(handle)); }, [ready, handle]);
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse 100% 70% at 50% 55%, #0B4630 0%, #062A1C 45%, #02110A 100%)' }}>
      {ready && <MapCanvas cam={CAM} draw={({ P, land, glow, line, ctx }) => {
        land('rgba(30,90,60,1)', 0.6, 'rgba(232,176,75,1)', 0.85, 2.5, 0.25);
        for (const [a, b] of edges) { const A = P(nodes[a][0], nodes[a][1]), B = P(nodes[b][0], nodes[b][1]); line([A[0], A[1]], [B[0], B[1]], 'rgba(232,176,75,1)', 0.18, 1.2); }
        nodes.forEach((n) => { const [x, y] = P(n[0], n[1]); glow(x, y, 4, 'rgba(232,176,75,1)', 0.35); });
        REG.forEach((r) => {
          r.cities.forEach((c) => { const [x, y] = P(cities[c][0], cities[c][1]); glow(x, y, 16, r.color, 0.95); });
          // label pill with a leader line from the region's centre
          const [mx, my] = centroid(r.cities); const [x, y] = P(mx, my);
          const lx = x + r.dx, ly = y + r.dy;
          ctx.save();
          ctx.strokeStyle = r.color; ctx.globalAlpha = 0.8; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(lx, ly); ctx.stroke();
          ctx.globalAlpha = 1;
          ctx.font = `700 26px Archivo, sans-serif`;
          const w = ctx.measureText(r.name).width + 36, h = 46;
          const bx = Math.max(24, Math.min(1080 - 24 - w, lx - w / 2)), by = ly - h / 2;
          ctx.fillStyle = 'rgba(4,20,12,0.92)'; ctx.beginPath(); ctx.roundRect(bx, by, w, h, 23); ctx.fill();
          ctx.strokeStyle = r.color; ctx.lineWidth = 2.5; ctx.stroke();
          ctx.fillStyle = '#fff'; ctx.textBaseline = 'middle'; ctx.fillText(r.name, bx + 18, by + h / 2 + 1);
          ctx.restore();
        });
      }} />}
      {/* title */}
      <div style={{ position: 'absolute', left: 60, right: 60, top: 300, textAlign: 'center' }}>
        <div style={{ display: 'inline-block', fontFamily: F.label, fontWeight: 700, fontSize: 30, letterSpacing: '0.24em', color: C.ink, background: C.harvest, borderRadius: 999, padding: '10px 28px' }}>INDIA'S BIOMASS MAP</div>
        <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 112, lineHeight: 0.98, letterSpacing: '-0.035em', color: '#fff', marginTop: 26, textShadow: '0 6px 40px rgba(0,0,0,0.5)' }}>
          WHAT DOES<br />YOUR STATE<br /><span style={{ color: C.harvest }}>GROW?</span>
        </div>
      </div>
      {/* brand */}
      <div style={{ position: 'absolute', left: 260, width: 560, top: 1560 }}>
        <Logo id="cover4" at={0} width={560} mode="static" />
      </div>
    </AbsoluteFill>
  );
};
