import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { Logo } from '../components/Logo';
import { useBrandFonts } from '../components/Fonts';
import { C, F } from '../theme';

// Reel cover for Reel 2 ("Tender words"), 1080x1920 (9:16). Built from the reel's own hook: a tender notice
// with the five words highlighted. Everything that matters sits inside the centre 1080x1440 band the grid shows.
const NOTICE: { pre: string; term: string; post: string }[] = [
  { pre: 'Earnest Money Deposit (', term: 'EMD', post: '): as per NIT' },
  { pre: 'Minimum ', term: 'GCV', post: ': as specified' },
  { pre: 'Evaluation: ', term: 'L1', post: ' (lowest price)' },
  { pre: '', term: 'MSE', post: ' exemption: applicable' },
  { pre: '', term: 'Reverse auction', post: ': Yes' },
];

export const CoverReel2: React.FC = () => {
  useBrandFonts();
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 100% 70% at 50% 50%, #0B4630 0%, ${C.forest} 45%, #021A10 100%)` }}>
      <Img src={staticFile('reels/pellet_tex.jpg')} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.12, mixBlendMode: 'luminosity' }} />
      <div style={{ position: 'absolute', left: 60, right: 60, top: 290, textAlign: 'center' }}>
        <div style={{ display: 'inline-block', fontFamily: F.label, fontWeight: 700, fontSize: 30, letterSpacing: '0.24em', color: C.ink, background: C.harvest, borderRadius: 999, padding: '10px 28px' }}>TENDER WORDS</div>
        <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 104, lineHeight: 0.98, letterSpacing: '-0.035em', color: '#fff', marginTop: 26, textShadow: '0 6px 40px rgba(0,0,0,0.5)' }}>
          5 WORDS IN<br />EVERY BIOMASS<br /><span style={{ color: C.harvest }}>TENDER</span>
        </div>
      </div>
      {/* the notice, all five words highlighted */}
      <div style={{ position: 'absolute', left: 110, width: 860, top: 740, padding: '38px 48px 30px', background: '#F7F6F2', borderRadius: 22, boxShadow: '0 40px 100px rgba(0,0,0,0.55)', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: `3px solid ${C.forest}`, paddingBottom: 16, marginBottom: 16 }}>
          <span style={{ fontFamily: F.label, fontWeight: 700, fontSize: 28, letterSpacing: '0.2em', color: C.forest }}>TENDER NOTICE</span>
          <span style={{ fontFamily: F.label, fontWeight: 600, fontSize: 20, letterSpacing: '0.16em', color: C.slate }}>BIOMASS · SUPPLY</span>
        </div>
        <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 34, color: C.ink, marginBottom: 12, letterSpacing: '-0.01em' }}>Supply of biomass pellets for co-firing</div>
        {NOTICE.map((row, i) => (
          <div key={i} style={{ fontFamily: F.text, fontSize: 30, color: '#3B443E', lineHeight: 1.25, padding: '11px 0', borderTop: `1px solid ${C.line}` }}>
            {row.pre}
            <span style={{ position: 'relative', display: 'inline-block', fontWeight: 700, color: C.ink }}>
              <span style={{ position: 'absolute', left: -6, right: -6, top: 4, bottom: 0, background: C.harvest, borderRadius: 6, opacity: 0.85 }} />
              <span style={{ position: 'relative' }}>{row.term}</span>
            </span>
            {row.post}
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1340, textAlign: 'center', fontFamily: F.label, fontWeight: 600, fontSize: 32, letterSpacing: '0.16em', color: C.harvest }}>…AND WHAT THEY ACTUALLY MEAN</div>
      <div style={{ position: 'absolute', left: 290, width: 500, top: 1450 }}>
        <Logo id="coverreel2" at={0} width={500} mode="static" />
      </div>
    </AbsoluteFill>
  );
};
