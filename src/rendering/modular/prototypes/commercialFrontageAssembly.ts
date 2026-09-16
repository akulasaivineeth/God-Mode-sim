/**
 * WF02 R11 Prototype 2 — continuous 3-bay commercial frontage (store / workshop / cafe).
 */
import type { ModularAssemblySpec, ModularPlacement } from '../modularAssemblyTypes';

const WIDTH = 34;

function bayHeight(gx: number): number {
  if (gx < 11) return 7;
  if (gx < 23) return 9;
  return 6;
}

const placements: ModularPlacement[] = [];

for (let gx = 0; gx < WIDTH; gx += 1) {
  const stories = bayHeight(gx);
  for (let gy = 0; gy < stories; gy += 1) {
    let moduleId = 'building-block';
    if (gy === 0 && gx === 3) moduleId = 'building-door-window';
    else if (gy === 0 && gx === 21) moduleId = 'building-door-window-narrow';
    else if (gy === 1 && (gx === 3 || gx === 21)) moduleId = 'building-edges-door';
    else if (gy % 2 === 1 && gx % 2 === 0) moduleId = 'building-window-wide';
    else if (gy === stories - 1 && gx % 4 === 2) moduleId = 'building-window-awnings';
    placements.push({ moduleId, gx, gy, gz: 0 });
    if (gy > 0 && gy < stories - 1) {
      placements.push({ moduleId: 'building-block', gx, gy, gz: 1 });
    }
  }
  placements.push({ moduleId: 'roof-flat-awning-a', gx, gy: stories, gz: 0 });
  if (gx % 5 === 0) {
    placements.push({ moduleId: 'roof-flat-top', gx, gy: stories, gz: 1 });
  }
}

export const COMMERCIAL_FRONTAGE_ASSEMBLY: ModularAssemblySpec = {
  assemblyId: 'commercial-frontage-3bay',
  origin: { x: -17, y: 0, z: 11 },
  rotY: 0,
  placements,
  doorBindings: [
    { label: 'store-door', localX: 3.5, localZ: 0.5 },
    { label: 'workshop-door', localX: 21.5, localZ: 0.5 },
  ],
  replacesBuildingIds: ['store', 'workshop', 'cafe'],
};
