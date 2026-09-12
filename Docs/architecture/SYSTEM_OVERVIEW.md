# System Overview

**Living document** — update when architecture changes.

---

## Plain-English summary

GOD MODE is a local web application with one golden rule: **the simulation owns truth; everything else displays or stores it.**

When you run the app today (M00):

1. A **background worker** runs a tiny deterministic simulation (toy counters, not people).
2. The worker sends a **render snapshot** to the main thread — only what the 3D view needs.
3. **React** draws the page; **Three.js** draws the placeholder 3D scene.
4. A diagnostics panel shows performance and a **digest** (fingerprint) of simulation state.
5. **Save schemas** describe how to export and restore state as JSON, validated by **Zod**.

No cloud server. No runtime AI. No gameplay systems yet — only the foundation future milestones plug into.

---

## Layer diagram

```text
┌─────────────────────────────────────────┐
│  UI (React + Zustand)                    │
│  Diagnostics, future God panels          │
│  UI-only state — NOT simulation truth    │
└──────────────────┬──────────────────────┘
                   │ commands (INIT, STEP, …)
┌──────────────────▼──────────────────────┐
│  Main thread bridge                      │
│  SimulationClient → postMessage          │
└──────────────────┬──────────────────────┘
                   │ RenderSnapshot (read-only)
┌──────────────────▼──────────────────────┐
│  Rendering (React Three Fiber + Three.js)│
│  Placeholder 3D scene                    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Simulation Worker (authoritative)       │
│  PRNG, clock, toy state, domain events   │
└──────────────────┬──────────────────────┘
                   │ on demand
┌──────────────────▼──────────────────────┐
│  Persistence schemas + serialize         │
│  SaveBundle JSON (Zod validated)           │
└─────────────────────────────────────────┘
```

**In one sentence:** Commands go down to the worker; display snapshots come up; saves copy the worker’s world on request.

---

## Module map (current codebase)

| Path | Responsibility | Authority |
|------|----------------|-----------|
| `src/simulation/worker/` | Simulation loop, stepping, snapshots | **Authoritative** |
| `src/simulation/core/` | PRNG, events, toy logic, clock types | **Authoritative** |
| `src/simulation/messages.ts` | Worker ↔ main protocol types | Contract |
| `src/simulation/SimulationClient.ts` | Main-thread worker API | Bridge |
| `src/rendering/` | 3D scene from `RenderSnapshot` | Display only |
| `src/ui/` | Diagnostics HUD, Zustand store | UI only |
| `src/persistence/` | Save bundle schemas, serialize/deserialize | Storage format |
| `src/debug/` | Canonical JSON + digest hashing | Test/review tooling |
| `src/shared/` | Version IDs, requirement constants | Metadata |

---

## Technical boundaries (invariants)

These must hold in every milestone:

| ID | Invariant |
|----|-----------|
| ARCH-001 | No paid runtime AI / LLM required |
| ARCH-002 | Simulation state lives in worker domain, not React |
| ARCH-003 | All simulation randomness via seeded `mulberry32-v1` PRNG |
| ARCH-004 | Domain events + versioned snapshots support future replay |

**Anti-patterns (never allowed):**

- `Math.random()` in simulation code
- React components mutating citizen/world state directly
- Renderer receiving full belief/memory graphs every frame
- Global shortcuts like `if famine then crime += 20%`

---

## Randomness

- **Algorithm:** `mulberry32-v1` (fixed ID in saves)
- **State:** `{ algorithm: 'mulberry32-v1', state: uint32 }`
- **World seed:** string (e.g. `GODMODE_M00_CANONICAL_2026`) hashed to initialize PRNG

Changing the algorithm ID or core stepping logic without a version migration would invalidate existing seeded worlds.

---

## Time (M00 vs future)

| Milestone | Time model |
|-----------|------------|
| M00 | `simMinute` integer increments 1 per toy step |
| M01+ | Calendar, day/night, speed multipliers per spec |

---

## Persistence (M00 scope)

- **Implemented:** Zod schemas, `buildSaveBundle`, JSON round-trip, restore into worker via `LOAD_SNAPSHOT`
- **Not implemented:** IndexedDB UI, autosave, branch UI, event replay engine

Scaffolded types for branches (`EXP-001`) and history/causal traces (`HIST-001`, `HIST-002`) exist as schemas only.

---

## Performance target

Apple M2 MacBook Pro, 8 GB unified memory. M00 is lightweight; instrumentation (FPS, worker step ms) exists early so later milestones can detect regressions.

---

## Related documents

- `DATA_FLOW.md` — message and data paths with diagrams
- `ARCHITECTURE_DECISIONS.md` — ADR log
- `Docs/milestones/M00/` — milestone-specific detail
- `Docs/specs/GOD_MODE_Canonical_Build_Specification.md` — full product spec
