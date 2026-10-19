import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { totalFrames, Shell8, timing, R8Data, Span, Media, Headline } from '../r8/common8';
import { r9, BrandBeat, Icon, Tag } from './common9';
import { lerp, E } from '../lib';
import { C, F } from '../theme';
import data from '../data/r9/v11.json';

// Video 11 · Four red flags in a biomass deal. Look: red alert. Near-black and signal red; a red flag plants
// into the frame for each warning with a 1/4 to 4/4 counter, then a green VERIFY stamp (kept straight).
const D = data as unknown as R8Data;
const { L, W, FIN } = timing(D);
const BLACK = '#0E0A0A', RED = '#E03A2F', GREEN = '#2FAE6B';
const FLAGS = [
  { k: 'NO SPECS\nIN WRITING', src: 'V11_1.mp4', at: L(1) },
  { k: 'A PRICE FAR\nBELOW EVERYONE', src: 'V11_2.mp4', at: L(2) },
  { k: 'FULL PAYMENT\nIN ADVANCE', src: 'V11_3.mp4', at: L(3) },
  { k: 'NO DELIVERY\nSCHEDULE', src: 'V11_4.mp4', at: L(4) },
];

/** A red flag that drops and plants with a wobble. */
const Flag: React.FC<{ at: number; x: number; y: number; size?: number; color?: string }> = ({ at, x, y, size = 150, color = RED }) => {
  const f = useCurrentFrame();
  const drop = lerp(f, [at, at + 8], [0, 1], E.in);
  const wob = f > at + 8 ? Math.sin((f - at - 8) * 0.9) * 10 * Math.exp(-(f - at - 8) / 9) : 0;
  if (f < at) return null;
  return (
    <div style={{ position: 'absolute', left: x - size / 2, top: y - size - (1 - drop) * 500, width: size, height: size, transform: `rotate(${wob}deg)`, transformOrigin: '23% 90%', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.6))' }}>
      <Icon name="flag" size={size} color="#fff" fill={color} sw={5} />
    </div>
  );
};

const Counter: React.FC = () => {
  const f = useCurrentFrame();
  if (f < L(1) || f >= L(5)) return null;
  const n = FLAGS.filter((x) => f >= x.at).length;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 130, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18 }}>
      {FLAGS.map((x, i) => (
        <div key={i} style={{ opacity: i < n ? 1 : 0.3 }}><Icon name="flag" size={54} color="#fff" fill={i < n ? RED : 'none'} sw={6} /></div>
      ))}
      <div style={{ fontFamily: F.label, fontWeight: 700, fontSize: 34, letterSpacing: '0.2em', color: '#fff', marginLeft: 12 }}>{n} / 4</div>
    </div>
  );
};

const SpecSheet: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  const t = lerp(f, [at, at + 12], [0, 1], E.out);
  const rows = [['MOISTURE', W('moisture')], ['ASH', W('ash')], ['HEAT VALUE', W('heat')]] as const;
  return (
    <div style={{ position: 'absolute', left: 170, width: 740, top: 760, background: '#F4EFE6', borderRadius: 18, padding: '30px 40px', boxShadow: '0 30px 80px rgba(0,0,0,0.6)', opacity: t, transform: `translateY(${(1 - t) * 60}px)` }}>
      <div style={{ fontFamily: F.label, fontWeight: 700, fontSize: 26, letterSpacing: '0.24em', color: '#6A5F52' }}>DEAL SPECS</div>
      {rows.map(([k, w]) => (
        <div key={k} style={{ display: 'flex', alignItems: 'flex-end', gap: 20, marginTop: 22, opacity: lerp(f, [w - 4, w + 4], [0.25, 1]) }}>
          <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 40, color: C.ink, width: 270 }}>{k}</div>
          <div style={{ flex: 1, borderBottom: '3px dashed #B7AC9D', height: 34, position: 'relative' }}>
            <span style={{ position: 'absolute', right: 0, bottom: 2, fontFamily: F.display, fontWeight: 800, fontSize: 40, color: RED, opacity: lerp(f, [w + 6, w + 10], [0, 1]) }}>?</span>
          </div>
        </div>
      ))}
    </div>
  );
};

