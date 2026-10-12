import { AbsoluteFill, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ReelShell, BrandBg, EndCard, ReelData, wordAt, Glass } from './common';
import { Kinetic, Label, Slam } from '../components/Type';
import { LightLeak } from '../components/LightLeak';
import { Footage } from '../components/Footage';
import { clip } from '../clips';
import { lerp, E } from '../lib';
import { C, F } from '../theme';
import data from '../data/reel2.json';

// Reel 2, "Tender words". One centred grid for every section:
// series chip at y=200, the term at 300, its full form under it,
// the diagram in a glass card at 690-1330, subtitles at 1430.
const D = data as unknown as ReelData;
const T = {
  and: wordAt(D, 'and'),
  emd: wordAt(D, 'e-m-d'), earnest: wordAt(D, 'earnest'), refundable: wordAt(D, 'refundable'), bid: wordAt(D, 'bid'),
  gcv: wordAt(D, 'g-c-v'), gross: wordAt(D, 'gross'), heat: wordAt(D, 'heat'), minimum: wordAt(D, 'minimum'),
  l1: wordAt(D, 'l-1'), lowest: wordAt(D, 'lowest'), wins: wordAt(D, 'wins'),
  mse: wordAt(D, 'mseexemption'), registered: wordAt(D, 'registered'), skip: wordAt(D, 'skip'),
  ra: wordAt(D, 'reverse'), after: wordAt(D, 'after'), cut: wordAt(D, 'cut'),
  save: wordAt(D, 'save'),
  end: D.words[D.words.length - 1].e + 10,
};
const SECTIONS = [T.emd - 8, T.gcv - 8, T.l1 - 8, T.mse - 8, T.ra - 8, T.save - 6];
const GREEN = '#7BD9A0';
const RED = '#E5484D';
const CARD = { left: 90, top: 690, width: 900, height: 640 };

/** Dim, slowed footage behind a section so the graphics sit in a real place. */
const Backdrop: React.FC<{ src: string; from: number; dur: number; rate?: number; opacity?: number }> = ({ src, from, dur, rate = 0.5, opacity = 0.34 }) => (
  <AbsoluteFill style={{ opacity }}>
    <Sequence from={from}><Footage src={clip(src)} dur={dur} rate={rate} from={[1.18, 0, 0]} to={[1.06, 0, 0]} grade="warm" /></Sequence>
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(3,24,15,0.55) 0%, rgba(3,24,15,0.2) 45%, rgba(3,24,15,0.75) 100%)' }} />
  </AbsoluteFill>
);

/** Series chip, centred: "TENDER WORDS · 0n / 05" with progress dots under it. */
const Progress: React.FC<{ n: number; at: number }> = ({ n, at }) => {
  const f = useCurrentFrame();
  const a = lerp(f, [at, at + 10], [0, 1], E.out);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 196, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, opacity: a, transform: `translateY(${(1 - a) * -14}px)` }}>
      <div style={{ fontFamily: F.label, fontWeight: 600, fontSize: 24, letterSpacing: '0.24em', color: C.harvest, background: 'rgba(4,20,12,0.7)', border: '1.5px solid rgba(232,176,75,0.45)', borderRadius: 999, padding: '10px 26px' }}>
        TENDER WORDS · 0{n} / 05
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        {[1, 2, 3, 4, 5].map((k) => (
          <span key={k} style={{ width: k === n ? 40 : 12, height: 12, borderRadius: 6, background: k <= n ? C.harvest : 'rgba(255,255,255,0.25)' }} />
        ))}
      </div>
    </div>
  );
};

/** The term, big and centred, with its full form under it. */
const Term: React.FC<{ term: string; full: string; at: number; fullAt: number; out: number; size?: number }> = ({ term, full, at, fullAt, out, size = 200 }) => {
  const f = useCurrentFrame();
  const fa = lerp(f, [fullAt - 2, fullAt + 12], [0, 1], E.out);
  const o = lerp(f, [out - 8, out], [1, 0]);
  return (
    <div style={{ position: 'absolute', left: 40, right: 40, top: 300, textAlign: 'center', opacity: o }}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Slam text={term} at={at} out={out + 30} size={size} color={C.harvest} />
      </div>
      <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 52, color: '#fff', letterSpacing: '-0.02em', marginTop: 16, opacity: fa, transform: `translateY(${(1 - fa) * 18}px)` }}>{full}</div>
    </div>
  );
};

