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

## R12 bounds-derived evidence (M02-013 FIX_REQUIRED)

Bounded presentation + evidence harness fixes — simulation authority unchanged:

- **Revert gameplay Alex scale** to accepted `0.02` (R7); remove evidence-only 5× scale
  mutation of normal gameplay appearance.
- **Bounds-derived portrait camera:** live `Box3.setFromObject` on animated body after
  mixer update; FOV + bounding-sphere distance; 4-azimuth occlusion raycast; visibility
  contract (minimum projected area) fails capture if Alex not in frame.
- **ROI motion proof:** dual-frame A/B requires pixel delta inside projected citizen ROI
  (not hash-only); same continuous activity locked for both frames at speed=1.
- **Bridge-centric river preset:** derived from `bridgePlacementOnRiver` + local
  tangent/normal; lower oblique altitude; semantic check vs Overview/Angled + minimum
  water coverage in capture harness.
- **Evidence harness** (`scripts/capture-r12-evidence.mjs`): full release package with
  BEFORE/AFTER river panel, ROI validation JSON, asset/network summary.

## R13 asset-first M02 closure (PRODUCT-DIRECTION)

Narrow vertical slice: **one obvious stylized human** on the HOME → STORE → WORKSHOP
route. Simulation authority unchanged; no town/river redesign.

- **Citizen scale normalization** (`src/rendering/citizenModelScale.ts`): measure Kenney
  `alex-character.glb` rest bbox (~0.67 model units); scale to **~1.8 world units** tall
  with foot offset from bbox min-Y. Fixes the prior `0.02` magic constant that rendered
  Alex invisible (~0.013 units when bbox collapsed against a 90-unit authorship guess).
- **Selection chrome** (`CitizenVisual.tsx` + `sharedMaterials.ts`): removed floating
  yellow cone; subtle translucent blue ground ring only; ring hidden during evidence
  portrait mode so the humanoid is the subject.
- **Evidence camera** (`App.tsx` `frameCitizenSimPortrait`): east-side 3/4 sim-position
  framing from worker truth (not collapsed SkinnedMesh bbox heuristics alone).
- **SkinnedMesh bounds fallback** (`evidencePortrait.ts`): synthesize standing humanoid
  volume when live bbox collapses (portrait metrics only).
- **Closure evidence harness** (`scripts/capture-m02-closure-evidence.mjs`): R13 fail-closed
  image-space proof — rejects identical A/B SHA-256, requires ROI pixel delta (clipPhase
  recorded only, never overrides zero delta), mixer seek API (`citizenPresentationControl.ts`),
  gameplay-scale street HOME/STORE/WORKSHOP shots (no evidence body-scale boost), honest
  static-sit fallback (contrasting idle frame B when Kenney `sit` clip is visually static),
  full regression set (overview/angled/river/square/north-star). Release:
  `review-evidence-m02-013-builder-r13`.

## R13 unified gameplay scale + M02-015 closure (FIX_REQUIRED)

In-place history convergence on `milestone/m02-one-citizen` — **no simulation changes**:

- **Preserved from R12 (`c61ae04`):** bounds-derived portrait metrics (`evidencePortrait.ts` +
  `citizenBoundsRegistry.ts`), bridge-derived river preset + water-coverage gates, strict
  metadata/asset/network checks, archival supersession of `capture-r12-evidence.mjs`.
- **Preserved from R13 (`e606308`):** `citizenModelScale.ts` → ~1.8 m Kenney Alex at gameplay
  scale (no `MODEL_SCALE=0.02` or evidence-only body boost), subtle selection ring (yellow cone
  removed), prefab-backed HOME/STORE/WORKSHOP route + doorstep street presets, 89/89 tests +
  M00 golden `fac095d1`.
- **Authority sweep:** single live path `Scene` → `CitizenVisual.tsx` (no `Citizen.tsx`);
  one scale authority; one closure harness (`capture-m02-closure-evidence.mjs`).
- **R14 proof closure:** live 1× mixer (`animationsSuppressed: false`); minute-0 IDLE before
  daylight advance; dual-frame WALK/SIT-EAT/WORK with ROI motion + distinct SHA-256 (no
  `allowDuplicateHash`, no idle-contrast sit fallback); gameplay-scale street shots; full
  regression + river semantics. Release: `review-evidence-m02-015-builder-r13`.

## M02-020 street camera + subject proof (FIX_REQUIRED)

Presentation/evidence only — simulation coordinates and worker authority unchanged:

- **South-facing facades** (`StoreVisual` / `WorkshopVisual`): removed erroneous π rotation so
  awning/sign/apron face the existing simulation doorsteps at `z = center - 6`.
- **Facility street cameras** (`facilityStreetCamera.ts`): lens south-east of doorstep,
  outside building bounds; targets simulation `LOCATIONS` points.
- **Occlusion-aware portraits** (`evidencePortrait.ts`): raycast line-of-sight to head/chest/pelvis
  sample points; reject candidates blocked by world geometry.
- **SIT clip semantics** (`CitizenVisual.tsx`): `eat`/`sit` pose uses embedded `sit` clip, not
  standing `interact-right`.
- **Static sit A/B proof** (`evidencePortrait.ts` + harness): Kenney `sit` clip is a zero-duration
  pose hold; dual-frame proof uses alternate portrait azimuths (parallax ROI delta) while metadata
  asserts `sit` clip + seated activity at speed 0.
- **Headless-safe activity seek:** evidence API `stepToSimMinute` + canonical schedule minutes.
- Release: `review-evidence-m02-020-builder-r15` with BEFORE/AFTER compare panels vs M02-020 Grok blockers.
