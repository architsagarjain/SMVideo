/**
 * Output <-> source time for the sped-up series reels (built by scripts/make_timemap.py).
 * Everything in a reel (graphics, captions, cues) is written in source seconds; the
 * composition plays kept segments back to back at `speed`, so long pauses and the camera
 * on/off frames are gone.
 */
export type Seg = {s0: number; s1: number; o0: number};
export type TimeMap = {fps: number; speed: number; segs: Seg[]; dur: number; frames: number};

/** Source second shown at output second `t`. */
export const srcAt = (tm: TimeMap, t: number) => {
  let seg = tm.segs[0];
  for (const s of tm.segs) if (s.o0 <= t + 1e-6) seg = s;
  return Math.min(seg.s1, seg.s0 + (t - seg.o0) * tm.speed);
};

/** Output second at which source second `s` plays (a time inside a cut maps to the cut). */
export const outAt = (tm: TimeMap, s: number) => {
  for (const seg of tm.segs) {
    if (s < seg.s0) return seg.o0;
    if (s <= seg.s1) return seg.o0 + (s - seg.s0) / tm.speed;
  }
  return tm.dur;
};

/** Move a source time that falls inside a cut to the first kept source time after it. */
export const snap = (tm: TimeMap, s: number) => {
  if (s <= tm.segs[0].s0) return s; // before the head trim: never shown, leave as is
  for (const seg of tm.segs) {
    if (s < seg.s0) return seg.s0;
    if (s <= seg.s1) return s;
  }
  return s;
};
