import { useCurrentFrame } from 'remotion';
import { F, C } from '../theme';
import { rng, lerp } from '../lib';

/** Floating, disconnected scraps of trade information (no real figures). */
type Kind = 'tender' | 'price' | 'pin' | 'date' | 'doc';
const KINDS: Kind[] = ['tender', 'price', 'pin', 'doc', 'date', 'pin', 'price', 'tender', 'pin', 'doc', 'date', 'pin'];

const Frag: React.FC<{ kind: Kind }> = ({ kind }) => {
  const base: React.CSSProperties = { fontFamily: F.label, color: C.ink, background: 'rgba(247,246,242,0.94)', borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.35)' };
  if (kind === 'tender')
    return (
      <div style={{ ...base, width: 250, padding: '16px 18px' }}>
        <div style={{ fontSize: 15, letterSpacing: '0.16em', color: C.ochre, fontWeight: 600 }}>TENDER NOTICE</div>
        <div style={{ height: 10, width: 190, background: C.line, borderRadius: 5, marginTop: 12 }} />
        <div style={{ height: 10, width: 150, background: C.line, borderRadius: 5, marginTop: 8 }} />
        <div style={{ fontSize: 14, marginTop: 12, color: C.slate }}>Closes: ——</div>
      </div>
    );
  if (kind === 'price')
    return (
      <div style={{ ...base, padding: '12px 18px', fontFamily: F.label, fontWeight: 700, fontSize: 30 }}>
        ₹ <span style={{ color: C.slate }}>? </span><span style={{ fontSize: 18, color: C.slate }}>/ MT</span>
      </div>
    );
  if (kind === 'date')
    return (
      <div style={{ ...base, padding: '10px 16px', fontSize: 16, letterSpacing: '0.12em', fontWeight: 600, color: '#B3261E', background: 'rgba(250,228,226,0.95)' }}>
        DEADLINE MISSED
      </div>
    );
  if (kind === 'doc')
    return (
      <div style={{ ...base, width: 120, height: 150, padding: 14 }}>
        {[80, 60, 86, 50, 70].map((w, i) => (
          <div key={i} style={{ height: 7, width: w, background: C.line, borderRadius: 4, marginTop: i ? 9 : 4 }} />
        ))}
      </div>
    );
  return (
    <svg width="54" height="70" viewBox="0 0 54 70">
      <path d="M27 2C13 2 3 12 3 26c0 18 24 42 24 42s24-24 24-42C51 12 41 2 27 2z" fill={C.harvest} />
      <circle cx="27" cy="26" r="8" fill={C.ink} />
    </svg>
  );
};

export const Fragments: React.FC<{ start: number; end: number; seed?: number }> = ({ start, end, seed = 9 }) => {
  const f = useCurrentFrame();
  const r = rng(seed);
  const items = KINDS.map((k, i) => ({
    k, x: 60 + r() * 880, y: 380 + r() * 980, vx: (r() - 0.5) * 2.4, vy: (r() - 0.5) * 1.6, rot: (r() - 0.5) * 24, vr: (r() - 0.5) * 0.5,
    z: 0.55 + r() * 0.6, in: start + 8 + i * 9 + r() * 6, life: 70 + r() * 70,
  }));
  return (
    <>
      {items.map((it, i) => {
        const age = f - it.in;
        if (age < 0 || f > end) return null;
        const a = lerp(age, [0, 10, it.life - 20, it.life], [0, 1, 1, 0]);
        const sink = lerp(age, [it.life - 30, it.life], [0, 1]); // falls away into darkness
        return (
          <div
            key={i}
            style={{
              position: 'absolute', left: it.x + it.vx * age, top: it.y + it.vy * age,
              transform: `translate(-50%,-50%) rotate(${it.rot + it.vr * age}deg) scale(${it.z * (1 - sink * 0.35)})`,
              opacity: a * (0.6 + it.z * 0.4), filter: `blur(${(1.15 - it.z) * 3 + sink * 8}px)`,
            }}
          >
            <Frag kind={it.k} />
          </div>
        );
      })}
    </>
  );
};
