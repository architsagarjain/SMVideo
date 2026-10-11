import { Img, staticFile, OffthreadVideo } from 'remotion';
import { F } from '../theme';

/**
 * A real listing card captured from the IndiaBiomass site (2x). The site's
 * empty "Add photo" slot is filled with footage of that kind of product.
 */
export const SiteCard: React.FC<{ card: string; media: string; mediaStart?: number; h?: number }> = ({ card, media, mediaStart = 0, h = 664 }) => (
  <div style={{ width: 548, borderRadius: 26, overflow: 'hidden', background: '#fff', boxShadow: '0 40px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(0,0,0,0.06)' }}>
    <div style={{ height: 262, overflow: 'hidden', position: 'relative' }}>
      <OffthreadVideo src={staticFile(media)} startFrom={mediaStart} muted style={{ width: '100%', height: 560, objectFit: 'cover', marginTop: -150 }} />
    </div>
    <div style={{ height: h - 262, overflow: 'hidden' }}>
      <Img src={staticFile(`ui/${card}.png`)} style={{ width: 548, marginTop: -262, display: 'block' }} />
    </div>
  </div>
);

export const SampleTag: React.FC<{ text?: string; color?: string }> = ({ text = 'Interface preview · sample listings', color = 'rgba(255,255,255,0.6)' }) => (
  <div style={{ fontFamily: F.label, fontSize: 18, letterSpacing: '0.14em', textTransform: 'uppercase', color }}>{text}</div>
);
