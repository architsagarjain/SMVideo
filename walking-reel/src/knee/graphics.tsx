import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Canvas, Cross, Dotted, Icon, Marker, PIXEL, PIXEL_WIDE, QBox, Scramble, Tick, X, pop, useT} from '../explainer/kit';
import {Stage} from '../series/core';
import {Chip, Giant, Label} from '../series/parts';
import {EASE_IN_OUT, lerp, springAt, tween} from '../theme';
import {ICONS} from '../explainer/icons';
import {K} from './config';

// ===========================================================================
// Behind her head (wall washed). Her head spans roughly x 360-720, y 560+.
// ===========================================================================
export const KneeBehind: React.FC = () => {
  const t = useT();
  const typed = 'GUIDE'.split('').filter((_, i) => t >= 71.2 + i * 0.09).length;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {/* "I gained around 15 kilos when a knee injury left me on prolonged bed rest." */}
      {t < K.hook.end + 0.1 ? (
        <>
          <Giant text="+15" at={1.62} y={400} size={380} stagger={0.1} />
          <Scramble text="KILOS" at={2.26} x={885} y={800} size={64} color={X.pink} />
          <Icon name="bandaids" at={3.16} size={190} x={190} y={790} rot={-18} />
          <Scramble text="KNEE INJURY" at={3.2} x={190} y={925} size={42} color={X.pink} />
        </>
      ) : null}

      {/* "I wouldn't hear 'I want to lose weight before December' and immediately hand you a deadline." */}
      <Scramble text={'"I WANT TO LOSE WEIGHT'} at={12.0} x={540} y={130} size={50} color={X.ink} per={0.02} out={15.5} />
      <Scramble text={'BEFORE DECEMBER"'} at={13.22} x={540} y={200} size={50} color={X.ink} per={0.025} out={15.5} />
      <Icon name="calendar-blank" at={13.66} size={180} x={880} y={760} rot={10} out={16.6} />
      <Scramble text="DEC" at={13.8} x={880} y={890} size={50} color={X.pink} out={16.6} />
      <Giant text="DEADLINE" at={15.55} y={330} size={210} color={X.pink} stagger={0.04} out={16.65} />
      <Cross at={16.0} x={180} y={760} size={150} out={16.65} />

      {/* "You can use the end of 2026 to motivate you," */}
      <Chip at={58.9} x={540} y={150} text="THE END OF" bg={X.ink} size={44} out={61.6} />
      <Giant text="2026" at={59.34} y={300} size={400} stagger={0.1} out={61.65} />
      <Icon name="sparkle" at={60.64} size={170} x={890} y={770} rot={20} out={61.6} />
      <Scramble text="MOTIVATION" at={60.7} x={890} y={900} size={40} color={X.blue} out={61.6} />

      {/* "Comment guide and I'll send you my free fat loss guide." */}
      <Chip at={70.92} x={540} y={150} text="COMMENT" />
      <Giant text="GUIDE" at={71.2} y={300} size={330} stagger={0.09} typed={typed}>
        <span style={{display: 'inline-block', width: 14, height: 250, marginLeft: 16, marginTop: 22, background: X.blue, opacity: t < 71.9 || Math.floor((t - 71.9) * 2.2) % 2 === 0 ? 1 : 0}} />
      </Giant>
      <Icon name="file-text" at={72.86} size={150} x={160} y={780} rot={-10} />
      <Scramble text="FREE" at={72.86} x={160} y={905} size={46} color={X.blue} />
      <Scramble text="FAT LOSS" at={73.18} x={890} y={780} size={46} color={X.pink} />
      <Scramble text="GUIDE" at={73.68} x={890} y={840} size={46} color={X.ink} />
    </AbsoluteFill>
  );
};

// ===========================================================================
// On top of the B-roll cutaways
// ===========================================================================
export const KneeBrollOverlay = (t: number) => {
  if (t < K.rehab.end) return null; // the hook title stays up over this cutaway
  // "I'd start with a manageable plan, collect consistent progress information and adjust based on the response."
  const steps = [
    {text: 'PLAN', at: 51.78},
    {text: 'TRACK', at: 53.06},
    {text: 'ADJUST', at: 55.62},
  ];
  const active = steps.filter((s) => t >= s.at).length - 1;
  return (
    <AbsoluteFill key="g">
      {steps.map((s, i) => (
        <Chip key={i} at={s.at} x={200 + i * 340} y={280} text={s.text} size={52} bg={i === active ? X.blue : 'rgba(20,21,24,0.85)'} />
      ))}
      <Dotted at={52.8} x1={330} y1={280} x2={405} y2={280} color="#FFFFFF" width={6} />
      <Dotted at={55.4} x1={670} y1={280} x2={745} y2={280} color="#FFFFFF" width={6} />
    </AbsoluteFill>
  );
};

