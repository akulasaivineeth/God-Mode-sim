import { describe, expect, it } from 'vitest';
import {
  LEGACY_CANONICAL_TOWN,
  LEGACY_TERRAIN,
  BUILDING_ARCHETYPES,
  terrainHeightAt,
  type Building,
} from '@/world/townLayout';
import { LEGACY_WORLD_DEFINITION } from '@/world/legacy/legacyTownDefinition';
import { HERO_NEIGHBORHOOD_DEFINITION } from '@/world/worldLab/heroNeighborhood';
import {
  getActiveWorldId,
  isWorldLabActive,
  resolveNavGraph,
  resolveWorldDefinition,
} from '@/world/resolver/worldResolver';
import { LOCATIONS, NAV_NODES } from '@/simulation/model/locations';
import { FACILITY_POINTS } from '@/world/facilityPoints';
import { shortestNodePath } from '@/simulation/model/pathfinding';

describe('WF02 R9 world resolver', () => {
  it('activates hero neighborhood in World Lab mode', () => {
    expect(isWorldLabActive()).toBe(true);
    expect(getActiveWorldId()).toBe('hero-neighborhood-r9');
    expect(resolveWorldDefinition().layout.buildings.length).toBe(7);
  });

  it('preserves legacy definition for parity reference', () => {
    expect(LEGACY_WORLD_DEFINITION.layout.buildings.length).toBe(14);
    expect(LEGACY_WORLD_DEFINITION.nav.nodes.SQ).toEqual({ x: 0, z: 0 });
  });

  it('derives M02 locations from semantic resolver', () => {
    expect(LOCATIONS.home.point).toEqual(HERO_NEIGHBORHOOD_DEFINITION.entrances[0].entrance);
    expect(LOCATIONS.store.point).toEqual(HERO_NEIGHBORHOOD_DEFINITION.entrances[1].entrance);
    expect(LOCATIONS.work.point).toEqual(HERO_NEIGHBORHOOD_DEFINITION.entrances[2].entrance);
  });

  it('keeps facility points aligned with semantic entrances', () => {
    for (const semantic of ['house-1', 'store', 'workshop'] as const) {
      const fp = FACILITY_POINTS.find((p) => p.facilityId === semantic)!;
      const resolved = HERO_NEIGHBORHOOD_DEFINITION.entrances.find((e) => e.facilityId === semantic)!;
      expect(fp.entrance).toEqual(resolved.entrance);
    }
  });

  it('routes home to store through connected nav graph', () => {
    const path = shortestNodePath('home', 'store');
    expect(path[0]).toBe('home');
    expect(path[path.length - 1]).toBe('store');
    expect(path).toContain('SQ');
  });

  it('routes home to work through connected nav graph', () => {
    const path = shortestNodePath('home', 'work');
    expect(path[path.length - 1]).toBe('work');
    expect(path.length).toBeGreaterThan(1);
  });
});

describe('WF02 R9 hero neighborhood layout', () => {
  const layout = HERO_NEIGHBORHOOD_DEFINITION.layout;

  it('fits within planned ~60–80 m bounds', () => {
    const bounds = HERO_NEIGHBORHOOD_DEFINITION.bounds;
    expect(bounds.maxX - bounds.minX).toBeLessThanOrEqual(80);
    expect(bounds.maxZ - bounds.minZ).toBeLessThanOrEqual(80);
    expect(layout.groundExtent).toBeLessThanOrEqual(45);
  });

  it('includes 6–10 structures with one future lot', () => {
    expect(layout.buildings.length).toBeGreaterThanOrEqual(6);
    expect(layout.buildings.length).toBeLessThanOrEqual(10);
    expect(layout.vacantPlots.length).toBe(1);
  });

  it('keeps civic, residential, and commercial roles', () => {
    expect(layout.buildings.some((b) => b.type === 'community')).toBe(true);
    expect(layout.buildings.some((b) => b.type === 'clinic')).toBe(true);
    expect(layout.buildings.filter((b) => b.type === 'house').length).toBe(2);
    expect(layout.buildings.some((b) => b.type === 'store')).toBe(true);
    expect(layout.buildings.some((b) => b.type === 'workshop')).toBe(true);
    expect(layout.buildings.some((b) => b.type === 'cafe')).toBe(true);
  });

  it('defines neighborhood-scoped cameras', () => {
    const cameras = HERO_NEIGHBORHOOD_DEFINITION.cameras;
    expect(cameras.overview).toBeDefined();
    expect(cameras.angled).toBeDefined();
    expect(cameras.street).toBeDefined();
    expect(cameras.civic).toBeDefined();
    expect(cameras.commercial).toBeDefined();
  });

  it('connects nav nodes used by pathfinding', () => {
    const nav = resolveNavGraph();
    for (const edge of nav.edges) {
      expect(nav.nodes[edge[0]]).toBeDefined();
      expect(nav.nodes[edge[1]]).toBeDefined();
    }
    expect(NAV_NODES.home).toEqual(HERO_NEIGHBORHOOD_DEFINITION.entrances[0].entrance);
  });
});

/**
 * WORLD-001 legacy shell regression — uses frozen legacy layout, not active World Lab.
 */
describe('WORLD-001 legacy canonical town shell', () => {
  const town = LEGACY_CANONICAL_TOWN;
  const byType = (type: Building['type']) => town.buildings.filter((b) => b.type === type);

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
    expect(town.park).toBeDefined();
    expect(town.square).toBeDefined();
    expect(town.cemetery).toBeDefined();
    expect(town.vacantPlots.length).toBeGreaterThanOrEqual(1);
    expect(town.farmPlots.length).toBeGreaterThanOrEqual(1);
    expect(town.river.points.length).toBeGreaterThanOrEqual(2);
  });

  it('uses WF01 expanded ground extent (~240 m)', () => {
    expect(town.groundExtent).toBeGreaterThanOrEqual(115);
    expect(town.groundExtent).toBeLessThanOrEqual(125);
  });

  it('has modest but legible terrain elevation that is flat in the settled core', () => {
    expect(LEGACY_TERRAIN.maxHeight).toBeGreaterThanOrEqual(8);
    expect(LEGACY_TERRAIN.maxHeight).toBeLessThanOrEqual(14);
    expect(terrainHeightAt(0, 0)).toBe(0);
    expect(terrainHeightAt(30, -20)).toBe(0);
  });

  it('terrainHeightAt is deterministic', () => {
    expect(terrainHeightAt(-41, -44)).toBe(terrainHeightAt(-41, -44));
  });
});

describe('WORLD-001 building archetypes', () => {
  it('defines an archetype for every building type in use', () => {
    for (const b of LEGACY_CANONICAL_TOWN.buildings) {
      expect(BUILDING_ARCHETYPES[b.type]).toBeDefined();
    }
  });
});

describe('WORLD-001 tree instancing source (legacy)', () => {
  it('exposes a combined tree collection for shared/instanced geometry', () => {
    const all = [
      ...LEGACY_CANONICAL_TOWN.trees,
      ...LEGACY_CANONICAL_TOWN.forest.trees,
    ];
    expect(all.length).toBeGreaterThan(LEGACY_CANONICAL_TOWN.trees.length);
  });
});
