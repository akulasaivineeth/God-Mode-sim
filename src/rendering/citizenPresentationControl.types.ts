/**
 * Evidence-only mixer control surface — types kept separate to avoid circular imports.
 */
export interface PresentationControls {
  seekClipPhase: (phase: number) => number;
  getActiveClipDuration: () => number;
  advanceMixer: (deltaSeconds: number) => void;
}
