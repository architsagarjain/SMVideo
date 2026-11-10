import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Base, Footage, GradeOverlay} from '../series/core';
import {useT} from '../explainer/kit';
import {ACCENT, Cutaways, SHADOW_TXT, SerifCaps, TopShade, WHITE, outline} from '../minimal/kit';
import {EASE_IN, EASE_OUT, SANS, SERIF, lerp, tween} from '../theme';
import {C, CUTS, TM_M1, m1Config as cfg} from './config';

const vis = (t: number, w: {start: number; end: number}) => (t < w.start || t > w.end + 0.25 ? 0 : tween(t, w.start, 0.3, EASE_OUT) * (1 - tween(t, w.end - 0.05, 0.25, EASE_IN)));
const rise = (t: number, at: number): React.CSSProperties => {
  const p = tween(t, at, 0.4, EASE_OUT);
  return {opacity: p, translate: `0 ${lerp(p, 18, 0)}px`, filter: `blur(${(1 - p) * 6}px)`};
};
const Small: React.FC<{children: React.ReactNode; color?: string}> = ({children, color = WHITE}) => (
  <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 34, letterSpacing: 6, color, ...outline(34), textTransform: 'uppercase'}}>{children}</div>
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

/** 4 · Thyroid: the full panel, not just TSH (same look as the report insert). */
const Panel: React.FC = () => {
  const t = useT();
  const w = C.panel;
  if (t < w.start - 0.05 || t > w.end + 0.05) return null;
  const k = tween(t, w.start, 0.25, EASE_OUT);
  const rows = [
    {n: 'TSH', at: 50.4},
    {n: 'Free T3', at: 50.6},
    {n: 'Free T4', at: 50.8},
    {n: 'Thyroid antibodies', at: 51.0},
  ];
  const not = tween(t, 52.72, 0.3, EASE_OUT);
  return (
    <AbsoluteFill style={{background: '#EEEBE4', opacity: Math.min(1, k * 2) * (1 - tween(t, w.end - 0.12, 0.12))}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center', ...rise(t, w.start + 0.05)}}>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 32, letterSpacing: 8, color: '#8A857C'}}>4 · THYROID</div>
        <div style={{fontFamily: SERIF, fontSize: 96, lineHeight: 1.05, color: '#141414', marginTop: 10}}>The full panel</div>
      </div>
      <div style={{position: 'absolute', left: 170, right: 170, top: 640, display: 'flex', flexDirection: 'column', gap: 18}}>
        {rows.map((r, i) => (
          <div key={r.n} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 34px', borderRadius: 20, background: '#FFFFFF', boxShadow: '0 16px 30px -20px rgba(0,0,0,0.35)', fontFamily: SANS, fontSize: 44, fontWeight: 800, color: '#141414', ...rise(t, r.at)}}>
            <span>{r.n}</span>
            {i === 0 ? <span style={{fontSize: 28, fontWeight: 700, color: '#8A857C', opacity: not}}>not just this</span> : <span style={{fontSize: 34, color: '#1F8A4C'}}>✓</span>}
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
      <div style={{position: 'absolute', left: x(0), top: 298, width: W * line, height: 6, borderRadius: 3, background: '#FFFFFF', boxShadow: '0 0 0 2px rgba(12,12,12,0.5), 0 3px 12px rgba(0,0,0,0.5)'}} />
      {[0, 25, 50, 75, 100].map((v) => (
        <div key={v} style={{position: 'absolute', left: x(v) - 1, top: 292, width: 3, height: 22, background: '#FFFFFF', boxShadow: '0 0 0 1.5px rgba(12,12,12,0.5)', opacity: line}} />
      ))}
      {[{v: 30, p: m30, label: 'Lab normal', c: WHITE}, {v: 60, p: m60, label: 'Aim here', c: ACCENT}].map((m) =>
        m.p > 0 ? (
          <div key={m.v} style={{position: 'absolute', left: x(m.v), top: 302, translate: '-50% 0', display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: m.p}}>
            <div style={{width: 26, height: 26, borderRadius: '50%', background: m.c, translate: '0 -13px', scale: lerp(m.p, 0.4, 1), boxShadow: SHADOW_TXT}} />
            <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 96, lineHeight: 1, color: m.c, ...outline(96), marginTop: 8}}>{m.v}</div>
            <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 38, color: m.c, ...outline(38)}}>{m.label}</div>
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
            <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 42, color: WHITE, ...outline(42)}}>{it.label}</div>
            <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 120, lineHeight: 1.05, color: ACCENT, ...outline(120)}}>{it.value}</div>
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
          <div key={g.s} style={{padding: '12px 30px', borderRadius: 999, border: '2px solid rgba(255,255,255,0.75)', background: 'rgba(0,0,0,0.38)', fontFamily: SANS, fontWeight: 700, fontSize: 40, color: WHITE, ...outline(40), ...rise(t, g.at)}}>
            {g.s}
          </div>
        ))}
        <div style={{marginTop: 8, padding: '12px 30px', borderRadius: 999, background: ACCENT, fontFamily: SANS, fontWeight: 800, fontSize: 40, color: '#141414', ...rise(t, 58.54)}}>+ Ask for antibodies</div>
      </div>
    </AbsoluteFill>
  );
};

