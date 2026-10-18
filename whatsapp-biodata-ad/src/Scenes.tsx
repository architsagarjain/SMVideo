import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {easeInOut, lerp, progress} from './anim';
import {C, HEAD_TOP, SANS, SCENES, SERIF, VIS_TOP} from './theme';
import {Card, Chip, Garland, Headline, Icon, Scene, WhatsAppGlyph, useTime} from './ui';

// Cue times come from the voiceover word timings (src/data/captions.json).

// 1 · Hook — "Rishta dhoondhne ke liye registration fee? … Ab nahi."
export const HookScene: React.FC = () => {
  const t = useTime();
  const feeHi = progress(t, 1.5, 0.4) * (1 - progress(t, 3.1, 0.2));
  const strike = progress(t, 3.17, 0.3, easeInOut);
  const stamp = progress(t, 3.2, 0.42);
  return (
    <Scene range={SCENES.hook}>
      <div style={{position: 'absolute', left: 0, right: 0, top: HEAD_TOP, textAlign: 'center'}}>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 600, fontSize: 52, color: C.muted, opacity: progress(t, 0.05, 0.5)}}>
          Rishta dhoondhne ke liye
        </div>
      </div>
      <Headline lines={[[{text: 'Registration fee?'}]]} at={1.45} top={HEAD_TOP + 80} size={98} />
      <Card style={{left: 140, width: 800, top: VIS_TOP, padding: '36px 46px', opacity: 1 - 0.35 * strike}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24}}>
          <div style={{width: 64, height: 64, borderRadius: 999, background: '#EEE6E3', display: 'grid', placeItems: 'center'}}>
            <Icon name="user" size={34} color="#A99094" />
          </div>
          <div>
            <div style={{fontWeight: 600, fontSize: 32}}>Create your profile</div>
            <div style={{fontSize: 24, color: C.muted}}>Matrimony sign-up</div>
          </div>
        </div>
        {['Full name'].map((label, i) => (
          <div key={label} style={{marginBottom: 18}}>
            <div style={{fontSize: 22, color: C.muted, marginBottom: 6}}>{label}</div>
            <div style={{height: 54, borderRadius: 14, background: '#F5F0EE', border: '1px solid #EADFDC', overflow: 'hidden'}}>
              <div style={{height: '100%', width: `${lerp(t, [0.3 + i * 0.35, 1.1 + i * 0.35], [0, i ? 38 : 56])}%`, background: '#EADFDC'}} />
            </div>
          </div>
        ))}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '18px 22px',
            margin: '18px -22px 18px',
            borderRadius: 16,
            background: `rgba(244, 218, 211, ${0.9 * feeHi})`,
          }}
        >
          <span style={{fontSize: 30, fontWeight: 600}}>Registration fee</span>
          <span style={{fontSize: 32, fontWeight: 700, color: C.maroon}}>
            ₹ <span style={{filter: 'blur(9px)'}}>4,999</span>
          </span>
          <Strike k={strike} />
        </div>
        <div
          style={{
            position: 'relative',
            height: 84,
            borderRadius: 18,
            background: '#B79AA1',
            color: '#fff',
            fontSize: 32,
            fontWeight: 600,
            display: 'grid',
            placeItems: 'center',
          }}
        >
          Pay &amp; Register →
          <Strike k={progress(t, 3.3, 0.3, easeInOut)} />
        </div>
      </Card>
      {/* The stamp: ₹0 · AB NAHI */}
      <div
        style={{
          position: 'absolute',
          left: 640,
          top: VIS_TOP + 250,
          width: 270,
          height: 270,
          borderRadius: 999,
          border: `7px solid ${C.gold}`,
          boxShadow: `inset 0 0 0 9px #FFF8EE, inset 0 0 0 12px ${C.gold}`,
          background: '#FFF8EE',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: Math.min(1, stamp * 2),
          transform: `rotate(-12deg) scale(${1.35 - 0.35 * stamp})`,
          filter: `drop-shadow(0 ${14 * stamp}px ${24 * stamp}px rgba(94,15,36,0.25))`,
        }}
      >
        <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 92, color: C.maroon, lineHeight: 1}}>₹0</div>
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 30, letterSpacing: '0.18em', color: C.gold, marginTop: 6}}>AB NAHI</div>
      </div>
    </Scene>
  );
};

const Strike: React.FC<{k: number}> = ({k}) => (
  <div
    style={{
      position: 'absolute',
      left: 10,
      top: '50%',
      height: 6,
      width: `calc(${k * 100}% - 20px)`,
      background: C.red,
      borderRadius: 3,
      transform: 'rotate(-2deg)',
    }}
  />
);

