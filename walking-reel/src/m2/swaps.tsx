import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {useT} from '../explainer/kit';
import {outline, WHITE} from '../minimal/kit';
import {EASE_IN, EASE_OUT, SANS, lerp, tween} from '../theme';
import {popAt} from '../series/kit2';
import {BREAD, DISHES, FoodShot, IDLI, Pill, SHOTS} from './config';

const RED = '#E5484D';
const GREEN = '#17A34A';
const HD = new Set(['dosa', 'sandwich', 'eggbhurji']);
const photo = (img: string) => staticFile(HD.has(img) ? `m2/photos_hd/${img}.jpg` : `m2/photos/${img}.jpg`);

/** Full-screen food photo with its name and ratio. Back-to-back photos slide in over each other;
 *  otherwise the photo blooms in and out of her talking head like the B-roll cutaways. */
const Shot: React.FC<{s: FoodShot; chainIn: boolean; chainOut: boolean}> = ({s, chainIn, chainOut}) => {
  const t = useT();
  if (t < s.start || t >= s.end + (chainOut ? 0 : 0.25)) return null;
  const inP = tween(t, s.start, chainIn ? 0.3 : 0.22, EASE_OUT);
  const outP = chainOut ? 0 : tween(t, s.end - 0.2, 0.22, EASE_IN);
  const bloom = chainIn ? outP : Math.max(1 - inP, outP);
  const slide = chainIn ? lerp(inP, 1080, 0) : 0;
  const zoom = lerp(tween(t, s.start, s.end - s.start, (x) => x), 1.05, 1.13);
  const name = tween(t, s.nameAt, 0.35, EASE_OUT);
  const k = popAt(t, s.at);
  const long = s.ratio.length > 8;
  return (
    <AbsoluteFill style={{translate: `${slide}px 0`, opacity: 1 - bloom * 0.85, filter: `blur(${bloom * 18 + (chainIn ? (1 - inP) * 14 : 0)}px) brightness(${1 + bloom * 0.35})`}}>
      <AbsoluteFill style={{scale: zoom, backgroundColor: '#111'}}>
        <Img src={photo(s.img)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(90% 26% at 50% 44%, rgba(0,0,0,0.42), rgba(0,0,0,0) 85%)'}} />
      <div style={{position: 'absolute', left: 50, right: 50, top: 840, translate: '0 -50%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26}}>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: s.name.length > 18 ? 74 : 92, lineHeight: 1.05, textAlign: 'center', color: WHITE, ...outline(84), opacity: name, translate: `0 ${lerp(name, 18, 0)}px`, filter: `blur(${(1 - name) * 6}px)`}}>{s.name}</div>
        <div style={{height: long ? 128 : 178, display: 'flex', alignItems: 'center'}}>
          {t >= s.at ? (
            <div style={{padding: long ? '8px 36px' : '4px 44px', borderRadius: 30, background: s.good ? GREEN : RED, color: WHITE, fontFamily: SANS, fontWeight: 800, fontSize: long ? 96 : 150, lineHeight: 1.1, whiteSpace: 'nowrap', boxShadow: '0 22px 44px -18px rgba(0,0,0,0.6)', scale: lerp(Math.min(1.04, k), 1.6, 1), opacity: Math.min(1, k * 3)}}>{s.ratio}</div>
          ) : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const FoodShots: React.FC = () => (
  <>
    {SHOTS.map((s, i) => (
      <Shot key={i} s={s} chainIn={i > 0 && Math.abs(SHOTS[i - 1].end - s.start) < 0.05} chainOut={i < SHOTS.length - 1 && Math.abs(SHOTS[i + 1].start - s.end) < 0.05} />
    ))}
  </>
);

/** Quantity pills above her head while she explains, one per key amount, stacked left / right / centre. */
const ROW_ALIGN = ['flex-start', 'flex-end', 'center'] as const;
const Pills: React.FC<{pills: Pill[]; end: number}> = ({pills, end}) => {
  const t = useT();
  if (!pills.length || t < pills[0][1] - 0.05 || t > end + 0.05) return null;
  const out = 1 - tween(t, end - 0.25, 0.22, EASE_IN);
  return (
    <AbsoluteFill style={{opacity: out}}>
      {pills.map(([text, at], i) => {
        if (t < at) return null;
        const k = popAt(t, at);
        const plus = text.startsWith('+ ');
        return (
          <div key={i} style={{position: 'absolute', left: 60, right: 60, top: 100 + i * 128, display: 'flex', justifyContent: ROW_ALIGN[i % 3]}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 18, padding: '14px 36px 14px 18px', borderRadius: 999, background: '#FFFFFF', boxShadow: '0 16px 34px -14px rgba(0,0,0,0.6)', fontFamily: SANS, fontWeight: 800, fontSize: 52, color: '#141414', whiteSpace: 'nowrap', scale: lerp(Math.min(1.05, k), 0.5, 1), opacity: Math.min(1, k * 3), transformOrigin: ROW_ALIGN[i % 3] === 'flex-end' ? 'right center' : ROW_ALIGN[i % 3] === 'center' ? 'center' : 'left center'}}>
              <span style={{width: 60, height: 60, borderRadius: '50%', background: plus ? GREEN : '#E4A11B', color: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 46, lineHeight: 1}}>{plus ? '+' : '✓'}</span>
              {plus ? text.slice(2) : text}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const DishPills: React.FC = () => (
  <>
    {DISHES.map((d) => (
      <Pills key={d.n} pills={d.pills} end={d.pillsEnd} />
    ))}
  </>
);

const vis = (t: number, w: {start: number; end: number}) => (t < w.start || t > w.end + 0.25 ? 0 : tween(t, w.start, 0.25, EASE_OUT) * (1 - tween(t, w.end - 0.05, 0.25, EASE_IN)));

/** "Have 2 idlis instead of 4": four idlis pop in, the last two get crossed out. */
const IdliShape: React.FC<{w: number}> = ({w}) => (
  <svg width={w} height={w * 0.6} viewBox="0 0 200 120" style={{display: 'block'}}>
    <defs>
      <radialGradient id="idliTop" cx="45%" cy="40%" r="65%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#EFE8D9" />
      </radialGradient>
    </defs>
    <ellipse cx={100} cy={102} rx={84} ry={13} fill="rgba(0,0,0,0.28)" />
    <path d="M14 50 C14 82 52 100 100 100 C148 100 186 82 186 50 Z" fill="#DCD2BD" />
    <ellipse cx={100} cy={50} rx={86} ry={38} fill="url(#idliTop)" />
    {[[70, 40], [118, 34], [134, 58], [88, 64], [104, 48], [60, 58]].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={2.6} fill="#E3DAC6" />
    ))}
  </svg>
);
export const Idlis: React.FC = () => {
  const t = useT();
  const o = vis(t, IDLI);
  if (o <= 0) return null;
  const st = tween(t, IDLI.strikeAt, 0.3, EASE_OUT);
  const lab = tween(t, IDLI.strikeAt + 0.1, 0.35, EASE_OUT);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 120, display: 'flex', justifyContent: 'center', scale: lerp(Math.min(1.04, popAt(t, IDLI.start)), 0.6, 1), opacity: Math.min(1, popAt(t, IDLI.start) * 3)}}>
        <div style={{display: 'flex', gap: 16, padding: '26px 28px 20px', borderRadius: 30, background: 'linear-gradient(160deg, #5BA34F, #2E6A2A)', boxShadow: '0 22px 44px -18px rgba(0,0,0,0.65)'}}>
          {[0, 1, 2, 3].map((i) => {
            const k = popAt(t, IDLI.start + 0.12 + i * 0.09);
            const gone = i >= 2;
            return (
              <div key={i} style={{position: 'relative', scale: lerp(Math.min(1.06, k), 0.3, 1) * (gone ? lerp(st, 1, 0.88) : 1), opacity: Math.min(1, k * 3) * (gone ? lerp(st, 1, 0.4) : 1), filter: gone ? `grayscale(${st})` : undefined}}>
                <IdliShape w={190} />
                {gone && st > 0 ? (
                  <svg width={190} height={114} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
                    <line x1={50} y1={8} x2={50 + 90 * st} y2={8 + 98 * st} stroke={RED} strokeWidth={14} strokeLinecap="round" />
                    <line x1={140} y1={8} x2={140 - 90 * st} y2={8 + 98 * st} stroke={RED} strokeWidth={14} strokeLinecap="round" />
                  </svg>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 330, display: 'flex', justifyContent: 'center', opacity: lab, translate: `0 ${lerp(lab, 14, 0)}px`}}>
        <div style={{padding: '10px 30px', borderRadius: 999, background: '#FFFFFF', fontFamily: SANS, fontWeight: 800, fontSize: 52, color: '#141414', boxShadow: '0 16px 34px -14px rgba(0,0,0,0.6)'}}>
          <span style={{color: GREEN}}>2 idlis</span>, not 4
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** "Have 1 slice instead of 2 and top it with egg": two slices, the top one flies off, a fried egg lands. */
const Slice: React.FC<{w: number}> = ({w}) => (
  <svg width={w} height={w * 0.96} viewBox="0 0 200 192" style={{display: 'block', filter: 'drop-shadow(0 14px 22px rgba(0,0,0,0.45))'}}>
    <path d="M30 190 L30 92 C8 86 2 60 14 40 C30 12 70 4 100 4 C130 4 170 12 186 40 C198 60 192 86 170 92 L170 190 Z" fill="#C98A43" />
    <path d="M42 178 L42 84 C24 80 18 62 27 47 C40 25 72 18 100 18 C128 18 160 25 173 47 C182 62 176 80 158 84 L158 178 Z" fill="#F4DDAE" />
  </svg>
);
const Egg: React.FC<{w: number}> = ({w}) => (
  <svg width={w} height={w * 0.8} viewBox="0 0 150 120" style={{display: 'block', filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.3))'}}>
    <path d="M18 60 C10 30 40 10 70 14 C96 6 136 20 138 52 C146 82 120 110 86 106 C56 116 20 100 18 60 Z" fill="#FFFFFF" />
    <circle cx={78} cy={58} r={26} fill="#F5B21B" />
    <circle cx={70} cy={50} r={8} fill="#FFD966" />
  </svg>
);
export const Bread: React.FC = () => {
  const t = useT();
  const o = vis(t, BREAD);
  if (o <= 0) return null;
  const k = popAt(t, BREAD.start + 0.05);
  const off = tween(t, BREAD.offAt, 0.4, EASE_IN);
  const lab = tween(t, BREAD.offAt + 0.12, 0.35, EASE_OUT);
  const egg = tween(t, BREAD.eggAt, 0.32, EASE_OUT);
  const squash = t >= BREAD.eggAt + 0.32 ? 1 + 0.08 * Math.max(0, 1 - tween(t, BREAD.eggAt + 0.32, 0.2)) : 1;
  const more = tween(t, BREAD.moreAt, 0.35, EASE_OUT);
  const W = 300;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: 540 - W / 2 - 170, top: 110, width: W, height: W, scale: lerp(Math.min(1.05, k), 0.5, 1)}}>
        <div style={{position: 'absolute', left: 0, top: 0}}>
          <Slice w={W} />
        </div>
        {t < BREAD.offAt + 0.45 ? (
          <div style={{position: 'absolute', left: 18, top: -22, translate: `${off * 700}px ${-off * 420}px`, opacity: 1 - off, filter: `blur(${off * 8}px)`}}>
            <Slice w={W} />
          </div>
        ) : null}
        {t >= BREAD.eggAt ? (
          <div style={{position: 'absolute', left: W / 2 - 85, top: 70, translate: `0 ${lerp(egg, -380, 0)}px`, opacity: Math.min(1, egg * 4), scale: `${squash} ${2 - squash}`}}>
            <Egg w={170} />
          </div>
        ) : null}
      </div>
      <div style={{position: 'absolute', left: 540 + 30, top: 130, display: 'flex', flexDirection: 'column', gap: 20}}>
        <div style={{opacity: lab, translate: `${lerp(lab, 30, 0)}px 0`, padding: '10px 28px', borderRadius: 999, background: '#FFFFFF', fontFamily: SANS, fontWeight: 800, fontSize: 52, color: '#141414', whiteSpace: 'nowrap', boxShadow: '0 16px 34px -14px rgba(0,0,0,0.6)', alignSelf: 'flex-start'}}>
          <span style={{color: GREEN}}>1 slice</span>, not 2
        </div>
        {t >= BREAD.eggAt ? (
          <div style={{opacity: egg, translate: `${lerp(egg, 30, 0)}px 0`, padding: '10px 28px', borderRadius: 999, background: '#FFFFFF', fontFamily: SANS, fontWeight: 800, fontSize: 52, color: '#141414', whiteSpace: 'nowrap', boxShadow: '0 16px 34px -14px rgba(0,0,0,0.6)', alignSelf: 'flex-start'}}>
            <span style={{color: GREEN}}>+</span> Egg
          </div>
        ) : null}
        {t >= BREAD.moreAt ? (
          <div style={{opacity: more, translate: `${lerp(more, 30, 0)}px 0`, fontFamily: SANS, fontWeight: 800, fontSize: 44, color: WHITE, ...outline(44), paddingLeft: 14}}>or bhurji / chicken</div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
