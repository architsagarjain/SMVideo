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
const SHADOW = '0 0 34px rgba(0,0,0,0.55), 0 0 70px rgba(0,0,0,0.35), 0 3px 8px rgba(0,0,0,0.45)';
type Win = {start: number; end: number};
const inside = (t: number, w: Win) => t >= w.start && t < w.end;

/** Cream text with one white light sweep passing across it, starting at `at`. */
const shine = (t: number, at: number, dur = 0.7): React.CSSProperties => {
  const p = tween(t, at, dur, EASE_IN_OUT);
  return {
    color: 'transparent',
    backgroundImage: `linear-gradient(105deg, ${CREAM} 0%, ${CREAM} 40%, #FFFFFF 50%, ${CREAM} 60%, ${CREAM} 100%)`,
    backgroundSize: '300% 100%',
    backgroundPosition: `${lerp(p, 100, 0)}% 0`,
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
  };
};

const INK_T = INK;
/** Ink text with one soft light sweep passing across it. */
const shineInk = (t: number, at: number, dur = 0.7): React.CSSProperties => {
  const p = tween(t, at, dur, EASE_IN_OUT);
  return {
    color: 'transparent',
    backgroundImage: `linear-gradient(105deg, ${INK} 0%, ${INK} 40%, #8A847C 50%, ${INK} 60%, ${INK} 100%)`,
    backgroundSize: '300% 100%',
    backgroundPosition: `${lerp(p, 100, 0)}% 0`,
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
  };
};

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
// White wash over the top of the frame wherever words sit on the wall (replaces the blur)
// ===========================================================================
const WASH: Win[] = [C.open, C.intro, ...TIPS.map((k) => k.w), C.wins, C.home, C.something, C.should, C.done, C.cta];
export const V5Wash: React.FC = () => {
  const t = useT();
  let o = 0;
  for (const w of WASH) if (t >= w.start - 0.01 && t < w.end + 0.3) o = Math.max(o, (w.start < 1 ? 1 : tween(t, w.start, 0.25)) * (1 - tween(t, w.end - 0.05, 0.3)));
  if (o <= 0) return null;
  return <AbsoluteFill style={{opacity: o, background: 'linear-gradient(to bottom, rgba(244,241,235,0.97) 0%, rgba(244,241,235,0.92) 26%, rgba(244,241,235,0) 42%)'}} />;
};

// ===========================================================================
// Behind her head (between the footage and her cut-out)
// ===========================================================================
export const V5Behind: React.FC = () => {
  const t = useT();
  const tip = TIPS.find((k) => inside(t, k.w));
  return (
    <>
      {/* hook: a giant BUSY? behind her head on the very first frame */}
      {inside(t, C.open) ? <Rise text="BUSY?" at={C.open.start - 0.3} out={C.open.end - 0.12} x={540} y={590} size={300} ink={0} /> : null}
      {/* tip heading: giant number rises behind her head */}
      {tip ? <Rise text={tip.n} at={tip.at} out={tip.w.end - 0.2} x={tip.hx} y={615} size={520} ink={tip.n === '01' ? -1 : 13} /> : null}
      {/* CTA */}
      {t >= C.cta.start ? <Rise text="FAT LOSS" at={48.88} out={999} x={540} y={610} size={172} ink={0} /> : null}
    </>
  );
};

