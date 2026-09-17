/**
 * WF02 R9 — active world-definition resolver.
 */
import { WORLD_LAB_MODE } from '../worldLabMode';
import { LEGACY_WORLD_DEFINITION } from '../legacy/legacyTownDefinition';
import { HERO_NEIGHBORHOOD_DEFINITION } from '../worldLab/heroNeighborhood';
import type {
  FacilityEntranceSpec,
  NavGraphSpec,
  SemanticFacilityId,
  WorldDefinition,
} from '../types';
import type { ActionType } from '@/simulation/model/types';
import type { TownLayout, Vec2 } from '../townLayout';

let cached: WorldDefinition | null = null;

export function resolveWorldDefinition(): WorldDefinition {
  if (!cached) {
    cached = WORLD_LAB_MODE ? HERO_NEIGHBORHOOD_DEFINITION : LEGACY_WORLD_DEFINITION;
  }
  return cached;
}

export function resolveActiveLayout(): TownLayout {
  return resolveWorldDefinition().layout;
}

export function resolveNavGraph(): NavGraphSpec {
  return resolveWorldDefinition().nav;
}

export function resolveEntrances(): readonly FacilityEntranceSpec[] {
  return resolveWorldDefinition().entrances;
}

export function resolveEntranceForFacility(facilityId: string): FacilityEntranceSpec {
  const entry = resolveEntrances().find((e) => e.facilityId === facilityId);
  if (!entry) throw new Error(`Unknown facility point: ${facilityId}`);
  return entry;
}

export function resolveEntranceForSemantic(id: SemanticFacilityId): FacilityEntranceSpec {
  const entry = resolveEntrances().find((e) => e.semanticId === id);
  if (!entry) throw new Error(`Unknown semantic facility: ${id}`);
  return entry;
}

export function resolveSimLocationPoint(action: ActionType): Vec2 | null {
  const map: Record<ActionType, SemanticFacilityId | null> = {
    sleep: 'home',
    toilet: 'home',
    shower: 'home',
    drink: 'home',
    eat: 'store',
    work: 'work',
    idle: null,
  };
  const semantic = map[action];
  if (!semantic) return null;
  return resolveEntranceForSemantic(semantic).entrance;
}

export function resolveM02Assignments() {
  return resolveWorldDefinition().m02Assignments;
}

export function resolveWorldCamera(view: string) {
  const cameras = resolveWorldDefinition().cameras;
  const preset = cameras[view];
  if (!preset) return null;
  return preset;
}

export function isWorldLabActive(): boolean {
  return WORLD_LAB_MODE;
}

/** Test-only: reset cached definition after flag changes. */
export function resetWorldDefinitionCacheForTests(): void {
  cached = null;
}

export function getActiveWorldId(): string {
  return resolveWorldDefinition().id;
}

export function getActiveWorldVersion(): number {
  return resolveWorldDefinition().version;
}
