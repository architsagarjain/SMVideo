import { useCurrentFrame } from 'remotion';
import { F, C } from '../theme';
import { lerp, E } from '../lib';

export type Cue = { s: number; e: number; t: string; hl?: string[] };

/**
 * Burned-in captions: short phrases, bottom-centre, above platform UI
 * (centred ~y=1475, inside the 9:16 safe zone). Highlight words are Harvest.
 */
export const Subtitles: React.FC<{ cues: Cue[] }> = ({ cues }) => {
  const f = useCurrentFrame();
  const cue = cues.find((c) => f >= c.s && f < c.e);
  if (!cue) return null;
  const tin = lerp(f, [cue.s, cue.s + 5], [0, 1], E.out);
  const tout = lerp(f, [cue.e - 4, cue.e], [1, 0]);
  const words = cue.t.split(' ');
  return (
    <div style={{ position: 'absolute', left: 110, right: 110, top: 1430, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
      <div
        style={{
          fontFamily: F.text, fontWeight: 600, fontSize: 46, lineHeight: 1.22, color: '#fff', textAlign: 'center',
          opacity: tin * tout, transform: `translateY(${(1 - tin) * 10}px)`,
          textShadow: '0 2px 18px rgba(0,0,0,0.75), 0 0 3px rgba(0,0,0,0.6)', letterSpacing: '-0.005em',
        }}
      >
        {words.map((w, i) => {
          const bare = w.replace(/[.,:?]/g, '');
          const hl = cue.hl?.some((h) => bare === h);
          return (
            <span key={i} style={{ color: hl ? C.harvest : undefined }}>
              {w}
              {i < words.length - 1 ? ' ' : ''}
            </span>
          );
        })}
      </div>
    </div>
  );
};
