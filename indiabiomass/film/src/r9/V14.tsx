import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { totalFrames, Shell8, timing, R8Data, Media } from '../r8/common8';
import { r9 } from './common9';
import { lerp, E } from '../lib';
import { C, F } from '../theme';
import data from '../data/r9/v14.json';

// Video 14 · Same morning, two phones. Look: a calm top/bottom split. Punjab (her, the pellet maker) on top,
// Haryana (him, the factory manager) below. Each half carries ONE caption block in the same place; a single
// badge on the seam keeps the time. The halves drift apart for "never found each other", then close again.
const D = data as unknown as R8Data;
const { L, W, FIN } = timing(D);
const HALF = 960;
const INK = '#0B1210';

type Beat = { at: number; top: string; bot: string; topSrc: string; botSrc: string; focus?: 'top' | 'bot' };
const BEATS: Beat[] = [
  { at: 0, top: 'Has the stock', bot: 'Needs the fuel', topSrc: 'V14_1.mp4', botSrc: 'V14_2.mp4' },
  { at: L(1), top: 'Warehouse full.\nNo buyer.', bot: 'Needs the fuel', topSrc: 'V14_1.mp4', botSrc: 'V14_2.mp4', focus: 'top' },
  { at: L(2), top: 'Warehouse full.\nNo buyer.', bot: 'Fuel by Friday.\nNo supplier.', topSrc: 'V14_1.mp4', botSrc: 'V14_2.mp4', focus: 'bot' },
  { at: L(3), top: 'Calls three traders.', bot: 'Checks old\nWhatsApp groups.', topSrc: 'V14_3.jpg', botSrc: 'V14_4.jpg' },
  { at: L(4), top: 'Three different prices.', bot: 'No reply.', topSrc: 'V14_3.jpg', botSrc: 'V14_4.jpg' },
  { at: L(5), top: 'Stock still waiting.', bot: 'Boiler running short.', topSrc: 'V14_5.jpg', botSrc: 'V14_6.mp4' },
];
const beatAt = (f: number) => BEATS.reduce((a, b, i) => (f >= b.at ? i : a), 0);

/** Media for one half: crossfades only when the shot itself changes. */
const HalfMedia: React.FC<{ top: boolean }> = ({ top }) => {
  const f = useCurrentFrame();
  const shots: { src: string; from: number; to: number }[] = [];
  BEATS.forEach((b) => {
    const src = top ? b.topSrc : b.botSrc;
    if (!shots.length || shots[shots.length - 1].src !== src) shots.push({ src, from: b.at, to: FIN });
    else return;
    if (shots.length > 1) shots[shots.length - 2].to = b.at;
  });
  return (
    <>
      {shots.map((s, i) => {
        if (f < s.from - 8 || f >= s.to + 8) return null;
        const o = i === 0 ? 1 : lerp(f, [s.from - 8, s.from + 4], [0, 1]);
        const still = s.src.endsWith('.jpg');
        return (
          <div key={i} style={{ position: 'absolute', inset: 0, opacity: o }}>
            <Media src={r9(s.src)} from={s.from} to={s.to} a={still ? [1.15, 0, 0] : [1.18, 0, 0]} b={[1.05, 0, 0]} grade={s.src === 'V14_6.mp4' ? 'cool' : 'warm'} />
          </div>
        );
      })}
    </>
  );
};

/** The one caption block per half: place label + a short statement, always at the half's top-left. */
const Caption: React.FC<{ top: boolean; gap: number }> = ({ top, gap }) => {
  const f = useCurrentFrame();
  const k = beatAt(f);
  const text = (i: number) => (top ? BEATS[i].top : BEATS[i].bot);
  const changed = k > 0 && text(k) !== text(k - 1);
  const t = changed ? lerp(f, [BEATS[k].at - 2, BEATS[k].at + 10], [0, 1], E.out) : lerp(f, [4, 16], [0, 1], E.out);
  return (
    <div style={{ position: 'absolute', left: 64, right: 64, top: 70, opacity: lerp(gap, [0, 60], [1, 0]) }}>
      <div style={{ fontFamily: F.label, fontWeight: 700, fontSize: 26, letterSpacing: '0.22em', color: C.harvest, opacity: lerp(f, [2, 12], [0, 1]) }}>
        {top ? 'PUNJAB · PELLET MAKER' : 'HARYANA · FACTORY MANAGER'}
      </div>
      <div style={{ marginTop: 12, fontFamily: F.display, fontWeight: 800, fontSize: 60, lineHeight: 1.04, letterSpacing: '-0.025em', color: '#fff', whiteSpace: 'pre-line',
        textShadow: '0 4px 24px rgba(0,0,0,0.55)', opacity: t, transform: `translateY(${(1 - t) * 16}px)` }}>{text(k)}</div>
    </div>
  );
};

