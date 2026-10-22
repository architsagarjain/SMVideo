import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ICONS} from '../explainer/icons';
import {useT} from '../explainer/kit';
import {EASE_IN, EASE_IN_OUT, EASE_OUT, SANS, SERIF, lerp, tween} from '../theme';
import {C, TIPS} from './config';
import {HOOK} from './hooks';

/**
 * Travel-day reel graphics. Hook: a split-flap departures board. Then the 3-tips style: cream bold
 * sans + white italic serif, one idea at a time, words and numbers behind her head.
 */
const CREAM = '#F6E7C1';
const INK = '#1B1714';
const RED = '#FF4D4D';
const AMBER = '#FFC83D';
const SHADOW = '0 0 34px rgba(0,0,0,0.55), 0 0 70px rgba(0,0,0,0.35), 0 3px 8px rgba(0,0,0,0.45)';
type Win = {start: number; end: number};
const inside = (t: number, w: Win) => t >= w.start && t < w.end;
const fade = (t: number, w: Win, d = 0.3) => tween(t, w.start, d) * (1 - tween(t, w.end - 0.25, 0.25));

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

const Word: React.FC<{text: string; at: number; out: number; y: number; x?: number; size: number; serif?: boolean; color?: string; shine?: boolean}> = ({text, at, out, y, x = 540, size, serif, color, shine: sh}) => {
  const t = useT();
  if (t < at - 0.02 || t > out + 0.25) return null;
  const p = tween(t, at, 0.35, EASE_OUT);
  const o = Math.min(1, p * 1.4) * (1 - tween(t, out, 0.22, EASE_IN));
  const base: React.CSSProperties = {fontFamily: serif ? SERIF : SANS, fontStyle: serif ? 'italic' : 'normal', fontWeight: serif ? 400 : 800, fontSize: size, letterSpacing: serif ? -1 : -3, lineHeight: 1, whiteSpace: 'nowrap'};
  return (
    <div style={{position: 'absolute', left: x, top: y, translate: `-50% ${lerp(p, -30, -50)}%`, opacity: o, filter: sh ? 'drop-shadow(0 0 18px rgba(0,0,0,0.55)) drop-shadow(0 3px 6px rgba(0,0,0,0.4))' : undefined}}>
      <div style={{...base, ...(sh ? shine(t, at + 0.35, 0.7) : {color: color ?? (serif ? '#FFFFFF' : CREAM), textShadow: SHADOW})}}>{text}</div>
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

/** A simple airliner, nose pointing right. */
const Plane: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg viewBox="0 0 100 100" width={size} height={size} style={{display: 'block'}}>
    <path d="M 6 46 L 60 46 L 40 14 L 50 14 L 76 46 L 90 46 C 98 46, 98 54, 90 54 L 76 54 L 50 86 L 40 86 L 60 54 L 6 54 L 6 50 Z M 6 50 L 0 40 L 6 40 L 16 50 L 6 60 L 0 60 Z" fill={color} />
  </svg>
);

const Check: React.FC<{size: number; p: number}> = ({size, p}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{display: 'block'}}>
    <circle cx={50} cy={50} r={46} fill={CREAM} />
    <path d="M 28 52 L 44 67 L 73 36" fill="none" stroke={INK} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
  </svg>
);

/** A huge cream word or number that wipes up out of a mask behind her head. */
const Rise: React.FC<{text: string; at: number; out: number; y: number; size: number; x?: number}> = ({text, at, out, y, size, x = 540}) => {
  const t = useT();
  if (t < at - 0.02 || t > out + 0.3) return null;
  const p = tween(t, at, 0.55, EASE_OUT);
  const o = 1 - tween(t, out, 0.25, EASE_IN);
  return (
    <div style={{position: 'absolute', left: x, top: y, translate: '-50% -50%', overflow: 'hidden', padding: '0 20px', opacity: o, filter: 'drop-shadow(0 0 28px rgba(0,0,0,0.5)) drop-shadow(0 10px 22px rgba(0,0,0,0.3))'}}>
      <div style={{translate: `0 ${lerp(p, 70, 0)}%`, scale: lerp(p, 1.12, 1), fontFamily: SANS, fontWeight: 800, fontSize: size, letterSpacing: -size * 0.05, lineHeight: 0.92, whiteSpace: 'nowrap', ...shine(t, at + 0.45, 0.8)}}>
        {text}
      </div>
    </div>
  );
};

