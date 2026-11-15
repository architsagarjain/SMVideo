import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, staticFile} from 'remotion';
import {Base, Footage, GradeOverlay, Subject} from '../series/core';
import {outAt} from '../series/timemap';
import {ANTON, popAt} from '../series/kit2';
import {useT} from '../explainer/kit';
import {ACCENT, Cutaways, SHADOW_TXT, SerifCaps, TopShade, WHITE, outline} from '../minimal/kit';
import {EASE_IN, EASE_IN_OUT, EASE_OUT, FPS, SANS, SERIF, lerp, tween} from '../theme';
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
  const rows = ['Haemoglobin', 'Blood Sugar', 'Thyroid', 'Vitamin D'];
  const stamp = popAt(t, 2.54); // on "normal"
  return (
    <AbsoluteFill style={{background: '#EEEBE4', opacity: Math.min(1, k * 2) * (1 - tween(t, w.end - 0.12, 0.12))}}>
      <div style={{position: 'absolute', left: 140, right: 140, top: 470, background: '#fff', borderRadius: 22, padding: '48px 54px', boxShadow: '0 30px 60px -30px rgba(0,0,0,0.35)', translate: `0 ${lerp(k, 40, 0)}px`}}>
        <div style={{fontFamily: SERIF, fontSize: 82, color: '#141414'}}>Blood Report</div>
        <div style={{height: 2, background: '#141414', margin: '18px 0 10px'}} />
        {rows.map((r, i) => (
          <div key={r} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 104, borderBottom: i < rows.length - 1 ? '1px solid #E3DFD7' : undefined, fontFamily: SANS, fontSize: 44, color: '#141414'}}>
            <span style={{fontWeight: 600}}>{r}</span>
            <span style={{fontWeight: 700, color: '#1F8A4C', opacity: tween(t, 1.66 + i * 0.18, 0.2)}}>Normal ✓</span>
          </div>
        ))}
        {t >= 2.54 ? (
          <div style={{position: 'absolute', right: -10, bottom: -56, scale: lerp(Math.min(1, stamp), 1.8, 1), opacity: Math.min(1, stamp * 3), padding: '8px 26px', border: '7px solid #1F8A4C', borderRadius: 14, background: 'rgba(255,255,255,0.92)', fontFamily: SANS, fontWeight: 800, fontSize: 56, letterSpacing: 4, color: '#1F8A4C'}}>ALL NORMAL</div>
        ) : null}
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

