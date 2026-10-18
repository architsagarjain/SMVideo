import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile} from 'remotion';
import {easeInOut, progress} from './anim';
import {C, SANS, SERIF} from './theme';
import {Garland, Icon, WhatsAppGlyph, useTime} from './ui';

// Ten beats, hard-cut on the voiceover (word times from src/data/captions.json). Each beat
// is a full-screen card with one idea in huge type; the offer badge stays on screen from 4 s.

export const BEATS = [
  {id: 'fee', from: 0, to: 3.17, bg: 'cream'},
  {id: 'abNahi', from: 3.17, to: 4.4, bg: 'maroon'},
  {id: 'family', from: 4.4, to: 6.65, bg: 'cream'},
  {id: 'aapJaisa', from: 6.65, to: 9.22, bg: 'maroon'},
  {id: 'biodata', from: 9.22, to: 12.1, bg: 'cream'},
  {id: 'brand', from: 12.1, to: 16.32, bg: 'maroon'},
  {id: 'whatsapp', from: 16.32, to: 18.2, bg: 'blush'},
  {id: 'match', from: 18.2, to: 22.25, bg: 'cream'},
  {id: 'call', from: 22.25, to: 24.8, bg: 'maroon'},
  {id: 'cta', from: 24.8, to: 99, bg: 'maroon'},
] as const;

const BG: Record<string, string> = {
  cream: `radial-gradient(ellipse 90% 60% at 80% 10%, ${C.blush} 0%, rgba(244,218,211,0) 70%), ${C.cream}`,
  blush: `linear-gradient(180deg, #F7DCD5 0%, ${C.blushSoft} 100%)`,
  maroon: `radial-gradient(ellipse 85% 60% at 50% 35%, #8E1B38 0%, ${C.maroonDeep} 100%)`,
};

const overshoot = Easing.bezier(0.34, 1.45, 0.64, 1);
/** Pop-in: scale from `from` to 1 with a small overshoot, plus opacity. */
const pop = (t: number, at: number, dur = 0.32, from = 1.25) => {
  const k = interpolate(t, [at, at + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: overshoot});
  const o = progress(t, at, dur * 0.6);
  return {opacity: o, transform: `scale(${from + (1 - from) * k})`};
};
/** Slide up into place. */
const rise = (t: number, at: number, dist = 60, dur = 0.4) => {
  const k = progress(t, at, dur);
  return {opacity: k, transform: `translateY(${(1 - k) * dist}px)`};
};

const PUNCH: React.CSSProperties = {fontFamily: SANS, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 0.98};
const SOFT: React.CSSProperties = {fontFamily: SERIF, fontStyle: 'italic', fontWeight: 600};

