import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {ICONS} from '../explainer/icons';
import {useT} from '../explainer/kit';
import {EASE_IN, EASE_OUT, SANS, SERIF, lerp, tween} from '../theme';
import {C, FOOD} from './config2';
import {V4cStrike} from './graphics3';

/**
 * Simplified busy-women reel, in the style of the reference reels: one straight word or image at a
 * time, bold cream keywords + italic serif emphasis, no boxes, stickers or tilts.
 */
const CREAM = '#F6E7C1';
const SHADOW = '0 4px 28px rgba(0,0,0,0.45), 0 2px 6px rgba(0,0,0,0.35)';
const P = 'v4/photos/';

/** A straight word: fades and rises in, fades out. */
const Word: React.FC<{text: string; at: number; out: number; y: number; x?: number; size: number; serif?: boolean; color?: string; align?: 'center' | 'left'}> = ({
  text,
  at,
  out,
  y,
  x = 540,
  size,
  serif,
  color,
  align = 'center',
}) => {
  const t = useT();
  if (t < at - 0.02 || t > out + 0.25) return null;
  const p = tween(t, at, 0.35, EASE_OUT);
  const o = Math.min(1, p * 1.4) * (1 - tween(t, out, 0.22, EASE_IN));
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        translate: `${align === 'center' ? '-50%' : '0%'} ${lerp(p, -30, -50)}%`,
        opacity: o,
        fontFamily: serif ? SERIF : SANS,
        fontStyle: serif ? 'italic' : 'normal',
        fontWeight: serif ? 400 : 800,
        fontSize: size,
        letterSpacing: serif ? -1 : -3,
        lineHeight: 1,
        color: color ?? (serif ? '#FFFFFF' : CREAM),
        textShadow: SHADOW,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </div>
  );
};

const inside = (t: number, w: {start: number; end: number}) => t >= w.start && t < w.end;

// ===========================================================================
// Behind her (between the blurred background and her cut-out): "You don't need a perfect diet."
// ===========================================================================
export const V4bBehind: React.FC = () => {
  const t = useT();
  return (
    <>
      {inside(t, C.stop) ? <Word text="STOP" at={2.64} out={4.4} y={520} size={300} /> : null}
      {inside(t, C.perfect) ? (
        <>
          <Word text="perfect" at={23.6} out={C.perfect.end - 0.2} y={520} size={330} serif />
          <V4cStrike />
        </>
      ) : null}
      <V4bInstaGrid />
      {t >= C.cta.start ? <Word text="BUSY" at={46.56} out={999} y={520} size={330} /> : null}
    </>
  );
};

// ===========================================================================
// On her (talking-head sections)
// ===========================================================================
const TALK_TEXT: [number, number][] = [
  [2.6, 8.6], [10.5, 11.45], [25.0, 28.0], [37.9, 40.2], [46.35, 999],
];

export const V4bTalk: React.FC = () => {
  const t = useT();
  // soft dark top so cream words read over the bright window
  const g = Math.max(0, ...TALK_TEXT.map(([a, b]) => (t >= a && t < b ? tween(t, a, 0.3) * (1 - tween(t, b - 0.25, 0.25)) : 0)));
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {g > 0 ? <AbsoluteFill style={{opacity: g, background: 'linear-gradient(to bottom, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.22) 28%, rgba(0,0,0,0) 45%)'}} /> : null}
      {/* "stop following fat loss diets that require you to cook 5 different meals every single day." */}
      {inside(t, C.stop) ? (
        <>
          <Word text="5" at={5.66} out={C.stop.end - 0.2} y={470} x={300} size={330} />
          <Word text="different" at={6.06} out={C.stop.end - 0.2} y={430} x={430} size={96} serif align="left" />
          <Word text="meals" at={6.5} out={C.stop.end - 0.2} y={530} x={430} size={96} serif align="left" />
        </>
      ) : null}
      {/* commute has no clip: the word sits above her */}
      {inside(t, C.commute) ? <Word text="COMMUTE" at={C.commute.start} out={C.commute.end - 0.05} y={470} size={170} /> : null}
      {/* "You need 5 to 6 meals you actually like" */}
      {inside(t, C.meals) ? (
        <>
          <Word text="5–6 MEALS" at={25.12} out={C.meals.end - 0.2} y={440} size={160} />
          <Word text="you actually like" at={26.74} out={C.meals.end - 0.2} y={570} size={96} serif />
        </>
      ) : null}
      {/* "it's the one you can still follow when you're busy." */}
      {inside(t, C.follow) ? (
        <>
          <Word text="still follow" at={37.96} out={C.follow.end - 0.2} y={450} size={150} serif />
          <Word text="WHEN YOU'RE BUSY" at={38.92} out={C.follow.end - 0.2} y={580} size={74} />
        </>
      ) : null}
      {/* "Comment busy and I'll send you my free guide..." */}
      {t >= C.cta.start ? (
        <>
          <Word text="Comment" at={46.42} out={999} y={300} size={96} serif />
          <Word text="for my free fat loss guide" at={48.16} out={999} y={1480} size={50} color="#FFFFFF" />
        </>
      ) : null}
    </AbsoluteFill>
  );
};

