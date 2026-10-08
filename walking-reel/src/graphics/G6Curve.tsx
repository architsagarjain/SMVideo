import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Card, Eyebrow, Rise} from '../components/Card';
import {C, EASE_IN_OUT, FPS, SANS, lerp, tween} from '../theme';

// 41.40 "real benefit climbs fast at the low end" · 44.66 "flattens around 7,000 to 10,000"
// 48.38 "from 3,000 to 5,000" · 49.80 "beats" · 51.00 "8,000 to 10,000"
const IN = 41.1;
const OUT = 52.7;

const W = 940;
const H = 444;
const X0 = 86;
const X1 = 892;
const YB = 352; // baseline
const YT = 104; // top of plot
const MAX = 12000;

// Illustrative diminishing-returns shape (no values are plotted or claimed).
const f = (s: number) => 1 - Math.exp(-s / 3000);
const X = (s: number) => X0 + (s / MAX) * (X1 - X0);
const Y = (s: number) => YB - (f(s) / f(MAX)) * (YB - YT) * 0.96;

const curve = (a: number, b: number) => {
  if (b <= a) return '';
  const pts: string[] = [];
  const n = Math.max(2, Math.ceil((b - a) / 60));
  for (let i = 0; i <= n; i++) {
    const s = a + ((b - a) * i) / n;
    pts.push(`${i ? 'L' : 'M'}${X(s).toFixed(2)} ${Y(s).toFixed(2)}`);
  }
  return pts.join(' ');
};

const Segment: React.FC<{a: number; b: number; at: number; color: string; label: string; labelSide: 'above' | 'below'}> = ({a, b, at, color, label, labelSide}) => {
  const t = useCurrentFrame() / FPS;
  const p = tween(t, at, 0.7, EASE_IN_OUT);
  const end = lerp(p, a, b);
  const dot = (s: number, o: number) => <circle cx={X(s)} cy={Y(s)} r={8 * o} fill={color} stroke={C.paper} strokeWidth={3} />;
  const lp = tween(t, at + 0.35, 0.4);
  const mid = (a + b) / 2;
  const lx = X(mid);
  const ly = labelSide === 'above' ? Y(b) - 38 : Y(a) + 46;
  return (
    <g>
      <path d={curve(a, end)} fill="none" stroke={color} strokeWidth={9} strokeLinecap="round" />
      {/* the gain: vertical rise between the two step counts */}
      <path
        d={`M${X(b)} ${Y(a)} L${X(b)} ${lerp(p, Y(a), Y(b))}`}
        stroke={color}
        strokeWidth={2.5}
        strokeDasharray="5 6"
        opacity={0.7}
      />
      <path d={`M${X(a)} ${Y(a)} L${lerp(p, X(a), X(b))} ${Y(a)}`} stroke={color} strokeWidth={2.5} strokeDasharray="5 6" opacity={0.7} />
      {dot(a, tween(t, at - 0.05, 0.25))}
      {dot(b, tween(t, at + 0.55, 0.25))}
      <text
        x={lx}
        y={ly}
        textAnchor="middle"
        fontFamily={SANS}
        fontSize={25}
        fontWeight={800}
        fill={color}
        opacity={lp}
        style={{translate: `0px ${lerp(lp, 8, 0)}px`}}
      >
        {label}
      </text>
    </g>
  );
};

export const G6Curve: React.FC = () => {
  const t = useCurrentFrame() / FPS;

  // curve draws in two beats: the steep start, then the plateau
  const sEnd = t < 44.3 ? lerp(tween(t, 41.5, 2.0, EASE_IN_OUT), 0, 6000) : lerp(tween(t, 44.45, 1.3, EASE_IN_OUT), 6000, MAX);
  const axes = tween(t, IN + 0.15, 0.6, EASE_IN_OUT);
  const band = tween(t, 45.62, 0.5) * (1 - 0.6 * tween(t, 47.7, 0.5));
  const dimCurve = 1 - 0.45 * tween(t, 47.8, 0.4);

  const ticks = [0, 2000, 4000, 6000, 8000, 10000, 12000];

  return (
    <Card inAt={IN} outAt={OUT} top={196} width={W} height={H}>
      <div style={{position: 'absolute', left: 48, top: 34}}>
        <Rise at={IN + 0.1}>
          <Eyebrow>
            Benefit vs. daily steps <span style={{opacity: 0.6, letterSpacing: 2, fontSize: 17, marginLeft: 10}}>· Illustrative</span>
          </Eyebrow>
        </Rise>
      </div>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <defs>
          <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={C.ink} stopOpacity="0.09" />
            <stop offset="1" stopColor={C.ink} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* plateau band 7k - 10k */}
        <g opacity={band}>
          <rect x={X(7000)} y={YT - 18} width={X(10000) - X(7000)} height={YB - YT + 18} fill={C.accentWash} />
          <path d={`M${X(7000)} ${YT - 18} V${YB} M${X(10000)} ${YT - 18} V${YB}`} stroke={C.accent} strokeOpacity={0.45} strokeWidth={2} strokeDasharray="4 6" />
          <text x={(X(7000) + X(10000)) / 2} y={YB - 26} textAnchor="middle" fontFamily={SANS} fontSize={23} fontWeight={800} fill={C.accent}>
            Flattens
          </text>
        </g>

        {/* axes */}
        <path d={`M${X0} ${YB} H${lerp(axes, X0, X1)}`} stroke={C.ink} strokeOpacity={0.25} strokeWidth={2} />
        <path d={`M${X0} ${YB} V${lerp(axes, YB, YT - 10)}`} stroke={C.ink} strokeOpacity={0.25} strokeWidth={2} />
        <text
          x={0}
          y={0}
          transform={`translate(${X0 - 26} ${(YB + YT) / 2}) rotate(-90)`}
          textAnchor="middle"
          fontFamily={SANS}
          fontSize={20}
          fontWeight={700}
          letterSpacing={2}
          fill={C.inkFaint}
          opacity={axes}
        >
          BENEFIT
        </text>
        {ticks.map((s) => {
          const hi = s === 6000 ? 0 : 1;
          return (
            <text
              key={s}
              x={X(s)}
              y={YB + 40}
              textAnchor="middle"
              fontFamily={SANS}
              fontSize={21}
              fontWeight={600}
              fill={C.inkFaint}
              opacity={tween(t, IN + 0.25 + s / 40000, 0.4) * hi}
            >
              {s === 0 ? '0' : `${s / 1000}k`}
            </text>
          );
        })}
        <text x={X(6000)} y={YB + 40} textAnchor="middle" fontFamily={SANS} fontSize={21} fontWeight={600} fill={C.inkFaint} opacity={tween(t, IN + 0.4, 0.4)}>
          steps / day
        </text>

        {/* the curve */}
        <g opacity={dimCurve}>
          <path d={`${curve(0, sEnd)} L${X(sEnd)} ${YB} L${X(0)} ${YB} Z`} fill="url(#area)" />
          <path d={curve(0, sEnd)} fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
        </g>

        <Segment a={3000} b={5000} at={48.3} color={C.accent} label="3k → 5k" labelSide="below" />
        <Segment a={8000} b={10000} at={51.0} color={C.ink} label="8k → 10k" labelSide="above" />
      </svg>
    </Card>
  );
};
