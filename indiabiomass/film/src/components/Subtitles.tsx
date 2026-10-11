import { useCurrentFrame } from 'remotion';
import { F, C } from '../theme';
import { lerp, E } from '../lib';

export type Cue = { s: number; e: number; t: string; hl?: string[]; w?: number[] };

/**
 * Burned-in captions: short phrases, bottom-centre, above platform UI
 * (centred ~y=1475, inside the 9:16 safe zone). Words light up as they are
 * spoken (from the narration's word timings); key words turn Harvest.
 */
export const Subtitles: React.FC<{ cues: Cue[] }> = ({ cues }) => {
  const f = useCurrentFrame();
  const cue = cues.find((c) => f >= c.s && f < c.e);
  if (!cue) return null;
  const tin = lerp(f, [cue.s, cue.s + 5], [0, 1], E.out);
  const tout = lerp(f, [cue.e - 4, cue.e], [1, 0]);
  const words = cue.t.split(' ');
  return (
    <div style={{ position: 'absolute', left: 100, right: 100, top: 1430, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
      <div
        style={{
          fontFamily: F.text, fontWeight: 600, fontSize: 46, lineHeight: 1.22, color: '#fff', textAlign: 'center',
          opacity: tin * tout, transform: `translateY(${(1 - tin) * 10}px)`,
          textShadow: '0 2px 18px rgba(0,0,0,0.75), 0 0 3px rgba(0,0,0,0.6)', letterSpacing: '-0.005em',
        }}
      >
        {words.map((w, i) => {
          const bare = w.replace(/[.,:?]/g, '');
          const key = cue.hl?.some((h) => bare === h);
          const at = cue.w?.[i] ?? cue.s;
          const said = lerp(f, [at - 1, at + 3], [0, 1], E.out); // the word lights as it is spoken
          const pop = lerp(f, [at - 1, at + 2, at + 9], [0, 1, 0], E.soft);
          return (
            <span key={i}>
              <span
                style={{
                  display: 'inline-block',
                  opacity: 0.42 + 0.58 * said,
                  color: key && said > 0.5 ? C.harvest : undefined,
                  transform: `translateY(${-4 * pop}px) scale(${1 + 0.06 * pop})`,
                }}
              >
                {w}
              </span>
              {i < words.length - 1 ? ' ' : ''}
            </span>
          );
        })}
      </div>
    </div>
  );
};
