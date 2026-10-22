import React from 'react';
import {AbsoluteFill, getInputProps, useCurrentFrame} from 'remotion';
import {useT} from '../explainer/kit';
import {EASE_IN, EASE_IN_OUT, EASE_OUT, SANS, SERIF, lerp, tween} from '../theme';

/**
 * Alternative hooks for the travel reel (source seconds 1.01 -> 6.6, while she says "If your plan
 * only works when you're at home, what happens when your job keeps putting you on flights?").
 * Each has a back layer (under her cut-out) and a front layer (over her).
 *   sky      - she is up in the sky: clouds rush past, a plane wing slides in, YOUR DIET AT 35,000 FT?
 *   passport - a passport page: city stamps slam down, then a red DIET DENIED stamp, page lifts away
 *   scanner  - airport body scanner: a laser scans her, the monitor reads DIET PLAN NOT FOUND
 */
export type HookKind = 'board' | 'sky' | 'passport' | 'scanner';
export const HOOK: HookKind = ((getInputProps() as {hook?: HookKind}).hook ?? 'board') as HookKind;
export const HOOK_END = 6.6;

const CREAM = '#F6E7C1';
const INK = '#1B1714';
const RED = '#FF3B30';
const SHADOW = '0 0 34px rgba(0,0,0,0.45), 0 3px 10px rgba(0,0,0,0.35)';

const Plane: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg viewBox="0 0 100 100" width={size} height={size} style={{display: 'block'}}>
    <path d="M 6 46 L 60 46 L 40 14 L 50 14 L 76 46 L 90 46 C 98 46, 98 54, 90 54 L 76 54 L 50 86 L 40 86 L 60 54 L 6 54 L 6 50 Z M 6 50 L 0 40 L 6 40 L 16 50 L 6 60 L 0 60 Z" fill={color} />
  </svg>
);

const Line: React.FC<{text: string; at: number; out: number; y: number; size: number; serif?: boolean; color?: string}> = ({text, at, out, y, size, serif, color}) => {
  const t = useT();
  if (t < at - 0.02 || t > out + 0.25) return null;
  const p = tween(t, at, 0.35, EASE_OUT);
  return (
    <div style={{position: 'absolute', left: 540, top: y, translate: `-50% ${lerp(p, -20, -50)}%`, opacity: Math.min(1, p * 1.4) * (1 - tween(t, out, 0.22, EASE_IN)), whiteSpace: 'nowrap', fontFamily: serif ? SERIF : SANS, fontStyle: serif ? 'italic' : 'normal', fontWeight: serif ? 400 : 800, fontSize: size, letterSpacing: serif ? -1 : -3, lineHeight: 1, color: color ?? (serif ? '#fff' : CREAM), textShadow: SHADOW}}>
      {text}
    </div>
  );
};
const outro = (t: number) => tween(t, HOOK_END - 0.45, 0.45, EASE_IN_OUT); // 0 -> 1 as the hook hands over

