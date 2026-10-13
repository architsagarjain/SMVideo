import {BOTTOM, FACE_ORIGIN, ReelConfig} from '../series/core';
import captions from './captions.json';

/**
 * Navratri sabudana reel. Every cut sits in a pause between her sentences.
 * Source: 68.77 s (2063 frames).
 */
export const SABUDANA_FRAMES = 2063;

export const S = {
  hook: {start: 0, end: 6.6},
  light: {start: 6.6, end: 10.9}, // full-screen: feels light, little protein
  name: {start: 10.9, end: 13.4}, // behind: SABUDANA / NAVRATRI
  pearls: {start: 13.4, end: 22.9}, // full-screen: 89 g carbs vs 0.2 g protein per 100 g
  question: {start: 26.3, end: 29.95}, // behind: PROTEIN?
  panel: {start: 30.2, end: 42.7}, // split: what each ingredient adds
  build: {start: 42.7, end: 53.6}, // full-screen: add paneer / curd, check the portion
  eating: {start: 53.6, end: 57.95}, // B-roll: eating a bowl she enjoys
  cta: {start: 64.6, end: 99},
};

export const sabudanaConfig: ReelConfig = {
  dir: 'sabudana',
  gfx: [S.light, S.pearls, S.build],
  behind: [S.hook, S.name, S.question, S.cta],
  panel: S.panel,
  moves: [
    // "So if I'm looking at a plate of sabudana khichdi"
    {origin: FACE_ORIGIN, inStart: 23.3, inDur: 2.6, scale: 1.05, outStart: 26.25, outDur: 0.05},
    {origin: BOTTOM, inStart: S.panel.start, inDur: 0.7, scale: 0.72, outStart: S.panel.end - 0.05, outDur: 0.05, panel: true},
    // "Identify what the meal provides, then fill the gap."
    {origin: FACE_ORIGIN, inStart: 61.1, inDur: 0.6, scale: 1.08, outStart: 64.55, outDur: 0.05},
    {origin: FACE_ORIGIN, inStart: S.cta.start, inDur: 4.0, scale: 1.05, outStart: 999, outDur: 1},
  ],
  broll: [{start: S.eating.start, end: S.eating.end, src: 'broll_eating.mp4'}],
  captions: captions as ReelConfig['captions'],
};