// ===========================================================================
// Over the B-roll
// ===========================================================================
export const V4bBroll: React.FC = () => {
  const t = useT();
  const shade = (w: {start: number; end: number}) => (inside(t, w) ? 1 : 0);
  const anyText = shade(C.open) || shade(C.work) || shade(C.meet) || shade(C.social) || shade(C.eat);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {anyText ? <AbsoluteFill style={{background: 'radial-gradient(90% 55% at 50% 45%, rgba(0,0,0,0.38) 0%, rgba(0,0,0,0.12) 70%, rgba(0,0,0,0) 100%)'}} /> : null}
      {/* hook: "If you are a busy woman," */}
      {inside(t, C.open) ? (
        <>
          <Word text="If you're a" at={1.3} out={C.open.end - 0.15} y={790} size={90} serif />
          <Word text="BUSY WOMAN" at={1.78} out={C.open.end - 0.15} y={910} size={150} />
        </>
      ) : null}
      {/* "You have work, meetings, ... a social life" */}
      {inside(t, C.work) ? <Word text="WORK" at={9.12} out={C.work.end - 0.05} y={960} size={190} /> : null}
      {inside(t, C.meet) ? <Word text="MEETINGS" at={C.meet.start} out={C.meet.end - 0.05} y={960} size={170} /> : null}
      {inside(t, C.social) ? <Word text="SOCIAL LIFE" at={C.social.start + 0.05} out={C.social.end - 0.05} y={960} size={150} /> : null}
      {/* "...that are easy to make and fit your calorie and protein targets" */}
      {inside(t, C.eat) ? (
        <>
          <Word text="EASY TO MAKE" at={28.14} out={C.eat.end - 0.2} y={760} size={120} />
          <Word text="fits your calories & protein" at={29.14} out={C.eat.end - 0.2} y={880} size={80} serif />
        </>
      ) : null}
    </AbsoluteFill>
  );
};

// ===========================================================================
// Full-screen cutaways: the food the diet asks for, then an Instagram post
// ===========================================================================
const PAPER = '#F7F5F1';
const INK = '#1B1714';
const Backdrop: React.FC = () => (
  <AbsoluteFill style={{background: `radial-gradient(90% 60% at 50% 42%, #FFFFFF 0%, ${PAPER} 70%, #EDE8E0 100%)`}} />
);

