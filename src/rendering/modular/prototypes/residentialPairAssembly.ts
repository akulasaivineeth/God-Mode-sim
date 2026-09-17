/**
 * WF02 R12 Prototype 3 — differentiated residential pair (porch cottage vs gable+balcony).
 */
import type { ModularAssemblySpec, ModularPlacement } from '../modularAssemblyTypes';

/** house-1 — M02 home: porch cottage + slanted roof + dormer. */
function buildHouse1Placements(): ModularPlacement[] {
  const placements: ModularPlacement[] = [];
  const width = 5;
  const depth = 4;
  const stories = 8;

  for (let gx = 0; gx < width; gx += 1) {
    for (let gz = 0; gz < depth; gz += 1) {
      for (let gy = 0; gy < stories; gy += 1) {
        const isEdge = gx === 0 || gx === width - 1 || gz === 0 || gz === depth - 1;
        let moduleId = 'building-block';
        if (isEdge && gy % 2 === 0) moduleId = 'building-window';
        if (gz === 0 && gx === 2 && gy === 0) moduleId = 'building-door-window';
        if (gx === 0 && gz === 0) moduleId = 'building-corner';
        if (gx === width - 1 && gz === 0) moduleId = 'building-corner';
        placements.push({ moduleId, gx, gy, gz });
      }
    }
    placements.push({ moduleId: 'roof-slanted', gx, gy: stories, gz: 1 });
  }

  placements.push({ moduleId: 'roof-slanted-window', gx: 2, gy: stories, gz: 1 });
  placements.push({ moduleId: 'roof-gable-end', gx: 0, gy: stories, gz: 1 });
  placements.push({ moduleId: 'roof-gable-end', gx: width - 1, gy: stories, gz: 1, rotY: Math.PI });

  placements.push({ moduleId: 'building-steps-narrow-windows-round', gx: 1, gy: 0, gz: 1 });
  placements.push({ moduleId: 'building-steps-narrow-windows-round', gx: 2, gy: 0, gz: 1 });
  placements.push({ moduleId: 'building-steps-narrow-windows-round', gx: 3, gy: 0, gz: 1 });
  placements.push({ moduleId: 'building-window-sill', gx: 0, gy: 1, gz: 1 });
  placements.push({ moduleId: 'building-window-sill', gx: width - 1, gy: 1, gz: 1 });
  placements.push({ moduleId: 'door-white', gx: 2, gy: 0, gz: 0 });

  return placements;
}

/** house-2 — taller gable home with balcony + asymmetric stoop. */
function buildHouse2Placements(): ModularPlacement[] {
  const placements: ModularPlacement[] = [];
  const width = 6;
  const depth = 5;
  const stories = 11;

  for (let gx = 0; gx < width; gx += 1) {
    for (let gz = 0; gz < depth; gz += 1) {
      for (let gy = 0; gy < stories; gy += 1) {
        const isEdge = gx === 0 || gx === width - 1 || gz === 0 || gz === depth - 1;
        let moduleId = 'building-block';
        if (isEdge && gy % 2 === 1) moduleId = 'building-window-wide';
        if (gz === 0 && gx === 1 && gy === 0) moduleId = 'building-door-window-narrow';
        if (gx === 0 && gz === 0) moduleId = 'building-corner';
        if (gx === width - 1 && gz === 0) moduleId = 'building-corner';
        placements.push({ moduleId, gx, gy, gz });
      }
    }
    placements.push({ moduleId: 'roof-gable', gx, gy: stories, gz: 2 });
  }

  placements.push({ moduleId: 'roof-gable-end', gx: 0, gy: stories, gz: 2 });
  placements.push({ moduleId: 'roof-gable-end', gx: width - 1, gy: stories, gz: 2, rotY: Math.PI });
  placements.push({ moduleId: 'roof-slanted-detail', gx: 3, gy: stories, gz: 2 });

  placements.push({ moduleId: 'building-steps-narrow-windows', gx: 1, gy: 0, gz: 1 });
  placements.push({ moduleId: 'building-window-balcony', gx: 2, gy: 5, gz: 0 });
  placements.push({ moduleId: 'building-window-balcony', gx: 3, gy: 5, gz: 0 });
  placements.push({ moduleId: 'building-window-balcony', gx: 2, gy: 6, gz: 0 });
  placements.push({ moduleId: 'door-white', gx: 1, gy: 0, gz: 0 });

  return placements;
}

export const RESIDENTIAL_HOUSE1_ASSEMBLY: ModularAssemblySpec = {
  assemblyId: 'residential-house-1',
  origin: { x: 13, y: 0, z: -6.5 },
  rotY: 0,
  placements: buildHouse1Placements(),
  doorBindings: [{ label: 'home-door', localX: 2.5, localZ: 0.5 }],
  replacesBuildingIds: ['house-1'],
};

export const RESIDENTIAL_HOUSE2_ASSEMBLY: ModularAssemblySpec = {
  assemblyId: 'residential-house-2',
  origin: { x: -19, y: 0, z: -6.5 },
  rotY: 0,
  placements: buildHouse2Placements(),
  replacesBuildingIds: ['house-2'],
};
