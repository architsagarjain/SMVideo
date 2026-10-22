import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {ICONS} from '../explainer/icons';
import {useT} from '../explainer/kit';
import {Base, Footage} from '../series/core';
import {outAt} from '../series/timemap';
import {EASE_IN, EASE_IN_OUT, EASE_OUT, FPS, SANS, SERIF, lerp, tween} from '../theme';
import {App, C, ITEMS, Rect, SCENES, TMP, phoneConfig as cfg} from './config';

/**
 * Snack reel, phone-screen style. Everything happens inside one iPhone: FaceTime with her, Notes,
 * Calculator, Calendar, an Instagram story and the Instagram comment sheet.
 */
const SW = 900, SH = 1600; // phone screen
const PX = 70, PY = 140, BEZ = 20; // phone frame position and bezel
const BLUE = '#0A84FF';
const RED = '#FF3B30';
const GREEN = '#34C759';
const ORANGE = '#FF9F0A';
const INK = '#111111';
const GREY = '#8E8E93';
type Win = {start: number; end: number};
const inside = (t: number, w: Win) => t >= w.start && t < w.end;
const typed = (text: string, at: number, t: number, cps = 0.035) => (t < at ? '' : text.slice(0, Math.min(text.length, Math.floor((t - at) / cps) + 1)));

const Glyph: React.FC<{name: string; size: number; color: string}> = ({name, size, color}) => (
  <svg viewBox="0 0 256 256" width={size} height={size} style={{display: 'block'}}>
    {ICONS[name].map((d, k) => (
      <path key={k} d={d} fill={color} />
    ))}
  </svg>
);

const sceneIndex = (t: number) => {
  let i = 0;
  SCENES.forEach((s, k) => {
    if (t >= s.w.start) i = k;
  });
  return i;
};
const TRANS = 0.45;
// CTA: when the comment sheet opens, her video shrinks into the space above it (like Instagram)
const SHEET_AT = 45.14;
const SHEET_TOP = 1040;
const CTA_SMALL: Rect = {x: (SW - 530) / 2, y: 100, w: 530, h: 942, r: 30};
const lerpRect = (a: Rect, b: Rect, p: number): Rect => ({x: lerp(p, a.x, b.x), y: lerp(p, a.y, b.y), w: lerp(p, a.w, b.w), h: lerp(p, a.h, b.h), r: lerp(p, a.r, b.r)});

