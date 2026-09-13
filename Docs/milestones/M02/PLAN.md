# Milestone M02 — One Autonomous Citizen — Implementation Plan

**Source of truth:** `Docs/specs/GOD_MODE_Canonical_Build_Specification.md` (§7 needs, §14 decision architecture, §28 inspector, §30.6 scheduling, §30.8 pathfinding, §30.9 character rendering, §37 M02)
**Validation:** `Docs/qa/GOD_MODE_Independent_Validation_UAT.md` (§8 NPC UAT, §17 M02 gate)
**Visual direction (inspiration only):** `visual-reference/town-style-v1` → `Docs/art-direction/*`

Converts **only M02** into an implementation task list with stable requirement IDs. Does not implement M03+ (no 20-citizen generation, memories/beliefs/social perception, economy, government, etc.).

---

## 1. Canonical M02 deliverables (spec §37)

> **M02 — One autonomous citizen.** Deliver: one 3D NPC; home, store, workplace; hunger, thirst, bladder, energy, hygiene; movement/pathing; Layer-1 and Layer-2 utility actions; deep inspector with score breakdown.
> **Gate:** citizen can autonomously complete several simulated days without player commands.

M02 UAT gate (§17): autonomous-day, needs, utility score inspection, no-player-command. Relevant: UAT-NPC-001 (autonomous day), UAT-NPC-002 (competing need vs goal), VIS-001 (3D citizen), UX-001 (inspector), NPC-DEC-001 (score breakdown).

---

## 2. Requirement IDs

| ID | Requirement | Status target |
|----|-------------|---------------|
| NPC-ID-001 | One persistent citizen with stable identity + continuous state | Implemented + tested |
| NPC-NEED-001 | Physical needs (hunger, thirst, bladder, energy, hygiene) that decay and are autonomously satisfied | Implemented + tested |
| NPC-DEC-001 | Routine decisions expose a traceable utility score breakdown | Implemented + tested |
| NPC-DEC-010 | Three-layer decision: Layer-1 reflex (urgent) + Layer-2 routine utility | Implemented + tested |
| NPC-MOVE-001 | Deterministic waypoint navigation with travel durations; high speed resolves by duration, not rendered footsteps | Implemented + tested |
| VIS-001 | Citizen is an actual stylized 3D figure (not a sprite) | Implemented (manual UAT) |
| UX-001 | Selecting the citizen opens a deep inspector (needs, action, candidate scores, selected + factors) without pausing the sim | Implemented (manual UAT) |
| M02-GATE | Citizen completes several simulated days autonomously with no player commands, deterministically | Implemented + tested |
| ARCH-002/003/005, M00/M01 gates | Preserved (worker authority, seeded PRNG, high-speed equivalence, golden digest) | Regression |

---

## 3. Architecture

### 3.1 Authority & determinism (ARCH-002/003/005)

- The **worker** owns citizen truth: needs, position, current action, decision trace. The renderer only reads a compact `RenderSnapshot` (citizen position/action/needs + last decision) and interpolates.
- All citizen randomness (seeded decision noise, generation) flows through the snapshot `Mulberry32Prng` (ARCH-003). No `Math.random` in `src/simulation`.
- Citizen state advances in whole **sim-minute** steps. State is a function of total minutes stepped, so 1× and 1000× produce identical worlds (ARCH-005 / M01-GATE preserved). High-speed travel resolves by deterministic duration; no rule depends on a rendered footstep (§5.2, §30.8).

### 3.2 M00/M01 regression preservation

- The M00 toy simulation (`toySim.ts`: `createWorldSnapshot`, `stepToySimulation`, `runToySteps`) and `digestWorldSnapshot` are **not modified**. The golden digest `fac095d1` (schema `m00.1`) stays locked; the M01 time-scaling suite stays green.
- M02 adds a **separate** citizen world model and a separate `digestCitizenWorld`. `WorldSnapshot` gains an **optional** `citizens` field so the persisted schema stays backward-compatible; the M00 digest payload is unchanged (citizens are not hashed by `digestWorldSnapshot`).
- `SCHEMA_VERSION` → `m02.0` (persisted shape extended with optional citizens); `BUILD_VERSION`/`MILESTONE` → M02; `saveBundle.milestone` accepts `M00 | M01 | M02`. The M00 golden test remains pinned to the literal `m00.1`.

