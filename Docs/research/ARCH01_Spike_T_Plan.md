# ARCH01 Spike T — TownBox Household/Kinship Transplant Plan

**Tag:** `[GOD-MODE:CURSOR-PLAN]`  
**Work item:** ARCH01 Spike T  
**State:** WAITING_FOR_CHATGPT_PLAN_APPROVAL  
**Parent audit SHA:** `222f9da101e0cb6b1d814efa98e4487e48b28278`  
**Plan date:** 2026-09-16  
**Constraint:** plan gate only — no spike implementation until senior approval.

---

## 1. Objective

Prove that a **narrow, objective-truth** slice of TownBox society logic — genealogy kinship derivation plus household placement draw — can run **headlessly** behind explicit GOD MODE adapter boundaries without contaminating:

- worker authority,
- subjective-knowledge architecture,
- save/branch semantics,
- or existing M02 golden/digest locks.

This spike does **not** authorize production porting, npm dependency adoption, or M03 implementation.

---

## 2. Scope boundary

### In scope (ported or adapted in isolated spike tree)

| Layer | TownBox source (commit `84c1ba4`) | Purpose |
|---|---|---|
| Pure kinship | `src/util/kinship.ts` — all exported functions | Deterministic derived relations from parent/partnership graph |
| Household draw | `src/app/game/population/HouseholdDraw.ts` — `selectHousehold`, `DEFAULT_DRAW_PARAMS`, `HouseholdSelection`, `immigrantHousehold` (private), helpers | Living-arrangement selection from population pool |
| Fertility helper | `src/util/fertility.ts` — `sampleMaxChildren`, `DEFAULT_CHILDREN_WILLINGNESS` | Immigrant family `maxChildren` sampling only |
| Types (subset) | `src/types/Genealogy.ts` — `GenPerson`, `PersonTable`, `PopulationState`, `Partnership`, `PersonId` | Objective genealogy records |
| Types (subset) | `src/types/Household.ts` — `HouseholdArrangement`, `DrawParams`, `HouseholdSelection` shape | Draw inputs/outputs |
| Types (subset) | `src/types/Social.ts` — `Genders`, `Gender`, `Relationships`, `Relationship` enums only (strip `Person` import) | Gender/label enums |
| Config | `src/json/householdDraw.json` | Draw weight parameters |
| Pool generator (spike harness only) | `src/app/game/population/Population.ts` — **`generatePopulation` only** | Supplies genealogy pool for end-to-end determinism test |

**Estimated ported LOC (spike tree):** ~620 core + ~290 `generatePopulation` harness = **~910 LOC**, vendored as spike-local copies with GOD MODE adapters — not npm.

### Explicitly out of scope

| Excluded | Reason |
|---|---|
| `TickRunner`, `EventEngine`, `Brain`, `ActionEngine` | Omniscient decision context; not household/kinship |
| `simulatePopulation`, `simulateYear`, life-event loops | Lifecycle sim is a separate M03+ concern |
| `HousingMarket`, eviction, `House.ts`, grid `Field` | 2D spatial coupling; GOD MODE uses 3D `facilityPoints` |
| `KnownFacts`, `SocialGraph` | Gossip ≠ GOD MODE perception |
| Phaser `MainScene`, `LiveWorld`, React HUD | Render/live coupling |
| `@faker-js/faker` | Replaced by seeded GOD MODE name synth (see §6) |
| `uuid`, `Math.random()`, wall clock | Forbidden by spike PASS criteria |
| Wiring into `simulation.worker.ts`, `WorldSnapshot`, `saveBundle.ts` | Production integration deferred until spike PASS |
| Strata, react-three-npc/Yuka | Rejected by senior ARCH01 decision |

---

## 3. TownBox source audit (exact refs)

| Item | Value |
|---|---|
| Repository | https://github.com/Maudfer/townBox |
| Pinned commit | `84c1ba4dc011b4815f7dec3afc636bd73c78a070` (2026-07-21) |
| Package version | `0.1.0` (not published to npm) |
| License | **MIT** — `LICENSE`, Copyright Mauricio D Angelo Fernandes 2021 |

### Functions to port verbatim (logic-preserving; import paths adapted)

**`src/util/kinship.ts` (187 LOC):**
- `parentsOf`, `childrenOf`, `siblingsOf`, `grandparentsOf`, `grandchildrenOf`
- `unclesAuntsOf`, `nephewsNiecesOf`, `cousinsOf`
- `isAliveAt`, `ageAt`, `spouseAt`, `relationshipLabel`

