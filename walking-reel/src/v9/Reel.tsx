import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, random, staticFile} from 'remotion';
import {Base, Footage, GradeOverlay, Subject, inWin} from '../series/core';
import {outAt} from '../series/timemap';
import {useT} from '../explainer/kit';
import {ANTON, Cursor, Ico, SevenSeg, chunkAt, popAt, vis} from '../series/kit2';
import {EASE_IN, EASE_IN_OUT, EASE_OUT, FPS, SANS, lerp, tween} from '../theme';
import {C, CARD, SPLIT, STEPS, TM9, v9Config as cfg} from './config';

const INK = '#141414';
const PAPER = '#EEEAE2';
const YEL = '#FFD60A';
const RED = '#FF3B30';
const MINT = '#22B573';
const BLUE = '#2F7BFF';
const GREY = '#B9B6AE';

// ---------------------------------------------------------------------------
// Split mode: 0 = she is full frame, 1 = she is in the bottom card
// ---------------------------------------------------------------------------
const MERGED = (() => {
  const ws = [...SPLIT].sort((a, b) => a.start - b.start).map((w) => ({...w}));
  const out: {start: number; end: number}[] = [];
  for (const w of ws) {
    const last = out[out.length - 1];
    if (last && Math.abs(last.end - w.start) < 0.05) last.end = w.end;
    else out.push(w);
  }
  return out;
})();
const splitAt = (t: number) => {
  for (const w of MERGED) if (t >= w.start - 0.01 && t < w.end + 0.5) return tween(t, w.start, 0.42, EASE_IN_OUT) * (1 - tween(t, w.end, 0.42, EASE_IN_OUT));
  return 0;
};

const HerFrame: React.FC<{p: number; children: React.ReactNode}> = ({p, children}) => {
  if (p <= 0.001) return <>{children}</>;
  const x = lerp(p, 0, CARD.x);
  const y = lerp(p, 0, CARD.y);
  const w = lerp(p, 1080, CARD.w);
  const h = lerp(p, 1920, CARD.h);
  const r = lerp(p, 0, CARD.r);
  const s = lerp(p, 1, CARD.s);
  // her face (source 540, 820) lands at 38% of the card height
  const ix = lerp(p, 0, CARD.x + CARD.w / 2 - 540 * CARD.s) - x;
  const iy = lerp(p, 0, CARD.y + CARD.h * 0.38 - 820 * CARD.s) - y;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: r, overflow: 'hidden', boxShadow: `0 30px 70px -20px rgba(0,0,0,${0.35 * p})`}}>
      <div style={{position: 'absolute', left: ix, top: iy, width: 1080, height: 1920, transformOrigin: '0 0', scale: s}}>{children}</div>
    </div>
  );
};

const Paper: React.FC = () => (
  <AbsoluteFill style={{background: PAPER}}>
    <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(20,20,20,0.11) 2.2px, transparent 2.6px)', backgroundSize: '36px 36px'}} />
  </AbsoluteFill>
);

/** White card on top in split mode; children use screen coordinates. */
const TopCard: React.FC<{p: number; children: React.ReactNode}> = ({p, children}) => {
  if (p <= 0.001) return null;
  return (
    <AbsoluteFill style={{translate: `0 ${lerp(p, -900, 0)}px`}}>
      <div style={{position: 'absolute', left: 36, top: 60, width: 1008, height: 790, borderRadius: 54, background: '#FFFFFF', boxShadow: '0 24px 60px -24px rgba(0,0,0,0.25)'}} />
      {children}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Small UI pieces
// ---------------------------------------------------------------------------
const A: React.FC<{size: number; color?: string; style?: React.CSSProperties; children: React.ReactNode}> = ({size, color = INK, style, children}) => (
  <div style={{fontFamily: ANTON, fontSize: size, lineHeight: 1, color, textTransform: 'uppercase', letterSpacing: size * 0.005, whiteSpace: 'nowrap', ...style}}>{children}</div>
);
const At: React.FC<{x: number; y: number; o?: number; s?: number; children: React.ReactNode; align?: 'center' | 'left'}> = ({x, y, o = 1, s = 1, children, align = 'center'}) =>
  o <= 0 ? null : (
    <div style={{position: 'absolute', left: x, top: y, translate: align === 'center' ? '-50% -50%' : '0 -50%', opacity: Math.min(1, o), scale: s, transformOrigin: align === 'center' ? 'center' : 'left center'}}>{children}</div>
  );
const Hi: React.FC<{p: number; color?: string; children: React.ReactNode}> = ({p, color = YEL, children}) => (
  <span style={{position: 'relative', display: 'inline-block', padding: '0 0.12em'}}>
    <span style={{position: 'absolute', left: 0, top: '8%', bottom: '4%', width: `${p * 100}%`, background: color, zIndex: 0}} />
    <span style={{position: 'relative', zIndex: 1}}>{children}</span>
  </span>
);
const Tag: React.FC<{text: string; bg?: string; fg?: string; size?: number; icon?: string}> = ({text, bg = INK, fg = '#fff', size = 34, icon}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: size * 0.35, padding: `${size * 0.32}px ${size * 0.7}px`, borderRadius: 999, background: bg, color: fg, fontFamily: SANS, fontWeight: 800, fontSize: size, letterSpacing: size * 0.08, whiteSpace: 'nowrap'}}>
    {icon ? <Ico name={icon} size={size * 1.1} color={fg} /> : null}
    {text}
  </div>
);

