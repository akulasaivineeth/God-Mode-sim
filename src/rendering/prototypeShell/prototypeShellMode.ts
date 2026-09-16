/**
 * WF02 R13 — prototype shell presentation mode (precedence over R12 modular).
 */
import { isWorldLabActive } from '@/world/resolver/worldResolver';
import { WORLD_LAB_PROTOTYPE_SHELL } from '@/world/worldLabModularMode';

const SHELL_SUPPRESSED_BUILDINGS = new Set([
  'house-1',
  'house-2',
  'store',
  'workshop',
  'cafe',
]);

export function isPrototypeShellActive(): boolean {
  return isWorldLabActive() && WORLD_LAB_PROTOTYPE_SHELL;
}

export function isBuildingSuppressedByShell(buildingId: string): boolean {
  return isPrototypeShellActive() && SHELL_SUPPRESSED_BUILDINGS.has(buildingId);
}
