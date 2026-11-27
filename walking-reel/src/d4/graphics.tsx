import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, staticFile} from 'remotion';
import {useT} from '../explainer/kit';
import {EASE_IN, EASE_OUT, FPS, SERIF, lerp, tween} from '../theme';
import {popAt} from '../series/kit2';
import {BRAND, GROT, MixWord} from '../ads/extras';

/**
 * Skinny-fat reel graphics. Her head top sits at y ~575 here, so everything that shares the frame with
 * her lives in the band y 270-560 (below the Reels top UI, above her hair). Source seconds.
 */
const WHITE = '#FFFFFF';
const INK = '#141414';
const RED = '#E5484D';
const AMBER = '#F5A524';
const vis = (t: number, w: {start: number; end: number}) => (t < w.start || t > w.end + 0.25 ? 0 : tween(t, w.start, 0.25, EASE_OUT) * (1 - tween(t, w.end - 0.05, 0.25, EASE_IN)));
const shadow = '0 18px 36px -14px rgba(0,0,0,0.55)';

/** Front-view body silhouette; `belly` 0 = flat, 1 = round. */
const Body: React.FC<{w: number; belly: number; heavy?: number; color?: string; fatGlow?: number}> = ({w, belly, heavy = 0, color = '#3B3F46', fatGlow = 0}) => {
  const hw = 26 + heavy * 16; // hip half-width
  const bw = 22 + belly * 18 + heavy * 12; // belly half-width
  return (
    <svg width={w} height={w * 1.9} viewBox="0 0 120 228" style={{display: 'block'}}>
      <circle cx={60} cy={22} r={15} fill={color} />
      <path d={`M60 40 C${60 - 24 - heavy * 8} 42 ${60 - 30 - heavy * 10} 50 ${60 - 30 - heavy * 10} 64 L${60 - 34 - heavy * 10} 118 L${60 - 27 - heavy * 8} 120 L${60 - 22 - heavy * 6} 76
        C${60 - bw} 92 ${60 - bw - 2} 112 ${60 - hw} 130 L${60 - hw + 4} 222 L${60 - 6} 222 L60 150 L${60 + 6} 222 L${60 + hw - 4} 222 L${60 + hw} 130
        C${60 + bw + 2} 112 ${60 + bw} 92 ${60 + 22 + heavy * 6} 76 L${60 + 27 + heavy * 8} 120 L${60 + 34 + heavy * 10} 118 L${60 + 30 + heavy * 10} 64 C${60 + 30 + heavy * 10} 50 ${60 + 24 + heavy * 8} 42 60 40 Z`} fill={color} />
      {fatGlow > 0 ? <ellipse cx={60} cy={104} rx={bw - 4} ry={18} fill={AMBER} opacity={0.85 * fatGlow} /> : null}
    </svg>
  );
};

