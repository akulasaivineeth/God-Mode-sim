# M00 Testing Guide

Plain-English explanation of every automated test, how to run it, and what failure means.

---

## How to run tests

```bash
npm ci                    # exact dependencies
npm run typecheck         # types
npm run lint              # style + Math.random ban in simulation
npm run test              # all Vitest tests (unit + integration)
npm run test:determinism  # determinism integration tests only
npm run test:e2e          # Playwright browser smoke
npm run build             # production build
npm run test:all          # full suite in order
```

**Canonical digest check:** `tests/integration/toy-sim.test.ts` asserts `expect(digest).toBe('fac095d1')` after 100 steps with seed `GODMODE_M00_CANONICAL_2026`. This golden value is regression-locked in CI.

---

## Unit tests

### `tests/unit/arch-003.prng.test.ts` — PRNG determinism

| Test | What it checks | Why it matters | Failure means |
|------|----------------|----------------|---------------|
| Same seed → same floats | Two PRNGs from identical seed produce identical sequences | Saves and replays require reproducible “randomness” | PRNG or seed hashing broke |
| Snapshot/restore continues sequence | Saving PRNG state mid-stream resumes correctly | Mid-game saves must not change future outcomes | Save format or restore logic broke |
| Rejects wrong algorithm | Restoring non-`mulberry32-v1` state throws | Prevents silent algorithm swaps | Migration guard failed |
| Weighted choice deterministic | Same seed → same choice sequence | Toy sim and future NPC rolls depend on this | Weighted draw logic broke |

**Requirement:** ARCH-003

---

### `tests/unit/arch-004.events.test.ts` — Event envelope

| Test | What it checks | Why it matters | Failure means |
|------|----------------|----------------|---------------|
| Valid event parses | Good event passes Zod | Reviewers and saves can trust event shape | Schema too strict or factory broken |
| Invalid event rejected | Negative simTime fails | Corrupt data cannot enter the log | Validation weakened |

**Requirement:** ARCH-004

---

### `tests/unit/canonicalize.test.ts` — Canonical JSON

| Test | What it checks | Why it matters | Failure means |
|------|----------------|----------------|---------------|
| Key order independent | Different key order → same canonical string | Digests must not depend on JavaScript object ordering | Digest false positives/negatives |
| Stable digest | Same logical object → same hash | CI determinism checks | Hash pipeline broke |
| Array order preserved | `[1,2,3]` ≠ `[3,2,1]` | Event order matters | Canonicalizer flattened arrays incorrectly |

**Requirement:** M00-GATE (supports digest stability)

---

### `tests/unit/save-bundle.test.ts` — Save round-trip

| Test | What it checks | Why it matters | Failure means |
|------|----------------|----------------|---------------|
| JSON round-trip | Serialize → parse preserves tick count and digest | Saves must survive disk/export | Schema or serialize bug |

**Requirement:** ARCH-004

---

### `tests/unit/no-math-random.test.ts` — Forbidden randomness

| Test | What it checks | Why it matters | Failure means |
|------|----------------|----------------|---------------|
| No Math.random in simulation | Scans all `src/simulation/**/*.ts` | Browser random is not seedable | Determinism violated |

**Requirement:** ARCH-003

---

## Integration tests

### `tests/integration/toy-sim.test.ts`

| Test | What it checks | Why it matters | Failure means |
|------|----------------|----------------|---------------|
| Golden digest at 100 steps | `expect(digest).toBe('fac095d1')` with canonical seed | M00 gate regression lock in CI | Toy step, PRNG, canonicalization, or digest pipeline changed unintentionally |

**Requirement:** M00-GATE

---

### `tests/integration/determinism.test.ts`

| Test | What it checks | Why it matters | Failure means |
|------|----------------|----------------|---------------|
| Save/restore mid-run | 50 steps → save → 50 more = 100 straight | Loads must continue fairly | Restore or PRNG rehydration broke |
| Different seeds differ | Another seed ≠ canonical digest | Seeds actually change outcomes | PRNG stuck or ignored |

**Requirement:** M00-GATE, ARCH-003

---

## End-to-end test

### `tests/e2e/smoke.spec.ts`

| Test | What it checks | Why it matters | Failure means |
|------|----------------|----------------|---------------|
| App boots | Canvas + diagnostics HUD visible | Build is runnable for PO and Grok | Worker bundle, React, or build config broken |

**Requirement:** ARCH-001 (runnable local app)

---

## Manual checks (recommended for PO)

1. `npm run dev` — see 3D scene and diagnostics updating.
2. Note digest in HUD — should change each step but repeat on full reload + same build + same seed path in tests.
3. Disable network — app still runs.

Grok performs fuller UAT per `Docs/qa/GOD_MODE_Independent_Validation_UAT.md` (ARCH-001–004 for M00).

---

## Review bundle

```bash
npm run export-review-bundle
```

Outputs to `review-bundle/` including `save-baseline.json`, `requirements-status.json`, and `architecture-summary.md`.

---

## If digest changes unexpectedly

**STOP.** Do not commit.

1. Identify whether PRNG, toy step logic, canonicalize, or digest payload fields changed.
2. If intentional, bump `schemaVersion` and document migration.
3. Re-run full suite and update this document + README canonical digest line.

Current canonical digest: **`fac095d1`**
