import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Base, BrollCuts, Footage, GradeOverlay, Subject, inWin} from '../series/core';
import {useT} from '../explainer/kit';
import {Ico, popAt} from '../series/kit2';
import {CARD_SHADOW, Card, H, HL, Hi, INK, Kicker, MUTED, PAPER, PillCaps, Pop, Tag, TopWash, winVis} from '../series/kit3';
import {EASE_IN, EASE_IN_OUT, EASE_OUT, SANS, lerp, tween} from '../theme';
import {C, v14Config as cfg} from './config';

/**
 * Desk job: move between workouts. Signature: a smartwatch. It races through the sitting hours over
 * the desk B-roll that opens the reel, buzzes the movement reminder, and receives the guide at the end.
 * Plus a sun crossing the working day, a lab-monitor glucose read-out and true/false swipe cards.
 * Times are source seconds.
 */
const GREEN = '#17A34A';
const RED = '#E5484D';
const SEAT = '#E4DFD6';

// ---------------------------------------------------------------------------
// Signature: the watch
// ---------------------------------------------------------------------------
const STRAP = '#2A2A2D';
const Watch: React.FC<{buzz?: number; scale?: number; children: React.ReactNode}> = ({buzz = 0, scale = 1, children}) => {
  const t = useT();
  const jx = buzz > 0 ? Math.sin(t * 90) * 7 * buzz : 0;
  return (
    <div style={{position: 'relative', width: 330, height: 520, scale, translate: `${jx}px 0`}}>
      <div style={{position: 'absolute', left: 60, top: 0, width: 210, height: 90, borderRadius: '24px 24px 0 0', background: STRAP}} />
      <div style={{position: 'absolute', left: 60, bottom: 0, width: 210, height: 90, borderRadius: '0 0 24px 24px', background: STRAP}} />
      <div style={{position: 'absolute', right: -14, top: 200, width: 22, height: 60, borderRadius: 8, background: '#4A4A4E'}} />
      <div style={{position: 'absolute', left: 0, top: 70, width: 330, height: 380, borderRadius: 84, background: '#1C1C1E', border: '10px solid #3A3A3D', boxSizing: 'border-box', boxShadow: '0 30px 60px -20px rgba(0,0,0,0.6)'}}>
        <div style={{position: 'absolute', inset: 14, borderRadius: 64, background: '#000', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, color: '#fff'}}>{children}</div>
      </div>
      {buzz > 0
        ? [-1, 1].map((s) => (
            <div key={s} style={{position: 'absolute', top: 210, left: s < 0 ? -70 : 350, display: 'flex', flexDirection: 'column', gap: 16, opacity: buzz}}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{width: 40 + (i === 1 ? 16 : 0), height: 8, borderRadius: 4, background: HL, marginLeft: s < 0 && i !== 1 ? 16 : 0}} />
              ))}
            </div>
          ))
        : null}
    </div>
  );
};
const Ring: React.FC<{p: number; color: string; size?: number; children?: React.ReactNode}> = ({p, color, size = 220, children}) => (
  <div style={{position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
    <svg width={size} height={size} style={{position: 'absolute', inset: 0, rotate: '-90deg'}}>
      <circle cx={size / 2} cy={size / 2} r={size / 2 - 14} fill="none" stroke="#2B2B2E" strokeWidth={20} />
      <circle cx={size / 2} cy={size / 2} r={size / 2 - 14} fill="none" stroke={color} strokeWidth={20} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.max(0.001, p)} />
    </svg>
    {children}
  </div>
);

// ---------------------------------------------------------------------------
// Hook: desk B-roll + the sitting clock, then the sun crosses the working day
// ---------------------------------------------------------------------------
const HookWatch: React.FC = () => {
  const t = useT();
  if (!inWin(t, [C.deskBroll])) return null;
  const p = tween(t, 1.3, 3.6, (x) => x);
  const mins = Math.floor(p * 252); // 0 -> 4 h 12 min of sitting
  const late = p > 0.8;
  return (
    <AbsoluteFill>
      {/* sits in the free space to her left, clear of her head */}
      <Pop x={195} y={430} at={1.25}>
        <Watch scale={0.66}>
          <Ring p={p * 0.9} color={late ? RED : HL}>
            <div style={{fontSize: 21, fontWeight: 800, letterSpacing: 3, color: '#9A9A9F'}}>SITTING</div>
            <div style={{fontSize: 80, fontWeight: 800, fontVariantNumeric: 'tabular-nums', lineHeight: 1.05}}>
              {Math.floor(mins / 60)}:{String(mins % 60).padStart(2, '0')}
            </div>
            <div style={{fontSize: 21, fontWeight: 700, color: '#9A9A9F'}}>Since 9 AM</div>
          </Ring>
        </Watch>
      </Pop>
    </AbsoluteFill>
  );
};
const AW = 860;
const ARC = (p: number) => ({x: 430 + 390 * Math.cos(Math.PI * (1 - p)), y: 236 - 190 * Math.sin(Math.PI * p)});
const arcPath = (a: number, b: number) => {
  if (b <= a) return '';
  const n = 40;
  let d = '';
  for (let i = 0; i <= n; i++) {
    const q = ARC(a + ((b - a) * i) / n);
    d += `${i ? 'L' : 'M'}${q.x.toFixed(1)} ${q.y.toFixed(1)} `;
  }
  return d;
};
const Hook: React.FC = () => {
  const t = useT();
  const o = winVis(t, {start: C.deskBroll.end, end: C.hook.end});
  if (o <= 0) return null;
  const sun = tween(t, 5.3, 1.3, EASE_IN_OUT); // 9 AM -> 9 PM
  const sit = Math.min(sun, 0.75); // sitting until 6 PM
  const gymOn = sun > 10 / 12;
  const s = ARC(sun);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pop x={540} y={300} at={C.deskBroll.end + 0.02}>
        <Card w={940} pad={28}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 60}}>
            <H size={52}>
              The <Hi p={tween(t, 5.9, 0.3)}>other 11 hours</Hi>
            </H>
            {t >= 8.52 ? (
              <div style={{scale: Math.min(1, popAt(t, 8.52))}}>
                <Tag bg={INK} size={28}>
                  <Ico name="barbell" size={30} color={HL} /> Gym = 1 Hour
                </Tag>
              </div>
            ) : null}
          </div>
          <svg width={AW} height={280} style={{marginTop: 4}}>
            <path d={arcPath(0, 1)} fill="none" stroke="#F1EDE6" strokeWidth={34} strokeLinecap="round" />
            <path d={arcPath(0, sit)} fill="none" stroke={SEAT} strokeWidth={34} strokeLinecap="round" />
            {gymOn ? <path d={arcPath(10 / 12, 11 / 12)} fill="none" stroke={HL} strokeWidth={34} strokeLinecap="round" /> : null}
            {[0, 0.5, 1].map((q, i) => {
              const a = ARC(q);
              return (
                <text key={i} x={a.x} y={a.y + (i === 1 ? 54 : 44)} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={24} fill={MUTED}>
                  {['9 AM', '3 PM', '9 PM'][i]}
                </text>
              );
            })}
            {sit > 0.2 ? (
              <text x={430} y={180} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={40} fill={INK} opacity={tween(t, 5.9, 0.3)}>
                Sitting
              </text>
            ) : null}
            {gymOn ? (
              <text x={ARC(10.5 / 12).x - 40} y={ARC(10.5 / 12).y + 62} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={28} fill={INK}>
                Gym
              </text>
            ) : null}
            <g transform={`translate(${s.x} ${s.y})`}>
              <circle r={36} fill={sun < 0.92 ? HL : '#2B3256'} stroke="#fff" strokeWidth={6} />
            </g>
          </svg>
          <div style={{position: 'absolute', left: 28 + s.x - 24, top: 28 + 64 + s.y - 24, width: 48, height: 48}}>
            <Ico name={sun < 0.92 ? 'sun' : 'moon'} size={48} color={sun < 0.92 ? INK : '#C9D2FF'} />
          </div>
        </Card>
      </Pop>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// The trial: same people, two days; the walker hops out every 30 minutes