// 2 · Hope — "Ho sakta hai, abhi koi family bilkul aap jaisa rishta dhoondh rahi ho."
export const HopeScene: React.FC = () => {
  const t = useTime();
  const chips = [
    {label: '26–30 yrs', at: 5.0},
    {label: 'Pune', at: 5.45},
    {label: 'Working professional', at: 6.2},
    {label: 'Family-oriented', at: 6.75},
  ];
  const searching = progress(t, 7.6, 0.4);
  return (
    <Scene range={SCENES.hope}>
      <Headline
        lines={[[{text: 'Koi family '}, {text: 'aap jaisa', accent: true}], [{text: 'rishta dhoondh rahi ho…'}]]}
        at={4.5}
        top={HEAD_TOP}
        size={78}
      />
      <Card style={{left: 110, width: 860, top: VIS_TOP + 20, padding: '40px 44px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
          <div style={{width: 84, height: 84, borderRadius: 999, background: C.blushSoft, display: 'grid', placeItems: 'center'}}>
            <Icon name="users" size={44} draw={progress(t, 4.6, 0.8)} />
          </div>
          <div>
            <div style={{fontSize: 24, color: C.muted, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600}}>A family is</div>
            <div style={{fontFamily: SERIF, fontSize: 44, fontWeight: 700, color: C.maroon}}>Looking for a match</div>
          </div>
        </div>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 34, minHeight: 150}}>
          {chips.map((c) => (
            <Chip key={c.label} k={progress(t, c.at, 0.4)}>
              <Icon name="check" size={26} color={C.red} stroke={2.6} />
              {c.label}
            </Chip>
          ))}
        </div>
        <div
          style={{
            marginTop: 26,
            height: 86,
            borderRadius: 999,
            background: C.cream,
            border: `1.5px solid ${C.line}`,
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            padding: '0 30px',
            opacity: searching,
          }}
        >
          <Icon name="search" size={36} color={C.maroon} />
          <span style={{fontSize: 30, color: C.muted}}>
            Searching profiles{'.'.repeat(1 + (Math.floor(t * 3) % 3))}
          </span>
        </div>
      </Card>
    </Scene>
  );
};

// 3 · The gap — "Bas aapka biodata wahan hona chahiye."
export const GapScene: React.FC = () => {
  const t = useTime();
  const drift = lerp(t, [9.2, 12], [0, -36], easeInOut);
  const pulse = 0.5 + 0.5 * Math.sin((t - 10.5) * 5);
  const slot = progress(t, 10.4, 0.5);
  const profiles = [
    {i: 'A', c: '#E9C9C3'}, {i: 'R', c: '#E6D4BE'}, {i: 'S', c: '#D9CFE0'}, {i: 'P', c: '#CFE0D6'}, {i: 'N', c: '#E0D3C9'},
  ];
  return (
    <Scene range={SCENES.gap}>
      <Headline lines={[[{text: 'Kya aapka biodata'}], [{text: 'wahan', accent: true}, {text: ' hai?'}]]} at={9.3} top={HEAD_TOP} size={80} />
      <div style={{position: 'absolute', left: 110, width: 860, top: VIS_TOP + 30, transform: `translateY(${drift}px)`}}>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24}}>
          {profiles.map((p, n) => (
            <div
              key={n}
              style={{
                height: 150,
                borderRadius: 26,
                background: '#fff',
                border: `1px solid ${C.line}`,
                boxShadow: '0 12px 30px rgba(94,15,36,0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                padding: '0 24px',
                opacity: progress(t, 9.3 + n * 0.08, 0.4),
              }}
            >
              <div style={{width: 76, height: 76, borderRadius: 999, background: p.c, display: 'grid', placeItems: 'center', fontFamily: SERIF, fontSize: 36, fontWeight: 700, color: '#fff'}}>
                {p.i}
              </div>
              <div style={{flex: 1}}>
                <div style={{height: 16, width: '80%', borderRadius: 8, background: '#EADFDC', marginBottom: 12}} />
                <div style={{height: 12, width: '55%', borderRadius: 6, background: '#F1E8E5'}} />
              </div>
            </div>
          ))}
          {/* The empty slot that should hold the viewer's biodata. */}
          <div
            style={{
              height: 150,
              borderRadius: 26,
              border: `3px dashed rgba(179, 18, 46, ${0.35 + 0.4 * pulse * slot})`,
              background: `rgba(244, 218, 211, ${0.35 * slot})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              opacity: slot,
              transform: `scale(${1 + 0.03 * pulse * slot})`,
            }}
          >
            <span style={{fontFamily: SERIF, fontSize: 64, fontWeight: 700, color: C.red}}>?</span>
            <span style={{fontSize: 28, fontWeight: 600, color: C.maroon}}>Your biodata</span>
          </div>
        </div>
      </div>
    </Scene>
  );
};

// 4 · Brand + FREE — "Shaadi Mangalam par apna biodata bilkul free register karein."
export const BrandScene: React.FC = () => {
  const t = useTime();
  const logo = progress(t, 12.15, 0.9);
  const free = progress(t, 14.9, 0.55);
  const sub = progress(t, 15.35, 0.5);
  const sheen = progress(t, 15.1, 0.9, easeInOut);
  return (
    <AbsoluteFill>
      <Garland appear={12.3} />
      <Img
        src={staticFile('brand/logo_cream.png')}
        style={{
          position: 'absolute',
          width: 360,
          left: 360,
          top: 380,
          opacity: logo,
          transform: `translateY(${(1 - logo) * 24}px) scale(${0.96 + 0.04 * logo})`,
          filter: `drop-shadow(0 0 ${30 * logo}px rgba(241,198,110,0.25))`,
        }}
      />
      <div style={{position: 'absolute', left: 0, right: 0, top: 860, textAlign: 'center'}}>
        <div
          style={{
            display: 'inline-block',
            fontFamily: SANS,
            fontWeight: 700,
            fontSize: 66,
            letterSpacing: '0.16em',
            color: 'transparent',
            backgroundImage: `linear-gradient(100deg, ${C.goldLight} ${sheen * 130 - 30}%, #FFF3D6 ${sheen * 130 - 15}%, ${C.goldLight} ${sheen * 130}%)`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            opacity: free,
            transform: `scale(${0.92 + 0.08 * free})`,
          }}
        >
          FREE REGISTRATION
        </div>
        <div style={{marginTop: 22, fontFamily: SANS, fontSize: 34, color: C.creamText, opacity: sub, letterSpacing: '0.02em'}}>
          No forms &nbsp;·&nbsp; No fee &nbsp;·&nbsp; Bas ek WhatsApp
        </div>
      </div>
    </AbsoluteFill>
  );
};