// ===========================================================================
// Split layout: "NIH researchers explain that energy needs change as weight
// changes. So fixed calorie calculation can over-predict weight loss."
// ===========================================================================
const CX0 = 140;
const CX1 = 950;
const CY0 = 330;
const predicted = (u: number) => CY0 + 400 * u; // straight line
const actual = (u: number) => CY0 + 400 * (1 - Math.exp(-u * 1.6)) / (1 - Math.exp(-1.6)) * 0.62; // flattens
const poly = (fn: (u: number) => number, end: number) => {
  const pts: string[] = [];
  for (let i = 0; i <= 60; i++) {
    const u = (i / 60) * end;
    pts.push(`${i ? 'L' : 'M'}${(CX0 + (CX1 - CX0) * u).toFixed(1)} ${fn(u).toFixed(1)}`);
  }
  return pts.join(' ');
};

export const KneePanel: React.FC = () => {
  const t = useT();
  if (t < K.panel.start || t >= K.panel.end) return null;
  const enter = tween(t, K.panel.start + 0.2, 0.4);
  const pred = tween(t, 39.85, 1.4, EASE_IN_OUT);
  const act = tween(t, 42.1, 1.1, EASE_IN_OUT);
  const gap = tween(t, 43.0, 0.4);
  return (
    <AbsoluteFill style={{opacity: enter}}>
      <Scramble text="NIH RESEARCHERS" at={33.5} x={540} y={90} size={40} color={X.greyText} />
      <Scramble text="ENERGY NEEDS CHANGE" at={36.18} x={540} y={160} size={46} color={X.ink} per={0.02} />
      <Scramble text="AS WEIGHT CHANGES" at={38.0} x={540} y={220} size={46} color={X.blue} per={0.02} />
      <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1} height={1}>
        <line x1={CX0} y1={CY0 - 30} x2={CX0} y2={760} stroke={X.grey} strokeWidth={5} strokeDasharray="0.1 12" strokeLinecap="round" opacity={tween(t, 39.4, 0.3)} />
        <line x1={CX0} y1={760} x2={CX1} y2={760} stroke={X.grey} strokeWidth={5} strokeDasharray="0.1 12" strokeLinecap="round" opacity={tween(t, 39.4, 0.3)} />
        {gap > 0 ? (
          <path
            d={`${poly(actual, 1)} L${CX1} ${predicted(1)} ${Array.from({length: 61}, (_, i) => {
              const u = 1 - i / 60;
              return `L${(CX0 + (CX1 - CX0) * u).toFixed(1)} ${predicted(u).toFixed(1)}`;
            }).join(' ')} Z`}
            fill={X.pink}
            opacity={0.14 * gap}
          />
        ) : null}
        <path d={poly(predicted, pred)} fill="none" stroke={X.ink} strokeWidth={6} strokeDasharray="18 14" strokeLinecap="round" />
        <path d={poly(actual, act)} fill="none" stroke={X.blue} strokeWidth={9} strokeLinecap="round" />
      </svg>
      <Label text="WEIGHT" x={CX0 + 10} y={CY0 - 60} size={30} at={39.4} />
      <Label text="WEEKS" x={CX1 - 50} y={800} size={30} at={39.4} />
      <Scramble text="FIXED CALCULATION" at={39.88} x={700} y={760 - 30} size={34} color={X.ink} />
      <Scramble text="ACTUAL" at={42.3} x={860} y={505} size={40} color={X.blue} />
      <Scramble text="OVER-PREDICTS" at={42.54} x={540} y={915} size={52} color={X.pink} />
      <Label text="ILLUSTRATIVE" x={190} y={840} size={24} at={40.0} />
    </AbsoluteFill>
  );
};

// ===========================================================================
// Full-screen explainer scenes
// ===========================================================================
const QuestionsScene: React.FC = () => {
  const rows = [
    {icon: 'bed', at: 20.02, text: 'ACTIVITY RESTRICTED?', tAt: 20.58},
    {icon: 'briefcase', at: 22.5, text: 'WORK CHANGED ROUTINE?', tAt: 22.66},
    {icon: 'bowl-food', at: 24.5, text: 'EATING NOW?', tAt: 25.18},
    {icon: 'note-pencil', at: 26.36, text: 'WHAT CAN CHANGE?', tAt: 27.12},
  ];
  return (
    <Stage w={K.questions}>
      <Canvas keys={[{t: K.questions.start, x: 540, y: 480, s: 1.25}, {t: 19.3, x: 540, y: 560, s: 1.15}, {t: 20.0, x: 540, y: 900, s: 1.0}]}>
        <Icon name="magnifying-glass" at={17.0} size={170} x={540} y={300} />
        <Scramble text="WHAT BROUGHT" at={17.66} x={540} y={450} size={74} color={X.ink} />
        <Scramble text="YOU HERE?" at={18.26} x={540} y={540} size={74} color={X.blue} />
        {rows.map((r, i) => (
          <React.Fragment key={i}>
            <Icon name={r.icon} at={r.at} size={150} x={200} y={760 + i * 250} rot={-10} />
            <Scramble text={r.text} at={r.tAt} x={320} y={760 + i * 250} size={48} color={X.ink} align="left" per={0.02} />
          </React.Fragment>
        ))}
      </Canvas>
    </Stage>
  );
};

