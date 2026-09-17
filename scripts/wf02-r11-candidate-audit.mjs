/**
 * WF02 R11 Phase 0 — modular candidate audit (PLAN artifact).
 *
 * PLAN ONLY: documents the build-time audit workflow. Does NOT download assets.
 * At APPROVED_TO_BUILD, extend this script to:
 *   1. Verify kenney_modular-buildings.zip checksum against ASSET_REGISTER
 *   2. Measure each curated module GLB (triangles, bounds, door socket)
 *   3. Emit Docs/milestones/WF02/r11_modular_audit.json
 *
 * Usage (after import authorized):
 *   npm run audit:wf02-r11-modular
 */
import { writeFile } from 'node:fs/promises';

const PLAN_AUDIT = {
  generatedAt: new Date().toISOString(),
  planRevision: 11,
  scope: 'PLAN_ONLY_NO_IMPORT',
  selectedFamily: 'Kenney Modular Buildings 2.1',
  rejectedFamily: 'KayKit City Builder Bits',
  selectionRationale:
    'Kenney Modular Buildings provides true wall/floor/roof/door/window modules for facade construction. KayKit City Builder Bits provides pre-assembled building_A–H prefabs — repeats R10 monolithic failure class.',
  candidates: [
    {
      id: 'kaykit-city-builder-bits',
      name: 'KayKit City Builder Bits v1.0',
      sourceUrl: 'https://kaylousberg.itch.io/city-builder-bits',
      license: 'CC0 1.0 Universal',
      formats: ['OBJ', 'FBX', 'GLTF'],
      modularityClass: 'pre-assembled buildings + roads/props',
      wallFloorRoofModules: false,
      verdict: 'reject',
    },
    {
      id: 'kenney-modular-buildings',
      name: 'Kenney Modular Buildings 2.1',
      sourceUrl: 'https://kenney.nl/assets/modular-buildings',
      license: 'CC0 1.0 Universal',
      formats: ['OBJ', 'FBX', 'GLTF', 'GLB'],
      modularityClass: 'wall/floor/roof/door/window construction kit',
      wallFloorRoofModules: true,
      estimatedModuleCount: '100+',
      verdict: 'select',
    },
  ],
  prototypeStructures: [
    { id: 'civic-enclosure-edge', footprintM: '28×3.5', heightM: 4.5 },
    { id: 'commercial-frontage-3bay', footprintM: '34×7', heightM: '4.5–5.5' },
    { id: 'residential-pair', footprintsM: '6×7 each', heightsM: '5.0 vs 7.0' },
  ],
  importBudget: {
    maxGlbFiles: 24,
    maxTriangleAdd: 15000,
    maxOverviewDcAdd: 12,
  },
  buildTimeAuditRequired: true,
  note: 'Run full GLB measurement after APPROVED_TO_BUILD and curated import only.',
};

await writeFile(
  'Docs/milestones/WF02/r11_candidate_audit_plan.json',
  `${JSON.stringify(PLAN_AUDIT, null, 2)}\n`,
);
console.log('Wrote Docs/milestones/WF02/r11_candidate_audit_plan.json (plan-only — no assets imported)');
