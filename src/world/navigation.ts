/**
 * Lightweight navigation graph for M02 (spec §30.8).
 */
import type { Vec2 } from './townLayout';
import { CANONICAL_TOWN } from './townLayout';
import { FACILITY_POINTS } from './facilityPoints';

export interface NavNode {
  id: string;
  position: Vec2;
}

export interface NavGraph {
  nodes: ReadonlyMap<string, NavNode>;
  adjacency: ReadonlyMap<string, readonly { to: string; distance: number }[]>;
}

const SAMPLE_SPACING = 4;
const MERGE_DISTANCE = 1.5;
const FACILITY_LINK_DISTANCE = 18;

function distance(a: Vec2, b: Vec2): number {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

function findMergedNode(nodes: NavNode[], position: Vec2): NavNode {
  const existing = nodes.find((node) => distance(node.position, position) <= MERGE_DISTANCE);
  if (existing) return existing;
  const id = `nav-${nodes.length}`;
  const created = { id, position: { x: position.x, z: position.z } };
  nodes.push(created);
  return created;
}

function buildGraph(): NavGraph {
  const nodes: NavNode[] = [];
  const edgePairs = new Set<string>();

  function connect(a: NavNode, b: NavNode): void {
    if (a.id === b.id) return;
    const key = a.id < b.id ? `${a.id}|${b.id}` : `${b.id}|${a.id}`;
    edgePairs.add(key);
  }

  const segments = [...CANONICAL_TOWN.roads, ...CANONICAL_TOWN.sidewalks, ...CANONICAL_TOWN.paths];
  for (const segment of segments) {
    const len = distance(segment.from, segment.to);
    const steps = Math.max(1, Math.ceil(len / SAMPLE_SPACING));
    let previous: NavNode | null = null;
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      const point = {
        x: segment.from.x + (segment.to.x - segment.from.x) * t,
        z: segment.from.z + (segment.to.z - segment.from.z) * t,
      };
      const node = findMergedNode(nodes, point);
      if (previous) connect(previous, node);
      previous = node;
    }
  }

  // Town square hub helps bridge quadrants for the M02 route slice.
  const squareHub = findMergedNode(nodes, CANONICAL_TOWN.square.center);
  squareHub.id = 'hub-square';

  for (const facility of FACILITY_POINTS) {
    const facilityNode: NavNode = {
      id: `facility-${facility.facilityId}`,
      position: { x: facility.entrance.x, z: facility.entrance.z },
    };
    nodes.push(facilityNode);

    let nearest: NavNode | null = null;
    let nearestDist = Infinity;
    for (const node of nodes) {
      if (node.id === facilityNode.id || node.id.startsWith('facility-')) continue;
      const dist = distance(node.position, facilityNode.position);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = node;
      }
    }
    if (nearest && nearestDist <= FACILITY_LINK_DISTANCE) {
      connect(facilityNode, nearest);
    }
    connect(facilityNode, squareHub);
  }

  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const adjacency = new Map<string, { to: string; distance: number }[]>();

  for (const key of edgePairs) {
    const [fromId, toId] = key.split('|');
    const from = nodeMap.get(fromId);
    const to = nodeMap.get(toId);
    if (!from || !to) continue;
    const dist = distance(from.position, to.position);
    const fromList = adjacency.get(from.id) ?? [];
    fromList.push({ to: to.id, distance: dist });
    adjacency.set(from.id, fromList);
    const toList = adjacency.get(to.id) ?? [];
    toList.push({ to: from.id, distance: dist });
    adjacency.set(to.id, toList);
  }

  return { nodes: nodeMap, adjacency };
}

export const NAV_GRAPH: NavGraph = buildGraph();

export interface PathResult {
  nodeIds: string[];
  totalDistance: number;
}

export function findPath(fromNodeId: string, toNodeId: string): PathResult | null {
  if (fromNodeId === toNodeId) return { nodeIds: [fromNodeId], totalDistance: 0 };
  const start = NAV_GRAPH.nodes.get(fromNodeId);
  const goal = NAV_GRAPH.nodes.get(toNodeId);
  if (!start || !goal) return null;

  const open = new Set<string>([fromNodeId]);
  const cameFrom = new Map<string, string>();
  const gScore = new Map<string, number>([[fromNodeId, 0]]);
  const fScore = new Map<string, number>([[fromNodeId, distance(start.position, goal.position)]]);

  while (open.size > 0) {
    let current = '';
    let best = Infinity;
    for (const id of open) {
      const score = fScore.get(id) ?? Infinity;
      if (score < best) {
        best = score;
        current = id;
      }
    }

    if (current === toNodeId) {
      const nodeIds = [current];
      while (cameFrom.has(current)) {
        current = cameFrom.get(current)!;
        nodeIds.unshift(current);
      }
      return { nodeIds, totalDistance: gScore.get(toNodeId) ?? 0 };
    }

    open.delete(current);
    for (const neighbor of NAV_GRAPH.adjacency.get(current) ?? []) {
      const tentative = (gScore.get(current) ?? Infinity) + neighbor.distance;
      if (tentative < (gScore.get(neighbor.to) ?? Infinity)) {
        cameFrom.set(neighbor.to, current);
        gScore.set(neighbor.to, tentative);
        const node = NAV_GRAPH.nodes.get(neighbor.to);
        fScore.set(neighbor.to, tentative + (node ? distance(node.position, goal.position) : 0));
        open.add(neighbor.to);
      }
    }
  }

  return null;
}

export function nearestNodeId(position: Vec2): string {
  let bestId = '';
  let bestDist = Infinity;
  for (const node of NAV_GRAPH.nodes.values()) {
    const dist = distance(position, node.position);
    if (dist < bestDist) {
      bestDist = dist;
      bestId = node.id;
    }
  }
  return bestId;
}

export function positionAlongPath(nodeIds: readonly string[], traversedDistance: number): Vec2 {
  if (nodeIds.length === 0) return { x: 0, z: 0 };
  if (nodeIds.length === 1) {
    return NAV_GRAPH.nodes.get(nodeIds[0])?.position ?? { x: 0, z: 0 };
  }

  let remaining = traversedDistance;
  for (let i = 0; i < nodeIds.length - 1; i += 1) {
    const a = NAV_GRAPH.nodes.get(nodeIds[i])?.position;
    const b = NAV_GRAPH.nodes.get(nodeIds[i + 1])?.position;
    if (!a || !b) continue;
    const segLen = distance(a, b);
    if (remaining <= segLen) {
      const t = segLen === 0 ? 0 : remaining / segLen;
      return { x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t };
    }
    remaining -= segLen;
  }

  const last = NAV_GRAPH.nodes.get(nodeIds[nodeIds.length - 1]);
  return last?.position ?? { x: 0, z: 0 };
}

export function pathDistance(nodeIds: readonly string[]): number {
  let total = 0;
  for (let i = 0; i < nodeIds.length - 1; i += 1) {
    const a = NAV_GRAPH.nodes.get(nodeIds[i])?.position;
    const b = NAV_GRAPH.nodes.get(nodeIds[i + 1])?.position;
    if (a && b) total += distance(a, b);
  }
  return total;
}
