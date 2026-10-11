import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { Slam } from '../components/Type';
import { SampleTag } from '../components/Card';
import { MapCanvas } from '../components/MapCanvas';
import india from '../data/india.json';
import { lerp, E } from '../lib';
import { C, F } from '../theme';

// 00:37-00:47  local frames 0-300. The platform as a market terminal.
export const P0 = 0, Q0 = 105, R0 = 180;

const Grid: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ perspective: 900, overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute', left: -1200, right: -1200, top: 1150, height: 2600, transform: 'rotateX(78deg)', transformOrigin: '50% 0%',
          backgroundImage: `linear-gradient(rgba(232,176,75,0.22) 2px, transparent 2px), linear-gradient(90deg, rgba(232,176,75,0.16) 2px, transparent 2px)`,
          backgroundSize: '120px 120px', backgroundPosition: `0px ${f * 6}px`,
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, #000 30%, #000 60%, transparent 100%)',
        }}
      />
    </AbsoluteFill>
  );
};

/** A captured screen floating in 3D space. */
const Screen: React.FC<{ src: string; w: number; x: number; y: number; ry: number; rx: number; z?: number; crop?: number; o?: number; blur?: number }> = ({ src, w, x, y, ry, rx, z = 0, crop, o = 1, blur = 0 }) => (
  <div style={{ position: 'absolute', left: 0, top: 0, perspective: 1600, width: 1080, height: 1920, opacity: o, pointerEvents: 'none' }}>
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: crop, overflow: 'hidden', borderRadius: 20, transform: `translateZ(${z}px) rotateY(${ry}deg) rotateX(${rx}deg)`, boxShadow: '0 50px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(232,176,75,0.25)', filter: blur ? `blur(${blur}px)` : undefined }}>
      <Img src={staticFile(`ui/${src}.png`)} style={{ width: w, display: 'block' }} />
    </div>
  </div>
);

const TENDERS = [
  { t: 'Supply of agro-residue biomass pellets for co-firing, 3 lakh MT annual', o: 'NTPC Ltd · Uttar Pradesh · via NTPC e-procurement', d: '12 days left', red: false },
  { t: 'Rate contract for biomass pellets, Panipat TPS', o: 'HPGCL · Haryana · via Haryana e-procurement', d: '3 days left', red: true },
  { t: 'Paddy straw bales as CBG feedstock, 1.2 lakh MT per year', o: 'Indian Oil Corporation · Punjab · via CPPP', d: '21 days left', red: false },
];

/** Tender row in the site's own styling, re-set large for a phone screen. */
const TenderRow: React.FC<{ i: number; at: number }> = ({ i, at }) => {
  const f = useCurrentFrame();
  const t = lerp(f, [at, at + 18], [0, 1], E.out);
  const r = TENDERS[i];
  return (
    <div
      style={{
        position: 'absolute', left: 70, width: 940, top: 640 + i * 200, background: '#fff', borderRadius: 18, padding: '26px 30px',
        boxShadow: '0 30px 70px rgba(0,0,0,0.5)', fontFamily: F.text,
        transform: `perspective(1600px) translate3d(${(1 - t) * 260}px, ${(1 - t) * -120}px, ${(1 - t) * -900}px) rotateY(${(1 - t) * -28}deg)`,
        opacity: Math.min(1, t * 1.5),
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20 }}>
        <div style={{ fontSize: 31, fontWeight: 600, color: C.ink, lineHeight: 1.25, letterSpacing: '-0.01em' }}>{r.t}</div>
        <div style={{ flex: 'none', fontSize: 22, fontWeight: 600, padding: '8px 14px', borderRadius: 8, background: r.red ? '#FAE4E2' : '#E3EFE7', color: r.red ? '#B3261E' : C.leaf, boxShadow: `0 0 ${lerp(f, [at + 18, at + 30, at + 60], [0, 24, 0])}px ${r.red ? 'rgba(179,38,30,0.6)' : 'rgba(232,176,75,0.8)'}` }}>{r.d}</div>
      </div>
      <div style={{ fontSize: 23, color: C.slate, marginTop: 10 }}>{r.o}</div>
    </div>
  );
};

