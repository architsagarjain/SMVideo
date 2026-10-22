import React from 'react';
import {AbsoluteFill, random, staticFile} from 'remotion';
import {loadFont} from '@remotion/fonts';
import {Base, Footage, Subject, inWin} from '../series/core';
import {useT} from '../explainer/kit';
import {Ico, SevenSeg, chunkAt, popAt, vis} from '../series/kit2';
import {EASE_IN, EASE_IN_OUT, EASE_OUT, lerp, tween} from '../theme';
import {C, v11Config as cfg} from './config';

const BRIC = 'Bricolage';
loadFont({family: BRIC, url: staticFile('fonts/BricolageGrotesque.ttf'), weight: '200 800'});

const INK = '#1A1714';
const RED = '#E8452C';
const BLUE = '#1E6BFF';
const AMBER = '#FFB020';
const GREEN = '#12A150';
const STICK = '0 20px 36px -14px rgba(60,40,20,0.35)';

// ---------------------------------------------------------------------------
// Backdrop: pastel per section, colours blend at each change
// ---------------------------------------------------------------------------
const SEC = [
  {w: C.hook, bg: '#FFE6A0', ac: '#FF6B1A'},
  {w: C.rice, bg: '#FFD3C0', ac: RED},
  {w: C.glyco, bg: '#E4D9FF', ac: '#6D3BFF'},
  {w: C.water, bg: '#CFE5FF', ac: BLUE},
  {w: C.three, bg: '#CFE5FF', ac: BLUE},
  {w: C.week, bg: '#D2F0DD', ac: GREEN},
  {w: C.trend, bg: '#D2F0DD', ac: GREEN},
  {w: C.regain, bg: '#CFE5FF', ac: BLUE},
  {w: C.foods, bg: '#FFE6A0', ac: '#FF6B1A'},
  {w: C.cta, bg: '#FFD3C0', ac: RED},
];
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a: string, b: string, p: number) => {
  const A = hex(a);
  const B = hex(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(p, v, B[i]))).join(',')})`;
};
const secAt = (t: number) => {
  let k = 0;
  SEC.forEach((s, i) => (t >= s.w.start - 0.01 ? (k = i) : null));
  return k;
};
const colorsAt = (t: number) => {
  const k = secAt(t);
  const p = k > 0 ? tween(t, SEC[k].w.start, 0.45, EASE_IN_OUT) : 1;
  const prev = SEC[Math.max(0, k - 1)];
  return {bg: mix(prev.bg, SEC[k].bg, p), ac: p < 0.5 ? prev.ac : SEC[k].ac};
};
const REVEAL = 0.94; // "Having": the room floods away into the studio
const revealAt = (t: number) => tween(t, REVEAL, 0.6, EASE_IN_OUT);

const Backdrop: React.FC = () => {
  const t = useT();
  const {bg} = colorsAt(t);
  const r = revealAt(t);
  if (r <= 0) return null;
  return (
    <AbsoluteFill style={{clipPath: r < 1 ? `circle(${lerp(r, 0, 2300)}px at 540px 720px)` : undefined}}>
      <AbsoluteFill style={{background: bg}} />
      <AbsoluteFill style={{background: 'radial-gradient(55% 38% at 50% 40%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 100%)'}} />
      <AbsoluteFill style={{backgroundImage: `url(${staticFile('v11/noise.png')})`, backgroundSize: '256px 256px', opacity: 0.5, mixBlendMode: 'multiply'}} />
      <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(0,0,0,0) 70%, rgba(60,30,10,0.12) 100%)'}} />
    </AbsoluteFill>
  );
};
/** White sticker outline (pre-dilated matte) + soft shadow, following her camera moves. */
const olCfg = {...cfg, dir: 'v11/ol', grade: {}};
const Outline: React.FC = () => {
  const t = useT();
  const r = revealAt(t);
  if (r <= 0) return null;
  return (
    <AbsoluteFill style={{opacity: Math.min(1, r * 1.6), filter: 'drop-shadow(0 18px 26px rgba(60,35,15,0.32))'}}>
      <Subject cfg={olCfg} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Sticker kit
// ---------------------------------------------------------------------------
const At: React.FC<{x: number; y: number; at?: number; out?: number; children: React.ReactNode}> = ({x, y, at = -1, out = 9999, children}) => {
  const t = useT();
  if (t < at || t > out + 0.3) return null;
  const k = at < 0 ? 1 : popAt(t, at);
  const o = 1 - tween(t, out, 0.25, EASE_IN);
  return <div style={{position: 'absolute', left: x, top: y, translate: `-50% ${lerp(Math.min(1, k), -30, -50)}%`, scale: lerp(Math.min(1.1, k), 0.6, 1), opacity: Math.min(1, k * 2) * o}}>{children}</div>;
};
/** Die-cut text: ink (or accent) with a thick white border and a soft shadow. */
const Die: React.FC<{size: number; color?: string; stroke?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({size, color = INK, stroke, children, style}) => (
  <div style={{fontFamily: BRIC, fontWeight: 800, fontSize: size, lineHeight: 1, letterSpacing: -size * 0.03, color, WebkitTextStroke: `${stroke ?? Math.max(8, size * 0.16)}px #fff`, paintOrder: 'stroke fill', whiteSpace: 'nowrap', filter: 'drop-shadow(0 12px 14px rgba(60,40,20,0.22))', ...style}}>{children}</div>
);
const Card: React.FC<{w?: number; h?: number; pad?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({w, h, pad = 26, children, style}) => (
  <div style={{width: w, height: h, padding: pad, boxSizing: 'border-box', borderRadius: 44, background: '#fff', boxShadow: STICK, position: 'relative', ...style}}>{children}</div>
);
const Chip: React.FC<{bg: string; fg?: string; size?: number; children: React.ReactNode}> = ({bg, fg = '#fff', size = 40, children}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: size * 0.3, padding: `${size * 0.22}px ${size * 0.55}px`, borderRadius: 999, background: bg, color: fg, fontFamily: BRIC, fontWeight: 800, fontSize: size, whiteSpace: 'nowrap', border: `${size * 0.14}px solid #fff`, boxShadow: STICK}}>{children}</div>
);

