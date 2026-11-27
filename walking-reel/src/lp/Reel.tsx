import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {Base, Footage, GradeOverlay, ReelConfig} from '../series/core';
import {TimeMap} from '../series/timemap';
import {useT} from '../explainer/kit';
import {EASE_IN, EASE_OUT, SERIF, lerp, tween} from '../theme';
import {ANTON, chunkAt, popAt} from '../series/kit2';
import {adConfig} from '../ads/make';
import {BRAND, GROT, MixLine, MixWord} from '../ads/extras';
import {Slot} from '../b3/slot';
import timemap from './timemap.json';
import captions from './captions.json';

/**
 * Landing-page video (16:9, 1920x1080): 7 clips in recording order - intro, client results, Rs 99 offer,
 * my story, how coaching works, who it's for, final CTA. She stands centre (face x~900); graphics and the
 * photo / video slots use the free space either side. No music. Output = source seconds.
 * Slots: set `img` once the asset is in public/lp/ (photos) - videos get wired the same way.
 */
export const TM_LP = timemap as TimeMap;
export const LP_FRAMES = TM_LP.frames;
const cfg: ReelConfig = adConfig('lp', TM_LP, captions, [], []);

const INK = '#141414';
const NEON = '#DDEB2F';
const shadow = '0 24px 50px -20px rgba(0,0,0,0.55)';
const vis = (t: number, a: number, b: number) => (t < a || t > b + 0.3 ? 0 : tween(t, a, 0.35, EASE_OUT) * (1 - tween(t, b - 0.05, 0.3, EASE_IN)));
const MONO: React.CSSProperties = {fontFamily: GROT, fontWeight: 700, fontSize: 22, letterSpacing: 4, textTransform: 'uppercase'};

type Side = 'left' | 'right';
const PANEL = {left: {x: 70, w: 520}, right: {x: 1330, w: 520}};

/** A floating panel in the free space beside her. */
const Panel: React.FC<{side: Side; a: number; b: number; top?: number; children: React.ReactNode}> = ({side, a, b, top = 150, children}) => {
  const t = useT();
  const o = vis(t, a, b);
  if (o <= 0) return null;
  const k = tween(t, a, 0.45, EASE_OUT);
  const p = PANEL[side];
  return (
    <div style={{position: 'absolute', left: p.x, top, width: p.w, opacity: o, translate: `${lerp(k, side === 'left' ? -40 : 40, 0)}px 0`}}>{children}</div>
  );
};
const Card: React.FC<{children: React.ReactNode; pad?: number}> = ({children, pad = 28}) => (
  <div style={{background: 'rgba(255,255,255,0.96)', borderRadius: 26, boxShadow: shadow, padding: pad}}>{children}</div>
);

/** Small chapter tag top-left. */
const CHAPTERS = [
  {a: 42.9, b: 80.9, text: 'Real Clients'},
  {a: 80.95, b: 103.8, text: 'Getting Started'},
  {a: 103.85, b: 149.2, text: 'My Story'},
  {a: 149.21, b: 259.7, text: 'How Coaching Works'},
  {a: 259.71, b: 291.0, text: 'Who This Is For'},
  {a: 291.08, b: 999, text: 'Book Your Call'},
];
const Chapter: React.FC = () => {
  const t = useT();
  const c = CHAPTERS.find((x) => t >= x.a && t < x.b + 0.3);
  if (!c) return null;
  const o = vis(t, c.a, c.b);
  return (
    <div style={{position: 'absolute', left: 70, top: 56, display: 'flex', alignItems: 'center', gap: 12, opacity: o}}>
      <span style={{width: 14, height: 14, borderRadius: '50%', background: NEON, boxShadow: '0 0 0 3px rgba(20,20,20,0.85)'}} />
      <span style={{...MONO, color: '#FFFFFF', padding: '6px 12px', background: 'rgba(20,20,20,0.82)'}}>{c.text}</span>
    </div>
  );
};

