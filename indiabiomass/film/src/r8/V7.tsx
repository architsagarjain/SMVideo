import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { totalFrames, Shell8, timing, R8Data, Span, Media, Headline, Chip } from './common8';
import { Logo } from '../components/Logo';
import { lerp, E } from '../lib';
import { C, F } from '../theme';
import data from '../data/r8/v7.json';

// Video 7 · Guess the biomass (quiz). Look: quiz-show cards: a big number, a blurred extreme close-up,
// a 3-2-1 timer in the pause, then the reveal with the name; four score dots fill as answers land.
const D = data as unknown as R8Data;
const { L, W, END } = timing(D);
const Q = [
  { n: 1, clue: L(1), ans: L(2), next: L(3), name: 'RICE HUSK', src: 'V7_1.jpg', ctx: 'V7_5.jpg' },
  { n: 2, clue: L(3), ans: L(4), next: L(5), name: 'BAGASSE', src: 'V7_2.jpg', ctx: 'V7_ctx2.jpg' },
  { n: 3, clue: L(5), ans: L(6), next: L(7), name: 'MUSTARD HUSK', src: 'V7_3.jpg', ctx: 'V7_ctx3.jpg' },
  { n: 4, clue: L(7), ans: L(8), next: L(9), name: 'COCONUT SHELL', src: 'V7_4.jpg', ctx: 'V7_ctx4.jpg' },
];
const BG = `radial-gradient(ellipse 110% 70% at 50% 35%, #0D5A3B 0%, ${C.forest} 45%, #021A10 100%)`;

const Dots: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 170, display: 'flex', justifyContent: 'center', gap: 16 }}>
      {Q.map((q) => {
        const on = lerp(f, [q.ans, q.ans + 8], [0, 1], E.back);
        return <div key={q.n} style={{ width: 54, height: 54, borderRadius: 27, border: `3px solid ${C.harvest}`, background: on > 0.5 ? C.harvest : 'transparent', display: 'grid', placeItems: 'center', fontFamily: F.display, fontWeight: 800, fontSize: 24, color: on > 0.5 ? C.ink : C.harvest, transform: `scale(${0.85 + 0.15 * Math.min(1.2, on)})` }}>{q.n}</div>;
      })}
    </div>
  );
};

