/**
 * M02 citizen model types (authoritative, worker-owned).
 *
 * Plain English: the shapes that describe one autonomous citizen — their needs,
 * what they are currently doing, and the traceable reasoning behind their last
 * decision. All of this lives in the simulation worker; the renderer only reads
 * a compact summary (ARCH-002).
 */
import type { Vec2 } from '@/world/townLayout';

/** The five physical needs (spec §7.1). Values are 0..100 (100 = satisfied). */
export type Need = 'hunger' | 'thirst' | 'bladder' | 'energy' | 'hygiene';

export type NeedsState = Record<Need, number>;

/** Actions the M02 citizen can take (Layer-1 reflex + Layer-2 routine). */
export type ActionType = 'sleep' | 'eat' | 'drink' | 'toilet' | 'shower' | 'work' | 'idle';

export type ActionPhase = 'travel' | 'perform';

export interface ActionState {
  type: ActionType;
  /** Location the action is performed at. */
  locationId: string;
  phase: ActionPhase;
  /** Remaining travel waypoints (target is the last point); empty once arrived. */
  path: Vec2[];
  /** simMinute at which the perform phase completes (only meaningful when performing). */
  performUntil: number;
}

export interface DecisionFactor {
  label: string;
  value: number;
}

export interface DecisionCandidate {
  action: ActionType;
  score: number;
  factors: DecisionFactor[];
  /** Set when the action was unavailable/blocked (e.g. already satisfied). */
  blocked?: string;
}

export interface DecisionTrace {
  atMinute: number;
  layer: 'reflex' | 'routine';
  selected: ActionType;
  candidates: DecisionCandidate[];
}

/** Lightweight personality (M02 subset) — influences decision scoring only. */
export interface CitizenPersonality {
  /** 0..100 — higher favours working during work hours. */
  diligence: number;
  /** 0..100 — higher tolerates need pressure longer before acting. */
  discipline: number;
}

export interface CitizenState {
  id: string;
  name: string;
  homeId: string;
  workId: string;
  storeId: string;
  position: Vec2;
  /** Nav-graph node the citizen currently occupies when idle (start of travel). */
  atNode: string;
  /** Facing angle in radians (rendering hint; derived from travel direction). */
  facing: number;
  needs: NeedsState;
  personality: CitizenPersonality;
  action: ActionState | null;
  lastDecision: DecisionTrace | null;
}
