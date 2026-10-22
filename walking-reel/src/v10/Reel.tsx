import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {Base, BrollCuts, Footage, GradeOverlay, Subject, inWin} from '../series/core';
import {useT} from '../explainer/kit';
import {Ico, chunkAt, popAt, vis} from '../series/kit2';
import {EASE_IN, EASE_IN_OUT, EASE_OUT, SANS, lerp, tween} from '../theme';
import {C, v10Config as cfg} from './config';

const INK = '#111111';
const GREEN = '#10B26C';
const GREEN_D = '#08824D';
const RED = '#E5372B';
const HL = '#FFE45C';
const PAPER = '#FFFDF7';
const MONO = "'DejaVu Sans Mono', 'Liberation Mono', monospace";
const SHADOW = '0 26px 50px -18px rgba(0,0,0,0.45)';

type Rect = {x: number; y: number; w: number; h: number};
const lerpR = (p: number, a: Rect, b: Rect): Rect => ({x: lerp(p, a.x, b.x), y: lerp(p, a.y, b.y), w: lerp(p, a.w, b.w), h: lerp(p, a.h, b.h)});
const FULL: Rect = {x: 0, y: 0, w: 1080, h: 1920};
const MID: Rect = {x: 330, y: 70, w: 420, h: 530};
const LEFT: Rect = {x: 70, y: 70, w: 420, h: 530};
const RIGHT: Rect = {x: 590, y: 70, w: 420, h: 530};

const At: React.FC<{x: number; y: number; o?: number; s?: number; children: React.ReactNode}> = ({x, y, o = 1, s = 1, children}) =>
  o <= 0 ? null : <div style={{position: 'absolute', left: x, top: y, translate: '-50% -50%', opacity: Math.min(1, o), scale: s}}>{children}</div>;
