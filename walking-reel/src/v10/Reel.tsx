import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {Base, BrollCuts, Footage, GradeOverlay, Subject, inWin} from '../series/core';
import {useT} from '../explainer/kit';
import {ANTON, Ico, chunkAt, popAt, vis} from '../series/kit2';
import {TopWash} from '../series/kit3';
import {EASE_IN, EASE_IN_OUT, EASE_OUT, SANS, SERIF, lerp, tween} from '../theme';
import {C, v10Config as cfg} from './config';

/**
 * Sugar-free mithai, rebuilt around one object: a 3D mithai box that she literally turns around.
 * One idea on screen at a time - the box, a giant word or number behind her head, a golden health
 * halo over her head, the portion receipt (kept from the first cut) and Diwali lights for the close,
 * which ends on a gift box opening to the guide. Times are source seconds.
 */
const INK = '#111111';
const HL = '#FFE45C';
const PAPER = '#FFFDF7';
const MAROON = '#7A1C2A';
const MAROON_D = '#5A121D';
const GOLD = '#D9A93E';
const GREEN = '#10B26C';
const MUTED = '#8A857C';
const MONO = "'DejaVu Sans Mono', 'Liberation Mono', monospace";
const SHADOW = '0 26px 50px -18px rgba(0,0,0,0.45)';

