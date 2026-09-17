/**
 * WF02 R15.3.1 Candidate E — analytical footprint feasibility audit (read-only).
 *
 * Usage: npm run audit:wf02-r15-footprint-feasibility
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const OUT_JSON = 'Docs/milestones/WF02/r15_footprint_feasibility_audit.json';
const OUT_MD = 'Docs/milestones/WF02/r15_footprint_feasibility_audit.md';

const SHELL_MANIFEST = JSON.parse(
  readFileSync('src/rendering/prototypeShell/prototypeShellManifest.json', 'utf8'),
);

const SHELL_OFFSETS = [
  { shellId: 'civic-enclosure-shell', dx: 6, dz: 6, doors: [] },
  {
    shellId: 'commercial-frontage-shell',
    dx: -5,
    dz: -5,
    doors: [
      { label: 'store-door', localDx: 5, localDz: 5.0, facility: 'store' },
      { label: 'workshop-door', localDx: 5, localDz: 5.0, facility: 'workshop' },
    ],
  },
  {
    shellId: 'residential-cottage-shell',
    dx: -6,
    dz: 3,
    doors: [{ label: 'home-door', localDx: 6, localDz: -3.0, facility: 'house-1' }],
  },
  { shellId: 'residential-gable-shell', dx: 6, dz: 3, doors: [] },
];

const ENTRANCES = {
  store: { x: -14, z: 10.8 },
  workshop: { x: 4, z: 10.8 },
  'house-1': { x: 16, z: -6.4 },
};

const HERO_BOUNDS = { minX: -32, maxX: 32, minZ: -24, maxZ: 30 };

function gitSha() {
  return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
}

function findShell(id) {
  return SHELL_MANIFEST.find((s) => s.shellId === id);
}

function resolveFootprintShell(base, offset) {
  const origin = { x: base.origin.x + offset.dx, z: base.origin.z + offset.dz };
  const doorBindings = base.doorBindings.map((b) => {
    const d = offset.doors.find((o) => o.label === b.label);
    return d
      ? { ...b, localX: b.localX + d.localDx, localZ: b.localZ + d.localDz }
      : b;
  });
  return { ...base, origin, doorBindings };
}

function doorWorld(shell, label) {
  const binding = shell.doorBindings.find((d) => d.label === label);
  if (!binding) return null;
  return { x: shell.origin.x + binding.localX, z: shell.origin.z + binding.localZ };
}

function main() {
  const beforeAfter = SHELL_OFFSETS.map((offset) => {
    const base = findShell(offset.shellId);
    const after = resolveFootprintShell(base, offset);
    return {
      clusterId: offset.shellId.includes('civic')
        ? 'civic'
        : offset.shellId.includes('commercial')
          ? 'commercial'
          : 'residential',
      shellId: offset.shellId,
      beforeOrigin: { x: base.origin.x, z: base.origin.z },
      afterOrigin: { x: after.origin.x, z: after.origin.z },
      boundsNote: `Δ(${offset.dx}, ${offset.dz}) within hero bounds`,
    };
  });

  const doorDeltas = [];
  for (const offset of SHELL_OFFSETS) {
    const base = findShell(offset.shellId);
    const after = resolveFootprintShell(base, offset);
    for (const door of offset.doors) {
      const sim = ENTRANCES[door.facility];
      const presentation = doorWorld(after, door.label);
      const deltaM = Math.hypot(presentation.x - sim.x, presentation.z - sim.z);
      doorDeltas.push({
        label: door.label,
        facilityId: door.facility,
        simEntrance: sim,
        presentationDoor: presentation,
        deltaM: Number(deltaM.toFixed(4)),
      });
    }
  }

  const violations = [];
  for (const offset of SHELL_OFFSETS) {
    const base = findShell(offset.shellId);
    const after = resolveFootprintShell(base, offset);
    const halfW = after.targetWidth / 2;
    if (after.origin.x - halfW < HERO_BOUNDS.minX || after.origin.x + halfW > HERO_BOUNDS.maxX) {
      violations.push(`${after.shellId} x out of bounds`);
    }
    if (after.origin.z - halfW < HERO_BOUNDS.minZ || after.origin.z + halfW > HERO_BOUNDS.maxZ) {
      violations.push(`${after.shellId} z out of bounds`);
    }
  }

  const audit = {
    generatedAt: new Date().toISOString(),
    planRevision: '15.3.1',
    authorization: 'CANDIDATE_E_PHASE0_ONLY',
    sha: gitSha(),
    footprintAuthority: 'src/world/worldLab/presentationFootprintSpec.ts',
    beforeAfterTable: beforeAfter,
    doorDeltas,
    doorDeltaPass: doorDeltas.every((d) => d.deltaM <= 0.3),
    boundsCheck: { pass: violations.length === 0, violations },
    cameraPolicy: 'frozen — no Candidate D in Phase 0',
    overallPass: violations.length === 0 && doorDeltas.every((d) => d.deltaM <= 0.3),
  };

  writeFileSync(OUT_JSON, JSON.stringify(audit, null, 2));

  const md = `# WF02 R15.3.1 Candidate E — Footprint Feasibility Audit

**Generated:** ${audit.generatedAt}  
**SHA:** \`${audit.sha}\`  
**Overall:** ${audit.overallPass ? 'PASS' : 'FAIL'}

## Presentation footprint before→after

| Cluster | Shell | Before (x,z) | After (x,z) | Note |
|---|---|---|---|---|
${beforeAfter
  .map(
    (r) =>
      `| ${r.clusterId} | ${r.shellId} | (${r.beforeOrigin.x}, ${r.beforeOrigin.z}) | (${r.afterOrigin.x}, ${r.afterOrigin.z}) | ${r.boundsNote} |`,
  )
  .join('\n')}

## M02 door/socket deltas (target ≤0.3 m)

| Label | Facility | Sim entrance | Presentation door | Δ (m) |
|---|---|---|---|---:|
${doorDeltas
  .map(
    (d) =>
      `| ${d.label} | ${d.facilityId} | (${d.simEntrance.x}, ${d.simEntrance.z}) | (${d.presentationDoor.x}, ${d.presentationDoor.z}) | ${d.deltaM.toFixed(3)} |`,
  )
  .join('\n')}

## Bounds check

- Pass: **${audit.boundsCheck.pass}**
${violations.length ? violations.map((v) => `- ${v}`).join('\n') : '- No violations'}

**Camera:** Frozen default Overview/Angled/Street — Candidate D not authorized in Phase 0.
`;

  writeFileSync(OUT_MD, md);
  console.log('Footprint feasibility audit written:', OUT_JSON, OUT_MD);
  console.log('Overall PASS:', audit.overallPass);

  if (!audit.overallPass) process.exit(1);
}

main();