// ---------------------------------------------------------------------------
// Dolly zoom: her cut-out holds still while the room pushes in and falls out of focus
// ---------------------------------------------------------------------------
const Dolly: React.FC<{children: React.ReactNode}> = ({children}) => {
  const t = useT();
  const w = C.dolly;
  if (t < w.start || t > w.end) return <>{children}</>;
  const p = tween(t, w.start, w.end - w.start, EASE_IN_OUT);
  return (
    <AbsoluteFill style={{transformOrigin: '540px 820px', scale: lerp(p, 1, 1.38), filter: `blur(${p * 14}px) brightness(${lerp(p, 1, 0.72)})`}}>
      {children}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// "get these four things checked first": four test pills burst out from behind her head on "four"
// (her cut-out sits in front, so they emerge from behind her), a gold light pulse behind her;
// on "first" Vitamin D lights up and the rest dim - straight into the vitamin D section.
// ---------------------------------------------------------------------------
const FOUR = [
  {name: 'Vitamin D', x: 290, y: 470},
  {name: 'HbA1c', x: 790, y: 470},
  {name: 'Liver', x: 190, y: 800},
  {name: 'Thyroid', x: 890, y: 800},
];
const FOUR_AT = 10.62;
const FIRST_AT = 11.48;
const FROM = {x: 540, y: 860};
const Burst: React.FC = () => {
  const t = useT();
  const w = C.orbit;
  if (t < w.start || t > w.end + 0.1) return null;
  const out = tween(t, w.end - 0.22, 0.22, EASE_IN);
  const ring = tween(t, FOUR_AT - 0.04, 0.9, EASE_OUT);
  const glow = t < FOUR_AT - 0.1 ? 0 : Math.min(tween(t, FOUR_AT - 0.1, 0.15), 1 - tween(t, FOUR_AT + 0.1, 0.9, EASE_IN));
  const hl = tween(t, FIRST_AT, 0.3, EASE_OUT);
  return (
    <AbsoluteFill style={{opacity: 1 - out}}>
      <AbsoluteFill style={{opacity: glow * 0.85, background: `radial-gradient(circle at ${FROM.x}px ${FROM.y - 80}px, rgba(245,196,81,0.75) 0px, rgba(245,196,81,0.25) 260px, rgba(245,196,81,0) 620px)`, mixBlendMode: 'screen'}} />
      {ring > 0 && ring < 1 ? (
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          <circle cx={FROM.x} cy={FROM.y - 80} r={lerp(ring, 120, 900)} fill="none" stroke={ACCENT} strokeWidth={lerp(ring, 10, 2)} opacity={(1 - ring) * 0.9} />
        </svg>
      ) : null}
      {FOUR.map((f, i) => {
        const at = FOUR_AT + i * 0.09;
        if (t < at) return null;
        const k = popAt(t, at);
        const fly = tween(t, at, 0.42, EASE_OUT);
        const first = i === 0;
        const x = lerp(fly, FROM.x, f.x);
        const y = lerp(fly, FROM.y, f.y);
        return (
          <div key={f.name} style={{position: 'absolute', left: x, top: y, translate: '-50% -50%', scale: lerp(Math.min(1.06, k), 0.3, 1) * (first ? lerp(hl, 1, 1.12) : lerp(hl, 1, 0.92)), opacity: Math.min(1, fly * 2.5) * (first ? 1 : lerp(hl, 1, 0.6)), filter: `blur(${(1 - fly) * 10}px)`, display: 'flex', alignItems: 'center', gap: 14, padding: '14px 32px 14px 16px', borderRadius: 999, background: first && hl > 0 ? `rgba(245,196,81,${lerp(hl, 0.96, 1)})` : 'rgba(255,255,255,0.96)', boxShadow: first && hl > 0 ? `0 0 ${40 * hl}px rgba(245,196,81,${0.8 * hl}), 0 16px 30px -12px rgba(0,0,0,0.55)` : '0 16px 30px -12px rgba(0,0,0,0.55)', whiteSpace: 'nowrap'}}>
            <span style={{width: 50, height: 50, borderRadius: '50%', background: '#141414', color: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 30}}>{i + 1}</span>
            <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 50, color: '#141414'}}>{f.name}</span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** Ink wipe (free Mixkit ink clip, recoloured cream) that floods into the cream inserts. */
const InkWipe: React.FC<{at: number}> = ({at}) => (
  <Sequence from={Math.round(outAt(TM_M1, at) * FPS)} durationInFrames={32} layout="none">
    <AbsoluteFill>
      <OffthreadVideo src={staticFile('m1/ink_wipe.webm')} transparent muted style={{width: '100%', height: '100%'}} />
    </AbsoluteFill>
  </Sequence>
);

// ---------------------------------------------------------------------------
// ₹1,500 of tests vs lakhs of supplements: two receipts (the receipt look from the no-sugar reel)
// ---------------------------------------------------------------------------
const MONO = "'DejaVu Sans Mono', 'Liberation Mono', monospace";
const zig = (n = 20) => `polygon(0 0, 100% 0, 100% calc(100% - 14px), ${Array.from({length: n + 1}, (_, i) => `${100 - (i * 100) / n}% ${i % 2 ? 'calc(100% - 14px)' : '100%'}`).join(', ')})`;
const Receipt: React.FC<{x: number; w: number; title: string; rows: {l: string; at: number}[]; total: string; totalAt: number; hl: string; t: number; tail?: number}> = ({x, w, title, rows, total, totalAt, hl, t, tail = 0}) => {
  const shown = rows.filter((r) => t >= r.at);
  const h = 170 + shown.length * 72 + (t >= totalAt ? 140 : 0) + tail;
  return (
    <div style={{position: 'absolute', left: x, top: 380, width: w, height: h, background: '#FFFDF7', boxShadow: '0 26px 50px -18px rgba(0,0,0,0.35)', clipPath: zig(), fontFamily: MONO, color: '#141414', padding: '30px 30px 0', boxSizing: 'border-box', overflow: 'hidden'}}>
      <div style={{textAlign: 'center', fontWeight: 700, fontSize: 38, letterSpacing: 2}}>{title}</div>
      <div style={{borderBottom: '3px dashed #141414', margin: '14px 0 8px'}} />
      {shown.map((r) => (
        <div key={r.l} style={{display: 'flex', justifyContent: 'space-between', fontSize: 37, lineHeight: '72px', ...rise(t, r.at)}}>
          <span>{r.l}</span>
          <span>✓</span>
        </div>
      ))}
      {t >= totalAt ? (
        <>
          <div style={{borderBottom: '3px dashed #141414', margin: '8px 0 10px'}} />
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700, fontSize: 42, ...rise(t, totalAt)}}>
            <span>TOTAL</span>
            <span style={{padding: '2px 12px', background: hl, borderRadius: 6}}>{total}</span>
          </div>
        </>
      ) : null}
    </div>
  );
};
const Save: React.FC = () => {
  const t = useT();
  const w = C.save;
  if (t < w.start - 0.05 || t > w.end + 0.05) return null;
  const k = tween(t, w.start, 0.2, EASE_OUT);
  const SUPP = ['Biotin', 'Fat burner', 'Collagen', 'Multivitamin', 'Detox tea', 'Omega-3', 'Iron', 'B12 drops', 'Ashwagandha'];
  const printed = tween(t, 62.88, 1.5, (x) => x); // keeps printing while she says "could save you lakhs"
  const vs = tween(t, 62.6, 0.3, EASE_OUT);
  return (
    <AbsoluteFill style={{background: '#EEEBE4', opacity: Math.min(1, k * 2) * (1 - tween(t, w.end - 0.12, 0.12))}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 190, textAlign: 'center', fontFamily: SERIF, fontSize: 110, color: '#141414', ...rise(t, w.start + 0.05)}}>Test first</div>
      <Receipt x={40} w={470} title="LAB TESTS" t={t} hl="#9BE3B4" total="₹1,500" totalAt={62.46} rows={[{l: 'Vitamin D', at: 61.0}, {l: 'HbA1c', at: 61.22}, {l: 'Liver', at: 61.5}, {l: 'Thyroid', at: 61.86}]} />
      <div style={{position: 'absolute', left: 510, top: 640, width: 60, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 40, color: '#8A857C', opacity: vs}}>vs</div>
      <Receipt
        x={570}
        w={470}
        title="SUPPLEMENTS"
        t={t}
        hl="#FFB4AE"
        total="₹1 lakh+"
        totalAt={63.66}
        rows={SUPP.map((l, i) => ({l, at: 62.88 + (i / SUPP.length) * 1.5}))}
        tail={printed * 40}
      />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 150, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 26, color: '#8A857C', opacity: tween(t, 63.66, 0.3)}}>illustrative yearly spend</div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Ending: a giant TEST rises from behind her head (her cut-out covers its lower half)
// ---------------------------------------------------------------------------
const BEHIND_LINE = 960; // letters are clipped here, so they rise out from behind her
const TestBehind: React.FC = () => {
  const t = useT();
  const s0 = C.cta.start;
  if (t < s0) return null;
  return (
    <AbsoluteFill style={{clipPath: `inset(0 0 ${1920 - BEHIND_LINE}px 0)`}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: BEHIND_LINE - 520, display: 'flex', justifyContent: 'center', gap: 6}}>
        {'TEST'.split('').map((ch, i) => {
          const p = popAt(t, 68.72 + i * 0.09);
          return (
            <span key={i} style={{fontFamily: ANTON, fontSize: 470, lineHeight: 1, color: WHITE, textShadow: '0 20px 50px rgba(0,0,0,0.45)', display: 'inline-block', translate: `0 ${lerp(Math.min(1.06, p), 480, 0)}px`}}>
              {ch}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
const CtaFront: React.FC = () => {
  const t = useT();
  const s0 = C.cta.start;
  if (t < s0) return null;
  const note = tween(t, 69.6, 0.4, EASE_OUT);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 290, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 72, color: WHITE, ...outline(72), ...rise(t, s0 + 0.05)}}>Comment</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1440, display: 'flex', justifyContent: 'center', opacity: note, translate: `0 ${lerp(note, 20, 0)}px`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '16px 34px', borderRadius: 999, background: 'rgba(18,18,20,0.82)', fontFamily: SANS, fontWeight: 700, fontSize: 40, color: WHITE}}>
          <span style={{width: 14, height: 14, borderRadius: '50%', background: ACCENT}} />
          Full test panel → your DMs
        </div>
      </div>
    </AbsoluteFill>
  );
};

const LINED = CUTS.filter((c) => c.line);
const Scene: React.FC = () => (
  <>
    <Dolly>
      <Footage cfg={cfg} />
    </Dolly>
    <GradeOverlay cfg={cfg} />
    <TopShade wins={[C.vitd, C.sugar, C.liver, C.thyroid]} reach={40} />
    <VitD />
    <Targets w={C.sugar} title="Your targets" items={[{label: 'HbA1c', value: '< 5.4', at: 25.72}, {label: 'Fasting insulin', value: '< 7', at: 29.02}]} />
    <Targets w={C.liver} title="3 · Liver" items={[{label: 'SGOT · SGPT', value: '< 25', at: 39.86}]} />
    <Thyroid />
    <Burst />
    <TopShade wins={[C.cta]} reach={40} />
    <TestBehind />
    <Subject cfg={cfg} />
    <Cutaways cuts={CUTS} tm={TM_M1} dir="m1" />
    <InkWipe at={C.inkA.start} />
    <Report />
    <Panel />
    <InkWipe at={C.inkB.start} />
    <Save />
    <CtaFront />
    <SerifCaps cfg={cfg} hide={[...LINED, {start: 1.0, end: 1.3}, C.report, {start: 49.75, end: 50.6}, C.panel, C.save, {start: C.cta.start + 0.1, end: 999}]} />
  </>
);

export const M1Reel: React.FC = () => (
  <Base cfg={cfg}>
    <Scene />
  </Base>
);
