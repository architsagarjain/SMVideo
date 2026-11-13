import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {Base, Footage, GradeOverlay, Subject} from '../series/core';
import {Dolly} from '../minimal/fx';
import {useT} from '../explainer/kit';
import {ACCENT, Cutaways, DiveWord, SHADOW_TXT, SerifCaps, TopShade, WHITE, outline} from '../minimal/kit';
import {EASE_IN, EASE_IN_OUT, EASE_OUT, SANS, SERIF, lerp, tween} from '../theme';
import {ANTON, popAt} from '../series/kit2';
import {C, CUTS, SHOTS, TM_M2, m2Config as cfg} from './config';
import {Bread, DishPills, FoodShots, Idlis} from './swaps';

const vis = (t: number, w: {start: number; end: number}) => (t < w.start || t > w.end + 0.25 ? 0 : tween(t, w.start, 0.3, EASE_OUT) * (1 - tween(t, w.end - 0.05, 0.25, EASE_IN)));
const rise = (t: number, at: number): React.CSSProperties => {
  const p = tween(t, at, 0.4, EASE_OUT);
  return {opacity: p, translate: `0 ${lerp(p, 18, 0)}px`, filter: `blur(${(1 - p) * 6}px)`};
};
const Small: React.FC<{children: React.ReactNode; color?: string}> = ({children, color = WHITE}) => (
  <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 32, letterSpacing: 6, color, ...outline(32), textTransform: 'uppercase'}}>{children}</div>
);

