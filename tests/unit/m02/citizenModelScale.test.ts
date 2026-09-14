import { describe, expect, it } from 'vitest';
import { Mesh, BoxGeometry, Group } from 'three';
import {
  KENNEY_ALEX_MODEL_HEIGHT,
  TARGET_CITIZEN_HEIGHT,
  layoutCitizenModelFromObject,
} from '@/rendering/citizenModelScale';

describe('M02 citizen model scale normalization', () => {
  it('scales rest-pose height to target standing height', () => {
    const group = new Group();
    const mesh = new Mesh(new BoxGeometry(1, 100, 1));
    mesh.position.y = 50;
    group.add(mesh);

    const layout = layoutCitizenModelFromObject(group);
    expect(layout.rawHeight).toBeCloseTo(100, 4);
    expect(layout.scale * layout.rawHeight).toBeCloseTo(TARGET_CITIZEN_HEIGHT, 4);
    expect(layout.footOffsetY).toBeCloseTo(0, 4);
  });

  it('uses default target height of 1.8 world units', () => {
    expect(TARGET_CITIZEN_HEIGHT).toBeGreaterThanOrEqual(1.7);
    expect(TARGET_CITIZEN_HEIGHT).toBeLessThanOrEqual(1.9);
  });

  it('falls back to Kenney authorship height when skinned bbox collapses', () => {
    const tiny = new Group();
    const mesh = new Mesh(new BoxGeometry(0.01, 0.01, 0.01));
    tiny.add(mesh);
    const layout = layoutCitizenModelFromObject(tiny);
    expect(layout.rawHeight).toBeCloseTo(KENNEY_ALEX_MODEL_HEIGHT, 3);
    expect(layout.scale * layout.rawHeight).toBeCloseTo(TARGET_CITIZEN_HEIGHT, 4);
  });

  it('scales Kenney-sized models (~0.67 units) to target height', () => {
    const group = new Group();
    const mesh = new Mesh(new BoxGeometry(0.4, 0.67132488322258, 0.34));
    group.add(mesh);
    const layout = layoutCitizenModelFromObject(group);
    expect(layout.rawHeight).toBeCloseTo(0.67132488322258, 3);
    expect(layout.scale * layout.rawHeight).toBeCloseTo(TARGET_CITIZEN_HEIGHT, 3);
  });
});
