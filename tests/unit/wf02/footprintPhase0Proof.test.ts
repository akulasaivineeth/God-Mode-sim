import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { isFootprintPhase0ProofActive } from '@/rendering/footprintProof/footprintPhase0ProofMode';
import proofManifest from '@/rendering/footprintProof/footprintPhase0ProofManifest.json';
import {
  assertFootprintDoorDeltasWithinTolerance,
  buildFootprintBeforeAfterTable,
  PRESENTATION_FOOTPRINT_REVISION,
  resolveFootprintShells,
  SHELL_FOOTPRINT_OFFSETS,
  validateFootprintWithinHeroBounds,
} from '@/world/worldLab/presentationFootprintSpec';
import { getFacilityPoint } from '@/world/facilityPoints';
import { resolveFootprintDoorWorldPosition } from '@/world/worldLab/presentationFootprintSpec';

describe('WF02 R15.3.1 Candidate E footprint Phase 0 proof', () => {
  it('proof mode is inactive without URL param', () => {
    expect(isFootprintPhase0ProofActive()).toBe(false);
  });

  it('registers footprint proof manifest for disposable Phase 0', () => {
    expect(proofManifest.authorization).toBe('CANDIDATE_E_PHASE0_ONLY');
    expect(proofManifest.integrationMode).toBe('E-presentation-footprint-recomposition');
    expect(proofManifest.cameraPolicy).toContain('frozen');
    expect(proofManifest.multiPartRubric.length).toBeGreaterThanOrEqual(9);
  });

  it('defines single presentation footprint authority with shell offsets', () => {
    expect(PRESENTATION_FOOTPRINT_REVISION).toBe('15.3.1');
    expect(SHELL_FOOTPRINT_OFFSETS.length).toBe(4);
    const beforeAfter = buildFootprintBeforeAfterTable();
    expect(beforeAfter.length).toBe(4);
    for (const row of beforeAfter) {
      const moved =
        row.afterOrigin.x !== row.beforeOrigin.x || row.afterOrigin.z !== row.beforeOrigin.z;
      expect(moved).toBe(true);
    }
  });

  it('keeps M02 door bindings within 0.3 m after footprint offsets', () => {
    const records = assertFootprintDoorDeltasWithinTolerance(0.3);
    expect(records.length).toBe(3);
    for (const record of records) {
      expect(record.deltaM).toBeLessThan(0.01);
    }
  });

  it('preserves frozen sim entrance alignment for bound hero doors', () => {
    const shells = resolveFootprintShells();
    const commercial = shells.find((s) => s.shellId === 'commercial-frontage-shell')!;
    const cottage = shells.find((s) => s.shellId === 'residential-cottage-shell')!;
    const storeDoor = resolveFootprintDoorWorldPosition(commercial, 'store-door')!;
    const workDoor = resolveFootprintDoorWorldPosition(commercial, 'workshop-door')!;
    const homeDoor = resolveFootprintDoorWorldPosition(cottage, 'home-door')!;
    expect(storeDoor.x).toBeCloseTo(getFacilityPoint('store').entrance.x, 1);
    expect(storeDoor.z).toBeCloseTo(getFacilityPoint('store').entrance.z, 1);
    expect(workDoor.x).toBeCloseTo(getFacilityPoint('workshop').entrance.x, 1);
    expect(workDoor.z).toBeCloseTo(getFacilityPoint('workshop').entrance.z, 1);
    expect(homeDoor.x).toBeCloseTo(getFacilityPoint('house-1').entrance.x, 1);
    expect(homeDoor.z).toBeCloseTo(getFacilityPoint('house-1').entrance.z, 1);
  });

  it('keeps all footprint shells and massing within hero bounds', () => {
    const bounds = validateFootprintWithinHeroBounds();
    expect(bounds.pass).toBe(true);
    expect(bounds.violations).toHaveLength(0);
  });

  it('feasibility audit artifact schema is present after audit run', () => {
    const auditPath = 'Docs/milestones/WF02/r15_footprint_feasibility_audit.json';
    if (!existsSync(auditPath)) return;
    const audit = JSON.parse(readFileSync(auditPath, 'utf8'));
    expect(audit.planRevision).toBe('15.3.1');
    expect(audit.doorDeltaPass).toBe(true);
  });
});