// ===========================================================================
// Split-flap characters
// ===========================================================================
const FLAP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:-';
const hash = (a: number, b: number) => {
  const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
/** One flap tile: spins through random characters until `settle`, then shows `ch`. */
const Flap: React.FC<{ch: string; settle: number; start: number; w: number; h: number; color: string; seed: number; bg?: string}> = ({ch, settle, start, w, h, color, seed, bg = '#262A35'}) => {
  const t = useT();
  const f = useCurrentFrame();
  const spinning = t >= start && t < settle;
  const shown = t < start ? ' ' : spinning ? FLAP[Math.floor(hash(seed, f) * FLAP.length)] : ch;
  // a tiny squash on every change so it reads as a flap turning
  const sq = spinning ? 0.86 + 0.14 * hash(seed + 7, f) : 1;
  return (
    <div style={{position: 'relative', width: w, height: h, borderRadius: 8, background: bg, overflow: 'hidden', boxShadow: 'inset 0 -3px 0 rgba(0,0,0,0.35)'}}>
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 800, fontSize: h * 0.72, color, scale: `1 ${sq}`}}>{shown === ' ' ? '' : shown}</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: h / 2 - 1.5, height: 3, background: 'rgba(0,0,0,0.55)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: h / 2, background: 'rgba(255,255,255,0.04)'}} />
    </div>
  );
};
const FlapText: React.FC<{text: string; at: number; len: number; w: number; h: number; color: string; seed: number; stagger?: number; spin?: number; bg?: string}> = ({text, at, len, w, h, color, seed, stagger = 0.035, spin = 0.32, bg}) => (
  <div style={{display: 'flex', gap: 6}}>
    {Array.from({length: len}).map((_, i) => (
      <Flap key={i} ch={text[i] ?? ' '} start={at} settle={at + spin + i * stagger} w={w} h={h} color={color} seed={seed * 31 + i} bg={bg} />
    ))}
  </div>
);

// ===========================================================================
// Hook: the departures board, then it splits open on her
// ===========================================================================
const ROWS = [
  {time: '07:40', dest: 'DUBAI', status: 'ON TIME', at: 1.02, color: '#FFFFFF'},
  {time: '09:15', dest: 'LONDON', status: 'ON TIME', at: 1.3, color: '#FFFFFF'},
  {time: '11:05', dest: 'SINGAPORE', status: 'BOARDING', at: 1.58, color: AMBER},
];
const CW = 94, CH = 132, ROW0 = 400, ROWH = 330;

const DietStatus: React.FC = () => {
  const t = useT();
  // ON TIME -> HOME ONLY ("at home") -> CANCELLED ("what happens")
  const stages: [number, string, string][] = [
    [1.9, 'ON TIME', '#FFFFFF'],
    [3.08, 'HOME ONLY', AMBER],
    [3.7, 'CANCELLED', RED],
  ];
  let k = 0;
  stages.forEach((s, i) => {
    if (t >= s[0]) k = i;
  });
  const [at, text, color] = stages[k];
  return <FlapText key={k} text={text.padEnd(9)} at={at} len={9} w={CW} h={CH} color={color} seed={90 + k} spin={0.28} />;
};

const Board: React.FC = () => {
  const t = useT();
  const blink = t >= 4.0 ? (Math.floor((t - 4.0) * 5) % 2 === 0 ? 1 : 0.45) : 1;
  const red = tween(t, 3.95, 0.2);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(120% 70% at 50% 40%, #1C2029 0%, #0B0D11 100%)', fontFamily: SANS}}>
      {/* header */}
      <div style={{position: 'absolute', left: 60, right: 60, top: 140, height: 130, borderRadius: 18, background: AMBER, display: 'flex', alignItems: 'center', gap: 26, padding: '0 34px', boxSizing: 'border-box'}}>
        <Plane size={78} color={INK} />
        <div style={{fontWeight: 800, fontSize: 72, letterSpacing: 10, color: INK}}>DEPARTURES</div>
      </div>
      {ROWS.map((r, i) => (
        <div key={i} style={{position: 'absolute', left: 64, top: ROW0 + i * ROWH, display: 'flex', flexDirection: 'column', gap: 10}}>
          <div style={{fontWeight: 800, fontSize: 34, letterSpacing: 4, color: AMBER, opacity: tween(t, r.at, 0.2)}}>{r.time}</div>
          <FlapText text={r.dest.padEnd(9)} at={r.at + 0.05} len={9} w={CW} h={CH} color="#FFFFFF" seed={i * 3 + 2} />
          <FlapText text={r.status.padEnd(9)} at={r.at + 0.12} len={9} w={CW} h={CH} color={r.color} seed={i * 3 + 3} />
        </div>
      ))}
      {/* YOUR DIET row, highlighted when it gets cancelled */}
      <div style={{position: 'absolute', left: 40, right: 40, top: ROW0 + 3 * ROWH - 22, height: 360, borderRadius: 26, background: `rgba(255,77,77,${0.16 * red})`, border: `5px solid rgba(255,77,77,${0.9 * red * blink})`, boxSizing: 'border-box'}} />
      <div style={{position: 'absolute', left: 64, top: ROW0 + 3 * ROWH, display: 'flex', flexDirection: 'column', gap: 10}}>
        <div style={{fontWeight: 800, fontSize: 34, letterSpacing: 4, color: AMBER, opacity: tween(t, 1.86, 0.2)}}>--:--</div>
        <FlapText text="YOUR DIET" at={1.9} len={9} w={CW} h={CH} color="#FFFFFF" seed={41} />
        <div style={{opacity: t >= 3.95 ? blink : 1}}>
          <DietStatus />
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 70, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 72, color: '#fff', opacity: tween(t, 2.58, 0.35)}}>
        only works at home?
      </div>
    </AbsoluteFill>
  );
};

