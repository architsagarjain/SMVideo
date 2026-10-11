import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { Slam } from '../components/Type';
import { MapCanvas } from '../components/MapCanvas';
import india from '../data/india.json';
import { lerp, E } from '../lib';
import { C, F } from '../theme';

// 00:33-00:41.5  local frames 0-255. The platform as a market terminal.
export const P0 = 0, Q0 = 75, R0 = 135, S5_END = 255;

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
  const t = lerp(f, [at + 6, at + 34], [0, 1], E.inOut);
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


// Supply board row for "Agro pellets" on the live site (Punjab ... Tamil Nadu).
const SUPPLY: [string, 'Available' | 'Limited'][] = [
  ['Punjab', 'Available'], ['Haryana', 'Available'], ['Uttar Pradesh', 'Available'],
  ['Gujarat', 'Available'], ['Maharashtra', 'Available'], ['Tamil Nadu', 'Limited'],
];
const GREEN = 'rgba(120,220,160,1)';
const AMBER = 'rgba(232,176,75,1)';

// window geometry (screen px)
const WX = 50, WY = 548, WW = 980, WH = 830;
// flat map placement inside the window
const MAP_ZOOM = 0.36, MAP_SX = 300, MAP_SY = 905;

const Chip: React.FC<{ status: string }> = ({ status }) => {
  const ok = status === 'Available';
  return (
    <span style={{ fontFamily: F.text, fontSize: 24, fontWeight: 600, padding: '6px 14px', borderRadius: 8, background: ok ? '#E3EFE7' : '#FBEBD0', color: ok ? C.leaf : '#8A5A0B' }}>
      {status}
    </span>
  );
};

/** Market intelligence: one IndiaBiomass window holding supply (map + list) and policy. */
const Intelligence: React.FC<{ m: number }> = ({ m }) => {
  const st = india.states as unknown as Record<string, [number, number]>;
  const win = lerp(m, [0, 14], [0, 1], E.out);
  const settle = lerp(m, [60, 80], [0, 1], E.inOut); // "all in one place"
  const glow = lerp(m, [60, 70, 100], [0, 1, 0.35], E.soft);
  const cam = { cx: 500, cy: 560, zoom: MAP_ZOOM, tilt: 0, rot: 0, ox: MAP_SX - 540, oy: MAP_SY - 960 };
  const mapA = lerp(m, [6, 18], [0, 1], E.out);
  const listTop = 690, rowH = 66;
  return (
    <AbsoluteFill style={{ transform: `scale(${(1.06 - 0.06 * win) * (1 - 0.03 * settle)})`, opacity: win, transformOrigin: '50% 52%' }}>
      {/* the window */}
      <div
        style={{
          position: 'absolute', left: WX, top: WY, width: WW, height: WH, borderRadius: 26, overflow: 'hidden',
          background: 'linear-gradient(180deg, #0C2419 0%, #0A1A12 100%)',
          border: `2px solid rgba(232,176,75,${0.35 + 0.45 * glow})`,
          boxShadow: `0 40px 120px rgba(0,0,0,0.6), 0 0 ${30 + 70 * glow}px rgba(232,176,75,${0.12 + 0.3 * glow})`,
        }}
      >
        <Img src={staticFile('ui/home_nav.png')} style={{ width: WW, display: 'block' }} />
        <div style={{ height: 2, background: 'rgba(232,176,75,0.35)' }} />
        <div style={{ position: 'absolute', left: 40, top: 100, fontFamily: F.label, fontSize: 22, fontWeight: 600, letterSpacing: '0.18em', color: C.harvest, opacity: mapA }}>
          SUPPLY BOARD · AGRO PELLETS · THIS WEEK
        </div>
      </div>
      {/* flat India map with supply markers */}
      <AbsoluteFill style={{ opacity: mapA }}>
        <MapCanvas
          cam={cam}
          draw={({ P, glow: g, land, ctx }) => {
            land('rgba(30,90,60,1)', 0.75, 'rgba(232,176,75,1)', 0.85, 1.8, 0.25);
            ctx.globalCompositeOperation = 'lighter';
            SUPPLY.forEach(([n, s], i) => {
              const a = lerp(m, [14 + i * 4, 22 + i * 4], [0, 1]);
              const [x, y] = P(st[n][0], st[n][1]);
              const pulse = 1 + 0.25 * Math.sin((m - i * 4) * 0.35);
              g(x, y, 34 * pulse, s === 'Available' ? GREEN : AMBER, a * 0.95);
            });
            ctx.globalCompositeOperation = 'source-over';
          }}
        />
      </AbsoluteFill>
      {/* list: state + status, in the site's chip style */}
      {SUPPLY.map(([n, s], i) => {
        const a = lerp(m, [16 + i * 4, 28 + i * 4], [0, 1], E.out);
        return (
          <div key={n} style={{ position: 'absolute', left: 560, width: 440, top: listTop + i * rowH, height: rowH - 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: a, transform: `translateX(${(1 - a) * 40}px)`, borderBottom: i < SUPPLY.length - 1 ? '1px solid rgba(255,255,255,0.08)' : undefined }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 14, fontFamily: F.text, fontSize: 31, fontWeight: 600, color: '#fff' }}>
              <span style={{ width: 14, height: 14, borderRadius: 7, background: s === 'Available' ? '#78DCA0' : C.harvest, boxShadow: `0 0 12px ${s === 'Available' ? '#78DCA0' : C.harvest}` }} />
              {n}
            </span>
            <Chip status={s} />
          </div>
        );
      })}
      {/* policy tracker card */}
      {(() => {
        const a = lerp(m, [32, 48], [0, 1], E.out);
        return (
          <div style={{ position: 'absolute', left: WX + 30, width: WW - 60, top: 1118, background: '#fff', borderRadius: 18, padding: '22px 28px', boxShadow: '0 24px 60px rgba(0,0,0,0.45)', opacity: a, transform: `translateY(${(1 - a) * 60}px)`, fontFamily: F.text }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: F.label, fontSize: 19, fontWeight: 600, letterSpacing: '0.16em', color: C.ochre, marginRight: 8 }}>POLICY TRACKER</span>
              <span style={{ fontSize: 20, fontWeight: 600, padding: '4px 10px', borderRadius: 6, background: '#E3EFE7', color: C.leaf }}>In force</span>
              <span style={{ fontSize: 20, fontWeight: 600, padding: '4px 10px', borderRadius: 6, background: C.sand, color: C.slate }}>Central</span>
            </div>
            <div style={{ fontSize: 33, fontWeight: 600, color: C.ink, lineHeight: 1.22, marginTop: 12, letterSpacing: '-0.01em' }}>Mandatory biomass co-firing in coal-based thermal power plants</div>
            <div style={{ fontSize: 22, color: C.slate, marginTop: 8 }}>Ministry of Power</div>
          </div>
        );
      })()}
    </AbsoluteFill>
  );
};

