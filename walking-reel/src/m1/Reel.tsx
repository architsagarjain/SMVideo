import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Base, Footage, GradeOverlay} from '../series/core';
import {useT} from '../explainer/kit';
import {ACCENT, CommentEnd, Cutaways, SHADOW_TXT, SerifCaps, TopShade, WHITE} from '../minimal/kit';
import {EASE_IN, EASE_OUT, SANS, SERIF, lerp, tween} from '../theme';
import {C, CUTS, TM_M1, m1Config as cfg} from './config';

const vis = (t: number, w: {start: number; end: number}) => (t < w.start || t > w.end + 0.25 ? 0 : tween(t, w.start, 0.3, EASE_OUT) * (1 - tween(t, w.end - 0.05, 0.25, EASE_IN)));
const rise = (t: number, at: number): React.CSSProperties => {
  const p = tween(t, at, 0.4, EASE_OUT);
  return {opacity: p, translate: `0 ${lerp(p, 18, 0)}px`, filter: `blur(${(1 - p) * 6}px)`};
};
const Small: React.FC<{children: React.ReactNode; color?: string}> = ({children, color = 'rgba(255,255,255,0.8)'}) => (
  <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 30, letterSpacing: 6, color, textShadow: SHADOW_TXT, textTransform: 'uppercase'}}>{children}</div>
);

/** Hook insert: the report that says everything is normal. */
const Report: React.FC = () => {
  const t = useT();
  const w = C.report;
  if (t < w.start - 0.05 || t > w.end + 0.05) return null;
  const k = tween(t, w.start, 0.25, EASE_OUT);
  const rows = ['Haemoglobin', 'Blood Sugar', 'Thyroid', 'Vitamin D', 'Liver'];
  return (
    <AbsoluteFill style={{background: '#EEEBE4', opacity: Math.min(1, k * 2) * (1 - tween(t, w.end - 0.12, 0.12))}}>
      <div style={{position: 'absolute', left: 140, right: 140, top: 520, background: '#fff', borderRadius: 18, padding: '44px 50px', boxShadow: '0 30px 60px -30px rgba(0,0,0,0.35)', translate: `0 ${lerp(k, 40, 0)}px`}}>
        <div style={{fontFamily: SERIF, fontSize: 64, color: '#141414'}}>Blood Report</div>
        <div style={{height: 2, background: '#141414', margin: '18px 0 10px'}} />
        {rows.map((r, i) => (
          <div key={r} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 84, borderBottom: i < rows.length - 1 ? '1px solid #E3DFD7' : undefined, fontFamily: SANS, fontSize: 34, color: '#141414'}}>
            <span style={{fontWeight: 600}}>{r}</span>
            <span style={{fontWeight: 700, color: '#1F8A4C', opacity: tween(t, w.start + 0.2 + i * 0.12, 0.2)}}>Normal ✓</span>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/** Vitamin D: lab normal starts at 30, aim closer to 60. */
const VitD: React.FC = () => {
  const t = useT();
  const o = vis(t, C.vitd);
  if (o <= 0) return null;
  const L = 120;
  const W = 840;
  const x = (v: number) => L + (v / 100) * W;
  const m30 = tween(t, 16.28, 0.4, EASE_OUT);
  const m60 = tween(t, 20.7, 0.4, EASE_OUT);
  const line = tween(t, C.vitd.start + 0.1, 0.6, EASE_OUT);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center', ...rise(t, C.vitd.start)}}>
        <Small>Vitamin D · ng/mL</Small>
      </div>
      <div style={{position: 'absolute', left: x(0), top: 300, width: W * line, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.85)', boxShadow: SHADOW_TXT}} />
      {[0, 25, 50, 75, 100].map((v) => (
        <div key={v} style={{position: 'absolute', left: x(v) - 1, top: 292, width: 2, height: 20, background: 'rgba(255,255,255,0.7)', opacity: line}} />
      ))}
      {[{v: 30, p: m30, label: 'Lab normal', c: WHITE}, {v: 60, p: m60, label: 'Aim here', c: ACCENT}].map((m) =>
        m.p > 0 ? (
          <div key={m.v} style={{position: 'absolute', left: x(m.v), top: 302, translate: '-50% 0', display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: m.p}}>
            <div style={{width: 26, height: 26, borderRadius: '50%', background: m.c, translate: '0 -13px', scale: lerp(m.p, 0.4, 1), boxShadow: SHADOW_TXT}} />
            <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 96, lineHeight: 1, color: m.c, textShadow: SHADOW_TXT, marginTop: 8}}>{m.v}</div>
            <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 40, color: m.c, textShadow: SHADOW_TXT}}>{m.label}</div>
          </div>
        ) : null,
      )}
    </AbsoluteFill>
  );
};

