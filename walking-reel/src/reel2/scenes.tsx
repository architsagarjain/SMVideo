import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Canvas, Cross, Dotted, Icon, PIXEL, PIXEL_WIDE, QBox, Scramble, Tick, X, pop, useT} from '../explainer/kit';
import {ICONS} from '../explainer/icons';
import {EASE_IN, EASE_IN_OUT, EASE_OUT, lerp, springAt, tween} from '../theme';
import {GFX2, PANEL} from './timeline';

type Win = {start: number; end: number};
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const KEEP = [1, 4]; // the two training days used throughout (Tue, Fri)

const Stage: React.FC<{w: Win; children: React.ReactNode}> = ({w, children}) => {
  const t = useT();
  if (t < w.start || t >= w.end) return null;
  const flash = 1 - tween(t, w.start, 0.16, EASE_OUT);
  // slow continuous push so the graphics never sit completely still
  const drift = lerp(tween(t, w.start, w.end - w.start), 1, 1.045);
  return (
    <AbsoluteFill style={{backgroundColor: X.stage, overflow: 'hidden'}}>
      <AbsoluteFill style={{scale: drift}}>{children}</AbsoluteFill>
      <AbsoluteFill style={{backgroundColor: '#fff', opacity: flash * 0.9}} />
    </AbsoluteFill>
  );
};

/** Plain pixel label (no scramble) for static axis text. */
const Label: React.FC<{text: string; x: number; y: number; size: number; color?: string; at?: number; out?: number}> = ({text, x, y, size, color = X.greyText, at = 0, out}) => {
  const t = useT();
  if (t < at) return null;
  const o = tween(t, at, 0.2) * (out === undefined ? 1 : 1 - tween(t, out, 0.2));
  return (
    <div style={{position: 'absolute', left: x, top: y, translate: '-50% -50%', scale: `${PIXEL_WIDE} 1`, fontFamily: PIXEL, fontSize: size, color, opacity: o, whiteSpace: 'pre', lineHeight: 1}}>{text}</div>
  );
};

// ---------------------------------------------------------------------------
// 1. "So when I see a fitness plan that assumes every evening is free,
//     I immediately question it."
// ---------------------------------------------------------------------------
const WeekScene: React.FC = () => {
  const t = useT();
  const W = GFX2.week;
  return (
    <Stage w={W}>
      <Canvas
        keys={[
          {t: W.start, x: 540, y: 680, s: 1.25},
          {t: 5.9, x: 540, y: 700, s: 1.12},
          {t: 6.5, x: 540, y: 960, s: 1.0},
          {t: 8.2, x: 540, y: 960, s: 1.0},
          {t: 8.8, x: 540, y: 1080, s: 1.0},
        ]}
      >
        <Icon name="clipboard-text" at={4.42} size={230} x={540} y={600} />
        <Scramble text="FITNESS PLAN" at={5.16} x={540} y={775} size={64} color={X.ink} />
        {DAYS.map((d, i) => {
          const x = 150 + i * 130;
          const moonAt = 6.54 + i * 0.1;
          return (
            <React.Fragment key={i}>
              <Label text={d} x={x} y={930} size={40} at={6.1 + i * 0.04} />
              <Icon name="moon" at={moonAt} size={96} x={x} y={1030} rot={-20} />
              <Scramble text="FREE" at={7.66 + i * 0.05} x={x} y={1125} size={30} color={X.blue} />
              {KEEP.includes(i) ? <Tick at={8.95 + KEEP.indexOf(i) * 0.12} x={x} y={1215} size={56} /> : <Cross at={8.36 + i * 0.06} x={x} y={1030} size={92} />}
            </React.Fragment>
          );
        })}
        <QBox at={8.4} x={540} y={1390} size={190} />
      </Canvas>
    </Stage>
  );
};

