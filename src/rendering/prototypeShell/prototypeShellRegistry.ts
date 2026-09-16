/**
 * WF02 R13 — four finished-architecture prototype shells.
 */
import manifest from './prototypeShellManifest.json';
import type { PrototypeShellSpec } from './prototypeShellTypes';

export const R13_PROTOTYPE_SHELLS: PrototypeShellSpec[] =
  manifest as unknown as PrototypeShellSpec[];

export function findShellForBuilding(buildingId: string): PrototypeShellSpec | undefined {
  return R13_PROTOTYPE_SHELLS.find((shell) => shell.replacesBuildingIds.includes(buildingId));
}

export function findShellById(shellId: string): PrototypeShellSpec | undefined {
  return R13_PROTOTYPE_SHELLS.find((shell) => shell.shellId === shellId);
}
