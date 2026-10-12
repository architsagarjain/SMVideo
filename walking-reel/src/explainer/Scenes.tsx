import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EASE_IN_OUT, EASE_OUT, lerp, tween} from '../theme';
import {Canvas, Cross, Dotted, Icon, Marker, PIXEL, PeopleGrid, QBox, Scramble, Tick, X, pop, useT} from './kit';
import {SCENES, Window} from './timeline';

/** Full-screen light-grey stage, shown only inside its window, with a quick white flash in. */
const Stage: React.FC<{w: Window; children: React.ReactNode}> = ({w, children}) => {
  const t = useT();
  if (t < w.start || t >= w.end) return null;
  const flash = 1 - tween(t, w.start, 0.16, EASE_OUT);
  return (
    <AbsoluteFill style={{backgroundColor: X.stage, overflow: 'hidden'}}>
      {children}
      <AbsoluteFill style={{backgroundColor: '#fff', opacity: flash * 0.9}} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// 1. "and every extra pill lowered it by another 12%, with no side effects,
//     how many would you take?"   4.14 - 10.25
// ---------------------------------------------------------------------------
const PillsScene: React.FC = () => {
  const t = useT();
  const xs = [240, 540, 840];
  const pillAt = [4.2, 5.46, 6.5];
  const numAt = [4.35, 7.04, 7.3];
  return (
    <Stage w={SCENES.pills}>
      <Canvas
        keys={[
          {t: 4.14, x: 240, y: 880, s: 1.45},
          {t: 5.3, x: 240, y: 880, s: 1.45},
          {t: 6.1, x: 540, y: 900, s: 1.0},
          {t: 9.0, x: 540, y: 920, s: 1.0},
          {t: 9.35, x: 540, y: 1180, s: 1.0},
        ]}
      >
        {xs.map((x, i) => (
          <React.Fragment key={i}>
            <Icon name="pill" at={pillAt[i]} size={200} x={x} y={800} rot={-40} />
            <Marker at={numAt[i]} x={x} y={905} dir="down" color={X.pink} />
            <Scramble text="-12%" at={numAt[i]} x={x} y={990} size={84} color={X.pink} />
          </React.Fragment>
        ))}
        <Scramble text="RISK OF DEATH" at={4.5} x={240} y={1075} size={34} color={X.greyText} />
        <Scramble text="EVERY EXTRA PILL" at={5.2} x={690} y={1075} size={34} color={X.greyText} />
        {/* no side effects */}
        <Tick at={8.15} x={345} y={1228} size={66} />
        <Scramble text="NO SIDE EFFECTS" at={8.36} x={390} y={1232} size={50} color={X.blue} align="left" />
        {/* how many would you take? */}
        <QBox at={9.3} x={300} y={1470} size={170} />
        <QBox at={9.48} x={540} y={1470} size={170} />
        <QBox at={9.66} x={780} y={1470} size={170} />
        <Scramble text="HOW MANY WOULD YOU TAKE" at={9.5} x={540} y={1640} size={34} color={X.greyText} per={0.02} />
      </Canvas>
    </Stage>
  );
};

// ---------------------------------------------------------------------------
// 2. "Every extra 1,000 steps a day is linked to about 12% lower risk of
//     dying from any cause."   15.0 - 21.75
// ---------------------------------------------------------------------------
const StepsScene: React.FC = () => {
  const t = useT();
  // 12% of 60 people ~ 7, highlighted one by one from 18.24
  const hi = new Set([3, 14, 22, 31, 38, 47, 55]);
  const order = [3, 14, 22, 31, 38, 47, 55];
  return (
    <Stage w={SCENES.steps}>
      <Canvas
        keys={[
          {t: 15.0, x: 540, y: 820, s: 1.08},
          {t: 17.0, x: 540, y: 860, s: 1.0},
          {t: 17.6, x: 540, y: 1180, s: 1.0},
        ]}
      >
        <Icon name="person-simple-walk" at={15.2} size={250} x={300} y={720} />
        <Icon name="footprints" at={15.55} size={110} x={160} y={900} color={X.grey} rot={20} />
        <Marker at={15.94} x={720} y={600} dir="up" color={X.blue} />
        <Scramble text="+1,000" at={15.94} x={720} y={700} size={120} color={X.blue} />
        <Scramble text="STEPS A DAY" at={16.36} x={720} y={800} size={40} color={X.greyText} />
        <Dotted at={17.3} x1={540} y1={930} x2={540} y2={1060} arrow />
        <PeopleGrid
          at={17.2}
          x={540}
          y={1100}
          cols={10}
          rows={6}
          size={72}
          gap={16}
          dur={0.8}
          colorOf={(i, tt) => (hi.has(i) && tt >= 18.24 + order.indexOf(i) * 0.08 ? X.blue : X.grey)}
        />
        <Marker at={18.3} x={540} y={1690} dir="down" color={X.blue} />
        <Scramble text="12% LOWER RISK" at={18.24} x={540} y={1780} size={74} color={X.blue} />
        <Scramble text="OF DYING FROM ANY CAUSE" at={19.4} x={540} y={1870} size={36} color={X.greyText} per={0.025} />
      </Canvas>
    </Stage>
  );
};

// ---------------------------------------------------------------------------
// 3. "I do my workout then sit at a desk for 9 hours. I checked once and I was
//     at about 2,500 steps. I trained every day and was basically sedentary
//     the rest of it."   24.55 - 35.3
// ---------------------------------------------------------------------------
const DeskScene: React.FC = () => {
  const t = useT();
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  return (
    <Stage w={SCENES.desk}>
      <Canvas
        keys={[
          {t: 24.55, x: 540, y: 760, s: 1.05},
          {t: 28.1, x: 540, y: 760, s: 1.0},
          {t: 28.7, x: 540, y: 1300, s: 1.0},
          {t: 31.3, x: 540, y: 1300, s: 1.0},
          {t: 31.9, x: 540, y: 1860, s: 1.0},
        ]}
      >
        {/* workout -> desk, 9 hours */}
        <Tick at={25.1} x={280} y={560} size={64} />
        <Icon name="barbell" at={24.88} size={220} x={280} y={720} />
        <Scramble text="WORKOUT" at={25.0} x={280} y={880} size={40} color={X.greyText} />
        <Dotted at={25.66} x1={420} y1={720} x2={630} y2={720} arrow />
        <Icon name="desk" at={26.04} size={240} x={790} y={720} />
        <Icon name="hourglass-medium" at={27.16} size={110} x={960} y={570} rot={30} />
        <Scramble text="9 HOURS" at={27.16} x={790} y={880} size={56} color={X.pink} />

        {/* 2,500 steps */}
        <Icon name="device-mobile" at={28.38} size={300} x={540} y={1180} />
        <Icon name="footprints" at={28.7} size={110} x={540} y={1180} color={X.stage} rot={0} />
        <Marker at={29.84} x={540} y={1360} dir="down" color={X.pink} />
        <Scramble text="2,500" at={29.84} x={540} y={1460} size={130} color={X.pink} />
        <Scramble text="STEPS" at={30.4} x={540} y={1560} size={40} color={X.greyText} />

        {/* trained every day ... basically sedentary */}
        {days.map((d, i) => (
          <React.Fragment key={i}>
            <Icon name="barbell" at={31.68 + i * 0.1} size={92} x={150 + i * 130} y={1740} rot={0} />
            <Scramble text={d} at={31.7 + i * 0.1} x={150 + i * 130} y={1825} size={30} color={X.greyText} />
          </React.Fragment>
        ))}
        <Icon name="armchair" at={33.3} size={170} x={300} y={2010} />
        <Cross at={33.5} x={420} y={1930} size={60} />
        <Scramble text="SEDENTARY" at={33.46} x={700} y={2000} size={74} color={X.pink} />
        <Scramble text="THE REST OF IT" at={34.04} x={700} y={2080} size={34} color={X.greyText} />
      </Canvas>
    </Stage>
  );
};

// ---------------------------------------------------------------------------
// 4. "it came from an old Japanese pedometer marketing campaign. The real
//     benefit climbs fast at the low end and flattens around 7,000 to 10,000.
//     Going from 3,000 to 5,000 beats going from 8,000 to 10,000."
//     36.72 - 52.75
// ---------------------------------------------------------------------------
const CX0 = 150;
const CX1 = 940;
const CYB = 2480;
const CYT = 2040;
const MAXS = 12000;
const f = (s: number) => 1 - Math.exp(-s / 3000);
const cx = (s: number) => CX0 + (s / MAXS) * (CX1 - CX0);
const cy = (s: number) => CYB - (f(s) / f(MAXS)) * (CYB - CYT);
const curve = (a: number, b: number) => {
  if (b <= a) return '';
  const pts: string[] = [];
  const n = Math.max(2, Math.ceil((b - a) / 80));
  for (let i = 0; i <= n; i++) {
    const s = a + ((b - a) * i) / n;
    pts.push(`${i ? 'L' : 'M'}${cx(s).toFixed(1)} ${cy(s).toFixed(1)}`);
  }
  return pts.join(' ');
};

const Pedometer: React.FC<{at: number; x: number; y: number}> = ({at, x, y}) => {
  const t = useT();
  if (t < at) return null;
  const p = pop(t, at);
  const n = Math.round(lerp(tween(t, at + 0.2, 0.7), 0, 10000));
  return (
    <div style={{position: 'absolute', left: x - 90, top: y - 110, width: 180, height: 220, scale: Math.max(0, p), rotate: `${lerp(Math.min(p, 1), -12, -4)}deg`}}>
      <div style={{position: 'absolute', left: 60, top: 0, width: 60, height: 26, borderRadius: '10px 10px 0 0', background: X.ink}} />
      <div style={{position: 'absolute', left: 0, top: 18, width: 180, height: 202, borderRadius: 44, background: X.ink}} />
      <div
        style={{
          position: 'absolute',
          left: 22,
          top: 58,
          width: 136,
          height: 66,
          borderRadius: 12,
          background: X.stage,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: PIXEL,
          fontSize: 44,
          color: X.ink,
          letterSpacing: 2,
        }}
      >
        {String(n).padStart(5, '0')}
      </div>
      <div style={{position: 'absolute', left: 70, top: 148, width: 40, height: 40, borderRadius: 20, background: X.blue}} />
    </div>
  );
};

const Flag: React.FC<{at: number; x: number; y: number}> = ({at, x, y}) => {
  const t = useT();
  if (t < at) return null;
  const p = pop(t, at);
  return (
    <div style={{position: 'absolute', left: x - 75, top: y - 50, width: 150, height: 100, borderRadius: 10, background: '#fff', border: `5px solid ${X.ink}`, scale: Math.max(0, p), display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{width: 52, height: 52, borderRadius: 26, background: X.red}} />
    </div>
  );
};

const OriginScene: React.FC = () => {
  const t = useT();
  const sEnd = t < 44.3 ? lerp(tween(t, 41.4, 2.0, EASE_IN_OUT), 0, 6000) : lerp(tween(t, 44.45, 1.3, EASE_IN_OUT), 6000, MAXS);
  const band = tween(t, 45.62, 0.4);
  const segA = tween(t, 48.3, 0.7, EASE_IN_OUT);
  const segB = tween(t, 51.0, 0.7, EASE_IN_OUT);
  const ticks = [0, 3000, 5000, 7000, 10000, 12000];
  return (
    <Stage w={SCENES.origin}>
      <Canvas
        keys={[
          {t: 36.72, x: 540, y: 900, s: 1.1},
          {t: 38.0, x: 540, y: 960, s: 1.0},
          {t: 40.75, x: 540, y: 960, s: 1.0},
          {t: 41.35, x: 540, y: 2230, s: 1.0},
          {t: 47.6, x: 540, y: 2230, s: 1.0},
          {t: 48.2, x: 480, y: 2280, s: 1.1},
          {t: 50.5, x: 480, y: 2280, s: 1.1},
          {t: 51.0, x: 600, y: 2180, s: 1.1},
          {t: 52.4, x: 540, y: 2230, s: 1.0},
        ]}
      >
        {/* 10,000 -> Japanese pedometer -> marketing campaign */}
        <Scramble text="10,000" at={36.76} x={540} y={700} size={190} color={X.ink} />
        <Scramble text="STEPS" at={37.0} x={540} y={830} size={44} color={X.greyText} />
        <Flag at={37.76} x={250} y={1080} />
        <Pedometer at={38.06} x={540} y={1080} />
        <Icon name="megaphone" at={39.48} size={190} x={830} y={1080} rot={15} />
        <Dotted at={38.2} x1={345} y1={1080} x2={420} y2={1080} width={5} />
        <Dotted at={39.4} x1={660} y1={1080} x2={725} y2={1080} width={5} />
        <Scramble text="JAPANESE PEDOMETER" at={38.06} x={540} y={1260} size={38} color={X.greyText} per={0.02} out={40.8} />
        <Scramble text="MARKETING CAMPAIGN" at={39.48} x={540} y={1340} size={56} color={X.pink} per={0.025} out={40.8} />

        {/* the curve */}
        <Scramble text="BENEFIT" at={41.4} x={CX0 - 10} y={CYT - 110} size={36} color={X.greyText} align="left" />
        <Dotted at={41.3} x1={CX0} y1={CYB} x2={CX0} y2={CYT - 60} dur={0.4} width={5} />
        <Dotted at={41.3} x1={CX0} y1={CYB} x2={CX1 + 20} y2={CYB} dur={0.5} width={5} />
        {ticks.map((s) => (
          <Scramble key={s} text={s === 0 ? '0' : `${s / 1000}K`} at={41.5 + s / 30000} x={cx(s)} y={CYB + 55} size={30} color={X.greyText} />
        ))}
        <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1} height={1}>
          <rect x={cx(7000)} y={CYT - 40} width={cx(10000) - cx(7000)} height={(CYB - CYT + 40) * band} fill={X.grey} opacity={0.35} />
          <path d={curve(0, sEnd)} fill="none" stroke={X.ink} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
          {/* 3k -> 5k: big gain */}
          <path d={curve(3000, lerp(segA, 3000, 5000))} fill="none" stroke={X.blue} strokeWidth={16} strokeLinecap="round" />
          {segA > 0 ? <path d={`M${cx(5000)} ${cy(3000)} L${cx(5000)} ${lerp(segA, cy(3000), cy(5000))}`} stroke={X.blue} strokeWidth={6} strokeDasharray="0.1 14" strokeLinecap="round" /> : null}
          {/* 8k -> 10k: small gain */}
          <path d={curve(8000, lerp(segB, 8000, 10000))} fill="none" stroke={X.pink} strokeWidth={16} strokeLinecap="round" />
        </svg>
        <Scramble text="FLATTENS" at={45.66} x={(cx(7000) + cx(10000)) / 2} y={CYT - 80} size={36} color={X.greyText} />
        <Marker at={48.4} x={cx(4000)} y={cy(4000) + 40} dir="up" color={X.blue} />
        <Scramble text="3K-5K" at={48.38} x={cx(4000) + 10} y={cy(4000) + 120} size={50} color={X.blue} />
        <Scramble text="BIG GAIN" at={49.2} x={cx(4000) + 10} y={cy(4000) + 180} size={30} color={X.greyText} />
        <Scramble text="8K-10K" at={51.0} x={cx(9000)} y={cy(9000) + 110} size={50} color={X.pink} />
        <Scramble text="SMALL GAIN" at={51.6} x={cx(9000)} y={cy(9000) + 170} size={30} color={X.greyText} />
      </Canvas>
    </Stage>
  );
};

// ---------------------------------------------------------------------------
// 5. "is roughly 150 calories a day. A walk after meal also softens the blood
//     sugar spike."   55.55 - 62.55
// ---------------------------------------------------------------------------
const MEAL = 220;
const BX1 = 920;
const BYB = 2000;
const bump = (x: number, width: number, k: number) => {
  const u = (x - MEAL) / width;
  return u <= 0 ? 0 : Math.pow(u * Math.exp(1 - u), k);
};
const spike = (x: number) => 260 * bump(x, 110, 3.0);
const soft = (x: number) => 120 * bump(x, 190, 1.6);
const bpath = (fn: (x: number) => number, end: number) => {
  const pts: string[] = [];
  for (let x = 120; x <= end; x += 5) pts.push(`${x === 120 ? 'M' : 'L'}${x} ${(BYB - fn(x)).toFixed(1)}`);
  return pts.join(' ');
};

const CaloriesScene: React.FC = () => {
  const t = useT();
  const drawSpike = lerp(tween(t, 59.2, 0.8, EASE_IN_OUT), 120, BX1);
  const morph = tween(t, 60.24, 0.9, EASE_IN_OUT);
  const mix = (x: number) => spike(x) + (soft(x) - spike(x)) * morph;
  return (
    <Stage w={SCENES.calories}>
      <Canvas
        keys={[
          {t: 55.55, x: 540, y: 860, s: 1.05},
          {t: 58.3, x: 540, y: 880, s: 1.0},
          {t: 58.9, x: 540, y: 1700, s: 1.0},
        ]}
      >
        <Scramble text="+4,000 STEPS" at={55.6} x={540} y={560} size={56} color={X.blue} />
        <Scramble text="=" at={56.0} x={540} y={650} size={56} color={X.greyText} />
        <Icon name="fire" at={56.48} size={230} x={540} y={850} rot={-14} />
        
        <Scramble text="ROUGHLY" at={55.98} x={540} y={1010} size={34} color={X.greyText} />
        <Scramble text="150 KCAL" at={56.48} x={540} y={1090} size={104} color={X.pink} />
        <Scramble text="A DAY" at={57.62} x={540} y={1190} size={38} color={X.greyText} />

        <Icon name="bowl-food" at={58.6} size={170} x={250} y={1450} />
        <Dotted at={58.85} x1={370} y1={1450} x2={640} y2={1450} arrow />
        <Icon name="person-simple-walk" at={59.0} size={190} x={790} y={1440} />
        <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1} height={1}>
          <line x1={120} y1={BYB} x2={BX1} y2={BYB} stroke={X.grey} strokeWidth={5} strokeDasharray="0.1 12" strokeLinecap="round" opacity={tween(t, 59.1, 0.3)} />
          <path d={bpath(spike, drawSpike)} fill="none" stroke={morph > 0 ? X.grey : X.pink} strokeWidth={morph > 0 ? 6 : 9} strokeDasharray={morph > 0 ? '14 12' : undefined} strokeLinecap="round" />
          {morph > 0 ? <path d={bpath(mix, BX1)} fill="none" stroke={X.blue} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" /> : null}
        </svg>
        <Scramble text="BLOOD SUGAR" at={59.3} x={120} y={1640} size={36} color={X.greyText} align="left" />
        <Scramble text="SPIKE" at={61.5} x={MEAL + 140} y={BYB - 300} size={40} color={X.pink} />
        <Scramble text="WITH A WALK" at={60.8} x={700} y={BYB - 170} size={40} color={X.blue} />
      </Canvas>
    </Stage>
  );
};

export const ExplainerScenes: React.FC = () => (
  <>
    <PillsScene />
    <StepsScene />
    <DeskScene />
    <OriginScene />
    <CaloriesScene />
  </>
);