// 5 · WhatsApp — "Bas WhatsApp par bhejiye."
export const WhatsAppScene: React.FC = () => {
  const t = useTime();
  const sent = progress(t, 16.9, 0.45);
  const read = progress(t, 17.65, 0.25);
  return (
    <Scene range={SCENES.whatsapp}>
      <Headline lines={[[{text: 'Bas ek '}, {text: 'WhatsApp', accent: true}, {text: ' message'}]]} at={16.35} top={HEAD_TOP + 30} size={74} />
      <Card style={{left: 120, width: 840, top: VIS_TOP - 20, height: 520, overflow: 'hidden', padding: 0}}>
        <div style={{height: 120, background: C.waDark, display: 'flex', alignItems: 'center', gap: 20, padding: '0 30px', color: '#fff'}}>
          <div style={{width: 76, height: 76, borderRadius: 999, background: '#fff', display: 'grid', placeItems: 'center', overflow: 'hidden'}}>
            <Img src={staticFile('brand/logo_red.png')} style={{width: 58}} />
          </div>
          <div>
            <div style={{fontSize: 34, fontWeight: 600}}>Shaadi Mangalam</div>
            <div style={{fontSize: 22, opacity: 0.85}}>online</div>
          </div>
        </div>
        <div style={{position: 'relative', height: 400, background: C.waBg, padding: 28}}>
          <div style={{display: 'inline-block', background: '#fff', borderRadius: '6px 22px 22px 22px', padding: '16px 22px', fontSize: 28, boxShadow: '0 1px 2px rgba(0,0,0,0.08)'}}>
            Namaste 🙏 Apna biodata yahan bhejiye.
          </div>
          <div
            style={{
              position: 'absolute',
              right: 28,
              top: 140,
              width: 470,
              background: C.waBubble,
              borderRadius: '22px 6px 22px 22px',
              padding: 18,
              boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
              opacity: sent,
              transform: `translateX(${(1 - sent) * 60}px) scale(${0.9 + 0.1 * sent})`,
              transformOrigin: 'right top',
            }}
          >
            <div style={{display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(255,255,255,0.65)', borderRadius: 14, padding: 16}}>
              <div style={{width: 62, height: 74, borderRadius: 8, background: '#E44C3C', color: '#fff', fontSize: 18, fontWeight: 700, display: 'grid', placeItems: 'center'}}>PDF</div>
              <div>
                <div style={{fontSize: 30, fontWeight: 600}}>Biodata.pdf</div>
                <div style={{fontSize: 22, color: C.muted}}>2 pages · PDF</div>
              </div>
            </div>
            <div style={{textAlign: 'right', fontSize: 20, color: C.muted, marginTop: 8}}>
              10:42{' '}
              <span style={{color: read > 0.5 ? '#34B7F1' : '#8C9A93', fontWeight: 700, letterSpacing: '-0.3em'}}>✓✓</span>
            </div>
          </div>
        </div>
      </Card>
    </Scene>
  );
};

// 6 · Match — "Agar aapki profile kisi family ki requirement se match hui,
//               toh hamari team aapko call karegi."
export const MatchScene: React.FC = () => {
  const t = useTime();
  const together = progress(t, 21.2, 0.6, easeInOut);
  const line = progress(t, 21.3, 0.5);
  const heart = progress(t, 21.55, 0.45);
  const call = progress(t, 22.3, 0.55);
  const ring = (t - 23.6) * 1.6;
  const reqHi = progress(t, 20.6, 0.4);
  const gap = 70 * (1 - together);
  return (
    <Scene range={SCENES.match}>
      <Headline lines={[[{text: 'Potential Match'}], [{text: 'Consideration', accent: true}]]} at={18.25} top={HEAD_TOP} size={80} />
      <div style={{position: 'absolute', left: 0, right: 0, top: VIS_TOP, height: 400, transform: `translateY(${-30 * call}px)`}}>
        {/* Your profile */}
        <Card style={{left: 70 - gap, width: 420, top: 0, padding: 30, opacity: progress(t, 18.9, 0.5)}}>
          <div style={{fontSize: 22, fontWeight: 600, letterSpacing: '0.12em', color: C.muted, textTransform: 'uppercase'}}>Aapki profile</div>
          <div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 18}}>
            <div style={{width: 84, height: 84, borderRadius: 999, background: C.blush, display: 'grid', placeItems: 'center'}}>
              <Icon name="user" size={44} />
            </div>
            <div style={{flex: 1}}>
              <div style={{height: 16, width: '90%', borderRadius: 8, background: '#EADFDC', marginBottom: 12}} />
              <div style={{height: 12, width: '60%', borderRadius: 6, background: '#F1E8E5'}} />
            </div>
          </div>
          <div style={{marginTop: 24, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 999, background: '#E3F6EA', color: C.waDark, fontWeight: 600, fontSize: 24}}>
            <Icon name="check" size={24} color={C.waDark} stroke={3} /> Registered Free
          </div>
        </Card>
        {/* A family's requirement */}
        <Card style={{left: 590 + gap, width: 420, top: 0, padding: 30, opacity: progress(t, 19.9, 0.5)}}>
          <div style={{fontSize: 22, fontWeight: 600, letterSpacing: '0.12em', color: C.muted, textTransform: 'uppercase'}}>Family requirement</div>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 20}}>
            {['26–30 yrs', 'Pune', 'Professional'].map((c, i) => (
              <Chip key={c} k={progress(t, 20.1 + i * 0.12, 0.35)} style={{fontSize: 24, padding: '8px 16px', background: reqHi > 0.5 ? '#FBE3DD' : C.blushSoft}}>
                {c}
              </Chip>
            ))}
          </div>
        </Card>
        {/* The connection */}
        <svg width={1080} height={300} style={{position: 'absolute', left: 0, top: 60}}>
          <line x1={500} y1={90} x2={580} y2={90} stroke={C.gold} strokeWidth={4} strokeDasharray="8 8" strokeDashoffset={-t * 30} opacity={line} />
        </svg>
        <div
          style={{
            position: 'absolute',
            left: 540 - 50,
            top: 100,
            width: 100,
            height: 100,
            borderRadius: 999,
            background: '#fff',
            border: `4px solid ${C.gold}`,
            display: 'grid',
            placeItems: 'center',
            boxShadow: '0 10px 30px rgba(185,133,38,0.35)',
            opacity: heart,
            transform: `scale(${0.6 + 0.4 * heart})`,
          }}
        >
          <svg width={52} height={52} viewBox="0 0 24 24">
            <path d="M12 21s-7.5-4.6-9.5-9.2C1 8.3 3.3 4.5 7 4.5c2 0 3.6 1.1 5 2.8c1.4-1.7 3-2.8 5-2.8c3.7 0 6 3.8 4.5 7.3C19.5 16.4 12 21 12 21z" fill={C.red} />
          </svg>
        </div>
      </div>
      {/* Incoming call from the Shaadi Mangalam team */}
      <div
        style={{
          position: 'absolute',
          left: 110,
          width: 860,
          top: VIS_TOP + 330,
          height: 150,
          borderRadius: 34,
          background: '#2A1B1F',
          boxShadow: '0 24px 60px rgba(40,10,18,0.35)',
          display: 'flex',
          alignItems: 'center',
          gap: 22,
          padding: '0 30px',
          color: '#fff',
          fontFamily: SANS,
          opacity: call,
          transform: `translateY(${(1 - call) * 60}px)`,
        }}
      >
        <div style={{width: 92, height: 92, borderRadius: 999, background: '#fff', display: 'grid', placeItems: 'center'}}>
          <Img src={staticFile('brand/logo_red.png')} style={{width: 68}} />
        </div>
        <div style={{flex: 1}}>
          <div style={{fontSize: 34, fontWeight: 600}}>Shaadi Mangalam</div>
          <div style={{fontSize: 24, opacity: 0.75}}>Incoming call…</div>
        </div>
        <div style={{position: 'relative', width: 96, height: 96}}>
          {[0, 1].map((i) => {
            const r = ring - i * 0.5;
            const rk = r > 0 ? r % 1 : 0;
            return (
              <div
                key={i}
                style={{position: 'absolute', inset: 0, borderRadius: 999, border: `3px solid ${C.wa}`, opacity: r > 0 ? 1 - rk : 0, transform: `scale(${1 + 0.6 * rk})`}}
              />
            );
          })}
          <div style={{position: 'absolute', inset: 0, borderRadius: 999, background: C.wa, display: 'grid', placeItems: 'center'}}>
            <Icon name="phone" size={44} color="#fff" />
          </div>
        </div>
      </div>
    </Scene>
  );
};