/** Ending: a blood-sample tube fills, its lab sticker lands, and "Comment TEST" types in beside it. */
const SampleEnd: React.FC = () => {
  const t = useT();
  const s0 = C.cta.start;
  if (t < s0) return null;
  const k = tween(t, s0, 0.35, EASE_OUT);
  const fill = tween(t, s0 + 0.15, 0.7, EASE_OUT);
  const sticker = tween(t, 68.7, 0.3, EASE_OUT);
  const word = 'TEST';
  const note = tween(t, 69.6, 0.4, EASE_OUT);
  const TW = 150;
  const TH = 430;
  const liquidH = (TH - 80) * 0.78 * fill;
  return (
    <AbsoluteFill style={{opacity: k}}>
      {/* the tube */}
      <div style={{position: 'absolute', left: 120, top: 70, width: TW, height: TH, translate: `0 ${lerp(k, -30, 0)}px`}}>
        <svg width={TW} height={TH} viewBox={`0 0 ${TW} ${TH}`} style={{position: 'absolute', inset: 0, overflow: 'visible', filter: 'drop-shadow(0 10px 18px rgba(0,0,0,0.45))'}}>
          <defs>
            <clipPath id="tube">
              <path d={`M 22 70 L 22 ${TH - 75} A 53 53 0 0 0 128 ${TH - 75} L 128 70 Z`} />
            </clipPath>
          </defs>
          <path d={`M 22 70 L 22 ${TH - 75} A 53 53 0 0 0 128 ${TH - 75} L 128 70 Z`} fill="rgba(255,255,255,0.22)" />
          <g clipPath="url(#tube)">
            <rect x={0} y={TH - 22 - liquidH} width={TW} height={liquidH + 30} fill="#C9302C" />
            <rect x={0} y={TH - 22 - liquidH} width={TW} height={8} fill="#E14B45" />
          </g>
          <path d={`M 22 70 L 22 ${TH - 75} A 53 53 0 0 0 128 ${TH - 75} L 128 70`} fill="none" stroke="#FFFFFF" strokeWidth={6} />
          <rect x={30} y={90} width={10} height={TH - 200} rx={5} fill="rgba(255,255,255,0.55)" />
          {/* cap */}
          <rect x={12} y={18} width={126} height={60} rx={14} fill="#7A1E1E" />
          <rect x={12} y={18} width={126} height={14} rx={7} fill="#9C2B2B" />
        </svg>
        {/* lab sticker */}
        <div style={{position: 'absolute', left: -14, top: 150, width: TW + 28, padding: '10px 10px 8px', background: '#FFFFFF', borderRadius: 6, boxShadow: '0 8px 16px -8px rgba(0,0,0,0.5)', opacity: sticker, scale: lerp(sticker, 1.3, 1), boxSizing: 'border-box'}}>
          <svg width={TW + 8} height={34}>
            {Array.from({length: 30}, (_, i) => (
              <rect key={i} x={i * 5.2} y={0} width={[2, 3, 1.5, 2.5][i % 4]} height={34} fill="#141414" />
            ))}
          </svg>
          <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 26, letterSpacing: 4, color: '#141414', textAlign: 'center', marginTop: 4}}>TEST</div>
        </div>
      </div>
      {/* the words */}
      <div style={{position: 'absolute', left: 340, right: 50, top: 110, display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 70, color: WHITE, ...outline(70), ...rise(t, s0 + 0.1)}}>Comment</div>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 200, lineHeight: 1, letterSpacing: 8, color: ACCENT, ...outline(200), minHeight: 200}}>
          {word.split('').map((ch, i) => {
            const p = tween(t, 68.82 + i * 0.08, 0.22, EASE_OUT);
            return (
              <span key={i} style={{display: 'inline-block', opacity: p, translate: `0 ${lerp(p, 30, 0)}px`}}>
                {ch}
              </span>
            );
          })}
        </div>
        <div style={{marginTop: 18, fontFamily: SANS, fontWeight: 800, fontSize: 38, lineHeight: 1.2, color: WHITE, ...outline(38), opacity: note, translate: `0 ${lerp(note, 14, 0)}px`}}>
          for the full test panel
          <br />
          in your DMs
        </div>
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
    <Panel />
    <TopShade wins={[C.cta]} reach={36} />
    <SampleEnd />
    <SerifCaps cfg={cfg} hide={[...LINED, C.report, C.panel, {start: C.cta.start + 0.1, end: 999}]} />
  </>
);

export const M1Reel: React.FC = () => (
  <Base cfg={cfg}>
    <Scene />
  </Base>
);
