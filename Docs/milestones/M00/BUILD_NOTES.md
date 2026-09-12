# M00 Build Notes

Step-by-step record of what was built during M00 and why.

---

## 1. Project scaffold

**Built:** Vite + React + TypeScript application with strict typing, ESLint, Vitest, Playwright.

**Why:** Canonical spec requires a local browser-first stack with pinned dependencies (`package-lock.json`) so reviewers install identical bits.

**Not included:** Dexie, `@react-three/drei`, LLM SDKs — none required for M00 acceptance.

---

## 2. Folder boundaries

**Built:** Separated directories for simulation, rendering, UI, persistence, debug, shared metadata.

**Why:** Constitution rule 17 — simulation, rendering, UI, persistence, and test tooling must stay separable as systems grow.

---

## 3. Mulberry32 PRNG (`mulberry32-v1`)

**Built:** `Mulberry32Prng` with snapshot/restore, weighted choice, int range, normal distribution.

**Why:** ARCH-003 — all simulation randomness must be seeded and serializable. Algorithm ID is frozen in saves.

**Why mulberry32:** Small state (one uint32), fast, deterministic, easy to test. Alternative algorithms were deferred to avoid save incompatibility.

---

## 4. Domain event envelope

**Built:** `DomainEvent` type with Zod validation — id, branchId, simTime, type, actors, payload, optional metadata.

**Why:** ARCH-004 — meaningful changes must be logged in a standard shape for future history, replay, and review.

**M00 behavior:** Toy step emits `TOY_STEP`; init emits `TOY_WORLD_INITIALIZED`.

---

## 5. Toy simulation

**Built:** `stepToySimulation` updates counters using PRNG only.

**Why:** M00 gate requires deterministic stepping without building gameplay. Proves worker authority and event append.

**Explicitly not built:** NPCs, needs, pathfinding, economy, God tools.

---

## 6. Simulation worker

**Built:** `simulation.worker.ts` handles INIT, STEP, GET_SNAPSHOT, GET_DIGEST, LOAD_SNAPSHOT.

**Why:** ARCH-002 — authoritative loop off main thread.

---

## 7. Main-thread bridge

**Built:** `SimulationClient` wraps worker `postMessage` with typed callbacks.

**Why:** React must not touch worker internals directly; commands stay explicit.

---

## 8. Render snapshot boundary

**Built:** `RenderSnapshot` DTO + `toRenderSnapshot()`; R3F placeholder scene.

**Why:** ADR-003 — renderer sees display fields only.

---

## 9. Diagnostics UI

**Built:** Zustand store + HUD for FPS, worker step ms, seed, digest.

**Why:** M00 deliverable — FPS and worker-step diagnostics from first milestone.

---

## 10. Persistence

**Built:** `SaveBundle` Zod schema, `buildSaveBundle`, `parseSaveBundle`, restore via worker.

**Why:** ARCH-004 — versioned saves with validation.

**Not built:** IndexedDB, autosave UI, export/import file picker.

---

## 11. Canonical digest

**Built:** `canonicalize()` (sorted keys) + FNV-1a `digestCanonical()` + `digestWorldSnapshot()`.

**Why:** Determinism tests need stable fingerprints independent of object key insertion order.

---

## 12. Scaffold types (deferred)

**Built:** `branchMetadataSchema`, `causalTraceSchema`, `culturalHistoryEntrySchema`.

**Why:** Reserve compatible shapes for EXP-001, HIST-001, HIST-002 without implementing behavior.

---

## 13. Tests

**Built:** 14 Vitest tests + 1 Playwright smoke test. See `TESTING.md`.

**Why:** Constitution rule 14 — every milestone includes automated tests and reviewer evidence.

---

## 14. Review bundle script

**Built:** `npm run export-review-bundle` → `review-bundle/` (gitignored).

**Why:** Spec §39 — Grok receives manifest, requirements status, save baseline, event sample, architecture summary.

---

## Build order used

1. Scaffold + tooling  
2. PRNG + tests  
3. Events + schemas  
4. Toy sim + digest  
5. Worker + client  
6. R3F + diagnostics  
7. Persistence round-trip  
8. Integration/determinism tests  
9. Playwright smoke  
10. Review bundle exporter  

Each stage kept the app runnable and tests passing.