export const V8Hook: React.FC = () => {
  const t = useT();
  if (HOOK !== 'board' || t >= C.reveal.start + 0.6) return null;
  const s = tween(t, C.reveal.start, 0.55, EASE_IN_OUT);
  if (s <= 0) return <Board />;
  // the board splits horizontally: top half slides up, bottom half slides down
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{clipPath: 'inset(0 0 50% 0)', translate: `0 ${-s * 1000}px`}}>
        <Board />
      </AbsoluteFill>
      <AbsoluteFill style={{clipPath: 'inset(50% 0 0 0)', translate: `0 ${s * 1000}px`}}>
        <Board />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ===========================================================================
// Behind her head
// ===========================================================================
export const V8Behind: React.FC = () => {
  const t = useT();
  const tip = TIPS.find((k) => inside(t, k.w));
  return (
    <>
      {HOOK === 'board' && inside(t, C.reveal) ? <Rise text="FLIGHTS?" at={5.7} out={C.reveal.end - 0.2} y={470} size={230} /> : null}
      {inside(t, C.travel) ? <Rise text="TRAVEL" at={26.3} out={C.travel.end - 0.2} y={470} size={270} /> : null}
      {tip ? <Rise text={tip.n} at={tip.at} out={tip.w.end - 0.2} y={480} size={480} /> : null}
      {t >= C.cta.start ? <Rise text="GUIDE" at={73.52} out={999} y={480} size={270} /> : null}
    </>
  );
};

/** A plane flying across behind her head on "flights". */
export const V8PlaneBehind: React.FC = () => {
  const t = useT();
  if (HOOK !== 'board' || t < 5.4 || t > 6.6) return null;
  const p = tween(t, 5.4, 1.1, EASE_IN_OUT);
  const x = lerp(p, -160, 1240);
  const y = lerp(p, 300, 230);
  return (
    <>
      <div style={{position: 'absolute', left: -200, top: y + 36, width: x + 200, height: 6, borderRadius: 3, background: 'linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.85))'}} />
      <div style={{position: 'absolute', left: x - 50, top: y - 10, filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.35))'}}>
        <Plane size={100} color="#FFFFFF" />
      </div>
    </>
  );
};

// ===========================================================================
// In front of her
// ===========================================================================
const TipFront: React.FC<{tip: (typeof TIPS)[number]}> = ({tip}) => {
  const t = useT();
  const out = tip.w.end - 0.2;
  const o = 1 - tween(t, out, 0.22, EASE_IN);
  const lab = tween(t, tip.at, 0.4, EASE_OUT);
  const words = tip.title.split(' ');
  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity: o}}>
      <div style={{position: 'absolute', left: 540, top: 70, translate: '-50% 0', display: 'flex', alignItems: 'center', gap: 22, opacity: lab}}>
        <div style={{width: 110 * lab, height: 3, background: CREAM, borderRadius: 2}} />
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 42, letterSpacing: 14, color: CREAM, textShadow: SHADOW}}>STEP</div>
        <div style={{width: 110 * lab, height: 3, background: CREAM, borderRadius: 2}} />
      </div>
      <div style={{position: 'absolute', left: 540, top: 130, translate: '-50% 0', display: 'flex', gap: 24, whiteSpace: 'nowrap'}}>
        {words.map((w, i) => {
          const p = tween(t, tip.titleAt + i * 0.12, 0.42, EASE_OUT);
          return (
            <div key={i} style={{overflow: 'hidden', padding: '6px 4px', filter: 'drop-shadow(0 0 18px rgba(0,0,0,0.55)) drop-shadow(0 3px 6px rgba(0,0,0,0.4))'}}>
              <div style={{translate: `0 ${lerp(p, 105, 0)}%`, fontFamily: SANS, fontWeight: 800, fontSize: 100, letterSpacing: -3, lineHeight: 1, ...shine(t, tip.titleAt + 0.5 + i * 0.12, 0.6)}}>{w}</div>
            </div>
          );
        })}
      </div>
      {tip.sub ? <Word text={tip.sub} at={tip.subAt} out={out} y={1270} size={80} serif /> : null}
    </AbsoluteFill>
  );
};