// 7 · CTA — "Aaj hi apna biodata WhatsApp par bhejiye."
export const CtaScene: React.FC = () => {
  const t = useTime();
  const logo = progress(t, 24.85, 0.8);
  const chips = ['Free Registration', 'Potential Match Consideration', 'Easy WhatsApp Process'];
  const btn = progress(t, 26.3, 0.6);
  const pulse = Math.max(0, Math.sin(Math.PI * lerp(t, [27.1, 27.9], [0, 1])));
  const hint = progress(t, 27.5, 0.5);
  const bob = Math.sin(t * 4) * 6 * hint;
  return (
    <AbsoluteFill>
      <Garland appear={24.9} />
      <Img
        src={staticFile('brand/logo_cream.png')}
        style={{position: 'absolute', width: 250, left: 415, top: 215, opacity: logo, transform: `translateY(${(1 - logo) * 20}px)`}}
      />
      <Headline
        lines={[[{text: 'Send Your Biodata'}], [{text: 'on WhatsApp '}, {text: 'Today.', accent: true}]]}
        at={25.0}
        top={530}
        size={74}
        color={C.creamText}
        accent={C.goldLight}
      />
      <div style={{position: 'absolute', left: 0, right: 0, top: 760, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
        {chips.map((c, i) => {
          const k = progress(t, 25.7 + i * 0.15, 0.45);
          return (
            <div
              key={c}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                fontFamily: SANS,
                fontSize: 32,
                fontWeight: 500,
                color: C.creamText,
                opacity: k,
                transform: `translateX(${(1 - k) * -20}px)`,
              }}
            >
              <span style={{width: 40, height: 40, borderRadius: 999, background: 'rgba(241,198,110,0.18)', display: 'grid', placeItems: 'center'}}>
                <Icon name="check" size={26} color={C.goldLight} stroke={3} />
              </span>
              {c}
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 170,
          width: 740,
          top: 975,
          height: 110,
          borderRadius: 999,
          background: `linear-gradient(180deg, #23B868, ${C.waDark})`,
          boxShadow: `0 16px 40px rgba(0,0,0,0.3), 0 0 0 ${10 * pulse}px rgba(29,170,97,${0.25 * pulse})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
          fontFamily: SANS,
          fontWeight: 700,
          fontSize: 40,
          color: '#fff',
          opacity: btn,
          transform: `scale(${(0.9 + 0.1 * btn) * (1 + 0.03 * pulse)})`,
        }}
      >
        <WhatsAppGlyph size={62} bg="rgba(255,255,255,0.18)" />
        Claim Free Registration
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 1290,
          textAlign: 'center',
          fontFamily: SANS,
          fontSize: 30,
          fontWeight: 500,
          color: C.creamText,
          opacity: 0.9 * hint,
        }}
      >
        Tap <b>“Send Message”</b> below
        <div style={{fontSize: 44, marginTop: 4, transform: `translateY(${bob}px)`, color: C.goldLight}}>↓</div>
      </div>
    </AbsoluteFill>
  );
};