/** Centred glass card that rises in, holding the section's diagram. */
const Stage: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => {
  const f = useCurrentFrame();
  const a = lerp(f, [at, at + 16], [0, 1], E.out);
  return (
    <div style={{ position: 'absolute', ...CARD, opacity: a, transform: `translateY(${(1 - a) * 50}px) scale(${0.96 + 0.04 * a})` }}>
      <Glass style={{ position: 'absolute', inset: 0 }} />
      <svg width={CARD.width} height={CARD.height} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>{children}</svg>
    </div>
  );
};

const Caption: React.FC<{ x?: number; y: number; text: string; color?: string; size?: number; opacity?: number }> = ({ x = CARD.width / 2, y, text, color = 'rgba(255,255,255,0.6)', size = 22, opacity = 1 }) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={F.label} fontWeight={600} fontSize={size} letterSpacing={size * 0.18} fill={color} opacity={opacity}>{text}</text>
);

/** Round ₹ deposit token. */
const Coin: React.FC<{ x: number; y: number; r?: number; label?: string }> = ({ x, y, r = 62, label = 'EMD' }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r + 10} fill="rgba(232,176,75,0.18)" />
    <circle r={r} fill={C.harvest} />
    <circle r={r - 12} fill="none" stroke="#8A5A0B" strokeWidth={4} />
    <text y={-2} textAnchor="middle" dominantBaseline="middle" fontFamily={F.display} fontWeight={800} fontSize={r * 0.95} fill="#5B3A06">₹</text>
    {label && <text y={r + 48} textAnchor="middle" fontFamily={F.label} fontWeight={700} fontSize={26} letterSpacing={5} fill={C.harvest}>{label}</text>}
  </g>
);

/** Node: rounded tile with a simple pictogram and a caption. */
const NodeTile: React.FC<{ x: number; y: number; title: string; kind: 'you' | 'buyer' }> = ({ x, y, title, kind }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-110} y={-110} width={220} height={220} rx={36} fill="#F7F6F2" />
    {kind === 'you' ? (
      // bid document
      <g>
        <path d="M-44 -62 H24 L48 -38 V62 H-44 Z" fill="#fff" stroke={C.forest} strokeWidth={6} strokeLinejoin="round" />
        <path d="M24 -62 V-38 H48" fill="none" stroke={C.forest} strokeWidth={6} strokeLinejoin="round" />
        {[-20, 0, 20, 40].map((ly, i) => <line key={i} x1={-28} x2={i === 3 ? 6 : 32} y1={ly} y2={ly} stroke={i === 0 ? C.ochre : '#9AA59D'} strokeWidth={6} strokeLinecap="round" />)}
      </g>
    ) : (
      // buyer: plant with stack
      <g>
        <path d="M-56 58 V-6 L-22 -26 V-6 L12 -26 V-6 H22 V-58 H44 V58 Z" fill={C.forest} />
        <rect x={-42} y={14} width={16} height={18} rx={3} fill={C.harvest} />
        <rect x={-14} y={14} width={16} height={18} rx={3} fill={C.harvest} />
        <rect x={14} y={14} width={16} height={18} rx={3} fill={C.harvest} />
      </g>
    )}
    <text y={160} textAnchor="middle" fontFamily={F.label} fontWeight={700} fontSize={26} letterSpacing={5} fill="#fff">{title}</text>
  </g>
);

