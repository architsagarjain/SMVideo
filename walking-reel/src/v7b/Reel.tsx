import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {ICONS} from '../explainer/icons';
import {useT} from '../explainer/kit';
import {Base, Footage, Subject} from '../series/core';
import {outAt} from '../series/timemap';
import {EASE_IN, EASE_IN_OUT, EASE_OUT, FPS, SANS, SERIF, lerp, tween} from '../theme';
import {App, C, ITEMS, Rect, SCENES, TMP, phoneConfig as cfg} from './config';

/**
 * Snack reel, phone-screen style. Everything happens inside one iPhone: FaceTime with her, Notes,
 * Calculator, Calendar, an Instagram story and the Instagram comment sheet.
 */
const SW = 900, SH = 1600; // phone screen
const BEZ = 22; // titanium rim + black bezel
const PX = 540 - (SW / 2 + BEZ), PY = 960 - (SH / 2 + BEZ); // phone centred on the canvas
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
      {inside(t, C.face2) ? <NormalBehind /> : null}
      {inside(t, C.face2) ? <Subject cfg={cfg} /> : null}
    </div>
  );
};

// ===========================================================================
// The zoom: the reel opens full-frame and pulls back to the phone; mid-reel it pushes into the
// screen and plays as a normal full-frame talking video, then pulls back out.
// ===========================================================================
const BASE = 1.1; // phone size on the canvas
const FILL = 1080 / SW; // the screen exactly fills the canvas
const zoomAt = (t: number) => {
  const intro = 1 - tween(t, C.face1.start + 0.5, 0.65, EASE_IN_OUT);
  const mid = tween(t, C.face2.start, 0.55, EASE_IN_OUT) * (1 - tween(t, C.face2.end, 0.5, EASE_IN_OUT));
  return Math.max(intro, mid);
};

