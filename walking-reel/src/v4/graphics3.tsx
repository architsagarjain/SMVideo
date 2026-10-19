import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {ICONS} from '../explainer/icons';
import {useT} from '../explainer/kit';
import {EASE_IN, EASE_IN_OUT, EASE_OUT, SANS, SERIF, lerp, tween} from '../theme';
import {C} from './config2';

/**
 * A few animated moments on top of the minimal edit: notifications in the hook, five meal photos,
 * the 30-day counter, the long-run chart and the comment box. All straight, cream/white palette.
 */
const CREAM = '#F6E7C1';
const SHADOW = '0 4px 28px rgba(0,0,0,0.45), 0 2px 6px rgba(0,0,0,0.35)';
const P = 'v4/photos/';
const inside = (t: number, w: {start: number; end: number}) => t >= w.start && t < w.end;

const Glyph: React.FC<{name: string; size: number; color: string}> = ({name, size, color}) => (
  <svg viewBox="0 0 256 256" width={size} height={size} style={{display: 'block'}}>
    {ICONS[name].map((d, k) => (
      <path key={k} d={d} fill={color} />
    ))}
  </svg>
);

// ---------------------------------------------------------------------------
// Hook: three notifications drop in while she says "If you're a busy woman"
// ---------------------------------------------------------------------------
const NOTES = [
  {at: 0.86, icon: 'calendar-blank', bg: '#FF3B30', app: 'Calendar', text: 'Client meeting in 10 min'},
  {at: 1.26, icon: 'briefcase', bg: '#0A84FF', app: 'Work', text: '14 unread messages'},
  {at: 1.66, icon: 'chat-circle-dots', bg: '#30D158', app: 'Messages', text: 'Mom: Dinner at 8 tonight?'},
];

