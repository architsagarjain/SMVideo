import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import captions from './data/captions.json';
import {easeInOut, progress} from './anim';
import {C, CAPTION_Y, FPS, SANS, SCENES, SERIF} from './theme';

export const useTime = () => useCurrentFrame() / FPS;

/** 0..1 visibility of a scene: rises in at its start, falls out at its end. */
export const sceneIn = (t: number, [a, b]: readonly [number, number], inDur = 0.5, outDur = 0.35) =>
  progress(t, a, inDur) * (1 - progress(t, b - outDur, outDur, easeInOut));

/** Wrapper for a scene's content: fades and rises in, fades and lifts out. */
export const Scene: React.FC<{range: readonly [number, number]; children: React.ReactNode}> = ({range, children}) => {
  const t = useTime();
  if (t < range[0] - 0.05 || t > range[1] + 0.05) return null;
  const k = progress(t, range[0], 0.5);
  const out = progress(t, range[1] - 0.35, 0.35, easeInOut);
  return (
    <AbsoluteFill style={{opacity: k * (1 - out), transform: `translateY(${(1 - k) * 36 - out * 30}px)`}}>
      {children}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------------------
// Backgrounds

/** Cream base with a blush glow and a faint lotus watermark (like the campaign creative). */
export const CreamBackground: React.FC = () => {
  const t = useTime();
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 90% 55% at 85% 8%, ${C.blush} 0%, rgba(244,218,211,0) 70%),
                     radial-gradient(ellipse 80% 45% at 10% 95%, ${C.blushSoft} 0%, rgba(248,232,226,0) 70%), ${C.cream}`,
      }}
    >
      <Img
        src={staticFile('brand/lotus_mark.png')}
        style={{
          position: 'absolute',
          width: 760,
          left: 160,
          top: 1330,
          opacity: 0.07,
          transform: `scale(${1 + 0.02 * Math.sin(t * 0.4)})`,
        }}
      />
    </AbsoluteFill>
  );
};

/** Maroon brand panel that wipes up from the bottom over a time window. */
export const MaroonPanel: React.FC<{range: readonly [number, number]; exit?: boolean; children?: React.ReactNode}> = ({
  range,
  exit = true,
  children,
}) => {
  const t = useTime();
  if (t < range[0] - 0.05 || (exit && t > range[1] + 0.05)) return null;
  const inK = progress(t, range[0], 0.6, easeInOut);
  const outK = exit ? progress(t, range[1] - 0.55, 0.55, easeInOut) : 0;
  const y = (1 - inK) * 100 - outK * 100;
  // The leading edge is rounded while the panel moves, square once it covers the frame.
  const top = 160 * (1 - inK);
  const bottom = 160 * outK;
  return (
    <AbsoluteFill
      style={{
        transform: `translateY(${y}%)`,
        borderTopLeftRadius: top,
        borderTopRightRadius: top,
        borderBottomLeftRadius: bottom,
        borderBottomRightRadius: bottom,
        overflow: 'hidden',
        background: `radial-gradient(ellipse 80% 60% at 50% 40%, ${C.maroon} 0%, ${C.maroonDeep} 100%)`,
      }}
    >
      <Mandala />
      {children}
    </AbsoluteFill>
  );
};

/** Very faint concentric ring pattern on the maroon panel, for texture. */
const Mandala: React.FC = () => {
  const t = useTime();
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: 0.09}}>
      <g transform={`translate(540 1500) rotate(${t * 2})`} fill="none" stroke={C.goldLight} strokeWidth={1.5}>
        {[180, 240, 300, 380, 460].map((r) => (
          <circle key={r} r={r} strokeDasharray={r % 120 === 0 ? '2 10' : undefined} />
        ))}
        {Array.from({length: 24}).map((_, i) => (
          <ellipse key={i} rx={40} ry={150} transform={`rotate(${i * 15}) translate(0 -260)`} />
        ))}
      </g>
    </svg>
  );
};

/** Marigold garland along the top edge: hanging strings that sway very gently. */
export const Garland: React.FC<{appear: number}> = ({appear}) => {
  const t = useTime();
  const k = progress(t, appear, 0.8);
  const strings = [
    {x: 70, n: 5}, {x: 200, n: 3}, {x: 330, n: 6}, {x: 460, n: 3}, {x: 620, n: 3}, {x: 750, n: 6}, {x: 880, n: 3}, {x: 1010, n: 5},
  ];
  return (
    <svg width={1080} height={330} style={{position: 'absolute', top: 0, left: 0, opacity: k}}>
      <defs>
        <radialGradient id="mg-o" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#FFC24A" />
          <stop offset="100%" stopColor="#E9781A" />
        </radialGradient>
        <radialGradient id="mg-y" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#FFE07A" />
          <stop offset="100%" stopColor="#F2A81F" />
        </radialGradient>
      </defs>
      {/* top festoon */}
      <path d="M0 18 Q 270 70 540 18 T 1080 18" fill="none" stroke="#2F6B3A" strokeWidth={4} opacity={0.8} />
      {Array.from({length: 22}).map((_, i) => {
        const x = i * 51 + 10;
        const y = 18 + 26 * Math.sin((Math.PI * (x % 540)) / 540); // follows the festoon's dips
        return <Marigold key={`f${i}`} x={x} y={y} r={13} fill={i % 2 ? 'url(#mg-y)' : 'url(#mg-o)'} />;
      })}
      {strings.map((s, i) => {
        const sway = Math.sin(t * 1.1 + i) * 1.6 * k;
        const drop = (1 - k) * -40;
        return (
          <g key={i} transform={`translate(${s.x} ${drop}) rotate(${sway})`}>
            <line x1={0} y1={0} x2={0} y2={s.n * 34 + 20} stroke="#2F6B3A" strokeWidth={2} opacity={0.6} />
            {Array.from({length: s.n}).map((_, j) => (
              <Marigold key={j} x={0} y={40 + j * 34} r={15} fill={(i + j) % 2 ? 'url(#mg-y)' : 'url(#mg-o)'} />
            ))}
            <path d={`M0 ${s.n * 34 + 26} l-7 16 h14 z`} fill={C.goldLight} opacity={0.9} />
          </g>
        );
      })}
    </svg>
  );
};

const Marigold: React.FC<{x: number; y: number; r: number; fill: string}> = ({x, y, r, fill}) => (
  <g transform={`translate(${x} ${y})`}>
    {Array.from({length: 8}).map((_, i) => (
      <circle key={i} cx={Math.cos((i / 8) * Math.PI * 2) * r * 0.45} cy={Math.sin((i / 8) * Math.PI * 2) * r * 0.45} r={r * 0.62} fill={fill} />
    ))}
    <circle r={r * 0.32} fill="#C8661A" opacity={0.7} />
  </g>
);

// ---------------------------------------------------------------------------------------
// Typography

type Part = {text: string; accent?: boolean};
/** Serif headline; each line rises from behind a mask, staggered. */
export const Headline: React.FC<{
  lines: Part[][];
  at: number;
  top: number;
  size?: number;
  color?: string;
  accent?: string;
  stagger?: number;
}> = ({lines, at, top, size = 84, color = C.maroon, accent = C.gold, stagger = 0.14}) => {
  const t = useTime();
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top, textAlign: 'center'}}>
      {lines.map((parts, i) => {
        const k = progress(t, at + i * stagger, 0.7);
        return (
          <div key={i} style={{overflow: 'hidden', paddingBottom: size * 0.12}}>
            <div
              style={{
                fontFamily: SERIF,
                fontWeight: 700,
                fontSize: size,
                lineHeight: 1.08,
                color,
                letterSpacing: '-0.01em',
                transform: `translateY(${(1 - k) * 105}%)`,
                opacity: Math.min(1, k * 1.5),
              }}
            >
              {parts.map((p, j) => (
                <span key={j} style={p.accent ? {fontStyle: 'italic', color: accent} : undefined}>
                  {p.text}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

type Word = {text: string; start: number; end: number; accent: boolean; line: number};
type Phrase = {start: number; end: number; show: number; hide: number; words: Word[]};

/** On a maroon screen at time t? (captions switch to cream there) */
const onMaroon = (t: number) =>
  (t >= SCENES.brand[0] + 0.3 && t < SCENES.brand[1] - 0.25) || t >= SCENES.cta[0] + 0.3;

/** Word-by-word Hinglish captions, exactly as spoken. */
export const Captions: React.FC = () => {
  const t = useTime();
  const dark = onMaroon(t);
  const active = (captions as Phrase[]).filter((p) => t >= p.show && t < p.hide + 0.16);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {active.map((p, i) => {
        const out = progress(t, p.hide, 0.16);
        const lines: Word[][] = [];
        p.words.forEach((w) => (lines[w.line] ??= []).push(w));
        return (
          <div
            key={`${p.start}-${i}`}
            style={{
              position: 'absolute',
              left: 70,
              right: 70,
              top: CAPTION_Y,
              transform: `translateY(-50%) translateY(${-6 * out}px)`,
              opacity: 1 - out,
              textAlign: 'center',
              fontFamily: SANS,
              fontWeight: 600,
              fontSize: 48,
              lineHeight: 1.28,
              color: dark ? C.creamText : C.ink,
            }}
          >
            {lines.map((line, li) => (
              <div key={li}>
                {line.map((w, j) => {
                  const k = progress(t, w.start - 0.06, 0.22);
                  return (
                    <React.Fragment key={j}>
                      <span
                        style={{
                          display: 'inline-block',
                          opacity: 0.18 + 0.82 * k,
                          transform: `translateY(${(1 - k) * 10}px)`,
                          color: w.accent ? (dark ? C.goldLight : C.red) : undefined,
                        }}
                      >
                        {w.text}
                      </span>
                      {j < line.length - 1 ? ' ' : null}
                    </React.Fragment>
                  );
                })}
              </div>
            ))}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------------------
// Cards and icons

export const Card: React.FC<{style?: React.CSSProperties; children: React.ReactNode}> = ({style, children}) => (
  <div
    style={{
      position: 'absolute',
      background: '#FFFFFF',
      borderRadius: 34,
      boxShadow: '0 24px 60px rgba(94, 15, 36, 0.14), 0 3px 10px rgba(94, 15, 36, 0.08)',
      border: `1px solid ${C.line}`,
      fontFamily: SANS,
      color: C.ink,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Chip: React.FC<{k: number; children: React.ReactNode; style?: React.CSSProperties}> = ({k, children, style}) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      padding: '12px 24px',
      borderRadius: 999,
      background: C.blushSoft,
      border: `1.5px solid ${C.blush}`,
      color: C.maroon,
      fontFamily: SANS,
      fontWeight: 500,
      fontSize: 30,
      opacity: k,
      transform: `scale(${0.85 + 0.15 * k})`,
      ...style,
    }}
  >
    {children}
  </span>
);

/** Simple line icon set (Lucide-style paths, ISC licence). */
export const Icon: React.FC<{name: keyof typeof PATHS; size?: number; color?: string; stroke?: number; draw?: number}> = ({
  name,
  size = 40,
  color = C.maroon,
  stroke = 2,
  draw = 1,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    {PATHS[name].map((d, i) => (
      <path key={i} d={d} pathLength={100} strokeDasharray={100} strokeDashoffset={100 * (1 - draw)} />
    ))}
  </svg>
);

const PATHS = {
  users: ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'M9 3a4 4 0 1 1 0 8a4 4 0 1 1 0-8z', 'M22 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75'],
  user: ['M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2', 'M12 3a4 4 0 1 1 0 8a4 4 0 1 1 0-8z'],
  search: ['M11 3a8 8 0 1 1 0 16a8 8 0 1 1 0-16z', 'M21 21l-4.3-4.3'],
  check: ['M20 6L9 17l-5-5'],
  heart: ['M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z'],
  file: ['M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z', 'M14 2v4a2 2 0 0 0 2 2h4', 'M8 13h8', 'M8 17h5'],
  phone: [
    'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z',
  ],
  sparkle: ['M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z'],
};

/** WhatsApp-style chat glyph: speech bubble with a handset, white on green. */
export const WhatsAppGlyph: React.FC<{size?: number; bg?: string}> = ({size = 64, bg = C.wa}) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    <circle cx={24} cy={24} r={24} fill={bg} />
    <path d="M24 10.5c-7.5 0-13.5 5.9-13.5 13.2c0 2.5.7 4.8 1.9 6.8L10.5 37.5l7.2-1.9c1.9 1 4 1.6 6.3 1.6c7.5 0 13.5-5.9 13.5-13.2S31.5 10.5 24 10.5z" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinejoin="round" />
    <path d="M19.3 17.6c.3-.7.7-.7 1-.7h.8c.3 0 .6 0 .9.7l1.1 2.6c.1.3.1.6-.1.9l-.7.9c-.2.2-.2.5 0 .8c.9 1.6 2.3 2.9 3.9 3.7c.3.2.6.1.8-.1l.9-1c.2-.3.6-.3.9-.2l2.5 1.2c.3.2.6.3.6.6c0 .8-.3 2-1.6 2.6c-1 .5-2.3.6-4.4-.3c-2.6-1.1-4.7-3.2-6-5.7c-1.1-2.1-.9-3.6-.6-4.4z" fill="#fff" />
  </svg>
);