/** Behind her head while she is full-frame. */
const NormalBehind: React.FC = () => {
  const t = useT();
  const p = tween(t, 25.66, 0.55, EASE_OUT);
  const o = 1 - tween(t, C.face2.end - 0.3, 0.25, EASE_IN);
  if (t < 25.64) return null;
  return (
    <div style={{position: 'absolute', left: SW / 2, top: 640, translate: '-50% -50%', overflow: 'hidden', padding: '0 16px', opacity: o, filter: 'drop-shadow(0 0 26px rgba(0,0,0,0.45)) drop-shadow(0 8px 20px rgba(0,0,0,0.3))'}}>
      <div style={{translate: `0 ${lerp(p, 70, 0)}%`, scale: lerp(p, 1.12, 1), fontFamily: SANS, fontWeight: 800, fontSize: 200, letterSpacing: -10, lineHeight: 0.92, color: '#F6E7C1', whiteSpace: 'nowrap'}}>NOTHING</div>
    </div>
  );
};
/** Words in front of her in the full-frame part. */
const NormalFront: React.FC = () => {
  const t = useT();
  if (!inside(t, C.face2)) return null;
  const o = (a: number, b: number) => tween(t, a, 0.3) * (1 - tween(t, b, 0.22, EASE_IN));
  const chip = tween(t, 27.36, 0.35, EASE_OUT);
  return (
    <AbsoluteFill style={{pointerEvents: 'none', fontFamily: SANS}}>
      <div style={{position: 'absolute', left: SW / 2, top: 470, translate: '-50% -50%', opacity: o(24.48, 27.2), fontFamily: SERIF, fontStyle: 'italic', fontSize: 76, color: '#fff', whiteSpace: 'nowrap', textShadow: '0 0 30px rgba(0,0,0,0.5), 0 3px 8px rgba(0,0,0,0.4)'}}>and it felt like you ate</div>
      {chip > 0 ? (
        <div style={{position: 'absolute', left: SW / 2, top: 450, translate: '-50% -50%', display: 'flex', alignItems: 'center', gap: 16, padding: '16px 30px 16px 16px', borderRadius: 60, background: '#F6E7C1', boxShadow: '0 16px 40px rgba(0,0,0,0.35)', opacity: chip * (1 - tween(t, C.face2.end - 0.25, 0.2)), scale: lerp(chip, 0.7, 1)}}>
          <div style={{width: 64, height: 64, borderRadius: 16, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <svg viewBox="0 0 100 100" width={44} height={44}>
              <path d="M 22 52 L 42 70 L 78 32" fill="none" stroke="#F6E7C1" strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - tween(t, 27.5, 0.25)} />
            </svg>
          </div>
          <div style={{fontWeight: 800, fontSize: 58, color: INK, letterSpacing: -2, whiteSpace: 'nowrap'}}>I've done this too</div>
        </div>
      ) : null}
    </AbsoluteFill>
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

const Bubble: React.FC<{text: string; at: number; out: number; y: number; me?: boolean; typing?: number}> = ({text, at, out, y, me, typing}) => {
  const t = useT();
  const f = useCurrentFrame();
  if (typing !== undefined && t >= typing && t < at) {
    // iMessage typing indicator first
    const p = tween(t, typing, 0.25, EASE_OUT);
    return (
      <div style={{position: 'absolute', top: y, [me ? 'right' : 'left']: 30, padding: '26px 30px', borderRadius: 44, background: me ? BLUE : 'rgba(58,58,60,0.92)', display: 'flex', gap: 12, opacity: p, scale: lerp(p, 0.6, 1), transformOrigin: me ? 'right bottom' : 'left bottom', boxShadow: '0 10px 30px rgba(0,0,0,0.25)'}}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{width: 18, height: 18, borderRadius: 9, background: '#fff', opacity: 0.45 + 0.55 * Math.max(0, Math.sin((f / 30) * 9 - i * 0.9))}} />
        ))}
      </div>
    );
  }
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
      {cur.app === 'facetime' && cur.w !== C.face2 ? <FaceTimeUI w={cur.w} /> : null}
      <NormalFront />
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
      <Bubble text="that sounds wrong" at={4.88} out={C.face1.end - 0.15} y={250} typing={4.4} />
      <Bubble text="hear me out" at={5.98} out={C.face1.end - 0.15} y={370} me typing={5.5} />
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
  if (t < 4.3) return null; // the hook banner + collage carry the words
  const y = cur.app === 'facetime' ? 1290 : cur.app === 'story' ? 1360 : 1450;
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
  const o = 1 - zoomAt(t);
  const IW = 290, IH = 84; // Dynamic Island
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: SW / 2 - IW / 2, top: 24, width: IW, height: IH, borderRadius: IH / 2, background: '#000', opacity: o}}>
        <div style={{position: 'absolute', right: 26, top: IH / 2 - 13, width: 26, height: 26, borderRadius: 13, background: 'radial-gradient(circle at 40% 40%, #2A3444 0%, #0B0E14 60%)'}} />
      </div>
      <div style={{opacity: o}}>
        <div style={{position: 'absolute', left: 0, width: SW / 2 - IW / 2, top: 38, textAlign: 'center', fontFamily: SANS, fontSize: 40, fontWeight: 700, letterSpacing: -0.5, color: c}}>9:41</div>
        <div style={{position: 'absolute', right: 0, width: SW / 2 - IW / 2, top: 46, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12}}>
          <div style={{display: 'flex', alignItems: 'flex-end', gap: 4, height: 26}}>
            {[10, 15, 20, 26].map((h) => (
              <div key={h} style={{width: 7, height: h, borderRadius: 2, background: c}} />
            ))}
          </div>
          <svg viewBox="0 0 40 30" width={36} height={27}>
            <path d="M 20 27 L 26 20 A 9 9 0 0 0 14 20 Z" fill={c} />
            <path d="M 9 15 A 16 16 0 0 1 31 15" stroke={c} strokeWidth={4.5} fill="none" strokeLinecap="round" />
            <path d="M 3 9 A 24 24 0 0 1 37 9" stroke={c} strokeWidth={4.5} fill="none" strokeLinecap="round" />
          </svg>
          <div style={{display: 'flex', alignItems: 'center', gap: 2}}>
            <div style={{width: 52, height: 26, borderRadius: 8, border: `2.5px solid ${dark ? 'rgba(17,17,17,0.45)' : 'rgba(255,255,255,0.5)'}`, boxSizing: 'border-box', padding: 2.5}}>
              <div style={{width: '82%', height: '100%', borderRadius: 4, background: c}} />
            </div>
            <div style={{width: 4, height: 9, borderRadius: '0 3px 3px 0', background: dark ? 'rgba(17,17,17,0.45)' : 'rgba(255,255,255,0.5)'}} />
          </div>
        </div>
        {/* home indicator */}
        <div style={{position: 'absolute', left: SW / 2 - 150, bottom: 16, width: 300, height: 10, borderRadius: 5, background: dark ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.9)'}} />
      </div>
    </AbsoluteFill>
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

/** Everything inside Base, so useT() reads source time through the time map. */
/** Macro close-ups into the phone (reference-style): focus point in screen coords, zoom amount. */
const MACROS = [
  {a: 7.45, b: 11.6, m: 1.75, fx: 330, fy: (t: number) => (t < 9.2 ? 415 : 470)}, // Notes: breakfast, fruit being typed
  {a: 22.05, b: 23.45, m: 1.55, fx: 560, fy: () => 420}, // Calculator: = 520
  {a: 31.85, b: 33.0, m: 1.45, fx: 330, fy: () => 600}, // Notes: green ticks
];
const macroAt = (t: number) => {
  for (const mc of MACROS) {
    if (t >= mc.a && t < mc.b + 0.5) {
      const k = tween(t, mc.a, 0.5, EASE_IN_OUT) * (1 - tween(t, mc.b, 0.5, EASE_IN_OUT));
      return {k, m: mc.m, fx: mc.fx, fy: mc.fy(t)};
    }
  }
  return {k: 0, m: 1, fx: SW / 2, fy: SH / 2};
};
const Mat: React.FC = () => (
  <AbsoluteFill style={{background: '#0E3B2C'}}>
    <AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.07) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.07) 2px, transparent 2px)', backgroundSize: '45px 45px'}} />
    <AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.16) 3px, transparent 3px), linear-gradient(90deg, rgba(255,255,255,0.16) 3px, transparent 3px)', backgroundSize: '225px 225px'}} />
    <AbsoluteFill style={{background: 'radial-gradient(80% 60% at 50% 45%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)'}} />
  </AbsoluteFill>
);
/** Cut-paper collage letters (reference-style), dropped over her in the hook. */
const PAPER = [
  {ch: 'S', bg: '#FFFFFF', fg: '#C21DFF', at: 1.36},
  {ch: 'T', bg: '#E9D5FF', fg: '#111111', at: 1.46},
  {ch: 'O', bg: '#111111', fg: '#FFFFFF', at: 1.56},
  {ch: 'P', bg: '#FFFFFF', fg: '#C21DFF', at: 1.66},
];
const Collage: React.FC = () => {
  const t = useT();
  if (t < 1.3 || t > 4.4) return null;
  const out = 1 - tween(t, 4.0, 0.3, EASE_IN);
  return (
    <div style={{position: 'absolute', left: 540, top: 1300, translate: '-50% -50%', display: 'flex', gap: 14, opacity: out}}>
      {PAPER.map((p, i) => {
        const q = tween(t, p.at, 0.22, EASE_IN);
        if (t < p.at) return <div key={i} style={{width: 200, height: 250}} />;
        return (
          <div key={i} style={{width: 200, height: 250, background: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 210, color: p.fg, lineHeight: 1, translate: `0 ${i % 2 ? 14 : -10}px`, scale: lerp(q, 1.7, 1), opacity: q, boxShadow: '0 14px 30px rgba(0,0,0,0.35)', clipPath: 'polygon(2% 4%, 18% 0%, 40% 3%, 63% 0%, 85% 2%, 100% 6%, 97% 30%, 100% 55%, 98% 80%, 100% 97%, 78% 100%, 55% 96%, 30% 100%, 8% 97%, 0% 100%, 3% 72%, 0% 45%, 2% 20%)'}}>
            {p.ch}
          </div>
        );
      })}
    </div>
  );
};