// 8-week trend shape for "Agro-residue pellets, North" as drawn on the site (shape only).
const TREND = [0.18, 0.3, 0.36, 0.5, 0.46, 0.62, 0.66, 0.92];

const Chart: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  const t = lerp(f, [at + 8, at + 44], [0, 1], E.inOut);
  const enter = lerp(f, [at, at + 16], [0, 1], E.out);
  const W = 900, Hh = 420;
  const pts = TREND.map((v, i) => [40 + (i / (TREND.length - 1)) * (W - 80), Hh - 50 - v * (Hh - 120)] as const);
  // smooth path
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    const mx = (x0 + x1) / 2;
    d += ` C${mx},${y0} ${mx},${y1} ${x1},${y1}`;
  }
  const len = 1400;
  const head = Math.min(pts.length - 1, t * (pts.length - 1));
  const hi = Math.floor(head), hf = head - hi;
  const hp = hi >= pts.length - 1 ? pts[pts.length - 1] : [pts[hi][0] + (pts[hi + 1][0] - pts[hi][0]) * hf, pts[hi][1] + (pts[hi + 1][1] - pts[hi][1]) * hf];
  return (
    <div style={{ position: 'absolute', left: 90, top: 660, width: W, opacity: enter, transform: `perspective(1600px) translateZ(${(1 - enter) * -500}px) rotateX(${(1 - enter) * 20}deg)` }}>
      <div style={{ background: 'rgba(10,17,13,0.82)', border: '1px solid rgba(232,176,75,0.35)', borderRadius: 22, padding: '28px 0 12px', boxShadow: '0 40px 100px rgba(0,0,0,0.6)' }}>
        <div style={{ padding: '0 34px', display: 'flex', justifyContent: 'space-between', fontFamily: F.label }}>
          <div>
            <div style={{ fontSize: 22, letterSpacing: '0.16em', color: C.harvest, fontWeight: 600 }}>WEEKLY PRICE INDEX</div>
            <div style={{ fontFamily: F.text, fontSize: 34, color: '#fff', fontWeight: 600, marginTop: 6 }}>Agro-residue pellets</div>
            <div style={{ fontFamily: F.text, fontSize: 24, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>North (Punjab, Haryana) · 8-week trend</div>
          </div>
        </div>
        <svg width={W} height={Hh}>
          <defs>
            <linearGradient id="area" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={C.harvest} stopOpacity={0.35} /><stop offset="1" stopColor={C.harvest} stopOpacity={0} /></linearGradient>
            <clipPath id="reveal"><rect x={0} y={0} width={hp[0]} height={Hh} /></clipPath>
          </defs>
          {[0, 1, 2, 3].map((k) => <line key={k} x1={40} x2={W - 40} y1={70 + k * 100} y2={70 + k * 100} stroke="rgba(255,255,255,0.08)" />)}
          {TREND.map((_, k) => <line key={k} y1={60} y2={Hh - 40} x1={pts[k][0]} x2={pts[k][0]} stroke="rgba(255,255,255,0.05)" />)}
          <path d={`${d} L${pts[pts.length - 1][0]},${Hh - 40} L${pts[0][0]},${Hh - 40} Z`} fill="url(#area)" clipPath="url(#reveal)" />
          <path d={d} fill="none" stroke={C.harvest} strokeWidth={10} strokeOpacity={0.25} strokeDasharray={`${len * t} ${len}`} style={{ filter: 'blur(6px)' }} />
          <path d={d} fill="none" stroke="#FFD58A" strokeWidth={4} strokeDasharray={`${len * t} ${len}`} strokeLinecap="round" />
          <circle cx={hp[0]} cy={hp[1]} r={9} fill="#FFF3D6" />
          <circle cx={hp[0]} cy={hp[1]} r={24} fill={C.harvest} opacity={0.25} />
        </svg>
      </div>
    </div>
  );
};

const STATES: [string, string][] = [['Punjab', 'Available'], ['Haryana', 'Available'], ['Uttar Pradesh', 'Available'], ['Gujarat', 'Available'], ['Maharashtra', 'Available'], ['Tamil Nadu', 'Limited']];

export const S5Intel: React.FC = () => {
  const f = useCurrentFrame();
  const whip1 = lerp(f, [Q0 - 10, Q0 + 4], [0, 1], E.inOut);
  const whip2 = lerp(f, [R0 - 10, R0 + 4], [0, 1], E.inOut);
  const one = lerp(f, [262, 286], [0, 1], E.inOut); // "all in one place"
  const p1 = (1 - whip1);
  const st = india.states as unknown as Record<string, [number, number]>;
  const mapIn = lerp(f, [R0, R0 + 24], [0, 1], E.out);
  const cam = { cx: 480, cy: 560, zoom: 0.62 + mapIn * 0.06 - one * 0.1, tilt: 34, rot: -4 + (f - R0) * 0.04, oy: -40 - one * 120 };
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, #0E2A1D 0%, ${C.night} 70%)` }}>
      <Grid />
      {/* TENDERS */}
      <AbsoluteFill style={{ transform: `translateX(${-whip1 * 1200}px)`, filter: whip1 > 0 && whip1 < 1 ? `blur(${Math.sin(whip1 * Math.PI) * 18}px)` : undefined, opacity: f < Q0 + 6 ? 1 : 0 }}>
        <Screen src="home_tenders" w={1500} x={-120} y={lerp(f, [0, 30], [700, 560], E.out)} ry={22} rx={8} z={lerp(f, [0, 30], [-1400, -500], E.out)} crop={980} o={lerp(f, [0, 12], [0, 0.55]) * p1} />
        {[0, 1, 2].map((i) => <TenderRow key={i} i={i} at={20 + i * 10} />)}
      </AbsoluteFill>
      {/* PRICES */}
      <AbsoluteFill style={{ transform: `translateX(${(1 - whip1) * 1200 - whip2 * 1200}px)`, filter: (whip1 > 0 && whip1 < 1) || (whip2 > 0 && whip2 < 1) ? `blur(${Math.sin((whip1 < 1 ? whip1 : whip2) * Math.PI) * 18}px)` : undefined, opacity: f >= Q0 - 12 && f < R0 + 6 ? 1 : 0 }}>
        <Screen src="md_price" w={1500} x={-60} y={1130} ry={-20} rx={12} z={-600} crop={830} o={0.5} />
        <Chart at={Q0} />
      </AbsoluteFill>
      {/* MARKET INTELLIGENCE: supply map + policy */}
      <AbsoluteFill style={{ opacity: f >= R0 - 12 ? 1 : 0, transform: `translateX(${(1 - whip2) * 1200}px)` }}>
        <Screen src="md_supply" w={1400} x={-160 + one * 150} y={1220 - one * 180} ry={18} rx={10} z={-700 + one * 300} crop={844 * 1400 / 2560} o={0.55 * (1 - one * 0.2)} />
        <MapCanvas
          cam={cam}
          draw={({ P, glow, land, ctx }) => {
            land('rgba(30,90,60,1)', 0.5, 'rgba(232,176,75,1)', 0.7, 1.6, 0.3);
            ctx.globalCompositeOperation = 'lighter';
            STATES.forEach(([n, s], i) => {
              const [x, y] = P(st[n][0], st[n][1]);
              const a = lerp(f, [R0 + 14 + i * 5, R0 + 24 + i * 5], [0, 1]);
              const col = s === 'Available' ? 'rgba(120,220,160,1)' : 'rgba(232,176,75,1)';
              glow(x, y, 46 * (1 + 0.15 * Math.sin(f * 0.3 + i)), col, a * 0.9);
            });
            ctx.globalCompositeOperation = 'source-over';
          }}
        />
        {STATES.map(([n, s], i) => {
          // label chips track the projected marker positions (approximate overlay)
          const a = lerp(f, [R0 + 16 + i * 5, R0 + 28 + i * 5], [0, 1], E.out);
          const pos: Record<string, [number, number]> = { Punjab: [-1, 0], Haryana: [1, 0], 'Uttar Pradesh': [1, 0], Gujarat: [-1, 0], Maharashtra: [1, 0], 'Tamil Nadu': [1, 0] };
          return <StateChip key={n} name={n} status={s} a={a * (1 - one)} side={pos[n][0]} cam={cam} pt={st[n]} />;
        })}
        <div style={{ position: 'absolute', left: 560 - one * 470, top: 1080 - one * 40, width: 460 + one * 440, opacity: lerp(f, [R0 + 40, R0 + 56], [0, 1]), transform: `perspective(1400px) rotateY(${-14 * (1 - one)}deg)` }}>
          <div style={{ borderRadius: 18, overflow: 'hidden', boxShadow: '0 40px 90px rgba(0,0,0,0.6)' }}>
            <Img src={staticFile('ui/md_policy1.png')} style={{ width: '100%', display: 'block' }} />
          </div>
        </div>
      </AbsoluteFill>
      <div style={{ position: 'absolute', left: 80, right: 80, top: 300 }}>
        <Slam text="TENDERS." at={8} out={Q0 - 12} size={120} />
      </div>
      <div style={{ position: 'absolute', left: 80, right: 80, top: 300 }}>
        <Slam text="PRICES." at={Q0 + 2} out={R0 - 12} size={120} />
      </div>
      <div style={{ position: 'absolute', left: 80, right: 80, top: 300 }}>
        <Slam text={'MARKET\nINTELLIGENCE.'} at={R0 + 2} out={290} size={100} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1360, display: 'flex', justifyContent: 'center' }}>
        <SampleTag text="Interface preview · sample data" color="rgba(255,255,255,0.55)" />
      </div>
    </AbsoluteFill>
  );
};

