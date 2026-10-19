import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { lerp, E, rng } from '../lib';
import { C, F } from '../theme';

// Shared parts for Videos 9-16 (film/src/r9). Audio, captions and the finale end cut come from
// Shell8 in ../r8/common8 (the same end cut as Videos 1-8). Media files live in public/r9.
export const r9 = (name: string) => `r9/${name}`;

/** Closing brand line before the finale: optional role chips that link up, then a headline. */
export const BrandBeat: React.FC<{ at: number; chips?: string[]; text: string; bg?: string; accent?: string; ink?: string }> = ({ at, chips = [], text, bg, accent = C.harvest, ink = '#fff' }) => {
  const f = useCurrentFrame();
  const textAt = chips.length ? at + 12 + chips.length * 8 : at + 4;
  const lines = text.split('\n');
  return (
    <AbsoluteFill style={{ background: bg ?? `radial-gradient(ellipse 100% 70% at 50% 45%, #0B5537 0%, ${C.forest} 50%, #032116 100%)` }}>
      {chips.length > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 380, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
          {chips.map((c, i) => {
            const t = lerp(f, [at + i * 8, at + i * 8 + 12], [0, 1], E.back);
            return (
              <React.Fragment key={c}>
                {i > 0 && <div style={{ width: 4, height: 34 * Math.min(1, lerp(f, [at + i * 8 - 4, at + i * 8 + 4], [0, 1])), background: accent, borderRadius: 2, marginTop: -10, marginBottom: -10 }} />}
                <div style={{ fontFamily: F.label, fontWeight: 600, fontSize: 36, letterSpacing: '0.16em', color: ink, border: `2px solid ${accent}`, borderRadius: 999, padding: '14px 34px', background: 'rgba(0,0,0,0.25)',
                  opacity: Math.min(1, t), transform: `scale(${0.8 + 0.2 * t})` }}>{c}</div>
              </React.Fragment>
            );
          })}
        </div>
      )}
      <div style={{ position: 'absolute', left: 70, right: 70, top: chips.length ? 400 + chips.length * 110 + 40 : 640, textAlign: 'center' }}>
        {lines.map((ln, i) => {
          const t = lerp(f, [textAt + i * 5, textAt + i * 5 + 14], [0, 1], E.out);
          return (
            <div key={i} style={{ fontFamily: F.display, fontWeight: 800, fontSize: 76, lineHeight: 1.08, letterSpacing: '-0.025em', color: i === lines.length - 1 ? accent : ink, opacity: t, transform: `translateY(${(1 - t) * 30}px)` }}>{ln}</div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** A heap of drawn biomass pellets (cylinders), for shots no stock footage covers. */
export const Pellets: React.FC<{ at: number; n?: number; color?: string; x?: number; y?: number; w?: number; seed?: number; fall?: boolean }> = ({ at, n = 70, color = '#B8874A', x = 540, y = 1000, w = 640, seed = 3, fall = true }) => {
  const f = useCurrentFrame();
  const r = rng(seed);
  const ps = Array.from({ length: n }, (_, i) => {
    const u = r(), v = r();
    const px = x + (u - 0.5) * w * (1 - v * 0.55);
    const py = y - v * w * 0.32;
    return { px, py, rot: r() * 180, len: 54 + r() * 34, delay: i * 0.5 + r() * 6, shade: 0.75 + r() * 0.35 };
  }).sort((a, b) => a.py - b.py);
  return (
    <>
      {ps.map((p, i) => {
        const t = fall ? lerp(f, [at + p.delay, at + p.delay + 12], [0, 1], E.in) : 1;
        if (t <= 0) return null;
        return (
          <div key={i} style={{ position: 'absolute', left: p.px - p.len / 2, top: p.py - 400 * (1 - t) - 13, width: p.len, height: 26, borderRadius: 10,
            background: `linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.35) 100%), ${color}`, filter: `brightness(${p.shade})`,
            transform: `rotate(${p.rot}deg)`, boxShadow: '0 6px 10px rgba(0,0,0,0.35)' }} />
        );
      })}
    </>
  );
};

/** Simple line icons (stroke) used across the series. */
export const Icon: React.FC<{ name: 'flame' | 'drop' | 'gear' | 'phone' | 'flag' | 'check' | 'question'; size?: number; color?: string; fill?: string; sw?: number }> = ({ name, size = 120, color = '#fff', fill = 'none', sw = 6 }) => {
  const p: Record<string, React.ReactNode> = {
    flame: <path d="M60 12 C70 36 92 46 92 74 C92 96 77 110 60 110 C43 110 28 96 28 74 C28 58 38 50 44 40 C46 52 52 58 58 58 C54 42 54 26 60 12 Z" />,
    drop: <path d="M60 12 C74 34 94 56 94 78 C94 98 79 110 60 110 C41 110 26 98 26 78 C26 56 46 34 60 12 Z" />,
    gear: <><circle cx="60" cy="60" r="18" /><path d="M60 14 L68 14 L70 28 L82 33 L93 24 L99 30 L90 41 L95 53 L108 55 L108 65 L95 67 L90 79 L99 90 L93 96 L82 87 L70 92 L68 106 L52 106 L50 92 L38 87 L27 96 L21 90 L30 79 L25 67 L12 65 L12 55 L25 53 L30 41 L21 30 L27 24 L38 33 L50 28 L52 14 Z" /></>,
    phone: <path d="M38 14 L50 14 L56 38 L46 46 C52 62 60 70 74 76 L82 66 L106 72 L106 84 C106 96 96 106 84 104 C50 98 22 70 16 36 C14 24 24 14 38 14 Z" />,
    flag: <><path d="M28 108 L28 12" /><path d="M28 16 C46 6 62 26 92 14 L92 62 C62 74 46 54 28 64 Z" /></>,
    check: <path d="M22 62 L48 88 L98 32" />,
    question: <><path d="M40 42 C40 26 52 18 62 18 C76 18 84 28 84 40 C84 56 62 58 62 76" /><circle cx="62" cy="98" r="3" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{ overflow: 'visible' }}>
      <g fill={fill} stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">{p[name]}</g>
    </svg>
  );
};

/** Absolute-frame visibility without crossfade (hard cut), for fast-cut reels. */
export const Cut: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const f = useCurrentFrame();
  if (f < from || f >= to) return null;
  return <AbsoluteFill>{children}</AbsoluteFill>;
};

/** A spaced-caps label anywhere (not centred), with a rise-in. */
export const Tag: React.FC<{ text: string; at: number; out?: number; x: number; y: number; color?: string; bg?: string; size?: number; align?: 'left' | 'center' | 'right'; w?: number }> = ({ text, at, out = 1e9, x, y, color = C.harvest, bg = 'rgba(6,16,11,0.82)', size = 28, align = 'left', w }) => {
  const f = useCurrentFrame();
  const t = Math.min(lerp(f, [at, at + 10], [0, 1], E.out), lerp(f, [out, out + 8], [1, 0]));
  if (t <= 0) return null;
  const tx = align === 'center' ? '-50%' : align === 'right' ? '-100%' : '0';
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, transform: `translate(${tx}, ${(1 - t) * 18}px)`, opacity: t, fontFamily: F.label, fontWeight: 600, fontSize: size, letterSpacing: '0.18em', color, background: bg,
      borderRadius: 14, padding: '12px 22px', whiteSpace: w ? 'normal' : 'nowrap', textAlign: align }}>{text}</div>
  );
};
