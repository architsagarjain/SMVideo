import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useT} from '../explainer/kit';
import {EASE_IN, EASE_OUT, SERIF, lerp, tween} from '../theme';
import {popAt} from '../series/kit2';
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
      <div style={{position: 'absolute', left: 0, right: 0, top: 1150, display: 'flex', justifyContent: 'center'}}>
        <div style={{padding: '10px 34px', background: RED, borderRadius: 14, boxShadow: shadow, scale: lerp(Math.min(1.08, k), 2, 1), opacity: Math.min(1, k * 3)}}>
          <span style={{fontFamily: GROT, fontWeight: 800, fontSize: 92, color: '#FFFFFF', letterSpacing: 2}}>WRONG WAY?</span>
        </div>
      </div>
    </AbsoluteFill>
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
            <Slot img={r.img} n={r.n} label={r.name} style={{position: 'absolute', inset: 0}} />
            <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 360, background: 'linear-gradient(to top, rgba(0,0,0,0.72), rgba(0,0,0,0))'}} />
            <div style={{position: 'absolute', left: 54, right: 300, bottom: 46, display: 'flex', flexDirection: 'column', gap: 12, opacity: nameK, translate: `0 ${lerp(nameK, 16, 0)}px`}}>
              <div style={{display: 'flex', flexWrap: 'wrap', gap: 10}}>
                {r.tags.map((g) =>
                  t >= g.at ? (
                    <span key={g.text} style={{padding: '6px 16px', borderRadius: 999, background: BRAND, fontFamily: GROT, fontWeight: 800, fontSize: 30, color: '#FFFFFF', scale: lerp(Math.min(1.06, popAt(t, g.at)), 0.6, 1)}}>{g.text}</span>
                  ) : null,
                )}
              </div>
              <span style={{fontFamily: GROT, fontWeight: 800, fontSize: r.name.length > 20 ? 50 : 62, lineHeight: 1.05, color: '#FFFFFF', textShadow: '0 2px 10px rgba(0,0,0,0.5)'}}>{r.name}</span>
            </div>
            {t >= r.scoreAt ? (
              <div style={{position: 'absolute', right: 44, bottom: 40, width: 220, height: 220, borderRadius: '50%', background: r.good ? BRAND : '#F5A524', border: '8px solid #FFFFFF', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: shadow, scale: lerp(Math.min(1.1, k), 2.2, 1), opacity: Math.min(1, k * 3)}}>
                <span style={{fontFamily: GROT, fontWeight: 800, fontSize: 78, lineHeight: 1, color: '#FFFFFF', letterSpacing: -2}}>{r.score.split('/')[0]}</span>
                <span style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 34, color: '#FFFFFF'}}>{`out of ${r.score.split('/')[1]}`}</span>
              </div>
            ) : null}
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

/** "just comment DAHI and I'll send it to you" */
export const Cta: React.FC = () => {
  const t = useT();
  if (t < CTA_AT) return null;
  const k = popAt(t, CTA_AT + 0.6);
  const s = tween(t, CTA_AT, 0.35, EASE_OUT);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1110, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4}}>
        <div style={{opacity: s, translate: `0 ${lerp(s, 14, 0)}px`}}>
          <MixWord w="_comment" size={70} />
        </div>
        {t >= CTA_AT + 0.6 ? <MixWord w="DAHI" size={190} serif={false} style={{scale: lerp(Math.min(1.08, k), 1.8, 1), opacity: Math.min(1, k * 3)}} /> : null}
        <div style={{marginTop: 18, padding: '12px 30px', borderRadius: 999, background: BRAND, boxShadow: shadow, fontFamily: GROT, fontWeight: 800, fontSize: 40, color: '#FFFFFF', opacity: tween(t, CTA_AT + 1.1, 0.35)}}>The best way to eat dahi → your DMs</div>
      </div>
    </AbsoluteFill>
  );
};
export const HIDE = [{start: SPLIT.start - 0.05, end: SPLIT.end + 0.3}, {start: HOOK.at - 0.05, end: HOOK.end}, {start: CTA_AT - 0.3, end: 999}];
void INK;