/** "If you look like this and you think you're better than this, then you're not." */
export type BodyPair = {start: number; end: number; aAt: number; bAt: number; eqAt: number; focusAt: number};
export const BodyCards: React.FC<{b: BodyPair}> = ({b}) => {
  const t = useT();
  const o = vis(t, b);
  if (o <= 0) return null;
  const card = (at: number, label: string, belly: number, heavy: number, glow: number) => {
    const k = popAt(t, at);
    return t < at ? (
      <div style={{width: 250}} />
    ) : (
      <div style={{width: 250, height: 300, borderRadius: 26, background: 'rgba(255,255,255,0.96)', boxShadow: shadow, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 12, boxSizing: 'border-box', scale: lerp(Math.min(1.06, k), 0.5, 1), opacity: Math.min(1, k * 3)}}>
        <Body w={124} belly={belly} heavy={heavy} fatGlow={glow} />
        <span style={{fontFamily: GROT, fontWeight: 800, fontSize: 30, color: INK, marginTop: 4}}>{label}</span>
      </div>
    );
  };
  const e = popAt(t, b.eqAt);
  // "Agar aapko is type ka body fat hai": the skinny-fat card takes the stage, belly lit up
  const f = tween(t, b.focusAt, 0.45, EASE_OUT);
  const tag = popAt(t, b.focusAt + 0.25);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 285, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: lerp(f, 26, 0)}}>
        <div style={{scale: lerp(f, 1, 1.08), transformOrigin: '50% 0', translate: `0 ${lerp(f, 0, -10)}px`}}>{card(b.aAt, 'Skinny Fat', 0.75, 0, t >= b.eqAt ? Math.min(1, Math.max(e, f)) : 0)}</div>
        <div style={{width: lerp(f, 70, 0), overflow: 'hidden', opacity: 1 - f}}>
          <span style={{display: 'block', width: 70, textAlign: 'center', fontFamily: GROT, fontWeight: 800, fontSize: 96, color: RED, textShadow: '0 4px 14px rgba(0,0,0,0.35)', scale: lerp(Math.min(1.1, e), 1.8, 1), opacity: t >= b.eqAt ? 1 : 0}}>=</span>
        </div>
        <div style={{width: lerp(f, 250, 0), overflow: 'hidden', opacity: 1 - f}}>{card(b.bAt, 'Overweight', 0.9, 1, 0)}</div>
      </div>
      {t >= b.focusAt + 0.25 ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: 268, display: 'flex', justifyContent: 'center', paddingLeft: 300}}>
          <div style={{padding: '8px 22px', borderRadius: 999, background: AMBER, boxShadow: shadow, fontFamily: GROT, fontWeight: 800, fontSize: 34, color: INK, scale: lerp(Math.min(1.08, tag), 1.8, 1), opacity: Math.min(1, tag * 3)}}>This Type ↓</div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/** A line of words in the reel's type (italic serif for "_word", heavy grotesque otherwise), popping on speech. */
