import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile} from 'remotion';
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

/** "If you look like this and you think you're better than this, then you're not.":
 *  two full-length men stand in the room behind her (her cut-out is drawn over their legs), one each side;
 *  small technical tags like the body scan; a red "=" between; on "is type ka" the skinny-fat one is ringed. */
export type BodyPair = {start: number; end: number; aAt: number; bAt: number; eqAt: number; focusAt: number};
const FIG_TOP = 330;
const FIG_H = 1000;
const TAG: React.CSSProperties = {fontFamily: GROT, fontWeight: 700, fontSize: 26, letterSpacing: 3, textTransform: 'uppercase', color: '#FFFFFF'};
const Tag: React.FC<{text: string; k: number; dot: string; align: 'left' | 'right'; hl?: boolean}> = ({text, k, dot, align, hl}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 10, flexDirection: align === 'left' ? 'row' : 'row-reverse', opacity: k, translate: `${lerp(k, align === 'left' ? -16 : 16, 0)}px 0`}}>
    <span style={{width: 14, height: 14, borderRadius: '50%', background: dot, boxShadow: '0 0 0 3px rgba(20,20,20,0.85)'}} />
    <span style={{...TAG, padding: '6px 12px', background: hl ? '#DDEB2F' : 'rgba(20,20,20,0.88)', color: hl ? '#141414' : '#FFFFFF'}}>{text}</span>
  </div>
);
export const BodyFigures: React.FC<{b: BodyPair}> = ({b}) => {
  const t = useT();
  if (t < b.start || t > b.end + 0.3) return null;
  const out = tween(t, b.end - 0.1, 0.35, EASE_IN);
  const ka = tween(t, b.aAt, 0.5, EASE_OUT);
  const kb = tween(t, b.bAt, 0.5, EASE_OUT);
  const f = tween(t, b.focusAt, 0.5, EASE_OUT);
  const fig = (src: string, w: number, left: number, k: number, from: number, dim: number, scale: number) => (
    <div style={{position: 'absolute', left, top: FIG_TOP, height: FIG_H, translate: `${lerp(k, from, 0) + lerp(out, 0, from)}px 0`, opacity: Math.min(1, k * 1.5) * (1 - out) * dim, filter: 'drop-shadow(0 24px 30px rgba(0,0,0,0.35))', scale, transformOrigin: '50% 40%'}}>
      <Img src={staticFile(`d4/img/${src}`)} style={{height: FIG_H, width: w, display: 'block'}} />
    </div>
  );
  const W_A = (218 / 1088) * FIG_H;
  const W_B = (310 / 1086) * FIG_H;
  return (
    <AbsoluteFill>
      {/* soft light behind each figure so they read against the room */}
      <AbsoluteFill style={{opacity: Math.max(ka * (1 - out), 0) * 0.9, background: 'radial-gradient(22% 30% at 13% 38%, rgba(255,255,255,0.55), rgba(255,255,255,0) 100%)'}} />
      <AbsoluteFill style={{opacity: kb * (1 - out) * (1 - f) * 0.9, background: 'radial-gradient(24% 30% at 85% 38%, rgba(255,255,255,0.55), rgba(255,255,255,0) 100%)'}} />
      {fig('skinny_cut.png', W_A, 40, ka, -260, 1, lerp(f, 1, 1.04))}
      {fig('over_cut.png', W_B, 1080 - 40 - W_B, kb, 300, 1 - f, 1)}
    </AbsoluteFill>
  );
};
/** The tags, the "=" and the belly ring sit in front of her (top band, clear of her face). */
export const BodyTags: React.FC<{b: BodyPair}> = ({b}) => {
  const t = useT();
  if (t < b.start || t > b.end + 0.3) return null;
  const out = tween(t, b.end - 0.1, 0.35, EASE_IN);
  const ka = tween(t, b.aAt + 0.2, 0.35, EASE_OUT);
  const kb = tween(t, b.bAt + 0.2, 0.35, EASE_OUT);
  const e = popAt(t, b.eqAt);
  const f = tween(t, b.focusAt, 0.5, EASE_OUT);
  const ring = tween(t, b.focusAt + 0.1, 0.55, EASE_OUT);
  const C = 2 * Math.PI * 80;
  return (
    <AbsoluteFill style={{opacity: 1 - out}}>
      <div style={{position: 'absolute', left: 36, top: 282}}>
        <Tag text={f > 0.5 ? 'Skinny Fat · This Type' : 'Skinny Fat'} k={ka} dot={f > 0.5 ? '#DDEB2F' : '#FFFFFF'} align="left" hl={f > 0.5} />
      </div>
      <div style={{position: 'absolute', right: 36, top: 282, opacity: 1 - f}}>
        <Tag text="Overweight" k={kb} dot="#FFFFFF" align="right" />
      </div>
      {ring > 0 ? (
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          <ellipse cx={162} cy={FIG_TOP + 0.385 * FIG_H} rx={74} ry={88} fill="none" stroke="#DDEB2F" strokeWidth={6} strokeDasharray={C * 1.1} strokeDashoffset={C * 1.1 * (1 - ring)} style={{filter: 'drop-shadow(0 0 6px rgba(0,0,0,0.45))'}} />
        </svg>
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
const ANAT = {x: 170, y: 560, w: 740, h: 955};
const BELLY = {x: 170 + 740 * 0.508, y: 560 + 955 * 0.635, r: 150};
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
  const capRaw = ci >= 0 && t <= captions[ci][captions[ci].length - 1].end + 0.4 && captions[ci][0].start >= v.start - 0.1 ? captions[ci] : null;
  const cap = capRaw && !capRaw.some((w) => /visceral/i.test(w.text)) ? capRaw : null;
  return (
    <AbsoluteFill style={{opacity: Math.min(inP, 1 - outP)}}>
      <AbsoluteFill style={{background: `radial-gradient(90% 60% at 50% 45%, #F4F1EA 0%, ${CREAM} 70%)`}} />
      {/* the anatomy image: grey "outside" first, colour (the yellow visceral fat) comes in on "bahut zyada fat" */}
      <div style={{position: 'absolute', left: ANAT.x, top: ANAT.y, width: ANAT.w, height: ANAT.h, borderRadius: 30, overflow: 'hidden', boxShadow: '0 30px 60px -24px rgba(0,0,0,0.55)', opacity: fig, scale: lerp(fig, 0.94, 1)}}>
        <Img src={staticFile('d4/img/anatomy.jpg')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: `grayscale(${1 - tween(t, v.fatAt, 0.8, EASE_OUT)}) brightness(${lerp(outP, 1, 1.6)})`, scale: lerp(tween(t, v.start, v.end - v.start, (x) => x), 1.0, 1.06)}} />
      </div>
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
        <div style={{...MONO, fontSize: 20, letterSpacing: 4, opacity: 0.6, marginTop: 4, marginBottom: 10}}>{stage === 0 ? 'outside' : 'inside'}</div>
        <div style={{fontFamily: SERIF, fontSize: 92, lineHeight: 1, color: INK, opacity: hk, translate: `0 ${lerp(hk, 12, 0)}px`}}>
          {stage === 3 ? <span style={{display: 'inline-block', marginTop: 14, background: NEON, padding: '2px 12px'}}>{head}</span> : head}
        </div>
      </div>
      {/* leader line from the header to the ring */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <path d={`M 118 ${490} L 118 ${BELLY.y} L ${BELLY.x - BELLY.r} ${BELLY.y}`} fill="none" stroke={INK} strokeWidth={2} strokeOpacity={0.55} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - lead} />
        <circle cx={BELLY.x} cy={BELLY.y} r={BELLY.r * pulse} fill="none" stroke={NEON} strokeWidth={6} strokeDasharray={C} strokeDashoffset={C * (1 - ring)} transform={`rotate(-90 ${BELLY.x} ${BELLY.y})`} style={{filter: 'drop-shadow(0 0 6px rgba(0,0,0,0.35))'}} />
        {ring > 0.95 ? <circle cx={BELLY.x} cy={BELLY.y} r={7} fill={NEON} stroke={INK} strokeWidth={2} /> : null}
      </svg>
      {cap ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: 1560, display: 'flex', justifyContent: 'center'}}>
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
const TINT = {drop: ['#FDECEC', RED], liver: ['#F8EDE4', '#B5542E'], pulse: ['#FDEBF1', '#E5484D']} as const;
export const DiseaseCards: React.FC<{d: Diseases}> = ({d}) => {
  const t = useT();
  const o = vis(t, d);
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, display: 'flex', justifyContent: 'center', gap: 18}}>
        {d.items.map((it, i) => {
          const k = popAt(t, it.at);
          const [bg, fg] = TINT[it.kind];
          const words = it.label.split(' ');
          return (
            <div key={i} style={{width: 296, height: 228, borderRadius: 30, background: 'rgba(255,255,255,0.97)', boxShadow: '0 1px 0 rgba(255,255,255,0.9) inset, 0 20px 40px -18px rgba(0,0,0,0.45)', border: '1px solid rgba(20,20,20,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, scale: lerp(Math.min(1.05, k), 0.6, 1), opacity: t < it.at ? 0 : Math.min(1, k * 3), translate: `0 ${lerp(Math.min(1, k), 30, 0)}px`}}>
              <div style={{width: 96, height: 96, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 0 6px ${bg}66`}}>
                <div style={{scale: 0.66}}>
                  <Icon kind={it.kind} />
                </div>
              </div>
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1}}>
                {words.length > 1 ? (
                  <>
                    <span style={{fontFamily: GROT, fontWeight: 800, fontSize: 34, color: INK, letterSpacing: -0.5}}>{words[0]}</span>
                    <span style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 34, color: fg}}>{words.slice(1).join(' ')}</span>
                  </>
                ) : (
                  <span style={{fontFamily: GROT, fontWeight: 800, fontSize: 36, color: INK, letterSpacing: -0.5}}>{it.label}</span>
                )}
              </div>
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
