import { describe, expect, it } from 'vitest';
import { getFacilityPoint } from '@/world/facilityPoints';
import { R12_MODULAR_ASSEMBLIES } from '@/rendering/modular/modularAssemblies';
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

describe('WF02 R12 modular assembly', () => {
  it('uses measured story height from Kenney modular pack', () => {
    expect(getStoryHeight()).toBeCloseTo(0.625, 3);
  });

  it('resolves deterministic instance count for all assemblies', () => {
    const total = R12_MODULAR_ASSEMBLIES.reduce(
      (sum, spec) => sum + resolveModularInstances(spec).length,
      0,
    );
    expect(total).toBeGreaterThan(200);
  });

  it('civic uses multi-layer facade depth (gz >= 2)', () => {
    const civic = R12_MODULAR_ASSEMBLIES.find((a) => a.assemblyId === 'civic-enclosure-edge')!;
    const maxGz = Math.max(...civic.placements.map((p) => p.gz));
    expect(maxGz).toBeGreaterThanOrEqual(2);
    const fp = resolveModularGridFootprint(civic);
    expect(fp.widthM).toBeCloseTo(22, 0);
  });

  it('commercial footprint matches planned width with depth layers', () => {
    const spec = R12_MODULAR_ASSEMBLIES.find((a) => a.assemblyId === 'commercial-frontage-3bay');
    expect(spec).toBeDefined();
    const fp = resolveModularGridFootprint(spec!);
    expect(fp.widthM).toBeCloseTo(34, 0);
    expect(fp.depthM).toBeGreaterThanOrEqual(4);
    expect(fp.heightM).toBeGreaterThan(4);
    const hasStorefrontAwnings = spec!.placements.some(
      (p) => p.moduleId === 'building-window-awnings' && p.gz === 1 && p.gy === 0,
    );
    expect(hasStorefrontAwnings).toBe(true);
  });

  it('residential pair has distinct height envelopes and porch/balcony modules', () => {
    const h1 = R12_MODULAR_ASSEMBLIES.find((a) => a.assemblyId === 'residential-house-1')!;
    const h2 = R12_MODULAR_ASSEMBLIES.find((a) => a.assemblyId === 'residential-house-2')!;
    const fp1 = resolveModularGridFootprint(h1);
    const fp2 = resolveModularGridFootprint(h2);
    expect(fp2.heightM).toBeGreaterThan(fp1.heightM);
    expect(h1.placements.some((p) => p.moduleId === 'building-steps-narrow-windows-round')).toBe(
      true,
    );
    expect(h2.placements.some((p) => p.moduleId === 'building-window-balcony')).toBe(true);
  });

  it('modular door bindings stay near frozen sim entrances', () => {
    const commercial = R12_MODULAR_ASSEMBLIES.find(
      (a) => a.assemblyId === 'commercial-frontage-3bay',
    )!;
    const storeDoor = resolveModularDoorWorldPosition(commercial, 'store-door');
    const workDoor = resolveModularDoorWorldPosition(commercial, 'workshop-door');
    const storeEntrance = getFacilityPoint('store').entrance;
    const workEntrance = getFacilityPoint('workshop').entrance;
    expect(Math.hypot(storeDoor!.x - storeEntrance.x, storeDoor!.z - storeEntrance.z)).toBeLessThan(
      2.5,
    );
    expect(Math.hypot(workDoor!.x - workEntrance.x, workDoor!.z - workEntrance.z)).toBeLessThan(2.5);

    const home = R12_MODULAR_ASSEMBLIES.find((a) => a.assemblyId === 'residential-house-1')!;
    const homeDoor = resolveModularDoorWorldPosition(home, 'home-door');
    const homeEntrance = getFacilityPoint('house-1').entrance;
    expect(
      Math.hypot(homeDoor!.x - homeEntrance.x, homeDoor!.z - homeEntrance.z),
    ).toBeLessThan(1.5);
  });

  it('presentation AABB encloses gz projections for commercial assembly', () => {
    const commercial = R12_MODULAR_ASSEMBLIES.find(
      (a) => a.assemblyId === 'commercial-frontage-3bay',
    )!;
    const aabb = resolveModularAssemblyAabb(commercial);
    expect(aabb.maxZ - aabb.minZ).toBeGreaterThan(3.5);
  });

  it('presentation AABB uses modular assembly when prototype active', () => {
    if (!isModularPrototypeActive()) return;
    const storeAabb = resolvePresentationWorldAabb('store');
    expect(storeAabb.maxY - storeAabb.minY).toBeGreaterThan(3);
  });

  it('street portal presets stay outside modular presentation bounds', () => {
    if (!isModularPrototypeActive()) return;
    expect(assertFacilityPortalOutsideBuilding('store-street').ok).toBe(true);
    expect(assertFacilityPortalOutsideBuilding('workshop-street').ok).toBe(true);
    expect(assertFacilityPortalOutsideBuilding('home-street').ok).toBe(true);
  });
});