const rise = (t: number, at: number): React.CSSProperties => {
  const p = tween(t, at, 0.4, EASE_OUT);
  return {opacity: p, translate: `0 ${lerp(p, 26, 0)}px`};
};
/** Marker highlight that sweeps across inline text. */
const Mark: React.FC<{p: number; children: React.ReactNode}> = ({p, children}) => (
  <span style={{backgroundImage: `linear-gradient(${HL}, ${HL})`, backgroundRepeat: 'no-repeat', backgroundSize: `${p * 100}% 100%`, padding: '0 0.08em', borderRadius: 4}}>{children}</span>
);
const Badge: React.FC<{d: number}> = ({d}) => (
  <div style={{width: d, height: d, borderRadius: '50%', background: GREEN, border: `${d * 0.045}px solid #fff`, boxSizing: 'border-box', boxShadow: '0 10px 22px -8px rgba(0,0,0,0.45)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: SANS, fontWeight: 800, fontSize: d * 0.2, lineHeight: 1.0, letterSpacing: d * 0.005, textAlign: 'center'}}>
    <span>SUGAR</span>
    <span>FREE</span>
  </div>
);

// ---------------------------------------------------------------------------
// Signature: the 3D mithai box
// ---------------------------------------------------------------------------
const BW = 600;
const BH = 360;
const BD = 130;
const BOX = {x: 540, y: 300}; // centre
const WIN = {x: 24, y: 24, w: BW - 48, h: 232}; // photo window on the front face
const Box3D: React.FC<{ry: number; rx?: number; front: React.ReactNode; back: React.ReactNode; w?: number; h?: number; d?: number}> = ({ry, rx = 0, front, back, w = BW, h = BH, d = BD}) => {
  const face: React.CSSProperties = {position: 'absolute', backfaceVisibility: 'hidden', boxSizing: 'border-box', overflow: 'hidden'};
  return (
    <div style={{width: w, height: h, perspective: 2000}}>
      <div style={{position: 'relative', width: w, height: h, transformStyle: 'preserve-3d', transform: `rotateX(${rx}deg) rotateY(${ry}deg)`}}>
        <div style={{...face, left: 0, top: 0, width: w, height: h, borderRadius: 22, transform: `translateZ(${d / 2}px)`}}>{front}</div>
        <div style={{...face, left: 0, top: 0, width: w, height: h, borderRadius: 22, transform: `rotateY(180deg) translateZ(${d / 2}px)`}}>{back}</div>
        <div style={{...face, left: (w - d) / 2, top: 0, width: d, height: h, background: MAROON_D, transform: `rotateY(90deg) translateZ(${w / 2}px)`, borderTop: `3px solid ${GOLD}`, borderBottom: `3px solid ${GOLD}`}} />
        <div style={{...face, left: (w - d) / 2, top: 0, width: d, height: h, background: MAROON_D, transform: `rotateY(-90deg) translateZ(${w / 2}px)`, borderTop: `3px solid ${GOLD}`, borderBottom: `3px solid ${GOLD}`}} />
        <div style={{...face, left: 0, top: (h - d) / 2, width: w, height: d, background: '#8E2A38', transform: `rotateX(90deg) translateZ(${h / 2}px)`, border: `3px solid ${GOLD}`}} />
        <div style={{...face, left: 0, top: (h - d) / 2, width: w, height: d, background: MAROON_D, transform: `rotateX(-90deg) translateZ(${h / 2}px)`}} />
      </div>
    </div>
  );
};
const BoxFront: React.FC<{img?: string; name?: string; badge?: number; claims?: number[]; photo?: React.ReactNode}> = ({img = 'box.jpg', name = 'Kaju Katli', badge = 1, claims = [], photo}) => (
  <div style={{position: 'absolute', inset: 0, background: MAROON, borderRadius: 22}}>
    <div style={{position: 'absolute', inset: 9, border: `3px solid ${GOLD}`, borderRadius: 16}} />
    <div style={{position: 'absolute', left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h, borderRadius: 14, overflow: 'hidden', background: '#2a0c10'}}>
      {photo ?? <Img src={staticFile(`v10/photos/${img}`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />}
      <div style={{position: 'absolute', left: 16, top: 16, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start'}}>
        {['Guilt Free', 'No Added Sugar'].map((c, i) =>
          (claims[i] ?? 0) > 0 ? (
            <div key={c} style={{padding: '6px 16px', borderRadius: 999, background: PAPER, color: MAROON, fontFamily: SANS, fontWeight: 800, fontSize: 24, scale: Math.min(1, claims[i]), transformOrigin: 'left center', boxShadow: '0 6px 12px -6px rgba(0,0,0,0.5)'}}>
              {c}
            </div>
          ) : null,
        )}
      </div>
    </div>
    {badge > 0 ? (
      <div style={{position: 'absolute', right: 34, top: 30, scale: badge}}>
        <Badge d={124} />
      </div>
    ) : null}
    <div style={{position: 'absolute', left: 36, right: 36, top: 268, height: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
      <span style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 56, color: GOLD, lineHeight: 1}}>{name}</span>
      <span style={{fontFamily: SANS, fontWeight: 700, fontSize: 22, color: GOLD, letterSpacing: 3}}>500 G</span>
    </div>
  </div>
);
const ROWS: [string, string, boolean][] = [
  ['Energy', '400 kcal', false],
  ['Fat', '22 g', false],
  ['Carbohydrate', '40 g', false],
  ['of which Sugars', '2 g', true],
  ['Protein', '9 g', false],
];
const BoxBack: React.FC<{hiE?: number; hiF?: number}> = ({hiE = 0, hiF = 0}) => (
  <div style={{position: 'absolute', inset: 0, background: MAROON, borderRadius: 22, padding: 16, boxSizing: 'border-box'}}>
    <div style={{width: '100%', height: '100%', background: PAPER, borderRadius: 12, padding: '14px 26px', boxSizing: 'border-box', fontFamily: SANS, color: INK}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: `8px solid ${INK}`, paddingBottom: 6}}>
        <span style={{fontWeight: 800, fontSize: 40, letterSpacing: -1}}>Nutrition Facts</span>
        <span style={{fontWeight: 700, fontSize: 22, color: MUTED}}>Per 100 g</span>
      </div>
      {ROWS.map(([l, r, sub], i) => {
        const hi = i === 0 ? hiE : i === 1 ? hiF : 0;
        return (
          <div key={l} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 46, borderBottom: i < ROWS.length - 1 ? '2px solid #D9D3C7' : undefined, paddingLeft: sub ? 24 : 0, fontSize: sub ? 24 : 28, fontWeight: sub ? 600 : 800}}>
            <span>
              <Mark p={hi}>{l}</Mark>
            </span>
            <span>
              <Mark p={hi}>{r}</Mark>
            </span>
          </div>
        );
      })}
    </div>
  </div>
);
/** Big-number back face for the two-box comparison. */
const BoxBackBig: React.FC<{kcal: string; p: number}> = ({kcal, p}) => (
  <div style={{position: 'absolute', inset: 0, background: MAROON, borderRadius: 22, padding: 16, boxSizing: 'border-box'}}>
    <div style={{width: '100%', height: '100%', background: PAPER, borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, color: INK}}>
      <span style={{fontWeight: 700, fontSize: 34, color: MUTED, letterSpacing: 2}}>PER 100 G</span>
      <span style={{fontFamily: ANTON, fontSize: 170, lineHeight: 1.0}}>
        <Mark p={p}>{kcal}</Mark>
      </span>
      <span style={{fontWeight: 800, fontSize: 38}}>kcal</span>
    </div>
  </div>
);
// spins (source s): each turns the box half a revolution
const spin = (t: number, ats: number[], d = 0.9) => ats.reduce((a, at) => a + 180 * tween(t, at, d, EASE_IN_OUT), 0);
const lean = (t: number, ats: number[], d = 0.9) => ats.reduce((a, at) => a - 9 * Math.sin(Math.PI * Math.min(1, Math.max(0, (t - at) / d))), 0);

// ---------------------------------------------------------------------------
// Hook: full-screen photo -> collapses into the box window -> she turns it around
// ---------------------------------------------------------------------------
const COLLAPSE = 3.62;
const HOOK_SPINS = [5.48, 7.0, 11.34];
const PhotoOpen: React.FC = () => {
  const t = useT();
  if (t > COLLAPSE + 0.6) return null;
  const k = tween(t, COLLAPSE, 0.55, EASE_IN_OUT);
  const L = BOX.x - BW / 2 + WIN.x;
  const T = BOX.y - BH / 2 + WIN.y;
  const r = {x: lerp(k, 0, L), y: lerp(k, 0, T), w: lerp(k, 1080, WIN.w), h: lerp(k, 1920, WIN.h)};
  const b = popAt(t, 2.54);
  // the badge travels from the middle of the photo to its corner on the box
  const bx = lerp(k, 540, BOX.x + BW / 2 - 34 - 62);
  const by = lerp(k, 960, BOX.y - BH / 2 + 30 + 62);
  const bd = lerp(k, 300, 124);
  return (
    <AbsoluteFill style={{opacity: 1 - tween(t, COLLAPSE + 0.5, 0.1)}}>
      <div style={{position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: lerp(k, 0, 14), overflow: 'hidden', boxShadow: k > 0 ? SHADOW : undefined}}>
        <Img src={staticFile('v10/photos/box.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', scale: lerp(tween(t, 1.08, 2.6, (x) => x), 1.0, 1.08)}} />
      </div>
      {t >= 2.54 ? (
        <div style={{position: 'absolute', left: bx, top: by, translate: '-50% -50%', scale: lerp(Math.min(1, b), 1.6, 1) * (bd / 300)}}>
          <Badge d={300} />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
const HookBox: React.FC = () => {
  const t = useT();
  if (t < COLLAPSE + 0.4 || t > C.front.end + 0.3) return null;
  const frame = tween(t, COLLAPSE + 0.4, 0.2);
  const out = tween(t, C.front.end - 0.3, 0.35, EASE_IN);
  const ry = spin(t, HOOK_SPINS);
  const claims = [popAt(t, 9.2), popAt(t, 9.9)];
  return (
    <div style={{position: 'absolute', left: BOX.x - BW / 2, top: BOX.y - BH / 2, opacity: frame * (1 - out), scale: 1 - out * 0.15}}>
      <Box3D ry={ry} rx={lean(t, HOOK_SPINS)} front={<BoxFront claims={claims} />} back={<BoxBack hiE={tween(t, 13.86, 0.4)} />} />
    </div>
  );
};

// ---------------------------------------------------------------------------
// Giant type behind her head: one idea per beat, never the subtitle's words
// ---------------------------------------------------------------------------
const Giant: React.FC<{at: number; end: number; y?: number; size?: number; children: React.ReactNode}> = ({at, end, y = 300, size = 190, children}) => {
  const t = useT();
  if (t < at || t > end + 0.3) return null;
  const k = tween(t, at, 0.5, EASE_OUT);
  const out = tween(t, end - 0.2, 0.3, EASE_IN);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, translate: `0 -50%`, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 28, fontFamily: ANTON, fontSize: size, lineHeight: 1, color: INK, letterSpacing: 2, whiteSpace: 'nowrap', opacity: k * (1 - out), clipPath: `inset(${(1 - k) * 100}% 0 0 0)`}}>
      <div style={{translate: `0 ${lerp(k, 40, 0)}px`, display: 'flex', alignItems: 'center', gap: 28}}>{children}</div>
    </div>
  );
};
/** A food's reputation writes its own permission slip: item, reputation, pieces allowed, APPROVED. */
const Rep: React.FC = () => {
  const t = useT();
  const w = C.rep;
  const o = vis(t, w.start + 0.3, w.end - 0.2);
  if (o <= 0) return null;
  const drop = tween(t, 18.9, 0.55, EASE_OUT);
  const stars = tween(t, 20.12, 0.8, (x) => x) * 5;
  const pieces = t < 22.3 ? 1 : Math.min(4, 1 + Math.floor((t - 22.3) / 0.42) + 1);
  const pk = popAt(t, 22.3 + (pieces - 2) * 0.42);
  const stamp = popAt(t, 24.24);
  const row = (at: number, label: string, value: React.ReactNode) => (
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 66, borderBottom: `3px dashed #CFC8BA`, ...rise(t, at)}}>
      <span style={{fontFamily: MONO, fontSize: 28, color: '#666', letterSpacing: 1}}>{label}</span>
      <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 34, color: INK}}>{value}</span>
    </div>
  );
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: 190, top: lerp(drop, -460, 58), width: 700, background: PAPER, boxShadow: SHADOW, borderRadius: 8, padding: '0 40px 26px', boxSizing: 'border-box'}}>
        {/* perforated tear-off edge */}
        <div style={{display: 'flex', justifyContent: 'space-between', padding: '14px 0 0'}}>
          {Array.from({length: 14}, (_, i) => (
            <div key={i} style={{width: 16, height: 16, borderRadius: '50%', background: '#E9E3D7'}} />
          ))}
        </div>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, paddingBottom: 12, borderBottom: `5px solid ${INK}`}}>
          <span style={{fontFamily: MONO, fontWeight: 700, fontSize: 34, letterSpacing: 3, color: INK}}>PERMISSION SLIP</span>
          <span style={{fontFamily: MONO, fontSize: 22, color: '#666'}}>No. 0024</span>
        </div>
        {row(19.3, 'ITEM', 'Sugar-Free Mithai')}
        {row(
          20.12,
          'REPUTATION',
          <span style={{display: 'flex', alignItems: 'center', gap: 10}}>
            <span style={{fontStyle: 'italic'}}>“Healthy”</span>
            <span style={{display: 'flex', gap: 2}}>
              {Array.from({length: 5}, (_, i) => (
                <span key={i} style={{color: stars > i + 0.5 ? GOLD : '#DDD6C8', fontSize: 34}}>★</span>
              ))}
            </span>
          </span>,
        )}
        {row(
          21.76,
          'PIECES ALLOWED',
          <span style={{display: 'inline-block', minWidth: 74, textAlign: 'center', padding: '0 14px', borderRadius: 10, background: pieces > 1 ? HL : '#EFE9DD', fontFamily: ANTON, fontWeight: 400, fontSize: 52, lineHeight: 1.15, scale: pieces > 1 ? lerp(Math.min(1, pk), 1.35, 1) : 1}}>{pieces}</span>,
        )}
        <div style={{height: 104}} />
        {t >= 24.24 ? (
          <div style={{position: 'absolute', right: 40, bottom: 26, scale: lerp(Math.min(1, stamp), 1.9, 1), opacity: Math.min(1, stamp * 3)}}>
            <div style={{padding: '4px 22px', border: `6px solid ${GREEN}`, borderRadius: 12, color: GREEN, fontFamily: SANS, fontWeight: 800, fontSize: 44, letterSpacing: 6, background: 'rgba(255,253,247,0.85)'}}>APPROVED</div>
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
const Nuts: React.FC = () => {
  const t = useT();
  return (
    <>
      <Giant at={24.92} end={29.8}>
        <div style={{scale: Math.min(1, popAt(t, 25.1))}}>
          <Badge d={190} />
        </div>
        {/* drawn "not equal" (Anton has no such glyph) */}
        <svg width={110} height={110} viewBox="0 0 110 110">
          <rect x={8} y={30} width={94} height={16} rx={4} fill={MUTED} />
          <rect x={8} y={64} width={94} height={16} rx={4} fill={MUTED} />
          <line x1={74} y1={10} x2={36} y2={100} stroke={MUTED} strokeWidth={14} strokeLinecap="round" />
        </svg>
        <span>LOW CAL</span>
      </Giant>
      <Giant at={29.9} end={C.nuts.end}>
        <span>CASHEW</span>
        <span style={{color: GOLD, scale: Math.min(1, popAt(t, 30.8))}}>+</span>
        <span style={{opacity: tween(t, 30.8, 0.25)}}>GHEE</span>
      </Giant>
    </>
  );
};
const Nine: React.FC = () => {
  const t = useT();
  if (t < C.nine.start || t > C.nine.end + 0.3) return null;
  const n = Math.round(9 * tween(t, 33.58, 0.5, (x) => x));
  const four = tween(t, 35.0, 0.4, EASE_OUT);
  return (
    <Giant at={C.nine.start + 0.1} end={C.nine.end} y={290}>
      <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
        <span style={{fontSize: 420, lineHeight: 0.9}}>{n}</span>
        <div style={{display: 'flex', flexDirection: 'column', gap: 6, fontSize: 70, lineHeight: 1}}>
          <span>KCAL / G</span>
          <span style={{padding: '4px 16px', background: HL, alignSelf: 'flex-start'}}>FAT</span>
        </div>
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 16, marginLeft: 50, color: MUTED, opacity: four, translate: `${lerp(four, 30, 0)}px 0`}}>
        <span style={{fontSize: 220, lineHeight: 0.9}}>4</span>
        <div style={{display: 'flex', flexDirection: 'column', gap: 6, fontSize: 46, lineHeight: 1}}>
          <span>KCAL / G</span>
          <span>SUGAR</span>
        </div>
      </div>
    </Giant>
  );
};

