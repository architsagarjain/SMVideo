import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { totalFrames, Shell8, timing, R8Data, Span, Frame } from '../r8/common8';
import { r9, BrandBeat, Icon } from './common9';
import { lerp, E } from '../lib';
import { C, F } from '../theme';
import data from '../data/r9/v15.json';

// Video 15 · You asked (FAQ). Look: an inbox on paper. Question cards arrive like messages from the audience,
// Q1/Q2/Q3 tabs track progress, each answer types out over a framed shot, and it ends on a comment box.
const D = data as unknown as R8Data;
const { L, W, FIN } = timing(D);
const PAPER = '#F3F0E8';
const QS = [
  { q: 'Can I sell biomass without a factory?', at: L(1), ans: L(2) },
  { q: 'Why does the price change so much?', at: L(3), ans: L(4) },
  { q: 'How do I find buyers outside my district?', at: L(5), ans: L(6) },
];

const Tabs: React.FC = () => {
  const f = useCurrentFrame();
  const k = QS.reduce((a, q, i) => (f >= q.at ? i : a), -1);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 110, display: 'flex', justifyContent: 'center', gap: 14 }}>
      {QS.map((q, i) => (
        <div key={i} style={{ fontFamily: F.label, fontWeight: 700, fontSize: 30, letterSpacing: '0.16em', padding: '12px 30px', borderRadius: 999,
          background: i === k ? C.forest : i < k ? '#DCE6DF' : '#fff', color: i === k ? '#fff' : i < k ? C.forest : '#9AA39C', border: `2px solid ${i <= k ? C.forest : '#DDD8CC'}` }}>
          {i < k ? '✓ ' : ''}Q{i + 1}
        </div>
      ))}
    </div>
  );
};

/** The incoming question, styled as a message card. */
const QCard: React.FC<{ i: number }> = ({ i }) => {
  const f = useCurrentFrame();
  const q = QS[i];
  const t = lerp(f, [q.at - 2, q.at + 12], [0, 1], E.back);
  const settle = lerp(f, [q.ans - 6, q.ans + 8], [0, 1], E.inOut);
  return (
    <div style={{ position: 'absolute', left: 80, width: 920, top: 640 - 420 * settle, background: '#fff', borderRadius: 30, padding: '30px 36px', boxShadow: '0 24px 60px rgba(22,32,26,0.16)', border: '1px solid #E4DFD3',
      opacity: Math.min(1, t), transform: `translateY(${(1 - Math.min(1, t)) * 80}px) scale(${1 - 0.06 * settle})`, transformOrigin: '50% 0%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: [C.harvest, '#7DB89A', '#C98B5B'][i], display: 'grid', placeItems: 'center', fontFamily: F.display, fontWeight: 800, fontSize: 30, color: '#fff' }}>?</div>
        <div style={{ fontFamily: F.label, fontWeight: 700, fontSize: 26, letterSpacing: '0.2em', color: C.slate }}>QUESTION {i + 1}</div>
      </div>
      <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 62, lineHeight: 1.08, color: C.ink, letterSpacing: '-0.02em', marginTop: 18 }}>{q.q}</div>
    </div>
  );
};

