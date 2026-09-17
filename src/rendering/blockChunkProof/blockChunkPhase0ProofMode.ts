/**
 * WF02 R15 Path B Phase 0 — disposable proof mode (URL-gated only).
 */
function readProofSearchParam(): string | null {
  const loc = (globalThis as { location?: { search?: string } }).location;
  if (!loc?.search) return null;
  return new URLSearchParams(loc.search).get('r15PathBPhase0Proof');
}

export function isBlockChunkPhase0ProofActive(): boolean {
  return readProofSearchParam() === '1';
}
