# M02 Known Limitations

Distinguishes **deliberate scope limits**, **planned future work**, and **known
issues**. M02 delivers one autonomous citizen — not a society.

---

## Deliberate scope limits (by design for M02)

- **One citizen only.** No 20-person generation, and no relationships, memory,
  beliefs, perception, or conversation. Those are M03+. Noah is intentionally alone.
- **No economy.** Eating at the store does not cost money or deplete inventory;
  "eat at the store" is a placeholder for the M04 economy.
- **Exterior buildings only.** No interiors or roof-fade viewing yet.
- **No God tools / saves UI / branches / weather.** Later milestones.

---

## Planned future work this milestone sets up

- The needs → utility → action loop and the decision trace are the foundation for
  20 citizens (M03), social perception, and richer planning.
- The waypoint navigation graph and deterministic travel durations extend to many
  citizens without depending on rendered movement.
- The inspector's candidate/score breakdown is the basis for the fuller God-level
  inspector and causal traces (M12).

---

## Known issues / caveats

- **Interim CC0 character.** The citizen is a vetted CC0 Kenney GLB with real
  animation clips (idle/walk/sit/interact), used as an interim shared rig; a
  bespoke character/rig can come later (spec §4.1). Core autonomy is not blocked
  on final art.
- **Buildings are CC0 kit assets.** Home/store/workshop use Kenney GLB kits;
  background (non-facility) buildings remain lightweight archetype shells trimmed
  to hold the M2/8GB draw-call budget.
- **Session-growing event log.** `CITIZEN_DECISION` events accumulate in memory for
  the session; bounded archival/persistence is M12. For multi-day runs this is
  small, but it is not yet capped.
- **Lightweight navigation.** Movement follows an authored waypoint graph, not full
  navmesh/physics pathing (spec §30.8 explicitly allows this for V1).
- **Large JS bundle warning.** Three.js keeps the main chunk >500 kB (expected for
  a 3D app; code-splitting is a later perf task).

---

## Explicitly NOT regressed

- M00 determinism (golden digest `fac095d1`, schema `m00.1`).
- M01 world/time (town, camera, day/night, all speeds, high-speed equivalence).
- Worker-authoritative simulation + read-only render boundary (ARCH-002).
- Seeded PRNG, no `Math.random` in `src/simulation` (ARCH-003).
- Domain events + versioned save schema (ARCH-004).