const StateChip: React.FC<{ name: string; status: string; a: number; side: number; cam: any; pt: [number, number] }> = ({ name, status, a, side, cam, pt }) => {
  // same projection as MapCanvas (kept in sync manually)
  const D = 1700, t = (cam.tilt * Math.PI) / 180, rr = (cam.rot * Math.PI) / 180;
  const X = (pt[0] - cam.cx) * cam.zoom, Y = (pt[1] - cam.cy) * cam.zoom;
  const X2 = X * Math.cos(rr) - Y * Math.sin(rr), Y2 = X * Math.sin(rr) + Y * Math.cos(rr);
  const s = D / (D + Y2 * Math.sin(t));
  const x = 540 + X2 * s, y = 960 + (cam.oy ?? 0) + Y2 * Math.cos(t) * s;
  const avail = status === 'Available';
  return (
    <div style={{ position: 'absolute', left: x, top: y, opacity: a, transform: `translate(${side < 0 ? 'calc(-100% - 34px)' : '34px'}, -50%) scale(${0.8 + a * 0.2})`, display: 'flex', gap: 8, alignItems: 'center', fontFamily: F.text, whiteSpace: 'nowrap' }}>
      <span style={{ fontSize: 24, fontWeight: 600, color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>{name}</span>
      <span style={{ fontSize: 19, fontWeight: 600, padding: '4px 10px', borderRadius: 7, background: avail ? '#E3EFE7' : '#FBEBD0', color: avail ? C.leaf : '#9A6B12' }}>{status}</span>
    </div>
  );
};
