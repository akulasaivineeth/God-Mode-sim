import { describe, expect, it } from 'vitest';
import { canonicalize } from '@/debug/canonicalize';
import { digestCanonical } from '@/debug/digest';

describe('canonical serialization', () => {
  it('sorts object keys deterministically', () => {
    const a = canonicalize({ z: 1, a: 2, m: { y: 1, b: 2 } });
    const b = canonicalize({ a: 2, m: { b: 2, y: 1 }, z: 1 });
    expect(a).toBe(b);
  });

  it('produces stable digests regardless of key order', () => {
    const digestA = digestCanonical({ b: 2, a: 1 });
    const digestB = digestCanonical({ a: 1, b: 2 });
    expect(digestA).toBe(digestB);
  });

  it('preserves array order', () => {
    const left = digestCanonical({ items: [1, 2, 3] });
    const right = digestCanonical({ items: [3, 2, 1] });
    expect(left).not.toBe(right);
  });
});