export const V4cNotes: React.FC = () => {
  const t = useT();
  if (!inside(t, C.open)) return null;
  const out = 1 - tween(t, C.open.end - 0.3, 0.25, EASE_IN);
  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity: out}}>
      {NOTES.map((n, i) => {
        if (t < n.at) return null;
        const p = tween(t, n.at, 0.45, EASE_OUT);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 70,
              top: 110 + i * 168,
              width: 940,
              height: 146,
              borderRadius: 38,
              background: 'rgba(30,30,32,0.78)',
              boxShadow: '0 18px 50px rgba(0,0,0,0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: 26,
              padding: '0 30px',
              boxSizing: 'border-box',
              opacity: Math.min(1, p * 1.6),
              translate: `0 ${lerp(p, -60, 0)}px`,
              fontFamily: SANS,
            }}
          >
            <div style={{width: 86, height: 86, borderRadius: 22, background: n.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
              <Glyph name={n.icon} size={54} color="#fff" />
            </div>
            <div style={{flex: 1, minWidth: 0}}>
              <div style={{display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.6)', fontSize: 28, fontWeight: 600}}>
                <span>{n.app.toUpperCase()}</span>
                <span>now</span>
              </div>
              <div style={{color: '#fff', fontSize: 38, fontWeight: 700, marginTop: 6, whiteSpace: 'nowrap'}}>{n.text}</div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// "cook 5 different meals": five round photos pop in, one per beat
// ---------------------------------------------------------------------------
const DOTS = ['meal_oats', 'meal_poha', 'meal_chicken', 'meal_salad', 'meal_smoothie'];

export const V4cMealDots: React.FC = () => {
  const t = useT();
  if (!inside(t, C.stop) || t < 5.66) return null;
  const out = 1 - tween(t, C.stop.end - 0.3, 0.22, EASE_IN);
  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity: out}}>
      {DOTS.map((d, i) => {
        const p = tween(t, 5.7 + i * 0.1, 0.4, EASE_OUT);
        if (p <= 0) return null;
        return (
          <div
            key={d}
            style={{
              position: 'absolute',
              left: 110 + i * 172,
              top: 175,
              width: 150,
              height: 150,
              borderRadius: '50%',
              overflow: 'hidden',
              border: `5px solid ${CREAM}`,
              boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
              opacity: Math.min(1, p * 2),
              scale: lerp(p, 0.6, 1),
            }}
          >
            <Img src={staticFile(`${P}${d}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// "perfect" (behind her) gets struck through on "diet"
// ---------------------------------------------------------------------------
export const V4cStrike: React.FC = () => {
  const t = useT();
  if (!inside(t, C.perfect) || t < 23.98) return null;
  const p = tween(t, 23.98, 0.3, EASE_IN_OUT);
  const o = 1 - tween(t, C.perfect.end - 0.2, 0.22, EASE_IN);
  return <div style={{position: 'absolute', left: 175, top: 548, width: 730 * p, height: 16, borderRadius: 8, background: '#FF5A4E', opacity: o, boxShadow: '0 3px 12px rgba(0,0,0,0.3)'}} />;
};

// ---------------------------------------------------------------------------
// "losing fat for 30 days": the day counts up on the push-up clip
// ---------------------------------------------------------------------------
export const V4cDays: React.FC = () => {
  const t = useT();
  if (!inside(t, C.push)) return null;
  const n = Math.max(1, Math.round(lerp(tween(t, 42.0, 0.62, EASE_IN_OUT), 1, 30)));
  const p = tween(t, C.push.start, 0.3, EASE_OUT);
  const o = Math.min(1, p * 1.5) * (1 - tween(t, C.push.end - 0.08, 0.08, EASE_IN));
  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity: o}}>
      <AbsoluteFill style={{background: 'radial-gradient(90% 55% at 50% 45%, rgba(0,0,0,0.38) 0%, rgba(0,0,0,0.12) 70%, rgba(0,0,0,0) 100%)'}} />
      <div style={{position: 'absolute', left: 540, top: 740, translate: '-50% -50%', textAlign: 'center', fontFamily: SANS, color: CREAM, textShadow: SHADOW}}>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', color: '#fff', fontSize: 90, lineHeight: 1}}>day</div>
        <div style={{fontWeight: 800, fontSize: 260, letterSpacing: -6, lineHeight: 1, fontVariantNumeric: 'tabular-nums'}}>{n}</div>
      </div>
      {/* 30 small ticks fill as the day counts */}
      <div style={{position: 'absolute', left: 165, top: 930, display: 'flex', gap: 6}}>
        {Array.from({length: 30}).map((_, i) => (
          <div key={i} style={{width: 19, height: 34, borderRadius: 5, background: i < n ? CREAM : 'rgba(255,255,255,0.28)'}} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// "keeping it off in the long run": crash diet vs. her way, drawn on
// ---------------------------------------------------------------------------
const X0 = 130, X1 = 950;
const CRASH = 'M 130 760 C 230 800, 300 1120, 400 1140 C 520 1160, 640 760, 950 700';
const STEADY = 'M 130 760 C 330 830, 560 1000, 950 1110';

export const V4cChart: React.FC = () => {
  const t = useT();
  if (!inside(t, C.longrun)) return null;
  const enter = tween(t, C.longrun.start, 0.3, EASE_OUT);
  const a = tween(t, 43.3, 1.1, EASE_IN_OUT);
  const b = tween(t, 44.3, 1.1, EASE_IN_OUT);
  const la = tween(t, 44.3, 0.3);
  const lb = tween(t, 45.3, 0.3);
  const word = (text: string, at: number, y: number, size: number, serif?: boolean) => {
    const p = tween(t, at, 0.35, EASE_OUT);
    return (
      <div style={{position: 'absolute', left: 540, top: y, translate: `-50% ${lerp(p, 20, 0)}px`, opacity: p, whiteSpace: 'nowrap', lineHeight: 1, fontFamily: serif ? SERIF : SANS, fontStyle: serif ? 'italic' : 'normal', fontWeight: serif ? 400 : 800, fontSize: size, letterSpacing: serif ? -1 : -3, color: serif ? '#fff' : CREAM}}>
        {text}
      </div>
    );
  };
  return (
    <AbsoluteFill style={{opacity: enter, background: 'radial-gradient(120% 80% at 50% 45%, #2c241d 0%, #120f0c 100%)'}}>
      <AbsoluteFill style={{translate: '0 140px'}}>
      {word('KEEPING IT OFF', 43.9, 300, 120)}
      {word('in the long run', 44.6, 430, 100, true)}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <defs>
          <clipPath id="ca"><rect x={0} y={0} width={X0 + (X1 - X0) * a + 10} height={1920} /></clipPath>
          <clipPath id="cb"><rect x={0} y={0} width={X0 + (X1 - X0) * b + 10} height={1920} /></clipPath>
        </defs>
        <line x1={X0} y1={1250} x2={X1} y2={1250} stroke="rgba(255,255,255,0.3)" strokeWidth={3} />
        <path d={CRASH} clipPath="url(#ca)" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth={9} strokeDasharray="22 18" strokeLinecap="round" />
        <path d={STEADY} clipPath="url(#cb)" fill="none" stroke={CREAM} strokeWidth={14} strokeLinecap="round" />
        <circle cx={X0} cy={760} r={14} fill="#fff" opacity={a > 0 ? 1 : 0} />
        <circle cx={X1} cy={1110} r={18} fill={CREAM} opacity={lb} />
      </svg>
      <div style={{position: 'absolute', left: 400, top: 1270, translate: '-50% 0', fontFamily: SANS, fontWeight: 700, whiteSpace: 'nowrap', fontSize: 34, color: 'rgba(255,255,255,0.6)', opacity: a > 0.3 ? 1 : 0}}>30 days</div>
      <div style={{position: 'absolute', left: X1, top: 1270, translate: '-100% 0', fontFamily: SANS, fontWeight: 700, whiteSpace: 'nowrap', fontSize: 34, color: 'rgba(255,255,255,0.6)', opacity: b > 0.9 ? 1 : 0}}>1 year</div>
      <div style={{position: 'absolute', left: X1, top: 600, translate: '-100% 0', whiteSpace: 'nowrap', fontFamily: SANS, fontWeight: 700, fontSize: 44, color: '#fff', opacity: la}}>crash diet</div>
      <div style={{position: 'absolute', left: X1, top: 1140, translate: '-100% 0', whiteSpace: 'nowrap', fontFamily: SERIF, fontStyle: 'italic', fontSize: 60, color: CREAM, opacity: lb}}>meals you like</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// CTA: an Instagram comment box types BUSY and sends
// ---------------------------------------------------------------------------
export const V4cComment: React.FC = () => {
  const t = useT();
  if (t < C.cta.start + 0.08) return null;
  const p = tween(t, 46.42, 0.4, EASE_OUT);
  const typed = 'BUSY'.slice(0, Math.max(0, Math.min(4, Math.floor((t - 46.56) / 0.09) + 1)));
  const sent = tween(t, 47.0, 0.25, EASE_OUT);
  const caret = typed.length > 0 && sent === 0 && Math.floor(t * 3) % 2 === 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: 90,
        top: 1250,
        width: 900,
        height: 128,
        borderRadius: 64,
        background: 'rgba(255,255,255,0.97)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        padding: '0 22px',
        boxSizing: 'border-box',
        opacity: p,
        translate: `0 ${lerp(p, 40, 0)}px`,
        fontFamily: SANS,
      }}
    >
      <div style={{width: 84, height: 84, borderRadius: '50%', background: 'linear-gradient(45deg,#F9CE34,#EE2A7B,#6228D7)', padding: 4, boxSizing: 'border-box'}}>
        <div style={{width: '100%', height: '100%', borderRadius: '50%', background: '#e9e2d6'}} />
      </div>
      <div style={{flex: 1, fontSize: 46, fontWeight: typed ? 800 : 500, color: typed ? '#111' : '#999', letterSpacing: typed ? 1 : 0}}>
        {typed || 'Add a comment…'}
        {caret ? <span style={{color: '#0A84FF', fontWeight: 400}}>|</span> : null}
      </div>
      <div style={{width: 92, height: 92, borderRadius: '50%', background: sent > 0 ? '#0A84FF' : '#cfd8e3', display: 'flex', alignItems: 'center', justifyContent: 'center', scale: 1 + 0.18 * Math.sin(Math.PI * sent)}}>
        <Glyph name="paper-plane-right" size={50} color="#fff" />
      </div>
    </div>
  );
};
