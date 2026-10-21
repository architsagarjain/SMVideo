import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, staticFile} from 'remotion';
import {ICONS} from '../explainer/icons';
import {useT} from '../explainer/kit';
import {outAt} from '../series/timemap';
import {EASE_IN, EASE_IN_OUT, EASE_OUT, FPS, SANS, SERIF, lerp, tween} from '../theme';
import {C, CARD, CARD_RUNS, PILLARS, TM6} from './config';

/**
 * Cardio reel graphics. Cream bold sans + white italic serif, one idea at a time; a rounded B-roll
 * card in the lower half for the cardio pile-up and the four essentials.
 */
const CREAM = '#F6E7C1';
const INK = '#1B1714';
const RED = '#FF5A4E';
const SHADOW = '0 0 34px rgba(0,0,0,0.55), 0 0 70px rgba(0,0,0,0.35), 0 3px 8px rgba(0,0,0,0.45)';
type Win = {start: number; end: number};
const inside = (t: number, w: Win) => t >= w.start && t < w.end;
const any = (t: number, ws: Win[]) => ws.some((w) => inside(t, w));

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
  const base: React.CSSProperties = {
    fontFamily: serif ? SERIF : SANS,
    fontStyle: serif ? 'italic' : 'normal',
    fontWeight: serif ? 400 : 800,
    fontSize: size,
    letterSpacing: serif ? -1 : -3,
    lineHeight: 1,
    whiteSpace: 'nowrap',
  };
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

const Check: React.FC<{size: number; p: number}> = ({size, p}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{display: 'block'}}>
    <circle cx={50} cy={50} r={46} fill={CREAM} />
    <path d="M 28 52 L 44 67 L 73 36" fill="none" stroke={INK} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
  </svg>
);

/** A huge cream word that wipes up out of a mask behind her head. */
const Rise: React.FC<{text: string; at: number; out: number; y: number; size: number}> = ({text, at, out, y, size}) => {
  const t = useT();
  if (t < at - 0.02 || t > out + 0.3) return null;
  const p = tween(t, at, 0.55, EASE_OUT);
  const o = 1 - tween(t, out, 0.25, EASE_IN);
  return (
    <div style={{position: 'absolute', left: 540, top: y, translate: '-50% -50%', overflow: 'hidden', padding: '0 20px', opacity: o, filter: 'drop-shadow(0 0 28px rgba(0,0,0,0.5)) drop-shadow(0 10px 22px rgba(0,0,0,0.3))'}}>
      <div style={{translate: `0 ${lerp(p, 70, 0)}%`, scale: lerp(p, 1.12, 1), fontFamily: SANS, fontWeight: 800, fontSize: size, letterSpacing: -size * 0.05, lineHeight: 0.92, whiteSpace: 'nowrap', ...shine(t, at + 0.45, 0.8)}}>
        {text}
      </div>
    </div>
  );
};

// ===========================================================================
// Behind her head
// ===========================================================================
export const V6Behind: React.FC = () => {
  const t = useT();
  return (
    <>
      {inside(t, C.punish) ? <Rise text="PUNISH" at={29.62} out={C.punish.end - 0.2} y={600} size={240} /> : null}
      {t >= C.cta.start ? <Rise text="CARDIO" at={43.1} out={999} y={600} size={250} /> : null}
    </>
  );
};

