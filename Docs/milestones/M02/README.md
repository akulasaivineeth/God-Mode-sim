# Milestone M02 — One Autonomous Citizen

**Status:** Implementation complete · awaiting independent Grok review
**Branch:** `milestone/m02-one-citizen`
**Builds on:** M00 (deterministic foundation) + M01 (3D world and time), both merged to `main`

---

## What M02 is (plain English)

M01 built the town and the clock. **M02 puts the first person in it.** A single
stylized 3D citizen ("Noah") now lives in the town on their own:

- They have five physical **needs** — energy, fullness (hunger), hydration
  (thirst), bladder, and hygiene — that slowly drain over time.
- They **decide** what to do by scoring their options (sleep, eat, drink, use the
  bathroom, shower, work, relax) and picking the best one. Urgent needs trigger a
  fast **reflex**; everything else is a considered **routine** choice.
- They **walk** between home, the store, and the workshop along the town's paths.
- You can **inspect** them: click the citizen (or use the panel) to see their
  needs and the exact score breakdown behind their last decision.

Nobody drives Noah — they run their own life for days on end. There is still only
**one** citizen; a full population arrives in M03.

---

## What you can see when you run M02

- The 3D town from M01, now with a small 3D person walking around it.
- A **Citizen Inspector** (top-left) showing needs bars, the current activity
  ("Walking to the Store", "Sleeping", "Working", …), and a table of candidate
  actions with utility scores + the selected action's factor breakdown.
- Speed controls still work: at 1000× you can watch Noah live several days in
  seconds; the day/night sky moves with them.

---

## The M02 gate (must pass review)

> The citizen can autonomously complete several simulated days without player commands.

Proven by `tests/integration/m02/autonomy.test.ts`: over 3 simulated days with no
input, every need stays above zero (the reflex keeps Noah alive), every action
type is used, and Noah is never stuck. Determinism/high-speed independence is
proven by `tests/integration/m02/determinism.test.ts`.

---

## Acceptance targets

| ID | Summary |
|----|---------|
| NPC-ID-001 | One persistent citizen with stable identity + continuous state |
| NPC-NEED-001 | Five physical needs decay and are autonomously satisfied |
| NPC-DEC-001 | Decisions expose a traceable utility score breakdown |
| NPC-DEC-010 | Three-layer decision: Layer-1 reflex + Layer-2 routine |
| NPC-MOVE-001 | Deterministic waypoint travel with durations (no dependence on rendered footsteps) |
| VIS-001 | Citizen is an actual stylized 3D figure (not a sprite) |
| UX-001 | Deep inspector with candidate/selected score breakdown, live |
| M02-GATE | Autonomous multi-day life, deterministic |

**Preserved from M00/M01 (must not regress):** ARCH-001..005, M00-GATE (golden
digest `fac095d1`), M01-GATE, all WORLD-001 / SIM-TIME / VIS-002 work.

---

## What is NOT in M02 (deliberate)

- No second citizen / 20-person generation, and no relationships, memory,
  beliefs, perception, or conversation (M03+).
- No economy, money, or store inventory (eating at the store is a placeholder; M04).
- No building interiors / roof-fade (M02+).
- No weather, God tools, save UI, or timeline branches yet.

See `KNOWN_LIMITATIONS.md`.

---

## Related documents in this folder

| File | Contents |
|------|----------|
| `PLAN.md` | The M02 implementation plan derived from the spec |
| `BUILD_NOTES.md` | What was built, module by module |
| `DATA_FLOW.md` | M02-specific data paths (needs, decisions, movement, inspector) |
| `TESTING.md` | Every test explained |
| `KNOWN_LIMITATIONS.md` | Deliberate limits vs future work |
