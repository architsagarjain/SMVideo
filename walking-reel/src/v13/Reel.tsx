import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile} from 'remotion';
import {Base, Footage, GradeOverlay, Subject} from '../series/core';
import {outAt} from '../series/timemap';
import {useT} from '../explainer/kit';
import {Ico, popAt} from '../series/kit2';
import {CARD_SHADOW, Card, H, HL, Hi, INK, Kicker, MUTED, PAPER, PillCaps, Pop, Tag, TopWash, rise, winVis} from '../series/kit3';
import {EASE_IN, EASE_IN_OUT, EASE_OUT, FPS, SANS, lerp, tween} from '../theme';
import {C, TM13, v13Config as cfg} from './config';

/**
 * "Change one thing at a time", told as a case investigation: her B-roll opens the reel, the three
 * changes stand in a suspect lineup, a case board works through three clues to one culprit, and the
 * check-in note gets stamped CASE CLOSED before the guide slides out of the file.
 */
const GREEN = '#17A34A';
const RED = '#E5484D';

/** One of her clips, timed in source seconds. */
const Clip: React.FC<{src: string; at: number; until: number; style?: React.CSSProperties}> = ({src, at, until, style}) => {
  const from = Math.round(outAt(TM13, at) * FPS);
  const dur = Math.max(1, Math.round(outAt(TM13, until) * FPS) - from);
  return (
    <Sequence from={from} durationInFrames={dur} layout="none">
      <OffthreadVideo src={staticFile(`v13/${src}`)} muted style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', ...style}} />
    </Sequence>
  );
};

