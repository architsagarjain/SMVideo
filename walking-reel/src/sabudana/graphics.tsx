import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {Canvas, Cross, Dotted, Icon, Marker, PIXEL, PIXEL_WIDE, QBox, Scramble, Tick, X, pop, useT} from '../explainer/kit';
import {Stage} from '../series/core';
import {Chip, Giant, Label, Meter, Photo} from '../series/parts';
import {ClockSticker, CountSticker, HookVignette, IconSticker, Pill, PhotoCard, Stamp, Sticker, Sweep} from '../series/hook';

import {EASE_IN, EASE_OUT, lerp, springAt, tween} from '../theme';
import {S} from './config';

// ===========================================================================
// Behind her head (wall washed)
// ===========================================================================
export const SabudanaBehind: React.FC = () => {
  const t = useT();
  const typed = 'GUIDE'.split('').filter((_, i) => t >= 65.12 + i * 0.09).length;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {/* "After going through my own weight loss journey, I've become very suspicious of the word 'light' on food." */}
      {/* "Take sabudana during Navratri." */}
      <Giant text="SABUDANA" at={11.5} y={340} size={180} stagger={0.04} out={S.name.end - 0.15} />
      <Photo src="sabudana/photos/pearls_hand.jpg" at={11.6} x={185} y={790} d={250} rot={-8} out={S.name.end - 0.2} />
      <Photo src="sabudana/photos/khichdi2.jpg" at={12.52} x={895} y={790} d={250} rot={8} out={S.name.end - 0.2} />
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
    {name: 'PEANUTS', at: 30.6, photo: 'peanuts', add: '+ SOME PROTEIN', addAt: 31.0, color: X.blue},
    {name: 'POTATOES', at: 34.42, photo: 'potato', add: '+ CARBS', addAt: 34.84, color: X.ink},
    {name: 'COOKING FAT', at: 36.78, photo: 'ghee', add: '+ ENERGY', addAt: 37.44, color: X.pink},
    {name: 'SOAKING', at: 39.24, photo: 'soaked', add: '+ WATER', addAt: 40.4, color: X.blue},
  ];
  return (
    <AbsoluteFill style={{opacity: enter}}>
      <Scramble text="SABUDANA KHICHDI" at={30.3} x={540} y={90} size={44} color={X.greyText} />
      {rows.map((r, i) => {
        const y = 220 + i * 165;
        return (
          <React.Fragment key={i}>
            <Photo src={`sabudana/photos/${r.photo}.jpg`} at={r.at} x={120} y={y} d={128} rot={-6} />
            <Scramble text={r.name} at={r.at + 0.05} x={210} y={y} size={46} color={X.ink} align="left" />
            <Scramble text={r.add} at={r.addAt} x={980} y={y} size={46} color={r.color} align="right" />
          </React.Fragment>
        );
      })}
      <Scramble text="QUANTITY MATTERS" at={32.82} x={980} y={272} size={28} color={X.greyText} align="right" />
      <Scramble text="NOT PROTEIN" at={41.64} x={980} y={767} size={30} color={X.pink} align="right" />
      <Cross at={41.7} x={745} y={765} size={42} />
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
        <Photo src="sabudana/photos/khichdi.jpg" at={6.65} x={540} y={760} d={330} rot={-6} />
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
const PearlsScene: React.FC = () => {
  const t = useT();
  return (
    <Stage w={S.pearls}>
      <Canvas keys={[{t: S.pearls.start, x: 540, y: 560, s: 1.25}, {t: 16.0, x: 540, y: 620, s: 1.15}, {t: 16.7, x: 540, y: 960, s: 1.0}, {t: 17.4, x: 540, y: 960, s: 1.0}, {t: S.pearls.end, x: 540, y: 1040, s: 1.12}]}>
        <Scramble text="PLAIN, DRY" at={13.68} x={540} y={300} size={48} color={X.greyText} />
        <Scramble text="TAPIOCA PEARLS" at={14.54} x={540} y={370} size={64} color={X.ink} />
        <Photo src="sabudana/photos/pearls.jpg" at={14.54} x={540} y={640} d={430} rot={-4} />
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
      <Canvas keys={[{t: S.build.start, x: 540, y: 470, s: 1.3}, {t: 46.0, x: 540, y: 640, s: 1.05}, {t: 46.7, x: 540, y: 860, s: 1.0}, {t: 50.3, x: 540, y: 830, s: 1.07}, {t: 50.9, x: 540, y: 1180, s: 1.0}, {t: S.build.end, x: 540, y: 1230, s: 1.08}]}>
        <Icon name="drop" at={43.0} size={120} x={540} y={290} color={X.blue} />
        <Scramble text="IF DAIRY FITS" at={43.42} x={540} y={420} size={60} color={X.ink} />
        <Scramble text="YOUR FASTING PRACTICE" at={44.76} x={540} y={500} size={42} color={X.greyText} per={0.02} />
        <Photo src="sabudana/photos/khichdi.jpg" at={46.38} x={540} y={790} d={280} rot={4} />
        <Scramble text="BUILD THE MEAL" at={47.06} x={540} y={980} size={50} color={X.blue} />
        <Photo src="sabudana/photos/paneer.jpg" at={48.96} x={170} y={680} d={190} rot={-10} />
        <Scramble text="PANEER" at={48.96} x={170} y={810} size={44} color={X.ink} />
        <Dotted at={49.2} x1={270} y1={720} x2={400} y2={770} arrow />
        <Photo src="sabudana/photos/curd.jpg" at={49.76} x={910} y={680} d={190} rot={10} />
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

// ===========================================================================
// Hook (first screen): her real footage, the plate as a photo card beside her.
// "After going through my own weight loss journey, I've become very suspicious of the word 'light' on food."
// ===========================================================================
export const SabudanaHook: React.FC = () => {
  const end = S.hook.end - 0.2;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <HookVignette end={S.hook.end} />
      <Sticker at={0.7} out={end} x={862} y={860} rot={7}>
        <PhotoCard src="sabudana/photos/khichdi.jpg" w={250} caption="FASTING FOOD">
          <Stamp at={5.62} text={'"LIGHT"?'} color={X.pink} size={58} />
        </PhotoCard>
      </Sticker>
      <Sweep at={4.4} from={[660, 700]} to={[885, 800]} size={170} out={5.55} />
      <Sticker at={4.42} out={end} x={200} y={850} rot={-8}>
        <IconSticker icon="eye" color={X.ink} d={190} label="SUSPICIOUS" labelBg={X.pink} />
      </Sticker>
    </AbsoluteFill>
  );
};
