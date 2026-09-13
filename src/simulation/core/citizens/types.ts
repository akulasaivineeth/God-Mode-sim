/**
 * M02 citizen state types — NPC-NEED-*, NPC-DEC-001, VIS-001 scaffold.
 */
import type { SimMinute } from '../types';

export interface PhysiologyNeeds {
  /** 0 = satisfied, 100 = urgent. */
  hunger: number;
  thirst: number;
  bladder: number;
  /** 100 = rested, 0 = exhausted. */
  energy: number;
  /** 100 = clean, 0 = dirty. */
  hygiene: number;
}

export interface CitizenAssignments {
  homeId: string;
  storeId: string;
  workplaceId: string;
}

export interface CitizenPosition {
  x: number;
  z: number;
}

export type ActionKind =
  | 'idle'
  | 'travel'
  | 'sleep'
  | 'eat'
  | 'drink'
  | 'use_toilet'
  | 'shower'
  | 'work'
  | 'shop';

export interface ActiveAction {
  kind: ActionKind;
  targetFacilityId: string | null;
  startedAtMinute: SimMinute;
  durationMinutes: number;
  elapsedMinutes: number;
  pathNodeIds?: readonly string[];
  traversedDistance?: number;
  totalPathDistance?: number;
  /** Indoor action to perform after travel completes. */
  followUpAction?: ActionKind;
}

export interface UtilityContributor {
  factor: string;
  value: number;
}

export interface UtilityCandidateScore {
  action: ActionKind;
  targetFacilityId: string | null;
  total: number;
  contributors: UtilityContributor[];
}

export interface UtilityTrace {
  decisionId: string;
  simMinute: SimMinute;
  layer: 1 | 2;
  selectedAction: ActionKind;
  targetFacilityId: string | null;
  candidates: UtilityCandidateScore[];
}

export interface CitizenPersonality {
  conscientiousness: number;
  impulsivity: number;
}

export interface CitizenAppearance {
  shirtColor: string;
  pantsColor: string;
  skinColor: string;
  hairColor: string;
}

export interface CitizenState {
  id: string;
  displayName: string;
  assignments: CitizenAssignments;
  needs: PhysiologyNeeds;
  position: CitizenPosition;
  /** Facility id when indoors; null when traveling outdoors. */
  currentFacilityId: string | null;
  activeAction: ActiveAction;
  lastUtilityTrace: UtilityTrace | null;
  personality: CitizenPersonality;
  appearance: CitizenAppearance;
  /** Minutes worked today — resets each simulated day. */
  workMinutesToday: number;
}

export const WALK_SPEED_UNITS_PER_MINUTE = 3.5;

export const ACTION_DURATIONS: Record<Exclude<ActionKind, 'travel' | 'idle'>, number> = {
  sleep: 420,
  eat: 25,
  drink: 8,
  use_toilet: 10,
  shower: 20,
  work: 60,
  shop: 15,
};
