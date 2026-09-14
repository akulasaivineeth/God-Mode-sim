# GOD MODE

**A local browser simulation where you observe a small society, intervene as God, and understand why outcomes happen.**

This document is written for anyone steering the project — including non-programmers. Technical details appear later.

---

## What is GOD MODE?

GOD MODE is a stylized 3D life simulation. Twenty persistent citizens will eventually live in a small modern town. They will have needs, personalities, relationships, beliefs, jobs, and imperfect knowledge. They will make their own choices. Society-level patterns — crime, inequality, culture, politics — will emerge from those individual choices, not from hidden global scripts.

You play three roles at once:

- **God** — change concrete facts in the world (money, health, weather, and more).
- **Observer** — follow one person or zoom out to society-wide trends.
- **Experimenter** — branch timelines, compare outcomes, and inspect why the simulation produced a result.

There is no traditional “win” condition. The core loop is: **create → observe → intervene → compare → understand → remember**.

---

## Long-term vision

The finished product will feel like a readable miniature world running on your MacBook:

- Citizens are real 3D figures, not flat sprites.
- Conversations are driven by structured meaning first — not by a paid AI chatbot.
- God actions always succeed exactly; how people react remains emergent.
- Saves, replays, snapshots, and alternate timelines stay fair and reproducible.
- Important decisions can be traced back to needs, beliefs, memories, and scored options.

The canonical product specification lives in `Docs/specs/GOD_MODE_Canonical_Build_Specification.md`.

---

## What is complete right now?

| Status | Milestone | Plain-English summary |
|--------|-----------|------------------------|
| **Complete (merged to `main`)** | **M00 — Foundation** | The project runs locally. A hidden **simulation engine** (see Glossary) steps a simple toy world deterministically. The 3D view and diagnostics panel display results but do not own truth. Saves use a versioned format. Tests prove same seed → same outcome. |
| **Complete (merged to `main`)** | **M01 — 3D World and Time** | A small **handcrafted 3D town**, a **free camera** (rotate/pan/zoom + presets), a **simulation clock** with a full calendar and **day/night**, and **all speed controls** (Pause, 0.25×, 1×, 5×, 20×, 100×, 1000×). At 1000× animation is skipped but time/state stay exact. |
| **Complete (awaiting independent review)** | **M02 — One Autonomous Citizen** | One stylized **3D citizen** who lives on their own: five **needs** (energy, fullness, hydration, bladder, hygiene), **utility-based decisions** (reflex + routine), deterministic **walking** between home/store/workshop, and a **deep inspector** showing the score breakdown behind each choice. Runs for days with no player input. |
| **Not started** | M03+ | Twenty citizens, perception, memory, economy, social systems, God tools, experiments, and all gameplay described in the spec |

**M02 adds the first person — still only one.** There is no population, economy, God menu, or timeline branching yet. Those are deliberate limits, not missing bugs.

---

## What is NOT built yet?

Do not expect these in the current build:

- More than one citizen (20-person generation is M03), or relationships, memory, perception, or conversation
- Jobs that pay, money, shopping inventory, or economy (M04)
- God intervention tools
- Building interiors (exterior shells only in M01)
- Weather or seasonal effects (the season is shown but has no effects yet)
- Real save-to-disk gameplay UI (schemas exist; full persistence UI comes later)
- Timeline branches or experiment comparison
- Any dependency on ChatGPT, Ollama, or other runtime AI services

Speed controls (Pause, 0.25× … 1000×), the 3D town, the free camera, and
day/night **are** in this build as of M01.

---

## How to install

You need **Node.js** (version 20 or newer recommended) and **npm** on your Mac.

```bash
git clone https://github.com/akulasaivineeth/God-Mode-sim.git
cd God-Mode-sim
git checkout milestone/m02-one-citizen   # current build (M02); M00 and M01 are merged to main
npm ci
```

`npm ci` installs the **exact** dependency versions locked in `package-lock.json`. Reviewers and builders should always use `npm ci`, not `npm install`, for reproducible installs.

---

## How to run the application