// ---------------------------------------------------------------------------
const Trial: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.trial);
  if (o <= 0) return null;
  const lanes = tween(t, 16.0, 0.35);
  const walk = tween(t, 16.4, 3.0, (x) => x);
  const TW = 560;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pop x={540} y={300} at={10.94}>
        <Card w={940} h={430} pad={26} style={{overflow: 'hidden'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <Kicker>CONTROLLED TRIAL</Kicker>
            <div style={{display: 'flex', gap: 10}}>
              {t >= 12.74 ? <div style={{scale: Math.min(1, popAt(t, 12.74))}}><Tag bg={HL} fg={INK} size={24}>Inactive Adults</Tag></div> : null}
              {t >= 14.34 ? <div style={{scale: Math.min(1, popAt(t, 14.34))}}><Tag bg={HL} fg={INK} size={24}>Type 2 Diabetes</Tag></div> : null}
            </div>
          </div>
          {lanes < 1 ? (
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 10, marginTop: 34, opacity: 1 - lanes, translate: `0 ${-lanes * 40}px`}}>
              {Array.from({length: 24}, (_, i) => (
                <div key={i} style={{scale: Math.max(0, popAt(t, 12.3 + i * 0.03)), display: 'flex', justifyContent: 'center'}}>
                  <Ico name="person" size={66} color={INK} />
                </div>
              ))}
            </div>
          ) : null}
          {lanes > 0 ? (
            <div style={{position: 'absolute', left: 26, right: 26, top: 92, opacity: lanes}}>
              <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 26, color: MUTED, marginBottom: 6}}>Same people, two different days</div>
              {[
                {label: 'With Breaks', on: true, at: 16.04},
                {label: 'Seated', on: false, at: 19.68},
              ].map((l, i) => (
                <div key={i} style={{display: 'flex', alignItems: 'center', gap: 18, padding: '14px 0', borderBottom: i === 0 ? '3px solid #EFEBE4' : undefined, opacity: i === 1 ? tween(t, l.at - 0.3, 0.3) : 1}}>
                  <div style={{width: 280, display: 'flex', alignItems: 'center', gap: 10, fontFamily: SANS, fontWeight: 800, fontSize: 32, whiteSpace: 'nowrap'}}>
                    <Ico name={l.on ? 'person-simple-walk' : 'office-chair'} size={40} color={INK} /> {l.label}
                  </div>
                  <div style={{position: 'relative', width: TW, height: 80, borderRadius: 16, background: SEAT}}>
                    {l.on ? (
                      <>
                        {Array.from({length: 8}, (_, k) => {
                          const x = 30 + k * ((TW - 60) / 7);
                          const hit = walk * (TW - 60) + 30 >= x - 2;
                          return <div key={k} style={{position: 'absolute', left: x - 9, top: 14, width: 18, height: 52, borderRadius: 9, background: HL, scale: hit ? `1 ${Math.min(1, popAt(t, 16.4 + (k / 7) * 3.0))}` : '1 0'}} />;
                        })}
                        <div style={{position: 'absolute', left: 30 + walk * (TW - 60) - 32, top: 8 - Math.abs(Math.sin(walk * Math.PI * 7)) * 22, width: 64, height: 64, borderRadius: 18, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 14px -6px rgba(0,0,0,0.5)'}}>
                          <Ico name="person-simple-walk" size={44} color={HL} />
                        </div>
                      </>
                    ) : (
                      <div style={{position: 'absolute', left: 0, top: 0, height: 80, width: TW * tween(t, 19.9, 1.0, EASE_IN_OUT), borderRadius: 16, background: '#CFC8BC'}} />
                    )}
                  </div>
                </div>
              ))}
              <div style={{marginTop: 12, fontFamily: SANS, fontWeight: 800, fontSize: 26, color: MUTED, opacity: tween(t, 17.4, 0.3)}}>One yellow mark = 3 minutes of walking</div>
            </div>
          ) : null}
        </Card>
      </Pop>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Glucose on a lab monitor
