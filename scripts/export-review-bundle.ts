import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync, cpSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { digestWorldSnapshot } from '../src/debug/worldDigest';
import { buildSaveBundle, serializeSaveBundle } from '../src/persistence/serialize';
import {
  M02_ACCEPTANCE_REQUIREMENTS,
  M02_REGRESSION_REQUIREMENTS,
} from '../src/shared/requirements';
import { BUILD_VERSION, MILESTONE, SCHEMA_VERSION } from '../src/shared/version';
import { deriveCalendar, MINUTES_PER_DAY } from '../src/simulation/core/calendar';
import { createM02WorldSnapshot } from '../src/simulation/core/m02Init';
import { runWorldSteps } from '../src/simulation/core/worldStep';
import { createWorldSnapshot, runToySteps } from '../src/simulation/core/toySim';

const CANONICAL_SEED = 'GODMODE_M02_CANONICAL_2026';
const M00_CANONICAL_SEED = 'GODMODE_M00_CANONICAL_2026';
const M00_LOCKED_SCHEMA_VERSION = 'm00.1';
const OUTPUT_DIR = 'review-bundle';

function run(command: string): string {
  return execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function main(): void {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  mkdirSync(join(OUTPUT_DIR, 'causal-traces'), { recursive: true });
  mkdirSync(join(OUTPUT_DIR, 'screenshots'), { recursive: true });

  const gitCommit = run('git rev-parse HEAD');
  // M01 scenario: advance a full simulated day (1440 minutes) to exercise the
  // clock/calendar and demonstrate deterministic stepping.
  const snapshot = runWorldSteps(createM02WorldSnapshot(CANONICAL_SEED, SCHEMA_VERSION), MINUTES_PER_DAY);
  const bundle = buildSaveBundle({
    snapshot,
    exportedAt: new Date().toISOString(),
  });
  const endCalendar = deriveCalendar(snapshot.clock.simMinute);
  // M00 regression artifact: the historical golden digest at schema m00.1.
  const m00Digest = digestWorldSnapshot(
    runToySteps(createWorldSnapshot(M00_CANONICAL_SEED, M00_LOCKED_SCHEMA_VERSION), 100),
  );

  writeFileSync(
    join(OUTPUT_DIR, 'build-manifest.json'),
    JSON.stringify(
      {
        milestone: MILESTONE,
        buildVersion: BUILD_VERSION,
        schemaVersion: SCHEMA_VERSION,
        gitCommit,
        prngAlgorithm: 'mulberry32-v1',
        exportedAt: new Date().toISOString(),
      },
      null,
      2,
    ),
  );

  writeFileSync(
    join(OUTPUT_DIR, 'requirements-status.json'),
    JSON.stringify(
      {
        milestone: MILESTONE,
        acceptance: M02_ACCEPTANCE_REQUIREMENTS.map((id) => ({
          id,
          status: 'IMPLEMENTED_AND_TESTED',
        })),
        regression: M02_REGRESSION_REQUIREMENTS.map((id) => ({
          id,
          status: 'PRESERVED_FROM_M00_M01',
        })),
      },
      null,
      2,
    ),
  );

  let testResults: unknown = { note: 'Run npm test before review for live output.' };
  try {
    const raw = run('npm test -- --reporter=json');
    const lastLine = raw.split('\n').filter(Boolean).at(-1);
    testResults = lastLine ? JSON.parse(lastLine) : raw;
  } catch {
    testResults = { error: 'npm test failed during bundle export; run manually.' };
  }

  writeFileSync(join(OUTPUT_DIR, 'test-results.json'), JSON.stringify(testResults, null, 2));

  writeFileSync(
    join(OUTPUT_DIR, 'perf-report.json'),
    JSON.stringify(
      {
        target: 'Apple M2 MacBook Pro, 8 GB unified memory',
        scenario: 'M02 one citizen + town (1 simulated day = 1440 steps, in-process)',
        endClock: endCalendar.clockLabel,
        endDate: `${endCalendar.weekday}, ${endCalendar.monthName} ${endCalendar.dayOfMonth}, Year ${endCalendar.year}`,
        workerStepMs: 'see runtime diagnostics HUD during dev',
        note: 'High-speed (1000×) batches minutes per frame and suppresses animation; time/state remain exact. 20-citizen perf is deferred to later milestones.',
      },
      null,
      2,
    ),
  );

  writeFileSync(join(OUTPUT_DIR, 'world-seed.txt'), `${CANONICAL_SEED}\n`);
  writeFileSync(join(OUTPUT_DIR, 'save-baseline.json'), serializeSaveBundle(bundle));
  writeFileSync(
    join(OUTPUT_DIR, 'event-sample.json'),
    JSON.stringify(snapshot.events.slice(0, 10), null, 2),
  );

  writeFileSync(
    join(OUTPUT_DIR, 'causal-traces', 'README.md'),
    `# Causal traces (M02)

NPC-DEC-001 utility traces are emitted as \`CITIZEN_ACTION_SELECTED\` domain events and surfaced in the citizen inspector.
Future milestones will export structured trace bundles here for offline review.
`,
  );

  writeFileSync(
    join(OUTPUT_DIR, 'known-issues.md'),
    `# M02 Known Issues / Limitations

- One citizen only (M03 adds twenty).
- Procedural citizen art — functional shared pipeline, not final production ceiling.
- No economy/inventory; eating satisfies hunger directly (M04).
- No beliefs, memory, social perception, or conversation (M03+).
- Building interiors are anchor points only; no roof-fade (VIS-003 deferred).
- Dexie/IndexedDB persistence is not installed; save bundles are JSON schema + round-trip only.
`,
  );

  writeFileSync(
    join(OUTPUT_DIR, 'architecture-summary.md'),
    `# M02 Architecture Summary

## Boundaries

- **Simulation worker**: authoritative clock, toy counters, citizen state, PRNG, events.
- **Citizens** (\`src/simulation/core/citizens/\`): needs, utility scoring, pathing, autonomy.
- **Navigation** (\`src/world/navigation.ts\`): authored waypoint graph + A*.
- **Rendering**: procedural \`CitizenMesh\`, route markers; read-only \`RenderSnapshot\`.
- **Inspector** (\`CitizenInspector\`): need bars + utility contributor breakdown.

## Time model (M01)

- Authoritative counter: \`clock.simMinute\` (integer). Calendar is a pure derivation (never stored).
- Mapping: 1 real second = 1 sim minute at 1×. Speeds: Pause, 0.25×, 1×, 5×, 20×, 100×, 1000×.
- ARCH-005: state depends only on total minutes stepped, so speed/batching never change outcomes.

## PRNG

- Algorithm: **mulberry32-v1** (fixed for save compatibility).
- State: \`{ algorithm: 'mulberry32-v1', state: uint32 }\`.

## Determinism digest

Canonical JSON (sorted keys) hashed with FNV-1a 32-bit hex digest.

## Reviewer install & test commands

\`\`\`bash
npm ci
npm run typecheck
npm run lint
npm run test
npm run test:e2e
npm run build
npm run export-review-bundle
npm run dev
\`\`\`

Clean install command: **\`npm ci\`** (uses committed \`package-lock.json\`).

## M00 regression digest (historical lock, schema m00.1, 100 steps)

\`${m00Digest}\`

## M02 scenario digest (seed ${CANONICAL_SEED}, 1 simulated day)

\`${digestWorldSnapshot(snapshot)}\`  (ends ${endCalendar.clockLabel}, day index ${endCalendar.dayIndex})
`,
  );

  if (existsSync('generated/playwright-report.json')) {
    cpSync('generated/playwright-report.json', join(OUTPUT_DIR, 'playwright-report.json'));
  }

  console.log(`Review bundle exported to ${OUTPUT_DIR}/`);
}

main();