export const V8Talk: React.FC = () => {
  const t = useT();
  const tip = TIPS.find((k) => inside(t, k.w));
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {HOOK === 'board' && inside(t, C.reveal) ? <Word text="when your job keeps you on" at={4.6} out={C.reveal.end - 0.2} y={200} size={66} serif /> : null}
      {inside(t, C.result) ? <ResultCard /> : null}
      {inside(t, C.disclaimer) ? (
        <>
          <Word text="her individual results" at={18.26} out={C.disclaimer.end - 0.2} y={190} size={78} serif />
          <Word text="NOT A PROMISE" at={19.62} out={C.disclaimer.end - 0.2} y={310} size={110} shine />
        </>
      ) : null}
      {inside(t, C.travel) ? <Travel /> : null}
      {inside(t, C.process) ? <Process /> : null}
      {tip ? <TipFront tip={tip} /> : null}
      {inside(t, C.protein) ? <Protein /> : null}
      {inside(t, C.tip3) ? <DelayRow /> : null}
      {inside(t, C.snack) ? <Snack /> : null}
      {inside(t, C.routine) ? (
        <>
          <Word text="back to your" at={62.08} out={C.routine.end - 0.2} y={190} size={84} serif />
          <div style={{position: 'absolute', left: 540, top: 330, translate: '-50% -50%', display: 'flex', alignItems: 'center', gap: 20, opacity: tween(t, 62.7, 0.35) * (1 - tween(t, C.routine.end - 0.2, 0.22)), filter: 'drop-shadow(0 0 18px rgba(0,0,0,0.55))'}}>
            <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 150, letterSpacing: -4, lineHeight: 1, ...shine(t, 63.0, 0.7)}}>ROUTINE</div>
            <svg width={110} height={110} viewBox="0 0 100 100">
              <path d="M 78 50 A 28 28 0 1 1 64 26" fill="none" stroke={CREAM} strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - tween(t, 62.9, 0.5, EASE_OUT)} />
              <path d="M 52 14 L 68 26 L 54 40" fill="none" stroke={CREAM} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" opacity={tween(t, 63.3, 0.2)} />
            </svg>
          </div>
          <Word text="when your travel ends" at={63.7} out={C.routine.end - 0.2} y={460} size={64} serif />
        </>
      ) : null}
      {inside(t, C.identical) ? <Week /> : null}
      {inside(t, C.decisions) ? <Decisions /> : null}
      {t >= C.cta.start ? (
        <>
          <Word text="Comment" at={73.42} out={999} y={330} size={96} serif />
          <Word text="for my free fat loss guide" at={75.16} out={999} y={1480} size={50} color="#FFFFFF" />
        </>
      ) : null}
    </AbsoluteFill>
  );
};

/** Cabin crew client: weight and waist count down, styled like a boarding pass. */
const ResultCard: React.FC = () => {
  const t = useT();
  const p = tween(t, 7.5, 0.45, EASE_OUT);
  const o = 1 - tween(t, C.result.end - 0.25, 0.22, EASE_IN);
  const kg = Math.round(lerp(tween(t, 10.08, 0.6, EASE_IN_OUT), 72, 66));
  const inch = Math.round(lerp(tween(t, 15.48, 0.5, EASE_IN_OUT), 34, 28));
  const waist = tween(t, 12.94, 0.4, EASE_OUT);
  const col = (label: string, from: number, now: number, unit: string, on: number, doneAt: number) => (
    <div style={{flex: 1, opacity: lerp(on, 0.25, 1)}}>
      <div style={{fontWeight: 800, fontSize: 28, letterSpacing: 5, color: '#8a8178'}}>{label}</div>
      <div style={{display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 8}}>
        <div style={{fontWeight: 800, fontSize: 54, color: '#B9B0A4', textDecoration: t >= doneAt ? 'line-through' : 'none'}}>{from}</div>
        <div style={{fontWeight: 800, fontSize: 40, color: '#B9B0A4'}}>→</div>
        <div style={{fontWeight: 800, fontSize: 104, color: t >= doneAt ? '#15803D' : INK, letterSpacing: -3, fontVariantNumeric: 'tabular-nums', lineHeight: 1}}>{now}</div>
        <div style={{fontWeight: 700, fontSize: 36, color: INK}}>{unit}</div>
      </div>
    </div>
  );
  return (
    <div style={{position: 'absolute', left: 60, top: 70, width: 960, height: 410, borderRadius: 34, background: '#FFFDF7', boxShadow: '0 24px 60px rgba(0,0,0,0.35)', opacity: p * o, translate: `0 ${lerp(p, -40, 0)}px`, fontFamily: SANS, overflow: 'hidden'}}>
      <div style={{height: 110, background: INK, display: 'flex', alignItems: 'center', gap: 22, padding: '0 34px'}}>
        <Plane size={60} color={AMBER} />
        <div style={{fontWeight: 800, fontSize: 44, letterSpacing: 4, color: '#fff'}}>CABIN CREW CLIENT</div>
        <div style={{marginLeft: 'auto', fontWeight: 700, fontSize: 28, letterSpacing: 3, color: AMBER}}>RESULTS</div>
      </div>
      <div style={{display: 'flex', gap: 30, padding: '40px 40px 0'}}>
        {col('WEIGHT', 72, kg, 'kg', 1, 10.7)}
        <div style={{width: 0, borderLeft: '3px dashed #D9D1C4'}} />
        {col('WAIST', 34, inch, 'in', waist, 16.0)}
      </div>
      <div style={{position: 'absolute', left: 40, bottom: 26, fontFamily: SERIF, fontStyle: 'italic', fontSize: 34, color: '#8a8178'}}>while flying for work</div>
    </div>
  );
};

