import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Card, Count, Eyebrow, Rise} from '../components/Card';
import {ArrowRight} from '../components/Icons';
import {C, EASE_IN_OUT, FPS, tween} from '../theme';

// 13.38 "bottle" · 13.80 "it's" · 14.22 "walking." · 15.94 "1,000 steps a day"
// 17.32 "linked" · 18.24 "12%" · 19.08 "lower risk of dying from any cause"
const IN = 13.28;
const WALK = 13.84;
const STAT = 15.86;
const OUT = 21.75;
// "Walking." itself is a full-screen cutaway (see Cutaways.tsx)

const Bottle: React.FC<{draw: number; strike: number}> = ({draw, strike}) => {
  const d = {pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - draw};
  return (
    <svg width={150} height={170} viewBox="0 0 150 170" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <g stroke={C.ink} strokeWidth={3.5}>
        <rect x={40} y={14} width={70} height={30} rx={7} {...d} />
        <path d="M46 44 V52 H104 V44" {...d} />
        <rect x={34} y={52} width={82} height={106} rx={14} {...d} />
      </g>
      <rect x={34} y={82} width={82} height={44} fill={C.ink} opacity={0.08 * draw} />
      <g stroke={C.ink} strokeWidth={2.2} opacity={0.5}>
        <path d="M52 98 H98" {...d} />
        <path d="M52 110 H84" {...d} />
      </g>
      <path
        d="M20 160 L132 10"
        stroke={C.accent}
        strokeWidth={6}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - strike}
      />
    </svg>
  );
};

export const G2Walking: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  return (
    <>
      {/* A: the bottle, crossed out */}
      <Card inAt={IN} outAt={WALK} top={236} width={300} height={250}>
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Bottle draw={tween(t, IN + 0.02, 0.42, EASE_IN_OUT)} strike={tween(t, 13.74, 0.3, EASE_IN_OUT)} />
        </div>
      </Card>

      {/* C: +1,000 steps -> ~12% lower risk */}
      <Card inAt={STAT} outAt={OUT} top={236} width={900} height={300}>
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', padding: '0 48px'}}>
          <div style={{width: 330}}>
            <Rise at={STAT + 0.02}>
              <Eyebrow>Every extra</Eyebrow>
            </Rise>
            <Rise at={15.9} style={{fontSize: 100, fontWeight: 800, letterSpacing: -4, lineHeight: 1.08, marginTop: 6}}>
              +<Count at={15.94} to={1000} dur={0.7} />
            </Rise>
            <Rise at={16.3} style={{fontSize: 31, fontWeight: 600, color: C.inkSoft, letterSpacing: -0.3}}>
              steps a day
            </Rise>
          </div>
          <div style={{width: 112, display: 'flex', justifyContent: 'center', paddingTop: 30}}>
            <ArrowRight width={70} progress={tween(t, 17.3, 0.45, EASE_IN_OUT)} />
          </div>
          <div style={{flex: 1}}>
            <Rise at={17.95}>
              <Eyebrow>About</Eyebrow>
            </Rise>
            <Rise at={18.2} style={{fontSize: 100, fontWeight: 800, letterSpacing: -4, lineHeight: 1.08, marginTop: 6, color: C.accent}}>
              <Count at={18.24} to={12} dur={0.55} />%
            </Rise>
            <Rise at={19.08} style={{fontSize: 31, fontWeight: 600, color: C.inkSoft, letterSpacing: -0.3, lineHeight: 1.2}}>
              lower risk of dying
            </Rise>
            <Rise at={20.5} style={{fontSize: 31, fontWeight: 600, color: C.inkSoft, letterSpacing: -0.3, lineHeight: 1.2}}>
              from any cause
            </Rise>
          </div>
        </div>
      </Card>
    </>
  );
};