const PriceTag: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  const fall = lerp(f, [at + 10, at + 24], [0, 1], E.back);
  const slash = lerp(f, [at + 24, at + 32], [0, 1], E.out);
  return (
    <div style={{ position: 'absolute', left: 540 - 220, top: 760 + fall * 120, width: 440, height: 200, background: '#FFF7E6', borderRadius: '24px 24px 24px 24px', display: 'grid', placeItems: 'center', boxShadow: '0 30px 60px rgba(0,0,0,0.5)', transform: `rotate(0deg)` }}>
      <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 56, color: C.ink, letterSpacing: '-0.02em' }}>TOO CHEAP?</div>
      <div style={{ position: 'absolute', left: 30, right: 30, top: 96, height: 10, background: RED, borderRadius: 5, transformOrigin: '0 50%', transform: `scaleX(${slash})` }} />
    </div>
  );
};

const CalendarBlank: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  const t = lerp(f, [at, at + 12], [0, 1], E.out);
  return (
    <div style={{ position: 'absolute', left: 190, width: 700, top: 760, background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.6)', opacity: t, transform: `translateY(${(1 - t) * 60}px)` }}>
      <div style={{ background: RED, color: '#fff', fontFamily: F.label, fontWeight: 700, fontSize: 30, letterSpacing: '0.24em', padding: '16px 28px' }}>DELIVERY DATES</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10, padding: 24 }}>
        {Array.from({ length: 21 }, (_, i) => <div key={i} style={{ height: 56, borderRadius: 8, background: '#F1EEEA', border: '2px solid #E2DDD6' }} />)}
      </div>
    </div>
  );
};

const FlagScene: React.FC<{ i: number; to: number }> = ({ i, to }) => {
  const f = useCurrentFrame();
  const x = FLAGS[i];
  const t = lerp(f, [x.at + 6, x.at + 18], [0, 1], E.out);
  return (
    <AbsoluteFill style={{ background: BLACK }}>
      <Media src={r9(x.src)} from={x.at} to={to} a={[1.3, 0, 0]} b={[1.12, 0, 0]} grade="industrial" />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(20,6,6,0.95) 0%, rgba(40,8,8,0.55) 35%, rgba(20,6,6,0.6) 65%, rgba(14,10,10,0.95) 100%)' }} />
      <AbsoluteFill style={{ boxShadow: `inset 0 0 0 ${10 * lerp(f, [x.at, x.at + 4, x.at + 16], [0, 1, 0.4])}px ${RED}` }} />
      <Flag at={x.at} x={150} y={420} size={170} />
      <div style={{ position: 'absolute', left: 260, top: 230, opacity: t, transform: `translateX(${(1 - t) * 40}px)` }}>
        <div style={{ fontFamily: F.label, fontWeight: 700, fontSize: 30, letterSpacing: '0.3em', color: RED }}>RED FLAG {i + 1}</div>
        {x.k.split('\n').map((ln) => <div key={ln} style={{ fontFamily: F.display, fontWeight: 800, fontSize: 84, lineHeight: 1.0, color: '#fff', letterSpacing: '-0.03em', marginTop: 6 }}>{ln}</div>)}
      </div>
      {i === 0 && <SpecSheet at={x.at + 16} />}
      {i === 0 && <Tag text="YOUR WORD VS THEIRS" at={W('dispute')} x={540} y={1250} align="center" color="#fff" bg={RED} />}
      {i === 1 && <PriceTag at={x.at} />}
      {i === 1 && <Tag text="WET · MIXED · NOT THERE" at={W('wet')} x={540} y={1250} align="center" color="#fff" bg={RED} />}
      {i === 2 && <Tag text="100% UPFRONT" at={W('advance') - 4} x={540} y={820} align="center" color={C.ink} bg="#fff" size={48} />}
      {i === 2 && <Tag text="TO SOMEONE NEVER VERIFIED" at={W('verified')} x={540} y={960} align="center" color="#fff" bg={RED} />}
      {i === 3 && <CalendarBlank at={x.at + 12} />}
      {i === 3 && <Tag text="JUST A CONVERSATION" at={W('conversation') - 6} x={540} y={1250} align="center" color="#fff" bg={RED} />}
    </AbsoluteFill>
  );
};

