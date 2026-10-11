import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { Genesis, Digitise } from '../components/Genesis';
import { Footage } from '../components/Footage';
import { Kinetic } from '../components/Type';
import { clip } from '../clips';
import { lerp, E } from '../lib';

// 00:00-00:06  "India has biomass. Plenty of it."
export const S1Hook: React.FC = () => {
  const f = useCurrentFrame();
  const REVEAL = 78;
  const iris = lerp(f, [REVEAL, REVEAL + 16], [0, 1500], E.in);
  const flash = lerp(f, [REVEAL + 2, REVEAL + 8, REVEAL + 26], [0, 0.85, 0], E.soft);
  const bloom = lerp(f, [REVEAL - 6, REVEAL + 10], [0, 1]);
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {/* the field, revealed through an expanding iris from the particle core */}
      <AbsoluteFill style={{ WebkitMaskImage: `radial-gradient(circle at 50% 50%, #000 ${iris * 0.8}px, transparent ${iris}px)` }}>
        <Sequence from={REVEAL} durationInFrames={44}>
          <Footage src={clip('s1_aerial')} dur={44} from={[1.35, 0, 0]} to={[1.08, 0, 30]} grade="golden" />
        </Sequence>
        <Sequence from={REVEAL + 44} durationInFrames={24}>
          <Footage src={clip('s1_straw')} dur={24} from={[1.08, 0, 0]} to={[1.16, -20, 0]} grade="golden" />
        </Sequence>
        <Sequence from={REVEAL + 68} durationInFrames={18}>
          <Footage src={clip('s1_hand')} dur={18} from={[1.1, 0, 0]} to={[1.18, 0, -10]} grade="golden" />
        </Sequence>
        <Sequence from={REVEAL + 86} durationInFrames={20}>
          <Footage src={clip('s1_overhead')} dur={20} from={[1.05, 0, 0]} to={[1.35, 0, 0]} grade="golden" />
        </Sequence>
      </AbsoluteFill>
      <Digitise start={REVEAL + 40} dur={70} />
      <Genesis split={10} launch={44} bloom={bloom} />
      <AbsoluteFill style={{ background: 'radial-gradient(circle at 50% 50%, rgba(255,236,200,1) 0%, rgba(255,200,120,0.6) 35%, rgba(255,180,90,0) 70%)', opacity: flash, mixBlendMode: 'screen' }} />
      {/* readability wash behind the headline */}
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(4,20,12,0.78) 0%, rgba(4,20,12,0.5) 22%, rgba(4,20,12,0.12) 42%, rgba(0,0,0,0) 55%)', opacity: lerp(f, [100, 112, 170, 180], [0, 1, 1, 0]) }} />
      <div style={{ position: 'absolute', left: 60, right: 60, top: 330 }}>
        <Kinetic lines={['AN INDUSTRY OF', 'POSSIBILITIES.']} at={104} out={170} size={92} sweep stagger={1.1} />
      </div>
    </AbsoluteFill>
  );
};