// ===========================================================================
// 1. Sky high
// ===========================================================================
const CLOUDS = Array.from({length: 14}).map((_, i) => {
  const r = (n: number) => {
    const x = Math.sin(i * 91.7 + n * 13.3) * 43758.5453;
    return x - Math.floor(x);
  };
  return {y: i % 3 === 0 ? 1450 + r(1) * 420 : r(1) * 1920, w: 380 + r(2) * 520, h: 160 + r(3) * 170, speed: 700 + r(4) * 900, x0: r(5) * 1800, front: i % 3 === 0};
});
const Clouds: React.FC<{front: boolean}> = ({front}) => {
  const t = useT();
  return (
    <>
      {CLOUDS.filter((c) => c.front === front).map((c, i) => {
        const x = ((c.x0 - t * c.speed) % 2200 + 2200) % 2200 - 600;
        return <div key={i} style={{position: 'absolute', left: x, top: c.y, width: c.w, height: c.h, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(255,255,255,0.95), rgba(255,255,255,0.55) 60%, rgba(255,255,255,0))', filter: `blur(${front ? 14 : 6}px)`, opacity: front ? 0.75 : 0.9}} />;
      })}
    </>
  );
};
const SkyBack: React.FC = () => {
  const t = useT();
  const o = 1 - outro(t);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <AbsoluteFill style={{background: 'linear-gradient(to bottom, #2F7FD6 0%, #6FB2F0 45%, #CFE8FB 100%)'}} />
      <Clouds front={false} />
    </AbsoluteFill>
  );
};
const SkyFront: React.FC = () => {
  const t = useT();
  const o = 1 - outro(t);
  const wing = tween(t, 2.32, 0.7, EASE_OUT);
  return (
    <AbsoluteFill style={{opacity: o, pointerEvents: 'none'}}>
      <Clouds front />
      {/* the wing slides in along the bottom */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, translate: `${lerp(wing, -900, 0)}px 0`}}>
        <path d="M -40 1500 L 760 1700 L 820 1735 L 700 1740 L -40 1690 Z" fill="#E9EEF3" />
        <path d="M -40 1690 L 700 1740 L 820 1735 L -40 1760 Z" fill="#B8C3CF" />
        <path d="M 640 1690 L 720 1560 L 760 1560 L 740 1712 Z" fill="#D9E1EA" />
      </svg>
      <Line text="your diet at" at={1.34} out={HOOK_END - 0.3} y={200} size={96} serif />
      <Line text="35,000 FT?" at={1.92} out={HOOK_END - 0.3} y={340} size={190} />
      <Line text="only works at home" at={3.08} out={HOOK_END - 0.3} y={1410} size={70} serif />
    </AbsoluteFill>
  );
};

