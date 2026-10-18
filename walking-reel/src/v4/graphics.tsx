import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {ICONS} from '../explainer/icons';
import {Canvas, Cross, PIXEL, PIXEL_WIDE, Scramble, Tick, X, useT} from '../explainer/kit';
import {Stage} from '../series/core';
import {Giant} from '../series/parts';
import {Pill, Sticker} from '../series/hook';
import {EASE_IN, EASE_IN_OUT, EASE_OUT, SANS, lerp, springAt, tween} from '../theme';
import {B, MONTAGE} from './config';

const P = 'v4/photos/';
const SHADOW = '0 18px 40px rgba(0,0,0,0.32), 0 4px 10px rgba(0,0,0,0.18)';
const YEL = '#FFE14D';

const Glyph: React.FC<{name: string; size: number; color: string}> = ({name, size, color}) => (
  <svg viewBox="0 0 256 256" width={size} height={size} style={{display: 'block'}}>
    {ICONS[name].map((d, k) => (
      <path key={k} d={d} fill={color} />
    ))}
  </svg>
);

/** Pixel text laid out at its real stretched width. */
const Px: React.FC<{size: number; color: string; children: React.ReactNode}> = ({size, color, children}) => (
  <span style={{display: 'inline-block', fontFamily: PIXEL, fontSize: size * PIXEL_WIDE, lineHeight: 1, color, scale: `1 ${1 / PIXEL_WIDE}`, margin: `${(-size * (PIXEL_WIDE - 1)) / 2}px 0`, whiteSpace: 'pre'}}>{children}</span>
);

const RoundPhoto: React.FC<{src: string; d: number; ring?: number}> = ({src, d, ring = 8}) => (
  <div style={{width: d, height: d, borderRadius: '50%', background: '#fff', padding: ring, boxShadow: SHADOW}}>
    <Img src={staticFile(src)} style={{width: d - 2 * ring, height: d - 2 * ring, borderRadius: '50%', objectFit: 'cover', display: 'block'}} />
  </div>
);

// ===========================================================================
// 0 - 2.6  Visual hook over the desk B-roll: notifications pile up ("If you are a busy woman,")
// ===========================================================================
const NOTES = [
  {at: 0.12, icon: 'calendar-blank', app: 'CALENDAR', text: 'Meeting in 5 min', color: '#FF5A5F'},
  {at: 0.62, icon: 'briefcase', app: 'WORK', text: 'Deadline today, 6 PM', color: X.blue},
  {at: 1.12, icon: 'chat-circle-dots', app: 'MESSAGES', text: 'Dinner tonight at 8?', color: X.green},
  {at: 1.62, icon: 'bell-ringing', app: 'REMINDER', text: 'Meal prep: cook 5 meals', color: X.pink},
];

const Notification: React.FC<{icon: string; app: string; text: string; color: string}> = ({icon, app, text, color}) => (
  <div style={{width: 880, display: 'flex', alignItems: 'center', gap: 26, padding: '24px 30px', borderRadius: 40, background: 'rgba(250,250,252,0.94)', boxShadow: '0 20px 50px rgba(0,0,0,0.35)', fontFamily: SANS}}>
    <div style={{width: 92, height: 92, borderRadius: 24, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
      <Glyph name={icon} size={58} color="#fff" />
    </div>
    <div style={{flex: 1, minWidth: 0}}>
      <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 28, fontWeight: 700, color: '#8A8C93', letterSpacing: 1}}>
        <span>{app}</span>
        <span style={{fontWeight: 600}}>now</span>
      </div>
      <div style={{fontSize: 44, fontWeight: 800, color: X.ink, marginTop: 4, whiteSpace: 'nowrap'}}>{text}</div>
    </div>
  </div>
);

