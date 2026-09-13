# GOD MODE Glossary

Plain-English definitions for terms used across project documentation. When a word appears in docs, this file is the reference.

---

## Simulation

The hidden rules and state that define what is **true** in the world: who exists, what they need, what happened, and what happens next. The simulation is authoritative — the game world obeys it, not the graphics.

---

## Simulation state

The complete set of values the simulation currently believes to be true (time, counters, randomness position, event history, and eventually every citizen). Only the simulation worker may change simulation state directly.

---

## Web Worker

A background thread in the browser that runs separately from the page’s main thread. Used so heavy simulation work does not freeze the 3D view. In GOD MODE, the worker owns simulation truth.

---

## Renderer

The part of the program that **draws** the world on screen. It shows positions, colors, and motion. It does not decide outcomes.

---

## Three.js

A JavaScript library for real-time 3D graphics in the browser. GOD MODE uses it for the stylized miniature-town look.

---

## React

A JavaScript library for building user interfaces from components. GOD MODE uses React for panels, layout, and wiring — not for storing simulation truth.

---

## Snapshot

A frozen copy of simulation state at a point in time. Used for saves, checkpoints, and sending a safe summary to the renderer. A **render snapshot** is a smaller snapshot containing only what the 3D view needs.

---

## Event

A structured record that something meaningful happened in the simulation (not every animation frame). Events support history, debugging, and future replay. Each event has a type, time, actors, and payload.

---

## Seed

A starting value (often text like `GODMODE_M00_CANONICAL_2026`) that initializes the world’s randomness. Same seed + same rules + same actions → same outcome.

---

## Seeded randomness

Random-looking choices that are actually reproducible because they come from a fixed seed and a deterministic algorithm. Needed for fair experiments and reliable saves.

---

## PRNG

**Pseudo-Random Number Generator** — a deterministic algorithm that produces a sequence of numbers that look random but repeat exactly when the seed and internal state are restored. GOD MODE uses **mulberry32-v1**; this name is part of save compatibility.

---

## Deterministic

Given the same starting conditions and inputs, the system always produces the same results. Essential for debugging, saves, and timeline comparison.

---

## Digest

A short fingerprint (hash) of canonical simulation state. Used in tests to prove two runs match without comparing huge files byte-by-byte. M00 canonical digest at 100 steps: `fac095d1`.

---

## Serialization

Converting in-memory structures into a storable format (usually JSON text) and back. Saves and review bundles depend on stable serialization rules.

---

## Schema

A formal description of what saved data must look like (required fields, types, allowed values). Invalid saves are rejected instead of silently corrupting the world.

---

## Zod

A TypeScript library that validates data against schemas at runtime. Used for save bundles and domain events so corrupt files fail fast.

---

## Branch

An alternate timeline copied from a checkpoint. Future milestones will let you run “what if” experiments. M00 defines branch metadata in schemas only — no branch UI yet.

---

## Timeline

The ordered sequence of simulation time and events in one world line. Branching creates sibling timelines that share history up to a fork point.

---

## Causal trace

A structured explanation of **why** a character chose an action: needs, beliefs, emotions, scored options, and the winner. M02 implements utility contributor traces (`UtilityTrace`) for Layer-1/Layer-2 decisions; full belief/emotion traces arrive in later milestones.

---

## Citizen

An autonomous simulated person whose needs, decisions, and movement are computed in the simulation worker. M02 ships one citizen (Alex) with five physical needs and utility-driven action selection.

---

## Need (physiology)

A physical drive tracked per citizen: hunger, thirst, bladder, energy, hygiene. Needs decay each simulated minute and rise in urgency until the citizen satisfies them through actions (eat, drink, sleep, etc.). NPC-NEED-001.

---

## Utility scoring

A deterministic method for choosing the best next action by summing weighted factors (need pressure, schedule goals, travel cost, time cost, seeded noise). M02 Layer-2 scoring exposes a full contributor breakdown in the inspector. NPC-DEC-001.

---

## Waypoint graph

An authored network of walkable nodes (roads, sidewalks, paths, facility entrances) used for A* pathfinding. Citizens travel along this graph; the renderer shows their position but does not own routing. PATH-001.

---

## Facility anchor

A deterministic entrance and interior point for a building (`facilityPoints.ts`). Citizens arrive at the entrance when traveling and use the interior anchor while performing indoor actions.

---

## Milestone

A vertical slice of the project with clear deliverables and a review gate. M00 is foundation; M01 adds town and time; M02 adds one autonomous citizen; later milestones add population, economy, God tools, and more.

---

## UAT

**User Acceptance Testing** — hands-on checks that the build matches the product intent. Grok performs independent UAT against the canonical spec.

---

## Regression

A bug where something that used to work breaks after a change. Regression tests re-run key scenarios (especially determinism) on every milestone.

---

## Requirement ID

Stable labels like `ARCH-003` or `NPC-BEL-001` used in specs, tests, and review reports so feedback stays precise.

---

## Domain event

A simulation event with a standard envelope (id, time, type, actors, payload). Distinct from browser DOM events or React UI events.

---

## Render snapshot

The small, read-only package of numbers the 3D layer is allowed to see (e.g. visual phase, tick count). Prevents the renderer from needing — or mutating — full simulation state.

---

## Save bundle

A versioned JSON package containing snapshot, events segment, metadata, and digest — the portable unit for saves and reviewer handoff.

---

## ARCH-* / M00-GATE

Architecture requirement IDs. M00 acceptance targets include ARCH-001 through ARCH-004 and the M00 determinism gate.

---

## Scaffolded

Types and schemas exist for a future system, but behavior is not implemented or accepted yet. Example: timeline branch execution in M00.