/** Lower-third captions, centred under her face. */
const Caps: React.FC<{hide: {a: number; b: number}[]}> = ({hide}) => {
  const t = useT();
  if (hide.some((h) => t >= h.a && t < h.b)) return null;
  const chunk = chunkAt(captions as {text: string; start: number; end: number}[][], t);
  if (!chunk) return null;
  const k = tween(t, chunk[0].start - 0.04, 0.12);
  return (
    <div style={{position: 'absolute', left: 300, right: 300, top: 930, display: 'flex', justifyContent: 'center', opacity: k}}>
      <MixLine words={chunk} size={chunk.length > 4 ? 46 : 54} t={1e9} />
    </div>
  );
};

const Row: React.FC<{t: number; at: number; icon?: string; children: React.ReactNode; color?: string}> = ({t, at, icon = '✓', children, color = BRAND}) => {
  if (t < at) return null;
  const k = tween(t, at, 0.3, EASE_OUT);
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 14, opacity: k, translate: `${lerp(k, 18, 0)}px 0`}}>
      <span style={{width: 40, height: 40, borderRadius: '50%', background: color, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: GROT, fontWeight: 800, fontSize: 24, flexShrink: 0}}>{icon}</span>
      <span style={{fontFamily: GROT, fontWeight: 700, fontSize: 32, color: INK, lineHeight: 1.15}}>{children}</span>
    </div>
  );
};
const Stat: React.FC<{t: number; at: number; value: number; suffix: string; label: string}> = ({t, at, value, suffix, label}) => {
  if (t < at) return null;
  const p = tween(t, at, 0.9, EASE_OUT);
  const k = popAt(t, at);
  return (
    <div style={{display: 'flex', alignItems: 'baseline', gap: 16, scale: lerp(Math.min(1.04, k), 0.7, 1), opacity: Math.min(1, k * 3), transformOrigin: 'left center'}}>
      <span style={{fontFamily: ANTON, fontSize: 96, lineHeight: 1, color: INK}}>{`${Math.round(value * p)}${suffix}`}</span>
      <span style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 40, color: '#5A5650'}}>{label}</span>
    </div>
  );
};