const Chip: React.FC<{ text: string; at: number; x: number; y: number; dark?: boolean }> = ({ text, at, x, y, dark }) => {
  const f = useCurrentFrame();
  const t = lerp(f, [at - 2, at + 8], [0, 1], E.back);
  if (t <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translateX(-50%) scale(${0.7 + 0.3 * t})`, opacity: Math.min(1, t), fontFamily: F.label, fontWeight: 700, fontSize: 32, letterSpacing: '0.14em', whiteSpace: 'nowrap',
      color: dark ? '#fff' : C.ink, background: dark ? C.forest : C.harvest, borderRadius: 999, padding: '12px 28px', boxShadow: '0 10px 24px rgba(0,0,0,0.25)' }}>{text}</div>
  );
};

const A1: React.FC = () => {
  const f = useCurrentFrame();
  const a = L(2), mid = W('supply');
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 120, top: 630, zIndex: 2, fontFamily: F.display, fontWeight: 800, fontSize: 110, color: '#fff', textShadow: '0 6px 24px rgba(0,0,0,0.6)', opacity: lerp(f, [a, a + 6], [0, 1]), transform: `scale(${lerp(f, [a, a + 8], [1.4, 1], E.back)})`, transformOrigin: '0 50%' }}>YES.</div>
      <Frame src={r9('V15_1.mp4')} from={a} to={mid + 6} x={80} y={600} w={920} h={680} at={a + 4} grade="golden" />
      {f >= mid - 6 && <Frame src={r9('V15_2.jpg')} from={mid - 6} to={L(3)} x={80} y={600} w={920} h={680} at={mid - 6} a={[1.25, 0, 60]} b={[1.08, 0, 0]} grade="golden" />}
      {(['COLLECT', 'BALE', 'STORE'] as const).map((w, i) => <Chip key={w} text={w} at={W(w.toLowerCase(), 0, 2)} x={250 + i * 290} y={1180} dark />)}
      <Chip text="AGGREGATION: A BUSINESS ON ITS OWN" at={W('aggregation')} x={540} y={1080} />
    </AbsoluteFill>
  );
};

const A2: React.FC = () => {
  const f = useCurrentFrame();
  const a = L(4);
  const factors = ['SEASON', 'REGION', 'QUALITY', 'DISTANCE'];
  const arrow = lerp(f, [W('costly') - 4, W('costly') + 10], [0, 1], E.out);
  return (
    <AbsoluteFill>
      <Frame src={r9('V15_3.jpg')} from={a} to={L(5)} x={80} y={600} w={920} h={680} at={a} a={[1.2, -40, 0]} b={[1.05, 40, 0]} grade="warm" />
      {factors.map((w, i) => <Chip key={w} text={w} at={W(w.toLowerCase(), 0, 4)} x={i % 2 ? 760 : 320} y={i < 2 ? 660 : 760} dark />)}
      <div style={{ position: 'absolute', left: 120, right: 120, top: 1110, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.94)', borderRadius: 22, padding: '18px 26px', opacity: lerp(f, [W('cheap') - 4, W('cheap') + 6], [0, 1]) }}>
        <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 36, color: C.forest }}>AT HARVEST: CHEAP</div>
        <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 44, color: C.ochre, transform: `translateY(${(1 - arrow) * 20}px)`, opacity: arrow }}>↗</div>
        <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 36, color: C.ochre, opacity: arrow }}>LATER: COSTLY</div>
      </div>
    </AbsoluteFill>
  );
};

const A3: React.FC = () => {
  const f = useCurrentFrame();
  const a = L(6), mid = W('That', 0, 6);
  return (
    <AbsoluteFill>
      <Frame src={r9('V15_5.mp4')} from={a} to={mid + 6} x={80} y={600} w={920} h={680} at={a} grade="neutral" />
      {f >= mid - 6 && <Frame src={r9('V15_4.mp4')} from={mid - 6} to={L(7)} x={80} y={600} w={920} h={680} at={mid - 6} grade="golden" />}
      <Chip text="TODAY: CONTACTS AND CALLS" at={W('contacts')} x={540} y={640} dark />
      <Chip text="THE GAP WE ARE WORKING ON" at={W('gap')} x={540} y={1180} />
    </AbsoluteFill>
  );
};

const Comment: React.FC = () => {
  const f = useCurrentFrame();
  const a = L(7);
  const txt = 'Drop your question below…'.slice(0, Math.max(0, Math.floor((f - W('Drop')) * 1.6)));
  const heart = lerp(f, [W('comments'), W('comments') + 8, W('comments') + 16], [1, 1.35, 1], E.out);
  return (
    <AbsoluteFill style={{ background: PAPER }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center', fontFamily: F.display, fontWeight: 800, fontSize: 104, color: C.forest, letterSpacing: '-0.03em', opacity: lerp(f, [a, a + 8], [0, 1]) }}>HAVE A<br />QUESTION?</div>
      <div style={{ position: 'absolute', left: 80, right: 80, top: 760, background: '#fff', border: '2px solid #DDD8CC', borderRadius: 999, padding: '28px 36px', display: 'flex', alignItems: 'center', gap: 20, boxShadow: '0 20px 50px rgba(22,32,26,0.12)', opacity: lerp(f, [a + 4, a + 12], [0, 1]) }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: C.harvest }} />
        <div style={{ flex: 1, fontFamily: F.text, fontSize: 40, color: txt ? C.ink : '#A0A79F' }}>{txt || 'Add a comment…'}<span style={{ opacity: Math.floor(f / 8) % 2, color: C.forest }}>|</span></div>
        <div style={{ fontFamily: F.label, fontWeight: 700, fontSize: 30, color: C.forest }}>POST</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 960, display: 'flex', justifyContent: 'center', transform: `scale(${heart})` }}>
        <span style={{ fontSize: 110, color: '#D9534F', opacity: lerp(f, [W('comments') - 2, W('comments') + 4], [0, 1]) }}>♥</span>
      </div>
    </AbsoluteFill>
  );
};

const Hook: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: PAPER }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 230, textAlign: 'center', fontFamily: F.display, fontWeight: 800, fontSize: 104, lineHeight: 1.0, color: C.forest, letterSpacing: '-0.03em', opacity: lerp(f, [2, 12], [0, 1]) }}>
        3 QUESTIONS<br /><span style={{ color: C.ochre }}>WE GET ASKED</span>
      </div>
      {QS.map((q, i) => {
        const t = lerp(f, [10 + i * 7, 22 + i * 7], [0, 1], E.back);
        return (
          <div key={i} style={{ position: 'absolute', left: 110 + i * 20, width: 860 - i * 40, top: 620 + i * 190, background: '#fff', borderRadius: 26, padding: '24px 30px', boxShadow: '0 20px 50px rgba(22,32,26,0.15)', border: '1px solid #E4DFD3',
            opacity: Math.min(1, t), transform: `translateY(${(1 - Math.min(1, t)) * 120}px) rotate(${[-1.5, 1, -0.5][i] * (1 - Math.min(1, t))}deg)`, display: 'flex', alignItems: 'center', gap: 18 }}>
            <Icon name="question" size={54} color={C.forest} sw={10} />
            <div style={{ fontFamily: F.text, fontWeight: 600, fontSize: 34, color: C.ink }}>{q.q}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const V15: React.FC = () => (
  <Shell8 d={D} bg={PAPER} plate vignette={0.12}>
    <Span from={0} to={L(1)} fade={4}><Hook /></Span>
    <Span from={L(1)} to={L(7)} fade={4}>
      <AbsoluteFill style={{ background: PAPER }} />
      <Tabs />
      {QS.map((q, i) => {
        const to = i < 2 ? QS[i + 1].at : L(7);
        return <Span key={i} from={q.at} to={to} fade={4}><QCard i={i} /></Span>;
      })}
      <Span from={L(2)} to={L(3)} fade={4}><A1 /></Span>
      <Span from={L(4)} to={L(5)} fade={4}><A2 /></Span>
      <Span from={L(6)} to={L(7)} fade={4}><A3 /></Span>
    </Span>
    <Span from={L(7)} to={L(8)} fade={5}><Comment /></Span>
    <Span from={L(8)} to={FIN + 2} fade={6}><BrandBeat at={L(8)} text={"CONNECTING INDIA'S\nBIOMASS ECONOMY"} /></Span>
  </Shell8>
);
export const V15_FRAMES = totalFrames(D);