const Photo: React.FC<{src: string; w: number; h: number; style?: React.CSSProperties; children?: React.ReactNode}> = ({src, w, h, style, children}) => (
  <div style={{position: 'relative', width: w, height: h, borderRadius: 22, overflow: 'hidden', boxShadow: '0 18px 36px -16px rgba(0,0,0,0.5)', flexShrink: 0, ...style}}>
    <Img src={staticFile(`m2/photos/${src}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    {children}
  </div>
);
const WCard: React.FC<{t: number; at: number; children: React.ReactNode; h?: number}> = ({t, at, children, h = 430}) => (
  <div style={{position: 'absolute', left: 50, right: 50, top: 40, height: h, borderRadius: 36, background: '#FFFFFF', boxShadow: '0 30px 60px -26px rgba(0,0,0,0.55)', padding: '26px 30px', boxSizing: 'border-box', translate: `0 ${lerp(tween(t, at, 0.4, EASE_OUT), -40, 0)}px`, fontFamily: SANS, color: '#141414'}}>{children}</div>
);
/** "carb to protein ratio of about 6 to 1": seven portions fill in (six carbs, one protein), then 6 : 1 lands
 *  on her words; then "a dessert with a tadka on it": poha = gulab jamun. */
const GOLD = '#E4A11B';
const Ratio: React.FC = () => {
  const t = useT();
  const o = vis(t, C.ratio);
  if (o <= 0) return null;
  const dessert = t >= 12.9;
  const d = tween(t, 12.9, 0.35, EASE_OUT);
  const num = (txt: string, at: number, color: string) => {
    const k = popAt(t, at);
    return <span style={{fontWeight: 800, fontSize: 168, lineHeight: 1, letterSpacing: -4, color, opacity: Math.min(1, k * 3), scale: lerp(Math.min(1, k), 1.5, 1)}}>{txt}</span>;
  };
  const grow = tween(t, 11.5, 0.35, EASE_OUT);
  const DOT = 88;
  const GAP = 14;
  const carbsW = DOT * 6 + GAP * 5;
  const label: React.CSSProperties = {textAlign: 'center', fontWeight: 800, fontSize: 28, letterSpacing: 6, color: '#8A857C'};
  return (
    <AbsoluteFill style={{opacity: o}}>
      <WCard t={t} at={C.ratio.start} h={dessert ? 440 : lerp(grow, 250, 440)}>
        {!dessert ? (
          <div style={{position: 'relative', height: '100%'}}>
            <div style={{position: 'absolute', left: 0, right: 0, top: 4, display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 34, opacity: grow}}>
              {num('6', 11.66, '#141414')}
              <span style={{fontWeight: 800, fontSize: 130, lineHeight: 1, color: '#CFC8BB', opacity: tween(t, 12.1, 0.2)}}>:</span>
              {num('1', 12.26, GOLD)}
            </div>
            <div style={{position: 'absolute', left: 0, right: 0, bottom: 6, display: 'flex', justifyContent: 'center', gap: 40}}>
              <div style={{width: carbsW, display: 'flex', flexDirection: 'column', gap: 14}}>
                <div style={{display: 'flex', gap: GAP}}>
                  {Array.from({length: 6}, (_, i) => {
                    const k = popAt(t, 9.98 + i * 0.07);
                    return <div key={i} style={{width: DOT, height: DOT, borderRadius: '50%', background: '#DDD6CA', scale: lerp(Math.min(1.08, k), 0.3, 1), opacity: Math.min(1, k * 3)}} />;
                  })}
                </div>
                <span style={{...label, ...rise(t, 9.98)}}>CARBS</span>
              </div>
              <div style={{width: DOT, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
                <div style={{width: DOT, height: DOT, borderRadius: '50%', background: GOLD, scale: lerp(Math.min(1.08, popAt(t, 10.42)), 0.3, 1), opacity: Math.min(1, popAt(t, 10.42) * 3)}} />
                <span style={{...label, ...rise(t, 10.42)}}>PROTEIN</span>
              </div>
            </div>
          </div>
        ) : (
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 26, height: '100%', opacity: d}}>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12}}>
              <Photo src="poha" w={360} h={290} />
              <span style={{fontWeight: 800, fontSize: 38}}>Poha</span>
            </div>
            <span style={{marginTop: -50, fontWeight: 800, fontSize: 110, color: '#E5484D', scale: lerp(Math.min(1, popAt(t, 13.6)), 1.6, 1), opacity: t >= 13.6 ? 1 : 0}}>=</span>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, opacity: tween(t, 13.6, 0.3), translate: `${lerp(tween(t, 13.6, 0.4, EASE_OUT), 40, 0)}px 0`}}>
              <Photo src="jamun" w={360} h={290} />
              <span style={{fontWeight: 800, fontSize: 38}}>
                Dessert <span style={{color: '#E5484D'}}>+ Tadka</span>
              </span>
            </div>
          </div>
        )}
      </WCard>
    </AbsoluteFill>
  );
};

/** "Your poha, upma, idli, dosa, sandwich": the dishes pop in as photos as she names them. */
const FOODS = [
  {img: 'poha', n: 'Poha', at: 3.66},
  {img: 'upma', n: 'Upma', at: 4.34},
  {img: 'idli', n: 'Idli', at: 5.06},
  {img: 'dosa', n: 'Dosa', at: 5.7},
  {img: 'sandwich', n: 'Sandwich', at: 6.38},
];
const Foods: React.FC = () => {
  const t = useT();
  const o = vis(t, C.foods);
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: 40, right: 40, top: 40, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 14}}>
        {FOODS.map((f, i) => {
          const k = popAt(t, f.at);
          const big = i >= 3;
          return (
            <div key={f.n} style={{width: big ? 360 : 310, background: '#FFFFFF', borderRadius: 22, padding: 9, boxSizing: 'border-box', boxShadow: '0 18px 36px -16px rgba(0,0,0,0.55)', opacity: Math.min(1, k * 3), scale: lerp(Math.min(1.05, k), 0.6, 1)}}>
              <Photo src={f.img} w={big ? 342 : 292} h={140} style={{borderRadius: 14, boxShadow: 'none'}} />
              <div style={{textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 32, lineHeight: '42px', color: '#141414'}}>{f.n}</div>
            </div>
          );
        })}
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
      <div style={{position: 'absolute', left: 540 - 260, top: -20, width: 520, height: 520, scale: lerp(pop, 0.6, 0.82), rotate: `${lerp(pop, -40, 0)}deg`}}>
        <svg width={520} height={520} style={{position: 'absolute', inset: 0, filter: 'drop-shadow(0 24px 40px rgba(0,0,0,0.45))'}}>
          <circle cx={260} cy={260} r={250} fill="#FFFFFF" />
          <circle cx={260} cy={260} r={212} fill="#F4F1EB" />
          <circle cx={260} cy={260} r={R} fill="#D8D2C6" />
          <path d={`M 260 260 L 260 ${260 - R} A ${R} ${R} 0 ${a > Math.PI ? 1 : 0} 1 ${x.toFixed(1)} ${y.toFixed(1)} Z`} fill={ACCENT} />
        </svg>
        <div style={{position: 'absolute', left: 0, right: 0, top: 230, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 56, color: '#141414'}}>{k < 0.5 ? '6 : 1' : '1 : 1'}</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 200, display: 'flex', justifyContent: 'space-between', padding: '0 70px', fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: 4, color: WHITE, ...outline(30), opacity: pop}}>
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
const Scene: React.FC = () => (
  <>
    <Dolly win={C.dolly}>
      <Footage cfg={cfg} />
    </Dolly>
    <GradeOverlay cfg={cfg} />
    <TopShade wins={[C.ratio]} reach={42} />
    <Ratio />
    <Foods />
    <DishPills />
    <Idlis />
    <Bread />
    <TopShade wins={[C.cta]} reach={40} />
    <WordBehind />
    <Subject cfg={cfg} />
    <Cutaways cuts={CUTS} tm={TM_M2} dir="m2" />
    <FoodShots />
    <Plate />
    <FlipLine />
    <CtaFront />
    <SerifCaps cfg={cfg} hide={[...LINED, ...SHOTS, {start: C.cta.start + 0.1, end: 999}]} />
  </>
);

export const M2Reel: React.FC = () => (
  <Base cfg={cfg}>
    <Flip>
      <Scene />
    </Flip>
  </Base>
);
