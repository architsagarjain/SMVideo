import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {Canvas, Cross, Dotted, Icon, Marker, PIXEL, PIXEL_WIDE, QBox, Scramble, Tick, X, pop, useT} from '../explainer/kit';
import {Stage} from '../series/core';
import {Chip, Giant, Label, Meter} from '../series/parts';
import {EASE_IN, EASE_OUT, lerp, springAt, tween} from '../theme';
import {S} from './config';

/** Simple drawn potato (the icon set has none). */
const Potato: React.FC<{at: number; x: number; y: number; size: number}> = ({at, x, y, size}) => {
  const t = useT();
  if (t < at) return null;
  const p = pop(t, at);
  return (
    <svg viewBox="0 0 100 80" width={size} height={size * 0.8} style={{position: 'absolute', left: x - size / 2, top: y - size * 0.4, scale: Math.max(0, p), rotate: `${lerp(Math.min(p, 1), -15, -6)}deg`}}>
      <path d="M12 44 C 8 22, 34 8, 56 12 C 80 14, 96 30, 90 50 C 84 70, 54 76, 34 70 C 20 66, 14 58, 12 44 Z" fill={X.ink} />
      {[[34, 30], [58, 26], [70, 48], [44, 54], [26, 48]].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={2.6} fill={X.stage} />
      ))}
    </svg>
  );
};

// ===========================================================================
// Behind her head (wall washed)
// ===========================================================================
export const SabudanaBehind: React.FC = () => {
  const t = useT();
  const typed = 'GUIDE'.split('').filter((_, i) => t >= 65.12 + i * 0.09).length;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {/* "After going through my own weight loss journey, I've become very suspicious of the word 'light' on food." */}
      <Icon name="trend-down" at={0.2} size={190} x={180} y={760} color={X.blue} rot={-10} out={5.5} />
      <Scramble text="MY JOURNEY" at={2.32} x={180} y={890} size={40} color={X.blue} out={5.5} />
      <Icon name="eye" at={4.4} size={170} x={890} y={760} rot={10} out={5.5} />
      <Scramble text="SUSPICIOUS" at={4.4} x={890} y={880} size={40} color={X.pink} out={5.5} />
      <Giant text={'"LIGHT"'} at={5.62} y={300} size={300} color={X.pink} stagger={0.05} out={S.hook.end - 0.15} />

      {/* "Take sabudana during Navratri." */}
      <Giant text="SABUDANA" at={11.5} y={340} size={180} stagger={0.04} out={S.name.end - 0.15} />
      <Chip at={12.52} x={540} y={200} text="DURING NAVRATRI" bg={X.pink} size={46} out={S.name.end - 0.2} />

      {/* "my first question is, where is the protein coming from?" */}
      <Icon name="magnifying-glass" at={26.38} size={170} x={890} y={760} rot={10} out={29.75} />
      <Scramble text="FIRST QUESTION" at={26.56} x={890} y={880} size={36} color={X.greyText} out={29.75} />
      <Giant text="PROTEIN?" at={28.66} y={330} size={210} color={X.blue} stagger={0.04} out={29.8} />
      <Scramble text="WHERE IS THE" at={27.82} x={540} y={250} size={46} color={X.greyText} out={29.75} />

      {/* "Comment guide and I'll send you my free fat loss guide." */}
      <Chip at={64.88} x={540} y={150} text="COMMENT" />
      <Giant text="GUIDE" at={65.12} y={300} size={330} stagger={0.09} typed={typed}>
        <span style={{display: 'inline-block', width: 14, height: 250, marginLeft: 16, marginTop: 22, background: X.blue, opacity: t < 65.8 || Math.floor((t - 65.8) * 2.2) % 2 === 0 ? 1 : 0}} />
      </Giant>
      <Icon name="file-text" at={66.62} size={150} x={160} y={780} rot={-10} />
      <Scramble text="FREE" at={66.62} x={160} y={905} size={46} color={X.blue} />
      <Scramble text="FAT LOSS" at={67.0} x={890} y={780} size={46} color={X.pink} />
      <Scramble text="GUIDE" at={67.56} x={890} y={840} size={46} color={X.ink} />
    </AbsoluteFill>
  );
};

// ===========================================================================
// On top of the B-roll: "I wouldn't remove the food you enjoy before understanding the plate."
// ===========================================================================
export const SabudanaBrollOverlay = (t: number) => (
  <AbsoluteFill key="e">
    <Chip at={55.5} x={540} y={250} text="ENJOY IT" bg={X.blue} size={54} />
    <Scramble text="UNDERSTAND THE PLATE" at={56.46} x={540} y={360} size={56} color="#FFFFFF" per={0.02} />
  </AbsoluteFill>
);

