import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { totalFrames, Shell8, timing, R8Data, Span, Media, Headline } from './common8';
import { lerp, E } from '../lib';
import { C, F } from '../theme';
import data from '../data/r8/v5.json';

// Video 5 · What buyers check (checklist). Look: an inspection camera. Each check runs full-bleed footage
// inside gold viewfinder brackets: a scan line sweeps, then a PASS stamp bursts in. Ends on an all-five card
// and a camera-shutter flash on "Screenshot this".
const D = data as unknown as R8Data;
const { L, END } = timing(D);
const INK = '#0B1510';
const ITEMS = [
  { k: 'MOISTURE', note: 'Wet fuel means transporting water', at: L(1), src: 'V5_1.jpg', grade: 'neutral' as const },
  { k: 'GCV', note: 'Below the minimum: rejected or price cut', at: L(2), src: 'V5_2.mp4', grade: 'warm' as const },
  { k: 'ASH', note: 'More cleaning, more boiler wear', at: L(3), src: 'V5_3r.mp4', grade: 'neutral' as const },
  { k: 'SIZE', note: 'Must fit the feeding system', at: L(4), src: 'V5_4.jpg', grade: 'neutral' as const },
  { k: 'CONSISTENCY', note: 'Every truck matches the spec', at: L(5), src: 'V5_5.mp4', grade: 'warm' as const },
];
const BOX = { x: 90, y: 560, w: 900, h: 770 };

const Brackets: React.FC<{ at: number; tight?: number }> = ({ at, tight = 0 }) => {
  const f = useCurrentFrame();
  const t = lerp(f, [at, at + 12], [0, 1], E.out);
  const inset = (1 - t) * 60 + tight * 70;
  const L_ = 90, W = 6, col = C.harvest;
  const corner = (x: number, y: number, sx: number, sy: number) => (
    <div style={{ position: 'absolute', left: x, top: y, width: L_, height: L_, borderLeft: sx > 0 ? `${W}px solid ${col}` : undefined, borderRight: sx < 0 ? `${W}px solid ${col}` : undefined,
      borderTop: sy > 0 ? `${W}px solid ${col}` : undefined, borderBottom: sy < 0 ? `${W}px solid ${col}` : undefined, transform: `translate(${-sx * 0}px, 0)`, filter: 'drop-shadow(0 0 8px rgba(232,176,75,0.6))' }} />
  );
  return (
    <div style={{ position: 'absolute', left: BOX.x + inset, top: BOX.y + inset, width: BOX.w - 2 * inset, height: BOX.h - 2 * inset, opacity: t }}>
      {corner(0, 0, 1, 1)}
      <div style={{ position: 'absolute', right: 0, top: 0 }}>{corner(-L_, 0, -1, 1)}</div>
      <div style={{ position: 'absolute', left: 0, bottom: 0 }}>{corner(0, -L_, 1, -1)}</div>
      <div style={{ position: 'absolute', right: 0, bottom: 0 }}>{corner(-L_, -L_, -1, -1)}</div>
    </div>
  );
};

const Check: React.FC<{ i: number; to: number }> = ({ i, to }) => {
  const f = useCurrentFrame();
  const it = ITEMS[i];
  const scan = lerp(f, [it.at + 4, it.at + 34], [0, 1], E.inOut);
  const stamp = lerp(f, [it.at + 34, it.at + 44], [0, 1], E.back);
  const ring = lerp(f, [it.at + 36, it.at + 60], [0, 1], E.out);
  const title = lerp(f, [it.at, it.at + 10], [0, 1], E.out);
  return (
    <AbsoluteFill>
      <Media src={it.src} from={it.at} to={to} a={[1.35, 0, 0]} b={[1.1, 0, 0]} grade={it.grade} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(8,16,12,0.92) 0%, rgba(8,16,12,0.45) 30%, rgba(8,16,12,0.35) 60%, rgba(8,16,12,0.85) 100%)' }} />
      {/* big ghost number */}
      <div style={{ position: 'absolute', right: 30, top: 120, fontFamily: F.display, fontWeight: 800, fontSize: 420, lineHeight: 1, color: 'transparent', WebkitTextStroke: '3px rgba(232,176,75,0.28)', opacity: title }}>0{i + 1}</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center', opacity: title, transform: `translateY(${(1 - title) * 30}px)` }}>
        <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: it.k.length > 8 ? 112 : 136, color: '#fff', letterSpacing: '-0.03em', textShadow: '0 6px 30px rgba(0,0,0,0.6)' }}>{it.k}</div>
        <div style={{ marginTop: 6, fontFamily: F.text, fontWeight: 600, fontSize: 38, color: C.harvest, opacity: lerp(f, [it.at + 10, it.at + 20], [0, 1]) }}>{it.note}</div>
      </div>
      <Brackets at={it.at} />
      {/* scan line */}
      {scan > 0 && scan < 1 && (
        <div style={{ position: 'absolute', left: BOX.x + 20, width: BOX.w - 40, top: BOX.y + scan * BOX.h, height: 4, background: C.harvest, boxShadow: '0 0 24px 6px rgba(232,176,75,0.6)' }} />
      )}
      {scan > 0 && scan < 1 && <div style={{ position: 'absolute', left: BOX.x + 30, top: BOX.y + 24, fontFamily: F.label, fontWeight: 600, fontSize: 24, letterSpacing: '0.24em', color: C.harvest }}>SCANNING…</div>}
      {/* pass stamp */}
      <div style={{ position: 'absolute', left: 540 - 170, top: BOX.y + BOX.h / 2 - 170, width: 340, height: 340, display: 'grid', placeItems: 'center' }}>
        <div style={{ position: 'absolute', inset: -60 * ring, borderRadius: '50%', border: `4px solid rgba(232,176,75,${0.8 * (1 - ring)})` }} />
        <div style={{ width: 300, height: 300, borderRadius: '50%', background: 'rgba(8,16,12,0.78)', border: `8px solid ${C.harvest}`, display: 'grid', placeItems: 'center', opacity: Math.min(1, stamp), transform: `scale(${0.4 + 0.6 * stamp})` }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 130, color: C.harvest, lineHeight: 1 }}>✓</div>
            <div style={{ fontFamily: F.label, fontWeight: 700, fontSize: 34, letterSpacing: '0.3em', color: '#fff', marginTop: 4 }}>PASS</div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Progress: React.FC = () => {
  const f = useCurrentFrame();
  const cur = ITEMS.reduce((a, it, i) => (f >= it.at ? i : a), -1);
  if (cur < 0 || f >= L(6)) return null;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 170, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
      <span style={{ fontFamily: F.label, fontWeight: 600, fontSize: 26, letterSpacing: '0.22em', color: C.harvest, marginRight: 8 }}>CHECK 0{cur + 1} / 05</span>
      {ITEMS.map((it, k) => {
        const done = f >= it.at + 40;
        return <span key={k} style={{ width: k === cur ? 46 : 16, height: 16, borderRadius: 8, background: done || k === cur ? C.harvest : 'rgba(255,255,255,0.28)' }} />;
      })}
    </div>
  );
};

