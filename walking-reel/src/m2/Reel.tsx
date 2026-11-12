import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Base, Footage, GradeOverlay, Subject} from '../series/core';
import {Dolly, Orbit, OrbitItem} from '../minimal/fx';
import {useT} from '../explainer/kit';
import {ACCENT, Cutaways, DiveWord, SHADOW_TXT, SerifCaps, TopShade, WHITE, outline} from '../minimal/kit';
import {EASE_IN, EASE_IN_OUT, EASE_OUT, SANS, SERIF, lerp, tween} from '../theme';
import {ANTON, popAt} from '../series/kit2';
import {C, CUTS, DISHES, Dish, TM_M2, m2Config as cfg} from './config';

const vis = (t: number, w: {start: number; end: number}) => (t < w.start || t > w.end + 0.25 ? 0 : tween(t, w.start, 0.3, EASE_OUT) * (1 - tween(t, w.end - 0.05, 0.25, EASE_IN)));
const rise = (t: number, at: number): React.CSSProperties => {
  const p = tween(t, at, 0.4, EASE_OUT);
  return {opacity: p, translate: `0 ${lerp(p, 18, 0)}px`, filter: `blur(${(1 - p) * 6}px)`};
};
const Small: React.FC<{children: React.ReactNode; color?: string}> = ({children, color = WHITE}) => (
  <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 32, letterSpacing: 6, color, ...outline(32), textTransform: 'uppercase'}}>{children}</div>
);

/** "carb to protein ratio of about 6 to 1": six carb blocks against one protein block. */
const Ratio: React.FC = () => {
  const t = useT();
  const o = vis(t, C.ratio);
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 110, textAlign: 'center', ...rise(t, 9.98)}}>
        <Small>Carbs : Protein</Small>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 170, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 14}}>
        {Array.from({length: 7}, (_, i) => {
          const protein = i === 6;
          const p = tween(t, 10.4 + i * 0.12, 0.3, EASE_OUT);
          return (
            <div key={i} style={{width: 92, height: 92, marginLeft: protein ? 40 : 0, borderRadius: 14, background: protein ? ACCENT : 'rgba(255,255,255,0.9)', boxShadow: SHADOW_TXT, opacity: p, translate: `0 ${lerp(p, 20, 0)}px`}} />
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 290, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 110, color: WHITE, ...outline(110), ...rise(t, 11.66)}}>
        6 : 1
      </div>
    </AbsoluteFill>
  );
};

