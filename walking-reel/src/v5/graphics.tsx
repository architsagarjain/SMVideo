import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ICONS} from '../explainer/icons';
import {useT} from '../explainer/kit';
import {EASE_IN, EASE_IN_OUT, EASE_OUT, SANS, SERIF, lerp, tween} from '../theme';
import {C, TIPS} from './config';

/**
 * 3-tips reel graphics: one straight element at a time in cream bold sans + white italic serif.
 * Tip headings: the background dims, a giant number rises behind her head, the title lands in front.
 */
const CREAM = '#F6E7C1';
const INK = '#1B1714';
const PAPER = '#F7F5F1';
const SHADOW = '0 4px 28px rgba(0,0,0,0.45), 0 2px 6px rgba(0,0,0,0.35)';
type Win = {start: number; end: number};
const inside = (t: number, w: Win) => t >= w.start && t < w.end;

const Word: React.FC<{text: string; at: number; out: number; y: number; x?: number; size: number; serif?: boolean; color?: string; align?: 'center' | 'left'; shadow?: boolean}> = ({
  text,
  at,
  out,
  y,
  x = 540,
  size,
  serif,
  color,
  align = 'center',
  shadow = true,
}) => {
  const t = useT();
  if (t < at - 0.02 || t > out + 0.25) return null;
  const p = tween(t, at, 0.35, EASE_OUT);
  const o = Math.min(1, p * 1.4) * (1 - tween(t, out, 0.22, EASE_IN));
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        translate: `${align === 'center' ? '-50%' : '0%'} ${lerp(p, -30, -50)}%`,
        opacity: o,
        fontFamily: serif ? SERIF : SANS,
        fontStyle: serif ? 'italic' : 'normal',
        fontWeight: serif ? 400 : 800,
        fontSize: size,
        letterSpacing: serif ? -1 : -3,
        lineHeight: 1,
        color: color ?? (serif ? '#FFFFFF' : CREAM),
        textShadow: shadow ? SHADOW : undefined,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </div>
  );
};

const Glyph: React.FC<{name: string; size: number; color: string}> = ({name, size, color}) => (
  <svg viewBox="0 0 256 256" width={size} height={size} style={{display: 'block'}}>
    {ICONS[name].map((d, k) => (
      <path key={k} d={d} fill={color} />
    ))}
  </svg>
);

const Check: React.FC<{size: number; p: number; fill?: string; stroke?: string}> = ({size, p, fill = CREAM, stroke = INK}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{display: 'block'}}>
    <circle cx={50} cy={50} r={46} fill={fill} />
    <path d="M 28 52 L 44 67 L 73 36" fill="none" stroke={stroke} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
  </svg>
);

const TopShade: React.FC<{o: number}> = ({o}) =>
  o > 0 ? <AbsoluteFill style={{opacity: o, background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.25) 24%, rgba(0,0,0,0) 40%)'}} /> : null;
const fadeIn = (t: number, w: Win, d = 0.3) => tween(t, w.start, d) * (1 - tween(t, w.end - 0.25, 0.25));

// ===========================================================================
// Behind her head (between the footage and her cut-out)
// ===========================================================================
export const V5Behind: React.FC = () => {
  const t = useT();
  const tip = TIPS.find((k) => inside(t, k.w));
  return (
    <>
      {/* talking-head words: dim the poster wall behind her so they read */}
      {[C.third, C.wins, C.something, C.should, C.done].map((w, i) =>
        inside(t, w) ? <AbsoluteFill key={i} style={{background: 'linear-gradient(to bottom, rgba(10,8,6,0.62) 0%, rgba(10,8,6,0.45) 45%, rgba(10,8,6,0.3) 100%)', opacity: fadeIn(t, w)}} /> : null,
      )}
      {/* "here are my 3 tips" */}
      {inside(t, C.three) ? (
        <>
          <AbsoluteFill style={{background: 'rgba(10,8,6,0.35)', opacity: fadeIn(t, C.three)}} />
          <Rise text="3" at={3.36} out={C.three.end - 0.2} y={560} size={640} />
        </>
      ) : null}
      {/* tip heading: dim the wall, giant number rises behind her */}
      {tip ? (
        <>
          <AbsoluteFill style={{background: 'radial-gradient(90% 70% at 50% 40%, rgba(10,8,6,0.45) 0%, rgba(10,8,6,0.6) 100%)', opacity: fadeIn(t, tip.w, 0.25)}} />
          <Rise text={tip.n} at={tip.at} out={tip.w.end - 0.2} y={560} size={560} />
        </>
      ) : null}
      {/* CTA */}
      {t >= C.cta.start ? (
        <>
          <AbsoluteFill style={{background: 'rgba(10,8,6,0.3)', opacity: tween(t, C.cta.start, 0.3)}} />
          <Rise text="FAT LOSS" at={48.88} out={999} y={600} size={210} />
        </>
      ) : null}
    </>
  );
};

