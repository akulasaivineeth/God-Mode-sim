# M01 Known Limitations

Distinguishes **deliberate scope limits**, **planned future work**, and any
**known issues**. M01 delivers the world and its clock — not gameplay.

---

## Deliberate scope limits (by design for M01)

- **No citizens/NPCs.** No people, needs, movement, decisions, or conversations.
  These begin in M02. The town is intentionally empty.
- **Exterior building shells only.** Buildings have no functional interiors and
  no roof/wall fade-away viewing (VIS-003). Interiors arrive with the first
  citizen in M02.
- **Seasons are labels, not effects.** The clock reports the season, but weather,
  temperature, and environmental consequences are M10.
- **No economy, God tools, save/branch UI, or experiments.** M04+/M11.

---

## Planned future work this milestone sets up

- The authoritative `simMinute` clock and speed pacing are ready for autonomous
  citizens to schedule actions against (M02).
- The town layout provides `home`, `store`, and `workplace` anchor buildings the
  first citizen will use (M02).
- Day/night and the calendar provide the schedule backbone for work/sleep
  routines (M02+).
- Animation suppression at high speed is in place so later NPC movement can
  collapse into deterministic travel durations (spec §5.2).

---

## Known issues / caveats

- **Large JS bundle warning.** Vite warns the main chunk exceeds 500 kB
  (Three.js). This is expected for a 3D app and does not affect correctness;
  code-splitting is a later performance task.
- **Delta clamp under long stalls.** If the tab is backgrounded, real-time
  catch-up is clamped to one second per frame, so after a long stall simulated
  time briefly runs behind wall-clock. Simulated *state* is always correct for
  the minutes actually stepped; only real-time tracking is approximate.
- **Persistence UI not built.** Save bundles round-trip in code/tests only;
  there is no in-app save/load button yet (Dexie/IndexedDB is M-later).

---

## Explicitly NOT regressed

- M00 determinism (golden digest `fac095d1`, schema `m00.1`).
- Worker-authoritative simulation and read-only render boundary (ARCH-002).
- Seeded PRNG with no `Math.random` in simulation code (ARCH-003).
- Domain events + versioned save schema (ARCH-004).
