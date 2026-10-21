import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ICONS} from '../explainer/icons';
import {useT} from '../explainer/kit';
import {EASE_IN, EASE_IN_OUT, EASE_OUT, SANS, SERIF, lerp, tween} from '../theme';
import {C, ITEMS, STAGE_RUNS, TOTAL_AT} from './config';

/**
 * Snack reel graphics: illustrated snack stickers, a receipt that prints line by line, a giant +500
 * behind her head, a "your day" timeline. Cream bold sans + white italic serif, everything straight.
 */
const CREAM = '#F6E7C1';
const INK = '#1B1714';
const RED = '#FF5A4E';
const GREEN = '#34C759';
const SHADOW = '0 0 34px rgba(0,0,0,0.55), 0 0 70px rgba(0,0,0,0.35), 0 3px 8px rgba(0,0,0,0.45)';
type Win = {start: number; end: number};
const inside = (t: number, w: Win) => t >= w.start && t < w.end;

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
      <div style={{...base, ...(sh ? shine(t, at + 0.35, 0.7) : {color: color ?? (serif ? '#FFFFFF' : CREAM), textShadow: color === INK ? undefined : SHADOW})}}>{text}</div>
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

/** A huge cream word or number that wipes up out of a mask behind her head. */
const Rise: React.FC<{text: string; at: number; out: number; y: number; size: number}> = ({text, at, out, y, size}) => {
  const t = useT();
  if (t < at - 0.02 || t > out + 0.3) return null;
  const p = tween(t, at, 0.55, EASE_OUT);
  const o = 1 - tween(t, out, 0.25, EASE_IN);
  return (
    <div style={{position: 'absolute', left: 540, top: y, translate: '-50% -50%', overflow: 'hidden', padding: '0 20px', opacity: o, filter: 'drop-shadow(0 0 28px rgba(0,0,0,0.5)) drop-shadow(0 10px 22px rgba(0,0,0,0.3))'}}>
      <div style={{translate: `0 ${lerp(p, 70, 0)}%`, scale: lerp(p, 1.12, 1), fontFamily: SANS, fontWeight: 800, fontSize: size, letterSpacing: -size * 0.05, lineHeight: 0.92, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', ...shine(t, at + 0.45, 0.8)}}>
        {text}
      </div>
    </div>
  );
};

// ===========================================================================
// Snack stickers (flat illustrations with a white sticker edge)
// ===========================================================================
type Kind = 'apple' | 'almond' | 'bar' | 'choc' | 'bowl';
const Art: React.FC<{kind: Kind}> = ({kind}) => {
  if (kind === 'apple')
    return (
      <g>
        <path d="M 50 30 C 38 22, 18 26, 18 50 C 18 72, 34 86, 44 84 C 48 83, 52 83, 56 84 C 66 86, 82 72, 82 50 C 82 26, 62 22, 50 30 Z" fill="#E84A3C" />
        <path d="M 30 44 C 30 36, 36 32, 42 33" stroke="#FF8A7A" strokeWidth={5} fill="none" strokeLinecap="round" />
        <path d="M 50 30 C 50 22, 52 16, 56 12" stroke="#6B4423" strokeWidth={5} fill="none" strokeLinecap="round" />
        <path d="M 54 20 C 62 10, 74 12, 76 16 C 70 24, 60 24, 54 20 Z" fill="#4CAF50" />
      </g>
    );
  if (kind === 'almond')
    return (
      <g>
        {[
          [34, 58, -30],
          [62, 52, 25],
          [48, 34, 0],
        ].map(([x, y, r], i) => (
          <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
            <path d="M 0 -20 C 12 -12, 14 8, 0 20 C -14 8, -12 -12, 0 -20 Z" fill="#B9773E" />
            <path d="M 0 -14 C 4 -6, 4 6, 0 14" stroke="#8E5527" strokeWidth={2.5} fill="none" />
          </g>
        ))}
      </g>
    );
  if (kind === 'bar')
    return (
      <g>
        <rect x={10} y={32} width={80} height={36} rx={8} fill="#6C4CD9" />
        <path d="M 10 40 L 4 36 L 4 64 L 10 60 Z M 90 40 L 96 36 L 96 64 L 90 60 Z" fill="#5638B8" />
        <text x={50} y={55} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={13} fill="#fff" letterSpacing={0.5}>
          PROTEIN
        </text>
      </g>
    );
  if (kind === 'choc')
    return (
      <g>
        <rect x={16} y={20} width={68} height={62} rx={6} fill="#4A2A1A" />
        {[0, 1, 2].map((c) => [0, 1, 2].map((r) => <rect key={`${c}${r}`} x={21 + c * 21} y={25 + r * 18.5} width={17} height={14.5} rx={3} fill="#5E3A26" />))}
        <path d="M 52 82 L 84 50 L 84 82 Z" fill="#C9CED6" />
      </g>
    );
  return null;
};

const Sticker: React.FC<{kind: Kind; size: number; x: number; y: number; at: number; out: number; cross?: number; tick?: number}> = ({kind, size, x, y, at, out, cross = 0, tick = 0}) => {
  const t = useT();
  if (t < at - 0.02 || t > out + 0.3) return null;
  const p = tween(t, at, 0.4, EASE_OUT);
  const o = Math.min(1, p * 2) * (1 - tween(t, out, 0.25, EASE_IN));
  return (
    <div style={{position: 'absolute', left: x, top: y, width: size, height: size, translate: '-50% -50%', opacity: o, scale: lerp(p, 0.4, 1) * (1 + 0.08 * Math.sin(Math.PI * p))}}>
      <div style={{width: '100%', height: '100%', borderRadius: '50%', background: '#FFFFFF', boxShadow: '0 14px 34px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', filter: cross > 0.5 ? `grayscale(${cross * 0.6})` : undefined}}>
        <svg viewBox="0 0 100 100" width={size * 0.78} height={size * 0.78}>
          <Art kind={kind} />
        </svg>
      </div>
      {cross > 0 ? (
        <svg viewBox="0 0 100 100" width={size} height={size} style={{position: 'absolute', inset: 0}}>
          <path d="M 24 24 L 76 76" stroke={RED} strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.min(1, cross * 2)} />
          <path d="M 76 24 L 24 76" stroke={RED} strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.max(0, cross * 2 - 1)} />
        </svg>
      ) : null}
      {tick > 0 ? (
        <div style={{position: 'absolute', right: -6, top: -6, width: size * 0.36, height: size * 0.36, borderRadius: '50%', background: GREEN, border: '5px solid #fff', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', scale: lerp(tween(t, 0, 1), 1, 1) * lerp(tick, 0.4, 1), opacity: tick}}>
          <svg viewBox="0 0 100 100" width="70%" height="70%">
            <path d="M 22 52 L 42 70 L 78 32" fill="none" stroke="#fff" strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      ) : null}
    </div>
  );
};

// ===========================================================================
// Behind her head
// ===========================================================================
export const V7Behind: React.FC = () => {
  const t = useT();
  const n = Math.round(lerp(tween(t, 21.3, 1.1, EASE_IN_OUT), 0, 500));
  return (
    <>
      {inside(t, C.hook) ? <Rise text="STOP" at={0.92} out={C.hook.end - 0.2} y={600} size={330} /> : null}
      {inside(t, C.extra) && t >= 20.1 ? <Rise text={`+${n}`} at={20.1} out={C.extra.end - 0.2} y={600} size={330} /> : null}
      {t >= C.cta.start ? <Rise text="SNACK" at={45.44} out={999} y={600} size={270} /> : null}
    </>
  );
};

// ===========================================================================
// In front of her
// ===========================================================================
const HOOK_STICKERS: {kind: Kind; x: number; y: number; at: number}[] = [
  {kind: 'apple', x: 165, y: 900, at: 1.7},
  {kind: 'almond', x: 915, y: 880, at: 1.84},
  {kind: 'bar', x: 160, y: 1190, at: 1.98},
  {kind: 'choc', x: 920, y: 1210, at: 2.12},
];

export const V7Talk: React.FC = () => {
  const t = useT();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {inside(t, C.hook) ? (
        <>
          <Word text="eating healthy snacks" at={1.36} out={C.hook.end - 0.2} y={330} size={84} serif />
          {HOOK_STICKERS.map((k, i) => (
            <Sticker key={i} {...k} size={190} out={C.hook.end - 0.2} cross={tween(t, 3.56 + i * 0.08, 0.35, EASE_OUT)} />
          ))}
        </>
      ) : null}
      {inside(t, C.hear) ? (
        <>
          <Word text="sounds wrong?" at={4.88} out={C.hear.end - 0.15} y={230} size={96} serif />
          <Word text="HEAR ME OUT" at={5.98} out={C.hear.end - 0.15} y={360} size={150} shine />
        </>
      ) : null}
      {inside(t, C.extra) ? (
        <>
          <Word text="extra calories" at={22.86} out={23.85} y={300} size={96} serif />
          <Word text="and it felt like nothing" at={24.48} out={C.extra.end - 0.2} y={300} size={84} serif />
        </>
      ) : null}
      {inside(t, C.meToo) ? <Guilty /> : null}
      {inside(t, C.great) ? (
        <>
          {(['apple', 'almond', 'bar', 'choc'] as Kind[]).map((k, i) => (
            <Sticker key={k} kind={k} size={180} x={180 + i * 240} y={260} at={28.9 + i * 0.12} out={C.great.end - 0.2} tick={tween(t, 31.98 + i * 0.14, 0.35, EASE_OUT)} />
          ))}
          <Word text="actually great foods" at={32.28} out={C.great.end - 0.2} y={470} size={84} serif />
        </>
      ) : null}
      {inside(t, C.unlimited) ? <Unlimited /> : null}
      {t >= C.cta.start ? (
        <>
          <Word text="Comment" at={45.14} out={999} y={470} size={96} serif />
          <Word text="for my free snack guide" at={47.18} out={999} y={1480} size={50} color="#FFFFFF" />
        </>
      ) : null}
    </AbsoluteFill>
  );
};

const Guilty: React.FC = () => {
  const t = useT();
  const p = tween(t, 27.92, 0.35, EASE_OUT);
  return (
    <div style={{position: 'absolute', left: 540, top: 300, translate: '-50% -50%', display: 'flex', alignItems: 'center', gap: 18, padding: '18px 34px 18px 18px', borderRadius: 60, background: CREAM, boxShadow: '0 16px 40px rgba(0,0,0,0.35)', opacity: p * (1 - tween(t, C.meToo.end - 0.15, 0.15)), scale: lerp(p, 0.7, 1), fontFamily: SANS}}>
      <div style={{width: 70, height: 70, borderRadius: 18, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <svg viewBox="0 0 100 100" width={50} height={50}>
          <path d="M 22 52 L 42 70 L 78 32" fill="none" stroke={CREAM} strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - tween(t, 28.05, 0.25)} />
        </svg>
      </div>
      <div style={{fontWeight: 800, fontSize: 64, color: INK, letterSpacing: -2}}>guilty too</div>
    </div>
  );
};

const Unlimited: React.FC = () => {
  const t = useT();
  const out = C.unlimited.end - 0.2;
  return (
    <>
      <Word text="healthy" at={33.76} out={out} y={200} size={110} serif />
      <Word text="≠" at={34.36} out={out} y={330} size={130} color={RED} />
      <Word text="UNLIMITED" at={36.62} out={out} y={470} size={180} shine />
    </>
  );
};

// ===========================================================================
// White stage + the cards on top
// ===========================================================================
/** Solid for the whole run: the wall drops out behind her, and she is back at full size (matching the
 * footage) by the time it goes, so the exit is seamless. */
export const V7Stage: React.FC = () => {
  const t = useT();
  const run = STAGE_RUNS.find((r) => t >= r.start - 0.01 && t < r.end);
  if (!run) return null;
  return <AbsoluteFill style={{opacity: tween(t, run.start, 0.08), background: 'radial-gradient(100% 70% at 50% 35%, #FFFFFF 0%, #F7F5F1 65%, #ECE7DF 100%)'}} />;
};

const cardIn = (t: number, w: Win) => {
  const pin = tween(t, w.start + 0.2, 0.4, EASE_OUT);
  const pout = tween(t, w.end - 0.6, 0.25, EASE_IN_OUT);
  return {y: lerp(pin, -260, 0) + lerp(pout, 0, -1100), o: Math.min(1, pin * 1.5)};
};

const ItemIcon: React.FC<{icon: string}> = ({icon}) =>
  icon === 'bowl' ? (
    <Glyph name="bowl-food" size={54} color={INK} />
  ) : (
    <svg viewBox="0 0 100 100" width={60} height={60}>
      <Art kind={icon as Kind} />
    </svg>
  );

/** The snack receipt prints downward from a slot as she lists each snack. */
export const V7Receipt: React.FC = () => {
  const t = useT();
  if (!inside(t, C.receipt)) return null;
  const {y, o} = cardIn(t, C.receipt);
  const shown = ITEMS.filter((k) => t >= k.at).length;
  const total = tween(t, TOTAL_AT, 0.4, EASE_OUT);
  const target = 150 + shown * 92 + (total > 0 ? 150 : 0);
  // paper height eases toward the current number of lines
  const prev = 150 + Math.max(0, shown - 1) * 92 + 0;
  const last = shown > 0 ? ITEMS[shown - 1].at : C.receipt.start;
  const grow = total > 0 ? lerp(tween(t, TOTAL_AT, 0.35, EASE_OUT), 150 + shown * 92, target) : lerp(tween(t, last, 0.3, EASE_OUT), prev, target);
  const stamp = tween(t, TOTAL_AT + 0.45, 0.3, EASE_OUT);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 960, translate: `0 ${y}px`, opacity: o, fontFamily: SANS}}>
      {/* printer slot */}
      <div style={{position: 'absolute', left: 120, top: 92, width: 840, height: 40, borderRadius: 20, background: '#2B2520', boxShadow: '0 10px 30px rgba(40,30,20,0.3)'}} />
      {/* paper */}
      <div style={{position: 'absolute', left: 170, top: 112, width: 740, height: grow, overflow: 'hidden', filter: 'drop-shadow(0 18px 30px rgba(40,30,20,0.22))'}}>
        <div style={{position: 'absolute', inset: 0, background: '#FFFDF8', clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 14px), 95% 100%, 90% calc(100% - 14px), 85% 100%, 80% calc(100% - 14px), 75% 100%, 70% calc(100% - 14px), 65% 100%, 60% calc(100% - 14px), 55% 100%, 50% calc(100% - 14px), 45% 100%, 40% calc(100% - 14px), 35% 100%, 30% calc(100% - 14px), 25% 100%, 20% calc(100% - 14px), 15% 100%, 10% calc(100% - 14px), 5% 100%, 0 calc(100% - 14px))'}} />
        <div style={{position: 'absolute', left: 44, right: 44, top: 46, textAlign: 'center'}}>
          <div style={{fontWeight: 800, fontSize: 44, letterSpacing: 6, color: INK}}>SNACK RECEIPT</div>
          <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 34, color: '#8a8178', marginTop: 4}}>one &quot;healthy&quot; day</div>
          <div style={{borderTop: '3px dashed #CFC6BA', marginTop: 16}} />
        </div>
        {ITEMS.map((k, i) => {
          const p = tween(t, k.at, 0.3, EASE_OUT);
          if (p <= 0) return null;
          return (
            <div key={i} style={{position: 'absolute', left: 44, right: 44, top: 160 + i * 92, height: 80, display: 'flex', alignItems: 'center', gap: 20, opacity: p, translate: `${lerp(p, -16, 0)}px 0`}}>
              <div style={{width: 64, display: 'flex', justifyContent: 'center'}}>
                <ItemIcon icon={k.icon} />
              </div>
              <div style={{flex: 1, fontWeight: 700, fontSize: 42, color: INK, whiteSpace: 'nowrap'}}>{k.label}</div>
              <div style={{fontWeight: 800, fontSize: 44, color: k.kcal === 'meal' ? '#8a8178' : INK, fontVariantNumeric: 'tabular-nums'}}>{k.kcal === 'meal' ? 'meal' : `${k.kcal}`}</div>
            </div>
          );
        })}
        {total > 0 ? (
          <div style={{position: 'absolute', left: 44, right: 44, top: 160 + ITEMS.length * 92 + 10, opacity: total}}>
            <div style={{borderTop: '3px dashed #CFC6BA'}} />
            <div style={{display: 'flex', alignItems: 'center', marginTop: 22}}>
              <div style={{flex: 1, fontWeight: 800, fontSize: 48, color: INK, letterSpacing: 2}}>EXTRA</div>
              <div style={{fontWeight: 800, fontSize: 60, color: RED, fontVariantNumeric: 'tabular-nums'}}>+520 kcal</div>
            </div>
          </div>
        ) : null}
      </div>
      {/* stamp */}
      {stamp > 0 ? (
        <div style={{position: 'absolute', left: 600, top: 300, rotate: '0deg', padding: '12px 28px', border: `7px solid ${RED}`, borderRadius: 18, color: RED, fontWeight: 800, fontSize: 54, letterSpacing: 4, opacity: stamp * 0.92, scale: lerp(stamp, 1.6, 1), background: 'rgba(255,253,248,0.6)'}}>
          NOT A MEAL
        </div>
      ) : null}
    </div>
  );
};

