/**
 * WF02 R15.4 Strategy A Phase 0 — disposable hero-scene proof mode (URL-gated only).
 */
function readProofSearchParam(): string | null {
  const loc = (globalThis as { location?: { search?: string } }).location;
  if (!loc?.search) return null;
  return new URLSearchParams(loc.search).get('r15ScenePhase0Proof');
}

export function isHeroScenePhase0ProofActive(): boolean {
  return readProofSearchParam() === '1';
}
