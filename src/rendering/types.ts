/**
 * Render snapshot boundary — ADR-003 / ARCH-002.
 *
 * M02 adds read-only citizen presentation fields. The renderer still cannot
 * influence simulation truth.
 */
import { deriveCalendar, type CalendarView } from '@/simulation/core/calendar';
import type { ActionKind } from '@/simulation/core/citizens/types';
import type { UtilityTrace } from '@/simulation/core/citizens/types';
import type { SimMinute } from '@/simulation/core/types';
import type { CitizenState } from '@/simulation/core/citizens/types';
import type { WorldSnapshot } from '@/simulation/core/toySim';
import { getFacilityPoint } from '@/world/facilityPoints';
import { facingAlongPath } from '@/world/navigation';
import type { CitizenPose } from './citizenPresentation';
import { poseForAction } from './citizenPresentation';

export interface RenderCitizen {
  id: string;
  displayName: string;
  x: number;
  z: number;
  y: number;
  action: ActionKind;
  pose: CitizenPose;
  facingRadians: number;
  targetFacilityId: string | null;
  currentFacilityId: string | null;
  appearance: CitizenState['appearance'];
  needs: CitizenState['needs'];
  selected: boolean;
}

function facingForCitizen(citizen: CitizenState): number {
  const action = citizen.activeAction;
  if (action.kind === 'travel' && action.pathNodeIds && action.pathNodeIds.length >= 2) {
    return facingAlongPath(action.pathNodeIds, action.traversedDistance ?? 0);
  }
  if (citizen.currentFacilityId) {
    return getFacilityPoint(citizen.currentFacilityId).indoorFacingRadians;
  }
  return 0;
}

export interface RenderSnapshot {
  simMinute: SimMinute;
  visualPhase: number;
  tickCount: number;
  lastChoice: string;
  accumulator: number;
  calendar: CalendarView;
  timeOfDay: number;
  isDaytime: boolean;
  citizens: RenderCitizen[];
  selectedCitizenId: string | null;
  inspectorTrace: UtilityTrace | null;
}

function renderPositionForCitizen(citizen: CitizenState): { x: number; z: number } {
  // Presentation-only: show citizens at visible outdoor interaction spots while
  // simulation truth remains at interior anchors (ARCH-002).
  if (citizen.currentFacilityId) {
    const spot = getFacilityPoint(citizen.currentFacilityId).presentationSpot;
    return { x: spot.x, z: spot.z };
  }
  return { x: citizen.position.x, z: citizen.position.z };
}

export function toRenderSnapshot(
  input: WorldSnapshot,
  selectedCitizenId: string | null = null,
): RenderSnapshot {
  const calendar = deriveCalendar(input.clock.simMinute);
  const citizens = (input.citizens ?? []).map((citizen) => {
    const renderPos = renderPositionForCitizen(citizen);
    return {
    id: citizen.id,
    displayName: citizen.displayName,
    x: renderPos.x,
    z: renderPos.z,
    y: 0,
    action: citizen.activeAction.kind,
    pose: poseForAction(citizen.activeAction.kind),
    facingRadians: facingForCitizen(citizen),
    targetFacilityId: citizen.activeAction.targetFacilityId,
    currentFacilityId: citizen.currentFacilityId,
    appearance: citizen.appearance,
    needs: citizen.needs,
    selected: citizen.id === selectedCitizenId,
  };
  });

  const selected = input.citizens?.find((citizen) => citizen.id === selectedCitizenId) ?? null;

  return {
    simMinute: input.clock.simMinute,
    visualPhase: input.toy.visualPhase,
    tickCount: input.toy.tickCount,
    lastChoice: input.toy.lastChoice,
    accumulator: input.toy.accumulator,
    calendar,
    timeOfDay: calendar.timeOfDay,
    isDaytime: calendar.isDaytime,
    citizens,
    selectedCitizenId,
    inspectorTrace: selected?.lastUtilityTrace ?? null,
  };
}