// ---------------------------------------------------------------------------
const Glucose: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.glucose);
  if (o <= 0) return null;
  const W = 884;
  const Hh = 250;
  const peakX = 0.32;
  const yOf = (peak: number, x: number) => Hh - (peak * Math.exp(-Math.pow((x - peakX) / 0.2, 2)) + 0.05) * (Hh - 30);
  const curve = (peak: number) =>
    Array.from({length: 61}, (_, i) => {
      const x = i / 60;
      return `${i ? 'L' : 'M'}${(30 + x * (W - 60)).toFixed(1)} ${yOf(peak, x).toFixed(1)}`;
    }).join(' ');
  const a = tween(t, 22.36, 1.0, EASE_IN_OUT);
  const b = tween(t, 24.8, 1.2, EASE_IN_OUT);
  const px = 30 + peakX * (W - 60);
  const br = tween(t, 27.36, 0.5, EASE_OUT);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pop x={540} y={300} at={21.6}>
        <Card w={940} pad={28} dark>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <Kicker color="rgba(255,255,255,0.6)">AFTER A MEAL</Kicker>
            <div style={{display: 'flex', gap: 22, fontFamily: SANS, fontWeight: 800, fontSize: 24}}>
              <span style={{color: '#8E8E93', opacity: a}}>━ Seated</span>
              <span style={{color: HL, opacity: b}}>━ Walking Breaks</span>
            </div>
          </div>
          <svg width={W} height={Hh + 20} style={{marginTop: 12}}>
            {Array.from({length: 6}, (_, i) => (
              <line key={`h${i}`} x1={0} x2={W} y1={20 + i * 46} y2={20 + i * 46} stroke="rgba(255,255,255,0.07)" strokeWidth={2} />
            ))}
            {Array.from({length: 12}, (_, i) => (
              <line key={`v${i}`} y1={0} y2={Hh + 20} x1={i * 80} x2={i * 80} stroke="rgba(255,255,255,0.07)" strokeWidth={2} />
            ))}
            <path d={curve(0.95)} fill="none" stroke="#8E8E93" strokeWidth={9} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - a} />
            <path d={curve(0.58)} fill="none" stroke={HL} strokeWidth={11} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - b} style={{filter: 'drop-shadow(0 0 10px rgba(255,214,10,0.75))'}} />
            {b > 0 && b < 1 ? <line x1={30 + b * (W - 60)} x2={30 + b * (W - 60)} y1={0} y2={Hh + 20} stroke={HL} strokeWidth={3} opacity={0.5} /> : null}
            {br > 0 ? (
              <g opacity={br}>
                <line x1={px} x2={px} y1={yOf(0.95, peakX) + 8} y2={yOf(0.95, peakX) + 8 + (yOf(0.58, peakX) - yOf(0.95, peakX) - 16) * br} stroke="#fff" strokeWidth={5} />
                <line x1={px - 16} x2={px + 16} y1={yOf(0.95, peakX) + 8} y2={yOf(0.95, peakX) + 8} stroke="#fff" strokeWidth={5} />
                <line x1={px - 16} x2={px + 16} y1={yOf(0.58, peakX) - 8} y2={yOf(0.58, peakX) - 8} stroke="#fff" strokeWidth={5} opacity={br >= 1 ? 1 : 0} />
              </g>
            ) : null}
          </svg>
          {t >= 28.14 ? (
            <div style={{position: 'absolute', left: 28 + px + 40, top: 120, scale: lerp(Math.min(1, popAt(t, 28.14)), 1.5, 1), transformOrigin: 'left center'}}>
              <Tag bg={HL} fg={INK} size={46}>
                −39% Rise
              </Tag>
            </div>
          ) : null}
        </Card>
      </Pop>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// True or false: swipe cards
