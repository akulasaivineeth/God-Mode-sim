# Milestone M01 — 3D World and Time — Implementation Plan

**Source of truth:** `Docs/specs/GOD_MODE_Canonical_Build_Specification.md` (§4 visuals/camera, §5 time/speed, §30 architecture, §37 milestone plan)
**Validation:** `Docs/qa/GOD_MODE_Independent_Validation_UAT.md` (§16 time/performance, §17 M01 gate, §7 visual fidelity)
**Builder protocol:** `Docs/agents/GOD_MODE_Cursor_Builder_Prompt.md`

This plan converts **only M01** into an implementation task list with stable requirement IDs. It does not implement M02+ features (no citizens, needs, economy, God tools).

---

## 1. Canonical M01 deliverables (spec §37)

> **M01 — 3D world and time.** Deliver: small handcrafted 3D town shell; free camera; day/night; simulation clock; all time speeds; pause; render/simulation separation.
> **Gate:** 1000× may skip animation but time/state remain correct.

M01 UAT gate (UAT §17): *"Must pass camera/time/high-speed rendering independence."* Relevant scenarios: UAT-TIME-001 (pause), UAT-TIME-002 (speed transitions), UAT-TIME-003 (animation suppression), plus ARCH-005 (high-speed independence) and VIS-002 (camera).

---

## 2. Requirement IDs introduced/covered in M01

| ID | Requirement | Status target |
|----|-------------|---------------|
| SIM-TIME-001 | Authoritative simulation clock with calendar (minute→hour→day→week→month→year→season). 1 real second = 1 sim minute at 1×. | Implemented + tested |
| SIM-TIME-002 | All canonical speeds selectable: Pause, 0.25×, 1×, 5×, 20×, 100×, 1000×. | Implemented + tested |
| SIM-TIME-003 | Pause freezes simulation state; camera/UI remain usable. | Implemented + tested |
| SIM-TIME-004 | Day/night cycle derived deterministically from the clock. | Implemented + tested |
| VIS-002 | Free camera: rotate, pan, zoom; plus preset overview/street views. | Implemented (manual UAT) |
| WORLD-001 | Small handcrafted 3D town shell (housing, store, clinic, school, cafe, workshop/warehouse, farm, park, square, community hall, utility area, cemetery, vacant plots, roads, sidewalks, pedestrian paths, trees, nearby forest, modest terrain elevation, river). No Day-1 government building (spec §22). | Implemented + tested |
| ARCH-002 | Render/simulation separation preserved (worker authoritative; renderer read-only). | Regression + preserved |
| ARCH-005 | High-speed rendering independence: identical simulated state for the same elapsed sim-time regardless of speed/batching. | Implemented + tested |
| M01-GATE | 1000× may skip animation but time/state remain correct. | Implemented + tested |

Preserved from M00 (regression): ARCH-001, ARCH-002, ARCH-003, ARCH-004, M00-GATE.

---

## 3. Architecture decisions for M01

### 3.1 Time is authoritative in the worker; pacing is a main-thread concern

- `WorldSnapshot.clock.simMinute` remains the single authoritative integer counter (unchanged from M00).
- The **calendar** (hours, days, months, seasons, day/night) is a **pure derivation** of `simMinute` via `deriveCalendar()`. It is never stored, so it cannot drift from the counter and does not enlarge the save schema or determinism digest.
- Speed and real-time pacing live on the **main thread** in a new `SimulationDriver`. The driver converts elapsed real time × speed into whole sim-minutes and issues `STEP { count }` commands. The worker only advances the deterministic clock/state by `count`.

**Why:** This keeps ARCH-005 automatic. Simulated state is a function of *total sim-minutes stepped*, never of wall-clock pacing or how minutes are batched. Running 1440 minutes as `1×1440`, `24×60`, or `1440×1` yields the identical digest.

### 3.2 Determinism / M00 regression preservation

- `stepToySimulation`, `Mulberry32Prng`, `canonicalize`, `digestCanonical`, `worldDigest`, and the domain-event envelope are **not modified**. The M00 golden digest (`fac095d1` at 100 steps, seed `GODMODE_M00_CANONICAL_2026`, schema `m00.1`) stays locked.
- The persisted save **schema shape is unchanged** in M01, so `SCHEMA_VERSION` stays `m00.1`. Only `BUILD_VERSION` and `MILESTONE` advance to M01, and `saveBundleSchema.milestone` accepts `M00 | M01`. The M00 regression test pins the literal schema `m00.1` so the golden lock is historical and independent of later constant changes.

