import React from 'react';
import {useCurrentFrame} from 'remotion';
import {progress} from './anim';
import {C, FPS} from './theme';

export const useTime = () => useCurrentFrame() / FPS;

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

