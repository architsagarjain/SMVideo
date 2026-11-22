import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, Solid, staticFile, useCurrentFrame} from 'remotion';
import {lightLeak} from '@remotion/effects/light-leak';
import {TimeMap, outAt} from '../series/timemap';
import {loadFont} from '@remotion/fonts';
import {useT} from '../explainer/kit';
import {EASE_IN, EASE_OUT, FPS, SERIF, lerp, tween} from '../theme';
import {popAt} from '../series/kit2';

/**
 * Ad C (transformation) extras, after the reference reel's type: a light italic serif for the small words
 * set against a heavy grotesque for the words that matter, white with a soft shadow. Kept calmer than the
 * reference: one idea per beat, everything above her head in the ad safe zone. Source seconds.
 */
export const GROT = 'Bricolage Grotesque';
loadFont({family: GROT, url: staticFile('fonts/BricolageGrotesque.ttf'), weight: '200 800'});
export const BRAND = '#4CC75A'; // the green of the PeakX X
const WHITE = '#FFFFFF';
const INK = '#141414';
const SOFT = '0 3px 16px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.55)';
const vis = (t: number, w: {start: number; end: number}) => (t < w.start || t > w.end + 0.25 ? 0 : tween(t, w.start, 0.25, EASE_OUT) * (1 - tween(t, w.end - 0.05, 0.25, EASE_IN)));

const FUNC = new Set(['a', 'an', 'the', 'of', 'to', 'and', 'or', 'in', 'on', 'at', 'for', 'with', 'your', 'my', 'it', "it's", 'its', 'is', 'that', "that's", 'you', "you'll", 'i', "i've", 'we', 'our', 'their', 'from', 'so', 'but', 'just', 'about', 'has', 'have', 'been', 'what', 'me', 'all', 'can', 'this', 'even', 'be', 'who', 'very', 'into', 'up', 'out', 'after', 'getting', 'without']);
/** Is this word set in the light italic serif? "_word" forces serif; captions use the small-word list. */
export const isSerif = (w: string) => w.startsWith('_') || FUNC.has(w.toLowerCase().replace(/[.,?!]/g, ''));

/** One word in the reference type: italic serif (small words) or heavy grotesque. */
export const MixWord: React.FC<{w: string; size: number; color?: string; style?: React.CSSProperties; serif?: boolean}> = ({w, size, color = WHITE, style, serif}) => {
  const s = serif ?? isSerif(w);
  const text = w.replace(/^_/, '');
  return s ? (
    <span style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, fontSize: size * 1.12, lineHeight: 1, letterSpacing: -0.5, color, textShadow: '0 3px 18px rgba(0,0,0,0.65), 0 1px 4px rgba(0,0,0,0.6)', display: 'inline-block', whiteSpace: 'pre', ...style}}>{text}</span>
  ) : (
    <span style={{fontFamily: GROT, fontWeight: 800, fontSize: size, lineHeight: 1, letterSpacing: -size * 0.03, color, WebkitTextStroke: `${Math.max(2, Math.round(size * 0.035))}px rgba(10,10,10,0.45)`, paintOrder: 'stroke fill', textShadow: SOFT, display: 'inline-block', whiteSpace: 'pre', ...style}}>{text}</span>
  );
};

/** A caption chunk in the reference type, words rising in one after another. */
export const MixLine: React.FC<{words: {text: string; start: number}[]; size: number; t: number}> = ({words, size, t}) => (
  <div style={{display: 'flex', flexWrap: 'nowrap', justifyContent: 'center', alignItems: 'baseline', columnGap: size * 0.24}}>
    {words.map((w, i) => {
      const p = tween(t, w.start - 0.06, 0.22, EASE_OUT);
      return <MixWord key={i} w={w.text} size={size} style={{opacity: Math.max(0.0, p), translate: `0 ${lerp(p, 12, 0)}px`, filter: `blur(${(1 - p) * 4}px)`}} />;
    })}
  </div>
);

