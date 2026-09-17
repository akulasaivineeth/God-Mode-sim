/**
 * WF02 R15 Candidate C Phase 0 — disposable replacement proof mode (URL-gated only).
 */
function readProofSearchParam(): string | null {
  const loc = (globalThis as { location?: { search?: string } }).location;
  if (!loc?.search) return null;
  return new URLSearchParams(loc.search).get('r15ReplacementPhase0Proof');
}

export function isReplacementPhase0ProofActive(): boolean {
  return readProofSearchParam() === '1';
}
