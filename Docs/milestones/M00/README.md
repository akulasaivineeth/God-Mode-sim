# Milestone M00 — Repository and Deterministic Foundation

**Status:** Implementation complete · awaiting independent Grok review  
**Branch:** `milestone/m00-foundation`

---

## What M00 is (plain English)

M00 is the **foundation milestone**. It does not deliver a playable town or citizens. It delivers proof that the project can:

1. Run locally in a browser with no AI services.
2. Keep simulation truth in a **background worker** so the 3D view cannot corrupt the world.
3. Produce the **same outcome every time** given the same starting seed.
4. Save and restore state using a **versioned file format**.
5. Run automated tests and export a **review bundle** for independent QA.

Think of M00 as pouring the concrete slab before building walls. The “toy simulation” is a few counters that step forward — enough to prove determinism, not enough to be a game.

---

## What you can see when you run M00

- A placeholder 3D scene (ground + rotating cube)
- A diagnostics panel: FPS, worker step time, seed, digest, tick count
- Automatic stepping every 500 ms

---

## Acceptance targets (must pass review)

| ID | Summary |
|----|---------|
| ARCH-001 | Local only, no runtime LLM |
| ARCH-002 | Worker owns simulation; UI/render read-only |
| ARCH-003 | Seeded `mulberry32-v1` PRNG; no `Math.random()` in simulation |
| ARCH-004 | Domain events + save schemas + round-trip restore |
| M00-GATE | Same seed → same digest across runs and reloads |

**Canonical check:** seed `GODMODE_M00_CANONICAL_2026`, 100 steps → digest **`fac095d1`**

---

## Scaffolded only (not accepted in M00)

| ID | What exists | What does not exist |
|----|-------------|---------------------|
| EXP-001 | Branch metadata schema | Branch creation UI or execution |
| HIST-001 | Cultural history type stub | True vs cultural history systems |
| HIST-002 | Causal trace type stub | NPC decision traces |

---

## Related documents in this folder

| File | Contents |
|------|----------|
| `BUILD_NOTES.md` | What was built, step by step |
| `DATA_FLOW.md` | M00-specific data paths |
| `TESTING.md` | Every test explained |
| `KNOWN_LIMITATIONS.md` | Deliberate limits vs future work vs issues |

---

## What comes next (M01 — not started)

- Handcrafted 3D town shell
- Free camera
- Day/night lighting
- Simulation clock and speed controls (pause, 0.25×–1000×)
- Proof that high speed can skip animation without changing outcomes

Do not expect M01 features in the M00 build.