// ------------------------------------------------------------------ hook: a tender notice, five words lit up
const NOTICE: { pre: string; term: string; post: string }[] = [
  { pre: 'Earnest Money Deposit (', term: 'EMD', post: '): as per NIT' },
  { pre: 'Minimum ', term: 'GCV', post: ': as specified' },
  { pre: 'Evaluation: ', term: 'L1', post: ' (lowest price)' },
  { pre: '', term: 'MSE', post: ' exemption: applicable' },
  { pre: '', term: 'Reverse auction', post: ': Yes' },
];
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const card = lerp(f, [2, 22], [0, 1], E.out);
  const out = SECTIONS[0];
  const exit = lerp(f, [out - 10, out], [0, 1], E.in);
  return (
    <AbsoluteFill>
      <BrandBg />
      <Backdrop src="r_shavings" from={0} dur={out} rate={0.5} opacity={0.3} />
      <div style={{ position: 'absolute', left: 60, right: 60, top: 220 }}>
        <Kinetic lines={['5 WORDS', 'IN EVERY', 'BIOMASS TENDER']} at={4} out={out - 10} size={104} align="center" stagger={0.8} />
      </div>
      {/* the notice */}
      <div
        style={{
          position: 'absolute', left: 110, width: 860, top: 640, padding: '40px 48px 34px', background: '#F7F6F2', borderRadius: 22,
          boxShadow: '0 40px 100px rgba(0,0,0,0.55)', opacity: card * (1 - exit), boxSizing: 'border-box',
          transform: `perspective(1600px) rotateX(${(1 - card) * 18}deg) translateY(${(1 - card) * 80 - exit * 40}px)`,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: `3px solid ${C.forest}`, paddingBottom: 16, marginBottom: 18 }}>
          <span style={{ fontFamily: F.label, fontWeight: 700, fontSize: 28, letterSpacing: '0.2em', color: C.forest }}>TENDER NOTICE</span>
          <span style={{ fontFamily: F.label, fontWeight: 600, fontSize: 20, letterSpacing: '0.16em', color: C.slate }}>BIOMASS · SUPPLY</span>
        </div>
        <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 34, color: C.ink, marginBottom: 14, letterSpacing: '-0.01em' }}>Supply of biomass pellets for co-firing</div>
        {NOTICE.map((row, i) => {
          const s = 22 + i * 18; // highlighter sweeps in order while the hook line plays
          const hl = lerp(f, [s, s + 12], [0, 1], E.inOut);
          return (
            <div key={i} style={{ fontFamily: F.text, fontSize: 30, color: '#3B443E', lineHeight: 1.25, padding: '12px 0', borderTop: `1px solid ${C.line}` }}>
              {row.pre}
              <span style={{ position: 'relative', display: 'inline-block', fontWeight: 700, color: C.ink }}>
                <span style={{ position: 'absolute', left: -6, right: -6, top: 4, bottom: 0, background: C.harvest, borderRadius: 6, transformOrigin: 'left', transform: `scaleX(${hl})`, opacity: 0.85 }} />
                <span style={{ position: 'relative' }}>{row.term}</span>
              </span>
              {row.post}
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1280, display: 'flex', justifyContent: 'center', opacity: 1 - exit }}>
        <Label text="…and what they actually mean" at={T.and} color={C.harvest} size={30} rule={false} />
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ 1. EMD: deposit goes with the bid, comes back
const EmdDiagram: React.FC = () => {
  const f = useCurrentFrame();
  const YX = 200, BX = 700, NY = 270;
  const line = lerp(f, [T.earnest - 4, T.earnest + 14], [0, 1], E.out);
  const go = lerp(f, [T.refundable - 6, T.refundable + 26], [0, 1], E.inOut);
  const back = lerp(f, [T.bid - 8, T.bid + 20], [0, 1], E.inOut);
  // the coin rides the top arc to the buyer, then the lower arc home
  const arc = (t: number, up: boolean) => [YX + (BX - YX) * t, NY + (up ? -1 : 1) * Math.sin(Math.PI * t) * 200];
  const [cx, cy] = back > 0 ? arc(1 - back, false) : arc(go, true);
  const L = 700;
  return (
    <Stage at={T.emd + 2}>
      <path d={`M${YX},${NY - 120} Q${(YX + BX) / 2},${NY - 280} ${BX},${NY - 120}`} fill="none" stroke={C.harvest} strokeWidth={5} strokeDasharray="14 12" opacity={line * 0.8} />
      <path d={`M${BX},${NY + 120} Q${(YX + BX) / 2},${NY + 280} ${YX},${NY + 120}`} fill="none" stroke={GREEN} strokeWidth={6} strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - back)} />
      {back > 0.9 && <path d={`M${YX + 4},${NY + 150} L${YX},${NY + 122} L${YX + 30},${NY + 116}`} fill="none" stroke={GREEN} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />}
      <text x={(YX + BX) / 2} y={NY - 222} textAnchor="middle" fontFamily={F.text} fontWeight={600} fontSize={30} fill={C.harvest} opacity={line}>goes in with your bid</text>
      <text x={(YX + BX) / 2} y={NY + 248} textAnchor="middle" fontFamily={F.text} fontWeight={600} fontSize={34} fill={GREEN} opacity={back}>↩ Refundable</text>
      <NodeTile x={YX} y={NY} title="YOU" kind="you" />
      <NodeTile x={BX} y={NY} title="BUYER" kind="buyer" />
      <g opacity={line}><Coin x={cx} y={cy} r={46} label="" /></g>
      <Caption y={600} text="A SECURITY DEPOSIT, NOT A FEE" color="rgba(255,255,255,0.7)" opacity={lerp(f, [T.refundable + 10, T.refundable + 24], [0, 1])} />
    </Stage>
  );
};