const rise = (t: number, at: number): React.CSSProperties => {
  const p = tween(t, at, 0.4, EASE_OUT);
  return {opacity: p, translate: `0 ${lerp(p, 26, 0)}px`};
};
/** Label tape: white strip, thick black border. */
const Tape: React.FC<{size?: number; children: React.ReactNode; bg?: string; fg?: string; style?: React.CSSProperties}> = ({size = 44, children, bg = '#fff', fg = INK, style}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: size * 0.3, padding: `${size * 0.16}px ${size * 0.45}px ${size * 0.2}px`, background: bg, color: fg, border: `${Math.max(3, size * 0.1)}px solid ${INK}`, borderRadius: size * 0.28, fontFamily: SANS, fontWeight: 800, fontSize: size, letterSpacing: -size * 0.01, whiteSpace: 'nowrap', boxShadow: '0 10px 24px -10px rgba(0,0,0,0.45)', ...style}}>{children}</div>
);
/** Marker highlight that sweeps across inline text. */
const Mark: React.FC<{p: number; children: React.ReactNode}> = ({p, children}) => (
  <span style={{backgroundImage: `linear-gradient(${HL}, ${HL})`, backgroundRepeat: 'no-repeat', backgroundSize: `${p * 100}% 100%`, padding: '0 0.08em', borderRadius: 4}}>{children}</span>
);
/** Green marketing sticker (round). */
const Sticker: React.FC<{d: number; lines: string[]; color?: string; k?: number}> = ({d, lines, color = GREEN, k = 1}) => (
  <div style={{width: d, height: d, borderRadius: '50%', background: color, border: `${d * 0.035}px solid #fff`, boxShadow: `0 ${d * 0.06}px ${d * 0.14}px rgba(0,0,0,0.35)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: SANS, fontWeight: 800, lineHeight: 0.98, textAlign: 'center', scale: k}}>
    {lines.map((l, i) => (
      <div key={i} style={{fontSize: d * (lines.length > 2 ? 0.15 : 0.19), letterSpacing: d * 0.004}}>{l}</div>
    ))}
  </div>
);

// ---------------------------------------------------------------------------
// Nutrition label (designed at 420 x 530)
// ---------------------------------------------------------------------------
const ROWS: [string, string, boolean, 'e' | 'f' | null][] = [
  ['Energy', '400 kcal', true, 'e'],
  ['Protein', '9 g', true, null],
  ['Carbohydrate', '40 g', true, null],
  ['   of which sugars', '2 g', false, null],
  ['Fat', '22 g', true, 'f'],
  ['   of which saturates', '7 g', false, null],
];
const NutLabel: React.FC<{w: number; hiE?: number; hiF?: number; title?: string}> = ({w, hiE = 0, hiF = 0, title = 'Nutrition Facts'}) => (
  <div style={{position: 'absolute', left: 0, top: 0, width: 420, height: 530, transformOrigin: '0 0', scale: w / 420, background: PAPER, padding: 16, boxSizing: 'border-box'}}>
    <div style={{border: `6px solid ${INK}`, height: '100%', boxSizing: 'border-box', padding: '10px 16px', fontFamily: SANS, color: INK}}>
      <div style={{fontWeight: 800, fontSize: 44, letterSpacing: -1.5, lineHeight: 1}}>{title}</div>
      <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 20, padding: '6px 0 4px', borderBottom: `12px solid ${INK}`}}>
        <span>Serving</span>
        <span>per 100 g</span>
      </div>
      {ROWS.map(([k, v, bold, h], i) => {
        const p = h === 'e' ? hiE : h === 'f' ? hiF : 0;
        return (
          <div key={i} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: k === 'Energy' ? 30 : 23, fontWeight: bold ? 800 : 500, padding: '7px 0 6px', borderBottom: `${k === 'Energy' ? 6 : 2}px solid ${INK}`, whiteSpace: 'pre'}}>
            <Mark p={p}>{k}</Mark>
            <Mark p={p}>{v}</Mark>
          </div>
        );
      })}
      <div style={{fontSize: 15, fontWeight: 600, color: '#6A6A6A', paddingTop: 8}}>* Illustrative values</div>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// The box card: full-screen photo -> card -> flips to its label; splits into FRONT / BACK
// ---------------------------------------------------------------------------
const Flip: React.FC<{r: Rect; ry: number; front: React.ReactNode; back: React.ReactNode; radius: number; o?: number}> = ({r, ry, front, back, radius, o = 1}) => {
  if (o <= 0) return null;
  const face = (child: React.ReactNode, b: boolean) => (
    <div style={{position: 'absolute', inset: 0, borderRadius: radius, overflow: 'hidden', backfaceVisibility: 'hidden', transform: b ? 'rotateY(180deg)' : undefined, boxShadow: SHADOW, background: '#fff'}}>{child}</div>
  );
  return (
    <div style={{position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, perspective: 2200, opacity: o}}>
      <div style={{position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `rotateY(${ry}deg)`}}>
        {face(front, false)}
        {face(back, true)}
      </div>
    </div>
  );
};
const BoxPhoto: React.FC<{r: Rect; t: number; badge?: number; claims?: number; band?: string; bandO?: number; question?: number; push?: number}> = ({r, t, badge = 0, claims = 0, band, bandO = 0, question = 0, push = 0}) => {
  const d = r.w * 0.36;
  return (
    <>
      <Img src={staticFile('v10/photos/box.jpg')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 62%', scale: 1 + push}} />
      {badge > 0 ? (
        <div style={{position: 'absolute', left: r.w * 0.6, top: r.h * 0.5, translate: '-50% -50%'}}>
          <Sticker d={d} lines={question > 0.5 ? ['SOUNDS', 'HEALTHY?'] : ['SUGAR', 'FREE']} k={Math.max(0, badge) * (question > 0 ? lerp(Math.min(1, popAt(t, 67.7)), 1.25, 1) : 1)} color={question > 0.5 ? RED : GREEN} />
        </div>
      ) : null}
      {claims > 0 ? (
        <div style={{position: 'absolute', left: r.w * 0.06, top: r.h * 0.08, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: r.w * 0.025}}>
          {['GUILT-FREE', 'NO ADDED SUGAR', 'NATURAL'].map((c, i) => {
            const k = popAt(t, 9.5 + i * 0.3);
            return k > 0 ? (
              <div key={i} style={{scale: Math.max(0, k), transformOrigin: 'left center', padding: `${r.w * 0.012}px ${r.w * 0.035}px`, borderRadius: 999, background: GREEN, color: '#fff', fontFamily: SANS, fontWeight: 800, fontSize: r.w * 0.06, whiteSpace: 'nowrap', border: `${r.w * 0.006}px solid #fff`}}>
                {c}
              </div>
            ) : null;
          })}
        </div>
      ) : null}
      {band ? (
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, padding: `${r.w * 0.035}px ${r.w * 0.05}px`, background: INK, color: '#fff', fontFamily: SANS, fontWeight: 800, fontSize: r.w * 0.076, lineHeight: 1.12, whiteSpace: 'pre-line', opacity: bandO, translate: `0 ${lerp(bandO, 30, 0)}px`}}>{band}</div>
      ) : null}
    </>
  );
};
const Cards: React.FC = () => {
  const t = useT();
  // hook + front
  if (t < C.journey.start) {
    const shrink = tween(t, 3.62, 0.6, EASE_IN_OUT);
    const flip = tween(t, 5.48, 0.7, EASE_IN_OUT);
    const split = tween(t, 6.68, 0.6, EASE_IN_OUT);
    const out = tween(t, C.journey.start - 0.4, 0.35, EASE_IN);
    let a = lerpR(shrink, FULL, MID);
    a = lerpR(split, a, LEFT);
    a = {...a, y: a.y - 700 * out};
    const ry = 180 * flip - 180 * split; // back to the photo when it moves left
    const radius = lerp(shrink, 0, 30);
    const b = {...lerpR(split, MID, RIGHT), y: lerpR(split, MID, RIGHT).y - 700 * out};
    const badge = popAt(t, 2.54);
    const bandA = tween(t, 7.16, 0.35);
    const bandB = tween(t, 11.48, 0.35);
    return (
      <AbsoluteFill>
        {split > 0 ? (
          <Flip
            r={b}
            ry={0}
            radius={30}
            o={Math.min(1, split * 3)}
            front={
              <>
                <NutLabel w={b.w} hiE={tween(t, 12.9, 0.45)} hiF={tween(t, 13.4, 0.45)} />
                <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, padding: `${b.w * 0.035}px ${b.w * 0.05}px`, background: INK, color: '#fff', fontFamily: SANS, fontWeight: 800, fontSize: b.w * 0.076, lineHeight: 1.12, opacity: bandB, translate: `0 ${lerp(bandB, 30, 0)}px`}}>
                  BACK · what you
                  <br />
                  need to <span style={{color: HL}}>compare</span>
                </div>
              </>
            }
            back={null}
          />
        ) : null}
        <Flip
          r={a}
          ry={ry}
          radius={radius}
          front={<BoxPhoto r={a} t={t} badge={badge} claims={split > 0.9 ? 1 : 0} band={'FRONT · what the brand\nwants you to see'} bandO={bandA} push={0.08 * (1 - shrink) * tween(t, C.hook.start, 2.5, (x) => x)} />}
          back={<NutLabel w={a.w} />}
        />
        {/* hook words on the full-screen photo */}
        {shrink < 1 ? (
          <AbsoluteFill style={{opacity: 1 - shrink}}>
            <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 38%)'}} />
            <At x={540} y={230}>
              <div style={{...rise(t, 1.2), textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 58, color: '#fff', textShadow: '0 4px 18px rgba(0,0,0,0.5)', whiteSpace: 'nowrap'}}>If you handed me a box of</div>
            </At>
            {t >= 2.5 ? (
              <At x={540} y={390} s={lerp(Math.min(1, popAt(t, 2.54)), 1.1, 1)}>
                <Tape size={96}>
                  <span style={{color: GREEN_D}}>sugar-free</span> mithai
                </Tape>
              </At>
            ) : null}
          </AbsoluteFill>
        ) : null}
      </AbsoluteFill>
    );
  }
  // the box again near the end
  if (t >= C.decide.start && t < C.cta.start + 0.4) {
    const k = tween(t, C.decide.start + 0.3, 0.5, EASE_OUT);
    const out = tween(t, C.cta.start, 0.35, EASE_IN);
    const r = {...MID, y: lerp(k, -620, MID.y) - 700 * out};
    const flip = tween(t, 68.9, 0.7, EASE_IN_OUT);
    const bandO = tween(t, 63.86, 0.35);
    return (
      <AbsoluteFill>
        <Flip
          r={r}
          ry={180 * flip}
          radius={30}
          front={<BoxPhoto r={r} t={t} badge={1} band={'YOUR DIWALI\nDECISION'} bandO={bandO} question={t >= 67.68 ? 1 : 0} />}
          back={
            <>
              <NutLabel w={r.w} hiE={tween(t, 69.3, 0.4)} />
              <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, padding: `${r.w * 0.035}px ${r.w * 0.05}px`, background: GREEN, color: '#fff', fontFamily: SANS, fontWeight: 800, fontSize: r.w * 0.07, lineHeight: 1.15}}>CHECK THE LABEL ✓</div>
            </>
          }
        />
      </AbsoluteFill>
    );
  }
  return null;
};

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------
const Card: React.FC<{r: Rect; k: number; children: React.ReactNode; bg?: string; border?: boolean}> = ({r, k, children, bg = PAPER, border = true}) =>
  k <= 0 ? null : (
    <div style={{position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: 30, background: bg, border: border ? `6px solid ${INK}` : undefined, boxSizing: 'border-box', boxShadow: SHADOW, overflow: 'hidden', scale: lerp(Math.min(1, k), 0.85, 1), opacity: Math.min(1, k * 2)}}>{children}</div>
  );
