# M01 Testing Guide

Plain-English explanation of the M01 tests, how to run them, and what a failure
means. All M00 tests are preserved and still pass (regression).

---

## How to run

```bash
npm ci                    # exact dependencies
npm run typecheck         # types
npm run lint              # style + Math.random ban in simulation
npm run test              # all Vitest tests (unit + integration)
npm run test:e2e          # Playwright browser tests
npm run build             # production build
npm run test:all          # full suite in order
npm run export-review-bundle
```

---

## New unit tests

### `tests/unit/calendar.test.ts` — SIM-TIME-001 / SIM-TIME-004

| Test | What it checks | Failure means |
|------|----------------|---------------|
| World start mapping | simMinute 0 → Day 1, 06:00, Spring, Year 1, Monday | Calendar epoch/offset broke |
| Hour/minute roll | 90 min → 07:30 | Minute/hour math broke |
| Day boundary | 1440 min → next day, Tuesday | Day rollover broke |
| Month boundary | 30 days → Secondmonth day 1 | Month math broke |
| Year boundary | 360 days → Year 2, Spring | Year/season reset broke |
| Seasons | months 0/3/6/9 → Spring/Summer/Autumn/Winter | Season mapping broke |
| Day/night boundary | night <06:00 and ≥18:00, day between | Day/night threshold broke |
| timeOfDay fraction | 00:00→0, 12:00→0.5, 18:00→0.75 | Lighting input broke |

### `tests/unit/townLayout.test.ts` — WORLD-001

| Test | What it checks | Failure means |
|------|----------------|---------------|
| Day-one facilities | store, clinic, school, cafe, houses, apartment, workshop, warehouse, utility, farmhouse, park, square, cemetery, plots, river all present | A required facility was dropped |
| Sidewalks | ≥ 2 sidewalk strips per road, all positive width | Sidewalks removed |
| Pedestrian paths | ≥ 4 authored paths, all positive width | Paths removed |
| Nearby forest | ≥ 20 forest trees, forest sits on elevated terrain, distinct from town trees | Forest lost or flattened |
| Terrain elevation | `maxHeight` > 0; flat at core (0,0)/(20,-10); north/west hills bounded by `maxHeight`; east river valley flat | Terrain flattened, unbounded, or river runs uphill |
| Terrain determinism | `terrainHeightAt` returns the same value for the same input | Non-deterministic terrain |
| Buildings on flat core | every building sits at terrain height 0 (no floating/sinking) | A building drifted onto a slope |
| River readability | ≥ 5 points, width ≥ 7, banks wider than water, bends inward (min x ≤ 38), spans the map z | River reduced to a tiny edge strip |
| Building archetypes | archetype defined for every building type; ≥ 2 roof styles; house≠apartment roof; store canopy; utility tower; community entry | Building silhouettes collapsed to one grammar |
| Tree instancing source | `collectAllTrees()` = town + forest trees | Shared/instanced tree path removed |
| No Day-1 government | no `townhall`/`government` type; a neutral `community` building exists; no government-implying labels/ids | A mature-government building was (re)introduced |

**Requirement:** WORLD-001 (spec §3.2 world shell, §22 no Day-1 government). Suite: `tests/unit/townLayout.test.ts` (13 tests).

---

### `tests/unit/speed.test.ts` — SIM-TIME-002 / SIM-TIME-003 / ARCH-005

| Test | What it checks | Failure means |
|------|----------------|---------------|
| Canonical speed set | exactly `[0,0.25,1,5,20,100,1000]` | Speed set changed |
| Pause / suppression flags | pause at 0; suppress at ≥100× | Classifier broke |
| 1 sec = 1 min at 1× | pacing mapping | Real→sim mapping broke |
| Pause is a no-op | 0 minutes, state preserved | Pause could advance time |
| 0.25× accumulation | 4 s → exactly 1 min | Fractional carry lost time |
| 1000× batching | 100 ms → 100 min | Batching broke |
| 1× over many frames | 50×20 ms → 1 min | Rate drift |
| Delta clamp | huge stall clamps to 1 s of catch-up | Runaway catch-up |

---

## New integration test

### `tests/integration/m01/time-scaling.test.ts` — ARCH-005 / M01-GATE

| Test | What it checks | Failure means |
|------|----------------|---------------|
| Batch independence | 1 simulated day stepped as 1 / 7 / 60 / 1440-minute batches → identical digest | State depends on pacing (gate violated) |
| 1× vs 1000× equivalence | driver-generated step counts for slow and fast scenarios reach the identical world for equal total minutes | High speed changes outcomes (gate violated) |
| Pause no-op | stepping 0 minutes leaves the digest unchanged | Pause corrupts state |
| Clock continuity | after a full day the clock label repeats and the day index advances | Calendar/clock desync |

**This is the M01 gate:** *1000× may skip animation but time/state remain
correct.* It holds because world state is a function of total simulated minutes,
not speed or batch size.

---

## New / updated end-to-end tests

### `tests/e2e/smoke.spec.ts`

| Test | What it checks |
|------|----------------|
| App boots | 3D canvas + diagnostics HUD + time controls + camera controls visible |
| Speed + pause | selecting 1000× advances the clock; Pause halts it (SIM-TIME-002/003) |
| Camera presets | Overview/Street/Angled buttons work without breaking the scene (VIS-002) |

---

## Preserved M00 regression tests

All M00 tests still run and pass: PRNG determinism (ARCH-003), event envelope
(ARCH-004), canonical JSON, save round-trip, no-`Math.random` scan, determinism
save/restore, and the **golden digest** `fac095d1` at 100 steps. The golden test
now pins the literal schema `m00.1` so the lock is unaffected by M01's build
version bump.

---

## Manual checks (recommended)

1. `npm run dev` — the town renders under an angled camera.
2. Click **1000×** — the clock races and the sun crosses the sky; the beacon
   snaps (animation suppressed) while the date/time stay exact.
3. Click **Pause** — simulated time stops; drag/scroll still moves the camera.
4. Cycle **0.25× / 1× / 5× / 20× / 100×** — no duplicated or skipped time.
5. Click camera **Overview / Street / Angled**.
6. Disable network — the app still runs (ARCH-001).