// illustrations ------------------------------------------------------------
const roll = (t: number, a: number, b: number, t0: number, t1: number) => (a + Math.round((b - a) * 10 * tween(t, t0, t1 - t0, (x) => x)) / 10).toFixed(1);
const Scale: React.FC<{value: string; w?: number; tone?: 'down' | 'up' | null}> = ({value, w = 360, tone = null}) => {
  const s = w / 360;
  return (
    <div style={{width: 360 * s, height: 360 * s, position: 'relative'}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 80 * s, background: '#FFFFFF', boxShadow: STICK}} />
      <div style={{position: 'absolute', inset: 16 * s, borderRadius: 66 * s, background: 'linear-gradient(160deg, #F4F4F2, #E2E3E1)', border: `${5 * s}px solid ${INK}`}} />
      <div style={{position: 'absolute', left: 52 * s, right: 52 * s, top: 56 * s, height: 104 * s, borderRadius: 20 * s, background: tone === 'down' ? '#BFE8C2' : tone === 'up' ? '#FFC9BE' : '#D6E7D2', border: `${5 * s}px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 * s}}>
        <SevenSeg text={value} h={64 * s} on={INK} off="rgba(0,0,0,0.06)" />
        <span style={{fontFamily: BRIC, fontWeight: 800, fontSize: 24 * s, color: INK, marginTop: 30 * s}}>kg</span>
      </div>
      {[-1, 1].map((d) => (
        <div key={d} style={{position: 'absolute', left: 180 * s + d * 62 * s - 40 * s, top: 196 * s, width: 80 * s, height: 120 * s, borderRadius: 40 * s, background: 'rgba(26,23,20,0.12)'}} />
      ))}
    </div>
  );
};
const RiceBowl: React.FC<{w?: number}> = ({w = 300}) => (
  <svg width={w} height={w * 0.8} viewBox="0 0 300 240">
    <path d="M40 120 C 40 60, 260 60, 260 120 Z" fill="#FFFFFF" stroke={INK} strokeWidth={6} />
    {Array.from({length: 26}, (_, i) => (
      <ellipse key={i} cx={70 + random(`rx${i}`) * 160} cy={82 + random(`ry${i}`) * 34} rx={7} ry={3.6} fill="#F1EEE6" stroke="#CFC8B8" strokeWidth={1.5} transform={`rotate(${random(`rr${i}`) * 180} ${70 + random(`rx${i}`) * 160} ${82 + random(`ry${i}`) * 34})`} />
    ))}
    <path d="M24 118 H276 C 270 190, 220 222, 150 222 C 80 222, 30 190, 24 118 Z" fill={BLUE} stroke={INK} strokeWidth={6} />
    {[0, 1, 2, 3, 4].map((i) => (
      <circle key={i} cx={70 + i * 40} cy={160 + (i % 2) * 14} r={9} fill="#fff" opacity={0.85} />
    ))}
    <rect x={110} y={218} width={80} height={14} rx={6} fill={INK} />
  </svg>
);
const Drop: React.FC<{w: number; color?: string}> = ({w, color = BLUE}) => (
  <svg width={w} height={w * 1.25} viewBox="0 0 100 125">
    <path d="M50 6 C50 6 12 54 12 82 a38 38 0 0 0 76 0 C88 54 50 6 50 6Z" fill={color} stroke={INK} strokeWidth={6} />
    <ellipse cx={36} cy={80} rx={8} ry={14} fill="#fff" opacity={0.6} />
  </svg>
);
const Block: React.FC<{w: number; label?: string}> = ({w, label}) => (
  <div style={{width: w, height: w * 0.62, borderRadius: w * 0.12, background: AMBER, border: `${Math.max(4, w * 0.04)}px solid ${INK}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: BRIC, fontWeight: 800, fontSize: w * 0.22, color: INK}}>{label}</div>
);
/** Glycogen tank: blocks stacked; `n` of them remain; optional water drops beside each. */
const Tank: React.FC<{t: number; n: number; drops?: number; drainAt?: number; keep?: number}> = ({t, n, drops = 0, drainAt, keep = 2}) => (
  <div style={{position: 'relative', width: 300, height: 430}}>
    <div style={{position: 'absolute', left: 110, top: 0, width: 80, height: 26, borderRadius: 10, background: INK}} />
    <div style={{position: 'absolute', left: 30, top: 20, width: 240, height: 410, borderRadius: 40, background: '#fff', border: `6px solid ${INK}`, boxSizing: 'border-box', boxShadow: STICK}} />
    {Array.from({length: n}, (_, i) => {
      const gone = drainAt !== undefined && i >= keep ? tween(t, drainAt + (n - 1 - i) * 0.12, 0.45, EASE_IN) : 0;
      const y = 360 - i * 64;
      return (
        <React.Fragment key={i}>
          <div style={{position: 'absolute', left: 58, top: y - gone * 60, opacity: 1 - gone}}>
            <Block w={184} />
          </div>
          {drops > 0 ? (
            <div style={{position: 'absolute', left: 250, top: y - 6 - gone * 60, display: 'flex', gap: 2, opacity: (1 - gone) * Math.min(1, popAt(t, drops + i * 0.08))}}>
              {[0, 1, 2].map((d) => (
                <Drop key={d} w={30} />
              ))}
            </div>
          ) : null}
        </React.Fragment>
      );
    })}
  </div>
);
const Sparkles: React.FC<{at: number; x: number; y: number}> = ({at, x, y}) => {
  const t = useT();
  if (t < at || t > at + 1.4) return null;
  const d = t - at;
  return (
    <>
      {Array.from({length: 14}, (_, i) => {
        const a = (i / 14) * Math.PI * 2 + random(`sk${i}`) * 0.4;
        const v = lerp(random(`sv${i}`), 240, 420);
        const p = tween(t, at, 0.7, EASE_OUT);
        const s = lerp(random(`ss${i}`), 26, 46) * (1 - tween(t, at + 0.6, 0.7));
        return (
          <svg key={i} width={s} height={s} viewBox="-10 -10 20 20" style={{position: 'absolute', left: x + Math.cos(a) * v * p - s / 2, top: y + Math.sin(a) * v * p - s / 2 + 60 * d * d}}>
            <path d="M0 -10 L2.5 -2.5 L10 0 L2.5 2.5 L0 10 L-2.5 2.5 L-10 0 L-2.5 -2.5Z" fill={i % 3 === 0 ? '#FF6B1A' : i % 3 === 1 ? '#FFFFFF' : AMBER} stroke={INK} strokeWidth={1.4} />
          </svg>
        );
      })}
    </>
  );
};
const Strike: React.FC<{t: number; at: number; w: number; color?: string}> = ({t, at, w, color = RED}) => {
  const p = tween(t, at, 0.3, EASE_OUT);
  return p > 0 ? <div style={{position: 'absolute', left: '50%', top: '52%', width: w * p, height: 14, translate: '-50% -50%', borderRadius: 7, background: color, border: '4px solid #fff', boxShadow: STICK}} /> : null;
};