// ---------------------------------------------------------------------------
const MYTHS = [
  {txt: '39% Lower Blood Sugar', icon: 'drop', stamp: 31.96, swipe: 34.3, ok: false},
  {txt: '39% Fat Loss', icon: 'fire', stamp: 36.22, swipe: 36.85, ok: false},
  {txt: 'A Smaller Post-Meal Spike', icon: 'chart-line-down', stamp: 37.05, swipe: 999, ok: true},
];
const Not: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.not);
  if (o <= 0) return null;
  let top = 0;
  MYTHS.forEach((m, i) => (t >= m.swipe ? (top = i + 1) : null));
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 96, textAlign: 'center', opacity: tween(t, 30.2, 0.3)}}>
        <Kicker>WHAT −39% MEANS</Kicker>
      </div>
      <Pop x={540} y={330} at={30.2}>
        <div style={{position: 'relative', width: 860, height: 300}}>
          {MYTHS.map((m, i) => i)
            .reverse()
            .map((i) => {
              const m = MYTHS[i];
              const depth = Math.max(0, i - top);
              const settle = tween(t, i > 0 ? MYTHS[i - 1].swipe : 0, 0.3, EASE_OUT);
              const d = i > top ? depth : i === top ? lerp(settle, 1, 0) : 0;
              const out = tween(t, m.swipe, 0.45, EASE_IN);
              if (out >= 1) return null;
              const st = popAt(t, m.stamp);
              return (
                <div key={i} style={{position: 'absolute', left: 0, top: 0, width: 860, height: 230, borderRadius: 34, background: '#fff', boxShadow: CARD_SHADOW, translate: `${out * (m.ok ? 1 : -1) * 1300}px ${d * 30}px`, scale: 1 - d * 0.05, display: 'flex', alignItems: 'center', gap: 26, padding: '0 40px', boxSizing: 'border-box'}}>
                  <div style={{width: 110, height: 110, borderRadius: 28, background: PAPER, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
                    <Ico name={m.icon} size={66} color={INK} />
                  </div>
                  <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 50, lineHeight: 1.05, color: INK}}>{m.txt}</span>
                  {t >= m.stamp ? (
                    <div style={{position: 'absolute', right: 30, top: -26, scale: lerp(Math.min(1, st), 1.8, 1), opacity: Math.min(1, st * 3)}}>
                      <div style={{padding: '6px 22px', borderRadius: 14, border: `6px solid ${m.ok ? GREEN : RED}`, background: '#fff', color: m.ok ? GREEN : RED, fontFamily: SANS, fontWeight: 800, fontSize: 44, letterSpacing: 4}}>{m.ok ? 'TRUE' : 'FALSE'}</div>
                    </div>
                  ) : null}
                </div>
              );
            })}
        </div>
      </Pop>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
