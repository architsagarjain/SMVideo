import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Base, BrollCuts, Footage, GradeOverlay, Subject, inWin} from '../series/core';
import {useT} from '../explainer/kit';
import {Ico, popAt} from '../series/kit2';
import {CARD_SHADOW, Card, CommentCta, H, HL, Hi, INK, Kicker, MUTED, PillCaps, Pop, Tag, TopWash, winVis} from '../series/kit3';
import {EASE_IN_OUT, EASE_OUT, SANS, lerp, tween} from '../theme';
import {C, v15Config as cfg} from './config';

const NIGHT = '#2B3256';
const MOON = '#C9D2FF';
const GREEN = '#17A34A';

// ---------------------------------------------------------------------------
// Signature 1: the night timeline (11 pm - 7 am)
// ---------------------------------------------------------------------------
const HOURS = ['11', '12', '1', '2', '3', '4', '5', '6'];
const Night: React.FC<{t: number; cut: number; w?: number}> = ({t, cut, w = 900}) => {
  const bw = (w - 60 - 7 * 8) / 8;
  return (
    <div style={{display: 'flex', gap: 8}}>
      {HOURS.map((h, i) => {
        const last = i === 7;
        const k = popAt(t, 1.1 + i * 0.06);
        const gone = last ? cut : 0;
        return (
          <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8}}>
            <div style={{position: 'relative', width: bw, height: 110, borderRadius: 16, background: '#EEF0FA', overflow: 'hidden', scale: Math.max(0, Math.min(1, k))}}>
              <div style={{position: 'absolute', inset: 0, borderRadius: 16, background: NIGHT, opacity: 1 - gone, translate: `0 ${gone * -40}px`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Ico name={i === 0 ? 'moon-stars' : 'moon'} size={44} color={MOON} />
              </div>
              {last && cut > 0.5 ? (
                <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 30, color: '#E5484D'}}>−1h</div>
              ) : null}
            </div>
            <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 22, color: MUTED}}>{h}</span>
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Signature 2: where the weight came from (stacked bar)
// ---------------------------------------------------------------------------
const Split: React.FC<{t: number; fat: number; at: number; leanAt: number; label: string; icon: string}> = ({t, fat, at, leanAt, label, icon}) => {
  const pf = tween(t, at, 0.8, EASE_OUT);
  const pl = tween(t, leanAt, 0.8, EASE_OUT);
  const W = 640;
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 20, padding: '14px 0'}}>
      <div style={{width: 200, display: 'flex', alignItems: 'center', gap: 10}}>
        <div style={{width: 56, height: 56, borderRadius: 16, background: NIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Ico name={icon} size={34} color={MOON} />
        </div>
        <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 28, lineHeight: 1.05}}>{label}</span>
      </div>
      <div style={{position: 'relative', width: W, height: 86, borderRadius: 20, background: '#F4F1EB', overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 0, top: 0, height: 86, width: W * (fat / 100) * pf, background: HL, display: 'flex', alignItems: 'center', paddingLeft: 18, boxSizing: 'border-box', fontFamily: SANS, fontWeight: 800, fontSize: 36, whiteSpace: 'nowrap', overflow: 'hidden'}}>
          {pf > 0.6 ? `${fat}% fat` : ''}
        </div>
        <div style={{position: 'absolute', right: 0, top: 0, height: 86, width: W * ((100 - fat) / 100) * pl, background: INK, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 18, boxSizing: 'border-box', fontFamily: SANS, fontWeight: 800, fontSize: 36, whiteSpace: 'nowrap', overflow: 'hidden'}}>
          {pl > 0.6 ? `${100 - fat}% lean` : ''}
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
const Hook: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.hook, 0.01);
  if (o <= 0) return null;
  const cut = tween(t, 2.6, 0.5, EASE_IN_OUT);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pop x={540} y={330} at={0.96}>
        <Card w={960} pad={30}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18}}>
            <H size={56}>
              8 h → <Hi p={tween(t, 2.9, 0.3)}>7 h</Hi>
            </H>
            {t >= 4.7 ? (
              <div style={{display: 'flex', alignItems: 'center', gap: 10, opacity: tween(t, 4.7, 0.3)}}>
                <Ico name="fire" size={44} color={tween(t, 5.46, 0.5) > 0.5 ? '#C8C2B8' : '#FF6B1A'} />
                <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 32, color: tween(t, 5.46, 0.5) > 0.5 ? '#B5AFA5' : INK}}>fat loss</span>
              </div>
            ) : null}
          </div>
          <Night t={t} cut={cut} />
        </Card>
      </Pop>
    </AbsoluteFill>
  );
};
const Two: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.two);
  if (o <= 0) return null;
  const split = tween(t, 10.12, 0.5, EASE_IN_OUT);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pop x={540} y={160} at={7.96}>
        <Card w={420} pad={20} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14}}>
          <Ico name="scales" size={56} color={INK} />
          <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 40}}>weight lost</span>
        </Card>
      </Pop>
      {[
        {x: 300, at: 11.4, icon: 'drop', label: 'BODY FAT', bg: HL},
        {x: 780, at: 12.48, icon: 'barbell', label: 'MUSCLE', bg: '#fff'},
      ].map((c, i) => (
        <div key={i} style={{position: 'absolute', left: lerp(split, 540, c.x), top: 420, translate: '-50% -50%', opacity: split}}>
          <Pop x={0} y={0} at={c.at}>
            <Card w={360} pad={26} style={{background: c.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
              <Ico name={c.icon} size={90} color={INK} />
              <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 40}}>{c.label}</span>
            </Card>
          </Pop>
        </div>
      ))}
      {split > 0 ? (
        <svg width={1080} height={700} style={{position: 'absolute', left: 0, top: 0, opacity: split}}>
          <path d="M540 205 C 540 260, 300 260, 300 300" fill="none" stroke={INK} strokeWidth={6} strokeDasharray="2 14" strokeLinecap="round" />
          <path d="M540 205 C 540 260, 780 260, 780 300" fill="none" stroke={INK} strokeWidth={6} strokeDasharray="2 14" strokeLinecap="round" />
        </svg>
      ) : null}
    </AbsoluteFill>
  );
};
const Control: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.control);
  if (o <= 0) return null;
  const ang = lerp(tween(t, 15.0, 1.8, EASE_IN_OUT), -60, 55) + Math.sin(t * 3) * 4;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pop x={540} y={330} at={14.3}>
        <Card w={760} pad={30}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <Kicker>FAT</Kicker>
            <H size={46}>
              sleep <Hi p={tween(t, 15.74, 0.3)}>steers it</Hi>
            </H>
            <Kicker>MUSCLE</Kicker>
          </div>
          <div style={{position: 'relative', height: 220, marginTop: 10}}>
            <svg width={700} height={220} viewBox="-350 -200 700 220">
              <path d="M-200 0 A200 200 0 0 1 200 0" fill="none" stroke="#ECE8E1" strokeWidth={28} strokeLinecap="round" />
              <path d="M-200 0 A200 200 0 0 1 0 -200" fill="none" stroke={HL} strokeWidth={28} strokeLinecap="round" />
              <g style={{rotate: `${ang}deg`}}>
                <line x1={0} y1={0} x2={0} y2={-170} stroke={INK} strokeWidth={12} strokeLinecap="round" />
              </g>
              <circle r={34} fill={NIGHT} />
            </svg>
            <div style={{position: 'absolute', left: 350 - 22, top: 176, width: 44, height: 44}}>
              <Ico name="moon" size={44} color={MOON} />
            </div>
          </div>
        </Card>
      </Pop>
    </AbsoluteFill>
  );
};
const Study: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.study);
  if (o <= 0) return null;
  const nights = (less: boolean, at: number) => (
    <div style={{display: 'flex', gap: 8}}>
      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => {
        const short = less && i < 5;
        return (
          <div key={i} style={{width: 62, height: 78, borderRadius: 14, background: NIGHT, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, scale: Math.max(0, popAt(t, at + i * 0.06)), position: 'relative'}}>
            <Ico name="moon" size={30} color={MOON} />
            <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 18, color: MOON}}>{d}</span>
            {short && t >= 32.64 ? <div style={{position: 'absolute', right: -6, top: -8, padding: '2px 6px', borderRadius: 8, background: '#E5484D', color: '#fff', fontFamily: SANS, fontWeight: 800, fontSize: 16, scale: Math.max(0, popAt(t, 32.7 + i * 0.08))}}>−1h</div> : null}
          </div>
        );
      })}
    </div>
  );
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pop x={540} y={110} at={21.74}>
        <Tag size={32}>
          <Ico name="magnifying-glass" size={34} color="#fff" /> THE STUDY
        </Tag>
      </Pop>
      <Pop x={540} y={390} at={24.98}>
        <Card w={960} pad={28}>
          {[
            {name: 'GROUP A', less: false, at: 25.1, note: 'full nights'},
            {name: 'GROUP B', less: true, at: 25.4, note: 'short nights'},
          ].map((g, i) => (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 22, padding: '14px 0', borderBottom: i === 0 ? '3px solid #EFEBE4' : undefined}}>
              <div style={{width: 200}}>
                <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 32}}>{g.name}</div>
                <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 24, color: MUTED}}>{g.note}</div>
              </div>
              {nights(g.less, g.at)}
            </div>
          ))}
          {t >= 27.58 ? (
            <div style={{marginTop: 16, display: 'flex', justifyContent: 'center', opacity: tween(t, 27.58, 0.3)}}>
              <Tag bg={HL} fg={INK} size={30}>
                <Ico name="equals" size={32} color={INK} /> identical diets
              </Tag>
            </div>
          ) : null}
        </Card>
      </Pop>
    </AbsoluteFill>
  );
};
const Same: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.same);
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pop x={540} y={110} at={37.04}>
        <Tag size={32}>
          <Ico name="calendar-check" size={34} color="#fff" /> THE RESULT
        </Tag>
      </Pop>
      {['A', 'B'].map((g, i) => (
        <Pop key={i} x={i ? 790 : 290} y={380} at={38.38 + i * 0.3}>
          <Card w={380} pad={26} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
            <Ico name="scales" size={96} color={INK} />
            <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 34}}>Group {g}</span>
            {t >= 40.26 ? <span style={{padding: '4px 16px', borderRadius: 10, background: HL, fontFamily: SANS, fontWeight: 800, fontSize: 30}}>▼ same</span> : null}
          </Card>
        </Pop>
      ))}
      {t >= 40.26 ? (
        <Pop x={540} y={380} at={40.26}>
          <div style={{width: 100, height: 100, borderRadius: '50%', background: INK, border: '6px solid #fff', boxShadow: CARD_SHADOW, display: 'flex', alignItems: 'center', justifyContent: 'center', color: HL, fontFamily: SANS, fontWeight: 800, fontSize: 64}}>=</div>
        </Pop>
      ) : null}
    </AbsoluteFill>
  );
};
const Comp: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.comp);
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pop x={540} y={360} at={44.74}>
        <Card w={960} pad={30}>
          <div style={{marginBottom: 10}}>
            <H size={50}>
              what was <Hi p={tween(t, 46.32, 0.3)}>actually lost</Hi>
            </H>
          </div>
          <Split t={t} fat={83} at={53.28} leanAt={57.3} label="full nights" icon="moon-stars" />
          {t >= 60.06 ? <Split t={t} fat={15} at={67.92} leanAt={64.4} label="−1 h nights" icon="moon" /> : <div style={{height: 114}} />}
        </Card>
      </Pop>
    </AbsoluteFill>
  );
};
const Lift: React.FC = () => {
  const t = useT();
  const o = winVis(t, {start: C.lift.start, end: C.liftBroll.start});
  const o2 = winVis(t, {start: C.liftBroll.end, end: C.lift.end});
  return (
    <AbsoluteFill>
      {o > 0 ? (
        <AbsoluteFill style={{opacity: o}}>
          <Pop x={540} y={330} at={70.8}>
            <Card w={760} pad={30} style={{display: 'flex', alignItems: 'center', gap: 20}}>
              <Ico name="warning-circle" size={70} color={INK} />
              <div>
                <Kicker>ONE CATCH</Kicker>
                <H size={50}>
                  <Hi p={tween(t, 73.64, 0.3)}>no weights</Hi> in this study
                </H>
              </div>
            </Card>
          </Pop>
        </AbsoluteFill>
      ) : null}
      {o2 > 0 ? (
        <AbsoluteFill style={{opacity: o2}}>
          <Pop x={540} y={330} at={C.liftBroll.end}>
            <Tag bg={HL} fg={INK} size={40}>
              <Ico name="barbell" size={44} color={INK} /> muscle insurance
            </Tag>
          </Pop>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
const LiftTag: React.FC = () => {
  const t = useT();
  if (!inWin(t, [C.liftBroll])) return null;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0) 30%)'}} />
      <Pop x={540} y={220} at={C.liftBroll.start + 0.2}>
        <Tag bg={HL} fg={INK} size={44}>
          <Ico name="barbell" size={48} color={INK} /> strength training
        </Tag>
      </Pop>
    </AbsoluteFill>
  );
};
const Adapt: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.adapt);
  if (o <= 0) return null;
  const p = tween(t, 83.0, 1.6, EASE_IN_OUT);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pop x={540} y={340} at={82.2}>
        <Card w={860} pad={30}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <H size={48}>
              a <Hi p={tween(t, 84.06, 0.3)}>partial</Hi> bounce-back
            </H>
            {t >= 88.34 ? (
              <div style={{display: 'flex', alignItems: 'center', gap: 8, scale: Math.max(0, popAt(t, 88.34))}}>
                <Ico name="baby-carriage" size={50} color={INK} />
                <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 28}}>new parents</span>
              </div>
            ) : null}
          </div>
          <svg width={800} height={200} style={{marginTop: 10}}>
            <path d="M20 40 C 160 40, 220 170, 360 170 S 640 110, 780 100" fill="none" stroke={INK} strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
            <text x={20} y={30} fontFamily={SANS} fontWeight={800} fontSize={22} fill={MUTED}>less sleep</text>
            <text x={660} y={86} fontFamily={SANS} fontWeight={800} fontSize={22} fill={MUTED} opacity={p}>over time</text>
          </svg>
        </Card>
      </Pop>
    </AbsoluteFill>
  );
};
const Dialed: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.dialed);
  if (o <= 0) return null;
  const items = [
    {n: 'food', icon: 'fork-knife', at: 90.3},
    {n: 'training', icon: 'barbell', at: 90.6},
    {n: 'steps', icon: 'sneaker-move', at: 90.9},
    {n: 'sleep', icon: 'moon', at: 92.18},
  ];
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pop x={540} y={340} at={89.8}>
        <Card w={900} pad={28}>
          <div style={{display: 'flex', gap: 18}}>
            {items.map((it, i) => {
              const last = i === 3;
              const k = popAt(t, it.at);
              return (
                <div key={i} style={{flex: 1, height: 210, borderRadius: 24, background: last ? (t >= 93.98 ? HL : '#F4F1EB') : '#F4F1EB', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, scale: Math.max(0, Math.min(1.05, k)), position: 'relative'}}>
                  <Ico name={it.icon} size={70} color={INK} />
                  <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 32}}>{it.n}</span>
                  <div style={{position: 'absolute', right: 10, top: 10, width: 44, height: 44, borderRadius: '50%', background: last ? INK : GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: SANS, fontWeight: 800, fontSize: 28}}>
                    {last ? '?' : <Ico name="check-circle" size={34} color="#fff" />}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </Pop>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
const WASH = [C.hook, C.two, C.control, C.study, C.same, C.comp, {start: C.lift.start, end: C.liftBroll.start}, {start: C.liftBroll.end, end: C.lift.end}, C.adapt, C.dialed, C.cta];
const Scene: React.FC = () => (
  <>
    <Footage cfg={cfg} />
    <GradeOverlay cfg={cfg} />
    <TopWash wins={WASH} reach={48} />
    <Hook />
    <Two />
    <Control />
    <Study />
    <Same />
    <Comp />
    <Lift />
    <Adapt />
    <Dialed />
    <CommentCta start={C.cta.start} word="SLEEP" typeAt={96.26} dmAt={97.4} top={90} Ico={Ico} />
    <Subject cfg={cfg} />
    <BrollCuts cfg={cfg} />
    <LiftTag />
    <PillCaps cfg={cfg} hide={[{start: C.cta.start + 0.3, end: 999}]} y={() => 1560} />
  </>
);

export const V15Reel: React.FC = () => (
  <Base cfg={{...cfg, shakes: [2.6]}}>
    <Scene />
  </Base>
);

