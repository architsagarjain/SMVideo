import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { Footage } from '../components/Footage';
import { SiteCard } from '../components/Card';
import { Label, Slam } from '../components/Type';
import { clip } from '../clips';
import { lerp, E, rng } from '../lib';
import { C, F } from '../theme';

// 00:23-00:33  local frames 0-300.
export const A0 = 75, B0 = 150, C0 = 225, S4_END = 300;

const Verified: React.FC<{ text: string; at: number }> = ({ text, at }) => {
  const f = useCurrentFrame();
  const t = lerp(f, [at, at + 12], [0, 1], E.back);
  return (
    <div style={{ transform: `scale(${t})`, opacity: Math.min(1, t * 2), display: 'inline-flex', alignItems: 'center', gap: 10, background: '#E3EFE7', color: C.leaf, fontFamily: F.text, fontWeight: 600, fontSize: 28, padding: '10px 18px', borderRadius: 10, boxShadow: '0 10px 30px rgba(0,0,0,0.35)' }}>
      ✓ {text}
    </div>
  );
};

/** Callback to scene 2: the same two worlds, now joined. */
const Joined: React.FC = () => {
  const f = useCurrentFrame();
  const enter = lerp(f, [0, 12], [0, 1], E.out);
  const close = lerp(f, [60, 75], [0, 1], E.in);
  const line = lerp(f, [10, 26], [0, 1], E.inOut);
  const pulse = ((f - 26) % 22) / 22;
  const y1 = 980, y2 = 980;
  return (
    <AbsoluteFill style={{ background: C.night }}>
      {(['L', 'R'] as const).map((side) => (
        <div key={side} style={{ position: 'absolute', top: 0, height: 1920, width: 534, left: side === 'L' ? 0 : 546, overflow: 'hidden', transform: `translateY(${(side === 'L' ? -1 : 1) * (1 - enter) * 1920}px) scaleX(${1 - close})`, transformOrigin: side === 'L' ? '100% 50%' : '0% 50%' }}>
          <Footage src={clip(side === 'L' ? 's4_left' : 's4_right')} dur={75} from={[1.12, 0, 0]} to={[1.2, 0, 0]} grade={side === 'L' ? 'warm' : 'neutral'} />
          <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(10,17,13,0.6) 0%, rgba(10,17,13,0.1) 35%, rgba(10,17,13,0.2) 70%, rgba(10,17,13,0.75) 100%)' }} />
        </div>
      ))}
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id="jl" x1="0" x2="1"><stop offset="0" stopColor={C.harvest} /><stop offset="1" stopColor="#FFE2A8" /></linearGradient>
        </defs>
        <circle cx={150} cy={y1} r={10} fill={C.harvest} opacity={enter} />
        <circle cx={930} cy={y2} r={10} fill={C.harvest} opacity={line > 0.98 ? 1 : 0.3} />
        <line x1={150} y1={y1} x2={150 + 780 * line} y2={y2} stroke="url(#jl)" strokeWidth={5} />
        <line x1={150} y1={y1} x2={150 + 780 * line} y2={y2} stroke={C.harvest} strokeWidth={18} strokeOpacity={0.18} />
        {f > 26 && <circle cx={150 + 780 * pulse} cy={y1} r={9} fill="#FFF3D6" />}
        {line > 0.98 && <circle cx={930} cy={y2} r={10 + lerp(f, [26, 46], [0, 50])} fill="none" stroke={C.harvest} strokeOpacity={lerp(f, [26, 46], [0.8, 0])} strokeWidth={3} />}
      </svg>
      <div style={{ position: 'absolute', left: 40, top: 1050 }}><Verified text="Verified supplier" at={18} /></div>
      <div style={{ position: 'absolute', right: 40, top: 840 }}><Verified text="OTP-verified buyer" at={26} /></div>
      <div style={{ position: 'absolute', left: 48, top: 270 }}><Label text="Suppliers" at={4} color="#fff" size={24} /></div>
      <div style={{ position: 'absolute', right: 48, top: 270 }}><Label text="Buyers" at={8} color="#fff" size={24} /></div>
    </AbsoluteFill>
  );
};

