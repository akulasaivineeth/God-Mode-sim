# M02 Testing

```bash
npm ci
npm run typecheck
npm run lint
npm run test                 # unit + integration (53 tests)
npm run test:determinism     # M00 + M02 determinism
npm run test:e2e             # Playwright (citizen inspector)
npm run build
npm run test:all
npm run export-review-bundle
```

## Key suites

| Suite | Requirement |
|-------|-------------|
| `tests/integration/m02/autonomous-citizen.test.ts` | M02-GATE — 3 simulated days, action variety |
| `tests/integration/m02/determinism.test.ts` | Same seed → same digest @ 480 steps |
| `tests/unit/navigation.test.ts` | PATH-001 home/store/work connectivity |
| `tests/integration/toy-sim.test.ts` | M00 golden `fac095d1` unchanged @ `m00.1` |

## Manual UAT

1. `npm run dev` → open browser.
2. Confirm Alex visible near House 1; route rings at home/store/workshop.
3. Select Alex → inspector shows needs + utility breakdown after time advances.
4. Run 100× briefly — citizen continues acting; pause still freezes sim minute counter.
