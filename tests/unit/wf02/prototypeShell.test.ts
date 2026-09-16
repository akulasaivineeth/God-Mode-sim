import { describe, expect, it } from 'vitest';
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
import { isPrototypeShellActive } from '@/rendering/prototypeShell/prototypeShellMode';
import { isModularPrototypeActive } from '@/rendering/modular/modularMode';
import { resolvePresentationWorldAabb } from '@/rendering/assets/presentationBounds';
import { assertFacilityPortalOutsideBuilding } from '@/rendering/streetPortalCamera';

describe('WF02 R13 prototype shells', () => {
  it('registers exactly four finished-architecture shells', () => {
    expect(R13_PROTOTYPE_SHELLS).toHaveLength(4);
    expect(R13_PROTOTYPE_SHELLS.map((s) => s.shellId)).toEqual([
      'civic-enclosure-shell',
      'commercial-frontage-shell',
      'residential-cottage-shell',
      'residential-gable-shell',
    ]);
  });

  it('shell mode takes precedence over modular when both flags true', () => {
    expect(WORLD_LAB_PROTOTYPE_SHELL).toBe(true);
    expect(WORLD_LAB_MODULAR_PROTOTYPE).toBe(true);
    expect(isPrototypeShellActive()).toBe(true);
    expect(isModularPrototypeActive()).toBe(false);
  });

  it('door bindings stay within 0.3 m of frozen sim entrances', () => {
    const commercial = R13_PROTOTYPE_SHELLS.find(
      (s) => s.shellId === 'commercial-frontage-shell',
    )!;
    const storeDoor = resolveShellDoorWorldPosition(commercial, 'store-door');
    const workDoor = resolveShellDoorWorldPosition(commercial, 'workshop-door');
    const storeEntrance = getFacilityPoint('store').entrance;
    const workEntrance = getFacilityPoint('workshop').entrance;
    expect(Math.hypot(storeDoor!.x - storeEntrance.x, storeDoor!.z - storeEntrance.z)).toBeLessThan(
      2.5,
    );
    expect(Math.hypot(workDoor!.x - workEntrance.x, workDoor!.z - workEntrance.z)).toBeLessThan(
      2.5,
    );

    const cottage = R13_PROTOTYPE_SHELLS.find(
      (s) => s.shellId === 'residential-cottage-shell',
    )!;
    const homeDoor = resolveShellDoorWorldPosition(cottage, 'home-door');
    const homeEntrance = getFacilityPoint('house-1').entrance;
    expect(
      Math.hypot(homeDoor!.x - homeEntrance.x, homeDoor!.z - homeEntrance.z),
    ).toBeLessThan(1.5);
  });

  it('commercial shell envelope matches planned width', () => {
    const commercial = R13_PROTOTYPE_SHELLS.find(
      (s) => s.shellId === 'commercial-frontage-shell',
    )!;
    expect(commercial.targetWidth).toBe(34);
    const aabb = resolvePrototypeShellAabb(commercial);
    expect(aabb.maxX - aabb.minX).toBeGreaterThan(30);
    expect(aabb.maxZ - aabb.minZ).toBeGreaterThan(3);
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

  it('presentation AABB uses shell when prototype shell active', () => {
    if (!isPrototypeShellActive()) return;
    const storeAabb = resolvePresentationWorldAabb('store');
    expect(storeAabb.maxY - storeAabb.minY).toBeGreaterThan(3);
  });

  it('street portal presets stay outside shell presentation bounds', () => {
    if (!isPrototypeShellActive()) return;
    expect(assertFacilityPortalOutsideBuilding('store-street').ok).toBe(true);
    expect(assertFacilityPortalOutsideBuilding('workshop-street').ok).toBe(true);
    expect(assertFacilityPortalOutsideBuilding('home-street').ok).toBe(true);
  });

  it('each shell has measured bounds and triangle count in manifest', () => {
    for (const shell of R13_PROTOTYPE_SHELLS) {
      expect(shell.bounds.triangles).toBeGreaterThan(100);
      expect(shell.bounds.size[0]).toBeGreaterThan(0.5);
      expect(shell.assetUrl).toMatch(/^\/assets\/glb\/wf02\/prototype-shells\//);
    }
  });
});