// ------------------------------------------------------------------ 2. GCV: a heat gauge with the buyer's minimum
const GcvDiagram: React.FC = () => {
  const f = useCurrentFrame();
  const cx = CARD.width / 2, cy = 380, R = 270;
  const MIN = 0.62;
  const v = lerp(f, [T.heat - 6, T.heat + 40], [0.04, 0.86], E.inOut);
  const minA = lerp(f, [T.minimum - 8, T.minimum + 6], [0, 1], E.out);
  const pass = v > MIN && f >= T.minimum;
  const ang = (t: number) => Math.PI * (1 - t); // 0 → left, 1 → right
  const pt = (t: number, r: number) => [cx + Math.cos(ang(t)) * r, cy - Math.sin(ang(t)) * r];
  const arcPath = (a: number, b: number, r: number) => {
    const [x0, y0] = pt(a, r), [x1, y1] = pt(b, r);
    return `M${x0},${y0} A${r},${r} 0 0 1 ${x1},${y1}`;
  };
  const [nx, ny] = pt(v, R - 50);
  const [mx0, my0] = pt(MIN, R - 40), [mx1, my1] = pt(MIN, R + 40), [mlx, mly] = pt(MIN, R + 70);
  return (
    <Stage at={T.gcv + 2}>
      <defs>
        <linearGradient id="gcvHeat" x1="0" x2="1"><stop offset="0" stopColor="#E8B04B" /><stop offset="1" stopColor="#E0612B" /></linearGradient>
        <clipPath id="gcvTex"><circle cx={cx} cy={cy} r={92} /></clipPath>
      </defs>
      <path d={arcPath(0, 1, R)} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={46} strokeLinecap="round" />
      {v > 0.01 && <path d={arcPath(0, v, R)} fill="none" stroke="url(#gcvHeat)" strokeWidth={46} strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 14px rgba(232,120,40,0.65))' }} />}
      {/* buyer's minimum */}
      <g opacity={0.3 + 0.7 * minA}>
        <line x1={mx0} y1={my0} x2={mx1} y2={my1} stroke="#fff" strokeWidth={7} strokeLinecap="round" style={{ filter: minA > 0.5 ? 'drop-shadow(0 0 10px rgba(255,255,255,0.8))' : undefined }} />
        <text x={mlx + 14} y={mly} textAnchor="middle" fontFamily={F.label} fontWeight={700} fontSize={24} letterSpacing={4} fill="#fff">MIN</text>
      </g>
      {/* pellet hub + needle */}
      <image href={staticFile('reels/pellet_tex.jpg')} x={cx - 92} y={cy - 92} width={184} height={184} preserveAspectRatio="xMidYMid slice" clipPath="url(#gcvTex)" />
      <circle cx={cx} cy={cy} r={92} fill="none" stroke={C.harvest} strokeWidth={5} />
      <line x1={cx + Math.cos(ang(v)) * 96} y1={cy - Math.sin(ang(v)) * 96} x2={nx} y2={ny} stroke="#FFF3D6" strokeWidth={9} strokeLinecap="round" />
      <circle cx={nx} cy={ny} r={10} fill="#FFF3D6" />
      <text x={cx - R} y={cy + 62} textAnchor="middle" fontFamily={F.label} fontWeight={600} fontSize={22} letterSpacing={3} fill="rgba(255,255,255,0.55)">LOW</text>
      <text x={cx + R} y={cy + 62} textAnchor="middle" fontFamily={F.label} fontWeight={600} fontSize={22} letterSpacing={3} fill="rgba(255,255,255,0.55)">HIGH</text>
      <Caption y={cy + 150} text="HEAT PER KILO OF FUEL" color={C.harvest} size={24} opacity={lerp(f, [T.heat - 4, T.heat + 10], [0, 1])} />
      <g opacity={minA} transform={`translate(${cx} ${cy + 210})`}>
        <rect x={-270} y={-34} width={540} height={68} rx={34} fill={pass ? 'rgba(123,217,160,0.16)' : 'rgba(255,255,255,0.08)'} stroke={pass ? GREEN : 'rgba(255,255,255,0.3)'} strokeWidth={2} />
        <text y={10} textAnchor="middle" fontFamily={F.text} fontWeight={600} fontSize={28} fill={pass ? GREEN : '#fff'}>{pass ? '✓ Above the buyer’s minimum' : 'Buyer sets a minimum'}</text>
      </g>
    </Stage>
  );
};

