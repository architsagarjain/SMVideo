import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Canvas, Cross, Dotted, Icon, Marker, PIXEL, PIXEL_WIDE, Scramble, Tick, X, useT} from '../explainer/kit';
import {Stage} from '../series/core';
import {Chip, Giant, Label} from '../series/parts';
import {EASE_IN_OUT, EASE_OUT, tween} from '../theme';
import {L} from './config';

// Colour language for this reel: blue = body fat (the loss you want), pink = lean mass / muscle.

// ===========================================================================
// Behind her head (wall washed). Her head spans roughly x 360-720, y 520+.
// ===========================================================================
export const SleepBehind: React.FC = () => {
  const t = useT();
  const typed = 'SLEEP'.split('').filter((_, i) => t >= 96.0 + i * 0.09).length;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {/* "How much could losing just one hour of sleep at night impact your body's ability to lose fat?" */}
      <Giant text="-1 HR" at={2.24} y={460} size={330} stagger={0.08} out={L.hook.end - 0.15} />
      <Icon name="moon-stars" at={2.9} size={190} x={185} y={790} color={X.navy} rot={-12} out={L.hook.end - 0.2} />
      <Scramble text="SLEEP" at={2.95} x={185} y={925} size={44} color={X.blue} out={L.hook.end - 0.2} />
      <Icon name="fire" at={5.46} size={190} x={895} y={790} color={X.pink} rot={10} out={L.hook.end - 0.2} />
      <Scramble text="FAT LOSS" at={5.5} x={895} y={925} size={44} color={X.pink} out={L.hook.end - 0.2} />

      {/* "And sleep has more control over that than most people realize." */}
      <Giant text="SLEEP" at={14.66} y={440} size={300} stagger={0.06} out={L.control.end - 0.15} />
      <Chip at={15.74} x={540} y={300} text="IN CONTROL" bg={X.navy} size={46} out={L.control.end - 0.2} />
      <Icon name="moon-stars" at={14.8} size={180} x={895} y={790} color={X.navy} rot={12} out={L.control.end - 0.2} />
      <Icon name="eye" at={17.2} size={160} x={185} y={780} rot={-8} out={L.control.end - 0.2} />
      <Scramble text="MOST MISS IT" at={17.25} x={185} y={900} size={40} color={X.pink} out={L.control.end - 0.2} />

      {/* "But how much of a big difference could just one hour make?" */}
      <Icon name="hourglass-medium" at={18.84} size={180} x={185} y={790} rot={-10} out={L.hour.end - 0.2} />
      <Icon name="alarm" at={20.02} size={180} x={895} y={790} color={X.pink} rot={10} out={L.hour.end - 0.2} />
      <Giant text="1 HOUR?" at={20.88} y={470} size={230} color={X.blue} stagger={0.05} out={L.hour.end - 0.15} />

      {/* "And after eight weeks of dieting both groups ended up losing the same amount of weight on the scale" */}
      <Chip at={37.04} x={540} y={290} text="AFTER 8 WEEKS" bg={X.ink} size={46} out={L.scale.end - 0.2} />
      <Giant text="SAME" at={40.26} y={420} size={320} stagger={0.06} out={L.scale.end - 0.15} />
      <Icon name="scales" at={41.24} size={190} x={185} y={790} rot={-8} out={L.scale.end - 0.2} />
      <Scramble text="ON THE SCALE" at={42.02} x={185} y={915} size={38} color={X.blue} out={L.scale.end - 0.2} />
      <Icon name="check-circle" at={43.5} size={170} x={895} y={790} color={X.green} rot={8} out={L.scale.end - 0.2} />
      <Scramble text="NO SURPRISE" at={43.6} x={895} y={910} size={38} color={X.green} out={L.scale.end - 0.2} />

      {/* "But before you panic, keep in mind that these people weren't lifting weights," */}
      <Chip at={70.8} x={540} y={300} text="WAIT" bg={X.ink} size={50} out={L.panic.end - 0.2} />
      <Icon name="clipboard-text" at={72.32} size={170} x={185} y={790} rot={-8} out={L.panic.end - 0.2} />
      <Scramble text="THE STUDY" at={72.4} x={185} y={910} size={40} color={X.greyText} out={L.panic.end - 0.2} />
      <Icon name="barbell" at={73.64} size={190} x={895} y={790} rot={10} out={L.panic.end - 0.2} />
      <Cross at={74.2} x={895} y={790} size={170} out={L.panic.end - 0.2} />
      <Giant text="NO WEIGHTS" at={74.56} y={480} size={165} color={X.pink} stagger={0.035} out={L.panic.end - 0.15} />

      {/* "Comment SLEEP if you want my free fat loss guide." */}
      <Chip at={95.52} x={540} y={260} text="COMMENT" />
      <Giant text="SLEEP" at={96.0} y={400} size={330} stagger={0.09} typed={typed}>
        <span style={{display: 'inline-block', width: 14, height: 250, marginLeft: 16, marginTop: 22, background: X.blue, opacity: t < 96.7 || Math.floor((t - 96.7) * 2.2) % 2 === 0 ? 1 : 0}} />
      </Giant>
      <Icon name="file-text" at={97.62} size={150} x={160} y={780} rot={-10} />
      <Scramble text="FREE" at={97.62} x={160} y={905} size={46} color={X.blue} />
      <Scramble text="FAT LOSS" at={98.06} x={890} y={780} size={46} color={X.pink} />
      <Scramble text="GUIDE" at={98.48} x={890} y={840} size={46} color={X.ink} />
    </AbsoluteFill>
  );
};