const WeeksScene: React.FC = () => {
  const t = useT();
  return (
    <Stage w={K.weeks}>
      <Canvas keys={[{t: K.weeks.start, x: 540, y: 640, s: 1.2}, {t: 46.4, x: 540, y: 700, s: 1.1}, {t: 47.2, x: 540, y: 900, s: 1.0}]}>
        <div style={{position: 'absolute', left: 540 - 150, top: 480, width: 300, height: 300, borderRadius: 40, background: X.ink, scale: Math.max(0, pop(t, 44.3)), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
          <span style={{fontFamily: PIXEL, fontSize: 70, color: '#fff', scale: `${PIXEL_WIDE} 1`}}>WEEK 1</span>
        </div>
        <Icon name="chart-line-down" at={44.86} size={150} x={800} y={500} color={X.blue} rot={0} />
        <Scramble text="DOESN'T TELL US" at={45.66} x={540} y={860} size={54} color={X.greyText} />
        {[0, 1, 2, 3, 4].map((i) => (
          <QBox key={i} at={47.66 + i * 0.12} x={160 + i * 190} y={1090} size={150} />
        ))}
        <Scramble text="EVERY LATER WEEK" at={48.24} x={540} y={1250} size={58} color={X.pink} />
      </Canvas>
    </Stage>
  );
};

// "...but your starting point, health and available time deserves more attention than
//  somebody else's transformation deadline."  A balance: her three things outweigh their deadline.
const TILES = [
  {icon: 'flag-banner', at: 62.6, color: X.blue},
  {icon: 'heart', at: 63.56, color: X.pink},
  {icon: 'clock', at: 64.72, color: X.blue},
];
const PIVOT: [number, number] = [540, 900];
const ARM = 330;
const HANG = 190;

const Glyph: React.FC<{name: string; size: number; color: string}> = ({name, size, color}) => (
  <svg viewBox="0 0 256 256" width={size} height={size}>
    {ICONS[name].map((d, k) => (
      <path key={k} d={d} fill={color} />
    ))}
  </svg>
);

const Pan: React.FC<{x: number; y: number; at: number}> = ({x, y, at}) => (
  <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: tween(useT(), at, 0.3)}} width={1} height={1}>
    <line x1={x} y1={y - HANG} x2={x - 140} y2={y} stroke={X.ink} strokeWidth={4} />
    <line x1={x} y1={y - HANG} x2={x + 140} y2={y} stroke={X.ink} strokeWidth={4} />
    <path d={`M${x - 165} ${y} H${x + 165} Q ${x + 150} ${y + 50}, ${x} ${y + 54} Q ${x - 150} ${y + 50}, ${x - 165} ${y} Z`} fill={X.ink} />
  </svg>
);