const Meter: React.FC = () => {
  const f = useCurrentFrame();
  const t1 = L(5), t2 = W('Two', 0, 5);
  const row = (at: number, n: number, text: string, y: number, col: string) => {
    const t = lerp(f, [at, at + 10], [0, 1], E.out);
    return (
      <div style={{ position: 'absolute', left: 110, right: 110, top: y, display: 'flex', alignItems: 'center', gap: 30, opacity: t, transform: `translateY(${(1 - t) * 30}px)`, background: 'rgba(255,255,255,0.06)', border: `2px solid ${col}`, borderRadius: 26, padding: '30px 36px' }}>
        <div style={{ display: 'flex', gap: 4 }}>{Array.from({ length: n }, (_, k) => <Icon key={k} name="flag" size={86} color="#fff" fill={RED} sw={5} />)}</div>
        <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 60, lineHeight: 1.02, color: col, letterSpacing: '-0.02em' }}>{text}</div>
      </div>
    );
  };
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 90% 60% at 50% 45%, #2A0D0B 0%, ${BLACK} 70%)` }}>
      {row(t1, 1, 'ASK MORE\nQUESTIONS'.replace('\n', ' '), 520, '#F2C14E')}
      {row(t2, 2, 'WALK AWAY', 820, RED)}
    </AbsoluteFill>
  );
};

const Verify: React.FC = () => {
  const f = useCurrentFrame();
  const at = L(6) + 8;
  const s = lerp(f, [at, at + 8], [0, 1], E.back);
  const ring = lerp(f, [at + 2, at + 26], [0, 1], E.out);
  return (
    <AbsoluteFill style={{ background: BLACK }}>
      <Media src={r9('V11_5.mp4')} from={L(6)} to={FIN} a={[1.25, 0, 0]} b={[1.1, 0, 0]} grade="warm" />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(8,14,10,0.85) 0%, rgba(8,14,10,0.3) 45%, rgba(8,14,10,0.85) 100%)' }} />
      <Headline text={'TRADE WITH PEOPLE\nYOU CAN VERIFY'} at={L(6)} top={250} size={84} />
      <div style={{ position: 'absolute', left: 540 - 260, top: 820, width: 520, height: 180, display: 'grid', placeItems: 'center' }}>
        <div style={{ position: 'absolute', inset: -40 * ring, borderRadius: 30, border: `4px solid rgba(47,174,107,${0.9 * (1 - ring)})` }} />
        <div style={{ width: 520, height: 180, borderRadius: 26, border: `10px solid ${GREEN}`, background: 'rgba(8,20,12,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18,
          opacity: Math.min(1, s), transform: `scale(${1.6 - 0.6 * s})` }}>
          <Icon name="check" size={96} color={GREEN} sw={14} />
          <span style={{ fontFamily: F.display, fontWeight: 800, fontSize: 92, color: GREEN, letterSpacing: '0.04em' }}>VERIFY</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Hook: React.FC = () => (
  <AbsoluteFill style={{ background: BLACK }}>
    <Media src={r9('V11_6.mp4')} from={0} to={L(1)} a={[1.2, 0, 0]} b={[1.05, 0, 0]} grade="neutral" />
    <AbsoluteFill style={{ background: 'rgba(30,6,6,0.45)' }} />
    {[0, 1, 2, 3].map((i) => <Flag key={i} at={6 + i * 6} x={225 + i * 210} y={1000} size={170} />)}
    <Headline text={'4 RED FLAGS'} at={2} top={330} size={150} color={RED} />
    <Headline text={'IN ANY BIOMASS DEAL'} at={10} top={510} size={68} />
  </AbsoluteFill>
);

export const V11: React.FC = () => (
  <Shell8 d={D} bg={BLACK}>
    <Span from={0} to={L(1)} fade={4}><Hook /></Span>
    {FLAGS.map((x, i) => {
      const to = i < 3 ? FLAGS[i + 1].at : L(5);
      return <Span key={i} from={x.at} to={to} fade={3}><FlagScene i={i} to={to} /></Span>;
    })}
    <Counter />
    <Span from={L(5)} to={L(6)} fade={5}><Meter /></Span>
    <Span from={L(6)} to={L(7)} fade={5}><Verify /></Span>
    <Span from={L(7)} to={FIN + 2} fade={6}><BrandBeat at={L(7)} text={'THAT IS WHAT\nINDIABIOMASS IS\nBEING BUILT FOR'} accent={GREEN} /></Span>
  </Shell8>
);
export const V11_FRAMES = totalFrames(D);