// ===========================================================================
// Split layout: what each part of the khichdi adds
// ===========================================================================
export const SabudanaPanel: React.FC = () => {
  const t = useT();
  if (t < S.panel.start || t >= S.panel.end) return null;
  const enter = tween(t, S.panel.start + 0.2, 0.4);
  const rows = [
    {name: 'PEANUTS', at: 30.6, icon: 'grains', add: '+ SOME PROTEIN', addAt: 31.0, color: X.blue},
    {name: 'POTATOES', at: 34.42, icon: '', add: '+ CARBS', addAt: 34.84, color: X.ink},
    {name: 'COOKING FAT', at: 36.78, icon: 'drop', add: '+ ENERGY', addAt: 37.44, color: X.pink},
    {name: 'SOAKING', at: 39.24, icon: 'drop-half', add: '+ WATER', addAt: 40.4, color: X.blue},
  ];
  return (
    <AbsoluteFill style={{opacity: enter}}>
      <Scramble text="SABUDANA KHICHDI" at={30.3} x={540} y={90} size={44} color={X.greyText} />
      {rows.map((r, i) => {
        const y = 220 + i * 165;
        return (
          <React.Fragment key={i}>
            {r.icon === '' ? <Potato at={r.at} x={120} y={y} size={110} /> : <Icon name={r.icon} at={r.at} size={110} x={120} y={y} color={r.icon === 'drop' ? X.pink : X.ink} rot={-8} />}
            <Scramble text={r.name} at={r.at + 0.05} x={210} y={y} size={46} color={X.ink} align="left" />
            <Scramble text={r.add} at={r.addAt} x={980} y={y} size={46} color={r.color} align="right" />
          </React.Fragment>
        );
      })}
      <Scramble text="QUANTITY MATTERS" at={32.82} x={980} y={272} size={28} color={X.greyText} align="right" />
      <Scramble text="NOT PROTEIN" at={41.64} x={980} y={727} size={30} color={X.pink} align="right" />
      <Cross at={41.7} x={700} y={715} size={56} />
    </AbsoluteFill>
  );
};

// ===========================================================================
// Full-screen explainer scenes
// ===========================================================================
// "Because a meal can feel light and still give you very little protein."
const LightScene: React.FC = () => {
  const t = useT();
  const float = Math.sin((t - 8.4) * 2.4) * 18;
  return (
    <Stage w={S.light}>
      <Canvas keys={[{t: S.light.start, x: 540, y: 760, s: 1.2}, {t: 9.3, x: 540, y: 820, s: 1.1}, {t: 9.9, x: 540, y: 900, s: 1.0}]}>
        <Icon name="bowl-food" at={6.65} size={260} x={540} y={760} rot={-8} />
        <div style={{position: 'absolute', left: 0, top: 0, translate: `0px ${t > 8.4 ? -lerp(tween(t, 8.4, 1.4, EASE_OUT), 0, 150) + float : 0}px`}}>
          <Icon name="feather" at={8.4} size={170} x={780} y={560} color={X.blue} rot={30} />
        </div>
        <Scramble text="FEELS LIGHT" at={8.46} x={540} y={960} size={66} color={X.blue} />
        <Meter at={9.55} x={170} y={1080} w={740} value={0.06} color={X.pink} label="PROTEIN" text="VERY LITTLE" />
      </Canvas>
    </Stage>
  );
};

// "Plain, dry tapioca pearls contain roughly 89 grams of carbohydrate and only 0.2 grams of protein per 100 grams."
const PearlRain: React.FC<{start: number; n: number}> = ({start, n}) => {
  const t = useT();
  if (t < start) return null;
  return (
    <>
      {Array.from({length: n}, (_, i) => {
        const s = start + (i / n) * 1.1;
        if (t < s) return null;
        const dt = t - s;
        // land in a heap inside the bowl (bowl rim at y ~ 640, x 330..750)
        const tx = 360 + random(`px${i}`) * 360;
        const heap = 610 - Math.sin(((tx - 360) / 360) * Math.PI) * 70 - random(`py${i}`) * 40;
        const y = Math.min(heap, 425 + 0.5 * 1800 * dt * dt); // spawn under the title
        const x = tx + (random(`pd${i}`) - 0.5) * 80 * Math.max(0, 1 - dt * 2);
        const r = 13 + random(`pr${i}`) * 6;
        return <div key={i} style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: r, background: '#FFFFFF', border: `3px solid ${X.ink}`, opacity: Math.min(1, dt / 0.1)}} />;
      })}
    </>
  );
};

