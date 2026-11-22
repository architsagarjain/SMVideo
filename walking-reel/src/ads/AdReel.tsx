import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Base, Footage, GradeOverlay, ReelConfig, Subject, Win, inWin} from '../series/core';
import {TimeMap} from '../series/timemap';
import {Dolly} from '../minimal/fx';
import {useT} from '../explainer/kit';
import {ACCENT, Cut, Cutaways, WHITE, outline} from '../minimal/kit';
import {EASE_IN, EASE_OUT, SANS, SERIF, lerp, tween} from '../theme';
import {ANTON, chunkAt, popAt} from '../series/kit2';
import {BRAND, Cards, FoodCards, FreePile, FreeStack, FreeType, FreeTypeView, Testimonial, TestimonialInsert, GROT, Logo, LogoReveal, MixLine, MixWord, Neon, NeonSign, Search, SearchBar, Women, WomenWall, ZoomBlur} from './extras';

/**
 * Meta-ad reels (talking head against a plain wall, minimal style like the blood-tests / breakfast reels).
 * Everything that must be read sits in the Reels-ad safe zone: below the top ~14 % (y 270) and above
 * the bottom ~35 % (y 1250), where the ad UI and CTA button go. Her face is ~y 780-1260, so all text
 * goes in the empty wall above her head (y 270-760); nothing covers her face. Source seconds.
 */
export type PillKind = 'check' | 'cross' | 'q' | 'dot';
export type PillGroup = {start: number; end: number; items: {text: string; at: number; kind: PillKind}[]};
export type Counter = {start: number; end: number; at: number; value: number; suffix: string; label: string};
export type Badge = {start: number; end: number; at: number};
export type BehindWord = {start: number; end: number; lines: {text: string; at: number; size: number; serif?: boolean}[]};
export type Cta = {start: number; bookAt: number; priceAt: number; tapAt: number; price: string; closing: string; color?: string; grot?: boolean};
export type BeforeAfter = {start: number; end: number; beforeAt: number; afterAt: number; statsAt: number; before: string; after: string; stats: string[]};
export type AdConfig = {
  cfg: ReelConfig;
  tm: TimeMap;
  cuts: Cut[];
  dolly?: Win;
  pills: PillGroup[];
  counter?: Counter;
  badge?: Badge;
  behind?: BehindWord;
  cta: Cta;
  beforeAfter?: BeforeAfter;
  /** Ad C: reference-style type (italic serif + heavy grotesque) and its richer graphics */
  mix?: boolean;
  women?: Women;
  logo?: Logo;
  cards?: FoodCards;
  neon?: Neon;
  free?: FreeStack;
  search?: Search;
  zoom?: Win;
  freeType?: FreeType;
  testimonial?: Testimonial;
};

const GREEN = '#17A34A';
const RED = '#E5484D';
const GOLD = '#E4A11B';
const INK = '#141414';
const vis = (t: number, w: {start: number; end: number}) => (t < w.start || t > w.end + 0.25 ? 0 : tween(t, w.start, 0.25, EASE_OUT) * (1 - tween(t, w.end - 0.05, 0.25, EASE_IN)));
const shadow = '0 16px 34px -14px rgba(0,0,0,0.55)';