const PhoneScene: React.FC = () => {
  const t = useT();
  const z = zoomAt(t);
  const mac = macroAt(t);
  // canvas position of the macro focus point (before any scaling)
  const ox = PX + BEZ + mac.fx, oy = PY + BEZ + mac.fy;
  const scale = lerp(z, BASE, FILL);
  const radius = lerp(z, 128, 0);
  const moving = z > 0.02 && z < 0.98;
  const blur = moving ? 7 * Math.sin(Math.PI * z) : 0;
  const W = SW + 2 * BEZ, H = SH + 2 * BEZ;
  const btn = (side: 'l' | 'r', top: number, h: number) => (
    <div style={{position: 'absolute', [side === 'l' ? 'left' : 'right']: -7, top, width: 9, height: h, borderRadius: 4, background: 'linear-gradient(to right, #6E6E73, #C7C7CC 50%, #6E6E73)'}} />
  );
  const phoneLayer = (
      <AbsoluteFill style={{scale, transformOrigin: '540px 960px', translate: `${shakeAt(t)}px 0`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined}}>
      <AbsoluteFill style={{transformOrigin: `${ox}px ${oy}px`, scale: lerp(mac.k, 1, mac.m), translate: `${(540 - ox) * mac.k}px ${(960 - oy) * mac.k}px`}}>
        <div style={{position: 'absolute', left: PX, top: PY, width: W, height: H}}>
          {/* side buttons */}
          {btn('l', 300, 62)}
          {btn('l', 420, 120)}
          {btn('l', 570, 120)}
          {btn('r', 470, 190)}
          {/* titanium rim */}
          <div style={{position: 'absolute', inset: 0, borderRadius: 150, background: 'linear-gradient(135deg, #A1A1A6 0%, #E5E5EA 18%, #8E8E93 40%, #D1D1D6 62%, #7C7C80 82%, #C7C7CC 100%)', boxShadow: '0 50px 110px rgba(80,55,30,0.35)'}} />
          {/* black bezel */}
          <div style={{position: 'absolute', inset: 6, borderRadius: 144, background: '#050505'}} />
          {/* screen */}
          <div style={{position: 'absolute', left: BEZ, top: BEZ, width: SW, height: SH, borderRadius: radius, overflow: 'hidden', background: '#000'}}>
            <Apps />
            <Her />
            <Overlays />
            <LiveCaptions />
            <StatusBar />
            {/* glass sheen */}
            <AbsoluteFill style={{background: 'linear-gradient(125deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 28%)', opacity: 1 - z, pointerEvents: 'none'}} />
          </div>
        </div>
      </AbsoluteFill>
      </AbsoluteFill>
  );
  return (
    <>
      <Mat />
      {mac.k > 0.01 ? (
        <>
          {/* macro depth of field: a blurred copy, with the sharp phone masked to the middle band */}
          <AbsoluteFill style={{filter: `blur(${9 * mac.k}px)`}}>{phoneLayer}</AbsoluteFill>
          <AbsoluteFill style={{maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 4%, #000 34%, #000 66%, rgba(0,0,0,0) 96%)', WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 4%, #000 34%, #000 66%, rgba(0,0,0,0) 96%)'}}>{phoneLayer}</AbsoluteFill>
          <AbsoluteFill style={{background: `radial-gradient(70% 45% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,${0.35 * mac.k}) 100%)`}} />
        </>
      ) : (
        phoneLayer
      )}
      <Collage />
    </>
  );
};

export const PhoneReel: React.FC = () => (
  <Base cfg={cfg}>
    <PhoneScene />
  </Base>
);