**`src/app/game/population/HouseholdDraw.ts` (272 LOC):**
- `selectHousehold(state, rng, currentTick, capacity, ticksPerYear, params?)`
- `DEFAULT_DRAW_PARAMS`
- Private: `immigrantHousehold`, `commitPlacement`, `pickArrangement`, `shuffle`

**`src/util/fertility.ts` (31 LOC):**
- `sampleMaxChildren`, `DEFAULT_CHILDREN_WILLINGNESS`

**`src/app/game/population/Population.ts` (harness only):**
- `generatePopulation(seed, params)` — full function body
- `DEFAULT_POPULATION_PARAMS` from `src/json/population.json`

### Upstream tests to mirror (not copy wholesale)

| TownBox test file | What it validates |
|---|---|
| `test/util/kinship.test.ts` | Derived kinship on 3-generation fixture |
| `test/population/householdDraw.test.ts` | Guardianship, roommates, nuclear, capacity, determinism |
| `test/population/householdDraw.test.ts` (integration section) | `generatePopulation` + repeated `selectHousehold` |

---

## 4. MIT notice handling

Spike-local vendored files go under `src/spikes/arch01-t/vendor/townbox/` with:

1. **Root spike notice file:** `src/spikes/arch01-t/THIRD_PARTY_NOTICES.md`
   - Full MIT license text from TownBox `LICENSE`
   - Attribution: "Portions adapted from TownBox (Maudfer/townBox), commit 84c1ba4, MIT License"
   - Per-file origin mapping (see §12)

2. **Per-file header** on each vendored/adapted source file:
   ```text
   // SPDX-License-Identifier: MIT
   // Adapted from TownBox (https://github.com/Maudfer/townBox) @ 84c1ba4 — see src/spikes/arch01-t/THIRD_PARTY_NOTICES.md
   ```

3. **No root `package.json` dependency** — vendored spike copies only; deleted on rollback.

4. If spike graduates to production port (post-PASS senior decision), promote notices to repo-root `THIRD_PARTY_NOTICES.md` and record ADR.

---

## 5. GOD MODE adapter boundary

```
┌─────────────────────────────────────────────────────────────────┐
│  Spike harness (Node/Vitest — no browser, no worker mutation)   │
│  runSpikeT(seed: string) → SpikeTResult                         │
└───────────────────────────┬─────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌───────────────┐  ┌────────────────┐  ┌──────────────────────┐
│ SeedAdapter   │  │ IdAdapter      │  │ TimeAdapter          │
│ worldSeed str │  │ pN → person-N │  │ simMinute ↔ tick     │
│ → u32 streams │  │ houseKey →    │  │ ticksPerYear = 525600│
└───────────────┘  │ facilityId    │  └──────────────────────┘
                   └────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌───────────────┐  ┌────────────────┐  ┌──────────────────────┐
│ NameAdapter   │  │ Vendored       │  │ ObjectiveTruthStore  │
│ PRNG names    │  │ kinship + draw │  │ (disposable schema)  │
│ no faker      │  │ + generatePop  │  │ households + people  │
└───────────────┘  └────────────────┘  └──────────────────────┘
                            │
                            ▼
                   ┌────────────────┐
                   │ SpikeEventLog    │
                   │ (disposable)     │
                   └────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  PRODUCTION BOUNDARY — NOT TOUCHED BY SPIKE                     │
│  simulation.worker.ts · WorldSnapshot · citizen.ts · saveBundle│
└─────────────────────────────────────────────────────────────────┘
```

### Adapter modules (GOD MODE authored)

| Module | Path | Responsibility |
|---|---|---|
| `SeedAdapter` | `src/spikes/arch01-t/adapters/seedAdapter.ts` | `hashStringToSeed(worldSeed)` → numeric; fork `populationStream` / `drawStream` via `Mulberry32Prng.fork(salt)` matching TownBox `SeededRandom.fork` semantics |
| `IdAdapter` | `src/spikes/arch01-t/adapters/idAdapter.ts` | Bidirectional `PersonId` ↔ `EntityId`; `facilitySlot(n)` → `house-{n}` matching `facilityPoints.ts` |
| `TimeAdapter` | `src/spikes/arch01-t/adapters/timeAdapter.ts` | GOD MODE `simMinute` as tick; `ticksPerYear = 525_600` (minutes/year); no `Date.now()` |
| `NameAdapter` | `src/spikes/arch01-t/adapters/nameAdapter.ts` | Deterministic `firstName`/`familyName` from PRNG + gender tables (replaces `fakerPT_BR`) |
| `ObjectiveTruthStore` | `src/spikes/arch01-t/schema/objectiveTruth.ts` | Zod schemas for spike-only person/household tables |
| `SpikeEventLog` | `src/spikes/arch01-t/schema/spikeEvents.ts` | Append-only spike events with `causes[]` |
| `Normalizer` | `src/spikes/arch01-t/normalize.ts` | Canonical JSON for byte-identical comparison |
| `runSpikeT` | `src/spikes/arch01-t/runSpikeT.ts` | Headless entry: seed → population → N draws → normalized output |

