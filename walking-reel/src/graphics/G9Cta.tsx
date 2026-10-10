import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Card, Eyebrow, Rise} from '../components/Card';
import {C, FPS, lerp, springAt, tween} from '../theme';

// 63.02 "Add 1,000 steps this week."
const IN = 62.9;
const OUT = 64.98; // then "2026" takes over behind her head (Behind.tsx)
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export const G9Cta: React.FC = () => {
  const t = useCurrentFrame() / FPS;

  return (
    <Card inAt={IN} outAt={OUT} top={236} width={900} height={300}>
      <div style={{position: 'absolute', inset: 0, padding: '38px 50px 0'}}>
          <Rise at={IN + 0.1}>
            <Eyebrow>This week</Eyebrow>
          </Rise>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 22, marginTop: 10}}>
            <Rise at={63.2} style={{fontSize: 92, fontWeight: 800, letterSpacing: -3.6, lineHeight: 1.05}}>
              +1,000
            </Rise>
            <Rise at={63.68} style={{fontSize: 34, fontWeight: 650, color: C.inkSoft, letterSpacing: -0.4}}>
              steps
            </Rise>
          </div>
          <div style={{display: 'flex', gap: 14, marginTop: 24}}>
            {DAYS.map((d, i) => {
              const on = tween(t, 64.05 + i * 0.09, 0.25);
              const s = springAt(t, 64.05 + i * 0.09, 15, 200);
              return (
                <div
                  key={i}
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: 29,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    fontWeight: 800,
                    border: `2px solid ${on > 0.5 ? C.accent : C.hairline}`,
                    background: `rgba(200, 240, 49, ${on})`,
                    color: on > 0.5 ? C.dark : C.inkFaint,
                    scale: on > 0 ? lerp(s, 0.85, 1) : 1,
                    opacity: tween(t, 63.4 + i * 0.03, 0.3),
                  }}
                >
                  {d}
                </div>
              );
            })}
          </div>
      </div>
    </Card>
  );
};
