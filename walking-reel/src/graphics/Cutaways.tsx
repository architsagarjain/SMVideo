import React from 'react';
import {AbsoluteFill, Freeze, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Footage, Subject} from '../components/Footage';
import {MaskReveal, Rise} from '../components/Card';
import {CUT, FREEZE} from '../timeline';
import {C, EASE_IN_OUT, EASE_OUT, FPS, JP, SANS, SERIF, lerp, springAt, tween} from '../theme';

/** Full-screen clip with a short push-in on the cut so it lands with energy. */
const Clip: React.FC<{start: number; end: number; src: string; children?: React.ReactNode}> = ({start, end, src, children}) => {
  const from = Math.round(start * FPS);
  return (
    <Sequence from={from} durationInFrames={Math.round(end * FPS) - from} premountFor={FPS}>
      <ClipInner src={src}>{children}</ClipInner>
    </Sequence>
  );
};

const ClipInner: React.FC<{src: string; children?: React.ReactNode}> = ({src, children}) => {
  const t = useCurrentFrame() / FPS; // local time inside the cutaway
  const push = lerp(tween(t, 0, 0.5, EASE_OUT), 1.1, 1.0);
  return (
    <AbsoluteFill style={{backgroundColor: C.stage}}>
      <AbsoluteFill style={{scale: push}}>
        <OffthreadVideo src={staticFile(src)} muted style={{width: '100%', height: '100%'}} />
      </AbsoluteFill>
      {/* top vignette so type reads on bright footage */}
      <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 38%)'}} />
      {children}
    </AbsoluteFill>
  );
};

/** "it's walking." */
const WalkingTitle: React.FC = () => {
  const t = useCurrentFrame() / FPS + CUT.walking.start;
  const underline = tween(t, 14.45, 0.6, EASE_IN_OUT);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 230, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <MaskReveal at={14.2 - CUT.walking.start} dur={0.6}>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 250, lineHeight: 1.0, letterSpacing: -6, color: C.ink, padding: '0 24px', textShadow: '0 10px 40px rgba(0,0,0,0.35)'}}>
          Walking.
        </div>
      </MaskReveal>
      <svg width={640} height={34} viewBox="0 0 420 26" style={{marginTop: -2}}>
        <path d="M6 16 C 120 6, 260 6, 414 14" fill="none" stroke={C.accent} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - underline} />
      </svg>
    </div>
  );
};

/** "an old Japanese pedometer" over Tokyo: 万歩計 = manpo-kei, "10,000-step meter". */
const ManpoKei: React.FC = () => {
  const t = useCurrentFrame() / FPS + CUT.shibuya.start;
  const s = springAt(t, 37.66, 20, 150);
  return (
    <div
      style={{
        position: 'absolute',
        left: 90,
        right: 90,
        top: 250,
        padding: '40px 0 44px',
        borderRadius: 40,
        background: 'linear-gradient(160deg, rgba(44,46,51,0.8) 0%, rgba(17,18,21,0.8) 60%)',
        border: `1.5px solid ${C.glassCardEdge}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        opacity: tween(t, 37.62, 0.3),
        translate: `0px ${lerp(s, 40, 0)}px`,
        scale: lerp(s, 0.95, 1),
      }}
    >
      <Rise at={37.7 - CUT.shibuya.start} style={{fontFamily: SANS, fontWeight: 800, fontSize: 24, letterSpacing: 6, color: C.accent}}>
        JAPAN · PEDOMETER
      </Rise>
      <div style={{fontFamily: JP, fontWeight: 600, fontSize: 190, lineHeight: 1.15, color: C.ink, letterSpacing: 10, marginTop: 6}}>
        {'万歩計'.split('').map((ch, i) => (
          <span key={i} style={{display: 'inline-block', opacity: tween(t, 37.78 + i * 0.12, 0.3), translate: `0px ${lerp(springAt(t, 37.78 + i * 0.12), 30, 0)}px`}}>
            {ch}
          </span>
        ))}
      </div>
      <Rise at={38.3 - CUT.shibuya.start} style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 50, color: C.inkSoft}}>
        “manpo-kei” = 10,000-step meter
      </Rise>
    </div>
  );
};

/** "marketing campaign." - freeze, black & white, record scratch, stamp. */
const MythFreeze: React.FC = () => {
  const t = useCurrentFrame() / FPS + FREEZE.start;
  const zoom = lerp(tween(t, FREEZE.start, FREEZE.end - FREEZE.start, EASE_OUT), 1.0, 1.07);
  const flash = 1 - tween(t, FREEZE.start, 0.18);
  const stamp = springAt(t, FREEZE.start + 0.12, 13, 220);
  const strike = tween(t, FREEZE.start + 0.05, 0.3, EASE_IN_OUT);
  return (
    <AbsoluteFill style={{backgroundColor: C.stage}}>
      <AbsoluteFill style={{scale: zoom, transformOrigin: '540px 860px', filter: 'grayscale(1) contrast(1.15) brightness(0.92)'}}>
        <Freeze frame={Math.round(FREEZE.start * FPS)}>
          <Footage />
          <Subject />
        </Freeze>
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(90% 60% at 50% 45%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)'}} />
      {/* struck-through 10,000 */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 215, display: 'flex', justifyContent: 'center'}}>
        <div style={{position: 'relative', fontFamily: SANS, fontWeight: 800, fontSize: 200, letterSpacing: -9, color: C.ink, lineHeight: 1}}>
          10,000
          <div style={{position: 'absolute', left: -16, top: '48%', height: 16, borderRadius: 8, background: C.accent, width: `calc((100% + 32px) * ${strike})`, rotate: '-6deg'}} />
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 455, display: 'flex', justifyContent: 'center'}}>
        <div
          style={{
            padding: '18px 34px',
            borderRadius: 14,
            background: C.accent,
            color: C.dark,
            fontFamily: SANS,
            fontWeight: 800,
            fontSize: 54,
            letterSpacing: 2,
            rotate: `${lerp(stamp, -14, -5)}deg`,
            scale: lerp(stamp, 1.6, 1),
            opacity: tween(t, FREEZE.start + 0.12, 0.08),
            boxShadow: '0 20px 50px -10px rgba(0,0,0,0.6)',
          }}
        >
          MARKETING CAMPAIGN
        </div>
      </div>
      <AbsoluteFill style={{backgroundColor: '#fff', opacity: flash * 0.55}} />
    </AbsoluteFill>
  );
};

export const Cutaways: React.FC = () => (
  <>
    <Clip {...CUT.walking}>
      <WalkingTitle />
    </Clip>
    <Clip {...CUT.treadmill} />
    <Clip {...CUT.shibuya}>
      <ManpoKei />
    </Clip>
    <Sequence from={Math.round(FREEZE.start * FPS)} durationInFrames={Math.round((FREEZE.end - FREEZE.start) * FPS)} premountFor={FPS}>
      <MythFreeze />
    </Sequence>
    <Clip {...CUT.sunset} />
  </>
);