const Vary: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.promise);
  if (o <= 0) return null;
  const loop = tween(t, 43.4, 0.4);
  const spin = Math.max(0, t - 43.6);
  const ring = (spin * 0.5) % 1;
  return (
    <AbsoluteFill style={{opacity: o}}>
      {loop < 0.5 ? (
        <Pop x={540} y={300} at={37.98}>
          <Card w={760} pad={28}>
            <Kicker>RESULTS VARY</Kicker>
            <div style={{display: 'flex', justifyContent: 'space-around', marginTop: 20}}>
              {[0.9, 0.55, 0.75, 0.4].map((v, i) => (
                <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, scale: Math.max(0, popAt(t, 38.3 + i * 0.15))}}>
                  <Ico name="person" size={84} color={INK} />
                  <div style={{width: 90, height: 16, borderRadius: 8, background: '#ECE8E1'}}>
                    <div style={{width: `${v * 100 * tween(t, 39.1, 0.6)}%`, height: 16, borderRadius: 8, background: HL}} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Pop>
      ) : (
        <Pop x={540} y={300} at={43.4}>
          <Card w={860} pad={30}>
            <Kicker>A PATTERN TO TRY</Kicker>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 26, marginTop: 20}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '18px 26px', borderRadius: 22, background: SEAT, outline: ring < 0.9 ? `5px solid ${INK}` : 'none'}}>
                <Ico name="office-chair" size={56} color={INK} />
                <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 44}}>30 Min</span>
              </div>
              <div style={{rotate: `${spin * 200}deg`}}>
                <Ico name="arrows-clockwise" size={64} color={INK} />
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '18px 26px', borderRadius: 22, background: HL, outline: ring >= 0.9 ? `5px solid ${INK}` : 'none'}}>
                <Ico name="person-simple-walk" size={56} color={INK} />
                <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 44}}>3 Min</span>
              </div>
            </div>
          </Card>
        </Pop>
      )}
    </AbsoluteFill>
  );
};

