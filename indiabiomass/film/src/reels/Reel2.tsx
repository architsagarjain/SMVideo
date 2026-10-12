import { AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ReelShell, BrandBg, EndCard, ReelData, wordAt } from './common';
import { Kinetic, Label, Slam } from '../components/Type';
import { LightLeak } from '../components/LightLeak';
import { Footage } from '../components/Footage';
import { clip } from '../clips';
import { lerp, E } from '../lib';
import { C, F } from '../theme';
import data from '../data/reel2.json';

const D = data as unknown as ReelData;
const T = {
  emd: wordAt(D, 'e-m-d'), earnest: wordAt(D, 'earnest'), refundable: wordAt(D, 'refundable'), bid: wordAt(D, 'bid'),
  gcv: wordAt(D, 'g-c-v'), gross: wordAt(D, 'gross'), heat: wordAt(D, 'heat'), minimum: wordAt(D, 'minimum'),
  l1: wordAt(D, 'l-1'), lowest: wordAt(D, 'lowest'), wins: wordAt(D, 'wins'),
  mse: wordAt(D, 'mseexemption'), registered: wordAt(D, 'registered'), skip: wordAt(D, 'skip'),
  ra: wordAt(D, 'reverse'), after: wordAt(D, 'after'), cut: wordAt(D, 'cut'),
  save: wordAt(D, 'save'),
  end: D.words[D.words.length - 1].e + 10,
};
const SECTIONS = [T.emd - 8, T.gcv - 8, T.l1 - 8, T.mse - 8, T.ra - 8, T.save - 6];

/** Series chrome: "Tender words" + 01/05 progress. */
const Progress: React.FC<{ n: number; at: number }> = ({ n, at }) => {
  const f = useCurrentFrame();
  const a = lerp(f, [at, at + 10], [0, 1], E.out);
  return (
    <div style={{ position: 'absolute', left: 70, right: 70, top: 262, display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: a }}>
      <span style={{ fontFamily: F.label, fontWeight: 600, fontSize: 24, letterSpacing: '0.2em', color: C.harvest }}>TENDER WORDS · 0{n} / 05</span>
      <span style={{ display: 'flex', gap: 10 }}>
        {[1, 2, 3, 4, 5].map((k) => (
          <span key={k} style={{ width: k === n ? 40 : 12, height: 12, borderRadius: 6, background: k <= n ? C.harvest : 'rgba(255,255,255,0.25)', transition: 'none' }} />
        ))}
      </span>
    </div>
  );
};

/** Big term + full form, the same layout for every word in the series. */
const Term: React.FC<{ term: string; full: string; at: number; fullAt: number; out: number; size?: number }> = ({ term, full, at, fullAt, out, size = 230 }) => {
  const f = useCurrentFrame();
  const fa = lerp(f, [fullAt - 2, fullAt + 12], [0, 1], E.out);
  const o = lerp(f, [out - 8, out], [1, 0]);
  return (
    <div style={{ position: 'absolute', left: 70, right: 70, top: 360, opacity: o }}>
      <Slam text={term} at={at} out={out + 30} size={size} color={C.harvest} />
      <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 56, color: '#fff', letterSpacing: '-0.02em', marginTop: 18, opacity: fa, transform: `translateY(${(1 - fa) * 18}px)` }}>{full}</div>
    </div>
  );
};

const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ background: 'rgba(7,30,20,0.85)', border: '1.5px solid rgba(232,176,75,0.35)', borderRadius: 28, boxShadow: '0 30px 80px rgba(0,0,0,0.45)', ...style }}>{children}</div>
);