// ------------------------------------------------------------------ 3. L1: bids sort, the lowest wins
const BIDS = [0.9, 0.76, 0.6, 0.84]; // relative bar lengths only, no figures
const L1Diagram: React.FC = () => {
  const f = useCurrentFrame();
  const sort = lerp(f, [T.lowest - 2, T.lowest + 20], [0, 1], E.inOut);
  const ranks = lerp(f, [T.lowest + 18, T.lowest + 30], [0, 1], E.out);
  const win = lerp(f, [T.wins - 4, T.wins + 10], [0, 1], E.back);
  const sorted = BIDS.map((v, i) => [v, i] as const).sort((a, b) => a[0] - b[0]).map(([, i]) => i);
  const RX = 70, RW = 760, RH = 96, Y0 = 80, STEP = 116;
  return (
    <Stage at={T.l1 + 2}>
      <Caption y={52} text="QUALIFIED BIDS · BAR = PRICE QUOTED" opacity={lerp(f, [T.l1 + 8, T.l1 + 20], [0, 1])} />
      {BIDS.map((v, i) => {
        const rank = sorted.indexOf(i);
        const y = Y0 + (i + (rank - i) * sort) * STEP;
        const isL1 = rank === 0;
        const grow = lerp(f, [T.l1 + 6 + i * 3, T.l1 + 26 + i * 3], [0, 1], E.out);
        const gold = isL1 ? sort : 0;
        const barX = RX + 210, barW = (RW - 340) * v * grow;
        return (
          <g key={i} transform={`translate(0 ${y})`}>
            <rect x={RX} y={0} width={RW} height={RH} rx={20} fill={isL1 && win > 0 ? 'rgba(232,176,75,0.14)' : 'rgba(255,255,255,0.05)'} stroke={isL1 ? `rgba(232,176,75,${0.15 + 0.85 * gold})` : 'rgba(255,255,255,0.08)'} strokeWidth={isL1 ? 3 : 1.5} />
            <text x={RX + 30} y={RH / 2 + 10} fontFamily={F.text} fontWeight={600} fontSize={30} fill="#fff">Bidder {String.fromCharCode(65 + i)}</text>
            <rect x={barX} y={RH / 2 - 18} width={barW} height={36} rx={18} fill={isL1 ? `rgba(232,176,75,${0.35 + 0.65 * gold})` : 'rgba(255,255,255,0.28)'} />
            <g opacity={ranks}>
              <rect x={RX + RW - 100} y={RH / 2 - 26} width={80} height={52} rx={12} fill={isL1 ? C.harvest : 'rgba(255,255,255,0.14)'} />
              <text x={RX + RW - 60} y={RH / 2 + 10} textAnchor="middle" fontFamily={F.display} fontWeight={800} fontSize={28} fill={isL1 ? C.ink : '#fff'}>L{rank + 1}</text>
            </g>
          </g>
        );
      })}
      <g opacity={Math.min(1, win)} transform={`translate(${CARD.width / 2} ${Y0 + 4 * STEP + 56}) scale(${0.6 + 0.4 * win})`}>
        <rect x={-170} y={-36} width={340} height={72} rx={36} fill={C.harvest} />
        <text y={13} textAnchor="middle" fontFamily={F.display} fontWeight={800} fontSize={36} fill={C.ink}>L1 WINS ✓</text>
      </g>
    </Stage>
  );
};