export const V4bFood: React.FC = () => {
  const t = useT();
  const f = FOOD.find((x) => inside(t, x.w));
  if (!f) return null;
  const z = lerp(tween(t, f.w.start, f.w.end - f.w.start), 1.0, 1.05);
  const p = tween(t, f.w.start, 0.3, EASE_OUT);
  return (
    <AbsoluteFill>
      <Backdrop />
      <div style={{position: 'absolute', left: 540, top: 860, translate: '-50% -50%', width: 820, height: 820, borderRadius: 34, overflow: 'hidden', boxShadow: '0 30px 70px rgba(40,30,20,0.22)', scale: lerp(p, 0.96, 1)}}>
        <Img src={staticFile(`${P}${f.img}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover', scale: z}} />
      </div>
      <Word text={f.label} at={f.w.start + 0.05} out={f.w.end + 1} y={1420} size={120} serif color={INK} />
    </AbsoluteFill>
  );
};

const Glyph: React.FC<{name: string; size: number; color: string}> = ({name, size, color}) => (
  <svg viewBox="0 0 256 256" width={size} height={size} style={{display: 'block'}}>
    {ICONS[name].map((d, k) => (
      <path key={k} d={d} fill={color} />
    ))}
  </svg>
);

const GRID = ['insta_bowl', 'big_broccoli', 'big_smoothie', 'big_salad', 'meal_smoothie', 'meal_oats2', 'meal_chicken2', 'meal_salad', 'meal_curd'];
const HEARTS: [number, number, string][] = [[0, 35.06, '48.2K'], [5, 35.22, '31.9K'], [2, 35.38, '27.5K'], [3, 35.54, '52.1K']];
const TILE = 352, GAP = 6, GX = (1080 - 3 * TILE - 2 * GAP) / 2, GY = 330;

/** "...isn't the one that looks the best on Instagram": a white profile grid behind her. */
export const V4bInstaGrid: React.FC = () => {
  const t = useT();
  if (!inside(t, C.insta)) return null;
  const e = tween(t, C.insta.start, 0.22);
  const h = tween(t, C.insta.start + 0.1, 0.4, EASE_OUT);
  return (
    <AbsoluteFill style={{background: PAPER, opacity: e}}>
      {/* profile header */}
      <div style={{position: 'absolute', left: 40, top: 120, display: 'flex', alignItems: 'center', gap: 26, opacity: h, translate: `0 ${lerp(h, -20, 0)}px`, fontFamily: SANS}}>
        <div style={{width: 128, height: 128, borderRadius: '50%', background: 'linear-gradient(45deg,#F9CE34,#EE2A7B,#6228D7)', padding: 6, boxSizing: 'border-box'}}>
          <Img src={staticFile(`${P}insta_bowl.jpg`)} style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '5px solid #fff', boxSizing: 'border-box'}} />
        </div>
        <div>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, fontWeight: 800, fontSize: 46, color: INK}}>
            perfect.diet.daily
            <div style={{width: 40, height: 40, borderRadius: '50%', background: '#0A84FF', color: '#fff', fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>✓</div>
          </div>
          <div style={{fontSize: 32, fontWeight: 600, color: '#8a8580', marginTop: 6}}>2.4M followers · 5 meals a day</div>
        </div>
      </div>
      {GRID.map((g, i) => {
        const p = tween(t, C.insta.start + 0.15 + i * 0.05, 0.45, EASE_OUT);
        const x = GX + (i % 3) * (TILE + GAP);
        const y = GY + Math.floor(i / 3) * (TILE + GAP);
        const heart = HEARTS.find((k) => k[0] === i);
        const hp = heart ? tween(t, heart[1], 0.35, EASE_OUT) : 0;
        const hOut = heart ? 1 - tween(t, heart[1] + 0.55, 0.3, EASE_IN) : 0;
        return (
          <div key={g} style={{position: 'absolute', left: x, top: y, width: TILE, height: TILE, overflow: 'hidden', opacity: p, translate: `0 ${lerp(p, 40, 0)}px`, background: '#ddd'}}>
            <Img src={staticFile(`${P}${g}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            {hp > 0 ? (
              <>
                <div style={{position: 'absolute', left: '50%', top: '50%', translate: '-50% -50%', scale: lerp(hp, 0.3, 1) * (1 + 0.15 * Math.sin(Math.PI * hp)), opacity: hOut, filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.35))'}}>
                  <Glyph name="heart-straight" size={150} color="#fff" />
                </div>
                <div style={{position: 'absolute', left: 16, bottom: 14, display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 30, background: 'rgba(0,0,0,0.5)', color: '#fff', fontFamily: SANS, fontWeight: 800, fontSize: 30, opacity: hp}}>
                  <Glyph name="heart-straight" size={30} color="#FF3B5C" />
                  {heart![2]}
                </div>
              </>
            ) : null}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