// ===========================================================================
// 2. Passport stamps
// ===========================================================================
const STAMPS = [
  {at: 1.34, x: 300, y: 470, text: ['DUBAI', '07 · IN'], color: '#2F5BD8', shape: 'circle'},
  {at: 1.92, x: 760, y: 700, text: ['LONDON', 'HEATHROW'], color: '#7A3FD1', shape: 'rect'},
  {at: 2.58, x: 330, y: 1000, text: ['SINGAPORE', 'CHANGI'], color: '#1E8E5A', shape: 'oval'},
];
const Stamp: React.FC<{s: (typeof STAMPS)[number]}> = ({s}) => {
  const t = useT();
  if (t < s.at) return null;
  const p = tween(t, s.at, 0.18, EASE_IN);
  const w = s.shape === 'circle' ? 400 : 500, h = s.shape === 'circle' ? 400 : 260;
  return (
    <div style={{position: 'absolute', left: s.x, top: s.y, width: w, height: h, translate: '-50% -50%', scale: lerp(p, 1.8, 1), opacity: lerp(p, 0, 0.86), border: `9px solid ${s.color}`, borderRadius: s.shape === 'circle' ? '50%' : s.shape === 'oval' ? 120 : 22, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: s.color, fontFamily: SANS}}>
      <div style={{position: 'absolute', inset: 12, border: `3px solid ${s.color}`, borderRadius: s.shape === 'circle' ? '50%' : s.shape === 'oval' ? 100 : 14}} />
      <div style={{fontWeight: 800, fontSize: 72, letterSpacing: 3}}>{s.text[0]}</div>
      <div style={{fontWeight: 700, fontSize: 36, letterSpacing: 4, marginTop: 6}}>{s.text[1]}</div>
    </div>
  );
};
const PassportPage: React.FC = () => {
  const t = useT();
  const deny = tween(t, 3.7, 0.16, EASE_IN);
  return (
    <AbsoluteFill style={{background: '#1D2A44'}}>
      <div style={{position: 'absolute', left: 50, top: 110, right: 50, bottom: 110, borderRadius: 28, background: '#F4EEDD', overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.45)'}}>
        {/* security pattern */}
        <AbsoluteFill style={{background: 'repeating-radial-gradient(circle at 50% 45%, rgba(47,91,216,0.07) 0 2px, rgba(0,0,0,0) 2px 26px)'}} />
        <div style={{position: 'absolute', left: 50, top: 50, fontFamily: SANS, fontWeight: 800, fontSize: 34, letterSpacing: 8, color: '#8A7F69'}}>VISAS · STAMPS</div>
        <div style={{position: 'absolute', right: 50, top: 50, fontFamily: SANS, fontWeight: 800, fontSize: 34, color: '#8A7F69'}}>14</div>
        <div style={{position: 'absolute', left: 50, right: 50, bottom: 60, fontFamily: 'monospace', fontSize: 34, letterSpacing: 3, color: '#A89F8A'}}>P&lt;IND&lt;&lt;YOUR&lt;DIET&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</div>
      </div>
      {STAMPS.map((s, i) => (
        <Stamp key={i} s={s} />
      ))}
      {t >= 3.7 ? (
        <div style={{position: 'absolute', left: 540, top: 1350, translate: '-50% -50%', width: 900, height: 340, scale: lerp(deny, 2.2, 1), opacity: lerp(deny, 0, 0.92), border: `14px solid ${RED}`, borderRadius: 26, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: RED, fontFamily: SANS}}>
          <div style={{fontWeight: 800, fontSize: 60, letterSpacing: 8}}>YOUR DIET</div>
          <div style={{fontWeight: 800, fontSize: 150, letterSpacing: 10, lineHeight: 1}}>DENIED</div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
const PassportFront: React.FC = () => {
  const t = useT();
  if (t >= HOOK_END) return null;
  // the page lifts and flies off upward on "what happens when your job"
  const lift = tween(t, 4.46, 0.55, EASE_IN_OUT);
  const shake = t >= 3.7 && t < 4.1 ? 14 * Math.exp(-(t - 3.7) * 10) * Math.sin((t - 3.7) * 80) : 0;
  return (
    <AbsoluteFill style={{pointerEvents: 'none', translate: `${shake}px ${-lift * 2100}px`}}>
      <PassportPage />
    </AbsoluteFill>
  );
};
const PassportAfter: React.FC = () => {
  const t = useT();
  if (t < 4.6 || t >= HOOK_END) return null;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <Line text="when your job keeps you on" at={4.6} out={HOOK_END - 0.2} y={200} size={66} serif />
      <Line text="FLIGHTS?" at={5.7} out={HOOK_END - 0.2} y={330} size={200} />
    </AbsoluteFill>
  );
};

// ===========================================================================
// 3. Body scanner
// ===========================================================================
const ScannerBack: React.FC = () => {
  const t = useT();
  const o = 1 - outro(t);
  return <AbsoluteFill style={{opacity: o, background: 'radial-gradient(90% 60% at 50% 45%, rgba(8,22,40,0.55) 0%, rgba(4,10,20,0.85) 100%)'}} />;
};
const ScannerFront: React.FC = () => {
  const t = useT();
  const f = useCurrentFrame();
  const o = 1 - outro(t);
  const scan = tween(t, 1.1, 2.2, EASE_IN_OUT); // beam top -> bottom
  const beamY = lerp(scan, 360, 1880);
  const alarm = t >= 3.7;
  const flash = alarm ? (Math.floor(f / 5) % 2 === 0 ? 1 : 0.35) : 0;
  const pct = Math.min(99, Math.round(scan * 100));
  const glow = alarm ? `rgba(255,59,48,${0.9 * flash})` : 'rgba(64,200,255,0.9)';
  return (
    <AbsoluteFill style={{opacity: o, pointerEvents: 'none'}}>
      {/* scanned area: a cyan grid over the part the beam has passed */}
      <div style={{position: 'absolute', left: 150, right: 150, top: 360, height: Math.max(0, beamY - 360), background: alarm ? `rgba(255,59,48,${0.12 * flash})` : 'rgba(64,200,255,0.10)', backgroundImage: `linear-gradient(${alarm ? 'rgba(255,59,48,0.25)' : 'rgba(64,200,255,0.25)'} 2px, transparent 2px), linear-gradient(90deg, ${alarm ? 'rgba(255,59,48,0.25)' : 'rgba(64,200,255,0.25)'} 2px, transparent 2px)`, backgroundSize: '60px 60px'}} />
      {scan < 1 ? <div style={{position: 'absolute', left: 120, right: 120, top: beamY - 4, height: 8, background: 'rgba(120,230,255,1)', boxShadow: '0 0 30px 10px rgba(64,200,255,0.8)'}} /> : null}
      {/* the arch */}
      {[110, 930].map((x) => (
        <div key={x} style={{position: 'absolute', left: x, top: 330, width: 40, height: 1600, borderRadius: 20, background: 'linear-gradient(to right, #2A3240, #4A5566, #2A3240)', boxShadow: `0 0 40px ${glow}`}}>
          {Array.from({length: 10}).map((_, i) => (
            <div key={i} style={{position: 'absolute', left: 12, top: 60 + i * 140, width: 16, height: 70, borderRadius: 8, background: glow}} />
          ))}
        </div>
      ))}
      <div style={{position: 'absolute', left: 110, right: 110, top: 300, height: 60, borderRadius: 30, background: 'linear-gradient(#4A5566, #2A3240)', boxShadow: `0 0 40px ${glow}`}} />
      {/* monitor */}
      <div style={{position: 'absolute', left: 120, right: 120, top: 70, height: 200, borderRadius: 26, background: '#0B1220', border: `4px solid ${alarm ? RED : '#2B6CB0'}`, boxShadow: `0 0 ${alarm ? 50 * flash : 20}px ${alarm ? RED : 'rgba(64,200,255,0.5)'}`, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 40px', fontFamily: 'monospace'}}>
        {alarm ? (
          <>
            <div style={{fontSize: 40, fontWeight: 700, color: RED, letterSpacing: 4}}>⚠ ALERT</div>
            <div style={{fontSize: 64, fontWeight: 800, color: '#fff', letterSpacing: 2, fontFamily: SANS}}>DIET PLAN NOT FOUND</div>
          </>
        ) : (
          <>
            <div style={{fontSize: 40, fontWeight: 700, color: '#40C8FF', letterSpacing: 4}}>SCANNING… {pct}%</div>
            <div style={{fontSize: 56, fontWeight: 800, color: '#fff', fontFamily: SANS}}>{t > 3.08 ? 'plan: works at HOME only' : 'checking travel plan'}</div>
          </>
        )}
      </div>
    </AbsoluteFill>
  );
};
const ScannerAfter: React.FC = () => {
  const t = useT();
  if (t < 4.6 || t >= HOOK_END) return null;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <Line text="when your job keeps you on" at={4.6} out={HOOK_END - 0.2} y={1300} size={66} serif />
      <Line text="FLIGHTS?" at={5.7} out={HOOK_END - 0.2} y={1420} size={170} />
    </AbsoluteFill>
  );
};

// ===========================================================================
// layer hooks used by the reel
// ===========================================================================
/** Under her cut-out. */
export const HookBack: React.FC = () => {
  const t = useT();
  if (HOOK === 'board' || t >= HOOK_END) return null;
  if (HOOK === 'sky') return <SkyBack />;
  if (HOOK === 'scanner') return <ScannerBack />;
  return null;
};
/** Over her (and over the captions). */
export const HookFront: React.FC = () => {
  const t = useT();
  if (HOOK === 'board' || t >= HOOK_END) return null;
  if (HOOK === 'sky') return <SkyFront />;
  if (HOOK === 'passport')
    return (
      <>
        <PassportAfter />
        <PassportFront />
      </>
    );
  if (HOOK === 'scanner')
    return (
      <>
        <ScannerFront />
        <ScannerAfter />
      </>
    );
  return null;
};