// ===========================================================================
// In front of her
// ===========================================================================
export const V6Talk: React.FC = () => {
  const t = useT();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {/* hook */}
      {inside(t, C.hookA) ? (
        <>
          <Word text="stopped losing" at={1.2} out={C.hookA.end - 0.1} y={190} size={96} serif />
          <Word text="FAT?" at={1.78} out={C.hookA.end - 0.1} y={330} size={210} shine />
        </>
      ) : null}
      {inside(t, C.happens) ? (
        <>
          <Word text="here's what" at={5.86} out={C.happens.end - 0.15} y={200} size={96} serif />
          <Word text="USUALLY HAPPENS" at={6.48} out={C.happens.end - 0.15} y={320} size={116} shine />
        </>
      ) : null}
      {inside(t, C.crash) ? <Meters /> : null}
      {inside(t, C.notBad) ? (
        <>
          <Word text="CARDIO" at={24.9} out={C.notBad.end - 0.1} y={210} size={170} shine />
          <Word text="isn't bad" at={25.3} out={C.notBad.end - 0.1} y={350} size={110} serif />
        </>
      ) : null}
      {inside(t, C.punish) ? <Word text="don't" at={29.06} out={C.punish.end - 0.2} y={452} size={110} serif /> : null}
      {inside(t, C.more) ? (
        <>
          <Word text="MORE" at={38.28} out={C.more.end - 0.12} y={190} size={170} shine />
          <Word text="isn't always" at={38.58} out={C.more.end - 0.12} y={330} size={96} serif />
          <Word text="BETTER" at={39.0} out={C.more.end - 0.12} y={460} size={170} shine />
        </>
      ) : null}
      {inside(t, C.strategy) ? <Strategy /> : null}
      {t >= C.cta.start ? (
        <>
          <Word text="Comment" at={42.92} out={999} y={470} size={96} serif />
          <Word text="for my free fat loss workout guide" at={44.78} out={999} y={1480} size={46} color="#FFFFFF" />
        </>
      ) : null}
    </AbsoluteFill>
  );
};

/** "exhausted, hungrier, moving less": three meters move the wrong way. */
const METERS = [
  {at: 18.2, icon: 'battery-low', label: 'Energy', from: 0.85, to: 0.18, color: RED},
  {at: 19.36, icon: 'fork-knife', label: 'Hunger', from: 0.3, to: 0.92, color: '#FF9F0A'},
  {at: 21.06, icon: 'footprints', label: 'Movement', from: 0.8, to: 0.22, color: RED},
];
const Meters: React.FC = () => {
  const t = useT();
  const p = tween(t, 17.18, 0.4, EASE_OUT);
  const o = 1 - tween(t, C.crash.end - 0.25, 0.22, EASE_IN);
  return (
    <div style={{position: 'absolute', left: 90, top: 110, width: 900, padding: '30px 36px', boxSizing: 'border-box', borderRadius: 40, background: 'rgba(20,17,14,0.62)', boxShadow: '0 20px 60px rgba(0,0,0,0.35)', opacity: p * o, translate: `0 ${lerp(p, -24, 0)}px`, display: 'flex', flexDirection: 'column', gap: 26, fontFamily: SANS}}>
      {METERS.map((m, i) => {
        const r = tween(t, m.at, 0.45, EASE_OUT);
        const v = lerp(tween(t, m.at + 0.05, 0.9, EASE_IN_OUT), m.from, m.to);
        const up = m.to > m.from;
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 22, opacity: lerp(r, 0.35, 1)}}>
            <div style={{width: 76, height: 76, borderRadius: '50%', background: r > 0.5 ? m.color : 'rgba(255,255,255,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
              <Glyph name={m.icon} size={44} color="#fff" />
            </div>
            <div style={{width: 210, fontWeight: 800, fontSize: 42, color: '#fff'}}>{m.label}</div>
            <div style={{flex: 1, height: 26, borderRadius: 13, background: 'rgba(255,255,255,0.18)', overflow: 'hidden'}}>
              <div style={{width: `${v * 100}%`, height: '100%', borderRadius: 13, background: r > 0.3 ? m.color : CREAM}} />
            </div>
            <div style={{width: 56, fontWeight: 800, fontSize: 48, color: r > 0.5 ? m.color : 'rgba(255,255,255,0.4)', textAlign: 'center'}}>{r > 0.5 ? (up ? '↑' : '↓') : ''}</div>
          </div>
        );
      })}
    </div>
  );
};

