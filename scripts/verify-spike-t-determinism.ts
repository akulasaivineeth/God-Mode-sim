import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { canonicalize } from '../src/debug/canonicalize';
import { runSpikeT, SPIKE_T_CANONICAL_SEED } from '../src/spikes/arch01-t/runSpikeT';

const FIXTURE_PATH = join('tests/spikes/fixtures/spike-t-canonical-2026.json');

const runs = [runSpikeT(SPIKE_T_CANONICAL_SEED), runSpikeT(SPIKE_T_CANONICAL_SEED), runSpikeT(SPIKE_T_CANONICAL_SEED)];

if (runs[0].normalized !== runs[1].normalized || runs[1].normalized !== runs[2].normalized) {
  console.error('P1 FAIL: normalized output diverged across 3 runs');
  process.exit(1);
}

if (runs[0].eventSequence.map((event) => event.id).join(',') !== runs[1].eventSequence.map((event) => event.id).join(',')) {
  console.error('P2 FAIL: event id sequence diverged');
  process.exit(1);
}

if (canonicalize(runs[0].eventSequence) !== canonicalize(runs[1].eventSequence)) {
  console.error('P2 FAIL: event payloads diverged');
  process.exit(1);
}

const fixture = readFileSync(FIXTURE_PATH, 'utf8').trim();
if (runs[0].normalized !== fixture) {
  console.error('P1 FAIL: normalized output does not match golden fixture');
  process.exit(1);
}

console.log('ARCH01 Spike T determinism PASS (3 runs + golden fixture)');