/** "work around travel rather than assume a predictable kitchen and schedule every single day" */
const Travel: React.FC = () => {
  const t = useT();
  const out = C.travel.end - 0.2;
  const chips = [
    {at: 28.2, text: 'a predictable kitchen'},
    {at: 29.56, text: 'the same schedule'},
  ];
  const strike = tween(t, 29.92, 0.35, EASE_IN_OUT);
  return (
    <>
      <Word text="a plan has to" at={24.72} out={27.4} y={190} size={84} serif />
      <Word text="work around" at={25.86} out={27.4} y={300} size={110} serif />
      {t >= 27.62 ? <Word text="instead of assuming" at={27.62} out={out} y={100} size={60} serif /> : null}
      {chips.map((c, i) =>
        t >= c.at ? (
          <div key={i} style={{position: 'absolute', left: 540, top: 150 + i * 92, translate: '-50% 0', padding: '12px 30px', borderRadius: 50, background: 'rgba(20,17,14,0.66)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', fontFamily: SANS, fontWeight: 800, fontSize: 44, color: '#fff', whiteSpace: 'nowrap', opacity: tween(t, c.at, 0.3) * (1 - tween(t, out, 0.22, EASE_IN)), scale: lerp(tween(t, c.at, 0.35, EASE_OUT), 0.85, 1)}}>
            {c.text}
            {strike > 0 ? <div style={{position: 'absolute', left: 24, top: '50%', height: 8, width: `calc(${strike * 100}% - 48px)`, borderRadius: 4, background: RED}} /> : null}
          </div>
        ) : null,
      )}
    </>
  );
};

const Process: React.FC = () => {
  const t = useT();
  const out = C.process.end - 0.2;
  const p = tween(t, 34.22, 0.4, EASE_OUT);
  return (
    <>
      <Word text="my decision process for a" at={32.2} out={out} y={150} size={66} serif />
      <div style={{position: 'absolute', left: 540, top: 270, translate: '-50% -50%', display: 'flex', alignItems: 'center', gap: 24, padding: '20px 44px', borderRadius: 70, background: AMBER, boxShadow: '0 16px 40px rgba(0,0,0,0.35)', opacity: p * (1 - tween(t, out, 0.22, EASE_IN)), scale: lerp(p, 0.7, 1), fontFamily: SANS}}>
        <Plane size={80} color={INK} />
        <div style={{fontWeight: 800, fontSize: 84, letterSpacing: -2, color: INK, whiteSpace: 'nowrap'}}>TRAVEL DAY</div>
      </div>
    </>
  );
};

