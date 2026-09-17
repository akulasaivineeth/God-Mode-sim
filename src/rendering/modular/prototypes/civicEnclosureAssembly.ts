/**
 * WF02 R12 Prototype 1 — civic square south enclosure (authored town-hall colonnade).
 * Grid: 1.0 m × 0.625 m story × 1.0 m depth. Multi-layer gz facade depth.
 */
import type { ModularAssemblySpec, ModularPlacement } from '../modularAssemblyTypes';

const WIDTH = 22;

function storiesAt(gx: number): number {
  if (gx >= 8 && gx <= 13) return 10;
  return 8;
}

function buildCivicPlacements(): ModularPlacement[] {
  const placements: ModularPlacement[] = [];

  for (let gx = 0; gx < WIDTH; gx += 1) {
    const stories = storiesAt(gx);
    const isEnd = gx === 0 || gx === WIDTH - 1;

    for (let gy = 0; gy < stories; gy += 1) {
      let moduleId = 'building-block';
      if (isEnd && gy === 0) moduleId = 'building-corner';
      else if (!isEnd && gy % 2 === 0 && gx % 3 === 1) moduleId = 'building-window';
      if (gx >= 9 && gx <= 10 && gy === 0) moduleId = 'building-door-window';
      placements.push({ moduleId, gx, gy, gz: 0 });
    }

    for (let gy = 0; gy < Math.min(stories, 7); gy += 1) {
      if (gx > 0 && gx < WIDTH - 1 && gx % 2 === 0) {
        placements.push({ moduleId: 'building-block', gx, gy, gz: 1 });
      }
    }

    if (gx % 3 === 1) {
      placements.push({ moduleId: 'building-window-sill', gx, gy: 0, gz: 2 });
    }
    if (stories >= 8 && gx % 4 === 2 && gx > 2 && gx < WIDTH - 3) {
      placements.push({ moduleId: 'building-window-balcony', gx, gy: 6, gz: 0 });
    }
    if (stories >= 8 && gx % 3 === 0 && gx > 0 && gx < WIDTH - 1) {
      placements.push({ moduleId: 'building-windows-high-middle', gx, gy: 7, gz: 0 });
    }

    placements.push({ moduleId: 'roof-flat-border-straight', gx, gy: stories, gz: 0 });
    if (gx % 2 === 0) {
      placements.push({
        moduleId: gx % 4 === 0 ? 'roof-flat-detail-a' : 'roof-flat-detail-b',
        gx,
        gy: stories,
        gz: 0,
      });
    }
  }

  placements.push({ moduleId: 'building-steps-wide', gx: 9, gy: 0, gz: 1 });
  placements.push({ moduleId: 'building-steps-wide', gx: 10, gy: 0, gz: 1 });
  placements.push({ moduleId: 'building-steps-narrow-windows-round', gx: 10, gy: 0, gz: 0 });
  placements.push({ moduleId: 'door-white', gx: 10, gy: 0, gz: 0 });

  for (let gy = 8; gy <= 10; gy += 1) {
    placements.push({ moduleId: 'building-windows-high-middle', gx: WIDTH - 1, gy, gz: 0 });
  }
  placements.push({ moduleId: 'building-corner-window-top-round', gx: WIDTH - 1, gy: 10, gz: 0 });
  placements.push({ moduleId: 'building-corner-window-top-round', gx: WIDTH - 1, gy: 11, gz: 0 });
  placements.push({ moduleId: 'roof-gable-corner', gx: 0, gy: storiesAt(0), gz: 0, rotY: 0 });
  placements.push({
    moduleId: 'roof-gable-corner',
    gx: WIDTH - 1,
    gy: storiesAt(WIDTH - 1),
    gz: 0,
    rotY: Math.PI / 2,
  });

  return placements;
}

export const CIVIC_ENCLOSURE_ASSEMBLY: ModularAssemblySpec = {
  assemblyId: 'civic-enclosure-edge',
  origin: { x: -14, y: 0, z: -3.5 },
  rotY: 0,
  placements: buildCivicPlacements(),
  replacesBuildingIds: [],
};
