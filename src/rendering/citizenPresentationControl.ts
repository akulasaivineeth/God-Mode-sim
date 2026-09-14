/**
 * Presentation-only mixer controls for evidence harness (M02 R13).
 *
 * Lets the capture script advance clip phase while simulation speed is 0 so
 * dual-frame proof reflects real skeletal motion — never metadata-only claims.
 */
export interface PresentationControls {
  /** Set normalized clip phase [0,1) on the active action; returns mixer time. */
  seekClipPhase: (phase: number) => number;
  getActiveClipDuration: () => number;
  /** Advance mixer by delta seconds (presentation only). */
  advanceMixer: (deltaSeconds: number) => void;
}

let controls: PresentationControls | null = null;

export function registerPresentationControls(next: PresentationControls | null): void {
  controls = next;
}

export function seekCitizenClipPhase(phase: number): number {
  if (!controls) {
    throw new Error('Citizen presentation controls unavailable — animated body not mounted');
  }
  return controls.seekClipPhase(phase);
}

export function advanceCitizenMixer(deltaSeconds: number): void {
  if (!controls) {
    throw new Error('Citizen presentation controls unavailable — animated body not mounted');
  }
  controls.advanceMixer(deltaSeconds);
}

export function getCitizenClipDuration(): number {
  return controls?.getActiveClipDuration() ?? 0;
}
