import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Base, Footage, GradeOverlay, Subject} from '../series/core';
import {useT} from '../explainer/kit';
import {Ico, popAt} from '../series/kit2';
import {CARD_SHADOW, Card, CommentCta, H, HL, Hi, INK, Kicker, MUTED, PillCaps, Pop, Tag, TopWash, rise, winVis} from '../series/kit3';
import {EASE_IN_OUT, EASE_OUT, SANS, lerp, tween} from '../theme';
import {C, v13Config as cfg} from './config';

const GREEN = '#17A34A';
const RED = '#E5484D';

// ---------------------------------------------------------------------------
// Signature: the fader desk
// ---------------------------------------------------------------------------
type Fader = {label: string; icon: string; v: number; lock?: number; q?: number; glow?: number};
const Desk: React.FC<{faders: Fader[]; shake?: number; title?: React.ReactNode}> = ({faders, shake = 0, title}) => (
  <Card w={900} pad={28}>
    {title ? <div style={{marginBottom: 14}}>{title}</div> : null}
    <div style={{display: 'flex', justifyContent: 'space-around'}}>
      {faders.map((f, i) => {
        const jitter = shake > 0 ? Math.sin(shake * 60 + i * 2) * 10 * (1 - shake) : 0;
        return (
          <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: 220}}>
            <div style={{position: 'relative', width: 60, height: 250}}>
              <div style={{position: 'absolute', left: 24, top: 0, bottom: 0, width: 12, borderRadius: 6, background: '#ECE8E1'}} />
              <div style={{position: 'absolute', left: 24, bottom: 0, width: 12, height: `${f.v * 100}%`, borderRadius: 6, background: f.glow ? HL : INK}} />
              <div style={{position: 'absolute', left: 0, bottom: `calc(${f.v * 100}% - 22px)`, width: 60, height: 44, borderRadius: 12, background: '#fff', border: `5px solid ${INK}`, boxSizing: 'border-box', translate: `${jitter}px 0`, boxShadow: '0 6px 12px rgba(0,0,0,0.2)'}} />
              {f.lock ? (
                <div style={{position: 'absolute', left: 70, top: '40%', scale: Math.max(0, f.lock)}}>
                  <Ico name="lock-simple" size={44} color={INK} />
                </div>
              ) : null}
              {f.q ? (
                <div style={{position: 'absolute', left: -60, top: -30, scale: Math.max(0, f.q), fontFamily: SANS, fontWeight: 800, fontSize: 80, color: RED}}>?</div>
              ) : null}
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
              <Ico name={f.icon} size={34} color={INK} />
              <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: 1}}>{f.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  </Card>
);
const base = (v: number[]): Fader[] => [
  {label: 'FOOD', icon: 'fork-knife', v: v[0]},
  {label: 'STEPS', icon: 'sneaker-move', v: v[1]},
  {label: 'TRAINING', icon: 'barbell', v: v[2]},
];

// ---------------------------------------------------------------------------
const Hook: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.hook, 0.01);
  if (o <= 0) return null;
  const jump = (at: number) => tween(t, at, 0.35, EASE_OUT);
  const f = base([0.5 - 0.3 * jump(3.92), 0.4 + 0.45 * jump(4.64), 0.45 + 0.45 * jump(5.48)]);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pop x={540} y={290} at={1.0}>
        <Desk
          faders={f}
          shake={t >= 6.62 ? tween(t, 6.62, 0.6) : 0}
          title={
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <Kicker>SLOW WEEK. PANIC MODE.</Kicker>
              {t >= 6.62 ? <Tag bg={RED} size={28}>3 changes · 1 day</Tag> : null}
            </div>
          }
        />
      </Pop>
    </AbsoluteFill>
  );
};
const Which: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.which);
  if (o <= 0) return null;
  const f = base([0.2, 0.85, 0.9]).map((x, i) => ({...x, q: popAt(t, 11.38 + i * 0.22)}));
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pop x={540} y={290} at={C.which.start + 0.05}>
        <Desk
          faders={f}
          title={
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <H size={50}>
                it worked… <Hi p={tween(t, 11.4, 0.3)}>but why?</Hi>
              </H>
              {t >= 9.8 ? <Tag bg={GREEN} size={28}>▼ scale moved</Tag> : null}
            </div>
          }
        />
      </Pop>
    </AbsoluteFill>
  );
};
const TODO = ['log every meal', '10k steps', 'new workout split', 'weigh daily', 'meal prep Sunday', 'cut sugar'];
const Work: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.work);
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pop x={540} y={280} at={14.0}>
        <Card w={760} pad={28}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10}}>
            <Kicker>TO-DO · THIS WEEK</Kicker>
            {t >= 15.98 ? <Tag bg={RED} size={26}>overload</Tag> : null}
          </div>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px'}}>
            {TODO.map((x, i) => {
              const p = tween(t, 14.58 + i * 0.3, 0.25);
              return (
                <div key={i} style={{display: 'flex', alignItems: 'center', gap: 12, opacity: p, translate: `0 ${lerp(p, 12, 0)}px`}}>
                  <div style={{width: 30, height: 30, borderRadius: 8, border: `4px solid ${INK}`}} />
                  <span style={{fontFamily: SANS, fontWeight: 700, fontSize: 32, whiteSpace: 'nowrap'}}>{x}</span>
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
// The funnel
// ---------------------------------------------------------------------------
const STEPS = [
  {at: 19.86, label: 'TREND'},
  {at: 23.42, label: 'ROUTINE'},
  {at: 27.56, label: 'OBSTACLE'},
];
const OBST = [
  {at: 30.74, t: 'portions vary', icon: 'bowl-food'},
  {at: 32.16, t: 'less movement', icon: 'sneaker-move'},
  {at: 33.74, t: 'missed sessions', icon: 'calendar-dots'},
  {at: 35.16, t: 'too hard to keep', icon: 'warning-circle'},
];
const Funnel: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.funnel);
  if (o <= 0) return null;
  let k = -1;
  STEPS.forEach((s, i) => (t >= s.at - 0.05 ? (k = i) : null));
  const sv = (i: number) => (i === k ? tween(t, STEPS[i].at, 0.3) : 0);
  const layers = [
    {w: 300, y: 0},
    {w: 230, y: 118},
    {w: 160, y: 236},
  ];
  return (
    <AbsoluteFill style={{opacity: o}}>
      {/* funnel */}
      <Pop x={210} y={290} at={17.9}>
        <div style={{position: 'relative', width: 320, height: 400}}>
          {layers.map((l, i) => {
            const on = i === k;
            const done = i < k;
            return (
              <div key={i} style={{position: 'absolute', left: (320 - l.w) / 2, top: l.y, width: l.w, height: 104, clipPath: 'polygon(0 0, 100% 0, 88% 100%, 12% 100%)', background: on ? HL : done ? INK : '#FFFFFF', boxShadow: CARD_SHADOW, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: SANS, fontWeight: 800, fontSize: 26, color: done ? '#fff' : INK}}>
                {done ? <Ico name="check-circle" size={30} color={HL} /> : <span>{i + 1}</span>}
                {STEPS[i].label}
              </div>
            );
          })}
          <div style={{position: 'absolute', left: 135, top: 350, width: 50, height: 50, borderRadius: '50%', background: k === 2 && t >= 36.0 ? HL : '#fff', boxShadow: CARD_SHADOW, display: 'flex', alignItems: 'center', justifyContent: 'center', scale: t >= 36.0 ? lerp(Math.min(1, popAt(t, 36.0)), 1.4, 1) : 1}}>
            <Ico name="magnifying-glass" size={30} color={INK} />
          </div>
        </div>
      </Pop>
      {/* right panel */}
      <div style={{position: 'absolute', left: 410, top: 90, width: 610, height: 400}}>
        {k === 0 ? (
          <div style={{opacity: sv(0)}}>
            <Card w={610} h={380} pad={26}>
              <H size={46}>
                is it <Hi p={tween(t, 22.64, 0.3)}>really</Hi> flat?
              </H>
              <svg width={560} height={240} style={{marginTop: 16}}>
                {Array.from({length: 12}, (_, i) => (
                  <circle key={i} cx={20 + i * 47} cy={120 + Math.sin(i * 1.7) * 26} r={11 * Math.max(0, popAt(t, 20.4 + i * 0.06))} fill={MUTED} />
                ))}
                <path d="M20 122 L 537 120" stroke={INK} strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - tween(t, 21.6, 0.8, EASE_IN_OUT)} />
              </svg>
            </Card>
          </div>
        ) : null}
        {k === 1 ? (
          <div style={{opacity: sv(1)}}>
            <Card w={610} h={380} pad={26}>
              <H size={46}>followed, all week?</H>
              <div style={{display: 'flex', gap: 10, marginTop: 34}}>
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => {
                  const wk = i >= 5;
                  const p = popAt(t, 24.4 + i * 0.1);
                  return (
                    <div key={i} style={{flex: 1, height: 150, borderRadius: 16, background: wk && t >= 26.68 ? HL : '#F4F1EB', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, scale: Math.max(0, p)}}>
                      <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 30}}>{d}</span>
                      {wk ? <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 44, color: RED}}>?</span> : <Ico name="check-circle" size={40} color={GREEN} />}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        ) : null}
        {k === 2 ? (
          <div style={{opacity: sv(2)}}>
            <Card w={610} h={380} pad={26}>
              <H size={46}>
                find <Hi p={tween(t, 28.94, 0.3)}>the one</Hi>
              </H>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 22}}>
                {OBST.map((ob, i) => {
                  const hit = i === 0 && t >= 36.0;
                  return (
                    <div key={i} style={{height: 104, borderRadius: 18, background: hit ? HL : '#F4F1EB', display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px', scale: Math.max(0, popAt(t, ob.at)) * (hit ? lerp(Math.min(1, popAt(t, 36.0)), 1.1, 1) : 1), opacity: t >= 36.0 && !hit ? 0.45 : 1}}>
                      <Ico name={ob.icon} size={40} color={INK} />
                      <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 28, lineHeight: 1.05}}>{ob.t}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
const Row: React.FC<{t: number; at: number; then: number; icon: string; a: string; b: string}> = ({t, at, then, icon, a, b}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 18, opacity: tween(t, at, 0.3), translate: `${lerp(tween(t, at, 0.3), -20, 0)}px 0`}}>
    <div style={{width: 360, height: 120, borderRadius: 24, background: '#fff', boxShadow: CARD_SHADOW, display: 'flex', alignItems: 'center', gap: 14, padding: '0 22px', boxSizing: 'border-box'}}>
      <Ico name={icon} size={50} color={INK} />
      <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 34}}>{a}</span>
    </div>
    <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 60, color: INK, opacity: tween(t, then - 0.2, 0.2)}}>→</div>
    <div style={{width: 400, height: 120, borderRadius: 24, background: HL, boxShadow: CARD_SHADOW, display: 'flex', alignItems: 'center', padding: '0 24px', boxSizing: 'border-box', fontFamily: SANS, fontWeight: 800, fontSize: 36, scale: Math.max(0, popAt(t, then))}}>{b}</div>
  </div>
);
const Fixes: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.fixes);
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: 540, top: 100, translate: '-50% -50%', ...rise(t, 37.1)}}>
        <Kicker>FIX THAT ONE THING</Kicker>
      </div>
      <div style={{position: 'absolute', left: 540, top: 330, translate: '-50% -50%', display: 'flex', flexDirection: 'column', gap: 26}}>
        <Row t={t} at={37.28} then={39.9} icon="bowl-food" a="portions?" b="same meal, every day" />
        {t >= 42.9 ? <Row t={t} at={43.38} then={45.56} icon="calendar-dots" a="no time slot?" b="a new time slot" /> : <div style={{height: 120}} />}
      </div>
    </AbsoluteFill>
  );
};
const Adjust: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.adjust);
  if (o <= 0) return null;
  const nudge = tween(t, 51.62, 0.5, EASE_OUT);
  const f = base([0.55 - 0.1 * nudge, 0.5, 0.5]).map((x, i) => ({...x, glow: i === 0 && nudge > 0 ? 1 : 0, lock: i > 0 ? popAt(t, 51.9 + i * 0.15) : 0}));
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pop x={540} y={290} at={46.7}>
        <Desk
          faders={f}
          title={
            <div style={{display: 'flex', gap: 12, alignItems: 'center'}}>
              {t >= 48.68 ? <Tag bg={GREEN} size={26}>✓ consistent</Tag> : null}
              {t >= 50.62 ? <Tag bg={INK} size={26}>✓ still flat</Tag> : null}
              {t >= 51.62 ? <Tag bg={HL} fg={INK} size={26}>one small nudge</Tag> : null}
            </div>
          }
        />
      </Pop>
    </AbsoluteFill>
  );
};
const Review: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.review);
  if (o <= 0) return null;
  const gap = 0.45 + 0.25 * Math.sin(Math.max(0, t - 59.5) * 2.4) * tween(t, 59.5, 0.4);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pop x={540} y={290} at={55.0}>
        <Card w={900} h={300} pad={30}>
          <H size={48}>
            let a <Hi p={tween(t, 58.4, 0.3)}>pattern</Hi> show
          </H>
          <div style={{position: 'relative', height: 120, marginTop: 40}}>
            <div style={{position: 'absolute', left: 0, right: 0, top: 54, height: 10, borderRadius: 5, background: '#ECE8E1'}} />
            <div style={{position: 'absolute', left: 0, top: 30, width: 56, height: 56, borderRadius: '50%', background: INK}} />
            <div style={{position: 'absolute', left: 0, top: 96, fontFamily: SANS, fontWeight: 800, fontSize: 24, color: MUTED}}>change</div>
            <div style={{position: 'absolute', left: `${gap * 100}%`, top: 30, width: 56, height: 56, borderRadius: '50%', background: HL, border: `5px solid ${INK}`, boxSizing: 'border-box', translate: '-50% 0', opacity: tween(t, 55.84, 0.3)}} />
            <div style={{position: 'absolute', left: `${gap * 100}%`, top: 96, translate: '-50% 0', fontFamily: SANS, fontWeight: 800, fontSize: 24, color: MUTED, opacity: tween(t, 55.84, 0.3)}}>review</div>
            {t >= 59.5 ? <div style={{position: 'absolute', left: `${gap * 50}%`, top: -6, translate: '-50% 0', fontFamily: SANS, fontWeight: 800, fontSize: 30}}>⟷ depends</div> : null}
          </div>
        </Card>
      </Pop>
    </AbsoluteFill>
  );
};
const Stable: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.stable);
  if (o <= 0) return null;
  const f = base([0.45, 0.5, 0.5]).map((x, i) => ({...x, glow: i === 0 ? 1 : 0, lock: i > 0 ? popAt(t, 63.6 + i * 0.15) : 0}));
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pop x={540} y={290} at={62.2}>
        <Desk faders={f} title={<H size={48}>one moves · the rest stay</H>} />
      </Pop>
    </AbsoluteFill>
  );
};
const Note: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.note);
  if (o <= 0) return null;
  const line = (label: string, at: number, w: number) => (
    <div style={{display: 'flex', alignItems: 'center', gap: 18, padding: '16px 0', borderBottom: '3px solid #EFEBE4', opacity: tween(t, at, 0.3)}}>
      <span style={{width: 180, fontFamily: SANS, fontWeight: 800, fontSize: 32, letterSpacing: 2}}>{label}</span>
      <div style={{height: 18, width: w * tween(t, at + 0.1, 0.6, EASE_OUT), borderRadius: 9, background: HL}} />
    </div>
  );
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pop x={540} y={280} at={66.64}>
        <Card w={860} pad={30}>
          <Kicker>CHECK-IN NOTE</Kicker>
          {line('WHY', 69.18, 520)}
          {line('NEXT', 71.36, 440)}
        </Card>
      </Pop>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
const WASH = [C.hook, C.which, C.work, C.funnel, C.fixes, C.adjust, C.review, C.stable, C.note, C.cta];
const Scene: React.FC = () => (
  <>
    <Footage cfg={cfg} />
    <GradeOverlay cfg={cfg} />
    <TopWash wins={WASH} reach={38} />
    <Hook />
    <Which />
    <Work />
    <Funnel />
    <Fixes />
    <Adjust />
    <Review />
    <Stable />
    <Note />
    <CommentCta start={C.cta.start} word="GUIDE" typeAt={73.56} dmAt={74.86} top={70} Ico={Ico} />
    <Subject cfg={cfg} />
    <PillCaps cfg={cfg} hide={[{start: C.cta.start + 0.3, end: 999}]} />
  </>
);

export const V13Reel: React.FC = () => (
  <Base cfg={{...cfg, shakes: [6.62]}}>
    <Scene />
  </Base>
);