**Hard rule:** spike code imports **only** from `@/simulation/core/prng`, `@/debug/canonicalize`, and spike-local modules. No `@/simulation/model/*`, no `@/rendering/*`, no worker.

---

## 6. Seed ownership

| Stream | Owner | Derivation |
|---|---|---|
| Master seed | GOD MODE `worldSeed: string` | Canonical input (e.g. `GODMODE_SPIKE_T_CANONICAL_2026`) |
| Population generation | `SeedAdapter.populationStream(master)` | `Mulberry32Prng(hashStringToSeed(master)).fork(0x5050_0001)` |
| Household draw | `SeedAdapter.drawStream(master, drawIndex)` | `populationStream.fork(drawIndex + 0x5050_0002)`; `drawSeed` persisted in `PopulationState.drawSeed` between draws |
| Immigrant names | `NameAdapter` | `drawStream.fork(personSeq)` — no faker, no `Math.random()` |
| M02 citizen sim | **unchanged** | `GODMODE_M02_CANONICAL_2026` — spike must not consume or alter this stream |

TownBox `PopulationState.worldSeed` becomes `hashStringToSeed(master) >>> 0` (numeric mirror for compatibility with `generatePopulation` fork logic).

**Verification:** `tests/unit/no-math-random.test.ts` pattern extended to `src/spikes/arch01-t/**`.

---

## 7. Objective household truth vs future subjective knowledge

### Objective truth (spike produces)

Stored in disposable `ObjectiveTruthStore`:

```typescript
interface ObjectivePerson {
  id: EntityId;           // e.g. "person-00042"
  givenName: string;
  familyName: string;
  gender: 'male' | 'female';
  birthSimMinute: number;
  deathSimMinute: number | null;
  fatherId: EntityId | null;
  motherId: EntityId | null;
  partnerships: { partnerId: EntityId; startSimMinute: number; endSimMinute: number | null }[];
}

interface ObjectiveHousehold {
  id: string;             // e.g. "household-003"
  facilityId: string;     // e.g. "house-3" — maps to facilityPoints, NOT sim position
  headPersonId: EntityId;
  memberPersonIds: EntityId[];
  arrangement: HouseholdArrangement;
}
```

### Subjective knowledge (NOT implemented in spike; mapping documented)

| Objective fact | Future perception layer (M03+) | Example disagreement |
|---|---|---|
| `fatherId` edge in genealogy | Belief: "X is my father" with confidence | Adoptee told wrong parent; belief ≠ truth |
| `memberPersonIds` in household | Belief: "Y lives at house-3" | Roommate moved out yesterday; neighbor still thinks they live there |
| `partnerships[]` | Belief: "X and Y are married" | Secret partnership ended; public belief lags |
| `arrangement: roommates` | Belief: "they are a family" | Outsider assumes nuclear family |
| Immigrant `familyName` | Belief: surname / ethnicity inference | Stereotyping from name alone |

**Spike deliverable:** `Docs/research/ARCH01_Spike_T_SubjectiveMapping.md` (short table, ~1 page) showing:

1. Objective fields live in worker genealogy store (future M03).
2. NPC `BeliefStore` holds perceived household membership with `source` (observed / told / inferred) and `asOfSimMinute`.
3. Decisions query beliefs, never raw `ObjectiveTruthStore` (preserves constitution rules 5–6).
4. God-mode inspector may read objective truth; NPC UI reads beliefs only.

No `KnownFacts.ts` port — TownBox gossip is not GOD MODE perception.

---

## 8. Person / facility ID mapping

| TownBox | GOD MODE spike | Production target (post-PASS) |
|---|---|---|
| `p0`, `p1`, … | `person-00000`, `person-00001`, … | `EntityId` in M03 population schema |
| `houseKey: "row-col"` | `facilityId: "house-{slot}"` | `facilityPoints[].facilityId` |
| `PopulationState.nextSeq` | `nextPersonSeq: number` | M03 person ID allocator |
| `PopulationState.placedIds` | `placedPersonIds: EntityId[]` | M03 placement tracker |
| Capacity integer | `houseCapacity: number` (default 4 for spike) | Authored per Riverside dwelling (WF01) |