// ---------------------------------------------------------------------------
// Hook: B-roll open, then a three-way split of the three changes, stamped SAME DAY
// ---------------------------------------------------------------------------
const OPEN_END = 2.36;
const PANELS = [
  {src: 'b_eat.mp4', at: 3.68, chip: '−300 kcal', icon: 'fork-knife', from: -1, pos: 'center 28%'},
  {src: 'b_tread.mp4', at: 4.64, chip: '+4,000 Steps', icon: 'sneaker-move', from: 1, pos: 'center 40%'},
  {src: 'b_db.mp4', at: 5.48, chip: '+2 Sessions', icon: 'barbell', from: -1, pos: 'center 25%'},
];
const STAMP = 6.0;
const SPLIT = 6.62;
const HookBroll: React.FC = () => {
  const t = useT();
  if (t > SPLIT + 0.5) return null;
  const open = t < OPEN_END + 0.12;
  const cut = 1 - tween(t, OPEN_END, 0.12);
  const flat = tween(t, 1.3, 0.7, EASE_IN_OUT);
  const stamp = popAt(t, STAMP);
  return (
    <AbsoluteFill>
      {open ? (
        <AbsoluteFill style={{opacity: cut, background: INK}}>
          <Clip src="b_tablet.mp4" at={0.9} until={OPEN_END + 0.2} style={{scale: lerp(tween(t, 0.95, 1.5), 1.12, 1.02)}} />
          <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0) 32%)'}} />
          <Pop x={540} y={230} at={1.12}>
            <Card w={600} pad={24} style={{display: 'flex', alignItems: 'center', gap: 22}}>
              <svg width={230} height={110}>
                {Array.from({length: 7}, (_, i) => (
                  <circle key={i} cx={18 + i * 32} cy={56 + Math.sin(i * 2.1) * 12} r={8 * Math.max(0, popAt(t, 1.2 + i * 0.05))} fill={MUTED} />
                ))}
                <path d="M14 56 L 216 56" stroke={INK} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - flat} />
              </svg>
              <div>
                <Kicker>WEEK AFTER WEEK</Kicker>
                <H size={58}>
                  <Hi p={tween(t, 1.82, 0.3)}>Plateau</Hi>
                </H>
              </div>
            </Card>
          </Pop>
        </AbsoluteFill>
      ) : null}
      {PANELS.map((p, i) => {
        if (t < p.at - 0.05) return null;
        const inn = tween(t, p.at - 0.05, 0.32, EASE_OUT);
        const out = tween(t, SPLIT, 0.4, EASE_IN);
        const dir = i === 1 ? 1 : -1;
        const x = (1 - inn) * p.from * 1080 + out * dir * 1100;
        const chipK = Math.min(1, popAt(t, p.at + 0.15));
        const flash = t >= STAMP ? 0.5 + 0.5 * Math.cos((t - STAMP) * 18) * Math.exp(-(t - STAMP) * 3) : 0;
        return (
          <div key={i} style={{position: 'absolute', left: 0, top: i * 640, width: 1080, height: 640, overflow: 'hidden', translate: `${x}px 0`, background: INK, borderTop: i ? '6px solid #fff' : undefined, boxSizing: 'border-box'}}>
            <Clip src={p.src} at={p.at - 0.1} until={SPLIT + 0.5} style={{scale: lerp(inn, 1.15, 1.03), objectPosition: p.pos}} />
            <div style={{position: 'absolute', left: 40, bottom: 34, scale: chipK, transformOrigin: 'left bottom'}}>
              <Tag bg={flash > 0.5 ? RED : HL} fg={flash > 0.5 ? '#fff' : INK} size={44}>
                <Ico name={p.icon} size={46} color={flash > 0.5 ? '#fff' : INK} /> {p.chip}
              </Tag>
            </div>
          </div>
        );
      })}
      {t >= STAMP && t < SPLIT + 0.3 ? (
        <div style={{position: 'absolute', left: 540, top: 960, translate: '-50% -50%', scale: lerp(Math.min(1, stamp), 1.9, 1), opacity: Math.min(1, stamp * 3) * (1 - tween(t, SPLIT, 0.2))}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 22, padding: '18px 40px', border: `10px solid ${RED}`, borderRadius: 26, background: 'rgba(255,255,255,0.94)', color: RED, fontFamily: SANS, fontWeight: 800, fontSize: 110, letterSpacing: 6, whiteSpace: 'nowrap', boxShadow: '0 30px 60px -20px rgba(0,0,0,0.6)'}}>
            <Ico name="calendar-dots" size={110} color={RED} /> SAME DAY
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// The lineup: which change did it?
// ---------------------------------------------------------------------------
const SUSPECTS = [
  {img: 'p_eat.jpg', name: 'Calories'},
  {img: 'p_tread.jpg', name: 'Steps'},
  {img: 'p_db.jpg', name: 'Workouts'},
];
const Lineup: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.which);
  if (o <= 0) return null;
  const spot = t < 11.06 ? -1 : lerp(tween(t, 11.06, 1.3, EASE_IN_OUT), 0, 2) + Math.sin(Math.max(0, t - 12.36) * 3) * 0.6 * tween(t, 12.36, 0.3);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pop x={540} y={305} at={7.45}>
        <Card w={960} h={440} pad={0} dark style={{overflow: 'hidden'}}>
          {Array.from({length: 8}, (_, i) => (
            <div key={i} style={{position: 'absolute', left: 0, right: 0, top: 30 + i * 52, height: 3, background: 'rgba(255,255,255,0.1)'}} />
          ))}
          <div style={{position: 'absolute', left: 30, top: 22}}>
            <Kicker color="rgba(255,255,255,0.6)">THE LINEUP</Kicker>
          </div>
          {t >= 9.8 ? (
            <div style={{position: 'absolute', right: 26, top: 16, scale: Math.min(1, popAt(t, 9.8))}}>
              <Tag bg={GREEN} size={26}>
                Scale ▼
              </Tag>
            </div>
          ) : null}
          {SUSPECTS.map((s, i) => {
            const k = popAt(t, 7.7 + i * 0.16);
            const lit = spot < 0 ? 1 : Math.max(0.35, 1 - Math.abs(spot - i) * 0.9);
            return (
              <div key={i} style={{position: 'absolute', left: 60 + i * 300, top: 78, width: 240, translate: `0 ${lerp(Math.min(1, k), -380, 0)}px`, opacity: Math.min(1, k * 2) * lit}}>
                <div style={{background: '#fff', padding: 10, paddingBottom: 0, borderRadius: 6, boxShadow: '0 16px 30px -12px rgba(0,0,0,0.6)'}}>
                  <Img src={staticFile(`v13/${s.img}`)} style={{width: 220, height: 240, objectFit: 'cover', display: 'block'}} />
                  <div style={{height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 30, color: INK}}>{s.name}</div>
                </div>
                <div style={{position: 'absolute', left: -14, top: -14, width: 50, height: 50, borderRadius: '50%', background: HL, color: INK, fontFamily: SANS, fontWeight: 800, fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{i + 1}</div>
                {t >= 12.06 ? (
                  <div style={{position: 'absolute', right: -12, top: -22, scale: Math.max(0, popAt(t, 12.06 + i * 0.12)), fontFamily: SANS, fontWeight: 800, fontSize: 84, color: RED, lineHeight: 1}}>?</div>
                ) : null}
              </div>
            );
          })}
          {spot >= 0 ? <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle 210px at ${180 + spot * 300}px 230px, rgba(255,240,170,0.22), rgba(0,0,0,0) 100%)`}} /> : null}
        </Card>
      </Pop>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// To-do overload: sticky notes slap onto the week
// ---------------------------------------------------------------------------
const TODO = ['Log Every Meal', '10k Steps Daily', 'New Workout Split', 'Weigh In Daily', 'Sunday Meal Prep', 'Cut All Sugar'];
const Work: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.work);
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pop x={540} y={290} at={13.95}>
        <Card w={900} pad={28}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18}}>
            <Kicker>THIS WEEK'S TO-DO</Kicker>
            {t >= 15.84 ? (
              <div style={{scale: Math.min(1, popAt(t, 15.84))}}>
                <Tag bg={RED} size={26}>
                  Overload
                </Tag>
              </div>
            ) : null}
          </div>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14}}>
            {TODO.map((x, i) => {
              const at = 14.5 + i * 0.26;
              const k = popAt(t, at);
              return (
                <div key={i} style={{height: 112, borderRadius: 10, background: i % 2 ? PAPER : HL, boxShadow: '0 10px 18px -10px rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 14px', fontFamily: SANS, fontWeight: 800, fontSize: 30, lineHeight: 1.1, scale: t < at ? 0 : lerp(Math.min(1, k), 1.5, 1), opacity: Math.min(1, k * 3)}}>
                  {x}
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
// The case board: three clues, one culprit
// ---------------------------------------------------------------------------
const CLUES = [
  {at: 19.86, label: 'Trend'},
  {at: 23.42, label: 'Routine'},
  {at: 27.56, label: 'Culprit'},
];
const OBST = [
  {at: 30.74, t: 'Portions', icon: 'bowl-food'},
  {at: 32.16, t: 'Movement', icon: 'sneaker-move'},
  {at: 33.74, t: 'Missed Sessions', icon: 'calendar-dots'},
  {at: 35.16, t: 'Hard To Keep', icon: 'warning-circle'},
];
const FOUND = 36.2;
/** A panel that slides in from the right and out to the left. */
const Slide: React.FC<{t: number; a: number; b: number; children: React.ReactNode}> = ({t, a, b, children}) => {
  if (t < a - 0.05 || t > b + 0.4) return null;
  const x = (1 - tween(t, a - 0.05, 0.38, EASE_OUT)) * 960 - tween(t, b - 0.05, 0.38, EASE_IN) * 960;
  return <div style={{position: 'absolute', inset: 0, translate: `${x}px 0`}}>{children}</div>;
};
const Lens: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <div style={{position: 'absolute', left: x, top: y, translate: '-50% -50%', scale: s, pointerEvents: 'none'}}>
    <div style={{width: 150, height: 150, borderRadius: '50%', border: `12px solid ${INK}`, background: 'rgba(255,255,255,0.18)', boxShadow: 'inset 0 0 0 4px rgba(255,255,255,0.7), 0 14px 26px -10px rgba(0,0,0,0.5)', boxSizing: 'border-box'}} />
    <div style={{position: 'absolute', left: 118, top: 118, width: 70, height: 22, borderRadius: 11, background: INK, rotate: '45deg', transformOrigin: 'left center'}} />
  </div>
);
const CaseBoard: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.funnel);
  if (o <= 0) return null;
  let k = -1;
  CLUES.forEach((s, i) => (t >= s.at - 0.05 ? (k = i) : null));
  // lens: glides card to card as she names them, then settles on the culprit
  const cx = (i: number) => 120 + i * 226;
  let lx = cx(0);
  OBST.forEach((ob, i) => {
    if (t >= ob.at - 0.2) lx = lerp(tween(t, ob.at - 0.2, 0.4, EASE_IN_OUT), i ? cx(i - 1) : cx(0), cx(i));
  });
  if (t >= FOUND - 0.4) lx = lerp(tween(t, FOUND - 0.4, 0.5, EASE_IN_OUT), cx(3), cx(0));
  const found = t >= FOUND;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pop x={540} y={300} at={17.7}>
        <Card w={960} h={450} pad={0} style={{overflow: 'hidden'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 28px 0'}}>
            <Kicker>CASE FILE</Kicker>
            <div style={{display: 'flex', gap: 10}}>
              {CLUES.map((c, i) => {
                const on = i === k;
                const done = i < k;
                return (
                  <div key={i} style={{display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 999, background: on ? HL : done ? INK : PAPER, color: done ? '#fff' : INK, fontFamily: SANS, fontWeight: 800, fontSize: 24, scale: on ? lerp(Math.min(1, popAt(t, c.at)), 1.2, 1) : 1}}>
                    {done ? <Ico name="check-circle" size={26} color={HL} /> : <span>{i + 1}</span>}
                    {c.label}
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{position: 'absolute', left: 0, top: 86, width: 960, height: 364}}>
            <Slide t={t} a={17.7} b={CLUES[0].at}>
              <div style={{padding: '30px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30}}>
                <H size={64}>
                  3 clues, <Hi p={tween(t, 18.8, 0.3)}>1 culprit</Hi>
                </H>
                <div style={{display: 'flex', gap: 30}}>
                  {[0, 1, 2].map((i) => (
                    <div key={i} style={{width: 150, height: 120, borderRadius: 18, background: PAPER, display: 'flex', alignItems: 'center', justifyContent: 'center', scale: Math.max(0, popAt(t, 18.3 + i * 0.15))}}>
                      <Ico name="magnifying-glass" size={60} color={INK} />
                    </div>
                  ))}
                </div>
              </div>
            </Slide>
            <Slide t={t} a={CLUES[0].at} b={CLUES[1].at}>
              <div style={{padding: '18px 28px'}}>
                <H size={52}>
                  Flat… or <Hi p={tween(t, 21.34, 0.3)}>just noisy?</Hi>
                </H>
                <svg width={900} height={230} style={{marginTop: 14}}>
                  {Array.from({length: 14}, (_, i) => (
                    <circle key={i} cx={30 + i * 64} cy={110 + Math.sin(i * 1.7) * 38} r={13 * Math.max(0, popAt(t, 20.2 + i * 0.06))} fill={MUTED} />
                  ))}
                  <path d="M24 112 L 870 108" stroke={INK} strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - tween(t, 21.6, 0.8, EASE_IN_OUT)} />
                </svg>
              </div>
            </Slide>
            <Slide t={t} a={CLUES[1].at} b={CLUES[2].at}>
              <div style={{padding: '18px 28px'}}>
                <H size={52}>
                  Weekends <Hi p={tween(t, 26.68, 0.3)}>count too</Hi>
                </H>
                <div style={{display: 'flex', gap: 12, marginTop: 30}}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => {
                    const wk = i >= 5;
                    const p = popAt(t, 24.2 + i * 0.1);
                    const lit = wk && t >= 26.68;
                    return (
                      <div key={i} style={{flex: 1, height: 170, borderRadius: 18, background: lit ? HL : PAPER, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, scale: Math.max(0, p) * (lit ? lerp(Math.min(1, popAt(t, 26.68)), 1.15, 1) : 1)}}>
                        <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 28}}>{d}</span>
                        {wk ? <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 52, color: RED, lineHeight: 1}}>?</span> : <Ico name="check-circle" size={46} color={GREEN} />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Slide>
            <Slide t={t} a={CLUES[2].at} b={99}>
              <div style={{position: 'absolute', inset: 0, background: INK}}>
                <div style={{position: 'absolute', left: 28, top: 18}}>
                  <H size={50} color="#fff">
                    Find <Hi p={tween(t, 29.24, 0.3)}>
                      <span style={{color: INK}}>the culprit</span>
                    </Hi>
                  </H>
                </div>
                <svg width={960} height={364} style={{position: 'absolute', left: 0, top: 0}}>
                  {OBST.map((ob, i) => (t >= ob.at ? <path key={i} d={`M ${cx(i)} 120 Q ${(cx(i) + 480) / 2} 60 820 40`} fill="none" stroke={HL} strokeWidth={4} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - tween(t, ob.at, 0.4)} /> : null))}
                  <circle cx={820} cy={40} r={12} fill={RED} />
                </svg>
                {OBST.map((ob, i) => {
                  const hit = found && i === 0;
                  const kk = popAt(t, ob.at);
                  return (
                    <div key={i} style={{position: 'absolute', left: cx(i) - 100, top: 120, width: 200, height: 210, borderRadius: 18, background: hit ? HL : '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, scale: Math.max(0, Math.min(1.05, kk)) * (hit ? lerp(Math.min(1, popAt(t, FOUND)), 1.12, 1.04) : 1), opacity: found && !hit ? 0.35 : 1}}>
                      <div style={{position: 'absolute', top: -10, width: 22, height: 22, borderRadius: '50%', background: RED, boxShadow: '0 3px 6px rgba(0,0,0,0.4)'}} />
                      <Ico name={ob.icon} size={70} color={INK} />
                      <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 28, textAlign: 'center', lineHeight: 1.05, padding: '0 10px'}}>{ob.t}</span>
                    </div>
                  );
                })}
                {t >= OBST[0].at - 0.2 && t < FOUND + 0.4 ? <Lens x={lx} y={212} s={Math.min(1, popAt(t, OBST[0].at - 0.2)) * (1 - tween(t, FOUND + 0.05, 0.3, EASE_IN))} /> : null}
                {found ? (
                  <div style={{position: 'absolute', left: cx(0), top: 336, translate: '-50% -50%', scale: lerp(Math.min(1, popAt(t, FOUND + 0.1)), 1.8, 1), opacity: tween(t, FOUND + 0.1, 0.1)}}>
                    <div style={{padding: '4px 16px', border: `5px solid ${RED}`, borderRadius: 10, background: '#fff', color: RED, fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: 3}}>FOUND</div>
                  </div>
                ) : null}
              </div>
            </Slide>
          </div>
        </Card>
      </Pop>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// The fixes
// ---------------------------------------------------------------------------
const MEALS_END = 42.9;
const Fixes: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.fixes);
  if (o <= 0) return null;
  // calendar: the workout lands on a meeting, gets bumped, slides to a free morning
  const drop = popAt(t, 44.0);
  const clash = t >= 44.2 && t < 45.56;
  const move = tween(t, 45.56, 0.5, EASE_IN_OUT);
  const shakeX = clash ? Math.sin((t - 44.2) * 50) * 6 * Math.exp(-(t - 44.2) * 3) : 0;
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const MEET = [1, 2, 3];
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pop x={540} y={300} at={37.0}>
        <Card w={960} h={420} pad={0} style={{overflow: 'hidden'}}>
          <Slide t={t} a={37.0} b={MEALS_END}>
            <div style={{display: 'flex', gap: 30, padding: 28, alignItems: 'center'}}>
              <div style={{position: 'relative', width: 300, height: 364, borderRadius: 22, overflow: 'hidden', background: INK, flexShrink: 0}}>
                <Clip src="b_eat.mp4" at={37.0} until={MEALS_END + 0.4} />
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: 18}}>
                <Kicker color={RED}>CULPRIT: PORTIONS</Kicker>
                <H size={54}>The fix</H>
                <div style={{scale: Math.max(0, Math.min(1, popAt(t, 39.9))), transformOrigin: 'left center'}}>
                  <div style={{display: 'inline-flex', flexDirection: 'column', gap: 6, padding: '18px 24px', borderRadius: 20, background: HL, fontFamily: SANS, fontWeight: 800, fontSize: 40, lineHeight: 1.08}}>
                    <span>Same bowl.</span>
                    <span>Same portion.</span>
                  </div>
                </div>
                {t >= 41.52 ? (
                  <div style={{display: 'flex', gap: 8, opacity: tween(t, 41.52, 0.3)}}>
                    {['M', 'T', 'W', 'T', 'F'].map((d, i) => (
                      <div key={i} style={{width: 52, height: 52, borderRadius: 12, background: PAPER, display: 'flex', alignItems: 'center', justifyContent: 'center', scale: Math.max(0, popAt(t, 41.52 + i * 0.08))}}>
                        <Ico name="bowl-food" size={30} color={INK} />
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </Slide>
          <Slide t={t} a={MEALS_END} b={99}>
            <div style={{padding: 28}}>
              <Kicker color={RED}>CULPRIT: CALENDAR</Kicker>
              <div style={{marginTop: 8}}>
                <H size={52}>
                  Move it, <Hi p={tween(t, 45.7, 0.3)}>don't drop it</Hi>
                </H>
              </div>
              <div style={{position: 'relative', display: 'grid', gridTemplateColumns: '90px repeat(5, 1fr)', gap: 10, marginTop: 22}}>
                <div />
                {DAYS.map((d) => (
                  <div key={d} style={{textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 24, color: MUTED}}>{d}</div>
                ))}
                {['7 AM', '6 PM'].map((slot, r) => (
                  <React.Fragment key={slot}>
                    <div style={{display: 'flex', alignItems: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 24, color: MUTED}}>{slot}</div>
                    {DAYS.map((d, c) => {
                      const meet = r === 1 && MEET.includes(c);
                      return (
                        <div key={d} style={{height: 84, borderRadius: 14, background: meet ? INK : PAPER, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 22, opacity: meet ? Math.min(1, popAt(t, 43.2 + c * 0.08)) : 1}}>
                          {meet ? 'Meeting' : ''}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
                {t >= 44.0 ? (
                  <div
                    style={{
                      position: 'absolute',
                      left: `calc(100px + ${2} * ((100% - 140px) / 5 + 10px))`,
                      width: 'calc((100% - 140px) / 5)',
                      top: lerp(move, 124, 30),
                      height: 84,
                      borderRadius: 14,
                      background: HL,
                      border: `5px solid ${clash ? RED : move >= 1 ? GREEN : INK}`,
                      boxSizing: 'border-box',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      fontFamily: SANS,
                      fontWeight: 800,
                      fontSize: 22,
                      translate: `${shakeX}px ${lerp(Math.min(1, drop), -60, 0)}px`,
                      boxShadow: '0 12px 20px -8px rgba(0,0,0,0.4)',
                    }}
                  >
                    <Ico name={move >= 1 ? 'check-circle' : 'barbell'} size={28} color={move >= 1 ? GREEN : INK} /> Workout
                  </div>
                ) : null}
              </div>
            </div>
          </Slide>
        </Card>
      </Pop>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// One small nudge (the fader desk)
// ---------------------------------------------------------------------------
type Fader = {label: string; icon: string; v: number; lock?: number; glow?: number};
const Desk: React.FC<{faders: Fader[]; title?: React.ReactNode}> = ({faders, title}) => (
  <Card w={900} pad={28}>
    {title ? <div style={{marginBottom: 14}}>{title}</div> : null}
    <div style={{display: 'flex', justifyContent: 'space-around'}}>
      {faders.map((f, i) => (
        <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: 220}}>
          <div style={{position: 'relative', width: 60, height: 230}}>
            <div style={{position: 'absolute', left: 24, top: 0, bottom: 0, width: 12, borderRadius: 6, background: '#ECE8E1'}} />
            <div style={{position: 'absolute', left: 24, bottom: 0, width: 12, height: `${f.v * 100}%`, borderRadius: 6, background: f.glow ? HL : INK}} />
            <div style={{position: 'absolute', left: 0, bottom: `calc(${f.v * 100}% - 22px)`, width: 60, height: 44, borderRadius: 12, background: f.glow ? HL : '#fff', border: `5px solid ${INK}`, boxSizing: 'border-box', boxShadow: '0 6px 12px rgba(0,0,0,0.2)'}} />
            {f.lock ? (
              <div style={{position: 'absolute', left: 70, top: '40%', scale: Math.max(0, f.lock)}}>
                <Ico name="lock-simple" size={44} color={INK} />
              </div>
            ) : null}
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
            <Ico name={f.icon} size={34} color={INK} />
            <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 30}}>{f.label}</span>
          </div>
        </div>
      ))}
    </div>
  </Card>
);
const base = (v: number[]): Fader[] => [
  {label: 'Food', icon: 'fork-knife', v: v[0]},
  {label: 'Steps', icon: 'sneaker-move', v: v[1]},
  {label: 'Training', icon: 'barbell', v: v[2]},
];
const Adjust: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.adjust);
  if (o <= 0) return null;
  const nudge = tween(t, 51.62, 0.5, EASE_OUT);
  const f = base([0.55 - 0.1 * nudge, 0.5, 0.5]).map((x, i) => ({...x, glow: i === 0 && nudge > 0 ? 1 : 0, lock: i > 0 ? popAt(t, 51.9 + i * 0.15) : 0}));
  const tag = (at: number, node: React.ReactNode) => (t >= at ? <div style={{scale: Math.min(1, popAt(t, at))}}>{node}</div> : null);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pop x={540} y={290} at={46.7}>
        <Desk
          faders={f}
          title={
            <div style={{display: 'flex', gap: 12, alignItems: 'center', height: 50}}>
              {tag(48.68, <Tag bg={GREEN} size={26}>✓ Consistent</Tag>)}
              {tag(49.86, <Tag bg={INK} size={26}>✓ Still Flat</Tag>)}
              {tag(51.62, <Tag bg={HL} fg={INK} size={26}>One Small Nudge</Tag>)}
            </div>
          }
        />
      </Pop>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Let a pattern show: weigh-ins plot one by one, then the trend appears
// ---------------------------------------------------------------------------
const DOTS = Array.from({length: 16}, (_, i) => ({x: 30 + i * 54, y: 50 + i * 6.5 + Math.sin(i * 2.3) * 22}));
const Review: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.review);
  if (o <= 0) return null;
  const line = tween(t, 58.06, 0.9, EASE_IN_OUT);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pop x={540} y={290} at={55.0}>
        <Card w={900} pad={28}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <H size={50}>
              Let a <Hi p={tween(t, 58.06, 0.3)}>pattern</Hi> show
            </H>
            {t >= 59.46 ? (
              <div style={{scale: Math.min(1, popAt(t, 59.46))}}>
                <Tag bg={INK} size={26}>
                  <Ico name="hourglass-medium" size={28} color={HL} /> Timing Varies
                </Tag>
              </div>
            ) : null}
          </div>
          <svg width={844} height={220} style={{marginTop: 16}}>
            {[0, 1, 2, 3].map((i) => (
              <line key={i} x1={0} x2={844} y1={30 + i * 55} y2={30 + i * 55} stroke="#EFEBE4" strokeWidth={3} />
            ))}
            {DOTS.map((d, i) => (
              <circle key={i} cx={d.x} cy={d.y} r={11 * Math.max(0, popAt(t, 55.3 + i * 0.16))} fill={i === 15 ? INK : MUTED} />
            ))}
            <path d={`M ${DOTS[0].x} 52 L ${DOTS[15].x} 150`} stroke={HL} strokeWidth={12} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - line} />
          </svg>
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
        <Desk faders={f} title={<H size={48}>One moves, the rest stay</H>} />
      </Pop>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// The check-in note: typed out, then stamped CASE CLOSED
// ---------------------------------------------------------------------------
const CLOSED = 72.75;
const typed = (t: number, s: string, at: number, cps = 26) => s.slice(0, Math.max(0, Math.min(s.length, Math.floor((t - at) * cps))));
const Note: React.FC = () => {
  const t = useT();
  const o = winVis(t, {start: C.note.start, end: C.cta.start + 0.45});
  if (o <= 0) return null;
  const line = (label: string, text: string, at: number) => {
    const s = typed(t, text, at);
    const typing = t >= at && s.length < text.length;
    return (
      <div style={{display: 'flex', alignItems: 'baseline', gap: 16, padding: '16px 0', borderBottom: '3px dashed #E6E1D8', opacity: tween(t, at - 0.3, 0.25)}}>
        <span style={{width: 120, flexShrink: 0, fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: 3, color: MUTED}}>{label}</span>
        <span style={{fontFamily: 'monospace', fontWeight: 700, fontSize: 38, color: INK, whiteSpace: 'nowrap'}}>
          {s}
          {typing || (t >= at && Math.floor(t * 3) % 2 === 0 && t < at + 3) ? <span style={{color: MUTED}}>▌</span> : null}
        </span>
      </div>
    );
  };
  const st = popAt(t, CLOSED);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pop x={540} y={280} at={66.64}>
        <Card w={900} pad={30}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <Kicker>CHECK-IN NOTE</Kicker>
            <Ico name="file-pdf" size={36} color={MUTED} />
          </div>
          {line('WHY', 'Portions kept changing', 68.9)}
          {line('NEXT', 'Weekly average weight', 71.1)}
          {t >= CLOSED ? (
            <div style={{position: 'absolute', left: '50%', top: '55%', translate: '-50% -50%', scale: lerp(Math.min(1, st), 2, 1), opacity: Math.min(1, st * 3)}}>
              <div style={{padding: '10px 30px', border: `8px solid ${RED}`, borderRadius: 18, background: 'rgba(255,255,255,0.88)', color: RED, fontFamily: SANS, fontWeight: 800, fontSize: 72, letterSpacing: 6, whiteSpace: 'nowrap'}}>CASE CLOSED</div>
            </div>
          ) : null}
        </Card>
      </Pop>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Ending: the comment is typed, and the guide slides out of the case file
// ---------------------------------------------------------------------------
const Cta: React.FC = () => {
  const t = useT();
  const s0 = C.cta.start + 0.4;
  if (t < s0) return null;
  const word = 'GUIDE';
  const typeAt = 73.56;
  const w = word.slice(0, Math.max(0, Math.min(word.length, Math.floor((t - typeAt) / 0.07) + 1)));
  const sentAt = typeAt + word.length * 0.07 + 0.25;
  const sent = tween(t, sentAt, 0.25, EASE_OUT);
  const bar = tween(t, s0, 0.4, EASE_OUT);
  const folder = tween(t, 74.4, 0.45, EASE_OUT);
  const doc = tween(t, 74.86, 0.7, EASE_OUT);
  const tag = popAt(t, 75.6);
  return (
    <AbsoluteFill style={{fontFamily: SANS}}>
      <div style={{position: 'absolute', left: 90, top: 60, width: 900, height: 120, borderRadius: 60, background: '#fff', boxShadow: CARD_SHADOW, display: 'flex', alignItems: 'center', gap: 22, padding: '0 16px 0 22px', boxSizing: 'border-box', opacity: bar, translate: `0 ${lerp(bar, 30, 0)}px`}}>
        <div style={{width: 78, height: 78, borderRadius: '50%', background: PAPER, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Ico name="chat-circle-dots" size={42} color={INK} />
        </div>
        <div style={{flex: 1, fontSize: 52, fontWeight: 800, color: w ? INK : '#9A9A9A', letterSpacing: w ? 3 : 0}}>{w ? <Hi p={sent}>{w}</Hi> : 'Add a comment…'}</div>
        <div style={{width: 86, height: 86, borderRadius: '50%', background: sent > 0 ? INK : '#D8D8D8', display: 'flex', alignItems: 'center', justifyContent: 'center', scale: 1 + 0.15 * Math.sin(Math.PI * sent)}}>
          <Ico name="paper-plane-right" size={44} color={sent > 0 ? HL : '#fff'} />
        </div>
      </div>
      {folder > 0 ? (
        <div style={{position: 'absolute', left: 540, top: 500, translate: '-50% -50%', width: 640, height: 220, opacity: folder}}>
          {/* the document rises out of the folder */}
          <div style={{position: 'absolute', left: 70, width: 500, height: 290, top: lerp(doc, 120, -120), borderRadius: 18, background: '#fff', boxShadow: '0 18px 36px -14px rgba(0,0,0,0.45)', padding: 24, boxSizing: 'border-box'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
              <div style={{width: 64, height: 64, borderRadius: 16, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Ico name="file-pdf" size={40} color={HL} />
              </div>
              <div style={{fontSize: 34, fontWeight: 800, lineHeight: 1.05}}>
                Free Fat Loss
                <br />
                <Hi p={tween(t, 75.3, 0.3)}>Guide</Hi>
              </div>
            </div>
            {[380, 420, 300].map((lw, i) => (
              <div key={i} style={{marginTop: 18, height: 14, width: lw, borderRadius: 7, background: '#ECE8E1'}} />
            ))}
          </div>
          <div style={{position: 'absolute', left: 0, top: 60, width: 640, height: 170, borderRadius: '10px 10px 26px 26px', background: HL, boxShadow: CARD_SHADOW, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 26, boxSizing: 'border-box'}}>
            <span style={{fontSize: 34, fontWeight: 800, letterSpacing: 6, color: INK}}>CASE FILE</span>
          </div>
          <div style={{position: 'absolute', left: 0, top: 36, width: 220, height: 40, borderRadius: '14px 14px 0 0', background: HL}} />
        </div>
      ) : null}
      {t >= 75.6 ? (
        <div style={{position: 'absolute', left: 540, top: 232, translate: '-50% -50%', scale: Math.min(1, tag)}}>
          <Tag bg={INK} size={34}>
            <Ico name="paper-plane-right" size={36} color={HL} /> Sent To Your DMs
          </Tag>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
const WASH = [{start: OPEN_END, end: C.hook.end}, C.which, C.work, C.funnel, C.fixes, C.adjust, C.review, C.stable, {start: C.note.start, end: 999}];
const Scene: React.FC = () => (
  <>
    <Footage cfg={cfg} />
    <GradeOverlay cfg={cfg} />
    <TopWash wins={WASH} reach={38} />
    <Lineup />
    <Work />
    <CaseBoard />
    <Fixes />
    <Adjust />
    <Review />
    <Stable />
    <Note />
    <Cta />
    <Subject cfg={cfg} />
    <HookBroll />
    <PillCaps cfg={cfg} hide={[{start: C.cta.start + 0.3, end: 999}]} />
  </>
);

export const V13Reel: React.FC = () => (
  <Base cfg={{...cfg, shakes: [STAMP, SPLIT, CLOSED]}}>
    <Scene />
  </Base>
);
