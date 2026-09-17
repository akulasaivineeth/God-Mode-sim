/**
 * M02 functional locations + lightweight waypoint navigation graph (spec §30.8).
 * WF02 R9 — coordinates resolved through world-definition layer.
 */
import type { ActionType } from './types';
import type { Vec2 } from '@/world/townLayout';
import {
  resolveEntranceForSemantic,
  resolveNavGraph,
  resolveSimLocationPoint,
} from '@/world/resolver/worldResolver';

export interface WorldLocation {
  id: 'home' | 'store' | 'work';
  label: string;
  point: Vec2;
  serves: ActionType[];
}

function locationFromSemantic(id: WorldLocation['id']): WorldLocation {
  const entry = resolveEntranceForSemantic(id);
  return {
    id,
    label: entry.label,
    point: entry.entrance,
    serves: [...(entry.serves ?? [])],
  };
}

export const LOCATIONS: Record<WorldLocation['id'], WorldLocation> = {
  home: locationFromSemantic('home'),
  store: locationFromSemantic('store'),
  work: locationFromSemantic('work'),
};

export const ACTION_LOCATION: Record<ActionType, WorldLocation['id'] | null> = {
  sleep: 'home',
  toilet: 'home',
  shower: 'home',
  drink: 'home',
  eat: 'store',
  work: 'work',
  idle: null,
};

const nav = resolveNavGraph();

/** Navigation waypoint nodes (road anchors + building access points). */
export const NAV_NODES: Record<string, Vec2> = nav.nodes;

/** Undirected edges between adjacent waypoints (follow the roads). */
export const NAV_EDGES: ReadonlyArray<readonly [string, string]> = nav.edges;

export function locationById(id: WorldLocation['id']): WorldLocation {
  return LOCATIONS[id];
}

export function simPointForAction(action: ActionType): Vec2 | null {
  return resolveSimLocationPoint(action);
}
