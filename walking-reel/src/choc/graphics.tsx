import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useT} from '../explainer/kit';
import {EASE_IN, EASE_OUT, SERIF, lerp, tween} from '../theme';
import {ANTON, popAt} from '../series/kit2';
import {BRAND, GROT, MixWord} from '../ads/extras';
import {Slot} from '../b3/slot';
import {CTA_AT, INTRO, MYTH, RANKS} from './config';

const INK = '#141414';
const RED = '#E5484D';
const GOLD = '#E4A11B';
const COCOA = '#3B2418';
const shadow = '0 20px 40px -16px rgba(0,0,0,0.55)';
const vis = (t: number, w: {start: number; end: number}) => (t < w.start || t > w.end + 0.25 ? 0 : tween(t, w.start, 0.3, EASE_OUT) * (1 - tween(t, w.end - 0.1, 0.25, EASE_IN)));

/** "Ranking top 10 dark chocolate brands in India" + the four criteria. */
export const Intro: React.FC = () => {
  const t = useT();
  const o = vis(t, INTRO);
  if (o <= 0) return null;
  const k = popAt(t, 0.15);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 290, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 18, scale: lerp(Math.min(1.05, k), 0.7, 1), opacity: Math.min(1, k * 3)}}>
          <span style={{fontFamily: ANTON, fontSize: 150, lineHeight: 1, color: '#FFFFFF', textShadow: '0 6px 24px rgba(0,0,0,0.45)'}}>TOP 10</span>
        </div>
        <div style={{opacity: tween(t, 1.44, 0.35), translate: `0 ${lerp(tween(t, 1.44, 0.35, EASE_OUT), 14, 0)}px`}}>
          <MixWord w="_dark chocolates in India" size={64} />
        </div>
        <div style={{marginTop: 18, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, maxWidth: 920}}>
          {INTRO.crit.map((c) =>
            t >= c.at ? (
              <span key={c.text} style={{padding: '8px 20px', borderRadius: 999, background: 'rgba(255,255,255,0.95)', boxShadow: shadow, fontFamily: GROT, fontWeight: 800, fontSize: 32, color: COCOA, scale: lerp(Math.min(1.06, popAt(t, c.at)), 0.5, 1)}}>{c.text}</span>
            ) : null,
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** One card per rank: pack shot on the left, rank / brand / cacao % / pros and cons on the right. */
export const RankCards: React.FC = () => {
  const t = useT();
  return (
    <>
      {RANKS.map((r) => {
        const o = vis(t, {start: r.start, end: r.end});
        if (o <= 0) return null;
        const k = tween(t, r.start, 0.45, EASE_OUT);
        const rk = popAt(t, r.at);
        const bk = tween(t, r.brandAt, 0.35, EASE_OUT);
        const top = r.r === 1;
        return (
          <AbsoluteFill key={r.r} style={{opacity: o}}>
            <div style={{position: 'absolute', left: 30, right: 30, top: 170, height: 520, borderRadius: 34, background: 'rgba(255,255,255,0.97)', boxShadow: `${top ? `0 0 0 6px ${GOLD}, ` : ''}${shadow}`, display: 'flex', gap: 24, padding: 20, boxSizing: 'border-box', translate: `${lerp(k, 120, 0)}px 0`}}>
              <Slot img={r.img} n={`${11 - r.r}`} label={`${r.brand}${r.pct ? ' ' + r.pct : ''} pack shot`} style={{width: 440, height: 480, borderRadius: 22, flexShrink: 0}} />
              <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10, minWidth: 0}}>
                <div style={{display: 'flex', alignItems: 'baseline', gap: 12}}>
                  <span style={{fontFamily: ANTON, fontSize: 110, lineHeight: 0.95, color: top ? GOLD : COCOA, scale: lerp(Math.min(1.08, rk), 1.6, 1), opacity: Math.min(1, rk * 3), transformOrigin: 'left bottom'}}>{`#${r.r}`}</span>
                  {r.pct ? <span style={{padding: '4px 14px', borderRadius: 999, background: COCOA, fontFamily: GROT, fontWeight: 800, fontSize: 28, color: '#FFFFFF', opacity: bk}}>{`${r.pct} cacao`}</span> : null}
                </div>
                <span style={{fontFamily: GROT, fontWeight: 800, fontSize: r.brand.length > 15 ? 44 : 54, lineHeight: 1.02, color: INK, opacity: bk, translate: `0 ${lerp(bk, 12, 0)}px`}}>{r.brand}</span>
                <div style={{display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4}}>
                  {r.pros.map((p) =>
                    t >= p.at ? (
                      <div key={p.text} style={{display: 'flex', alignItems: 'center', gap: 10, opacity: tween(t, p.at, 0.25), translate: `${lerp(tween(t, p.at, 0.3, EASE_OUT), 14, 0)}px 0`}}>
                        <span style={{width: 34, height: 34, borderRadius: '50%', background: p.good ? BRAND : RED, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: GROT, fontWeight: 800, fontSize: 22, flexShrink: 0}}>{p.good ? '✓' : '✕'}</span>
                        <span style={{fontFamily: GROT, fontWeight: 700, fontSize: 30, color: INK, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{p.text}</span>
                      </div>
                    ) : null,
                  )}
                </div>
              </div>
            </div>
          </AbsoluteFill>
        );
      })}
    </>
  );
};

/** "Higher cacao percentage does not mean fewer calories." */
export const Myth: React.FC = () => {
  const t = useT();
  const o = vis(t, MYTH);
  if (o <= 0) return null;
  const k = popAt(t, MYTH.at);
  const x = popAt(t, 92.6);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, scale: lerp(Math.min(1.05, k), 0.7, 1), opacity: Math.min(1, k * 3)}}>
        <MixWord w="Higher Cacao %" size={96} serif={false} />
        <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
          <span style={{fontFamily: GROT, fontWeight: 800, fontSize: 110, color: RED, textShadow: '0 4px 16px rgba(0,0,0,0.35)', scale: lerp(Math.min(1.1, x), 2, 1), opacity: t >= 92.6 ? 1 : 0}}>≠</span>
          <MixWord w="_fewer calories" size={86} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const CommentPill: React.FC = () => {
  const t = useT();
  if (t < CTA_AT) return null;
  const s = tween(t, CTA_AT, 0.35, EASE_OUT);
  const p = tween(t, CTA_AT + 1.4, 0.35, EASE_OUT);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, display: 'flex', justifyContent: 'center', opacity: s}}>
        <span style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 80, color: '#FFFFFF', textShadow: '0 3px 18px rgba(0,0,0,0.75)'}}>comment</span>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1260, display: 'flex', justifyContent: 'center', opacity: p, translate: `0 ${lerp(p, 16, 0)}px`}}>
        <div style={{padding: '14px 32px', borderRadius: 999, background: BRAND, boxShadow: shadow, fontFamily: GROT, fontWeight: 800, fontSize: 42, color: '#FFFFFF'}}>Your fat-loss blueprint → DMs</div>
      </div>
    </AbsoluteFill>
  );
};
export const HIDE = [INTRO, ...RANKS.map((r) => ({start: r.start, end: r.end})), MYTH, {start: CTA_AT - 0.3, end: 999}];
