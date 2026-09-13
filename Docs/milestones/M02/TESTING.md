# M02 Testing Guide

Plain-English explanation of the M02 tests. All M00/M01 tests are preserved and
still pass (regression).

---

## How to run

```bash
npm ci
npm run typecheck
npm run lint
npm run test              # all Vitest unit + integration
npm run test:determinism  # M00 determinism
npm run test:e2e          # Playwright
npm run build
npm run test:all
npm run export-review-bundle
```

---

## New unit tests (`tests/unit/m02/`)

### `needs.test.ts` — NPC-NEED-001
Decay each minute; clamp to [0,100]; eating raises fullness; sleep restores energy
(and does not decay it); drinking fills the bladder (side effect); `pressure` is
the inverse of satisfaction; every action has a positive duration.

### `pathfinding.test.ts` — NPC-MOVE-001
Deterministic for the same query; home→store routes via the square (along roads);
waypoints exclude the start and end at the target; positive path length; `from ===
to` yields a single-node path / no waypoints.

### `decision.test.ts` — NPC-DEC-001 / NPC-DEC-010
Layer-1 reflex overrides routine when a need is critical; routine chooses sleep at
night when tired; **competing need vs goal** — a moderate hunger is deferred to
work during work hours (UAT-NPC-002); the trace always exposes all 7 candidates
with factor breakdowns and includes the selected action.

### `citizen.test.ts` — NPC-ID-001
Deterministic generation from the seed (different seed → different personality);
starts at home with identity + five needs; chooses an action on the first step and
keeps acting over time (never permanently stuck).

---

## New integration tests (`tests/integration/m02/`)

### `autonomy.test.ts` — M02-GATE
Runs 3 simulated days (4320 minutes) with **no player commands** and asserts:
every need stays above zero (reflex prevents starvation), every need is actively
satisfied (rises above 70 again), every action type (sleep/eat/drink/toilet/
shower/work) is used, and the citizen is still acting at the end (no deadlock).

### `determinism.test.ts` — ARCH-005 / M01-GATE (citizen)
Stepping the same total minutes in different batch sizes (1 / 7 / 60 / 1440) yields
an identical `digestCitizenWorld`; pause (0 steps) is a no-op; a different seed
diverges.

---

## Updated end-to-end (`tests/e2e/smoke.spec.ts`)

| Test | What it checks |
|------|----------------|
| Boot | canvas + HUD + time controls + camera controls + **citizen inspector** visible |
| Speed + pause | 1000× advances the clock; Pause halts it |
| Inspector (UX-001 / NPC-DEC-001) | inspector shows a selected action with score breakdown; the citizen keeps acting at 1000× with no input |
| Camera presets | Overview/Street/Angled work |

---

## Preserved regression

M00 golden digest `fac095d1` (schema `m00.1`), M00 determinism/save/PRNG/no-`Math.random`,
M01 time-scaling + townLayout (13 tests) all still pass. Total suite: **71** Vitest
tests across 17 files + 4 Playwright tests.

---

## Manual checks (recommended)

1. `npm run dev` — watch Noah walk between home/store/workshop and act on needs.
2. Open the inspector — confirm needs bars move and the decision table shows
   candidate scores + the selected action's factors.
3. Click 1000× — Noah lives multiple days in seconds; day/night tracks the clock.
4. Disable network — the app still runs (ARCH-001; no runtime LLM).
