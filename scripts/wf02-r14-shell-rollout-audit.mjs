/**
 * WF02 R14 — hero neighborhood shell rollout audit.
 *
 * Validates shell anchors, replacement semantics, and door binding deltas.
 */
import { readFileSync } from 'node:fs';

const manifest = JSON.parse(
  readFileSync('src/rendering/prototypeShell/prototypeShellManifest.json', 'utf8'),
);

const HERO_BUILDINGS = {
  'community-hall': { x: -14, z: -18 },
  store: { x: -14, z: 14 },
  workshop: { x: 4, z: 14 },
  cafe: { x: 16, z: 14 },
  'house-1': { x: 16, z: -4 },
  'house-2': { x: -16, z: -4 },
};

const ENTRANCES = {
  store: { x: -14, z: 10.8 },
  workshop: { x: 4, z: 10.8 },
  'house-1': { x: 16, z: -6.4 },
};

const errors = [];

function findShell(id) {
  return manifest.find((s) => s.shellId === id);
}

function doorWorld(shell, label) {
  const binding = shell.doorBindings.find((d) => d.label === label);
  if (!binding) return null;
  return { x: shell.origin.x + binding.localX, z: shell.origin.z + binding.localZ };
}

const civic = findShell('civic-enclosure-shell');
if (!civic.replacesBuildingIds.includes('community-hall')) {
  errors.push('civic shell must replace community-hall');
}
if (Math.hypot(civic.origin.x - HERO_BUILDINGS['community-hall'].x, civic.origin.z - HERO_BUILDINGS['community-hall'].z) > 0.5) {
  errors.push(`civic origin misaligned: (${civic.origin.x},${civic.origin.z})`);
}

const commercial = findShell('commercial-frontage-shell');
for (const id of ['store', 'workshop', 'cafe']) {
  if (!commercial.replacesBuildingIds.includes(id)) {
    errors.push(`commercial shell must replace ${id}`);
  }
}
for (const [id, entrance] of Object.entries({ store: ENTRANCES.store, workshop: ENTRANCES.workshop })) {
  const label = id === 'store' ? 'store-door' : 'workshop-door';
  const door = doorWorld(commercial, label);
  const delta = Math.hypot(door.x - entrance.x, door.z - entrance.z);
  if (delta > 0.31) errors.push(`${label} delta ${delta.toFixed(3)}m > 0.3m`);
}

const cottage = findShell('residential-cottage-shell');
const homeDoor = doorWorld(cottage, 'home-door');
const homeDelta = Math.hypot(homeDoor.x - ENTRANCES['house-1'].x, homeDoor.z - ENTRANCES['house-1'].z);
if (homeDelta > 0.31) errors.push(`home-door delta ${homeDelta.toFixed(3)}m > 0.3m`);
if (Math.hypot(cottage.origin.x - HERO_BUILDINGS['house-1'].x, cottage.origin.z - HERO_BUILDINGS['house-1'].z) > 0.5) {
  errors.push('cottage origin misaligned');
}

const gable = findShell('residential-gable-shell');
if (Math.hypot(gable.origin.x - HERO_BUILDINGS['house-2'].x, gable.origin.z - HERO_BUILDINGS['house-2'].z) > 0.5) {
  errors.push('gable origin misaligned');
}

if (errors.length > 0) {
  console.error('R14 shell rollout audit FAIL:');
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log('R14 shell rollout audit PASS');
console.log(JSON.stringify({ shellCount: manifest.length, civicReplaces: civic.replacesBuildingIds }, null, 2));
