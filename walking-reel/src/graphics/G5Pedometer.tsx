import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Card, Eyebrow, MaskReveal, Rise} from '../components/Card';
import {C, FPS, SANS, SERIF, lerp, springAt, tween} from '../theme';

// 35.74 "10,000 number" · 37.62 "an old Japanese pedometer" · 39.48 "marketing campaign"
const IN = 35.6;
const OUT = 40.9;
const STAMP = 39.44;

const Pedometer: React.FC<{t: number}> = ({t}) => {
  const p = springAt(t, IN + 0.1, 16, 140);
  const n = Math.round(lerp(tween(t, 35.74, 0.9), 0, 10000));
  return (
    <div style={{position: 'relative', width: 196, height: 236, scale: lerp(p, 0.8, 1), rotate: `${lerp(p, -14, -6)}deg`, opacity: Math.min(1, p * 1.4)}}>
      {/* belt clip */}
      <div style={{position: 'absolute', left: 68, top: 0, width: 60, height: 30, borderRadius: '10px 10px 4px 4px', border: `3px solid ${C.ink}`, borderBottom: 'none'}} />
      {/* body */}
      <div
        style={{
          position: 'absolute',
          left: 8,
          top: 22,
          width: 180,
          height: 206,
          borderRadius: 52,
          border: `3px solid ${C.ink}`,
          background: '#FFFFFF',
          boxShadow: 'inset 0 -10px 0 rgba(22,21,20,0.05)',
        }}
      />
      {/* screen */}
      <div
        style={{
          position: 'absolute',
          left: 34,
          top: 62,
          width: 128,
          height: 68,
          borderRadius: 14,
          background: C.ink,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: SANS,
          fontWeight: 700,
          fontSize: 36,
          letterSpacing: 1,
          fontVariantNumeric: 'tabular-nums',
          color: C.onDark,
        }}
      >
        {String(n).padStart(5, '0')}
      </div>
      {/* button */}
      <div style={{position: 'absolute', left: 78, top: 152, width: 40, height: 40, borderRadius: 20, border: `3px solid ${C.ink}`, background: C.accent}} />
    </div>
  );
};

export const G5Pedometer: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const stamp = springAt(t, STAMP, 15, 190);
  return (
    <Card inAt={IN} outAt={OUT} top={236} width={900} height={318}>
      <div style={{display: 'flex', alignItems: 'center', height: '100%', padding: '0 52px', gap: 50}}>
        <Pedometer t={t} />
        <div style={{flex: 1}}>
          <Rise at={35.8}>
            <Eyebrow>The 10,000 number</Eyebrow>
          </Rise>
          <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 58, lineHeight: 1.04, letterSpacing: -0.5, marginTop: 14}}>
            <MaskReveal at={37.6}>An old Japanese</MaskReveal>
            <MaskReveal at={38.72}>pedometer</MaskReveal>
          </div>
          <div
            style={{
              display: 'inline-block',
              marginTop: 18,
              padding: '10px 20px',
              borderRadius: 10,
              border: `2.5px solid ${C.accent}`,
              color: C.accent,
              fontSize: 23,
              fontWeight: 800,
              letterSpacing: 2.6,
              textTransform: 'uppercase',
              opacity: tween(t, STAMP, 0.18),
              scale: lerp(stamp, 1.35, 1),
              rotate: `${lerp(stamp, -9, -4)}deg`,
            }}
          >
            Marketing campaign
          </div>
        </div>
      </div>
    </Card>
  );
};