const Summary: React.FC = () => {
  const f = useCurrentFrame();
  const t0 = L(6);
  const shot = lerp(f, [L(7) - 2, L(7) + 2, L(7) + 10], [0, 1, 0]);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 100% 70% at 50% 45%, #123524 0%, ${INK} 60%)` }}>
      <Headline text={'ALL 5 CHECKED'} at={t0} top={250} size={96} color={C.harvest} />
      <div style={{ position: 'absolute', left: 150, width: 780, top: 470, background: 'rgba(20,48,34,0.9)', border: `2px solid ${C.harvest}`, borderRadius: 30, padding: '30px 40px', boxShadow: '0 40px 100px rgba(0,0,0,0.6)' }}>
        {ITEMS.map((it, k) => {
          const s = lerp(f, [t0 + 6 + k * 5, t0 + 16 + k * 5], [0, 1], E.back);
          return (
            <div key={it.k} style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '16px 0', borderTop: k ? '1px solid rgba(232,176,75,0.25)' : undefined, opacity: Math.min(1, s), transform: `translateX(${(1 - Math.min(1, s)) * -40}px)` }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: C.harvest, display: 'grid', placeItems: 'center', fontSize: 40, fontWeight: 800, color: C.ink }}>✓</div>
              <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 54, color: '#fff', letterSpacing: '-0.02em' }}>{it.k === 'GCV' ? 'GCV · heat value' : it.k.charAt(0) + it.k.slice(1).toLowerCase()}</div>
            </div>
          );
        })}
      </div>
      <Brackets at={L(7)} tight={0} />
      {f >= L(7) && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 1230, display: 'flex', justifyContent: 'center' }}>
          <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 52, color: C.ink, background: C.harvest, borderRadius: 999, padding: '14px 40px', transform: `scale(${lerp(f, [L(7), L(7) + 10], [1.3, 1], E.back)})` }}>SCREENSHOT THIS</div>
        </div>
      )}
      <AbsoluteFill style={{ background: '#fff', opacity: shot * 0.85 }} />
    </AbsoluteFill>
  );
};

export const V5: React.FC = () => (
  <Shell8 d={D} bg={INK}>
    <Span from={0} to={L(1)}>
      <Media src="V5_6.mp4" from={0} to={L(1)} a={[1.3, 0, 0]} b={[1.1, 0, 0]} grade="neutral" />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(8,16,12,0.9) 0%, rgba(8,16,12,0.5) 40%, rgba(8,16,12,0.85) 100%)' }} />
      <Headline text={'5 CHECKS\nBEFORE A BUYER\nPAYS YOU'} at={4} top={300} size={104} />
      <Brackets at={20} />
    </Span>
    {ITEMS.map((it, i) => <Span key={it.k} from={it.at} to={i < 4 ? ITEMS[i + 1].at : L(6)} fade={5}><Check i={i} to={i < 4 ? ITEMS[i + 1].at : L(6)} /></Span>)}
    <Progress />
    <Span from={L(6)} to={END} fade={6}><Summary /></Span>
  </Shell8>
);
export const V5_FRAMES = totalFrames(D);
