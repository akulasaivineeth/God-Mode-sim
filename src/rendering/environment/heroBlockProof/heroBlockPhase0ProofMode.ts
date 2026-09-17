/**
 * WF02 R15 Phase 0 — disposable proof mode (URL-gated only).
 * NOT wired into production; active only when ?r15Phase0Proof=1 on evidence captures.
 */
function readProofSearchParam(): string | null {
  const loc = (globalThis as { location?: { search?: string } }).location;
  if (!loc?.search) return null;
  return new URLSearchParams(loc.search).get('r15Phase0Proof');
}

export function isHeroBlockPhase0ProofActive(): boolean {
  return readProofSearchParam() === '1';
}
