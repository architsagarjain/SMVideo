import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {Card, Eyebrow, Rise} from '../components/Card';
import {C, EASE_IN_OUT, FPS, SANS, tween} from '../theme';

// 58.76 "walk after meal" · 60.24 "softens" · 61.52 "blood sugar spike"
const IN = 58.6;
const OUT = 62.4;

const W = 900;
const H = 352;
const X0 = 60;
const X1 = 840;
const YB = 292;
const MEAL_X = 150;

// Schematic glucose response after a meal: a sharp spike vs. a softened hump.
// bump(u) = (u * e^(1-u))^k peaks at u = 1 with value 1; larger k = sharper.
const bump = (x: number, width: number, k: number) => {
  const u = (x - MEAL_X) / width;
  return u <= 0 ? 0 : Math.pow(u * Math.exp(1 - u), k);
};
const spike = (x: number) => 178 * bump(x, 120, 3.2);
const soft = (x: number) => 84 * bump(x, 200, 1.7);

const path = (fn: (x: number) => number, end: number) => {
  const pts: string[] = [];
  for (let x = X0; x <= end; x += 4) pts.push(`${x === X0 ? 'M' : 'L'}${x} ${(YB - 18 - fn(x)).toFixed(2)}`);
  return pts.join(' ');
};

export const G8BloodSugar: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const drawA = interpolate(tween(t, 58.95, 1.0, EASE_IN_OUT), [0, 1], [X0, X1]);
  const morph = tween(t, 60.2, 0.9, EASE_IN_OUT);
  // the walking curve starts as a copy of the spike and settles into the soft hump
  const mix = (x: number) => spike(x) + (soft(x) - spike(x)) * morph;
  const peakX = (() => {
    let best = X0;
    for (let x = X0; x <= X1; x += 2) if (spike(x) > spike(best)) best = x;
    return best;
  })();
  const spikeLbl = tween(t, 61.45, 0.4);

  return (
    <Card inAt={IN} outAt={OUT} top={236} width={W} height={H}>
      <div style={{position: 'absolute', left: 48, top: 34}}>
        <Rise at={IN + 0.1}>
          <Eyebrow>Blood sugar after a meal</Eyebrow>
        </Rise>
      </div>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <path d={`M${X0} ${YB} H${X1}`} stroke={C.ink} strokeOpacity={0.2} strokeWidth={2} />
        <g opacity={tween(t, IN + 0.25, 0.4)}>
          <path d={`M${MEAL_X} ${YB - 8} V${YB + 8}`} stroke={C.ink} strokeOpacity={0.4} strokeWidth={2} />
          <text x={MEAL_X} y={YB + 36} textAnchor="middle" fontFamily={SANS} fontSize={21} fontWeight={700} fill={C.inkFaint}>
            Meal
          </text>
          <text x={X1} y={YB + 36} textAnchor="end" fontFamily={SANS} fontSize={21} fontWeight={600} fill={C.inkFaint}>
            time →
          </text>
        </g>

        {/* without a walk: dashed grey spike */}
        <path
          d={path(spike, drawA)}
          fill="none"
          stroke={C.ink}
          strokeOpacity={morph > 0 ? 0.35 : 0.85}
          strokeWidth={morph > 0 ? 3.5 : 5}
          strokeDasharray={morph > 0 ? '8 9' : undefined}
          strokeLinecap="round"
        />
        {/* with a walk: the same curve, softened */}
        {morph > 0 ? <path d={path(mix, X1)} fill="none" stroke={C.accent} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" /> : null}

        <g opacity={spikeLbl}>
          <text x={peakX + 22} y={YB - 18 - spike(peakX) + 8} fontFamily={SANS} fontSize={23} fontWeight={800} fill={C.ink} fillOpacity={0.55}>
            Spike
          </text>
        </g>
        <g opacity={tween(t, 60.75, 0.4)}>
          <text x={560} y={YB - 18 - soft(560) - 22} fontFamily={SANS} fontSize={24} fontWeight={800} fill={C.accent}>
            With a walk
          </text>
        </g>
      </svg>
    </Card>
  );
};
