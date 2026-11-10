import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Base, Footage, GradeOverlay} from '../series/core';
import {useT} from '../explainer/kit';
import {ACCENT, Cutaways, SHADOW_TXT, SerifCaps, TopShade, WHITE, outline} from '../minimal/kit';
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

/** Ending: the breakfast menu - every dish with its old ratio struck out and the new one - then "Comment BREAKFAST". */
const MENU = [
  {d: 'Dosa', old: '6 : 1', now: '1 : 1'},
  {d: 'Poha', old: '6 : 1', now: '1.5 : 1'},
  {d: 'Idli', old: '4.5 : 1', now: '1.1 : 1'},
  {d: 'Upma', old: '6 : 1', now: '1.1 : 1'},
  {d: 'Sandwich', old: '4 : 1', now: 'More protein'},
  {d: 'Aloo Paratha', old: '7 : 1', now: '1.5 : 1'},
];
const Menu: React.FC = () => {
  const t = useT();
  const s0 = C.cta.start;
  if (t < s0) return null;
  const k = tween(t, s0, 0.4, EASE_OUT);
  const word = tween(t, 117.2, 0.35, EASE_OUT);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 110, right: 110, top: 40, background: '#FBF8F2', borderRadius: 26, padding: '18px 40px 20px', boxShadow: '0 30px 60px -24px rgba(0,0,0,0.5)', opacity: k, translate: `0 ${lerp(k, -30, 0)}px`, color: '#141414'}}>
        <div style={{textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 44, lineHeight: 1.1}}>The breakfast menu</div>
        <div style={{height: 2, background: '#141414', margin: '12px 0 4px'}} />
        {MENU.map((m, i) => {
          const p = tween(t, s0 + 0.12 + i * 0.1, 0.25, EASE_OUT);
          return (
            <div key={m.d} style={{display: 'flex', alignItems: 'center', height: 44, borderBottom: '1px dashed #D6D0C4', opacity: p, translate: `${lerp(p, -14, 0)}px 0`, fontFamily: SANS}}>
              <span style={{flex: 1, fontWeight: 800, fontSize: 32}}>{m.d}</span>
              <span style={{width: 130, textAlign: 'right', fontWeight: 700, fontSize: 28, color: '#A39D92', textDecoration: 'line-through', textDecorationThickness: 3}}>{m.old}</span>
              <span style={{width: 210, textAlign: 'right', fontWeight: 800, fontSize: m.now.length > 8 ? 26 : 32, color: '#141414'}}>
                <span style={{padding: '2px 12px', borderRadius: 8, background: ACCENT}}>{m.now}</span>
              </span>
            </div>
          );
        })}
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, marginTop: 12}}>
          <span style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 50}}>Comment</span>
          <span style={{padding: '4px 24px', borderRadius: 14, background: '#141414', color: '#FFFFFF', fontFamily: SANS, fontWeight: 800, fontSize: 58, letterSpacing: 3, opacity: word, scale: lerp(word, 0.7, 1)}}>BREAKFAST</span>
        </div>
        <div style={{textAlign: 'center', marginTop: 8, fontFamily: SANS, fontWeight: 700, fontSize: 26, color: '#8A857C', opacity: tween(t, 118.32, 0.35)}}>The full list of swaps comes to your DMs</div>
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
    <Menu />
    <SerifCaps cfg={cfg} hide={[...LINED, {start: C.cta.start + 0.1, end: 999}]} />
  </>
);

export const M2Reel: React.FC = () => (
  <Base cfg={cfg}>
    <Scene />
  </Base>
);
