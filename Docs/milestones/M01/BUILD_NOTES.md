# M01 Build Notes

What was built for M01, module by module. Requirement IDs in parentheses.

---

## Simulation core (authoritative, deterministic)

### `src/simulation/core/calendar.ts` (SIM-TIME-001 / SIM-TIME-004)

Pure derivation of the human-readable calendar from the single authoritative
counter `simMinute`. Defines the fictional calendar constants (60-minute hours,
24-hour days, 7-day weeks, 30-day months, 12-month years, 4 three-month
seasons) and `deriveCalendar(simMinute)` which returns hour, minute, day, month,
year, weekday, season, `timeOfDay` (0–1 fraction), `isDaytime`, and a `HH:MM`
label. A fixed `WORLD_START_OFFSET_MINUTES` (06:00) makes simMinute 0 a pleasant
morning start. Nothing here is stored, so it cannot drift from the counter and
does not touch the save schema or determinism digest.

### `src/simulation/core/speed.ts` (SIM-TIME-002 / SIM-TIME-003 / ARCH-005)

The canonical speed set `[0, 0.25, 1, 5, 20, 100, 1000]`, helpers `isPaused`
and `isAnimationSuppressed` (≥100×), and the pure pacing function
`accumulateSimMinutes(state, elapsedRealMs, speed)`. Pacing converts elapsed
real time × speed into whole simulated minutes, carrying a fractional remainder
so slow speeds accumulate exactly and no time is lost. Real deltas are clamped
to one second to avoid runaway catch-up after a stall. Pause always yields zero
minutes.

**Why this matters:** speed only decides *how many* minutes elapse, never *what*
happens in a minute — the key to ARCH-005.

---

## Simulation driver (main thread)

### `src/simulation/SimulationDriver.ts` (SIM-TIME-002/003, ARCH-005)

Wraps `SimulationClient`. Runs a `requestAnimationFrame` loop; each frame it
feeds the elapsed real time and current speed into `accumulateSimMinutes` and,
when at least one whole minute is due, sends `STEP { count }` to the worker.
`setSpeed` updates the multiplier and resets the frame timer so time that passed
under a previous speed (or while paused) is not retroactively applied. The
worker remains the sole owner of the clock; the driver only decides pacing.

---

## World content (authored, immutable)

### `src/world/townLayout.ts` (WORLD-001)

The canonical town "Riverside" as frozen authored data: typed buildings
(town hall, houses, apartments, general store, clinic, school, cafe, workshop,
warehouse, utility station, farmhouse), two main roads plus two cross streets, a
central park, a town square, farm plots, vacant plots, a cemetery with grave
markers, a river polyline, and deterministically placed trees. Coordinates use
the Three.js ground-plane (X/Z) convention. This is treated as an asset (like a
mesh), not dynamic simulation state (ADR-006).

---

## Rendering (display only, read-only snapshot)

- `src/rendering/types.ts` — extended the read-only `RenderSnapshot` with the
  derived `calendar`, `timeOfDay`, and `isDaytime`. `toRenderSnapshot` computes
  them from `clock.simMinute`.
- `src/rendering/Town.tsx` (WORLD-001) — draws the town: ground, zone patches,
  roads, river, buildings (box walls + pyramid roofs), trees (trunk + cone),
  and graves. Low-poly, shared materials.
- `src/rendering/DayNightLighting.tsx` (SIM-TIME-004) — computes sun position,
  directional/ambient/hemisphere light intensity, and sky background colour
  purely from `timeOfDay`, so lighting is exact at every speed.
- `src/rendering/cameraPresets.ts` / `CameraControls.tsx` (VIS-002) — free
  orbit/pan/zoom using Three.js' built-in `OrbitControls` (no new dependency),
  plus Overview/Angled/Street presets. Camera never affects simulation.
- `src/rendering/Scene.tsx` — composes camera, lighting, town, FPS tracker, and
  a small "sim beacon" that eases at low speed and snaps when animation is
  suppressed (a visible demonstration of the M01 gate).

---

## UI (Zustand, UI-only state)

- `src/ui/stores/diagnosticsStore.ts` — added `speed`, `paused`,
  `animationsSuppressed`, and `setSpeedStatus`.
- `src/ui/components/TimeControls.tsx` (SIM-TIME-002/003) — the speed buttons.
- `src/ui/components/DiagnosticsHud.tsx` — now shows the date, clock, season,
  day/night, speed, and suppression state.
- `src/app/App.tsx` — creates the `SimulationDriver`, wires speed + camera
  presets, and renders the scene/HUD/controls. The old M00 500 ms interval and
  placeholder cube are removed.

---

## Metadata & persistence

- `src/shared/version.ts` — `BUILD_VERSION`/`MILESTONE` → M01. `SCHEMA_VERSION`
  stays `m00.1` because the persisted save shape did not change.
- `src/persistence/schemas/saveBundle.ts` — `milestone` accepts `M00 | M01`.
- `src/shared/requirements.ts` — added M01 acceptance/regression ID lists.
- `scripts/export-review-bundle.ts` — M01 requirement statuses, a 1-day
  scenario, and both the M00 historical digest and the M01 scenario digest.

---

## Determinism / M00 regression

`stepToySimulation`, the PRNG, canonical JSON, digest, and event envelope were
**not modified**. The M00 golden digest test now pins the literal schema
`m00.1` so the historical lock (`fac095d1`) survives milestone version bumps.
