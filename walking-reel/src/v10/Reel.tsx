import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {Base, BrollCuts, Footage, GradeOverlay, Subject, inWin} from '../series/core';
import {useT} from '../explainer/kit';
import {Ico, chunkAt, popAt, vis} from '../series/kit2';
import {EASE_IN, EASE_IN_OUT, EASE_OUT, SANS, SERIF, lerp, tween} from '../theme';
import {C, v10Config as cfg} from './config';

const GOLD = '#F5C35B';
const GOLD2 = '#D99A2B';
const CREAM = '#FFF4DE';
const PLUM = '#3A0E1E';
const MAROON = '#7E1640';

// ---------------------------------------------------------------------------
// Night backdrop: plum wash, golden bokeh, a warm glow behind her, fairy lights
// ---------------------------------------------------------------------------
const BOKEH = Array.from({length: 26}, (_, i) => {
  const side = random(`bs${i}`) < 0.5 ? -1 : 1;
  const x = 540 + side * lerp(random(`bx${i}`), 220, 560);
  return {x, y: lerp(random(`by${i}`), 80, 1500), d: lerp(random(`bd${i}`), 40, 170), hue: random(`bh${i}`), ph: random(`bp${i}`) * 6.28, sp: lerp(random(`bv${i}`), 6, 18)};
});
const Night: React.FC = () => {
  const t = useT();
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: `radial-gradient(85% 55% at 50% 38%, rgba(92,26,52,0.86) 0%, rgba(40,10,24,0.93) 60%, rgba(18,5,12,0.96) 100%)`}} />
      {BOKEH.map((b, i) => {
        const tw = 0.55 + 0.45 * Math.sin(t * 1.6 + b.ph);
        const col = b.hue < 0.6 ? '255,190,90' : b.hue < 0.85 ? '255,140,80' : '255,120,160';
        return (
          <div key={i} style={{position: 'absolute', left: b.x, top: b.y - t * b.sp, width: b.d, height: b.d, translate: '-50% -50%', borderRadius: '50%', background: `radial-gradient(circle, rgba(${col},0.55) 0%, rgba(${col},0.32) 55%, rgba(${col},0) 72%)`, opacity: tw, filter: 'blur(3px)'}} />
        );
      })}
      {/* back glow so her black top separates from the night */}
      <AbsoluteFill style={{background: 'radial-gradient(42% 30% at 50% 52%, rgba(255,170,80,0.32) 0%, rgba(255,170,80,0) 100%)'}} />
    </AbsoluteFill>
  );
};
const BULBS = 17;
const Garland: React.FC = () => {
  const t = useT();
  if (inWin(t, [C.enjoy])) return null;
  const pts = Array.from({length: BULBS}, (_, i) => {
    const u = i / (BULBS - 1);
    const x = lerp(u, -30, 1110);
    const y = 34 + 120 * (1 - Math.pow(2 * u - 1, 2));
    return {x, y};
  });
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y - 14}`).join(' ');
  return (
    <AbsoluteFill>
      <svg width={1080} height={300} style={{position: 'absolute', left: 0, top: 0}}>
        <path d={path} fill="none" stroke="rgba(30,10,10,0.8)" strokeWidth={3} />
      </svg>
      {pts.map((p, i) => {
        const on = tween(t, C.hook.start + 0.05 + i * 0.03, 0.12);
        const tw = 0.75 + 0.25 * Math.sin(t * 3 + i * 1.7);
        const col = i % 3 === 0 ? '255,150,90' : '255,206,120';
        return (
          <div key={i} style={{position: 'absolute', left: p.x, top: p.y, translate: '-50% -50%', width: 22, height: 28, borderRadius: '50% 50% 46% 46%', background: `rgba(${col},1)`, opacity: on * tw, boxShadow: `0 0 18px 8px rgba(${col},0.55), 0 0 50px 20px rgba(${col},0.22)`}} />
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// The mithai box (CSS 3D)
// ---------------------------------------------------------------------------
const BW = 560;
const BH = 400;
const BD = 140;
const Front: React.FC<{t: number; rings: number}> = ({t, rings}) => {
  const glint = tween(t, 2.5, 0.7, EASE_IN_OUT);
  return (
    <div style={{position: 'absolute', inset: 0, borderRadius: 10, background: `linear-gradient(160deg, #9C2257 0%, ${MAROON} 45%, #4E0C2A 100%)`, overflow: 'hidden', boxShadow: 'inset 0 0 40px rgba(0,0,0,0.35)'}}>
      <div style={{position: 'absolute', inset: 16, border: `3px solid ${GOLD}`, borderRadius: 6}} />
      <div style={{position: 'absolute', inset: 26, border: `1.5px solid rgba(245,195,91,0.6)`, borderRadius: 4}} />
      {/* corner motifs */}
      {[
        [40, 40],
        [BW - 40, 40],
        [40, BH - 40],
        [BW - 40, BH - 40],
      ].map(([x, y], i) => (
        <svg key={i} width={60} height={60} viewBox="-30 -30 60 60" style={{position: 'absolute', left: x - 30, top: y - 30}}>
          {Array.from({length: 8}, (_, k) => (
            <ellipse key={k} cx={0} cy={-13} rx={5} ry={11} fill={GOLD} opacity={0.85} transform={`rotate(${k * 45})`} />
          ))}
          <circle r={5} fill="#FFE7A8" />
        </svg>
      ))}
      <div style={{position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 20, letterSpacing: 7, color: GOLD}}>DIWALI SPECIAL</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 104, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 108, lineHeight: 1, color: '#FFE3A3', textShadow: '0 3px 0 rgba(0,0,0,0.25)'}}>Kaju Katli</div>
      {/* claims */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 250, display: 'flex', justifyContent: 'center', gap: 18}}>
        <div style={{padding: '10px 22px', borderRadius: 40, background: GOLD, color: '#4E0C2A', fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: 2, boxShadow: rings > 0 ? `0 0 0 ${8 * rings}px rgba(255,231,168,0.35), 0 0 30px rgba(255,210,120,${0.8 * rings})` : undefined}}>SUGAR FREE</div>
        <div style={{padding: '10px 22px', borderRadius: 40, border: `2.5px solid ${GOLD}`, color: '#FFE3A3', fontFamily: SERIF, fontStyle: 'italic', fontSize: 34, boxShadow: rings > 0 ? `0 0 0 ${8 * rings}px rgba(255,231,168,0.25), 0 0 30px rgba(255,210,120,${0.6 * rings})` : undefined}}>guilt-free</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 19, letterSpacing: 4, color: 'rgba(255,227,163,0.85)'}}>NO ADDED SUGAR · NET WT 500 g</div>
      {/* glint */}
      <div style={{position: 'absolute', top: -100, bottom: -100, width: 120, left: lerp(glint, -200, BW + 100), background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,246,220,0.55) 50%, rgba(255,255,255,0) 100%)', transform: 'skewX(-20deg)'}} />
    </div>
  );
};
const ROWS: [string, string, string?][] = [
  ['Energy', '400 kcal', 'hi'],
  ['Protein', '9 g'],
  ['Carbohydrate', '40 g'],
  ['  of which sugars', '2 g'],
  ['Fat', '22 g', 'hi'],
  ['  of which saturates', '7 g'],
];
const Back: React.FC<{hi: number}> = ({hi}) => (
  <div style={{position: 'absolute', inset: 0, borderRadius: 10, background: '#F7EFDD', overflow: 'hidden', padding: 22, boxShadow: 'inset 0 0 30px rgba(120,80,20,0.15)'}}>
    <div style={{border: '4px solid #141414', height: '100%', boxSizing: 'border-box', padding: '10px 18px', fontFamily: SANS, color: '#141414'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '8px solid #141414', paddingBottom: 4}}>
        <span style={{fontWeight: 800, fontSize: 34, letterSpacing: -0.5}}>Nutrition Information</span>
        <span style={{fontWeight: 700, fontSize: 22}}>per 100 g</span>
      </div>
      {ROWS.map(([k, v, h], i) => (
        <div key={i} style={{position: 'relative', display: 'flex', justifyContent: 'space-between', fontSize: 25, fontWeight: k.startsWith(' ') ? 500 : 750, padding: '5px 4px 4px', borderBottom: '2px solid #141414', whiteSpace: 'pre'}}>
          {h ? <div style={{position: 'absolute', left: -6, right: -6, top: 0, bottom: 0, background: `rgba(245,195,91,${0.85 * hi})`, borderRadius: 4}} /> : null}
          <span style={{position: 'relative'}}>{k}</span>
          <span style={{position: 'relative'}}>{v}</span>
        </div>
      ))}
      <div style={{fontSize: 16, fontWeight: 600, color: '#6B5E48', paddingTop: 6}}>Illustrative values</div>
    </div>
  </div>
);
const Side: React.FC<{w: number}> = ({w}) => (
  <div style={{position: 'absolute', inset: 0, background: `linear-gradient(180deg, #5E0F30, #3E0A20)`}}>
    <div style={{position: 'absolute', left: 0, right: 0, top: BH / 2 - 10, height: 20, background: GOLD2, opacity: 0.9}} />
    <div style={{position: 'absolute', left: w / 2 - 1, top: 0, bottom: 0, width: 2, background: 'rgba(245,195,91,0.4)'}} />
  </div>
);
type Pose = {x: number; y: number; s: number; ry: number; rx: number; o: number};
const MithaiBox: React.FC<{pose: Pose; t: number; rings?: number; hi?: number}> = ({pose, t, rings = 0, hi = 0}) => {
  if (pose.o <= 0) return null;
  const face = (tr: string, w: number, h: number, child: React.ReactNode) => (
    <div style={{position: 'absolute', left: (BW - w) / 2, top: (BH - h) / 2, width: w, height: h, transform: tr, backfaceVisibility: 'hidden'}}>{child}</div>
  );
  return (
    <div style={{position: 'absolute', left: pose.x, top: pose.y, width: 0, height: 0, perspective: 1900, opacity: pose.o}}>
      {/* shadow */}
      <div style={{position: 'absolute', left: -BW * 0.45 * pose.s, top: BH * 0.58 * pose.s, width: BW * 0.9 * pose.s, height: 60 * pose.s, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(0,0,0,0.45), rgba(0,0,0,0))', filter: 'blur(6px)'}} />
      <div style={{position: 'absolute', left: -BW / 2, top: -BH / 2, width: BW, height: BH, transformStyle: 'preserve-3d', transform: `scale(${pose.s}) rotateX(${pose.rx}deg) rotateY(${pose.ry}deg)`}}>
        {face(`translateZ(${BD / 2}px)`, BW, BH, <Front t={t} rings={rings} />)}
        {face(`rotateY(180deg) translateZ(${BD / 2}px)`, BW, BH, <Back hi={hi} />)}
        {face(`rotateY(90deg) translateZ(${BW / 2}px)`, BD, BH, <Side w={BD} />)}
        {face(`rotateY(-90deg) translateZ(${BW / 2}px)`, BD, BH, <Side w={BD} />)}
        {face(`rotateX(90deg) translateZ(${BH / 2}px)`, BW, BD, <div style={{position: 'absolute', inset: 0, background: `linear-gradient(90deg, ${GOLD2}, ${GOLD} 50%, ${GOLD2})`}} />)}
        {face(`rotateX(-90deg) translateZ(${BH / 2}px)`, BW, BD, <div style={{position: 'absolute', inset: 0, background: '#2A0716'}} />)}
      </div>
    </div>
  );
};

/** Where the box is: handed in, spun round, carried up top, spun again, thrown out; back near the end. */
const boxPose = (t: number): Pose => {
  const bob = Math.sin(t * 2.2) * 8;
  // hook: handed to camera
  if (t < C.front.start) {
    const k = tween(t, C.hook.start, 0.85, EASE_OUT);
    const spin = tween(t, 5.48, 0.75, EASE_IN_OUT);
    return {x: 540, y: lerp(k, 2350, 1210) + bob, s: lerp(k, 1.7, 1.05), ry: lerp(k, -70, -16) + 180 * spin + 30 * spin, rx: lerp(k, 25, -9), o: 1};
  }
  if (t < C.journey.start + 0.6) {
    const up = tween(t, C.front.start, 0.7, EASE_IN_OUT);
    const back = tween(t, 6.75, 0.7, EASE_IN_OUT); // spin back to the front on the way up
    const spin2 = tween(t, 11.34, 0.75, EASE_IN_OUT); // nutrition panel
    const out = tween(t, C.journey.start, 0.55, EASE_IN);
    return {x: 540, y: lerp(up, 1210, 395) + bob * 0.6 - 900 * out, s: lerp(up, 1.05, 0.92), ry: 194 + 152 * back + 180 * spin2, rx: lerp(up, -9, -6), o: 1};
  }
  // near the end: does the box "sound healthy"?
  if (t >= 67.5 && t < C.cta.start + 0.4) {
    const k = popAt(t, 67.6);
    const out = tween(t, C.cta.start, 0.3, EASE_IN);
    return {x: 540, y: 380 + bob * 0.5, s: lerp(Math.min(1.2, k), 0.4, 0.62), ry: -14 + Math.sin(t * 1.3) * 5, rx: -6, o: Math.min(1, k * 2) * (1 - out)};
  }
  return {x: 0, y: 0, s: 1, ry: 0, rx: 0, o: 0};
};

// ---------------------------------------------------------------------------
// Typography helpers
// ---------------------------------------------------------------------------
const Sans: React.FC<{size: number; color?: string; weight?: number; caps?: boolean; children: React.ReactNode; style?: React.CSSProperties}> = ({size, color = '#fff', weight = 700, caps, children, style}) => (
  <div style={{fontFamily: SANS, fontWeight: weight, fontSize: size, color, letterSpacing: caps ? size * 0.12 : -size * 0.01, textTransform: caps ? 'uppercase' : undefined, whiteSpace: 'nowrap', lineHeight: 1.05, textShadow: '0 4px 20px rgba(0,0,0,0.45)', ...style}}>{children}</div>
);
const Serif: React.FC<{size: number; color?: string; children: React.ReactNode; style?: React.CSSProperties}> = ({size, color = GOLD, children, style}) => (
  <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: size, color, whiteSpace: 'nowrap', lineHeight: 1, textShadow: '0 0 30px rgba(245,170,60,0.45), 0 4px 16px rgba(0,0,0,0.4)', ...style}}>{children}</div>
);
const At: React.FC<{x: number; y: number; o?: number; s?: number; children: React.ReactNode; align?: 'center' | 'left'}> = ({x, y, o = 1, s = 1, children, align = 'center'}) =>
  o <= 0 ? null : (
    <div style={{position: 'absolute', left: x, top: y, translate: align === 'center' ? '-50% -50%' : '0 -50%', opacity: Math.min(1, o), scale: s, transformOrigin: align === 'center' ? 'center' : 'left center'}}>{children}</div>
  );
