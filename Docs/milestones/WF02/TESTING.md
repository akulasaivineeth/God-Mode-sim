# WF02 Testing — R10 Phases A–C

## Automated gate

```bash
npm run test:all
```

Expected @ R10 handoff: typecheck PASS, lint PASS (6 pre-existing react-refresh warnings), Vitest **182 passed / 16 skipped**, Playwright **7/7**, production build PASS.

## Phase A — vocabulary audit

```bash
npm run audit:wf02-r10-vocabulary
```

Outputs `Docs/milestones/WF02/r10_vocabulary_audit.json`.

## Street portal camera (Phase B)

`tests/unit/wf02/streetPortalCamera.test.ts` covers:

- Facade-bound portal resolution for home/store/workshop
- Street corridor portal from presentation AABB
- Collision/occlusion fallback via distance/lateral sweep
- Inside-AABB checks for facility street presets

## Resolver parity (Phase 0, preserved)

`tests/unit/world/worldResolver.test.ts` covers:

- Active world id/version when `WORLD_LAB_MODE = true`
- Hero neighborhood bounds, building count, entrance resolution
- Nav graph parity for M02 semantic nodes
- Legacy definition round-trip via `LEGACY_CANONICAL_TOWN`
- Camera preset resolution from world definition (street from portal resolver)

Legacy-only envelope tests (`r8SliceDensity`, `envelopeFillBuilders`, `massSilhouetteBuilders`) are skipped when World Lab is active.

## Determinism

```bash
npm run test -- tests/integration/m02/determinism.test.ts tests/integration/determinism.test.ts
```

Same seed → same sim minute, needs, and decision traces after resolver migration.

## Evidence capture

```bash
npm run build && npm run preview -- --host 127.0.0.1 --port 4173 &
npm run capture:wf02-r10-neighborhood
```

Outputs to `/opt/cursor/artifacts/wf02_r10_neighborhood/` and copies manifest + compare strip into `Docs/milestones/WF02/`.

## Manual checks (reviewer)

1. R9 BEFORE → R10 AFTER → north-star compare strip shows material family shift (not merely more props)
2. Civic reads as enclosed/held square; commercial trio as one inhabited frontage
3. Residential pair shows distinct silhouettes with garden depth; future lot as reserved negative space
4. Street evidence: 2.32 m visual citizen, doorway, sidewalk/road, ≥2 readable shopfronts, no wall-jammed cameras
5. Diagnostics HUD: 0 asset/network errors during capture
