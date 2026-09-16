/**
 * WF02 R11 Prototype 1 — civic square south enclosure edge (held colonnade wall).
 * Measured grid: 1.0 m × 0.625 m story × 1.0 m depth.
 */
import type { ModularAssemblySpec, ModularPlacement } from '../modularAssemblyTypes';

const WALL_LENGTH = 28;
const WALL_STORIES = 8;
const placements: ModularPlacement[] = [];

for (let gx = 0; gx < WALL_LENGTH; gx += 1) {
  const isCorner = gx === 0 || gx === WALL_LENGTH - 1;
  for (let gy = 0; gy < WALL_STORIES; gy += 1) {
    const moduleId =
      isCorner && gy === 0
        ? 'building-corner'
        : gy % 2 === 0 && gx % 3 === 1
          ? 'building-window'
          : 'building-block';
    placements.push({ moduleId, gx, gy, gz: 0 });
    if (gy === 0 && gx % 7 === 3) {
      placements.push({ moduleId: 'building-window-sill', gx, gy: 0, gz: 1 });
    }
  }
  placements.push({ moduleId: 'roof-flat-border-straight', gx, gy: WALL_STORIES, gz: 0 });
}

placements.push({ moduleId: 'building-steps-wide', gx: 13, gy: 0, gz: 1 });
placements.push({ moduleId: 'building-steps-wide', gx: 14, gy: 0, gz: 1 });
placements.push({ moduleId: 'roof-gable-corner', gx: 0, gy: WALL_STORIES, gz: 0, rotY: 0 });
placements.push({
  moduleId: 'roof-gable-corner',
  gx: WALL_LENGTH - 1,
  gy: WALL_STORIES,
  gz: 0,
  rotY: Math.PI / 2,
});

export const CIVIC_ENCLOSURE_ASSEMBLY: ModularAssemblySpec = {
  assemblyId: 'civic-enclosure-edge',
  origin: { x: -14, y: 0, z: -3.5 },
  rotY: 0,
  placements,
  replacesBuildingIds: [],
};
