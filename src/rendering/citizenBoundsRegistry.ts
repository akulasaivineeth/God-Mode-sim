/**
 * Presentation-only registry for live animated citizen bounds (M02 R12).
 */
import type { Box3, Group } from 'three';

let citizenBodyGroup: Group | null = null;
let citizenWorldBounds: Box3 | null = null;

export function registerCitizenBody(group: Group | null): void {
  citizenBodyGroup = group;
  if (!group) {
    citizenWorldBounds = null;
  }
}

export function getCitizenBody(): Group | null {
  return citizenBodyGroup;
}

export function setCitizenWorldBounds(bounds: Box3 | null): void {
  citizenWorldBounds = bounds;
}

export function getCitizenWorldBoundsFromRegistry(): Box3 | null {
  return citizenWorldBounds;
}
