# Architecture Decision Records (ADRs)

**Living document** — add a new ADR when a significant architectural choice is made or changed.

Format for each entry: **Decision · Reason · Alternatives · Rejection rationale · Consequences**

---

## ADR-001 — Worker-authoritative simulation

**Status:** Accepted (M00)

### Decision

Run the authoritative simulation loop inside a **Web Worker**, separate from the React main thread.

### Reason

- Keeps the 3D view responsive while simulation work grows (20+ citizens, economy, etc.).
- Creates a hard boundary: UI/render code cannot accidentally mutate world truth.
- Matches canonical spec ARCH-002.

### Alternatives considered

| Alternative | Summary |
|-------------|---------|
| Simulation on main thread | Simpler debugging, shared memory |
| SharedArrayBuffer + atomics | Maximum performance, complex sync |
| Remote server simulation | Scales to huge worlds, violates local-first spec |

### Why alternatives were rejected

- Main-thread simulation would couple rendering freezes to simulation cost — unacceptable at 100×–1000× speeds later.
- SharedArrayBuffer adds threading complexity without M00 need; worker messages are sufficient for 20 citizens.
- Server simulation violates ARCH-001 local-first, no paid API requirement, and offline play.

### Consequences

- All state changes must go through typed `postMessage` commands.
- Debugging requires worker-aware tooling.
- Snapshot export/import is the primary save path.

**Requirement:** ARCH-002

---

## ADR-002 — Seeded deterministic randomness (mulberry32-v1)

**Status:** Accepted (M00) — **frozen algorithm ID**

### Decision

All simulation randomness flows through `Mulberry32Prng` with algorithm ID **`mulberry32-v1`**. Internal state is serializable `{ algorithm, state: uint32 }`. World seeds are strings hashed to initialize state.

### Reason

- Determinism enables saves, replay, regression tests, and fair timeline branches (ARCH-003, EXP-001).
- mulberry32 is small, fast, and easy to port — adequate for V1 population scale.
- Explicit algorithm ID in saves allows future migrations if ever required.

### Alternatives considered

| Alternative | Summary |
|-------------|---------|
| `Math.random()` | Browser default |
| xoshiro128** / PCG | Stronger statistical properties |
| Seed-per-subsystem only | Multiple independent streams |

### Why alternatives were rejected

- `Math.random()` is not seedable/restorable — breaks determinism.
- Stronger PRNGs add state size and migration risk without proven need at N=20.
- Multiple streams can be layered later via derived stream IDs; one canonical service is simpler for M00.

### Consequences

- **Changing mulberry32-v1 invalidates existing seeded worlds** — treat as schema migration.
- ESLint restricts `Math.random()` under `src/simulation/`.
- Every stochastic outcome must use the PRNG service (tests enforce).

**Requirement:** ARCH-003

---

## ADR-003 — Simulation / render separation via RenderSnapshot DTO

**Status:** Accepted (M00)

### Decision

The worker emits a minimal **`RenderSnapshot`** (display-only fields) to the main thread. Full **`WorldSnapshot`** stays in the worker unless explicitly requested (`GET_SNAPSHOT`, save export).

### Reason

- Prevents the renderer from depending on or mutating simulation internals.
- Reduces message size and React re-render cost.
- High simulation speeds can skip visual updates without changing outcomes (future ARCH-005).

### Alternatives considered

| Alternative | Summary |
|-------------|---------|
| Share full WorldSnapshot with React | Single object, easy access |
| Event-sourced render only | Renderer reconstructs from events |
| Mutable shared store (Zustand) for world | Fast reads |

### Why alternatives were rejected

- Full snapshot in React violates ARCH-002 and invites bugs.
- Event-sourced rendering is premature; snapshots are simpler for M00.
- Zustand world store would duplicate authority and break worker isolation.

### Consequences

- Two snapshot types must be maintained (`WorldSnapshot` vs `RenderSnapshot`).
- New visual fields require explicit mapping in `toRenderSnapshot`.
- Unmounting R3F must not affect worker state.

