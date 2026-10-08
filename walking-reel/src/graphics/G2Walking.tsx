import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Card, Count, Eyebrow, MaskReveal, Rise} from '../components/Card';
import {ArrowRight} from '../components/Icons';
import {C, EASE_IN, EASE_IN_OUT, FPS, SERIF, lerp, springAt, tween} from '../theme';

// 13.38 "bottle" · 13.80 "it's" · 14.22 "walking." · 15.94 "1,000 steps a day"
// 17.32 "linked" · 18.24 "12%" · 19.08 "lower risk of dying from any cause"
const IN = 13.28;
const WALK = 14.2;
const STAT = 15.86;
const OUT = 21.75;

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
  const toWalk = springAt(t, WALK - 0.08, 24, 220);
  const toStat = springAt(t, STAT, 22, 140);
  const width = lerp(toStat, lerp(toWalk, 300, 640), 900);
  const height = lerp(toStat, 250, 300);

  const bottleOut = tween(t, WALK - 0.1, 0.18, EASE_IN);
  const walkOut = tween(t, STAT - 0.04, 0.3, EASE_IN);
  const underline = tween(t, WALK + 0.4, 0.6, EASE_IN_OUT);

  return (
    <Card inAt={IN} outAt={OUT} top={236} width={width} height={height}>
      {/* A: the bottle, crossed out */}
      {bottleOut < 1 ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 1 - bottleOut,
            scale: 1 - 0.12 * bottleOut,
            filter: bottleOut > 0 ? `blur(${bottleOut * 6}px)` : undefined,
          }}
        >
          <Bottle draw={tween(t, IN + 0.02, 0.42, EASE_IN_OUT)} strike={tween(t, 13.74, 0.3, EASE_IN_OUT)} />
        </div>
      ) : null}

      {/* B: "Walking." */}
      {t > WALK && walkOut < 1 ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 1 - walkOut,
            translate: `0px ${-16 * walkOut}px`,
            filter: walkOut > 0 ? `blur(${walkOut * 6}px)` : undefined,
          }}
        >
          <MaskReveal at={WALK + 0.12} dur={0.6}>
            <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 140, lineHeight: 1, letterSpacing: -2, color: C.ink}}>
              Walking.
            </div>
          </MaskReveal>
          <svg width={400} height={26} viewBox="0 0 420 26" style={{marginTop: 2}}>
            <path
              d="M6 16 C 120 6, 260 6, 414 14"
              fill="none"
              stroke={C.accent}
              strokeWidth={5}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - underline}
            />
          </svg>
        </div>
      ) : null}

      {/* C: +1,000 steps -> ~12% lower risk */}
      {t > STAT ? (
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
      ) : null}
    </Card>
  );
};
