# Milestone M02 — One Autonomous Citizen — Implementation Plan

**Source of truth:** `Docs/specs/GOD_MODE_Canonical_Build_Specification.md` (§7 needs, §14 decision architecture, §30.8 pathfinding, §37 M02)
**Validation:** `Docs/qa/GOD_MODE_Independent_Validation_UAT.md` (UAT-NPC-001, M02 gate)
**Visual north star:** `Docs/art-direction/TOWN_VISUAL_DIRECTION.md`, `ASSET_PIPELINE_PLAN.md`

This plan implements **only M02** on top of merged M00/M01. M03 (twenty citizens) is out of scope.

---

## 1. Canonical M02 deliverables (spec §37)

> **M02 — One autonomous citizen.** Deliver: one 3D NPC; home, store, workplace; hunger, thirst, bladder, energy, hygiene; movement/pathing; Layer-1 and Layer-2 utility actions; deep inspector with score breakdown.
> **Gate:** citizen can autonomously complete several simulated days without player commands.

---

## 2. Requirement IDs

| ID | Requirement | Implementation |
|----|-------------|----------------|
| NPC-NEED-001 | Physical needs (hunger, thirst, bladder, energy, hygiene) decay and are autonomously satisfied | `citizens/needs.ts`, `citizenStep.ts` |
| NPC-DEC-001 | Major decisions expose utility score breakdown | `citizens/utility.ts`, `CitizenInspector.tsx`, `CITIZEN_ACTION_SELECTED` events |
| PATH-001 | Lightweight navigation graph / waypoint pathing | `world/navigation.ts`, `world/facilityPoints.ts` |
| VIS-001 | 3D citizen representation | `rendering/CitizenMesh.tsx` (procedural shared rig) |
| VIS-004 | Selected citizen visually identifiable | Selection halo + inspector panel |
| M02-GATE | Autonomous multi-day survival without player commands | `tests/integration/m02/autonomous-citizen.test.ts` |

Preserved regression: all M01 + M00 requirements including golden digest `fac095d1` @ schema `m00.1`.

---

## 3. Architecture decisions

### 3.1 Worker authority preserved (ARCH-002)

All citizen state, needs decay, utility scoring, and path resolution live in the simulation worker. `RenderSnapshot` exposes positions, action labels, needs, and the latest utility trace for the selected citizen only.

### 3.2 Navigation (spec §30.8)

Authored waypoint graph from roads, sidewalks, paths, plus facility entrance nodes and a town-square hub. A* pathfinding; travel resolves deterministically by distance / walk speed per simulated minute. No physics engine.

### 3.3 Decision layers (spec §14)

- **Layer 1 (reflex):** critical bladder, thirst, low energy, urgent hunger → immediate action candidates.
- **Layer 2 (routine utility):** work hours, meal windows, sleep window, hygiene — scored with need pressure, goal value, travel/time cost, seeded noise. Full contributor breakdown stored on `lastUtilityTrace`.

### 3.4 M02 vertical slice citizen

| Field | Value |
|-------|-------|
| ID | `citizen-alex` |
| Home | `house-1` |
| Store | `store` |
| Workplace | `workshop` |
| Seed | `GODMODE_M02_CANONICAL_2026` |

Route proven: home → sidewalk/path network → store/workshop → return home.

### 3.5 Visual / asset pipeline (product addendum)

- **Procedural shared humanoid** (`CitizenMesh`) — original lightweight body/head/hair with palette variation; establishes reusable pipeline for M03 scaling.
- **Route markers** at the three M02 facilities.
- **No third-party GLB import in R1** — documented in `Docs/assets/ASSET_REGISTER.md`; Kenney/Quaternius remain approved for targeted later imports.
- M01 town topology, terrain, river, instancing preserved unchanged.

### 3.6 Schema

- `SCHEMA_VERSION` → `m02.1` (adds optional `citizens[]` to `WorldSnapshot`).
- M00 golden digest test remains pinned to literal `m00.1` without citizens.

---

## 4. Module plan

**New simulation**
- `src/simulation/core/citizens/` — types, needs, utility, planner/step, createCitizen
- `src/simulation/core/worldStep.ts` — unified minute step (toy + citizens)
- `src/simulation/core/m02Init.ts` — M02 world bootstrap

**New world**
- `src/world/facilityPoints.ts` — entrance/interior anchors
- `src/world/navigation.ts` — graph + A*

**New rendering / UI**
- `src/rendering/CitizenMesh.tsx`, `RouteMarkers.tsx`
- `src/ui/components/CitizenInspector.tsx`

**Modified**
- Worker protocol: `SELECT_CITIZEN`
- `RenderSnapshot` extended with citizens + inspector trace
- Persistence schema: `citizenStateSchema`, milestone `M02`

**Tests**
- `tests/unit/navigation.test.ts`
- `tests/integration/m02/autonomous-citizen.test.ts`
- `tests/integration/m02/determinism.test.ts`
- E2E: inspector utility breakdown

---

## 5. Known limitations (truthful)

- One citizen only (M03 adds twenty).
- No economy, inventory, or semantic conversation.
- No building interior meshes — interior points are simulation anchors only.
- No beliefs, memory, or social perception.
- Procedural citizen art is functional, not final production ceiling.

---

## 6. Out of scope (M03+)

Twenty-citizen generation, relationships, memories, beliefs, economy, government, advanced memories, character asset packs at scale.