const PearlsScene: React.FC = () => {
  const t = useT();
  return (
    <Stage w={S.pearls}>
      <Canvas keys={[{t: S.pearls.start, x: 540, y: 560, s: 1.25}, {t: 16.0, x: 540, y: 620, s: 1.15}, {t: 16.7, x: 540, y: 960, s: 1.0}]}>
        <Scramble text="PLAIN, DRY" at={13.68} x={540} y={300} size={48} color={X.greyText} />
        <Scramble text="TAPIOCA PEARLS" at={14.54} x={540} y={370} size={64} color={X.ink} />
        <PearlRain start={14.6} n={70} />
        {/* bowl in front of the pearls */}
        <svg style={{position: 'absolute', left: 300, top: 600, opacity: tween(t, 14.4, 0.2)}} width={480} height={190} viewBox="0 0 480 190">
          <path d="M0 10 H480 C 470 120, 380 185, 240 185 C 100 185, 10 120, 0 10 Z" fill={X.ink} />
        </svg>
        <Label text="PER 100 G" x={540} y={700} size={40} color="#FFFFFF" at={22.0} />
        <Meter at={16.6} x={170} y={900} w={740} value={0.89} color={X.ink} label="CARBS" text="~89 G" dur={0.9} />
        <Meter at={19.5} x={170} y={1080} w={740} value={0.002} color={X.pink} label="PROTEIN" text="0.2 G" />
        <Marker at={19.75} x={186} y={1200} dir="up" color={X.pink} />
        <Scramble text="ONLY 0.2 G" at={19.7} x={540} y={1300} size={64} color={X.pink} />
        <Scramble text="PER 100 G" at={22.0} x={540} y={1380} size={44} color={X.greyText} />
      </Canvas>
    </Stage>
  );
};

// "If dairy fits your fasting practice, I'd build the meal with an appropriate serving of paneer or curd
//  and check what that portion actually provides."
const BuildScene: React.FC = () => {
  const t = useT();
  const fill = lerp(tween(t, 49.9, 1.0, EASE_OUT), 0.06, 0.55);
  return (
    <Stage w={S.build}>
      <Canvas keys={[{t: S.build.start, x: 540, y: 560, s: 1.15}, {t: 46.0, x: 540, y: 640, s: 1.05}, {t: 46.7, x: 540, y: 860, s: 1.0}, {t: 50.3, x: 540, y: 860, s: 1.0}, {t: 50.9, x: 540, y: 1180, s: 1.0}]}>
        <Scramble text="IF DAIRY FITS" at={43.42} x={540} y={420} size={60} color={X.ink} />
        <Scramble text="YOUR FASTING PRACTICE" at={44.76} x={540} y={500} size={42} color={X.greyText} per={0.02} />
        <Icon name="bowl-food" at={46.38} size={260} x={540} y={800} rot={0} />
        <Scramble text="BUILD THE MEAL" at={47.06} x={540} y={980} size={50} color={X.blue} />
        <Icon name="cheese" at={48.96} size={170} x={170} y={690} rot={-12} />
        <Scramble text="PANEER" at={48.96} x={170} y={810} size={44} color={X.ink} />
        <Dotted at={49.2} x1={270} y1={720} x2={400} y2={770} arrow />
        <Icon name="jar" at={49.76} size={160} x={910} y={690} rot={12} />
        <Scramble text="CURD" at={49.76} x={910} y={810} size={44} color={X.ink} />
        <Dotted at={49.9} x1={810} y1={720} x2={680} y2={770} arrow />
        {t >= 49.85 ? <Meter at={49.85} x={170} y={1080} w={740} value={fill} color={X.blue} label="PROTEIN" text="MORE" dur={0.01} /> : null}
        <Icon name="scales" at={50.64} size={210} x={540} y={1330} />
        <Scramble text="CHECK THE PORTION" at={51.5} x={540} y={1480} size={56} color={X.ink} />
        <Tick at={52.72} x={880} y={1475} size={64} />
      </Canvas>
    </Stage>
  );
};

export const SabudanaScenes: React.FC = () => (
  <>
    <LightScene />
    <PearlsScene />
    <BuildScene />
  </>
);