/** A huge cream word that wipes up out of a mask and settles. */
/** x is where the visible letters centre; ink is how far the glyphs sit right of their layout box. */
const Rise: React.FC<{text: string; at: number; out: number; x: number; y: number; size: number; ink: number}> = ({text, at, out, x, y, size, ink}) => {
  const t = useT();
  if (t < at - 0.02 || t > out + 0.3) return null;
  const p = tween(t, at, 0.55, EASE_OUT);
  const o = 1 - tween(t, out, 0.25, EASE_IN);
  return (
    <div style={{position: 'absolute', left: x - ink, top: y, translate: '-50% -50%', overflow: 'hidden', padding: '0 20px', opacity: o, filter: 'drop-shadow(0 0 22px rgba(255,255,255,0.9))'}}>
      <div
        style={{
          translate: `0 ${lerp(p, 70, 0)}%`,
          scale: lerp(p, 1.12, 1),
          fontFamily: SANS,
          fontWeight: 800,
          fontSize: size,
          letterSpacing: -size * 0.05,
          lineHeight: 0.92,
          whiteSpace: 'nowrap',
          ...shineInk(t, at + 0.45, 0.8),
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
      <div style={{position: 'absolute', left: 540, top: 90, translate: '-50% 0', display: 'flex', alignItems: 'center', gap: 22, opacity: lab}}>
        <div style={{width: 110 * lab, height: 3, background: INK_T, borderRadius: 2}} />
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 42, letterSpacing: 14, color: INK_T}}>TIP</div>
        <div style={{width: 110 * lab, height: 3, background: INK_T, borderRadius: 2}} />
      </div>
      {/* title */}
      <div style={{position: 'absolute', left: 540, top: 150, translate: '-50% 0', display: 'flex', gap: 24, whiteSpace: 'nowrap'}}>
        {words.map((w, i) => {
          const p = tween(t, tip.titleAt + i * 0.12, 0.42, EASE_OUT);
          return (
            <div key={i} style={{overflow: 'hidden', padding: '6px 4px'}}>
              <div style={{translate: `0 ${lerp(p, 105, 0)}%`, fontFamily: SANS, fontWeight: 800, fontSize: 104, letterSpacing: -3, lineHeight: 1, ...shineInk(t, tip.titleAt + 0.5 + i * 0.12, 0.6)}}>{w}</div>
            </div>
          );
        })}
      </div>
      {tip.sub ? <Word text={tip.sub} at={tip.subAt} out={out} y={1270} size={84} serif /> : null}
    </AbsoluteFill>
  );
};

export const V5Talk: React.FC = () => {
  const t = useT();
  const tip = TIPS.find((k) => inside(t, k.w));
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {/* "here are my 3 tips... the third one changed things for me the most" */}
      {inside(t, C.intro) ? <ThreeDots /> : null}
      {tip ? <TipFront tip={tip} /> : null}
      {/* "small wins build momentum" */}
      {inside(t, C.wins) ? <Wins /> : null}
      {/* "just do something" */}
      {inside(t, C.something) ? (
        <>
          <Word text="JUST DO" at={20.68} out={C.something.end - 0.2} y={250} size={140} color={INK} shadow={false} />
          <Word text="something" at={21.06} out={C.something.end - 0.2} y={385} size={120} serif color={INK} shadow={false} />
        </>
      ) : null}
      {/* "something you don't want to do but you know you should" */}
      {inside(t, C.should) ? <Should /> : null}
      {/* "the hard thing was already done" */}
      {inside(t, C.done) ? <Done /> : null}
      {/* CTA (front): Comment above the giant word, guide line under the comment box */}
      {t >= C.cta.start ? (
        <>
          <Word text="Comment" at={48.66} out={999} y={478} size={96} serif color={INK} shadow={false} />
          <Word text="for my free fat loss guide" at={50.64} out={999} y={1480} size={50} color="#FFFFFF" />
        </>
      ) : null}
    </AbsoluteFill>
  );
};

