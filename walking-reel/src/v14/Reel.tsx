import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Base, BrollCuts, Footage, GradeOverlay, Subject, inWin} from '../series/core';
import {useT} from '../explainer/kit';
import {Ico, popAt} from '../series/kit2';
import {CARD_SHADOW, Card, CommentCta, H, HL, Hi, INK, Kicker, MUTED, PillCaps, Pop, Tag, TopWash, rise, winVis} from '../series/kit3';
import {EASE_IN_OUT, EASE_OUT, SANS, lerp, tween} from '../theme';
import {C, v14Config as cfg} from './config';

const GREEN = '#17A34A';
const RED = '#E5484D';
const SEAT = '#E4DFD6';

// ---------------------------------------------------------------------------
// Signature: the day ribbon, 9 am - 9 pm
// ---------------------------------------------------------------------------
const H0 = 9;
const H1 = 21;
const RW = 840; // ribbon width
const hx = (h: number) => ((h - H0) / (H1 - H0)) * RW;
type Block = {from: number; to: number; bg: string; label?: string; fg?: string; o?: number};
const Ribbon: React.FC<{blocks: Block[]; ticks?: {h: number; o: number; bg?: string}[]; title?: React.ReactNode; note?: React.ReactNode}> = ({blocks, ticks = [], title, note}) => (
  <Card w={940} pad={30}>
    {title ? <div style={{marginBottom: 18}}>{title}</div> : null}
    <div style={{position: 'relative', width: RW, height: 120, marginLeft: 20}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 92, borderRadius: 18, background: '#F4F1EB'}} />
      {blocks.map((b, i) => (
        <div key={i} style={{position: 'absolute', left: hx(b.from), top: 0, width: hx(b.to) - hx(b.from), height: 92, borderRadius: 18, background: b.bg, color: b.fg ?? INK, opacity: b.o ?? 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 28, whiteSpace: 'nowrap', overflow: 'hidden'}}>
          {b.label}
        </div>
      ))}
      {ticks.map((k, i) => (
        <div key={i} style={{position: 'absolute', left: hx(k.h) - 7, top: 14, width: 14, height: 64, borderRadius: 7, background: k.bg ?? INK, opacity: k.o, scale: `1 ${k.o}`}} />
      ))}
      {[9, 12, 15, 18, 21].map((h) => (
        <div key={h} style={{position: 'absolute', left: hx(h), top: 98, translate: '-50% 0', fontFamily: SANS, fontWeight: 800, fontSize: 22, color: MUTED}}>{h <= 12 ? `${h} am`.replace('12 am', '12 pm') : `${h - 12} pm`}</div>
      ))}
    </div>
    {note ? <div style={{marginTop: 14}}>{note}</div> : null}
  </Card>
);
const breakTicks = (t: number, at: number, from = 9.5, to = 18, step = 0.5) =>
  Array.from({length: Math.round((to - from) / step) + 1}, (_, i) => ({h: from + i * step, o: tween(t, at + i * 0.04, 0.2)}));

