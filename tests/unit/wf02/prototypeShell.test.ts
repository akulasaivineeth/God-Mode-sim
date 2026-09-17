import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { getFacilityPoint } from '@/world/facilityPoints';
import {
  WORLD_LAB_MODULAR_PROTOTYPE,
  WORLD_LAB_PROTOTYPE_SHELL,
} from '@/world/worldLabModularMode';
import { R13_PROTOTYPE_SHELLS } from '@/rendering/prototypeShell/prototypeShellRegistry';
import {
  resolvePrototypeShellAabb,
  resolveShellDoorWorldPosition,
} from '@/rendering/prototypeShell/prototypeShellBounds';
import {
  isBuildingSuppressedByShell,
  isPrototypeShellActive,
} from '@/rendering/prototypeShell/prototypeShellMode';
import { isModularPrototypeActive } from '@/rendering/modular/modularMode';
import { assertFacilityPortalOutsideBuilding } from '@/rendering/streetPortalCamera';
import { CANONICAL_TOWN } from '@/world/townLayout';

function hashFile(filePath: string): string {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex');
}

describe('WF02 R14 prototype shell rollout', () => {
  it('registers exactly four finished-architecture shells', () => {
    expect(R13_PROTOTYPE_SHELLS).toHaveLength(4);
  });

  it('shell mode takes precedence over modular when both flags true', () => {
    expect(WORLD_LAB_PROTOTYPE_SHELL).toBe(true);
    expect(WORLD_LAB_MODULAR_PROTOTYPE).toBe(true);
    expect(isPrototypeShellActive()).toBe(true);
    expect(isModularPrototypeActive()).toBe(false);
  });

  it('civic shell replaces community-hall prefab presentation', () => {
    const civic = R13_PROTOTYPE_SHELLS.find((s) => s.shellId === 'civic-enclosure-shell')!;
    expect(civic.replacesBuildingIds).toContain('community-hall');
    expect(isBuildingSuppressedByShell('community-hall')).toBe(true);
    expect(isBuildingSuppressedByShell('clinic')).toBe(false);
  });

  it('shell origins align to hero neighborhood building centers', () => {
    const byId = (id: string) => CANONICAL_TOWN.buildings.find((b) => b.id === id)!;
    const civic = R13_PROTOTYPE_SHELLS.find((s) => s.shellId === 'civic-enclosure-shell')!;
    const hall = byId('community-hall');
    expect(civic.origin.x).toBe(hall.position.x);
    expect(civic.origin.z).toBe(hall.position.z);

    const cottage = R13_PROTOTYPE_SHELLS.find((s) => s.shellId === 'residential-cottage-shell')!;
    const home = byId('house-1');
    expect(cottage.origin.x).toBe(home.position.x);
    expect(cottage.origin.z).toBe(home.position.z);

    const gable = R13_PROTOTYPE_SHELLS.find((s) => s.shellId === 'residential-gable-shell')!;
    const house2 = byId('house-2');
    expect(gable.origin.x).toBe(house2.position.x);
    expect(gable.origin.z).toBe(house2.position.z);
  });

  it('door bindings stay within 0.3 m of frozen sim entrances', () => {
    const commercial = R13_PROTOTYPE_SHELLS.find(
      (s) => s.shellId === 'commercial-frontage-shell',
    )!;
    const storeDoor = resolveShellDoorWorldPosition(commercial, 'store-door')!;
    const workDoor = resolveShellDoorWorldPosition(commercial, 'workshop-door')!;
    const storeEntrance = getFacilityPoint('store').entrance;
    const workEntrance = getFacilityPoint('workshop').entrance;
    expect(Math.hypot(storeDoor.x - storeEntrance.x, storeDoor.z - storeEntrance.z)).toBeLessThan(
      0.31,
    );
    expect(Math.hypot(workDoor.x - workEntrance.x, workDoor.z - workEntrance.z)).toBeLessThan(
      0.31,
    );

    const cottage = R13_PROTOTYPE_SHELLS.find(
      (s) => s.shellId === 'residential-cottage-shell',
    )!;
    const homeDoor = resolveShellDoorWorldPosition(cottage, 'home-door')!;
    const homeEntrance = getFacilityPoint('house-1').entrance;
    expect(
      Math.hypot(homeDoor.x - homeEntrance.x, homeDoor.z - homeEntrance.z),
    ).toBeLessThan(0.31);
  });

  it('commercial shell envelope matches planned width', () => {
    const commercial = R13_PROTOTYPE_SHELLS.find(
      (s) => s.shellId === 'commercial-frontage-shell',
    )!;
    expect(commercial.targetWidth).toBe(34);
    const aabb = resolvePrototypeShellAabb(commercial);
    expect(aabb.maxX - aabb.minX).toBeGreaterThan(30);
  });

  it('residential shells have distinct height envelopes', () => {
    const cottage = R13_PROTOTYPE_SHELLS.find(
      (s) => s.shellId === 'residential-cottage-shell',
    )!;
    const gable = R13_PROTOTYPE_SHELLS.find((s) => s.shellId === 'residential-gable-shell')!;
    const cottageAabb = resolvePrototypeShellAabb(cottage);
    const gableAabb = resolvePrototypeShellAabb(gable);
    expect(gableAabb.maxY - gableAabb.minY).toBeGreaterThan(cottageAabb.maxY - cottageAabb.minY);
  });

  it('street portal presets stay outside shell presentation bounds', () => {
    if (!isPrototypeShellActive()) return;
    expect(assertFacilityPortalOutsideBuilding('store-street').ok).toBe(true);
    expect(assertFacilityPortalOutsideBuilding('workshop-street').ok).toBe(true);
    expect(assertFacilityPortalOutsideBuilding('home-street').ok).toBe(true);
  });
});

describe('WF02 evidence integrity', () => {
  it('r13 manifest sha256 matches committed Docs PNG bytes when manifest exists', () => {
    const manifestPath = 'Docs/milestones/WF02/r13_prototype_manifest.json';
    if (!existsSync(manifestPath)) return;
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
      shots?: Array<{ name: string; sha256: string; file?: string }>;
      silhouettes?: Array<{ name: string; sha256: string; file?: string }>;
    };
    const entries = [...(manifest.shots ?? []), ...(manifest.silhouettes ?? [])];
    for (const entry of entries) {
      const pngPath = path.join('Docs/milestones/WF02', `${entry.name}.png`);
      if (!existsSync(pngPath)) continue;
      expect(hashFile(pngPath)).toBe(entry.sha256);
      if (entry.file) expect(entry.file.startsWith('Docs/')).toBe(true);
    }
  });

  it('r14 manifest sha256 matches committed Docs PNG bytes when manifest exists', () => {
    const manifestPath = 'Docs/milestones/WF02/r14_rollout_manifest.json';
    if (!existsSync(manifestPath)) return;
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
      shots?: Array<{ name: string; sha256: string; file?: string }>;
      silhouettes?: Array<{ name: string; sha256: string; file?: string }>;
    };
    const entries = [...(manifest.shots ?? []), ...(manifest.silhouettes ?? [])];
    for (const entry of entries) {
      const pngPath = path.join('Docs/milestones/WF02', `${entry.name}.png`);
      if (!existsSync(pngPath)) continue;
      expect(hashFile(pngPath)).toBe(entry.sha256);
      if (entry.file) expect(entry.file.startsWith('Docs/')).toBe(true);
    }
  });
});
