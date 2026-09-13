/**
 * M02 functional locations + lightweight waypoint navigation graph (spec §30.8).
 *
 * Plain English: the citizen lives at a home, eats at the store, and works at the
 * workshop. Instead of walking in straight lines through buildings, they follow a
 * small graph of waypoints laid over the town's roads. This is authored,
 * deterministic world data (like the town geometry) — it carries no simulation
 * authority (ADR-006).
 *
 * Points reference the authored town building centres so the citizen visibly
 * arrives at the right buildings.
 */
import { CANONICAL_TOWN, type Vec2 } from '@/world/townLayout';
import type { ActionType } from './types';

/**
 * A location's point is placed just OUTSIDE the building (at its doorstep) rather
 * than at the centre, so the citizen stands on open ground and is visible while
 * performing actions there (M02 has no interiors yet).
 */
function doorstepPoint(id: string, offsetZ: number): Vec2 {
  const b = CANONICAL_TOWN.buildings.find((building) => building.id === id);
  if (!b) {
    throw new Error(`Unknown building for location: ${id}`);
  }
  return { x: b.position.x, z: b.position.z + offsetZ };
}

export interface WorldLocation {
  id: 'home' | 'store' | 'work';
  label: string;
  point: Vec2;
  serves: ActionType[];
}

const HOME_POINT = doorstepPoint('house-1', 4.5);
const STORE_POINT = doorstepPoint('store', -6);
const WORK_POINT = doorstepPoint('workshop', -6);

export const LOCATIONS: Record<WorldLocation['id'], WorldLocation> = {
  home: { id: 'home', label: 'Home', point: HOME_POINT, serves: ['sleep', 'toilet', 'shower', 'drink'] },
  store: { id: 'store', label: 'General Store', point: STORE_POINT, serves: ['eat'] },
  work: { id: 'work', label: 'Workshop', point: WORK_POINT, serves: ['work'] },
};

/** Which location serves each action (idle is performed in place → null). */
export const ACTION_LOCATION: Record<ActionType, WorldLocation['id'] | null> = {
  sleep: 'home',
  toilet: 'home',
  shower: 'home',
  drink: 'home',
  eat: 'store',
  work: 'work',
  idle: null,
};

/** Navigation waypoint nodes (road anchors + building access points). */
export const NAV_NODES: Record<string, Vec2> = {
  SQ: { x: 0, z: 0 },
  RN: { x: 0, z: -10 },
  RW: { x: -11, z: 0 },
  RE: { x: 11, z: 0 },
  home: HOME_POINT,
  store: STORE_POINT,
  work: WORK_POINT,
};

/** Undirected edges between adjacent waypoints (follow the roads). */
export const NAV_EDGES: ReadonlyArray<readonly [string, string]> = [
  ['SQ', 'RN'],
  ['SQ', 'RW'],
  ['SQ', 'RE'],
  ['RN', 'home'],
  ['RE', 'home'],
  ['RW', 'store'],
  ['store', 'work'],
];

export function locationById(id: WorldLocation['id']): WorldLocation {
  return LOCATIONS[id];
}