// ---------------------------------------------------------------- diagrams (centre band y ~ 780-1330)
const EmdDiagram: React.FC<{ mse?: boolean }> = ({ mse }) => {
  const f = useCurrentFrame();
  const base = mse ? T.mse : T.emd;
  const env = lerp(f, [base + 4, base + 18], [0, 1], E.out);
  const drop = mse ? 1 : lerp(f, [T.refundable - 4, T.refundable + 14], [0, 1], E.in);
  const back = mse ? 0 : lerp(f, [T.bid - 6, T.bid + 16], [0, 1], E.inOut);
  const stamp = mse ? lerp(f, [T.registered - 2, T.registered + 8], [0, 1], E.back) : 0;
  const coinY = 820 + drop * 230;
  return (
    <AbsoluteFill style={{ opacity: env }}>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        {/* envelope */}
        <g transform={`translate(290 ${980 + (1 - env) * 60})`}>
          <rect x={0} y={0} width={500} height={320} rx={26} fill="#F7F6F2" />
          <path d="M0 26 L250 190 L500 26" fill="none" stroke="#D9D4C6" strokeWidth={8} />
          <text x={250} y={286} textAnchor="middle" fontFamily={F.label} fontWeight={600} fontSize={30} letterSpacing="6" fill={C.forest}>YOUR BID</text>
        </g>
        {/* the deposit coin */}
        {!mse && drop < 1 && (
          <g transform={`translate(540 ${coinY})`}>
            <circle r={78} fill={C.harvest} />
            <circle r={62} fill="none" stroke="#8A5A0B" strokeWidth={5} />
            <text y={30} textAnchor="middle" fontFamily={F.display} fontWeight={800} fontSize={86} fill="#5B3A06">₹</text>
          </g>
        )}
        {/* refundable: the coin's path loops back out */}
        {!mse && back > 0 && (
          <g opacity={back}>
            <path d="M800 1080 C 960 1000, 960 820, 760 800" fill="none" stroke="#78DCA0" strokeWidth={8} strokeDasharray="1200" strokeDashoffset={1200 * (1 - back)} strokeLinecap="round" />
            <path d="M780 772 L752 800 L790 822" fill="none" stroke="#78DCA0" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" opacity={back > 0.9 ? 1 : 0} />
            <text x={930} y={770} textAnchor="end" fontFamily={F.text} fontWeight={600} fontSize={36} fill="#78DCA0">Refundable</text>
          </g>
        )}
      </svg>
      {mse && (
        <div style={{ position: 'absolute', left: 300, top: 840, transform: `rotate(-12deg) scale(${0.6 + 0.4 * stamp})`, opacity: stamp, border: '8px solid #B3261E', color: '#B3261E', borderRadius: 18, padding: '14px 30px', fontFamily: F.display, fontWeight: 800, fontSize: 66, letterSpacing: '0.06em', background: 'rgba(250,228,226,0.92)' }}>
          EMD EXEMPT
          <div style={{ fontFamily: F.label, fontSize: 24, letterSpacing: '0.16em', textAlign: 'center', marginTop: 2 }}>REGISTERED MSE</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

const GcvDiagram: React.FC = () => {
  const f = useCurrentFrame();
  const a = lerp(f, [T.gcv + 4, T.gcv + 18], [0, 1], E.out);
  const fill = lerp(f, [T.heat - 4, T.heat + 30], [0.08, 0.86], E.inOut);
  const minA = lerp(f, [T.minimum - 6, T.minimum + 8], [0, 1], E.out);
  const MIN = 0.62, X = 150, W = 780, Y = 1130;
  return (
    <AbsoluteFill style={{ opacity: a }}>
      <div style={{ position: 'absolute', left: 150, top: 790, width: 780, height: 260, borderRadius: 26, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.45)' }}>
        <Sequence from={T.gcv}><Footage src={clip('s4_pellets')} dur={T.l1 - T.gcv} from={[1.4, 0, 0]} to={[1.25, 0, 0]} grade="warm" /></Sequence>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(90deg, rgba(232,120,40,${0.25 + 0.35 * fill}) 0%, rgba(0,0,0,0) 70%)`, mixBlendMode: 'screen' }} />
      </div>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <rect x={X} y={Y} width={W} height={52} rx={26} fill="rgba(255,255,255,0.12)" />
        <defs><linearGradient id="heat" x1="0" x2="1"><stop offset="0" stopColor="#E8B04B" /><stop offset="1" stopColor="#E0612B" /></linearGradient></defs>
        <rect x={X} y={Y} width={W * fill} height={52} rx={26} fill="url(#heat)" style={{ filter: 'drop-shadow(0 0 14px rgba(232,120,40,0.7))' }} />
        <g opacity={0.35 + 0.65 * minA}>
          <line x1={X + W * MIN} x2={X + W * MIN} y1={Y - 30} y2={Y + 82} stroke="#fff" strokeWidth={5} />
          <text x={X + W * MIN} y={Y + 126} textAnchor="middle" fontFamily={F.label} fontWeight={600} fontSize={28} letterSpacing="4" fill="#fff">BUYER'S MINIMUM</text>
        </g>
        <text x={X} y={Y - 26} fontFamily={F.label} fontWeight={600} fontSize={26} letterSpacing="4" fill={C.harvest}>HEAT PER KILO</text>
        {fill > MIN && <text x={X + W} y={Y - 26} textAnchor="end" fontFamily={F.text} fontWeight={600} fontSize={30} fill="#78DCA0">✓ qualifies</text>}
      </svg>
    </AbsoluteFill>
  );
};

const BIDS = [0.92, 0.78, 0.64, 0.85]; // relative bid prices (illustrative shape only, no figures)
const L1Diagram: React.FC = () => {
  const f = useCurrentFrame();
  const a = lerp(f, [T.l1 + 4, T.l1 + 18], [0, 1], E.out);
  const pick = lerp(f, [T.lowest - 2, T.lowest + 16], [0, 1], E.inOut);
  const win = lerp(f, [T.wins - 4, T.wins + 10], [0, 1], E.back);
  const low = BIDS.indexOf(Math.min(...BIDS));
  return (
    <AbsoluteFill style={{ opacity: a }}>
      {BIDS.map((v, i) => {
        const isLow = i === low;
        const order = isLow ? i + (0 - i) * pick : i < low ? i + pick : i; // lowest rises to the top
        return (
          <div key={i} style={{ position: 'absolute', left: 120, width: 840, top: 800 + order * 128, height: 104, display: 'flex', alignItems: 'center', gap: 22 }}>
            <span style={{ width: 150, fontFamily: F.text, fontWeight: 600, fontSize: 30, color: 'rgba(255,255,255,0.85)' }}>Bidder {String.fromCharCode(65 + i)}</span>
            <span style={{ position: 'relative', flex: 1, height: 64 }}>
              <span style={{ position: 'absolute', left: 0, top: 0, height: 64, width: `${v * 100 * lerp(f, [T.l1 + 6 + i * 3, T.l1 + 24 + i * 3], [0, 1], E.out)}%`, borderRadius: 14, background: isLow ? `rgba(232,176,75,${0.45 + 0.55 * pick})` : 'rgba(255,255,255,0.18)', boxShadow: isLow && pick > 0.5 ? '0 0 28px rgba(232,176,75,0.6)' : undefined }} />
              {isLow && (
                <span style={{ position: 'absolute', left: `${v * 100 + 2}%`, top: 6, fontFamily: F.display, fontWeight: 800, fontSize: 40, color: C.harvest, opacity: pick }}>L1</span>
              )}
            </span>
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: 120, top: 1322, fontFamily: F.label, fontSize: 22, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.55)', opacity: 1 - win }}>BAR LENGTH = PRICE QUOTED</div>
      <div style={{ position: 'absolute', right: 120, top: 760, transform: `scale(${win})`, opacity: win, background: C.harvest, color: C.ink, fontFamily: F.display, fontWeight: 800, fontSize: 40, padding: '10px 26px', borderRadius: 14 }}>WINS ✓</div>
    </AbsoluteFill>
  );
};

const AuctionDiagram: React.FC = () => {
  const f = useCurrentFrame();
  const a = lerp(f, [T.ra + 4, T.ra + 18], [0, 1], E.out);
  const steps = 6;
  const prog = lerp(f, [T.after - 4, T.save - 10], [0, 1]);
  const shown = Math.floor(prog * steps);
  const pts: [number, number][] = [];
  for (let k = 0; k <= steps; k++) pts.push([150 + (k / steps) * 780, 860 + k * 58 + (k % 2) * 6]);
  const path = pts.slice(0, shown + 1).reduce((acc, p, i) => acc + (i ? ` H${p[0]} V${p[1]}` : `M${p[0]},${p[1]}`), '');
  const secs = Math.max(0, 120 - Math.round(prog * 120));
  const live = 0.6 + 0.4 * Math.sin(f * 0.35);
  return (
    <AbsoluteFill style={{ opacity: a }}>
      <Card style={{ position: 'absolute', left: 110, top: 760, width: 860, height: 560 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '26px 32px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: F.label, fontWeight: 600, fontSize: 26, letterSpacing: '0.16em', color: '#fff' }}>
            <span style={{ width: 16, height: 16, borderRadius: 8, background: '#E5484D', opacity: live, boxShadow: '0 0 12px #E5484D' }} /> LIVE
          </span>
          <span style={{ fontFamily: F.label, fontWeight: 600, fontSize: 30, color: C.harvest }}>0{Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}</span>
        </div>
        <div style={{ position: 'absolute', left: 32, bottom: 24, fontFamily: F.label, fontSize: 22, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.55)' }}>LOWEST PRICE ↓ OVER TIME</div>
      </Card>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <path d={path} fill="none" stroke={C.harvest} strokeWidth={8} strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 10px rgba(232,176,75,0.6))' }} />
        {shown > 0 && <circle cx={pts[shown][0]} cy={pts[shown][1]} r={14} fill="#FFF3D6" />}
      </svg>
    </AbsoluteFill>
  );
};

const RECAP = ['EMD', 'GCV', 'L1', 'MSE exemption', 'Reverse auction'];
const Save: React.FC = () => {
  const f = useCurrentFrame();
  const a = lerp(f, [T.save - 4, T.save + 10], [0, 1], E.out);
  return (
    <AbsoluteFill>
      <BrandBg />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 330, display: 'flex', justifyContent: 'center', opacity: a, transform: `scale(${0.7 + 0.3 * a})` }}>
        <svg width={150} height={190} viewBox="0 0 150 190"><path d="M10 10 H140 V180 L75 135 L10 180 Z" fill={C.harvest} /></svg>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center' }}>
        <Slam text="SAVE THIS" at={T.save} out={T.end + 20} size={120} />
      </div>
      {RECAP.map((r, i) => {
        const t = lerp(f, [T.save + 6 + i * 3, T.save + 16 + i * 3], [0, 1], E.out);
        return (
          <div key={r} style={{ position: 'absolute', left: 250, top: 760 + i * 86, display: 'flex', alignItems: 'center', gap: 22, opacity: t, transform: `translateX(${(1 - t) * 40}px)`, fontFamily: F.text, fontWeight: 600, fontSize: 46, color: '#fff' }}>
            <span style={{ color: C.harvest, fontFamily: F.label, fontSize: 28 }}>0{i + 1}</span> {r}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Hook: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <BrandBg />
      <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, perspective: 1600, opacity: 0.45 }}>
        <div style={{ position: 'absolute', left: -160, top: 900, width: 1500, height: 900, overflow: 'hidden', borderRadius: 20, transform: `rotateY(22deg) rotateX(10deg) translateZ(${-400 + f * 4}px)` }}>
          <Img src={staticFile('ui/home_tenders.png')} style={{ width: 1500 }} />
        </div>
      </div>
      <div style={{ position: 'absolute', left: 70, right: 70, top: 330 }}>
        <Kinetic lines={['5 WORDS', 'IN EVERY', 'BIOMASS TENDER']} at={4} out={SECTIONS[0] - 6} size={118} align="left" stagger={0.8} />
      </div>
      <div style={{ position: 'absolute', left: 70, top: 760, opacity: lerp(f, [wordAt(D, 'and') - 2, wordAt(D, 'and') + 10], [0, 1]) }}>
        <Label text="…and what they actually mean" at={wordAt(D, 'and')} color={C.harvest} size={30} />
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
      {sec(s1, s2) && (<><Progress n={1} at={s1} /><Term term="EMD" full="Earnest Money Deposit" at={T.emd} fullAt={T.earnest} out={s2} /><EmdDiagram /></>)}
      {sec(s2, s3) && (<><Progress n={2} at={s2} /><Term term="GCV" full="Gross Calorific Value" at={T.gcv} fullAt={T.gross} out={s3} /><GcvDiagram /></>)}
      {sec(s3, s4) && (<><Progress n={3} at={s3} /><Term term="L1" full="Lowest qualified bidder" at={T.l1} fullAt={T.lowest} out={s4} /><L1Diagram /></>)}
      {sec(s4, s5) && (<><Progress n={4} at={s4} /><Term term="MSE" full="Exemption for small businesses" at={T.mse} fullAt={T.registered} out={s5} /><EmdDiagram mse /></>)}
      {sec(s5, s6) && (<><Progress n={5} at={s5} /><Term term={'REVERSE\nAUCTION'} full="Prices cut live, online" at={T.ra} fullAt={T.after} out={s6} size={140} /><AuctionDiagram /></>)}
      {f >= s6 && f < T.end + 4 && <Save />}
      <EndCard at={T.end} />
      <LightLeak at={s1} dur={14} from="left" strength={0.5} />
    </ReelShell>
  );
};
export const REEL2_FRAMES = D.frames;
