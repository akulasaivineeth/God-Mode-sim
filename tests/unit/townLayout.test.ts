import { describe, expect, it } from 'vitest';
import {
  BUILDING_ARCHETYPES,
  CANONICAL_TOWN,
  collectAllTrees,
  TERRAIN,
  terrainHeightAt,
  type Building,
} from '@/world/townLayout';

/**
 * WORLD-001 — lock the canonical town shell so the required day-one world
 * elements (spec §3.2) cannot silently disappear, and so a Day-1 mature
 * government building cannot be reintroduced (spec §22).
 */
describe('WORLD-001 canonical town shell', () => {
  const byType = (type: Building['type']) =>
    CANONICAL_TOWN.buildings.filter((b) => b.type === type);

  it('includes the day-one facility set', () => {
    expect(byType('store').length).toBeGreaterThanOrEqual(1);
    expect(byType('clinic').length).toBeGreaterThanOrEqual(1);
    expect(byType('school').length).toBeGreaterThanOrEqual(1);
    expect(byType('cafe').length).toBeGreaterThanOrEqual(1);
    expect(byType('workshop').length).toBeGreaterThanOrEqual(1);
    expect(byType('warehouse').length).toBeGreaterThanOrEqual(1);
    expect(byType('utility').length).toBeGreaterThanOrEqual(1);
    expect(byType('farmhouse').length).toBeGreaterThanOrEqual(1);
    expect(byType('house').length).toBeGreaterThanOrEqual(2);
    expect(byType('apartment').length).toBeGreaterThanOrEqual(1);
    expect(CANONICAL_TOWN.park).toBeDefined();
    expect(CANONICAL_TOWN.square).toBeDefined();
    expect(CANONICAL_TOWN.cemetery).toBeDefined();
    expect(CANONICAL_TOWN.vacantPlots.length).toBeGreaterThanOrEqual(1);
    expect(CANONICAL_TOWN.farmPlots.length).toBeGreaterThanOrEqual(1);
    expect(CANONICAL_TOWN.river.points.length).toBeGreaterThanOrEqual(2);
  });

  it('has sidewalks flanking the streets', () => {
    expect(CANONICAL_TOWN.sidewalks.length).toBeGreaterThanOrEqual(CANONICAL_TOWN.roads.length * 2);
    for (const sw of CANONICAL_TOWN.sidewalks) {
      expect(sw.width).toBeGreaterThan(0);
    }
  });

  it('has coherent pedestrian paths linking key places', () => {
    expect(CANONICAL_TOWN.paths.length).toBeGreaterThanOrEqual(4);
    for (const path of CANONICAL_TOWN.paths) {
      expect(path.width).toBeGreaterThan(0);
    }
  });

  it('has a distinct nearby forest on the hills, separate from town trees', () => {
    expect(CANONICAL_TOWN.trees.length).toBeGreaterThan(0);
    expect(CANONICAL_TOWN.forest.trees.length).toBeGreaterThanOrEqual(20);
    // The forest sits outside the flat core (on elevated terrain).
    const center = CANONICAL_TOWN.forest.area.center;
    expect(terrainHeightAt(center.x, center.z)).toBeGreaterThan(0);
    const elevated = CANONICAL_TOWN.forest.trees.filter(
      (t) => terrainHeightAt(t.position.x, t.position.z) > 0,
    );
    expect(elevated.length).toBeGreaterThan(0);
  });

  it('has modest but legible terrain elevation that is flat in the settled core', () => {
    // Legible (clearly readable) yet modest — gentle topography, not mountains.
    expect(TERRAIN.maxHeight).toBeGreaterThanOrEqual(8);
    expect(TERRAIN.maxHeight).toBeLessThanOrEqual(14);
    // Core stays flat so buildings/roads sit level.
    expect(terrainHeightAt(0, 0)).toBe(0);
    expect(terrainHeightAt(20, -10)).toBe(0);
    // Hills rise toward the north/west, bounded by maxHeight, and are clearly
    // raised (at least half the max height) so they read at overview framing.
    const nwPeak = terrainHeightAt(-48, -48);
    const nPeak = terrainHeightAt(0, -48);
    expect(nwPeak).toBeGreaterThanOrEqual(TERRAIN.maxHeight * 0.5);
    expect(nPeak).toBeGreaterThanOrEqual(TERRAIN.maxHeight * 0.4);
    expect(nwPeak).toBeLessThanOrEqual(TERRAIN.maxHeight);
    // The eastern river valley stays low (river must not run uphill).
    expect(terrainHeightAt(40, 0)).toBe(0);
  });

  it('terrainHeightAt is deterministic', () => {
    expect(terrainHeightAt(-41, -44)).toBe(terrainHeightAt(-41, -44));
  });

  it('keeps every building on the flat core so none float or sink', () => {
    for (const b of CANONICAL_TOWN.buildings) {
      expect(terrainHeightAt(b.position.x, b.position.z)).toBe(0);
    }
  });
});

