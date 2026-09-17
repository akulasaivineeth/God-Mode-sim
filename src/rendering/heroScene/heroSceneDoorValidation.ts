/**
 * WF02 R15.4 Strategy A — door socket validation against frozen M02 entrances.
 */
import { getFacilityPoint } from '@/world/facilityPoints';
import manifest from './heroNeighborhoodSceneManifest.json';

export interface DoorSocketRecord {
  label: string;
  facilityId: string;
  localX: number;
  localZ: number;
}

export interface DoorDeltaRecord {
  label: string;
  facilityId: string;
  worldX: number;
  worldZ: number;
  frozenX: number;
  frozenZ: number;
  deltaM: number;
  pass: boolean;
}

export function resolveHeroSceneDoorWorldPosition(
  socket: DoorSocketRecord,
  anchor = manifest.anchor,
): { x: number; z: number } {
  return {
    x: anchor.x + socket.localX,
    z: anchor.z + socket.localZ,
  };
}

export function assertHeroSceneDoorDeltasWithinTolerance(toleranceM = 0.3): DoorDeltaRecord[] {
  const records: DoorDeltaRecord[] = [];
  for (const socket of manifest.doorSockets as DoorSocketRecord[]) {
    const world = resolveHeroSceneDoorWorldPosition(socket);
    const frozen = getFacilityPoint(socket.facilityId).entrance;
    const deltaM = Math.hypot(world.x - frozen.x, world.z - frozen.z);
    records.push({
      label: socket.label,
      facilityId: socket.facilityId,
      worldX: world.x,
      worldZ: world.z,
      frozenX: frozen.x,
      frozenZ: frozen.z,
      deltaM,
      pass: deltaM <= toleranceM,
    });
  }
  return records;
}

export function heroSceneMeshBudgetPass(): { pass: boolean; meshCount: number; hardStop: number } {
  const meshCount = manifest.meshCount;
  const hardStop = manifest.heroSceneDrawBudget.hardStop;
  return { pass: meshCount <= hardStop, meshCount, hardStop };
}
