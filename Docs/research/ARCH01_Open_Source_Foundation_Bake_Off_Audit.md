# ARCH01 — Open-Source Foundation Bake-Off Audit

**Tag:** `[GOD-MODE:CURSOR-ARCH-AUDIT]`  
**Work item:** ARCH01  
**State:** READY_FOR_SENIOR_REVIEW  
**Base product inspected:** `main` @ `1715fc6` (WF01 merged; M02 citizen sim present)  
**Audit date:** 2026-09-16  
**Constraint honored:** research-only — no production code changes, no npm installs into product, no third-party copy.

---

## 1. Executive recommendation

**Do not rebase GOD MODE onto any candidate repo.** Keep the worker-authoritative, seeded, browser-first architecture on `main`.

| Candidate | Senior recommendation | One-line rationale |
|---|---|---|
| **TownBox** (`Maudfer/townBox`) | **STUDY / PORT SELECTIVELY** | Mature deterministic society-simulation core (genealogy, events, economy, services, save/history) separated from Phaser via `TickRunner` + `BootstrapWorld`, but spatial model, omniscient event reads, and gossip-only “knowledge” require heavy adapters—not a dependency drop-in. |
| **Strata Game Library** (`jbcom/strata-game-library`) | **REJECT broad adoption; SPIKE FIRST only if senior wants quantified proof** | Large general game framework (ECS, xstate, audio, physics, presets). GOD MODE already has a working ~4.7k-LOC bespoke R3F/world stack on minimal deps; Strata would add framework coupling without clear net reduction for Riverside-scale needs. |
| **react-three-npc / Yuka** | **REJECT** | Frame-delta steering (`EntityManager.update(delta)`) + Rapier kinematic bodies create dual authority and replay nondeterminism. GOD MODE already advances authoritative positions per sim-minute; Yuka is the wrong layer. |

**Recommended next path after senior approval:**

1. **M03 population/households:** build on GOD MODE worker patterns; **selectively port TownBox ideas/algorithms** behind explicit adapters (Spike T), not npm dependency.
2. **World presentation:** **keep GOD MODE R3F stack**; retire WF02 modular-assembly iteration; optionally revisit offline kitbash shells (WF02 R13 Path C) only after M03 society foundations are unblocked.
3. **Movement:** **keep deterministic waypoint graph in worker**; renderer interpolates/snaps only.

---

## 2. Current GOD MODE baseline (what works vs what hurts)

### Architecture (solid)

Four-layer separation is implemented and tested:

| Layer | Path | Authority |
|---|---|---|
| Simulation worker | `src/simulation/worker/simulation.worker.ts`, `src/simulation/model/*` | **Authoritative** |
| World authorship | `src/world/townLayout.ts`, `facilityPoints.ts` | Immutable content |
| Rendering | `src/rendering/**` (~48 TS/TSX files, ~4,655 LOC with `src/world`) | Display-only via `RenderSnapshot` |
| UI | `src/ui/**` | Diagnostics/selection only |
| Persistence | `src/persistence/**` | Zod save bundles; branch/history schemas scaffolded |

**Determinism stack (KEEP):** `mulberry32-v1` PRNG (`src/simulation/core/prng.ts`), derived calendar, Dijkstra pathfinding with lexicographic tie-break (`src/simulation/model/pathfinding.ts`), per-minute movement independent of animation (`src/simulation/model/citizen.ts`), golden digests + integration tests.

**Implemented today:** one citizen (Noah), 5 needs, Layer-1 reflex + Layer-2 utility decisions, deterministic walking home/store/workshop, append-only `DomainEvent[]`, save bundle round-trip in tests, WF01 Riverside town, Kenney character presentation.

**Genuinely painful / missing (expected until M03+):**

- No population, genealogy, households, social graph, economy, crime, perception, memory, God tools, branching UI
- M02 decisions still use **omniscient world knowledge** (canonical spec violation until M03 perception)
- Unbounded event log in memory; no in-app save UI
- Render headroom: ~136 draw calls / ~152k tris now; 20 skinned citizens projected ~272–312k tris without LOD (`Docs/milestones/WF01/M03_HEADROOM.md`)
- Presentation/sim terrain split (river carve renderer-only)

**Tech stack:** React 19, R3F 9.1, Three 0.175, Zustand, Vite, Vitest, Playwright — **no `@react-three/drei`, no Rapier, no Yuka**.