**Requirement:** ARCH-002

---

## ADR-004 — Versioned serialization and save format

**Status:** Accepted (M00)

### Decision

Saves use **`SaveBundle`** JSON validated by **Zod** schemas with explicit `schemaVersion`, `buildVersion`, `milestone`, PRNG state, snapshot, event segment, and digest.

Canonical digests use sorted-key JSON before hashing (FNV-1a).

### Reason

- Rejects corrupt saves early.
- Supports future migrations (`m00.1` → `m01.0`).
- Digests give cheap determinism checks in CI and review.

### Alternatives considered

| Alternative | Summary |
|-------------|---------|
| Unversioned JSON blobs | Fast to ship |
| Binary protobuf/msgpack | Smaller files |
| Full event sourcing only | Perfect audit trail |

### Why alternatives were rejected

- Unversioned JSON caused silent breakage in past projects; Zod fails loud.
- Binary formats harder for PO/reviewer inspection.
- Full event sourcing for every frame is spec-prohibited; hybrid snapshot + events is canonical.

### Consequences

- Schema changes require version bumps and migration notes.
- Dexie/IndexedDB may wrap same schemas later without changing digest rules.
- Review bundle includes `save-baseline.json` for Grok.

**Requirement:** ARCH-004

---

## ADR-005 — No runtime LLM dependency

**Status:** Accepted (project-wide)

### Decision

Core NPC autonomy, conversation, memory, planning, and social behavior must run **locally without** paid AI APIs, Ollama, or runtime LLM calls.

### Reason

- Product promise: observable, reproducible simulation on an M2 Mac offline.
- LLMs are non-deterministic, costly, and violate local-knowledge rules if used as hidden oracles.
- Conversations are **semantic intents first**, template rendering second (spec §15).

### Alternatives considered

| Alternative | Summary |
|-------------|---------|
| LLM for dialogue only | Richer text |
| Local small model (Ollama) | Offline but heavy |
| Hybrid: LLM for God chat | Player-facing only |

### Why alternatives were rejected

- Dialogue LLM still risks becoming decision authority via prompt leakage.
- Ollama excluded by constitution rule 3.
- God chat LLM is out of V1 scope and would confuse causality tooling.

### Consequences

- Intent library + templates must grow over milestones.
- Network-off tests are mandatory in review.
- No OpenAI/Anthropic SDKs in dependencies.

**Requirement:** ARCH-001, NPC-CONV-002 (future)

---

## ADR-006 — Static world geometry is authored content, not simulation state

**Status:** Accepted (M01)

### Decision

The canonical town layout (`src/world/townLayout.ts`) is **immutable authored
data** imported directly by the renderer for geometry. Dynamic per-frame data
(time, lighting inputs, and later NPC transforms) continues to flow only through
the read-only `RenderSnapshot`.

### Reason

- The town shell is fixed content in M01, analogous to a 3D asset or texture.
- Sending a large static layout over `postMessage` every frame would waste
  bandwidth and add no value while it cannot change.
- Dynamic truth still crosses the boundary only as a read-only snapshot, so
  ARCH-002 is preserved.

### Alternatives considered

| Alternative | Summary |
|-------------|---------|
| Store town in `WorldSnapshot` and stream it | Uniform "everything via snapshot" |
| Generate town in the worker from the seed | Procedural, fully in simulation |

### Why alternatives were rejected

- Streaming immutable geometry each frame is pure overhead for M01.
- Procedural town generation is unnecessary scope now; when buildings become
  mutable (construction/decay, M07/M10) their **dynamic** state will move into
  the authoritative snapshot while static base geometry can remain an asset.

### Consequences

- The renderer imports `CANONICAL_TOWN` directly; it must treat it as read-only.
- When buildings gain mutable state, that state (not the base mesh) becomes
  authoritative worker state.
- The deterministic terrain heightfield (`terrainHeightAt`) is authored content
  under this decision too: it is a pure function shared by the layout (to place
  trees/buildings) and the renderer (to displace the ground). It carries no
  simulation authority and is safe to assert in tests.