export const V4Open: React.FC = () => {
  const t = useT();
  if (t >= B.open.end + 0.4) return null;
  const leave = tween(t, B.open.end - 0.2, 0.35, EASE_IN);
  const shown = NOTES.filter((n) => t >= n.at);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {/* darken the clip a touch so the banners pop */}
      <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.1) 55%, rgba(0,0,0,0) 100%)', opacity: 1 - leave}} />
      {shown.map((n, i) => {
        // newest on top: each arrival pushes the older ones down
        const order = shown.length - 1 - i;
        const p = springAt(t, n.at, 13, 220);
        const slot = (k: number) => 470 + k * 170;
        const prevSlot = order > 0 ? slot(order - 1) : slot(0);
        const y = order === 0 ? lerp(Math.min(p, 1.1), 300, slot(0)) : lerp(springAt(t, shown[shown.length - 1].at, 13, 220), prevSlot, slot(order));
        return (
          <div key={n.app} style={{position: 'absolute', left: 540, top: y - leave * 900, translate: '-50% -50%', scale: lerp(Math.min(p, 1), 0.85, 1) * (1 - order * 0.03), opacity: Math.min(1, p * 2) * (1 - order * 0.12)}}>
            <Notification {...n} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ===========================================================================
// 2.6 - 8.6  "stop following fat loss diets that require you to cook 5 different meals every single day."
// ===========================================================================
const MEALS5 = ['meal_chicken', 'meal_salad', 'meal_acai', 'meal_oats', 'meal_smoothie'];
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export const V4Stop: React.FC = () => {
  const t = useT();
  if (t < B.stop.start || t >= B.stop.end + 0.3) return null;
  const out = tween(t, B.stop.end - 0.25, 0.25, EASE_IN);
  const stopP = tween(t, 2.64, 0.14, EASE_IN);
  const stopOut = tween(t, 3.7, 0.3, EASE_IN);
  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity: 1 - out}}>
      {t >= 2.64 && stopOut < 1 ? (
        <div style={{position: 'absolute', left: 540, top: 470, translate: '-50% -50%', rotate: '-7deg', scale: lerp(stopP, 2.4, 1) * (1 - stopOut * 0.3), opacity: lerp(stopP, 0, 1) * (1 - stopOut)}}>
          <div style={{background: '#E5383B', borderRadius: 30, padding: '18px 54px 8px', boxShadow: '0 20px 60px rgba(229,56,59,0.55)', border: '8px solid #fff'}}>
            <Px size={170} color="#fff">STOP</Px>
          </div>
        </div>
      ) : null}
      {/* five meal tiles drop in, numbered */}
      {MEALS5.map((m, i) => {
        const at = 5.66 + i * 0.13;
        if (t < at) return null;
        const p = springAt(t, at, 11, 230);
        const x = 160 + i * 190;
        return (
          <div key={m} style={{position: 'absolute', left: x, top: lerp(Math.min(p, 1.1), 300, 470), translate: '-50% -50%', scale: Math.max(0, p), rotate: `${(i - 2) * 5}deg`}}>
            <RoundPhoto src={`${P}${m}.jpg`} d={170} ring={7} />
            <div style={{position: 'absolute', right: -6, top: -6, width: 56, height: 56, borderRadius: '50%', background: X.pink, border: '4px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 32, color: '#fff'}}>{i + 1}</div>
          </div>
        );
      })}
      {/* every single day: the week lights up */}
      {t >= 6.82 ? (
        <div style={{position: 'absolute', left: 540, top: 640, translate: '-50% -50%', display: 'flex', gap: 12, opacity: tween(t, 6.82, 0.15)}}>
          {DAYS.map((d, i) => {
            const on = t >= 6.85 + i * 0.12;
            return (
              <div key={i} style={{width: 92, height: 92, borderRadius: 20, background: on ? X.pink : 'rgba(255,255,255,0.92)', boxShadow: SHADOW, display: 'flex', alignItems: 'center', justifyContent: 'center', scale: on ? lerp(Math.min(springAt(t, 6.85 + i * 0.12, 12, 260), 1.1), 0.8, 1) : 0.9}}>
                <Px size={46} color={on ? '#fff' : X.ink}>{d}</Px>
              </div>
            );
          })}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ===========================================================================
// 8.6 - 12.3  Montage labels + the day filling up ("You have work, meetings, commute, a social life")
// ===========================================================================
const SLOTS = [
  {at: 9.12, label: 'WORK', color: X.blue, w: 0.36},
  {at: 9.82, label: 'MEETINGS', color: X.navy, w: 0.24},
  {at: 10.56, label: 'COMMUTE', color: '#7A7D86', w: 0.14},
  {at: 11.52, label: 'SOCIAL LIFE', color: X.pink, w: 0.26},
];

export const V4Montage: React.FC = () => {
  const t = useT();
  if (t < MONTAGE.start || t >= MONTAGE.end) return null;
  const cur = [...SLOTS].reverse().find((s) => t >= s.at);
  let acc = 0;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.35) 100%)'}} />
      {/* the day bar */}
      <div style={{position: 'absolute', left: 90, top: 210, width: 900, fontFamily: SANS}}>
        <div style={{display: 'flex', justifyContent: 'space-between', color: '#fff', fontWeight: 800, fontSize: 34, marginBottom: 12, textShadow: '0 2px 8px rgba(0,0,0,0.5)'}}>
          <span>9 AM</span>
          <span>YOUR DAY</span>
          <span>10 PM</span>
        </div>
        <div style={{position: 'relative', height: 64, borderRadius: 32, background: 'rgba(255,255,255,0.28)', overflow: 'hidden', boxShadow: SHADOW}}>
          {SLOTS.map((s) => {
            const left = acc;
            acc += s.w;
            if (t < s.at - 0.05) return null;
            const p = tween(t, s.at - 0.05, 0.25, EASE_OUT);
            return <div key={s.label} style={{position: 'absolute', left: `${left * 100}%`, top: 0, bottom: 0, width: `${s.w * 100 * p}%`, background: s.color, borderRight: '3px solid rgba(255,255,255,0.7)'}} />;
          })}
        </div>
      </div>
      {/* the big word for the clip on screen */}
      {cur ? (
        <div key={cur.label} style={{position: 'absolute', left: 540, top: 1000, translate: '-50% -50%', scale: lerp(Math.min(springAt(t, cur.at, 12, 260), 1.12), 1.6, 1), opacity: tween(t, cur.at, 0.08)}}>
          <div style={{background: cur.color, borderRadius: 26, padding: '18px 40px 10px', boxShadow: SHADOW, rotate: '-3deg'}}>
            <Px size={110} color="#fff">{cur.label}</Px>
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// commute has no clip: a route animates on a light stage under the same labels
const CommuteScene: React.FC = () => {
  const t = useT();
  const W = B.commute;
  const p = tween(t, W.start + 0.05, 0.8, EASE_IN_OUT);
  const path = 'M200 1250 C 330 900, 760 1180, 880 760';
  return (
    <Stage w={W}>
      <svg style={{position: 'absolute', left: 0, top: 0}} width={1080} height={1920}>
        <path d={path} fill="none" stroke={X.grey} strokeWidth={18} strokeLinecap="round" strokeDasharray="2 30" />
        <path d={path} fill="none" stroke={X.ink} strokeWidth={18} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
      </svg>
      <div style={{position: 'absolute', left: 200, top: 1250, translate: '-50% -50%'}}>
        <Glyph name="house" size={170} color={X.ink} />
      </div>
      <div style={{position: 'absolute', left: 880, top: 760, translate: '-50% -50%'}}>
        <Glyph name="buildings" size={190} color={X.ink} />
      </div>
      {/* the train rides along the route */}
      <div style={{position: 'absolute', left: 0, top: 0, offsetPath: `path('${path}')`, offsetDistance: `${p * 100}%`, offsetRotate: '0deg', translate: '-50% -60%'}}>
        <div style={{background: X.pink, borderRadius: '50%', width: 170, height: 170, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: SHADOW}}>
          <Glyph name="train-simple" size={100} color="#fff" />
        </div>
      </div>
    </Stage>
  );
};

// ===========================================================================
// 12.3 - 22.5  The diet's shopping list piles up around her, then falls off ("Of course you can't stick to it.")
// ===========================================================================
const FOODS = [
  {src: 'chicken', at: 14.72, x: 190, y: 640, rot: -10},
  {src: 'broccoli', at: 15.48, x: 890, y: 640, rot: 9},
  {src: 'salad', at: 17.3, x: 200, y: 1040, rot: 7},
  {src: 'smoothie', at: 18.82, x: 880, y: 1040, rot: -8},
];
const FALL = 20.92;

export const V4Food: React.FC = () => {
  const t = useT();
  if (t < B.food.start || t >= B.cant.end) return null;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {/* "your diet says..." */}
      {t >= 13.5 && t < 14.75 ? (
        <Sticker at={13.5} out={14.6} x={540} y={420} rot={-4}>
          <Pill bg={X.ink} size={54}>THE DIET PLAN SAYS</Pill>
        </Sticker>
      ) : null}
      {FOODS.map((f, i) => {
        if (t < f.at) return null;
        const p = springAt(t, f.at, 11, 210);
        const wob = Math.sin((t - f.at) * 7 + i) * (t > 19.38 && t < FALL ? 6 : 2);
        const df = Math.max(0, t - (FALL + i * 0.08));
        const fy = 0.5 * 4200 * df * df;
        const fr = df * (i % 2 ? 240 : -240);
        return (
          <div key={f.src} style={{position: 'absolute', left: f.x + df * (i % 2 ? 160 : -160), top: f.y + fy, translate: '-50% -50%', scale: Math.max(0, p), rotate: `${f.rot + wob + fr}deg`}}>
            <RoundPhoto src={`${P}${f.src}.jpg`} d={250} ring={9} />
          </div>
        );
      })}
      {/* every single day: x7 */}
      {t >= 19.38 && t < FALL + 0.2 ? (
        <div style={{position: 'absolute', left: 540, top: 430, translate: '-50% -50%', scale: lerp(Math.min(springAt(t, 19.38, 10, 240), 1.15), 2, 1), rotate: '-6deg', opacity: 1 - tween(t, FALL, 0.2)}}>
          <div style={{background: X.pink, borderRadius: 30, padding: '14px 40px 6px', border: '7px solid #fff', boxShadow: SHADOW}}>
            <Px size={120} color="#fff">x 7 DAYS</Px>
          </div>
        </div>
      ) : null}
      {/* "can't stick to it" */}
      <Cross at={21.56} x={540} y={430} size={260} out={B.cant.end - 0.05} />
    </AbsoluteFill>
  );
};

// ===========================================================================
// 22.5 - 24.3  Depth text: PERFECT sits between the blurred background and her, then gets struck out
// ===========================================================================
export const V4PerfectBehind: React.FC = () => {
  const t = useT();
  if (t < B.perfect.start || t >= B.perfect.end) return null;
  const strike = tween(t, 23.95, 0.22, EASE_OUT);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <Giant text="PERFECT" at={22.8} y={420} size={250} color={X.ink} stagger={0.035} out={B.perfect.end - 0.12} />
      <div style={{position: 'absolute', left: 60, top: 520, width: 960 * strike, height: 30, borderRadius: 15, background: '#E5383B', rotate: '-4deg', transformOrigin: 'left', opacity: 1 - tween(t, B.perfect.end - 0.12, 0.12)}} />
    </AbsoluteFill>
  );
};

// ===========================================================================
// 24.3 - 31.2  Split layout: "You need 5 to 6 meals you actually like that are easy to make and fit your calorie and protein targets"
// ===========================================================================
const GRID = ['meal_poha', 'meal_chicken2', 'meal_oats2', 'meal_paneer', 'meal_khichdi', 'meal_curd'];
const CHECKS = [
  {at: 26.74, icon: 'heart-straight', text: 'YOU ACTUALLY LIKE', color: X.pink},
  {at: 28.14, icon: 'timer', text: 'EASY TO MAKE', color: X.blue},
  {at: 29.14, icon: 'scales', text: 'FITS CALORIES + PROTEIN', color: X.green},
];

export const V4Panel: React.FC = () => {
  const t = useT();
  if (t < B.panel.start || t >= B.panel.end) return null;
  const enter = tween(t, B.panel.start + 0.2, 0.4);
  return (
    <AbsoluteFill style={{opacity: enter, pointerEvents: 'none'}}>
      <Scramble text="YOU NEED" at={24.4} x={540} y={90} size={44} color={X.greyText} />
      <Scramble text="5-6 MEALS" at={25.12} x={540} y={170} size={100} color={X.ink} />
      {GRID.map((g, i) => {
        const at = 26.18 + i * 0.09;
        if (t < at) return null;
        const p = springAt(t, at, 12, 220);
        const x = 220 + (i % 3) * 320;
        const y = 380 + Math.floor(i / 3) * 250;
        return (
          <div key={g} style={{position: 'absolute', left: x, top: y, translate: '-50% -50%', scale: Math.max(0, p), rotate: `${(i % 3 - 1) * 4}deg`}}>
            <RoundPhoto src={`${P}${g}.jpg`} d={220} ring={8} />
          </div>
        );
      })}
      {CHECKS.map((c, i) => {
        if (t < c.at) return null;
        const p = springAt(t, c.at, 13, 240);
        return (
          <div key={c.text} style={{position: 'absolute', left: 120, top: 760 + i * 100, display: 'flex', alignItems: 'center', gap: 22, translate: `${lerp(Math.min(p, 1), -60, 0)}px 0px`, opacity: Math.min(1, p * 1.5)}}>
            <div style={{width: 76, height: 76, borderRadius: 20, background: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <Glyph name={c.icon} size={46} color="#fff" />
            </div>
            <Px size={50} color={X.ink}>{c.text}</Px>
          </div>
        );
      })}
      {CHECKS.map((c, i) => (t >= c.at + 0.3 ? <Tick key={i} at={c.at + 0.3} x={960} y={798 + i * 100} size={70} /> : null))}
    </AbsoluteFill>
  );
};

// ===========================================================================
// 31.2 - 40.2  Instagram vs real life ("the diet that works isn't the one that looks the best on Instagram,
//              it's the one you can still follow when you're busy.")
// ===========================================================================
const Phone: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{width: 440, height: 860, borderRadius: 64, background: '#111', padding: 16, boxShadow: '0 30px 70px rgba(0,0,0,0.35)'}}>
    <div style={{width: '100%', height: '100%', borderRadius: 50, background: '#fff', overflow: 'hidden', position: 'relative', fontFamily: SANS}}>{children}</div>
  </div>
);

const InstaScene: React.FC = () => {
  const t = useT();
  const W = B.insta;
  const likes = Math.round(12400 * tween(t, 35.06, 0.9, EASE_OUT));
  const day = Math.max(1, Math.round(90 * tween(t, 38.92, 0.8, EASE_OUT)));
  const left = springAt(t, 34.08, 12, 180);
  const right = springAt(t, 36.74, 12, 180);
  const dim = tween(t, 35.6, 0.3);
  return (
    <Stage w={W}>
      <Canvas keys={[{t: W.start, x: 540, y: 820, s: 1.12}, {t: 34.0, x: 540, y: 900, s: 1.0}, {t: W.end, x: 540, y: 930, s: 1.04}]}>
        <Scramble text="THE DIET THAT WORKS" at={32.14} x={540} y={300} size={60} color={X.ink} per={0.015} />
        <Scramble text="ISN'T THE PRETTIEST" at={33.44} x={540} y={380} size={44} color={X.greyText} per={0.015} />
        {/* Instagram post */}
        {t >= 34.08 ? (
          <div style={{position: 'absolute', left: 290, top: 960, translate: '-50% -50%', scale: Math.max(0, left) * lerp(dim, 1, 0.92), rotate: '-4deg', opacity: lerp(dim, 1, 0.8)}}>
            <Phone>
              <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '26px 22px 14px'}}>
                <div style={{width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(45deg,#F9CE34,#EE2A7B,#6228D7)', padding: 4}}>
                  <div style={{width: '100%', height: '100%', borderRadius: '50%', background: '#fff'}} />
                </div>
                <div style={{fontWeight: 800, fontSize: 28, color: '#111'}}>cleaneats.daily</div>
              </div>
              <Img src={staticFile(`${P}insta_bowl.jpg`)} style={{width: '100%', height: 408, objectFit: 'cover', display: 'block'}} />
              <div style={{display: 'flex', gap: 20, padding: '18px 22px 6px', alignItems: 'center'}}>
                <Glyph name="heart-straight" size={48} color="#ED4956" />
                <Glyph name="chat-teardrop-text" size={46} color="#111" />
                <Glyph name="paper-plane-right" size={44} color="#111" />
              </div>
              <div style={{padding: '4px 22px', fontWeight: 800, fontSize: 30, color: '#111'}}>{likes.toLocaleString('en-US')} likes</div>
              <div style={{padding: '4px 22px', fontSize: 26, color: '#333'}}>
                <b>cleaneats.daily</b> my 5-meal clean day
              </div>
            </Phone>
            <div style={{position: 'absolute', left: '50%', top: -70, translate: '-50% 0%'}}>
              <Pill bg={X.ink} size={40}>LOOKS BEST</Pill>
            </div>
          </div>
        ) : null}
        <Cross at={35.6} x={290} y={960} size={260} />
        {/* real life */}
        {t >= 36.74 ? (
          <div style={{position: 'absolute', left: 790, top: 960, translate: '-50% -50%', scale: Math.max(0, right), rotate: '4deg'}}>
            <Phone>
              <div style={{padding: '30px 26px 10px', fontWeight: 800, fontSize: 30, color: '#111'}}>Today's lunch</div>
              <Img src={staticFile(`${P}meal_poha.jpg`)} style={{width: '100%', height: 408, objectFit: 'cover', display: 'block'}} />
              <div style={{padding: '26px 26px 0', fontWeight: 800, fontSize: 30, color: '#111'}}>Same 5 meals I like</div>
              <div style={{margin: '22px 26px', borderRadius: 24, background: X.green, color: '#fff', padding: '18px 22px', textAlign: 'center'}}>
                <Px size={46} color="#fff">{`DAY ${day}`}</Px>
              </div>
            </Phone>
            <div style={{position: 'absolute', left: '50%', top: -70, translate: '-50% 0%'}}>
              <Pill bg={X.green} size={40}>STILL FOLLOWING</Pill>
            </div>
          </div>
        ) : null}
        <Tick at={38.54} x={790} y={1430} size={110} />
        <Scramble text="VS" at={36.6} x={540} y={960} size={70} color={X.pink} />
      </Canvas>
    </Stage>
  );
};

// ===========================================================================
// 43.05 - 46.3  "...and actually keeping it off in the long run as well."
// ===========================================================================
const ChartScene: React.FC = () => {
  const t = useT();
  const W = B.chart;
  const X0 = 140;
  const X1 = 950;
  const crash = (u: number) => 560 + 330 * Math.sin(Math.min(1, u / 0.35) * Math.PI * 0.5) - (u > 0.35 ? 380 * Math.sin(((u - 0.35) / 0.65) * Math.PI * 0.5) : 0) + (u > 0.35 ? 10 : 0);
  const steady = (u: number) => 560 + 300 * u - 40 * u * u;
  const d1 = tween(t, 43.1, 1.4, EASE_IN_OUT);
  const d2 = tween(t, 43.9, 1.4, EASE_IN_OUT);
  const poly = (fn: (u: number) => number, end: number) =>
    Array.from({length: 61}, (_, i) => {
      const u = (i / 60) * end;
      return `${i ? 'L' : 'M'}${(X0 + (X1 - X0) * u).toFixed(1)} ${fn(u).toFixed(1)}`;
    }).join(' ');
  return (
    <Stage w={W}>
      <Canvas keys={[{t: W.start, x: 540, y: 700, s: 1.1}, {t: W.end, x: 540, y: 760, s: 1.0}]}>
        <Scramble text="KEEPING IT OFF" at={43.3} x={540} y={330} size={84} color={X.ink} />
        <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1} height={1}>
          <line x1={X0} y1={500} x2={X0} y2={960} stroke={X.grey} strokeWidth={5} strokeDasharray="0.1 12" strokeLinecap="round" />
          <line x1={X0} y1={960} x2={X1} y2={960} stroke={X.grey} strokeWidth={5} strokeDasharray="0.1 12" strokeLinecap="round" />
          {d1 > 0 ? <path d={poly(crash, d1)} fill="none" stroke={X.pink} strokeWidth={10} strokeDasharray="22 16" strokeLinecap="round" /> : null}
          {d2 > 0 ? <path d={poly(steady, d2)} fill="none" stroke={X.blue} strokeWidth={12} strokeLinecap="round" /> : null}
        </svg>
        <div style={{position: 'absolute', left: X0 - 10, top: 470, fontFamily: PIXEL, fontSize: 30, color: X.greyText}}>
          <Px size={30} color={X.greyText}>WEIGHT</Px>
        </div>
        <div style={{position: 'absolute', left: X1 - 120, top: 990}}>
          <Px size={30} color={X.greyText}>MONTHS</Px>
        </div>
        {t >= 44.0 ? (
          <div style={{position: 'absolute', left: 560, top: 1080, display: 'flex', flexDirection: 'column', gap: 18, opacity: tween(t, 44.0, 0.3)}}>
            <Pill bg={X.pink} size={38}>30-DAY DIET: COMES BACK</Pill>
          </div>
        ) : null}
        {t >= 44.9 ? (
          <div style={{position: 'absolute', left: 160, top: 1180, opacity: tween(t, 44.9, 0.3)}}>
            <Pill bg={X.blue} size={38}>A DIET YOU CAN KEEP: STAYS OFF</Pill>
          </div>
        ) : null}
      </Canvas>
    </Stage>
  );
};

export const V4Scenes: React.FC = () => (
  <>
    <CommuteScene />
    <InstaScene />
    <ChartScene />
  </>
);

// ===========================================================================
// 46.3 - end  CTA: "Comment BUSY and I'll send you my free guide..."
// ===========================================================================
export const V4Cta: React.FC = () => {
  const t = useT();
  if (t < B.cta.start) return null;
  const word = 'BUSY';
  const typed = word.slice(0, word.split('').filter((_, i) => t >= 46.56 + i * 0.1).length);
  const sent = t >= 47.3;
  const tap = springAt(t, 47.3, 9, 300);
  const card = springAt(t, 48.16, 12, 200);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 540, top: 240, translate: '-50% -50%', scale: lerp(Math.min(springAt(t, 46.42, 12, 220), 1.1), 0.7, 1)}}>
        <div style={{width: 900, display: 'flex', alignItems: 'center', gap: 22, padding: '22px 26px', borderRadius: 60, background: 'rgba(255,255,255,0.96)', boxShadow: SHADOW, fontFamily: SANS}}>
          <div style={{width: 74, height: 74, borderRadius: '50%', background: 'linear-gradient(45deg,#F9CE34,#EE2A7B,#6228D7)'}} />
          <div style={{flex: 1, fontSize: 46, fontWeight: 800, color: typed ? X.ink : '#A0A2A8'}}>
            {typed || 'Add a comment...'}
            {!sent && Math.floor(t * 2.5) % 2 === 0 ? <span style={{color: X.blue}}>|</span> : null}
          </div>
          <div style={{width: 84, height: 84, borderRadius: '50%', background: sent ? X.blue : '#D9DAE0', display: 'flex', alignItems: 'center', justifyContent: 'center', scale: sent ? lerp(Math.min(tap, 1.2), 0.7, 1) : 1}}>
            <Glyph name="paper-plane-right" size={46} color="#fff" />
          </div>
        </div>
      </div>
      {t >= 48.16 ? (
        <div style={{position: 'absolute', left: 540, top: 470, translate: '-50% -50%', scale: Math.max(0, card), rotate: '-3deg'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 22, padding: '22px 32px', borderRadius: 30, background: X.ink, boxShadow: SHADOW}}>
            <Glyph name="file-text" size={70} color={YEL} />
            <div>
              <Px size={44} color={YEL}>FREE GUIDE</Px>
              <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 30, color: '#fff', marginTop: 6}}>Fat loss diet for a busy schedule</div>
            </div>
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

