/**
 * Citizen creation — M02 single canonical autonomous NPC.
 */
import { getFacilityPoint, M02_CITIZEN_ASSIGNMENTS } from '@/world/facilityPoints';
import type { Mulberry32Prng } from '../prng';
import { createInitialNeeds } from './needs';
import type { ActiveAction, CitizenAppearance, CitizenState } from './types';

export const M02_CANONICAL_CITIZEN_ID = 'citizen-alex';

export function createM02Citizen(prng: Mulberry32Prng): CitizenState {
  const home = getFacilityPoint(M02_CITIZEN_ASSIGNMENTS.homeId);
  const appearance: CitizenAppearance = {
    shirtColor: '#4a6fa5',
    pantsColor: '#3a4450',
    skinColor: '#d8a67c',
    hairColor: '#3b2a22',
  };

  const activeAction: ActiveAction = {
    kind: 'sleep',
    targetFacilityId: home.facilityId,
    startedAtMinute: 0,
    durationMinutes: 45,
    elapsedMinutes: 0,
  };

  return {
    id: M02_CANONICAL_CITIZEN_ID,
    displayName: 'Alex',
    assignments: { ...M02_CITIZEN_ASSIGNMENTS },
    needs: createInitialNeeds(),
    position: { x: home.interior.x, z: home.interior.z },
    currentFacilityId: home.facilityId,
    activeAction,
    lastUtilityTrace: null,
    personality: {
      conscientiousness: 68 + prng.int(-8, 8),
      impulsivity: 22 + prng.int(-6, 6),
    },
    appearance,
    workMinutesToday: 0,
  };
}