const Scene: React.FC = () => {
  const t = useT();
  return (
    <>
      <Footage cfg={cfg} />
      <GradeOverlay cfg={cfg} />
      <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(0,0,0,0) 72%, rgba(0,0,0,0.35) 100%)'}} />
      <Chapter />

      {/* ---------------- 1. Intro ---------------- */}
      <Panel side="left" a={0.5} b={8.9} top={720}>
        <div style={{display: 'flex', alignItems: 'stretch', gap: 16}}>
          <div style={{width: 8, borderRadius: 4, background: NEON}} />
          <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
            <MixLine words={[{text: 'Bhavika', start: 0.86}, {text: 'Agarwal', start: 1.0}]} size={58} t={t} />
            <MixWord w="_Founder & Head Coach, PeakX" size={36} />
          </div>
        </div>
      </Panel>
      <Panel side="right" a={9.1} b={12.9}>
        <Card>
          <div style={{...MONO, color: '#6F6A62', marginBottom: 16}}>Certified In</div>
          <div style={{display: 'flex', gap: 14}}>
            {[{n: 'NASM', at: 10.04}, {n: 'ISSA', at: 10.88}, {n: 'INFS', at: 11.82}].map((c, i) => (
              <div key={c.n} style={{flex: 1, opacity: t >= c.at ? 1 : 0, scale: t >= c.at ? lerp(Math.min(1.05, popAt(t, c.at)), 0.6, 1) : 0.6}}>
                <Slot n={i + 1} label={`${c.n} certificate / logo`} style={{height: 170, borderRadius: 14}} />
                <div style={{textAlign: 'center', fontFamily: GROT, fontWeight: 800, fontSize: 30, marginTop: 8}}>{c.n}</div>
              </div>
            ))}
          </div>
        </Card>
      </Panel>
      <Panel side="right" a={13.0} b={24.6}>
        <Card>
          <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
            <Stat t={t} at={13.46} value={500} suffix="+" label="clients coached" />
            <Stat t={t} at={15.88} value={1} suffix=" lakh+" label="community" />
          </div>
          {t >= 20.6 ? (
            <div style={{marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10}}>
              <Row t={t} at={20.6}>Keep your favourite foods</Row>
              <Row t={t} at={23.42}>No putting life on hold</Row>
            </div>
          ) : null}
        </Card>
      </Panel>
      <Panel side="left" a={17.8} b={24.6}>
        <Slot kind="VIDEO" n={1} label="Client testimonial clip (5–7 s)" style={{height: 420, borderRadius: 24, boxShadow: shadow}} dark />
      </Panel>
      <Panel side="right" a={25.24} b={33.7}>
        <Card>
          <div style={{...MONO, color: '#6F6A62', marginBottom: 14}}>Sounds like you?</div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
            <Row t={t} at={27.2} icon="•" color="#E4A11B">Demanding job</Row>
            <Row t={t} at={28.4} icon="•" color="#E4A11B">Family responsibilities</Row>
            <Row t={t} at={29.42} icon="•" color="#E4A11B">Frequent travel</Row>
            <Row t={t} at={31.26} icon="•" color="#E4A11B">Almost no time for yourself</Row>
          </div>
        </Card>
      </Panel>
      <Panel side="right" a={36.9} b={42.8}>
        <MixLine words={[{text: '_Fitness', start: 37.52}, {text: 'that', start: 37.9}, {text: 'works', start: 38.22}]} size={72} t={t} />
        <MixLine words={[{text: '_around', start: 38.64}, {text: 'your', start: 39.06}, {text: 'life', start: 39.3}]} size={72} t={t} />
      </Panel>

      {/* ---------------- 2. Real clients ---------------- */}
      <Panel side="right" a={46.0} b={56.9}>
        <Card pad={22}>
          <Slot n={2} label="Client 1 before / after (with consent)" style={{height: 330, borderRadius: 16}} />
          <div style={{marginTop: 14, display: 'flex', alignItems: 'baseline', gap: 14}}>
            {t >= 53.97 ? <span style={{fontFamily: ANTON, fontSize: 70, color: INK}}>72 → 66 kg</span> : null}
          </div>
          <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 34, color: '#5A5650'}}>Cabin crew · no kitchen access · ~3 months</div>
        </Card>
      </Panel>
      <Panel side="right" a={57.0} b={65.6}>
        <Card pad={22}>
          <Slot n={3} label="Client 2 before / after (with consent)" style={{height: 330, borderRadius: 16}} />
          <div style={{marginTop: 14}}>{t >= 61.4 ? <span style={{fontFamily: ANTON, fontSize: 70, color: INK}}>85 → 79 kg</span> : null}</div>
          <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 34, color: '#5A5650'}}>Mother of 3 · runs her business · 3 months</div>
        </Card>
      </Panel>
      <Panel side="left" a={65.7} b={70.9}>
        <Slot kind="VIDEO" n={2} label="Client testimonial clip (5 s)" style={{height: 420, borderRadius: 24, boxShadow: shadow}} dark />
      </Panel>
      <Panel side="left" a={70.97} b={80.3} top={760}>
        <div style={{...MONO, fontSize: 20, color: '#FFFFFF', padding: '8px 12px', background: 'rgba(20,20,20,0.7)', display: 'inline-block'}}>Individual results · not a guarantee</div>
      </Panel>

      {/* ---------------- 3. Getting started: Rs 99 call ---------------- */}
      <Panel side="right" a={85.7} b={103.6}>
        <Card>
          <div style={{...MONO, color: '#6F6A62'}}>1:1 Call With Me</div>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 6}}>
            <span style={{fontFamily: ANTON, fontSize: 120, lineHeight: 1, color: INK}}>₹99</span>
          </div>
          {t >= 89.1 ? (
            <div style={{marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12}}>
              <div style={{...MONO, color: BRAND, opacity: tween(t, 89.1, 0.3)}}>You also get</div>
              <Row t={t} at={90.0} icon="+">30 days free · PeakX Planner</Row>
              <Row t={t} at={93.44} icon="+">Women&apos;s Shredding Guide</Row>
            </div>
          ) : null}
        </Card>
      </Panel>
      <Panel side="left" a={90.0} b={103.6}>
        <div style={{display: 'flex', gap: 16}}>
          <Slot n={4} label="PeakX Planner screen" style={{flex: 1, height: 420, borderRadius: 20, boxShadow: shadow}} />
          <div style={{flex: 1, opacity: t >= 93.44 ? 1 : 0.0}}>
            <Slot n={5} label="Women's Shredding Guide cover" style={{height: 420, borderRadius: 20, boxShadow: shadow}} />
          </div>
        </div>
      </Panel>

      {/* ---------------- 4. My story ---------------- */}
      <Panel side="right" a={106.3} b={113.6}>
        <Slot n={6} label="You playing badminton (national level)" style={{height: 520, borderRadius: 24, boxShadow: shadow}} />
      </Panel>
      <Panel side="left" a={108.3} b={119.9}>
        <Slot n={7} label="Knee injury / bed-rest photo" style={{height: 520, borderRadius: 24, boxShadow: shadow}} />
        {t >= 116.5 ? <div style={{marginTop: 14, fontFamily: ANTON, fontSize: 64, color: '#FFFFFF', textShadow: '0 4px 16px rgba(0,0,0,0.6)'}}>+15 KG</div> : null}
      </Panel>
      <Panel side="right" a={120.7} b={130.0}>
        <Slot n={8} label="Your early Instagram posts (2022)" style={{height: 520, borderRadius: 24, boxShadow: shadow}} />
      </Panel>
      <Panel side="left" a={127.6} b={136.0}>
        <Slot n={9} label="DMs from women asking for help (names blurred)" style={{height: 520, borderRadius: 24, boxShadow: shadow}} />
      </Panel>
      <Panel side="right" a={136.9} b={142.2}>
        <Card>
          <div style={{...MONO, color: '#6F6A62', marginBottom: 14}}>Certifications</div>
          <div style={{display: 'flex', gap: 14}}>
            {['NASM', 'ISSA', 'INFS'].map((n, i) => (
              <div key={n} style={{flex: 1}}>
                <Slot n={i + 1} label={`${n}`} style={{height: 150, borderRadius: 14}} />
              </div>
            ))}
          </div>
        </Card>
      </Panel>
      <Panel side="right" a={146.8} b={149.1} top={330}>
        <div style={{borderRadius: 24, overflow: 'hidden', background: '#000', boxShadow: shadow}}>
          <Img src={staticFile('lp/peakx.png')} style={{width: '100%', display: 'block'}} />
        </div>
      </Panel>

      {/* ---------------- 5. How coaching works ---------------- */}
      <Panel side="right" a={151.8} b={258.9}>
        <Card>
          <div style={{...MONO, color: '#6F6A62', marginBottom: 14}}>Your plan</div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
            <Row t={t} at={152.29}>We understand you first</Row>
            <Row t={t} at={164.01}>Personalised training · home or gym</Row>
            <Row t={t} at={170.13}>Cardio guidance</Row>
            <Row t={t} at={171.39}>Meal plan + food alternatives</Row>
            <Row t={t} at={193.91}>Weekly progress check-ins</Row>
            <Row t={t} at={203.53}>24×7 WhatsApp support</Row>
            <Row t={t} at={210.83}>Workout form reviews</Row>
            <Row t={t} at={228.87}>Supplements only from your bloodwork</Row>
            <Row t={t} at={251.25}>Sustainable, long-term</Row>
          </div>
        </Card>
      </Panel>
      <Panel side="left" a={152.0} b={169.9}>
        <Slot n={10} label="Onboarding form / goals questionnaire" style={{height: 600, borderRadius: 24, boxShadow: shadow}} />
      </Panel>
      <Panel side="left" a={170.0} b={192.9}>
        <Slot n={11} label="Sample meal plan / food swaps" style={{height: 600, borderRadius: 24, boxShadow: shadow}} />
        {t >= 178.5 ? <div style={{marginTop: 12, display: 'flex', gap: 10}}>{['Rice', 'Roti', 'Meals out'].map((x) => <span key={x} style={{padding: '6px 16px', borderRadius: 999, background: BRAND, fontFamily: GROT, fontWeight: 800, fontSize: 26, color: '#FFFFFF'}}>{`✓ ${x}`}</span>)}</div> : null}
      </Panel>
      <Panel side="left" a={193.0} b={202.9}>
        <Slot n={12} label="Weekly check-in screen" style={{height: 600, borderRadius: 24, boxShadow: shadow}} />
      </Panel>
      <Panel side="left" a={203.0} b={210.5}>
        <Slot n={13} label="WhatsApp support chat (blurred)" style={{height: 600, borderRadius: 24, boxShadow: shadow}} />
      </Panel>
      <Panel side="left" a={210.6} b={219.5}>
        <Slot kind="VIDEO" n={3} label="Client workout clip + your form feedback" style={{height: 600, borderRadius: 24, boxShadow: shadow}} dark />
      </Panel>
      <Panel side="left" a={219.6} b={236.5}>
        <Slot n={14} label="Bloodwork report (blurred)" style={{height: 600, borderRadius: 24, boxShadow: shadow}} />
      </Panel>

      {/* ---------------- 6. Who this is for ---------------- */}
      <Panel side="right" a={260.2} b={280.9}>
        <Card>
          <div style={{...MONO, color: '#6F6A62', marginBottom: 14}}>Made for</div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
            <Row t={t} at={262.11}>Busy working women</Row>
            <Row t={t} at={263.73}>Lose fat · build strength</Row>
            <Row t={t} at={265.89}>Feel more confident</Row>
            <Row t={t} at={271.27} icon="↺" color="#E4A11B">Dieted before, couldn&apos;t stay consistent</Row>
            <Row t={t} at={275.63} icon="⧗" color="#E4A11B">Know what to do, can&apos;t fit it in</Row>
          </div>
        </Card>
      </Panel>
      <Panel side="left" a={281.4} b={290.9} top={300}>
        <MixLine words={[{text: '_Not', start: 281.65}, {text: 'another', start: 282.23}, {text: 'extreme', start: 282.57}, {text: 'plan', start: 282.97}]} size={60} t={t} />
        <div style={{height: 12}} />
        <MixLine words={[{text: 'Realistic', start: 284.89}, {text: '_+', start: 285.37}, {text: 'Guidance', start: 286.35}]} size={60} t={t} />
      </Panel>

      {/* ---------------- 7. Book your call ---------------- */}
      <Panel side="right" a={295.3} b={999}>
        <Card>
          <div style={{...MONO, color: '#6F6A62'}}>1:1 Call With Me</div>
          <span style={{fontFamily: ANTON, fontSize: 120, lineHeight: 1, color: INK}}>₹99</span>
          <div style={{marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10}}>
            <Row t={t} at={300.36}>Your routine, goals, challenges</Row>
            <Row t={t} at={304.02}>Coaching program walkthrough</Row>
          </div>
          {t >= 308.28 ? (
            <div style={{marginTop: 18, padding: '14px 24px', borderRadius: 999, background: BRAND, textAlign: 'center', fontFamily: GROT, fontWeight: 800, fontSize: 34, color: '#FFFFFF', scale: lerp(Math.min(1.06, popAt(t, 308.28)), 0.7, 1)}}>Book below ↓</div>
          ) : null}
        </Card>
      </Panel>

      <Caps hide={[]} />
    </>
  );
};

export const LpReel: React.FC = () => (
  <Base cfg={cfg}>
    <Scene />
  </Base>
);
