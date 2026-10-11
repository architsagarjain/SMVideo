import { useCurrentFrame } from 'remotion';
import logo from '../data/logo.json';
import { C } from '../theme';
import { lerp, E } from '../lib';

const VW = 1765.7;
const VH = 313.3;

/**
 * The official IndiaBiomass lockup, drawn from the supplied SVG paths.
 * Pieces are revealed with masks only; once the reveal ends the logo is
 * exactly the supplied artwork (no outlines, shadows or recolouring).
 *
 * mode 'reveal': mark alone (larger, centred) -> slides into the lockup -> wordmark wipes in.
 * mode 'static': fully drawn.
 */
export const Logo: React.FC<{
  id: string;
  at: number;
  width: number;
  desc?: boolean;
  mode?: 'reveal' | 'static' | 'settle';
  light?: string;
  accent?: string;
}> = ({ id, at, width, desc = false, mode = 'reveal', light = '#FFFFFF', accent = C.lightOchre }) => {
  const f = useCurrentFrame() - at;
  const full = mode === 'static';
  // mark pieces
  const stem = full ? 1 : lerp(f, [0, 16], [0, 1], E.out); // white B wipes upward (the stem grows)
  const bowl = full ? 1 : lerp(f, [7, 24], [0, 1], E.out); // ochre bowl slides out from behind
  // lockup move (reveal only)
  const move = mode === 'reveal' ? lerp(f, [20, 44], [0, 1], E.inOut) : 1;
  const india = full ? 1 : lerp(f, mode === 'reveal' ? [30, 52] : [8, 26], [0, 1], E.out);
  const bio = full ? 1 : lerp(f, mode === 'reveal' ? [36, 60] : [12, 32], [0, 1], E.out);
  const d = full ? 1 : lerp(f, mode === 'reveal' ? [54, 74] : [24, 44], [0, 1], E.out);

  const k = width / VW;
  const markCx = 150.25 * k; // mark centre inside the lockup, px
  const lockCx = width / 2;
  // In 'reveal' the mark starts centred in the box at 1.7x and settles into its lockup place.
  const startScale = mode === 'reveal' ? 1.7 : 1;
  const sc = startScale + (1 - startScale) * move;
  const tx = (lockCx - markCx) * (1 - move);

  const wordT = logo.wordTransform;
  const plainT = logo.wordTransformNoDesc;
  // vertical: with descriptor the wordmark sits higher (as supplied)
  return (
    <svg width={width} height={width * (VH / VW)} viewBox={`0 0 ${VW} ${VH}`} style={{ overflow: 'visible' }}>
      <defs>
        <clipPath id={`${id}-stem`}>
          <rect x={-20} y={VH + 20 - (VH + 40) * stem} width={340} height={(VH + 40) * stem} />
        </clipPath>
        <clipPath id={`${id}-bowl`}>
          <rect x={150} y={0} width={180} height={VH} />
        </clipPath>
        <clipPath id={`${id}-india`}>
          <rect x={-10} y={-20} width={530 * india} height={260} />
        </clipPath>
        <clipPath id={`${id}-bio`}>
          <rect x={525} y={-20} width={910 * bio} height={260} />
        </clipPath>
        <clipPath id={`${id}-desc`}>
          <rect x={-50} y={-50} width={6000 * d} height={400} />
        </clipPath>
      </defs>
      <g transform={`translate(${tx / k} 0) translate(${150.25} ${VH / 2}) scale(${sc}) translate(${-150.25} ${-VH / 2})`}>
        <g clipPath={`url(#${id}-bowl)`}>
          <path d={logo.markOchre} fill={accent} fillRule="evenodd" transform={`translate(${-70 * (1 - bowl)} 0)`} opacity={bowl > 0 ? 1 : 0} />
        </g>
        <path d={logo.markLight} fill={light} fillRule="evenodd" clipPath={`url(#${id}-stem)`} />
      </g>
      <g transform={desc ? wordT : plainT}>
        <g clipPath={`url(#${id}-india)`}>
          <path d={logo.india} fill={light} fillRule="evenodd" transform={`translate(${-24 * (1 - india)} 0)`} opacity={Math.min(1, india * 1.6)} />
        </g>
        <g clipPath={`url(#${id}-bio)`}>
          <path d={logo.biomass} fill={accent} fillRule="evenodd" transform={`translate(${-24 * (1 - bio)} 0)`} opacity={Math.min(1, bio * 1.6)} />
        </g>
      </g>
      {desc && (
        <g transform={logo.descTransform} clipPath={`url(#${id}-desc)`} opacity={d}>
          <path d={logo.descLight} fill={light} fillRule="evenodd" />
          <path d={logo.descOchre} fill={accent} fillRule="evenodd" />
        </g>
      )}
    </svg>
  );
};