// ---------------------------------------------------------------------------
// 2. "A 2024 meta-analysis of 14 studies found similar strength and muscle
//     growth outcomes between split and full body routines when weekly
//     training volume was matched."
// ---------------------------------------------------------------------------
const StudyDocs: React.FC = () => {
  const t = useT();
  // 14 study documents drop in and stack into a 7 x 2 grid, one per beat
  return (
    <>
      {Array.from({length: 14}, (_, i) => {
        const at = 18.0 + i * 0.07;
        if (t < at) return null;
        const col = i % 7;
        const row = Math.floor(i / 7);
        const tx = 150 + col * 130;
        const ty = 900 + row * 150;
        const p = springAt(t, at, 13, 170);
        const y = lerp(Math.min(p, 1.08), ty - 420, ty);
        return (
          <svg key={i} viewBox="0 0 256 256" width={118} height={118} style={{position: 'absolute', left: tx - 59, top: y - 59, rotate: `${lerp(Math.min(p, 1), (i % 2 ? 1 : -1) * 25, 0)}deg`, opacity: Math.min(1, p * 3)}}>
            <path d={ICONS['file-text'][0]} fill={i % 3 === 0 ? X.blue : X.ink} />
          </svg>
        );
      })}
    </>
  );
};

const Bar: React.FC<{x: number; base: number; h: number; at: number; color: string; w?: number}> = ({x, base, h, at, color, w = 96}) => {
  const t = useT();
  if (t < at) return null;
  const p = springAt(t, at, 15, 120);
  return <div style={{position: 'absolute', left: x - w / 2, top: base - h * p, width: w, height: h * p, background: color, borderRadius: '10px 10px 0 0'}} />;
};

const StudyScene: React.FC = () => {
  const t = useT();
  const W = GFX2.study;
  const count = Math.min(14, Math.max(0, Math.floor((t - 18.0) / 0.07) + 1));
  const BASE = 1800;
  return (
    <Stage w={W}>
      <Canvas
        keys={[
          {t: W.start, x: 540, y: 560, s: 1.2},
          {t: 17.6, x: 540, y: 700, s: 1.0},
          {t: 19.4, x: 540, y: 760, s: 1.0},
          {t: 20.0, x: 540, y: 1580, s: 1.0},
          {t: 24.5, x: 540, y: 1580, s: 1.0},
          {t: 25.1, x: 540, y: 2000, s: 1.0},
        ]}
      >
        <Scramble text="2024" at={15.47} x={540} y={480} size={190} color={X.ink} />
        <Scramble text="META-ANALYSIS" at={16.6} x={540} y={620} size={62} color={X.blue} />
        <StudyDocs />
        {t >= 18.0 ? <Label text={`${count} STUDIES`} x={540} y={1230} size={58} color={X.pink} at={18.0} /> : null}

        {/* similar strength and muscle growth ... split vs full body */}
        <Label text="STRENGTH" x={330} y={BASE + 50} size={40} at={20.04} />
        <Label text="MUSCLE" x={750} y={BASE + 50} size={40} at={20.86} />
        <Bar x={275} base={BASE} h={300} at={20.1} color={X.blue} />
        <Bar x={385} base={BASE} h={292} at={20.25} color={X.ink} />
        <Bar x={695} base={BASE} h={260} at={20.9} color={X.blue} />
        <Bar x={805} base={BASE} h={255} at={21.05} color={X.ink} />
        <Label text="SIMILAR" x={540} y={1400} size={52} color={X.ink} at={19.52} />
        <div style={{position: 'absolute', left: 150, top: 1905, width: 40, height: 40, background: X.blue, borderRadius: 8, opacity: tween(t, 22.82, 0.2)}} />
        <Label text="SPLIT" x={300} y={1925} size={44} color={X.blue} at={22.82} />
        <div style={{position: 'absolute', left: 520, top: 1905, width: 40, height: 40, background: X.ink, borderRadius: 8, opacity: tween(t, 23.62, 0.2)}} />
        <Label text="FULL BODY" x={720} y={1925} size={44} color={X.ink} at={23.62} />

        {/* when weekly training volume was matched */}
        <Icon name="scales" at={24.7} size={230} x={540} y={2090} />
        <Scramble text="WEEKLY VOLUME" at={25.08} x={540} y={2250} size={50} color={X.greyText} />
        <Scramble text="MATCHED" at={26.16} x={510} y={2320} size={64} color={X.blue} />
        <Tick at={26.66} x={720} y={2315} size={70} />
      </Canvas>
    </Stage>
  );
};

