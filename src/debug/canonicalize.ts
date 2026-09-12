/**
 * Canonical JSON for deterministic digests (M00-GATE).
 *
 * Plain English: JavaScript object key order is not guaranteed. Before hashing
 * simulation state, we sort keys recursively so the same logical state always
 * produces the same string. Changing sort rules changes digest values and
 * breaks regression tests — treat as schema-level change.
 *
 * Arrays keep element order (event sequences matter).
 */
export function canonicalize(value: unknown): string {
  return JSON.stringify(sortValue(value));
}

function sortValue(value: unknown): unknown {
  if (value === null || typeof value !== 'object') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => sortValue(item));
  }
  const record = value as Record<string, unknown>;
  const sortedKeys = Object.keys(record).sort();
  const sorted: Record<string, unknown> = {};
  for (const key of sortedKeys) {
    sorted[key] = sortValue(record[key]);
  }
  return sorted;
}
