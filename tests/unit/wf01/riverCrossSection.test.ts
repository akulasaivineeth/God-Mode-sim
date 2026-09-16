import { describe, expect, it } from 'vitest';
import { PerspectiveCamera } from 'three';
import { LEGACY_CANONICAL_TOWN, terrainHeightAt } from '@/world/townLayout';
import { CAMERA_PRESETS } from '@/rendering/cameraPresets';
import {
  assertWaterAboveCarvedTerrain,
  corridorEnvelopeHalfWidth,
  distanceToRiverPolyline,
  presentationTerrainHeightAt,
  R5_RIVER_CROSS_SECTION,
  visualWaterHalfWidth,
  waterSurfaceHeightAt,
} from '@/rendering/environment/riverCrossSection';
import { bridgePlacementOnRiver, projectRiverCorridorScreenHalfWidth } from '@/rendering/environment/riverGeometry';

describe('WF01 R5 river cross-section geometry', () => {
  const { points } = LEGACY_CANONICAL_TOWN.river;
  const section = R5_RIVER_CROSS_SECTION;

  it('keeps bridge anchor on polyline at z=0', () => {
    const bridge = bridgePlacementOnRiver(points, 0);
    expect(bridge.z).toBe(0);
    expect(bridge.x).toBeGreaterThan(70);
    expect(bridge.x).toBeLessThan(78);
  });

  it('computes finite corridor distance for eastern samples', () => {
    const sample = distanceToRiverPolyline(80, 0, points);
    expect(sample.distance).toBeLessThan(visualWaterHalfWidth(section) + 2);
    expect(sample.segmentIndex).toBeGreaterThanOrEqual(0);
  });

  it('carves presentation terrain below base inside water channel', () => {
    const base = terrainHeightAt(80, 0);
    const carved = presentationTerrainHeightAt(80, 0, base, points, section);
    expect(carved).toBeLessThan(base);
  });

  it('keeps water surface above carved terrain in channel samples', () => {
    const samples = [
      { x: 74, z: 0 },
      { x: 80, z: -20 },
      { x: 78, z: 30 },
      { x: 86, z: 60 },
    ];
    for (const s of samples) {
      const base = terrainHeightAt(s.x, s.z);
      expect(assertWaterAboveCarvedTerrain(s.x, s.z, base, points, section)).toBe(true);
      const waterY = waterSurfaceHeightAt(s.x, s.z, base, points, section);
      const terrainY = presentationTerrainHeightAt(s.x, s.z, base, points, section);
      expect(waterY).toBeGreaterThan(terrainY);
    }
  });

  it('does not modify simulation terrainHeightAt for eastern valley', () => {
    expect(terrainHeightAt(80, 0)).toBe(terrainHeightAt(80, 0));
    expect(terrainHeightAt(90, 0)).toBeLessThanOrEqual(terrainHeightAt(0, 0) + 0.01);
  });

  it('projects minimum geometric water half-width at bridge under canonical overview camera', () => {
    const bridge = bridgePlacementOnRiver(points, 0);
    const camera = new PerspectiveCamera(45, 16 / 9, 0.1, 500);
    const [px, py, pz] = CAMERA_PRESETS.overview.position;
    const [tx, ty, tz] = CAMERA_PRESETS.overview.target;
    camera.position.set(px, py, pz);
    camera.lookAt(tx, ty, tz);
    camera.updateMatrixWorld();

    const halfWidthPx = projectRiverCorridorScreenHalfWidth(
      camera,
      1440,
      points,
      section,
      bridge.x,
      bridge.z,
    );
    expect(halfWidthPx).toBeGreaterThan(18);
  });

  it('has continuous corridor envelope wider than water alone', () => {
    expect(corridorEnvelopeHalfWidth(section)).toBeGreaterThan(visualWaterHalfWidth(section));
  });
});
