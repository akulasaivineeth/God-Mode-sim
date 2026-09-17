/**
 * WF02 R9 — semantic world-definition types.
 * Simulation references semantic IDs; coordinates live in world definitions.
 */
import type { ActionType } from '@/simulation/model/types';
import type {
  AreaRect,
  Building,
  BuildingType,
  Forest,
  GraveInstance,
  RoadSegment,
  TerrainConfig,
  TownLayout,
  TreeInstance,
  Vec2,
} from './townLayout';

export type SemanticFacilityId = 'home' | 'store' | 'work';

export type PresentationKind = 'chair' | 'counter' | 'workbench';

export interface FacilityEntranceSpec {
  semanticId?: SemanticFacilityId;
  facilityId: string;
  label: string;
  entrance: Vec2;
  interior: Vec2;
  presentationSpot: Vec2;
  presentationKind: PresentationKind;
  indoorFacingRadians: number;
  serves?: readonly ActionType[];
}

export interface NavGraphSpec {
  nodes: Record<string, Vec2>;
  edges: ReadonlyArray<readonly [string, string]>;
}

export interface CameraSpec {
  position: [number, number, number];
  target: [number, number, number];
}

export interface WorldDefinitionMeta {
  id: string;
  version: number;
  name: string;
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
}

export interface WorldDefinition extends WorldDefinitionMeta {
  layout: TownLayout;
  entrances: readonly FacilityEntranceSpec[];
  nav: NavGraphSpec;
  m02Assignments: {
    homeId: string;
    storeId: string;
    workplaceId: string;
  };
  cameras: Record<string, CameraSpec>;
}

export type {
  AreaRect,
  Building,
  BuildingType,
  Forest,
  GraveInstance,
  RoadSegment,
  TerrainConfig,
  TownLayout,
  TreeInstance,
  Vec2,
};
