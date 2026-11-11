import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, staticFile} from 'remotion';
import {Win} from '../series/core';
import {TimeMap, outAt} from '../series/timemap';
import {useT} from '../explainer/kit';
import {popAt} from '../series/kit2';
import {EASE_IN, EASE_IN_OUT, EASE_OUT, FPS, SANS, lerp, tween} from '../theme';
import {ACCENT, WHITE} from './kit';

/**
 * Shared effects for the minimal reels: dolly zoom, orbit ring, ink wipes and the Instagram comment sheet.
 * Times are source seconds.
 */

/** Dolly zoom: her cut-out (drawn separately) holds still while the room pushes in and falls out of focus. */
export const Dolly: React.FC<{win: Win; children: React.ReactNode}> = ({win, children}) => {
  const t = useT();
  if (t < win.start || t > win.end) return <>{children}</>;
  const p = tween(t, win.start, win.end - win.start, EASE_IN_OUT);
  return (
    <AbsoluteFill style={{transformOrigin: '540px 820px', scale: lerp(p, 1, 1.38), filter: `blur(${p * 14}px) brightness(${lerp(p, 1, 0.72)})`}}>
      {children}
    </AbsoluteFill>
  );
};

/** Orbit ring: labels circle her at chest height, passing behind her body and then in front of it. */
export type OrbitItem = {label: string; at: number};
export const Orbit: React.FC<{win: Win; items: OrbitItem[]; front: boolean; ring?: {cx: number; cy: number; rx: number; ry: number}; speed?: number}> = ({
  win,
  items,
  front,
  ring = {cx: 540, cy: 1150, rx: 440, ry: 96},
  speed = 1.0,
}) => {
  const t = useT();
  const o = t < win.start || t > win.end + 0.2 ? 0 : tween(t, win.start, 0.3, EASE_OUT) * (1 - tween(t, win.end - 0.15, 0.3, EASE_IN));
  if (o <= 0) return null;
  const spin = -Math.PI / 2 + (t - win.start) * speed;
  const draw = tween(t, win.start, 0.6, EASE_OUT);
  const arc = (from: number, to: number) => {
    let d = '';
    for (let i = 0; i <= 48; i++) {
      const a = from + ((to - from) * i) / 48;
      d += `${i ? 'L' : 'M'}${(ring.cx + ring.rx * Math.cos(a)).toFixed(1)} ${(ring.cy + ring.ry * Math.sin(a)).toFixed(1)} `;
    }
    return d;
  };
  return (
    <AbsoluteFill style={{opacity: o}}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <path d={front ? arc(0, Math.PI) : arc(Math.PI, 2 * Math.PI)} fill="none" stroke="#FFFFFF" strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} opacity={front ? 0.95 : 0.55} style={{filter: 'drop-shadow(0 0 8px rgba(245,196,81,0.9))'}} />
      </svg>
      {items.map((it, i) => {
        const a = spin + (i * 2 * Math.PI) / items.length;
        const depth = Math.sin(a);
        if (front !== depth >= 0) return null;
        const k = tween(t, it.at, 0.3, EASE_OUT);
        if (k <= 0) return null;
        const x = ring.cx + ring.rx * Math.cos(a);
        const y = ring.cy + ring.ry * depth;
        const d = (depth + 1) / 2;
        return (
          <div key={it.label} style={{position: 'absolute', left: x, top: y, translate: '-50% -50%', scale: lerp(d, 0.78, 1.12) * lerp(k, 1.6, 1), opacity: lerp(d, 0.75, 1) * k, display: 'flex', alignItems: 'center', gap: 12, padding: '12px 26px', borderRadius: 999, background: 'rgba(18,18,20,0.82)', boxShadow: '0 12px 26px -10px rgba(0,0,0,0.6)', whiteSpace: 'nowrap'}}>
            <span style={{width: 16, height: 16, borderRadius: '50%', background: ACCENT}} />
            <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 48, color: WHITE}}>{it.label}</span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** A transparent ink-wipe clip (Mixkit ink, recoloured cream) played at a source time. */
export const InkWipe: React.FC<{at: number; tm: TimeMap; src: string}> = ({at, tm, src}) => (
  <Sequence from={Math.round(outAt(tm, at) * FPS)} durationInFrames={32} layout="none">
    <AbsoluteFill>
      <OffthreadVideo src={staticFile(src)} transparent muted style={{width: '100%', height: '100%'}} />
    </AbsoluteFill>
  </Sequence>
);

// ---------------------------------------------------------------------------
// Instagram-style comment sheet (slides up below her chin)
// ---------------------------------------------------------------------------
const IG_BLUE = '#0095F6';
const YOU = 'linear-gradient(135deg, #F5C451, #E5484D)';
const Avatar: React.FC<{d: number; fill: string; letter?: string}> = ({d, fill, letter}) => (
  <div style={{width: d, height: d, borderRadius: '50%', background: fill, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 800, fontSize: d * 0.45, color: '#141414'}}>{letter}</div>
);
const Row: React.FC<{at: number; indent?: number; avatar: React.ReactNode; name: string; tag?: string; text: React.ReactNode; heart?: boolean}> = ({at, indent = 0, avatar, name, tag, text, heart}) => {
  const t = useT();
  const k = tween(t, at, 0.35, EASE_OUT);
  const h = heart ? popAt(t, at + 0.45) : 0;
  return (
    <div style={{display: 'flex', alignItems: 'flex-start', gap: 20, padding: `14px 34px 14px ${34 + indent}px`, opacity: k, translate: `0 ${lerp(k, 24, 0)}px`, background: at > 0 && t < at + 0.9 && !indent ? `rgba(0,149,246,${0.08 * (1 - tween(t, at + 0.3, 0.6))})` : 'transparent'}}>
      {avatar}
      <div style={{flex: 1}}>
        <div style={{display: 'flex', gap: 12, alignItems: 'baseline', fontFamily: SANS}}>
          <span style={{fontWeight: 800, fontSize: 36, color: '#141414'}}>{name}</span>
          {tag ? <span style={{fontWeight: 600, fontSize: 30, color: '#8E8E8E'}}>{tag}</span> : null}
        </div>
        <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 40, lineHeight: 1.22, color: '#141414', marginTop: 2}}>{text}</div>
      </div>
      <svg width={36} height={34} viewBox="0 0 24 22" style={{marginTop: 18, flexShrink: 0}}>
        <path d="M12 21 C 4 15, 0 11, 0 6.5 A 5.5 5.5 0 0 1 12 4 A 5.5 5.5 0 0 1 24 6.5 C 24 11, 20 15, 12 21 Z" fill={h > 0.3 ? '#FF3040' : 'none'} stroke={h > 0.3 ? '#FF3040' : '#8E8E8E'} strokeWidth={2} style={{scale: h > 0 ? lerp(Math.min(1, h), 1.6, 1) : 1, transformOrigin: 'center'}} />
      </svg>
    </div>
  );
};
export const CommentSheet: React.FC<{start: number; word: string; typeAt: number; replyAt: number; pinned: React.ReactNode; reply: string; top?: number; wordSize?: number}> = ({
  start,
  word,
  typeAt,
  replyAt,
  pinned,
  reply,
  top = 1190,
  wordSize = 64,
}) => {
  const t = useT();
  if (t < start) return null;
  const up = tween(t, start, 0.45, EASE_OUT);
  const step = 0.07;
  const POST = typeAt + word.length * step + 0.25;
  const n = t < POST ? Math.max(0, Math.min(word.length, Math.floor((t - typeAt) / step) + 1)) : 0;
  const posted = t >= POST;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: `linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(0,0,0,${0.35 * up}) 62%)`}} />
      <div style={{position: 'absolute', left: 0, right: 0, top, bottom: -40, translate: `0 ${lerp(up, 1920 - top, 0)}px`, background: '#FFFFFF', borderRadius: '40px 40px 0 0', boxShadow: '0 -20px 50px -20px rgba(0,0,0,0.45)', display: 'flex', flexDirection: 'column'}}>
        <div style={{alignSelf: 'center', width: 90, height: 8, borderRadius: 4, background: '#D9D9D9', marginTop: 16}} />
        <div style={{textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 36, color: '#141414', padding: '14px 0 12px', borderBottom: '1px solid #EFEFEF'}}>Comments</div>
        <div style={{flex: 1, overflow: 'hidden'}}>
          {posted ? <Row at={POST} avatar={<Avatar d={64} fill={YOU} />} name="you" tag="now" text={<span style={{fontWeight: 800, fontSize: wordSize, letterSpacing: 3}}>{word}</span>} heart /> : null}
          {t >= replyAt ? <Row at={replyAt} indent={84} avatar={<Avatar d={52} fill={ACCENT} letter="B" />} name="bhavika" tag="Author" text={reply} /> : null}
          <Row at={-1} avatar={<Avatar d={64} fill={ACCENT} letter="B" />} name="bhavika" tag="Pinned" text={pinned} />
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, padding: '18px 30px 70px', borderTop: '1px solid #EFEFEF'}}>
          <Avatar d={64} fill={YOU} />
          <div style={{flex: 1, height: 74, borderRadius: 37, border: '2px solid #DBDBDB', display: 'flex', alignItems: 'center', padding: '0 26px', fontFamily: SANS, fontWeight: 800, fontSize: 40, color: n ? '#141414' : '#8E8E8E', whiteSpace: 'nowrap', overflow: 'hidden'}}>
            {n ? word.slice(0, n) : 'Add a comment…'}
            {n && !posted && Math.floor(t * 4) % 2 === 0 ? <span style={{color: IG_BLUE}}>|</span> : null}
          </div>
          <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 38, color: IG_BLUE, opacity: n ? 1 : 0.35}}>Post</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
