# M00 Known Limitations

Three categories: **deliberate M00 limits**, **planned future milestones**, and **genuine technical issues**.

---

## Deliberate M00 limitations (not bugs)

These were scoped out intentionally. Missing them does not fail M00.

| Limitation | Explanation |
|------------|-------------|
| No town or citizens | M01/M02 deliver world and NPCs |
| No God tools | M11 |
| No pause/speed controls | M01 |
| No gameplay UI for saves | Schemas only; file picker later |
| Toy simulation only | Proves determinism, not fun |
| No event replay engine | Full snapshot restore in M00; replay architecture later |
| No timeline branch execution | EXP-001 schema stub only |
| No causal traces with real decisions | HIST-002 stub only |
| No IndexedDB / Dexie | Not required for M00 acceptance tests |
| No `@react-three/drei` | Not needed for placeholder scene |
| Playwright screenshots not auto-exported | Reviewer may capture manually |
| Large main JS bundle (~1 MB) | Three.js baseline; optimization later |

---

## Planned future milestone work

| Feature | Target milestone |
|---------|------------------|
| 3D town, camera, day/night | M01 |
| Simulation clock + speeds | M01 |
| One autonomous citizen + needs | M02 |
| 20 citizens, perception, beliefs | M03 |
| Economy, jobs, stores | M04 |
| Conversations, rumors, goals | M05 |
| Life cycle, family, graves | M06 |
| Business, property | M07 |
| Crime, justice | M08 |
| Culture, religion, politics | M09 |
| Weather, disease, disasters | M10 |
| God Mode + experiments UI | M11 |
| History polish + performance | M12 |

---

## Genuine known technical issues / notes

| Issue | Severity | Notes |
|-------|----------|-------|
| Vite chunk size warning | Low | Main bundle >500 KB due to Three.js; expected for M00 |
| `npm audit` moderate advisories | Low | Dev dependency chain; no runtime exposure assessed in M00 |
| ARCH-005 not tested | N/A | High-speed animation independence is M01 gate |
| build-manifest git commit in bundle | Info | Run `export-review-bundle` after checkout to match commit hash |
| StrictMode double-mount in dev | Info | React dev behavior only; does not affect determinism tests |

---

## What would be a real M00 bug

- Canonical digest ≠ `fac095d1` at 100 steps without documented version bump
- `Math.random()` appearing in `src/simulation/`
- Simulation state stored in React/Zustand as authority
- Save round-trip changes tick count or digest
- App requires network or LLM to step simulation

Report these as blockers in review.
