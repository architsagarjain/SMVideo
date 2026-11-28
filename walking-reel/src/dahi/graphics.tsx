import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {useT} from '../explainer/kit';
import {EASE_IN, EASE_OUT, SERIF, lerp, tween} from '../theme';
import {ANTON, popAt} from '../series/kit2';
import {BRAND, GROT, MixWord} from '../ads/extras';
import {Slot} from '../b3/slot';
import {CTA_AT, HOOK, RATINGS, SPLIT} from './config';

const INK = '#141414';
const RED = '#E5484D';
const shadow = '0 18px 36px -14px rgba(0,0,0,0.55)';

/** "...eating your dahi the WRONG way?" */
export const Hook: React.FC = () => {
  const t = useT();
  if (t < HOOK.at || t > HOOK.end + 0.3) return null;
  const k = popAt(t, HOOK.at);
  const o = 1 - tween(t, HOOK.end, 0.25, EASE_IN);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 330, display: 'flex', justifyContent: 'center'}}>
        <div style={{padding: '10px 34px', background: RED, borderRadius: 14, boxShadow: shadow, scale: lerp(Math.min(1.08, k), 2, 1), opacity: Math.min(1, k * 3)}}>
          <span style={{fontFamily: GROT, fontWeight: 800, fontSize: 92, color: '#FFFFFF', letterSpacing: 2}}>WRONG WAY?</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Dish photo, set lower in the panel: the frame extends upward with a soft blurred copy of the photo's top. */
const DROP = 150;
const DishPhoto: React.FC<{img: string; t: number; start: number}> = ({img, t, start}) => {
  const z = 1.06 + 0.04 * tween(t, start, 4, EASE_OUT); // gentle push-in while it is on screen
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: '#2A231D'}}>
      <Img src={staticFile(img)} style={{position: 'absolute', left: -40, top: -60, width: 1160, height: 780, objectFit: 'cover', objectPosition: 'top', filter: 'blur(28px) brightness(0.92)', scale: '1.15'}} />
      <Img src={staticFile(img)} style={{position: 'absolute', left: -60, top: DROP, width: 1200, height: 800, objectFit: 'cover', scale: `${z}`, transformOrigin: '50% 30%',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0px, black 110px)', maskImage: 'linear-gradient(to bottom, transparent 0px, black 110px)'}} />
    </div>
  );
};

/** Rating card: count-up score over a 10-segment meter. Over 10 ("1000/10") the meter overflows and an OFF THE CHARTS stamp lands. */
const ScoreCard: React.FC<{t: number; at: number; score: string; good: boolean}> = ({t, at, score, good}) => {
  const [num, den] = score.split('/').map(Number);
  const k = popAt(t, at);
  const c = tween(t, at, 0.55, EASE_OUT);
  const over = num > den;
  const shown = Math.round(over ? lerp(c, 0, num) : lerp(c, 0, num));
  const col = good ? '#2FA84F' : '#E4A11B';
  const fill = over ? den : num;
  const stamp = over ? popAt(t, at + 0.6) : 0;
  const shake = over && t > at + 0.55 && t < at + 0.85 ? Math.sin((t - at) * 90) * 5 : 0;
  return (
    <div style={{position: 'absolute', right: 40, bottom: 40, width: 330, borderRadius: 26, background: '#FFFFFF', boxShadow: '0 22px 44px -16px rgba(0,0,0,0.6)', padding: '20px 24px 22px', boxSizing: 'border-box',
      scale: lerp(Math.min(1.05, k), 0.6, 1), opacity: Math.min(1, k * 3), translate: `${shake}px ${lerp(Math.min(1, k), 40, 0)}px`, transformOrigin: 'right bottom'}}>
      <div style={{fontFamily: GROT, fontWeight: 700, fontSize: 20, letterSpacing: 4, color: '#8A847A'}}>MY SCORE</div>
      <div style={{display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 2}}>
        <span style={{fontFamily: ANTON, fontSize: over ? 104 : 120, lineHeight: 1, color: col, fontVariantNumeric: 'tabular-nums'}}>{shown}</span>
        <span style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 46, color: INK}}>{`/ ${den}`}</span>
      </div>
      <div style={{display: 'flex', gap: 5, marginTop: 12}}>
        {Array.from({length: den}).map((_, i) => {
          const on = c * den > i && i < fill;
          return <div key={i} style={{flex: 1, height: 16, borderRadius: 5, background: on ? col : '#E9E4DB', scale: on ? 1 : 0.92}} />;
        })}
      </div>
      {over ? (
        <div style={{position: 'absolute', left: -24, top: -62, padding: '8px 16px', borderRadius: 10, background: RED, color: '#FFFFFF', fontFamily: GROT, fontWeight: 800, fontSize: 26, letterSpacing: 1.5, rotate: '-8deg',
          boxShadow: '0 10px 22px -8px rgba(0,0,0,0.6)', scale: lerp(Math.min(1.08, stamp), 2.2, 1), opacity: Math.min(1, stamp * 3)}}>OFF THE CHARTS</div>
      ) : null}
    </div>
  );
};

