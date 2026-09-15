# Foundation Hardening (post-M02)

Non-feature stabilization pass after M02 merge. No new gameplay, no visual redesign.

## Goals

1. Single-authority proof for worker sim, citizen render, save/schema, asset loading
2. Shared GLTF/material pipeline and dead-code removal
3. Structural ~20-citizen render readiness (no population gameplay)
4. R3F/runtime audit: mixer lifecycle, bounds throttle, occluder cache
5. One evidence harness (`npm run capture:m02-evidence`)
6. No-regression: M00 golden `fac095d1`, M02 autonomy, VIS-002 camera UX

## Key changes

| Area | Before | After |
|------|--------|-------|
| GLTF loaders | Split `examples/jsm` + `addons` | `gltfPipeline.ts` |
| Citizen registries | 2 singleton modules | `citizenPresentationRegistry.ts` |
| Building materials | Per-mesh `new MeshStandardMaterial` | `materialPool.ts` |
| Evidence scripts | 6 live capture scripts | 1 live + 5 archived |
| Occlusion raycasts | Full scene traverse per check | `sceneOccluderCache.ts` |
| Mixer lifecycle | No dispose | stopAllAction + uncacheRoot on unmount |

## Performance target

M02 baseline: Overview ~136 draw calls / ~126k tris. Target ~110–120 without quality loss.

Measure: `npm run measure:render-budget`

## Deleted / archived

- `scripts/archive/capture-r8..r12-evidence.mjs`
- Dead MAT entries: `skin`, `shoe`, `trunk`, `treeCanopy`
- Renamed `r12Evidence.test.ts` → `riverEvidence.test.ts`