describe('WORLD-001 river readability', () => {
  it('is a non-trivial river that bends inward (not a tiny edge strip)', () => {
    const { points, width, bankWidth } = CANONICAL_TOWN.river;
    expect(points.length).toBeGreaterThanOrEqual(5);
    expect(width).toBeGreaterThanOrEqual(7);
    expect(bankWidth).toBeGreaterThan(width);
    const xs = points.map((p) => p.x);
    const zs = points.map((p) => p.z);
    // Bends inward from the map edge (groundExtent 50) rather than hugging it.
    expect(Math.min(...xs)).toBeLessThanOrEqual(38);
    // Runs the length of the map so it reads from an overview.
    expect(Math.min(...zs)).toBeLessThanOrEqual(-40);
    expect(Math.max(...zs)).toBeGreaterThanOrEqual(40);
  });
});

describe('WORLD-001 building archetypes', () => {
  it('defines an archetype for every building type in use', () => {
    for (const b of CANONICAL_TOWN.buildings) {
      expect(BUILDING_ARCHETYPES[b.type]).toBeDefined();
    }
  });

  it('differentiates silhouettes across facility groups', () => {
    const roofs = new Set(Object.values(BUILDING_ARCHETYPES).map((a) => a.roof));
    expect(roofs.size).toBeGreaterThanOrEqual(2);
    expect(BUILDING_ARCHETYPES.house.roof).not.toBe(BUILDING_ARCHETYPES.apartment.roof);
    expect(BUILDING_ARCHETYPES.store.canopy).toBe(true);
    expect(BUILDING_ARCHETYPES.utility.tower).toBe(true);
    expect(BUILDING_ARCHETYPES.community.entry).toBe(true);
  });
});

describe('WORLD-001 tree instancing source', () => {
  it('exposes a combined tree collection for shared/instanced geometry', () => {
    const all = collectAllTrees();
    expect(all.length).toBe(CANONICAL_TOWN.trees.length + CANONICAL_TOWN.forest.trees.length);
    expect(all.length).toBeGreaterThan(CANONICAL_TOWN.trees.length);
  });
});

describe('WORLD-001 no Day-1 government (spec §22)', () => {
  it('has no town hall / government building type', () => {
    const types = CANONICAL_TOWN.buildings.map((b) => b.type as string);
    expect(types).not.toContain('townhall');
    expect(types).not.toContain('government');
  });

  it('has a neutral community building and no government-implying labels', () => {
    expect(CANONICAL_TOWN.buildings.some((b) => b.type === 'community')).toBe(true);
    const forbidden = /town hall|government|mayor|council|police|court|parliament/i;
    for (const b of CANONICAL_TOWN.buildings) {
      expect(forbidden.test(b.label)).toBe(false);
      expect(forbidden.test(b.id)).toBe(false);
    }
  });
});
