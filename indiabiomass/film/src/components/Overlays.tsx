import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';

/** Animated film grain from pre-generated noise tiles. */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.07 }) => {
  const f = useCurrentFrame();
  const tile = f % 4;
  const ox = ((f * 137) % 512) - 512;
  const oy = ((f * 241) % 512) - 512;
  return (
    <AbsoluteFill style={{ mixBlendMode: 'overlay', opacity, pointerEvents: 'none', overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute', left: ox, top: oy, width: 1080 + 1024, height: 1920 + 1024,
          backgroundImage: `url(${staticFile(`grain${tile}.png`)})`, backgroundSize: '512px 512px',
        }}
      />
    </AbsoluteFill>
  );
};

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.55 }) => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      background: `radial-gradient(ellipse 85% 70% at 50% 48%, rgba(0,0,0,0) 55%, rgba(0,0,0,${strength}) 100%)`,
    }}
  />
);

export const Fill: React.FC<{ color: string; opacity?: number; blend?: string }> = ({ color, opacity = 1, blend }) => (
  <AbsoluteFill style={{ background: color, opacity, mixBlendMode: blend as any }} />
);

export { Img, staticFile };
