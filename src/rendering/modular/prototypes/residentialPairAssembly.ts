/**
 * WF02 R11 Prototype 3 — differentiated residential pair (1.5 vs 2 story silhouettes).
 */
import type { ModularAssemblySpec, ModularPlacement } from '../modularAssemblyTypes';

function buildHouseFootprint(stories: number, withSlantedRoof: boolean): ModularPlacement[] {
  const placements: ModularPlacement[] = [];
  const width = 6;
  const depth = 5;

  for (let gx = 0; gx < width; gx += 1) {
    for (let gz = 0; gz < depth; gz += 1) {
      for (let gy = 0; gy < stories; gy += 1) {
        const isEdge = gx === 0 || gx === width - 1 || gz === 0 || gz === depth - 1;
        let moduleId = 'building-block';
        if (isEdge && gy % 2 === 0) moduleId = 'building-window';
        if (gz === 0 && gx === Math.floor(width / 2) && gy === 0) moduleId = 'building-door-window';
        if (gx === 0 && gz === 0) moduleId = 'building-corner';
        if (gx === width - 1 && gz === 0) moduleId = 'building-corner';
        placements.push({ moduleId, gx, gy, gz });
      }
    }
    const roofModule = withSlantedRoof ? 'roof-slanted' : 'roof-gable';
    placements.push({ moduleId: roofModule, gx, gy: stories, gz: 2 });
  }
  placements.push({ moduleId: 'roof-gable-end', gx: 0, gy: stories, gz: 2 });
  placements.push({ moduleId: 'roof-gable-end', gx: width - 1, gy: stories, gz: 2, rotY: Math.PI });
  placements.push({ moduleId: 'door-white', gx: Math.floor(width / 2), gy: 0, gz: 0 });
  return placements;
}

/** house-1 — M02 home: 8 stories (5 m) + slanted roof. */
export const RESIDENTIAL_HOUSE1_ASSEMBLY: ModularAssemblySpec = {
  assemblyId: 'residential-house-1',
  origin: { x: 13, y: 0, z: -6.5 },
  rotY: 0,
  placements: buildHouseFootprint(8, true),
  doorBindings: [{ label: 'home-door', localX: 3.5, localZ: 0.5 }],
  replacesBuildingIds: ['house-1'],
};

/** house-2 — taller 2-story read: 11 stories (6.875 m) + gable roof. */
export const RESIDENTIAL_HOUSE2_ASSEMBLY: ModularAssemblySpec = {
  assemblyId: 'residential-house-2',
  origin: { x: -19, y: 0, z: -6.5 },
  rotY: 0,
  placements: buildHouseFootprint(11, false),
  replacesBuildingIds: ['house-2'],
};