/** Per dish: a white card - the dish (struck through on the swap), the swap, and a seesaw that levels out. */
const parseRatio = (r: string): [number, number] => {
  const m = r.match(/([\d.]+)\s*:\s*([\d.]+)/);
  return m ? [parseFloat(m[1]), parseFloat(m[2])] : [1, 1.4]; // "Protein > Carbs"
};
const Seesaw: React.FC<{c: number; p: number; t: number; at: number}> = ({c, p, t, at}) => {
  const tilt = ((c - p) / (c + p)) * 16; // carbs side (left) down when carbs win
  const H = 150;
  const hc = (c / Math.max(c, p)) * H;
  const hp = (p / Math.max(c, p)) * H;
  const wob = Math.sin(Math.max(0, t - at) * 9) * 3 * Math.exp(-Math.max(0, t - at) * 3) * (t >= at ? 1 : 0);
  return (
    <div style={{position: 'relative', width: 420, height: 270}}>
      {/* fulcrum */}
      <div style={{position: 'absolute', left: 175, top: 205, width: 0, height: 0, borderLeft: '35px solid transparent', borderRight: '35px solid transparent', borderBottom: '60px solid #141414'}} />
      <div style={{position: 'absolute', left: 10, top: 196, width: 400, height: 0, rotate: `${-tilt + wob}deg`, transformOrigin: '200px 0'}}>
        <div style={{position: 'absolute', left: 0, top: -6, width: 400, height: 12, borderRadius: 6, background: '#141414'}} />
        {/* carbs pan (left) */}
        <div style={{position: 'absolute', left: 20, bottom: 6, width: 120, height: hc, borderRadius: 10, background: '#D8D2C6', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 6, boxSizing: 'border-box', rotate: `${tilt - wob}deg`, transformOrigin: '60px 100%'}}>
          <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 22, color: '#141414'}}>CARBS</span>
        </div>
        {/* protein pan (right) */}
        <div style={{position: 'absolute', right: 20, bottom: 6, width: 120, height: hp, borderRadius: 10, background: ACCENT, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 6, boxSizing: 'border-box', rotate: `${tilt - wob}deg`, transformOrigin: '60px 100%'}}>
          <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 22, color: '#141414'}}>PROTEIN</span>
        </div>
      </div>
    </div>
  );
};
const DishCard: React.FC<{d: Dish}> = ({d}) => {
  const t = useT();
  const o = vis(t, d);
  if (o <= 0) return null;
  const swap = tween(t, d.swapAt, 0.4, EASE_OUT);
  const strike = tween(t, d.swapAt, 0.35, EASE_OUT);
  const [c0, p0] = parseRatio(d.ratio);
  const [c1, p1] = parseRatio(d.result);
  const k = tween(t, d.nowAt, 0.7, EASE_IN_OUT);
  const now = t >= d.nowAt;
  const pop = popAt(t, d.nowAt);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: 50, right: 50, top: 50, height: 500, borderRadius: 36, background: '#FFFFFF', boxShadow: '0 30px 60px -26px rgba(0,0,0,0.55)', padding: '28px 34px', boxSizing: 'border-box', display: 'flex', gap: 20, translate: `0 ${lerp(tween(t, d.start, 0.4, EASE_OUT), -40, 0)}px`}}>
        <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
          <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: 6, color: '#8A857C'}}>{`SWAP ${d.n} / 6`}</div>
          <div style={{position: 'relative', alignSelf: 'flex-start', marginTop: 14, fontFamily: SANS, fontWeight: 800, fontSize: 56, lineHeight: 1.08, color: swap > 0.5 ? '#A39D92' : '#141414', whiteSpace: 'pre-line'}}>
            {d.before}
            <div style={{position: 'absolute', left: -6, right: -6, top: '50%', height: 7, borderRadius: 4, background: '#E5484D', scale: `${strike} 1`, transformOrigin: 'left center'}} />
          </div>
          <div style={{marginTop: 22, fontFamily: SANS, fontWeight: 800, fontSize: 50, lineHeight: 1.12, color: '#17A34A', whiteSpace: 'pre-line', ...rise(t, d.swapAt + 0.1)}}>{d.after}</div>
        </div>
        <div style={{width: 420, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <Seesaw c={lerp(k, c0, c1)} p={lerp(k, p0, p1)} t={t} at={d.nowAt} />
          <div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 4}}>
            <span style={{position: 'relative', fontFamily: SANS, fontWeight: 800, fontSize: now ? 44 : 72, color: now ? '#A39D92' : '#141414', transition: 'none'}}>
              {d.ratio}
              {now ? <span style={{position: 'absolute', left: -4, right: -4, top: '50%', height: 6, borderRadius: 3, background: '#E5484D'}} /> : null}
            </span>
            {now ? <span style={{fontFamily: SANS, fontWeight: 800, fontSize: d.result.length > 8 ? 40 : 72, color: '#17A34A', scale: lerp(Math.min(1, pop), 1.5, 1)}}>{d.result}</span> : null}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** "Just change what's on your plate": a plate seen from above, carbs vs protein, that rebalances. */
const Plate: React.FC = () => {
  const t = useT();
  const w = {start: 30.1, end: 32.4};
  const o = vis(t, w);
  if (o <= 0) return null;
  const k = tween(t, 31.1, 0.9, EASE_IN_OUT);
  const share = lerp(k, 1 / 7, 0.5); // protein share of the plate: 6 : 1 -> 1 : 1
  const R = 190;
  const a = share * 2 * Math.PI;
  const x = 260 + R * Math.sin(a);
  const y = 260 - R * Math.cos(a);
  const pop = tween(t, w.start, 0.45, EASE_OUT);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: 540 - 260, top: 50, width: 520, height: 520, scale: lerp(pop, 0.6, 1), rotate: `${lerp(pop, -40, 0)}deg`}}>
        <svg width={520} height={520} style={{position: 'absolute', inset: 0, filter: 'drop-shadow(0 24px 40px rgba(0,0,0,0.45))'}}>
          <circle cx={260} cy={260} r={250} fill="#FFFFFF" />
          <circle cx={260} cy={260} r={212} fill="#F4F1EB" />
          <circle cx={260} cy={260} r={R} fill="#D8D2C6" />
          <path d={`M 260 260 L 260 ${260 - R} A ${R} ${R} 0 ${a > Math.PI ? 1 : 0} 1 ${x.toFixed(1)} ${y.toFixed(1)} Z`} fill={ACCENT} />
        </svg>
        <div style={{position: 'absolute', left: 0, right: 0, top: 230, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 56, color: '#141414'}}>{k < 0.5 ? '6 : 1' : '1 : 1'}</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 30, display: 'flex', justifyContent: 'space-between', padding: '0 60px', fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: 4, color: WHITE, ...outline(30), opacity: pop}}>
        <span>CARBS</span>
        <span>PROTEIN</span>
      </div>
    </AbsoluteFill>
  );
};