### 3.3 World model

- `src/simulation/model/` (authoritative):
  - `types.ts` — `Need`, `NeedsState`, `ActionType`, `ActionState`, `DecisionCandidate`/`DecisionTrace`, `CitizenState`, `CitizenWorldState` fields.
  - `locations.ts` — derives functional locations (home/store/workplace) and per-need service spots from the authored town (`CANONICAL_TOWN`), plus a lightweight **waypoint navigation graph** over road/path anchor nodes (§30.8).
  - `pathfinding.ts` — deterministic shortest path over the waypoint graph (Dijkstra with tie-break by node id), path length, and point sampling for travel.
  - `needs.ts` — per-minute decay rates + satisfaction effects + pressure (NPC-NEED-001).
  - `decision.ts` — Layer-1 reflex + Layer-2 utility scoring with a stored factor breakdown (NPC-DEC-001/010).
  - `citizen.ts` — deterministic citizen generation + `stepCitizenMinute` (decay → progress current action → decide when idle/interrupted).
  - `world.ts` — `createCitizenWorld(seed, schema)`, `stepCitizenWorld` (advance clock + citizen by one minute), `runCitizenSteps`.

### 3.4 Rendering & UI

- `rendering/Citizen.tsx` — original low-poly humanoid from shared primitives (body, head, limbs), coloured, faces travel direction; idle/walk bob at low speed, snapped when `animationsSuppressed` (VIS-001, §30.9).
- `ui/components/CitizenInspector.tsx` — needs bars, current action + destination, candidate actions with utility scores, selected action + factor breakdown, live while the sim runs (UX-001, §28). Toggle/select by clicking the citizen.
- `RenderSnapshot` gains an optional compact `citizen` summary (id, name, position, facing, action label, needs, lastDecision). No full internal graphs streamed.

---

## 4. Behaviour design (tuned for multi-day autonomy)

Needs are 0–100 (100 = satisfied); pressure = 100 − value. Approx per-minute decay: thirst 0.14, hunger 0.10, bladder 0.12, energy 0.07 (awake), hygiene 0.03. Actions restore the target need (and have plausible cross-effects, e.g. drinking raises bladder pressure). Action locations: sleep/toilet/shower/eat/drink at **home**; buy/eat also at **store**; **work** at the workplace during work hours.

- **Layer-1 reflex:** any need with pressure ≥ critical (value ≤ ~12) forces the satisfying action next (overrides routine), unless already doing it.
- **Layer-2 routine:** score candidates = need pressure × weight + time-of-day suitability (sleep at night, work daytime) + personality modifier − travel cost + small seeded noise. Highest wins. Need bars do **not** always force immediate action (UAT-NPC-002): during work hours a moderate hunger can be deferred until a break or until it becomes urgent.
- Every decision stores candidate scores + factor breakdown + selected action → inspector + causal evidence (NPC-DEC-001).

Gate proof: run ≥3 simulated days (≥4320 minutes) with no commands; assert the citizen keeps all needs above a deadlock floor, performs each action type, and never gets stuck; assert identical state across speed/batch sizes.

---

## 5. Test plan

- Unit: `needs` decay/satisfaction; `pathfinding` determinism + shortest path; `decision` reflex + routine + competing-need-vs-goal + trace completeness; `citizen` deterministic generation.
- Integration (`tests/integration/m02/`): autonomous multi-day (no deadlock, needs bounded, all actions occur); high-speed independence (citizen digest identical across batch sizes; pause = no-op).
- Preserved M00/M01 suites unchanged (golden `fac095d1`, time-scaling, townLayout).
- E2E: citizen visible in the 3D scene; inspector shows candidate scores + selected action; simulated time advances and the citizen acts with no player input.
- Manual GUI (computer use): citizen living across days, moving between home/store/work, inspector score breakdown, at 1× and high speed.

---

## 6. Out of scope for M02 (deferred)

20-citizen generation, memories/beliefs/perception/relationships/conversation, economy/money/inventory, government, weather, save/branch UI, building interiors. Documented in `KNOWN_LIMITATIONS.md`.