const Protein: React.FC = () => {
  const t = useT();
  const out = C.protein.end - 0.2;
  const items = ['eggs', 'greek yogurt', 'paneer / tofu', 'protein shake'];
  return (
    <>
      <div style={{position: 'absolute', left: 540, top: 90, translate: '-50% 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, width: 940}}>
        {items.map((s, i) => {
          const p = tween(t, 42.4 + i * 0.18, 0.35, EASE_OUT);
          return (
            <div key={s} style={{display: 'flex', alignItems: 'center', gap: 16, padding: '16px 22px 16px 16px', borderRadius: 60, background: 'rgba(20,17,14,0.66)', boxShadow: '0 12px 30px rgba(0,0,0,0.3)', fontFamily: SANS, opacity: p * (1 - tween(t, out, 0.22, EASE_IN)), scale: lerp(p, 0.85, 1)}}>
              <Check size={60} p={tween(t, 42.5 + i * 0.18, 0.3, EASE_OUT)} />
              <div style={{fontWeight: 800, fontSize: 42, color: '#fff', whiteSpace: 'nowrap'}}>{s}</div>
            </div>
          );
        })}
      </div>
      <Word text="when it's available" at={43.98} out={out} y={360} size={76} serif />
    </>
  );
};

/** "decide what you'll do if the meal is delayed": a flap row on her chest. */
const DelayRow: React.FC = () => {
  const t = useT();
  if (t < 48.3) return null;
  const o = tween(t, 48.3, 0.25) * (1 - tween(t, C.tip3.end - 0.2, 0.2));
  return (
    <div style={{position: 'absolute', left: 540, top: 1150, translate: '-50% 0', display: 'flex', alignItems: 'center', gap: 22, padding: '22px 26px', borderRadius: 26, background: 'rgba(11,13,17,0.92)', boxShadow: '0 20px 50px rgba(0,0,0,0.4)', opacity: o}}>
      <FlapText text="MEAL" at={48.3} len={4} w={52} h={80} color="#fff" seed={200} spin={0.25} />
      <Plane size={56} color={AMBER} />
      <FlapText text="DELAYED" at={48.6} len={7} w={52} h={80} color={RED} seed={210} spin={0.3} />
    </div>
  );
};

/** "Carry a practical snack rather than depend entirely on airport choices": her carry-on bag rolls
 * through an airport X-ray; the snacks inside show up in X-ray colours, get labelled and cleared. */
const XRAY_ITEMS = [
  {at: 50.82, label: 'almonds', x: 250, y: 300},
  {at: 50.98, label: 'protein bar', x: 500, y: 250},
  {at: 51.14, label: 'fruit', x: 740, y: 320},
];
const Snack: React.FC = () => {
  const t = useT();
  const f = useCurrentFrame();
  const out = C.snack.end - 0.2;
  const o = tween(t, C.snack.start, 0.3) * (1 - tween(t, out, 0.22, EASE_IN));
  const belt = tween(t, C.snack.start + 0.05, 0.75, EASE_OUT); // bag rolls in
  const beam = tween(t, 50.0, 0.8, EASE_IN_OUT); // scan beam sweeps across
  const cleared = tween(t, 51.5, 0.35, EASE_OUT);
  const warn = tween(t, 52.16, 0.35, EASE_OUT); // after the snack words have gone
  const cross = tween(t, 53.68, 0.3, EASE_OUT);
  const bagX = lerp(belt, -760, 0);
  const noise = (f % 4) * 0.6;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o, pointerEvents: 'none'}}>
      {/* the X-ray monitor */}
      <div style={{position: 'absolute', left: 40, right: 40, top: 60, height: 470, borderRadius: 34, background: '#061428', border: '6px solid #2A3A52', boxShadow: '0 26px 60px rgba(0,0,0,0.45)', overflow: 'hidden', fontFamily: SANS}}>
        {/* scan lines */}
        <AbsoluteFill style={{backgroundImage: 'repeating-linear-gradient(to bottom, rgba(120,200,255,0.06) 0 2px, transparent 2px 6px)', translate: `0 ${noise}px`}} />
        <div style={{position: 'absolute', left: 26, top: 20, display: 'flex', alignItems: 'center', gap: 14, fontFamily: 'monospace', fontWeight: 700, fontSize: 30, letterSpacing: 4, color: '#6FD3FF'}}>
          <div style={{width: 14, height: 14, borderRadius: 7, background: Math.floor(f / 10) % 2 === 0 ? '#FF4D4D' : '#5A1E1E'}} />
          X-RAY · CARRY-ON BAG
        </div>
        {/* the bag, drawn as an X-ray */}
        <div style={{position: 'absolute', left: 90, top: 110, width: 820, height: 320, translate: `${bagX}px 0`}}>
          <svg width={820} height={320} viewBox="0 0 820 320" style={{position: 'absolute', inset: 0}}>
            <path d="M 300 40 L 300 12 Q 300 0 312 0 L 508 0 Q 520 0 520 12 L 520 40" fill="none" stroke="rgba(120,210,255,0.8)" strokeWidth={10} />
            <rect x={20} y={40} width={780} height={270} rx={40} fill="rgba(80,170,255,0.10)" stroke="rgba(120,210,255,0.85)" strokeWidth={8} />
            <line x1={410} y1={40} x2={410} y2={310} stroke="rgba(120,210,255,0.35)" strokeWidth={4} strokeDasharray="14 10" />
            {/* almonds (organic: orange) */}
            {[
              [120, 190, -25],
              [168, 210, 20],
              [140, 240, 5],
              [196, 172, -10],
            ].map(([x, y, r], i) => (
              <ellipse key={i} cx={x} cy={y} rx={22} ry={34} transform={`rotate(${r} ${x} ${y})`} fill="rgba(255,154,60,0.75)" stroke="rgba(255,200,120,0.9)" strokeWidth={3} />
            ))}
            {/* protein bar (dense: green-blue) */}
            <rect x={330} y={160} width={190} height={70} rx={14} fill="rgba(60,220,170,0.6)" stroke="rgba(140,255,210,0.9)" strokeWidth={4} />
            {/* fruit */}
            <circle cx={640} cy={200} r={62} fill="rgba(255,154,60,0.55)" stroke="rgba(255,200,120,0.9)" strokeWidth={4} />
            <path d="M 640 140 C 640 124, 646 114, 656 108" stroke="rgba(255,200,120,0.9)" strokeWidth={5} fill="none" />
          </svg>
        </div>
        {/* sweep beam */}
        {beam > 0 && beam < 1 ? <div style={{position: 'absolute', top: 90, bottom: 20, left: lerp(beam, 60, 960), width: 8, background: 'rgba(140,230,255,1)', boxShadow: '0 0 30px 12px rgba(80,200,255,0.7)'}} /> : null}
        {/* labels */}
        {XRAY_ITEMS.map((k, i) => {
          const p = tween(t, k.at, 0.3, EASE_OUT);
          if (p <= 0) return null;
          return (
            <div key={i} style={{position: 'absolute', left: k.x + 90, top: k.y - 150, translate: '-50% 0', padding: '8px 18px', borderRadius: 20, background: 'rgba(255,255,255,0.92)', color: INK, fontWeight: 800, fontSize: 32, whiteSpace: 'nowrap', opacity: p, scale: lerp(p, 0.7, 1)}}>
              {k.label}
            </div>
          );
        })}
        {cleared > 0 ? (
          <div style={{position: 'absolute', right: 26, top: 14, display: 'flex', alignItems: 'center', gap: 12, padding: '8px 22px', borderRadius: 26, background: '#1E8E5A', color: '#fff', fontWeight: 800, fontSize: 34, letterSpacing: 2, opacity: cleared, scale: lerp(cleared, 1.4, 1)}}>
            ✓ CLEARED
          </div>
        ) : null}
      </div>
      {/* on a dark card: she wears white */}
      {t < 52.15 ? (
        <div style={{position: 'absolute', left: 540, top: 1110, translate: '-50% 0', padding: '20px 46px 26px', borderRadius: 36, background: 'rgba(20,17,14,0.72)', boxShadow: '0 16px 40px rgba(0,0,0,0.35)', textAlign: 'center', opacity: tween(t, 49.72, 0.3) * (1 - tween(t, 51.9, 0.22, EASE_IN)), scale: lerp(tween(t, 49.72, 0.35, EASE_OUT), 0.9, 1)}}>
          <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 64, color: '#fff', lineHeight: 1}}>carry a</div>
          <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 96, letterSpacing: -3, lineHeight: 1.05, whiteSpace: 'nowrap', opacity: tween(t, 50.26, 0.3), ...shine(t, 50.6, 0.7)}}>PRACTICAL SNACK</div>
        </div>
      ) : null}
      {/* rather than depend entirely on airport choices */}
      {warn > 0 ? (
        <div style={{position: 'absolute', left: 540, top: 1180, translate: '-50% 0', display: 'flex', alignItems: 'center', gap: 16, padding: '16px 34px', borderRadius: 50, background: 'rgba(20,17,14,0.72)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', fontFamily: SANS, fontWeight: 800, fontSize: 46, color: '#fff', whiteSpace: 'nowrap', opacity: warn, scale: lerp(warn, 0.85, 1)}}>
          <Glyph name="fork-knife" size={46} color="#fff" />
          only airport food
          {cross > 0 ? (
            <div style={{width: 56, height: 56, borderRadius: 28, background: RED, display: 'flex', alignItems: 'center', justifyContent: 'center', scale: lerp(cross, 1.6, 1)}}>
              <svg viewBox="0 0 100 100" width={30} height={30}>
                <path d="M 22 22 L 78 78 M 78 22 L 22 78" stroke="#fff" strokeWidth={16} strokeLinecap="round" />
              </svg>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

/** "You don't need every day to look identical": seven different days. */
const DAYS = [
  {d: 'M', icon: 'house'},
  {d: 'T', icon: 'buildings'},
  {d: 'W', icon: 'briefcase'},
  {d: 'T', icon: 'barbell'},
  {d: 'F', icon: 'map-pin'},
  {d: 'S', icon: 'bowl-food'},
  {d: 'S', icon: 'moon'},
];
const DAY_COLORS = ['#F6E7C1', '#FFD9C2', '#D6E8FF', '#DFF5D8', '#FFE1EC', '#E8E0FF', '#FFF1B8'];
const Week: React.FC = () => {
  const t = useT();
  const out = C.identical.end - 0.2;
  return (
    <>
      <div style={{position: 'absolute', left: 540, top: 110, translate: '-50% 0', display: 'flex', gap: 14}}>
        {DAYS.map((k, i) => {
          const p = tween(t, 65.84 + i * 0.07, 0.35, EASE_OUT);
          return (
            <div key={i} style={{width: 118, height: 150, borderRadius: 26, background: DAY_COLORS[i], boxShadow: '0 10px 26px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, opacity: p * (1 - tween(t, out, 0.22, EASE_IN)), translate: `0 ${lerp(p, 30, 0)}px`, fontFamily: SANS}}>
              <div style={{fontWeight: 800, fontSize: 34, color: INK}}>{k.d}</div>
              <Glyph name={k.icon} size={50} color={INK} />
            </div>
          );
        })}
      </div>
      <Word text="every day doesn't need to look" at={65.84} out={out} y={330} size={60} serif />
      <Word text="IDENTICAL" at={67.2} out={out} y={430} size={120} shine />
    </>
  );
};

const Decisions: React.FC = () => {
  const t = useT();
  const out = C.decisions.end - 0.2;
  const places = [
    {at: 70.84, icon: 'house', text: 'home'},
    {at: 71.0, icon: 'buildings', text: 'hotel'},
    {at: 71.16, icon: 'map-pin', text: 'airport'},
  ];
  return (
    <>
      <Word text="you need" at={68.5} out={out} y={150} size={76} serif />
      <Word text="DECISIONS" at={68.9} out={out} y={260} size={140} shine />
      <Word text="you can repeat" at={70.16} out={out} y={370} size={70} serif />
      <div style={{position: 'absolute', left: 540, top: 1180, translate: '-50% 0', display: 'flex', gap: 16}}>
        {places.map((p, i) => {
          const q = tween(t, p.at, 0.35, EASE_OUT);
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 12, padding: '14px 28px 14px 18px', borderRadius: 50, background: 'rgba(20,17,14,0.7)', boxShadow: '0 10px 28px rgba(0,0,0,0.3)', fontFamily: SANS, fontWeight: 800, fontSize: 44, color: '#fff', opacity: q * (1 - tween(t, out, 0.22, EASE_IN)), scale: lerp(q, 0.8, 1)}}>
              <Glyph name={p.icon} size={44} color={CREAM} />
              {p.text}
            </div>
          );
        })}
      </div>
    </>
  );
};

/** Small top chip that keeps the current step on screen after its heading. */
export const V8Chip: React.FC = () => {
  const t = useT();
  const k = TIPS.findIndex((x) => t >= x.w.end && t < x.chipEnd);
  const cover = [C.meal, C.protein, C.snack].some((w) => inside(t, w));
  if (k < 0 || cover) return null;
  const tip = TIPS[k];
  const p = tween(t, tip.w.end, 0.35, EASE_OUT) * (1 - tween(t, tip.chipEnd - 0.2, 0.2, EASE_IN));
  return (
    <div style={{position: 'absolute', left: 40, top: 60, display: 'flex', alignItems: 'center', gap: 14, padding: '12px 26px 12px 12px', borderRadius: 40, background: 'rgba(20,17,14,0.72)', opacity: p, fontFamily: SANS}}>
      <div style={{width: 54, height: 54, borderRadius: '50%', background: CREAM, color: INK, fontWeight: 800, fontSize: 26, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{tip.n}</div>
      <div style={{color: '#fff', fontWeight: 700, fontSize: 32, whiteSpace: 'nowrap'}}>{tip.chip}</div>
    </div>
  );
};

// ===========================================================================
// Over the B-roll
// ===========================================================================
export const V8Broll: React.FC = () => {
  const t = useT();
  const any = [C.meal, C.train1, C.train2, C.simpler].find((w) => inside(t, w));
  if (!any) return null;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.22) 26%, rgba(0,0,0,0) 40%)'}} />
      {inside(t, C.meal) ? (
        <>
          <Word text="where's your next" at={C.meal.start} out={C.meal.end - 0.1} y={170} size={84} serif />
          <Word text="PROPER MEAL?" at={38.08} out={C.meal.end - 0.1} y={300} size={140} shine />
        </>
      ) : null}
      {inside(t, C.train1) ? (
        <>
          <Word text="TRAINING" at={55.34} out={C.train1.end - 0.05} y={200} size={170} shine />
          <Word text="use the equipment you have" at={56.14} out={C.train1.end - 0.05} y={340} size={64} serif />
        </>
      ) : null}
      {inside(t, C.train2) ? (
        <>
          <Word text="and the" at={C.train2.start} out={C.train2.end - 0.05} y={170} size={80} serif />
          <Word text="TIME YOU HAVE" at={57.34} out={C.train2.end - 0.05} y={290} size={130} shine />
        </>
      ) : null}
      {inside(t, C.simpler) ? (
        <>
          <Word text="a simpler session?" at={59.76} out={C.simpler.end - 0.1} y={180} size={84} serif />
          <Word text="THAT'S OKAY" at={60.56} out={C.simpler.end - 0.1} y={310} size={140} shine />
        </>
      ) : null}
    </AbsoluteFill>
  );
};

// ===========================================================================
// CTA: comment box types GUIDE and sends
// ===========================================================================
const Avatar: React.FC = () => (
  <svg viewBox="0 0 100 100" width="100%" height="100%" style={{display: 'block', borderRadius: '50%', border: '3px solid #fff', boxSizing: 'border-box', background: '#DDE8F6'}}>
    <defs>
      <clipPath id="av8"><circle cx={50} cy={50} r={50} /></clipPath>
    </defs>
    <g clipPath="url(#av8)">
      <rect width={100} height={100} fill="#DDE8F6" />
      <path d="M 24 60 C 18 28, 36 15, 52 16 C 70 17, 84 32, 78 62 L 78 80 L 24 80 Z" fill="#1F1A17" />
      <path d="M 14 104 C 16 80, 32 72, 50 72 C 68 72, 84 80, 86 104 Z" fill="#5B7FE0" />
      <rect x={43} y={58} width={14} height={16} rx={6} fill="#C98B67" />
      <ellipse cx={50} cy={46} rx={17} ry={20} fill="#D9A07A" />
      <path d="M 33 40 C 36 26, 50 23, 61 28 C 67 31, 69 37, 68 42 C 58 34, 44 33, 33 40 Z" fill="#1F1A17" />
      <circle cx={43.5} cy={48} r={1.9} fill="#1F1A17" />
      <circle cx={56.5} cy={48} r={1.9} fill="#1F1A17" />
      <path d="M 45 56 Q 50 59.5, 55 56" stroke="#9E4A45" strokeWidth={1.8} fill="none" strokeLinecap="round" />
    </g>
  </svg>
);

export const V8Comment: React.FC = () => {
  const t = useT();
  if (t < C.cta.start + 0.08) return null;
  const word = 'GUIDE';
  const p = tween(t, 73.42, 0.4, EASE_OUT);
  const typed = word.slice(0, Math.max(0, Math.min(word.length, Math.floor((t - 73.75) / 0.08) + 1)));
  const sent = tween(t, 74.32, 0.25, EASE_OUT);
  const caret = typed.length > 0 && sent === 0 && Math.floor(t * 3) % 2 === 0;
  return (
    <div style={{position: 'absolute', left: 90, top: 1300, width: 900, height: 128, borderRadius: 64, background: 'rgba(255,255,255,0.97)', boxShadow: '0 20px 60px rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', gap: 24, padding: '0 22px', boxSizing: 'border-box', opacity: p, translate: `0 ${lerp(p, 40, 0)}px`, fontFamily: SANS}}>
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

