/**
 * Deterministic waypoint pathfinding — NPC-MOVE-001 (spec §30.8).
 *
 * Plain English: finds the shortest route between two waypoints over the town's
 * navigation graph. Fully deterministic (ties broken by node id) so the same
 * trip always produces the same path and travel duration, independent of
 * rendering. No physics.
 */
import type { Vec2 } from '@/world/townLayout';
import { NAV_EDGES, NAV_NODES } from './locations';

function distance(a: Vec2, b: Vec2): number {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

interface Adjacency {
  [node: string]: { to: string; weight: number }[];
}

function buildAdjacency(): Adjacency {
  const adj: Adjacency = {};
  for (const node of Object.keys(NAV_NODES)) {
    adj[node] = [];
  }
  for (const [a, b] of NAV_EDGES) {
    const w = distance(NAV_NODES[a], NAV_NODES[b]);
    adj[a].push({ to: b, weight: w });
    adj[b].push({ to: a, weight: w });
  }
  return adj;
}

const ADJACENCY = buildAdjacency();

/**
 * Shortest path of node ids from `from` to `to` (inclusive). Deterministic:
 * among equal-distance frontier nodes the lexicographically smallest id wins.
 */
export function shortestNodePath(from: string, to: string): string[] {
  if (!(from in NAV_NODES) || !(to in NAV_NODES)) {
    throw new Error(`Unknown nav node: ${from} -> ${to}`);
  }
  if (from === to) {
    return [from];
  }

  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const visited: Record<string, boolean> = {};
  for (const node of Object.keys(NAV_NODES)) {
    dist[node] = Infinity;
    prev[node] = null;
  }
  dist[from] = 0;

  for (;;) {
    let current: string | null = null;
    let best = Infinity;
    for (const node of Object.keys(NAV_NODES)) {
      if (visited[node]) continue;
      const d = dist[node];
      // Deterministic tie-break by node id.
      if (d < best || (d === best && current !== null && node < current)) {
        best = d;
        current = node;
      }
    }
    if (current === null || best === Infinity) {
      break;
    }
    if (current === to) {
      break;
    }
    visited[current] = true;
    for (const edge of ADJACENCY[current]) {
      const alt = dist[current] + edge.weight;
      if (alt < dist[edge.to]) {
        dist[edge.to] = alt;
        prev[edge.to] = current;
      }
    }
  }

  const path: string[] = [];
  let node: string | null = to;
  while (node) {
    path.unshift(node);
    node = prev[node];
  }
  if (path[0] !== from) {
    throw new Error(`No path from ${from} to ${to}`);
  }
  return path;
}

/** Waypoint POINTS to walk (excludes the starting node; target is last). */
export function pathWaypoints(from: string, to: string): Vec2[] {
  const nodes = shortestNodePath(from, to);
  return nodes.slice(1).map((id) => ({ ...NAV_NODES[id] }));
}

/** Total path length in world units from a start position along the waypoints. */
export function pathLength(start: Vec2, waypoints: Vec2[]): number {
  let total = 0;
  let cursor = start;
  for (const wp of waypoints) {
    total += distance(cursor, wp);
    cursor = wp;
  }
  return total;
}

export { distance as navDistance };
