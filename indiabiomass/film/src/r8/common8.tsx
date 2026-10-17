import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { useBrandFonts } from '../components/Fonts';
import { Grain, Vignette } from '../components/Overlays';
import { Footage, Grade } from '../components/Footage';
import { Cue } from '../components/Subtitles';
import { Logo } from '../components/Logo';
import { lerp, E } from '../lib';
import { C, F } from '../theme';

// Shared parts for the eight reels in film/src/r8. Layout grid (1080x1920, all centred):
// top title band y 200-560, main visual 600-1330, subtitles 1430, safe bottom 1640.
export type R8Word = { w: string; li: number; s: number; e: number };
export type R8Line = { i: number; t: string; s: number; e: number };
export type R8Data = { reel: string; offset: number; frames: number; words: R8Word[]; lines: R8Line[]; cues: Cue[] };

const norm = (t: string) => t.toLowerCase().replace(/[^a-z0-9%\-]/g, '');
/** Timing helpers bound to one reel's data: line start/end and word start frames. */
export const timing = (d: R8Data) => ({
  L: (i: number) => d.lines[i].s,
  Le: (i: number) => d.lines[i].e,
  W: (w: string, nth = 0, fromLine = 0) => {
    const hits = d.words.filter((x) => x.li >= fromLine && norm(x.w) === norm(w));
    if (!hits[nth]) throw new Error(`${d.reel}: word not found ${w}#${nth} from line ${fromLine}`);
    return hits[nth].s;
  },
  END: d.words[d.words.length - 1].e + 10,
});

/** Audio, subtitles, grain/vignette. `plate` gives the captions a dark backing (for light reels). */
export const Shell8: React.FC<{ d: R8Data; children: React.ReactNode; bg?: string; plate?: boolean; vignette?: number }> = ({ d, children, bg = C.night, plate, vignette = 0.42 }) => {
  useBrandFonts();
  const end = d.words[d.words.length - 1].e + 10;
  const cues = d.cues.filter((c) => c.s < end).map((c) => ({ ...c, e: Math.min(c.e, end) }));
  return (
    <AbsoluteFill style={{ background: bg }}>
      <Audio src={staticFile(`audio/${d.reel}_mix.wav`)} />
      {children}
      {vignette > 0 && <Vignette strength={vignette} />}
      <Grain opacity={0.05} />
      <Captions cues={cues} plate={plate} />
    </AbsoluteFill>
  );
};

