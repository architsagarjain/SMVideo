import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ReelConfig, inWin, Win} from './core';
import {useT} from '../explainer/kit';
import {chunkAt, popAt} from './kit2';
import {EASE_IN, EASE_OUT, SANS, SERIF, lerp, tween} from '../theme';

/**
 * Shared look for the batch of four (v12-v15): her brightened footage, a soft white wash over the top
 * whenever words sit on the wall, ink headlines with a yellow highlight, white cards, and the
 * dark-pill subtitles. Each reel adds its own signature piece on top of this.
 * Rule: the top text names the idea in a few words; it never repeats the subtitle.
 */
export const INK = '#141414';
export const PAPER = '#F4F1EB';
export const HL = '#FFD60A';
export const MUTED = '#8A857C';
export const CARD_SHADOW = '0 24px 50px -22px rgba(0,0,0,0.38)';
export const HEAD_TOP = 560; // keep everything above this line clear of her head (it can tuck behind)

/** Soft white wash over the top of the frame. */
export const TopWash: React.FC<{wins: Win[]; reach?: number}> = ({wins, reach = 42}) => {
  const t = useT();
  let o = 0;
  for (const w of wins) if (t >= w.start - 0.01 && t < w.end + 0.3) o = Math.max(o, (w.start < 1.2 ? 1 : tween(t, w.start, 0.25)) * (1 - tween(t, w.end - 0.05, 0.3)));
  if (o <= 0) return null;
  return <AbsoluteFill style={{opacity: o, background: `linear-gradient(to bottom, rgba(244,241,235,0.97) 0%, rgba(244,241,235,0.92) ${reach * 0.62}%, rgba(244,241,235,0) ${reach}%)`}} />;
};

/** Pop-in placement (scale + rise), with an optional fade out. */
export const Pop: React.FC<{x: number; y: number; at: number; out?: number; children: React.ReactNode; from?: number}> = ({x, y, at, out = 9999, children, from = 0.7}) => {
  const t = useT();
  if (t < at || t > out + 0.3) return null;
  const k = popAt(t, at);
  const o = 1 - tween(t, out, 0.25, EASE_IN);
  return <div style={{position: 'absolute', left: x, top: y, translate: `-50% ${lerp(Math.min(1, k), -30, -50)}%`, scale: lerp(Math.min(1.08, k), from, 1), opacity: Math.min(1, k * 2) * o}}>{children}</div>;
};

/** Ink headline. */
export const H: React.FC<{size: number; color?: string; serif?: boolean; children: React.ReactNode; style?: React.CSSProperties}> = ({size, color = INK, serif, children, style}) => (
  <div style={{fontFamily: serif ? SERIF : SANS, fontStyle: serif ? 'italic' : 'normal', fontWeight: serif ? 400 : 800, fontSize: size, lineHeight: 1.02, letterSpacing: serif ? -1 : -size * 0.035, color, whiteSpace: 'nowrap', ...style}}>{children}</div>
);
/** Yellow highlight box that wipes in behind a word. */
export const Hi: React.FC<{p: number; color?: string; children: React.ReactNode}> = ({p, color = HL, children}) => (
  <span style={{display: 'inline-block', lineHeight: 1.18, padding: '0 0.12em', margin: '0 0.02em', borderRadius: '0.08em', backgroundImage: `linear-gradient(${color}, ${color})`, backgroundRepeat: 'no-repeat', backgroundSize: `${p * 100}% 100%`}}>{children}</span>
);
export const Card: React.FC<{w?: number; h?: number; pad?: number; dark?: boolean; children: React.ReactNode; style?: React.CSSProperties}> = ({w, h, pad = 28, dark, children, style}) => (
  <div style={{width: w, height: h, padding: pad, boxSizing: 'border-box', borderRadius: 36, background: dark ? INK : '#FFFFFF', color: dark ? '#fff' : INK, boxShadow: CARD_SHADOW, position: 'relative', fontFamily: SANS, ...style}}>{children}</div>
);
export const Tag: React.FC<{bg?: string; fg?: string; size?: number; children: React.ReactNode}> = ({bg = INK, fg = '#fff', size = 34, children}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: size * 0.3, padding: `${size * 0.3}px ${size * 0.65}px`, borderRadius: 999, background: bg, color: fg, fontFamily: SANS, fontWeight: 800, fontSize: size, letterSpacing: size * 0.04, whiteSpace: 'nowrap', boxShadow: CARD_SHADOW}}>{children}</div>
);
/** Small label above a headline. */
export const Kicker: React.FC<{children: React.ReactNode; color?: string}> = ({children, color = MUTED}) => (
  <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: 6, color, whiteSpace: 'nowrap'}}>{children}</div>
);
export const rise = (t: number, at: number, d = 0.4): React.CSSProperties => {
  const p = tween(t, at, d, EASE_OUT);
  return {opacity: p, transform: `translateY(${lerp(p, 24, 0)}px)`};
};