const Rep: React.FC = () => {
  const t = useT();
  const w = C.rep;
  const o = vis(t, w.start, w.end - 0.25);
  if (o <= 0) return null;
  const plate = popAt(t, 19.0);
  const stamp = popAt(t, 20.12);
  const panel = popAt(t, 21.6);
  const times = [21.9, 22.3, 22.64, 22.92, 23.3, 23.6, 24.0, 24.24];
  const n = times.filter((x) => t >= x).length;
  return (
    <AbsoluteFill style={{opacity: o}}>
      {plate > 0 ? (
        <div style={{position: 'absolute', left: 70, top: 90, width: 440, height: 440, borderRadius: 30, overflow: 'hidden', border: '10px solid #fff', boxShadow: SHADOW, scale: lerp(Math.min(1, plate), 0.85, 1), opacity: Math.min(1, plate * 2)}}>
          <Img src={staticFile('v10/photos/plate.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        </div>
      ) : null}
      {stamp > 0 ? (
        <div style={{position: 'absolute', left: 430, top: 130, translate: '-50% -50%'}}>
          <Sticker d={190} lines={['HEALTHY', '✓']} k={Math.max(0, stamp) * lerp(Math.min(1, stamp), 1.4, 1)} />
        </div>
      ) : null}
      <Card r={{x: 570, y: 100, w: 440, h: 420}} k={panel}>
        <div style={{padding: '24px 28px', fontFamily: SANS, color: INK}}>
          <div style={{fontWeight: 800, fontSize: 30, letterSpacing: 2, color: '#6A6A6A'}}>PERMISSION</div>
          <div style={{fontWeight: 800, fontSize: 50, lineHeight: 1, borderBottom: `8px solid ${INK}`, paddingBottom: 10}}>to eat it</div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 22}}>
            {times.map((x, i) => {
              const on = popAt(t, x);
              return (
                <div key={i} style={{height: 92, borderRadius: 14, background: '#EDEBE4', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  {on > 0 ? (
                    <svg width={78} height={50} viewBox="0 0 100 62" style={{scale: Math.max(0, on)}}>
                      <path d="M50 2 L98 31 L50 60 L2 31 Z" fill="#EAD8B4" stroke="#B9965C" strokeWidth={3} />
                      <path d="M50 10 L86 31 L50 52 L14 31 Z" fill="#E4E4E4" />
                    </svg>
                  ) : null}
                </div>
              );
            })}
          </div>
          <div style={{marginTop: 16, fontWeight: 800, fontSize: 34, display: 'flex', justifyContent: 'space-between'}}>
            <span>pieces</span>
            <span style={{color: n > 4 ? RED : INK}}>× {Math.max(1, n)}</span>
          </div>
        </div>
      </Card>
    </AbsoluteFill>
  );
};
const Nuts: React.FC = () => {
  const t = useT();
  const w = C.nuts;
  const o = vis(t, w.start, w.end - 0.25);
  if (o <= 0) return null;
  const k = popAt(t, 25.2);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Card r={{x: 70, y: 90, w: 940, h: 470}} k={k}>
        <div style={{padding: '26px 34px', fontFamily: SANS, color: INK}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `10px solid ${INK}`, paddingBottom: 10}}>
            <span style={{fontWeight: 800, fontSize: 52, letterSpacing: -1}}>Ingredients</span>
            <span style={{padding: '6px 18px', borderRadius: 999, background: GREEN, color: '#fff', fontWeight: 800, fontSize: 28}}>SUGAR FREE</span>
          </div>
          <div style={{fontWeight: 600, fontSize: 44, lineHeight: 1.42, marginTop: 18}}>
            <Mark p={tween(t, 29.9, 0.4)}>
              <b>Cashew nuts</b> (45%)
            </Mark>
            , milk solids, <Mark p={tween(t, 30.8, 0.35)}><b>ghee</b></Mark>, sweetener (maltitol), cardamom, silver leaf.
          </div>
          <div style={{position: 'absolute', left: 34, bottom: 26, display: 'flex', gap: 14}}>
            {t >= 29.9 ? <Tape size={34} bg={HL} style={{scale: Math.max(0, popAt(t, 29.9))}}>NUTS</Tape> : null}
            {t >= 30.8 ? <Tape size={34} bg={HL} style={{scale: Math.max(0, popAt(t, 30.8))}}>+ FAT</Tape> : null}
          </div>
          <div style={{position: 'absolute', right: 34, bottom: 30, fontSize: 18, fontWeight: 600, color: '#777'}}>* illustrative</div>
        </div>
      </Card>
    </AbsoluteFill>
  );
};
const Nine: React.FC = () => {
  const t = useT();
  const w = C.nine;
  const o = vis(t, w.start, w.end - 0.25);
  if (o <= 0) return null;
  const k = popAt(t, 31.8);
  const nine = popAt(t, 33.58);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Card r={{x: 140, y: 90, w: 800, h: 470}} k={k} bg={INK} border={false}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 46, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 60, color: '#fff'}}>
          1 g of <span style={{color: HL}}>fat</span>
        </div>
        {t >= 33.5 ? (
          <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 230, lineHeight: 1, color: '#fff', letterSpacing: -6, scale: lerp(Math.min(1, nine), 1.3, 1), opacity: Math.min(1, nine * 2)}}>
            ≈ 9 <span style={{fontSize: 110, letterSpacing: -2}}>kcal</span>
          </div>
        ) : null}
      </Card>
    </AbsoluteFill>
  );
};
const MiniLabel: React.FC<{name: string; kcal: string; hi: number}> = ({name, kcal, hi}) => (
  <div style={{padding: '22px 26px', fontFamily: SANS, color: INK}}>
    <div style={{fontWeight: 800, fontSize: 30, letterSpacing: 2, color: '#6A6A6A'}}>{name}</div>
    <div style={{fontWeight: 800, fontSize: 44, lineHeight: 1, borderBottom: `10px solid ${INK}`, paddingBottom: 10}}>Nutrition</div>
    <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 26, padding: '10px 0', borderBottom: `3px solid ${INK}`}}>
      <span>Energy</span>
      <Mark p={hi}>per 100 g</Mark>
    </div>
    <div style={{fontWeight: 800, fontSize: 86, letterSpacing: -2, marginTop: 10}}>
      <Mark p={hi}>{kcal}</Mark>
      <span style={{fontSize: 36}}> kcal</span>
    </div>
  </div>
);
const Compare: React.FC = () => {
  const t = useT();
  const w = C.compare;
  const o = vis(t, w.start, w.end - 0.25);
  if (o <= 0) return null;
  const hi = tween(t, 38.48, 0.45);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Card r={{x: 70, y: 90, w: 430, h: 400}} k={popAt(t, 36.64)}>
        <MiniLabel name="SWEET A" kcal="400" hi={hi} />
      </Card>
      <Card r={{x: 580, y: 90, w: 430, h: 400}} k={popAt(t, 37.0)}>
        <MiniLabel name="SWEET B" kcal="480" hi={hi} />
      </Card>
      {t >= 39.96 ? (
        <At x={540} y={540} s={Math.max(0, popAt(t, 39.96))}>
          <Tape size={44} bg={HL}>
            <Ico name="scales" size={50} color={INK} /> then: MY ACTUAL PORTION
          </Tape>
        </At>
      ) : null}
    </AbsoluteFill>
  );
};
const LINES: {at: number; l: string; r: string; big?: boolean; rule?: boolean; note?: boolean}[] = [
  {at: 44.18, l: 'KAJU KATLI', r: '30 g'},
  {at: 46.14, l: 'LABEL', r: '400 kcal/100 g'},
  {at: 48.36, l: '30 × 400 ÷ 100', r: ''},
  {at: 49.6, l: '', r: '', rule: true},
  {at: 49.72, l: 'TOTAL', r: '120 kcal', big: true},
  {at: 54.0, l: "* use YOUR product's numbers", r: '', note: true},
];
const Receipt: React.FC = () => {
  const t = useT();
  const w = C.calc;
  const o = vis(t, w.start, w.end - 0.3);
  if (o <= 0) return null;
  const head = tween(t, 42.9, 0.4, EASE_OUT);
  const shown = LINES.filter((x) => t >= x.at - 0.05);
  const lineH = (x: (typeof LINES)[number]) => (x.big ? 92 : x.rule ? 30 : x.note ? 50 : 64);
  const H = 120 * head + shown.reduce((s, x) => s + lineH(x) * tween(t, x.at - 0.05, 0.22, EASE_OUT), 0) + 40;
  const stamp = popAt(t, 52.56);
  return (
    <AbsoluteFill style={{opacity: o}}>
      {/* printer slot */}
      <div style={{position: 'absolute', left: 200, top: 48, width: 680, height: 34, borderRadius: 17, background: INK, boxShadow: '0 10px 20px -6px rgba(0,0,0,0.4)'}} />
      <div style={{position: 'absolute', left: 240, top: 64, width: 600, height: H, background: PAPER, boxShadow: SHADOW, overflow: 'hidden', clipPath: `polygon(0 0, 100% 0, 100% calc(100% - 14px), ${Array.from({length: 21}, (_, i) => `${100 - i * 5}% ${i % 2 ? 'calc(100% - 14px)' : '100%'}`).join(', ')})`}}>
        <div style={{padding: '34px 40px 0', fontFamily: MONO, color: INK}}>
          <div style={{textAlign: 'center', fontWeight: 700, fontSize: 32, letterSpacing: 2}}>*** PORTION CHECK ***</div>
          <div style={{textAlign: 'center', fontSize: 22, color: '#666', marginTop: 4}}>for example</div>
          <div style={{borderBottom: `3px dashed ${INK}`, margin: '16px 0 10px'}} />
          {shown.map((x, i) =>
            x.rule ? (
              <div key={i} style={{borderBottom: `3px dashed ${INK}`, margin: '10px 0 14px'}} />
            ) : (
              <div key={i} style={{display: 'flex', justifyContent: 'space-between', fontSize: x.big ? 56 : x.note ? 26 : 36, fontWeight: x.big || x.note ? 700 : 400, color: x.note ? RED : INK, lineHeight: x.big ? '80px' : x.note ? '46px' : '60px', ...rise(t, x.at)}}>
                <span>{x.l}</span>
                <span>{x.big ? <Mark p={tween(t, 49.9, 0.4)}>{x.r}</Mark> : x.r}</span>
              </div>
            ),
          )}
        </div>
      </div>
      {stamp > 0 ? (
        <div style={{position: 'absolute', left: 752, top: 343, translate: '-50% -50%', scale: Math.max(0, stamp) * lerp(Math.min(1, stamp), 1.5, 1), padding: '2px 12px', border: `4px solid ${RED}`, borderRadius: 10, color: RED, fontFamily: SANS, fontWeight: 800, fontSize: 27, letterSpacing: 3, background: 'rgba(255,253,247,0.85)'}}>ILLUSTRATIVE</div>
      ) : null}
    </AbsoluteFill>
  );
};
const Choose: React.FC = () => {
  const t = useT();
  const w = C.choose;
  if (t < w.start || t >= w.end) return null;
  const p = tween(t, w.start, w.end - w.start, (x) => x);
  const k = tween(t, w.start, 0.35, EASE_OUT);
  return (
    <AbsoluteFill style={{background: INK}}>
      <Img src={staticFile('v10/photos/shop.jpg')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${lerp(p, 30, 60)}% 50%`, scale: lerp(k, 1.15, 1.04) + 0.06 * p}} />
      <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(0,0,0,0.45), rgba(0,0,0,0) 35%)'}} />
      <At x={540} y={240}>
        <div style={rise(t, 57.02)}>
          <Tape size={46}>choose the one you</Tape>
        </div>
      </At>
      {t >= 58.6 ? (
        <At x={540} y={370} s={lerp(Math.min(1, popAt(t, 58.72)), 1.3, 1)}>
          <Tape size={96} bg={HL}>
            actually enjoy <Ico name="heart" size={84} color={RED} />
          </Tape>
        </At>
      ) : null}
    </AbsoluteFill>
  );
};
const EnjoyTag: React.FC = () => {
  const t = useT();
  if (t < 60.0 || t >= C.enjoy.end) return null;
  return (
    <At x={540} y={300} s={Math.max(0, popAt(t, 60.12))}>
      <Tape size={70} bg={HL}>serve a portion</Tape>
    </At>
  );
};
const Journey: React.FC = () => {
  const t = useT();
  if (t < C.journey.start || t >= C.journey.end) return null;
  return (
    <AbsoluteFill>
      <At x={540} y={260}>
        <div style={rise(t, 15.86)}>
          <Tape size={44}>my</Tape>
        </div>
      </At>
      {t >= 16.2 ? (
        <At x={540} y={380} s={lerp(Math.min(1, popAt(t, 16.24)), 1.25, 1)}>
          <Tape size={90} bg={HL}>weight-loss journey</Tape>
        </At>
      ) : null}
    </AbsoluteFill>
  );
};
const Cta: React.FC = () => {
  const t = useT();
  const w = C.cta;
  if (t < w.start) return null;
  const k = popAt(t, 70.32);
  const card = tween(t, 71.66, 0.45, EASE_OUT);
  return (
    <AbsoluteFill>
      <At x={540} y={170}>
        <div style={rise(t, 70.06)}>
          <Tape size={52}>comment</Tape>
        </div>
      </At>
      {t >= 70.3 ? (
        <At x={540} y={330} s={lerp(Math.min(1.1, k), 1.4, 1)} o={Math.min(1, k * 2)}>
          <Tape size={150} bg={HL}>GUIDE</Tape>
        </At>
      ) : null}
      {card > 0 ? (
        <div style={{position: 'absolute', left: 540, top: lerp(card, 640, 520), translate: '-50% -50%', opacity: card, display: 'flex', alignItems: 'center', gap: 20, padding: '18px 34px 18px 18px', borderRadius: 26, background: '#fff', border: `5px solid ${INK}`, boxShadow: SHADOW}}>
          <div style={{width: 80, height: 80, borderRadius: 18, background: RED, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Ico name="file-pdf" size={52} color="#fff" />
          </div>
          <div style={{fontFamily: SANS}}>
            <div style={{fontSize: 38, fontWeight: 800, color: INK, whiteSpace: 'nowrap'}}>Free Fat Loss Guide</div>
            <div style={{fontSize: 26, fontWeight: 700, color: '#777'}}>sent to your DMs</div>
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Captions: label tape, spoken word underlined in green, key words in green
// ---------------------------------------------------------------------------
const KEY = new Set(['sugar-free', 'mithai', 'around', 'front', 'brand', 'nutrition', 'panel', 'compare', 'journey', 'reputation', 'permission', 'nuts', 'fat', '9', '100', 'portion', '30', '400', '120', 'illustrative', 'enjoy', 'diwali', 'healthy', 'guide']);
const NO_CAPS = [{start: C.hook.start, end: 3.62}, {start: C.cta.start + 0.2, end: 999}];
const Caps: React.FC = () => {
  const t = useT();
  if (inWin(t, NO_CAPS)) return null;
  const chunk = chunkAt(cfg.captions, t);
  if (!chunk) return null;
  const k = tween(t, chunk[0].start - 0.04, 0.14);
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top: 1520, translate: `0 ${-50 + lerp(k, 10, 0)}%`, textAlign: 'center', opacity: k}}>
      <div style={{display: 'inline-block', padding: '10px 26px 14px', background: '#fff', border: `5px solid ${INK}`, borderRadius: 18, boxShadow: '0 12px 26px -10px rgba(0,0,0,0.45)', scale: lerp(k, 0.94, 1)}}>
        {chunk.map((w, i) => {
          const nextStart = chunk[i + 1]?.start ?? w.end + 0.3;
          const on = t >= w.start - 0.03 && t < nextStart;
          const key = KEY.has(w.text.toLowerCase().replace(/[.,?!]/g, ''));
          return (
            <span key={i} style={{display: 'inline-block', margin: '0 0.12em', fontFamily: SANS, fontWeight: 800, fontSize: 58, lineHeight: 1.15, color: key ? GREEN_D : INK, backgroundImage: `linear-gradient(${GREEN}, ${GREEN})`, backgroundRepeat: 'no-repeat', backgroundPosition: '0 100%', backgroundSize: `${on ? 100 : 0}% 7px`}}>
              {w.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
const Scene: React.FC = () => (
  <>
    <Footage cfg={cfg} />
    <GradeOverlay cfg={cfg} />
    <Rep />
    <Nuts />
    <Nine />
    <Compare />
    <Receipt />
    <Subject cfg={cfg} />
    <Cards />
    <Cta />
    <BrollCuts cfg={cfg} />
    <Journey />
    <EnjoyTag />
    <Choose />
    <Caps />
  </>
);

export const V10Reel: React.FC = () => (
  <Base cfg={{...cfg, shakes: [2.54, 20.12, 49.72]}}>
    <Scene />
  </Base>
);