/** The four essentials tick into a list above her head as she names them. */
const PillarList: React.FC = () => {
  const t = useT();
  const o = 1 - tween(t, C.p4.end + 0.1, 0.25, EASE_IN);
  return (
    <div style={{position: 'absolute', left: 540, top: 110, translate: '-50% 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 18px', width: 940, opacity: o}}>
      {PILLARS.map((k, i) => {
        const p = tween(t, k.at, 0.4, EASE_OUT);
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 16, padding: '16px 22px 16px 16px', borderRadius: 60, background: p > 0 ? 'rgba(20,17,14,0.66)' : 'rgba(20,17,14,0.3)', opacity: lerp(p, 0.4, 1), scale: lerp(p, 0.94, 1), boxShadow: p > 0 ? '0 12px 30px rgba(0,0,0,0.3)' : undefined, fontFamily: SANS}}>
            <Check size={62} p={tween(t, k.at + 0.1, 0.3, EASE_OUT)} />
            <div style={{fontWeight: 800, fontSize: 40, color: p > 0 ? '#fff' : 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap'}}>{k.label}</div>
          </div>
        );
      })}
    </div>
  );
};

const Strategy: React.FC = () => {
  const t = useT();
  const out = C.strategy.end - 0.15;
  const u = tween(t, 41.95, 0.45, EASE_IN_OUT);
  return (
    <>
      <Word text="sometimes you just need" at={40.14} out={out} y={190} size={72} serif />
      <Word text="the right" at={41.22} out={out} y={300} size={100} serif />
      <Word text="STRATEGY" at={41.6} out={out} y={430} size={180} shine />
      {u > 0 ? <div style={{position: 'absolute', left: 540 - 380, top: 520, width: 760 * u, height: 12, borderRadius: 6, background: CREAM, opacity: 1 - tween(t, out, 0.22, EASE_IN), boxShadow: '0 4px 14px rgba(0,0,0,0.35)'}} /> : null}
    </>
  );
};

// ===========================================================================
// The card on top of the white stage: B-roll (or the scale) while she keeps talking below
// ===========================================================================
const CX = 70, CY = 110, CW = 940, CH = 760;
const o = (s: number) => outAt(TM6, s);