// ---------------------------------------------------------------------------
// "500+ women": a wall of women popping in one by one above her head, then the number counts up.
// Illustrated avatars (no stock photos passed off as clients) - swap in real client photos when available.
// ---------------------------------------------------------------------------
export type Women = {start: number; end: number; popFrom: number; at: number; value: number; label: string};
const SKIN = ['#F1C7A5', '#D9A27A', '#B97A55', '#8E5A3C', '#E8B48E', '#C68B62', '#A4694A', '#F5D0B5', '#D19470', '#7A4A30', '#E3A982'];
const HAIR = ['#1B1210', '#2B1A12', '#3A2416', '#141010', '#4A2E1C', '#22160F', '#5B3A24', '#181212', '#2E1E14', '#120D0B', '#3B2618'];
const BG = ['#FFD9C7', '#CDE7D8', '#D9DFFB', '#FBE3A6', '#F7CFE0', '#CFEFEA', '#E9D9FB', '#FFE1B8', '#D6ECC9', '#F9D2CF', '#D3E6F8'];
const TOP = ['#4CC75A', '#E5484D', '#2F6FED', '#F5A524', '#8B5CF6', '#14B8A6', '#EC4899', '#0EA5E9', '#F97316', '#22C55E', '#6366F1'];
const Avatar: React.FC<{i: number; size: number}> = ({i, size}) => {
  const style = i % 5; // 0 bun, 1 long, 2 bob, 3 ponytail, 4 curly
  const hair = HAIR[i % HAIR.length];
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{display: 'block', borderRadius: '50%', boxShadow: '0 10px 22px -8px rgba(0,0,0,0.45)'}}>
      <defs>
        <clipPath id={`av${i}`}>
          <circle cx={60} cy={60} r={60} />
        </clipPath>
      </defs>
      <g clipPath={`url(#av${i})`}>
        <rect width={120} height={120} fill={BG[i % BG.length]} />
        {style === 1 ? <path d="M30 52 C30 26 90 26 90 52 L94 112 L26 112 Z" fill={hair} /> : null}
        {style === 2 ? <path d="M32 52 C32 24 88 24 88 52 L90 80 C80 86 40 86 30 80 Z" fill={hair} /> : null}
        {style === 4 ? <circle cx={60} cy={50} r={36} fill={hair} /> : null}
        <rect x={51} y={70} width={18} height={18} rx={6} fill={SKIN[i % SKIN.length]} />
        <path d="M18 120 C18 92 38 82 60 82 C82 82 102 92 102 120 Z" fill={TOP[i % TOP.length]} />
        <ellipse cx={60} cy={56} rx={21} ry={25} fill={SKIN[i % SKIN.length]} />
        {style === 0 ? <circle cx={60} cy={24} r={11} fill={hair} /> : null}
        {style === 3 ? <path d="M78 40 C96 46 96 74 86 88 C92 70 86 54 76 48 Z" fill={hair} /> : null}
        <path d="M38 54 C36 30 84 30 82 54 C76 42 66 38 60 38 C54 38 44 42 38 54 Z" fill={hair} />
      </g>
    </svg>
  );
};
const SPOTS: [number, number][] = [
  [140, 345], [290, 330], [440, 322], [640, 322], [790, 330], [940, 345],
  [215, 470], [365, 455], [540, 448], [715, 455], [865, 470],
];
const ORDER = [2, 8, 4, 0, 10, 6, 3, 9, 1, 7, 5];
export const WomenWall: React.FC<{w: Women}> = ({w}) => {
  const t = useT();
  const o = vis(t, w);
  if (o <= 0) return null;
  const p = tween(t, w.at, 0.9, EASE_OUT);
  const k = popAt(t, w.at);
  return (
    <AbsoluteFill style={{opacity: o}}>
      {SPOTS.map(([x, y], j) => {
        const at = w.popFrom + ORDER.indexOf(j) * 0.06;
        if (t < at) return null;
        const q = popAt(t, at);
        return (
          <div key={j} style={{position: 'absolute', left: x - 62, top: y - 62, width: 124, height: 124, borderRadius: '50%', background: WHITE, padding: 4, boxSizing: 'border-box', scale: lerp(Math.min(1.08, q), 0.2, 1), opacity: Math.min(1, q * 3)}}>
            <Avatar i={j} size={116} />
          </div>
        );
      })}
      {t >= w.at ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: 548, display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 22, scale: lerp(Math.min(1.04, k), 0.6, 1), opacity: Math.min(1, k * 3)}}>
          <MixWord w={`${Math.round(w.value * p)}+`} size={150} serif={false} />
          <MixWord w={w.label} size={84} serif />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// "at PeakX": the logo slides out of a black card with a green light sweep.
// ---------------------------------------------------------------------------
export type Logo = {start: number; end: number; at: number};
export const LogoReveal: React.FC<{l: Logo}> = ({l}) => {
  const t = useT();
  const o = vis(t, l);
  if (o <= 0) return null;
  const k = popAt(t, l.at);
  const wipe = tween(t, l.at + 0.05, 0.45, EASE_OUT);
  const sweep = tween(t, l.at + 0.35, 0.6, EASE_OUT);
  const glow = 0.35 + 0.35 * Math.sin(Math.max(0, t - l.at) * 6) * Math.exp(-Math.max(0, t - l.at) * 1.5);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 350, display: 'flex', justifyContent: 'center'}}>
        <div style={{position: 'relative', width: 820, height: 316, borderRadius: 40, overflow: 'hidden', background: '#000', boxShadow: `0 0 70px rgba(76,199,90,${glow}), 0 26px 60px -20px rgba(0,0,0,0.7)`, scale: lerp(Math.min(1.04, k), 0.7, 1), opacity: Math.min(1, k * 3)}}>
          <Img src={staticFile('ad8/peakx.png')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', clipPath: `inset(0 ${(1 - wipe) * 100}% 0 0)`}} />
          <div style={{position: 'absolute', top: 0, bottom: 0, width: 160, left: `${lerp(sweep, -25, 125)}%`, background: 'linear-gradient(100deg, rgba(76,199,90,0) 0%, rgba(140,255,150,0.35) 50%, rgba(76,199,90,0) 100%)'}} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// "You don't have to give up a roti, cut out your favourite foods or spend hours in the gym":
// three photo cards dealt in as she names them, each stamped KEEP (green) or SKIP (red).
// ---------------------------------------------------------------------------
export type FoodCards = {start: number; end: number; dir?: string; items: {img: string; label: string; at: number; keep: boolean; stamp?: string}[]};
export const Cards: React.FC<{c: FoodCards}> = ({c}) => {
  const t = useT();
  const o = vis(t, c);
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: c.items.length < 3 ? 280 : 296, display: 'flex', justifyContent: 'center', gap: c.items.length < 3 ? 40 : 22, scale: c.items.length < 3 ? 1.15 : 1, transformOrigin: '50% 0'}}>
        {c.items.map((it, i) => {
          const k = popAt(t, it.at);
          const st = popAt(t, it.at + 0.35);
          return (
            <div key={i} style={{position: 'relative', width: 300, padding: '14px 14px 0', boxSizing: 'border-box', background: WHITE, borderRadius: 22, boxShadow: '0 24px 44px -18px rgba(0,0,0,0.6)', translate: `0 ${lerp(Math.min(1, k), -120, 0)}px`, scale: lerp(Math.min(1.05, k), 0.7, 1), opacity: t < it.at ? 0 : Math.min(1, k * 3)}}>
              <Img src={staticFile(`${c.dir ?? 'ad8'}/cards/${it.img}.jpg`)} style={{width: 272, height: 272, borderRadius: 14, objectFit: 'cover', display: 'block', filter: !it.keep && t >= it.at + 0.35 ? `grayscale(${Math.min(1, st)}) brightness(0.85)` : undefined}} />
              <div style={{height: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 44, color: INK, lineHeight: 1}}>{it.label}</div>
              {t >= it.at + 0.35 ? (
                <div style={{position: 'absolute', right: -16, top: -18, width: 104, height: 104, borderRadius: '50%', background: it.keep ? BRAND : '#E5484D', border: '5px solid #FFFFFF', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: WHITE, boxShadow: '0 12px 24px -10px rgba(0,0,0,0.55)', scale: lerp(Math.min(1.1, st), 2.2, 1), opacity: Math.min(1, st * 3)}}>
                  <span style={{fontFamily: GROT, fontWeight: 800, fontSize: 40, lineHeight: 1}}>{it.keep ? '✓' : '✕'}</span>
                  <span style={{fontFamily: GROT, fontWeight: 800, fontSize: 20, letterSpacing: 2}}>{it.stamp ?? (it.keep ? 'KEEP' : 'SKIP')}</span>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// "Featured in Times Square, New York": a neon sign that flickers on over the real Times Square footage.
// ---------------------------------------------------------------------------
export type Neon = {start: number; end: number; at: number; y?: number};
const flick = (t: number, at: number) => {
  if (t < at) return 0;
  const d = t - at;
  if (d > 0.32) return 1;
  return [1, 0.15, 0.9, 0.3, 1, 0.55, 1, 1][Math.floor(d / 0.04)] ?? 1;
};
const PINK = '0 0 6px #FFD1EC, 0 0 14px #FF4FB0, 0 0 30px #FF2E97, 0 0 60px #FF2E97';
const CYAN = '0 0 6px #D6F7FF, 0 0 14px #5CE1FF, 0 0 32px #22B8F0';
export const NeonSign: React.FC<{n: Neon}> = ({n}) => {
  const t = useT();
  const o = vis(t, n);
  if (o <= 0) return null;
  const word = 'TIMES SQUARE';
  return (
    <AbsoluteFill style={{opacity: o}}>
      <AbsoluteFill style={{background: `radial-gradient(80% 16% at 50% ${(((n.y ?? 330) + 110) / 1920) * 100}%, rgba(0,0,0,0.6), rgba(0,0,0,0) 85%)`}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: n.y ?? 330, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
        <span style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 84, lineHeight: 1, color: WHITE, textShadow: CYAN, opacity: flick(t, n.at - 0.3)}}>featured in</span>
        <div style={{display: 'flex'}}>
          {word.split('').map((ch, i) => (
            <span key={i} style={{fontFamily: GROT, fontWeight: 800, fontSize: 124, lineHeight: 1.05, letterSpacing: -2, color: '#FFF3FA', textShadow: PINK, whiteSpace: 'pre', opacity: flick(t, n.at + i * 0.045)}}>
              {ch}
            </span>
          ))}
        </div>
        <span style={{fontFamily: GROT, fontWeight: 700, fontSize: 40, letterSpacing: 16, color: '#E9FBFF', textShadow: CYAN, opacity: flick(t, n.at + 0.7)}}>NEW YORK</span>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Ad A opening - "free diet plans and workouts pretty much anywhere": free plan PDFs pile up above her head.
// ---------------------------------------------------------------------------
export type FreeStack = {start: number; end: number; items: {title: string; at: number; color: string}[]};
const PILE: [number, number][] = [[290, 380], [790, 380], [290, 580], [790, 580]];
export const FreePile: React.FC<{f: FreeStack}> = ({f}) => {
  const t = useT();
  const o = vis(t, f);
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{opacity: o}}>
      {f.items.map((it, i) => {
        if (t < it.at) return null;
        const k = popAt(t, it.at);
        const [x, y] = PILE[i % PILE.length];
        return (
          <div key={i} style={{position: 'absolute', left: x - 240, top: y - 90, width: 480, height: 180, borderRadius: 24, overflow: 'hidden', background: WHITE, boxShadow: '0 20px 40px -16px rgba(0,0,0,0.55)', display: 'flex', scale: lerp(Math.min(1.06, k), 0.4, 1), opacity: Math.min(1, k * 3), translate: `0 ${lerp(Math.min(1, k), -60, 0)}px`}}>
            <div style={{width: 110, background: it.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: GROT, fontWeight: 800, fontSize: 32, color: WHITE, letterSpacing: 1}}>PDF</div>
            <div style={{flex: 1, padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
              <span style={{fontFamily: GROT, fontWeight: 800, fontSize: 40, lineHeight: 1.02, color: INK}}>{it.title}</span>
              <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                <span style={{padding: '4px 14px', borderRadius: 8, background: '#FFE27A', fontFamily: GROT, fontWeight: 800, fontSize: 26, color: INK}}>FREE</span>
                <span style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 32, color: '#7A766E'}}>download</span>
              </div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Ad B opening - over the typing B-roll: a search bar types "free diet plans", results drop in.
// ---------------------------------------------------------------------------
export type Search = {start: number; end: number; query: string; typeFrom: number; typeTo: number; results: {title: string; at: number}[]};
export const SearchBar: React.FC<{s: Search}> = ({s}) => {
  const t = useT();
  const o = vis(t, s);
  if (o <= 0) return null;
  const n = Math.round(s.query.length * Math.min(1, Math.max(0, (t - s.typeFrom) / (s.typeTo - s.typeFrom))));
  const caret = Math.floor(t * 2.5) % 2 === 0;
  const k = popAt(t, s.start);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: 90, right: 90, top: 300, display: 'flex', flexDirection: 'column', gap: 16, scale: lerp(Math.min(1.04, k), 0.8, 1)}}>
        <div style={{height: 104, borderRadius: 999, background: WHITE, boxShadow: '0 22px 44px -16px rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', gap: 20, padding: '0 34px'}}>
          <svg width={44} height={44} viewBox="0 0 24 24"><circle cx={10} cy={10} r={6.5} fill="none" stroke="#7A766E" strokeWidth={2.4} /><path d="M15 15 L21 21" stroke="#7A766E" strokeWidth={2.6} strokeLinecap="round" /></svg>
          <span style={{fontFamily: GROT, fontWeight: 700, fontSize: 46, color: INK, whiteSpace: 'pre'}}>
            {s.query.slice(0, n)}
            <span style={{opacity: caret ? 1 : 0, color: BRAND}}>|</span>
          </span>
        </div>
        {s.results.map((r, i) => {
          if (t < r.at) return null;
          const q = popAt(t, r.at);
          return (
            <div key={i} style={{marginLeft: 20, marginRight: 20, padding: '16px 26px', borderRadius: 22, background: 'rgba(255,255,255,0.96)', boxShadow: '0 16px 30px -14px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: Math.min(1, q * 3), translate: `0 ${lerp(Math.min(1, q), -30, 0)}px`}}>
              <span style={{fontFamily: GROT, fontWeight: 800, fontSize: 36, color: INK}}>{r.title}</span>
              <span style={{padding: '4px 12px', borderRadius: 8, background: '#FFE27A', fontFamily: GROT, fontWeight: 800, fontSize: 24, color: INK}}>FREE</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** A normal blur zoom (her footage and everything drawn with it): snaps in with a blur pulse, holds, snaps out. */
export const ZoomBlur: React.FC<{w?: {start: number; end: number}; scale?: number; children: React.ReactNode}> = ({w, scale = 1.14, children}) => {
  const t = useT();
  if (!w || t < w.start || t > w.end + 0.25) return <>{children}</>;
  const i = tween(t, w.start, 0.28, EASE_OUT);
  const o = tween(t, w.end - 0.05, 0.25, EASE_IN);
  const s = lerp(i, 1, scale) * lerp(o, 1, 1 / scale);
  const blur = Math.sin(Math.PI * i) * 9 + Math.sin(Math.PI * o) * 7;
  return <AbsoluteFill style={{scale: s, transformOrigin: '540px 900px', filter: blur > 0.3 ? `blur(${blur}px)` : undefined}}>{children}</AbsoluteFill>;
};

// ---------------------------------------------------------------------------
// Client testimonial: a full-screen insert (the timeline pauses her for it) - the real video call,
// cropped to the call screen, with the client's words in the reference type under it.
// ---------------------------------------------------------------------------
export type Testimonial = {at: number; gap: number; file: string; t0: number; native: number; crop: [number, number, number, number]; lines: {text: string; s: number}[][]};
const TLEAD = 0.25;
export const TestimonialInsert: React.FC<{tm: TimeMap; c: Testimonial}> = ({tm, c}) => {
  const from = Math.round(outAt(tm, c.at) * FPS);
  return (
    <Sequence from={from} durationInFrames={Math.round(c.gap * FPS)} layout="none">
      <TestimonialBody c={c} />
    </Sequence>
  );
};
const TestimonialBody: React.FC<{c: Testimonial}> = ({c}) => {
  const lt = useCurrentFrame() / FPS; // seconds into the insert
  const inP = tween(lt, 0, TLEAD, EASE_OUT);
  const outP = tween(lt, c.gap - TLEAD, TLEAD, EASE_IN);
  const bloom = Math.max(1 - inP, outP);
  const [cx, cy, cw, ch] = c.crop;
  const W = 1000;
  const sc = W / cw;
  const H = ch * sc;
  const src = c.t0 - TLEAD; // the call clip, lined up with its audio in the mix
  const lines = c.lines.map((l) => l.map((w) => ({text: w.text, start: w.s - c.t0 + TLEAD})));
  const words = lines.flat();
  let li = 0;
  for (let i = 0; i < lines.length; i++) if (lines[i][0].start - 0.05 <= lt) li = i;
  const stars = popAt(lt, 0.3);
  return (
    <AbsoluteFill style={{opacity: 1 - bloom * 0.9, filter: `blur(${bloom * 16}px) brightness(${1 + bloom * 0.3})`}}>
      <AbsoluteFill style={{background: 'radial-gradient(120% 70% at 50% 40%, #1F2A22 0%, #0D110E 70%)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 380, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, scale: lerp(Math.min(1.05, stars), 0.7, 1), opacity: Math.min(1, stars * 3)}}>
        <span style={{fontSize: 56, letterSpacing: 10, color: '#F5C451', textShadow: '0 4px 18px rgba(0,0,0,0.5)'}}>★★★★★</span>
        <MixWord w="_Real Client, Real Call" size={64} />
      </div>
      <div style={{position: 'absolute', left: (1080 - W) / 2, top: 680, width: W, height: H, borderRadius: 34, overflow: 'hidden', boxShadow: `0 0 0 6px rgba(255,255,255,0.95), 0 30px 70px -20px rgba(0,0,0,0.8)`, scale: lerp(inP, 0.94, 1)}}>
        <OffthreadVideo src={staticFile(c.file)} muted startFrom={Math.max(0, Math.round(src * FPS))} style={{position: 'absolute', left: -cx * sc, top: -cy * sc, width: c.native * sc, height: c.native * sc, maxWidth: 'none'}} />
        <div style={{position: 'absolute', left: 22, top: 20, display: 'flex', alignItems: 'center', gap: 10, padding: '8px 18px', borderRadius: 999, background: 'rgba(0,0,0,0.55)'}}>
          <span style={{width: 16, height: 16, borderRadius: '50%', background: '#E5484D'}} />
          <span style={{fontFamily: GROT, fontWeight: 800, fontSize: 28, color: WHITE, letterSpacing: 2}}>LIVE CALL</span>
        </div>
      </div>
      <div style={{position: 'absolute', left: 40, right: 40, top: 560, display: 'flex', justifyContent: 'center'}}>
        {lt >= words[0].start - 0.05 ? <MixLine words={lines[li]} size={lines[li].length > 5 ? 60 : 74} t={lt} /> : null}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Ad A opening: "free diet plans and workouts pretty much anywhere" - big kinetic type with a ₹0 price tag.
// ---------------------------------------------------------------------------
export type FreeType = {start: number; end: number; l1: {text: string; at: number}[]; l2: {text: string; at: number}[]; tagAt: number; tag: string};
export const FreeTypeView: React.FC<{f: FreeType}> = ({f}) => {
  const t = useT();
  const o = vis(t, f);
  if (o <= 0) return null;
  const row = (ws: {text: string; at: number}[], size: number) => (
    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'baseline', columnGap: size * 0.22}}>
      {ws.map((w, i) => {
        const k = popAt(t, w.at);
        return t >= w.at ? <MixWord key={i} w={w.text} size={size} style={{scale: lerp(Math.min(1.06, k), 0.5, 1), opacity: Math.min(1, k * 3), translate: `0 ${lerp(Math.min(1, k), 30, 0)}px`}} /> : null;
      })}
    </div>
  );
  const kt = popAt(t, f.tagAt);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 360, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
        {row(f.l1, 140)}
        {row(f.l2, 140)}
      </div>
      {t >= f.tagAt ? (
        <div style={{position: 'absolute', left: 820, top: 228, width: 170, height: 170, borderRadius: '50%', background: BRAND, border: '6px solid #FFFFFF', boxSizing: 'border-box', boxShadow: '0 18px 36px -14px rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', scale: lerp(Math.min(1.1, kt), 2.2, 1), opacity: Math.min(1, kt * 3)}}>
          <span style={{fontFamily: GROT, fontWeight: 800, fontSize: 64, lineHeight: 0.95, color: WHITE, letterSpacing: -2}}>₹0</span>
          <MixWord w={f.tag} size={30} />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Polish: a soft light leak (Remotion effects) blooming over each cut, and a name tag at the start.
// ---------------------------------------------------------------------------
export const LeakFlash: React.FC<{tm: TimeMap; at: number; seed: number; outOffset?: number}> = ({tm, at, seed, outOffset = 0}) => {
  const from = Math.round((outAt(tm, at) + outOffset - 0.35) * FPS);
  return (
    <Sequence from={from} durationInFrames={Math.round(1.1 * FPS)} layout="none">
      <LeakBody seed={seed} />
    </Sequence>
  );
};
const LeakBody: React.FC<{seed: number}> = ({seed}) => {
  const lt = useCurrentFrame() / FPS;
  const o = Math.min(tween(lt, 0, 0.25, EASE_OUT), 1 - tween(lt, 0.6, 0.5, EASE_IN));
  return (
    <AbsoluteFill style={{mixBlendMode: 'screen', opacity: o * 0.42}}>
      <OffthreadVideo src={staticFile(`ads/leak_${seed % 4}.mp4`)} muted style={{width: '100%', height: '100%'}} />
    </AbsoluteFill>
  );
};

export type NameTag = {start: number; end: number; at: number};
export const NameTagView: React.FC<{n: NameTag}> = ({n}) => {
  const t = useT();
  const o = vis(t, n);
  if (o <= 0) return null;
  const k = tween(t, n.at, 0.45, EASE_OUT);
  const bar = tween(t, n.at, 0.35, EASE_OUT);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: 60, top: 1130, display: 'flex', alignItems: 'stretch', gap: 16, opacity: k, translate: `${lerp(k, -30, 0)}px 0`}}>
        <div style={{width: 8, borderRadius: 4, background: BRAND, scale: `1 ${bar}`, transformOrigin: 'top'}} />
        <div style={{display: 'flex', flexDirection: 'column', gap: 2}}>
          <MixWord w="Bhavika Agarwal" size={50} serif={false} />
          <MixWord w="_Fitness Coach · PeakX" size={36} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** One light leak, rendered on its own (software GL) and baked to public/ads/leak_<seed>.mp4. */
export const LeakClip: React.FC<{seed: number}> = ({seed}) => {
  const f = useCurrentFrame();
  return <Solid color="#000000" width={1080} height={1920} effects={[lightLeak({progress: Math.min(1, f / 33), seed, hueShift: 15})]} />;
};
