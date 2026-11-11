import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Base, Footage, GradeOverlay, Subject} from '../series/core';
import {CommentSheet, Dolly, InkWipe, Orbit, OrbitItem} from '../minimal/fx';
import {useT} from '../explainer/kit';
import {ACCENT, Cutaways, DiveWord, SHADOW_TXT, SerifCaps, TopShade, WHITE, outline} from '../minimal/kit';
import {EASE_IN, EASE_OUT, SANS, SERIF, lerp, tween} from '../theme';
import {C, CUTS, DISHES, Dish, TM_M2, m2Config as cfg} from './config';

const vis = (t: number, w: {start: number; end: number}) => (t < w.start || t > w.end + 0.25 ? 0 : tween(t, w.start, 0.3, EASE_OUT) * (1 - tween(t, w.end - 0.05, 0.25, EASE_IN)));
const rise = (t: number, at: number): React.CSSProperties => {
  const p = tween(t, at, 0.4, EASE_OUT);
  return {opacity: p, translate: `0 ${lerp(p, 18, 0)}px`, filter: `blur(${(1 - p) * 6}px)`};
};
const Small: React.FC<{children: React.ReactNode; color?: string}> = ({children, color = WHITE}) => (
  <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 32, letterSpacing: 6, color, ...outline(32), textTransform: 'uppercase'}}>{children}</div>
);

/** "carb to protein ratio of about 6 to 1": six carb blocks against one protein block. */
const Ratio: React.FC = () => {
  const t = useT();
  const o = vis(t, C.ratio);
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 110, textAlign: 'center', ...rise(t, 9.98)}}>
        <Small>Carbs : Protein</Small>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 170, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 14}}>
        {Array.from({length: 7}, (_, i) => {
          const protein = i === 6;
          const p = tween(t, 10.4 + i * 0.12, 0.3, EASE_OUT);
          return (
            <div key={i} style={{width: 92, height: 92, marginLeft: protein ? 40 : 0, borderRadius: 14, background: protein ? ACCENT : 'rgba(255,255,255,0.9)', boxShadow: SHADOW_TXT, opacity: p, translate: `0 ${lerp(p, 20, 0)}px`}} />
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 290, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 110, color: WHITE, ...outline(110), ...rise(t, 11.66)}}>
        6 : 1
      </div>
    </AbsoluteFill>
  );
};

/** Per dish: before (dish + ratio) -> after (the swap + new ratio). */
const DishCard: React.FC<{d: Dish}> = ({d}) => {
  const t = useT();
  const o = vis(t, d);
  if (o <= 0) return null;
  const swap = tween(t, d.swapAt, 0.4, EASE_OUT);
  const long = d.result.length > 8;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 96, textAlign: 'center', ...rise(t, d.start)}}>
        <Small>{`Swap ${d.n} of 6`}</Small>
      </div>
      <div style={{position: 'absolute', left: 40, right: 40, top: 150, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 26}}>
        {/* before */}
        <div style={{width: 420, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', opacity: lerp(swap, 1, 0.55), ...rise(t, d.start + 0.05)}}>
          <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 44, lineHeight: 1.1, color: WHITE, ...outline(44), minHeight: 110, display: 'flex', alignItems: 'center', whiteSpace: 'pre-line'}}>{d.before}</div>
          <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 92, lineHeight: 1.05, color: WHITE, ...outline(92), textDecoration: swap > 0.5 ? 'line-through' : 'none', textDecorationThickness: 6}}>{d.ratio}</div>
        </div>
        {/* arrow */}
        <div style={{alignSelf: 'center', marginTop: 60, fontFamily: SANS, fontWeight: 700, fontSize: 64, color: WHITE, ...outline(64), opacity: swap}}>→</div>
        {/* after */}
        <div style={{width: 420, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', ...rise(t, d.swapAt)}}>
          <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 42, lineHeight: 1.1, color: ACCENT, ...outline(42), minHeight: 110, display: 'flex', alignItems: 'center', whiteSpace: 'pre-line'}}>{d.after}</div>
          <div style={{fontFamily: SANS, fontWeight: 800, fontSize: long ? 64 : 92, lineHeight: long ? 1.45 : 1.05, color: ACCENT, ...outline(long ? 64 : 92), ...rise(t, d.nowAt)}}>{d.result}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Ink floods the screen, a cream card says the line, then the ink recedes back to her. */
const PlateCard: React.FC = () => {
  const t = useT();
  const w = C.card;
  if (t < 30.05 || t > 31.95) return null;
  const words: [string, number][] = [["JUST", 30.16], ["CHANGE", 30.2], ["WHAT'S", 30.62], ['ON', 31.1], ['YOUR', 31.36], ['PLATE', 31.52]];
  return (
    <AbsoluteFill style={{background: '#EEEBE4', opacity: tween(t, 30.05, 0.08)}}>
      <div style={{position: 'absolute', left: 60, right: 60, top: 960, translate: '0 -50%', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: 26, rowGap: 6}}>
        {words.map(([wd, at], i) => (
          <React.Fragment key={wd}>
            <DiveWord word={wd} at={at} size={wd === 'PLATE' ? 124 : 88} color="#141414" />
            {i === 2 ? <div style={{flexBasis: '100%', height: 0}} /> : null}
          </React.Fragment>
        ))}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 32, letterSpacing: 8, color: '#8A857C', opacity: tween(t, 30.1, 0.3)}}>{w.start > 0 ? 'THE FIX' : ''}</div>
    </AbsoluteFill>
  );
};

const LINED = CUTS.filter((c) => c.line);
const RING = {cx: 540, cy: 1270, rx: 430, ry: 92};
const DISHES_NAMED: OrbitItem[] = [
  {label: 'Poha', at: 3.66},
  {label: 'Upma', at: 4.34},
  {label: 'Idli', at: 5.06},
  {label: 'Dosa', at: 5.7},
  {label: 'Sandwich', at: 6.38},
];
const Scene: React.FC = () => (
  <>
    <Dolly win={C.dolly}>
      <Footage cfg={cfg} />
    </Dolly>
    <GradeOverlay cfg={cfg} />
    <TopShade wins={[C.ratio, ...DISHES]} reach={42} />
    <Ratio />
    {DISHES.map((d) => (
      <DishCard key={d.n} d={d} />
    ))}
    <Orbit win={C.orbit} items={DISHES_NAMED} front={false} ring={RING} />
    <Subject cfg={cfg} />
    <Orbit win={C.orbit} items={DISHES_NAMED} front ring={RING} />
    <Cutaways cuts={CUTS} tm={TM_M2} dir="m2" />
    <InkWipe at={29.55} tm={TM_M2} src="m2/ink_wipe.webm" />
    <PlateCard />
    <InkWipe at={31.88} tm={TM_M2} src="m2/ink_out.webm" />
    <CommentSheet
      start={C.cta.start}
      word="BREAKFAST"
      typeAt={117.2}
      replyAt={118.4}
      pinned={<>Comment <b>BREAKFAST</b> and I'll send you the complete list of swaps</>}
      reply="Sent! The full list is in your DMs ✓"
      top={1200}
    />
    <SerifCaps cfg={cfg} hide={[...LINED, C.orbit, {start: 29.9, end: 32.4}, {start: C.cta.start + 0.1, end: 999}]} />
  </>
);

export const M2Reel: React.FC = () => (
  <Base cfg={cfg}>
    <Scene />
  </Base>
);
