import React from 'react';
import {AbsoluteFill, getInputProps} from 'remotion';
import {Base, Footage, GradeOverlay, Subject} from '../series/core';
import {useT} from '../explainer/kit';
import {Ico, SevenSeg, popAt} from '../series/kit2';
import {CARD_SHADOW, Card, H, HL, Hi, INK, Kicker, MUTED, PAPER, PillCaps, Pop, Tag, TopWash, winVis} from '../series/kit3';
import {EASE_IN, EASE_IN_OUT, EASE_OUT, SANS, lerp, tween} from '../theme';
import {C, v11Config as cfg} from './config';

/**
 * Rice / water weight, in the batch look (her room, soft white wash, white cards, dark-pill captions).
 * Signature: a bathroom scale whose display reacts to the story, and a glycogen "sponge" that holds
 * water - squeezed, the drops run out and the scale falls; refilled, it rises again (water, not fat).
 * The scale spells GUIDE at the end. Times are source seconds.
 */
const RED = '#E5484D';
const GREEN = '#17A34A';
const WATER = '#3BA3F5';
const SPONGE_D = '#E9B800';

// ---------------------------------------------------------------------------
// Signature 1: the bathroom scale
// ---------------------------------------------------------------------------
const Scale: React.FC<{text: string; size?: number; blink?: boolean}> = ({text, size = 360, blink}) => {
  const t = useT();
  const on = blink && Math.floor(t * 4) % 2 === 1 ? 'rgba(255,214,10,0.25)' : HL;
  return (
    <div style={{position: 'relative', width: size, height: size, borderRadius: size * 0.16, background: 'linear-gradient(160deg, #FFFFFF, #ECEAE5)', boxShadow: `${CARD_SHADOW}, inset 0 0 0 ${size * 0.02}px #DCD8D0`}}>
      <div style={{position: 'absolute', left: size * 0.14, top: size * 0.1, width: size * 0.72, height: size * 0.3, borderRadius: size * 0.05, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.5)'}}>
        <SevenSeg text={text} h={size * 0.17} on={on} off="rgba(255,255,255,0.06)" glow="rgba(255,214,10,0.5)" />
      </div>
      {[0.27, 0.73].map((x, i) => (
        <div key={i} style={{position: 'absolute', left: size * x - size * 0.12, top: size * 0.52, width: size * 0.24, height: size * 0.36, borderRadius: size * 0.1, background: '#E2DED6'}} />
      ))}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: size * 0.04, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: size * 0.05, letterSpacing: 4, color: '#B8B2A8'}}>KG</div>
    </div>
  );
};
const fmt = (v: number) => v.toFixed(1);
/** Number rolling from a to b between t0 and t0+d (display flicker while it moves). */
const roll = (t: number, t0: number, d: number, a: number, b: number) => a + (b - a) * tween(t, t0, d, EASE_OUT);

