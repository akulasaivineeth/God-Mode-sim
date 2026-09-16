/**
 * WF02 Plan R10 Phase A — hero neighborhood vocabulary audit.
 *
 * Usage: npm run audit:wf02-r10-vocabulary
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST = JSON.parse(
  readFileSync(path.join(ROOT, 'src/rendering/assets/modelLayoutManifest.json'), 'utf8'),
);
const PREFAB_SRC = readFileSync(
  path.join(ROOT, 'src/rendering/assets/buildings/buildingPrefabConfig.ts'),
  'utf8',
);

const HERO_IDS = [
  'community-hall',
  'clinic',
  'house-1',
  'house-2',
  'store',
  'workshop',
  'cafe',
];

function extractHeroPrefabs() {
  const blocks = [...PREFAB_SRC.matchAll(/buildingId:\s*'([^']+)'[\s\S]*?assetUrl:\s*KENNEY_ASSETS\.(\w+)[\s\S]*?targetWidth:\s*([\d.]+)/g)];
  return blocks
    .filter((m) => HERO_IDS.includes(m[1]))
    .map((m) => ({ buildingId: m[1], assetKey: m[2], targetWidth: Number(m[3]) }));
}

function assetUrlFromRegistry(key) {
  const src = readFileSync(path.join(ROOT, 'src/rendering/assets/EnvironmentAssetRegistry.ts'), 'utf8');
  const re = new RegExp(`${key}:\\s*'([^']+)'`);
  const m = src.match(re);
  return m?.[1] ?? null;
}

const prefabs = extractHeroPrefabs();
const buildings = prefabs.map((p) => {
  const url = assetUrlFromRegistry(p.assetKey);
  const bounds = url ? MANIFEST[url] : null;
  return {
    buildingId: p.buildingId,
    assetUrl: url,
    targetWidth: p.targetWidth,
    intrinsicSize: bounds?.size ?? null,
    triangleEstimate: bounds ? Math.round((bounds.size[0] * bounds.size[1] * bounds.size[2]) / 4) : null,
  };
});

const northStarGaps = [
  {
    requirement: 'civic_plaza_enclosure',
    kenneyOnly: 'partial',
    gap: 'No portico/colonnade meshes — fence/path assembly required',
  },
  {
    requirement: 'commercial_frontage_continuity',
    kenneyOnly: 'partial',
    gap: 'Disconnected GLBs — awning/path cadence + ground band required',
  },
  {
    requirement: 'residential_silhouette_variation',
    kenneyOnly: 'partial',
    gap: 'Similar suburban types — targetWidth/staging + garden depth required',
  },
  {
    requirement: 'vertical_layering',
    kenneyOnly: 'fail',
    gap: 'Single-story colormap meshes — modular family may be needed if Phase C fails',
  },
  {
    requirement: 'street_human_scale_proof',
    kenneyOnly: 'n/a',
    gap: 'Camera portal system required (Phase B)',
  },
];

const verdict = {
  kenneySufficientForNearTermMilestone: 'conditional',
  rationale:
    'Registered Kenney assets can support R10 Phase C assembly pass for residential/gardens and partial civic/commercial reads. Civic enclosure + commercial continuity likely need deliberate multi-part staging; if Phase C compare strip fails, propose one CC0 modular exterior family (Phase D — not authorized in this build).',
  phaseDRequiredIfPhaseCFails: true,
  proposedFamilyCandidate: 'KayKit City Builder Bits OR Kenney Modular Town (CC0 audit at Phase C STOP)',
};

const out = {
  generatedAt: new Date().toISOString(),
  planRevision: 10,
  scope: 'PHASE_A_B_C_EXISTING_REGISTERED_ASSETS',
  heroBuildingCount: buildings.length,
  buildings,
  northStarGaps,
  verdict,
};

const outPath = path.join(ROOT, 'Docs/milestones/WF02/r10_vocabulary_audit.json');
writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log(`Wrote ${outPath}`);
console.log(JSON.stringify(verdict, null, 2));