### 3.3 Static world geometry is authored content, not dynamic simulation state (ADR-006)

- The canonical town layout is immutable authored data in `src/world/townLayout.ts` (like a 3D asset). The renderer reads it directly for geometry.
- Dynamic per-frame data (time, lighting inputs, later NPC transforms) continues to flow **only** through the read-only `RenderSnapshot`. The renderer never writes simulation state (ARCH-002 preserved).

### 3.4 Animation suppression at high speed (M01-GATE, ARCH-005)

- `RenderSnapshot`/store expose `animationsSuppressed` (true at ≥100×). At high speed the renderer snaps visuals instead of interpolating, but the authoritative clock and day/night still reflect exact simulated time.

---

## 4. Module plan

New:
- `src/simulation/core/calendar.ts` — calendar constants + `deriveCalendar(simMinute)` + season/day-night helpers (SIM-TIME-001/004).
- `src/simulation/core/speed.ts` — canonical speed table + pure `accumulateSimMinutes()` pacing math (SIM-TIME-002/003, ARCH-005).
- `src/simulation/SimulationDriver.ts` — main-thread rAF pacing loop wrapping `SimulationClient` (SIM-TIME-002/003).
- `src/world/townLayout.ts` — canonical handcrafted town (WORLD-001).
- `src/rendering/Town.tsx` — low-poly town geometry (WORLD-001, VIS).
- `src/rendering/DayNightLighting.tsx` — sky + sun/ambient from clock (SIM-TIME-004).
- `src/rendering/CameraControls.tsx` — free orbit/pan/zoom camera + presets (VIS-002).
- `src/ui/components/TimeControls.tsx` — pause + speed buttons (SIM-TIME-002/003).

Modified:
- `src/rendering/types.ts` — extend read-only `RenderSnapshot` with calendar/time-of-day fields.
- `src/rendering/Scene.tsx` — compose town, lighting, camera; suppression handling.
- `src/ui/stores/diagnosticsStore.ts` — add speed/pause/suppression + time fields.
- `src/ui/components/DiagnosticsHud.tsx` — show date/time/season/speed; rename to M01.
- `src/app/App.tsx` — use `SimulationDriver`, wire time controls.
- `src/shared/version.ts` — `BUILD_VERSION`/`MILESTONE` → M01 (schema stays `m00.1`).
- `src/shared/requirements.ts` — add M01 requirement constants.
- `src/persistence/schemas/saveBundle.ts` — milestone `M00 | M01`.
- `scripts/export-review-bundle.ts` — M01 requirement statuses + notes.

Removed:
- `src/rendering/WorldPlaceholder.tsx` — superseded by `Town.tsx` (the M00 placeholder cube is retired).

---

## 5. Test plan

Automated (Vitest):
- `tests/unit/calendar.test.ts` — SIM-TIME-001/004 calendar derivation and day/night boundaries.
- `tests/unit/speed.test.ts` — SIM-TIME-002/003 speed table + pacing math (pause = 0 minutes; fractional accumulation; clamp).
- `tests/integration/m01/time-scaling.test.ts` — ARCH-005 / M01-GATE: same total minutes across batchings → identical digest; pause advances nothing.
- Preserved M00 suite unchanged (M00-GATE, ARCH-003/004 regression), with the golden digest pinned to schema `m00.1`.

E2E (Playwright):
- `tests/e2e/smoke.spec.ts` — updated: canvas + HUD + time controls visible; selecting 1000× advances simulated date/time; Pause halts it; camera canvas present.

Manual GUI (computer use, VIS-002/WORLD-001/SIM-TIME): demo town, camera rotate/pan/zoom, day/night change, speed transitions, pause.

---

## 6. Out of scope for M01 (deferred)

Citizens/NPCs, needs, movement/pathing, interiors with roof-fade (VIS-003), economy, God tools, save/branch UI, weather/season's environmental effects beyond visual season label. These are M02+ per spec §37 and are documented in `KNOWN_LIMITATIONS.md`.