// ===========================================================================
// On top of the B-roll: "...which is one of the best things you can do to protect your muscle while dieting."
// ===========================================================================
export const SleepBrollOverlay = (t: number) => (
  <AbsoluteFill key="b">
    <Chip at={75.6} x={540} y={250} text="STRENGTH TRAINING" bg={X.blue} size={52} />
    {t >= 79.0 ? <Icon name="shield-check" at={79.0} size={150} x={540} y={420} color="#FFFFFF" rot={0} /> : null}
  </AbsoluteFill>
);

// ===========================================================================
// Split layout: where the weight came from. Blue = body fat, pink = lean mass.
// ===========================================================================
const BX = 120;
const BW = 840;
const BH = 120;

const count = (t: number, at: number, to: number, dur = 0.7) => Math.round(to * tween(t, at, dur, EASE_OUT));

const Bar: React.FC<{y: number; fat: number; fatAt: number; leanAt: number}> = ({y, fat, fatAt, leanAt}) => {
  const t = useT();
  const lean = 100 - fat;
  const pf = tween(t, fatAt, 0.8, EASE_OUT);
  const pl = tween(t, leanAt, 0.8, EASE_OUT);
  if (t < Math.min(fatAt, leanAt) - 0.6) return null;
  const seg = (w: number, color: string, label: string, n: number, align: 'left' | 'right', show: boolean) => (
    <div style={{position: 'absolute', top: 0, [align]: 0, height: BH, width: (BW * w) / 100, background: color, borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
      {show ? (
        <span style={{fontFamily: PIXEL, fontSize: w > 30 ? 74 : 46, color: '#fff', scale: `${PIXEL_WIDE} 1`, display: 'inline-block', whiteSpace: 'pre'}}>
          {n}%{w > 30 ? ` ${label}` : ''}
        </span>
      ) : null}
    </div>
  );
  return (
    <div style={{position: 'absolute', left: BX, top: y, width: BW, height: BH, borderRadius: 22, background: '#E3E4E7', opacity: tween(t, Math.min(fatAt, leanAt) - 0.6, 0.3)}}>
      {pf > 0 ? seg(fat * pf, X.blue, 'FAT', count(t, fatAt, fat), 'left', t >= fatAt + 0.15) : null}
      {pl > 0 ? seg(lean * pl, X.pink, 'LEAN', count(t, leanAt, lean), 'right', t >= leanAt + 0.15) : null}
    </div>
  );
};

export const SleepPanel: React.FC = () => {
  const t = useT();
  if (t < L.panel.start || t >= L.panel.end) return null;
  const enter = tween(t, L.panel.start + 0.2, 0.4);
  const pulse = t > 64.4 && t < 66.6 ? 1 + 0.04 * Math.sin((t - 64.4) * 14) * (1 - tween(t, 64.4, 2.2)) : 1;
  return (
    <AbsoluteFill style={{opacity: enter}}>
      <Scramble text="WHERE DID THE WEIGHT" at={44.74} x={540} y={95} size={44} color={X.greyText} per={0.02} />
      <Scramble text="COME FROM?" at={46.0} x={540} y={160} size={64} color={X.ink} />

      {/* normal sleep */}
      <Icon name="moon-stars" at={49.0} size={84} x={160} y={300} color={X.navy} rot={-8} />
      <Scramble text="NORMAL SLEEP" at={49.34} x={220} y={300} size={46} color={X.ink} align="left" />
      <Bar y={350} fat={83} fatAt={53.28} leanAt={57.3} />

      {/* one hour less */}
      <Icon name="alarm" at={60.76} size={84} x={160} y={600} color={X.pink} rot={-8} />
      <Scramble text="1 HOUR LESS" at={61.14} x={220} y={600} size={46} color={X.ink} align="left" />
      <div style={{position: 'absolute', inset: 0, scale: pulse, transformOrigin: '540px 710px'}}>
        <Bar y={650} fat={15} fatAt={67.92} leanAt={64.4} />
      </div>
      <Marker at={64.6} x={BX + BW - 60} y={800} dir="up" color={X.pink} />

      {/* legend */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 880, display: 'flex', justifyContent: 'center', gap: 60, opacity: tween(t, 53.3, 0.3)}}>
        {[
          [X.blue, 'BODY FAT'],
          [X.pink, 'LEAN MASS (MUSCLE)'],
        ].map(([c, s]) => (
          <div key={s} style={{display: 'flex', alignItems: 'center', gap: 16}}>
            <div style={{width: 34, height: 34, borderRadius: 9, background: c}} />
            <span style={{fontFamily: PIXEL, fontSize: 34, color: X.ink, scale: `${PIXEL_WIDE} 1`, transformOrigin: 'left', display: 'inline-block'}}>{s}</span>
          </div>
        ))}
      </div>
      <Label text="SAME WEIGHT LOST, SAME DIET" x={540} y={990} size={28} at={53.3} />
    </AbsoluteFill>
  );
};

// ===========================================================================
// Full-screen explainer scenes
// ===========================================================================
// "When you lose weight, it can come from one of two places: either from body fat or from lean body mass, like muscle."
const PlacesScene: React.FC = () => (
  <Stage w={L.places}>
    <Canvas keys={[{t: L.places.start, x: 540, y: 560, s: 1.25}, {t: 9.6, x: 540, y: 620, s: 1.15}, {t: 10.4, x: 540, y: 860, s: 1.0}, {t: L.places.end, x: 540, y: 880, s: 1.04}]}>
      <Icon name="scales" at={7.96} size={230} x={540} y={520} rot={0} />
      <Scramble text="WEIGHT LOST" at={8.2} x={540} y={690} size={56} color={X.ink} />
      <Scramble text="COMES FROM 2 PLACES" at={9.9} x={540} y={760} size={36} color={X.greyText} per={0.015} />
      <Dotted at={10.2} x1={470} y1={810} x2={290} y2={930} arrow />
      <Dotted at={10.4} x1={610} y1={810} x2={790} y2={930} arrow />
      <Icon name="fire" at={11.4} size={210} x={270} y={1060} color={X.blue} rot={-8} />
      <Scramble text="BODY FAT" at={11.45} x={270} y={1230} size={54} color={X.blue} />
      <Icon name="barbell" at={12.48} size={210} x={810} y={1060} color={X.pink} rot={8} />
      <Scramble text="LEAN MASS" at={12.52} x={810} y={1230} size={54} color={X.pink} />
      <Scramble text="LIKE MUSCLE" at={13.74} x={810} y={1295} size={36} color={X.greyText} />
      <Tick at={11.9} x={385} y={975} size={64} />
      <Cross at={13.0} x={925} y={975} size={64} />
    </Canvas>
  </Stage>
);

// "Researchers ... took two groups of people and put them on the exact same calorie deficit.
//  The only difference is that one group slept one hour less five nights per week and the other slept uninterrupted."
const StudyScene: React.FC = () => {
  const cols = [
    {x: 290, name: 'GROUP A', at: 25.24},
    {x: 790, name: 'GROUP B', at: 25.5},
  ];
  return (
    <Stage w={L.study}>
      <Canvas keys={[{t: L.study.start, x: 540, y: 540, s: 1.2}, {t: 24.6, x: 540, y: 600, s: 1.1}, {t: 26.6, x: 540, y: 780, s: 1.0}, {t: 30.4, x: 540, y: 830, s: 1.0}, {t: L.study.end, x: 540, y: 850, s: 1.05}]}>
        <Icon name="magnifying-glass" at={21.74} size={150} x={540} y={330} rot={-8} />
        <Scramble text="THE STUDY" at={22.0} x={540} y={450} size={60} color={X.ink} />
        {cols.map((c, i) => (
          <React.Fragment key={i}>
            <Icon name="users-three" at={c.at} size={190} x={c.x} y={640} color={i ? X.pink : X.blue} rot={i ? 6 : -6} />
            <Scramble text={c.name} at={c.at + 0.1} x={c.x} y={770} size={48} color={X.ink} />
          </React.Fragment>
        ))}
        {/* same deficit under both */}
        <Dotted at={27.4} x1={150} y1={850} x2={930} y2={850} />
        <Chip at={27.58} x={540} y={850} text="SAME CALORIE DEFICIT" bg={X.ink} size={40} />
        {/* group B: one hour less, 5 nights a week */}
        <Icon name="alarm" at={31.2} size={170} x={790} y={1030} color={X.pink} rot={8} />
        <Scramble text="-1 HOUR SLEEP" at={31.66} x={790} y={1170} size={46} color={X.pink} />
        <Scramble text="5 NIGHTS / WEEK" at={32.64} x={790} y={1232} size={36} color={X.greyText} />
        {/* group A: uninterrupted */}
        <Icon name="moon-stars" at={34.46} size={170} x={290} y={1030} color={X.navy} rot={-8} />
        <Scramble text="FULL SLEEP" at={34.76} x={290} y={1170} size={46} color={X.blue} />
        <Tick at={35.28} x={290} y={1250} size={60} />
        <Label text="8 WEEKS" x={540} y={1360} size={40} color={X.greyText} at={36.0} />
      </Canvas>
    </Stage>
  );
};

// "And your body can somewhat adapt to lower sleep over time, like in the case of new parents."
const AdaptScene: React.FC = () => {
  const t = useT();
  const X0 = 150;
  const X1 = 930;
  const Y0 = 600;
  const curve = (u: number) => Y0 + 260 * Math.sin(Math.min(1, u * 1.8) * Math.PI * 0.5) - 140 * Math.max(0, u - 0.45) / 0.55; // dips, then partly recovers
  const draw = tween(t, 85.38, 1.6, EASE_IN_OUT);
  const pts = Array.from({length: 61}, (_, i) => {
    const u = (i / 60) * draw;
    return `${i ? 'L' : 'M'}${(X0 + (X1 - X0) * u).toFixed(1)} ${curve(u).toFixed(1)}`;
  }).join(' ');
  return (
    <Stage w={L.adapt}>
      <Canvas keys={[{t: L.adapt.start, x: 540, y: 620, s: 1.15}, {t: 85.0, x: 540, y: 760, s: 1.0}, {t: L.adapt.end, x: 540, y: 820, s: 1.06}]}>
        {/* low battery while she sets it up, charges on "adapt" */}
        <Icon name="battery-low" at={L.adapt.start + 0.05} size={280} x={540} y={760} color={X.pink} rot={0} out={84.0} />
        <Icon name="battery-full" at={84.06} size={280} x={540} y={760} color={X.green} rot={0} out={84.95} />
        <Scramble text="YOUR BODY CAN" at={82.44} x={540} y={300} size={44} color={X.greyText} />
        <Scramble text="ADAPT" at={84.06} x={540} y={400} size={110} color={X.blue} />
        <Chip at={83.54} x={880} y={330} text="SOMEWHAT" bg={X.ink} size={34} />
        <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1} height={1}>
          <line x1={X0} y1={Y0 - 40} x2={X0} y2={960} stroke={X.grey} strokeWidth={5} strokeDasharray="0.1 12" strokeLinecap="round" opacity={tween(t, 85.0, 0.3)} />
          <line x1={X0} y1={960} x2={X1} y2={960} stroke={X.grey} strokeWidth={5} strokeDasharray="0.1 12" strokeLinecap="round" opacity={tween(t, 85.0, 0.3)} />
          {draw > 0 ? <path d={pts} fill="none" stroke={X.blue} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" /> : null}
        </svg>
        <Label text="SLEEP CUT" x={X0 + 100} y={Y0 - 60} size={32} color={X.pink} at={85.38} />
        <Label text="ADAPTING" x={X1 - 90} y={curve(1) - 60} size={32} color={X.blue} at={86.6} />
        <Label text="OVER TIME" x={X1 - 90} y={1000} size={30} at={86.28} />
        <Icon name="baby" at={88.34} size={200} x={540} y={1180} color={X.pink} rot={-6} />
        <Scramble text="NEW PARENTS" at={88.4} x={540} y={1330} size={54} color={X.ink} />
      </Canvas>
    </Stage>
  );
};

// "But if everything else is dialed in, sleep might be one thing holding you back."
const DialedScene: React.FC = () => {
  const rows = [
    {icon: 'bowl-food', text: 'NUTRITION', at: 90.3},
    {icon: 'barbell', text: 'TRAINING', at: 90.75},
    {icon: 'sneaker', text: 'STEPS', at: 91.2},
  ];
  return (
    <Stage w={L.dialed}>
      <Canvas keys={[{t: L.dialed.start, x: 540, y: 700, s: 1.12}, {t: 91.8, x: 540, y: 820, s: 1.0}, {t: L.dialed.end, x: 540, y: 860, s: 1.05}]}>
        <Scramble text="EVERYTHING ELSE" at={90.26} x={540} y={330} size={48} color={X.greyText} />
        <Scramble text="DIALED IN" at={91.36} x={540} y={420} size={92} color={X.ink} />
        {rows.map((r, i) => (
          <React.Fragment key={i}>
            <Icon name={r.icon} at={r.at} size={110} x={300} y={580 + i * 150} rot={-6} />
            <Scramble text={r.text} at={r.at + 0.05} x={400} y={580 + i * 150} size={52} color={X.ink} align="left" />
            <Tick at={r.at + 0.25} x={850} y={580 + i * 150} size={70} />
          </React.Fragment>
        ))}
        <Dotted at={92.0} x1={220} y1={1015} x2={860} y2={1015} />
        <Icon name="moon-stars" at={92.18} size={130} x={300} y={1130} color={X.pink} rot={-6} />
        <Scramble text="SLEEP" at={92.22} x={400} y={1130} size={64} color={X.pink} align="left" />
        <Cross at={93.98} x={850} y={1130} size={110} />
        <Scramble text="THE ONE THING" at={93.28} x={540} y={1290} size={46} color={X.pink} />
      </Canvas>
    </Stage>
  );
};

export const SleepScenes: React.FC = () => (
  <>
    <PlacesScene />
    <StudyScene />
    <AdaptScene />
    <DialedScene />
  </>
);