// ---------------------------------------------------------------------------
// HOOK: dark room, LCD scale climbing behind her, coach texts, then the question
// ---------------------------------------------------------------------------
const lcdValue = (t: number) => {
  if (t < 1.3) return '88.8';
  const roll = (a: number, b: number, t0: number, t1: number) => (a + Math.round((b - a) * 10 * tween(t, t0, t1 - t0, (x) => x)) / 10).toFixed(1);
  if (t < 3.08) return roll(61.9, 62.4, 1.44, 1.72);
  return roll(62.4, 62.9, 3.1, 3.82);
};
const HookBack: React.FC = () => {
  const t = useT();
  const w = C.hook;
  if (t >= w.end + 0.3) return null;
  const dark = 1 - tween(t, w.end - 0.1, 0.3);
  const lcdOut = tween(t, 5.1, 0.25, EASE_IN);
  const boot = t < 1.3 ? (Math.floor(t * 30) % 3 === 0 ? 0.35 : 1) : 1;
  const bump = Math.max(0, 1 - tween(t, 1.72, 0.3)) * (t >= 1.72 ? 1 : 0) + Math.max(0, 1 - tween(t, 3.82, 0.3)) * (t >= 3.82 ? 1 : 0);
  const k1 = tween(t, 5.14, 0.3, EASE_OUT);
  const k2 = tween(t, 6.66, 0.3, EASE_OUT);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(70% 45% at 50% 28%, rgba(60,8,6,0.9) 0%, rgba(8,8,10,0.94) 70%)', opacity: dark}} />
      {lcdOut < 1 ? (
        <div style={{position: 'absolute', left: 540, top: 330, translate: '-50% -50%', opacity: boot * (1 - lcdOut), scale: (1 + 0.04 * bump) * lerp(lcdOut, 1, 1.25)}}>
          <div style={{display: 'flex', alignItems: 'flex-end', gap: 22}}>
            <SevenSeg text={lcdValue(t)} h={330} on={RED} off="rgba(255,59,48,0.08)" glow="rgba(255,59,48,0.8)" />
            <A size={90} color={RED} style={{marginBottom: 6, textShadow: '0 0 20px rgba(255,59,48,0.7)'}}>kg</A>
          </div>
        </div>
      ) : null}
      {/* the question, behind her head */}
      {t >= 5.1 ? (
        <>
          <At x={540} y={250} o={k1 * dark} s={lerp(k1, 1.35, 1)}>
            <A size={150} color="#fff">ask what they</A>
          </At>
          <At x={540} y={430} o={k2 * dark} s={lerp(k2, 1.35, 1)}>
            <A size={150} color="#fff">
              checked <span style={{color: INK}}><Hi p={tween(t, 6.92, 0.25)}>first</Hi></span>
            </A>
          </At>
        </>
      ) : null}
    </AbsoluteFill>
  );
};
const Bubble: React.FC<{at: number; y: number; text: string; sub: string}> = ({at, y, text, sub}) => {
  const t = useT();
  if (t < at) return null;
  const p = popAt(t, at);
  return (
    <div style={{position: 'absolute', left: 540, top: y, translate: '-50% -50%', scale: lerp(Math.min(p, 1.1), 0.7, 1), opacity: Math.min(1, p * 2), display: 'flex', alignItems: 'center', gap: 22, padding: '22px 34px 22px 22px', borderRadius: 40, background: 'rgba(255,255,255,0.97)', boxShadow: '0 20px 50px rgba(0,0,0,0.45)', width: 860}}>
      <div style={{width: 92, height: 92, borderRadius: 46, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
        <Ico name="scissors" size={52} color={RED} />
      </div>
      <div style={{fontFamily: SANS}}>
        <div style={{fontSize: 28, fontWeight: 800, color: '#8A877F', letterSpacing: 1}}>COACH · now</div>
        <div style={{fontSize: 46, fontWeight: 800, color: INK, letterSpacing: -0.5, whiteSpace: 'nowrap'}}>{text}</div>
        <div style={{fontSize: 34, fontWeight: 700, color: RED, whiteSpace: 'nowrap'}}>{sub}</div>
      </div>
    </div>
  );
};
const HookFront: React.FC = () => {
  const t = useT();
  if (t < C.hook.start || t > 5.6) return null;
  const out = 1 - tween(t, 5.1, 0.3, EASE_IN);
  const up = tween(t, 3.08, 0.35, EASE_OUT);
  const chip = popAt(t, 1.74);
  return (
    <AbsoluteFill style={{opacity: out, translate: `0 ${lerp(1 - out, 0, 120)}px`}}>
      {t >= 1.74 ? (
        <div style={{position: 'absolute', left: 540, top: 560, translate: '-50% -50%', scale: Math.max(0, chip)}}>
          <Tag text={t < 3.82 ? '+0.5 KG' : '+1.0 KG'} bg={RED} size={44} />
        </div>
      ) : null}
      <AbsoluteFill style={{translate: `0 ${-175 * up}px`}}>
        <Bubble at={1.72} y={1240} text="Weight's up. Cutting 300 kcal." sub="from tomorrow" />
      </AbsoluteFill>
      <Bubble at={3.08} y={1240} text="Up again?! Cut 200 more." sub="after every heavier weigh-in" />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// STUDY: 42 women, +0.45 kg, mostly water
// ---------------------------------------------------------------------------
const PersonGrid: React.FC<{at: number; t: number}> = ({at, t}) => (
  <div style={{position: 'absolute', left: 530, top: 200, display: 'grid', gridTemplateColumns: 'repeat(7, 62px)', gap: '10px 6px'}}>
    {Array.from({length: 42}, (_, i) => {
      const s = at + (random(`p9${i}`) * 0.75);
      const p = popAt(t, s);
      return <Ico key={i} name="person" size={66} color={i % 7 === 3 ? RED : '#F28AB0'} style={{scale: Math.max(0, p), opacity: Math.min(1, p * 2)}} />;
    })}
  </div>
);
const Study: React.FC = () => {
  const t = useT();
  const w = C.study;
  const oA = vis(t, w.start + 0.15, 10.1);
  const oB = vis(t, 10.16, w.end - 0.25);
  const n = Math.round(42 * tween(t, 8.7, 0.6, (x) => x));
  const kg = (0.45 * tween(t, 10.92, 1.04, EASE_OUT)).toFixed(2);
  const water = tween(t, 15.6, 1.2, EASE_IN_OUT);
  return (
    <>
      {oA > 0 ? (
        <AbsoluteFill style={{opacity: oA}}>
          <At x={92} y={130} align="left">
            <Tag text="IN A STUDY OF" size={32} icon="magnifying-glass" />
          </At>
          {t >= 8.68 ? (
            <>
              <At x={92} y={430} align="left" s={lerp(Math.min(1, popAt(t, 8.7)), 0.8, 1)}>
                <A size={330}>{n}</A>
              </At>
              <At x={98} y={680} align="left">
                <A size={96}>women</A>
              </At>
              <PersonGrid at={8.74} t={t} />
            </>
          ) : null}
        </AbsoluteFill>
      ) : null}
      {oB > 0 ? (
        <AbsoluteFill style={{opacity: oB}}>
          <At x={92} y={130} align="left">
            <Tag text="DURING THEIR PERIOD" bg={RED} size={32} icon="drop" />
          </At>
          {t >= 10.6 ? (
            <At x={540} y={330} s={lerp(Math.min(1, popAt(t, 10.6)), 0.8, 1)}>
              <A size={220} color={RED}>+{kg} kg</A>
            </At>
          ) : null}
          {t >= 14.74 ? (
            <At x={540} y={480} o={tween(t, 14.74, 0.3)}>
              <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 40, color: '#8A877F', letterSpacing: 4}}>ON AVERAGE</div>
            </At>
          ) : null}
          {/* cycle strip */}
          <div style={{position: 'absolute', left: 92, top: 580, display: 'flex', gap: 12, opacity: tween(t, 12.96, 0.3)}}>
            {Array.from({length: 7}, (_, i) => {
              const red = i >= 2 && i <= 4;
              const p = popAt(t, 13.0 + i * 0.07);
              return (
                <div key={i} style={{width: 58, height: 150, borderRadius: 16, background: red ? 'rgba(255,59,48,0.14)' : '#F1EFEA', border: `3px solid ${red ? RED : '#E2DED6'}`, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 12, scale: Math.max(0, p)}}>
                  {red ? <Ico name="drop" size={40} color={RED} /> : null}
                </div>
              );
            })}
          </div>
          {/* water drop */}
          {t >= 15.44 ? (
            <div style={{position: 'absolute', left: 640, top: 560, display: 'flex', alignItems: 'center', gap: 24, opacity: tween(t, 15.44, 0.3), scale: lerp(Math.min(1, popAt(t, 15.44)), 0.8, 1)}}>
              <svg width={150} height={190} viewBox="0 0 100 126">
                <defs>
                  <clipPath id="drop9">
                    <path d="M50 4 C50 4 8 52 8 80 a42 42 0 0 0 84 0 C92 52 50 4 50 4Z" />
                  </clipPath>
                </defs>
                <path d="M50 4 C50 4 8 52 8 80 a42 42 0 0 0 84 0 C92 52 50 4 50 4Z" fill="#E7F0FF" />
                <g clipPath="url(#drop9)">
                  <path d={`M0 ${126 - water * 104} Q 25 ${120 - water * 104 + Math.sin(t * 6) * 5} 50 ${126 - water * 104} T 100 ${126 - water * 104} V126 H0Z`} fill={BLUE} />
                </g>
                <path d="M50 4 C50 4 8 52 8 80 a42 42 0 0 0 84 0 C92 52 50 4 50 4Z" fill="none" stroke={BLUE} strokeWidth={5} />
              </svg>
              <div>
                <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 32, color: '#8A877F', letterSpacing: 3}}>MOSTLY</div>
                <A size={100} color={BLUE}>water</A>
              </div>
            </div>
          ) : null}
        </AbsoluteFill>
      ) : null}
    </>
  );
};

