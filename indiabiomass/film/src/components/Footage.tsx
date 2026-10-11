import { AbsoluteFill, OffthreadVideo, Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { lerp, E } from '../lib';

export type Grade = 'warm' | 'golden' | 'neutral' | 'cool' | 'industrial' | 'none';

const GRADES: Record<Grade, string> = {
  warm: 'contrast(1.08) saturate(1.05) sepia(0.12) brightness(1.0)',
  golden: 'contrast(1.12) saturate(1.12) sepia(0.22) brightness(1.02)',
  neutral: 'contrast(1.05) saturate(0.98)',
  cool: 'contrast(1.1) saturate(0.85) hue-rotate(-6deg)',
  industrial: 'contrast(1.15) saturate(0.8) sepia(0.12) brightness(0.92)',
  none: 'none',
};

/**
 * A pre-cropped 9:16 clip (see scripts/prep_footage.sh) with a slow camera move.
 * `from`/`to` are [scale, x, y] keyframes across the clip's local duration.
 */
export const Footage: React.FC<{
  src: string;
  dur: number; // frames this layer lasts (for the move)
  startFrom?: number; // frames into the clip
  rate?: number;
  from?: [number, number, number];
  to?: [number, number, number];
  grade?: Grade;
  still?: boolean;
  style?: React.CSSProperties;
}> = ({ src, dur, startFrom = 0, rate = 1, from = [1.04, 0, 0], to = [1.12, 0, 0], grade = 'warm', still, style }) => {
  const f = useCurrentFrame();
  const t = lerp(f, [0, dur], [0, 1], E.soft);
  const s = from[0] + (to[0] - from[0]) * t;
  const x = from[1] + (to[1] - from[1]) * t;
  const y = from[2] + (to[2] - from[2]) * t;
  const media = still ? (
    <Img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
  ) : (
    <OffthreadVideo
      src={staticFile(src)}
      startFrom={startFrom}
      playbackRate={rate}
      muted
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
  );
  return (
    <AbsoluteFill style={{ overflow: 'hidden', ...style }}>
      <AbsoluteFill style={{ transform: `translate(${x}px, ${y}px) scale(${s})`, filter: GRADES[grade] }}>{media}</AbsoluteFill>
    </AbsoluteFill>
  );
};
