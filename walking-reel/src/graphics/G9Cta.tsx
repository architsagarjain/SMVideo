import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Card, Eyebrow, MaskReveal, Rise} from '../components/Card';
import {Send} from '../components/Icons';
import {C, EASE_IN, FPS, SANS, SERIF, lerp, springAt, tween} from '../theme';

// 63.02 "Add 1,000 steps this week." · 65.14 "Comment 2026" · 66.14 "for the full plan."
const IN = 62.9;
const OUT = 999;
const COMMENT = 65.05;
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const TYPED = '2026';

export const G9Cta: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const toB = springAt(t, COMMENT, 22, 150);
  const aOut = tween(t, COMMENT - 0.1, 0.2, EASE_IN);
  const height = lerp(toB, 300, 268);

  const typed = TYPED.slice(0, TYPED.split('').filter((_, i) => t >= 65.34 + i * 0.19).length);
  const cursorOn = Math.floor((t - 66.1) * 2.2) % 2 === 0 || t < 66.1;

  return (
    <Card inAt={IN} outAt={OUT} top={236} width={900} height={height}>
      {/* A: the challenge */}
      {aOut < 1 ? (
        <div style={{position: 'absolute', inset: 0, padding: '38px 50px 0', opacity: 1 - aOut, translate: `0px ${-14 * aOut}px`, filter: aOut > 0 ? `blur(${aOut * 6}px)` : undefined}}>
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
                    background: `rgba(229, 80, 47, ${on})`,
                    color: on > 0.5 ? '#fff' : C.inkFaint,
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
      ) : null}

      {/* B: comment prompt */}
      {t > COMMENT + 0.1 ? (
        <div style={{position: 'absolute', inset: 0, padding: '38px 50px 0'}}>
          <Rise at={COMMENT + 0.12}>
            <Eyebrow>Comment</Eyebrow>
          </Rise>
          <Rise at={COMMENT + 0.16} dist={22}>
            <div
              style={{
                marginTop: 18,
                height: 100,
                borderRadius: 50,
                background: '#FFFFFF',
                border: `2px solid ${C.hairline}`,
                display: 'flex',
                alignItems: 'center',
                padding: '0 30px 0 18px',
                gap: 20,
                boxShadow: '0 10px 24px -14px rgba(28,20,12,0.35)',
              }}
            >
              <div style={{width: 64, height: 64, borderRadius: 32, background: 'linear-gradient(135deg, #E9E4DC, #CFC8BE)'}} />
              <div style={{flex: 1, fontFamily: SANS, fontSize: 48, fontWeight: 800, letterSpacing: 1, color: C.ink, display: 'flex', alignItems: 'center'}}>
                {typed}
                <span style={{display: 'inline-block', width: 3, height: 50, marginLeft: 6, background: C.accent, opacity: cursorOn ? 1 : 0}} />
              </div>
              <div style={{scale: lerp(springAt(t, 66.25, 12, 220), 0.7, 1), opacity: tween(t, 66.2, 0.25)}}>
                <Send size={38} />
              </div>
            </div>
          </Rise>
          <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 50, marginTop: 14, color: C.ink, paddingLeft: 10}}>
            <MaskReveal at={66.12}>for the full plan</MaskReveal>
          </div>
        </div>
      ) : null}
    </Card>
  );
};
