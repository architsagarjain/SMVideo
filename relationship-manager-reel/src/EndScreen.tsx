import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import layers from '../public/endscreen/layers.json';
import {easeInOut, lerp, progress} from './anim';
import {ES_DISSOLVE, ES_START, FPS, TOTAL} from './timeline';

type Box = {x: number; y: number; w: number; h: number};
const L = layers as Record<string, Box>;
const src = (name: string) => staticFile(`endscreen/${name}.png`);

// Reveal schedule, seconds after ES_START. The plate (background, florals, family
// photograph) arrives with the dissolve; the artwork's own elements follow in reading
// order. Every element is the original artwork's pixels; nothing is redrawn.
const AT = {
  logo: 0.32,
  divider: 0.62,
  headline1: 0.72,
  headline2: 0.92,
  subhead: 1.32,
  feature1: 1.66,
  feature2: 1.78,
  feature3: 1.9,
  cta: 2.1,
  sheen: 2.85,
  original: 3.25,
};

const Layer: React.FC<{name: string; style?: React.CSSProperties}> = ({name, style}) => {
  const b = L[name];
  return <Img src={src(name)} style={{position: 'absolute', left: b.x, top: b.y, width: b.w, height: b.h, ...style}} />;
};

/** Fade + small rise. */
const Rise: React.FC<{name: string; t: number; at: number; dist?: number; dur?: number}> = ({name, t, at, dist = 14, dur = 0.7}) => {
  const k = progress(t, at, dur);
  return <Layer name={name} style={{opacity: k, transform: `translateY(${(1 - k) * dist}px)`}} />;
};

/** Headline line revealed upward from behind its own baseline (mask reveal). */
const MaskReveal: React.FC<{name: string; t: number; at: number}> = ({name, t, at}) => {
  const b = L[name];
  const k = progress(t, at, 0.85);
  return (
    <div style={{position: 'absolute', left: b.x, top: b.y, width: b.w, height: b.h, overflow: 'hidden'}}>
      <Img
        src={src(name)}
        style={{width: b.w, height: b.h, opacity: Math.min(1, k * 1.6), transform: `translateY(${(1 - k) * 62}%)`}}
      />
    </div>
  );
};

export const EndScreen: React.FC = () => {
  const t = useCurrentFrame() / FPS - ES_START;
  if (t < 0) return null;

  const fadeIn = progress(t, 0, ES_DISSOLVE, easeInOut);
  // A very gentle, continuous camera push-in over the whole card (uniform scale only).
  const push = 1 + 0.028 * lerp(t, [0, TOTAL - ES_START], [0, 1], easeInOut);

  const logoK = progress(t, AT.logo, 0.8);
  const dividerK = progress(t, AT.divider, 0.6);
  const ctaK = progress(t, AT.cta, 0.7);
  const sheenK = progress(t, AT.sheen, 0.9, easeInOut);
  const cta = L.cta;

  return (
    <AbsoluteFill style={{opacity: fadeIn}}>
      <AbsoluteFill style={{transform: `scale(${push})`, transformOrigin: '50% 42%'}}>
        <Img src={src('plate')} style={{position: 'absolute', inset: 0, width: 1080, height: 1920}} />

        <Layer name="logo" style={{opacity: logoK, transform: `translateY(${(1 - logoK) * 16}px) scale(${0.975 + 0.025 * logoK})`}} />
        <Layer name="divider" style={{opacity: dividerK, transform: `scaleX(${0.4 + 0.6 * dividerK})`}} />
        <MaskReveal name="headline1" t={t} at={AT.headline1} />
        <MaskReveal name="headline2" t={t} at={AT.headline2} />
        <Rise name="subhead" t={t} at={AT.subhead} dist={12} />
        <Rise name="feature1" t={t} at={AT.feature1} dist={12} dur={0.6} />
        <Rise name="rule1" t={t} at={AT.feature2 - 0.06} dist={0} dur={0.6} />
        <Rise name="feature2" t={t} at={AT.feature2} dist={12} dur={0.6} />
        <Rise name="rule2" t={t} at={AT.feature3 - 0.06} dist={0} dur={0.6} />
        <Rise name="feature3" t={t} at={AT.feature3} dist={12} dur={0.6} />

        {/* CTA: restrained scale-in, then one soft light pass across the pill. */}
        <Layer name="cta" style={{opacity: Math.min(1, ctaK * 1.8), transform: `scale(${0.93 + 0.07 * ctaK})`, transformOrigin: 'center'}} />
        {sheenK > 0 && sheenK < 1 ? (
          <div
            style={{
              position: 'absolute',
              left: cta.x,
              top: cta.y,
              width: cta.w,
              height: cta.h,
              WebkitMaskImage: `url(${src('cta')})`,
              WebkitMaskSize: '100% 100%',
              maskImage: `url(${src('cta')})`,
              maskSize: '100% 100%',
              background: `linear-gradient(105deg, rgba(255,255,255,0) ${sheenK * 140 - 40}%, rgba(255,236,214,0.30) ${sheenK * 140 - 22}%, rgba(255,255,255,0) ${sheenK * 140 - 4}%)`,
              mixBlendMode: 'screen',
            }}
          />
        ) : null}

        {/* Once everything has settled, the untouched original artwork takes over, so the
            held frame is exactly the supplied design (the cross-fade is invisible because
            the layers already reproduce it). */}
        <Img
          src={src('full')}
          style={{position: 'absolute', inset: 0, width: 1080, height: 1920, opacity: progress(t, AT.original, 0.35, easeInOut)}}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