/** "instead of constantly picking at food throughout the day": a day of grazing vs three real meals. */
const PICKS = [8.6, 9.4, 10.3, 11.1, 12.6, 13.4, 14.8, 15.7, 16.6, 17.9, 19.2, 20.6, 21.5];
const MEALS = [{h: 8.5, w: 1.0}, {h: 13.0, w: 1.0}, {h: 19.5, w: 1.0}];
export const V7Day: React.FC = () => {
  const t = useT();
  if (!inside(t, C.day)) return null;
  const {y, o} = cardIn(t, C.day);
  const X0 = 210, X1 = 880; // 8:00 -> 22:00
  const hx = (h: number) => X0 + ((h - 8) / 14) * (X1 - X0);
  const meals = tween(t, 43.1, 0.4, EASE_OUT);
  return (
    <div style={{position: 'absolute', left: 70, top: 110, width: 940, height: 760, borderRadius: 46, background: 'radial-gradient(90% 80% at 50% 30%, #3A3129 0%, #1B1714 75%)', boxShadow: '0 30px 70px rgba(40,30,20,0.3)', border: '6px solid #fff', boxSizing: 'border-box', translate: `0 ${y}px`, opacity: o, fontFamily: SANS, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 46, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 72, color: '#fff'}}>your day</div>
      {/* picking row */}
      <div style={{position: 'absolute', left: 50, top: 230, fontWeight: 800, fontSize: 40, color: 'rgba(255,255,255,0.75)'}}>picking</div>
      <div style={{position: 'absolute', left: X0, width: X1 - X0, top: 252, height: 4, background: 'rgba(255,255,255,0.18)', borderRadius: 2}} />
      {PICKS.map((h, i) => {
        const p = tween(t, 41.74 + i * 0.09, 0.25, EASE_OUT);
        return p > 0 ? <div key={i} style={{position: 'absolute', left: hx(h) - 16, top: 238, width: 32, height: 32, borderRadius: 16, background: RED, opacity: p * (1 - 0.6 * meals), scale: lerp(p, 0.3, 1)}} /> : null;
      })}
      {meals > 0 ? <div style={{position: 'absolute', left: X0 - 10, top: 250, width: (X1 - X0 + 20) * meals, height: 8, background: RED, borderRadius: 4, opacity: 0.9}} /> : null}
      {/* meals row */}
      <div style={{position: 'absolute', left: 50, top: 420, fontWeight: 800, fontSize: 40, color: CREAM, opacity: lerp(meals, 0.35, 1)}}>meals</div>
      <div style={{position: 'absolute', left: X0, width: X1 - X0, top: 442, height: 4, background: 'rgba(255,255,255,0.18)', borderRadius: 2}} />
      {MEALS.map((m, i) => {
        const p = tween(t, 43.1 + i * 0.15, 0.35, EASE_OUT);
        return p > 0 ? (
          <div key={i} style={{position: 'absolute', left: hx(m.h) - 50, top: 400, width: 100, height: 90, borderRadius: 22, background: CREAM, opacity: p, scale: lerp(p, 0.5, 1), display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 24px rgba(0,0,0,0.35)'}}>
            <Glyph name="bowl-food" size={56} color={INK} />
          </div>
        ) : null;
      })}
      {/* hour axis */}
      {[8, 12, 16, 20].map((h) => (
        <div key={h} style={{position: 'absolute', left: hx(h), top: 560, translate: '-50% 0', fontWeight: 700, fontSize: 30, color: 'rgba(255,255,255,0.45)'}}>{h <= 12 ? `${h}am` : `${h - 12}pm`}</div>
      ))}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 56, textAlign: 'center', fontWeight: 800, fontSize: 52, color: CREAM, opacity: tween(t, 43.6, 0.35)}}>meals that keep you full</div>
    </div>
  );
};

