import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { isHeroScenePhase0ProofActive } from '@/rendering/heroScene/heroNeighborhoodSceneProofMode';
import manifest from '@/rendering/heroScene/heroNeighborhoodSceneManifest.json';
import {
  assertHeroSceneDoorDeltasWithinTolerance,
  heroSceneMeshBudgetPass,
} from '@/rendering/heroScene/heroSceneDoorValidation';
import { getFacilityPoint } from '@/world/facilityPoints';

describe('WF02 R15.4 Strategy A hero-scene Phase 0 proof', () => {
  it('proof mode is inactive without URL param', () => {
    expect(isHeroScenePhase0ProofActive()).toBe(false);
  });

  it('registers scene proof manifest for disposable Phase 0', () => {
    expect(manifest.authorization).toBe('STRATEGY_A_PHASE0_ONLY');
    expect(manifest.integrationMode).toBe('A-offline-authored-hero-neighborhood-scene');
    expect(manifest.cameraPolicy).toContain('frozen');
    expect(manifest.suppressLayers).toContain('PrototypeShellLayer');
    expect(manifest.doorSockets.length).toBe(3);
  });

  it('keeps hero-scene mesh count within hard stop', () => {
    const budget = heroSceneMeshBudgetPass();
    expect(budget.pass).toBe(true);
    expect(budget.meshCount).toBeLessThanOrEqual(budget.hardStop);
  });

  it('keeps M02 door sockets within 0.3 m of frozen entrances', () => {
    const records = assertHeroSceneDoorDeltasWithinTolerance(0.3);
    expect(records.length).toBe(3);
    for (const record of records) {
      expect(record.pass).toBe(true);
      expect(record.deltaM).toBeLessThan(0.01);
    }
  });

  it('maps door sockets to frozen facility entrances', () => {
    for (const socket of manifest.doorSockets) {
      const frozen = getFacilityPoint(socket.facilityId).entrance;
      const worldX = manifest.anchor.x + socket.localX;
      const worldZ = manifest.anchor.z + socket.localZ;
      expect(worldX).toBeCloseTo(frozen.x, 1);
      expect(worldZ).toBeCloseTo(frozen.z, 1);
    }
  });

  it('authored recipe artifact is present after import', () => {
    const recipePath = 'Docs/milestones/WF02/r15_hero_neighborhood_scene_recipe.json';
    expect(existsSync(recipePath)).toBe(true);
    const recipe = JSON.parse(readFileSync(recipePath, 'utf8'));
    expect(recipe.planRevision).toBe('15.4');
    expect(recipe.partCount).toBeGreaterThanOrEqual(80);
    expect(recipe.doorSockets.length).toBe(3);
  });

  it('hero scene GLB exists at registered asset URL', () => {
    const glbPath = `public${manifest.assetUrl}`;
    expect(existsSync(glbPath)).toBe(true);
  });
});
