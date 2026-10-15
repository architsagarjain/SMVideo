import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {ICONS} from '../explainer/icons';
import {PIXEL, PIXEL_WIDE, X, useT} from '../explainer/kit';
import {EASE_IN, EASE_IN_OUT, EASE_OUT, SANS, lerp, springAt, tween} from '../theme';

/**
 * Hook kit: the opening seconds play on her real footage (no wash, no cut-out).
 * Everything sits beside her head as clean stickers that pop in, float a little and
 * leave together when the hook ends.
 */

/** Soft cinematic vignette + a touch of contrast at the edges, so stickers and the title read on a busy wall. */
export const HookVignette: React.FC<{end: number}> = ({end}) => {
  const t = useT();
  const o = 1 - tween(t, end - 0.3, 0.3);
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{opacity: o, pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: 'radial-gradient(120% 75% at 50% 48%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.38) 100%)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0) 22%)'}} />
    </AbsoluteFill>
  );
};

const pop = (t: number, at: number) => springAt(t, at, 11, 210);

/** Sticker wrapper: pops in with a spin, floats gently, shrinks out at `out`. */
export const Sticker: React.FC<{at: number; out: number; x: number; y: number; rot?: number; children: React.ReactNode}> = ({at, out, x, y, rot = 0, children}) => {
  const t = useT();
  if (t < at - 0.02 || t > out + 0.3) return null;
  const p = pop(t, at);
  const o = 1 - tween(t, out, 0.22, EASE_IN);
  const fy = Math.sin((t - at) * 2.4 + x) * 6;
  return (
    <div style={{position: 'absolute', left: x, top: y + fy, translate: '-50% -50%', scale: Math.max(0, p) * lerp(o, 0.6, 1), opacity: o, rotate: `${lerp(Math.min(p, 1.1), rot - 30, rot)}deg`}}>
      {children}
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

const SHADOW = '0 18px 40px rgba(0,0,0,0.35), 0 4px 10px rgba(0,0,0,0.2)';

/** Pixel text that renders at its true stretched width (see Chip). */
const Px: React.FC<{size: number; color: string; children: React.ReactNode}> = ({size, color, children}) => (
  <span style={{display: 'inline-block', fontFamily: PIXEL, fontSize: size * PIXEL_WIDE, lineHeight: 1, color, scale: `1 ${1 / PIXEL_WIDE}`, margin: `${(-size * (PIXEL_WIDE - 1)) / 2}px 0`, whiteSpace: 'pre'}}>{children}</span>
);

/** White circle sticker with an icon and an optional pill label under it. */
export const IconSticker: React.FC<{icon: string; color: string; d?: number; label?: string; labelBg?: string}> = ({icon, color, d = 210, label, labelBg = X.ink}) => (
  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
    <div style={{width: d, height: d, borderRadius: '50%', background: '#fff', boxShadow: SHADOW, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <Glyph name={icon} size={d * 0.6} color={color} />
    </div>
    {label ? <Pill bg={labelBg} size={34}>{label}</Pill> : null}
  </div>
);

export const Pill: React.FC<{bg: string; fg?: string; size: number; children: React.ReactNode}> = ({bg, fg = '#fff', size, children}) => (
  <div style={{background: bg, borderRadius: 999, padding: `${size * 0.32}px ${size * 0.62}px ${size * 0.26}px`, boxShadow: SHADOW, whiteSpace: 'nowrap'}}>
    <Px size={size} color={fg}>
      {children}
    </Px>
  </div>
);

/** Big counter sticker: "+0 KG" rolls up to "+15 KG". */
export const CountSticker: React.FC<{at: number; to: number; prefix?: string; unit: string; bg: string}> = ({at, to, prefix = '+', unit, bg}) => {
  const t = useT();
  const n = Math.round(to * tween(t, at + 0.05, 0.55, EASE_OUT));
  return (
    <div style={{background: bg, borderRadius: 34, padding: '22px 34px 14px', boxShadow: SHADOW, display: 'flex', alignItems: 'baseline', gap: 12}}>
      <Px size={120} color="#fff">{`${prefix}${n}`}</Px>
      <Px size={52} color="#fff">{unit}</Px>
    </div>
  );
};

/** Polaroid-style photo card with a hand-written-ish caption strip. */
export const PhotoCard: React.FC<{src: string; w: number; caption: string; children?: React.ReactNode}> = ({src, w, caption, children}) => (
  <div style={{position: 'relative', background: '#fff', padding: `${w * 0.06}px ${w * 0.06}px ${w * 0.04}px`, borderRadius: 18, boxShadow: SHADOW}}>
    <Img src={staticFile(src)} style={{display: 'block', width: w, height: w, objectFit: 'cover', borderRadius: 10}} />
    <div style={{textAlign: 'center', marginTop: w * 0.04}}>
      <Px size={34} color={X.ink}>{caption}</Px>
    </div>
    {children}
  </div>
);

/** Rubber stamp that slams onto whatever it sits over. */
export const Stamp: React.FC<{at: number; text: string; color: string; size?: number; rot?: number}> = ({at, text, color, size = 70, rot = -14}) => {
  const t = useT();
  if (t < at) return null;
  const p = tween(t, at, 0.16, EASE_IN);
  return (
    <div style={{position: 'absolute', left: '50%', top: '42%', translate: '-50% -50%', rotate: `${rot}deg`, scale: lerp(p, 2.2, 1), opacity: lerp(p, 0, 1), border: `8px solid ${color}`, borderRadius: 18, padding: '10px 22px 4px', background: 'rgba(255,255,255,0.85)'}}>
      <Px size={size} color={color}>{text}</Px>
    </div>
  );
};

/** Analog clock sticker whose minute hand rewinds one full hour at `rewindAt`. */
export const ClockSticker: React.FC<{d: number; rewindAt: number; accent: string}> = ({d, rewindAt, accent}) => {
  const t = useT();
  const back = tween(t, rewindAt, 0.9, EASE_IN_OUT); // 0 -> 1 = one full turn backwards
  const tick = t < rewindAt ? Math.floor((t * 2) % 60) * 6 : 0; // ticking second hand before the rewind
  const minute = -360 * back;
  const hour = 60 - 30 * back;
  const ring = t >= rewindAt && t < rewindAt + 0.9 ? Math.sin((t - rewindAt) * 60) * 4 : 0;
  return (
    <div style={{width: d, height: d, borderRadius: '50%', background: '#fff', boxShadow: SHADOW, position: 'relative', rotate: `${ring}deg`}}>
      <svg viewBox="-100 -100 200 200" width={d} height={d} style={{position: 'absolute', inset: 0}}>
        <circle r={86} fill="none" stroke={X.ink} strokeWidth={9} />
        {Array.from({length: 12}, (_, i) => (
          <line key={i} x1={0} y1={-72} x2={0} y2={i % 3 === 0 ? -58 : -64} stroke={X.ink} strokeWidth={i % 3 === 0 ? 7 : 4} strokeLinecap="round" transform={`rotate(${i * 30})`} />
        ))}
        {back > 0 && back < 1 ? <path d={describeArc(0, 0, 50, minute, 0)} fill="none" stroke={accent} strokeWidth={14} strokeLinecap="round" opacity={0.5} /> : null}
        <line x1={0} y1={8} x2={0} y2={-38} stroke={X.ink} strokeWidth={10} strokeLinecap="round" transform={`rotate(${hour})`} />
        <line x1={0} y1={10} x2={0} y2={-62} stroke={accent} strokeWidth={8} strokeLinecap="round" transform={`rotate(${minute})`} />
        {t < rewindAt ? <line x1={0} y1={12} x2={0} y2={-66} stroke={X.greyText} strokeWidth={3} transform={`rotate(${tick})`} /> : null}
        <circle r={9} fill={X.ink} />
      </svg>
    </div>
  );
};

const describeArc = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const p = (a: number) => [cx + r * Math.sin((a * Math.PI) / 180), cy - r * Math.cos((a * Math.PI) / 180)];
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  return `M${x0} ${y0} A${r} ${r} 0 ${large} ${a1 > a0 ? 1 : 0} ${x1} ${y1}`;
};

/** Magnifier that slides across a target (used over the photo card). */
export const Sweep: React.FC<{at: number; from: [number, number]; to: [number, number]; size: number; out: number}> = ({at, from, to, size, out}) => {
  const t = useT();
  if (t < at || t > out + 0.3) return null;
  const p = tween(t, at, 0.9, EASE_OUT);
  const o = 1 - tween(t, out, 0.22, EASE_IN);
  const x = lerp(p, from[0], to[0]) + Math.sin((t - at) * 6) * 8 * p;
  const y = lerp(p, from[1], to[1]) + Math.cos((t - at) * 6) * 6 * p;
  return (
    <div style={{position: 'absolute', left: x, top: y, translate: '-50% -50%', opacity: o * tween(t, at, 0.15), filter: 'drop-shadow(0 10px 18px rgba(0,0,0,0.35))'}}>
      <Glyph name="magnifying-glass" size={size} color={X.ink} />
    </div>
  );
};

/** Hook headline: white card on screen from frame one; words drop in fast, the key phrase's marker wipes on. */
export const HookTitle2: React.FC<{lines: [string, string?][][]; at: number; out: number; y?: number; size?: number}> = ({lines, at, out, y = 150, size = 64}) => {
  const t = useT();
  if (t > out + 0.3) return null;
  const s = lerp(Math.min(springAt(t, at, 13, 210), 1.15), 1.08, 1);
  const o = 1 - tween(t, out, 0.25, EASE_IN);
  let k = 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: 540,
        top: y,
        translate: '-50% 0%',
        rotate: `${-1.5 + Math.sin((t - at) * 2.1) * 0.5}deg`,
        scale: s * lerp(o, 0.9, 1),
        opacity: o,
        background: '#FFFFFF',
        borderRadius: 30,
        padding: '22px 36px 26px',
        boxShadow: '0 22px 60px rgba(0,0,0,0.35), 0 4px 10px rgba(0,0,0,0.2)',
        fontFamily: SANS,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1.14,
        letterSpacing: -1.5,
        color: X.ink,
        textAlign: 'center',
        whiteSpace: 'nowrap',
      }}
    >
      {lines.map((line, i) => (
        <div key={i}>
          {line.map(([txt, hl], j) => {
            const words = txt.split(/(\s+)/);
            if (hl) {
              const wipe = tween(t, at + 0.32, 0.32, EASE_OUT);
              const shine = tween(t, at + 0.55, 0.5, EASE_IN_OUT);
              return (
                <span key={j} style={{position: 'relative', display: 'inline-block', margin: '0 4px', padding: '0 14px'}}>
                  <span style={{position: 'absolute', inset: 0, borderRadius: 14, background: hl, clipPath: `inset(0 ${100 - wipe * 100}% 0 0 round 14px)`, overflow: 'hidden'}}>
                    <span style={{position: 'absolute', top: 0, bottom: 0, width: '30%', left: `${lerp(shine, -40, 120)}%`, background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0) 100%)', transform: 'skewX(-20deg)'}} />
                  </span>
                  {/* ink text underneath, white text revealed exactly where the marker has wiped on */}
                  <span style={{position: 'relative', color: X.ink}}>{txt}</span>
                  <span style={{position: 'absolute', left: 14, top: 0, color: '#fff', clipPath: `inset(0 ${100 - wipe * 100}% 0 0)`}}>{txt}</span>
                </span>
              );
            }
            return (
              <span key={j}>
                {words.map((w, m) => {
                  if (/^\s+$/.test(w) || w === '') return <span key={m}>{w}</span>;
                  const wi = k++;
                  const p = springAt(t, at + wi * 0.035, 14, 260);
                  return (
                    <span key={m} style={{display: 'inline-block', translate: `0px ${lerp(Math.min(p, 1.1), -18, 0)}px`}}>
                      {w}
                    </span>
                  );
                })}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};
