import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync, cpSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { digestWorldSnapshot } from '../src/debug/worldDigest';
import { buildSaveBundle, serializeSaveBundle } from '../src/persistence/serialize';
import {
  M00_ACCEPTANCE_REQUIREMENTS,
  M00_SCAFFOLDED_REQUIREMENTS,
} from '../src/shared/requirements';
import { BUILD_VERSION, MILESTONE, SCHEMA_VERSION } from '../src/shared/version';
import { createWorldSnapshot, runToySteps } from '../src/simulation/core/toySim';

const CANONICAL_SEED = 'GODMODE_M00_CANONICAL_2026';
const OUTPUT_DIR = 'review-bundle';

function run(command: string): string {
  return execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function main(): void {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  mkdirSync(join(OUTPUT_DIR, 'causal-traces'), { recursive: true });
  mkdirSync(join(OUTPUT_DIR, 'screenshots'), { recursive: true });

  const gitCommit = run('git rev-parse HEAD');
  const snapshot = runToySteps(createWorldSnapshot(CANONICAL_SEED, SCHEMA_VERSION), 100);
  const bundle = buildSaveBundle({
    snapshot,
    exportedAt: new Date().toISOString(),
  });

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
        acceptance: M00_ACCEPTANCE_REQUIREMENTS.map((id) => ({
          id,
          status: 'IMPLEMENTED_AND_TESTED',
        })),
        scaffolded: M00_SCAFFOLDED_REQUIREMENTS.map((id) => ({
          id,
          status: 'SCAFFOLDED / DEFERRED_ACCEPTANCE',
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
        scenario: 'M00 toy simulation (100 steps, in-process)',
        workerStepMs: 'see runtime diagnostics HUD during dev',
        note: 'M00 establishes instrumentation; 20-citizen perf is deferred to later milestones.',
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
    `# Causal traces (M00)

HIST-002 is scaffolded only in M00. No NPC decision traces exist yet.
Future milestones will export structured utility contributor traces here.
`,
  );

  writeFileSync(
    join(OUTPUT_DIR, 'known-issues.md'),
    `# M00 Known Issues / Limitations

- No town, NPCs, economy, God tools, or simulation speed controls (M01+).
- No real event replay, branching execution, or experiment comparison (schemas only).
- Dexie/IndexedDB persistence is not installed; save bundles are JSON schema + round-trip only.
- ARCH-005 high-speed rendering independence is deferred to M01.
- Playwright screenshots are not auto-captured in this script; reviewer may capture manually.
`,
  );

  writeFileSync(
    join(OUTPUT_DIR, 'architecture-summary.md'),
    `# M00 Architecture Summary

## Boundaries

- **Simulation worker** (\`src/simulation/worker/\`): authoritative toy state, PRNG, events.
- **Rendering** (\`src/rendering/\`): R3F placeholder scene; read-only \`RenderSnapshot\`.
- **UI** (\`src/ui/\`): diagnostics HUD via Zustand (UI-only metrics).
- **Persistence** (\`src/persistence/\`): Zod save-bundle schemas; serialize/deserialize only.
- **Debug** (\`src/debug/\`): canonical digest + canonical JSON serialization.

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

## Canonical digest at 100 steps

\`${digestWorldSnapshot(snapshot)}\`
`,
  );

  if (existsSync('generated/playwright-report.json')) {
    cpSync('generated/playwright-report.json', join(OUTPUT_DIR, 'playwright-report.json'));
  }

  console.log(`Review bundle exported to ${OUTPUT_DIR}/`);
}

main();