**Requirement:** WORLD-001 (preserves ARCH-002)

---

## ADR-007 — Worker owns time; main thread owns real-time pacing

**Status:** Accepted (M01)

### Decision

The simulation worker remains the sole owner of the clock (`clock.simMinute`).
Real-time pacing and speed live on the main thread in `SimulationDriver`, which
converts elapsed real time × selected speed into whole simulated minutes and
issues `STEP { count }`. The human calendar is a **pure derivation** of
`simMinute` (`deriveCalendar`), never stored.

### Reason

- Makes ARCH-005 automatic: world state is a function of the **total minutes
  stepped**, independent of speed or how minutes are batched, so 1× and 1000×
  produce identical worlds for the same simulated duration.
- Keeps the worker free of any real-time/`requestAnimationFrame` concept.
- Deriving the calendar prevents clock/counter drift and avoids enlarging the
  save schema or determinism digest.

### Alternatives considered

| Alternative | Summary |
|-------------|---------|
| Worker tracks real time + speed | Worker imports timing |
| Store the full calendar in the snapshot | No re-derivation |
| Advance fractional minutes | Sub-minute stepping |

### Why alternatives were rejected

- A real-time-aware worker couples determinism to wall-clock behaviour and
  complicates headless/deterministic tests.
- A stored calendar can drift from `simMinute` and bloats saves/digests.
- Fractional-minute stepping breaks the clean "state = f(total minutes)" model
  that guarantees speed independence.

### Consequences

- Pause is simply "advance zero minutes"; the camera/UI loop keeps running.
- A safety clamp bounds real-time catch-up after stalls (approximate real-time
  tracking, always-correct simulated state).
- The save `SCHEMA_VERSION` is unchanged (`m00.1`) because time added no
  persisted fields.

**Requirement:** SIM-TIME-001/002/003/004, ARCH-005

---

## ADR-008 — M02 citizen autonomy boundary (utility, pathing, render)

**Status:** Accepted (M02)

### Decision

Citizen simulation (needs, utility scoring, pathing, action progression) runs entirely in the worker via `citizenStep` / `utility.ts`. The renderer receives a thin `RenderCitizen` projection. Citizen selection flows through `SELECT_CITIZEN` worker command; the inspector reads `inspectorTrace` from the render snapshot.

### Reason

- Preserves ARCH-002: UI and renderer cannot mutate citizen truth.
- Utility traces are simulation artifacts stored on `CitizenState.lastUtilityTrace`, not computed in React.
- Pathfinding uses authored waypoint graph (`navigation.ts`) separate from visual mesh.
- Presentation animation (walk bob, limb swing) uses `performance.now()` and is explicitly non-authoritative.

### Alternatives considered

| Alternative | Summary |
|-------------|---------|
| Main-thread citizen AI | Simpler debugging |
| Renderer-driven movement | Lerp citizen mesh to target |
| Script daily schedule table | Fixed teleport timetable |

### Why alternatives were rejected

- Main-thread AI would break worker authority and high-speed determinism.
- Renderer-driven movement would decouple displayed position from simulation position.
- Scripted schedules bypass Layer-2 utility and violate NPC-DEC-001 traceability.

### Consequences

- `RenderSnapshot` grows with citizen fields but remains a read-only projection.
- `CITIZEN_ACTION_SELECTED` domain events log action changes for UAT/review.
- Work schedule pressure is utility-driven (goal + quota factors), not hard-coded teleport.
- Schema `m02.1` adds optional `citizens[]` to save bundles.

**Requirement:** NPC-NEED-001, NPC-DEC-001, PATH-001, VIS-001, VIS-004, ARCH-002

---

## ADR template (for future entries)

```markdown
## ADR-NNN — Title

**Status:** Proposed | Accepted | Superseded

### Decision
### Reason
### Alternatives considered
### Why alternatives were rejected
### Consequences
```
