import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { BrandLogo, Shell8, timing, R8Data, Span, Media, Shade, Headline, Chip, End8 } from './common8';
import { Logo } from '../components/Logo';
import { lerp, E } from '../lib';
import { C, F } from '../theme';
import data from '../data/r8/v6.json';

// Video 6 · The harvest window (countdown). Look: a countdown ring runs the whole reel. The first half is
// drained to grey haze; at "with a plan" the film rewinds and replays in warm gold.
const D = data as unknown as R8Data;
const { L, W, END } = timing(D);
const RW = L(5);              // rewind
const GREY = 'grayscale(0.85) contrast(1.05) brightness(0.92)';

const Ring: React.FC = () => {
  const f = useCurrentFrame();
  const a = lerp(f, [4, 16], [0, 1]) * lerp(f, [L(9) - 10, L(9)], [1, 0]);
  const grey = f < RW;
  // first half: time runs out; after the rewind it runs again but the tasks get done in time
  const p = grey ? lerp(f, [6, RW - 20], [1, 0.08]) : lerp(f, [RW + 6, L(8)], [1, 0.35]);
  const R = 92, CIR = 2 * Math.PI * R;
  const col = grey ? '#B9BDB9' : C.harvest;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 170, display: 'flex', justifyContent: 'center', opacity: a }}>
      <div style={{ position: 'relative', width: 230, height: 230 }}>
        <svg width={230} height={230} style={{ position: 'absolute', inset: 0 }}>
          <circle cx={115} cy={115} r={R} fill="rgba(4,20,12,0.7)" stroke="rgba(255,255,255,0.18)" strokeWidth={14} />
          <circle cx={115} cy={115} r={R} fill="none" stroke={col} strokeWidth={14} strokeLinecap="round" strokeDasharray={CIR} strokeDashoffset={CIR * (1 - p)} transform="rotate(-90 115 115)" style={{ filter: grey ? undefined : 'drop-shadow(0 0 10px rgba(232,176,75,0.8))' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center', fontFamily: F.label, fontWeight: 600, fontSize: 22, letterSpacing: '0.12em', color: '#fff', lineHeight: 1.25 }}>A FEW<br />WEEKS</div>
      </div>
    </div>
  );
};

const Smoke: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame() - from;
  return (
    <AbsoluteFill style={{ opacity: Math.min(0.75, f / 40), mixBlendMode: 'screen',
      background: `radial-gradient(ellipse 70% 40% at ${40 + f * 0.15}% ${70 - f * 0.1}%, rgba(200,200,195,0.55) 0%, rgba(200,200,195,0) 70%), radial-gradient(ellipse 60% 35% at ${70 - f * 0.1}% ${55 - f * 0.12}%, rgba(180,180,175,0.45) 0%, rgba(180,180,175,0) 70%)` }} />
  );
};

const Rewind: React.FC = () => {
  const f = useCurrentFrame();
  const k = lerp(f, [RW - 8, RW + 20], [0, 1]);
  const shots = ['V6_3.mp4', 'V6_2.jpg', 'V6_1.jpg'];
  const i = Math.min(2, Math.floor(k * 3));
  const lines = Array.from({ length: 24 }, (_, j) => j);
  return (
    <AbsoluteFill>
      <Media src={shots[i]} from={RW - 8} to={RW + 20} a={[1.3, 0, 0]} b={[1.1, 0, 0]} style={{ filter: `${GREY} blur(${2 * (1 - k)}px)` }} />
      {lines.map((j) => <div key={j} style={{ position: 'absolute', left: 0, right: 0, top: ((j * 80 - f * 40) % 1920 + 1920) % 1920, height: 6, background: 'rgba(255,255,255,0.18)' }} />)}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 860, textAlign: 'center', fontFamily: F.display, fontWeight: 800, fontSize: 160, color: '#fff', opacity: 0.85 }}>◀◀</div>
    </AbsoluteFill>
  );
};

const Steps: React.FC = () => {
  const f = useCurrentFrame();
  const S = [['BALER', W('baler', 0, 6)], ['AGGREGATOR', W('aggregator')], ['FIELD CLEAR', W('field', 0, 6)]] as const;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 440, display: 'flex', justifyContent: 'center', gap: 16 }}>
      {S.map(([t, at]) => {
        const s = lerp(f, [at - 3, at + 9], [0, 1], E.back);
        return <div key={t} style={{ opacity: Math.min(1, s), transform: `scale(${0.8 + 0.2 * s})`, fontFamily: F.label, fontWeight: 600, fontSize: 24, letterSpacing: '0.12em', color: C.ink, background: C.harvest, borderRadius: 999, padding: '12px 22px' }}>✓ {t}</div>;
      })}
    </div>
  );
};