const Round: React.FC<{ i: number }> = ({ i }) => {
  const f = useCurrentFrame();
  const q = Q[i];
  const rev = lerp(f, [q.ans - 2, q.ans + 10], [0, 1], E.out);
  const pauseStart = q.ans - 48; // the 1.6 s guessing gap
  const count = f >= pauseStart && f < q.ans ? 3 - Math.floor((f - pauseStart) / 16) : 0;
  const ringP = lerp(f, [pauseStart, q.ans], [1, 0]);
  const R = 70, CIR = 2 * Math.PI * R;
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 255, textAlign: 'center', fontFamily: F.display, fontWeight: 800, fontSize: 120, color: C.harvest, letterSpacing: '-0.03em', opacity: lerp(f, [q.clue, q.clue + 8], [0, 1]) }}>#{q.n}</div>
      <div style={{ position: 'absolute', left: 130, top: 420, width: 820, height: 820, borderRadius: 40, overflow: 'hidden', border: `4px solid ${rev > 0.5 ? C.harvest : 'rgba(255,255,255,0.35)'}`, boxShadow: '0 40px 100px rgba(0,0,0,0.55)' }}>
        <Media src={q.src} from={q.clue} to={q.next} a={[2.2 - 0.9 * rev, 0, 0]} b={[2.0 - 0.8 * rev, 0, 0]} style={{ filter: `blur(${(1 - rev) * 26}px)` }} />
        {count > 0 && (
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
            <svg width={200} height={200} style={{ position: 'absolute' }}>
              <circle cx={100} cy={100} r={R} fill="rgba(4,20,12,0.75)" stroke="rgba(255,255,255,0.25)" strokeWidth={10} />
              <circle cx={100} cy={100} r={R} fill="none" stroke={C.harvest} strokeWidth={10} strokeDasharray={CIR} strokeDashoffset={CIR * (1 - ringP)} transform="rotate(-90 100 100)" strokeLinecap="round" />
            </svg>
            <div style={{ position: 'relative', fontFamily: F.display, fontWeight: 800, fontSize: 96, color: '#fff' }}>{count}</div>
          </div>
        )}
        {f < pauseStart && <div style={{ position: 'absolute', left: 0, right: 0, bottom: 26, textAlign: 'center', fontFamily: F.label, fontWeight: 600, fontSize: 26, letterSpacing: '0.2em', color: '#fff', textShadow: '0 2px 12px rgba(0,0,0,0.9)' }}>GUESS IT</div>}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1265, display: 'flex', justifyContent: 'center', opacity: Math.min(1, rev), transform: `scale(${0.7 + 0.3 * lerp(f, [q.ans - 2, q.ans + 10], [0, 1], E.back)})` }}>
        <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 62, color: C.ink, background: C.harvest, borderRadius: 999, padding: '10px 40px', letterSpacing: '-0.01em' }}>{q.name}</div>
      </div>
      {'ctx' in q && q.ctx && f > q.ans + 20 && (
        <div style={{ position: 'absolute', left: 680, top: 360, width: 300, height: 220, borderRadius: 22, overflow: 'hidden', border: '3px solid #fff', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', opacity: lerp(f, [q.ans + 20, q.ans + 32], [0, 1]), transform: 'rotate(4deg)' }}>
          <Media src={q.ctx} from={q.ans + 20} to={q.next} a={[1.2, 0, 0]} b={[1.05, 0, 0]} />
        </div>
      )}
    </AbsoluteFill>
  );
};

const Grid: React.FC<{ revealed: boolean; at: number }> = ({ revealed, at }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: 120, top: 520, width: 840, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      {Q.map((q, k) => {
        const t = lerp(f, [at + k * 4, at + k * 4 + 12], [0, 1], E.out);
        return (
          <div key={q.n} style={{ position: 'relative', height: 360, borderRadius: 26, overflow: 'hidden', border: `3px solid ${revealed ? C.harvest : 'rgba(255,255,255,0.4)'}`, opacity: t, transform: `scale(${0.9 + 0.1 * t})` }}>
            <Media src={q.src} from={at} to={at + 200} a={[1.6, 0, 0]} b={[1.5, 0, 0]} style={{ filter: revealed ? 'none' : 'blur(22px)' }} />
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 14, textAlign: 'center', fontFamily: F.display, fontWeight: 800, fontSize: revealed ? 34 : 64, color: '#fff', textShadow: '0 2px 14px rgba(0,0,0,0.9)' }}>{revealed ? q.name : `#${q.n}`}</div>
          </div>
        );
      })}
    </div>
  );
};

export const V7: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Shell8 d={D}>
      <AbsoluteFill style={{ background: BG }} />
      <Span from={0} to={L(1)} fade={6}>
        <Headline text={'GUESS THE\nBIOMASS'} at={4} top={230} size={110} color={C.harvest} />
        <Grid revealed={false} at={14} />
      </Span>
      {Q.map((q, i) => <Span key={q.n} from={q.clue} to={q.next} fade={6}><Round i={i} /></Span>)}
      <Dots />
      <Span from={L(9)} to={L(10)} fade={6}>
        <Headline text={'HOW MANY\nDID YOU GET?'} at={L(9)} top={250} size={92} />
        <Grid revealed at={L(9)} />
        <Chip text="TELL US IN THE COMMENTS" at={W('comments')} top={1290} />
      </Span>
      <Span from={L(10)} to={END} fade={8}>
        <Headline text={'EVERY ONE HAS\nA BUYER SOMEWHERE'} at={L(10)} top={420} size={78} />
      </Span>
    </Shell8>
  );
};
export const V7_FRAMES = totalFrames(D);