export type Title = {start: number; end: number; y: number; size: number; rows: {text: string; at: number; color?: string}[][]};
export const TitleView: React.FC<{d: Title}> = ({d}) => {
  const t = useT();
  const o = vis(t, d);
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: 30, right: 30, top: d.y, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
        {d.rows.map((r, i) => (
          <div key={i} style={{display: 'flex', justifyContent: 'center', alignItems: 'baseline', columnGap: d.size * 0.22}}>
            {r.map((w, j) => {
              if (t < w.at) return null;
              const k = popAt(t, w.at);
              return <MixWord key={j} w={w.text} size={d.size} color={w.color} style={{scale: lerp(Math.min(1.06, k), 0.5, 1), opacity: Math.min(1, k * 3), translate: `0 ${lerp(Math.min(1, k), 24, 0)}px`}} />;
            })}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/** "Isme patle toh zaroor dikh sakte ho, but aapki belly area mein bahut zyada fat hota hai - visceral fat":
 *  a full-screen "body scan" (after the reference reel): cream page, her live cut-out in black and white,
 *  corner brackets, small technical labels, a yellow target ring that locks onto her belly and fills with points. */
export type Visceral = {start: number; end: number; thinAt: number; bellyAt: number; fatAt: number; nameAt: number};
const CREAM = '#ECE8E0';
const NEON = '#DDEB2F';
const MONO: React.CSSProperties = {fontFamily: GROT, fontWeight: 700, fontSize: 24, letterSpacing: 3, textTransform: 'uppercase', color: INK};
const BELLY = {x: 532, y: 1360, r: 165};
const SCALE = 0.8; // her figure, scaled about (540, 600) so the belly comes up into view
const DOTS: [number, number, number, boolean][] = [
  [-0.5, -0.2, 0.0, true], [0.35, -0.45, 0.06, false], [0.1, 0.25, 0.12, true], [-0.3, 0.5, 0.18, false], [0.6, 0.15, 0.24, false],
  [-0.65, 0.15, 0.3, false], [0.25, -0.1, 0.36, true], [-0.1, -0.55, 0.42, false], [0.45, 0.5, 0.48, true], [-0.4, -0.5, 0.54, false],
  [0.0, 0.6, 0.6, false], [0.7, -0.25, 0.66, true], [-0.2, 0.1, 0.72, false], [0.15, -0.7, 0.78, false],
];
const Bracket: React.FC<{x: number; y: number; fx: 1 | -1; fy: 1 | -1; k: number}> = ({x, y, fx, fy, k}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 46 * k, height: 46 * k, borderLeft: fx === 1 ? `3px solid ${INK}` : undefined, borderRight: fx === -1 ? `3px solid ${INK}` : undefined, borderTop: fy === 1 ? `3px solid ${INK}` : undefined, borderBottom: fy === -1 ? `3px solid ${INK}` : undefined, translate: `${fx === -1 ? -46 * k : 0}px ${fy === -1 ? -46 * k : 0}px`, opacity: 0.75}} />
);
export const VisceralInsert: React.FC<{v: Visceral; captions: {text: string; start: number; end: number}[][]}> = ({v, captions}) => {
  const t = useT();
  if (t < v.start || t > v.end + 0.3) return null;
  const inP = tween(t, v.start, 0.3, EASE_OUT);
  const outP = tween(t, v.end - 0.1, 0.35, EASE_IN);
  const fig = tween(t, v.start + 0.1, 0.5, EASE_OUT);
  const br = tween(t, v.start + 0.15, 0.45, EASE_OUT);
  const ring = tween(t, v.bellyAt, 0.6, EASE_OUT);
  const lead = tween(t, v.bellyAt + 0.25, 0.4, EASE_OUT);
  const name = popAt(t, v.nameAt);
  const pulse = t > v.nameAt ? 1 + 0.04 * Math.sin((t - v.nameAt) * 7) : 1;
  const stage = t >= v.nameAt ? 3 : t >= v.fatAt ? 2 : t >= v.bellyAt ? 1 : 0;
  const head = ['Looks Thin', 'Belly Area', 'Too Much Fat', 'Visceral Fat'][stage];
  const at = [v.thinAt, v.bellyAt, v.fatAt, v.nameAt][stage];
  const hk = tween(t, at, 0.3, EASE_OUT);
  const C = 2 * Math.PI * BELLY.r;
  // the caption being spoken, as a black label (reference style)
  let ci = -1;
  for (let i = 0; i < captions.length; i++) if (captions[i][0].start - 0.04 <= t) ci = i;
  const cap = ci >= 0 && t <= captions[ci][captions[ci].length - 1].end + 0.4 && captions[ci][0].start >= v.start - 0.1 ? captions[ci] : null;
  return (
    <AbsoluteFill style={{opacity: Math.min(inP, 1 - outP)}}>
      <AbsoluteFill style={{background: `radial-gradient(90% 60% at 50% 45%, #F4F1EA 0%, ${CREAM} 70%)`}} />
      {/* her, live, black and white */}
      <Sequence from={Math.round(v.start * FPS)} durationInFrames={Math.round((v.end - v.start + 0.4) * FPS)} layout="none">
        <AbsoluteFill style={{scale: lerp(fig, 0.84, SCALE), transformOrigin: '540px 600px', opacity: fig, filter: `grayscale(1) contrast(1.15) brightness(${lerp(outP, 1, 1.6)})`, WebkitMaskImage: 'linear-gradient(to bottom, #000 78%, transparent 96%)', maskImage: 'linear-gradient(to bottom, #000 78%, transparent 96%)'}}>
          <OffthreadVideo src={staticFile('d4/subject_1080.webm')} transparent muted startFrom={Math.round(v.start * FPS)} style={{width: '100%', height: '100%'}} />
        </AbsoluteFill>
      </Sequence>
      {/* frame */}
      <Bracket x={70} y={270} fx={1} fy={1} k={br} />
      <Bracket x={1010} y={270} fx={-1} fy={1} k={br} />
      <Bracket x={70} y={1640} fx={1} fy={-1} k={br} />
      <Bracket x={1010} y={1640} fx={-1} fy={-1} k={br} />
      {/* header */}
      <div style={{position: 'absolute', left: 110, top: 300, display: 'flex', flexDirection: 'column', gap: 6, opacity: br}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <span style={{width: 16, height: 16, borderRadius: '50%', border: `3px solid ${INK}`, background: stage >= 1 ? NEON : 'transparent', boxSizing: 'border-box'}} />
          <span style={MONO}>Skinny Fat</span>
        </div>
        <div style={{...MONO, fontSize: 20, letterSpacing: 4, opacity: 0.6, marginTop: 8}}>{stage === 0 ? 'outside' : 'inside'}</div>
        <div style={{fontFamily: SERIF, fontSize: 92, lineHeight: 1, color: INK, opacity: hk, translate: `0 ${lerp(hk, 12, 0)}px`}}>
          {stage === 3 ? <span style={{background: NEON, padding: '0 10px'}}>{head}</span> : head}
        </div>
      </div>
      {/* leader line from the header to the ring */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <path d={`M 118 ${470} L 118 ${BELLY.y} L ${BELLY.x - BELLY.r} ${BELLY.y}`} fill="none" stroke={INK} strokeWidth={2} strokeOpacity={0.55} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - lead} />
        <circle cx={BELLY.x} cy={BELLY.y} r={BELLY.r * pulse} fill="none" stroke={NEON} strokeWidth={6} strokeDasharray={C} strokeDashoffset={C * (1 - ring)} transform={`rotate(-90 ${BELLY.x} ${BELLY.y})`} style={{filter: 'drop-shadow(0 0 6px rgba(0,0,0,0.35))'}} />
        {ring > 0.95 ? <circle cx={BELLY.x} cy={BELLY.y} r={7} fill={NEON} stroke={INK} strokeWidth={2} /> : null}
        {DOTS.map(([dx, dy, d, y], i) => {
          const k = popAt(t, v.fatAt + d);
          if (t < v.fatAt + d) return null;
          return <circle key={i} cx={BELLY.x + dx * BELLY.r} cy={BELLY.y + dy * BELLY.r} r={lerp(Math.min(1.1, k), 2, y ? 13 : 11)} fill={y ? NEON : '#FFFFFF'} stroke={INK} strokeWidth={2.5} />;
        })}
      </svg>
      {t >= v.nameAt ? (
        <div style={{position: 'absolute', left: BELLY.x + BELLY.r + 18, top: BELLY.y - BELLY.r - 10, padding: '8px 16px', background: INK, scale: lerp(Math.min(1.08, name), 1.6, 1), opacity: Math.min(1, name * 3), transformOrigin: 'left center'}}>
          <span style={{...MONO, color: NEON, fontSize: 26}}>Visceral Fat</span>
        </div>
      ) : null}
      {cap ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: 1700, display: 'flex', justifyContent: 'center'}}>
          <div style={{padding: '10px 18px', background: INK}}>
            <span style={{...MONO, color: '#FFFFFF', fontSize: 30, letterSpacing: 2}}>{cap.map((w) => w.text.replace(/[,.]$/, '')).join(' ')}</span>
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/** "And it's mostly seen in Indians." */
export const IndiaLine: React.FC<{w: {start: number; end: number; at: number; flagAt: number}}> = ({w}) => {
  const t = useT();
  const o = vis(t, w);
  if (o <= 0) return null;
  const f = popAt(t, w.flagAt);
  const k = popAt(t, w.at);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 330, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22}}>
        <div style={{opacity: Math.min(1, k * 3), translate: `0 ${lerp(Math.min(1, k), 20, 0)}px`}}>
          <MixWord w="_mostly seen in" size={74} />
        </div>
        {t >= w.flagAt ? (
          <div style={{display: 'flex', alignItems: 'center', gap: 16, scale: lerp(Math.min(1.06, f), 0.5, 1), opacity: Math.min(1, f * 3)}}>
            <svg width={96} height={64} viewBox="0 0 90 60" style={{borderRadius: 8, boxShadow: shadow}}>
              <rect width={90} height={20} fill="#FF9933" />
              <rect y={20} width={90} height={20} fill="#FFFFFF" />
              <rect y={40} width={90} height={20} fill="#138808" />
              <circle cx={45} cy={30} r={7.5} fill="none" stroke="#000080" strokeWidth={1.6} />
            </svg>
            <MixWord w="Indians" size={96} serif={false} />
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

/** "That's why we're more prone to diabetes, fatty liver and metabolic diseases." */
const Icon: React.FC<{kind: 'drop' | 'liver' | 'pulse'}> = ({kind}) => (
  <svg width={110} height={110} viewBox="0 0 100 100">
    {kind === 'drop' ? (
      <>
        <path d="M50 10 C38 30 24 46 24 62 C24 78 36 90 50 90 C64 90 76 78 76 62 C76 46 62 30 50 10 Z" fill={RED} />
        <path d="M38 64 C38 72 43 78 50 80" stroke="#FFFFFF" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.8} />
      </>
    ) : null}
    {kind === 'liver' ? <path d="M10 44 C14 24 44 18 70 22 C90 25 94 40 86 52 C76 66 58 70 46 80 C36 88 22 82 16 70 C10 60 8 52 10 44 Z" fill="#B5542E" /> : null}
    {kind === 'pulse' ? (
      <>
        <path d="M50 86 C20 66 8 50 8 34 C8 20 18 12 30 12 C40 12 46 18 50 26 C54 18 60 12 70 12 C82 12 92 20 92 34 C92 50 80 66 50 86 Z" fill="#E5484D" />
        <path d="M18 46 L36 46 L42 34 L50 60 L58 40 L64 46 L82 46" stroke="#FFFFFF" strokeWidth={5} fill="none" strokeLinejoin="round" strokeLinecap="round" />
      </>
    ) : null}
  </svg>
);
export type Diseases = {start: number; end: number; items: {label: string; at: number; kind: 'drop' | 'liver' | 'pulse'}[]};
export const DiseaseCards: React.FC<{d: Diseases}> = ({d}) => {
  const t = useT();
  const o = vis(t, d);
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 290, display: 'flex', justifyContent: 'center', gap: 22}}>
        {d.items.map((it, i) => {
          const k = popAt(t, it.at);
          return (
            <div key={i} style={{width: 300, height: 250, borderRadius: 26, background: 'rgba(255,255,255,0.96)', boxShadow: shadow, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, scale: lerp(Math.min(1.06, k), 0.4, 1), opacity: t < it.at ? 0 : Math.min(1, k * 3), translate: `0 ${lerp(Math.min(1, k), -60, 0)}px`}}>
              <Icon kind={it.kind} />
              <span style={{fontFamily: GROT, fontWeight: 800, fontSize: it.label.length > 12 ? 30 : 38, color: INK, textAlign: 'center', lineHeight: 1.05}}>{it.label}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** Comment "CHANGE": the small line over her head, the big word rises from behind it. */
export const CommentLine: React.FC<{at: number}> = ({at}) => {
  const t = useT();
  if (t < at) return null;
  const k = tween(t, at, 0.35, EASE_OUT);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 280, display: 'flex', justifyContent: 'center', opacity: k, translate: `0 ${lerp(k, 16, 0)}px`}}>
        <span style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 80, color: WHITE, textShadow: '0 3px 18px rgba(0,0,0,0.75), 0 1px 4px rgba(0,0,0,0.6)'}}>comment</span>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1250, display: 'flex', justifyContent: 'center', opacity: tween(t, at + 0.9, 0.35, EASE_OUT), translate: `0 ${lerp(tween(t, at + 0.9, 0.35, EASE_OUT), 16, 0)}px`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '14px 32px', borderRadius: 999, background: BRAND, boxShadow: shadow, fontFamily: GROT, fontWeight: 800, fontSize: 44, color: WHITE}}>
          I'll help you transform →
        </div>
      </div>
    </AbsoluteFill>
  );
};
