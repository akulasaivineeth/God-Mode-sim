/**
 * Unified citizen presentation registry — Foundation Hardening.
 *
 * Single registration surface for live animated citizen bodies, cached bounds, and
 * evidence-only mixer controls. Supports multiple citizen IDs for M03-scale readiness
 * while preserving M02 evidence APIs that read the primary (first registered) citizen.
 */
import type { Box3, Group } from 'three';
import type { PresentationControls } from './citizenPresentationControl.types';

const bodies = new Map<string, Group>();
const boundsByCitizen = new Map<string, Box3>();
let primaryCitizenId: string | null = null;
let presentationControls: PresentationControls | null = null;

export function registerCitizenBody(citizenId: string, group: Group | null): void {
  if (!group) {
    bodies.delete(citizenId);
    boundsByCitizen.delete(citizenId);
    if (primaryCitizenId === citizenId) {
      primaryCitizenId = bodies.keys().next().value ?? null;
    }
    return;
  }
  bodies.set(citizenId, group);
  if (!primaryCitizenId) {
    primaryCitizenId = citizenId;
  }
}

export function getCitizenBody(citizenId?: string): Group | null {
  if (citizenId) {
    return bodies.get(citizenId) ?? null;
  }
  if (primaryCitizenId) {
    return bodies.get(primaryCitizenId) ?? null;
  }
  return bodies.values().next().value ?? null;
}

export function setCitizenWorldBounds(citizenId: string, bounds: Box3 | null): void {
  if (!bounds) {
    boundsByCitizen.delete(citizenId);
    return;
  }
  boundsByCitizen.set(citizenId, bounds);
}

export function getCitizenWorldBoundsFromRegistry(citizenId?: string): Box3 | null {
  const id = citizenId ?? primaryCitizenId;
  if (!id) return null;
  return boundsByCitizen.get(id) ?? null;
}

export function registerPresentationControls(next: PresentationControls | null): void {
  presentationControls = next;
}

export function seekCitizenClipPhase(phase: number): number {
  if (!presentationControls) {
    throw new Error('Citizen presentation controls unavailable — animated body not mounted');
  }
  return presentationControls.seekClipPhase(phase);
}

export function advanceCitizenMixer(deltaSeconds: number): void {
  if (!presentationControls) {
    throw new Error('Citizen presentation controls unavailable — animated body not mounted');
  }
  presentationControls.advanceMixer(deltaSeconds);
}

export function getCitizenClipDuration(): number {
  return presentationControls?.getActiveClipDuration() ?? 0;
}

/** Test/diagnostics: number of live registered citizen bodies. */
export function registeredCitizenCount(): number {
  return bodies.size;
}