// ---------------------------------------------------------------------------
// Split layout (34.1 - 43.45): "it means we can distribute suitable training
// across fewer days instead of copying a body part calendar you keep missing."
// ---------------------------------------------------------------------------
const BLOCK_W = 96;
const BLOCK_H = 38;
const PBASE = 600;
// 10 volume blocks: first spread over Mon-Fri (2 each), then gathered into the 2 kept days (5 each)
const blockPos = (i: number, gathered: number) => {
  const fromDay = Math.floor(i / 2);
  const fromLvl = i % 2;
  const toDay = KEEP[i % 2];
  const toLvl = Math.floor(i / 2);
  const day = lerp(gathered, fromDay, toDay);
  const lvl = lerp(gathered, fromLvl, toLvl);
  return {x: 150 + day * 130, y: PBASE - (lvl + 1) * (BLOCK_H + 8)};
};

export const PanelChart: React.FC = () => {
  const t = useT();
  if (t < PANEL.start || t >= PANEL.end) return null;
  const enter = tween(t, PANEL.start + 0.2, 0.4);
  const gathered = tween(t, 38.3, 0.9, EASE_IN_OUT);
  const blocksOut = tween(t, 39.75, 0.3, EASE_IN);
  return (
    <AbsoluteFill style={{opacity: enter}}>
      <Scramble text="SAME WEEKLY VOLUME" at={34.6} x={540} y={130} size={46} color={X.greyText} out={39.7} />
      <Scramble text="BODY PART CALENDAR" at={40.26} x={540} y={130} size={46} color={X.pink} />
      {DAYS.map((d, i) => (
        <Label key={i} text={d} x={150 + i * 130} y={660} size={42} at={34.5 + i * 0.04} color={KEEP.includes(i) && gathered > 0.5 && blocksOut < 0.5 ? X.blue : X.greyText} />
      ))}
      <div style={{position: 'absolute', left: 90, top: PBASE + 4, width: 900, height: 4, background: '#DCDDE0', opacity: enter}} />
      {Array.from({length: 10}, (_, i) => {
        const at = 35.78 + i * 0.06;
        if (t < at) return null;
        const p = pop(t, at);
        const {x, y} = blockPos(i, gathered);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x - BLOCK_W / 2,
              top: y,
              width: BLOCK_W,
              height: BLOCK_H,
              borderRadius: 8,
              background: gathered > 0.98 ? X.blue : X.ink,
              scale: Math.max(0, p) * (1 - blocksOut),
              opacity: 1 - blocksOut,
            }}
          />
        );
      })}
      <Scramble text="FEWER DAYS" at={38.76} x={540} y={760} size={58} color={X.blue} out={39.7} />
      {/* body part calendar: one muscle group per day, most of them missed */}
      {['CHEST', 'BACK', 'LEGS', 'ARMS', 'SHLDR'].map((m, i) => (
        <React.Fragment key={i}>
          <div
            style={{
              position: 'absolute',
              left: 150 + i * 130 - 58,
              top: PBASE - 230,
              width: 116,
              height: 220,
              borderRadius: 14,
              background: '#E3E4E7',
              scale: Math.max(0, pop(t, 40.3 + i * 0.08)),
              display: t >= 40.3 + i * 0.08 ? 'block' : 'none',
            }}
          />
          <Label text={m} x={150 + i * 130} y={PBASE - 120} size={30} color={X.ink} at={40.36 + i * 0.08} />
          {[0, 2, 3].includes(i) ? <Cross at={42.04 + [0, 2, 3].indexOf(i) * 0.12} x={150 + i * 130} y={PBASE - 190} size={70} /> : null}
        </React.Fragment>
      ))}
      <Scramble text="KEEP MISSING" at={42.0} x={540} y={760} size={58} color={X.pink} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// 3. "consider full body sessions with appropriate lower body work, pushing
//     and pulling exercises. Then add track completed sets, reps and load."
// ---------------------------------------------------------------------------
const Cell: React.FC<{x: number; y: number; w: number; h: number; at: number; color: string; children?: React.ReactNode}> = ({x, y, w, h, at, color, children}) => {
  const t = useT();
  if (t < at) return null;
  const p = pop(t, at);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 8, background: color, scale: Math.max(0, p), display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      {children}
    </div>
  );
};