const ThreeDots: React.FC = () => {
  const t = useT();
  const o = 1 - tween(t, C.intro.end - 0.25, 0.22, EASE_IN);
  const lit = tween(t, 4.42, 0.4, EASE_OUT);
  return (
    <>
      <div style={{position: 'absolute', left: 540, top: 150, translate: '-50% 0', display: 'flex', gap: 46, opacity: o}}>
        {[1, 2, 3].map((n, i) => {
          const p = tween(t, 3.36 + i * 0.1, 0.35, EASE_OUT);
          const on = n === 3 ? lit : 0;
          return (
            <div
              key={n}
              style={{
                width: 160,
                height: 160,
                borderRadius: '50%',
                border: `6px solid ${INK_T}`,
                background: on > 0.5 ? INK : 'rgba(255,255,255,0.92)',
                boxShadow: '0 10px 26px -10px rgba(0,0,0,0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: SANS,
                fontWeight: 800,
                fontSize: 84,
                color: on > 0.5 ? '#FFFFFF' : INK,
                opacity: p,
                scale: lerp(p, 0.6, 1) * (1 + 0.14 * on),
              }}
            >
              {n}
            </div>
          );
        })}
      </div>
      <Word text="tips" at={3.54} out={4.9} y={385} size={110} serif color={INK} shadow={false} />
      <Word text="changed everything" at={5.0} out={C.intro.end - 0.25} y={385} size={84} serif color={INK} shadow={false} />
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
            <div key={i} style={{opacity: Math.min(1, p * 2), scale: lerp(p, 0.5, 1)}}>
              <Check fill={INK} stroke="#FFFFFF" size={110} p={tween(t, at + 0.1, 0.3, EASE_OUT)} />
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 540, top: 330, translate: '-50% 0', display: 'flex', alignItems: 'center', gap: 18, opacity: m}}>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 118, letterSpacing: -3, color: INK_T, lineHeight: 1}}>MOMENTUM</div>
        <svg width={100} height={100} viewBox="0 0 100 100">
          <path d="M 14 86 L 84 16 M 40 16 L 84 16 L 84 60" fill="none" stroke={INK_T} strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - m} />
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
      <Word text="don't want to" at={34.2} out={out} y={235} size={100} serif color={INK} shadow={false} />
      {strike > 0 ? <div style={{position: 'absolute', left: 540 - 290, top: 240, width: 580 * strike, height: 10, borderRadius: 5, background: '#FF5A4E', opacity: 1 - tween(t, out, 0.22, EASE_IN)}} /> : null}
      <div style={{position: 'absolute', left: 540, top: 330, translate: '-50% 0', display: 'flex', alignItems: 'center', gap: 22, opacity: ok * (1 - tween(t, out, 0.22, EASE_IN)), whiteSpace: 'nowrap'}}>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 84, letterSpacing: -2, color: INK_T, lineHeight: 1}}>KNOW YOU SHOULD</div>
        <Check fill={INK} stroke="#FFFFFF" size={84} p={tween(t, 36.02, 0.3, EASE_OUT)} />
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
      <div style={{width: 120, height: 120, borderRadius: 26, border: `7px solid ${INK_T}`, background: tick > 0 ? INK : 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', scale: 1 + 0.12 * Math.sin(Math.PI * tick)}}>
        <svg width={84} height={84} viewBox="0 0 100 100">
          <path d="M 18 52 L 40 73 L 82 28" fill="none" stroke="#FFFFFF" strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - tick} />
        </svg>
      </div>
      <div style={{lineHeight: 1}}>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 64, color: INK}}>the hard thing</div>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 112, letterSpacing: -3, color: INK_T, marginTop: 6, opacity: tween(t, 47.6, 0.3)}}>DONE</div>
      </div>
    </div>
  );
};

/** Small top chip that keeps the current tip on screen after its heading. */
export const V5Chip: React.FC = () => {
  const t = useT();
  const k = TIPS.findIndex((x) => t >= x.w.end && t < x.chipEnd);
  // only over her talking head: B-roll and cutaways keep the top clear for their own words
  const cover = [C.tired, C.gym, C.home, C.hiit, C.online, C.skip, C.loop, C.workout, C.alarm, C.focus].some((w) => inside(t, w));
  if (k < 0 || cover) return null;
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
  const top = [C.tired, C.gym, C.hiit, C.online, C.focus, C.workout].find((w) => inside(t, w));
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {top ? <TopShade o={1} /> : null}
      {inside(t, C.skip) ? <AbsoluteFill style={{background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.2) 28%, rgba(0,0,0,0) 42%)'}} /> : null}
      {/* hook, second beat: no time for health? */}
      {inside(t, C.tired) ? (
        <>
          <Word text="no time for" at={1.72} out={C.tired.end - 0.08} y={190} size={96} serif />
          <Word text="HEALTH?" at={2.1} out={C.tired.end - 0.08} y={320} size={190} />
        </>
      ) : null}
      {inside(t, C.gym) ? <Word text="NO GYM?" at={12.32} out={C.gym.end - 0.05} y={230} size={170} /> : null}
      {inside(t, C.home) ? (
        <>
          <Word text="work out" at={13.72} out={C.home.end - 0.05} y={185} size={96} serif color={INK} shadow={false} />
          <Word text="AT HOME" at={13.82} out={C.home.end - 0.05} y={310} size={150} color={INK} shadow={false} />
        </>
      ) : null}
      {inside(t, C.hiit) ? <Timer /> : null}
      {inside(t, C.online) ? <Search /> : null}
      {inside(t, C.skip) ? (
        <>
          <Word text="stop skipping" at={24.34} out={C.skip.end - 0.1} y={1270} size={96} serif />
          <Word text="MEALS" at={24.94} out={C.skip.end - 0.1} y={1400} size={170} />
        </>
      ) : null}
      {inside(t, C.workout) ? <Word text="WORKOUTS" at={38.5} out={C.workout.end - 0.05} y={230} size={160} /> : null}
      {inside(t, C.alarm) ? <Alarm /> : null}
      {inside(t, C.focus) ? (
        <>
          <Word text="FOCUS" at={45.0} out={C.focus.end - 0.1} y={200} size={190} />
          <Word text="for the rest of the day" at={45.2} out={C.focus.end - 0.1} y={350} size={80} serif />
        </>
      ) : null}
    </AbsoluteFill>
  );
};

