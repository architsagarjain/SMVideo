import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from 'remotion';
import { useBrandFonts } from '../components/Fonts';
import { Grain, Vignette } from '../components/Overlays';
import { Subtitles, Cue } from '../components/Subtitles';
import { Logo } from '../components/Logo';
import { MapCanvas } from '../components/MapCanvas';
import { nodes, edges, CITY_COUNT } from '../components/graph';
import { lerp, E } from '../lib';
import { Label, Slam } from '../components/Type';
import { C, F } from '../theme';

export type ReelData = { reel: string; offset: number; frames: number; words: { w: string; s: number; e: number }[]; cues: Cue[] };

/** Shared reel shell: brand background, grain, vignette, word-lit subtitles, the reel's mix. */
export const ReelShell: React.FC<{ data: ReelData; endAt: number; children: React.ReactNode }> = ({ data, endAt, children }) => {
  useBrandFonts();
  const cues = data.cues.filter((c) => c.s < endAt).map((c) => ({ ...c, e: Math.min(c.e, endAt) }));
  return (
    <AbsoluteFill style={{ background: C.night }}>
      <Audio src={staticFile(`audio/${data.reel}_mix.wav`)} />
      {children}
      <Vignette strength={0.45} />
      <Grain opacity={0.06} />
      <Subtitles cues={cues} />
    </AbsoluteFill>
  );
};

/** Deep forest backdrop with a faint moving grid, for graphic scenes. */
export const BrandBg: React.FC<{ grid?: boolean }> = ({ grid = true }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 110% 75% at 50% 38%, #0B4A31 0%, ${C.forest} 38%, #03180F 100%)` }}>
      {grid && (
        <AbsoluteFill
          style={{
            opacity: 0.35,
            backgroundImage: 'linear-gradient(rgba(232,176,75,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(232,176,75,0.10) 1px, transparent 1px)',
            backgroundSize: '90px 90px', backgroundPosition: `0px ${f * 0.6}px`,
            WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 45%, #000 20%, transparent 80%)',
          }}
        />
      )}
    </AbsoluteFill>
  );
};

/** End card: official logo with descriptor and the domain; optional fine-print line. */
export const EndCard: React.FC<{ at: number; note?: string; logo?: boolean; bg?: boolean }> = ({ at, note, logo = true, bg = true }) => {
  const f = useCurrentFrame();
  if (f < at - 2) return null;
  const t = (d: number) => lerp(f, [at + d, at + d + 14], [0, 1], E.out);
  return (
    <AbsoluteFill>
      {bg && <AbsoluteFill style={{ opacity: lerp(f, [at - 2, at + 8], [0, 1]), background: `radial-gradient(ellipse 100% 70% at 50% 42%, #0A5034 0%, ${C.forest} 45%, #032116 100%)` }} />}
      {bg && <AbsoluteFill style={{ opacity: 0.12 * t(0), mixBlendMode: 'screen' }}>
        <MapCanvas
          cam={{ cx: 480, cy: 560, zoom: 1.05, tilt: 0, rot: 0, oy: 0 }}
          draw={({ P, line, glow }) => {
            for (const [a, b] of edges) { const A = P(nodes[a][0], nodes[a][1]), B = P(nodes[b][0], nodes[b][1]); line([A[0], A[1]], [B[0], B[1]], 'rgba(232,176,75,1)', 0.8, 1.2); }
            nodes.forEach((n, i) => { const [x, y] = P(n[0], n[1]); glow(x, y, i < CITY_COUNT ? 12 : 6, 'rgba(232,176,75,1)', 0.9); });
          }}
        />
      </AbsoluteFill>}
      {logo && (
        <div style={{ position: 'absolute', left: 120, top: 760, width: 840 }}>
          <Logo id={`end${at}`} at={at} width={840} desc mode="settle" />
        </div>
      )}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1040, textAlign: 'center', fontFamily: F.label, fontWeight: 600, fontSize: 34, letterSpacing: '0.12em', color: C.lightOchre, opacity: t(18) }}>indiabiomass.com</div>
      {note && <div style={{ position: 'absolute', left: 120, right: 120, top: 1290, textAlign: 'center', fontFamily: F.text, fontSize: 24, lineHeight: 1.4, color: 'rgba(255,255,255,0.55)', opacity: t(24) }}>{note}</div>}
    </AbsoluteFill>
  );
};

/** Word time helper: frame at which the n-th occurrence of a word starts. */
export const wordAt = (data: ReelData, w: string, nth = 0) => {
  const norm = (t: string) => t.toLowerCase().replace(/[^a-z0-9%.\-]/g, '').replace(/\.$/, '');
  const hits = data.words.filter((x) => norm(x.w) === norm(w));
  if (!hits[nth]) throw new Error(`word not found: ${w}#${nth}`);
  return hits[nth].s;
};

/** Centred section title: small spaced label + big wipe-in headline (the reels' one alignment system). */
export const CenterTitle: React.FC<{ label?: string; text: string; at: number; out: number; size?: number; color?: string; top?: number }> = ({ label, text, at, out, size = 104, color = '#fff', top = 300 }) => {
  const f = useCurrentFrame();
  const o = lerp(f, [out - 8, out], [1, 0]);
  return (
    <div style={{ position: 'absolute', left: 60, right: 60, top, textAlign: 'center', opacity: o }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <Label text={label} at={at - 4} color={C.harvest} size={26} rule={false} />
        </div>
      )}
      <Slam text={text} at={at} out={out + 40} size={size} color={color} />
    </div>
  );
};

export const Glass: React.FC<{ style?: React.CSSProperties; children?: React.ReactNode }> = ({ style, children }) => (
  <div style={{ background: 'rgba(5,26,17,0.78)', border: '1.5px solid rgba(232,176,75,0.32)', borderRadius: 30, boxShadow: '0 30px 90px rgba(0,0,0,0.5)', ...style }}>{children}</div>
);
