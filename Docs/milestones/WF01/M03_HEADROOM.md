# WF01 → M03 Render Headroom Note

## Current one-citizen baseline (WF01 Revision 3)

Measured via `npm run measure:render-budget` on M2/8GB target host:

| Preset | Draw calls | Triangles |
|--------|-----------|-----------|
| Overview | ~136 | ~152,000 |
| Home street | ~56 | ~133,000 |
| Store street | ~63 | ~135,000 |
| Workshop street | ~54 | ~136,000 |

WF01 world geometry is static and shared; the citizen is the primary dynamic draw contributor.

## Estimated cost of +19 citizens (shared Kenney rig)

Assumptions (M03 plan):
- Same `alex-character.glb` instanced or cloned with shared materials/textures
- One `AnimationMixer` per visible citizen; off-screen citizens culled or pose-frozen
- No per-citizen unique meshes

| Resource | Per citizen (measured/derived) | ×20 citizens | Headroom vs WF01 Overview |
|----------|-------------------------------|--------------|---------------------------|
| Draw calls | ~1–2 (skinned mesh + shadow pass) | +20–40 | 136 → ~156–176 (may exceed 140 soft target) |
| Triangles | ~6–8k visible (LOD-dependent) | +120–160k | 152k → ~272–312k (exceeds 150k soft target) |

## Assessment

WF01 leaves **enough headroom for M03 functionally** but **not** for rendering all 20 citizens at full detail simultaneously in Overview without additional strategy.

### Required M03 strategies (not WF01 scope)

1. **Distance culling** — only simulate/render full skinned meshes within ~60 m of active camera; impostor/billboard or hide beyond that.
2. **Shared rig + material pool** — already established in Foundation Hardening; extend to citizen batching.
3. **LOD** — single simplified mesh or frozen pose for Overview; full clips only in Street/near modes.
4. **Staggered update** — not all 20 mixers evaluate every frame at 1000×; presentation already supports `animationsSuppressed`.

WF01 intentionally does not strip world visuals to reserve citizen budget; M03 must add presentation-tier citizen LOD rather than regressing WF01 town quality.