// ---------------------------------------------------------------------------
// Signature 2: the glycogen sponge
// ---------------------------------------------------------------------------
const HOLES = [
  [0.14, 0.3, 0.07], [0.33, 0.62, 0.09], [0.52, 0.28, 0.06], [0.7, 0.58, 0.08], [0.86, 0.3, 0.05], [0.22, 0.78, 0.05], [0.62, 0.82, 0.05], [0.44, 0.48, 0.04], [0.8, 0.82, 0.04],
];
/** wet 0..1 = water held; squeeze 0..1 = squashed. */
const Sponge: React.FC<{w: number; h: number; wet: number; squeeze?: number}> = ({w, h, wet, squeeze = 0}) => (
  <div style={{position: 'relative', width: w, height: h, scale: `${1 + squeeze * 0.1} ${1 - squeeze * 0.3}`, transformOrigin: 'center bottom'}}>
    <div style={{position: 'absolute', inset: 0, borderRadius: h * 0.22, background: HL, boxShadow: CARD_SHADOW, overflow: 'hidden'}}>
      {HOLES.map(([x, y, r], i) => (
        <div key={i} style={{position: 'absolute', left: x * w - r * w, top: y * h - r * w, width: r * w * 2, height: r * w * 2, borderRadius: '50%', background: SPONGE_D, overflow: 'hidden'}}>
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: `${wet * 100}%`, background: WATER}} />
        </div>
      ))}
      <div style={{position: 'absolute', inset: 0, background: `linear-gradient(180deg, rgba(59,163,245,${0.28 * wet}), rgba(59,163,245,${0.12 * wet}))`}} />
    </div>
  </div>
);
const Drop: React.FC<{s: number; color?: string}> = ({s, color = WATER}) => (
  <svg width={s} height={s * 1.35} viewBox="0 0 20 27">
    <path d="M10 0 C 10 0, 0 12, 0 17 A 10 10 0 0 0 20 17 C 20 12, 10 0, 10 0 Z" fill={color} />
    <ellipse cx={6.5} cy={17} rx={2.2} ry={3.4} fill="rgba(255,255,255,0.55)" />
  </svg>
);
/** Drops falling from (x, y) - each spawned at its own time, falls and fades. */
const Falling: React.FC<{t: number; at: number; n: number; x: number; y: number; spread: number; up?: boolean}> = ({t, at, n, x, y, spread, up}) => (
  <>
    {Array.from({length: n}, (_, i) => {
      const t0 = at + i * 0.12;
      const k = (t - t0) / 0.7;
      if (k < 0 || k > 1) return null;
      const dx = ((i * 37) % 100) / 100 - 0.5;
      const fy = up ? lerp(k, 170, 0) : lerp(k * k, 0, 170);
      return (
        <div key={i} style={{position: 'absolute', left: x + dx * spread - 11, top: y + fy, opacity: up ? Math.min(1, k * 3) * (1 - Math.max(0, k - 0.85) * 6) : 1 - Math.max(0, k - 0.6) * 2.5}}>
          <Drop s={22} />
        </div>
      );
    })}
  </>
);

