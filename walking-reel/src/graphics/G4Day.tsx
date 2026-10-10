import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Card, Count, Rise} from '../components/Card';
import {Steps} from '../components/Icons';
import {C, EASE_IN_OUT, FPS, lerp, springAt, tween} from '../theme';

// 25.30 "workout" · 26.04 "sit at a desk" · 27.16 "9 hours" · 29.84 "2,500 steps" · 33.46 "sedentary"
const IN = 26.28; // after the treadmill cutaway
const OUT = 34.4;
const STEPS = 29.55;
const SEDENTARY = 33.42;

const BAR_W = 812;
const WORKOUT_W = 92;

export const G4Day: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const row2 = springAt(t, STEPS, 22, 150);
  const height = 196 + row2 * 156;

  const workout = tween(t, IN + 0.05, 0.4, EASE_IN_OUT);
  const desk = tween(t, 26.55, 1.1, EASE_IN_OUT);
  const sed = springAt(t, SEDENTARY, 16, 170);

  return (
    <Card inAt={IN} outAt={OUT} top={190} width={900} height={height}>
      <div style={{padding: '40px 44px 0'}}>
        <div style={{position: 'relative', height: 34}}>
          <Rise at={IN + 0.05} style={{position: 'absolute', left: 0, fontSize: 24, fontWeight: 700, color: C.accent, letterSpacing: -0.2}}>
            Workout
          </Rise>
        </div>
        <div style={{position: 'relative', width: BAR_W, height: 66, marginTop: 10, borderRadius: 16, background: 'rgba(255,255,255,0.08)', overflow: 'hidden'}}>
          <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: WORKOUT_W * workout, background: C.accent}} />
          <div
            style={{
              position: 'absolute',
              left: WORKOUT_W + 4,
              top: 0,
              bottom: 0,
              width: (BAR_W - WORKOUT_W - 4) * desk,
              background: C.ink,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: WORKOUT_W + 30,
              top: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              color: C.dark,
              fontSize: 28,
              fontWeight: 650,
              letterSpacing: -0.2,
              opacity: tween(t, 26.7, 0.35),
            }}
          >
            Desk
            <span style={{opacity: tween(t, 27.1, 0.35), marginLeft: 14, color: 'rgba(15,16,18,0.55)'}}>
              ·&nbsp;&nbsp;<span style={{color: C.dark}}>9 hours</span>
            </span>
          </div>
        </div>
      </div>

      <div style={{opacity: row2}}>
        <div style={{height: 1, background: C.hairline, margin: '36px 44px 0'}} />
        <div style={{display: 'flex', alignItems: 'center', padding: '28px 44px 0', gap: 22}}>
          <Rise at={STEPS + 0.05}>
            <Steps size={54} />
          </Rise>
          <Rise at={STEPS + 0.1} style={{fontSize: 88, fontWeight: 800, letterSpacing: -3.5, lineHeight: 1}}>
            <Count at={29.84} to={2500} dur={0.8} />
          </Rise>
          <Rise at={30.3} style={{fontSize: 31, fontWeight: 600, color: C.inkSoft, paddingTop: 26}}>
            steps
          </Rise>
          <div style={{flex: 1}} />
          <div
            style={{
              padding: '14px 24px',
              borderRadius: 999,
              border: `2px solid ${C.accent}`,
              color: C.accent,
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: -0.2,
              opacity: tween(t, SEDENTARY, 0.25),
              scale: lerp(sed, 1.18, 1),
              rotate: `${lerp(sed, -7, -3)}deg`,
            }}
          >
            Basically sedentary
          </div>
        </div>
      </div>
    </Card>
  );
};