/** "early morning before work": a ringing alarm chip over the gym clip. */
const Alarm: React.FC = () => {
  const t = useT();
  const p = tween(t, C.alarm.start + 0.05, 0.4, EASE_OUT);
  const out = 1 - tween(t, C.alarm.end - 0.12, 0.12, EASE_IN);
  const ring = Math.sin(t * 42) * 9 * (1 - tween(t, 39.4, 1.0));
  return (
    <>
      <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.22) 26%, rgba(0,0,0,0) 40%)'}} />
      <div style={{position: 'absolute', left: 540, top: 150, translate: `-50% ${lerp(p, -24, 0)}px`, opacity: p * out, display: 'flex', alignItems: 'center', gap: 22, padding: '18px 40px 18px 20px', borderRadius: 70, background: 'rgba(255,255,255,0.96)', boxShadow: '0 20px 50px rgba(0,0,0,0.35)', fontFamily: SANS}}>
        <div style={{width: 92, height: 92, borderRadius: '50%', background: '#FF9F0A', display: 'flex', alignItems: 'center', justifyContent: 'center', rotate: `${ring}deg`}}>
          <Glyph name="alarm" size={58} color="#fff" />
        </div>
        <div style={{fontWeight: 800, fontSize: 70, color: INK, letterSpacing: -2, whiteSpace: 'nowrap'}}>EARLY MORNING</div>
      </div>
      <Word text="before work" at={40.02} out={C.alarm.end - 0.12} y={355} size={100} serif />
    </>
  );
};

/** "the internet is full of them": a search bar types and the results count up. */
const Search: React.FC = () => {
  const t = useT();
  const q = '10 min HIIT workout';
  const p = tween(t, C.online.start + 0.05, 0.35, EASE_OUT);
  const typed = q.slice(0, Math.max(0, Math.min(q.length, Math.floor((t - 19.0) / 0.045) + 1)));
  const n = Math.round(lerp(tween(t, 19.9, 0.6, EASE_OUT), 0, 2400000));
  return (
    <div style={{position: 'absolute', left: 540, top: 170, translate: `-50% ${lerp(p, -20, 0)}px`, opacity: p * (1 - tween(t, C.online.end - 0.1, 0.1)), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}}>
      <div style={{width: 900, height: 120, borderRadius: 60, background: 'rgba(255,255,255,0.97)', boxShadow: '0 20px 50px rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', gap: 22, padding: '0 34px', boxSizing: 'border-box', fontFamily: SANS}}>
        <Glyph name="magnifying-glass" size={54} color="#555" />
        <div style={{fontSize: 48, fontWeight: 700, color: INK, whiteSpace: 'nowrap'}}>
          {typed}
          {typed.length < q.length && Math.floor(t * 3) % 2 === 0 ? <span style={{color: '#0A84FF', fontWeight: 400}}>|</span> : null}
        </div>
      </div>
      {n > 0 ? <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 44, color: '#fff', textShadow: SHADOW}}>{n.toLocaleString('en-US')} videos</div> : null}
    </div>
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

// ===========================================================================
// Full-screen cutaway: the skip-lunch loop
// ===========================================================================
const ROWS = [
  {at: 26.04, icon: 'fork-knife', label: 'Skip lunch', y: 640, color: INK},
  {at: 27.46, icon: 'moon', label: 'Overeat at night', y: 980, color: INK},
  {at: 28.86, icon: 'arrow-right', label: 'Repeat', y: 1320, color: '#FF5A4E'},
];
const RX = 250; // icon centre x
const DOWN = [{y0: 640, y1: 980, at: 26.7}, {y0: 980, y1: 1320, at: 28.1}];
const BACK = 'M 820 1320 C 1010 1320, 1010 640, 820 640';