/** A huge cream word that wipes up out of a mask and settles. */
const Rise: React.FC<{text: string; at: number; out: number; y: number; size: number}> = ({text, at, out, y, size}) => {
  const t = useT();
  if (t < at - 0.02 || t > out + 0.3) return null;
  const p = tween(t, at, 0.55, EASE_OUT);
  const o = 1 - tween(t, out, 0.25, EASE_IN);
  return (
    <div style={{position: 'absolute', left: 540, top: y, translate: '-50% -50%', overflow: 'hidden', padding: '0 20px', opacity: o}}>
      <div
        style={{
          translate: `0 ${lerp(p, 70, 0)}%`,
          scale: lerp(p, 1.12, 1),
          fontFamily: SANS,
          fontWeight: 800,
          fontSize: size,
          letterSpacing: -size * 0.05,
          lineHeight: 0.92,
          color: CREAM,
          textShadow: '0 10px 60px rgba(0,0,0,0.35)',
          whiteSpace: 'nowrap',
        }}
      >
        {text}
      </div>
    </div>
  );
};

// ===========================================================================
// In front of her
// ===========================================================================
/** Title words rise in one after another; a thin rule draws under the "TIP" label. */
const TipFront: React.FC<{tip: (typeof TIPS)[number]}> = ({tip}) => {
  const t = useT();
  const out = tip.w.end - 0.2;
  const o = 1 - tween(t, out, 0.22, EASE_IN);
  const lab = tween(t, tip.at, 0.4, EASE_OUT);
  const words = tip.title.split(' ');
  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity: o}}>
      {/* TIP label with rules either side */}
      <div style={{position: 'absolute', left: 540, top: 205, translate: '-50% 0', display: 'flex', alignItems: 'center', gap: 22, opacity: lab}}>
        <div style={{width: 110 * lab, height: 3, background: CREAM, borderRadius: 2}} />
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 42, letterSpacing: 14, color: CREAM, textShadow: SHADOW}}>TIP</div>
        <div style={{width: 110 * lab, height: 3, background: CREAM, borderRadius: 2}} />
      </div>
      {/* title */}
      <div style={{position: 'absolute', left: 540, top: 1185, translate: '-50% 0', display: 'flex', gap: 26, whiteSpace: 'nowrap'}}>
        {words.map((w, i) => {
          const p = tween(t, tip.titleAt + i * 0.12, 0.42, EASE_OUT);
          return (
            <div key={i} style={{overflow: 'hidden', padding: '6px 4px'}}>
              <div style={{translate: `0 ${lerp(p, 105, 0)}%`, fontFamily: SANS, fontWeight: 800, fontSize: 112, letterSpacing: -3, lineHeight: 1, color: CREAM, textShadow: SHADOW}}>{w}</div>
            </div>
          );
        })}
      </div>
      {tip.sub ? <Word text={tip.sub} at={tip.subAt} out={out} y={1360} size={78} serif /> : null}
    </AbsoluteFill>
  );
};

