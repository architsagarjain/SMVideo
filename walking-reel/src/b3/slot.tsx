import React from 'react';
import {Img, staticFile} from 'remotion';
import {GROT} from '../ads/extras';

/** A photo / video slot. With `img` it shows the picture; without, a clearly marked placeholder
 *  ("PHOTO 3 · Dahi + banana") so the layout can be reviewed before the assets arrive. */
export const Slot: React.FC<{img?: string; n: number | string; label: string; kind?: 'PHOTO' | 'VIDEO'; style?: React.CSSProperties; dark?: boolean}> = ({img, n, label, kind = 'PHOTO', style, dark}) => (
  <div style={{position: 'relative', overflow: 'hidden', background: dark ? 'linear-gradient(160deg, #3A3633, #24211F)' : 'linear-gradient(160deg, #E9E4DB, #D8D1C5)', ...style}}>
    {img ? (
      <Img src={staticFile(img)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}} />
    ) : (
      <div style={{position: 'absolute', inset: 18, border: `4px dashed ${dark ? 'rgba(255,255,255,0.45)' : 'rgba(20,20,20,0.35)'}`, borderRadius: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, textAlign: 'center', padding: 20}}>
        <svg width={64} height={64} viewBox="0 0 24 24" fill="none" stroke={dark ? '#FFFFFF' : '#141414'} strokeWidth={1.6} opacity={0.6}>
          {kind === 'PHOTO' ? (
            <>
              <rect x={3} y={6} width={18} height={14} rx={2} />
              <circle cx={12} cy={13} r={4} />
              <path d="M8 6 L9.5 3.5 H14.5 L16 6" />
            </>
          ) : (
            <>
              <rect x={3} y={5} width={18} height={14} rx={2} />
              <path d="M10 9 L15 12 L10 15 Z" fill={dark ? '#FFFFFF' : '#141414'} />
            </>
          )}
        </svg>
        <span style={{fontFamily: GROT, fontWeight: 800, fontSize: 30, letterSpacing: 4, color: dark ? '#FFFFFF' : '#141414', opacity: 0.75}}>{`${kind} ${n}`}</span>
        <span style={{fontFamily: GROT, fontWeight: 600, fontSize: 26, color: dark ? '#FFFFFF' : '#141414', opacity: 0.6, maxWidth: '90%'}}>{label}</span>
      </div>
    )}
  </div>
);
