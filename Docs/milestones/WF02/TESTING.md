# WF02 Testing

## Unit

```bash
npm run test:unit -- tests/unit/wf02
```

Covers:

- Approved per-building `targetWidth` values
- 14 distinct Kenney silhouettes
- M02 trio alignment + workshop presentation offset
- Anchor-derived extras (no magic coordinates)
- Camera preset reframing
- Citizen presentation/simulation height split

## Full gate

```bash
npm run test:all
```

## Evidence + performance

```bash
npm run build
npm run preview -- --host 127.0.0.1 --port 4173 &
npm run capture:wf02-evidence
npm run measure:render-budget
```

Evidence manifest reports Overview/Street draw calls and triangles.

## Regenerate layout manifest (after Kenney asset changes)

```bash
npm run generate:model-layout-manifest
```
