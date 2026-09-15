# Foundation Hardening — Build Notes

## Single-authority inventory

| Path | Authority |
|------|-----------|
| `src/simulation/worker/simulation.worker.ts` | Worker-authoritative simulation |
| `src/rendering/assets/CitizenVisual.tsx` | Live citizen rendering |
| `src/persistence/schemas/saveBundle.ts` + serialize/deserialize | Save/schema |
| `src/rendering/assets/EnvironmentAssetRegistry.ts` + `gltfPipeline.ts` | Asset URLs + loading |

Enforced by `tests/unit/foundation/singleAuthority.test.ts`.

## Consolidation

- **`citizenPresentationRegistry.ts`** — bodies, bounds, evidence mixer controls (multi-ID ready)
- **`gltfPipeline.ts`** — GLTFLoader import, static/skeleton clone helpers
- **`materialPool.ts`** — pooled MeshStandardMaterial by color
- **`sceneOccluderCache.ts`** — evidence portrait LOS mesh cache

## 20-citizen readiness (structural only)

- `CitizenVisual` registers by `citizen.id`; R3F `useLoader` caches GLTF once per URL
- Each citizen still requires own SkeletonUtils clone + AnimationMixer (skinned animation requirement)
- No population/beliefs/economy added

## Save compatibility

`tests/integration/foundation/saveCompat.test.ts` — citizen snapshot round-trip + digest equality.

## Evidence tooling

- Authoritative: `scripts/capture-m02-closure-evidence.mjs` (`npm run capture:m02-evidence`)
- Archived: `scripts/archive/capture-r8..r12-evidence.mjs`

VIS-002 camera UX unchanged: +/−/Reset, Reset→Overview, 6–102 m clamps.

## Render budget (FH-001 measurement integrity)

- **Root cause of false 119 claim:** `measure-render-budget.mjs` sampled `getRenderDiagnostics()` before preset settle and before FpsTracker/HUD sync (~1 Hz). Stale counters from the prior camera view were reported as Overview.
- **Fix:** `sampleRenderDiagnosticsAfterFrames()` reads live `gl.info.render` post-frame; measure script uses capture-equivalent preset settle + reconciles live vs HUD counters.
- **Measured truth:** Overview draw calls remain **~136** (M02 parity). Material pooling is allocation/lifecycle hardening, not draw-call batching.
- Soft 110–120 target deferred to future instancing/batching work (no visual redesign in FH).