/** The reminder buzzes on the watch. */
const Reminder: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.reminder);
  if (o <= 0) return null;
  const buzz = t >= 49.58 && t < 50.6 ? 1 - tween(t, 50.2, 0.4) : 0;
  const run = Math.max(0, t - 51.04);
  const secs = Math.max(0, 180 - Math.floor(run));
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pop x={540} y={290} at={47.2}>
        <Watch buzz={buzz} scale={0.86}>
          {t < 49.58 ? (
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
              <Ico name="office-chair" size={64} color="#9A9A9F" />
              <div style={{fontSize: 26, fontWeight: 800, color: '#9A9A9F'}}>Desk Block</div>
              <div style={{fontSize: 56, fontWeight: 800}}>2:00 PM</div>
            </div>
          ) : t < 51.04 ? (
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, scale: Math.min(1, popAt(t, 49.58))}}>
              <div style={{width: 96, height: 96, borderRadius: '50%', background: HL, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Ico name="bell-ringing" size={60} color={INK} />
              </div>
              <div style={{fontSize: 40, fontWeight: 800, textAlign: 'center', lineHeight: 1.05}}>
                Time To
                <br />
                Move
              </div>
            </div>
          ) : (
            <Ring p={secs / 180} color={HL}>
              <Ico name="person-simple-walk" size={44} color={HL} />
              <div style={{fontSize: 64, fontWeight: 800, fontVariantNumeric: 'tabular-nums', lineHeight: 1.05}}>
                {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}
              </div>
            </Ring>
          )}
        </Watch>
      </Pop>
    </AbsoluteFill>
  );
};
const WalkTags: React.FC = () => {
  const t = useT();
  if (!inWin(t, [C.walk])) return null;
  const steps = Math.round(340 * tween(t, 53.7, 2.9, (x) => x));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0) 30%)'}} />
      <Pop x={330} y={190} at={54.06}>
        <Tag bg="#fff" fg={INK} size={40}>
          <Ico name="footprints" size={44} color={INK} /> Indoor Loop
        </Tag>
      </Pop>
      <Pop x={740} y={310} at={55.96}>
        <Tag bg={HL} fg={INK} size={40}>
          <Ico name="drop" size={44} color={INK} /> Water Refill
        </Tag>
      </Pop>
      <Pop x={540} y={1180} at={53.6}>
        <Tag bg={INK} size={44}>
          <Ico name="sneaker-move" size={48} color={HL} /> <span style={{fontVariantNumeric: 'tabular-nums'}}>+{steps}</span> Steps
        </Tag>
      </Pop>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// The day ribbon (meeting + build)
