/**
 * WF02 R15.3.1 Candidate E Phase 0 — disposable footprint proof mode (URL-gated only).
 */
function readProofSearchParam(): string | null {
  const loc = (globalThis as { location?: { search?: string } }).location;
  if (!loc?.search) return null;
  return new URLSearchParams(loc.search).get('r15FootprintPhase0Proof');
}

export function isFootprintPhase0ProofActive(): boolean {
  return readProofSearchParam() === '1';
}
