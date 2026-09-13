# System Overview

**Living document** — update when architecture changes.

---

## Plain-English summary

GOD MODE is a local web application with one golden rule: **the simulation owns truth; everything else displays or stores it.**

When you run the app today (M02):

1. A **background worker** runs the deterministic simulation and owns the **clock** and **citizen state**.
2. A main-thread **driver** paces real time into simulated minutes based on the selected **speed** (Pause … 1000×) and asks the worker to advance.
3. The worker sends a **render snapshot** (calendar, time-of-day, citizen positions/actions, inspector trace) to the main thread — only what the 3D view needs.
4. **React** + **Three.js** draw a **handcrafted 3D town** with **one autonomous citizen (Alex)**, **day/night lighting**, and a **free camera**.
5. A diagnostics panel shows the date/clock/season/speed, performance, citizen inspector (need bars + utility breakdown), and a **digest** (fingerprint) of simulation state.
6. **Save schemas** describe how to export and restore state as JSON, validated by **Zod**.

No cloud server. No runtime AI. M02 delivers one worker-authoritative citizen with needs, utility decisions, and waypoint pathing on the M01 town foundation.

---

## Layer diagram

```text
┌─────────────────────────────────────────┐
│  UI (React + Zustand)                    │
│  Diagnostics, CitizenInspector, controls │
│  UI-only state — NOT simulation truth    │
└──────────────────┬──────────────────────┘
                   │ commands (INIT, STEP, SELECT_CITIZEN, …)
┌──────────────────▼──────────────────────┐
│  Main thread bridge                      │
│  SimulationClient → postMessage          │
└──────────────────┬──────────────────────┘
                   │ RenderSnapshot (read-only)
┌──────────────────▼──────────────────────┐
│  Rendering (React Three Fiber + Three.js)│
│  Town, CitizenMesh, M02CorridorPolish    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Simulation Worker (authoritative)       │
│  PRNG, clock, citizens, needs, utility,  │
│  pathing, toy state, domain events       │
└──────────────────┬──────────────────────┘
                   │ on demand
┌──────────────────▼──────────────────────┐
│  Persistence schemas + serialize         │
│  SaveBundle JSON (Zod validated)           │
└─────────────────────────────────────────┘
```

**In one sentence:** Commands go down to the worker; display snapshots come up; saves copy the worker's world on request.

---

## Module map (current codebase)

| Path | Responsibility | Authority |
|------|----------------|-----------|
| `src/simulation/worker/` | Simulation loop, stepping, snapshots, citizen selection | **Authoritative** |
| `src/simulation/core/` | PRNG, events, clock, calendar, speed, toy logic | **Authoritative** |
| `src/simulation/core/citizens/` | Needs decay, utility scoring, pathing, citizen step | **Authoritative** |
| `src/simulation/messages.ts` | Worker ↔ main protocol types (`SELECT_CITIZEN`, etc.) | Contract |
| `src/simulation/SimulationClient.ts` | Main-thread worker API | Bridge |
| `src/simulation/SimulationDriver.ts` | Real-time pacing → STEP{count} | Pacing (main) |
| `src/world/townLayout.ts` | Immutable authored town geometry | Authored asset |
| `src/world/facilityPoints.ts` | Facility entrance/interior anchors | Authored asset |
| `src/world/navigation.ts` | Waypoint graph + A* pathfinding | Authored + algorithm |
| `src/rendering/` | 3D town, citizens, day/night, camera from `RenderSnapshot` | Display only |
| `src/ui/` | Diagnostics HUD, CitizenInspector, time controls, Zustand | UI only |
| `src/persistence/` | Save bundle schemas, serialize/deserialize | Storage format |
| `src/debug/` | Canonical JSON + digest hashing | Test/review tooling |
| `src/shared/` | Version IDs, requirement constants | Metadata |

---

## M02 citizen authority

| Concern | Owner | Notes |
|---------|-------|-------|
| Needs (hunger, thirst, bladder, energy, hygiene) | Worker `citizenStep` | Decay per sim minute; satisfaction on action complete |
| Layer-1 reflex / Layer-2 utility | Worker `utility.ts` | Full contributor trace stored on citizen |
| Travel + indoor actions | Worker `citizenStep` | A* path along authored waypoint graph |
| Citizen selection | Worker via `SELECT_CITIZEN` | UI sends command; worker updates `selectedCitizenId` in render snapshot |
| Inspector trace | `RenderSnapshot.inspectorTrace` | Read-only copy of `lastUtilityTrace` for selected citizen |
| Citizen mesh / animation | `CitizenMesh.tsx` | Presentation only; uses `performance.now()` for walk bob (non-sim) |

---

## Render snapshot citizen fields (M02)

`RenderCitizen` (per citizen in `RenderSnapshot.citizens[]`):

- `id`, `displayName` — identity
- `x`, `z`, `y` — ground position (simulation `position`)
- `action` — current `ActiveAction.kind` (`travel`, `sleep`, `work`, etc.)
- `targetFacilityId`, `currentFacilityId` — facility context
- `appearance` — shirt/pants/skin/hair palette
- `needs` — read-only need bars for inspector
- `selected` — whether this citizen is the inspector target

`RenderSnapshot` also carries `selectedCitizenId` and `inspectorTrace` (utility breakdown for the selected citizen).

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
- **World seed:** string (e.g. `GODMODE_M02_CANONICAL_2026`) hashed to initialize PRNG

Changing the algorithm ID or core stepping logic without a version migration would invalidate existing seeded worlds.

---

## Time

| Milestone | Time model |
|-----------|------------|
| M00 | `simMinute` integer increments 1 per toy step |
| M01 | `simMinute` authoritative; calendar **derived** (`deriveCalendar`); real-time pacing on main thread; speeds Pause–1000×; day/night from clock |
| M02 | NPC action scheduling against the clock; weekday work windows; need decay per minute |

**M01/M02 time rule:** the worker owns `simMinute`; the main-thread `SimulationDriver`
decides how many minutes to advance per real second from the selected speed. The
calendar (hours/days/months/seasons/day-night) is a pure function of `simMinute`,
so it never drifts and never enters the save digest.

---

## Persistence (M02 scope)

- **Implemented:** Zod schemas, `buildSaveBundle`, JSON round-trip, restore into worker via `LOAD_SNAPSHOT`
- **Schema version:** `m02.1` — optional `citizens[]` array with needs, assignments, active action, utility trace
- **Not implemented:** IndexedDB UI, autosave, branch UI, event replay engine

Scaffolded types for branches (`EXP-001`) and history/causal traces (`HIST-001`, `HIST-002`) exist as schemas only.

---

## Performance target

Apple M2 MacBook Pro, 8 GB unified memory. M02 renders the M01 town plus one procedural citizen with shared materials; instrumentation (FPS, draw calls, triangles, worker step ms) is shown live in the HUD. At high speed the driver batches many minutes per frame and animation is suppressed to protect responsiveness while simulated time stays exact.

---

## Related documents

- `DATA_FLOW.md` — message and data paths with diagrams
- `ARCHITECTURE_DECISIONS.md` — ADR log (ADR-006 authored geometry, ADR-007 time/pacing, ADR-008 citizen autonomy)
- `Docs/milestones/M00/` — foundation milestone detail
- `Docs/milestones/M01/` — 3D world and time milestone detail
- `Docs/milestones/M02/` — one autonomous citizen milestone detail
- `Docs/specs/GOD_MODE_Canonical_Build_Specification.md` — full product spec