/** Dark-pill subtitles (the style picked for the mithai reel). */
export const PillCaps: React.FC<{cfg: ReelConfig; hide?: Win[]; y?: (t: number) => number}> = ({cfg, hide = [], y}) => {
  const t = useT();
  if (inWin(t, hide)) return null;
  const chunk = chunkAt(cfg.captions, t);
  if (!chunk) return null;
  const k = tween(t, chunk[0].start - 0.04, 0.14);
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top: y ? y(t) : 1500, translate: `0 ${-50 + lerp(k, 10, 0)}%`, textAlign: 'center', opacity: k}}>
      <div style={{display: 'inline-block', padding: '12px 30px 14px', background: 'rgba(18,18,20,0.74)', borderRadius: 26, boxShadow: '0 10px 24px -10px rgba(0,0,0,0.4)', scale: lerp(k, 0.96, 1)}}>
        <span style={{fontFamily: SANS, fontWeight: 700, fontSize: 52, lineHeight: 1.2, color: '#FFFFFF', letterSpacing: -0.5, whiteSpace: 'nowrap'}}>{chunk.map((w) => w.text).join(' ')}</span>
      </div>
    </div>
  );
};

/** 0..1 for a window, with fades. */
export const winVis = (t: number, w: Win, fi = 0.3, fo = 0.25) => (t < w.start || t > w.end + fo ? 0 : tween(t, w.start, fi, EASE_OUT) * (1 - tween(t, w.end - fo, fo, EASE_IN)));

/** Shared ending: a comment bar types the keyword and sends, then her DM with the guide arrives. */
export const CommentCta: React.FC<{start: number; word: string; typeAt: number; dmAt: number; top?: number; Ico: React.FC<{name: string; size: number; color?: string}>}> = ({start, word, typeAt, dmAt, top = 70, Ico}) => {
  const t = useT();
  if (t < start) return null;
  const bar = tween(t, start, 0.4, EASE_OUT);
  const typed = word.slice(0, Math.max(0, Math.min(word.length, Math.floor((t - typeAt) / 0.07) + 1)));
  const sentAt = typeAt + word.length * 0.07 + 0.25;
  const sent = tween(t, sentAt, 0.25, EASE_OUT);
  const dm = tween(t, dmAt, 0.45, EASE_OUT);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 90, top, width: 900, height: 128, borderRadius: 64, background: '#fff', boxSizing: 'border-box', boxShadow: CARD_SHADOW, display: 'flex', alignItems: 'center', gap: 22, padding: '0 18px 0 22px', opacity: bar, translate: `0 ${lerp(bar, 30, 0)}px`, fontFamily: SANS}}>
        <div style={{width: 80, height: 80, borderRadius: '50%', background: PAPER, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
          <Ico name="chat-circle-dots" size={44} color={INK} />
        </div>
        <div style={{flex: 1, fontSize: 52, fontWeight: 800, color: typed ? INK : '#9A9A9A', letterSpacing: typed ? 2 : 0}}>
          {typed ? <Hi p={sent}>{typed}</Hi> : 'Add a comment…'}
        </div>
        <div style={{width: 88, height: 88, borderRadius: '50%', background: sent > 0 ? INK : '#D8D8D8', display: 'flex', alignItems: 'center', justifyContent: 'center', scale: 1 + 0.15 * Math.sin(Math.PI * sent)}}>
          <Ico name="paper-plane-right" size={46} color="#fff" />
        </div>
      </div>
      {dm > 0 ? (
        <div style={{position: 'absolute', left: 90, top: top + 168, width: 900, opacity: dm, translate: `0 ${lerp(dm, 30, 0)}px`, display: 'flex', alignItems: 'center', gap: 20, padding: 18, boxSizing: 'border-box', borderRadius: 30, background: '#fff', boxShadow: CARD_SHADOW, fontFamily: SANS}}>
          <div style={{width: 84, height: 84, borderRadius: 20, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
            <Ico name="file-pdf" size={54} color={HL} />
          </div>
          <div style={{flex: 1}}>
            <div style={{fontSize: 26, fontWeight: 700, color: MUTED}}>New message · now</div>
            <div style={{fontSize: 40, fontWeight: 800, color: INK, whiteSpace: 'nowrap'}}>Your free fat loss guide ✓</div>
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