/** Word-lit captions at y=1430 (same behaviour as the approved reels), optional dark plate. */
export const Captions: React.FC<{ cues: Cue[]; plate?: boolean }> = ({ cues, plate }) => {
  const f = useCurrentFrame();
  const cue = cues.find((c) => f >= c.s && f < c.e);
  if (!cue) return null;
  const tin = lerp(f, [cue.s, cue.s + 5], [0, 1], E.out);
  const tout = lerp(f, [cue.e - 4, cue.e], [1, 0]);
  const words = cue.t.split(' ');
  return (
    <div style={{ position: 'absolute', left: 90, right: 90, top: 1430, display: 'flex', justifyContent: 'center' }}>
      <div style={{ fontFamily: F.text, fontWeight: 600, fontSize: 46, lineHeight: 1.22, color: '#fff', textAlign: 'center', opacity: tin * tout,
        transform: `translateY(${(1 - tin) * 10}px)`, textShadow: plate ? 'none' : '0 2px 18px rgba(0,0,0,0.75), 0 0 3px rgba(0,0,0,0.6)',
        background: plate ? 'rgba(10,26,18,0.86)' : undefined, borderRadius: 18, padding: plate ? '10px 22px' : 0 }}>
        {words.map((w, i) => {
          const at = cue.w?.[i] ?? cue.s;
          const said = lerp(f, [at - 1, at + 3], [0, 1], E.out);
          const pop = lerp(f, [at - 1, at + 2, at + 9], [0, 1, 0], E.soft);
          return (
            <span key={i}>
              <span style={{ display: 'inline-block', opacity: 0.42 + 0.58 * said, transform: `translateY(${-4 * pop}px) scale(${1 + 0.06 * pop})` }}>{w}</span>
              {i < words.length - 1 ? ' ' : ''}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/** Visible between absolute frames [from, to) with a short crossfade; children get an absolute-frame clock. */
export const Span: React.FC<{ from: number; to: number; fade?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ from, to, fade = 8, children, style }) => {
  const f = useCurrentFrame();
  if (f < from - fade || f >= to + fade) return null;
  const o = Math.min(lerp(f, [from - fade, from], [0, 1]), lerp(f, [to, to + fade], [1, 0]));
  return <AbsoluteFill style={{ opacity: o, ...style }}>{children}</AbsoluteFill>;
};

/** Photo or clip from public/r8 with a slow camera move across [from, to). */
export const Media: React.FC<{ src: string; from: number; to: number; a?: [number, number, number]; b?: [number, number, number]; grade?: Grade; rate?: number; style?: React.CSSProperties }> = ({ src, from, to, a = [1.12, 0, 0], b = [1.02, 0, 0], grade = 'warm', rate = 1, style }) => {
  const still = /\.(jpe?g|png)$/i.test(src);
  // Footage runs on a local clock starting at `from`, so callers can stay in absolute frames
  return (
    <AbsoluteFill style={style}>
      <Offset by={from}>
        <Footage src={`r8/${src}`} dur={to - from} still={still} rate={rate} from={a} to={b} grade={grade} />
      </Offset>
    </AbsoluteFill>
  );
};

const Offset: React.FC<{ by: number; children: React.ReactNode }> = ({ by, children }) => <Sequence from={by} layout="none">{children}</Sequence>;

/** Dark gradient for legibility over footage. */
export const Shade: React.FC<{ top?: number; mid?: number; bottom?: number; tint?: string }> = ({ top = 0.75, mid = 0.15, bottom = 0.7, tint = '4,20,12' }) => (
  <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(${tint},${top}) 0%, rgba(${tint},${mid}) 36%, rgba(${tint},${mid}) 62%, rgba(${tint},${bottom}) 100%)` }} />
);

/** Big centred headline that rises in per word. */
export const Headline: React.FC<{ text: string; at: number; out?: number; top?: number; size?: number; color?: string; weight?: number; font?: string; lh?: number }> = ({ text, at, out = 1e9, top = 260, size = 92, color = '#fff', weight = 800, font = F.display, lh = 1.02 }) => {
  const f = useCurrentFrame();
  const o = lerp(f, [out, out + 8], [1, 0]);
  const lines = text.split('\n');
  let k = 0;
  return (
    <div style={{ position: 'absolute', left: 60, right: 60, top, textAlign: 'center', opacity: o, fontFamily: font, fontWeight: weight, fontSize: size, lineHeight: lh, letterSpacing: '-0.03em', color }}>
      {lines.map((ln, li) => (
        <div key={li}>
          {ln.split(' ').map((w, wi) => {
            const t = lerp(f, [at + k * 3, at + k++ * 3 + 12], [0, 1], E.out);
            return (
              <span key={wi} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', paddingBottom: size * 0.1, marginBottom: -size * 0.1 }}>
                <span style={{ display: 'inline-block', transform: `translateY(${(1 - t) * 100}%)`, opacity: t, textShadow: '0 4px 30px rgba(0,0,0,0.35)' }}>{w}&nbsp;</span>
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/** Small spaced-caps chip, centred. */
export const Chip: React.FC<{ text: string; at: number; out?: number; top: number; color?: string; bg?: string; border?: string; size?: number }> = ({ text, at, out = 1e9, top, color = C.harvest, bg = 'rgba(4,20,12,0.78)', border = 'rgba(232,176,75,0.55)', size = 26 }) => {
  const f = useCurrentFrame();
  const t = lerp(f, [at, at + 10], [0, 1], E.back) * lerp(f, [out, out + 8], [1, 0]);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top, display: 'flex', justifyContent: 'center', opacity: Math.min(1, t) }}>
      <div style={{ fontFamily: F.label, fontWeight: 600, fontSize: size, letterSpacing: '0.2em', color, background: bg, border: `1.5px solid ${border}`, borderRadius: 999, padding: '10px 26px', transform: `scale(${0.85 + 0.15 * t})` }}>{text}</div>
    </div>
  );
};

/** Rounded photo/clip window (for B-roll inside graphics). */
export const Frame: React.FC<{ src: string; from: number; to: number; x: number; y: number; w: number; h: number; r?: number; a?: [number, number, number]; b?: [number, number, number]; grade?: Grade; border?: string; at?: number }> = ({ src, from, to, x, y, w, h, r = 26, a, b, grade, border = 'rgba(232,176,75,0.5)', at }) => {
  const f = useCurrentFrame();
  const t = lerp(f, [at ?? from, (at ?? from) + 14], [0, 1], E.out);
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: r, overflow: 'hidden', border: `2px solid ${border}`, boxShadow: '0 30px 80px rgba(0,0,0,0.45)', opacity: t, transform: `translateY(${(1 - t) * 40}px) scale(${0.95 + 0.05 * t})` }}>
      <Media src={src} from={from} to={to} a={a} b={b} grade={grade} />
    </div>
  );
};

/** Brand moment: the logo settles exactly where the end card keeps it, so the hand-over is seamless. */
export const BrandLogo: React.FC<{ at: number; light?: boolean }> = ({ at, light }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: 120, top: 760, width: 840, opacity: lerp(f, [at - 4, at + 6], [0, 1]) }}>
      <Logo id={`r8brand${at}`} at={at} width={840} desc mode="settle" light={light ? C.forest : '#FFFFFF'} />
    </div>
  );
};

/** End card: the official logo with descriptor (already settled by BrandLogo) and the domain, on forest. */
export const End8: React.FC<{ at: number; light?: boolean; reveal?: boolean }> = ({ at, light, reveal }) => {
  const f = useCurrentFrame();
  if (f < at - 2) return null;
  const t = (dd: number) => lerp(f, [at + dd, at + dd + 14], [0, 1], E.out);
  return (
    <AbsoluteFill style={{ opacity: lerp(f, [at - 2, at + 8], [0, 1]), background: light ? C.paper : `radial-gradient(ellipse 100% 70% at 50% 42%, #0A5034 0%, ${C.forest} 45%, #032116 100%)` }}>
      <div style={{ position: 'absolute', left: 120, top: 760, width: 840 }}>
        <Logo id={`r8end${at}`} at={at} width={840} desc mode={reveal ? 'settle' : 'static'} light={light ? C.forest : '#FFFFFF'} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1040, textAlign: 'center', fontFamily: F.label, fontWeight: 600, fontSize: 34, letterSpacing: '0.12em', color: light ? C.ochre : C.lightOchre, opacity: t(18) }}>indiabiomass.com</div>
    </AbsoluteFill>
  );
};