// ===========================================================================
// Apps (drawn under her video)
// ===========================================================================
const Notes: React.FC<{t: number; second?: boolean}> = ({t, second}) => {
  const titleAt = C.notes.start + 0.15;
  const title = second ? 'What I ate today' : typed('What I ate today', titleAt, t, 0.03);
  return (
    <AbsoluteFill style={{background: '#FBFAF6', fontFamily: SANS}}>
      <div style={{position: 'absolute', left: 30, top: 92, display: 'flex', alignItems: 'center', gap: 6, color: '#D9A400', fontSize: 40, fontWeight: 600}}>
        <span style={{fontSize: 58, lineHeight: 1, marginTop: -6}}>‹</span> Notes
      </div>
      <div style={{position: 'absolute', right: 34, top: 96, color: '#D9A400', fontSize: 38, fontWeight: 700}}>Done</div>
      <div style={{position: 'absolute', left: 40, top: 190, fontSize: 70, fontWeight: 800, color: INK, letterSpacing: -2}}>{title}</div>
      <div style={{position: 'absolute', left: 40, top: 282, fontSize: 30, fontWeight: 600, color: GREY}}>Today at 9:41 AM</div>
      {ITEMS.map((k, i) => {
        const label = second ? k.label : typed(k.label, k.at, t);
        if (!label) return null;
        const doneTyping = second || t >= k.at + k.label.length * 0.035 + 0.1;
        const check = second ? tween(t, 31.98 + i * 0.12, 0.3, EASE_OUT) : 0;
        const caret = !second && !doneTyping && Math.floor(t * 4) % 2 === 0;
        return (
          <div key={i} style={{position: 'absolute', left: 40, right: 40, top: 370 + i * 112, height: 90, display: 'flex', alignItems: 'center', gap: 26}}>
            <div style={{width: 50, height: 50, borderRadius: 25, border: `4px solid ${check > 0 ? GREEN : '#C7C7CC'}`, background: check > 0 ? GREEN : 'transparent', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', scale: 1 + 0.2 * Math.sin(Math.PI * check)}}>
              {check > 0 ? (
                <svg viewBox="0 0 100 100" width={34} height={34}>
                  <path d="M 20 52 L 42 72 L 80 30" fill="none" stroke="#fff" strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - check} />
                </svg>
              ) : null}
            </div>
            <div style={{flex: 1, fontSize: 50, fontWeight: 600, color: INK, whiteSpace: 'nowrap'}}>
              {label}
              {caret ? <span style={{color: '#D9A400', fontWeight: 400}}>|</span> : null}
            </div>
            {doneTyping ? <div style={{fontSize: 38, fontWeight: 700, color: k.kcal === 'meal' ? GREY : '#C2410C', opacity: second ? 1 : tween(t, k.at + k.label.length * 0.035 + 0.1, 0.3)}}>{k.kcal}</div> : null}
          </div>
        );
      })}
      {second ? (
        <>
          <div style={{position: 'absolute', left: 40, top: 960, width: 520, fontSize: 46, fontWeight: 700, color: INK, lineHeight: 1.2}}>{typed('the foods aren’t the problem', 29.28, t, 0.04)}</div>
          <div style={{position: 'absolute', left: 40, top: 1100, width: 520, fontSize: 56, fontFamily: SERIF, fontStyle: 'italic', color: '#15803D'}}>{typed('they’re great foods', 32.28, t, 0.04)}</div>
        </>
      ) : null}
    </AbsoluteFill>
  );
};

const KEYS = [
  ['AC', '+/−', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '−'],
  ['1', '2', '3', '+'],
  ['0', '', '.', '='],
];
const EXPR = '80+160+170+110';
const EXPR_AT = 19.98;
const EXPR_STEP = 0.09;
const EQ_AT = 22.3;
const Calculator: React.FC<{t: number}> = ({t}) => {
  const n = t < EXPR_AT ? 0 : Math.min(EXPR.length, Math.floor((t - EXPR_AT) / EXPR_STEP) + 1);
  const expr = EXPR.slice(0, n);
  const done = t >= EQ_AT;
  const current = done ? '520' : expr.split('+').pop() || '0';
  // which key is lit right now
  const k = Math.floor((t - EXPR_AT) / EXPR_STEP);
  const lit = done ? (t < EQ_AT + 0.12 ? '=' : '') : k >= 0 && k < EXPR.length && t - EXPR_AT - k * EXPR_STEP < 0.07 ? EXPR[k] : '';
  const B = 160, G = 26, X0 = (SW - (4 * B + 3 * G)) / 2, Y0 = SH - 120 - (5 * B + 4 * G);
  const label = tween(t, 22.86, 0.3);
  return (
    <AbsoluteFill style={{background: '#000', fontFamily: SANS}}>
      <div style={{position: 'absolute', right: 56, top: 236, fontSize: 40, fontWeight: 700, color: ORANGE, opacity: label}}>extra calories</div>
      <div style={{position: 'absolute', right: 56, top: 296, fontSize: 60, fontWeight: 500, color: '#A5A5A5', fontVariantNumeric: 'tabular-nums'}}>{done ? `${EXPR} =` : ''}</div>
      <div style={{position: 'absolute', right: 52, top: 340, fontSize: done ? 170 : 150, fontWeight: 300, color: '#fff', letterSpacing: -4, fontVariantNumeric: 'tabular-nums', scale: done ? lerp(tween(t, EQ_AT, 0.3, EASE_OUT), 1.12, 1) : 1, transformOrigin: 'right center'}}>
        {done ? current : n > 0 ? current : '0'}
      </div>
      {KEYS.map((row, r) =>
        row.map((key, c) => {
          if (key === '') return null;
          const wide = key === '0';
          const op = c === 3;
          const top = r === 0;
          const on = key === lit || (key === '−' && lit === '-');
          const bg = op ? (on ? '#FFFFFF' : ORANGE) : top ? '#A5A5A5' : on ? '#737373' : '#333333';
          const fg = op ? (on ? ORANGE : '#fff') : top ? '#000' : '#fff';
          return (
            <div key={`${r}${c}`} style={{position: 'absolute', left: X0 + c * (B + G), top: Y0 + r * (B + G), width: wide ? 2 * B + G : B, height: B, borderRadius: B / 2, background: bg, color: fg, display: 'flex', alignItems: 'center', justifyContent: wide ? 'flex-start' : 'center', paddingLeft: wide ? 58 : 0, boxSizing: 'border-box', fontSize: top ? 54 : 70, fontWeight: 500}}>
              {key}
            </div>
          );
        }),
      )}
    </AbsoluteFill>
  );
};

const PICKS = [8.5, 9.4, 10.3, 11.2, 12.4, 13.4, 14.6, 15.5, 16.4, 17.6, 18.8, 20.2, 21.2];
const MEALS = [
  {h: 8, d: 1, label: 'Breakfast'},
  {h: 13, d: 1, label: 'Lunch'},
  {h: 19.5, d: 1, label: 'Dinner'},
];
const hy = (h: number) => 300 + (h - 8) * 86;
const Calendar: React.FC<{t: number}> = ({t}) => {
  const swap = tween(t, 43.1, 0.35, EASE_IN_OUT);
  return (
    <AbsoluteFill style={{background: '#FFFFFF', fontFamily: SANS}}>
      <div style={{position: 'absolute', left: 30, top: 92, display: 'flex', alignItems: 'center', gap: 6, color: RED, fontSize: 40, fontWeight: 600}}>
        <span style={{fontSize: 58, lineHeight: 1, marginTop: -6}}>‹</span> October
      </div>
      <div style={{position: 'absolute', left: 40, top: 168, fontSize: 64, fontWeight: 800, color: INK, letterSpacing: -2}}>Today</div>
      {Array.from({length: 15}).map((_, i) => {
        const h = 8 + i;
        return (
          <React.Fragment key={h}>
            <div style={{position: 'absolute', left: 26, top: hy(h) - 16, width: 100, textAlign: 'right', fontSize: 26, fontWeight: 600, color: GREY}}>{h === 12 ? 'Noon' : h < 12 ? `${h} AM` : `${h - 12} PM`}</div>
            <div style={{position: 'absolute', left: 146, right: 20, top: hy(h), height: 2, background: '#E5E5EA'}} />
          </React.Fragment>
        );
      })}
      {PICKS.map((h, i) => {
        const p = tween(t, 41.74 + i * 0.09, 0.25, EASE_OUT);
        if (p <= 0) return null;
        return (
          <div key={i} style={{position: 'absolute', left: 160, top: hy(h) + 3, width: 390, height: 38, borderRadius: 8, background: 'rgba(255,59,48,0.14)', borderLeft: `7px solid ${RED}`, boxSizing: 'border-box', padding: '0 14px', display: 'flex', alignItems: 'center', fontSize: 26, fontWeight: 700, color: '#B42318', opacity: p * (1 - swap), scale: lerp(p, 0.85, 1) * lerp(swap, 1, 0.9), transformOrigin: 'left center'}}>
            snack
          </div>
        );
      })}
      {MEALS.map((m, i) => {
        const p = tween(t, 43.1 + i * 0.14, 0.4, EASE_OUT);
        if (p <= 0) return null;
        return (
          <div key={i} style={{position: 'absolute', left: 160, top: hy(m.h) + 3, width: 410, height: m.d * 86 - 6, borderRadius: 12, background: '#E7F7EC', borderLeft: `8px solid ${GREEN}`, boxSizing: 'border-box', padding: '0 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', opacity: p, translate: `${lerp(p, -30, 0)}px 0`}}>
            <div style={{fontSize: 36, fontWeight: 800, color: '#166534'}}>{m.label}</div>
            <div style={{fontSize: 24, fontWeight: 600, color: '#3F7D52'}}>keeps you full</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** Her profile picture: a small cream badge with a dumbbell. */
const ProfileIcon: React.FC<{border: string}> = ({border}) => (
  <div style={{width: '100%', height: '100%', borderRadius: '50%', background: '#F6E7C1', border: `3px solid ${border}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    <Glyph name="barbell" size={34} color="#1B1714" />
  </div>
);

const Story: React.FC<{t: number}> = ({t}) => {
  const from = Math.round(outAt(TMP, C.story.start) * FPS);
  const prog = tween(t, C.story.start, C.story.end - C.story.start, (x) => x);
  const s1 = tween(t, 39.08, 0.35, EASE_OUT);
  const s2 = tween(t, 40.14, 0.35, EASE_OUT);
  return (
    <AbsoluteFill style={{background: '#000', fontFamily: SANS}}>
      <Sequence from={from} premountFor={FPS}>
        <AbsoluteFill style={{scale: lerp(prog, 1.0, 1.06)}}>
          <OffthreadVideo src={staticFile('v7/m_eat.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        </AbsoluteFill>
      </Sequence>
      <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 80%, rgba(0,0,0,0.45) 100%)'}} />
      <div style={{position: 'absolute', left: 20, right: 20, top: 84, display: 'flex', gap: 8}}>
        {[1, prog, 0].map((f, i) => (
          <div key={i} style={{flex: 1, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.4)', overflow: 'hidden'}}>
            <div style={{width: `${f * 100}%`, height: '100%', background: '#fff'}} />
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 24, top: 112, display: 'flex', alignItems: 'center', gap: 16}}>
        <div style={{width: 72, height: 72, borderRadius: 36, background: 'linear-gradient(45deg,#F9CE34,#EE2A7B,#6228D7)', padding: 4, boxSizing: 'border-box'}}>
          <ProfileIcon border="#000" />
        </div>
        <div style={{color: '#fff', fontSize: 34, fontWeight: 800}}>Bhavika</div>
        <div style={{color: 'rgba(255,255,255,0.75)', fontSize: 30, fontWeight: 600}}>2h</div>
      </div>
      {s1 > 0 ? (
        <div style={{position: 'absolute', left: 450, top: 330, translate: '-50% -50%', padding: '18px 38px', borderRadius: 26, background: '#fff', color: INK, fontSize: 92, fontWeight: 800, letterSpacing: -3, whiteSpace: 'nowrap', opacity: s1, scale: lerp(s1, 0.6, 1) * (1 + 0.08 * Math.sin(Math.PI * s1)), boxShadow: '0 16px 40px rgba(0,0,0,0.35)'}}>
          REAL MEALS
        </div>
      ) : null}
      {s2 > 0 ? (
        <div style={{position: 'absolute', left: 450, top: 470, translate: '-50% -50%', padding: '10px 30px', borderRadius: 22, background: '#F6E7C1', color: INK, fontFamily: SERIF, fontStyle: 'italic', fontSize: 64, whiteSpace: 'nowrap', opacity: s2, scale: lerp(s2, 0.7, 1)}}>
          that keep you full
        </div>
      ) : null}
      <div style={{position: 'absolute', left: 24, right: 120, bottom: 40, height: 84, borderRadius: 42, border: '3px solid rgba(255,255,255,0.8)', boxSizing: 'border-box', display: 'flex', alignItems: 'center', paddingLeft: 32, color: '#fff', fontSize: 32, fontWeight: 600}}>Send message</div>
      <div style={{position: 'absolute', right: 30, bottom: 50}}>
        <Glyph name="heart-straight" size={64} color="#fff" />
      </div>
    </AbsoluteFill>
  );
};

const AppView: React.FC<{app: App; t: number}> = ({app, t}) => {
  if (app === 'notes') return <Notes t={t} />;
  if (app === 'notes2') return <Notes t={t} second />;
  if (app === 'calc') return <Calculator t={t} />;
  if (app === 'calendar') return <Calendar t={t} />;
  if (app === 'story') return <Story t={t} />;
  return <AbsoluteFill style={{background: '#000'}} />;
};

const Apps: React.FC = () => {
  const t = useT();
  const i = sceneIndex(t);
  const cur = SCENES[i];
  const prev = i > 0 ? SCENES[i - 1] : null;
  const k = tween(t, cur.w.start, TRANS, EASE_IN_OUT);
  if (!prev || k >= 1) return <AppView app={cur.app} t={t} />;
  if (cur.her && cur.her.w === SW) {
    // she grows back to full screen over the previous app
    return (
      <>
        <AppView app={prev.app} t={t} />
        <AbsoluteFill style={{opacity: k}}>
          <AppView app={cur.app} t={t} />
        </AbsoluteFill>
      </>
    );
  }
  if (prev.her && prev.her.w === SW) return <AppView app={cur.app} t={t} />; // revealed as she shrinks
  // app to app: the new one slides in from the right
  return (
    <>
      <AppView app={prev.app} t={t} />
      <AbsoluteFill style={{translate: `${lerp(k, SW, 0)}px 0`, boxShadow: '-20px 0 40px rgba(0,0,0,0.2)'}}>
        <AppView app={cur.app} t={t} />
      </AbsoluteFill>
    </>
  );
};

// ===========================================================================
// Her video: full screen or a picture-in-picture window
// ===========================================================================
const Her: React.FC = () => {
  const t = useT();
  const i = sceneIndex(t);
  const cur = SCENES[i];
  if (!cur.her) return null;
  const prev = i > 0 ? SCENES[i - 1] : null;
  const k = tween(t, cur.w.start, TRANS, EASE_IN_OUT);
  let r = cur.her;
  let o = 1;
  let sc = 1;
  if (prev && prev.her) r = lerpRect(prev.her, cur.her, k);
  else if (prev && !prev.her) {
    o = tween(t, cur.w.start, 0.3);
    sc = lerp(tween(t, cur.w.start, 0.4, EASE_OUT), 0.7, 1);
  }
  if (cur.app === 'reel') r = lerpRect(r, CTA_SMALL, tween(t, SHEET_AT, 0.45, EASE_OUT)); // makes room for the comment sheet
  const pip = r.w < SW - 1 && cur.app !== 'reel';
  return (
    <div style={{position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: r.r, overflow: 'hidden', opacity: o, scale: sc, boxShadow: pip ? '0 18px 40px rgba(0,0,0,0.35)' : undefined, outline: pip ? '5px solid #fff' : undefined, background: '#000'}}>
      <Footage cfg={cfg} />
    </div>
  );
};

// ===========================================================================
// Overlays
// ===========================================================================
const Banner: React.FC<{at: number; out: number; app: string; icon: React.ReactNode; title: string; body: string}> = ({at, out, app, icon, title, body}) => {
  const t = useT();
  if (t < at - 0.02 || t > out + 0.35) return null;
  const p = tween(t, at, 0.45, EASE_OUT);
  const q = tween(t, out, 0.3, EASE_IN);
  return (
    <div style={{position: 'absolute', left: 22, right: 22, top: lerp(p, -220, 36) + lerp(q, 0, -260), padding: '24px 26px', borderRadius: 44, background: 'rgba(245,245,247,0.94)', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', display: 'flex', gap: 22, alignItems: 'center', fontFamily: SANS}}>
      <div style={{width: 92, height: 92, borderRadius: 22, flexShrink: 0, overflow: 'hidden'}}>{icon}</div>
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 26, fontWeight: 700, color: GREY, letterSpacing: 1}}>
          <span>{app}</span>
          <span>now</span>
        </div>
        <div style={{fontSize: 42, fontWeight: 800, color: INK, marginTop: 4, whiteSpace: 'nowrap'}}>{title}</div>
        <div style={{fontSize: 34, fontWeight: 500, color: '#3A3A3C', marginTop: 2, whiteSpace: 'nowrap'}}>{body}</div>
      </div>
    </div>
  );
};

const Bubble: React.FC<{text: string; at: number; out: number; y: number; me?: boolean}> = ({text, at, out, y, me}) => {
  const t = useT();
  if (t < at - 0.02 || t > out + 0.25) return null;
  const p = tween(t, at, 0.35, EASE_OUT);
  const o = Math.min(1, p * 2) * (1 - tween(t, out, 0.22, EASE_IN));
  return (
    <div style={{position: 'absolute', top: y, [me ? 'right' : 'left']: 30, maxWidth: 640, padding: '20px 32px', borderRadius: 44, background: me ? BLUE : 'rgba(58,58,60,0.92)', color: '#fff', fontFamily: SANS, fontSize: 44, fontWeight: 600, opacity: o, scale: lerp(p, 0.6, 1), transformOrigin: me ? 'right bottom' : 'left bottom', boxShadow: '0 10px 30px rgba(0,0,0,0.25)'}}>
      {text}
    </div>
  );
};

const FaceTimeUI: React.FC<{w: Win}> = ({w}) => {
  const t = useT();
  const f = useCurrentFrame();
  const o = tween(t, w.start + 0.25, 0.3) * (1 - tween(t, w.end - 0.25, 0.2));
  if (o <= 0) return null;
  const secs = Math.floor(f / FPS) + 12;
  return (
    <AbsoluteFill style={{opacity: o, fontFamily: SANS}}>
      <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(0,0,0,0.38) 0%, rgba(0,0,0,0) 18%, rgba(0,0,0,0) 80%, rgba(0,0,0,0.4) 100%)'}} />
      <div style={{position: 'absolute', left: 36, top: 96}}>
        <div style={{fontSize: 44, fontWeight: 800, color: '#fff'}}>Bhavika</div>
        <div style={{fontSize: 30, fontWeight: 600, color: 'rgba(255,255,255,0.8)', fontVariantNumeric: 'tabular-nums'}}>FaceTime · {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}</div>
      </div>
      <div style={{position: 'absolute', left: 150, right: 150, bottom: 36, height: 130, borderRadius: 65, background: 'rgba(40,40,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'space-evenly'}}>
        {['video-camera', 'chat-circle-dots'].map((g) => (
          <div key={g} style={{width: 96, height: 96, borderRadius: 48, background: 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Glyph name={g} size={52} color="#fff" />
          </div>
        ))}
        <div style={{width: 96, height: 96, borderRadius: 48, background: RED, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <svg viewBox="0 0 100 100" width={44} height={44}>
            <path d="M 25 25 L 75 75 M 75 25 L 25 75" stroke="#fff" strokeWidth={12} strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Alert: React.FC = () => {
  const t = useT();
  const at = 34.36;
  if (t < at || t >= C.alert.end) return null;
  const p = tween(t, at, 0.3, EASE_OUT);
  const tap = tween(t, 37.85, 0.15);
  const q = tween(t, 38.05, 0.25, EASE_IN);
  const flash = tween(t, 36.62, 0.25) * (1 - tween(t, 37.4, 0.3));
  return (
    <>
      <AbsoluteFill style={{background: `rgba(0,0,0,${0.28 * p * (1 - q)})`}} />
      <div style={{position: 'absolute', left: 450, top: 330, translate: '-50% -50%', width: 620, borderRadius: 40, background: 'rgba(242,242,247,0.97)', overflow: 'hidden', textAlign: 'center', fontFamily: SANS, opacity: Math.min(1, p * 1.5) * (1 - q), scale: lerp(p, 1.15, 1) * lerp(q, 1, 0.9), boxShadow: '0 30px 60px rgba(0,0,0,0.35)'}}>
        <div style={{padding: '38px 40px 30px'}}>
          <div style={{fontSize: 46, fontWeight: 800, color: INK}}>
            Healthy ≠ <span style={{color: flash > 0 ? RED : INK}}>Unlimited</span>
          </div>
          <div style={{fontSize: 32, fontWeight: 500, color: '#3A3A3C', marginTop: 10, lineHeight: 1.3}}>Healthy food still has calories.</div>
        </div>
        <div style={{height: 2, background: '#D1D1D6'}} />
        <div style={{height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, fontWeight: 700, color: BLUE, background: tap > 0 ? `rgba(0,0,0,${0.08 * tap})` : undefined}}>OK</div>
      </div>
    </>
  );
};

const Avatar: React.FC<{bg: string; hair: string; top: string; skin: string}> = ({bg, hair, top, skin}) => (
  <svg viewBox="0 0 100 100" width="100%" height="100%" style={{display: 'block', borderRadius: '50%'}}>
    <rect width={100} height={100} fill={bg} />
    <path d="M 22 62 C 18 30, 34 16, 52 17 C 72 18, 84 34, 80 62 L 82 84 L 20 84 Z" fill={hair} />
    <path d="M 14 104 C 16 80, 32 72, 50 72 C 68 72, 84 80, 86 104 Z" fill={top} />
    <rect x={43} y={58} width={14} height={16} rx={6} fill={skin} />
    <ellipse cx={50} cy={46} rx={17} ry={20} fill={skin} />
    <path d="M 32 44 C 32 28, 46 22, 58 26 C 66 29, 70 36, 69 44 C 60 36, 44 35, 32 44 Z" fill={hair} />
    <circle cx={43.5} cy={48} r={1.9} fill="#2A1A10" />
    <circle cx={56.5} cy={48} r={1.9} fill="#2A1A10" />
    <path d="M 45 56 Q 50 59.5, 55 56" stroke="#A0453F" strokeWidth={1.8} fill="none" strokeLinecap="round" />
  </svg>
);
const ME = {bg: '#E6F2DF', hair: '#5A3A24', top: '#F29B4B', skin: '#F0BC97'};
const COMMENTS = [
  {name: 'riya', text: 'SNACK', av: {bg: '#DDE8F6', hair: '#1F1A17', top: '#5B7FE0', skin: '#D9A07A'}},
  {name: 'neha', text: 'the almonds part is literally me', av: {bg: '#FCE3D3', hair: '#3B2418', top: '#E8657A', skin: '#F1B993'}},
];

const ReelUI: React.FC = () => {
  const t = useT();
  if (t < C.cta.start) return null;
  const o = tween(t, C.cta.start + 0.2, 0.3);
  const sheet = tween(t, SHEET_AT, 0.45, EASE_OUT);
  const word = 'SNACK';
  const typedN = Math.max(0, Math.min(word.length, Math.floor((t - 45.5) / 0.08) + 1));
  const sent = tween(t, 46.1, 0.3, EASE_OUT);
  const shown = sent > 0 ? '' : word.slice(0, typedN);
  const caret = sent === 0 && Math.floor(t * 3) % 2 === 0;
  return (
    <AbsoluteFill style={{opacity: o, fontFamily: SANS}}>
      <AbsoluteFill style={{opacity: 1 - sheet}}>
      <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 16%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.5) 100%)'}} />
      <div style={{position: 'absolute', left: 36, top: 96, fontSize: 46, fontWeight: 800, color: '#fff'}}>Reels</div>
      <div style={{position: 'absolute', right: 36, top: 96}}>
        <Glyph name="video-camera" size={56} color="#fff" />
      </div>
      <div style={{position: 'absolute', right: 26, top: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34}}>
        {[
          ['heart-straight', '24.1K'],
          ['chat-teardrop-text', '3,208'],
          ['paper-plane-right', 'Share'],
        ].map(([g, n]) => (
          <div key={g} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
            <Glyph name={g} size={62} color="#fff" />
            <div style={{fontSize: 26, fontWeight: 700, color: '#fff'}}>{n}</div>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 30, bottom: 120, display: 'flex', alignItems: 'center', gap: 16}}>
        <div style={{width: 64, height: 64}}>
          <ProfileIcon border="#fff" />
        </div>
        <div style={{fontSize: 34, fontWeight: 800, color: '#fff'}}>Bhavika</div>
        <div style={{padding: '6px 20px', borderRadius: 14, border: '2px solid #fff', fontSize: 28, fontWeight: 700, color: '#fff'}}>Follow</div>
      </div>
      <div style={{position: 'absolute', left: 30, bottom: 64, fontSize: 30, fontWeight: 600, color: '#fff'}}>Stop eating “healthy” snacks if…</div>
      </AbsoluteFill>
      {/* comment sheet */}
      <div style={{position: 'absolute', left: 0, right: 0, top: lerp(sheet, SH, SHEET_TOP), height: SH - SHEET_TOP + 40, borderRadius: '44px 44px 0 0', background: '#FFFFFF', boxShadow: '0 -20px 50px rgba(0,0,0,0.3)'}}>
        <div style={{position: 'absolute', left: 410, top: 16, width: 80, height: 10, borderRadius: 5, background: '#D1D1D6'}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 36, textAlign: 'center', fontSize: 36, fontWeight: 800, color: INK}}>Comments</div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 88, height: 2, background: '#EFEFF4'}} />
        {[...(sent > 0 ? [{name: 'you', text: 'SNACK', av: ME, fresh: true}] : []), ...COMMENTS].slice(0, 2).map((c, i) => (
          <div key={c.name} style={{position: 'absolute', left: 32, right: 32, top: 110 + i * 112, display: 'flex', gap: 22, alignItems: 'center', opacity: 'fresh' in c ? sent : 1, translate: 'fresh' in c ? `0 ${lerp(sent, -20, 0)}px` : undefined}}>
            <div style={{width: 78, height: 78, flexShrink: 0}}>
              <Avatar {...c.av} />
            </div>
            <div>
              <div style={{fontSize: 28, fontWeight: 700, color: GREY}}>
                {c.name} <span style={{fontWeight: 500}}>{'fresh' in c ? 'just now' : '2m'}</span>
              </div>
              <div style={{fontSize: 38, fontWeight: 700, color: INK}}>{c.text}</div>
            </div>
          </div>
        ))}
        <div style={{position: 'absolute', left: 24, right: 24, top: SH - SHEET_TOP - 150, height: 110, display: 'flex', alignItems: 'center', gap: 18}}>
          <div style={{width: 84, height: 84, flexShrink: 0}}>
            <Avatar {...ME} />
          </div>
          <div style={{flex: 1, height: 96, borderRadius: 48, border: '2px solid #D1D1D6', display: 'flex', alignItems: 'center', padding: '0 28px', fontSize: 40, fontWeight: shown ? 800 : 500, color: shown ? INK : '#999'}}>
            {shown || 'Add a comment…'}
            {shown && caret ? <span style={{color: BLUE, fontWeight: 400}}>|</span> : null}
          </div>
          <div style={{width: 92, height: 92, borderRadius: 46, background: typedN >= word.length || sent > 0 ? BLUE : '#cfd8e3', display: 'flex', alignItems: 'center', justifyContent: 'center', scale: 1 + 0.18 * Math.sin(Math.PI * sent)}}>
            <Glyph name="paper-plane-right" size={48} color="#fff" />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Overlays: React.FC = () => {
  const t = useT();
  const i = sceneIndex(t);
  const cur = SCENES[i];
  return (
    <>
      {cur.app === 'facetime' ? <FaceTimeUI w={cur.w} /> : null}
      {/* hook */}
      <Banner
        at={C.face1.start + 0.02}
        out={4.25}
        app="REMINDERS"
        icon={
          <div style={{width: '100%', height: '100%', background: RED, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Glyph name="bell-ringing" size={58} color="#fff" />
          </div>
        }
        title="STOP eating healthy snacks"
        body="if you’re trying to lose fat"
      />
      <Bubble text="that sounds wrong" at={4.88} out={C.face1.end - 0.15} y={250} />
      <Bubble text="hear me out" at={5.98} out={C.face1.end - 0.15} y={370} me />
      <Bubble text="and it felt like I ate nothing" at={24.48} out={C.face2.end - 0.2} y={250} me />
      <Bubble text="I’ve done this too" at={27.36} out={C.face2.end - 0.2} y={370} me />
      <Alert />
      <ReelUI />
      <Banner
        at={47.18}
        out={999}
        app="INSTAGRAM"
        icon={
          <div style={{width: '100%', height: '100%', background: 'linear-gradient(45deg,#F9CE34,#EE2A7B,#6228D7)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Glyph name="file-text" size={56} color="#fff" />
          </div>
        }
        title="Bhavika sent you a file"
        body="Free snack guide.pdf"
      />
    </>
  );
};

/** iOS-style live captions: a dark pill, placed clear of the app UI. */
const LiveCaptions: React.FC = () => {
  const t = useT();
  const i = sceneIndex(t);
  const cur = SCENES[i];
  if (cur.app === 'reel') return null;
  const lines = cfg.captions;
  let line: (typeof lines)[number] | null = null;
  for (let k = 0; k < lines.length; k++) {
    const a = lines[k][0].start;
    const b = k + 1 < lines.length ? lines[k + 1][0].start : lines[k][lines[k].length - 1].end + 0.4;
    if (t >= a && t < b) line = lines[k];
  }
  if (!line) return null;
  const y = cur.app === 'facetime' ? 1352 : cur.app === 'story' ? 1400 : 1524;
  return (
    <div style={{position: 'absolute', left: 450, top: y, translate: '-50% 0', padding: '12px 28px', borderRadius: 26, background: 'rgba(20,20,22,0.72)', color: '#fff', fontFamily: SANS, fontSize: 44, fontWeight: 700, whiteSpace: 'nowrap'}}>
      {line.map((w) => w.text).join(' ')}
    </div>
  );
};

const StatusBar: React.FC = () => {
  const t = useT();
  const cur = SCENES[sceneIndex(t)];
  const dark = cur.app === 'notes' || cur.app === 'notes2' || cur.app === 'calendar';
  const c = dark ? INK : '#fff';
  return (
    <>
      <div style={{position: 'absolute', left: 64, top: 30, fontFamily: SANS, fontSize: 34, fontWeight: 800, color: c}}>9:41</div>
      <div style={{position: 'absolute', left: SW / 2 - 125, top: 18, width: 250, height: 72, borderRadius: 36, background: '#000'}} />
      <div style={{position: 'absolute', right: 56, top: 38, display: 'flex', alignItems: 'flex-end', gap: 12}}>
        <div style={{display: 'flex', alignItems: 'flex-end', gap: 4}}>
          {[10, 15, 20, 25].map((h) => (
            <div key={h} style={{width: 7, height: h, borderRadius: 2, background: c}} />
          ))}
        </div>
        <div style={{width: 50, height: 25, borderRadius: 8, border: `3px solid ${c}`, boxSizing: 'border-box', padding: 3, opacity: 0.95}}>
          <div style={{width: '78%', height: '100%', borderRadius: 3, background: c}} />
        </div>
      </div>
    </>
  );
};

/** Little phone shakes on the notification and the alert. */
const shakeAt = (t: number) => {
  let dx = 0;
  for (const h of [C.face1.start + 0.05, 34.36]) {
    const d = t - h;
    if (d >= 0 && d < 0.45) dx += 10 * Math.exp(-d * 9) * Math.sin(d * 70);
  }
  return dx;
};

export const PhoneReel: React.FC = () => {
  const t = useT();
  return (
    <Base cfg={cfg}>
      <AbsoluteFill style={{background: 'radial-gradient(120% 80% at 50% 30%, #F8EFE4 0%, #EADCCB 100%)'}} />
      <div style={{position: 'absolute', left: PX, top: PY, width: SW + 2 * BEZ, height: SH + 2 * BEZ, borderRadius: 140, background: 'linear-gradient(160deg, #3A3A3C, #1C1C1E 40%, #2C2C2E)', boxShadow: '0 60px 120px rgba(80,55,30,0.35), inset 0 0 0 3px rgba(255,255,255,0.08)', translate: `${shakeAt(t)}px 0`}}>
        <div style={{position: 'absolute', left: BEZ, top: BEZ, width: SW, height: SH, borderRadius: 120, overflow: 'hidden', background: '#000'}}>
          <Apps />
          <Her />
          <Overlays />
          <LiveCaptions />
          <StatusBar />
        </div>
      </div>
    </Base>
  );
};