/** Stacked, centred pills above her head: ✓ / ✗ (struck through) / ? / dot. */
const MixPills: React.FC<{g: PillGroup}> = ({g}) => {
  const t = useT();
  const o = vis(t, g);
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{opacity: o}}>
      {g.items.map((it, i) => {
        if (t < it.at) return null;
        const k = popAt(t, it.at);
        const col = {check: BRAND, cross: RED, q: GOLD, dot: GOLD}[it.kind];
        const icon = {check: '✓', cross: '✕', q: '?', dot: '•'}[it.kind];
        const words = it.text.split(' ');
        return (
          <div key={i} style={{position: 'absolute', left: 40, right: 40, top: 300 + i * 120, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18, scale: lerp(Math.min(1.05, k), 0.6, 1), opacity: Math.min(1, k * 3)}}>
            <span style={{width: 62, height: 62, flexShrink: 0, borderRadius: '50%', background: col, color: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: GROT, fontWeight: 800, fontSize: 38, boxShadow: '0 10px 22px -10px rgba(0,0,0,0.6)'}}>{icon}</span>
            <div style={{display: 'flex', alignItems: 'baseline', columnGap: 18}}>
              {words.map((w, j) => (
                <MixWord key={j} w={w} size={66} />
              ))}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
const Pills: React.FC<{g: PillGroup; mix?: boolean}> = ({g, mix}) => {
  const t = useT();
  const o = vis(t, g);
  if (mix) return <MixPills g={g} />;
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{opacity: o}}>
      {g.items.map((it, i) => {
        if (t < it.at) return null;
        const k = popAt(t, it.at);
        const strike = it.kind === 'cross' ? tween(t, it.at + 0.25, 0.3, EASE_OUT) : 0;
        const icon = {check: ['✓', GREEN], cross: ['✕', RED], q: ['?', GOLD], dot: ['•', GOLD]}[it.kind];
        return (
          <div key={i} style={{position: 'absolute', left: 60, right: 60, top: 300 + i * 132, display: 'flex', justifyContent: 'center'}}>
            <div style={{position: 'relative', display: 'flex', alignItems: 'center', gap: 18, padding: '16px 38px 16px 18px', borderRadius: 999, background: '#FFFFFF', boxShadow: shadow, fontFamily: SANS, fontWeight: 800, fontSize: 56, color: it.kind === 'cross' ? lerp(strike, 0, 1) > 0.5 ? '#8A857C' : INK : INK, whiteSpace: 'nowrap', scale: lerp(Math.min(1.05, k), 0.5, 1), opacity: Math.min(1, k * 3)}}>
              <span style={{width: 64, height: 64, borderRadius: '50%', background: icon[1], color: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 42, lineHeight: 1}}>{icon[0]}</span>
              <span style={{position: 'relative'}}>
                {it.text}
                {strike > 0 ? <span style={{position: 'absolute', left: -6, right: -6, top: '52%', height: 7, borderRadius: 4, background: RED, scale: `${strike} 1`, transformOrigin: 'left center'}} /> : null}
              </span>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** "500+ women": a number that counts up above her head. */
const CounterView: React.FC<{c: Counter}> = ({c}) => {
  const t = useT();
  const o = vis(t, c);
  if (o <= 0) return null;
  const p = tween(t, c.at, 0.9, EASE_OUT);
  const k = popAt(t, c.at);
  const land = popAt(t, c.at + 0.9);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', scale: lerp(Math.min(1.04, k), 0.6, 1) * (t >= c.at + 0.9 ? lerp(Math.min(1, land), 1.08, 1) : 1)}}>
        <div style={{fontFamily: ANTON, fontSize: 250, lineHeight: 1, color: WHITE, ...outline(120, 0.35), letterSpacing: 2}}>
          {Math.round(c.value * p)}
          <span style={{color: ACCENT}}>{c.suffix}</span>
        </div>
        <div style={{marginTop: 14, padding: '10px 30px', borderRadius: 999, background: '#FFFFFF', boxShadow: shadow, fontFamily: SANS, fontWeight: 800, fontSize: 46, color: INK, opacity: tween(t, c.at + 0.2, 0.3)}}>{c.label}</div>
      </div>
    </AbsoluteFill>
  );
};

/** "Featured in Times Square, New York": a minimal billboard-style badge. */
const BadgeView: React.FC<{b: Badge}> = ({b}) => {
  const t = useT();
  const o = vis(t, b);
  if (o <= 0) return null;
  const k = popAt(t, b.at);
  const sweep = tween(t, b.at + 0.25, 0.7, EASE_OUT);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 320, display: 'flex', justifyContent: 'center'}}>
        <div style={{position: 'relative', overflow: 'hidden', padding: '30px 56px 34px', borderRadius: 30, background: INK, boxShadow: `0 0 0 4px ${ACCENT}, 0 24px 50px -18px rgba(0,0,0,0.6)`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, scale: lerp(Math.min(1.05, k), 0.6, 1), opacity: Math.min(1, k * 3)}}>
          <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: 8, color: ACCENT}}>FEATURED IN</span>
          <span style={{fontFamily: ANTON, fontSize: 128, lineHeight: 1.02, color: WHITE, letterSpacing: 2}}>TIMES SQUARE</span>
          <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 34, letterSpacing: 10, color: '#BDBDBD'}}>NEW YORK</span>
          <div style={{position: 'absolute', top: 0, bottom: 0, width: 140, left: `${lerp(sweep, -30, 130)}%`, background: 'linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.28) 50%, rgba(255,255,255,0) 100%)'}} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Big words rising from behind her head (her cut-out is drawn over them). */
const BEHIND_LINE = 800; // a little below the top of her head
const BehindView: React.FC<{b: BehindWord}> = ({b}) => {
  const t = useT();
  if (t < b.start || t > b.end + 0.25) return null;
  const out = tween(t, b.end - 0.15, 0.25, EASE_IN);
  let top = BEHIND_LINE;
  const rows = [...b.lines].reverse().map((l) => {
    top -= l.size * 1.02;
    return {...l, top};
  });
  return (
    <AbsoluteFill style={{opacity: 1 - out, clipPath: `inset(0 0 ${1920 - BEHIND_LINE}px 0)`}}>
      {rows.map((l) => (
        <div key={l.text} style={{position: 'absolute', left: 0, right: 0, top: l.top, display: 'flex', justifyContent: 'center', gap: l.size * 0.08}}>
          {l.text.split('').map((ch, i) => {
            const p = popAt(t, l.at + i * 0.035);
            return (
              <span key={i} style={{fontFamily: l.serif ? SERIF : ANTON, fontStyle: l.serif ? 'italic' : 'normal', fontSize: l.size, lineHeight: 1, color: WHITE, textShadow: '0 18px 44px rgba(0,0,0,0.35)', display: 'inline-block', whiteSpace: 'pre', translate: `0 ${lerp(Math.min(1.05, p), BEHIND_LINE - l.top + 20, 0)}px`}}>
                {ch}
              </span>
            );
          })}
        </div>
      ))}
    </AbsoluteFill>
  );
};

/** End card: "Book a 1:1 call", then ₹99 rises from behind her head, then the pill turns gold with her closing line. */
const CtaBehind: React.FC<{c: Cta}> = ({c}) => {
  const t = useT();
  if (t < c.priceAt) return null;
  const size = 400;
  return (
    <AbsoluteFill style={{clipPath: `inset(0 0 ${1920 - BEHIND_LINE}px 0)`}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: BEHIND_LINE - size * 1.0, display: 'flex', justifyContent: 'center', alignItems: 'flex-end'}}>
        {c.price.split('').map((ch, i) => {
          const p = popAt(t, c.priceAt + i * 0.07);
          const rupee = ch === '₹';
          return (
            <span key={i} style={{fontFamily: rupee ? SANS : c.grot ? GROT : ANTON, fontWeight: rupee || c.grot ? 800 : 400, letterSpacing: c.grot ? -12 : 0, fontSize: rupee ? size * 0.62 : size, lineHeight: 1, color: WHITE, textShadow: '0 20px 50px rgba(0,0,0,0.35)', display: 'inline-block', marginRight: rupee ? 10 : 0, marginBottom: rupee ? size * 0.12 : 0, translate: `0 ${lerp(Math.min(1.06, p), size + 60, 0)}px`}}>
              {ch}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
const CtaFront: React.FC<{c: Cta}> = ({c}) => {
  const t = useT();
  if (t < c.bookAt) return null;
  const k = popAt(t, c.bookAt);
  const tap = t >= c.tapAt;
  const kt = popAt(t, c.tapAt);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 290, display: 'flex', justifyContent: 'center'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '16px 38px', borderRadius: 999, background: tap ? c.color ?? ACCENT : '#FFFFFF', boxShadow: shadow, fontFamily: SANS, fontWeight: 800, fontSize: 50, color: INK, whiteSpace: 'nowrap', scale: tap ? lerp(Math.min(1.05, kt), 0.8, 1) : lerp(Math.min(1.05, k), 0.5, 1), opacity: Math.min(1, k * 3)}}>
          {tap ? (
            <>
              {c.closing}
              <span style={{width: 50, height: 50, borderRadius: '50%', background: INK, color: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34}}>→</span>
            </>
          ) : (
            'Book a 1:1 call with me'
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** "My client went from this to this": two photo slots (PLACEHOLDERS until the client photos come in)
 *  with hypothetical figures. */
const Slot: React.FC<{label: string; k: number; good?: boolean; children?: React.ReactNode}> = ({label, k, good, children}) => (
  <div style={{position: 'relative', width: 400, height: 470, borderRadius: 28, overflow: 'hidden', background: 'linear-gradient(180deg, #D9D6D0, #C5C1BA)', boxShadow: '0 22px 44px -18px rgba(0,0,0,0.55)', border: '6px solid #FFFFFF', boxSizing: 'border-box', scale: lerp(Math.min(1.05, k), 0.6, 1), opacity: Math.min(1, k * 3)}}>
    <svg width={388} height={458} viewBox="0 0 388 458" style={{position: 'absolute', inset: 0}}>
      <circle cx={194} cy={170} r={70} fill="#ABA69E" />
      <path d="M64 458 C64 330 120 270 194 270 C268 270 324 330 324 458 Z" fill="#ABA69E" />
    </svg>
    <span style={{position: 'absolute', left: 0, right: 0, top: 26, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 22, letterSpacing: 4, color: '#6F6A62'}}>CLIENT PHOTO</span>
    <div style={{position: 'absolute', left: 18, top: 62, padding: '6px 18px', borderRadius: 999, background: good ? GREEN : INK, color: WHITE, fontFamily: SANS, fontWeight: 800, fontSize: 30}}>{label}</div>
    {children}
  </div>
);
const BeforeAfterView: React.FC<{b: BeforeAfter}> = ({b}) => {
  const t = useT();
  const o = vis(t, b);
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 285, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22}}>
        <Slot label={b.before} k={popAt(t, b.beforeAt)} />
        <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 70, color: WHITE, ...outline(70), opacity: tween(t, b.afterAt, 0.2)}}>→</span>
        <Slot label={b.after} k={popAt(t, b.afterAt)} good>
          <div style={{position: 'absolute', left: 16, right: 16, bottom: 18, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center'}}>
            {b.stats.map((s, i) => {
              const k = popAt(t, b.statsAt + i * 0.12);
              return t >= b.statsAt + i * 0.12 ? (
                <div key={s} style={{padding: '8px 22px', borderRadius: 999, background: GREEN, color: WHITE, fontFamily: SANS, fontWeight: 800, fontSize: 40, whiteSpace: 'nowrap', scale: lerp(Math.min(1.05, k), 0.5, 1)}}>{s}</div>
              ) : null;
            })}
          </div>
        </Slot>
      </div>
    </AbsoluteFill>
  );
};

/** Captions for ads: bold sans with a dark outline (read with the sound off, over a light wall), in the
 *  safe zone just above her head; they step aside while a graphic is up. */
const AdCaps: React.FC<{cfg: ReelConfig; hide: Win[]; mix?: boolean}> = ({cfg, hide, mix}) => {
  const t = useT();
  // a graphic fades out for ~0.3 s after its window: captions wait for that
  const wins = hide.map((w) => ({start: w.start - 0.05, end: w.end + 0.35}));
  if (inWin(t, wins)) return null;
  const CH = cfg.captions as {text: string; start: number; end: number}[][];
  const chunk = chunkAt(CH, t);
  if (!chunk) return null;
  // the stretch this chunk is actually on screen (after any graphic it starts under, until the next one or
  // the next chunk); a chunk that would only flash for a moment is not shown at all
  let vs = chunk[0].start - 0.04;
  for (const w of wins) if (vs >= w.start && vs < w.end) vs = w.end;
  const ci = CH.indexOf(chunk);
  let ve = Math.min(chunk[chunk.length - 1].end + 0.6, CH[ci + 1] ? CH[ci + 1][0].start - 0.04 : 1e9);
  for (const w of wins) if (w.start > vs && w.start < ve) ve = w.start;
  if (ve - vs < 0.55) return null;
  const k = tween(t, vs, 0.12);
  return (
    <div style={{position: 'absolute', left: 50, right: 50, top: 640, textAlign: 'center', opacity: k, translate: `0 ${lerp(k, 8, 0)}px`}}>
      {mix ? (
        <MixLine words={chunk} size={70} t={t} />
      ) : (
        <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 74, lineHeight: 1.1, color: WHITE, WebkitTextStroke: '7px rgba(10,10,10,0.9)', paintOrder: 'stroke fill', textShadow: '0 4px 20px rgba(0,0,0,0.75), 0 1px 4px rgba(0,0,0,0.8)', whiteSpace: 'nowrap'}}>{chunk.map((w) => w.text).join(' ')}</span>
      )}
    </div>
  );
};

/** Windows where a graphic sits above her head: captions step aside there. */
export const graphicWins = (a: AdConfig): Win[] => [
  ...a.pills,
  ...(a.counter ? [a.counter] : []),
  ...(a.badge ? [a.badge] : []),
  ...(a.behind ? [a.behind] : []),
  ...(a.beforeAfter ? [a.beforeAfter] : []),
  ...(a.women ? [a.women] : []),
  ...(a.logo ? [a.logo] : []),
  ...(a.cards ? [a.cards] : []),
  ...(a.neon ? [a.neon] : []),
  ...(a.free ? [a.free] : []),
  ...(a.freeType ? [a.freeType] : []),
  ...(a.search ? [a.search] : []),
  ...a.cuts.filter((c) => c.line),
  {start: a.cta.bookAt - 0.05, end: 9999},
];

export const AdReel: React.FC<{a: AdConfig}> = ({a}) => {
  const {cfg} = a;
  const scene = (
    <>
      <ZoomBlur w={a.zoom}>
        {a.dolly ? (
          <Dolly win={a.dolly}>
            <Footage cfg={cfg} />
          </Dolly>
        ) : (
          <Footage cfg={cfg} />
        )}
        <GradeOverlay cfg={cfg} />
        {a.behind ? <BehindView b={a.behind} /> : null}
        <CtaBehind c={a.cta} />
        <Subject cfg={cfg} />
      </ZoomBlur>
      {a.pills.map((g, i) => (
        <Pills key={i} g={g} mix={a.mix} />
      ))}
      {a.counter ? <CounterView c={a.counter} /> : null}
      {a.beforeAfter ? <BeforeAfterView b={a.beforeAfter} /> : null}
      {a.free ? <FreePile f={a.free} /> : null}
      {a.freeType ? <FreeTypeView f={a.freeType} /> : null}
      {a.women ? <WomenWall w={a.women} /> : null}
      {a.logo ? <LogoReveal l={a.logo} /> : null}
      {a.cards ? <Cards c={a.cards} /> : null}
      <Cutaways cuts={a.cuts} tm={a.tm} dir={cfg.dir} chain />
      {a.search ? <SearchBar s={a.search} /> : null}
      {a.neon ? <NeonSign n={a.neon} /> : null}
      {a.badge ? <BadgeView b={a.badge} /> : null}
      <CtaFront c={a.cta} />
      <AdCaps cfg={cfg} hide={graphicWins(a)} mix={a.mix} />
      {a.testimonial ? <TestimonialInsert tm={a.tm} c={a.testimonial} /> : null}
    </>
  );
  return <Base cfg={cfg}>{scene}</Base>;
};