/** Reels-style highlight box behind a word. */
const Mark: React.FC<{bg: string; color: string; children: React.ReactNode; style?: React.CSSProperties}> = ({bg, color, children, style}) => (
  <span style={{background: bg, color, padding: '0.04em 0.22em 0.08em', borderRadius: '0.14em', boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone', ...style}}>
    {children}
  </span>
);

const Center: React.FC<{top: number; children: React.ReactNode; style?: React.CSSProperties}> = ({top, children, style}) => (
  <div style={{position: 'absolute', left: 50, right: 50, top, textAlign: 'center', ...style}}>{children}</div>
);

// ---------------------------------------------------------------------------------------

/** 0–3.17 s · "Rishta dhoondhne ke liye registration fee?" — readable from frame 0. */
const Fee: React.FC<{t: number}> = ({t}) => {
  const settle = progress(t, -0.25, 0.7);
  const tap = (t * 1.4) % 1;
  const punch = 1 + 0.12 * Math.sin(Math.PI * Math.min(1, Math.max(0, (t - 2.3) / 0.28)));
  const amountPulse = 0.5 + 0.5 * Math.sin(Math.max(0, t - 1.5) * 9) * (t > 1.5 ? 1 : 0);
  const cursor = progress(t, 0.6, 1.1, easeInOut);
  return (
    <>
      <Center top={300} style={{transform: `scale(${1.06 - 0.06 * settle})`}}>
        <div style={{...SOFT, fontSize: 64, color: C.maroon}}>Rishta dhoondhne ke liye</div>
        <div style={{...PUNCH, fontSize: 112, color: C.maroonDeep, marginTop: 18}}>Registration</div>
        <div style={{...PUNCH, fontSize: 150, color: C.maroonDeep, marginTop: 44}}>
          <Mark bg={C.red} color="#fff" style={{display: 'inline-block', transform: `scale(${punch}) rotate(${(punch - 1) * -20}deg)`}}>
            fee?
          </Mark>
        </div>
      </Center>
      {/* The fee slip */}
      <div
        style={{
          position: 'absolute',
          left: 170,
          width: 740,
          top: 820,
          borderRadius: 34,
          background: '#fff',
          boxShadow: '0 30px 70px rgba(94,15,36,0.22)',
          padding: '34px 40px',
          fontFamily: SANS,
          transform: `rotate(-3deg) translateY(${(1 - settle) * 80}px)`,
        }}
      >
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <span style={{fontSize: 34, fontWeight: 600, color: C.ink}}>Registration fee</span>
          <span style={{fontSize: 46, fontWeight: 800, color: C.maroon}}>
            <span style={{display: 'inline-block', padding: '4px 14px', borderRadius: 12, background: `rgba(179,18,46,${0.18 * amountPulse})`}}>
              ₹ <span style={{filter: 'blur(10px)'}}>4,999</span>
            </span>
          </span>
        </div>
        <div style={{height: 2, background: C.line, margin: '24px 0'}} />
        <div style={{position: 'relative', height: 100, borderRadius: 20, background: C.maroon, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 40, fontWeight: 700}}>
          PAY NOW
          <div style={{position: 'absolute', right: 120, top: 46, width: 70, height: 70, borderRadius: 999, border: '4px solid rgba(255,255,255,0.8)', opacity: 1 - tap, transform: `scale(${0.4 + tap})`}} />
          {/* A hesitant thumb hovering over PAY NOW */}
          <div style={{position: 'absolute', right: 70 + 200 * (1 - cursor), top: 60 + 120 * (1 - cursor) + 6 * Math.sin(t * 6), fontSize: 76, transform: 'rotate(-18deg)'}}>👆</div>
        </div>
      </div>
    </>
  );
};

/** 3.17–4.4 s · "Ab nahi." — the slip is stamped ₹0 and the offer is named. */
const AbNahi: React.FC<{t: number}> = ({t}) => (
  <>
    <Center top={330} style={pop(t, 3.17, 0.3, 1.6)}>
      <div style={{...PUNCH, fontSize: 220, color: C.creamText}}>Ab nahi.</div>
    </Center>
    <div
      style={{
        position: 'absolute',
        left: 300,
        top: 640,
        width: 480,
        height: 480,
        borderRadius: 999,
        border: `14px solid ${C.goldLight}`,
        boxShadow: `inset 0 0 0 16px ${C.maroonDeep}, inset 0 0 0 22px ${C.goldLight}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        ...pop(t, 3.32, 0.34, 1.8),
        rotate: '-10deg',
      }}
    >
      <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 210, color: C.goldLight, lineHeight: 0.9}}>₹0</div>
      <div style={{...PUNCH, fontSize: 40, color: C.creamText, letterSpacing: '0.06em', marginTop: 14}}>Registration</div>
    </div>
  </>
);

/** 4.4–6.65 s · "Ho sakta hai, abhi koi family…" */
const Family: React.FC<{t: number}> = ({t}) => {
  const scan = progress(t, 4.6, 1.8, easeInOut);
  return (
    <>
      <Center top={360} style={rise(t, 4.42)}>
        <div style={{...SOFT, fontSize: 64, color: C.maroon}}>Ho sakta hai, abhi…</div>
      </Center>
      <Center top={460} style={pop(t, 5.4, 0.32, 1.3)}>
        <div style={{...PUNCH, fontSize: 150, color: C.maroonDeep}}>Koi</div>
        <div style={{...PUNCH, fontSize: 150, color: C.maroonDeep, marginTop: 40}}>
          <Mark bg={C.maroon} color={C.creamText}>family</Mark>
        </div>
      </Center>
      {/* A family looking through profiles */}
      <div style={{position: 'absolute', left: 140, width: 800, top: 860, height: 380, ...rise(t, 4.5, 80)}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, borderRadius: 40, background: '#fff', boxShadow: '0 26px 60px rgba(94,15,36,0.16)'}} />
        <div style={{position: 'absolute', left: 40, top: 40, width: 150, height: 150, borderRadius: 999, background: C.blushSoft, display: 'grid', placeItems: 'center'}}>
          <Icon name="users" size={86} stroke={1.8} draw={progress(t, 4.6, 0.9)} />
        </div>
        <div style={{position: 'absolute', left: 220, top: 58, fontFamily: SANS, color: C.ink}}>
          <div style={{fontSize: 30, fontWeight: 600, color: C.muted, letterSpacing: '0.1em'}}>SEARCHING FOR</div>
          <div style={{fontSize: 52, fontWeight: 800, color: C.maroon}}>A good match</div>
        </div>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{position: 'absolute', left: 40 + i * 245, top: 230, width: 225, height: 110, borderRadius: 22, background: C.cream, border: `2px solid ${C.blush}`, display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px'}}>
            <div style={{width: 56, height: 56, borderRadius: 999, background: ['#E9C9C3', '#E6D4BE', '#D9CFE0'][i]}} />
            <div style={{flex: 1}}>
              <div style={{height: 12, borderRadius: 6, background: '#EADFDC', marginBottom: 10}} />
              <div style={{height: 10, width: '60%', borderRadius: 5, background: '#F1E8E5'}} />
            </div>
          </div>
        ))}
        <div style={{position: 'absolute', top: 205, left: 20 + scan * 640, width: 160, height: 160}}>
          <Icon name="search" size={160} color={C.red} stroke={1.6} />
        </div>
      </div>
    </>
  );
};

/** 6.65–9.22 s · "…bilkul aap jaisa rishta dhoondh rahi ho." */
const AapJaisa: React.FC<{t: number}> = ({t}) => (
  <>
    <Center top={380} style={rise(t, 6.68)}>
      <div style={{...SOFT, fontSize: 70, color: C.creamText}}>bilkul</div>
    </Center>
    <Center top={470} style={pop(t, 7.08, 0.34, 1.35)}>
      <div style={{...PUNCH, fontSize: 190, color: C.goldLight}}>Aap</div>
      <div style={{...PUNCH, fontSize: 190, color: C.goldLight}}>jaisa</div>
    </Center>
    <Center top={880} style={rise(t, 7.68)}>
      <div style={{...PUNCH, fontSize: 80, color: C.creamText}}>rishta dhoondh</div>
      <div style={{...PUNCH, fontSize: 80, color: C.creamText}}>rahi ho</div>
    </Center>
    {/* A heart that "finds" you */}
    <div style={{position: 'absolute', left: 480, top: 1075, width: 120, height: 120, ...pop(t, 8.3, 0.4, 0.4)}}>
      <svg viewBox="0 0 24 24" width={120} height={120}>
        <path d="M12 21s-7.5-4.6-9.5-9.2C1 8.3 3.3 4.5 7 4.5c2 0 3.6 1.1 5 2.8c1.4-1.7 3-2.8 5-2.8c3.7 0 6 3.8 4.5 7.3C19.5 16.4 12 21 12 21z" fill={C.goldLight} />
      </svg>
    </div>
  </>
);

/** 9.22–12.1 s · "Bas aapka biodata wahan hona chahiye." */
const Biodata: React.FC<{t: number}> = ({t}) => {
  const zoom = 1.04 + 0.05 * progress(t, 9.3, 2.8, easeInOut);
  return (
    <>
      <Center top={340} style={rise(t, 9.28)}>
        <div style={{...PUNCH, fontSize: 132, color: C.maroonDeep}}>Bas aapka</div>
      </Center>
      <Center top={500} style={pop(t, 9.98, 0.34, 1.3)}>
        <div style={{...PUNCH, fontSize: 168, color: C.maroonDeep}}>
          <Mark bg={C.red} color="#fff">Biodata</Mark>
        </div>
      </Center>
      <div
        style={{
          position: 'absolute',
          left: 90,
          width: 900,
          top: 745,
          height: 395,
          borderRadius: 40,
          overflow: 'hidden',
          boxShadow: '0 30px 70px rgba(94,15,36,0.25)',
          ...rise(t, 9.4, 90, 0.5),
        }}
      >
        <Img src={staticFile('photos/biodata_envelope.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})`}} />
      </div>
      <Center top={1165} style={rise(t, 10.48, 30)}>
        <div style={{display: 'inline-flex', alignItems: 'center', gap: 14, ...PUNCH, fontSize: 58, color: C.maroon}}>
          <Icon name="check" size={58} color={C.waDark} stroke={3.4} /> wahan hona chahiye
        </div>
      </Center>
    </>
  );
};

/** 12.1–16.32 s · "Shaadi Mangalam par apna biodata bilkul free register karein." */
const Brand: React.FC<{t: number}> = ({t}) => {
  const logo = progress(t, 12.15, 0.6);
  const sheen = progress(t, 15.2, 0.8, easeInOut);
  return (
    <>
      <Garland appear={12.15} />
      <Img
        src={staticFile('brand/logo_cream.png')}
        style={{position: 'absolute', width: 300, left: 390, top: 270, opacity: logo, transform: `scale(${0.92 + 0.08 * logo})`}}
      />
      <Center top={640} style={rise(t, 13.38, 40)}>
        <div style={{...SOFT, fontSize: 66, color: C.creamText}}>
          par apna biodata <span style={{opacity: progress(t, 14.4, 0.3)}}>bilkul</span>
        </div>
      </Center>
      <Center top={760} style={pop(t, 14.9, 0.36, 1.5)}>
        <div style={{...PUNCH, fontSize: 250, lineHeight: 0.9}}>
          <span
            style={{
              color: 'transparent',
              backgroundImage: `linear-gradient(100deg, ${C.goldLight} ${sheen * 130 - 30}%, #FFF4D8 ${sheen * 130 - 15}%, ${C.goldLight} ${sheen * 130}%)`,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
            }}
          >
            Free
          </span>
        </div>
      </Center>
      <Center top={995} style={rise(t, 15.12, 40)}>
        <div style={{...PUNCH, fontSize: 92, color: C.creamText, letterSpacing: '0.04em'}}>Registration</div>
      </Center>
      <Center top={1125} style={rise(t, 15.5, 30)}>
        <div style={{fontFamily: SANS, fontSize: 40, fontWeight: 500, color: C.creamText, opacity: 0.9}}>No fee · No long forms</div>
      </Center>
    </>
  );
};

// A realistic phone shell; children fill the screen.
const Phone: React.FC<{left: number; top: number; width: number; children: React.ReactNode; style?: React.CSSProperties}> = ({left, top, width, children, style}) => {
  const h = width * 2.05;
  return (
    <div style={{position: 'absolute', left, top, width, height: h, borderRadius: width * 0.14, background: '#16121A', padding: width * 0.035, boxShadow: '0 40px 90px rgba(40,10,18,0.40), inset 0 0 0 3px #3A3340', ...style}}>
      <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: width * 0.11, overflow: 'hidden', background: '#fff'}}>
        {children}
        <div style={{position: 'absolute', top: width * 0.03, left: '50%', width: width * 0.28, height: width * 0.075, marginLeft: -width * 0.14, borderRadius: 999, background: '#000'}} />
      </div>
    </div>
  );
};

