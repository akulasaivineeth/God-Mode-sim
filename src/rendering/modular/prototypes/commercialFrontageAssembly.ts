/**
 * WF02 R12 Prototype 2 — continuous 3-bay commercial frontage with storefront depth.
 */
import type { ModularAssemblySpec, ModularPlacement } from '../modularAssemblyTypes';

const WIDTH = 34;

function bayStories(gx: number): number {
  if (gx < 11) return 7;
  if (gx < 23) return 9;
  return 6;
}

function groundModule(gx: number): string {
  if (gx === 3) return 'building-door-window';
  if (gx === 21 || gx === 28) return 'building-door-window-narrow';
  if (gx % 3 === 0) return 'building-window-large-left';
  if (gx % 3 === 1) return 'building-window-large-middle';
  return 'building-window-large-right';
}

function buildCommercialPlacements(): ModularPlacement[] {
  const placements: ModularPlacement[] = [];

  for (let gx = 0; gx < WIDTH; gx += 1) {
    const stories = bayStories(gx);
    const isBayDivider = gx === 11 || gx === 23;

    for (let gy = 0; gy < stories; gy += 1) {
      if (gy === 0) {
        placements.push({ moduleId: groundModule(gx), gx, gy, gz: 0 });
        placements.push({ moduleId: 'building-window-awnings', gx, gy, gz: 1 });
        if (isBayDivider) {
          placements.push({ moduleId: 'building-corner', gx, gy, gz: 0 });
        }
        if (gx === 3 || gx === 21) {
          placements.push({ moduleId: 'building-edges-door', gx, gy: 1, gz: 0 });
        }
      } else {
        let upperModule = 'building-block';
        if (gy % 2 === 1 && gx % 2 === 0) upperModule = 'building-window-wide';
        if (gx >= 11 && gx < 23 && gy >= 4 && gx % 4 === 0) {
          upperModule = 'building-window-balcony';
        }
        placements.push({ moduleId: upperModule, gx, gy, gz: 2 });
        if (gy > 1 && gy < stories - 1) {
          placements.push({ moduleId: 'building-block', gx, gy, gz: 3 });
        }
      }
    }

    placements.push({
      moduleId: gx % 2 === 0 ? 'roof-flat-detail-a' : 'roof-flat-detail-b',
      gx,
      gy: stories,
      gz: 0,
    });
    if (gx % 5 === 0) {
      placements.push({ moduleId: 'roof-flat-top', gx, gy: stories, gz: 1 });
    }
  }

  return placements;
}

export const COMMERCIAL_FRONTAGE_ASSEMBLY: ModularAssemblySpec = {
  assemblyId: 'commercial-frontage-3bay',
  origin: { x: -17, y: 0, z: 11 },
  rotY: 0,
  placements: buildCommercialPlacements(),
  doorBindings: [
    { label: 'store-door', localX: 3.5, localZ: 0.5 },
    { label: 'workshop-door', localX: 21.5, localZ: 0.5 },
  ],
  replacesBuildingIds: ['store', 'workshop', 'cafe'],
};