const AttentionScene: React.FC = () => {
  const t = useT();
  const W = K.attention;
  if (t < W.start || t >= W.end) return null;
  // tilt (deg, + = her side down): each thing she names lands and tips it further;
  // "more attention" slams it; their deadline lands and barely moves it back.
  const sp = (at: number) => springAt(t, at, 9, 160);
  const deg = 5 * sp(62.75) + 4.5 * sp(63.71) + 4 * sp(64.87) + 4.5 * sp(66.14) - 5 * sp(68.0) + 5 * sp(68.45);
  const th = (deg * Math.PI) / 180;
  const L: [number, number] = [PIVOT[0] - ARM * Math.cos(th), PIVOT[1] + ARM * Math.sin(th)];
  const R: [number, number] = [PIVOT[0] + ARM * Math.cos(th), PIVOT[1] - ARM * Math.sin(th)];
  const panL = L[1] + HANG;
  const panR = R[1] + HANG;
  const drop = (at: number, yRest: number) => {
    const d = t - at;
    if (d < 0) return null;
    const fall = Math.min(1, d / 0.32);
    return yRest - 700 * (1 - fall * fall);
  };
  const card = drop(67.8, panR - 150);
  const crossed = t >= 69.7;
  return (
    <Stage w={W}>
      <Canvas keys={[{t: W.start, x: 500, y: 860, s: 1.1}, {t: 65.9, x: 530, y: 880, s: 1.03}, {t: 67.6, x: 545, y: 900, s: 1.0}, {t: W.end, x: 560, y: 910, s: 1.05}]}>
        {/* header */}
        <Scramble text="YOUR" at={62.16} x={540} y={420} size={46} color={X.greyText} out={65.6} />
        <Scramble text="STARTING POINT" at={62.6} x={540} y={510} size={76} color={X.blue} out={63.5} />
        <Scramble text="HEALTH" at={63.56} x={540} y={510} size={76} color={X.pink} out={64.66} />
        <Scramble text="AVAILABLE TIME" at={64.72} x={540} y={510} size={76} color={X.blue} out={66.08} />
        <Scramble text="DESERVES" at={65.66} x={540} y={420} size={46} color={X.greyText} />
        <Scramble text="MORE ATTENTION" at={66.14} x={540} y={510} size={84} color={X.ink} />
        <Tick at={66.66} x={985} y={505} size={70} />
        <Scramble text="THAN SOMEONE ELSE'S" at={67.22} x={540} y={600} size={40} color={X.greyText} per={0.015} />

        {/* stand + beam */}
        <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: tween(t, W.start + 0.05, 0.3)}} width={1} height={1}>
          <path d={`M${PIVOT[0] - 16} ${PIVOT[1]} L${PIVOT[0] - 34} 1430 H${PIVOT[0] + 34} L${PIVOT[0] + 16} ${PIVOT[1]} Z`} fill={X.ink} />
          <rect x={PIVOT[0] - 170} y={1420} width={340} height={34} rx={17} fill={X.ink} />
          <line x1={L[0]} y1={L[1]} x2={R[0]} y2={R[1]} stroke={X.ink} strokeWidth={16} strokeLinecap="round" />
          <circle cx={PIVOT[0]} cy={PIVOT[1]} r={24} fill={X.stage} stroke={X.ink} strokeWidth={9} />
          <circle cx={L[0]} cy={L[1]} r={10} fill={X.ink} />
          <circle cx={R[0]} cy={R[1]} r={10} fill={X.ink} />
        </svg>
        <Pan x={L[0]} y={panL} at={W.start + 0.05} />
        <Pan x={R[0]} y={panR} at={W.start + 0.05} />

        {/* her three things */}
        {TILES.map((g, i) => {
          const y = drop(g.at, panL - 58);
          if (y === null) return null;
          const x = L[0] + (i - 1) * 106;
          return (
            <div key={i} style={{position: 'absolute', left: x - 52, top: y - 52, width: 104, height: 104, borderRadius: 24, background: '#fff', boxShadow: '0 8px 20px rgba(0,0,0,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', rotate: `${(i - 1) * 6}deg`}}>
              <Glyph name={g.icon} size={70} color={g.color} />
            </div>
          );
        })}
        <Scramble text="YOU" at={62.6} x={L[0]} y={panL + 110} size={48} color={X.blue} />

        {/* their deadline: a "30 day shred" post */}
        {card !== null ? (
          <div style={{position: 'absolute', left: R[0] - 120, top: card - 140, width: 240, height: 280, rotate: '5deg', borderRadius: 22, background: '#fff', boxShadow: '0 10px 26px rgba(0,0,0,0.18)', opacity: crossed ? 0.55 : 1, overflow: 'hidden'}}>
            <div style={{height: 64, background: X.pink, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: PIXEL, fontSize: 44, color: '#fff'}}>
              <span style={{scale: `${PIXEL_WIDE} 1`}}>30 DAYS</span>
            </div>
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 6, marginTop: 22}}>
              <div style={{scale: '1.25 1', transformOrigin: 'bottom'}}>
                <Glyph name="person" size={92} color={X.grey} />
              </div>
              <Glyph name="arrow-right" size={44} color={X.greyText} />
              <Glyph name="person" size={92} color={X.ink} />
            </div>
            <div style={{textAlign: 'center', fontFamily: PIXEL, fontSize: 34, color: X.ink, marginTop: 14}}>
              <span style={{display: 'inline-block', scale: `${PIXEL_WIDE} 1`}}>SHRED!</span>
            </div>
          </div>
        ) : null}
        <Scramble text="TRANSFORMATION" at={69.12} x={R[0]} y={panR + 100} size={34} color={X.greyText} />
        <Scramble text="DEADLINE" at={69.7} x={R[0]} y={panR + 148} size={52} color={X.pink} />
        <Cross at={69.7} x={R[0] + 10} y={(card ?? panR) - 10} size={190} />
      </Canvas>
    </Stage>
  );
};

export const KneeScenes: React.FC = () => (
  <>
    <QuestionsScene />
    <WeeksScene />
    <AttentionScene />
  </>
);