/** Split screen: the dish photo on top, her below; name, score and benefit tags on the photo. */
export const RatingPanel: React.FC = () => {
  const t = useT();
  if (t < SPLIT.start - 0.01 || t > SPLIT.end + 0.4) return null;
  const inK = tween(t, SPLIT.start, 0.4, EASE_OUT);
  const outK = tween(t, SPLIT.end, 0.4, EASE_OUT);
  const H = SPLIT.panel;
  return (
    <AbsoluteFill style={{clipPath: `inset(0 0 ${1920 - H * Math.min(inK, 1 - outK)}px 0)`}}>
      {RATINGS.map((r, i) => {
        if (t < r.start - 0.01 || t > r.end + 0.45) return null;
        const sl = i === 0 ? 1 : tween(t, r.start, 0.45, EASE_OUT); // next photo slides in over the last
        const k = popAt(t, r.scoreAt);
        const nameK = tween(t, r.start + 0.15, 0.35, EASE_OUT);
        return (
          <div key={r.n} style={{position: 'absolute', left: 0, top: 0, width: 1080, height: H, translate: `${lerp(sl, 1080, 0)}px 0`}}>
            {r.img ? <DishPhoto img={r.img} t={t} start={r.start} /> : <Slot img={r.img} n={r.n} label={r.name} style={{position: 'absolute', inset: 0}} />}
            <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 360, background: 'linear-gradient(to top, rgba(0,0,0,0.72), rgba(0,0,0,0))'}} />
            <div style={{position: 'absolute', left: 54, right: 380, bottom: 46, display: 'flex', flexDirection: 'column', gap: 12, opacity: nameK, translate: `0 ${lerp(nameK, 16, 0)}px`}}>
              <div style={{display: 'flex', flexWrap: 'wrap', gap: 10}}>
                {r.tags.map((g) =>
                  t >= g.at ? (
                    <span key={g.text} style={{padding: '6px 16px', borderRadius: 999, background: BRAND, fontFamily: GROT, fontWeight: 800, fontSize: 30, color: '#FFFFFF', scale: lerp(Math.min(1.06, popAt(t, g.at)), 0.6, 1)}}>{g.text}</span>
                  ) : null,
                )}
              </div>
              <span style={{fontFamily: GROT, fontWeight: 800, fontSize: r.name.length > 20 ? 50 : 62, lineHeight: 1.05, color: '#FFFFFF', textShadow: '0 2px 10px rgba(0,0,0,0.5)'}}>{r.name}</span>
            </div>
            {t >= r.scoreAt ? <ScoreCard t={t} at={r.scoreAt} score={r.score} good={r.good} /> : null}
            <div style={{position: 'absolute', left: 54, top: 290, padding: '6px 14px', background: 'rgba(20,20,20,0.75)', borderRadius: 8}}>
              <span style={{fontFamily: GROT, fontWeight: 800, fontSize: 26, letterSpacing: 3, color: '#FFFFFF'}}>{`${r.n} / 5`}</span>
            </div>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 0, right: 0, top: H - 6, height: 6, background: '#FFFFFF'}} />
    </AbsoluteFill>
  );
};

/** "just comment DAHI and I'll send it to you": DAHI rises behind her head (config.behind); "comment" above, the pill on her chest. */
export const Cta: React.FC = () => {
  const t = useT();
  if (t < CTA_AT) return null;
  const s = tween(t, CTA_AT, 0.35, EASE_OUT);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, display: 'flex', justifyContent: 'center', opacity: s, translate: `0 ${lerp(s, 14, 0)}px`}}>
        <MixWord w="_comment" size={84} color={INK} style={{textShadow: 'none'}} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1540, display: 'flex', justifyContent: 'center'}}>
        <div style={{padding: '14px 32px', borderRadius: 999, background: BRAND, boxShadow: shadow, fontFamily: GROT, fontWeight: 800, fontSize: 40, color: '#FFFFFF', opacity: tween(t, CTA_AT + 1.1, 0.35), translate: `0 ${lerp(tween(t, CTA_AT + 1.1, 0.35, EASE_OUT), 16, 0)}px`}}>The best way to eat dahi → your DMs</div>
      </div>
    </AbsoluteFill>
  );
};
export const HIDE = [{start: SPLIT.start - 0.05, end: SPLIT.end + 0.3}, {start: HOOK.at - 0.05, end: HOOK.end}, {start: CTA_AT - 0.3, end: 999}];