export const V6Card: React.FC = () => {
  const t = useT();
  const run = CARD_RUNS.find((r) => t >= r.start - 0.01 && t < r.end);
  if (!run) return null;
  // in once she has shrunk into the lower half, out before she grows back
  const pin = tween(t, run.start + 0.2, 0.4, EASE_OUT);
  const pout = tween(t, run.end - 0.6, 0.25, EASE_IN_OUT);
  const y = lerp(pin, -260, 0) + lerp(pout, 0, -1000);
  return (
    <div style={{position: 'absolute', left: CX, top: CY, width: CW, height: CH, borderRadius: 46, overflow: 'hidden', translate: `0 ${y}px`, opacity: Math.min(1, pin * 1.5), boxShadow: '0 30px 70px rgba(40,30,20,0.28)', border: '6px solid #FFFFFF', boxSizing: 'border-box', background: '#111'}}>
      {CARD.map((c, i) => {
        const from = Math.round(o(c.w.start) * FPS);
        const dur = Math.max(1, Math.round(o(c.w.end) * FPS) - from);
        return (
          <Sequence key={i} from={from} durationInFrames={dur} premountFor={FPS}>
            <AbsoluteFill style={{scale: lerp(tween(t, c.w.start, c.w.end - c.w.start), 1.0, 1.06)}}>
              <OffthreadVideo src={staticFile(`v6/${c.src}`)} muted startFrom={Math.round(c.from * FPS)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            </AbsoluteFill>
          </Sequence>
        );
      })}
      {inside(t, C.scale) ? <Scale /> : null}
      <CardOverlay />
    </div>
  );
};

/** "The scale doesn't move": the last digit flickers, the number never changes. */
const Scale: React.FC = () => {
  const t = useT();
  const k = Math.floor((t - C.scale.start) / 0.22);
  const flick = t > 8.4 && t < 9.2 ? ['72.4', '72.6', '72.4', '72.5', '72.4'][k % 5] : '72.4';
  const lock = tween(t, 9.06, 0.3, EASE_OUT);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(90% 80% at 50% 35%, #3A3129 0%, #1B1714 70%, #120F0C 100%)', alignItems: 'center', justifyContent: 'flex-start'}}>
      {/* kept in the upper part of the card so the caption below stays clear */}
      <div style={{width: 440, height: 320, borderRadius: 60, marginTop: 50, background: 'linear-gradient(160deg, #FAFAFA, #DCDCDC)', boxShadow: '0 30px 60px rgba(0,0,0,0.5), inset 0 2px 0 #fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{width: 340, height: 150, borderRadius: 24, background: '#1E2A23', boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.6)', display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 12, paddingTop: 18, boxSizing: 'border-box', fontFamily: SANS}}>
          <div style={{fontWeight: 800, fontSize: 104, color: '#A7F3B5', letterSpacing: -2, fontVariantNumeric: 'tabular-nums', textShadow: '0 0 18px rgba(167,243,181,0.5)'}}>{flick}</div>
          <div style={{fontWeight: 700, fontSize: 40, color: '#A7F3B5', opacity: 0.8}}>kg</div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 420, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 68, color: '#FFFFFF', opacity: tween(t, 8.1, 0.3)}}>the scale doesn't move</div>
      <div style={{position: 'absolute', top: 40, left: 40, padding: '10px 22px', borderRadius: 30, background: RED, color: '#fff', fontFamily: SANS, fontWeight: 800, fontSize: 34, opacity: lock, scale: lerp(lock, 1.3, 1)}}>NO CHANGE</div>
    </AbsoluteFill>
  );
};

/** Labels on the card: MORE CARDIO? + a red cross in the hook, stacking chips in the pile-up, big numbers on the essentials. */
const CHIPS = [
  {at: 10.7, text: '+20 min cardio'},
  {at: 12.46, text: '+1 workout'},
  {at: 15.14, text: 'cardio every day'},
];
const CardOverlay: React.FC = () => {
  const t = useT();
  const pil = PILLARS.find((k) => inside(t, k.w));
  return (
    <AbsoluteFill>
      {inside(t, C.hookB) ? (
        <>
          <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 40%)'}} />
          <div style={{position: 'absolute', left: 36, top: 34, opacity: tween(t, 2.84, 0.3), fontFamily: SANS, fontWeight: 800, fontSize: 64, color: '#fff', textShadow: SHADOW, letterSpacing: -2}}>MORE CARDIO?</div>
          {t > 3.96 ? (
            <div style={{position: 'absolute', left: '50%', top: '50%', translate: '-50% -50%', scale: lerp(tween(t, 3.96, 0.3, EASE_OUT), 1.6, 1), opacity: tween(t, 3.96, 0.2)}}>
              <svg width={260} height={260} viewBox="0 0 100 100" style={{filter: 'drop-shadow(0 6px 20px rgba(0,0,0,0.5))'}}>
                <path d="M 20 20 L 80 80 M 80 20 L 20 80" stroke={RED} strokeWidth={14} strokeLinecap="round" />
              </svg>
            </div>
          ) : null}
        </>
      ) : null}
      {any(t, [C.esc1, C.esc2, C.esc3]) ? (
        <>
          <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 45%)'}} />
          <div style={{position: 'absolute', left: 30, top: 30, display: 'flex', flexDirection: 'column', gap: 14}}>
            {CHIPS.map((c, i) => {
              const p = tween(t, c.at, 0.35, EASE_OUT);
              if (p <= 0) return null;
              return (
                <div key={i} style={{alignSelf: 'flex-start', padding: '12px 26px', borderRadius: 40, background: i === CHIPS.length - 1 ? RED : 'rgba(255,255,255,0.95)', color: i === CHIPS.length - 1 ? '#fff' : INK, fontFamily: SANS, fontWeight: 800, fontSize: 44, letterSpacing: -1, opacity: p, translate: `${lerp(p, -40, 0)}px 0`, boxShadow: '0 8px 24px rgba(0,0,0,0.3)'}}>
                  {c.text}
                </div>
              );
            })}
          </div>
        </>
      ) : null}
      {pil ? (
        <>
          <AbsoluteFill style={{background: 'linear-gradient(to bottom right, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 45%)'}} />
          <div style={{position: 'absolute', left: 34, top: 14, display: 'flex', alignItems: 'center', gap: 22, opacity: tween(t, pil.at - 0.1, 0.3), translate: `0 ${lerp(tween(t, pil.at - 0.1, 0.35, EASE_OUT), 30, 0)}px`}}>
            <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 190, lineHeight: 1, letterSpacing: -8, color: 'rgba(255,255,255,0.92)', textShadow: '0 6px 30px rgba(0,0,0,0.4)'}}>{pil.n}</div>
            <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 64, lineHeight: 1.02, letterSpacing: -2, color: '#fff', textShadow: SHADOW, whiteSpace: 'pre'}}>{pil.label.replace(' ', '\n')}</div>
          </div>
          <div style={{position: 'absolute', right: 34, bottom: 30, display: 'flex', gap: 12}}>
            {PILLARS.map((k, i) => <div key={i} style={{width: 22, height: 22, borderRadius: 11, background: t >= k.at ? CREAM : 'rgba(255,255,255,0.35)', boxShadow: '0 2px 8px rgba(0,0,0,0.35)'}} />)}
          </div>
        </>
      ) : null}
    </AbsoluteFill>
  );
};