export const V5Loop: React.FC = () => {
  const t = useT();
  if (!inside(t, C.loop)) return null;
  const e = tween(t, C.loop.start, 0.22);
  const back = tween(t, 29.1, 0.6, EASE_IN_OUT);
  const pulse = t > 29.7 ? 0.5 + 0.5 * Math.sin((t - 29.7) * 9) : 0;
  return (
    <AbsoluteFill style={{background: `radial-gradient(90% 60% at 50% 45%, #FFFFFF 0%, ${PAPER} 70%, #EDE8E0 100%)`, opacity: e, scale: lerp(tween(t, C.loop.start, C.loop.end - C.loop.start, EASE_IN_OUT), 1, 1.05)}}>
      <Word text="the skip-lunch loop" at={C.loop.start + 0.05} out={999} y={330} size={100} serif color={INK} shadow={false} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <defs>
          <marker id="ah" viewBox="0 0 10 10" refX={6} refY={5} markerWidth={4.5} markerHeight={4.5} orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={INK} />
          </marker>
        </defs>
        {DOWN.map((d, i) => {
          const p = tween(t, d.at, 0.45, EASE_IN_OUT);
          return p > 0 ? <path key={i} d={`M ${RX} ${d.y0 + 96} L ${RX} ${d.y1 - 104}`} stroke={INK} strokeWidth={12} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} markerEnd={p > 0.95 ? 'url(#ah)' : undefined} opacity={0.85} /> : null;
        })}
        {back > 0 ? <path d={BACK} fill="none" stroke="#FF5A4E" strokeWidth={12} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - back} markerEnd={back > 0.95 ? 'url(#ahr)' : undefined} /> : null}
        <defs>
          <marker id="ahr" viewBox="0 0 10 10" refX={6} refY={5} markerWidth={4.5} markerHeight={4.5} orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#FF5A4E" />
          </marker>
        </defs>
      </svg>
      {ROWS.map((r, i) => {
        const p = tween(t, r.at, 0.4, EASE_OUT);
        if (p <= 0) return null;
        return (
          <div key={i} style={{position: 'absolute', left: RX - 85, top: r.y - 85, display: 'flex', alignItems: 'center', gap: 36, opacity: Math.min(1, p * 2), translate: `${lerp(p, -30, 0)}px 0`}}>
            <div style={{width: 170, height: 170, borderRadius: '50%', background: r.color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 16px 40px rgba(40,30,20,0.25)', scale: i === 2 ? 1 + 0.08 * pulse : 1}}>
              <Glyph name={r.icon} size={88} color="#fff" />
            </div>
            <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 64, color: i === 2 ? '#FF5A4E' : INK, letterSpacing: -2, whiteSpace: 'nowrap'}}>{r.label}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ===========================================================================
// CTA: comment box types FAT LOSS and sends
// ===========================================================================
/** A generic commenter: flat illustrated avatar (no real person). */
const Avatar: React.FC = () => (
  <svg viewBox="0 0 100 100" width="100%" height="100%" style={{display: 'block', borderRadius: '50%', border: '3px solid #fff', boxSizing: 'border-box', background: '#FCE3D3'}}>
    <defs>
      <clipPath id="av"><circle cx={50} cy={50} r={50} /></clipPath>
    </defs>
    <g clipPath="url(#av)">
      <rect width={100} height={100} fill="#FCE3D3" />
      <path d="M 22 58 C 18 30, 34 16, 52 17 C 72 18, 84 34, 79 60 L 79 78 L 22 78 Z" fill="#3B2418" />
      <path d="M 14 104 C 16 80, 32 72, 50 72 C 68 72, 84 80, 86 104 Z" fill="#E8657A" />
      <rect x={43} y={58} width={14} height={16} rx={6} fill="#E7A983" />
      <ellipse cx={50} cy={46} rx={17} ry={20} fill="#F1B993" />
      <path d="M 32 42 C 34 26, 48 22, 60 27 C 66 30, 69 36, 69 43 C 60 38, 46 37, 32 42 Z" fill="#3B2418" />
      <circle cx={43.5} cy={48} r={1.9} fill="#3B2418" />
      <circle cx={56.5} cy={48} r={1.9} fill="#3B2418" />
      <path d="M 45 56 Q 50 59.5, 55 56" stroke="#B5534F" strokeWidth={1.8} fill="none" strokeLinecap="round" />
    </g>
  </svg>
);

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
        <Avatar />
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