// ---------------------------------------------------------------------------
const H0 = 9;
const H1 = 21;
const RW = 840;
const hx = (h: number) => ((h - H0) / (H1 - H0)) * RW;
type Block = {from: number; to: number; bg: string; label?: string; fg?: string; o?: number};
const hourLabel = (h: number) => (h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`);
const Ribbon: React.FC<{blocks: Block[]; ticks?: {h: number; o: number; bg?: string}[]; title?: React.ReactNode}> = ({blocks, ticks = [], title}) => (
  <Card w={940} pad={30}>
    {title ? <div style={{marginBottom: 18}}>{title}</div> : null}
    <div style={{position: 'relative', width: RW, height: 120, marginLeft: 20}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 92, borderRadius: 18, background: PAPER}} />
      {blocks.map((b, i) => (
        <div key={i} style={{position: 'absolute', left: hx(b.from), top: 0, width: hx(b.to) - hx(b.from), height: 92, borderRadius: 18, background: b.bg, color: b.fg ?? INK, opacity: b.o ?? 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 28, whiteSpace: 'nowrap', overflow: 'hidden'}}>
          {b.label}
        </div>
      ))}
      {ticks.map((k, i) => (
        <div key={i} style={{position: 'absolute', left: hx(k.h) - 7, top: 14, width: 14, height: 64, borderRadius: 7, background: k.bg ?? INK, opacity: k.o, scale: `1 ${k.o}`}} />
      ))}
      {[9, 12, 15, 18, 21].map((h) => (
        <div key={h} style={{position: 'absolute', left: hx(h), top: 98, translate: '-50% 0', fontFamily: SANS, fontWeight: 800, fontSize: 22, color: MUTED, whiteSpace: 'nowrap'}}>{hourLabel(h)}</div>
      ))}
    </div>
  </Card>
);
const breakTicks = (t: number, at: number, from = 9.5, to = 18, step = 0.5) =>
  Array.from({length: Math.round((to - from) / step) + 1}, (_, i) => ({h: from + i * step, o: tween(t, at + i * 0.04, 0.2)}));
const Meeting: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.meeting);
  if (o <= 0) return null;
  const meet = tween(t, 57.62, 0.3);
  const after = tween(t, 59.24, 0.6, EASE_IN_OUT);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pop x={540} y={300} at={57.1}>
        <Ribbon
          blocks={[
            {from: 9, to: 18, bg: SEAT},
            {from: 10.6, to: 12.2, bg: INK, fg: '#fff', label: 'Meeting', o: meet},
          ]}
          ticks={[
            {h: 10.0, o: 1},
            {h: lerp(after, 11.4, 12.5), o: 1, bg: after > 0.95 ? GREEN : RED},
            {h: 13.0, o: 1},
            {h: 13.5, o: 1},
          ]}
          title={
            <H size={48}>
              Break <Hi p={tween(t, 59.3, 0.3)}>moved, not missed</Hi>
            </H>
          }
        />
      </Pop>
    </AbsoluteFill>
  );
};
const Build: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.build);
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pop x={540} y={300} at={61.26}>
        <Ribbon
          blocks={[
            {from: 9, to: 18, bg: SEAT},
            {from: 19, to: 20, bg: HL, label: 'Gym', o: tween(t, 62.72, 0.3)},
          ]}
          ticks={breakTicks(t, 61.86)}
          title={
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <H size={50}>
                <Hi p={tween(t, 62.0, 0.3)}>Both</Hi>, not either
              </H>
              {t >= 64.88 ? (
                <div style={{scale: Math.min(1, popAt(t, 64.88))}}>
                  <Tag bg={RED} size={26}>1 Workout ≠ Whole Day</Tag>
                </div>
              ) : null}
            </div>
          }
        />
      </Pop>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Ending: comment GUIDE, and the guide lands on the watch
// ---------------------------------------------------------------------------
const Cta: React.FC = () => {
  const t = useT();
  const s0 = C.cta.start;
  if (t < s0) return null;
  const word = 'GUIDE';
  const typeAt = 71.28;
  const w = word.slice(0, Math.max(0, Math.min(word.length, Math.floor((t - typeAt) / 0.07) + 1)));
  const sentAt = typeAt + word.length * 0.07 + 0.25;
  const sent = tween(t, sentAt, 0.25, EASE_OUT);
  const bar = tween(t, s0 + 0.1, 0.4, EASE_OUT);
  const dmAt = 72.46;
  const watch = tween(t, sentAt + 0.1, 0.5, EASE_OUT);
  const buzz = t >= dmAt && t < dmAt + 1.0 ? 1 - tween(t, dmAt + 0.6, 0.4) : 0;
  return (
    <AbsoluteFill style={{fontFamily: SANS}}>
      <div style={{position: 'absolute', left: 90, top: 50, width: 900, height: 116, borderRadius: 58, background: '#fff', boxShadow: CARD_SHADOW, display: 'flex', alignItems: 'center', gap: 22, padding: '0 16px 0 22px', boxSizing: 'border-box', opacity: bar, translate: `0 ${lerp(bar, 30, 0)}px`}}>
        <div style={{width: 76, height: 76, borderRadius: '50%', background: PAPER, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Ico name="chat-circle-dots" size={42} color={INK} />
        </div>
        <div style={{flex: 1, fontSize: 50, fontWeight: 800, color: w ? INK : '#9A9A9A', letterSpacing: w ? 3 : 0}}>{w ? <Hi p={sent}>{w}</Hi> : 'Add a comment…'}</div>
        <div style={{width: 84, height: 84, borderRadius: '50%', background: sent > 0 ? INK : '#D8D8D8', display: 'flex', alignItems: 'center', justifyContent: 'center', scale: 1 + 0.15 * Math.sin(Math.PI * sent)}}>
          <Ico name="paper-plane-right" size={44} color={sent > 0 ? HL : '#fff'} />
        </div>
      </div>
      {watch > 0 ? (
        <div style={{position: 'absolute', left: 540, top: 425, translate: `-50% ${lerp(watch, -30, -50)}%`, opacity: Math.min(1, watch * 2)}}>
          <Watch buzz={buzz} scale={0.94}>
            {t < dmAt ? (
              <div style={{fontSize: 70, fontWeight: 800, fontVariantNumeric: 'tabular-nums'}}>6:42</div>
            ) : (
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, scale: Math.min(1, popAt(t, dmAt)), textAlign: 'center'}}>
                <div style={{fontSize: 22, fontWeight: 700, color: '#9A9A9F'}}>New Message</div>
                <div style={{width: 84, height: 84, borderRadius: 22, background: HL, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <Ico name="file-pdf" size={54} color={INK} />
                </div>
                <div style={{fontSize: 32, fontWeight: 800, lineHeight: 1.08}}>
                  Free Fat Loss
                  <br />
                  Guide
                </div>
                <div style={{marginTop: 4, padding: '6px 18px', borderRadius: 999, background: '#2B2B2E', fontSize: 22, fontWeight: 800, color: HL}}>Tap To Open</div>
              </div>
            )}
          </Watch>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
const WASH = [{start: C.deskBroll.end, end: C.hook.end}, C.trial, C.glucose, C.not, C.promise, C.reminder, C.meeting, C.build, C.cta];
const Scene: React.FC = () => (
  <>
    <Footage cfg={cfg} />
    <GradeOverlay cfg={cfg} />
    <TopWash wins={WASH} reach={38} />
    <Hook />
    <Trial />
    <Glucose />
    <Not />
    <Vary />
    <Reminder />
    <Meeting />
    <Build />
    <Cta />
    <Subject cfg={cfg} />
    <BrollCuts cfg={cfg} />
    <HookWatch />
    <WalkTags />
    <PillCaps cfg={cfg} hide={[{start: C.cta.start + 0.3, end: 999}]} />
  </>
);

export const V14Reel: React.FC = () => (
  <Base cfg={{...cfg, shakes: [28.14, 31.96, 36.22]}}>
    <Scene />
  </Base>
);