// ---------------------------------------------------------------------------
// Compare: two boxes turn round together
// ---------------------------------------------------------------------------
const Compare: React.FC = () => {
  const t = useT();
  const o = vis(t, C.compare.start + 0.2, C.compare.end - 0.2);
  if (o <= 0) return null;
  const boxes = [
    {x: 285, img: 'box.jpg', name: 'Brand A', kcal: '400', at: 36.5},
    {x: 795, img: 'tray.jpg', name: 'Brand B', kcal: '480', at: 36.7},
  ];
  const S = 0.78;
  return (
    <AbsoluteFill style={{opacity: o}}>
      {boxes.map((b, i) => {
        const k = popAt(t, b.at);
        const ry = spin(t, [37.48 + i * 0.12]);
        return (
          <div key={i} style={{position: 'absolute', left: b.x, top: 300, translate: '-50% -50%', scale: S * Math.min(1, Math.max(0, k))}}>
            <Box3D w={560} ry={ry} rx={lean(t, [37.48 + i * 0.12])} front={<BoxFront img={b.img} name={b.name} badge={1} />} back={<BoxBackBig kcal={b.kcal} p={tween(t, 38.6 + i * 0.15, 0.4)} />} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// The receipt (kept exactly from the first cut)
// ---------------------------------------------------------------------------
const LINES: {at: number; l: string; r: string; big?: boolean; rule?: boolean; note?: boolean; box?: boolean}[] = [
  {at: 44.18, l: 'KAJU KATLI', r: '30 g'},
  {at: 46.14, l: 'LABEL', r: '400 kcal/100 g'},
  {at: 48.36, l: '30 × 400 ÷ 100', r: ''},
  {at: 49.6, l: '', r: '', rule: true},
  {at: 49.72, l: 'TOTAL', r: '120 kcal', big: true},
  {at: 52.56, l: 'ILLUSTRATIVE NUMBERS', r: '', box: true},
  {at: 54.0, l: '* numbers differ brand to brand', r: '', note: true},
];
const Receipt: React.FC = () => {
  const t = useT();
  const w = C.calc;
  const o = vis(t, w.start, w.end - 0.3);
  if (o <= 0) return null;
  const head = tween(t, 42.9, 0.4, EASE_OUT);
  const shown = LINES.filter((x) => t >= x.at - 0.05);
  const lineH = (x: (typeof LINES)[number]) => (x.big ? 80 : x.rule ? 30 : x.note ? 44 : x.box ? 62 : 54);
  const H = 104 * head + shown.reduce((s, x) => s + lineH(x) * tween(t, x.at - 0.05, 0.22, EASE_OUT), 0) + 40;
  return (
    <AbsoluteFill style={{opacity: o}}>
      {/* printer slot */}
      <div style={{position: 'absolute', left: 200, top: 30, width: 680, height: 34, borderRadius: 17, background: INK, boxShadow: '0 10px 20px -6px rgba(0,0,0,0.4)'}} />
      <div style={{position: 'absolute', left: 240, top: 46, width: 600, height: H, background: PAPER, boxShadow: SHADOW, overflow: 'hidden', clipPath: `polygon(0 0, 100% 0, 100% calc(100% - 14px), ${Array.from({length: 21}, (_, i) => `${100 - i * 5}% ${i % 2 ? 'calc(100% - 14px)' : '100%'}`).join(', ')})`}}>
        <div style={{padding: '28px 40px 0', fontFamily: MONO, color: INK}}>
          <div style={{textAlign: 'center', fontWeight: 700, fontSize: 32, letterSpacing: 2}}>*** PORTION CHECK ***</div>
          <div style={{textAlign: 'center', fontSize: 22, color: '#666', marginTop: 4}}>for example</div>
          <div style={{borderBottom: `3px dashed ${INK}`, margin: '12px 0 8px'}} />
          {shown.map((x, i) =>
            x.rule ? (
              <div key={i} style={{borderBottom: `3px dashed ${INK}`, margin: '10px 0 14px'}} />
            ) : x.box ? (
              <div key={i} style={{display: 'flex', justifyContent: 'center', padding: '8px 0 6px', ...rise(t, x.at)}}>
                <span style={{border: `4px solid ${INK}`, borderRadius: 10, padding: '2px 16px', fontFamily: SANS, fontWeight: 800, fontSize: 26, letterSpacing: 3}}>{x.l}</span>
              </div>
            ) : (
              <div key={i} style={{display: 'flex', justifyContent: 'space-between', fontSize: x.big ? 52 : x.note ? 25 : 34, fontWeight: x.big || x.note ? 700 : 400, color: INK, lineHeight: x.big ? '72px' : x.note ? '40px' : '54px', ...rise(t, x.at)}}>
                <span>{x.l}</span>
                <span>{x.big ? <Mark p={tween(t, 49.9, 0.4)}>{x.r}</Mark> : x.r}</span>
              </div>
            ),
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// The sweet shop (photo, no words)
// ---------------------------------------------------------------------------
const Choose: React.FC = () => {
  const t = useT();
  const w = C.choose;
  if (t < w.start - 0.05 || t > w.end + 0.05) return null;
  const k = tween(t, w.start, w.end - w.start, (x) => x);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Img src={staticFile('v10/photos/shop.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', scale: lerp(k, 1.12, 1.02), opacity: tween(t, w.start - 0.05, 0.15)}} />
      <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(0,0,0,0) 60%, rgba(0,0,0,0.35))'}} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Diwali: a string of lights across the top, warm bokeh, then the box decides by its label
// ---------------------------------------------------------------------------
const LIGHTS_AT = 63.86;
const Lights: React.FC = () => {
  const t = useT();
  if (t < LIGHTS_AT - 0.1) return null;
  const o = tween(t, LIGHTS_AT - 0.1, 0.4);
  const N = 15;
  const wire = (x: number) => 46 + Math.sin((x / 1080) * Math.PI) * 60;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <svg width={1080} height={200} style={{position: 'absolute', left: 0, top: 0}}>
        <path d={Array.from({length: 41}, (_, i) => `${i ? 'L' : 'M'}${(i / 40) * 1080} ${wire((i / 40) * 1080)}`).join(' ')} fill="none" stroke="#3A2A1A" strokeWidth={3} />
      </svg>
      {Array.from({length: N}, (_, i) => {
        const x = 36 + i * ((1080 - 72) / (N - 1));
        const on = tween(t, LIGHTS_AT + i * 0.05, 0.2);
        const tw = 0.75 + 0.25 * Math.sin(t * 3 + i * 1.7);
        const c = i % 3 === 0 ? '#FFC94A' : i % 3 === 1 ? '#FF9A3C' : '#FFE7A3';
        return (
          <div key={i} style={{position: 'absolute', left: x - 11, top: wire(x) + 4, width: 22, height: 30, borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', background: on > 0.5 ? c : '#6B5B45', boxShadow: on > 0.5 ? `0 0 ${18 * tw}px ${6 * tw}px ${c}` : undefined, opacity: lerp(on, 0.6, 1)}} />
        );
      })}
      {Array.from({length: 12}, (_, i) => {
        const x = (i * 97 + 40) % 1080;
        const y = 140 + ((i * 53) % 380) + Math.sin(t * 0.8 + i) * 12;
        const s = 26 + (i % 4) * 14;
        return <div key={`b${i}`} style={{position: 'absolute', left: x, top: y, width: s, height: s, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,200,90,0.55), rgba(255,200,90,0) 70%)', opacity: tween(t, LIGHTS_AT + 0.3, 0.6) * (0.6 + 0.4 * Math.sin(t * 1.3 + i))}} />;
      })}
    </AbsoluteFill>
  );
};
const DECIDE_SPIN = 68.9;
const Decide: React.FC = () => {
  const t = useT();
  const w = C.decide;
  if (t < w.start || t > w.end + 0.3) return null;
  const k = popAt(t, w.start + 0.3);
  const out = tween(t, w.end - 0.2, 0.3, EASE_IN);
  const pulse = t >= 68.04 && t < 68.64 ? 1 + 0.12 * Math.sin((t - 68.04) * 16) : 1;
  const badge = t < 68.64 ? pulse : 1 - tween(t, 68.64, 0.25, EASE_IN);
  return (
    <div style={{position: 'absolute', left: BOX.x - BW / 2, top: BOX.y - BH / 2 + 20, opacity: Math.min(1, k * 2) * (1 - out), scale: lerp(Math.min(1, k), 0.85, 1)}}>
      <Box3D ry={spin(t, [DECIDE_SPIN])} rx={lean(t, [DECIDE_SPIN])} front={<BoxFront badge={badge} />} back={<BoxBack hiE={tween(t, 69.3, 0.4)} hiF={tween(t, 69.5, 0.4)} />} />
    </div>
  );
};

// ---------------------------------------------------------------------------
// Ending: comment GUIDE, and a Diwali gift box opens to the guide
// ---------------------------------------------------------------------------
const Cta: React.FC = () => {
  const t = useT();
  const s0 = C.cta.start;
  if (t < s0) return null;
  const word = 'GUIDE';
  const typeAt = 70.32;
  const typed = word.slice(0, Math.max(0, Math.min(word.length, Math.floor((t - typeAt) / 0.07) + 1)));
  const sentAt = typeAt + word.length * 0.07 + 0.25;
  const sent = tween(t, sentAt, 0.25, EASE_OUT);
  const bar = tween(t, s0 + 0.1, 0.4, EASE_OUT);
  const box = popAt(t, s0 + 0.25);
  const OPEN = 71.24;
  const lid = tween(t, OPEN, 0.5, EASE_OUT);
  const card = tween(t, OPEN + 0.15, 0.7, EASE_OUT);
  const burst = Math.max(0, t - (OPEN + 0.3));
  return (
    <AbsoluteFill style={{fontFamily: SANS}}>
      <div style={{position: 'absolute', left: 90, top: 60, width: 900, height: 116, borderRadius: 58, background: '#fff', boxShadow: SHADOW, display: 'flex', alignItems: 'center', gap: 22, padding: '0 16px 0 22px', boxSizing: 'border-box', opacity: bar, translate: `0 ${lerp(bar, 30, 0)}px`}}>
        <div style={{width: 76, height: 76, borderRadius: '50%', background: '#F4F1EB', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Ico name="chat-circle-dots" size={42} color={INK} />
        </div>
        <div style={{flex: 1, fontSize: 50, fontWeight: 800, color: typed ? INK : '#9A9A9A', letterSpacing: typed ? 3 : 0}}>{typed ? <Mark p={sent}>{typed}</Mark> : 'Add a comment…'}</div>
        <div style={{width: 84, height: 84, borderRadius: '50%', background: sent > 0 ? MAROON : '#D8D8D8', display: 'flex', alignItems: 'center', justifyContent: 'center', scale: 1 + 0.15 * Math.sin(Math.PI * sent)}}>
          <Ico name="paper-plane-right" size={44} color={sent > 0 ? GOLD : '#fff'} />
        </div>
      </div>
      {t >= s0 + 0.25 ? (
        <div style={{position: 'absolute', left: 540, top: 495, translate: '-50% -50%', width: 460, height: 230, scale: 1.2 * Math.min(1, Math.max(0, box)), opacity: Math.min(1, box * 2)}}>
          {/* the guide rises out of the box (drawn behind the box front) */}
          <div style={{position: 'absolute', left: 50, width: 360, height: 210, top: lerp(card, 40, -125), borderRadius: 18, background: '#fff', boxShadow: SHADOW, padding: 18, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center', opacity: Math.min(1, card * 3)}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
              <div style={{width: 58, height: 58, borderRadius: 14, background: MAROON, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Ico name="file-pdf" size={36} color={GOLD} />
              </div>
              <div style={{fontSize: 30, fontWeight: 800, lineHeight: 1.05, textAlign: 'left', color: INK}}>
                Free Fat Loss
                <br />
                Guide
              </div>
            </div>
            <div style={{padding: '4px 16px', borderRadius: 999, background: HL, fontSize: 22, fontWeight: 800, color: INK, opacity: tween(t, 72.2, 0.3)}}>Sent To Your DMs ✓</div>
          </div>
          {/* box body */}
          <div style={{position: 'absolute', left: 0, top: 40, width: 460, height: 190, borderRadius: '6px 6px 22px 22px', background: MAROON, boxShadow: SHADOW, overflow: 'hidden'}}>
            <div style={{position: 'absolute', inset: 9, border: `3px solid ${GOLD}`, borderRadius: '4px 4px 16px 16px'}} />
            <div style={{position: 'absolute', left: 205, top: 0, width: 50, height: 190, background: GOLD}} />
            <div style={{position: 'absolute', left: 0, top: 78, width: 460, height: 34, background: GOLD}} />
          </div>
          {/* lid with bow */}
          <div style={{position: 'absolute', left: -14, top: 0, width: 488, height: 56, translate: `0 ${-lid * 70}px`, opacity: 1 - tween(t, OPEN + 0.08, 0.25)}}>
            <div style={{position: 'absolute', inset: 0, borderRadius: 12, background: MAROON_D, boxShadow: '0 8px 16px -8px rgba(0,0,0,0.5)'}} />
            <div style={{position: 'absolute', left: 219, top: 0, width: 50, height: 56, background: GOLD}} />
            <div style={{position: 'absolute', left: 180, top: -44, width: 60, height: 52, borderRadius: '50% 50% 10% 50%', border: `12px solid ${GOLD}`, boxSizing: 'border-box'}} />
            <div style={{position: 'absolute', left: 248, top: -44, width: 60, height: 52, borderRadius: '50% 50% 50% 10%', border: `12px solid ${GOLD}`, boxSizing: 'border-box'}} />
          </div>
          {/* sparkle burst */}
          {burst > 0 && burst < 1.6
            ? Array.from({length: 14}, (_, i) => {
                const a = (i / 14) * Math.PI * 2;
                const r = 60 + burst * 260;
                return <div key={i} style={{position: 'absolute', left: 230 + Math.cos(a) * r - 6, top: 30 + Math.sin(a) * r * 0.7 - 6, width: 12, height: 12, borderRadius: '50%', background: i % 2 ? GOLD : '#FFE7A3', boxShadow: `0 0 12px 3px ${GOLD}`, opacity: 1 - burst / 1.6}} />;
              })
            : null}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Captions: the dark pill (kept), moved to the top over the push-up clip
// ---------------------------------------------------------------------------
const NO_CAPS = [{start: C.cta.start + 0.2, end: 999}];
const Caps: React.FC = () => {
  const t = useT();
  if (inWin(t, NO_CAPS)) return null;
  const chunk = chunkAt(cfg.captions, t);
  if (!chunk) return null;
  const k = tween(t, chunk[0].start - 0.04, 0.14);
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top: inWin(t, [C.journey]) ? 560 : 1520, translate: `0 ${-50 + lerp(k, 10, 0)}%`, textAlign: 'center', opacity: k}}>
      <div style={{display: 'inline-block', padding: '12px 30px 14px', background: 'rgba(18,18,20,0.74)', borderRadius: 26, boxShadow: '0 10px 24px -10px rgba(0,0,0,0.4)', scale: lerp(k, 0.96, 1)}}>
        <span style={{fontFamily: SANS, fontWeight: 700, fontSize: 52, lineHeight: 1.2, color: '#FFFFFF', letterSpacing: -0.5, whiteSpace: 'nowrap'}}>{chunk.map((w) => w.text).join(' ')}</span>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
const WASH = [
  {start: COLLAPSE, end: C.front.end},
  C.rep,
  C.nuts,
  C.nine,
  C.compare,
  C.decide,
  C.cta,
];
const Scene: React.FC = () => (
  <>
    <Footage cfg={cfg} />
    <GradeOverlay cfg={cfg} />
    <TopWash wins={WASH} reach={36} />
    <Lights />
    <Rep />
    <Nuts />
    <Nine />
    <Compare />
    <Receipt />
    <HookBox />
    <Decide />
    <Cta />
    <Subject cfg={cfg} />
    <BrollCuts cfg={cfg} />
    <Choose />
    <PhotoOpen />
    <Caps />
  </>
);

export const V10Reel: React.FC = () => (
  <Base cfg={{...cfg, shakes: [2.54, 24.24, 30.8, 49.72]}}>
    <Scene />
  </Base>
);
