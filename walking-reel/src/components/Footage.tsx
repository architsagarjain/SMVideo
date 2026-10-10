import React from 'react';
import {AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';
import {cameraAt} from '../camera';
import {FPS} from '../theme';

/** In panel mode the footage is cropped from this source-y down, so her head pops out above the panel. */
export const PANEL_CROP_Y = 1160;
const PANEL_RADIUS = 46;

const cameraStyle = (t: number): React.CSSProperties => {
  const cam = cameraAt(t);
  return {transformOrigin: `${cam.ox}px ${cam.oy}px`, scale: cam.scale};
};

/** The talking-head footage (old captions removed, graded, 1080x1920). */
export const Footage: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const cam = cameraAt(t);
  const crop = PANEL_CROP_Y * cam.panel;
  const r = (PANEL_RADIUS * cam.panel) / cam.scale;
  return (
    <AbsoluteFill style={cameraStyle(t)}>
      {cam.panel > 0 ? (
        // soft shadow under the panel
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: crop,
            bottom: 0,
            borderRadius: r,
            boxShadow: `0 ${50 / cam.scale}px ${120 / cam.scale}px -${20 / cam.scale}px rgba(0,0,0,${0.6 * cam.panel})`,
          }}
        />
      ) : null}
      <AbsoluteFill style={{clipPath: cam.panel > 0 ? `inset(${crop}px 0px 0px 0px round ${r}px)` : undefined}}>
        <OffthreadVideo src={staticFile('footage_clean_1080.mp4')} muted style={{width: '100%', height: '100%'}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * The speaker cut out with the RVM matte (VP9 + alpha). Drawn above the
 * "behind" graphics so cards and big type sit behind her head, and never
 * clipped, so in panel mode her head breaks out of the panel.
 */
export const Subject: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill style={cameraStyle(t)}>
      <OffthreadVideo src={staticFile('subject_1080.webm')} transparent muted style={{width: '100%', height: '100%'}} />
    </AbsoluteFill>
  );
};
