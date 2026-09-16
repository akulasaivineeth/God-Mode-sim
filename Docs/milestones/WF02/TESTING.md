# WF02 Testing — R9 Phase 0 + Phase 1

## Automated gate

```bash
npm run test:all
```

Expected @ R9 handoff: typecheck PASS, lint PASS (6 pre-existing react-refresh warnings), Vitest **175 passed / 16 skipped**, Playwright **7/7**, production build PASS.

## Resolver parity (Phase 0)

`tests/unit/world/worldResolver.test.ts` covers:

- Active world id/version when `WORLD_LAB_MODE = true`
- Hero neighborhood bounds, building count, entrance resolution
- Nav graph parity for M02 semantic nodes
- Legacy definition round-trip via `LEGACY_CANONICAL_TOWN`
- Camera preset resolution from world definition

Legacy-only envelope tests (`r8SliceDensity`, `envelopeFillBuilders`, `massSilhouetteBuilders`) are skipped when World Lab is active.

## Determinism

```bash
npm run test -- tests/integration/m02/determinism.test.ts tests/integration/determinism.test.ts
```

Same seed → same sim minute, needs, and decision traces after resolver migration.

## Evidence capture

```bash
npm run build && npm run preview -- --host 127.0.0.1 --port 4173 &
npm run capture:wf02-r9-neighborhood
```

Outputs to `/opt/cursor/artifacts/wf02_r9_neighborhood/` and copies manifest + compare strip into `Docs/milestones/WF02/`.

## Manual checks (reviewer)

1. Overview + Angled reveal compact civic anchor, commercial frontage, residential pair, future lot negative space
2. Street/home/store/workshop presets show citizen ↔ door ↔ road scale
3. North-star compare strip shows material delta from R8 slice failure class
4. Diagnostics HUD: 0 asset/network errors during capture