// ---------------------------------------------------------------------------
// Sections (behind her head unless noted)
// ---------------------------------------------------------------------------
const Hook: React.FC = () => {
  const t = useT();
  const w = C.hook;
  if (t >= w.end + 0.3) return null;
  const o = 1 - tween(t, w.end - 0.2, 0.3);
  const side = tween(t, 6.86, 0.5, EASE_IN_OUT);
  const val = t < 4.38 ? '68.4' : roll(t, 68.4, 65.9, 4.38, 5.2);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <At x={540} y={230} at={1.26} out={2.62}>
        <Die size={84}>having lost weight</Die>
      </At>
      <At x={540} y={350} at={1.82} out={2.62}>
        <Die size={170} color="#FF6B1A">myself</Die>
      </At>
      {t >= 2.78 ? (
        <div style={{position: 'absolute', left: lerp(side, 540, 250), top: 360, translate: '-50% -50%', scale: lerp(side, 1, 0.78) * Math.max(0, Math.min(1.1, popAt(t, 2.8)))}}>
          <Scale value={val} tone={t >= 4.38 ? 'down' : null} />
          {t >= 5.0 ? (
            <div style={{position: 'absolute', right: -60, top: -30, scale: Math.max(0, popAt(t, 5.0))}}>
              <Chip bg={GREEN} size={46}>−2.5 kg!</Chip>
            </div>
          ) : null}
        </div>
      ) : null}
      <At x={540} y={110} at={4.38} out={6.7}>
        <Die size={84}>quick scale drop</Die>
      </At>
      <Sparkles at={5.6} x={540} y={360} />
      <At x={760} y={250} at={7.2}>
        <Die size={74}>as a coach,</Die>
      </At>
      <At x={760} y={360} at={8.94}>
        <Die size={100} color="#FF6B1A">what</Die>
      </At>
      <At x={760} y={470} at={9.52}>
        <Die size={100} color="#FF6B1A">caused it?</Die>
      </At>
      {t >= 9.3 ? (
        <div style={{position: 'absolute', left: lerp(tween(t, 9.3, 0.6, EASE_OUT), 520, 300), top: lerp(tween(t, 9.3, 0.6, EASE_OUT), 520, 330), translate: '-50% -50%', opacity: tween(t, 9.3, 0.2)}}>
          <div style={{width: 150, height: 150, borderRadius: '50%', background: '#fff', boxShadow: STICK, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Ico name="magnifying-glass" size={96} color={INK} />
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
const Rice: React.FC = () => {
  const t = useT();
  const w = C.rice;
  const o = vis(t, w.start + 0.2, w.end - 0.25);
  if (o <= 0) return null;
  const val = roll(t, 65.9, 64.6, 12.78, 13.5);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <At x={290} y={300} at={10.9}>
        <Card w={420} h={360} style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <RiceBowl w={320} />
          {t >= 11.32 && t < 15.55 ? (
            <div style={{position: 'absolute', left: '50%', top: '50%', translate: '-50% -50%', scale: lerp(Math.min(1, popAt(t, 11.32)), 1.6, 1), opacity: Math.min(1, popAt(t, 11.32) * 2)}}>
              <Chip bg={RED} size={56}>STOP</Chip>
            </div>
          ) : null}
          {t >= 15.6 ? (
            <div style={{position: 'absolute', left: '50%', top: '50%', translate: '-50% -50%', scale: lerp(Math.min(1, popAt(t, 15.6)), 1.5, 1), opacity: Math.min(1, popAt(t, 15.6) * 2)}}>
              <Chip bg={INK} size={52}>NOT PROVEN</Chip>
            </div>
          ) : null}
        </Card>
      </At>
      <At x={800} y={300} at={12.62} out={15.1}>
        <Scale value={val} w={320} tone="down" />
      </At>
      {t >= 13.1 ? (
        <At x={800} y={490} at={13.1} out={14.4}>
          <Chip bg={GREEN} size={36}>falls fast</Chip>
        </At>
      ) : null}
      <At x={790} y={230} at={15.3}>
        <Die size={70}>rice was</Die>
      </At>
      <At x={790} y={330} at={16.54}>
        <Die size={70}>blocking</Die>
      </At>
      <At x={790} y={440} at={17.48}>
        <Die size={84} color={RED}>fat loss?</Die>
      </At>
    </AbsoluteFill>
  );
};
const Glyco: React.FC = () => {
  const t = useT();
  const w = C.glyco;
  const o = vis(t, w.start + 0.2, w.end - 0.25);
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <At x={290} y={330} at={18.9}>
        <div style={{scale: 0.95}}>
          <Tank t={t} n={6} drainAt={20.72} keep={2} />
        </div>
      </At>
      <At x={770} y={150} at={19.36}>
        <Die size={70}>less carbs</Die>
      </At>
      <At x={770} y={255} at={20.72}>
        <Die size={70}>= less</Die>
      </At>
      <At x={770} y={365} at={21.26}>
        <Die size={104} color="#6D3BFF">glycogen</Die>
      </At>
      <At x={770} y={480} at={22.42}>
        <Chip bg="#6D3BFF" size={32}>the carbs your body stores</Chip>
      </At>
    </AbsoluteFill>
  );
};
const Water: React.FC = () => {
  const t = useT();
  const w = C.water;
  const o = vis(t, w.start + 0.2, w.end - 0.25);
  if (o <= 0) return null;
  const val = roll(t, 65.9, 65.0, 29.8, 30.4);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <At x={280} y={330} at={24.98}>
        <div style={{scale: 0.95}}>
          <Tank t={t} n={6} drops={27.12} drainAt={28.4} keep={3} />
        </div>
      </At>
      <At x={790} y={140} at={25.22}>
        <Die size={62}>glycogen is stored</Die>
      </At>
      <At x={790} y={240} at={26.54}>
        <Die size={62}>with</Die>
      </At>
      <At x={790} y={345} at={27.12}>
        <Die size={110} color={BLUE}>water</Die>
      </At>
      {t >= 29.8 ? (
        <At x={810} y={475} at={29.8}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
            <Scale value={val} w={150} tone="down" />
            <Die size={48}>moves!</Die>
          </div>
        </At>
      ) : null}
    </AbsoluteFill>
  );
};
const Three: React.FC = () => {
  const t = useT();
  const w = C.three;
  const o = vis(t, w.start + 0.2, w.end - 0.25);
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <At x={540} y={120} at={31.78}>
        <Chip bg={INK} size={36}>
          <Ico name="magnifying-glass" size={40} color="#fff" /> HUMAN RESEARCH
        </Chip>
      </At>
      <At x={540} y={370} at={33.06}>
        <Card w={960} h={330} pad={30}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-around', height: '100%'}}>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, opacity: tween(t, 37.1, 0.3), scale: lerp(Math.min(1, popAt(t, 37.1)), 0.6, 1)}}>
              <Block w={170} label="1 g" />
              <div style={{fontFamily: BRIC, fontWeight: 800, fontSize: 34, color: INK}}>glycogen</div>
            </div>
            <div style={{fontFamily: BRIC, fontWeight: 800, fontSize: 110, color: INK, opacity: tween(t, 36.38, 0.3)}}>≈</div>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12}}>
              <div style={{display: 'flex', gap: 10, height: 130, alignItems: 'flex-end'}}>
                {[33.64, 34.1, 34.54].map((a, i) => (
                  <div key={i} style={{scale: Math.max(0, popAt(t, a))}}>
                    <Drop w={86} />
                  </div>
                ))}
              </div>
              <div style={{fontFamily: BRIC, fontWeight: 800, fontSize: 34, color: BLUE, opacity: tween(t, 35.82, 0.3)}}>~3 g water</div>
            </div>
          </div>
        </Card>
      </At>
      {t >= 40.0 ? (
        <At x={830} y={530} at={40.0}>
          <Chip bg={BLUE} size={40}>± it varies</Chip>
        </At>
      ) : null}
    </AbsoluteFill>
  );
};
const Week: React.FC = () => {
  const t = useT();
  const w = C.week;
  const o = vis(t, w.start + 0.2, w.end - 0.25);
  if (o <= 0) return null;
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  return (
    <AbsoluteFill style={{opacity: o}}>
      <At x={540} y={190} at={43.3}>
        <Card w={900} h={240} pad={24}>
          <div style={{fontFamily: BRIC, fontWeight: 800, fontSize: 40, color: INK, marginBottom: 14}}>
            <span style={{color: GREEN}}>1</span> low-carb week
          </div>
          <div style={{display: 'flex', gap: 12}}>
            {days.map((d, i) => (
              <div key={i} style={{flex: 1, height: 100, borderRadius: 22, background: tween(t, 43.74 + i * 0.07, 0.2) > 0.5 ? '#DFF5E7' : '#F3F1EC', border: `5px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: BRIC, fontWeight: 800, fontSize: 40, color: INK}}>
                {d}
              </div>
            ))}
          </div>
        </Card>
      </At>
      <At x={540} y={420} at={46.22}>
        <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
          <div style={{position: 'relative'}}>
            <Card w={150} h={130} pad={8} style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <RiceBowl w={130} />
            </Card>
          </div>
          <div style={{position: 'relative'}}>
            <Die size={76}>
              no rice till <span style={{color: GREEN}}>December?</span>
            </Die>
            <Strike t={t} at={48.8} w={760} />
          </div>
        </div>
      </At>
    </AbsoluteFill>
  );
};
const DOTS = [65.3, 65.0, 65.4, 64.9, 65.1, 64.6, 64.9, 64.4, 64.7, 64.3, 64.6, 64.1, 64.4, 64.0];
const Trend: React.FC = () => {
  const t = useT();
  const w = C.trend;
  const o = vis(t, w.start + 0.2, w.end - 0.25);
  if (o <= 0) return null;
  const W = 840;
  const H = 260;
  const x = (i: number) => 40 + (i / (DOTS.length - 1)) * (W - 80);
  const y = (v: number) => 30 + ((65.6 - v) / 1.8) * (H - 60);
  const avg = DOTS.map((_, i) => {
    const sl = DOTS.slice(Math.max(0, i - 2), Math.min(DOTS.length, i + 3));
    return sl.reduce((s, v) => s + v, 0) / sl.length;
  });
  const p = tween(t, 53.56, 0.8, EASE_IN_OUT);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <At x={540} y={320} at={50.0}>
        <Card w={900} h={420} pad={30}>
          <div style={{fontFamily: BRIC, fontWeight: 800, fontSize: 40, color: INK}}>
            keep intake <span style={{color: GREEN}}>consistent</span>
          </div>
          <svg width={W} height={H} style={{marginTop: 20}}>
            {DOTS.map((v, i) => (
              <circle key={i} cx={x(i)} cy={y(v)} r={13 * Math.max(0, popAt(t, 50.66 + i * 0.07))} fill={p > 0 ? '#BDB7AC' : INK} />
            ))}
            {p > 0 ? <path d={avg.map((v, i) => `${i ? 'L' : 'M'}${x(i)} ${y(v)}`).join(' ')} fill="none" stroke={GREEN} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} /> : null}
          </svg>
        </Card>
      </At>
      {t >= 53.74 ? (
        <At x={760} y={525} at={53.74}>
          <Chip bg={GREEN} size={44}>the longer trend</Chip>
        </At>
      ) : null}
    </AbsoluteFill>
  );
};
const Regain: React.FC = () => {
  const t = useT();
  const w = C.regain;
  const o = vis(t, w.start + 0.2, w.end - 0.25);
  if (o <= 0) return null;
  const val = roll(t, 65.0, 65.8, 56.34, 56.9);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <At x={270} y={330} at={55.44}>
        <div style={{position: 'relative'}}>
          <Scale value={val} w={330} tone={t >= 56.34 ? 'up' : null} />
          {t >= 56.9 ? (
            <div style={{position: 'absolute', right: -50, top: -30, scale: Math.max(0, popAt(t, 56.9))}}>
              <Chip bg={RED} size={42}>+0.8</Chip>
            </div>
          ) : null}
        </div>
      </At>
      <At x={780} y={160} at={57.42}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
          <Card w={140} h={120} pad={6} style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <RiceBowl w={124} />
          </Card>
          <Die size={64}>carbs ↑</Die>
        </div>
      </At>
      <At x={780} y={305} at={60.12}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
          <div style={{width: 110, height: 110, borderRadius: '50%', background: '#fff', boxShadow: STICK, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Ico name="magnifying-glass" size={70} color={INK} />
          </div>
          <Die size={64} color={BLUE}>context?</Die>
        </div>
      </At>
      <At x={780} y={445} at={62.56}>
        <div style={{position: 'relative'}}>
          <Die size={70}>fat regain</Die>
          <Strike t={t} at={63.3} w={400} />
        </div>
      </At>
    </AbsoluteFill>
  );
};
const FOODS: {n: string; at: number; draw: React.ReactNode}[] = [
  {n: 'rice', at: 70.98, draw: <RiceBowl w={150} />},
  {
    n: 'roti',
    at: 71.4,
    draw: (
      <svg width={130} height={130} viewBox="0 0 100 100">
        <circle cx={50} cy={50} r={44} fill="#E9C38A" stroke={INK} strokeWidth={5} />
        {[0, 1, 2, 3, 4].map((i) => (
          <circle key={i} cx={30 + (i * 13) % 45} cy={32 + (i * 17) % 40} r={5} fill="#B9803F" opacity={0.7} />
        ))}
      </svg>
    ),
  },
  {
    n: 'dal',
    at: 71.88,
    draw: (
      <svg width={150} height={120} viewBox="0 0 150 120">
        <ellipse cx={75} cy={48} rx={62} ry={18} fill={AMBER} stroke={INK} strokeWidth={5} />
        <path d="M13 48 C 16 98, 134 98, 137 48" fill="#FFFFFF" stroke={INK} strokeWidth={5} />
      </svg>
    ),
  },
  {
    n: 'fruit',
    at: 72.3,
    draw: (
      <svg width={120} height={130} viewBox="0 0 100 110">
        <path d="M50 30 C 20 10, 4 40, 12 68 C 20 98, 40 104, 50 96 C 60 104, 80 98, 88 68 C 96 40, 80 10, 50 30Z" fill={RED} stroke={INK} strokeWidth={5} />
        <path d="M50 30 C 50 18, 56 10, 64 6" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
        <path d="M54 18 C 66 8, 80 12, 82 20 C 70 26, 60 24, 54 18Z" fill={GREEN} stroke={INK} strokeWidth={4} />
      </svg>
    ),
  },
];
const Foods: React.FC = () => {
  const t = useT();
  const w = C.foods;
  const o = vis(t, w.start + 0.2, w.end - 0.25);
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <At x={540} y={150} at={65.06} out={69.6}>
        <Die size={66}>understand your results</Die>
      </At>
      <At x={540} y={360} at={68.16} out={69.6}>
        <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
          <Scale value="65.8" w={220} />
          <Die size={64}>
            one <span style={{color: '#FF6B1A'}}>weigh-in</span>
          </Die>
        </div>
      </At>
      <At x={540} y={150} at={69.82}>
        <Die size={60}>shouldn't change what</Die>
      </At>
      <At x={540} y={250} at={72.1}>
        <Die size={72} color="#FF6B1A">you're allowed to eat</Die>
      </At>
      <div style={{position: 'absolute', left: 540, top: 425, translate: '-50% -50%', display: 'flex', gap: 20}}>
        {FOODS.map((f, i) =>
          t >= f.at - 0.6 ? (
            <div key={i} style={{scale: Math.max(0, popAt(t, f.at - 0.6)), position: 'relative'}}>
              <Card w={210} h={190} pad={6} style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                {f.draw}
              </Card>
              {t >= f.at ? (
                <div style={{position: 'absolute', right: -14, top: -14, width: 64, height: 64, borderRadius: '50%', background: GREEN, border: '5px solid #fff', boxShadow: STICK, display: 'flex', alignItems: 'center', justifyContent: 'center', scale: Math.max(0, popAt(t, f.at))}}>
                  <Ico name="check-circle" size={44} color="#fff" />
                </div>
              ) : null}
            </div>
          ) : null,
        )}
      </div>
    </AbsoluteFill>
  );
};
const Cta: React.FC = () => {
  const t = useT();
  if (t < C.cta.start) return null;
  return (
    <AbsoluteFill>
      <At x={540} y={170} at={73.44}>
        <Die size={70}>comment</Die>
      </At>
      <At x={540} y={320} at={73.66}>
        <Die size={170} color={RED} stroke={22}>
          GUIDE
        </Die>
      </At>
      <At x={540} y={495} at={74.8}>
        <Card pad={18} style={{display: 'flex', alignItems: 'center', gap: 18}}>
          <div style={{width: 80, height: 80, borderRadius: 22, background: RED, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Ico name="file-pdf" size={52} color="#fff" />
          </div>
          <div style={{fontFamily: BRIC}}>
            <div style={{fontSize: 40, fontWeight: 800, color: INK, whiteSpace: 'nowrap'}}>Free Fat Loss Guide</div>
            <div style={{fontSize: 26, fontWeight: 600, color: '#7A7266'}}>sent to your DMs</div>
          </div>
        </Card>
      </At>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Captions: die-cut words, spoken word in the section colour
// ---------------------------------------------------------------------------
const Caps: React.FC = () => {
  const t = useT();
  if (inWin(t, [{start: C.cta.start + 0.2, end: 999}])) return null;
  const chunk = chunkAt(cfg.captions, t);
  if (!chunk) return null;
  const k = tween(t, chunk[0].start - 0.04, 0.14);
  const {ac} = colorsAt(t);
  return (
    <div style={{position: 'absolute', left: 30, right: 30, top: 1560, translate: `0 ${-50 + lerp(k, 12, 0)}%`, textAlign: 'center', opacity: k}}>
      {chunk.map((w, i) => {
        const nextStart = chunk[i + 1]?.start ?? w.end + 0.3;
        const on = t >= w.start - 0.03 && t < nextStart;
        return (
          <span key={i} style={{display: 'inline-block', margin: '0 0.2em', fontFamily: BRIC, fontWeight: 800, fontSize: 76, lineHeight: 1.12, letterSpacing: -0.5, color: on ? ac : INK, WebkitTextStroke: '13px #fff', paintOrder: 'stroke fill', filter: 'drop-shadow(0 10px 12px rgba(40,25,10,0.3))', scale: on ? 1.06 : 1}}>
            {w.text}
          </span>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------------------
const Room: React.FC = () => {
  const t = useT();
  return revealAt(t) >= 1 ? null : <Footage cfg={cfg} />;
};
const Scene: React.FC = () => (
  <>
    <Room />
    <Backdrop />
    <Hook />
    <Rice />
    <Glyco />
    <Water />
    <Three />
    <Week />
    <Trend />
    <Regain />
    <Foods />
    <Cta />
    <Outline />
    <Subject cfg={cfg} />
    <Caps />
  </>
);

export const V11Reel: React.FC = () => (
  <Base cfg={{...cfg, shakes: [0.98, 11.32, 48.8, 73.66]}}>
    <Scene />
  </Base>
);