// ------------------------------------------------------------------ 4. MSE: the deposit is waived
const MseDiagram: React.FC = () => {
  const f = useCurrentFrame();
  const strike = lerp(f, [T.skip - 4, T.skip + 12], [0, 1], E.inOut);
  const badge = lerp(f, [T.registered - 2, T.registered + 12], [0, 1], E.back);
  const cx = CARD.width / 2;
  return (
    <Stage at={T.mse + 2}>
      <Caption y={64} text="A SMALL SUPPLIER’S BID" opacity={lerp(f, [T.mse + 8, T.mse + 20], [0, 1])} />
      <g opacity={1 - 0.55 * strike}><Coin x={cx} y={240} r={110} label="EMD" /></g>
      <line x1={cx - 140} y1={380} x2={cx - 140 + 280 * strike} y2={380 - 280 * strike} stroke={RED} strokeWidth={14} strokeLinecap="round" opacity={strike > 0 ? 1 : 0} />
      <g opacity={Math.min(1, badge)} transform={`translate(${cx} 500) scale(${0.7 + 0.3 * badge})`}>
        <rect x={-340} y={-46} width={680} height={92} rx={46} fill="rgba(123,217,160,0.15)" stroke={GREEN} strokeWidth={3} />
        <text y={12} textAnchor="middle" fontFamily={F.display} fontWeight={700} fontSize={34} fill={GREEN}>Registered MSE → EMD exempt</text>
      </g>
      <Caption y={600} text="OFTEN, NOT ALWAYS · CHECK EACH TENDER" size={20} opacity={lerp(f, [T.skip + 20, T.skip + 34], [0, 1])} />
    </Stage>
  );
};

// ------------------------------------------------------------------ 5. Reverse auction: a live board, prices step down
const RA_ROWS = [
  { name: 'Bidder A', start: 0.95, cuts: [0.88, 0.8, 0.73] },
  { name: 'Bidder B', start: 0.9, cuts: [0.84, 0.76, 0.7] },
  { name: 'Bidder C', start: 0.98, cuts: [0.86, 0.78, 0.68] },
];
const TURNS = [1, 2, 0, 0, 1, 2, 2, 0, 1, 2]; // whose turn to cut
const AuctionDiagram: React.FC = () => {
  const f = useCurrentFrame();
  const t0 = T.cut - 6, t1 = T.save - 14;
  const prog = lerp(f, [T.after, t1], [0, 1]);
  const turn = f < t0 ? -1 : Math.min(TURNS.length - 1, Math.floor(lerp(f, [t0, t1], [0, TURNS.length - 0.001])));
  const level = RA_ROWS.map((r, i) => {
    const done = TURNS.slice(0, turn + 1).filter((k) => k === i).length;
    return done === 0 ? r.start : r.cuts[Math.min(done, 3) - 1];
  });
  const lowest = level.indexOf(Math.min(...level));
  const secs = Math.max(0, 300 - Math.round(prog * 300));
  const blink = 0.55 + 0.45 * Math.sin(f * 0.35);
  const RX = 70, RW = 760;
  return (
    <Stage at={T.ra + 2}>
      <circle cx={RX + 16} cy={58} r={11} fill={RED} opacity={blink} />
      <text x={RX + 40} y={67} fontFamily={F.label} fontWeight={700} fontSize={26} letterSpacing={5} fill="#fff">LIVE</text>
      <text x={RX + RW} y={67} textAnchor="end" fontFamily={F.label} fontWeight={700} fontSize={30} fill={C.harvest}>{`0${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`}</text>
      <line x1={RX} x2={RX + RW} y1={100} y2={100} stroke="rgba(255,255,255,0.12)" strokeWidth={2} />
      {RA_ROWS.map((r, i) => {
        const y = 140 + i * 130;
        const isLow = turn >= 0 && i === lowest;
        const w = (RW - 360) * level[i];
        const justCut = turn >= 0 && TURNS[turn] === i;
        return (
          <g key={i} transform={`translate(0 ${y})`}>
            <rect x={RX} y={0} width={RW} height={104} rx={20} fill={isLow ? 'rgba(232,176,75,0.12)' : 'rgba(255,255,255,0.05)'} stroke={isLow ? C.harvest : 'rgba(255,255,255,0.08)'} strokeWidth={isLow ? 3 : 1.5} />
            <text x={RX + 28} y={62} fontFamily={F.text} fontWeight={600} fontSize={30} fill="#fff">{r.name}</text>
            <rect x={RX + 200} y={34} width={w} height={36} rx={18} fill={isLow ? C.harvest : 'rgba(255,255,255,0.3)'} />
            {justCut && <text x={RX + 214 + w} y={64} fontFamily={F.display} fontWeight={800} fontSize={32} fill={GREEN}>↓</text>}
            {isLow && (
              <g transform={`translate(${RX + RW - 20} 52)`}>
                <rect x={-128} y={-22} width={128} height={44} rx={10} fill={C.harvest} />
                <text x={-64} y={8} textAnchor="middle" fontFamily={F.label} fontWeight={700} fontSize={20} letterSpacing={2} fill={C.ink}>LOWEST</text>
              </g>
            )}
          </g>
        );
      })}
      <Caption y={590} text="QUALIFIED BIDDERS · PRICES DROP IN TURNS" opacity={lerp(f, [T.after, T.after + 14], [0, 1])} />
    </Stage>
  );
};