const BodyScene: React.FC = () => {
  const t = useT();
  const W = GFX2.body;
  const cols = [{h: 'SETS', at: 52.06}, {h: 'REPS', at: 53.14}, {h: 'LOAD', at: 53.36}];
  return (
    <Stage w={W}>
      <Canvas
        keys={[
          {t: W.start, x: 540, y: 640, s: 1.15},
          {t: 45.4, x: 540, y: 700, s: 1.0},
          {t: 50.35, x: 540, y: 700, s: 1.0},
          {t: 50.95, x: 540, y: 1460, s: 1.0},
        ]}
      >
        <Icon name="person-arms-spread" at={43.47} size={380} x={540} y={640} rot={0} />
        <Scramble text="FULL BODY" at={44.26} x={540} y={300} size={80} color={X.ink} />
        <Scramble text="SESSIONS" at={44.9} x={540} y={380} size={40} color={X.greyText} />
        {/* lower body (legs), push (right arm), pull (left arm) */}
        <Dotted at={46.2} x1={500} y1={790} x2={300} y2={960} />
        <Scramble text="LOWER BODY" at={46.46} x={260} y={1010} size={46} color={X.blue} />
        <Tick at={47.0} x={260} y={1080} size={56} />
        <Dotted at={47.9} x1={720} y1={600} x2={880} y2={880} />
        <Scramble text="PUSH" at={48.14} x={880} y={930} size={56} color={X.blue} />
        <Tick at={48.5} x={880} y={1000} size={56} />
        <Dotted at={48.6} x1={360} y1={600} x2={190} y2={520} />
        <Scramble text="PULL" at={48.86} x={170} y={470} size={56} color={X.blue} />
        <Tick at={49.18} x={300} y={470} size={56} />

        {/* tracking log */}
        <Icon name="note-pencil" at={50.7} size={170} x={540} y={1180} />
        <Scramble text="TRACK EVERY SESSION" at={51.08} x={540} y={1300} size={42} color={X.greyText} per={0.02} />
        {cols.map((c, i) => (
          <React.Fragment key={i}>
            <Cell x={260 + i * 200} y={1370} w={180} h={80} at={c.at} color={X.navy}>
              <span style={{fontFamily: PIXEL, fontSize: 40, color: '#fff', scale: `${PIXEL_WIDE} 1`}}>{c.h}</span>
            </Cell>
            {[0, 1, 2].map((r) => (
              <Cell key={r} x={260 + i * 200} y={1470 + r * 96} w={180} h={84} at={c.at + 0.1 + r * 0.07} color="#E3E4E7" />
            ))}
          </React.Fragment>
        ))}
        {[0, 1, 2].map((r) => (
          <React.Fragment key={r}>
            <Label text={`SESSION ${r + 1}`} x={150} y={1512 + r * 96} size={30} at={51.44 + r * 0.08} />
            {[0, 1, 2].map((c) => (
              <Tick key={c} at={cols[c].at + 0.25 + r * 0.08} x={350 + c * 200} y={1512 + r * 96} size={50} />
            ))}
          </React.Fragment>
        ))}
      </Canvas>
    </Stage>
  );
};

// ---------------------------------------------------------------------------
// 4. "You don't automatically need a bigger motivational speech."
// ---------------------------------------------------------------------------
const MotivationScene: React.FC = () => {
  const t = useT();
  const W = GFX2.motivation;
  const grow = lerp(tween(t, 67.72, 0.5, EASE_OUT), 1, 1.45);
  return (
    <Stage w={W}>
      <Canvas keys={[{t: W.start, x: 540, y: 860, s: 1.1}, {t: 69.0, x: 540, y: 860, s: 1.0}]}>
        <Scramble text="YOU DON'T NEED" at={66.0} x={540} y={450} size={56} color={X.greyText} />
        <div style={{position: 'absolute', left: 0, top: 0, scale: grow, transformOrigin: '540px 820px', width: 1080, height: 1920}}>
          <Icon name="megaphone" at={65.62} size={300} x={540} y={820} rot={10} />
        </div>
        <Scramble text="A BIGGER" at={67.72} x={540} y={1120} size={50} color={X.ink} />
        <Scramble text="MOTIVATIONAL SPEECH" at={68.06} x={540} y={1200} size={62} color={X.pink} per={0.02} />
        <Cross at={69.0} x={760} y={640} size={170} />
      </Canvas>
    </Stage>
  );
};

export const Scenes2: React.FC = () => (
  <>
    <WeekScene />
    <StudyScene />
    <BodyScene />
    <MotivationScene />
  </>
);