// ===========================================================================
// Full-frame B-roll words
// ===========================================================================
export const V7Broll: React.FC = () => {
  const t = useT();
  if (!inside(t, C.meals)) return null;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.22) 26%, rgba(0,0,0,0) 40%)'}} />
      <Word text="you need" at={38.72} out={C.meals.end - 0.1} y={180} size={84} serif />
      <Word text="REAL MEALS" at={39.08} out={C.meals.end - 0.1} y={310} size={160} shine />
    </AbsoluteFill>
  );
};

// ===========================================================================
// CTA: comment box types SNACK and sends
// ===========================================================================
const Avatar: React.FC = () => (
  <svg viewBox="0 0 100 100" width="100%" height="100%" style={{display: 'block', borderRadius: '50%', border: '3px solid #fff', boxSizing: 'border-box', background: '#E6F2DF'}}>
    <defs>
      <clipPath id="av7"><circle cx={50} cy={50} r={50} /></clipPath>
    </defs>
    <g clipPath="url(#av7)">
      <rect width={100} height={100} fill="#E6F2DF" />
      <path d="M 22 62 C 18 30, 34 16, 52 17 C 72 18, 84 34, 80 62 L 82 84 L 20 84 Z" fill="#5A3A24" />
      <path d="M 14 104 C 16 80, 32 72, 50 72 C 68 72, 84 80, 86 104 Z" fill="#F29B4B" />
      <rect x={43} y={58} width={14} height={16} rx={6} fill="#E0A27D" />
      <ellipse cx={50} cy={46} rx={17} ry={20} fill="#F0BC97" />
      <path d="M 32 44 C 32 28, 46 22, 58 26 C 66 29, 70 36, 69 44 C 60 36, 44 35, 32 44 Z" fill="#5A3A24" />
      <circle cx={43.5} cy={48} r={1.9} fill="#3A2416" />
      <circle cx={56.5} cy={48} r={1.9} fill="#3A2416" />
      <path d="M 45 56 Q 50 59.5, 55 56" stroke="#B5534F" strokeWidth={1.8} fill="none" strokeLinecap="round" />
    </g>
  </svg>
);

export const V7Comment: React.FC = () => {
  const t = useT();
  if (t < C.cta.start + 0.08) return null;
  const word = 'SNACK';
  const p = tween(t, 45.14, 0.4, EASE_OUT);
  const typed = word.slice(0, Math.max(0, Math.min(word.length, Math.floor((t - 45.5) / 0.08) + 1)));
  const sent = tween(t, 46.1, 0.25, EASE_OUT);
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
