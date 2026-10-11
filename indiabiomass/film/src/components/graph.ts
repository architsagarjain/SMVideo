import india from '../data/india.json';
import { rng } from '../lib';

export type Pt = [number, number];
export const MAP_W = india.width;
export const MAP_H = india.height;
export const polys: Pt[][] = (india.paths as any[]).map((p) => p.pts as Pt[]);
export const outline: Pt[] = india.outline as Pt[];
export const cities = india.nodes as unknown as Record<string, Pt>;

// Network nodes: real cities + evenly spread interior points.
const r = rng(11);
const interior = (india.interior as Pt[]).slice();
const picked: Pt[] = Object.values(cities);
const MIN_D = 30;
for (const p of interior) {
  if (picked.length >= 330) break;
  if (picked.every((q) => (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2 > MIN_D * MIN_D)) picked.push(p);
}
export const nodes: Pt[] = picked;
export const CITY_COUNT = Object.keys(cities).length;
export const nodeSeed = nodes.map(() => r());

// k-nearest edges
const K = 3;
const edgeSet = new Set<string>();
export const edges: [number, number][] = [];
nodes.forEach((p, i) => {
  const d = nodes
    .map((q, j) => [j, (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2] as [number, number])
    .filter(([j]) => j !== i)
    .sort((a, b) => a[1] - b[1])
    .slice(0, K);
  for (const [j, dd] of d) {
    if (dd > 120 * 120) continue;
    const key = i < j ? `${i}-${j}` : `${j}-${i}`;
    if (!edgeSet.has(key)) {
      edgeSet.add(key);
      edges.push([Math.min(i, j), Math.max(i, j)]);
    }
  }
});

// Long-haul "trade" arcs between cities (drawn as raised arcs).
const cityNames = Object.keys(cities);
const ci = (n: string) => cityNames.indexOf(n);
export const arcs: [number, number][] = [
  ['Ludhiana', 'Delhi'], ['Bathinda', 'Jaipur'], ['Karnal', 'Lucknow'], ['Panipat', 'Kanpur'], ['Delhi', 'Singrauli'],
  ['Amritsar', 'Ahmedabad'], ['Ludhiana', 'Mumbai'], ['Lucknow', 'Kolkata'], ['Patna', 'Raipur'], ['Nagpur', 'Hyderabad'],
  ['Mumbai', 'Bengaluru'], ['Hyderabad', 'Chennai'], ['Indore', 'Pune'], ['Rajkot', 'Surat'], ['Bhopal', 'Kota'],
  ['Kolkata', 'Guwahati'], ['Bhubaneswar', 'Visakhapatnam'], ['Coimbatore', 'Kochi'], ['Chennai', 'Madurai'], ['Jodhpur', 'Delhi'],
  ['Varanasi', 'Patna'], ['Aurangabad', 'Mumbai'], ['Dehradun', 'Noida'], ['Jammu', 'Amritsar'], ['Bengaluru', 'Mangaluru'],
  ['Raipur', 'Jabalpur'], ['Siliguri', 'Patna'], ['Belagavi', 'Pune'], ['Srinagar', 'Jammu'], ['Ranchi', 'Kolkata'],
].map(([a, b]) => [ci(a), ci(b)] as [number, number]);

// Hop distance from a seed node (BFS) -> drives the "connection wave".
export const hopsFrom = (seed: number) => {
  const adj: number[][] = nodes.map(() => []);
  for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a); }
  const h = nodes.map(() => Infinity);
  h[seed] = 0;
  const q = [seed];
  while (q.length) {
    const n = q.shift()!;
    for (const m of adj[n]) if (h[m] === Infinity) { h[m] = h[n] + 1; q.push(m); }
  }
  const max = Math.max(...h.filter((x) => x < Infinity));
  return h.map((x) => (x === Infinity ? max + 1 : x));
};
export const SEED = cityNames.indexOf('Ludhiana');
export const HOPS = hopsFrom(SEED);
export const MAX_HOP = Math.max(...HOPS);
export const cityIndex = ci;
