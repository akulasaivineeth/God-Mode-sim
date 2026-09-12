import { canonicalize } from './canonicalize';

/** FNV-1a 32-bit hash over canonical UTF-8 bytes. */
export function digestCanonical(value: unknown): string {
  const canonical = canonicalize(value);
  let hash = 0x811c9dc5;
  for (let i = 0; i < canonical.length; i += 1) {
    hash ^= canonical.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}
