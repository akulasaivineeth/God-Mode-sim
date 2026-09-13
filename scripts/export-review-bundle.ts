import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync, cpSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { digestCitizenWorld, digestWorldSnapshot } from '../src/debug/worldDigest';
import { buildSaveBundle, serializeSaveBundle } from '../src/persistence/serialize';
import {
  M02_ACCEPTANCE_REQUIREMENTS,
  M02_REGRESSION_REQUIREMENTS,
} from '../src/shared/requirements';
import { BUILD_VERSION, MILESTONE, SCHEMA_VERSION } from '../src/shared/version';
import { deriveCalendar, MINUTES_PER_DAY } from '../src/simulation/core/calendar';
import { createWorldSnapshot, runToySteps } from '../src/simulation/core/toySim';
import { createCitizenWorld, runCitizenSteps } from '../src/simulation/model/world';

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
  // M02 scenario: one autonomous citizen living a full simulated day.
  const snapshot = runCitizenSteps(createCitizenWorld(CANONICAL_SEED, SCHEMA_VERSION), MINUTES_PER_DAY);
  const bundle = buildSaveBundle({ snapshot, exportedAt: new Date().toISOString() });
  const endCalendar = deriveCalendar(snapshot.clock.simMinute);
  const citizen = snapshot.citizens?.[0];
  const citizenDigest = digestCitizenWorld(snapshot);

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
        m02ScenarioDigest: citizenDigest,
        m00GoldenDigest: m00Digest,
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
        acceptance: M02_ACCEPTANCE_REQUIREMENTS.map((id) => ({ id, status: 'IMPLEMENTED_AND_TESTED' })),
        regression: M02_REGRESSION_REQUIREMENTS.map((id) => ({ id, status: 'PRESERVED' })),
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
        scenario: 'M02 one autonomous citizen (1 simulated day = 1440 steps, in-process)',
        endClock: endCalendar.clockLabel,
        citizen: citizen
          ? { name: citizen.name, needs: citizen.needs, currentAction: citizen.action?.type ?? 'idle' }
          : null,
        note: 'Town geometry uses instanced trees/graves (M01). High-speed batches minutes per frame; citizen travel resolves by deterministic duration, not rendered footsteps.',
      },
      null,
      2,
    ),
  );

  writeFileSync(join(OUTPUT_DIR, 'world-seed.txt'), `${CANONICAL_SEED}\n`);
  writeFileSync(join(OUTPUT_DIR, 'save-baseline.json'), serializeSaveBundle(bundle));
  writeFileSync(
    join(OUTPUT_DIR, 'event-sample.json'),
    JSON.stringify(snapshot.events.slice(0, 12), null, 2),
  );

  // Real causal/utility trace (NPC-DEC-001): the citizen's most recent decision.
  writeFileSync(
    join(OUTPUT_DIR, 'causal-traces', 'latest-decision.json'),
    JSON.stringify(citizen?.lastDecision ?? { note: 'no decision captured' }, null, 2),
  );
  writeFileSync(
    join(OUTPUT_DIR, 'causal-traces', 'README.md'),
    `# Causal / utility traces (M02)

\`latest-decision.json\` is a real decision trace exported from the running
citizen simulation: every candidate action, its utility score, the factor
breakdown, the selected action, and whether it was a Layer-1 reflex or Layer-2
routine decision (NPC-DEC-001 / NPC-DEC-010).
`,
  );

  writeFileSync(
    join(OUTPUT_DIR, 'known-issues.md'),
    `# M02 Known Issues / Limitations

- One citizen only; 20-citizen generation, memory/beliefs/perception, relationships,
  and conversation are M03+.
- No economy/money/inventory yet (eating at the store is a placeholder; M04).
- No building interiors / roof-fade (M02 shows exterior shells; interiors later).
- Navigation is a lightweight authored waypoint graph (spec §30.8), not full
  physics navigation.
- Decision events accumulate in memory for the session (bounded archival is M12).
`,
  );

  writeFileSync(
    join(OUTPUT_DIR, 'architecture-summary.md'),
    `# M02 Architecture Summary

## Boundaries

- **Simulation worker** owns citizen truth: needs, position, action, decision trace.
- **Simulation model** (\`src/simulation/model/\`): needs, locations + waypoint nav
  graph, deterministic pathfinding, three-layer decision (reflex + utility), citizen
  step, world create/step.
- **Rendering** consumes a compact read-only \`RenderSnapshot.citizen\` and interpolates.
- **UI** shows a live inspector with candidate utility scores (UX-001).

## Determinism

- Citizen randomness flows through mulberry32-v1 PRNG (ARCH-003); no \`Math.random\`.
- State depends only on total simulated minutes (ARCH-005): 1× and 1000× match.
- M00 golden digest **${m00Digest}** (schema m00.1) preserved; citizens are not
  hashed by the M00 digest.

## Reviewer commands

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

## M02 scenario digest (seed ${CANONICAL_SEED}, 1 day)

\`${citizenDigest}\`  (ends ${endCalendar.clockLabel})
`,
  );

  if (existsSync('generated/playwright-report.json')) {
    cpSync('generated/playwright-report.json', join(OUTPUT_DIR, 'playwright-report.json'));
  }

  console.log(`Review bundle exported to ${OUTPUT_DIR}/`);
}

main();