/** 16.32–18.2 s · "Bas WhatsApp par bhejiye." — the action, shown big. */
const WhatsAppBeat: React.FC<{t: number}> = ({t}) => {
  const sent = progress(t, 16.95, 0.35);
  const read = progress(t, 17.6, 0.2);
  const tap = progress(t, 16.75, 0.3);
  return (
    <>
      <Center top={330} style={rise(t, 16.36)}>
        <div style={{...PUNCH, fontSize: 96, color: C.maroonDeep}}>
          Bas <Mark bg={C.wa} color="#fff">WhatsApp</Mark>
        </div>
        <div style={{...PUNCH, fontSize: 96, color: C.maroonDeep, marginTop: 30}}>par bhejiye</div>
      </Center>
      <Phone left={290} top={590} width={500} style={rise(t, 16.32, 120, 0.45)}>
        <div style={{position: 'absolute', inset: 0, background: C.waBg, fontFamily: SANS}}>
          <div style={{height: 150, background: C.waDark, display: 'flex', alignItems: 'flex-end', gap: 14, padding: '0 20px 18px', color: '#fff'}}>
            <div style={{width: 64, height: 64, borderRadius: 999, background: '#fff', display: 'grid', placeItems: 'center'}}>
              <Img src={staticFile('brand/logo_red.png')} style={{width: 46}} />
            </div>
            <div>
              <div style={{fontSize: 28, fontWeight: 600}}>Shaadi Mangalam</div>
              <div style={{fontSize: 18, opacity: 0.85}}>online</div>
            </div>
          </div>
          <div style={{margin: '24px 18px', display: 'inline-block', background: '#fff', borderRadius: '4px 18px 18px 18px', padding: '12px 16px', fontSize: 23}}>
            Namaste 🙏 Apna biodata bhejiye.
          </div>
          <div
            style={{
              position: 'absolute',
              right: 18,
              top: 290,
              width: 360,
              background: C.waBubble,
              borderRadius: '18px 4px 18px 18px',
              padding: 12,
              opacity: sent,
              transform: `translateY(${(1 - sent) * 260}px) scale(${0.85 + 0.15 * sent})`,
              transformOrigin: 'right bottom',
            }}
          >
            <div style={{display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.7)', borderRadius: 12, padding: 12}}>
              <div style={{width: 52, height: 62, borderRadius: 6, background: '#E44C3C', color: '#fff', fontSize: 16, fontWeight: 700, display: 'grid', placeItems: 'center'}}>PDF</div>
              <div>
                <div style={{fontSize: 26, fontWeight: 600}}>Biodata.pdf</div>
                <div style={{fontSize: 18, color: C.muted}}>2 pages</div>
              </div>
            </div>
            <div style={{textAlign: 'right', fontSize: 17, color: C.muted, marginTop: 6}}>
              10:42 <span style={{color: read > 0.5 ? '#34B7F1' : '#8C9A93', fontWeight: 700, letterSpacing: '-0.3em'}}>✓✓</span>
            </div>
          </div>
          {/* input bar + send button with a tap */}
          <div style={{position: 'absolute', left: 14, right: 14, bottom: 22, display: 'flex', gap: 10, alignItems: 'center'}}>
            <div style={{flex: 1, height: 70, borderRadius: 999, background: '#fff', display: 'flex', alignItems: 'center', padding: '0 22px', fontSize: 22, color: C.muted}}>
              {sent > 0 ? 'Message' : '📎 Biodata.pdf'}
            </div>
            <div style={{position: 'relative', width: 70, height: 70, borderRadius: 999, background: C.wa, display: 'grid', placeItems: 'center', color: '#fff', fontSize: 30}}>
              ➤
              <div style={{position: 'absolute', inset: -10, borderRadius: 999, border: '4px solid rgba(29,170,97,0.6)', opacity: tap > 0 && tap < 1 ? 1 - tap : 0, transform: `scale(${1 + tap})`}} />
            </div>
          </div>
        </div>
      </Phone>
    </>
  );
};

/** 18.2–22.25 s · "Agar aapki profile kisi family ki requirement se match hui," */
const Match: React.FC<{t: number}> = ({t}) => {
  const snap = progress(t, 21.25, 0.35, easeInOut);
  const gap = 90 * (1 - snap);
  return (
    <>
      <Center top={330} style={rise(t, 18.24)}>
        <div style={{...SOFT, fontSize: 62, color: C.maroon}}>Agar aapki profile</div>
      </Center>
      <Center top={420} style={rise(t, 19.66)}>
        <div style={{...SOFT, fontSize: 62, color: C.maroon}}>family ki requirement se</div>
      </Center>
      <Center top={540} style={pop(t, 21.27, 0.34, 1.5)}>
        <div style={{...PUNCH, fontSize: 132, color: C.maroonDeep}}>
          <Mark bg={C.red} color="#fff">Match</Mark> hui
        </div>
      </Center>
      {/* Your profile + the family's requirement, snapping together on "match" */}
      <div style={{position: 'absolute', left: 60 - gap, top: 800, width: 450, height: 300, borderRadius: 34, background: '#fff', boxShadow: '0 22px 50px rgba(94,15,36,0.16)', padding: 30, fontFamily: SANS, ...rise(t, 18.35, 80)}}>
        <div style={{fontSize: 24, fontWeight: 700, letterSpacing: '0.1em', color: C.muted}}>AAPKI PROFILE</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 20}}>
          <div style={{width: 92, height: 92, borderRadius: 999, background: C.blush, display: 'grid', placeItems: 'center'}}>
            <Icon name="user" size={50} />
          </div>
          <div style={{flex: 1}}>
            <div style={{height: 16, borderRadius: 8, background: '#EADFDC', marginBottom: 12}} />
            <div style={{height: 12, width: '60%', borderRadius: 6, background: '#F1E8E5'}} />
          </div>
        </div>
        <div style={{marginTop: 26, display: 'inline-flex', gap: 8, alignItems: 'center', padding: '10px 18px', borderRadius: 999, background: '#E3F6EA', color: C.waDark, fontSize: 26, fontWeight: 700}}>
          <Icon name="check" size={26} color={C.waDark} stroke={3} /> FREE registered
        </div>
      </div>
      <div style={{position: 'absolute', left: 570 + gap, top: 800, width: 450, height: 300, borderRadius: 34, background: '#fff', boxShadow: '0 22px 50px rgba(94,15,36,0.16)', padding: 30, fontFamily: SANS, ...rise(t, 19.6, 80)}}>
        <div style={{fontSize: 24, fontWeight: 700, letterSpacing: '0.1em', color: C.muted}}>FAMILY KI REQUIREMENT</div>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 24}}>
          {['26–30 yrs', 'Pune', 'Professional'].map((c, i) => (
            <span key={c} style={{padding: '10px 20px', borderRadius: 999, background: C.blushSoft, border: `2px solid ${C.blush}`, color: C.maroon, fontSize: 28, fontWeight: 600, ...pop(t, 20.6 + i * 0.12, 0.3, 0.6)}}>
              {c}
            </span>
          ))}
        </div>
      </div>
      <div style={{position: 'absolute', left: 470, top: 880, width: 140, height: 140, borderRadius: 999, background: C.red, display: 'grid', placeItems: 'center', boxShadow: '0 14px 40px rgba(179,18,46,0.45)', border: '6px solid #fff', ...pop(t, 21.45, 0.35, 0.3)}}>
        <svg viewBox="0 0 24 24" width={74} height={74}>
          <path d="M12 21s-7.5-4.6-9.5-9.2C1 8.3 3.3 4.5 7 4.5c2 0 3.6 1.1 5 2.8c1.4-1.7 3-2.8 5-2.8c3.7 0 6 3.8 4.5 7.3C19.5 16.4 12 21 12 21z" fill="#fff" />
        </svg>
      </div>
    </>
  );
};

