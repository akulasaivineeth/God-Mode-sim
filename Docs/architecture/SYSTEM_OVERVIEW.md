# System Overview

**Living document** — update when architecture changes.

---

## Plain-English summary

GOD MODE is a local web application with one golden rule: **the simulation owns truth; everything else displays or stores it.**

When you run the app today (M02):

1. A **background worker** runs the deterministic simulation and owns the **clock** and the **citizen** (needs, position, decisions).
2. A main-thread **driver** paces real time into simulated minutes based on the selected **speed** (Pause … 1000×) and asks the worker to advance.
3. The worker sends a **render snapshot** (calendar, time-of-day, and a compact citizen summary) to the main thread — only what the 3D view needs.
4. **React** + **Three.js** draw the **handcrafted 3D town** with **day/night lighting**, a **free camera**, and one **autonomous 3D citizen**.
5. Panels show the date/clock/season/speed, renderer stats, a **digest**, and a **Citizen Inspector** with the utility-score breakdown behind each decision.
6. **Save schemas** describe how to export and restore state as JSON, validated by **Zod**.

No cloud server. No runtime AI. One citizen (M02); a full population is M03. The M00 toy counter still exists underneath so its golden determinism digest stays locked.

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
| `src/simulation/core/` | PRNG, events, toy logic, clock, calendar, speed | **Authoritative** |
| `src/simulation/messages.ts` | Worker ↔ main protocol types | Contract |
| `src/simulation/SimulationClient.ts` | Main-thread worker API | Bridge |
| `src/simulation/SimulationDriver.ts` | Real-time pacing → STEP{count} | Pacing (main) |
| `src/simulation/model/` | Citizen: needs, locations, pathfinding, decisions, step, world | **Authoritative** |
| `src/world/townLayout.ts` | Immutable authored town geometry | Authored asset |
| `src/rendering/` | 3D town, day/night, camera, citizen from `RenderSnapshot` | Display only |
| `src/ui/` | Diagnostics HUD, time controls, citizen inspector, Zustand store | UI only |
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
| ARCH-005 | High-speed runs equal slow runs: state = f(total simulated minutes) |

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
| M01 | `simMinute` authoritative; calendar **derived** (`deriveCalendar`); real-time pacing on main thread; speeds Pause–1000×; day/night from clock |
| M02 | One citizen steps per sim-minute against the clock: needs decay, utility decisions, deterministic waypoint travel; state = f(total minutes) |
| M03+ | Twenty citizens, perception, memory, social systems |

**M01 time rule:** the worker owns `simMinute`; the main-thread `SimulationDriver`
decides how many minutes to advance per real second from the selected speed. The
calendar (hours/days/months/seasons/day-night) is a pure function of `simMinute`,
so it never drifts and never enters the save digest.

---

## Persistence (M00 scope)

- **Implemented:** Zod schemas, `buildSaveBundle`, JSON round-trip, restore into worker via `LOAD_SNAPSHOT`
- **Not implemented:** IndexedDB UI, autosave, branch UI, event replay engine

Scaffolded types for branches (`EXP-001`) and history/causal traces (`HIST-001`, `HIST-002`) exist as schemas only.

---

## Performance target

Apple M2 MacBook Pro, 8 GB unified memory. M01 renders a low-poly town with shared materials; instrumentation (FPS, worker step ms) is shown live in the HUD. At high speed the driver batches many minutes per frame and animation is suppressed to protect responsiveness while simulated time stays exact.

---

## Related documents

- `DATA_FLOW.md` — message and data paths with diagrams
- `ARCHITECTURE_DECISIONS.md` — ADR log (ADR-006 authored geometry, ADR-007 time/pacing, ADR-008 citizen model)
- `Docs/milestones/M00/` — foundation milestone detail
- `Docs/milestones/M01/` — 3D world and time milestone detail
- `Docs/milestones/M02/` — one autonomous citizen milestone detail
- `Docs/specs/GOD_MODE_Canonical_Build_Specification.md` — full product spec