/** Exploded-view rings and callouts around a product (no figures, just structure). */
const Exploded: React.FC<{ at: number; cx: number; cy: number; labels: string[]; spin?: number; blueprint?: boolean }> = ({ at, cx, cy, labels, spin = 0.4, blueprint }) => {
  const f = useCurrentFrame() - at;
  const t = lerp(f, [0, 26], [0, 1], E.out);
  const r = rng(at);
  const parts = Array.from({ length: 70 }, () => ({ a: r() * Math.PI * 2, d: 120 + r() * 300, s: 1 + r() * 3, sp: (r() - 0.5) * 0.02 }));
  const stroke = blueprint ? '#BFE3D0' : '#FFE2A8';
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <radialGradient id={`halo${at}`}>
          <stop offset="0" stopColor="#04140C" stopOpacity={0.05} />
          <stop offset="0.55" stopColor="#04140C" stopOpacity={0.42} />
          <stop offset="1" stopColor="#04140C" stopOpacity={0} />
        </radialGradient>
        <filter id={`ts${at}`} x="-20%" y="-50%" width="140%" height="200%"><feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000" floodOpacity="0.8" /></filter>
      </defs>
      <circle cx={cx} cy={cy} r={470} fill={`url(#halo${at})`} opacity={t} />
      {[150, 230, 330].map((rad, i) => {
        const c = 2 * Math.PI * rad;
        return (
          <circle key={i} cx={cx} cy={cy} r={rad * (0.7 + 0.3 * t)} fill="none" stroke={stroke} strokeOpacity={0.85 - i * 0.15} strokeWidth={i === 0 ? 3.5 : 2.2}
            strokeDasharray={i === 1 ? '4 10' : `${c * t} ${c}`} transform={`rotate(${f * spin * (i % 2 ? -1 : 1) - 90} ${cx} ${cy})`} />
        );
      })}
      {blueprint &&
        Array.from({ length: 48 }, (_, i) => {
          const a = (i / 48) * Math.PI * 2 + f * 0.01;
          const r1 = 330, r2 = i % 4 === 0 ? 352 : 342;
          return <line key={i} x1={cx + Math.cos(a) * r1} y1={cy + Math.sin(a) * r1} x2={cx + Math.cos(a) * r2} y2={cy + Math.sin(a) * r2} stroke={stroke} strokeOpacity={0.6 * t} strokeWidth={1.5} />;
        })}
      {blueprint && (
        <g opacity={t * 0.7} stroke={stroke} strokeWidth={1.2}>
          <line x1={cx - 420} y1={cy} x2={cx + 420} y2={cy} strokeDasharray="10 8" />
          <line x1={cx} y1={cy - 420} x2={cx} y2={cy + 420} strokeDasharray="10 8" />
        </g>
      )}
      {parts.map((p, i) => {
        const d = p.d * (0.6 + 0.4 * t) + f * 0.6;
        const a = p.a + f * p.sp;
        return <circle key={i} cx={cx + Math.cos(a) * d} cy={cy + Math.sin(a) * d} r={p.s} fill={stroke} opacity={0.7 * t * Math.max(0, 1 - f / 120)} />;
      })}
      {labels.map((l, i) => {
        const lt = lerp(f, [10 + i * 8, 30 + i * 8], [0, 1], E.out);
        const ang = -0.9 + i * 1.6;
        const x0 = cx + Math.cos(ang) * 200, y0 = cy + Math.sin(ang) * 200;
        const x1 = cx + Math.cos(ang) * 285, y1 = cy + Math.sin(ang) * 285;
        const right = Math.cos(ang) > 0;
        const x2 = x1 + (right ? 40 : -40) * lt;
        return (
          <g key={l} opacity={lt}>
            <circle cx={x0} cy={y0} r={5} fill={stroke} />
            <polyline points={`${x0},${y0} ${x0 + (x1 - x0) * lt},${y0 + (y1 - y0) * lt} ${x2},${y1}`} fill="none" stroke={stroke} strokeWidth={2.4} />
            <text x={x2 + (right ? 10 : -10)} y={y1 + 8} textAnchor={right ? 'start' : 'end'} fill="#fff" filter={`url(#ts${at})`} fontFamily={F.label} fontSize={24} letterSpacing="0.12em" fontWeight={600}>{l.toUpperCase()}</text>
          </g>
        );
      })}
    </svg>
  );
};