/** Word reveal: blur + rise. */
const rise = (t: number, at: number) => {
  const p = tween(t, at, 0.45, EASE_OUT);
  return {opacity: p, translate: `0 ${lerp(p, 30, 0)}px`, filter: p < 1 ? `blur(${lerp(p, 12, 0)}px)` : undefined} as React.CSSProperties;
};
const GoldPill: React.FC<{children: React.ReactNode; size?: number; fill?: boolean}> = ({children, size = 34, fill}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: size * 0.4, padding: `${size * 0.35}px ${size * 0.8}px`, borderRadius: 999, border: `2.5px solid ${GOLD}`, background: fill ? GOLD : 'rgba(40,10,20,0.6)', color: fill ? PLUM : GOLD, fontFamily: SANS, fontWeight: 800, fontSize: size, letterSpacing: size * 0.1, whiteSpace: 'nowrap', boxShadow: '0 0 30px rgba(245,170,60,0.3)'}}>{children}</div>
);

/** Little kaju katli diamond with silver leaf. */
const Katli: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size * 0.62} viewBox="0 0 100 62">
    <path d="M50 2 L98 31 L50 60 L2 31 Z" fill="#EAD8B4" stroke="#C7A974" strokeWidth={2} />
    <path d="M50 8 L88 31 L50 54 L12 31 Z" fill="url(#varq)" opacity={0.9} />
    <defs>
      <linearGradient id="varq" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#FFFFFF" />
        <stop offset="0.5" stopColor="#D8D8D8" />
        <stop offset="1" stopColor="#F6F6F6" />
      </linearGradient>
    </defs>
  </svg>
);
const Cashew: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <path d="M30 78 C8 62 10 26 40 14 C62 6 86 16 88 34 C90 46 78 50 70 44 C62 38 50 40 46 52 C42 64 52 74 46 84 C42 90 36 84 30 78 Z" fill="#EFCF95" stroke="#C99B55" strokeWidth={3} />
    <path d="M34 30 C46 22 64 20 76 28" fill="none" stroke="#FFF0CC" strokeWidth={4} strokeLinecap="round" opacity={0.8} />
  </svg>
);
const Ghee: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size * 1.25} viewBox="0 0 100 125">
    <defs>
      <linearGradient id="ghee" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FFE08A" />
        <stop offset="1" stopColor="#E09A1E" />
      </linearGradient>
    </defs>
    <path d="M50 4 C50 4 10 52 10 80 a40 40 0 0 0 80 0 C90 52 50 4 50 4Z" fill="url(#ghee)" />
    <ellipse cx={36} cy={76} rx={9} ry={16} fill="#FFF6D6" opacity={0.7} />
  </svg>
);
const Diya: React.FC<{size: number; lit: number; t: number; i: number}> = ({size, lit, t, i}) => {
  const fl = 1 + Math.sin(t * 14 + i * 2) * 0.06;
  return (
    <div style={{position: 'relative', width: size, height: size}}>
      {lit > 0 ? (
        <>
          <div style={{position: 'absolute', left: size / 2, top: size * 0.28, translate: '-50% -50%', width: size * 1.4, height: size * 1.4, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,190,90,0.55), rgba(255,190,90,0) 65%)', opacity: lit}} />
          <svg width={size * 0.36} height={size * 0.5} viewBox="0 0 36 50" style={{position: 'absolute', left: size * 0.32, top: size * 0.02, scale: `${lit} ${lit * fl}`, transformOrigin: '50% 100%'}}>
            <path d="M18 2 C26 16 32 26 32 34 a14 14 0 0 1 -28 0 C4 26 10 16 18 2Z" fill="#FFB43A" />
            <path d="M18 16 C22 24 25 30 25 35 a7 7 0 0 1 -14 0 C11 30 14 24 18 16Z" fill="#FFF3C4" />
          </svg>
        </>
      ) : null}
      <svg width={size} height={size * 0.5} viewBox="0 0 100 50" style={{position: 'absolute', left: 0, top: size * 0.5}}>
        <path d="M4 6 Q50 14 96 6 Q90 44 50 46 Q10 44 4 6Z" fill="#B5541E" />
        <path d="M4 6 Q50 14 96 6" fill="none" stroke="#F2A65A" strokeWidth={4} />
        <path d="M20 26 Q50 34 80 26" fill="none" stroke={GOLD} strokeWidth={3} opacity={0.8} />
      </svg>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------
const Hook: React.FC = () => {
  const t = useT();
  const w = C.hook;
  if (t >= w.end + 0.3) return null;
  const a = vis(t, 1.2, 3.5, 0.3, 0.3);
  const b = vis(t, 3.62, w.end - 0.1, 0.3, 0.3);
  return (
    <AbsoluteFill>
      <At x={540} y={300} o={a}>
        <div style={{textAlign: 'center'}}>
          <div style={rise(t, 1.22)}>
            <Sans size={56}>If you handed me a box of</Sans>
          </div>
          <div style={{...rise(t, 2.5), marginTop: 18}}>
            <Serif size={150}>sugar-free mithai,</Serif>
          </div>
        </div>
      </At>
      <At x={540} y={300} o={b}>
        <div style={{textAlign: 'center'}}>
          <div style={rise(t, 3.62)}>
            <Sans size={56}>the first thing I'd do is</Sans>
          </div>
          <div style={{...rise(t, 5.45), marginTop: 18, scale: lerp(tween(t, 5.45, 0.5), 1.25, 1)}}>
            <Serif size={176}>turn it around.</Serif>
          </div>
        </div>
      </At>
      <Sparks at={1.92} x={540} y={1210} />
    </AbsoluteFill>
  );
};
const Sparks: React.FC<{at: number; x: number; y: number; n?: number}> = ({at, x, y, n = 30}) => {
  const t = useT();
  if (t < at || t > at + 1.2) return null;
  const d = t - at;
  return (
    <>
      {Array.from({length: n}, (_, i) => {
        const a = random(`sa${i}`) * Math.PI * 2;
        const v = lerp(random(`sv${i}`), 300, 900);
        const px = x + Math.cos(a) * v * d;
        const py = y + Math.sin(a) * v * d + 500 * d * d;
        const s = lerp(random(`ss${i}`), 8, 20) * (1 - d / 1.2);
        return <div key={i} style={{position: 'absolute', left: px, top: py, width: s, height: s, translate: '-50% -50%', rotate: '45deg', background: i % 3 ? GOLD : '#FFF1C9', boxShadow: `0 0 12px ${GOLD}`, opacity: 1 - d / 1.2}} />;
      })}
    </>
  );
};
const FrontLabels: React.FC = () => {
  const t = useT();
  const w = C.front;
  const a = vis(t, 9.2, 11.2, 0.35, 0.3);
  const b = vis(t, 12.24, w.end - 0.5, 0.35, 0.3);
  return (
    <>
      <At x={540} y={120} o={a}>
        <div style={rise(t, 9.2)}>
          <Sans size={44} caps weight={800} color={CREAM}>
            what the <span style={{fontFamily: SERIF, fontStyle: 'italic', textTransform: 'none', letterSpacing: 0, fontSize: 70, color: GOLD}}>brand</span> wants you to notice
          </Sans>
        </div>
      </At>
      <At x={540} y={120} o={b}>
        <div style={rise(t, 12.24)}>
          <Sans size={44} caps weight={800} color={CREAM}>
            what you need to <span style={{fontFamily: SERIF, fontStyle: 'italic', textTransform: 'none', letterSpacing: 0, fontSize: 70, color: GOLD}}>compare</span>
          </Sans>
        </div>
      </At>
    </>
  );
};
const Journey: React.FC = () => {
  const t = useT();
  const w = C.journey;
  const o = vis(t, 15.3, w.end - 0.25);
  if (o <= 0) return null;
  const d = tween(t, 16.4, 1.1, EASE_IN_OUT);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <At x={540} y={250}>
        <div style={rise(t, 15.86)}>
          <Sans size={50} caps weight={800} color={CREAM}>my</Sans>
        </div>
      </At>
      <At x={540} y={360}>
        <div style={rise(t, 16.24)}>
          <Serif size={130}>weight-loss journey</Serif>
        </div>
      </At>
      <svg width={1080} height={600} style={{position: 'absolute', left: 0, top: 0, clipPath: `inset(0 ${(1 - d) * 100}% 0 0)`}}>
        <path d="M150 500 C 330 430, 420 560, 560 480 S 820 420, 930 470" fill="none" stroke={GOLD} strokeWidth={6} strokeLinecap="round" strokeDasharray="2 18" opacity={0.9} />
        {[0, 0.5, 1].map((u, i) => (d >= u ? <circle key={i} cx={lerp(u, 150, 930)} cy={[500, 480, 470][i]} r={14} fill={GOLD} /> : null))}
      </svg>
    </AbsoluteFill>
  );
};
const Rep: React.FC = () => {
  const t = useT();
  const w = C.rep;
  const o = vis(t, 19.0, w.end - 0.25);
  if (o <= 0) return null;
  const n = t < 22.3 ? 1 : t < 22.9 ? 2 : t < 23.6 ? 3 : t < 24.2 ? 5 : 7;
  const halo = tween(t, 20.12, 0.5);
  return (
    <AbsoluteFill style={{opacity: o}}>
      {/* halo over the pile */}
      <div style={{position: 'absolute', left: 540, top: 250, translate: '-50% -50%', width: lerp(halo, 100, 300), height: lerp(halo, 30, 70), borderRadius: '50%', border: `10px solid ${GOLD}`, boxShadow: '0 0 40px rgba(255,200,90,0.9), inset 0 0 20px rgba(255,200,90,0.7)', opacity: halo}} />
      {t >= 20.12 ? (
        <At x={540} y={130} o={halo}>
          <Serif size={84}>“healthy”</Serif>
        </At>
      ) : null}
      <div style={{position: 'absolute', left: 540, top: 395, translate: '-50% -50%', display: 'flex', gap: 6}}>
        {Array.from({length: n}, (_, i) => (
          <div key={i} style={{scale: Math.max(0, popAt(t, i === 0 ? 19.1 : [22.3, 22.9, 23.6, 23.6, 24.2, 24.2][i - 1]))}}>
            <Katli size={n > 4 ? 120 : 160} />
          </div>
        ))}
      </div>
      {t >= 21.76 ? (
        <At x={540} y={530} s={Math.max(0, popAt(t, 21.76))}>
          <GoldPill size={32}>
            <Ico name="seal-check" size={38} color={GOLD} /> PERMISSION GRANTED
          </GoldPill>
        </At>
      ) : null}
    </AbsoluteFill>
  );
};
const Nuts: React.FC = () => {
  const t = useT();
  const w = C.nuts;
  const o = vis(t, 25.0, w.end - 0.25);
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <At x={540} y={240}>
        <div style={rise(t, 25.0)}>
          <Sans size={50} caps weight={800} color={CREAM}>sugar-free can</Sans>
        </div>
      </At>
      <At x={540} y={350}>
        <div style={rise(t, 26.8)}>
          <Serif size={150}>still contain</Serif>
        </div>
      </At>
      {t >= 29.9 ? (
        <At x={200} y={600} s={Math.max(0, popAt(t, 29.9))}>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
            <div style={{width: 210, height: 210, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,214,140,0.25), rgba(255,214,140,0.05))', border: `3px solid ${GOLD}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <Cashew size={150} />
            </div>
            <GoldPill size={30} fill>NUTS</GoldPill>
          </div>
        </At>
      ) : null}
      {t >= 30.8 ? (
        <At x={880} y={600} s={Math.max(0, popAt(t, 30.8))}>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
            <div style={{width: 210, height: 210, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,214,140,0.25), rgba(255,214,140,0.05))', border: `3px solid ${GOLD}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <Ghee size={120} />
            </div>
            <GoldPill size={30} fill>FAT</GoldPill>
          </div>
        </At>
      ) : null}
    </AbsoluteFill>
  );
};
const Nine: React.FC = () => {
  const t = useT();
  const w = C.nine;
  const o = vis(t, 31.76, w.end - 0.25);
  if (o <= 0) return null;
  const k = popAt(t, 33.58);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <At x={250} y={330} s={lerp(Math.min(1, k), 0.6, 1)} o={Math.min(1, k * 2)}>
        <Serif size={560} style={{lineHeight: 0.8}}>9</Serif>
      </At>
      <div style={{position: 'absolute', left: 470, top: 200}}>
        <div style={rise(t, 34.04)}>
          <Sans size={110} weight={800}>kcal</Sans>
        </div>
        <div style={{...rise(t, 34.54), marginTop: 10}}>
          <Sans size={50} caps weight={800} color={CREAM}>per gram</Sans>
        </div>
        <div style={{...rise(t, 32.0), marginTop: 18, display: 'flex', alignItems: 'center', gap: 14}}>
          <Ghee size={44} />
          <Sans size={50} caps weight={800} color={GOLD}>of fat</Sans>
        </div>
      </div>
    </AbsoluteFill>
  );
};
const Compare: React.FC = () => {
  const t = useT();
  const w = C.compare;
  const o = vis(t, 36.4, w.end - 0.25);
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <At x={540} y={230} s={lerp(Math.min(1, popAt(t, 37.48)), 0.8, 1)} o={tween(t, 37.4, 0.3)}>
        <div style={{display: 'flex', alignItems: 'center', gap: 40, padding: '26px 44px', borderRadius: 26, background: '#F7EFDD', boxShadow: '0 20px 50px rgba(0,0,0,0.4)', fontFamily: SANS, color: '#141414'}}>
          <span style={{fontWeight: 800, fontSize: 50}}>Energy</span>
          <span style={{fontWeight: 700, fontSize: 36, color: '#6B5E48', opacity: tween(t, 38.48, 0.3)}}>per 100 g</span>
          <span style={{fontWeight: 800, fontSize: 50, background: `rgba(245,195,91,${tween(t, 38.48, 0.3)})`, padding: '2px 12px', borderRadius: 8}}>400 kcal</span>
        </div>
      </At>
      <svg width={1080} height={700} style={{position: 'absolute', left: 0, top: 0, opacity: tween(t, 39.96, 0.3)}}>
        <path d={`M540 315 L540 ${lerp(tween(t, 39.96, 0.4), 315, 415)}`} stroke={GOLD} strokeWidth={6} strokeDasharray="4 14" strokeLinecap="round" />
      </svg>
      {t >= 40.14 ? (
        <At x={540} y={480} s={Math.max(0, popAt(t, 40.14))}>
          <GoldPill size={40} fill>
            <Ico name="scales" size={48} color={PLUM} /> MY PORTION = ?
          </GoldPill>
        </At>
      ) : null}
    </AbsoluteFill>
  );
};
const Calc: React.FC = () => {
  const t = useT();
  const w = C.calc;
  const o = vis(t, 42.6, w.end - 0.3, 0.35, 0.3);
  if (o <= 0) return null;
  const drop = tween(t, 43.6, 0.45, EASE_IN);
  const g = Math.round(30 * tween(t, 44.1, 0.5, EASE_OUT));
  const big = popAt(t, 49.72);
  const line = (at: number, child: React.ReactNode) => <div style={rise(t, at)}>{child}</div>;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: 50, top: 70, width: 980, height: 520, borderRadius: 44, background: 'rgba(30,8,18,0.72)', border: `2.5px solid rgba(245,195,91,0.7)`, boxShadow: '0 30px 80px rgba(0,0,0,0.5), inset 0 0 60px rgba(245,170,60,0.12)'}} />
      <At x={540} y={125}>
        <Sans size={30} caps weight={800} color={GOLD}>for example</Sans>
      </At>
      {/* kitchen scale */}
      <div style={{position: 'absolute', left: 110, top: 200, width: 330, height: 330}}>
        <div style={{position: 'absolute', left: 110, top: lerp(drop, -60, 70), opacity: tween(t, 43.4, 0.2)}}>
          <Katli size={120} />
        </div>
        <div style={{position: 'absolute', left: 30, top: 150, width: 270, height: 26, borderRadius: 12, background: '#DADADA', boxShadow: 'inset 0 -5px 0 rgba(0,0,0,0.15)'}} />
        <div style={{position: 'absolute', left: 10, top: 175, width: 310, height: 150, borderRadius: 30, background: '#F4F1EA', boxShadow: '0 16px 40px rgba(0,0,0,0.45)'}}>
          <div style={{position: 'absolute', left: 55, top: 32, width: 200, height: 84, borderRadius: 14, background: '#1D2A24', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 52, color: '#9CFFB8', textShadow: '0 0 12px rgba(120,255,160,0.6)'}}>{g} g</div>
        </div>
      </div>
      {/* equation */}
      <div style={{position: 'absolute', left: 500, top: 190, fontFamily: SANS, color: '#fff'}}>
        {line(44.18, <Sans size={74} weight={800}>30 g</Sans>)}
        {line(46.14, <Sans size={74} weight={800}><span style={{color: GOLD}}>×</span> 400 kcal</Sans>)}
        {line(48.36, <Sans size={74} weight={800}><span style={{color: GOLD}}>÷</span> 100 g</Sans>)}
      </div>
      {t >= 49.72 ? (
        <At x={735} y={500} s={lerp(Math.min(1.1, big), 1.4, 1)} o={Math.min(1, big * 2)}>
          <Serif size={130}>= 120 kcal</Serif>
        </At>
      ) : null}
      {t >= 52.4 ? (
        <At x={540} y={630} s={Math.max(0, popAt(t, 52.4))}>
          <GoldPill size={28}>*ILLUSTRATIVE · USE YOUR PRODUCT'S LABEL</GoldPill>
        </At>
      ) : null}
    </AbsoluteFill>
  );
};
const EnjoyOverlay: React.FC = () => {
  const t = useT();
  const w = C.enjoy;
  if (t < w.start || t >= w.end) return null;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(30,8,18,0.6) 0%, rgba(30,8,18,0) 32%)'}} />
      <At x={540} y={230}>
        <div style={rise(t, 57.02)}>
          <Sans size={52} caps weight={800} color={CREAM}>choose the sweet you</Sans>
        </div>
      </At>
      <At x={540} y={340}>
        <div style={rise(t, 58.72)}>
          <Serif size={140}>actually enjoy</Serif>
        </div>
      </At>
      {t >= 60.12 ? (
        <At x={540} y={480} s={Math.max(0, popAt(t, 60.12))}>
          <GoldPill size={36} fill>
            <Ico name="heart" size={40} color={PLUM} /> SERVE A PORTION
          </GoldPill>
        </At>
      ) : null}
    </AbsoluteFill>
  );
};
const Diwali: React.FC = () => {
  const t = useT();
  const w = C.diwali;
  const o = vis(t, 62.3, w.end - 0.25);
  if (o <= 0) return null;
  const txt = vis(t, 62.6, 67.4, 0.3, 0.3);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <At x={540} y={220} o={txt}>
        <div style={rise(t, 63.4)}>
          <Sans size={50} caps weight={800} color={CREAM}>your</Sans>
        </div>
      </At>
      <At x={540} y={330} o={txt}>
        <div style={rise(t, 63.86)}>
          <Serif size={150}>Diwali decision</Serif>
        </div>
      </At>
      <div style={{position: 'absolute', left: 540, top: 510, translate: '-50% -50%', display: 'flex', gap: 34, opacity: txt}}>
        {Array.from({length: 5}, (_, i) => (
          <div key={i} style={{translate: `0 ${Math.abs(i - 2) * -14}px`}}>
            <Diya size={110} lit={tween(t, 63.9 + i * 0.12, 0.3)} t={t} i={i} />
          </div>
        ))}
      </div>
      {t >= 67.68 ? (
        <At x={540} y={640} s={Math.max(0, popAt(t, 68.04))}>
          <GoldPill size={34}>“SOUNDS HEALTHY” ISN'T THE NUMBERS</GoldPill>
        </At>
      ) : null}
    </AbsoluteFill>
  );
};
const Cta: React.FC = () => {
  const t = useT();
  const w = C.cta;
  if (t < w.start) return null;
  const k = popAt(t, 70.32);
  const card = tween(t, 71.66, 0.45, EASE_OUT);
  return (
    <AbsoluteFill>
      <At x={540} y={200}>
        <div style={rise(t, 70.06)}>
          <Sans size={60} caps weight={800} color={CREAM}>comment</Sans>
        </div>
      </At>
      {t >= 70.32 ? (
        <At x={540} y={340} s={lerp(Math.min(1.1, k), 1.4, 1)} o={Math.min(1, k * 2)}>
          <div style={{padding: '0 50px 14px', borderRadius: 999, border: `4px solid ${GOLD}`, background: 'rgba(40,10,20,0.6)', boxShadow: '0 0 50px rgba(245,170,60,0.55)'}}>
            <Serif size={180}>GUIDE</Serif>
          </div>
        </At>
      ) : null}
      {card > 0 ? (
        <div style={{position: 'absolute', left: 540, top: lerp(card, 700, 545), translate: '-50% -50%', opacity: card, display: 'flex', alignItems: 'center', gap: 20, padding: '18px 34px 18px 18px', borderRadius: 30, background: CREAM, boxShadow: '0 20px 50px rgba(0,0,0,0.45)'}}>
          <div style={{width: 80, height: 80, borderRadius: 20, background: MAROON, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Ico name="file-pdf" size={52} color={GOLD} />
          </div>
          <div style={{fontFamily: SANS}}>
            <div style={{fontSize: 38, fontWeight: 800, color: PLUM, whiteSpace: 'nowrap'}}>Free Fat Loss Guide</div>
            <div style={{fontSize: 26, fontWeight: 700, color: '#8A6B4A'}}>straight to your DMs</div>
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Captions: clean sans, key words swapped for gold serif italics
// ---------------------------------------------------------------------------
const KEY = new Set(['mithai', 'around', 'front', 'brand', 'nutrition', 'compare', 'journey', 'reputation', 'permission', 'nuts', 'fat', '9', '100', 'portion', '30', '400', '120', 'illustrative', 'enjoy', 'diwali', 'healthy', 'guide', 'sugar-free']);
const NO_CAPS = [C.hook, {start: C.cta.start + 0.2, end: 999}];
const Caps: React.FC = () => {
  const t = useT();
  if (inWin(t, NO_CAPS)) return null;
  const chunk = chunkAt(cfg.captions, t);
  if (!chunk) return null;
  const k = tween(t, chunk[0].start - 0.04, 0.16);
  const y = inWin(t, [C.calc]) ? 1520 : 1500;
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top: y, translate: `0 ${-50 + lerp(k, 10, 0)}%`, textAlign: 'center', opacity: k, filter: k < 1 ? `blur(${lerp(k, 6, 0)}px)` : undefined}}>
      {chunk.map((w, i) => {
        const key = KEY.has(w.text.toLowerCase().replace(/[.,?!]/g, ''));
        return (
          <span key={i} style={{display: 'inline-block', margin: '0 0.13em', verticalAlign: 'baseline', ...(key ? {fontFamily: SERIF, fontStyle: 'italic', fontSize: 92, color: GOLD, textShadow: '0 0 24px rgba(245,170,60,0.5), 0 4px 14px rgba(0,0,0,0.6)'} : {fontFamily: SANS, fontWeight: 750, fontSize: 62, color: '#fff', textShadow: '0 4px 18px rgba(0,0,0,0.7), 0 1px 3px rgba(0,0,0,0.6)'})}}>
            {w.text}
          </span>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------------------
const Scene: React.FC = () => {
  const t = useT();
  const pose = boxPose(t);
  const rings = vis(t, 9.5, 11.2, 0.3, 0.3);
  const hi = tween(t, 12.7, 0.4);
  return (
    <>
      <Footage cfg={cfg} />
      <Night />
      <Garland />
      <Subject cfg={cfg} />
      <GradeOverlay cfg={cfg} />
      <Journey />
      <Rep />
      <Nuts />
      <Nine />
      <Compare />
      <Calc />
      <Diwali />
      <Cta />
      <FrontLabels />
      <Hook />
      <MithaiBox pose={pose} t={t} rings={rings} hi={hi} />
      <BrollCuts cfg={cfg} />
      <EnjoyOverlay />
      <Caps />
    </>
  );
};

export const V10Reel: React.FC = () => (
  <Base cfg={{...cfg, shakes: [1.92, 49.72]}}>
    <Scene />
  </Base>
);

