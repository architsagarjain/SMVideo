import {ReelConfig, retime} from '../series/core';
import {TimeMap} from '../series/timemap';
import timemap from './timemap.json';
import captions from './captions.json';

/**
 * Sugar-free mithai reel ("turn the box around"). Look: clean "read the label" - real mithai
 * photos (Wikimedia Commons, see public/v10/photos/CREDITS.md), white label cards with thick black
 * rules, marketing-green stickers vs the black-and-white facts, a till receipt for the maths, and
 * label-tape captions. The hook opens on a full-screen photo of the box, which shrinks into a card
 * above her head and flips round to its nutrition panel. Times are source seconds.
 */
export const TM10 = timemap as TimeMap;
export const V10_FRAMES = TM10.frames;

export const C = {
  hook: {start: 1.08, end: 6.6}, // full-screen box photo -> card above her head -> TURN IT AROUND (flip)
  front: {start: 6.6, end: 14.5}, // FRONT card (claims) vs BACK card (label rows)
  journey: {start: 14.6, end: 18.5}, // B-roll: her push-ups (her weight-loss journey)
  rep: {start: 18.5, end: 24.7}, // HEALTHY sticker on the plate, permission meter fills
  nuts: {start: 24.7, end: 31.4}, // ingredients panel: cashew nuts + ghee highlighted
  nine: {start: 31.4, end: 36.1}, // 1 g fat = 9 kcal
  compare: {start: 36.1, end: 42.5}, // two labels per 100 g -> your portion
  calc: {start: 42.5, end: 56.2}, // till receipt: 30 g x 400 / 100 = 120 kcal (illustrative)
  choose: {start: 56.2, end: 59.3}, // photo: sweet shop counter, choose the one you enjoy
  enjoy: {start: 59.3, end: 62.0}, // B-roll: her eating, serve a portion
  decide: {start: 62.0, end: 69.8}, // the box again: SOUNDS HEALTHY? -> flips to the label
  cta: {start: 69.8, end: 999},
};
retime(TM10, C, []);

export const v10Config: ReelConfig = {
  dir: 'v10',
  gfx: [],
  behind: [],
  moves: [],
  broll: [
    {start: C.journey.start, end: C.journey.end, src: 'b_push.mp4'},
    {start: C.enjoy.start, end: C.enjoy.end, src: 'b_eat.mp4'},
  ],
  captions: captions as ReelConfig['captions'],
  tm: TM10,
  grade: {filter: 'brightness(1.07) contrast(1.07) saturate(1.12)'}, // Bright & Clean
  cut: [{start: 0, end: 999}], // her cut-out on top, so cards can tuck behind her head
};
