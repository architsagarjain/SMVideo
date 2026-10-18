import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { totalFrames, Shell8, timing, R8Data, Span, Media, Shade, Headline, Chip } from './common8';
import { Logo } from '../components/Logo';
import { lerp, E, rng } from '../lib';
import { C, F } from '../theme';
import data from '../data/r8/v8.json';

// Video 8 · Why we're building IndiaBiomass (manifesto). Look: starts loud (generic chat bubbles, missed calls),
// then everything clears to quiet type on forest green and real IndiaBiomass screens.
const D = data as unknown as R8Data;
const { L, W, END } = timing(D);
const FOREST = `radial-gradient(ellipse 100% 70% at 50% 45%, #0A4A31 0%, ${C.forest} 40%, #03180F 100%)`;

const Noise: React.FC = () => {
  const f = useCurrentFrame();
  const t0 = L(1);
  const r = rng(5);
  const bubbles = Array.from({ length: 16 }, (_, i) => ({ at: t0 + i * 8, x: 70 + r() * 560, y: 420 + r() * 820, w: 260 + r() * 220, me: r() > 0.5, lines: 1 + Math.floor(r() * 2) }));
  return (
    <AbsoluteFill>
      {bubbles.map((b, i) => {
        const s = lerp(f, [b.at, b.at + 8], [0, 1], E.back);
        if (s <= 0) return null;
        return (
          <div key={i} style={{ position: 'absolute', left: b.x, top: b.y, width: b.w, padding: '16px 20px', borderRadius: 22, borderBottomLeftRadius: b.me ? 22 : 6, borderBottomRightRadius: b.me ? 6 : 22,
            background: b.me ? 'rgba(220,240,226,0.95)' : 'rgba(255,255,255,0.95)', boxShadow: '0 10px 30px rgba(0,0,0,0.35)', opacity: Math.min(1, s), transform: `scale(${0.7 + 0.3 * Math.min(1, s)})` }}>
            {Array.from({ length: b.lines }, (_, k) => <div key={k} style={{ height: 14, borderRadius: 7, background: 'rgba(22,32,26,0.25)', width: `${k === b.lines - 1 ? 60 : 95}%`, marginTop: k ? 10 : 0 }} />)}
          </div>
        );
      })}
      <Chip text="MISSED CALL ×3" at={W('call') + 4} top={330} color="#fff" bg="rgba(200,60,50,0.92)" border="rgba(255,255,255,0.4)" />
      <Chip text="1,000+ UNREAD" at={W('thousand')} top={1300} color={C.ink} bg={C.harvest} border={C.harvest} size={30} />
    </AbsoluteFill>
  );
};

const PriceTag: React.FC = () => {
  const f = useCurrentFrame();
  const s = lerp(f, [W('price') - 2, W('price') + 10], [0, 1], E.back);
  const sway = Math.sin((f - L(2)) * 0.08) * 4;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', justifyContent: 'center', opacity: Math.min(1, s) }}>
      <div style={{ transform: `rotate(${-8 + sway}deg) scale(${0.7 + 0.3 * s})`, background: C.harvest, color: C.ink, borderRadius: '24px 70px 70px 24px', padding: '30px 90px 30px 60px', fontFamily: F.display, fontWeight: 800, fontSize: 150, boxShadow: '0 30px 80px rgba(0,0,0,0.5)', position: 'relative' }}>
        ₹ ?
        <div style={{ position: 'absolute', right: 36, top: '50%', width: 34, height: 34, marginTop: -17, borderRadius: 17, background: C.forest }} />
      </div>
    </div>
  );
};

