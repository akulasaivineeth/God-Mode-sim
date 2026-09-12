# M01 Data Flow

How data moves through the **current M01 build**. For living architecture across
milestones, see `Docs/architecture/DATA_FLOW.md`.

---

## 1. Real time → simulated minutes → worker

```text
requestAnimationFrame tick (main thread)
    │  elapsed real ms, current speed
    ▼
accumulateSimMinutes(pacingState, elapsedMs, speed)   [pure]
    │  whole sim-minutes (0 while paused)
    ▼
SimulationDriver → SimulationClient.step(count)
    │  postMessage STEP { count }
    ▼
simulation.worker.ts  → advances clock/state by `count` deterministic minutes
    │
    ▼
STEP_COMPLETE { renderSnapshot, stepMs }
```

**Plain English:** The speed only decides how many simulated minutes should pass
per real second. The worker advances exactly that many one-minute steps. Because
state depends only on the total minutes stepped, 1× and 1000× reach the same
world for the same simulated duration (ARCH-005).

**Speeds:** Pause (0), 0.25×, 1×, 5×, 20×, 100×, 1000×. Mapping: 1 real second =
1 sim minute at 1×.

---

## 2. Clock → calendar → render snapshot

```text
clock.simMinute (authoritative integer)
    │
    │  toRenderSnapshot(snapshot)
    ▼
deriveCalendar(simMinute)   [pure]
    │
    ▼
RenderSnapshot {
   simMinute, visualPhase,
   calendar { year, monthName, dayOfMonth, weekday, season, clockLabel, ... },
   timeOfDay (0..1), isDaytime
}
```

**Plain English:** The calendar shown in the HUD and used for lighting is always
computed from the one authoritative counter, so the displayed date/time can
never disagree with simulation truth. The calendar is never stored.

---

## 3. Render snapshot → 3D scene (display only)

```text
RenderSnapshot.timeOfDay ──► DayNightLighting (sun position, sky colour, intensity)
RenderSnapshot.calendar  ──► DiagnosticsHud (date/clock/season)
RenderSnapshot.visualPhase ─► SimBeacon (eases at low speed, snaps if suppressed)
CANONICAL_TOWN (authored) ─► Town geometry (buildings, roads, park, river, trees)
```

The renderer reads only these values and the immutable town asset. It never
writes back to simulation state (ARCH-002).

---

## 4. Speed / pause status → UI store

```text
SimulationDriver.setSpeed(speed)
    │  onSpeedChange({ speed, paused, animationsSuppressed })
    ▼
diagnosticsStore.setSpeedStatus(...)
    ├──► TimeControls (highlights active speed)
    ├──► DiagnosticsHud (shows speed / "Paused" / suppression)
    └──► Scene (SimBeacon snaps when suppressed)
```

---

## 5. Camera (independent of simulation)

```text
Camera preset button (App) ──► cameraView + cameraNonce ──► CameraControls
OrbitControls (drag/pan/scroll) ──► camera transform only
```

**Plain English:** Moving or reframing the camera never touches simulation state
and keeps working while paused (UAT-TIME-001 / spec §4.2).

---

## 6. Message protocol (unchanged from M00)

M01 reuses the M00 worker messages (`INIT`, `STEP`, `GET_SNAPSHOT`,
`GET_DIGEST`, `LOAD_SNAPSHOT` / `READY`, `STEP_COMPLETE`, `SNAPSHOT`, `DIGEST`,
`ERROR`). The only change is that `STEP { count }` is now driven by real-time
pacing instead of a fixed 500 ms interval. No new message types were required.

---

## 7. What still never crosses the boundary

- The renderer never sends data back into the worker.
- Full `WorldSnapshot`, PRNG internals, and complete event payloads stay in the
  worker unless explicitly exported (`GET_SNAPSHOT` / save).
- Speed/pause are UI-driver concerns; the worker has no concept of real time.