/** White stage behind her shrunk cut-out while a card is up. */
export const V6Stage: React.FC = () => {
  const t = useT();
  const run = CARD_RUNS.find((r) => t >= r.start - 0.01 && t < r.end);
  if (!run) return null;
  // solid for the whole run: the wall drops out behind her, and she is back at full size (matching the
  // footage exactly) by the time it goes, so the exit is seamless
  const o = tween(t, run.start, 0.08);
  return <AbsoluteFill style={{opacity: o, background: 'radial-gradient(100% 70% at 50% 35%, #FFFFFF 0%, #F7F5F1 65%, #ECE7DF 100%)'}} />;
};

// ===========================================================================
// Full-frame B-roll words
// ===========================================================================
export const V6Broll: React.FC = () => {
  const t = useT();
  if (!inside(t, C.benefits)) return null;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.22) 26%, rgba(0,0,0,0) 40%)'}} />
      <Word text="it has its" at={26.92} out={C.benefits.end - 0.1} y={190} size={96} serif />
      <Word text="BENEFITS" at={27.46} out={C.benefits.end - 0.1} y={320} size={170} shine />
    </AbsoluteFill>
  );
};

// ===========================================================================
// CTA: comment box types CARDIO and sends
// ===========================================================================
const Avatar: React.FC = () => (
  <svg viewBox="0 0 100 100" width="100%" height="100%" style={{display: 'block', borderRadius: '50%', border: '3px solid #fff', boxSizing: 'border-box', background: '#DDE8F6'}}>
    <defs>
      <clipPath id="av6"><circle cx={50} cy={50} r={50} /></clipPath>
    </defs>
    <g clipPath="url(#av6)">
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

export const V6Comment: React.FC = () => {
  const t = useT();
  if (t < C.cta.start + 0.08) return null;
  const word = 'CARDIO';
  const p = tween(t, 42.92, 0.4, EASE_OUT);
  const typed = word.slice(0, Math.max(0, Math.min(word.length, Math.floor((t - 43.25) / 0.08) + 1)));
  const sent = tween(t, 43.9, 0.25, EASE_OUT);
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
