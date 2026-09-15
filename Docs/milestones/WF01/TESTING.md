# WF01 Testing

## Automated

```bash
npm run typecheck
npm run test
npm run build
npm run measure:render-budget   # requires preview server on :4173
```

All 114 unit/integration tests pass including updated `townLayout.test.ts` and river bridge assertions.

## Visual evidence

```bash
npm run build
npm run preview -- --host 127.0.0.1 --port 4173 &
npm run capture:wf01-evidence
```

Outputs to `/opt/cursor/artifacts/wf01_evidence/` with manifest + diagnostics.

## M02 regression

- One-citizen route (home → store → workshop) preserved
- Inspector deep-dive still available
- Asset integrity gate (`tests/unit/m02/assets.test.ts`) covers all new Kenney paths