// ---------------------------------------------------------------------------
// Scenes
// ---------------------------------------------------------------------------
const Hook: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.hook, 0.01);
  if (o <= 0) return null;
  const v = roll(t, 4.5, 0.9, 72.4, 70.6);
  const moving = t > 4.5 && t < 5.4;
  const q = t >= 9.52;
  const party = Math.max(0, t - 5.72);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pop x={540} y={300} at={1.0}>
        <div style={{position: 'relative'}}>
          <Scale text={q ? '--.-' : moving ? fmt(v + (Math.floor(t * 30) % 3) * 0.1) : fmt(v)} blink={q} />
          {t >= 5.2 && !q ? (
            <div style={{position: 'absolute', left: 300, top: -14, scale: Math.min(1, popAt(t, 5.2))}}>
              <Tag bg={GREEN} size={34}>
                ▼ 1.8 kg
              </Tag>
            </div>
          ) : null}
          {party > 0 && party < 1.8 && !q
            ? Array.from({length: 18}, (_, i) => {
                const a = (i / 18) * Math.PI * 2;
                const r = 120 + party * 160;
                return <div key={i} style={{position: 'absolute', left: 180 + Math.cos(a) * r - 7, top: 180 + Math.sin(a) * r * 0.8 + party * party * 60 - 7, width: 14, height: 14, borderRadius: 3, background: i % 3 === 0 ? HL : i % 3 === 1 ? INK : GREEN, opacity: 1 - party / 1.8}} />;
              })
            : null}
        </div>
      </Pop>
    </AbsoluteFill>
  );
};
const Bowl: React.FC<{s?: number}> = ({s = 1}) => (
  <svg width={220 * s} height={150 * s} viewBox="0 0 220 150">
    <ellipse cx={110} cy={58} rx={92} ry={44} fill="#FFFFFF" />
    {Array.from({length: 26}, (_, i) => (
      <ellipse key={i} cx={40 + ((i * 53) % 140)} cy={34 + ((i * 29) % 40)} rx={6} ry={3} fill="#E9E4D8" />
    ))}
    <path d="M10 66 Q 110 72 210 66 Q 200 140 110 142 Q 20 140 10 66 Z" fill={INK} />
    <path d="M10 66 Q 110 72 210 66" stroke="#3A3A3A" strokeWidth={6} fill="none" />
  </svg>
);
const Rice: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.rice);
  if (o <= 0) return null;
  const phase2 = tween(t, 14.4, 0.3);
  const cross = tween(t, 11.64, 0.35, EASE_OUT);
  const v = roll(t, 12.8, 0.8, 70.6, 69.1);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pop x={540} y={300} at={10.8}>
        <Card w={900} h={400} pad={30}>
          {phase2 < 1 ? (
            <div style={{position: 'absolute', inset: 30, display: 'flex', alignItems: 'center', justifyContent: 'space-around', opacity: 1 - phase2}}>
              <div style={{position: 'relative'}}>
                <Bowl />
                <svg width={220} height={150} style={{position: 'absolute', left: 0, top: 0}}>
                  <line x1={30} y1={20} x2={190} y2={140} stroke={RED} strokeWidth={14} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - cross} />
                </svg>
                <div style={{textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 30, marginTop: 8}}>No Rice</div>
              </div>
              <Ico name="arrow-right" size={64} color={MUTED} />
              <Scale text={fmt(v)} size={250} />
            </div>
          ) : null}
          {phase2 > 0 ? (
            <div style={{position: 'absolute', inset: 30, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 34, opacity: phase2, translate: `0 ${lerp(phase2, 20, 0)}px`}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 26}}>
                <Bowl s={0.7} />
                <svg width={170} height={40}>
                  <line x1={10} y1={20} x2={150} y2={20} stroke={INK} strokeWidth={8} strokeDasharray="6 14" strokeLinecap="round" />
                  <path d="M150 6 L 166 20 L 150 34" fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" />
                </svg>
                <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '14px 22px', borderRadius: 20, background: PAPER}}>
                  <Ico name="fire" size={50} color={INK} />
                  <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 40}}>Fat Loss</span>
                </div>
              </div>
              {t >= 15.3 ? (
                <div style={{scale: lerp(Math.min(1, popAt(t, 15.3)), 1.4, 1)}}>
                  <Tag bg={RED} size={40}>
                    Not Proven
                  </Tag>
                </div>
              ) : null}
            </div>
          ) : null}
        </Card>
      </Pop>
    </AbsoluteFill>
  );
};
/** Glycogen + water: the sponge fills, then gets squeezed and the scale falls. */
const SQUEEZE = 28.18;
const Glyco: React.FC = () => {
  const t = useT();
  const w = {start: C.glyco.start, end: C.water.end};
  const o = winVis(t, w);
  if (o <= 0) return null;
  const shrink = tween(t, 20.72, 0.6, EASE_IN_OUT) * 0.12; // reducing carbs reduces glycogen
  const wet = tween(t, 26.54, 0.8, EASE_OUT) * (1 - tween(t, SQUEEZE + 0.2, 1.2, EASE_IN_OUT) * 0.7);
  const sq = t < SQUEEZE ? 0 : Math.sin(Math.min(1, (t - SQUEEZE) / 1.4) * Math.PI) * 1;
  const v = roll(t, SQUEEZE + 0.4, 1.4, 70.6, 69.1);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pop x={540} y={300} at={18.9}>
        <Card w={900} h={420} pad={30}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <H size={50}>
              {t < 24.9 ? (
                <>
                  Your <Hi p={tween(t, 21.26, 0.3)}>carb stores</Hi>
                </>
              ) : (
                <>
                  Stores hold <Hi p={tween(t, 27.12, 0.3)}>water</Hi>
                </>
              )}
            </H>
            {t >= 22.42 ? (
              <div style={{scale: Math.min(1, popAt(t, 22.42))}}>
                <Tag bg={INK} size={26}>Glycogen</Tag>
              </div>
            ) : null}
          </div>
          <div style={{position: 'absolute', left: 60, top: 140}}>
            <div style={{width: 360, height: 220, display: 'flex', alignItems: 'flex-end', justifyContent: 'center'}}>
              <div style={{scale: 1 - shrink}}>
                <Sponge w={340} h={180} wet={wet} squeeze={sq} />
              </div>
            </div>
            <Falling t={t} at={26.54} n={8} x={180} y={-150} spread={260} up />
            <Falling t={t} at={SQUEEZE + 0.15} n={12} x={180} y={210} spread={280} />
          </div>
          <div style={{position: 'absolute', right: 50, top: 150, opacity: tween(t, 27.6, 0.4)}}>
            <Scale text={fmt(v)} size={230} />
          </div>
        </Card>
      </Pop>
    </AbsoluteFill>
  );
};
const Three: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.three);
  if (o <= 0) return null;
  const vary = tween(t, 40.0, 0.3);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pop x={540} y={300} at={31.8}>
        <Card w={900} h={400} pad={30}>
          <div style={{display: 'flex', justifyContent: 'center'}}>
            <Kicker>PER GRAM OF GLYCOGEN</Kicker>
          </div>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40, marginTop: 40}}>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, scale: Math.min(1, popAt(t, 32.3))}}>
              <div style={{width: 130, height: 130, borderRadius: 26, background: HL, boxShadow: CARD_SHADOW}} />
              <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 40}}>1 g</span>
            </div>
            <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 90, color: MUTED, opacity: tween(t, 33.06, 0.3)}}>≈</span>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12}}>
              <div style={{display: 'flex', gap: 14, alignItems: 'flex-end', height: 130}}>
                {[0, 1, 2].map((i) => {
                  const s = 1 + (vary > 0 ? Math.sin(t * 6 + i * 2) * 0.16 * vary : 0);
                  return (
                    <div key={i} style={{scale: Math.max(0, Math.min(1, popAt(t, 33.64 + i * 0.16))) * s, transformOrigin: 'center bottom'}}>
                      <Drop s={70} />
                    </div>
                  );
                })}
              </div>
              <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 40, opacity: tween(t, 34.1, 0.3)}}>~3 g water</span>
            </div>
          </div>
        </Card>
      </Pop>
    </AbsoluteFill>
  );
};
const MONTHS = ['Oct', 'Nov', 'Dec'];
const Week: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.week);
  if (o <= 0) return null;
  const wk = tween(t, 43.74, 0.4, EASE_OUT);
  const stretch = tween(t, 46.6, 1.0, EASE_IN_OUT) * (1 - tween(t, 48.28, 0.5, EASE_IN_OUT));
  const W = 820;
  const weekW = W / 13;
  const barW = weekW * wk + (W - weekW) * stretch;
  const no = t >= 48.8;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pop x={540} y={300} at={42.0}>
        <Card w={900} h={380} pad={40}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <H size={50}>
              One week <Hi p={tween(t, 44.4, 0.3)}>≠ a rule</Hi>
            </H>
            {no ? (
              <div style={{scale: Math.min(1, popAt(t, 48.8))}}>
                <Tag bg={RED} size={28}>Too Soon</Tag>
              </div>
            ) : null}
          </div>
          <div style={{position: 'relative', width: W, marginTop: 40}}>
            <div style={{display: 'flex'}}>
              {MONTHS.map((m) => (
                <div key={m} style={{flex: 1, fontFamily: SANS, fontWeight: 800, fontSize: 30, color: MUTED, paddingLeft: 8}}>{m}</div>
              ))}
            </div>
            <div style={{position: 'relative', height: 90, marginTop: 12, borderRadius: 18, background: PAPER, overflow: 'hidden'}}>
              {Array.from({length: 12}, (_, i) => (
                <div key={i} style={{position: 'absolute', left: (i + 1) * weekW, top: 0, bottom: 0, width: 3, background: '#E6E1D8'}} />
              ))}
              <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: barW, borderRadius: 18, background: stretch > 0.05 ? RED : HL, display: 'flex', alignItems: 'center', paddingLeft: 18, boxSizing: 'border-box', fontFamily: SANS, fontWeight: 800, fontSize: 30, color: stretch > 0.05 ? '#fff' : INK, whiteSpace: 'nowrap', overflow: 'hidden'}}>
                {stretch > 0.3 ? 'No Rice Until December?' : ''}
              </div>
            </div>
            <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 26, color: MUTED, marginTop: 12, opacity: wk}}>↑ one low-carb week</div>
          </div>
        </Card>
      </Pop>
    </AbsoluteFill>
  );
};
const DAYS = [70.1, 69.6, 70.3, 69.4, 69.9, 69.2, 69.5];
const Trend: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.trend);
  if (o <= 0) return null;
  const avg = tween(t, 53.74, 0.5, EASE_OUT);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pop x={540} y={300} at={50.0}>
        <Card w={900} h={380} pad={30}>
          <Kicker>THIS WEEK'S WEIGH-INS</Kicker>
          <div style={{display: 'flex', gap: 10, marginTop: 20}}>
            {DAYS.map((d, i) => (
              <div key={i} style={{flex: 1, height: 96, borderRadius: 14, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', scale: Math.max(0, Math.min(1, popAt(t, 50.3 + i * 0.22))), opacity: lerp(avg, 1, 0.45)}}>
                <SevenSeg text={fmt(d)} h={30} on={HL} off="rgba(255,255,255,0.05)" />
              </div>
            ))}
          </div>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22, marginTop: 26, opacity: avg, translate: `0 ${lerp(avg, 20, 0)}px`}}>
            <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 38}}>7-Day Average</span>
            <div style={{padding: '12px 22px', borderRadius: 16, background: INK}}>
              <SevenSeg text="69.7" h={56} on={HL} off="rgba(255,255,255,0.05)" glow="rgba(255,214,10,0.5)" />
            </div>
          </div>
        </Card>
      </Pop>
    </AbsoluteFill>
  );
};
const Regain: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.regain);
  if (o <= 0) return null;
  const wet = 0.3 + 0.7 * tween(t, 56.34, 1.4, EASE_OUT);
  const v = roll(t, 56.6, 1.2, 69.1, 69.9);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pop x={540} y={300} at={55.2}>
        <Card w={900} h={400} pad={30}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <H size={50}>
              Carbs <Hi p={tween(t, 58.48, 0.3)}>back in</Hi>
            </H>
            {t >= 60.68 ? (
              <div style={{scale: lerp(Math.min(1, popAt(t, 60.68)), 1.3, 1)}}>
                <Tag bg={WATER} size={30}>
                  <Ico name="drop" size={32} color="#fff" /> Water, Not Fat
                </Tag>
              </div>
            ) : null}
          </div>
          <div style={{position: 'absolute', left: 60, top: 130}}>
            <div style={{width: 360, height: 220, display: 'flex', alignItems: 'flex-end', justifyContent: 'center'}}>
              <Sponge w={340} h={180} wet={wet} />
            </div>
            <Falling t={t} at={56.2} n={10} x={180} y={-140} spread={260} up />
          </div>
          <div style={{position: 'absolute', right: 50, top: 140}}>
            <div style={{position: 'relative'}}>
              <Scale text={fmt(v)} size={230} />
              {t >= 57.8 ? (
                <div style={{position: 'absolute', right: -10, top: -18, scale: Math.min(1, popAt(t, 57.8))}}>
                  <Tag bg={INK} size={24}>▲ 0.8</Tag>
                </div>
              ) : null}
            </div>
          </div>
        </Card>
      </Pop>
    </AbsoluteFill>
  );
};
const FOODS = [
  {n: 'Rice', icon: 'bowl-food'},
  {n: 'Roti', icon: 'cooking-pot'},
  {n: 'Fruit', icon: 'leaf'},
];
const Foods: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.foods);
  if (o <= 0) return null;
  const strike = tween(t, 69.82, 0.45, EASE_OUT) * (1 - tween(t, 70.7, 0.45, EASE_IN_OUT));
  const keep = t >= 71.0;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pop x={540} y={300} at={64.6}>
        <Card w={900} h={400} pad={34}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <Kicker>YOUR FOOD LIST</Kicker>
            {t >= 68.62 ? (
              <div style={{display: 'flex', alignItems: 'center', gap: 10, scale: Math.min(1, popAt(t, 68.62))}}>
                <Tag bg={INK} size={26}>
                  <Ico name="scales" size={28} color={HL} /> One Weigh-In
                </Tag>
              </div>
            ) : null}
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 12, marginTop: 18}}>
            {FOODS.map((f, i) => {
              const rice = i === 0;
              return (
                <div key={f.n} style={{position: 'relative', display: 'flex', alignItems: 'center', gap: 18, height: 78, padding: '0 22px', borderRadius: 18, background: rice && keep ? HL : PAPER, opacity: tween(t, 65.2 + i * 0.25, 0.3), translate: `${lerp(tween(t, 65.2 + i * 0.25, 0.3), -20, 0)}px 0`}}>
                  <Ico name={f.icon} size={44} color={INK} />
                  <span style={{flex: 1, fontFamily: SANS, fontWeight: 800, fontSize: 38}}>{f.n}</span>
                  <Ico name="check-circle" size={44} color={GREEN} />
                  {rice && strike > 0 ? <div style={{position: 'absolute', left: 16, top: 37, width: `${strike * 92}%`, height: 6, borderRadius: 3, background: RED}} /> : null}
                </div>
              );
            })}
          </div>
        </Card>
      </Pop>
    </AbsoluteFill>
  );
};
// ---------------------------------------------------------------------------
// Ending - three options (pick with --props '{"cta":"A"|"B"|"C"}')
// ---------------------------------------------------------------------------
const TYPE_AT = 73.66; // "GUIDE"
const SEND_AT = 74.8; // "I'll send you"
/** A: a comment bar types GUIDE and sends; her reply lands as a DM bubble. */
const CtaA: React.FC = () => {
  const t = useT();
  const s0 = C.cta.start;
  const word = 'GUIDE';
  const typed = word.slice(0, Math.max(0, Math.min(word.length, Math.floor((t - TYPE_AT) / 0.08) + 1)));
  const sentAt = TYPE_AT + word.length * 0.08 + 0.2;
  const sent = tween(t, sentAt, 0.25, EASE_OUT);
  const bar = tween(t, s0 + 0.05, 0.4, EASE_OUT);
  const dm = tween(t, SEND_AT, 0.45, EASE_OUT);
  return (
    <AbsoluteFill style={{fontFamily: SANS}}>
      <div style={{position: 'absolute', left: 70, top: 90, width: 940, height: 150, borderRadius: 75, background: '#fff', boxShadow: CARD_SHADOW, display: 'flex', alignItems: 'center', gap: 24, padding: '0 22px 0 30px', boxSizing: 'border-box', opacity: bar, translate: `0 ${lerp(bar, 30, 0)}px`}}>
        <Ico name="chat-circle-dots" size={58} color={INK} />
        <div style={{flex: 1, fontSize: 76, fontWeight: 800, letterSpacing: typed ? 6 : 0, color: typed ? INK : '#A8A39A'}}>{typed ? <Hi p={sent}>{typed}</Hi> : <span style={{fontSize: 46}}>Add a comment…</span>}</div>
        <div style={{width: 106, height: 106, borderRadius: '50%', background: sent > 0 ? INK : '#D8D4CC', display: 'flex', alignItems: 'center', justifyContent: 'center', scale: 1 + 0.15 * Math.sin(Math.PI * sent)}}>
          <Ico name="paper-plane-right" size={56} color={sent > 0 ? HL : '#fff'} />
        </div>
      </div>
      {dm > 0 ? (
        <div style={{position: 'absolute', left: 70, top: 290, opacity: dm, translate: `0 ${lerp(dm, 30, 0)}px`, display: 'flex', alignItems: 'flex-end', gap: 16}}>
          <div style={{width: 76, height: 76, borderRadius: '50%', background: HL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 36, color: INK}}>B</div>
          <div style={{padding: '22px 30px', borderRadius: '34px 34px 34px 10px', background: INK, color: '#fff', boxShadow: CARD_SHADOW, maxWidth: 740}}>
            <div style={{fontSize: 40, fontWeight: 800, lineHeight: 1.15}}>Here's your free fat loss guide</div>
            <div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 14, padding: '12px 18px', borderRadius: 16, background: 'rgba(255,255,255,0.1)'}}>
              <Ico name="file-pdf" size={44} color={HL} />
              <span style={{fontSize: 30, fontWeight: 700}}>Fat-Loss-Guide.pdf</span>
            </div>
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
/** B: big type - GUIDE drops in letter by letter. */
const CtaB: React.FC = () => {
  const t = useT();
  const s0 = C.cta.start;
  const card = popAt(t, s0 + 0.05);
  const dm = popAt(t, SEND_AT);
  return (
    <AbsoluteFill style={{fontFamily: SANS}}>
      <div style={{position: 'absolute', left: 540, top: 300, translate: '-50% -50%', scale: Math.min(1, Math.max(0, card)), width: 900, borderRadius: 40, background: '#fff', boxShadow: CARD_SHADOW, padding: '34px 40px 40px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, fontWeight: 800, fontSize: 36, letterSpacing: 8, color: MUTED}}>
          <Ico name="chat-circle-dots" size={40} color={MUTED} /> COMMENT
        </div>
        <div style={{display: 'flex', gap: 6, marginTop: 6, height: 230, alignItems: 'center'}}>
          {'GUIDE'.split('').map((ch, i) => {
            const k = popAt(t, TYPE_AT + i * 0.09);
            return (
              <span key={i} style={{fontFamily: 'Anton', fontSize: 220, lineHeight: 1, color: INK, opacity: Math.min(1, k * 3), translate: `0 ${lerp(Math.min(1, Math.max(0, k)), -120, 0)}px`, display: 'inline-block'}}>
                {ch}
              </span>
            );
          })}
        </div>
        <div style={{width: lerp(tween(t, TYPE_AT + 0.5, 0.4, EASE_OUT), 0, 560), height: 18, borderRadius: 9, background: HL, marginTop: -10}} />
        <div style={{height: 70, marginTop: 22, display: 'flex', alignItems: 'center'}}>
          {t >= SEND_AT ? (
            <div style={{scale: Math.min(1, dm)}}>
              <Tag bg={INK} size={34}>
                <Ico name="file-pdf" size={36} color={HL} /> Free Fat Loss Guide → Your DMs
              </Tag>
            </div>
          ) : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};
/** C: a food-label card - the guide, labelled like a food. */
const CtaC: React.FC = () => {
  const t = useT();
  const s0 = C.cta.start;
  const k = tween(t, s0 + 0.05, 0.45, EASE_OUT);
  const row = (at: number, l: string, r: React.ReactNode, big?: boolean) => (
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: big ? 120 : 62, borderBottom: big ? 'none' : `3px solid ${INK}`, opacity: tween(t, at, 0.25), translate: `0 ${lerp(tween(t, at, 0.25), 14, 0)}px`}}>
      <span style={{fontSize: big ? 40 : 32, fontWeight: 800}}>{l}</span>
      <span style={{fontSize: 32, fontWeight: 800}}>{r}</span>
    </div>
  );
  return (
    <AbsoluteFill style={{fontFamily: SANS, color: INK}}>
      <div style={{position: 'absolute', left: 540, top: 70, translate: `-50% ${lerp(k, 30, 0)}px`, opacity: k, width: 760, background: '#fff', border: `6px solid ${INK}`, boxShadow: CARD_SHADOW, padding: '18px 34px 22px', boxSizing: 'border-box'}}>
        <div style={{fontWeight: 800, fontSize: 56, letterSpacing: -1.5, lineHeight: 1.05}}>Free Fat Loss Guide</div>
        <div style={{height: 14, background: INK, margin: '10px 0 4px'}} />
        {row(73.4, 'Serving', '1 PDF')}
        {row(73.5, 'Price', '₹0')}
        {row(
          TYPE_AT,
          'To get it, comment',
          <span style={{display: 'inline-block', padding: '4px 22px', background: HL, border: `5px solid ${INK}`, borderRadius: 12, fontFamily: 'Anton', fontSize: 80, fontWeight: 400, letterSpacing: 4, lineHeight: 1.1, scale: lerp(Math.min(1, Math.max(0, popAt(t, TYPE_AT))), 1.4, 1)}}>GUIDE</span>,
          true,
        )}
        <div style={{height: 6, background: INK, marginTop: 4}} />
        <div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, fontSize: 28, fontWeight: 800, opacity: tween(t, SEND_AT, 0.3)}}>
          <Ico name="paper-plane-right" size={30} color={INK} /> Delivered to your DMs
        </div>
      </div>
    </AbsoluteFill>
  );
};
const Cta: React.FC = () => {
  const t = useT();
  if (t < C.cta.start) return null;
  const v = (getInputProps() as {cta?: string}).cta ?? 'B';
  return v === 'A' ? <CtaA /> : v === 'C' ? <CtaC /> : <CtaB />;
};

// ---------------------------------------------------------------------------
const WASH = [C.hook, C.rice, {start: C.glyco.start, end: C.water.end}, C.three, C.week, C.trend, C.regain, C.foods, C.cta];
const Scene: React.FC = () => (
  <>
    <Footage cfg={cfg} />
    <GradeOverlay cfg={cfg} />
    <TopWash wins={WASH} reach={38} />
    <Hook />
    <Rice />
    <Glyco />
    <Three />
    <Week />
    <Trend />
    <Regain />
    <Foods />
    <Cta />
    <Subject cfg={cfg} />
    <PillCaps cfg={cfg} hide={[{start: C.cta.start + 0.3, end: 999}]} />
  </>
);

export const V11Reel: React.FC = () => (
  <Base cfg={{...cfg, shakes: [5.72, 15.3, 48.8]}}>
    <Scene />
  </Base>
);
