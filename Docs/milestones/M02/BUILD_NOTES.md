# M02 Build Notes

What was built for M02, module by module. Requirement IDs in parentheses.

---

## Simulation model (authoritative, worker-owned) — `src/simulation/model/`

### `types.ts` (NPC-ID-001)
Shapes for one citizen: `NeedsState` (five needs), `ActionState` (type, location,
travel/perform phase, remaining path, perform-until minute), `DecisionCandidate`/
`DecisionTrace` (utility scores + factor breakdown), `CitizenPersonality`
(diligence, discipline), and `CitizenState` (identity, position, current nav node,
facing, needs, personality, action, last decision).

### `locations.ts` (WORLD/§30.8)
Derives functional locations from the authored town — **home** (house), **store**,
**workshop** — each serving specific actions (sleep/toilet/shower/drink at home;
eat at the store; work at the workshop). Defines a lightweight **waypoint
navigation graph** (road anchors + building access nodes) with undirected edges
along the roads. Authored, deterministic world data (ADR-006).

### `pathfinding.ts` (NPC-MOVE-001)
Deterministic Dijkstra over the waypoint graph (ties broken by node id), plus
`pathWaypoints` (points to walk, excluding the start) and `pathLength`. Same trip
→ same route and duration, independent of rendering.

### `needs.ts` (NPC-NEED-001)
Per-minute decay rates (awake), reduced decay while asleep, action effects
(restore the target need with plausible side effects — e.g. drinking fills the
bladder; working tires and dirties), perform durations, and `stepNeeds`. Pure and
deterministic.

### `decision.ts` (NPC-DEC-001 / NPC-DEC-010)
Scores every candidate action from need pressure × weight + time-of-day
suitability (sleep at night, work daytime, meal-time bonus) + personality −
travel cost + small seeded noise. **Layer-1 reflex** boosts any action serving a
critical need so it overrides the routine choice. Returns the selected action and
a full `DecisionTrace` with per-candidate factor breakdowns.

### `citizen.ts` (NPC-ID-001 / NPC-MOVE-001)
`createCitizen` (deterministic generation from the seed) and `stepCitizenMinute`:
decay needs → reflex-interrupt a non-critical action for a critical need → advance
travel (walk along the path; on arrival begin performing) or complete a finished
action → decide when idle. Walk speed is per-minute, so travel resolves by
deterministic duration regardless of animation.

### `world.ts`
`createCitizenWorld(seed, schema)` builds a `WorldSnapshot` containing the citizen
(reusing the shared clock/PRNG/events; the M00 toy state is left static).
`stepCitizenWorld` advances exactly one minute (restore PRNG → step citizen →
snapshot PRNG), emitting a `CITIZEN_DECISION` domain event on fresh decisions.
`runCitizenSteps` loops.

---

## Rendering (display only) — `src/rendering/`

- `Citizen.tsx` (VIS-001) — an original low-poly humanoid from shared primitives
  (legs, torso, arms, head, hair) with a selection ring. Interpolates position at
  normal speed, snaps when animation is suppressed, faces travel direction, and a
  subtle walk bob. Clicking it opens the inspector. No simulation authority.
- `types.ts` — `RenderSnapshot` gains a compact read-only `citizen` summary
  (position, facing, action + phase, human activity label, needs, last decision).
- `Scene.tsx` — renders the citizen and forwards clicks to selection.

## UI — `src/ui/`

- `components/CitizenInspector.tsx` (UX-001) — needs bars, current activity, and
  the last decision's candidate scores + selected factor breakdown; live while the
  sim runs. Closable; reopened by clicking the citizen.
- `stores/diagnosticsStore.ts` — adds `citizenSelected` + setter.
- `app/App.tsx` — seeds `GODMODE_M02_CANONICAL_2026`, renders the inspector.

---

## Worker / persistence / metadata

- `simulation/worker/simulation.worker.ts` — live app now runs
  `createCitizenWorld` + `stepCitizenWorld`; `GET_DIGEST` returns
  `digestCitizenWorld`.
