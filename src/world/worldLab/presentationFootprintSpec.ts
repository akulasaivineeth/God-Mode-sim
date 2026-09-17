/**
 * WF02 R15.3.1 Candidate E — single presentation-footprint authority.
 * Visual-only offsets within frozen hero bounds; sim entrances unchanged.
 * Consumed by disposable ?r15FootprintPhase0Proof=1 layer only (not production).
 */
import { getFacilityPoint } from '@/world/facilityPoints';
import { R13_PROTOTYPE_SHELLS } from '@/rendering/prototypeShell/prototypeShellRegistry';
import type { PrototypeShellSpec } from '@/rendering/prototypeShell/prototypeShellTypes';
import { HERO_NEIGHBORHOOD_DEFINITION } from './heroNeighborhood';

export type FootprintClusterId =
  | 'civic'
  | 'commercial'
  | 'residential'
  | 'future-lot'
  | 'vegetation-frame'
  | 'ground-tint'
  | 'park-river';

export interface ShellFootprintOffset {
  shellId: string;
  originDelta: { dx: number; dz: number };
  rotYDelta?: number;
  doorBindingDeltas?: Array<{ label: string; localDx: number; localDz: number }>;
}

export interface ClusterRootOffset {
  clusterId: FootprintClusterId;
  rootOffset: { dx: number; dz: number };
}

export interface SupplementaryMassingPlacement {
  urlKey: 'treeLarge' | 'treeSmall' | 'fenceLow' | 'planter';
  x: number;
  z: number;
  rotY?: number;
  scale?: number;
}

export interface DoorDeltaRecord {
  label: string;
  facilityId: string;
  simEntrance: { x: number; z: number };
  presentationDoor: { x: number; z: number };
  deltaM: number;
}

export interface FootprintBeforeAfterRow {
  clusterId: string;
  shellId?: string;
  beforeOrigin: { x: number; z: number };
  afterOrigin: { x: number; z: number };
  boundsNote: string;
}

/** R15.3.1 Candidate E Phase 0 — tighten cluster toward Overview central weight (~0, 4). */
export const PRESENTATION_FOOTPRINT_REVISION = '15.3.1';

export const SHELL_FOOTPRINT_OFFSETS: readonly ShellFootprintOffset[] = [
  {
    shellId: 'civic-enclosure-shell',
    originDelta: { dx: 6, dz: 6 },
  },
  {
    shellId: 'commercial-frontage-shell',
    originDelta: { dx: -5, dz: -5 },
    doorBindingDeltas: [
      { label: 'store-door', localDx: 5, localDz: 5.0 },
      { label: 'workshop-door', localDx: 5, localDz: 5.0 },
    ],
  },
  {
    shellId: 'residential-cottage-shell',
    originDelta: { dx: -6, dz: 3 },
    doorBindingDeltas: [{ label: 'home-door', localDx: 6, localDz: -3.0 }],
  },
  {
    shellId: 'residential-gable-shell',
    originDelta: { dx: 6, dz: 3 },
  },
];

export const CLUSTER_ROOT_OFFSETS: readonly ClusterRootOffset[] = [
  { clusterId: 'civic', rootOffset: { dx: 5, dz: 5 } },
  { clusterId: 'commercial', rootOffset: { dx: -3, dz: -3 } },
  { clusterId: 'residential', rootOffset: { dx: 0, dz: 2 } },
  { clusterId: 'future-lot', rootOffset: { dx: 0, dz: -3 } },
  { clusterId: 'vegetation-frame', rootOffset: { dx: 0, dz: 1 } },
  { clusterId: 'ground-tint', rootOffset: { dx: 2, dz: 2 } },
  { clusterId: 'park-river', rootOffset: { dx: -1, dz: 0 } },
];

/** Inward framing trees + civic/commercial edge massing (Kenney vocabulary). */
export const SUPPLEMENTARY_MASSING: readonly SupplementaryMassingPlacement[] = [
  { urlKey: 'treeLarge', x: -6, z: 2, scale: 1.35, rotY: 0.2 },
  { urlKey: 'treeLarge', x: 6, z: 2, scale: 1.3, rotY: -0.15 },
  { urlKey: 'treeSmall', x: -8, z: 8, scale: 1.2, rotY: 0.5 },
  { urlKey: 'treeSmall', x: 8, z: 8, scale: 1.15, rotY: -0.4 },
  { urlKey: 'treeLarge', x: -4, z: 14, scale: 1.25, rotY: 0.1 },
  { urlKey: 'treeLarge', x: 4, z: 14, scale: 1.22, rotY: -0.1 },
  { urlKey: 'fenceLow', x: -2, z: 18, scale: 2.4, rotY: 0 },
  { urlKey: 'fenceLow', x: 2, z: 18, scale: 2.4, rotY: 0 },
  { urlKey: 'planter', x: 0, z: 6, scale: 1.4, rotY: 0 },
  { urlKey: 'treeSmall', x: -12, z: -2, scale: 1.18, rotY: 0.35 },
  { urlKey: 'treeSmall', x: 12, z: -2, scale: 1.18, rotY: -0.35 },
  { urlKey: 'treeLarge', x: 0, z: 20, scale: 1.2, rotY: 0 },
];