export const V5Talk: React.FC = () => {
  const t = useT();
  const tip = TIPS.find((k) => inside(t, k.w));
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {/* "here are my 3 tips" */}
      {inside(t, C.three) ? <Word text="tips" at={3.54} out={C.three.end - 0.2} y={1080} size={150} serif /> : null}
      {/* "the third one changed things for me the most": three markers, #3 lights up */}
      {inside(t, C.third) ? <ThreeDots /> : null}
      {tip ? <TipFront tip={tip} /> : null}
      {/* "small wins build momentum" */}
      {inside(t, C.wins) ? <Wins /> : null}
      {/* "just do something" */}
      {inside(t, C.something) ? (
        <>
          <Word text="JUST DO" at={20.68} out={C.something.end - 0.2} y={250} size={140} />
          <Word text="something" at={21.06} out={C.something.end - 0.2} y={385} size={120} serif />
        </>
      ) : null}
      {/* "something you don't want to do but you know you should" */}
      {inside(t, C.should) ? <Should /> : null}
      {/* "the hard thing was already done" */}
      {inside(t, C.done) ? <Done /> : null}
      {/* CTA (front): Comment above the giant word, guide line under the comment box */}
      {t >= C.cta.start ? (
        <>
          <Word text="Comment" at={48.66} out={999} y={390} size={96} serif />
          <Word text="for my free fat loss guide" at={50.64} out={999} y={1480} size={50} color="#FFFFFF" />
        </>
      ) : null}
    </AbsoluteFill>
  );
};

const ThreeDots: React.FC = () => {
  const t = useT();
  const o = 1 - tween(t, C.third.end - 0.25, 0.22, EASE_IN);
  const lit = tween(t, 4.42, 0.4, EASE_OUT);
  return (
    <>
      <div style={{position: 'absolute', left: 540, top: 230, translate: '-50% 0', display: 'flex', gap: 46, opacity: o}}>
        {[1, 2, 3].map((n, i) => {
          const p = tween(t, 4.3 + i * 0.08, 0.35, EASE_OUT);
          const on = n === 3 ? lit : 0;
          return (
            <div
              key={n}
              style={{
                width: 150,
                height: 150,
                borderRadius: '50%',
                border: `5px solid ${CREAM}`,
                background: on > 0 ? `rgba(246,231,193,${on})` : 'rgba(0,0,0,0.25)',
                boxShadow: on > 0 ? `0 0 ${60 * on}px rgba(246,231,193,${0.7 * on})` : undefined,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: SANS,
                fontWeight: 800,
                fontSize: 78,
                color: on > 0.5 ? INK : CREAM,
                opacity: p,
                scale: lerp(p, 0.6, 1) * (1 + 0.14 * on),
              }}
            >
              {n}
            </div>
          );
        })}
      </div>
      <Word text="changed everything for me" at={5.0} out={C.third.end - 0.25} y={445} size={72} serif />
    </>
  );
};

const Wins: React.FC = () => {
  const t = useT();
  const o = 1 - tween(t, C.wins.end - 0.25, 0.22, EASE_IN);
  const m = tween(t, 10.86, 0.5, EASE_OUT);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o}}>
      <div style={{position: 'absolute', left: 540, top: 170, translate: '-50% 0', display: 'flex', gap: 30}}>
        {[9.86, 10.1, 10.44].map((at, i) => {
          const p = tween(t, at, 0.35, EASE_OUT);
          return (
            <div key={i} style={{opacity: Math.min(1, p * 2), scale: lerp(p, 0.5, 1), filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.3))'}}>
              <Check size={110} p={tween(t, at + 0.1, 0.3, EASE_OUT)} />
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 540, top: 330, translate: '-50% 0', display: 'flex', alignItems: 'center', gap: 18, opacity: m}}>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 118, letterSpacing: -3, color: CREAM, textShadow: SHADOW, lineHeight: 1}}>MOMENTUM</div>
        <svg width={100} height={100} viewBox="0 0 100 100" style={{filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.35))'}}>
          <path d="M 14 86 L 84 16 M 40 16 L 84 16 L 84 60" fill="none" stroke={CREAM} strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - m} />
        </svg>
      </div>
    </div>
  );
};

const Should: React.FC = () => {
  const t = useT();
  const out = C.should.end - 0.2;
  const strike = tween(t, 35.24, 0.3, EASE_IN_OUT);
  const ok = tween(t, 35.88, 0.35, EASE_OUT);
  return (
    <>
      <Word text="don't want to" at={34.2} out={out} y={235} size={100} serif />
      {strike > 0 ? <div style={{position: 'absolute', left: 540 - 290, top: 240, width: 580 * strike, height: 10, borderRadius: 5, background: '#FF5A4E', opacity: 1 - tween(t, out, 0.22, EASE_IN)}} /> : null}
      <div style={{position: 'absolute', left: 540, top: 330, translate: '-50% 0', display: 'flex', alignItems: 'center', gap: 22, opacity: ok * (1 - tween(t, out, 0.22, EASE_IN)), whiteSpace: 'nowrap'}}>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 84, letterSpacing: -2, color: CREAM, textShadow: SHADOW, lineHeight: 1}}>KNOW YOU SHOULD</div>
        <Check size={84} p={tween(t, 36.02, 0.3, EASE_OUT)} />
      </div>
    </>
  );
};

