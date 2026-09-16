import { describe, expect, it } from 'vitest';
import { PerspectiveCamera, Scene, Vector3 } from 'three';
import { LEGACY_CANONICAL_TOWN } from '@/world/townLayout';
import { isWorldLabActive } from '@/world/resolver/worldResolver';
import { HERO_NEIGHBORHOOD_DEFINITION } from '@/world/worldLab/heroNeighborhood';
import { CAMERA_PRESETS } from '@/rendering/cameraPresets';
import {
  assertCitizenVisibilityContract,
  projectBoundsToScreen,
} from '@/rendering/evidencePortrait';
import {
  assertRiverEvidenceSemantics,
  computeRiverBridgePreset,
  riverFrameVectorsAtBridge,
} from '@/rendering/riverBridgeCamera';

describe('M02 R12 river bridge evidence camera', () => {
  it('derives bridge placement on authored polyline near z=0', () => {
    const { bridge } = riverFrameVectorsAtBridge(LEGACY_CANONICAL_TOWN.river.points, 0);
    expect(bridge.z).toBe(0);
    expect(bridge.x).toBeGreaterThan(68);
    expect(bridge.x).toBeLessThan(80);
  });

  it('uses a lower oblique altitude distinct from overview/angled', () => {
    const river = isWorldLabActive()
      ? HERO_NEIGHBORHOOD_DEFINITION.cameras.river!
      : computeRiverBridgePreset();
    expect(river.position[1]).toBeLessThan(35);
    expect(river.position[1]).toBeGreaterThan(8);
    if (isWorldLabActive()) return;
    const semantics = assertRiverEvidenceSemantics(
      river,
      CAMERA_PRESETS.overview,
      CAMERA_PRESETS.angled,
      riverFrameVectorsAtBridge(LEGACY_CANONICAL_TOWN.river.points, 0).bridge.x,
      0,
    );
    expect(semantics.ok).toBe(true);
  });

  it('targets near the bridge crossing', () => {
    if (isWorldLabActive()) {
      expect(CAMERA_PRESETS.river.target[0]).toBeGreaterThan(20);
      return;
    }
    const river = computeRiverBridgePreset();
    const { bridge } = riverFrameVectorsAtBridge(LEGACY_CANONICAL_TOWN.river.points, 0);
    const dist = Math.hypot(river.target[0] - bridge.x, river.target[2] - bridge.z);
    expect(dist).toBeLessThan(18);
  });

  it('wires river preset from bridge derivation', () => {
    if (isWorldLabActive()) {
      expect(CAMERA_PRESETS.river).toEqual(HERO_NEIGHBORHOOD_DEFINITION.cameras.river);
      return;
    }
    const derived = computeRiverBridgePreset();
    expect(CAMERA_PRESETS.river.position).toEqual(derived.position);
    expect(CAMERA_PRESETS.river.target).toEqual(derived.target);
  });
});

describe('M02 R12 citizen visibility contract', () => {
  it('accepts meaningful projected area and rejects tiny clips', () => {
    const ok = assertCitizenVisibilityContract({
      minX: 100,
      minY: 100,
      maxX: 400,
      maxY: 700,
      areaFraction: 0.12,
      fullyOnScreen: true,
    });
    expect(ok.ok).toBe(true);

    const tiny = assertCitizenVisibilityContract({
      minX: 10,
      minY: 10,
      maxX: 14,
      maxY: 14,
      areaFraction: 0.001,
      fullyOnScreen: false,
    });
    expect(tiny.ok).toBe(false);
  });

  it('projects bounds to screen space with non-zero area when in front of camera', () => {
    const camera = new PerspectiveCamera(45, 16 / 9, 0.1, 500);
    camera.position.set(5, 2, 5);
    camera.lookAt(0, 1, 0);
    camera.updateMatrixWorld();

    const bounds = {
      min: new Vector3(-0.5, 0, -0.5),
      max: new Vector3(0.5, 2, 0.5),
      isEmpty: () => false,
    } as import('three').Box3;

    const projection = projectBoundsToScreen(bounds, camera, 1440, 900);
    expect(projection.areaFraction).toBeGreaterThan(0.01);
    expect(projection.maxX).toBeGreaterThan(projection.minX);
    expect(projection.maxY).toBeGreaterThan(projection.minY);
    void new Scene();
  });
});