const shellOffsetById = new Map(SHELL_FOOTPRINT_OFFSETS.map((o) => [o.shellId, o]));
const clusterOffsetById = new Map(CLUSTER_ROOT_OFFSETS.map((o) => [o.clusterId, o.rootOffset]));

function rotateXZ(x: number, z: number, rotY: number): [number, number] {
  const cos = Math.cos(rotY);
  const sin = Math.sin(rotY);
  return [x * cos - z * sin, x * sin + z * cos];
}

export function getClusterRootOffset(clusterId: FootprintClusterId): { dx: number; dz: number } {
  return clusterOffsetById.get(clusterId) ?? { dx: 0, dz: 0 };
}

export function resolveFootprintShellSpec(base: PrototypeShellSpec): PrototypeShellSpec {
  const offset = shellOffsetById.get(base.shellId);
  if (!offset) return base;

  const origin = {
    x: base.origin.x + offset.originDelta.dx,
    y: base.origin.y,
    z: base.origin.z + offset.originDelta.dz,
  };
  const rotY = base.rotY + (offset.rotYDelta ?? 0);

  const doorBindings = base.doorBindings.map((binding) => {
    const delta = offset.doorBindingDeltas?.find((d) => d.label === binding.label);
    if (!delta) return binding;
    return {
      ...binding,
      localX: binding.localX + delta.localDx,
      localZ: binding.localZ + delta.localDz,
    };
  });

  return { ...base, origin, rotY, doorBindings };
}

export function resolveFootprintShells(): PrototypeShellSpec[] {
  return R13_PROTOTYPE_SHELLS.map(resolveFootprintShellSpec);
}

export function resolveFootprintDoorWorldPosition(
  spec: PrototypeShellSpec,
  label: string,
): { x: number; z: number } | null {
  const binding = spec.doorBindings.find((d) => d.label === label);
  if (!binding) return null;
  const [dx, dz] = rotateXZ(binding.localX, binding.localZ, spec.rotY);
  return { x: spec.origin.x + dx, z: spec.origin.z + dz };
}

const M02_DOOR_FACILITY_MAP: Record<string, string> = {
  'home-door': 'house-1',
  'store-door': 'store',
  'workshop-door': 'workshop',
};

export function computeFootprintDoorDeltas(): DoorDeltaRecord[] {
  const shells = resolveFootprintShells();
  const records: DoorDeltaRecord[] = [];

  for (const [label, facilityId] of Object.entries(M02_DOOR_FACILITY_MAP)) {
    const shell = shells.find((s) => s.doorBindings.some((d) => d.label === label));
    if (!shell) continue;
    const presentationDoor = resolveFootprintDoorWorldPosition(shell, label);
    if (!presentationDoor) continue;
    const simEntrance = getFacilityPoint(facilityId).entrance;
    const deltaM = Math.hypot(
      presentationDoor.x - simEntrance.x,
      presentationDoor.z - simEntrance.z,
    );
    records.push({ label, facilityId, simEntrance, presentationDoor, deltaM });
  }

  return records;
}

export function assertFootprintDoorDeltasWithinTolerance(maxM = 0.3): DoorDeltaRecord[] {
  const records = computeFootprintDoorDeltas();
  for (const record of records) {
    if (record.deltaM > maxM + 0.001) {
      throw new Error(
        `Footprint door ${record.label} delta ${record.deltaM.toFixed(3)}m exceeds ${maxM}m`,
      );
    }
  }
  return records;
}

export function buildFootprintBeforeAfterTable(): FootprintBeforeAfterRow[] {
  return SHELL_FOOTPRINT_OFFSETS.map((offset) => {
    const base = R13_PROTOTYPE_SHELLS.find((s) => s.shellId === offset.shellId)!;
    const after = resolveFootprintShellSpec(base);
    return {
      clusterId: offset.shellId.includes('civic')
        ? 'civic'
        : offset.shellId.includes('commercial')
          ? 'commercial'
          : 'residential',
      shellId: offset.shellId,
      beforeOrigin: { x: base.origin.x, z: base.origin.z },
      afterOrigin: { x: after.origin.x, z: after.origin.z },
      boundsNote: `Δ(${offset.originDelta.dx}, ${offset.originDelta.dz}) within hero bounds`,
    };
  });
}

export function validateFootprintWithinHeroBounds(): { pass: boolean; violations: string[] } {
  const bounds = HERO_NEIGHBORHOOD_DEFINITION.bounds;
  const violations: string[] = [];

  for (const shell of resolveFootprintShells()) {
    const halfW = shell.targetWidth / 2;
    if (shell.origin.x - halfW < bounds.minX || shell.origin.x + halfW > bounds.maxX) {
      violations.push(`${shell.shellId} x out of bounds at ${shell.origin.x}`);
    }
    if (shell.origin.z - halfW < bounds.minZ || shell.origin.z + halfW > bounds.maxZ) {
      violations.push(`${shell.shellId} z out of bounds at ${shell.origin.z}`);
    }
  }

  for (const placement of SUPPLEMENTARY_MASSING) {
    if (
      placement.x < bounds.minX ||
      placement.x > bounds.maxX ||
      placement.z < bounds.minZ ||
      placement.z > bounds.maxZ
    ) {
      violations.push(`massing (${placement.x}, ${placement.z}) outside hero bounds`);
    }
  }

  return { pass: violations.length === 0, violations };
}