const Done: React.FC = () => {
  const t = useT();
  const out = C.done.end - 0.2;
  const o = 1 - tween(t, out, 0.22, EASE_IN);
  const box = tween(t, 46.6, 0.35, EASE_OUT);
  const tick = tween(t, 47.64, 0.3, EASE_OUT);
  return (
    <div style={{position: 'absolute', left: 540, top: 215, translate: '-50% 0', display: 'flex', alignItems: 'center', gap: 30, opacity: o * box, whiteSpace: 'nowrap'}}>
      <div style={{width: 120, height: 120, borderRadius: 26, border: `7px solid ${CREAM}`, background: tick > 0 ? CREAM : 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', scale: 1 + 0.12 * Math.sin(Math.PI * tick)}}>
        <svg width={84} height={84} viewBox="0 0 100 100">
          <path d="M 18 52 L 40 73 L 82 28" fill="none" stroke={INK} strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - tick} />
        </svg>
      </div>
      <div style={{lineHeight: 1}}>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 64, color: '#fff', textShadow: SHADOW}}>the hard thing</div>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 112, letterSpacing: -3, color: CREAM, textShadow: SHADOW, marginTop: 6, opacity: tween(t, 47.6, 0.3)}}>DONE</div>
      </div>
    </div>
  );
};

/** Small top chip that keeps the current tip on screen after its heading. */
export const V5Chip: React.FC = () => {
  const t = useT();
  const k = TIPS.findIndex((x) => t >= x.w.end && t < x.chipEnd);
  if (k < 0) return null;
  const tip = TIPS[k];
  const p = tween(t, tip.w.end, 0.35, EASE_OUT) * (1 - tween(t, tip.chipEnd - 0.2, 0.2, EASE_IN));
  return (
    <div style={{position: 'absolute', left: 40, top: 70, display: 'flex', alignItems: 'center', gap: 14, padding: '12px 26px 12px 12px', borderRadius: 40, background: 'rgba(20,17,14,0.72)', opacity: p, translate: `${lerp(p, -30, 0)}px 0`, fontFamily: SANS}}>
      <div style={{width: 54, height: 54, borderRadius: '50%', background: CREAM, color: INK, fontWeight: 800, fontSize: 26, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{tip.n}</div>
      <div style={{color: '#fff', fontWeight: 700, fontSize: 32, whiteSpace: 'nowrap'}}>{tip.chip}</div>
    </div>
  );
};

// ===========================================================================
// Over the B-roll
// ===========================================================================
export const V5Broll: React.FC = () => {
  const t = useT();
  const top = [C.open, C.gym, C.home, C.hiit, C.focus].find((w) => inside(t, w));
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {top ? <TopShade o={1} /> : null}
      {inside(t, C.skip) || inside(t, C.morning) ? <AbsoluteFill style={{background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.2) 28%, rgba(0,0,0,0) 42%)'}} /> : null}
      {/* hook */}
      {inside(t, C.open) ? (
        <>
          <Word text="BUSY?" at={0.86} out={C.open.end - 0.1} y={190} size={200} />
          <Word text="no time for health?" at={1.72} out={C.open.end - 0.1} y={345} size={92} serif />
        </>
      ) : null}
      {inside(t, C.gym) ? <Word text="NO GYM?" at={12.32} out={C.gym.end - 0.05} y={230} size={170} /> : null}
      {inside(t, C.home) ? (
        <>
          <Word text="work out" at={C.home.start} out={C.home.end - 0.05} y={185} size={96} serif />
          <Word text="AT HOME" at={C.home.start + 0.1} out={C.home.end - 0.05} y={310} size={150} />
        </>
      ) : null}
      {inside(t, C.hiit) ? <Timer /> : null}
      {inside(t, C.skip) ? (
        <>
          <Word text="stop skipping" at={24.34} out={C.skip.end - 0.1} y={1270} size={96} serif />
          <Word text="MEALS" at={24.94} out={C.skip.end - 0.1} y={1400} size={170} />
        </>
      ) : null}
      {inside(t, C.morning) ? <Alarm /> : null}
      {inside(t, C.focus) ? (
        <>
          <Word text="FOCUS" at={45.0} out={C.focus.end - 0.1} y={200} size={190} />
          <Word text="for the rest of the day" at={45.2} out={C.focus.end - 0.1} y={350} size={80} serif />
        </>
      ) : null}
    </AbsoluteFill>
  );
};

/** "a quick 10 minute HIIT": a ring fills while the minutes run down. */
const Timer: React.FC = () => {
  const t = useT();
  const p = tween(t, 16.3, 0.4, EASE_OUT);
  const run = tween(t, 16.5, C.hiit.end - 16.6, EASE_IN_OUT);
  const secs = Math.round(lerp(run, 600, 540));
  const mm = Math.floor(secs / 60);
  const ss = String(secs % 60).padStart(2, '0');
  const R = 150;
  const L = 2 * Math.PI * R;
  return (
    <div style={{position: 'absolute', left: 540, top: 430, translate: '-50% -50%', opacity: p * (1 - tween(t, C.hiit.end - 0.1, 0.1)), scale: lerp(p, 0.85, 1)}}>
      <svg width={360} height={360} viewBox="0 0 360 360" style={{display: 'block', filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.4))'}}>
        <circle cx={180} cy={180} r={R} fill="rgba(20,17,14,0.55)" stroke="rgba(255,255,255,0.25)" strokeWidth={16} />
        <circle cx={180} cy={180} r={R} fill="none" stroke={CREAM} strokeWidth={16} strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - (0.15 + 0.85 * run))} transform="rotate(-90 180 180)" />
      </svg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, color: CREAM, lineHeight: 1}}>
        <div style={{fontWeight: 800, fontSize: 96, letterSpacing: -2, fontVariantNumeric: 'tabular-nums'}}>
          {mm}:{ss}
        </div>
        <div style={{fontWeight: 800, fontSize: 36, letterSpacing: 8, marginTop: 10, color: '#fff'}}>HIIT</div>
      </div>
    </div>
  );
};