export const S5Intel: React.FC = () => {
  const f = useCurrentFrame();
  const whip1 = lerp(f, [Q0 - 10, Q0 + 4], [0, 1], E.inOut);
  const whip2 = lerp(f, [R0 - 10, R0 + 4], [0, 1], E.inOut);
  const p1 = 1 - whip1;
  const blur = (w: number) => (w > 0 && w < 1 ? `blur(${Math.sin(w * Math.PI) * 18}px)` : undefined);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, #0E2A1D 0%, ${C.night} 70%)` }}>
      <Grid />
      {/* TENDERS */}
      <AbsoluteFill style={{ transform: `translateX(${-whip1 * 1200}px)`, filter: blur(whip1), opacity: f < Q0 + 6 ? 1 : 0 }}>
        <Screen src="home_tenders" w={1500} x={-120} y={lerp(f, [0, 22], [700, 560], E.out)} ry={22} rx={8} z={lerp(f, [0, 22], [-1400, -500], E.out)} crop={980} o={lerp(f, [0, 10], [0, 0.55]) * p1} />
        {[0, 1, 2].map((i) => <TenderRow key={i} i={i} at={8 + i * 6} />)}
      </AbsoluteFill>
      {/* PRICES */}
      <AbsoluteFill style={{ transform: `translateX(${(1 - whip1) * 1200 - whip2 * 1200}px)`, filter: blur(whip1 < 1 ? whip1 : whip2), opacity: f >= Q0 - 12 && f < R0 + 6 ? 1 : 0 }}>
        <Screen src="md_price" w={1500} x={-60} y={1130} ry={-20} rx={12} z={-600} crop={830} o={0.5} />
        <Chart at={Q0} />
      </AbsoluteFill>
      {/* MARKET INTELLIGENCE */}
      <AbsoluteFill style={{ opacity: f >= R0 - 12 ? 1 : 0, transform: `translateX(${(1 - whip2) * 1200}px)`, filter: blur(whip2) }}>
        <Intelligence m={f - R0} />
      </AbsoluteFill>
      <div style={{ position: 'absolute', left: 80, right: 80, top: 300 }}>
        <Slam text="TENDERS." at={4} out={Q0 - 12} size={120} />
      </div>
      <div style={{ position: 'absolute', left: 80, right: 80, top: 300 }}>
        <Slam text="PRICES." at={Q0 + 2} out={R0 - 12} size={120} />
      </div>
      <div style={{ position: 'absolute', left: 80, right: 80, top: 300 }}>
        <Slam text={'MARKET\nINTELLIGENCE.'} at={R0 + 2} out={S5_END - 8} size={100} />
      </div>
    </AbsoluteFill>
  );
};