- `core/toySim.ts` — `WorldSnapshot` gains an **optional** `citizens` field
  (backward compatible; M00 digest unaffected).
- `debug/worldDigest.ts` — adds `digestCitizenWorld` (clock + PRNG + citizens +
  event count). `digestWorldSnapshot` unchanged (golden `fac095d1`).
- `persistence/schemas/saveBundle.ts` — full citizen Zod schema (optional);
  `milestone` accepts `M00 | M01 | M02`.
- `shared/version.ts` — `SCHEMA_VERSION` → `m02.0`, `BUILD_VERSION`/`MILESTONE` → M02.
- `shared/requirements.ts` — M02 acceptance/regression ID lists.
- `scripts/export-review-bundle.ts` — M02 statuses, 1-day scenario, and a real
  exported decision/utility trace under `causal-traces/`.

---

## Revision 7 — asset-backed visual foundation (CHATGPT-DECISION M02-008)

The live renderer was rebuilt from primitive placeholders to a coherent
stylized miniature town using vetted CC0 assets, while the M02 simulation
(worker/model) is unchanged and remains the authority. All assets ship in-repo
under `public/assets/` (no runtime downloads) and are catalogued in
`Docs/assets/ASSET_REGISTER.md`.

- **Dedicated facility buildings** (`src/rendering/assets/buildings/*` +
  `BuildingVisualRegistry` + `dedicatedBuildingIds`): `house-1`, `store`, and
  `workshop` skip the generic shell and render Kenney GLB buildings (cottage,
  commercial store + awning + `GENERAL STORE` sign, industrial workshop + sign +
  props). Simulation still references the same authored IDs/coordinates.
- **Real GLB character with clips** (`src/rendering/assets/CitizenVisual.tsx`):
  one shared Kenney character GLB (32 embedded clips) driven by an
  `AnimationMixer` — `walk` while travelling, `sit` for eat/drink/sleep,
  `interact/pick-up` for work, `idle` otherwise — cross-fading on pose change.
  Animation snaps/pauses at high speed while the authoritative position keeps
  updating. The old primitive `Citizen.tsx` was removed (one live character path).
- **Roads / sidewalks / crossing / entrances** (`environment/CorridorPresentation`):
  curbs, a zebra crosswalk + Kenney road-crossing at the civic corridor, and
  entrance aprons/driveways to home/workshop. The authored nav graph is unchanged.
- **Real vegetation** (`environment/VegetationLayer` + `InstancedVegetation`):
  Quaternius CommonTree/Pine/bush/fern/flowers/pebbles, grouped per asset and
  drawn with `InstancedMesh` (no cone trees). ~20+ deterministic placements with
  a dense north/west periphery frame.
- **Continuous terrain + river + bridge** (`environment/TownLandscape` +
  `riverGeometry`): a unified height-tinted terrain mesh and a continuous river
  ribbon with banks, plus a Kenney bridge — replacing segmented box strips.
- **Town square + park** (`environment/TownAmenities`): paved plaza, a fountain,
  instanced benches, lamp posts, a park path ring, and instanced farm rows.
- **Lighting** (`DayNightLighting` + `environment/PracticalLighting`): warm
  daytime with material separation; warm entrance/square/park point-lights fade in
  at night. Time-of-day authority stays in the simulation.

### Render metrics (measured, live HUD via `gl.info.render`)

| View | Draw calls (budget) | Notes |
|------|---------------------|-------|
| Overview | **140** (≤140) | benches/graves/vegetation instanced; background shells trimmed to stay in budget |
| Angled | **134** | |
| Street | **87** (≤100) | |

Triangles remain well under the 150k budget (low-poly CC0 assets). Instancing
(vegetation, benches, graves, lamps, crosswalk) keeps repeated geometry cheap.

## Determinism / M00-M01 regression

The M00 toy sim, PRNG, canonical JSON, digest, and event envelope are unchanged;
the golden digest `fac095d1` (schema `m00.1`) stays locked, and the M01
time-scaling + townLayout suites remain green. Citizen state advances only in
whole sim-minutes via the seeded PRNG, so 1× and 1000× produce identical worlds.