/** "moving my workouts to early morning before work": an alarm chip, then BEFORE WORK. */
const Alarm: React.FC = () => {
  const t = useT();
  const p = tween(t, 39.3, 0.4, EASE_OUT);
  const out = 1 - tween(t, C.morning.end - 0.15, 0.15, EASE_IN);
  const ring = Math.sin(t * 40) * 6 * (1 - tween(t, 39.5, 0.8));
  return (
    <>
      <div style={{position: 'absolute', left: 540, top: 1180, translate: `-50% ${lerp(p, 30, 0)}px`, opacity: p * out, display: 'flex', alignItems: 'center', gap: 22, padding: '20px 40px 20px 24px', borderRadius: 70, background: 'rgba(255,255,255,0.96)', boxShadow: '0 20px 50px rgba(0,0,0,0.35)', fontFamily: SANS}}>
        <div style={{width: 84, height: 84, borderRadius: '50%', background: '#FF9F0A', display: 'flex', alignItems: 'center', justifyContent: 'center', rotate: `${ring}deg`}}>
          <Glyph name="alarm" size={54} color="#fff" />
        </div>
        <div style={{fontWeight: 800, fontSize: 84, color: INK, letterSpacing: -2, fontVariantNumeric: 'tabular-nums'}}>5:30 AM</div>
      </div>
      <Word text="BEFORE WORK" at={40.02} out={C.morning.end - 0.15} y={1390} size={120} />
    </>
  );
};