/** "flip that ratio": the whole frame flips like a card. */
const FLIP = 16.3;
const Flip: React.FC<{children: React.ReactNode}> = ({children}) => {
  const t = useT();
  const d = 0.5;
  if (t < FLIP - 0.02 || t > FLIP + d) return <>{children}</>;
  const p = tween(t, FLIP, d, EASE_IN_OUT);
  const ang = p < 0.5 ? p * 2 * 90 : -90 + (p - 0.5) * 2 * 90;
  return (
    <AbsoluteFill style={{perspective: 1600, backgroundColor: '#0C0D0F'}}>
      <AbsoluteFill style={{transform: `rotateY(${ang}deg) scale(${1 - Math.sin(p * Math.PI) * 0.12})`, filter: `brightness(${1 - Math.sin(p * Math.PI) * 0.35})`}}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};
const FlipLine: React.FC = () => {
  const t = useT();
  const w = {start: FLIP + 0.3, end: 18.9};
  const o = vis(t, w);
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 230, display: 'flex', justifyContent: 'center', gap: 26}}>
        <DiveWord word="FLIP" at={FLIP + 0.32} size={130} color={ACCENT} />
        <DiveWord word="THE" at={FLIP + 0.45} size={130} color={WHITE} />
        <DiveWord word="RATIO" at={FLIP + 0.55} size={130} color={WHITE} />
      </div>
    </AbsoluteFill>
  );
};

/** Ending: BREAKFAST, stacked BREAK / FAST, rising from behind her head (her cut-out covers FAST's base). */
const BEHIND_LINE = 840;
const WordBehind: React.FC = () => {
  const t = useT();
  const s0 = C.cta.start;
  if (t < s0) return null;
  const line = (word: string, top: number, at: number, size: number) => (
    <div style={{position: 'absolute', left: 0, right: 0, top, display: 'flex', justifyContent: 'center', gap: 4}}>
      {word.split('').map((ch, i) => {
        const p = popAt(t, at + i * 0.06);
        return (
          <span key={i} style={{fontFamily: ANTON, fontSize: size, lineHeight: 1, color: WHITE, textShadow: '0 20px 50px rgba(0,0,0,0.45)', display: 'inline-block', translate: `0 ${lerp(Math.min(1.06, p), size + 40, 0)}px`}}>
            {ch}
          </span>
        );
      })}
    </div>
  );
  return (
    <>
      <AbsoluteFill style={{clipPath: `inset(0 0 ${1920 - 400}px 0)`}}>{line('BREAK', 110, 117.2, 290)}</AbsoluteFill>
      <AbsoluteFill style={{clipPath: `inset(400px 0 ${1920 - BEHIND_LINE}px 0)`}}>{line('FAST', 400, 117.5, 290)}</AbsoluteFill>
    </>
  );
};
const CtaFront: React.FC = () => {
  const t = useT();
  const s0 = C.cta.start;
  if (t < s0) return null;
  const note = tween(t, 118.32, 0.4, EASE_OUT);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 30, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 64, color: WHITE, ...outline(70), ...rise(t, s0 + 0.05)}}>Comment</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1480, display: 'flex', justifyContent: 'center', opacity: note, translate: `0 ${lerp(note, 20, 0)}px`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '16px 34px', borderRadius: 999, background: 'rgba(18,18,20,0.82)', fontFamily: SANS, fontWeight: 700, fontSize: 40, color: WHITE}}>
          <span style={{width: 14, height: 14, borderRadius: '50%', background: ACCENT}} />
          Full list of swaps → your DMs
        </div>
      </div>
    </AbsoluteFill>
  );
};

const LINED = CUTS.filter((c) => c.line);
const RING = {cx: 540, cy: 1270, rx: 430, ry: 92};
const DISHES_NAMED: OrbitItem[] = [
  {label: 'Poha', at: 3.66},
  {label: 'Upma', at: 4.34},
  {label: 'Idli', at: 5.06},
  {label: 'Dosa', at: 5.7},
  {label: 'Sandwich', at: 6.38},
];
const Scene: React.FC = () => (
  <>
    <Dolly win={C.dolly}>
      <Footage cfg={cfg} />
    </Dolly>
    <GradeOverlay cfg={cfg} />
    <TopShade wins={[C.ratio, ...DISHES]} reach={42} />
    <Ratio />
    {DISHES.map((d) => (
      <DishCard key={d.n} d={d} />
    ))}
    <Orbit win={C.orbit} items={DISHES_NAMED} front={false} ring={RING} />
    <TopShade wins={[C.cta]} reach={40} />
    <WordBehind />
    <Subject cfg={cfg} />
    <Orbit win={C.orbit} items={DISHES_NAMED} front ring={RING} />
    <Cutaways cuts={CUTS} tm={TM_M2} dir="m2" />
    <Plate />
    <FlipLine />
    <CtaFront />
    <SerifCaps cfg={cfg} hide={[...LINED, C.orbit, {start: C.cta.start + 0.1, end: 999}]} />
  </>
);

export const M2Reel: React.FC = () => (
  <Base cfg={cfg}>
    <Flip>
      <Scene />
    </Flip>
  </Base>
);
