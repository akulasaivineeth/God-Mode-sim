# Milestone M01 — 3D World and Time

**Status:** Implementation complete · awaiting independent Grok review
**Branch:** `milestone/m01-world-and-time`
**Builds on:** M00 (deterministic foundation, merged to `main`)

---

## What M01 is (plain English)

M00 proved the foundation worked (a hidden deterministic engine, a placeholder cube, saves). **M01 builds the stage the citizens will later live on:**

1. A small **handcrafted 3D town** — houses, a store, clinic, school, cafe, workshop, warehouse, farm, a park, a town square, a community hall, a utility station, a cemetery, vacant plots, roads with **sidewalks**, **pedestrian paths**, trees, a distinct **nearby forest**, **gently rolling hills** (modest terrain elevation), and a river.
2. A **free camera** you can rotate, pan, and zoom, plus one-click preset views (Overview / Angled / Street).
3. A **simulation clock** with a real calendar — minutes, hours, days, weeks, months, years, and seasons.
4. **Day/night** lighting that follows the clock (the sun rises and sets; the sky changes colour).
5. **All speed controls** — Pause, 0.25×, 1×, 5×, 20×, 100×, 1000×.

There are still **no people** — that begins in M02. M01 is the world and its clock.

---

## What you can see when you run M01

- A low-poly town seen from an angled camera.
- A diagnostics panel (top-right) showing the date, clock, season, day/night, speed, live renderer stats (draw calls · triangles), and the deterministic digest.
- Speed buttons (bottom) and camera buttons (top-left).
- Selecting a faster speed makes the clock race and the sun move across the sky; **Pause** freezes simulated time while you can still move the camera.

At **1000×** the little floating marker over the square stops animating smoothly and snaps — that is deliberate **animation suppression** — while the clock and lighting still show the exact simulated time.

---

## The M01 gate (must pass review)

> **1000× may skip animation but time and state remain correct.**

This is guaranteed by design: the world's state depends only on the **total number of simulated minutes** that have elapsed, never on the speed or how those minutes were batched. See `Docs/milestones/M01/TESTING.md` (ARCH-005 / M01-GATE).

---

## Acceptance targets

| ID | Summary |
|----|---------|
| SIM-TIME-001 | Authoritative clock + derived calendar (minute→hour→day→week→month→year→season) |
| SIM-TIME-002 | All speeds: Pause, 0.25×, 1×, 5×, 20×, 100×, 1000× |
| SIM-TIME-003 | Pause freezes simulation; camera/UI stay usable |
| SIM-TIME-004 | Day/night cycle derived from the clock |
| VIS-002 | Free camera (rotate/pan/zoom) + presets |
| WORLD-001 | Small handcrafted 3D town shell (buildings, roads, sidewalks, pedestrian paths, park, square, community hall, cemetery, plots, trees, nearby forest, modest terrain hills, river) |
| ARCH-005 | High-speed independence: same seed + same duration → same world at any speed |
| M01-GATE | 1000× skips animation but time/state stay correct |

**Preserved from M00 (must not regress):** ARCH-001, ARCH-002, ARCH-003, ARCH-004, M00-GATE (golden digest `fac095d1`).

---

## What is NOT in M01 (deliberate)

- No citizens/NPCs, needs, movement, or conversations (M02+).
- No building interiors or roof-fade viewing (M02).
- Sidewalks and pedestrian paths are **visual routes only** — actual walkable pathfinding arrives with citizens (M02).
- Terrain elevation is a **modest visual heightfield** (no physics, no collision, no terrain-driven simulation).
- The **Community Hall is a gathering place only** — there is no government, mayor, council, or bureaucracy on Day 1 (those must emerge later per spec §22).
- Seasons are shown but do not yet cause weather/environmental effects (M10).
- No economy, God tools, saves UI, or timeline branches yet.

See `KNOWN_LIMITATIONS.md`.

---

## Related documents in this folder

| File | Contents |
|------|----------|
| `PLAN.md` | The M01 implementation plan derived from the spec |
| `BUILD_NOTES.md` | What was built, module by module |
| `DATA_FLOW.md` | M01-specific data paths (time, town, camera) |
| `TESTING.md` | Every test explained |
| `KNOWN_LIMITATIONS.md` | Deliberate limits vs future work |