## R8 visual polish (M02-009 FIX_REQUIRED)

Presentation-only corrections on top of R7 — simulation authority unchanged:

- **North-star docs:** all art-direction references point to
  `Docs/art-direction/references/god-mode-town-north-star.png` (JPG retired);
  removed accidental `.tmp/northstar` chunk artifacts.
- **River/periphery:** ribbon uses authored colors, 1.28× presentation width,
  bank/water height separation, bridge placed on the polyline at `z=0`; denser
  east-edge + riverbank vegetation; overview/angled cameras biased toward the river.
- **Facility identity:** larger store awning/sign/apron; workshop sign + four yard
  props; home path/fence/garden tree; dedicated evidence cameras (`home-street`,
  `store-street`, `workshop-street`, `river`, `square`).
- **Character clips:** `pickClip` maps to exact Kenney Alex names (`walk`, `sit`,
  `interact-right`/`pick-up` for work — no attack fallback).
- **Civic warmth:** square/park ground consolidated in `TownAmenities`; taller
  lamp posts; slightly warmer daylight.

## R9 proof/readability correction (M02-010 FIX_REQUIRED)

Bounded presentation + evidence harness fixes — simulation authority unchanged:

- **In-place camera API** (`window.__GODMODE_EVIDENCE__` + `diagnosticsStore.cameraOverride`):
  moves the Three.js camera/target without page reload or simulation restart.
- **Presentation clip exposure** (`CitizenVisual` → `citizenPresentationClip` /
  `presentation-clip` test id): read-only for evidence harness; not simulation state.
- **River evidence framing:** `river` preset looks along the authored tangent
  (ribbon enters/leaves frame, bridge in lower third); modest water/bank contrast
  (lower water surface, higher bank roughness, slightly stronger water emissive).
- **Evidence harness** (`scripts/capture-r9-evidence.mjs`): never navigates after
  acquiring target activity; reframes citizen in-place at 1×; asserts activity,
  pose, clip, and speed at capture time; logs metadata to `capture_metadata.json`.

## R10 proof/readability correction (M02-011 FIX_REQUIRED)

Bounded presentation + evidence harness fixes — simulation authority unchanged:

- **Strict semantic assertions** (`scripts/capture-r10-evidence.mjs`): `assertMeta`
  requires pose **AND** activity **AND** clip; clip mismatch fails capture (no warn-only).
- **1× mixer proof:** acquire at accelerated speed, switch to 1× (not 0× freeze),
  wait ≥450 ms for crossfade settle; WALK/WORK capture two frames ~300 ms apart.
- **Alex evidence framing:** in-place reframe 3.0–4.0 m from citizen, chest-height
  target, front/3-quarter — full body readable (~180 px) without occlusion.
- **Oblique cross-river preset:** `river` camera looks diagonally across the ribbon
  near the bridge (not tangent-along); modest water/bank vertical separation and
  stronger water emissive for readability (presentation only).

## R11 proof/readability correction (M02-012 FIX_REQUIRED)

Bounded presentation + evidence harness fixes — simulation authority unchanged:

- **Continuous portrait tracking:** `evidencePortraitOpts` + `computePortraitCamera` re-apply
  every frame while the citizen moves at 1×; OrbitControls `minDistance` 1.2 m for sub-6 m
  framing (no clamp-back-out).
- **Alex readability:** evidence-only 2.2× scale boost + hidden selection chrome; close
  front/3-quarter framing ~1.5–1.7 m; SIT evidence uses **Eating at the Store** (outdoor
  counter) instead of Sleeping inside the home mesh.
- **River subject framing:** cross-river preset `[48,42,42]→[35,2,0]` (R8-readable baseline); brighter
  presentation water material; bank/water vertical separation + ribbon scale (presentation only).
- **Evidence harness** (`scripts/capture-r11-evidence.mjs`): strict pose∧activity∧clip;
  dual-frame WALK/SIT/WORK at 1× with hash-delta check; preset camera-delta verification;
  publishes GitHub release `review-evidence-m02-013-builder-r11`.