// ---------------------------------------------------------------------------
// Weigh-in chart (one spike) and its trend line
// ---------------------------------------------------------------------------
const DAYS = [62.6, 62.3, 62.5, 62.1, 62.2, 61.9, 62.0, 61.8, 61.7, 62.7, 61.6, 61.5, 61.6, 61.3];
const CH = {x: 110, y: 260, w: 860, h: 470, lo: 61.0, hi: 63.0};
const cx = (i: number) => CH.x + (i / (DAYS.length - 1)) * CH.w;
const cy = (v: number) => CH.y + (1 - (v - CH.lo) / (CH.hi - CH.lo)) * CH.h;
const Chart: React.FC<{dotsAt: number; spikeAt?: number; trendAt?: number; o: number}> = ({dotsAt, spikeAt, trendAt, o}) => {
  const t = useT();
  if (o <= 0) return null;
  // 5-day moving average
  const avg = DAYS.map((_, i) => {
    const a = Math.max(0, i - 2);
    const b = Math.min(DAYS.length - 1, i + 2);
    const sl = DAYS.slice(a, b + 1);
    return sl.reduce((s, v) => s + v, 0) / sl.length;
  });
  const tp = trendAt !== undefined ? tween(t, trendAt, 0.9, EASE_IN_OUT) : 0;
  const path = avg.map((v, i) => `${i ? 'L' : 'M'}${cx(i)} ${cy(v)}`).join(' ');
  const spikeOn = spikeAt !== undefined && t >= spikeAt;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        {[0, 1, 2, 3].map((k) => (
          <line key={k} x1={CH.x - 20} x2={CH.x + CH.w + 20} y1={CH.y + (k * CH.h) / 3} y2={CH.y + (k * CH.h) / 3} stroke="#EEEBE5" strokeWidth={3} />
        ))}
        {tp > 0 ? <path d={path} fill="none" stroke={MINT} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - tp} /> : null}
        {DAYS.map((v, i) => {
          const p = popAt(t, dotsAt + i * 0.05);
          const spike = i === 9;
          const col = spike && spikeOn ? RED : spike && trendAt !== undefined ? GREY : INK;
          return <circle key={i} cx={cx(i)} cy={cy(v)} r={15 * Math.max(0, p)} fill={tp > 0 && !spike ? '#8A877F' : col} />;
        })}
        {spikeOn ? <circle cx={cx(9)} cy={cy(DAYS[9])} r={lerp(tween(t, spikeAt!, 0.35), 70, 42)} fill="none" stroke={RED} strokeWidth={7} opacity={tween(t, spikeAt!, 0.2)} /> : null}
      </svg>
      {spikeOn ? (
        <At x={cx(9) - 190} y={cy(DAYS[9])} s={Math.max(0, popAt(t, spikeAt! + 0.1))}>
          <Tag text="1 READING" bg={RED} size={32} />
        </At>
      ) : null}
    </AbsoluteFill>
  );
};
const Single: React.FC = () => {
  const t = useT();
  const w = C.single;
  const o = vis(t, w.start + 0.1, w.end - 0.25);
  if (o <= 0) return null;
  const mis = popAt(t, 19.84);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <At x={92} y={130} align="left">
        <Tag text="DAILY WEIGH-INS" size={32} icon="scales" />
      </At>
      <Chart dotsAt={w.start + 0.15} spikeAt={18.56} o={1} />
      {t >= 19.84 ? (
        <At x={540} y={790} s={Math.max(0, mis)}>
          <div style={{border: `6px solid ${RED}`, borderRadius: 18, padding: '8px 22px'}}>
            <A size={64} color={RED}>misleading</A>
          </div>
        </At>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// REVIEW heading (full frame, behind her head)
// ---------------------------------------------------------------------------
const TopWash: React.FC<{o: number}> = ({o}) => (o <= 0 ? null : <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(244,241,235,0.96) 0%, rgba(244,241,235,0.9) 26%, rgba(244,241,235,0) 40%)', opacity: o}} />);
const Review: React.FC = () => {
  const t = useT();
  const w = C.review;
  const o = vis(t, w.start, w.end - 0.2);
  if (o <= 0) return null;
  const k1 = popAt(t, 21.06);
  const k2 = popAt(t, 21.4);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <TopWash o={1} />
      <At x={540} y={170} s={lerp(Math.min(1, k1), 0.85, 1)} o={k1}>
        <A size={84}>before you</A>
      </At>
      <At x={540} y={300} s={lerp(Math.min(1, k2), 0.85, 1)} o={k2}>
        <A size={150}>
          <Hi p={tween(t, 21.5, 0.3)}>change</Hi> the plan
        </A>
      </At>
      {t >= 22.68 ? (
        <At x={540} y={470} s={Math.max(0, popAt(t, 22.68))}>
          <Tag text="HERE'S WHAT I'D REVIEW" size={44} icon="magnifying-glass" />
        </At>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// CHECKLIST (split)
// ---------------------------------------------------------------------------
const stepIdx = (t: number) => {
  let k = -1;
  STEPS.forEach((s, i) => (t >= s.at - 0.05 ? (k = i) : null));
  return k;
};
const Tile: React.FC<{at: number; icon: string; label: string; x: number; y: number; w?: number; color?: string}> = ({at, icon, label, x, y, w = 210, color = INK}) => {
  const t = useT();
  if (t < at) return null;
  const p = popAt(t, at);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: 250, translate: '-50% -50%', borderRadius: 34, background: '#F5F3EF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, scale: Math.max(0, p)}}>
      <Ico name={icon} size={96} color={color} />
      <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 30, color: INK, letterSpacing: 1.5, textAlign: 'center', lineHeight: 1.1}}>{label}</div>
    </div>
  );
};
const Checklist: React.FC = () => {
  const t = useT();
  const w = C.check;
  const o = vis(t, w.start + 0.1, w.end - 0.25);
  if (o <= 0) return null;
  const k = stepIdx(t);
  const sv = (i: number) => (i === k ? tween(t, STEPS[i].at, 0.3) : 0);
  // cycle marker
  const ang = lerp(tween(t, 29.1, 1.45, EASE_OUT), -90, -90 + 360 * 0.55 + 360);
  return (
    <AbsoluteFill style={{opacity: o}}>
      {/* step chips */}
      <div style={{position: 'absolute', left: 64, right: 64, top: 96, display: 'flex', gap: 12}}>
        {STEPS.map((s, i) => {
          const on = i === k;
          const done = i < k;
          return (
            <div key={i} style={{flex: 1, height: 74, borderRadius: 22, background: on ? YEL : done ? INK : '#F1EFEA', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, scale: on ? lerp(tween(t, s.at, 0.3), 0.9, 1) : 1}}>
              {done ? <Ico name="check-circle" size={34} color={MINT} /> : <span style={{fontFamily: ANTON, fontSize: 34, color: on ? INK : GREY}}>{i + 1}</span>}
              <span style={{fontFamily: ANTON, fontSize: s.label.length > 6 ? 30 : 34, color: done ? '#fff' : on ? INK : GREY, letterSpacing: 0.5}}>{s.label}</span>
            </div>
          );
        })}
      </div>
      {/* 1: trend */}
      {k === 0 ? (
        <AbsoluteFill style={{opacity: sv(0)}}>
          <Chart dotsAt={STEPS[0].at - 0.5} trendAt={24.66} o={1} />
          {t >= 25.24 ? (
            <At x={760} y={250} s={Math.max(0, popAt(t, 25.24))}>
              <Tag text="TREND IMPROVING?" bg={MINT} size={36} icon="chart-line-down" />
            </At>
          ) : null}
        </AbsoluteFill>
      ) : null}
      {/* 2: conditions */}
      {k === 1 ? (
        <AbsoluteFill style={{opacity: sv(1)}}>
          <At x={540} y={270}>
            <A size={86}>similar conditions?</A>
          </At>
          <Tile at={26.66} icon="clock" label="SAME TIME" x={250} y={540} w={260} />
          <Tile at={27.48} icon="scales" label="SAME SCALE" x={540} y={540} w={260} />
          <Tile at={27.96} icon="fork-knife" label="BEFORE FOOD" x={830} y={540} w={260} />
        </AbsoluteFill>
      ) : null}
      {/* 3: cycle */}
      {k === 2 ? (
        <AbsoluteFill style={{opacity: sv(2)}}>
          <svg width={1080} height={900} style={{position: 'absolute', left: 0, top: 0}}>
            {Array.from({length: 28}, (_, i) => {
              const a = ((i / 28) * 360 - 90) * (Math.PI / 180);
              const red = i < 5;
              const p = tween(t, STEPS[2].at + i * 0.015, 0.2);
              return <line key={i} x1={540 + Math.cos(a) * 190} y1={500 + Math.sin(a) * 190} x2={540 + Math.cos(a) * (190 + 46 * p)} y2={500 + Math.sin(a) * (190 + 46 * p)} stroke={red ? RED : '#D9D5CC'} strokeWidth={14} strokeLinecap="round" />;
            })}
            <circle cx={540 + Math.cos((ang * Math.PI) / 180) * 280} cy={500 + Math.sin((ang * Math.PI) / 180) * 280} r={26} fill={INK} />
          </svg>
          <At x={540} y={470}>
            <A size={84}>your</A>
          </At>
          <At x={540} y={555}>
            <A size={84}>cycle</A>
          </At>
          <At x={200} y={250} o={tween(t, 29.5, 0.3)}>
            <Tag text="PERIOD" bg={RED} size={30} icon="drop" />
          </At>
          <At x={260} y={770} o={tween(t, 30.4, 0.3)}>
            <Tag text="YOU ARE HERE" size={28} />
          </At>
        </AbsoluteFill>
      ) : null}
      {/* 4: changes */}
      {k === 3 ? (
        <AbsoluteFill style={{opacity: sv(3)}}>
          <At x={540} y={270}>
            <A size={86}>any changes?</A>
          </At>
          <Tile at={33.18} icon="airplane-tilt" label="TRAVEL" x={185} y={540} />
          <Tile at={34.06} icon="spiral" label="DIGESTION" x={420} y={540} />
          <Tile at={34.9} icon="bowl-food" label="FOOD ROUTINE" x={655} y={540} />
          <Tile at={35.84} icon="barbell" label="TRAINING" x={890} y={540} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// REALISTIC? (full frame, behind her head)
// ---------------------------------------------------------------------------
const Real: React.FC = () => {
  const t = useT();
  const w = C.real;
  const o = vis(t, w.start, w.end - 0.2);
  if (o <= 0) return null;
  const k1 = popAt(t, 37.52);
  const k2 = popAt(t, 39.22);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <TopWash o={1} />
      <At x={540} y={170} o={k1} s={lerp(Math.min(1, k1), 0.85, 1)}>
        <A size={84}>was the plan</A>
      </At>
      {t >= 39.2 ? (
        <At x={540} y={320} s={lerp(Math.min(1, k2), 0.8, 1)}>
          <A size={190}>
            <Hi p={tween(t, 39.4, 0.35)}>realistic?</Hi>
          </A>
        </At>
      ) : null}
      {t >= 40.52 ? (
        <At x={190} y={540} s={Math.max(0, popAt(t, 40.52))}>
          <Tag text="FOLLOWABLE" bg={MINT} size={34} icon="check-circle" />
        </At>
      ) : null}
      {t >= 40.96 ? (
        <At x={900} y={540} s={Math.max(0, popAt(t, 40.96))}>
          <Tag text="TOO HARD" bg={RED} size={34} icon="x-circle" />
        </At>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// VS: followed plan vs a plan that falls apart (split)
// ---------------------------------------------------------------------------
const Vs: React.FC = () => {
  const t = useT();
  const w = C.vs;
  const o = vis(t, w.start + 0.1, w.end - 0.25);
  if (o <= 0) return null;
  const fall = t >= 49.86 ? t - 49.86 : 0;
  const wob = t >= 49.22 && t < 49.86 ? Math.sin((t - 49.22) * 40) * 6 * tween(t, 49.22, 0.3) : 0;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: 540, top: 120, bottom: 1920 - 820, width: 4, background: '#EEEBE5'}} />
      {t >= 42.22 ? (
        <At x={540} y={455} s={Math.max(0, popAt(t, 42.22))}>
          <div style={{width: 120, height: 120, borderRadius: 60, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <A size={58} color={YEL}>vs</A>
          </div>
        </At>
      ) : null}
      {/* left: followed */}
      {t >= 43.78 ? (
        <>
          <At x={290} y={140} s={Math.max(0, popAt(t, 43.78))}>
            <Tag text="FOLLOWED" bg={MINT} size={36} icon="check-circle" />
          </At>
          <div style={{position: 'absolute', left: 100, top: 250, display: 'grid', gridTemplateColumns: 'repeat(5, 64px)', gap: 12}}>
            {Array.from({length: 20}, (_, i) => {
              const p = popAt(t, 44.0 + i * 0.05);
              return (
                <div key={i} style={{width: 64, height: 64, borderRadius: 16, background: 'rgba(34,181,115,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', scale: Math.max(0, p)}}>
                  <Ico name="check-circle" size={44} color={MINT} />
                </div>
              );
            })}
          </div>
          {t >= 45.88 ? (
            <At x={290} y={720} s={Math.max(0, popAt(t, 45.88))}>
              <Tag text="JUST ADJUST" size={34} icon="sliders-horizontal" />
            </At>
          ) : null}
        </>
      ) : null}
      {/* right: too hard */}
      {t >= 47.44 ? (
        <>
          <At x={790} y={140} s={Math.max(0, popAt(t, 47.44))}>
            <Tag text="TOO HARD" bg={RED} size={36} icon="x-circle" />
          </At>
          {Array.from({length: 6}, (_, i) => {
            const p = tween(t, 47.6 + i * 0.16, 0.25, EASE_OUT);
            if (p <= 0) return null;
            const dir = random(`blk${i}`) - 0.5;
            const fy = fall > 0 ? 900 * fall * fall * (0.8 + i * 0.12) : 0;
            const fx = fall > 0 ? dir * 500 * fall : 0;
            const rot = fall > 0 ? dir * 30 * Math.min(1, fall * 2) : 0;
            return (
              <div key={i} style={{position: 'absolute', left: 790 + (i % 2 ? 18 : -18) + fx + wob * (i + 1) * 0.5, top: 660 - i * 74 - lerp(p, 160, 0) + fy, width: 220, height: 66, translate: '-50% -50%', rotate: `${rot}deg`, borderRadius: 12, background: i % 2 ? '#FF8A80' : RED, opacity: p * (1 - tween(t, 50.3, 0.4)), boxShadow: 'inset 0 -6px 0 rgba(0,0,0,0.12)'}} />
            );
          })}
          {t >= 50.2 ? (
            <At x={790} y={720} s={Math.max(0, popAt(t, 50.2))}>
              <Tag text="FALLS APART" bg={INK} size={34} />
            </At>
          ) : null}
        </>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// MEASURED CHANGE + GIVE IT TIME (split)
// ---------------------------------------------------------------------------
const Measured: React.FC = () => {
  const t = useT();
  const w = C.measured;
  const o = vis(t, w.start + 0.1, w.end - 0.25);
  if (o <= 0) return null;
  const notch = tween(t, 55.2, 0.4, EASE_OUT);
  const flip = tween(t, 56.3, 0.6, EASE_IN_OUT);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <At x={540} y={150} o={tween(t, 51.76, 0.3)}>
        <A size={70}>
          if the pattern says <Hi p={tween(t, 53.04, 0.3)}>adjust</Hi>
        </A>
      </At>
      {/* dial */}
      <div style={{position: 'absolute', left: 300, top: 470, translate: '-50% -50%', opacity: tween(t, 54.46, 0.3)}}>
        <svg width={320} height={320} viewBox="-160 -160 320 320">
          {Array.from({length: 12}, (_, i) => {
            const a = ((i * 30 - 90) * Math.PI) / 180;
            return <line key={i} x1={Math.cos(a) * 130} y1={Math.sin(a) * 130} x2={Math.cos(a) * 152} y2={Math.sin(a) * 152} stroke={i === 1 ? MINT : '#D9D5CC'} strokeWidth={10} strokeLinecap="round" />;
          })}
          <circle r={110} fill={INK} />
          <g style={{rotate: `${notch * 30}deg`}}>
            <line x1={0} y1={-20} x2={0} y2={-88} stroke={YEL} strokeWidth={16} strokeLinecap="round" />
          </g>
        </svg>
      </div>
      {t >= 55.16 ? (
        <At x={300} y={720} s={Math.max(0, popAt(t, 55.16))}>
          <Tag text="ONE MEASURED CHANGE" size={30} />
        </At>
      ) : null}
      {/* hourglass */}
      {t >= 55.94 ? (
        <>
          <div style={{position: 'absolute', left: 790, top: 470, translate: '-50% -50%', rotate: `${flip * 180}deg`, scale: Math.max(0, popAt(t, 55.94))}}>
            <Ico name="hourglass-medium" size={250} color={BLUE} />
          </div>
          <At x={790} y={720} s={Math.max(0, popAt(t, 56.3))}>
            <Tag text="GIVE IT TIME" bg={BLUE} size={30} icon="clock" />
          </At>
        </>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// MONTAGE: calories, cardio, workouts -> all at once -> what helped?
// ---------------------------------------------------------------------------
const CLIPS = [
  {src: 'b_eat.mp4', label: 'CALORIES', at: 58.4},
  {src: 'b_tread.mp4', label: 'CARDIO', at: 59.18},
  {src: 'b_db.mp4', label: 'WORKOUTS', at: 59.82},
];
const ALL = 60.28;
const Montage: React.FC = () => {
  const t = useT();
  const w = C.montage;
  if (t < w.start || t >= w.end) return null;
  const from = Math.round(outAt(TM9, w.start) * FPS);
  const dur = Math.round(outAt(TM9, w.end) * FPS) - from;
  const split = tween(t, ALL, 0.45, EASE_IN_OUT);
  const cur = t < CLIPS[1].at ? 0 : t < CLIPS[2].at ? 1 : 2;
  return (
    <AbsoluteFill style={{background: INK}}>
      {CLIPS.map((c, i) => {
        // single clip full screen before ALL; afterwards three columns
        const full = t < ALL ? (i === cur ? 1 : 0) : 0;
        if (t < ALL && !full) return null;
        const left = lerp(split, 0, i * 360);
        const width = lerp(split, 1080, 360);
        return (
          <div key={i} style={{position: 'absolute', left: t < ALL ? 0 : left + (i ? 4 : 0), top: 0, width: t < ALL ? 1080 : width - (i ? 4 : 0), height: 1920, overflow: 'hidden'}}>
            <Sequence from={from} durationInFrames={dur} layout="none">
              <OffthreadVideo src={staticFile(`v9/${c.src}`)} muted style={{position: 'absolute', left: '50%', top: 0, width: 1080, height: 1920, translate: '-50% 0', scale: lerp(tween(t, c.at, 0.4), 1.08, 1)}} />
            </Sequence>
            <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0) 30%)'}} />
            <div style={{position: 'absolute', left: 0, right: 0, top: t < ALL ? 220 : 170, textAlign: 'center'}}>
              <A size={t < ALL ? 170 : 74} color="#fff" style={{display: 'inline-block', scale: lerp(Math.min(1, popAt(t, t < ALL ? c.at : ALL)), 0.8, 1), textShadow: '0 6px 24px rgba(0,0,0,0.5)'}}>
                {c.label}
              </A>
            </div>
            {t >= 62.4 + i * 0.25 ? (
              <div style={{position: 'absolute', left: '50%', top: 900, translate: '-50% -50%', scale: Math.max(0, popAt(t, 62.4 + i * 0.25))}}>
                <A size={260} color={YEL} style={{textShadow: '0 10px 30px rgba(0,0,0,0.5)'}}>?</A>
              </div>
            ) : null}
          </div>
        );
      })}
      {t >= ALL ? (
        <At x={540} y={560} s={lerp(Math.min(1, popAt(t, ALL + 0.05)), 1.4, 1)} o={1 - tween(t, 62.2, 0.25)}>
          <div style={{background: RED, padding: '10px 34px 14px', borderRadius: 16}}>
            <A size={120} color="#fff">all at once</A>
          </div>
        </At>
      ) : null}
      {t >= 62.2 ? (
        <At x={540} y={560} s={lerp(Math.min(1, popAt(t, 62.2)), 1.3, 1)}>
          <div style={{background: YEL, padding: '10px 34px 14px', borderRadius: 16}}>
            <A size={110}>what helped?</A>
          </div>
        </At>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// DECISION: a check-in dialog, the cursor clicks KEEP
// ---------------------------------------------------------------------------
const CLICK = 69.56;
const Decide: React.FC = () => {
  const t = useT();
  const w = C.decide;
  const o = vis(t, w.start, w.end - 0.2);
  if (o <= 0) return null;
  const card = popAt(t, 64.36);
  const btn = tween(t, 67.6, 0.3);
  // cursor path: in from bottom right, hovers CHANGE, then KEEP
  const p1 = tween(t, 67.9, 0.55, EASE_IN_OUT);
  const p2 = tween(t, 68.9, 0.5, EASE_IN_OUT);
  const cxp = lerp(p2, lerp(p1, 980, 330), 750);
  const cyp = lerp(p2, lerp(p1, 760, 455), 455);
  const kept = t >= CLICK;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <TopWash o={1} />
      <div style={{position: 'absolute', left: 90, top: 120, width: 900, height: 430, borderRadius: 44, background: '#fff', boxShadow: '0 30px 70px -25px rgba(0,0,0,0.35)', scale: lerp(Math.min(1, card), 0.85, 1), opacity: Math.min(1, card * 2)}}>
        <div style={{position: 'absolute', left: 50, top: 40, fontFamily: SANS, fontWeight: 800, fontSize: 30, color: '#8A877F', letterSpacing: 4}}>CHECK-IN</div>
        <div style={{position: 'absolute', left: 50, top: 86}}>
          <A size={96}>
            reasoned <Hi p={tween(t, 66.28, 0.3)}>decision</Hi>
          </A>
        </div>
        <div style={{position: 'absolute', left: 50, right: 50, top: 260, display: 'flex', gap: 24, opacity: btn}}>
          <div style={{flex: 1, height: 130, borderRadius: 28, border: `5px solid ${kept ? '#E2DED6' : INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: kept ? 0.45 : 1}}>
            <A size={52}>change plan</A>
          </div>
          <div style={{flex: 1, height: 130, borderRadius: 28, background: kept ? MINT : INK, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, scale: kept ? lerp(tween(t, CLICK, 0.3), 0.92, 1) : 1}}>
            {kept ? <Ico name="check-circle" size={52} color="#fff" /> : null}
            <A size={52} color="#fff">keep it same</A>
          </div>
        </div>
      </div>
      {t >= 71.06 ? (
        <At x={750} y={590} s={Math.max(0, popAt(t, 71.06))}>
          <Tag text="FOR NOW" bg={YEL} fg={INK} size={34} icon="pause" />
        </At>
      ) : null}
      {t >= 67.9 && t < w.end ? <Cursor x={cxp} y={cyp} click={CLICK} t={t} size={84} /> : null}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// CTA
// ---------------------------------------------------------------------------
const Cta: React.FC = () => {
  const t = useT();
  const w = C.cta;
  if (t < w.start) return null;
  const k1 = popAt(t, 72.14);
  const k2 = popAt(t, 72.38);
  const pdf = tween(t, 73.56, 0.45, EASE_OUT);
  return (
    <AbsoluteFill>
      <TopWash o={tween(t, w.start, 0.3)} />
      <At x={540} y={160} o={k1} s={lerp(Math.min(1, k1), 0.8, 1)}>
        <A size={100}>comment</A>
      </At>
      {t >= 72.38 ? (
        <At x={540} y={320} s={lerp(Math.min(1, k2), 1.3, 1)}>
          <div style={{background: YEL, borderRadius: 28, padding: '6px 40px 14px', boxShadow: '0 16px 40px -14px rgba(0,0,0,0.35)'}}>
            <A size={170}>guide</A>
          </div>
        </At>
      ) : null}
      {pdf > 0 ? (
        <div style={{position: 'absolute', left: lerp(pdf, 1200, 540), top: 500, translate: '-50% -50%', display: 'flex', alignItems: 'center', gap: 20, padding: '20px 34px 20px 20px', borderRadius: 30, background: '#fff', boxShadow: '0 20px 50px -18px rgba(0,0,0,0.4)'}}>
          <div style={{width: 84, height: 84, borderRadius: 20, background: RED, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Ico name="file-pdf" size={56} color="#fff" />
          </div>
          <div style={{fontFamily: SANS}}>
            <div style={{fontSize: 40, fontWeight: 800, color: INK, whiteSpace: 'nowrap'}}>Free Fat Loss Guide</div>
            <div style={{fontSize: 28, fontWeight: 700, color: '#8A877F'}}>sent to your DMs</div>
          </div>
          <Ico name="paper-plane-right" size={50} color={BLUE} />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Captions: condensed caps, 2-3 words, spoken word in yellow
// ---------------------------------------------------------------------------
const NO_CAPS = [{start: 5.1, end: C.hook.end}, C.review];
const Caps: React.FC<{p: number}> = ({p}) => {
  const t = useT();
  if (inWin(t, NO_CAPS)) return null;
  const chunk = chunkAt(cfg.captions, t);
  if (!chunk) return null;
  const k = tween(t, chunk[0].start - 0.04, 0.12);
  const montage = inWin(t, [C.montage]);
  const y = montage ? 1560 : lerp(p, inWin(t, [C.hook]) ? 1560 : 1500, 1700);
  return (
    <div style={{position: 'absolute', left: 50, right: 50, top: y, translate: `0 ${-50 + lerp(k, 8, 0)}%`, textAlign: 'center', opacity: k}}>
      {chunk.map((w, i) => {
        const nextStart = chunk[i + 1]?.start ?? w.end + 0.3;
        const on = t >= w.start - 0.03 && t < nextStart;
        return (
          <span key={i} style={{display: 'inline-block', margin: '0 0.14em', fontFamily: ANTON, fontSize: 92, lineHeight: 1.05, textTransform: 'uppercase', color: on ? YEL : '#fff', WebkitTextStroke: `14px ${INK}`, paintOrder: 'stroke fill', scale: on ? 1.06 : 1, textShadow: '0 8px 20px rgba(0,0,0,0.35)'}}>
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
  const p = splitAt(t);
  return (
    <>
      {p > 0 ? <Paper /> : null}
      <TopCard p={p}>
        <Study />
        <Single />
        <Checklist />
        <Vs />
        <Measured />
      </TopCard>
      <HerFrame p={p}>
        <Footage cfg={cfg} />
        <HookBack />
        <Review />
        <Real />
        <Decide />
        <Cta />
        <Subject cfg={cfg} />
        <GradeOverlay cfg={cfg} />
      </HerFrame>
      <HookFront />
      <Montage />
      <Caps p={p} />
    </>
  );
};

export const V9Reel: React.FC = () => (
  <Base cfg={{...cfg, shakes: [5.14, 49.86, 60.3]}}>
    <Scene />
  </Base>
);

