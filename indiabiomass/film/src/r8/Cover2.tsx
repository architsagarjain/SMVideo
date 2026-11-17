import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { Logo } from '../components/Logo';
import { useBrandFonts } from '../components/Fonts';
import { C, F } from '../theme';

// Reel cover for Video 2 (Four myths), 1080x1920 (9:16). Same red MYTH / green FACT language as the video,
// stamps kept straight. Everything that matters sits inside the centre 1080x1440 band the profile grid shows.
const RED = '#C9473D', GREEN = '#5FCB8E';

const Card: React.FC<{ x: number; kind: 'MYTH' | 'FACT'; text: string }> = ({ x, kind, text }) => {
  const col = kind === 'MYTH' ? RED : GREEN;
  return (
    <div style={{ position: 'absolute', left: x, top: 900, width: 440, height: 440, borderRadius: 30, border: `3px solid ${col}`, background: kind === 'MYTH' ? 'rgba(28,10,8,0.93)' : 'rgba(6,30,19,0.95)',
      boxShadow: '0 30px 80px rgba(0,0,0,0.55)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 34, padding: '0 34px' }}>
      <div style={{ border: `5px solid ${col}`, color: col, borderRadius: 12, padding: '4px 22px', fontFamily: F.display, fontWeight: 800, fontSize: 54, letterSpacing: '0.1em' }}>{kind}</div>
      <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 46, lineHeight: 1.1, color: '#fff', textAlign: 'center', letterSpacing: '-0.02em' }}>{text}</div>
    </div>
  );
};

export const Cover2: React.FC = () => {
  useBrandFonts();
  return (
    <AbsoluteFill style={{ background: '#0A0F0C' }}>
      <Img src={staticFile('r8/V2_1.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.7) brightness(0.8)', transform: 'scale(1.15)' }} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(4,14,9,0.92) 0%, rgba(4,14,9,0.72) 30%, rgba(4,14,9,0.6) 55%, rgba(4,14,9,0.92) 85%, rgba(4,14,9,0.97) 100%)' }} />
      <div style={{ position: 'absolute', left: 60, right: 60, top: 300, textAlign: 'center' }}>
        <div style={{ display: 'inline-block', fontFamily: F.label, fontWeight: 700, fontSize: 30, letterSpacing: '0.24em', color: C.ink, background: C.harvest, borderRadius: 999, padding: '10px 28px' }}>MYTH VS FACT</div>
        <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 104, lineHeight: 0.98, letterSpacing: '-0.035em', color: '#fff', marginTop: 28, textShadow: '0 6px 40px rgba(0,0,0,0.6)' }}>
          4 THINGS<br />PEOPLE GET<br />WRONG ABOUT<br /><span style={{ color: C.harvest }}>BIOMASS</span>
        </div>
      </div>
      <Card x={70} kind="MYTH" text={'“Biomass is just waste.”'} />
      <Card x={570} kind="FACT" text={'Processed right, it is a fuel.'} />
      <div style={{ position: 'absolute', left: 540 - 46, top: 900 + 220 - 46, width: 92, height: 92, borderRadius: 46, background: C.harvest, display: 'grid', placeItems: 'center',
        fontFamily: F.display, fontWeight: 800, fontSize: 52, color: C.ink, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>→</div>
      <div style={{ position: 'absolute', left: 260, width: 560, top: 1470 }}>
        <Logo id="cover2" at={0} width={560} mode="static" />
      </div>
    </AbsoluteFill>
  );
};
