# M00 Data Flow

How data moves through the **current M00 build** specifically. For living architecture across milestones, see `Docs/architecture/DATA_FLOW.md`.

---

## Startup sequence

```text
1. Browser loads React app
2. App creates SimulationClient
3. Client posts INIT { seed: 'GODMODE_M00_CANONICAL_2026' }
4. Worker creates WorldSnapshot (simMinute=0, init event, PRNG from seed)
5. Worker posts READY
6. App requests GET_DIGEST → HUD shows fingerprint
7. Interval every 500ms posts STEP { count: 1 }
```

**Plain English:** On load, the worker creates a fresh deterministic world from the canonical seed, then steps automatically so you can watch the digest change predictably.

---

## One STEP in detail

```text
Worker receives STEP
    │
    ├─ Restore Mulberry32Prng from snapshot.prng
    ├─ weightedChoice(['alpha','beta','gamma'])
    ├─ int(1..5) → increment accumulator
    ├─ nextFloat() → visualPhase (0..1)
    ├─ simMinute += 1
    ├─ append TOY_STEP domain event
    ├─ save PRNG state back into snapshot
    │
    └─ post STEP_COMPLETE {
         renderSnapshot: { simMinute, visualPhase, tickCount, lastChoice, accumulator },
         stepMs: <diagnostic only>
       }
```

**Plain English:** Each step uses the PRNG to make reproducible “random” choices, updates counters, logs one event, and sends the display layer a small summary.

---

## What the 3D scene uses

| Field | Used for |
|-------|----------|
| `visualPhase` | Cube rotation speed and bob height |
| Other fields | Shown in diagnostics HUD only in M00 |

The renderer **does not** send data back to the worker.

---

## Save and restore (M00)

**Export path (tests / review bundle):**

```text
runToySteps(snapshot, N)
    → buildSaveBundle({ snapshot })
    → JSON file
```

**Restore path (determinism test):**

```text
parseSaveBundle(json).snapshot
    → runToySteps(restored, remainingSteps)
    → digest must match uninterrupted run
```

**Worker restore path:**

```text
LOAD_SNAPSHOT { snapshot }
    → worker replaces internal snapshot
    → STEP_COMPLETE with updated RenderSnapshot
```

**Plain English:** Saving freezes the worker’s world into a file. Loading puts that world back into the worker. M00 restores full snapshots — it does not replay events from an empty checkpoint.

---

## Digest computation (M00)

Included in digest payload:

- `schemaVersion`, `worldSeed`, `branchId`
- `clock` (simMinute)
- `prng` (algorithm + state)
- `toy` (all counter fields)
- `eventIds` (ordered list of event id strings)

Excluded: full event payloads (ids suffice for M00 gate).

**Canonical result:** 100 steps, seed `GODMODE_M00_CANONICAL_2026` → **`fac095d1`**

---

## Message types (M00 only)

See `src/simulation/messages.ts`. No God commands, no citizen edits, no branch fork messages yet.

---

## Data that never crosses boundaries

| Data | Stays in worker |
|------|-----------------|
| Full `WorldSnapshot` | Unless GET_SNAPSHOT / save export |
| PRNG internal draw sequence | Always |
| Complete `events[]` payloads | Unless snapshot export |
| Future NPC beliefs/memories | N/A in M00 |

| Data | Never in worker from renderer |
|------|-------------------------------|
| React component state | — |
| Zustand diagnostics | — |
| Three.js mesh transforms as truth | Display only |