/** Circular match-cut: the next shot opens from the circle at the centre of this one. */
const Iris: React.FC<{ at: number; children: React.ReactNode; cx?: number; cy?: number }> = ({ at, children, cx = 540, cy = 960 }) => {
  const f = useCurrentFrame();
  const r = lerp(f, [at, at + 14], [150, 1300], E.in);
  const rot = lerp(f, [at, at + 14], [-25, 0], E.out);
  if (f < at) return null;
  return (
    <AbsoluteFill style={{ clipPath: `circle(${r}px at ${cx}px ${cy}px)` }}>
      <AbsoluteFill style={{ transform: `rotate(${rot}deg) scale(${lerp(f, [at, at + 20], [1.25, 1], E.out)})` }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

const CardIn: React.FC<{ at: number; out: number; card: string; media: string; mediaStart?: number; h?: number }> = ({ at, out, card, media, mediaStart, h }) => {
  const f = useCurrentFrame();
  const t = lerp(f, [at, at + 14], [0, 1], E.out);
  const o = lerp(f, [out, out + 10], [0, 1], E.in);
  if (f < at || f > out + 12) return null;
  return (
    <div style={{ position: 'absolute', left: 266, top: 690, transformOrigin: '50% 100%', transform: `perspective(1400px) translateY(${(1 - t) * 120 - o * 60}px) rotateX(${(1 - t) * 30}deg) rotateY(${-8 + t * 4}deg) rotateZ(${(1 - t) * -6}deg) scale(${0.76 + o * 0.08})`, opacity: t * t * (1 - o) }}>
      <SiteCard card={card} media={media} mediaStart={mediaStart} h={h} />
    </div>
  );
};

export const S4Offer: React.FC = () => {
  const f = useCurrentFrame();
  const shade = (o: number) => <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(4,20,12,${o}) 0%, rgba(4,20,12,0.1) 38%, rgba(4,20,12,0.1) 60%, rgba(4,20,12,${o}) 100%)` }} />;
  return (
    <AbsoluteFill style={{ background: C.night }}>
      <Sequence durationInFrames={A0 + 2}><Joined /></Sequence>

      {/* A. Biomass fuels */}
      <Sequence from={A0 - 14} durationInFrames={B0 - A0 + 30}>
        <Iris at={14} cy={780}>
          <Footage src={clip('s4_pellets')} dur={B0 - A0 + 16} from={[1.3, 0, 0]} to={[1.08, 0, 0]} grade="warm" />
          <Sequence from={52}>
            <Footage src={clip('s4_briq')} dur={B0 - A0 - 44} from={[1.18, 0, 0]} to={[1.06, 0, -30]} grade="warm" />
          </Sequence>
          {shade(0.6)}
          <Exploded at={20} cx={540} cy={780} labels={['Pellets', 'Briquettes']} />
        </Iris>
      </Sequence>
      {/* B. Raw materials: the pellet's circle becomes the bale */}
      <Sequence from={B0 - 14} durationInFrames={C0 - B0 + 30}>
        <Iris at={14} cy={780}>
          <Footage src={clip('s4_bales')} dur={C0 - B0 + 16} from={[1.3, 0, 0]} to={[1.08, 0, 0]} grade="golden" />
          {shade(0.6)}
          <Exploded at={20} cx={540} cy={780} labels={['Crop residue', 'Feedstock']} spin={-0.3} />
        </Iris>
      </Sequence>
      {/* C. Machinery: the bale's circle becomes a machine part */}
      <Sequence from={C0 - 14} durationInFrames={S4_END - C0 + 14}>
        <Iris at={14} cy={780}>
          <Footage src={clip('s4_machine')} dur={S4_END - C0} from={[1.25, 0, 0]} to={[1.06, 0, 0]} grade="industrial" />
          {shade(0.65)}
          <Exploded at={20} cx={540} cy={780} labels={['Pellet mills', 'Balers']} blueprint spin={0.8} />
        </Iris>
      </Sequence>

      <CardIn at={A0 + 24} out={B0 - 13} card="card_cofiring" media={clip('s4_pellets')} />
      <CardIn at={B0 + 24} out={C0 - 13} card="card_roundbales" media={clip('s4_bales')} />
      <CardIn at={C0 + 24} out={S4_END - 18} card="card_pelletmill" media={clip('s2_pellets')} h={710} />

      <div style={{ position: 'absolute', left: 80, right: 80, top: 300 }}>
        <Label text="01" at={A0 + 6} out={B0 - 10} color={C.harvest} size={24} />
        <div style={{ height: 18 }} />
        <Slam text="BIOMASS FUELS" at={A0 + 8} out={B0 - 10} size={96} />
      </div>
      <div style={{ position: 'absolute', left: 80, right: 80, top: 300 }}>
        <Label text="02" at={B0 + 6} out={C0 - 10} color={C.harvest} size={24} />
        <div style={{ height: 18 }} />
        <Slam text="RAW MATERIALS" at={B0 + 8} out={C0 - 10} size={96} />
      </div>
      <div style={{ position: 'absolute', left: 80, right: 80, top: 300 }}>
        <Label text="03" at={C0 + 6} out={S4_END - 16} color={C.harvest} size={24} />
        <div style={{ height: 18 }} />
        <Slam text="MACHINERY" at={C0 + 8} out={S4_END - 16} size={96} />
      </div>
      {/* exit: everything drops into the dark interface world */}
      <AbsoluteFill style={{ background: C.night, opacity: lerp(f, [S4_END - 16, S4_END], [0, 1], E.in) }} />
    </AbsoluteFill>
  );
};
