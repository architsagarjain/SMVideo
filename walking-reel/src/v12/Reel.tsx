import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, staticFile} from 'remotion';
import {Base, Footage, GradeOverlay, Subject} from '../series/core';
import {outAt} from '../series/timemap';
import {useT} from '../explainer/kit';
import {Ico, popAt} from '../series/kit2';
import {CARD_SHADOW, Card, CommentCta, H, HL, Hi, INK, Kicker, MUTED, PillCaps, Pop, Tag, TopWash, rise, winVis} from '../series/kit3';
import {EASE_IN_OUT, EASE_OUT, FPS, SANS, lerp, tween} from '../theme';
import {C, TM12, v12Config as cfg} from './config';

const GREEN = '#17A34A';
const RED = '#E5484D';
const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const SPLIT = [
  {m: 'CHEST', c: '#FFD9C7'},
  {m: 'BACK', c: '#D7E6FF'},
  {m: 'LEGS', c: '#D9F2E1'},
  {m: 'SHOULD.', c: '#EBDDFF'},
  {m: 'ARMS', c: '#FFF0B8'},
  {m: 'CORE', c: '#FFD6E5'},
  {m: '', c: '#F1EEE8'},
];
const FULL = [true, false, true, false, true, false, false];

// ---------------------------------------------------------------------------
// The planner: one card, seven days; cells change with the story
// ---------------------------------------------------------------------------
type Cell = {text: string; bg: string; fg?: string; o?: number; s?: number; mark?: 'x' | 'ok' | null; shift?: number};
const Planner: React.FC<{cells: Cell[]; title?: React.ReactNode; w?: number}> = ({cells, title, w = 960}) => {
  const cw = (w - 56 - 6 * 10) / 7;
  return (
    <Card w={w} pad={28} style={{paddingBottom: 30}}>
      {title ? <div style={{marginBottom: 16}}>{title}</div> : null}
      <div style={{display: 'flex', gap: 10}}>
        {DAYS.map((d, i) => {
          const c = cells[i];
          return (
            <div key={i} style={{width: cw, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
              <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 24, letterSpacing: 2, color: MUTED}}>{d}</div>
              <div style={{position: 'relative', width: cw, height: 150, borderRadius: 18, background: '#F4F1EB'}}>
                <div style={{position: 'absolute', inset: 0, borderRadius: 18, background: c.bg, color: c.fg ?? INK, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 800, fontSize: c.text.length > 6 ? 19 : 22, letterSpacing: 0.5, textAlign: 'center', lineHeight: 1.1, opacity: c.o ?? 1, scale: c.s ?? 1, translate: `${(c.shift ?? 0) * (cw + 10)}px 0`, whiteSpace: 'pre-line'}}>
                  {c.text}
                </div>
                {c.mark ? (
                  <div style={{position: 'absolute', right: -8, top: -10, width: 40, height: 40, borderRadius: '50%', background: c.mark === 'x' ? RED : GREEN, border: '4px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <Ico name={c.mark === 'x' ? 'x-circle' : 'check-circle'} size={30} color="#fff" />
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
const splitCells = (t: number, at: number): Cell[] => SPLIT.map((s, i) => ({text: s.m, bg: s.c, o: Math.min(1, popAt(t, at + i * 0.12) * 2), s: lerp(Math.min(1, popAt(t, at + i * 0.12)), 0.6, 1)}));
const fullCells = (t: number, at: number): Cell[] =>
  FULL.map((f, i) => (f ? {text: 'FULL\nBODY', bg: HL, o: Math.min(1, popAt(t, at + i * 0.08) * 2), s: lerp(Math.min(1, popAt(t, at + i * 0.08)), 0.6, 1)} : {text: '', bg: 'transparent'}));

// ---------------------------------------------------------------------------
// Sections (all behind her head)
// ---------------------------------------------------------------------------
const Hook: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.hook, 0.01);
  if (o <= 0) return null;
  const cells = splitCells(t, 1.0);
  // a busy week lands on top of the split
  const busy = ['', 'LATE\nCALL', '', 'SCHOOL\nRUN', 'DEADLINE', '', ''];
  const crash = tween(t, 5.28, 0.3);
  const view = cells.map((c, i) => (busy[i] && t >= 5.28 ? {...c, text: busy[i], bg: INK, fg: '#fff', s: lerp(Math.min(1, popAt(t, 5.28 + i * 0.05)), 1.3, 1), mark: null} : {...c, mark: t >= 2.92 && busy[i] === '' && c.text && crash > 0.5 ? ('x' as const) : null}));
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pop x={540} y={290} at={0.9}>
        <Planner
          cells={view}
          title={
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <H size={56}>
                one muscle <Hi p={tween(t, 1.6, 0.3)}>a day</Hi>
              </H>
              {t >= 5.28 ? <Tag bg={RED} size={30}>+ a busy week</Tag> : null}
            </div>
          }
        />
      </Pop>
    </AbsoluteFill>
  );
};
const Study: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.study);
  if (o <= 0) return null;
  const same = tween(t, 14.5, 0.4);
  const bar = (label: string, at: number, h: number) => (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8}}>
      <div style={{width: 120, height: 150, display: 'flex', alignItems: 'flex-end'}}>
        <div style={{width: 120, height: 150 * h * tween(t, at, 0.6, EASE_OUT), borderRadius: 16, background: INK}} />
      </div>
      <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 22, color: MUTED, letterSpacing: 1}}>{label}</div>
    </div>
  );
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pop x={540} y={110} at={6.52}>
        <Tag size={32}>
          <Ico name="magnifying-glass" size={34} color="#fff" /> THE RESEARCH
        </Tag>
      </Pop>
      <Pop x={540} y={330} at={8.2}>
        <Card w={960} h={300} pad={26}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-around', height: '100%'}}>
            {[
              {n: 'SPLIT', c: '#D7E6FF'},
              {n: 'FULL BODY', c: HL},
            ].map((p, i) => (
              <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12}}>
                <div style={{padding: '8px 22px', borderRadius: 14, background: p.c, fontFamily: SANS, fontWeight: 800, fontSize: 32}}>{p.n}</div>
                <div style={{display: 'flex', gap: 14}}>
                  {bar('VOLUME', 12.66, 0.8)}
                  {t >= 16.64 ? bar('STRENGTH', 16.64, 0.7) : <div style={{width: 120}} />}
                  {t >= 17.42 ? bar('MUSCLE', 17.42, 0.6) : <div style={{width: 120}} />}
                </div>
              </div>
            ))}
          </div>
          {same > 0 ? (
            <div style={{position: 'absolute', left: '50%', top: '46%', translate: '-50% -50%', width: 96, height: 96, borderRadius: '50%', background: HL, border: '6px solid #fff', boxShadow: CARD_SHADOW, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 64, scale: Math.max(0, popAt(t, 14.5))}}>=</div>
          ) : null}
        </Card>
      </Pop>
    </AbsoluteFill>
  );
};
const Volume: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.volume);
  if (o <= 0) return null;
  const sets = [20.6, 20.8, 21.0, 21.2, 21.4, 21.6, 21.8, 22.0];
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: 540, top: 130, translate: '-50% -50%', ...rise(t, 20.28)}}>
        <Kicker>VOLUME</Kicker>
      </div>
      <div style={{position: 'absolute', left: 540, top: 250, translate: '-50% -50%', display: 'flex', gap: 14}}>
        {sets.map((a, i) => (
          <div key={i} style={{width: 76, height: 110, borderRadius: 16, background: i % 2 ? INK : '#3A3732', scale: Math.max(0, popAt(t, a)), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: SANS, fontWeight: 800, fontSize: 24}}>
            SET
          </div>
        ))}
      </div>
      <Pop x={540} y={410} at={23.34}>
        <Tag bg={HL} fg={INK} size={40}>
          <Ico name="lock-simple" size={42} color={INK} /> keep it equal
        </Tag>
      </Pop>
    </AbsoluteFill>
  );
};
const Names: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.names);
  if (o <= 0) return null;
  const card = (label: string, at: number, bg: string) => (
    <Pop x={0} y={0} at={at}>
      <Card w={360} h={250} pad={24} style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
        <div style={{alignSelf: 'flex-start', padding: '6px 18px', borderRadius: 12, background: bg, fontFamily: SANS, fontWeight: 800, fontSize: 30}}>{label}</div>
        {[0.8, 0.55, 0.7].map((w, i) => (
          <div key={i} style={{height: 18, width: `${w * 100}%`, borderRadius: 9, background: '#ECE8E1'}} />
        ))}
      </Card>
    </Pop>
  );
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: 300, top: 300}}>{card('FULL BODY', 30.18, HL)}</div>
      <div style={{position: 'absolute', left: 780, top: 300}}>{card('SPLIT', 31.96, '#D7E6FF')}</div>
      {t >= 27.08 ? (
        <Pop x={540} y={300} at={27.76}>
          <div style={{width: 110, height: 110, borderRadius: '50%', background: INK, border: '6px solid #fff', boxShadow: CARD_SHADOW, display: 'flex', alignItems: 'center', justifyContent: 'center', color: HL, fontFamily: SANS, fontWeight: 800, fontSize: 70}}>≠</div>
        </Pop>
      ) : null}
      <div style={{position: 'absolute', left: 540, top: 100, translate: '-50% -50%', ...rise(t, 26.08)}}>
        <H size={56}>
          a name <Hi p={tween(t, 28.3, 0.3)}>isn't a plan</Hi>
        </H>
      </div>
    </AbsoluteFill>
  );
};
const Three: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.three);
  if (o <= 0) return null;
  const morph = tween(t, 34.28, 0.5, EASE_IN_OUT);
  const cells = morph < 0.5 ? splitCells(t, C.three.start + 0.1).map((c) => ({...c, o: (c.o ?? 1) * (1 - morph * 2)})) : fullCells(t, 34.4);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pop x={540} y={290} at={C.three.start + 0.1}>
        <Planner
          cells={cells}
          title={
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <H size={56}>
                <Hi p={tween(t, 34.6, 0.3)}>Mon · Wed · Fri</Hi>
              </H>
              <Tag size={28}>busy-week plan</Tag>
            </div>
          }
        />
      </Pop>
    </AbsoluteFill>
  );
};
const Meeting: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.meeting);
  if (o <= 0) return null;
  const move = tween(t, 45.24, 0.6, EASE_IN_OUT);
  const cells: Cell[] = FULL.map((f, i) => {
    if (i === 2) return {text: t >= 44.22 ? 'LATE\nMEETING' : 'FULL\nBODY', bg: t >= 44.22 ? INK : HL, fg: t >= 44.22 ? '#fff' : INK, s: t >= 44.22 ? lerp(Math.min(1, popAt(t, 44.22)), 1.2, 1) : 1};
    if (i === 3) return {text: move > 0.02 ? 'FULL\nBODY' : '', bg: move > 0.02 ? HL : 'transparent', o: move, s: lerp(move, 0.7, 1), mark: t >= 46.14 ? 'ok' : null};
    return f ? {text: 'FULL\nBODY', bg: HL} : {text: '', bg: 'transparent'};
  });
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pop x={540} y={290} at={C.meeting.start + 0.1}>
        <Planner
          cells={cells}
          title={
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <H size={56}>
                plans <Hi p={tween(t, 45.3, 0.3)}>bend</Hi>
              </H>
              {t >= 46.82 ? <Tag bg={GREEN} size={28}>nothing missed</Tag> : null}
            </div>
          }
        />
      </Pop>
    </AbsoluteFill>
  );
};
const CLIPS = [
  {src: 'b_push.mp4', label: 'PUSH', at: 52.8},
  {src: 'b_pull.mp4', label: 'PULL', at: 53.58},
  {src: 'b_lower.mp4', label: 'LOWER', at: 54.5},
];
const Moves: React.FC = () => {
  const t = useT();
  const w = C.moves;
  const o = winVis(t, w);
  if (o <= 0) return null;
  const from = Math.round(outAt(TM12, w.start) * FPS);
  const dur = Math.round(outAt(TM12, w.end) * FPS) - from;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: 540, top: 90, translate: '-50% -50%', ...rise(t, 50.5)}}>
        <Kicker>3 MOVEMENT PATTERNS</Kicker>
      </div>
      {CLIPS.map((c, i) => {
        const k = popAt(t, c.at - 0.5);
        if (k <= 0) return null;
        return (
          <div key={i} style={{position: 'absolute', left: 90 + i * 310, top: 130, width: 280, height: 340, borderRadius: 30, overflow: 'hidden', border: '8px solid #fff', boxShadow: CARD_SHADOW, scale: lerp(Math.min(1.05, k), 0.7, 1), opacity: Math.min(1, k * 2), background: INK}}>
            <Sequence from={from} durationInFrames={dur} layout="none">
              <OffthreadVideo src={staticFile(`v12/${c.src}`)} muted style={{position: 'absolute', left: '50%', top: '50%', width: 1080, height: 1920, translate: '-50% -50%', scale: 0.36}} />
            </Sequence>
            <div style={{position: 'absolute', left: 0, right: 0, bottom: 14, textAlign: 'center'}}>
              <span style={{padding: '6px 18px', borderRadius: 12, background: t >= c.at ? HL : '#fff', fontFamily: SANS, fontWeight: 800, fontSize: 30, color: INK}}>{c.label}</span>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
const Keep: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.keep);
  if (o <= 0) return null;
  const items = [
    {t: 'same plan, weekly', at: 56.84, icon: 'arrows-clockwise'},
    {t: 'last reps feel hard', at: 59.54, icon: 'fire'},
    {t: 'write it down', at: 60.88, icon: 'check-circle'},
  ];
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pop x={540} y={290} at={56.0}>
        <Card w={900} pad={30}>
          {items.map((it, i) => (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 20, padding: '14px 0', borderBottom: i < 2 ? '3px solid #EFEBE4' : undefined, opacity: tween(t, it.at, 0.3), translate: `${lerp(tween(t, it.at, 0.3), -20, 0)}px 0`}}>
              <div style={{width: 64, height: 64, borderRadius: 18, background: t >= it.at + 0.2 ? HL : '#F4F1EB', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Ico name={it.icon} size={40} color={INK} />
              </div>
              <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 44, color: INK}}>{it.t}</div>
            </div>
          ))}
        </Card>
      </Pop>
    </AbsoluteFill>
  );
};
const Enjoy: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.enjoy);
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pop x={540} y={290} at={63.04}>
        <Planner cells={splitCells(t, 63.1).map((c, i) => ({...c, mark: i < 6 && t >= 64.6 + i * 0.06 ? 'ok' : null}))} w={900} title={<H size={52}>your split, your call</H>} />
      </Pop>
    </AbsoluteFill>
  );
};
const Calendar: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.calendar);
  if (o <= 0) return null;
  const mini = (busy: boolean, at: number) => (
    <Card w={420} h={330} pad={22}>
      <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 30, marginBottom: 12}}>{busy ? 'looks impressive' : 'actually doable'}</div>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6}}>
        {Array.from({length: 28}, (_, i) => {
          const on = busy ? (i * 7) % 5 !== 0 : [0, 2, 4].includes(i % 7);
          const c = busy ? SPLIT[i % 6].c : HL;
          return <div key={i} style={{height: 46, borderRadius: 8, background: on ? c : '#F4F1EB', opacity: tween(t, at + i * 0.02, 0.2)}} />;
        })}
      </div>
    </Card>
  );
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pop x={290} y={300} at={67.42}>
        {mini(true, 67.5)}
      </Pop>
      <Pop x={790} y={300} at={68.68}>
        {mini(false, 68.7)}
      </Pop>
      {t >= 69.58 ? (
        <Pop x={540} y={300} at={69.58}>
          <div style={{width: 110, height: 110, borderRadius: '50%', background: INK, border: '6px solid #fff', boxShadow: CARD_SHADOW, display: 'flex', alignItems: 'center', justifyContent: 'center', color: HL, fontFamily: SANS, fontWeight: 800, fontSize: 70}}>≠</div>
        </Pop>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
const WASH = [C.hook, C.study, C.volume, C.names, C.three, C.meeting, C.moves, C.keep, C.enjoy, C.calendar, C.cta];
const Scene: React.FC = () => (
  <>
    <Footage cfg={cfg} />
    <GradeOverlay cfg={cfg} />
    <TopWash wins={WASH} reach={36} />
    <Hook />
    <Study />
    <Volume />
    <Names />
    <Three />
    <Meeting />
    <Moves />
    <Keep />
    <Enjoy />
    <Calendar />
    <CommentCta start={C.cta.start} word="GUIDE" typeAt={73.96} dmAt={75.1} top={70} Ico={Ico} />
    <Subject cfg={cfg} />
    <PillCaps cfg={cfg} hide={[{start: C.cta.start + 0.3, end: 999}]} />
  </>
);

export const V12Reel: React.FC = () => (
  <Base cfg={{...cfg, shakes: [5.28, 44.22]}}>
    <Scene />
  </Base>
);