// ---------------------------------------------------------------------------
const Hook: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.hook, 0.01);
  if (o <= 0) return null;
  const seat = tween(t, 4.64, 0.8, EASE_IN_OUT);
  const pulse = t >= 8.78 ? 1 + 0.06 * Math.sin((t - 8.78) * 9) * (1 - tween(t, 9.6, 0.4)) : 1;
  return (
    <AbsoluteFill style={{opacity: o}}>
      {t < C.deskBroll.start ? (
        <div style={{position: 'absolute', left: 540, top: 150, translate: '-50% -50%', ...rise(t, 1.34)}}>
          <Kicker>A DESK DAY</Kicker>
        </div>
      ) : null}
      {t >= C.deskBroll.end - 0.05 ? (
        <Pop x={540} y={300} at={C.deskBroll.end}>
          <Ribbon
            blocks={[
              {from: 9, to: 9 + 9 * seat, bg: SEAT, label: seat > 0.5 ? 'sitting' : ''},
              {from: 19, to: 20, bg: HL, label: 'gym', o: tween(t, 6.18, 0.3)},
            ]}
            title={
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <H size={50}>
                  the <Hi p={tween(t, 5.32, 0.3)}>other 11 hours</Hi>
                </H>
                {t >= 8.78 ? (
                  <div style={{scale: pulse}}>
                    <Tag bg={INK} size={28}>gym = 1 hour</Tag>
                  </div>
                ) : null}
              </div>
            }
          />
        </Pop>
      ) : null}
    </AbsoluteFill>
  );
};
const Trial: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.trial);
  if (o <= 0) return null;
  const lanes = tween(t, 16.0, 0.35);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pop x={540} y={110} at={10.94}>
        <Tag size={30}>
          <Ico name="magnifying-glass" size={34} color="#fff" /> CONTROLLED TRIAL
        </Tag>
      </Pop>
      {lanes <= 0.01 ? (
        <Pop x={540} y={320} at={12.26}>
          <Card w={900} pad={26}>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 8}}>
              {Array.from({length: 24}, (_, i) => (
                <div key={i} style={{scale: Math.max(0, popAt(t, 12.3 + i * 0.03)), display: 'flex', justifyContent: 'center'}}>
                  <Ico name="person" size={56} color={INK} />
                </div>
              ))}
            </div>
            <div style={{display: 'flex', gap: 12, marginTop: 16, justifyContent: 'center'}}>
              {t >= 12.74 ? <Tag bg={HL} fg={INK} size={28}>inactive adults</Tag> : null}
              {t >= 14.34 ? <Tag bg={HL} fg={INK} size={28}>type 2 diabetes</Tag> : null}
            </div>
          </Card>
        </Pop>
      ) : (
        <div style={{position: 'absolute', left: 540, top: 330, translate: '-50% -50%', opacity: lanes}}>
          <Card w={940} pad={26}>
            {[
              {label: 'every 30 min', icon: 'person-simple-walk', at: 16.04, on: true},
              {label: 'stayed seated', icon: 'office-chair', at: 19.68, on: false},
            ].map((l, i) => (
              <div key={i} style={{display: 'flex', alignItems: 'center', gap: 18, padding: '14px 0', borderBottom: i === 0 ? '3px solid #EFEBE4' : undefined, opacity: tween(t, l.at, 0.3)}}>
                <div style={{width: 210, fontFamily: SANS, fontWeight: 800, fontSize: 30}}>{l.label}</div>
                <div style={{flex: 1, position: 'relative', height: 70, borderRadius: 14, background: SEAT}}>
                  {l.on
                    ? Array.from({length: 8}, (_, k) => (
                        <div key={k} style={{position: 'absolute', left: `${6 + k * 12.5}%`, top: 6, width: 58, height: 58, borderRadius: 14, background: HL, display: 'flex', alignItems: 'center', justifyContent: 'center', scale: Math.max(0, popAt(t, 16.5 + k * 0.12))}}>
                          <Ico name="person-simple-walk" size={40} color={INK} />
                        </div>
                      ))
                    : (
                      <div style={{position: 'absolute', left: 14, top: 6}}>
                        <Ico name="office-chair" size={58} color={INK} />
                      </div>
                    )}
                </div>
              </div>
            ))}
            <div style={{marginTop: 10, fontFamily: SANS, fontWeight: 800, fontSize: 26, color: MUTED}}>
              3-minute walking breaks
            </div>
          </Card>
        </div>
      )}
    </AbsoluteFill>
  );
};
const Glucose: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.glucose);
  if (o <= 0) return null;
  const W = 820;
  const Hh = 230;
  const curve = (peak: number) => {
    const pts = Array.from({length: 41}, (_, i) => {
      const x = i / 40;
      const y = peak * Math.exp(-Math.pow((x - 0.32) / 0.2, 2)) + 0.04;
      return [40 + x * (W - 60), Hh - y * (Hh - 30)];
    });
    return pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ');
  };
  const a = tween(t, 23.0, 0.9, EASE_IN_OUT);
  const b = tween(t, 24.8, 0.9, EASE_IN_OUT);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pop x={540} y={300} at={21.6}>
        <Card w={940} pad={28}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <Kicker>AFTER A MEAL</Kicker>
            {t >= 28.14 ? (
              <div style={{scale: lerp(Math.min(1, popAt(t, 28.14)), 1.4, 1)}}>
                <Tag bg={HL} fg={INK} size={40}>−39% rise</Tag>
              </div>
            ) : null}
          </div>
          <svg width={W} height={Hh + 30} style={{marginTop: 10}}>
            <line x1={40} y1={Hh} x2={W - 20} y2={Hh} stroke="#E4DFD6" strokeWidth={4} />
            <path d={curve(0.95)} fill="none" stroke="#B9B2A6" strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - a} />
            <path d={curve(0.58)} fill="none" stroke={INK} strokeWidth={12} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - b} />
          </svg>
          <div style={{display: 'flex', gap: 24, fontFamily: SANS, fontWeight: 800, fontSize: 26}}>
            <span style={{color: '#9E968A', opacity: a}}>— seated</span>
            <span style={{color: INK, opacity: b}}>— walking breaks</span>
          </div>
        </Card>
      </Pop>
    </AbsoluteFill>
  );
};
const Not: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.not);
  if (o <= 0) return null;
  const row = (txt: string, at: number, ok: boolean) => (
    <div style={{display: 'flex', alignItems: 'center', gap: 18, padding: '14px 0', opacity: tween(t, at, 0.3), translate: `${lerp(tween(t, at, 0.3), -20, 0)}px 0`}}>
      <div style={{width: 60, height: 60, borderRadius: '50%', background: ok ? GREEN : RED, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Ico name={ok ? 'check-circle' : 'x-circle'} size={44} color="#fff" />
      </div>
      <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 42, textDecoration: ok ? 'none' : 'line-through', textDecorationThickness: 5, color: ok ? INK : MUTED}}>{txt}</span>
    </div>
  );
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pop x={540} y={290} at={30.2}>
        <Card w={860} pad={30}>
          <div style={{marginBottom: 6}}>
            <H size={46}>
              <Hi p={tween(t, 30.6, 0.3)}>−39%</Hi> means…
            </H>
          </div>
          {row('a smaller spike after meals', 30.44, true)}
          {row('39% lower blood sugar', 32.84, false)}
          {row('39% fat loss', 36.02, false)}
        </Card>
      </Pop>
    </AbsoluteFill>
  );
};
const Vary: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.promise);
  if (o <= 0) return null;
  const loop = tween(t, 43.4, 0.4);
  return (
    <AbsoluteFill style={{opacity: o}}>
      {loop < 0.5 ? (
        <Pop x={540} y={300} at={37.98}>
          <Card w={760} pad={28}>
            <Kicker>RESULTS VARY</Kicker>
            <div style={{display: 'flex', justifyContent: 'space-around', marginTop: 20}}>
              {[0.9, 0.55, 0.75, 0.4].map((v, i) => (
                <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, scale: Math.max(0, popAt(t, 38.3 + i * 0.15))}}>
                  <Ico name="person" size={84} color={INK} />
                  <div style={{width: 90, height: 16, borderRadius: 8, background: '#ECE8E1'}}>
                    <div style={{width: `${v * 100 * tween(t, 39.1, 0.6)}%`, height: 16, borderRadius: 8, background: HL}} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Pop>
      ) : (
        <Pop x={540} y={300} at={43.4}>
          <Card w={860} pad={30}>
            <Kicker>A PATTERN TO TRY</Kicker>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 26, marginTop: 20}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '18px 26px', borderRadius: 22, background: SEAT}}>
                <Ico name="office-chair" size={56} color={INK} />
                <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 44}}>30 min</span>
              </div>
              <Ico name="arrows-clockwise" size={64} color={INK} />
              <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '18px 26px', borderRadius: 22, background: HL}}>
                <Ico name="person-simple-walk" size={56} color={INK} />
                <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 44}}>3 min</span>
              </div>
            </div>
          </Card>
        </Pop>
      )}
    </AbsoluteFill>
  );
};
const Reminder: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.reminder);
  if (o <= 0) return null;
  const secs = Math.round(180 - 180 * tween(t, 51.2, 2.2, (x) => x) * 0.08);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pop x={540} y={150} at={49.58}>
        <div style={{width: 900, display: 'flex', alignItems: 'center', gap: 20, padding: 20, boxSizing: 'border-box', borderRadius: 34, background: 'rgba(255,255,255,0.96)', boxShadow: CARD_SHADOW, fontFamily: SANS}}>
          <div style={{width: 84, height: 84, borderRadius: 22, background: HL, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, rotate: `${Math.sin(t * 30) * 8 * (1 - tween(t, 50.2, 0.6))}deg`}}>
            <Ico name="bell-ringing" size={54} color={INK} />
          </div>
          <div style={{flex: 1}}>
            <div style={{fontSize: 26, fontWeight: 700, color: MUTED}}>Reminders · now</div>
            <div style={{fontSize: 42, fontWeight: 800, color: INK}}>Stand up, move for 3 min</div>
          </div>
        </div>
      </Pop>
      <Pop x={540} y={380} at={51.04}>
        <Card w={440} pad={22} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18}}>
          <Ico name="timer" size={64} color={INK} />
          <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 80, fontVariantNumeric: 'tabular-nums'}}>
            {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}
          </span>
        </Card>
      </Pop>
    </AbsoluteFill>
  );
};
const WalkTags: React.FC = () => {
  const t = useT();
  if (!inWin(t, [C.walk])) return null;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0) 30%)'}} />
      <Pop x={330} y={200} at={54.06}>
        <Tag bg="#fff" fg={INK} size={40}>
          <Ico name="footprints" size={44} color={INK} /> indoor loop
        </Tag>
      </Pop>
      <Pop x={740} y={320} at={55.96}>
        <Tag bg={HL} fg={INK} size={40}>
          <Ico name="drop" size={44} color={INK} /> water refill
        </Tag>
      </Pop>
    </AbsoluteFill>
  );
};
const Meeting: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.meeting);
  if (o <= 0) return null;
  const meet = tween(t, 57.62, 0.3);
  const after = tween(t, 59.24, 0.6, EASE_IN_OUT);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pop x={540} y={300} at={57.1}>
        <Ribbon
          blocks={[
            {from: 9, to: 18, bg: SEAT},
            {from: 11, to: 12, bg: INK, fg: '#fff', label: 'meeting', o: meet},
          ]}
          ticks={[
            {h: 10.5, o: 1},
            {h: lerp(after, 11.5, 12.15), o: 1, bg: after > 0.95 ? GREEN : RED},
            {h: 12.5, o: 1},
            {h: 13, o: 1},
          ]}
          title={
            <H size={48}>
              break <Hi p={tween(t, 59.3, 0.3)}>moved, not missed</Hi>
            </H>
          }
        />
      </Pop>
    </AbsoluteFill>
  );
};
const Build: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.build);
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pop x={540} y={300} at={61.26}>
        <Ribbon
          blocks={[
            {from: 9, to: 18, bg: SEAT},
            {from: 19, to: 20, bg: HL, label: 'gym', o: tween(t, 62.72, 0.3)},
          ]}
          ticks={breakTicks(t, 61.86)}
          title={
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <H size={50}>
                <Hi p={tween(t, 62.0, 0.3)}>both</Hi>, not either
              </H>
              {t >= 64.88 ? <Tag bg={RED} size={26}>1 workout ≠ whole day</Tag> : null}
            </div>
          }
        />
      </Pop>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
const WASH = [{start: C.hook.start, end: C.deskBroll.start}, {start: C.deskBroll.end, end: C.hook.end}, C.trial, C.glucose, C.not, C.promise, C.reminder, C.meeting, C.build, C.cta];
const Scene: React.FC = () => (
  <>
    <Footage cfg={cfg} />
    <GradeOverlay cfg={cfg} />
    <TopWash wins={WASH} reach={38} />
    <Hook />
    <Trial />
    <Glucose />
    <Not />
    <Vary />
    <Reminder />
    <Meeting />
    <Build />
    <CommentCta start={C.cta.start} word="GUIDE" typeAt={71.28} dmAt={72.46} top={70} Ico={Ico} />
    <Subject cfg={cfg} />
    <BrollCuts cfg={cfg} />
    <WalkTags />
    <PillCaps cfg={cfg} hide={[{start: C.cta.start + 0.3, end: 999}]} />
  </>
);

export const V14Reel: React.FC = () => (
  <Base cfg={{...cfg, shakes: [28.14]}}>
    <Scene />
  </Base>
);