// ===========================================================================
// Full-screen cutaway: the skip-lunch loop
// ===========================================================================
const LOOP_R = 330, LCX = 540, LCY = 1000;
const at = (d: number) => ({x: LCX + LOOP_R * Math.cos((d * Math.PI) / 180), y: LCY + LOOP_R * Math.sin((d * Math.PI) / 180)});
const NODES = [
  {at: 26.04, icon: 'fork-knife', label: 'Skip lunch', ...at(-90), below: false},
  {at: 27.46, icon: 'moon', label: 'Overeat at night', ...at(30), below: true},
  {at: 28.86, icon: 'arrow-right', label: 'Repeat', ...at(150), below: true},
];
const arcPath = (a0: number, a1: number) => {
  const p = (a: number) => [LCX + LOOP_R * Math.cos(a), LCY + LOOP_R * Math.sin(a)];
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  return `M ${x0} ${y0} A ${LOOP_R} ${LOOP_R} 0 0 1 ${x1} ${y1}`;
};
const deg = (d: number) => (d * Math.PI) / 180;
// node angles: top -90, bottom-right 30, bottom-left 150 (clockwise); arcs leave a gap around each node
const ARCS = [
  {d: arcPath(deg(-90 + 22), deg(30 - 22)), at: 26.7},
  {d: arcPath(deg(30 + 22), deg(150 - 22)), at: 28.1},
  {d: arcPath(deg(150 + 22), deg(270 - 22)), at: 29.1},
];

export const V5Loop: React.FC = () => {
  const t = useT();
  if (!inside(t, C.loop)) return null;
  const e = tween(t, C.loop.start, 0.22);
  const spin = t > 29.6 ? (t - 29.6) * 140 : 0;
  return (
    <AbsoluteFill style={{background: `radial-gradient(90% 60% at 50% 45%, #FFFFFF 0%, ${PAPER} 70%, #EDE8E0 100%)`, opacity: e}}>
      <Word text="the skip-lunch loop" at={C.loop.start + 0.05} out={999} y={330} size={100} serif color={INK} shadow={false} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <defs>
          <marker id="ah" viewBox="0 0 10 10" refX={6} refY={5} markerWidth={5} markerHeight={5} orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={INK} />
          </marker>
        </defs>
        {ARCS.map((a, i) => {
          const p = tween(t, a.at, 0.6, EASE_IN_OUT);
          return p > 0 ? <path key={i} d={a.d} fill="none" stroke={INK} strokeWidth={12} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} markerEnd={p > 0.95 ? 'url(#ah)' : undefined} opacity={0.85} /> : null;
        })}
      </svg>
      {/* a dot runs round the loop once it closes */}
      {spin > 0 ? (
        <div style={{position: 'absolute', left: LCX, top: LCY, width: 0, height: 0, rotate: `${-90 + spin}deg`}}>
          <div style={{position: 'absolute', left: LOOP_R - 18, top: -18, width: 36, height: 36, borderRadius: '50%', background: '#FF5A4E', boxShadow: '0 0 20px rgba(255,90,78,0.6)'}} />
        </div>
      ) : null}
      {NODES.map((n, i) => {
        const p = tween(t, n.at, 0.4, EASE_OUT);
        if (p <= 0) return null;
        return (
          <div key={i} style={{position: 'absolute', left: n.x, top: n.y, translate: '-50% -50%', width: 170, height: 170, opacity: Math.min(1, p * 2), scale: lerp(p, 0.6, 1)}}>
            <div style={{width: 170, height: 170, borderRadius: '50%', background: i === 2 ? '#FF5A4E' : INK, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 16px 40px rgba(40,30,20,0.25)'}}>
              <Glyph name={n.icon} size={88} color="#fff" />
            </div>
            <div style={{position: 'absolute', left: '50%', top: n.below ? 196 : -80, translate: '-50% 0', fontFamily: SANS, fontWeight: 800, fontSize: 56, color: INK, letterSpacing: -1, whiteSpace: 'nowrap'}}>{n.label}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ===========================================================================
// CTA: comment box types FAT LOSS and sends
// ===========================================================================
export const V5Comment: React.FC = () => {
  const t = useT();
  if (t < C.cta.start + 0.08) return null;
  const word = 'FAT LOSS';
  const p = tween(t, 48.66, 0.4, EASE_OUT);
  const typed = word.slice(0, Math.max(0, Math.min(word.length, Math.floor((t - 48.9) / 0.07) + 1)));
  const sent = tween(t, 49.62, 0.25, EASE_OUT);
  const caret = typed.length > 0 && sent === 0 && Math.floor(t * 3) % 2 === 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: 90,
        top: 1300,
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
