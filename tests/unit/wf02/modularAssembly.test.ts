import { describe, expect, it } from 'vitest';
import { getFacilityPoint } from '@/world/facilityPoints';
import { R11_MODULAR_ASSEMBLIES } from '@/rendering/modular/modularAssemblies';
import { resolveModularInstances } from '@/rendering/modular/modularLayout';
import {
  resolveModularAssemblyAabb,
  resolveModularDoorWorldPosition,
  resolveModularGridFootprint,
} from '@/rendering/modular/modularPresentationBounds';
import { getStoryHeight } from '@/rendering/modular/modularModuleRegistry';
import { isModularPrototypeActive } from '@/rendering/modular/modularMode';
import { resolvePresentationWorldAabb } from '@/rendering/assets/presentationBounds';
import { assertFacilityPortalOutsideBuilding } from '@/rendering/streetPortalCamera';

describe('WF02 R11 modular assembly', () => {
  it('uses measured story height from Kenney modular pack', () => {
    expect(getStoryHeight()).toBeCloseTo(0.625, 3);
  });

  it('resolves deterministic instance count for all assemblies', () => {
    const total = R11_MODULAR_ASSEMBLIES.reduce(
      (sum, spec) => sum + resolveModularInstances(spec).length,
      0,
    );
    expect(total).toBeGreaterThan(100);
  });

  it('commercial footprint matches planned width', () => {
    const spec = R11_MODULAR_ASSEMBLIES.find((a) => a.assemblyId === 'commercial-frontage-3bay');
    expect(spec).toBeDefined();
    const fp = resolveModularGridFootprint(spec!);
    expect(fp.widthM).toBeCloseTo(34, 0);
    expect(fp.heightM).toBeGreaterThan(4);
  });

  it('residential pair has distinct height envelopes', () => {
    const h1 = R11_MODULAR_ASSEMBLIES.find((a) => a.assemblyId === 'residential-house-1');
    const h2 = R11_MODULAR_ASSEMBLIES.find((a) => a.assemblyId === 'residential-house-2');
    const fp1 = resolveModularGridFootprint(h1!);
    const fp2 = resolveModularGridFootprint(h2!);
    expect(fp2.heightM).toBeGreaterThan(fp1.heightM);
  });

  it('modular door bindings stay near frozen sim entrances', () => {
    const commercial = R11_MODULAR_ASSEMBLIES.find((a) => a.assemblyId === 'commercial-frontage-3bay')!;
    const storeDoor = resolveModularDoorWorldPosition(commercial, 'store-door');
    const workDoor = resolveModularDoorWorldPosition(commercial, 'workshop-door');
    const storeEntrance = getFacilityPoint('store').entrance;
    const workEntrance = getFacilityPoint('workshop').entrance;
    expect(Math.hypot(storeDoor!.x - storeEntrance.x, storeDoor!.z - storeEntrance.z)).toBeLessThan(2.5);
    expect(Math.hypot(workDoor!.x - workEntrance.x, workDoor!.z - workEntrance.z)).toBeLessThan(2.5);
  });

  it('presentation AABB uses modular assembly when prototype active', () => {
    if (!isModularPrototypeActive()) return;
    const storeAabb = resolvePresentationWorldAabb('store');
    expect(storeAabb.maxY - storeAabb.minY).toBeGreaterThan(3);
    const aabb = resolveModularAssemblyAabb(
      R11_MODULAR_ASSEMBLIES.find((a) => a.assemblyId === 'commercial-frontage-3bay')!,
    );
    expect(aabb.minX).toBeLessThan(aabb.maxX);
  });

  it('street portal presets stay outside modular presentation bounds', () => {
    if (!isModularPrototypeActive()) return;
    expect(assertFacilityPortalOutsideBuilding('store-street').ok).toBe(true);
    expect(assertFacilityPortalOutsideBuilding('workshop-street').ok).toBe(true);
    expect(assertFacilityPortalOutsideBuilding('home-street').ok).toBe(true);
  });
});