const Pellets: React.FC = () => {
  const f = useCurrentFrame();
  const t0 = L(7);
  const nodes = [['STRAW', t0], ['PELLETS', W('pellets')], ['PLANT', W('plant', 0, 7)]] as const;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 100% 70% at 50% 45%, #2A4A1E 0%, #183A22 45%, #08180E 100%)` }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30 }}>
        {nodes.map(([t, at], i) => {
          const s = lerp(f, [at - 3, at + 10], [0, 1], E.back);
          return (
            <React.Fragment key={t}>
              {i > 0 && <div style={{ width: 6, height: 70 * Math.min(1, s), background: C.harvest, borderRadius: 3 }} />}
              <div style={{ opacity: Math.min(1, s), transform: `scale(${0.8 + 0.2 * s})`, fontFamily: F.display, fontWeight: 800, fontSize: 64, color: C.ink, background: C.harvest, borderRadius: 26, padding: '18px 50px' }}>{t}</div>
            </React.Fragment>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const TwoEndings: React.FC = () => {
  const f = useCurrentFrame();
  const t0 = L(8);
  const lab = (txt: string, x: number, col: string) => <div style={{ position: 'absolute', left: x, width: 540, top: 1180, textAlign: 'center', fontFamily: F.label, fontWeight: 600, fontSize: 28, letterSpacing: '0.16em', color: col, textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}>{txt}</div>;
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 0, top: 0, width: 540, height: 1920, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: -270, width: 1080, height: 1920 }}><Media src="V6_2.jpg" from={t0} to={L(9)} a={[1.2, 0, 0]} b={[1.1, 0, 0]} style={{ filter: GREY }} /></div>
      </div>
      <div style={{ position: 'absolute', left: 540, top: 0, width: 540, height: 1920, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: -270, width: 1080, height: 1920 }}><Media src="V6_5.jpg" from={t0} to={L(9)} a={[1.2, 0, 0]} b={[1.1, 0, 0]} grade="golden" /></div>
      </div>
      <Shade top={0.75} mid={0.1} bottom={0.75} />
      <div style={{ position: 'absolute', left: 537, top: 0, width: 6, height: 1920, background: C.harvest }} />
      {lab('SMOKE', 0, '#D6D9D6')}{lab('A CLEAR FIELD', 540, C.harvest)}
      <Headline text={'SAME FIELD.\nDIFFERENT ENDING.'} at={W('different')} top={420} size={78} />
    </AbsoluteFill>
  );
};

export const V6: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Shell8 d={D}>
      {/* grey half */}
      <Span from={0} to={L(1)}><Media src="V6_1.jpg" from={0} to={L(1)} a={[1.2, 0, 0]} b={[1.08, 0, 0]} style={{ filter: `grayscale(${lerp(f, [20, L(1)], [0, 0.6])})` }} /><Shade /></Span>
      <Span from={L(1)} to={L(3)}><Media src="V6_2.jpg" from={L(1)} to={L(3)} a={[1.1, 0, 0]} b={[1.3, 0, 0]} style={{ filter: GREY }} /><Shade /></Span>
      <Span from={L(3)} to={L(4)}><Media src="V6_3.mp4" from={L(3)} to={L(4)} a={[1.1, 0, 0]} b={[1.2, 0, 0]} style={{ filter: 'grayscale(0.5)' }} /><Shade mid={0.2} /></Span>
      <Span from={L(4)} to={RW - 8}><Media src="V6_2.jpg" from={L(4)} to={RW} a={[1.4, 60, 0]} b={[1.6, 0, -40]} style={{ filter: GREY }} /><Smoke from={L(4)} /><AbsoluteFill style={{ mixBlendMode: 'screen', opacity: 0.75 }}><Media src="V6_smoke.mp4" from={L(4)} to={RW} a={[1.3, 0, 120]} b={[1.5, 0, 40]} grade="none" /></AbsoluteFill><Shade /></Span>
      <Span from={RW - 8} to={RW + 20} fade={2}><Rewind /></Span>
      {/* gold half */}
      <Span from={RW + 20} to={W('baler', 0, 6)}><Media src="V6_1.jpg" from={RW + 20} to={L(6) + 30} a={[1.1, 0, 0]} b={[1.2, 0, 0]} grade="golden" /><Shade /></Span>
      <Span from={W('baler', 0, 6)} to={W('field', 0, 6)}><Media src="V6_4r.mp4" from={W('baler', 0, 6)} to={W('field', 0, 6)} a={[1.05, 0, 0]} b={[1.12, 0, 0]} grade="golden" /><Shade /></Span>
      <Span from={W('field', 0, 6)} to={L(7)}><Media src="V6_5.jpg" from={W('field', 0, 6)} to={L(7)} a={[1.1, 0, 0]} b={[1.25, 0, 0]} grade="golden" /><Shade /></Span>
      <Span from={L(7)} to={L(8)}><Pellets /></Span>
      <Span from={L(8)} to={L(9)}><TwoEndings /></Span>
      <Span from={L(9)} to={END}><Media src="V6_6.mp4" from={L(9)} to={END} a={[1.1, 0, 0]} b={[1.2, 0, 0]} grade="golden" /><Shade top={0.6} mid={0.2} bottom={0.75} /></Span>

      <Ring />
      <Headline text={'THE RICE IS CUT.\nTHE CLOCK STARTS.'} at={4} out={L(1) - 6} top={470} size={80} />
      <Span from={L(3)} to={L(4)} fade={4}><Chip text="THE FASTEST OPTION" at={L(3) + 10} top={470} /></Span>
      <Span from={RW} to={L(6)} fade={6}><Headline text={'WITH A PLAN'} at={W('plan')} top={900} size={110} color={C.harvest} /></Span>
      <Span from={L(6)} to={L(7)} fade={6}><Steps /></Span>
      <Span from={L(9)} to={END} fade={6}>
        <Headline text={'A BALER AND\nA BUYER, IN TIME'} at={L(9) + 4} top={470} size={78} />
        <BrandLogo at={L(10)} />
      </Span>
      <End8 at={END} />
    </Shell8>
  );
};
export const V6_FRAMES = D.frames;