---

## 3. Source / license audit

| Repo | Inspected ref | npm version (if published) | LICENSE (live file) | Notes |
|---|---|---|---|---|
| [Maudfer/townBox](https://github.com/Maudfer/townBox) | `84c1ba4dc011b4815f7dec3afc636bd73c78a070` (2026-07-21) | `0.1.0` (package.json, not published to npm registry) | **MIT** — `LICENSE`, Copyright Mauricio D Angelo Fernandes 2021 | Phaser 4 + React HUD; simulation under `src/app/game/` |
| [jbcom/strata-game-library](https://github.com/jbcom/strata-game-library) | `05a3ffe8bffcb66037f32b27b467129cee310583` (2026-08-24) | `strata-game-library@0.3.1`; core `@strata-game-library/core@1.7.0` | **MIT** — root `LICENSE`, Copyright Jon Bogaty 2025 | pnpm monorepo; Node ≥22; many optional peer deps |
| [ssethsara/react-three-npc](https://github.com/ssethsara/react-three-npc) | `929bc23cbfb03016ee27afe54f3e838fe66380b0` (2024-03-01) | `@ssethsara/react-three-npc@1.2.7` | **MIT** — Copyright Supun Sethsara 2024 | Depends on yuka@0.7.8, R3F 8.x, Three 0.160 (stale vs GOD MODE) |

**Yuka (transitive):** [Mugen87/yuka](https://github.com/Mugen87/yuka) — npm `0.7.8`, MIT.

**License posture:** All three candidates are MIT-compatible. No GPL/copyleft blockers for selective porting. TownBox bundles precompressed history assets (`src/history/*.tbz`) — treat asset licensing separately if ever imported.

---

## 4. Subsystem compatibility matrix

Primary disposition per row.

| Subsystem | Disposition | GOD MODE owner/files | Candidate source | Why it helps | Coupling / deps | Determinism / worker risk | M2 8GB impact | Effort | Test strategy | Rollback | Future subjective-perception / branches |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Authoritative clock/time** | **KEEP GOD MODE** | `src/simulation/core/clock.ts`, `calendar.ts`, `SimulationDriver.ts` | TownBox `util/time.ts`, `TickRunner` | Different tick/year cadence (8640 TPY) | Alien time semantics | **High** — ARCH-005 pacing split must stay | Neutral | S | Existing determinism tests | N/A | Compatible |
| **Seeded PRNG/determinism** | **KEEP GOD MODE** | `src/simulation/core/prng.ts` | TownBox `util/random.ts` (mulberry32) | Algorithm alignment confirms port feasibility | None if we keep our ID/state schema | **Low** | Neutral | S | Golden digest + PRNG unit tests | Keep frozen algorithm ID | Compatible |
| **Event log/history/causal trace** | **ADAPT IDEA** | `src/simulation/core/events.ts`, `decision.ts`; scaffold `schemas/history.ts` | TownBox `LifeLog.ts`, `EventEngine.ts`, `ActionEngine.ts` | Rich append-only cross-system log | Large JSON manifest | **Medium** — omniscient predicates today | Memory growth | L | Seq monotonicity + replay digest | Version bump save format | Needs belief-gated predicates |
| **Save/snapshot/branching** | **KEEP GOD MODE** (+ ADAPT IDEA) | `src/persistence/**` | TownBox `save/SaveManager.ts`, `migrations.ts` | Normalized id-graph snapshots | uuid, pako, localStorage-centric | **Medium** | Neutral | M | Round-trip + mid-sequence restore | Versioned migrations | Branch scaffold exists |
| **Person identity/lifecycle** | **ADAPT IDEA** | `src/simulation/model/citizen.ts` | TownBox `population/Population.ts` | Gompertz mortality, birth, aging | Faker locale coupling | **Medium** | Neutral | L | Headless year-step golden tests | Flag-gate M02 path | Needs perception before decisions |
| **Genealogy/family/households** | **PORT CODE** (selective) | *None* | TownBox `util/kinship.ts`, `HouseholdDraw.ts` | Complete deterministic genealogy + draw | JSON configs | **Medium** — 2D placement | Neutral | L | Kinship + draw unit tests | Adapter module | Compatible as objective truth |
| **Needs/physiology** | **KEEP GOD MODE** | `src/simulation/model/needs.ts` | TownBox `population/Needs.ts` | Richer curves tied to actions | Action coupling | **Low** if we extend ours first | Neutral | M | M02 needs tests | Keep M02 model | Compatible |
| **Traits/mood/personality** | **ADAPT IDEA** | Partial in `types.ts`/`decision.ts` | TownBox `Traits.ts`, `Mood.ts` | Drive eligibility & utility | Cross-deps | **Medium** | Neutral | M | Scoring regression tests | Incremental | Must not bypass perception |
| **Goals/planning/utility decisions** | **KEEP GOD MODE** (extend) | `src/simulation/model/decision.ts` | TownBox `actions/Brain.ts`, `Planner.ts` | Band arbitration + hooks | ActionEngine 1000+ LOC | **High** if wholesale | Neutral | XL | Decision trace tests | Keep Layer-1/2 | Belief-gated candidates |
| **Relationships/social graph** | **PORT CODE** (selective) | *None* | TownBox `population/SocialGraph.ts` | Closed-form decay edges | Event triggers | **Medium** | Neutral | L | Edge decay tests | Isolated module | Compatible |
| **Memory/perception/subjective knowledge** | **KEEP GOD MODE** (build) | *None* | TownBox `KnownFacts.ts` — gossip only | FIFO fact store pattern | Not spatial perception | **High** if misused | Neutral | L | Belief isolation tests | N/A | TownBox ≠ GOD MODE perception |
| **Jobs/skills/work** | **ADAPT IDEA** | Placeholder `work` action | TownBox `skills/*`, `JobOrchestrator.ts` | Job market + progression | Economy coupling | **Medium** | Neutral | L | Employment invariants | Phase M04 | Compatible |
| **Businesses/economy/money** | **ADAPT IDEA** | *None* | TownBox `economy/Economy.ts` | Conserved ledger | Monthly loops | **Medium** | Neutral | L | Conservation tests | Feature flag | Compatible |
| **Illness/health** | **ADAPT IDEA** | *None* | TownBox treatment + services | Coverage-driven loops | Services subsystem | **Medium** | Neutral | M | Coverage determinism | Incremental | Perceived symptoms later |
| **Crime/services** | **ADAPT IDEA** | *None* | TownBox incidents/detention/police sweep | Emergent from coverage | Grid facilities | **Medium** | Neutral | L | Incident replay tests | Incremental | No global shortcuts |
| **Housing/homelessness** | **ADAPT IDEA** | Fixed `homeId` | TownBox housing market | Vacancy/eviction loops | 2D anchors | **High** spatial mismatch | Neutral | L | Housing invariants | Incremental | Compatible |
| **City/facility model** | **KEEP GOD MODE** | `src/world/townLayout.ts`, `facilityPoints.ts` | TownBox grid `world/*` | Tile/building sim | Phaser + grid | **High** | N/A | XL | Facility ID tests | N/A | KEEP 3D facilities |
| **Navigation/pathfinding** | **KEEP GOD MODE** | `pathfinding.ts`, `locations.ts` | Strata ngraph A* | We have deterministic Dijkstra | Smooth paths hurt determinism | **Low** (ours) | Neutral | S | Path golden tests | N/A | Compatible |
| **Character movement execution** | **KEEP GOD MODE** | `citizen.ts` per-minute travel | Yuka/Rapier | Worker already authoritative | Dual authority with Yuka | **High** with Yuka | Physics cost | S | Determinism integration | N/A | Compatible |
| **Animation/presentation** | **KEEP GOD MODE** | `CitizenVisual.tsx`, `citizenPresentation.ts` | Strata animation presets | Kenney pipeline works | ECS overhead | Low | 20-citizen budget | M | Render budget script | N/A | Compatible |
| **Terrain/water/sky/world composition** | **KEEP GOD MODE** | `TownLandscape.tsx`, `DayNightLighting.tsx`, etc. | Strata presets | Shader presets | Large surface | Low sim impact | GPU cost | L | Visual diff + perf | N/A | Compatible |
| **Asset/render pipeline** | **KEEP GOD MODE** | `gltfPipeline.ts`, `materialPool.ts` | Strata instancing | Already solved | Bundle size | Low | Bundle >500kB | M | Build size check | N/A | Compatible |
| **React/UI/inspector boundary** | **KEEP GOD MODE** | `CitizenInspector.tsx`, `diagnosticsStore.ts` | TownBox HUD | 2D city-builder UI | Phaser coupling | Low | Neutral | M | Single-authority tests | N/A | Compatible |

---

## 5. Candidate deep dives

### A. TownBox — simulation vs Phaser coupling

**Separation evidence:**

- Shared tick spine: `src/app/game/execution/TickRunner.ts`
- Execution boundary: `test/execution/executionBoundary.test.ts` — `BootstrapWorld` vs `LiveWorld`
- Core sim ~13,692 LOC under `src/app/game/{execution,population,events,save,history,economy,actions,skills}` without Phaser imports

**Coupling blockers:**

- Live mode needs Phaser `MainScene.ts` for movement materialization
- 2D grid spatial model vs GOD MODE 3D authored coordinates
- `EventEngine.ts` reads full simulation context (omniscient vs future perception)
- `KnownFacts.ts` is reputation/gossip (`types/Reputation.ts`: “NOT a beliefs/deception system”)

### B. Strata — replacement surface

- GOD MODE world/render: ~4,655 LOC, minimal deps
- Strata: monorepo with ECS, physics, audio, 276-file R3F adapter, many peer deps
- **Migration cost: XL; expected code reduction: none measured**

### C. react-three-npc / Yuka — dual authority

- `useFrame((state, delta) => mgr.update(delta))` — frame-rate dependent
- Rapier kinematic bodies hold presentation truth
- Deterministic adapter only possible if worker owns all positions (already true) → Yuka adds no value

---

## 6. Decision matrix (1–5)

| Criterion | TownBox | Strata | react-three-npc/Yuka |
|---|---:|---:|---:|
| Product fit | 4 | 2 | 2 |
| Architecture fit | 2 | 2 | 1 |
| Deterministic compatibility | 4 | 3 | 1 |
| Visual/world leverage | 1 | 3 | 2 |
| Simulation leverage | 5 | 1 | 0 |
| Migration cost (inverse) | 2 | 1 | 3 |
| Runtime cost | 3 | 2 | 2 |
| Maintenance risk | 3 | 2 | 2 |
| License simplicity | 5 | 5 | 5 |
| **Senior call** | **STUDY/PORT SELECTIVELY** | **REJECT** (spike optional) | **REJECT** |

---

## 7. Proposed spikes (post-approval only)

### Spike T — TownBox households + lifecycle

Headless port of `Population.ts`, `HouseholdDraw.ts`, `kinship.ts` behind worker adapter. **PASS:** same seed → identical person table + event seq; no Phaser in worker bundle; no M02 digest drift.

### Spike S — Strata world comparison

Disposable scene: current R3F vs Strata terrain/water/sky. **PASS:** ≥25% LOC reduction OR ≥15% draw/tri reduction OR documented unique capability.

### Spike N — Movement authority

Home → store → workshop with worker Dijkstra + renderer lerp only (no Yuka). **PASS:** `digestCitizenWorld` identical with smoothing on/off after 1000 sim minutes.

---

## 8. Migration sequence (if TownBox port approved)

1. Freeze WF02 presentation churn
2. M03 worker population scaffold (20 citizens)
3. Port kinship + household draw (Spike T)
4. Extend event log toward seq/causation; version bump saves
5. Social graph + mood with perception gates designed upfront
6. Economy/jobs (M04) — adapt ledger, not wholesale EventEngine
7. Crime/services after economy + perception
8. Optional: borrow Strata shader *ideas* into GOD MODE materials, not framework

---

## 9. WF02 #12 and M03 #10

### WF02 PR #12 — **RETIRE modular iteration; REUSE selected work**

- R10–R12 modular assembly capped finished form (branch README)
- Do not resume visual iteration until senior decision
- **Reuse:** Kenney pipeline, material pool, evidence tooling, scale calibration
- **Retire:** modular cell assembly as primary facade strategy
- **After review:** R13 Path C kitbash shells OR defer facade until M03 LOD

### M03 PR #10 — **KEEP ON HOLD**

Plan-only @ `16756dc` is correct. Unblock after Spike T decision.

---

## 10. Non-actions confirmed

- No production simulation/rendering changes
- No npm packages added
- No third-party source copied
- No WF02/M03 implementation started

**Builder stops here pending senior review.**
