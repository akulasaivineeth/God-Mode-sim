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
