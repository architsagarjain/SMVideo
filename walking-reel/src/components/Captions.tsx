import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import captions from '../data/captions.json';
import {project} from '../camera';
import {C, CAPTION, EASE_IN_OUT, EASE_OUT, FPS, SANS, SERIF, lerp, tween} from '../theme';

type Word = {text: string; accent: boolean; start: number; end: number};
type Group = {
  start: number;
  end: number;
  hold: number;
  serif: boolean;
  words: Word[];
  coverHalfWidth: number;
  textWidth: number;
};
const GROUPS = captions as Group[];

// The old burned-in captions were centred here in the (upscaled) source frame.
// The capsule always sits on that spot so nothing of them can show through.
const ANCHOR = {x: 540, y: 1334};
const PAD_X = 36;
const H = 92;
const LEAD = 0.06; // capsule resizes slightly before the first word lands

const capsuleWidth = (g: Group, zoom: number) =>
  Math.max(g.textWidth + PAD_X * 2, (g.coverHalfWidth * zoom + 30) * 2, 220);

const GroupText: React.FC<{g: Group; t: number; fadeOut: number}> = ({g, t, fadeOut}) => {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        whiteSpace: 'pre',
        opacity: 1 - fadeOut,
        translate: `0px ${-8 * fadeOut}px`,
        fontFamily: g.serif ? SERIF : SANS,
        fontStyle: g.serif ? 'italic' : 'normal',
        fontSize: g.serif ? CAPTION.serifSize : CAPTION.size,
        fontWeight: g.serif ? 400 : CAPTION.weight,
        letterSpacing: g.serif ? 0 : CAPTION.letterSpacing,
        color: C.onDark,
        lineHeight: 1,
        paddingTop: g.serif ? 2 : 0,
      }}
    >
      <div>
      {g.words.map((w, i) => {
        const p = tween(t, w.start - 0.05, 0.24);
        return (
          <React.Fragment key={i}>
            <span
              style={{
                display: 'inline-block',
                opacity: p,
                translate: `0px ${lerp(p, 10, 0)}px`,
                filter: p < 1 ? `blur(${lerp(p, 5, 0)}px)` : undefined,
                color: w.accent ? C.accentOnDark : undefined,
              }}
            >
              {w.text}
            </span>
            {i < g.words.length - 1 ? ' ' : null}
          </React.Fragment>
        );
      })}
      </div>
    </div>
  );
};

export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;

  let gi = 0;
  for (let i = 0; i < GROUPS.length; i++) if (GROUPS[i].start - LEAD <= t) gi = i;
  const g = GROUPS[gi];
  const prev = gi > 0 ? GROUPS[gi - 1] : null;

  const pos = project(t, ANCHOR.x, ANCHOR.y);
  const resize = tween(t, g.start - LEAD, 0.32, EASE_IN_OUT);
  const w = prev ? lerp(resize, capsuleWidth(prev, pos.scale), capsuleWidth(g, pos.scale)) : capsuleWidth(g, pos.scale);

  // capsule is up before the old captions first appear (0.23 s) and stays up
  const enter = tween(t, 0, 0.2, EASE_OUT);
  const prevFade = tween(t, g.start - LEAD, 0.12, EASE_OUT);

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: pos.x - w / 2,
          top: pos.y - H / 2,
          width: w,
          height: H,
          borderRadius: H / 2,
          background: C.glass,
          backdropFilter: 'blur(22px) saturate(1.15)',
          WebkitBackdropFilter: 'blur(22px) saturate(1.15)',
          border: `1.5px solid ${C.glassEdge}`,
          boxShadow: '0 14px 34px -10px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)',
          opacity: enter,
          scale: lerp(enter, 0.94, 1),
          overflow: 'hidden',
        }}
      >
        {prev && prevFade < 1 ? <GroupText g={prev} t={t} fadeOut={prevFade} /> : null}
        <GroupText g={g} t={t} fadeOut={0} />
      </div>
    </AbsoluteFill>
  );
};
