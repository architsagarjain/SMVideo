import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useT} from '../explainer/kit';
import {EASE_IN, EASE_OUT, SERIF, lerp, tween} from '../theme';
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
export type BodyPair = {start: number; end: number; aAt: number; bAt: number; eqAt: number};
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
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 285, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 26}}>
        {card(b.aAt, 'Skinny Fat', 0.75, 0, t >= b.eqAt ? Math.min(1, e) : 0)}
        <span style={{width: 70, textAlign: 'center', fontFamily: GROT, fontWeight: 800, fontSize: 96, color: RED, textShadow: '0 4px 14px rgba(0,0,0,0.35)', scale: lerp(Math.min(1.1, e), 1.8, 1), opacity: t >= b.eqAt ? 1 : 0}}>=</span>
        {card(b.bAt, 'Overweight', 0.9, 1, 0)}
      </div>
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
 *  a full-screen diagram: thin on the outside, fat packed around the organs inside. */
export type Visceral = {start: number; end: number; thinAt: number; fatAt: number; nameAt: number};
const Organs: React.FC<{fat: number; pulse: number}> = ({fat, pulse}) => (
  <svg width={520} height={420} viewBox="0 0 260 210" style={{display: 'block'}}>
    {/* belly outline */}
    <path d="M40 10 C20 60 18 150 50 200 L210 200 C242 150 240 60 220 10 Z" fill="#F3D9C6" stroke="#E2B89C" strokeWidth={3} />
    {/* visceral fat around the organs */}
    <g opacity={fat} style={{transformOrigin: '130px 105px', scale: `${1 + pulse * 0.03}`}}>
      <ellipse cx={130} cy={105} rx={92} ry={78} fill={AMBER} opacity={0.9} />
      {[[70, 60], [190, 58], [64, 150], [196, 152], [130, 30], [130, 184]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={20} fill="#F7B84A" />
      ))}
    </g>
    {/* organs */}
    <path d="M92 50 C110 34 150 36 166 52 C176 66 160 80 140 78 C120 76 100 74 92 62 Z" fill="#C85C5C" />
    <path d="M86 96 C86 84 174 84 174 96 C174 106 86 106 86 116 C86 128 174 126 174 138 C174 150 86 150 86 160" fill="none" stroke="#B8545A" strokeWidth={14} strokeLinecap="round" />
  </svg>
);
export const VisceralInsert: React.FC<{v: Visceral}> = ({v}) => {
  const t = useT();
  if (t < v.start || t > v.end + 0.25) return null;
  const inP = tween(t, v.start, 0.25, EASE_OUT);
  const outP = tween(t, v.end - 0.05, 0.25, EASE_IN);
  const bloom = Math.max(1 - inP, outP);
  const fat = tween(t, v.fatAt, 0.6, EASE_OUT);
  const thin = popAt(t, v.thinAt);
  const name = popAt(t, v.nameAt);
  const pulse = t > v.fatAt ? Math.sin((t - v.fatAt) * 6) * 0.5 + 0.5 : 0;
  return (
    <AbsoluteFill style={{opacity: 1 - bloom * 0.9, filter: `blur(${bloom * 16}px)`}}>
      <AbsoluteFill style={{background: 'radial-gradient(120% 70% at 50% 45%, #2A2420 0%, #110E0C 75%)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, display: 'flex', justifyContent: 'center', gap: 40, alignItems: 'flex-start'}}>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, opacity: Math.min(1, thin * 3), scale: lerp(Math.min(1.05, thin), 0.6, 1)}}>
          <MixWord w="_outside" size={56} />
          <Body w={150} belly={0.15} color="#E9E4DC" />
          <span style={{padding: '6px 20px', borderRadius: 999, background: BRAND, fontFamily: GROT, fontWeight: 800, fontSize: 34, color: WHITE}}>Looks Thin ✓</span>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, opacity: tween(t, v.fatAt - 0.3, 0.4)}}>
          <MixWord w="_inside" size={56} />
          <div style={{borderRadius: 30, overflow: 'hidden', boxShadow: `0 0 ${60 * fat}px rgba(245,165,36,${0.45 * fat})`}}>
            <Organs fat={fat} pulse={pulse} />
          </div>
          <span style={{padding: '6px 20px', borderRadius: 999, background: AMBER, fontFamily: GROT, fontWeight: 800, fontSize: 34, color: INK, opacity: Math.min(1, fat * 2)}}>Fat Around the Organs</span>
        </div>
      </div>
      {t >= v.nameAt ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: 1060, display: 'flex', justifyContent: 'center', scale: lerp(Math.min(1.08, name), 1.8, 1), opacity: Math.min(1, name * 3)}}>
          <div style={{padding: '14px 40px', borderRadius: 22, background: RED, boxShadow: shadow}}>
            <span style={{fontFamily: GROT, fontWeight: 800, fontSize: 92, letterSpacing: 2, color: WHITE}}>VISCERAL FAT</span>
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
      <div style={{position: 'absolute', left: 0, right: 0, top: 1120, display: 'flex', justifyContent: 'center', opacity: tween(t, at + 0.9, 0.35, EASE_OUT), translate: `0 ${lerp(tween(t, at + 0.9, 0.35, EASE_OUT), 16, 0)}px`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '14px 32px', borderRadius: 999, background: BRAND, boxShadow: shadow, fontFamily: GROT, fontWeight: 800, fontSize: 44, color: WHITE}}>
          I'll help you transform →
        </div>
      </div>
    </AbsoluteFill>
  );
};