// ------------------------------------------------------------------ save + recap
const RECAP = ['EMD', 'GCV', 'L1', 'MSE exemption', 'Reverse auction'];
const Save: React.FC = () => {
  const f = useCurrentFrame();
  const a = lerp(f, [T.save - 4, T.save + 10], [0, 1], E.back);
  return (
    <AbsoluteFill>
      <BrandBg />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 270, display: 'flex', justifyContent: 'center', opacity: Math.min(1, a), transform: `scale(${0.7 + 0.3 * a})` }}>
        <svg width={120} height={152} viewBox="0 0 150 190"><path d="M10 10 H140 V180 L75 135 L10 180 Z" fill={C.harvest} /></svg>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 470, display: 'flex', justifyContent: 'center' }}>
        <Slam text="SAVE THIS" at={T.save} out={T.end + 20} size={124} />
      </div>
      <div style={{ position: 'absolute', left: 110, right: 110, top: 700, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
        {RECAP.map((r, i) => {
          const t = lerp(f, [T.save + 6 + i * 4, T.save + 18 + i * 4], [0, 1], E.out);
          return (
            <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 14, opacity: t, transform: `translateY(${(1 - t) * 30}px)`, background: 'rgba(5,26,17,0.8)', border: '1.5px solid rgba(232,176,75,0.4)', borderRadius: 999, padding: '18px 40px', fontFamily: F.text, fontWeight: 600, fontSize: 44, color: '#fff' }}>
              <span style={{ color: C.harvest, fontFamily: F.label, fontSize: 24, letterSpacing: '0.1em' }}>0{i + 1}</span>{r}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const Reel2: React.FC = () => {
  const f = useCurrentFrame();
  const [s1, s2, s3, s4, s5, s6] = SECTIONS;
  const sec = (a: number, b: number) => f >= a && f < b;
  return (
    <ReelShell data={D} endAt={T.end}>
      {f < s1 && <Hook />}
      {f >= s1 && f < s6 && <BrandBg />}
      {sec(s1, s2) && (<><Backdrop src="r_trucks" from={s1} dur={s2 - s1} /><Progress n={1} at={s1} /><Term term="EMD" full="Earnest Money Deposit" at={T.emd} fullAt={T.earnest} out={s2} /><EmdDiagram /></>)}
      {sec(s2, s3) && (<><Backdrop src="r_embers" from={s2} dur={s3 - s2} rate={0.7} /><Progress n={2} at={s2} /><Term term="GCV" full="Gross Calorific Value" at={T.gcv} fullAt={T.gross} out={s3} /><GcvDiagram /></>)}
      {sec(s3, s4) && (<><Backdrop src="r_bales_field" from={s3} dur={s4 - s3} rate={0.4} /><Progress n={3} at={s3} /><Term term="L1" full="Lowest qualified bidder" at={T.l1} fullAt={T.lowest} out={s4} /><L1Diagram /></>)}
      {sec(s4, s5) && (<><Backdrop src="r_lathe" from={s4} dur={s5 - s4} rate={0.45} /><Progress n={4} at={s4} /><Term term="MSE" full="Exemption for small businesses" at={T.mse} fullAt={T.registered} out={s5} /><MseDiagram /></>)}
      {sec(s5, s6) && (<><Backdrop src="r_sparks" from={s5} dur={s6 - s5} rate={0.45} /><Progress n={5} at={s5} /><Term term={'REVERSE\nAUCTION'} full="Prices cut live, online" at={T.ra} fullAt={T.after} out={s6} size={120} /><AuctionDiagram /></>)}
      {f >= s6 && f < T.end + 4 && <Save />}
      <EndCard at={T.end} />
      <LightLeak at={s1} dur={14} from="left" strength={0.5} />
    </ReelShell>
  );
};
export const REEL2_FRAMES = D.frames;
