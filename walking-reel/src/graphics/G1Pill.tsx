import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Card, Count, Rise} from '../components/Card';
import {Check, Pill} from '../components/Icons';
import {C, FPS, SANS, lerp, springAt, tween} from '../theme';

// 1.06 "pill" · 2.66 "death" · 3.14 "12%" · 5.08 "every extra pill" · 7.04 "another 12%" · 8.38 "no side effects"
const IN = 1.0;
const OUT = 9.45;
const ROW2 = 5.08;
const CHIP = 8.3;

const ROW_H = 128;

const Row: React.FC<{icon: React.ReactNode; numAt: number; label: string; labelAt: number}> = ({icon, numAt, label, labelAt}) => {
  const t = useCurrentFrame() / FPS;
  const n = tween(t, numAt, 0.35);
  return (
    <div style={{display: 'flex', alignItems: 'center', height: ROW_H, padding: '0 44px'}}>
      <div style={{width: 168, display: 'flex', justifyContent: 'center'}}>{icon}</div>
      <div
        style={{
          width: 250,
          fontSize: 92,
          fontWeight: 800,
          letterSpacing: -3.5,
          color: C.accent,
          opacity: n,
          translate: `0px ${lerp(n, 14, 0)}px`,
          filter: n < 1 ? `blur(${lerp(n, 6, 0)}px)` : undefined,
        }}
      >
        −<Count at={numAt} to={12} dur={0.55} />%
      </div>
      <Rise at={labelAt} style={{fontSize: 33, fontWeight: 600, color: C.inkSoft, lineHeight: 1.15, letterSpacing: -0.4}}>
        {label}
      </Rise>
    </div>
  );
};

export const G1Pill: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const r2 = springAt(t, ROW2, 22, 150);
  const chip = springAt(t, CHIP, 22, 150);
  const height = 24 + ROW_H + r2 * (ROW_H + 1) + chip * 84 + 24;
  // starts as a compact pill-only card, opens up when the number lands
  const open = springAt(t, 2.98, 22, 160);
  const width = lerp(open, 256, 900);

  const pop = (at: number) => springAt(t, at, 14, 160);
  const p1 = pop(IN + 0.08);
  const p2a = pop(ROW2 + 0.05);
  const p2b = pop(ROW2 + 0.32);

  return (
    <Card inAt={IN} outAt={OUT} top={232} width={width} height={height}>
      <div style={{paddingTop: 24, fontFamily: SANS, width: 900}}>
        <Row
          icon={<Pill width={128} rotate={lerp(p1, -60, -28)} style={{scale: lerp(p1, 0.5, 1), opacity: Math.min(1, p1 * 1.5)}} />}
          numAt={3.14}
          label="risk of death"
          labelAt={3.2}
        />
        <div style={{opacity: r2}}>
          <div style={{height: 1, background: C.hairline, margin: '0 44px'}} />
          <Row
            icon={
              <div style={{position: 'relative', width: 150, height: 90}}>
                <Pill width={104} rotate={lerp(p2a, -60, -28)} style={{position: 'absolute', left: 6, top: 30, scale: lerp(p2a, 0.5, 1), opacity: Math.min(1, p2a * 1.5)}} />
                <Pill width={104} rotate={lerp(p2b, 10, -28)} style={{position: 'absolute', left: 50, top: 18, scale: lerp(p2b, 0.5, 1), opacity: Math.min(1, p2b * 1.5)}} />
              </div>
            }
            numAt={7.04}
            label="for every extra pill"
            labelAt={ROW2 + 0.1}
          />
        </div>
        <div style={{height: chip * 84, overflow: 'hidden', padding: '0 44px'}}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              marginLeft: 168,
              marginTop: 4,
              padding: '14px 26px 14px 20px',
              borderRadius: 999,
              background: C.accentWash,
              color: C.accent,
              fontSize: 27,
              fontWeight: 700,
              letterSpacing: -0.2,
              opacity: tween(t, CHIP + 0.05, 0.3),
              scale: lerp(chip, 0.9, 1),
            }}
          >
            <Check size={26} progress={tween(t, CHIP + 0.15, 0.4)} />
            No side effects
          </div>
        </div>
      </div>
    </Card>
  );
};