**Mapping rule:** draw index `i` → `facilityId = house-${i + 1}` for spike (6 houses in WF01 slice). No grid coordinates enter simulation.

**Noah (M02):** spike does not remap `citizen-noah` or mutate `M02_CITIZEN_ASSIGNMENTS`. Spike runs on a **parallel disposable population**; M02 digest computed independently.

---

## 9. Event emission / causal IDs

Spike uses a **disposable** `SpikeEventLog` — not `WorldSnapshot.events`.

### Event envelope (mirrors ARCH-004 shape for future merge)

```typescript
interface SpikeDomainEvent {
  id: string;              // "spike_evt_{seq}"
  branchId: 'spike-t-main'; // fixed — not production branch
  simTime: SimMinute;
  type: SpikeEventType;
  actorIds: EntityId[];
  payload: unknown;
  causes?: string[];       // prior spike_evt ids
}
```

### Event types (spike only)

| Type | When | Payload | Causes |
|---|---|---|---|
| `SPIKE_POPULATION_GENERATED` | After `generatePopulation` | `{ personCount, seedHash }` | — |
| `SPIKE_HOUSEHOLD_DRAWN` | After each `selectHousehold` | `{ householdId, facilityId, arrangement, memberIds }` | population event |
| `SPIKE_IMMIGRANT_FAMILY_CREATED` | When draw exhausts pool | `{ memberIds, headId }` | draw event |
| `SPIKE_PERSON_PLACED` | Per member in draw | `{ personId, householdId }` | household drawn |

**Sequence:** monotonic `spike_evt_000001`, … included in normalized output.

**Production path (if spike passes):** translate to `HOUSEHOLD_FORMED` / `PERSON_HOUSEHOLD_ASSIGNED` domain events in M03; spike schema discarded.

---

## 10. Save / branch exclusion

| Item | Spike behavior |
|---|---|
| `saveBundle.ts` / `SCHEMA_VERSION` | **No changes** |
| `WorldSnapshot` | **No new fields** |
| `branch.ts` | Spike uses fixed `branchId: 'spike-t-main'` in disposable log only |
| Persistence | Spike output written only to test fixtures / stdout — never `localStorage` |
| Round-trip | Spike-state round-trip test within spike schema only (`spike-t-v0`) |

Rollback = delete spike tree; zero save migration impact.

---

## 11. Spike harness procedure

**Canonical spike seed:** `GODMODE_SPIKE_T_CANONICAL_2026`

**Procedure (`runSpikeT`):**

1. `params = DEFAULT_POPULATION_PARAMS` (from vendored `population.json`, ticksPerYear adapted to 525600)
2. `state = generatePopulation(populationStreamSeed, params)` — names via `NameAdapter`
3. `currentTick = 0` (simMinute 0)
4. For `i` in `0..5` (6 houses):
   - `selection = selectHousehold(state, drawRng, currentTick, capacity=4, ticksPerYear, DEFAULT_DRAW_PARAMS)`
   - Emit events; map to `ObjectiveHousehold` with `facilityId = house-${i+1}`
5. `normalize({ people, households, events })` → canonical JSON string
6. Return `{ normalized, eventSequence, personTable, householdTable }`

**Repeat 3× in CI:** same seed → byte-identical `normalized`.

---

## 12. Exact files touched (spike implementation — post-approval only)

### New files (spike tree only)

```
src/spikes/arch01-t/
  THIRD_PARTY_NOTICES.md
  runSpikeT.ts
  normalize.ts
  adapters/
    seedAdapter.ts
    idAdapter.ts
    timeAdapter.ts
    nameAdapter.ts
  schema/
    objectiveTruth.ts
    spikeEvents.ts
  vendor/townbox/
    kinship.ts          ← from util/kinship.ts
    householdDraw.ts    ← from HouseholdDraw.ts (faker calls → NameAdapter)
    fertility.ts        ← from util/fertility.ts
    populationGenerate.ts ← generatePopulation only
    types/
      genealogy.ts
      household.ts
      social.ts         ← enums only
    config/
      householdDraw.json
      population.json
Docs/research/
  ARCH01_Spike_T_Plan.md              ← this document
  ARCH01_Spike_T_SubjectiveMapping.md ← written during spike
tests/spikes/
  arch01-t-kinship.test.ts
  arch01-t-household-draw.test.ts
  arch01-t-determinism.test.ts
  arch01-t-no-production-drift.test.ts
```

### Files explicitly NOT modified

```
src/simulation/**          (entire tree)
src/rendering/**
src/world/**
src/persistence/**
src/app/**
package.json               (no new dependencies)
```

### Docs-only change on this plan gate PR

