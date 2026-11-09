import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Base, Footage, GradeOverlay} from '../series/core';
import {useT} from '../explainer/kit';
import {ACCENT, CommentEnd, Cutaways, SHADOW_TXT, SerifCaps, TopShade, WHITE} from '../minimal/kit';
import {EASE_IN, EASE_OUT, SANS, SERIF, lerp, tween} from '../theme';
import {C, CUTS, DISHES, Dish, TM_M2, m2Config as cfg} from './config';

const vis = (t: number, w: {start: number; end: number}) => (t < w.start || t > w.end + 0.25 ? 0 : tween(t, w.start, 0.3, EASE_OUT) * (1 - tween(t, w.end - 0.05, 0.25, EASE_IN)));
const rise = (t: number, at: number): React.CSSProperties => {
  const p = tween(t, at, 0.4, EASE_OUT);
  return {opacity: p, translate: `0 ${lerp(p, 18, 0)}px`, filter: `blur(${(1 - p) * 6}px)`};
};
const Small: React.FC<{children: React.ReactNode; color?: string}> = ({children, color = 'rgba(255,255,255,0.8)'}) => (
  <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 28, letterSpacing: 6, color, textShadow: SHADOW_TXT, textTransform: 'uppercase'}}>{children}</div>
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
      <div style={{position: 'absolute', left: 0, right: 0, top: 290, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 110, color: WHITE, textShadow: SHADOW_TXT, ...rise(t, 11.66)}}>
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
          <div style={{fontFamily: SERIF, fontSize: 52, lineHeight: 1.05, color: WHITE, textShadow: SHADOW_TXT, minHeight: 110, display: 'flex', alignItems: 'center', whiteSpace: 'pre-line'}}>{d.before}</div>
          <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 92, lineHeight: 1.05, color: WHITE, textShadow: SHADOW_TXT, textDecoration: swap > 0.5 ? 'line-through' : 'none', textDecorationThickness: 6}}>{d.ratio}</div>
        </div>
        {/* arrow */}
        <div style={{alignSelf: 'center', marginTop: 60, fontFamily: SANS, fontWeight: 700, fontSize: 64, color: WHITE, textShadow: SHADOW_TXT, opacity: swap}}>→</div>
        {/* after */}
        <div style={{width: 420, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', ...rise(t, d.swapAt)}}>
          <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 50, lineHeight: 1.05, color: ACCENT, textShadow: SHADOW_TXT, minHeight: 110, display: 'flex', alignItems: 'center', whiteSpace: 'pre-line'}}>{d.after}</div>
          <div style={{fontFamily: SANS, fontWeight: 800, fontSize: long ? 64 : 92, lineHeight: long ? 1.45 : 1.05, color: ACCENT, textShadow: SHADOW_TXT, ...rise(t, d.nowAt)}}>{d.result}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const LINED = CUTS.filter((c) => c.line);
const Scene: React.FC = () => (
  <>
    <Footage cfg={cfg} />
    <GradeOverlay cfg={cfg} />
    <TopShade wins={[C.ratio, ...DISHES]} reach={42} />
    <Ratio />
    {DISHES.map((d) => (
      <DishCard key={d.n} d={d} />
    ))}
    <Cutaways cuts={CUTS} tm={TM_M2} dir="m2" />
    <CommentEnd start={C.cta.start} word="BREAKFAST" wordAt={117.2} note="Full list of swaps → your DMs" noteAt={118.32} size={128} />
    <SerifCaps cfg={cfg} hide={[...LINED, {start: C.cta.start + 0.1, end: 999}]} />
  </>
);

export const M2Reel: React.FC = () => (
  <Base cfg={cfg}>
    <Scene />
  </Base>
);