/** Two targets side by side. */
const Targets: React.FC<{w: {start: number; end: number}; title: string; items: {label: string; value: string; at: number}[]}> = ({w, title, items}) => {
  const t = useT();
  const o = vis(t, w);
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center', ...rise(t, w.start)}}>
        <Small>{title}</Small>
      </div>
      <div style={{position: 'absolute', left: 60, right: 60, top: 200, display: 'flex', justifyContent: 'center', gap: 90}}>
        {items.map((it) => (
          <div key={it.label} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', ...rise(t, it.at)}}>
            <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 46, color: WHITE, textShadow: SHADOW_TXT}}>{it.label}</div>
            <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 120, lineHeight: 1.05, color: ACCENT, textShadow: SHADOW_TXT}}>{it.value}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/** Thyroid: the signs, then "ask for the antibodies". */
const Thyroid: React.FC = () => {
  const t = useT();
  const o = vis(t, C.thyroid);
  if (o <= 0) return null;
  const signs = [
    {s: 'Hair fall', at: 54.86},
    {s: 'Weight up & down', at: 55.6},
    {s: 'Irregular periods', at: 57.08},
  ];
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 110, textAlign: 'center', ...rise(t, C.thyroid.start)}}>
        <Small>Signs to watch</Small>
      </div>
      <div style={{position: 'absolute', left: 60, right: 60, top: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16}}>
        {signs.map((g) => (
          <div key={g.s} style={{padding: '12px 30px', borderRadius: 999, border: '2px solid rgba(255,255,255,0.75)', background: 'rgba(0,0,0,0.18)', fontFamily: SANS, fontWeight: 700, fontSize: 40, color: WHITE, textShadow: SHADOW_TXT, ...rise(t, g.at)}}>
            {g.s}
          </div>
        ))}
        <div style={{marginTop: 8, padding: '12px 30px', borderRadius: 999, background: ACCENT, fontFamily: SANS, fontWeight: 800, fontSize: 40, color: '#141414', ...rise(t, 58.54)}}>+ Ask for antibodies</div>
      </div>
    </AbsoluteFill>
  );
};

const LINED = CUTS.filter((c) => c.line);
const Scene: React.FC = () => (
  <>
    <Footage cfg={cfg} />
    <GradeOverlay cfg={cfg} />
    <TopShade wins={[C.vitd, C.sugar, C.liver, C.thyroid]} reach={40} />
    <VitD />
    <Targets w={C.sugar} title="Your targets" items={[{label: 'HbA1c', value: '< 5.4', at: 25.72}, {label: 'Fasting insulin', value: '< 7', at: 29.02}]} />
    <Targets w={C.liver} title="3 · Liver" items={[{label: 'SGOT · SGPT', value: '< 25', at: 39.86}]} />
    <Thyroid />
    <Cutaways cuts={CUTS} tm={TM_M1} dir="m1" />
    <Report />
    <CommentEnd start={C.cta.start} word="TEST" wordAt={68.82} note="Full test panel → your DMs" noteAt={69.6} />
    <SerifCaps cfg={cfg} hide={[...LINED, C.report, {start: C.cta.start + 0.1, end: 999}]} />
  </>
);

export const M1Reel: React.FC = () => (
  <Base cfg={cfg}>
    <Scene />
  </Base>
);