const Half: React.FC<{ top: boolean; gap: number; dim: number }> = ({ top, gap, dim }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, top: top ? -gap : HALF + gap, height: HALF, overflow: 'hidden' }}>
    <HalfMedia top={top} />
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(6,12,10,0.82) 0%, rgba(6,12,10,0.35) 42%, rgba(6,12,10,0.15) 70%, rgba(6,12,10,0.45) 100%)' }} />
    <AbsoluteFill style={{ background: `rgba(6,12,10,${dim})` }} />
    <Caption top={top} gap={gap} />
  </div>
);

/** One badge on the seam: the time, then the brand line at the end. */
const SeamBadge: React.FC<{ gap: number }> = ({ gap }) => {
  const f = useCurrentFrame();
  const evening = f >= L(5);
  const brand = f >= L(8);
  const t = lerp(f, [6, 16], [0, 1], E.out) * (gap > 20 && !brand ? 0 : 1);
  const swap = lerp(f, [L(5) - 4, L(5) + 6], [0, 1]);
  const label = brand ? 'INDIABIOMASS IS BUILDING IT' : evening ? 'EVENING' : '7:00 AM';
  const pop = brand ? lerp(f, [L(8) + 8, L(8) + 18], [0.6, 1], E.back) : evening ? 0.85 + 0.15 * swap : 1;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: HALF - 38, display: 'flex', justifyContent: 'center', opacity: brand ? lerp(f, [L(8) + 8, L(8) + 16], [0, 1]) : t }}>
      <div style={{ fontFamily: brand ? F.display : F.label, fontWeight: 800, fontSize: brand ? 40 : 34, letterSpacing: brand ? '-0.01em' : '0.12em', color: C.ink, background: C.harvest,
        borderRadius: 999, padding: '14px 34px', boxShadow: '0 10px 30px rgba(0,0,0,0.45)', transform: `scale(${pop})` }}>{label}</div>
    </div>
  );
};

/** The gap between the halves when they drift apart: one line, then three. */
const Gap: React.FC<{ gap: number }> = ({ gap }) => {
  const f = useCurrentFrame();
  const a = L(6), b = L(7);
  if (gap < 40) return null;
  const words: [string, number, string][] = [['NOT SUPPLY.', W('supply', 0, 7), '#fff'], ['NOT DEMAND.', W('demand', 0, 7), '#fff'], ['THE CONNECTION.', W('connection'), C.harvest]];
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: HALF - gap, height: gap * 2, background: INK, display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
      {f < b ? (
        <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 64, lineHeight: 1.08, color: '#fff', textAlign: 'center', letterSpacing: '-0.02em', opacity: Math.min(lerp(f, [a, a + 8], [0, 1]), lerp(f, [b - 5, b], [1, 0])) }}>
          THEY NEVER FOUND<br />EACH OTHER
        </div>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: F.label, fontWeight: 700, fontSize: 42, letterSpacing: '0.22em', color: C.harvest, marginBottom: 22, opacity: lerp(f, [b + 2, b + 10], [0, 1]) }}>THE REAL GAP</div>
          {words.map(([w, at, col]) => {
            return <div key={w} style={{ fontFamily: F.display, fontWeight: 800, fontSize: 76, lineHeight: 1.12, color: col, letterSpacing: '-0.02em', opacity: lerp(f, [at - 4, at + 6], [0, 1]) }}>{w}</div>;
          })}
        </div>
      )}
    </div>
  );
};

export const V14: React.FC = () => {
  const f = useCurrentFrame();
  const k = beatAt(f);
  const focus = f < L(3) ? BEATS[k].focus : undefined;
  const dimTop = lerp(f, [BEATS[k].at, BEATS[k].at + 10], [0, focus === 'bot' ? 0.45 : 0]);
  const dimBot = lerp(f, [BEATS[k].at, BEATS[k].at + 10], [0, focus === 'top' ? 0.45 : 0]);
  const gap = lerp(f, [L(6) - 2, L(6) + 16], [0, 300], E.inOut) * lerp(f, [L(8), L(8) + 16], [1, 0], E.inOut);
  const seamGlow = lerp(f, [L(8) + 4, L(8) + 20], [0, 1], E.out);
  return (
    <Shell8 d={D} bg={INK} plate>
      <Half top gap={gap} dim={dimTop} />
      <Half top={false} gap={gap} dim={dimBot} />
      <Gap gap={gap} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: HALF - 2, height: 4, background: C.harvest, opacity: gap > 2 ? 0 : 1, boxShadow: `0 0 ${10 + 30 * seamGlow}px rgba(232,176,75,${0.5 + 0.5 * seamGlow})` }} />
      <SeamBadge gap={gap} />
    </Shell8>
  );
};
export const V14_FRAMES = totalFrames(D);