/** 22.25–24.8 s · "toh hamari team aapko call karegi." */
const Call: React.FC<{t: number}> = ({t}) => {
  const shake = t > 22.5 ? Math.sin(t * 70) * 5 * (Math.sin(t * 6) > 0.3 ? 1 : 0) : 0;
  const ring = (t - 22.4) * 1.5;
  return (
    <>
      <Center top={320} style={rise(t, 22.3)}>
        <div style={{...SOFT, fontSize: 64, color: C.creamText}}>toh hamari team aapko</div>
      </Center>
      <Center top={415} style={pop(t, 23.62, 0.34, 1.5)}>
        <div style={{...PUNCH, fontSize: 120, color: C.goldLight}}>Call karegi</div>
      </Center>
      <Phone left={290} top={590} width={500} style={{...rise(t, 22.3, 140, 0.45), rotate: `${shake * 0.3}deg`, translate: `${shake}px 0`}}>
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #3A2430 0%, #1C1218 100%)', fontFamily: SANS, color: '#fff', textAlign: 'center'}}>
          <div style={{marginTop: 120, fontSize: 24, opacity: 0.75}}>Incoming call</div>
          <div style={{margin: '26px auto 0', width: 150, height: 150, borderRadius: 999, background: '#fff', display: 'grid', placeItems: 'center', position: 'relative'}}>
            <Img src={staticFile('brand/logo_red.png')} style={{width: 110}} />
            {[0, 1].map((i) => {
              const r = ring - i * 0.5;
              const rk = r > 0 ? r % 1 : 0;
              return <div key={i} style={{position: 'absolute', inset: -8, borderRadius: 999, border: '3px solid rgba(255,255,255,0.6)', opacity: r > 0 ? 1 - rk : 0, transform: `scale(${1 + 0.5 * rk})`}} />;
            })}
          </div>
          <div style={{marginTop: 26, fontSize: 40, fontWeight: 700}}>Shaadi Mangalam</div>
          <div style={{fontSize: 26, opacity: 0.8}}>Matchmaking Team</div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', justifyContent: 'space-around'}}>
            <div style={{width: 104, height: 104, borderRadius: 999, background: '#E5484D', display: 'grid', placeItems: 'center', transform: 'rotate(135deg)'}}>
              <Icon name="phone" size={50} color="#fff" />
            </div>
            <div style={{width: 104, height: 104, borderRadius: 999, background: C.wa, display: 'grid', placeItems: 'center', transform: `scale(${1 + 0.08 * Math.max(0, Math.sin(t * 8))})`}}>
              <Icon name="phone" size={50} color="#fff" />
            </div>
          </div>
        </div>
      </Phone>
    </>
  );
};