```bash
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

You should see:

- A **handcrafted low-poly 3D town** (differentiated houses/store/clinic/school/cafe/workshop/warehouse/farm/community hall, park, square, cemetery, roads with sidewalks, pedestrian paths, trees, a nearby forest on gently rolling hills, and a readable river with banks) under an angled camera
- Asset-backed town (CC0 Kenney/Quaternius): dedicated home/store/workshop buildings, real trees, roads with sidewalks + crossing, a continuous river + bridge, and a town square with a fountain, benches, and lamps
- One animated **3D citizen** ("Noah") — a CC0 character GLB that walks/sits/works between home, the store, and the workshop, living on their own
- **Day/night lighting** that follows the clock
- A **Citizen Inspector** (top-left) with needs bars, the current activity, and the utility-score breakdown behind the last decision
- A diagnostics panel with the **date, clock, season, day/night, speed**, FPS, **draw calls · triangles** (renderer stats), worker step time, seed, and a state **digest** (fingerprint)
- **Speed buttons** (bottom) and **camera buttons** (top-left)

Try it: click **1000×** to watch Noah live several days in seconds (the sun crosses
the sky); click **Pause** to freeze simulated time while the camera still moves;
drag to rotate, right-drag to pan, and scroll to zoom.

Underneath, the M00 toy counter still steps deterministically — that is how the
engine proves same-seed → same-outcome; it is not gameplay.

---

## How to run tests

| Command | What it does |
|---------|----------------|
| `npm run typecheck` | Checks TypeScript types |
| `npm run lint` | Checks code style and rules (e.g. no forbidden randomness in simulation code) |
| `npm run test` | Runs all unit and integration tests |
| `npm run test:determinism` | Runs determinism-specific tests |
| `npm run test:e2e` | Opens the built app in a browser and smoke-tests it |
| `npm run build` | Production build |
| `npm run test:all` | Runs everything above in sequence |
| `npm run export-review-bundle` | Generates reviewer artifacts in `review-bundle/` (gitignored) |

**Canonical M00 check:** with seed `GODMODE_M00_CANONICAL_2026`, after 100 simulation steps the state digest must be `fac095d1`. If that ever changes without an intentional version bump, something broke determinism.

---

## Basic architecture (plain English)

Think of four layers:

1. **Simulation (authoritative)** — A **Web Worker** is a background thread in the browser. It owns the real world state: time, randomness, events, and the toy counters. Nothing else may silently change that truth.
2. **Rendering** — **Three.js** draws the 3D scene. **React Three Fiber** connects Three.js to **React** (the UI framework). The renderer only receives a small “display snapshot” so it cannot corrupt simulation state.
3. **UI** — Panels, buttons, and diagnostics. Stores interface state only (FPS, last step time), not citizen brains or world truth.
4. **Persistence** — **Serialization** converts state to JSON for saves. **Zod** is a library that validates saved data against expected **schemas** (shapes/rules) so corrupt files are rejected.

**Rule:** Simulation decides truth. Rendering and UI show truth. Saves copy truth.

More detail: `Docs/architecture/SYSTEM_OVERVIEW.md` and `Docs/architecture/DATA_FLOW.md`.

---

## Where to find documentation

| Document | Audience | Purpose |
|----------|----------|---------|
| `Docs/GLOSSARY.md` | Everyone | Plain-English definitions |
| `Docs/architecture/SYSTEM_OVERVIEW.md` | PO + builders | Living architecture summary |
| `Docs/architecture/DATA_FLOW.md` | PO + builders | How data moves (with diagrams) |
| `Docs/architecture/ARCHITECTURE_DECISIONS.md` | PO + builders | Why key decisions were made (ADRs) |
| `Docs/milestones/M00/` | PO + reviewers | Everything specific to milestone M00 |
| `Docs/milestones/M01/` | PO + reviewers | Everything specific to milestone M01 (3D world and time) |
| `Docs/milestones/M02/` | PO + reviewers | Everything specific to milestone M02 (one autonomous citizen) |
| `Docs/specs/GOD_MODE_Canonical_Build_Specification.md` | Builders + reviewers | Full product specification |
| `Docs/qa/GOD_MODE_Independent_Validation_UAT.md` | Reviewer (Grok) | Validation and UAT procedures |
| `Docs/agents/` | AI agents | Builder and reviewer operating prompts |

---

## Review workflow (builders and Grok)

1. Builder completes a milestone and exports a review bundle.
2. Independent reviewer (Grok) checks behavior, architecture, **and documentation**.
3. Reviewer returns pass/fail with requirement IDs.
4. Next milestone starts only after pass.

---

## Technical stack (reference)

| Piece | Technology |
|-------|------------|
| Language | TypeScript |
| UI | React |
| Build tool | Vite |
| 3D | Three.js + React Three Fiber |
| UI-only state | Zustand |
| Simulation | Web Worker |
| Save validation | Zod |
| Unit/integration tests | Vitest |
| Browser smoke tests | Playwright |
| Deterministic randomness | mulberry32-v1 PRNG (fixed for save compatibility) |

---

## Current branch

Active milestone work: **`milestone/m02-one-citizen`**

M00 and M01 have passed independent review and are merged to `main`. Do not merge
M02 to `main` until independent review marks M02 **PASS**.
