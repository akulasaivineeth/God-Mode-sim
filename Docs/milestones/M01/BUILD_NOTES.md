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

The canonical town "Riverside" as frozen authored data:

- Typed buildings: houses, apartments, general store, clinic, school, cafe,
  workshop, warehouse, utility station, farmhouse, and a neutral **Community
  Hall**. There is deliberately **no Town Hall / government building** — the
  canonical town begins without a mature local government (spec §22); a physical
  community gathering place is fine but confers no political authority.
- Two main roads plus two cross streets, with **sidewalks** flanking every
  street (deterministically derived) and a set of **pedestrian paths** linking
  the square to the park, housing, store, and community/school areas.
- A central park, a town square, farm plots, vacant plots, a cemetery with grave
  markers, a river polyline, sparse town trees, and a distinct **nearby forest**
  ("North Woods") on the northern hills.
- **Modest terrain elevation** via `terrainHeightAt(x, z)`: a pure, deterministic
  heightfield that is flat in the settled core (so buildings/roads/sidewalks sit
  level) and rises into gentle hills at the periphery where the forest sits. No
  physics.

Coordinates use the Three.js ground-plane (X/Z) convention. All of this is
treated as an authored asset (like a mesh/heightfield), not dynamic simulation
state (ADR-006).

---

## Rendering (display only, read-only snapshot)

- `src/rendering/types.ts` — extended the read-only `RenderSnapshot` with the
  derived `calendar`, `timeOfDay`, and `isDaytime`. `toRenderSnapshot` computes
  them from `clock.simMinute`.
- `src/rendering/Town.tsx` (WORLD-001) — draws the town: terrain-displaced
  ground (segmented plane using `terrainHeightAt`), zone patches, sidewalks,
  roads, pedestrian paths, river with banks, differentiated buildings, the
  forest, and graves — all placed on the terrain height. Low-poly, shared
  materials. See the Revision 3 section below for the visual-polish details.
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

## Revision 3 — visual/art-direction polish & performance (CHATGPT-DECISION M01-002)

All changes below are authored/presentation only; ARCH-002 and determinism are
untouched (golden digest `fac095d1` unchanged).

- **Readable river** (`townLayout.ts`): the river bends inward past the town's
  eastern edge with a broad channel (width 8) and visible banks
  (`bankWidth`/`bankColor`), so Riverside reads as a riverside town from the
  Overview/Angled presets instead of a thin edge strip.
- **Legible terrain** (`townLayout.ts` + `Town.tsx`): hills are concentrated to
  the north/west (where the forest sits) while the eastern river valley stays
  flat, so water never runs uphill. The ground mesh is flat-shaded and tinted by
  height (green core → dry-grass hills) so the elevation reads clearly. Core
  stays perfectly flat; `maxHeight` is a modest 7 (no mountains, no physics).
- **Building archetypes** (`BUILDING_ARCHETYPES` + `Town.tsx`): a small reusable
  set of low-poly archetypes differentiates facilities — gable roofs
  (house/cafe/workshop/warehouse/farmhouse), flat roofs (apartment/store/utility),
  hip roofs (clinic/school/community). Add-ons: storefront awnings (store/cafe),
  protruding entry volumes (civic), a rooftop tank (utility), plus window/door
  colour blocks on the front face. Same fictional-modern language, no asset pack.
- **Composition** — clear hierarchy of water/bank, dark road, light sidewalk,
  tan path, grass, park, farm, square; no billboards or giant labels.
- **Day/night readability** (`DayNightLighting.tsx`): raised ambient/hemisphere/
  directional floors so the town is readable at dawn and daytime without fake
  emissive; night is still visibly darker.
- **Performance — instancing** (`Town.tsx`): all trees (town + forest) now draw
  as two `InstancedMesh` calls (trunks, canopies) instead of one mesh pair per
  tree, and all graves as one `InstancedMesh`. Deterministic authored
  positions/scales are preserved (`collectAllTrees`).

### Render metrics (town shell)

| Metric | Before (per-object meshes) | After (instanced) |
|--------|----------------------------|-------------------|
| Tree draw calls | ~186 (93 trees × trunk+canopy) | **2** |
| Grave draw calls | 16 | **1** |
| Total scene draw calls | ~260 | **99** (measured, live HUD) |
| Triangles | comparable | **~22.7k** (measured) |

Draw calls/triangles are shown live in the diagnostics HUD (`Draw calls · Tris`)
via `gl.info.render`, so the metric is observable at runtime. (FPS in the cloud
review desktop is environment noise, not the M2 target truth.)

---

## Determinism / M00 regression

`stepToySimulation`, the PRNG, canonical JSON, digest, and event envelope were
**not modified**. The M00 golden digest test now pins the literal schema
`m00.1` so the historical lock (`fac095d1`) survives milestone version bumps.