- `Docs/research/ARCH01_Spike_T_Plan.md` (this file)

---

## 13. PASS / FAIL criteria

### PASS (all required)

| # | Criterion | Verification |
|---|---|---|
| P1 | Same `GODMODE_SPIKE_T_CANONICAL_2026` → byte-identical `normalize()` output across 3 headless runs | `arch01-t-determinism.test.ts` |
| P2 | Same seed → identical event `id` sequence and payloads (canonicalized) | Same test |
| P3 | No Phaser/browser/render imports in `src/spikes/arch01-t/**` | Static import scan test |
| P4 | No `Math.random()`, `Date.now()`, `performance.now()` in spike core | Extend `no-math-random` scan |
| P5 | M00 golden digest `fac095d1` unchanged | Existing `toy-sim.test.ts` |
| P6 | M02 `digestCitizenWorld` unchanged for `GODMODE_M02_CANONICAL_2026` @ 1440 min | Existing `m02/determinism.test.ts` |
| P7 | No `WorldSnapshot` / `saveBundle` schema diff | `git diff` gate in CI |
| P8 | No authoritative position/facility mutation outside existing interfaces | Spike does not import `citizen.ts` / `facilityPoints` mutators |
| P9 | Subjective mapping document complete | `ARCH01_Spike_T_SubjectiveMapping.md` reviewed |
| P10 | MIT notices present and accurate | Manual + lint script |

### FAIL (any one → retain ideas only; no production port)

- Any P1–P10 failure
- Need to wire spike into worker to get determinism
- Need faker/npm TownBox dependency for reproducibility
- Kinship/draw output varies with batch size or runtime environment
- M02 or M00 digest drift

---

## 14. Test strategy

| Layer | Tests |
|---|---|
| Unit | Ported kinship cases from TownBox `kinship.test.ts` |
| Unit | Household draw scenarios: guardianship, roommates, nuclear, capacity cap, immigrant fallback |
| Unit | `SeedAdapter` fork independence; `IdAdapter` round-trip |
| Integration | Full `runSpikeT` × 3 determinism |
| Regression | M00 + M02 existing suites untouched (CI matrix) |
| Guard | `arch01-t-no-production-drift.test.ts` — fails if spike imports production sim modules |

**Evidence artifact:** `tests/spikes/fixtures/spike-t-canonical-2026.json` (normalized golden output committed after first green run).

---

## 15. Rollback strategy

1. Delete `src/spikes/arch01-t/` and `tests/spikes/arch01-t*.test.ts`
2. Delete `Docs/research/ARCH01_Spike_T_SubjectiveMapping.md` (if created)
3. Remove spike fixture JSON
4. No `package.json` / schema / worker changes to revert
5. No feature flags (spike was never wired to production)

**Time to rollback:** single PR revert.

---

## 16. Effort estimate

| Phase | Size | Notes |
|---|---|---|
| Plan approval (this doc) | — | Gate only |
| Vendor + adapters | M | ~2–3 sessions; faker replacement is main work |
| Tests + golden fixture | S | Mirror TownBox cases |
| Evidence + review bundle | S | Script outputs normalized digest |
| **Total spike** | **M** | ~1 isolated PR, no production wiring |

---

## 17. Post-PASS migration sequence (not authorized now)

1. Senior reviews spike evidence SHA
2. M03 PR #10 unblocks for **plan update** (not immediate implementation)
3. Promote kinship + draw from spike vendor → `src/simulation/society/` behind feature flag `M03_HOUSEHOLD_PORT=0`
4. Integrate `ObjectiveTruthStore` into `WorldSnapshot` with schema version bump
5. Wire domain events (not spike events) into `events.ts`
6. Perception layer reads beliefs only (separate milestone)

---

## 18. WF02 #12 and M03 #10 disposition (unchanged)

| PR | Status | Action |
|---|---|---|
| **WF02 #12** | `HOLD_FOR_ARCH01` | Do not resume R13. Preserve branch; reuse scale/`facilityPoints`/evidence tooling only. |
| **M03 #10** | `PLAN-ONLY / HOLD` | Do not implement until Spike T PASS evidence reviewed. |

---

## 19. Senior approval requested

Approve this plan to authorize **spike implementation only** on an isolated branch. Reject or revise to adjust scope (e.g., drop `generatePopulation` harness and use fixtures-only).

**On approval:** implement spike per §11–§15, post `[GOD-MODE:SPIKE-T-EVIDENCE]` with commit SHA and PASS/FAIL table, then STOP for review.

**On rejection:** retain ARCH01 audit ideas; M03 proceeds native-only unless re-scoped.
