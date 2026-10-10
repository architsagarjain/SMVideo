import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import captions from './data/captions.json';
import {lerp, progress} from './anim';
import {FONT} from './fonts';
import {CAPTION_Y, ES_START, FPS, GOLD} from './timeline';

type Word = {text: string; start: number; end: number; accent: boolean; line: number};
type Phrase = {start: number; end: number; show: number; hide: number; words: Word[]};

const WORD_IN = 0.24; // each word fades/rises in over this long, as it is spoken
const LEAD = 0.07; // words start appearing just before they are heard
const PHRASE_OUT = 0.16;

const textStyle: React.CSSProperties = {
  fontFamily: FONT,
  fontWeight: 700,
  fontSize: 64,
  lineHeight: 1.2,
  letterSpacing: '-0.005em',
  color: '#FFFFFF',
  // Thin soft outline + shadow: readable on bright frames without a heavy box.
  WebkitTextStroke: '5px rgba(18, 10, 10, 0.36)',
  paintOrder: 'stroke fill',
  textShadow: '0 2px 4px rgba(0,0,0,0.42), 0 0 24px rgba(0,0,0,0.30)',
};

const PhraseView: React.FC<{p: Phrase; t: number}> = ({p, t}) => {
  // Captions leave with the footage as the end screen comes in.
  const hide = Math.min(p.hide, ES_START);
  const out = progress(t, hide, PHRASE_OUT);
  const lines: Word[][] = [];
  p.words.forEach((w) => (lines[w.line] ??= []).push(w));
  return (
    <div
      style={{
        position: 'absolute',
        left: 70,
        right: 70,
        top: CAPTION_Y,
        transform: `translateY(-50%) translateY(${-8 * out}px)`,
        opacity: 1 - out,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      {lines.map((line, i) => (
        <div key={i} style={{...textStyle, whiteSpace: 'nowrap'}}>
          {line.map((w, j) => {
            const k = progress(t, w.start - LEAD, WORD_IN);
            return (
              <React.Fragment key={j}>
                <span
                  style={{
                    display: 'inline-block',
                    opacity: k,
                    transform: `translateY(${(1 - k) * 16}px)`,
                    color: w.accent ? GOLD : undefined,
                  }}
                >
                  {w.text}
                </span>
                {j < line.length - 1 ? ' ' : null}
              </React.Fragment>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export const Captions: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const active = (captions as Phrase[]).filter((p) => t >= p.show && t < Math.min(p.hide, ES_START) + PHRASE_OUT);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {active.map((p, i) => (
        <PhraseView key={`${p.start}-${i}`} p={p} t={t} />
      ))}
    </AbsoluteFill>
  );
};

/** Very soft darkening behind the caption zone so white text holds on bright frames. */
export const CaptionScrim: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const o = (1 - lerp(t, [ES_START, ES_START + 0.4], [0, 1])) * lerp(t, [0, 0.2], [0, 1]);
  return (
    <AbsoluteFill
      style={{
        opacity: o,
        background: `radial-gradient(ellipse 62% 10% at 50% ${(CAPTION_Y / 1920) * 100}%, rgba(0,0,0,0.32), rgba(0,0,0,0) 100%)`,
      }}
    />
  );
};
