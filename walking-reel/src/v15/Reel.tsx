import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Base, BrollCuts, Footage, GradeOverlay, Subject, inWin} from '../series/core';
import {useT} from '../explainer/kit';
import {Ico, popAt} from '../series/kit2';
import {CARD_SHADOW, Card, H, HL, Hi, INK, Kicker, MUTED, PillCaps, Pop, Tag, TopWash, winVis} from '../series/kit3';
import {EASE_IN_OUT, EASE_OUT, SANS, lerp, tween} from '../theme';
import {C, v15Config as cfg} from './config';

const NIGHT = '#2B3256';
const MOON = '#C9D2FF';
const GREEN = '#17A34A';

// ---------------------------------------------------------------------------
// Signature 1: the night timeline (11 pm - 7 am)
// ---------------------------------------------------------------------------
const HOURS = ['11', '12', '1', '2', '3', '4', '5', '6'];
const Night: React.FC<{t: number; cut: number; w?: number}> = ({t, cut, w = 900}) => {
  const bw = (w - 60 - 7 * 8) / 8;
  return (
    <div style={{display: 'flex', gap: 8}}>
      {HOURS.map((h, i) => {
        const last = i === 7;
        const k = popAt(t, 1.1 + i * 0.06);
        const gone = last ? cut : 0;
        return (
          <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8}}>
            <div style={{position: 'relative', width: bw, height: 110, borderRadius: 16, background: '#EEF0FA', overflow: 'hidden', scale: Math.max(0, Math.min(1, k))}}>
              <div style={{position: 'absolute', inset: 0, borderRadius: 16, background: NIGHT, opacity: 1 - gone, translate: `0 ${gone * -40}px`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Ico name={i === 0 ? 'moon-stars' : 'moon'} size={44} color={MOON} />
              </div>
              {last && cut > 0.5 ? (
                <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 30, color: '#E5484D'}}>−1h</div>
              ) : null}
            </div>
            <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 22, color: MUTED}}>{h}</span>
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Signature 3: the lab beakers - what the lost weight was made of, poured in layers
// (fat floats on top, lean mass settles underneath)
// ---------------------------------------------------------------------------
const BW = 170;
const BH = 240;
const wave = (y: number, amp: number, ph: number) => {
  let d = `M -10 ${y}`;
  for (let i = 0; i <= 24; i++) {
    const x = -10 + (i / 24) * (BW + 20);
    d += ` L ${x.toFixed(1)} ${(y + Math.sin(ph + (i / 24) * Math.PI * 3) * amp).toFixed(1)}`;
  }
  return d + ` L ${BW + 10} ${BH + 10} L -10 ${BH + 10} Z`;
};
const Beaker: React.FC<{t: number; id: string; fat: number; pf: number; pl: number}> = ({t, id, fat, pf, pl}) => {
  const lean = 100 - fat;
  const IN = BH - 26; // usable height
  const hl = IN * (lean / 100) * pl;
  const hf = IN * (fat / 100) * pf;
  // the surface sloshes while liquid is pouring in, then settles
  const amp = 3 + 8 * Math.sin(Math.PI * pf) + 8 * Math.sin(Math.PI * pl);
  const yl = BH - hl;
  const yf = BH - hl - hf;
  const ph = t * 4.2;
  const bubbles = [0.15, 0.4, 0.62, 0.83, 0.28, 0.72];
  return (
    <svg width={BW + 30} height={BH + 24} viewBox={`-15 -12 ${BW + 30} ${BH + 24}`} style={{overflow: 'visible'}}>
      <defs>
        <clipPath id={`bk-${id}`}>
          <path d={`M 4 0 L 4 ${BH - 30} Q 4 ${BH} 34 ${BH} L ${BW - 34} ${BH} Q ${BW - 4} ${BH} ${BW - 4} ${BH - 30} L ${BW - 4} 0 Z`} />
        </clipPath>
      </defs>
      <g clipPath={`url(#bk-${id})`}>
        <rect x={0} y={0} width={BW} height={BH} fill="#F6F7FB" />
        {hf + hl > 0.5 ? <path d={wave(yf, amp + 2, ph)} fill={HL} /> : null}
        {hl > 0.5 ? <path d={wave(yl, 3, ph * 0.8 + 1.3)} fill={INK} /> : null}
        {bubbles.map((bx, i) => {
          const life = ((t * 0.55 + i * 0.37) % 1);
          const by = BH - life * (hl + hf);
          return hl + hf > 30 ? <circle key={i} cx={bx * BW} cy={by} r={4 + (i % 3) * 2} fill="#fff" opacity={0.35 * (1 - life)} /> : null;
        })}
      </g>
        {[{p: pf, c: HL}, {p: pl, c: INK}].map((st, i) =>
          st.p > 0 && st.p < 0.97 ? <rect key={`s${i}`} x={BW / 2 - 8 * Math.min(1, (1 - st.p) * 6) + Math.sin(t * 9) * 1.5} y={-60} width={16 * Math.min(1, (1 - st.p) * 6)} height={yf + 66} rx={8} fill={st.c} /> : null,
        )}
      {[0.25, 0.5, 0.75].map((k, i) => (
        <line key={i} x1={BW - 4} x2={BW - 30} y1={BH - IN * k} y2={BH - IN * k} stroke="#C9CCD8" strokeWidth={4} strokeLinecap="round" />
      ))}
      <path d={`M -8 -4 L 4 4 L 4 ${BH - 30} Q 4 ${BH} 34 ${BH} L ${BW - 34} ${BH} Q ${BW - 4} ${BH} ${BW - 4} ${BH - 30} L ${BW - 4} -4`} fill="none" stroke={INK} strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" />
      <rect x={16} y={14} width={10} height={BH - 70} rx={5} fill="#fff" opacity={0.55} />
    </svg>
  );
};
const Pour: React.FC<{t: number; id: string; fat: number; atF: number; atL: number; label: string; icon: string; live: number}> = ({t, id, fat, atF, atL, label, icon, live}) => {
  const pf = tween(t, atF, 1.1, EASE_IN_OUT);
  const pl = tween(t, atL, 1.1, EASE_IN_OUT);
  const row = (v: number, p: number, bg: string, fg: string, name: string) => (
    <div style={{display: 'flex', alignItems: 'baseline', gap: 10, opacity: p > 0 ? 1 : 0.25}}>
      <span style={{minWidth: 128, padding: '2px 12px', borderRadius: 12, background: p > 0 ? bg : '#ECE8E1', color: p > 0 ? fg : MUTED, fontFamily: SANS, fontWeight: 800, fontSize: 48, letterSpacing: -1, textAlign: 'center', boxSizing: 'border-box'}}>{Math.round(v * p)}%</span>
      <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 30}}>{name}</span>
    </div>
  );
  return (
    <div style={{display: 'flex', alignItems: 'flex-end', gap: 16, opacity: lerp(live, 0.3, 1)}}>
      <Beaker t={t} id={id} fat={fat} pf={pf} pl={pl} />
      <div style={{display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 10}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6}}>
          <div style={{width: 48, height: 48, borderRadius: 14, background: NIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Ico name={icon} size={30} color={MOON} />
          </div>
          <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 28, whiteSpace: 'nowrap'}}>{label}</span>
        </div>
        {row(fat, pf, HL, INK, 'Fat')}
        {row(100 - fat, pl, INK, '#fff', 'Lean')}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
const Hook: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.hook, 0.01);
  if (o <= 0) return null;
  const cut = tween(t, 2.6, 0.5, EASE_IN_OUT);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pop x={540} y={330} at={0.96}>
        <Card w={960} pad={30}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18}}>
            <H size={56}>
              8 h → <Hi p={tween(t, 2.9, 0.3)}>7 h</Hi>
            </H>
            {t >= 4.7 ? (
              <div style={{display: 'flex', alignItems: 'center', gap: 10, opacity: tween(t, 4.7, 0.3)}}>
                <Ico name="fire" size={44} color={tween(t, 5.46, 0.5) > 0.5 ? '#C8C2B8' : '#FF6B1A'} />
                <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 32, color: tween(t, 5.46, 0.5) > 0.5 ? '#B5AFA5' : INK}}>Fat Loss</span>
              </div>
            ) : null}
          </div>
          <Night t={t} cut={cut} />
        </Card>
      </Pop>
    </AbsoluteFill>
  );
};
const Two: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.two);
  if (o <= 0) return null;
  const split = tween(t, 10.12, 0.5, EASE_IN_OUT);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pop x={540} y={160} at={7.96}>
        <Card w={420} pad={20} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14}}>
          <Ico name="scales" size={56} color={INK} />
          <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 40}}>Weight Lost</span>
        </Card>
      </Pop>
      {[
        {x: 300, at: 11.4, icon: 'drop', label: 'BODY FAT', bg: HL},
        {x: 780, at: 12.48, icon: 'barbell', label: 'MUSCLE', bg: '#fff'},
      ].map((c, i) => (
        <div key={i} style={{position: 'absolute', left: lerp(split, 540, c.x), top: 420, translate: '-50% -50%', opacity: split}}>
          <Pop x={0} y={0} at={c.at}>
            <Card w={360} pad={26} style={{background: c.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
              <Ico name={c.icon} size={90} color={INK} />
              <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 40}}>{c.label}</span>
            </Card>
          </Pop>
        </div>
      ))}
      {split > 0 ? (
        <svg width={1080} height={700} style={{position: 'absolute', left: 0, top: 0, opacity: split}}>
          <path d="M540 205 C 540 260, 300 260, 300 300" fill="none" stroke={INK} strokeWidth={6} strokeDasharray="2 14" strokeLinecap="round" />
          <path d="M540 205 C 540 260, 780 260, 780 300" fill="none" stroke={INK} strokeWidth={6} strokeDasharray="2 14" strokeLinecap="round" />
        </svg>
      ) : null}
    </AbsoluteFill>
  );
};
const Control: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.control);
  if (o <= 0) return null;
  const ang = lerp(tween(t, 15.0, 1.8, EASE_IN_OUT), -60, 55) + Math.sin(t * 3) * 4;
  const lab = {fontFamily: SANS, fontWeight: 800, fontSize: 26, letterSpacing: 5, fill: MUTED} as const;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pop x={540} y={330} at={14.3}>
        <Card w={720} pad={30} style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <H size={50}>
            Sleep <Hi p={tween(t, 15.74, 0.3)}>steers it</Hi>
          </H>
          <div style={{position: 'relative', width: 600, height: 262, marginTop: 26}}>
            <svg width={600} height={262} viewBox="-300 -210 600 262">
              <path d="M-180 0 A180 180 0 0 1 180 0" fill="none" stroke="#ECE8E1" strokeWidth={26} strokeLinecap="round" />
              <path d="M-180 0 A180 180 0 0 1 0 -180" fill="none" stroke={HL} strokeWidth={26} strokeLinecap="round" />
              <g style={{rotate: `${ang}deg`}}>
                <line x1={0} y1={0} x2={0} y2={-150} stroke={INK} strokeWidth={12} strokeLinecap="round" />
              </g>
              <circle r={34} fill={NIGHT} />
              <text x={-180} y={46} textAnchor="middle" {...lab}>FAT</text>
              <text x={180} y={46} textAnchor="middle" {...lab}>MUSCLE</text>
            </svg>
            <div style={{position: 'absolute', left: 300 - 22, top: 210 - 22, width: 44, height: 44}}>
              <Ico name="moon" size={44} color={MOON} />
            </div>
          </div>
        </Card>
      </Pop>
    </AbsoluteFill>
  );
};
const Study: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.study);
  if (o <= 0) return null;
  const nights = (less: boolean, at: number) => (
    <div style={{display: 'flex', gap: 8}}>
      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => {
        const short = less && i < 5;
        return (
          <div key={i} style={{width: 62, height: 78, borderRadius: 14, background: NIGHT, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, scale: Math.max(0, popAt(t, at + i * 0.06)), position: 'relative'}}>
            <Ico name="moon" size={30} color={MOON} />
            <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 18, color: MOON}}>{d}</span>
            {short && t >= 32.64 ? <div style={{position: 'absolute', right: -6, top: -8, padding: '2px 6px', borderRadius: 8, background: '#E5484D', color: '#fff', fontFamily: SANS, fontWeight: 800, fontSize: 16, scale: Math.max(0, popAt(t, 32.7 + i * 0.08))}}>−1h</div> : null}
          </div>
        );
      })}
    </div>
  );
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pop x={540} y={110} at={21.74}>
        <Tag size={32}>
          <Ico name="magnifying-glass" size={34} color="#fff" /> THE STUDY
        </Tag>
      </Pop>
      <Pop x={540} y={390} at={24.98}>
        <Card w={960} pad={28}>
          {[
            {name: 'GROUP A', less: false, at: 25.1, note: 'Full Nights'},
            {name: 'GROUP B', less: true, at: 25.4, note: 'Short Nights'},
          ].map((g, i) => (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 22, padding: '14px 0', borderBottom: i === 0 ? '3px solid #EFEBE4' : undefined}}>
              <div style={{width: 200}}>
                <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 32}}>{g.name}</div>
                <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 24, color: MUTED}}>{g.note}</div>
              </div>
              {nights(g.less, g.at)}
            </div>
          ))}
          {t >= 27.58 ? (
            <div style={{marginTop: 16, display: 'flex', justifyContent: 'center', opacity: tween(t, 27.58, 0.3)}}>
              <Tag bg={HL} fg={INK} size={30}>
                <Ico name="equals" size={32} color={INK} /> Identical Diets
              </Tag>
            </div>
          ) : null}
        </Card>
      </Pop>
    </AbsoluteFill>
  );
};
const Same: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.same);
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pop x={540} y={110} at={37.04}>
        <Tag size={32}>
          <Ico name="calendar-check" size={34} color="#fff" /> THE RESULT
        </Tag>
      </Pop>
      {['A', 'B'].map((g, i) => (
        <Pop key={i} x={i ? 790 : 290} y={380} at={38.38 + i * 0.3}>
          <Card w={380} pad={26} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
            <Ico name="scales" size={96} color={INK} />
            <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 34}}>Group {g}</span>
            {t >= 40.26 ? <span style={{padding: '4px 16px', borderRadius: 10, background: HL, fontFamily: SANS, fontWeight: 800, fontSize: 30}}>▼ Same</span> : null}
          </Card>
        </Pop>
      ))}
      {t >= 40.26 ? (
        <Pop x={540} y={380} at={40.26}>
          <div style={{width: 100, height: 100, borderRadius: '50%', background: INK, border: '6px solid #fff', boxShadow: CARD_SHADOW, display: 'flex', alignItems: 'center', justifyContent: 'center', color: HL, fontFamily: SANS, fontWeight: 800, fontSize: 64}}>=</div>
        </Pop>
      ) : null}
    </AbsoluteFill>
  );
};
const Comp: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.comp);
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pop x={540} y={345} at={44.74}>
        <Card w={980} pad={28}>
          <div style={{display: 'flex', justifyContent: 'center', marginBottom: 14}}>
            <H size={50}>
              What was <Hi p={tween(t, 46.32, 0.3)}>actually lost</Hi>
            </H>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <Pour t={t} id="a" fat={83} atF={52.6} atL={57.3} label="Full Nights" icon="moon-stars" live={1} />
            <Pour t={t} id="b" fat={15} atF={67.92} atL={64.4} label="−1 h Nights" icon="moon" live={tween(t, 60.06, 0.4, EASE_OUT)} />
          </div>
        </Card>
      </Pop>
    </AbsoluteFill>
  );
};
const Lift: React.FC = () => {
  const t = useT();
  const o = winVis(t, {start: C.lift.start, end: C.liftBroll.start});
  const o2 = winVis(t, {start: C.liftBroll.end, end: C.lift.end});
  return (
    <AbsoluteFill>
      {o > 0 ? (
        <AbsoluteFill style={{opacity: o}}>
          <Pop x={540} y={330} at={70.8}>
            <Card w={760} pad={30} style={{display: 'flex', alignItems: 'center', gap: 20}}>
              <Ico name="warning-circle" size={70} color={INK} />
              <div>
                <Kicker>ONE CATCH</Kicker>
                <H size={50}>
                  <Hi p={tween(t, 73.64, 0.3)}>No weights</Hi> in this study
                </H>
              </div>
            </Card>
          </Pop>
        </AbsoluteFill>
      ) : null}
      {o2 > 0 ? (
        <AbsoluteFill style={{opacity: o2}}>
          <Pop x={540} y={330} at={C.liftBroll.end}>
            <Tag bg={HL} fg={INK} size={40}>
              <Ico name="barbell" size={44} color={INK} /> Muscle Insurance
            </Tag>
          </Pop>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
const LiftTag: React.FC = () => {
  const t = useT();
  if (!inWin(t, [C.liftBroll])) return null;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0) 30%)'}} />
      <Pop x={540} y={220} at={C.liftBroll.start + 0.2}>
        <Tag bg={HL} fg={INK} size={44}>
          <Ico name="barbell" size={48} color={INK} /> Strength Training
        </Tag>
      </Pop>
    </AbsoluteFill>
  );
};
const Adapt: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.adapt);
  if (o <= 0) return null;
  const p = tween(t, 83.0, 1.6, EASE_IN_OUT);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pop x={540} y={340} at={82.2}>
        <Card w={860} pad={30}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <H size={48}>
              A <Hi p={tween(t, 84.06, 0.3)}>partial</Hi> bounce-back
            </H>
            {t >= 88.34 ? (
              <div style={{display: 'flex', alignItems: 'center', gap: 8, scale: Math.max(0, popAt(t, 88.34))}}>
                <Ico name="baby-carriage" size={50} color={INK} />
                <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 28}}>New Parents</span>
              </div>
            ) : null}
          </div>
          <svg width={800} height={200} style={{marginTop: 10}}>
            <path d="M20 40 C 160 40, 220 170, 360 170 S 640 110, 780 100" fill="none" stroke={INK} strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
            <text x={20} y={30} fontFamily={SANS} fontWeight={800} fontSize={22} fill={MUTED}>Less Sleep</text>
            <text x={660} y={86} fontFamily={SANS} fontWeight={800} fontSize={22} fill={MUTED} opacity={p}>Over Time</text>
          </svg>
        </Card>
      </Pop>
    </AbsoluteFill>
  );
};
const Dialed: React.FC = () => {
  const t = useT();
  const o = winVis(t, C.dialed);
  if (o <= 0) return null;
  const items = [
    {n: 'Food', icon: 'fork-knife', at: 90.3},
    {n: 'Training', icon: 'barbell', at: 90.6},
    {n: 'Steps', icon: 'sneaker-move', at: 90.9},
    {n: 'Sleep', icon: 'moon', at: 92.18},
  ];
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Pop x={540} y={340} at={89.8}>
        <Card w={900} pad={28}>
          <div style={{display: 'flex', gap: 18}}>
            {items.map((it, i) => {
              const last = i === 3;
              const k = popAt(t, it.at);
              return (
                <div key={i} style={{flex: 1, height: 210, borderRadius: 24, background: last ? (t >= 93.98 ? HL : '#F4F1EB') : '#F4F1EB', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, scale: Math.max(0, Math.min(1.05, k)), position: 'relative'}}>
                  <Ico name={it.icon} size={70} color={INK} />
                  <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 32}}>{it.n}</span>
                  <div style={{position: 'absolute', right: 10, top: 10, width: 44, height: 44, borderRadius: '50%', background: last ? INK : GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: SANS, fontWeight: 800, fontSize: 28}}>
                    {last ? '?' : <Ico name="check-circle" size={34} color="#fff" />}
                  </div>
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
// Signature 4: lights out. The room behind her drops to night (she stays lit) when the hour is cut,
// and again for the ending.
// ---------------------------------------------------------------------------
const DARK = [
  {on: 2.6, off: C.hook.end - 0.2},
  {on: C.cta.start + 0.05, off: 999},
];
const nightAt = (t: number) => {
  let v = 0;
  for (const d of DARK) {
    if (t < d.on) continue;
    const off = tween(t, d.on, 0.14, EASE_OUT);
    // tube lights flicker once as they come back on
    const back = t < d.off ? 0 : t < d.off + 0.08 ? 0.7 : t < d.off + 0.14 ? 0.1 : t < d.off + 0.2 ? 0.45 : tween(t, d.off + 0.2, 0.18, EASE_OUT);
    v = Math.max(v, off * (1 - back));
  }
  return v;
};
const STARS = Array.from({length: 46}, (_, i) => {
  const r = (n: number) => {
    const x = Math.sin(i * 127.1 + n * 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  return {x: r(1) * 1080, y: r(2) * 820, s: 2 + r(3) * 4, ph: r(4) * 6.28, sp: 1.5 + r(5) * 2};
});
const LightsOut: React.FC = () => {
  const t = useT();
  const v = nightAt(t);
  if (v <= 0) return null;
  return (
    <AbsoluteFill style={{opacity: v}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 120% 80% at 50% 70%, rgba(14,18,48,0.62) 0%, rgba(8,10,30,0.86) 100%)'}} />
      {STARS.map((st, i) => (
        <div key={i} style={{position: 'absolute', left: st.x, top: st.y, width: st.s, height: st.s, borderRadius: '50%', background: '#fff', boxShadow: `0 0 ${st.s * 2}px rgba(201,210,255,0.9)`, opacity: (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * st.sp + st.ph))) * tween(t, 0, 1)}} />
      ))}
    </AbsoluteFill>
  );
};

/** Ending: lock screen at bedtime. The clock ticks over, she types the keyword, the guide lands as a notification. */
const NightCta: React.FC = () => {
  const t = useT();
  const s0 = C.cta.start;
  if (t < s0) return null;
  const word = 'SLEEP';
  const typeAt = 96.26;
  const dmAt = 97.4;
  const typed = word.slice(0, Math.max(0, Math.min(word.length, Math.floor((t - typeAt) / 0.07) + 1)));
  const sent = tween(t, typeAt + word.length * 0.07 + 0.25, 0.25, EASE_OUT);
  const dm = tween(t, dmAt, 0.5, EASE_OUT);
  const head = tween(t, s0 + 0.15, 0.5, EASE_OUT);
  const bar = tween(t, s0 + 0.35, 0.45, EASE_OUT);
  const flip = tween(t, dmAt - 0.05, 0.3, EASE_IN_OUT); // 10:59 -> 11:00
  const digit = (a: string, b: string) => (
    <span style={{display: 'inline-block', position: 'relative', overflow: 'hidden', width: '0.6em', textAlign: 'center', height: '1.04em', lineHeight: 1.04, verticalAlign: 'top'}}>
      <span style={{display: 'block', translate: `0 ${-flip * 100}%`}}>{a}</span>
      <span style={{display: 'block', position: 'absolute', left: 0, right: 0, top: '100%', translate: `0 ${-flip * 100}%`}}>{b}</span>
    </span>
  );
  return (
    <AbsoluteFill style={{fontFamily: SANS, color: '#fff'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: head, translate: `0 ${lerp(head, -20, 0)}px`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 32, fontWeight: 700, color: MOON, letterSpacing: 1}}>
          <Ico name="lock-simple" size={30} color={MOON} /> Tonight · Lights Out
        </div>
        <div style={{fontSize: 176, fontWeight: 300, letterSpacing: -6, lineHeight: 1, marginTop: 4, textShadow: '0 6px 30px rgba(0,0,0,0.35)'}}>
          {digit('1', '1')}{digit('0', '1')}:{digit('5', '0')}{digit('9', '0')}
        </div>
      </div>
      <div style={{position: 'absolute', left: 120, top: 304, width: 840, height: 112, borderRadius: 56, background: 'rgba(255,255,255,0.16)', border: '2px solid rgba(255,255,255,0.22)', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 20, padding: '0 14px 0 20px', opacity: bar, translate: `0 ${lerp(bar, 24, 0)}px`}}>
        <Ico name="chat-circle-dots" size={46} color="#fff" />
        <div style={{flex: 1, fontSize: 48, fontWeight: 800, letterSpacing: typed ? 3 : 0, color: typed ? '#fff' : 'rgba(255,255,255,0.55)'}}>
          {typed ? (
            <span style={{color: sent > 0.5 ? INK : '#fff'}}>
              <Hi p={sent}>{typed}</Hi>
            </span>
          ) : (
            'Add a comment…'
          )}
        </div>
        <div style={{width: 80, height: 80, borderRadius: '50%', background: sent > 0 ? HL : 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', scale: 1 + 0.18 * Math.sin(Math.PI * sent)}}>
          <Ico name="paper-plane-right" size={42} color={sent > 0 ? INK : '#fff'} />
        </div>
      </div>
      {dm > 0 ? (
        <div style={{position: 'absolute', left: 120, top: 436, width: 840, opacity: Math.min(1, dm * 1.6), translate: `0 ${lerp(dm, -150, 0)}px`, scale: lerp(dm, 0.9, 1), display: 'flex', alignItems: 'center', gap: 20, padding: 18, boxSizing: 'border-box', borderRadius: 32, background: 'rgba(250,250,252,0.96)', boxShadow: '0 24px 60px -18px rgba(0,0,0,0.6)', color: INK}}>
          <div style={{width: 84, height: 84, borderRadius: 22, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
            <Ico name="file-pdf" size={52} color={HL} />
          </div>
          <div style={{flex: 1}}>
            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 26, fontWeight: 700, color: MUTED}}>
              <span>New Message</span>
              <span>now</span>
            </div>
            <div style={{fontSize: 38, fontWeight: 800, whiteSpace: 'nowrap'}}>Your Free Fat Loss Guide ✓</div>
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
const WASH = [C.hook, C.two, C.control, C.study, C.same, C.comp, {start: C.lift.start, end: C.liftBroll.start}, {start: C.liftBroll.end, end: C.lift.end}, C.adapt, C.dialed, C.cta];
/** The white top wash steps aside while the lights are out. */
const WashDim: React.FC<{children: React.ReactNode}> = ({children}) => {
  const t = useT();
  return <AbsoluteFill style={{opacity: 1 - nightAt(t)}}>{children}</AbsoluteFill>;
};
const Scene: React.FC = () => (
  <>
    <Footage cfg={cfg} />
    <GradeOverlay cfg={cfg} />
    <LightsOut />
    <WashDim>
      <TopWash wins={WASH} reach={48} />
    </WashDim>
    <Hook />
    <Two />
    <Control />
    <Study />
    <Same />
    <Comp />
    <Lift />
    <Adapt />
    <Dialed />
    <NightCta />
    <Subject cfg={cfg} />
    <BrollCuts cfg={cfg} />
    <LiftTag />
    <PillCaps cfg={cfg} hide={[{start: C.cta.start + 0.3, end: 999}]} y={() => 1560} />
  </>
);

export const V15Reel: React.FC = () => (
  <Base cfg={{...cfg, shakes: [2.6, 92.18]}}>
    <Scene />
  </Base>
);