const Link: React.FC = () => {
  const f = useCurrentFrame();
  const sup = lerp(f, [W('supply') - 2, W('supply') + 10], [0, 1], E.back);
  const dem = lerp(f, [W('demand') - 2, W('demand') + 10], [0, 1], E.back);
  const draw = lerp(f, [W('link') - 4, W('link') + 16], [0, 0.42]) + lerp(f, [L(6), L(6) + 14], [0, 0.58], E.inOut);
  const done = draw > 0.99;
  const node = (x: number, label: string, s: number) => (
    <div style={{ position: 'absolute', left: x - 110, top: 770, width: 220, textAlign: 'center', opacity: Math.min(1, s), transform: `scale(${0.7 + 0.3 * s})` }}>
      <div style={{ margin: '0 auto', width: 120, height: 120, borderRadius: 60, background: C.harvest, boxShadow: done ? '0 0 50px rgba(232,176,75,0.9)' : undefined }} />
      <div style={{ marginTop: 18, fontFamily: F.label, fontWeight: 600, fontSize: 28, letterSpacing: '0.18em', color: '#fff' }}>{label}</div>
    </div>
  );
  return (
    <AbsoluteFill style={{ background: FOREST }}>
      <div style={{ position: 'absolute', left: 240, top: 826, width: 600, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.12)' }} />
      <div style={{ position: 'absolute', left: 240, top: 826, width: 600 * Math.min(1, draw), height: 8, borderRadius: 4, background: C.harvest, boxShadow: '0 0 18px rgba(232,176,75,0.9)' }} />
      {node(240, 'SUPPLY', sup)}{node(840, 'DEMAND', dem)}
      <Headline text={'THE MISSING LINK'} at={W('missing')} out={L(6) - 4} top={500} size={78} color={C.harvest} />
      <Headline text={'SO WE ARE\nBUILDING IT.'} at={L(6)} out={L(7) - 6} top={440} size={86} />
    </AbsoluteFill>
  );
};

// real site captures, cropped: [file, sourceW, sourceH, crop x, y, w, h]
const SHOTS: Record<string, [string, number, number, number, number, number, number]> = {
  verified: ['ui/card_paddypellets.png', 548, 664, 0, 250, 548, 414],
  tenders: ['ui/tenders_view.png', 2880, 1800, 760, 1180, 1500, 620],
  prices: ['ui/md_price.png', 2560, 1394, 0, 120, 1750, 900],
  supply: ['ui/md_supply.png', 2560, 844, 0, 0, 1450, 844],
};
const Shot: React.FC<{ k: string; w: number }> = ({ k, w }) => {
  const [src, sw, sh, cx, cy, cw, ch] = SHOTS[k];
  const s = w / cw;
  return (
    <div style={{ width: w, height: ch * s, overflow: 'hidden', position: 'relative', borderRadius: 20, background: '#fff' }}>
      <Img src={staticFile(src)} style={{ position: 'absolute', left: -cx * s, top: -cy * s, width: sw * s, height: sh * s }} />
    </div>
  );
};
const FEATS = [
  { k: 'verified', title: 'VERIFIED SUPPLIERS & BUYERS', at: L(7), to: L(8), badge: '✓ VERIFIED' },
  { k: 'tenders', title: 'TENDERS, AS THEY ARE PUBLISHED', at: L(8), to: L(9) },
  { k: 'prices', title: 'PRICES, REGION BY REGION', at: L(9), to: L(10) },
  { k: 'supply', title: 'SUPPLY & POLICY, TRACKED', at: L(10), to: L(11) },
];
const Feature: React.FC<{ i: number }> = ({ i }) => {
  const f = useCurrentFrame();
  const ft = FEATS[i];
  const t = lerp(f, [ft.at - 4, ft.at + 12], [0, 1], E.out);
  const w = ft.k === 'verified' ? 680 : 940;
  return (
    <AbsoluteFill style={{ background: FOREST }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 230, display: 'flex', justifyContent: 'center', gap: 12 }}>
        {FEATS.map((_, k) => <span key={k} style={{ width: k === i ? 46 : 14, height: 14, borderRadius: 7, background: k <= i ? C.harvest : 'rgba(255,255,255,0.3)' }} />)}
      </div>
      <Headline text={ft.title} at={ft.at} top={300} size={56} />
      <div style={{ position: 'absolute', left: (1080 - w) / 2, top: 520, opacity: t, transform: `translateY(${(1 - t) * 60}px) perspective(1600px) rotateX(${(1 - t) * 10}deg)`, boxShadow: '0 40px 100px rgba(0,0,0,0.55)', borderRadius: 20 }}>
        <Shot k={ft.k} w={w} />
        {ft.badge && <div style={{ position: 'absolute', right: -24, top: -26, background: '#2E9E62', color: '#fff', fontFamily: F.label, fontWeight: 600, fontSize: 26, letterSpacing: '0.12em', borderRadius: 999, padding: '12px 24px', transform: `scale(${lerp(f, [ft.at + 10, ft.at + 20], [0, 1], E.back)})` }}>{ft.badge}</div>}
      </div>
    </AbsoluteFill>
  );
};

export const V8: React.FC = () => {
  const f = useCurrentFrame();
  const s4 = [L(4), W('factories'), W('farmers'), L(5)];
  return (
    <Shell8 d={D}>
      <Span from={0} to={L(2)}><Media src="V8_1.jpg" from={0} to={L(2)} a={[1.15, 0, 0]} b={[1.35, 0, -60]} grade="warm" /><Shade top={0.75} mid={0.25} bottom={0.75} /></Span>
      <Headline text={'HOW DO YOU FIND\nA BIOMASS BUYER?'} at={6} out={L(1) - 6} top={300} size={80} />
      <Span from={L(1)} to={L(2)} fade={6}><Noise /></Span>
      <Span from={L(2)} to={L(4)}><Media src="V8_2.mp4" from={L(2)} to={L(4)} a={[1.1, 0, 0]} b={[1.2, 0, 0]} grade="neutral" /><Shade top={0.8} mid={0.55} bottom={0.8} /><PriceTag />
        <Headline text={'THEY FIND OUT\nAFTER THE DEAL.'} at={W('after')} top={1060} size={72} color={C.harvest} /></Span>
      <Span from={s4[0]} to={s4[1]}><Media src="V8_3.jpg" from={s4[0]} to={s4[1]} a={[1.25, 0, 0]} b={[1.1, 0, 0]} grade="neutral" /><Shade /><Chip text="POWER PLANTS NEED FUEL" at={s4[0] + 4} top={300} /></Span>
      <Span from={s4[1]} to={s4[2]}><Media src="V8_4.mp4" from={s4[1]} to={s4[2]} a={[1.15, 0, 0]} b={[1.05, 0, 0]} grade="industrial" /><Shade /><Chip text="FACTORIES SWITCHING BOILERS" at={s4[1] + 4} top={300} /></Span>
      <Span from={s4[2]} to={s4[3]}><Media src="V8_5.jpg" from={s4[2]} to={s4[3]} a={[1.1, 0, 0]} b={[1.25, 0, 0]} grade="golden" /><Shade /><Chip text="FARMERS WITH STRAW TO SELL" at={s4[2] + 4} top={300} /></Span>
      <Span from={L(5)} to={L(7)}><Link /></Span>
      {FEATS.map((ft, i) => <Span key={ft.k} from={ft.at} to={ft.to} fade={6}><Feature i={i} /></Span>)}
      <Span from={L(11)} to={END}>
        <AbsoluteFill style={{ background: FOREST }} />
        <Headline text={'IndiaBiomass'} at={L(11)} top={560} size={110} color={C.harvest} />
        <Headline text={'The information and trust layer\nfor India’s biomass industry'} at={W('information')} top={760} size={52} weight={600} font={F.text} lh={1.25} />
      </Span>
    </Shell8>
  );
};
export const V8_FRAMES = totalFrames(D);
