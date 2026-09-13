# M02 Data Flow

How data moves through the **current M02 build**. For living architecture across
milestones, see `Docs/architecture/DATA_FLOW.md`.

---

## 1. One simulated minute (worker, authoritative)

```text
stepCitizenWorld(snapshot)
    │  restore Mulberry32Prng from snapshot.prng
    │  nextMinute = clock.simMinute + 1 ; hour = deriveCalendar(nextMinute)
    ▼
stepCitizenMinute(citizen, nextMinute, hour, prng)
    ├─ stepNeeds()                     # decay + (if performing) action effects
    ├─ reflex interrupt                # drop non-critical action for a critical need
    ├─ progress action
    │    ├─ travel: walk along path (WALK_SPEED/min); on arrival → perform
    │    └─ perform: if simMinute ≥ performUntil → action complete (idle)
    └─ decide when idle → decideAction() → beginAction() + store DecisionTrace
    ▼
advanceClock(+1) ; snapshot PRNG ; append CITIZEN_DECISION events on fresh decisions
```

**Plain English:** the worker is the only place the citizen actually changes. Each
minute their needs drop, they make progress on what they're doing, and when free
they choose the next action. All "random" choices use the seeded PRNG, so the same
minutes always produce the same life (ARCH-003/005).

---

## 2. Decision → action (Layer-1 reflex + Layer-2 routine)

```text
decideAction(citizen, hour, prng)
    ├─ score need actions: pressure×weight + time-of-day + travel cost + noise
    ├─ score work: work-hours suitability × diligence − travel + noise
    ├─ score idle: small fallback
    ├─ Layer-1 reflex: +1000 to any action serving a critical need (value ≤ 15)
    └─ pick highest → { selected, trace(candidates + factors + layer) }
        │
        ▼
beginAction(): idle/at-location → perform in place ; else → travel(path=pathWaypoints)
```

The full trace (every candidate's score and factor breakdown) is stored on the
citizen and surfaced to the inspector — this is the causal evidence for NPC-DEC-001.

---

## 3. Movement (deterministic, animation-independent)

```text
pathWaypoints(atNode → targetNode)   # Dijkstra over the road waypoint graph
    ▼
each minute: walk up to WALK_SPEED units along the remaining waypoints
    ▼
arrival: position = target point ; atNode = target ; phase = perform
```

Travel takes a deterministic number of minutes = distance ÷ walk speed. At high
speed the worker simply steps more minutes per frame; nothing depends on a
rendered footstep (spec §5.2 / §30.8).

---

## 4. Worker → renderer (read-only)

```text
WorldSnapshot (worker) ── toRenderSnapshot() ──► RenderSnapshot {
   calendar, timeOfDay, …,
   citizen: { position, facing, action, phase, activity, needs, lastDecision }
}
      │ postMessage STEP_COMPLETE
      ▼
diagnosticsStore ──► Citizen (3D figure, interpolates)  +  CitizenInspector (needs, scores)
```

**Plain English:** the renderer receives a small summary of the citizen (where
they are, what they're doing, their needs, and their last decision) and draws it.
It never writes back into the simulation (ARCH-002). The 3D figure interpolates
between positions at normal speed and snaps at high speed.

---

## 5. What does NOT cross the boundary

- The renderer never moves or edits the citizen; it only displays the snapshot.
- Full internal state (complete event log, PRNG internals) stays in the worker
  unless explicitly exported (save / `GET_SNAPSHOT`).
- Speed/pause remain a main-thread pacing concern; the worker only knows minutes.

---

## 6. Message protocol

Unchanged from M00/M01 (`INIT`, `STEP`, `GET_SNAPSHOT`, `GET_DIGEST`,
`LOAD_SNAPSHOT` / `READY`, `STEP_COMPLETE`, `SNAPSHOT`, `DIGEST`, `ERROR`).
`INIT` now builds the citizen world and `GET_DIGEST` returns the citizen digest.