/** 24.8 s → end · "Aaj hi apna biodata WhatsApp par bhejiye." */
const Cta: React.FC<{t: number}> = ({t}) => {
  const btn = pop(t, 25.15, 0.36, 0.6);
  const pulse = Math.max(0, Math.sin(Math.PI * ((t - 26.65) % 1.1) / 1.1)) * (t > 26.65 ? 1 : 0);
  const bob = Math.sin(t * 5) * 10;
  return (
    <>
      {/* The family photo fills the lower half, fading up into maroon. */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 900, bottom: 0, ...rise(t, 24.85, 60, 0.6)}}>
        <Img src={staticFile('photos/family.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 20%'}} />
        <div style={{position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${C.maroonDeep} 0%, rgba(94,15,36,0.55) 28%, rgba(94,15,36,0.15) 60%, rgba(94,15,36,0.35) 100%)`}} />
      </div>
      <Img src={staticFile('brand/logo_cream.png')} style={{position: 'absolute', width: 190, left: 445, top: 240, ...rise(t, 24.82, 30)}} />
      <Center top={470} style={pop(t, 24.88, 0.34, 1.4)}>
        <div style={{...PUNCH, fontSize: 168, color: C.goldLight}}>Aaj hi</div>
      </Center>
      <Center top={640} style={rise(t, 25.68)}>
        <div style={{...PUNCH, fontSize: 70, color: C.creamText}}>apna biodata bhejiye</div>
      </Center>
      <div
        style={{
          position: 'absolute',
          left: 110,
          width: 860,
          top: 760,
          height: 140,
          borderRadius: 999,
          background: `linear-gradient(180deg, #25C46F, ${C.waDark})`,
          boxShadow: `0 20px 50px rgba(0,0,0,0.35), 0 0 0 ${14 * pulse}px rgba(37,196,111,${0.3 * pulse})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 22,
          fontFamily: SANS,
          fontWeight: 800,
          fontSize: 50,
          color: '#fff',
          ...btn,
        }}
      >
        <WhatsAppGlyph size={84} bg="rgba(255,255,255,0.18)" />
        WhatsApp par bhejiye
      </div>
      <Center top={935} style={rise(t, 25.6, 30)}>
        <div style={{display: 'inline-block', padding: '12px 30px', borderRadius: 999, background: 'rgba(94,15,36,0.75)', fontFamily: SANS, fontWeight: 700, fontSize: 38, color: C.goldLight}}>
          100% FREE · Bas 1 message
        </div>
      </Center>
      <Center top={1060} style={{opacity: progress(t, 26.2, 0.4)}}>
        <div style={{display: 'inline-block', padding: '14px 34px', borderRadius: 999, background: '#fff', fontFamily: SANS, fontWeight: 700, fontSize: 38, color: C.maroonDeep, boxShadow: '0 12px 30px rgba(0,0,0,0.3)'}}>
          Neeche “Send Message” dabaiye
        </div>
        <div style={{marginTop: 14, transform: `translateY(${bob}px)`}}>
          <svg width={90} height={90} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 4v15M5 12l7 7 7-7" />
          </svg>
        </div>
      </Center>
    </>
  );
};

const VIEWS: Record<string, React.FC<{t: number}>> = {
  fee: Fee, abNahi: AbNahi, family: Family, aapJaisa: AapJaisa, biodata: Biodata,
  brand: Brand, whatsapp: WhatsAppBeat, match: Match, call: Call, cta: Cta,
};

/** Renders the beat on screen at time t, with a short push-in so every cut has motion. */
export const BeatStage: React.FC = () => {
  const t = useTime();
  const beat = BEATS.find((b) => t >= b.from && t < b.to) ?? BEATS[BEATS.length - 1];
  const View = VIEWS[beat.id];
  const push = 1 + 0.025 * progress(t, beat.from, Math.min(beat.to - beat.from, 4), easeInOut);
  return (
    <AbsoluteFill style={{background: BG[beat.bg]}}>
      {beat.id !== 'cta' ? (
        <Img
          src={staticFile('brand/lotus_mark.png')}
          style={{position: 'absolute', width: 820, left: 130, top: 1380, opacity: beat.bg === 'maroon' ? 0.06 : 0.07, filter: beat.bg === 'maroon' ? 'brightness(3)' : undefined}}
        />
      ) : null}
      <AbsoluteFill style={{transform: `scale(${push})`}}>
        <View t={t} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** The offer, always visible from 4 s until the end card (hidden while the brand beat says it big). */
export const OfferBadge: React.FC = () => {
  const t = useTime();
  const show = progress(t, 3.95, 0.35) * (1 - progress(t, 24.7, 0.2));
  const hideForBrand = t >= 12.1 && t < 16.32 ? 0 : 1;
  if (show <= 0 || !hideForBrand) return null;
  const k = interpolate(t, [3.95, 4.3], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: overshoot});
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 200, display: 'flex', justifyContent: 'center', opacity: show}}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '12px 30px 12px 14px',
          borderRadius: 999,
          background: C.maroonDeep,
          border: `3px solid ${C.goldLight}`,
          boxShadow: '0 10px 26px rgba(40,10,18,0.35)',
          transform: `scale(${0.6 + 0.4 * k})`,
        }}
      >
        <div style={{width: 54, height: 54, borderRadius: 999, background: C.goldLight, display: 'grid', placeItems: 'center'}}>
          <Icon name="check" size={34} color={C.maroonDeep} stroke={3.4} />
        </div>
        <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 36, letterSpacing: '0.06em', color: C.creamText}}>FREE REGISTRATION</span>
      </div>
    </div>
  );
};

/** Fine film grain over everything, so the flat graphics feel less digital. */
export const Grain: React.FC = () => {
  const t = useTime();
  const f = Math.floor(t * 30) % 4;
  return (
    <Img
      src={staticFile('grain.png')}
      style={{position: 'absolute', inset: 0, width: 1080, height: 1920, opacity: 0.5, mixBlendMode: 'overlay', transform: `translate(${(f % 2) * 3}px, ${Math.floor(f / 2) * 3}px)`}}
    />
  );
};
