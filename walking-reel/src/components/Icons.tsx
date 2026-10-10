import React from 'react';
import {C} from '../theme';

/** Two-tone capsule, drawn flat with a soft highlight (no cartoon 3D). */
export const Pill: React.FC<{width?: number; rotate?: number; style?: React.CSSProperties}> = ({
  width = 132,
  rotate = -28,
  style,
}) => {
  const h = width * 0.4;
  const r = h / 2;
  return (
    <svg width={width} height={h} viewBox={`0 0 ${width} ${h}`} style={{rotate: `${rotate}deg`, overflow: 'visible', ...style}}>
      <defs>
        <clipPath id={`pill-${width}`}>
          <rect x={0} y={0} width={width} height={h} rx={r} />
        </clipPath>
        <linearGradient id={`pill-shade-${width}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.12" />
        </linearGradient>
      </defs>
      <g clipPath={`url(#pill-${width})`}>
        <rect x={0} y={0} width={width / 2} height={h} fill={C.accent} />
        <rect x={width / 2} y={0} width={width / 2} height={h} fill="#F6F7F2" />
        <rect x={0} y={0} width={width} height={h} fill={`url(#pill-shade-${width})`} />
        <line x1={width / 2} y1={0} x2={width / 2} y2={h} stroke="rgba(0,0,0,0.12)" strokeWidth={1.5} />
      </g>
      <rect x={0.75} y={0.75} width={width - 1.5} height={h - 1.5} rx={r - 0.75} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={1.5} />
    </svg>
  );
};

export const Check: React.FC<{size?: number; color?: string; progress?: number}> = ({size = 22, color = C.accent, progress = 1}) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path
      d="M4.5 12.5 L9.5 17.5 L19.5 6.5"
      fill="none"
      stroke={color}
      strokeWidth={2.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - progress}
    />
  </svg>
);

/** Minimal footprints pair. */
export const Steps: React.FC<{size?: number; color?: string}> = ({size = 40, color = C.ink}) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill={color}>
    <ellipse cx="13" cy="15" rx="5.2" ry="8" transform="rotate(-12 13 15)" />
    <ellipse cx="11.6" cy="27.6" rx="3.6" ry="3.2" transform="rotate(-12 11.6 27.6)" />
    <ellipse cx="27" cy="11" rx="5.2" ry="8" transform="rotate(10 27 11)" opacity="0.45" />
    <ellipse cx="28.6" cy="23.4" rx="3.6" ry="3.2" transform="rotate(10 28.6 23.4)" opacity="0.45" />
  </svg>
);

export const Flame: React.FC<{size?: number; color?: string}> = ({size = 34, color = C.accent}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.9} strokeLinejoin="round" strokeLinecap="round">
    <path d="M12 21.5c-4 0-6.8-2.7-6.8-6.4 0-3.3 2.2-5.4 3.9-7.6.4 1.9 1.5 3 2.6 3.5-.3-3.3 1.2-6.4 3.6-8.4.2 3 1.6 4.8 2.9 6.6 1.1 1.6 1.6 3.2 1.6 5.6 0 3.9-3.3 6.7-7.8 6.7Z" />
    <path d="M12 21.5c-1.7 0-2.9-1.2-2.9-2.9 0-1.6 1.1-2.6 2.1-3.7.2 1 .8 1.5 1.3 1.7.1-1.2.7-2.2 1.4-2.9.4 1.5 1.9 2.7 1.9 4.6 0 1.8-1.5 3.2-3.8 3.2Z" />
  </svg>
);

export const ArrowRight: React.FC<{width?: number; progress?: number; color?: string}> = ({width = 70, progress = 1, color = C.inkFaint}) => (
  <svg width={width} height={24} viewBox={`0 0 ${width} 24`} fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <path d={`M2 12 H${width - 4}`} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - progress} />
    <path d={`M${width - 12} 4 L${width - 4} 12 L${width - 12} 20`} opacity={progress > 0.85 ? (progress - 0.85) / 0.15 : 0} />
  </svg>
);

export const Send: React.FC<{size?: number; color?: string}> = ({size = 30, color = C.accent}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round">
    <path d="M21 3 10.5 13.5" />
    <path d="M21 3 14.5 21l-4-7.5L3 9.5 21 3Z" />
  </svg>
);
