/**
 * Presentation-only registry for the live animated citizen mesh (M02 R12).
 *
 * Lets evidence framing read world-space bounds after the current pose is applied.
 * Not simulation state — renderer convenience only (ARCH-002).
 */
import type { Group } from 'three';

let citizenBodyGroup: Group | null = null;

export function registerCitizenBody(group: Group | null): void {
  citizenBodyGroup = group;
}

export function getCitizenBody(): Group | null {
  return citizenBodyGroup;
}
