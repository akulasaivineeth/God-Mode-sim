# M02 Build Notes

What was built for M02, module by module. Requirement IDs in parentheses.

---

## Simulation model (authoritative, worker-owned) — `src/simulation/model/`

### `types.ts` (NPC-ID-001)
Shapes for one citizen: `NeedsState` (five needs), `ActionState` (type, location,
travel/perform phase, remaining path, perform-until minute), `DecisionCandidate`/
`DecisionTrace` (utility scores + factor breakdown), `CitizenPersonality`
(diligence, discipline), and `CitizenState` (identity, position, current nav node,
facing, needs, personality, action, last decision).

### `locations.ts` (WORLD/§30.8)
Derives functional locations from the authored town — **home** (house), **store**,
**workshop** — each serving specific actions (sleep/toilet/shower/drink at home;
eat at the store; work at the workshop). Defines a lightweight **waypoint
navigation graph** (road anchors + building access nodes) with undirected edges
along the roads. Authored, deterministic world data (ADR-006).

### `pathfinding.ts` (NPC-MOVE-001)
Deterministic Dijkstra over the waypoint graph (ties broken by node id), plus
`pathWaypoints` (points to walk, excluding the start) and `pathLength`. Same trip
→ same route and duration, independent of rendering.

### `needs.ts` (NPC-NEED-001)
Per-minute decay rates (awake), reduced decay while asleep, action effects
(restore the target need with plausible side effects — e.g. drinking fills the
bladder; working tires and dirties), perform durations, and `stepNeeds`. Pure and
deterministic.

### `decision.ts` (NPC-DEC-001 / NPC-DEC-010)
Scores every candidate action from need pressure × weight + time-of-day
suitability (sleep at night, work daytime, meal-time bonus) + personality −
travel cost + small seeded noise. **Layer-1 reflex** boosts any action serving a
critical need so it overrides the routine choice. Returns the selected action and
a full `DecisionTrace` with per-candidate factor breakdowns.

### `citizen.ts` (NPC-ID-001 / NPC-MOVE-001)
`createCitizen` (deterministic generation from the seed) and `stepCitizenMinute`:
decay needs → reflex-interrupt a non-critical action for a critical need → advance
travel (walk along the path; on arrival begin performing) or complete a finished
action → decide when idle. Walk speed is per-minute, so travel resolves by
deterministic duration regardless of animation.

### `world.ts`
`createCitizenWorld(seed, schema)` builds a `WorldSnapshot` containing the citizen
(reusing the shared clock/PRNG/events; the M00 toy state is left static).
`stepCitizenWorld` advances exactly one minute (restore PRNG → step citizen →
snapshot PRNG), emitting a `CITIZEN_DECISION` domain event on fresh decisions.
`runCitizenSteps` loops.

---

## Rendering (display only) — `src/rendering/`

- `Citizen.tsx` (VIS-001) — an original low-poly humanoid from shared primitives
  (legs, torso, arms, head, hair) with a selection ring. Interpolates position at
  normal speed, snaps when animation is suppressed, faces travel direction, and a
  subtle walk bob. Clicking it opens the inspector. No simulation authority.
- `types.ts` — `RenderSnapshot` gains a compact read-only `citizen` summary
  (position, facing, action + phase, human activity label, needs, last decision).
- `Scene.tsx` — renders the citizen and forwards clicks to selection.

## UI — `src/ui/`

- `components/CitizenInspector.tsx` (UX-001) — needs bars, current activity, and
  the last decision's candidate scores + selected factor breakdown; live while the
  sim runs. Closable; reopened by clicking the citizen.
- `stores/diagnosticsStore.ts` — adds `citizenSelected` + setter.
- `app/App.tsx` — seeds `GODMODE_M02_CANONICAL_2026`, renders the inspector.

---

## Worker / persistence / metadata

- `simulation/worker/simulation.worker.ts` — live app now runs
  `createCitizenWorld` + `stepCitizenWorld`; `GET_DIGEST` returns
  `digestCitizenWorld`.
- `core/toySim.ts` — `WorldSnapshot` gains an **optional** `citizens` field
  (backward compatible; M00 digest unaffected).
- `debug/worldDigest.ts` — adds `digestCitizenWorld` (clock + PRNG + citizens +
  event count). `digestWorldSnapshot` unchanged (golden `fac095d1`).
- `persistence/schemas/saveBundle.ts` — full citizen Zod schema (optional);
  `milestone` accepts `M00 | M01 | M02`.
- `shared/version.ts` — `SCHEMA_VERSION` → `m02.0`, `BUILD_VERSION`/`MILESTONE` → M02.
- `shared/requirements.ts` — M02 acceptance/regression ID lists.
- `scripts/export-review-bundle.ts` — M02 statuses, 1-day scenario, and a real
  exported decision/utility trace under `causal-traces/`.

---

## Determinism / M00-M01 regression

The M00 toy sim, PRNG, canonical JSON, digest, and event envelope are unchanged;
the golden digest `fac095d1` (schema `m00.1`) stays locked, and the M01
time-scaling + townLayout suites remain green. Citizen state advances only in
whole sim-minutes via the seeded PRNG, so 1× and 1000× produce identical worlds.
