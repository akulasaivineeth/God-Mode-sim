/**
 * WF02 R15 Path B — chunk part exclusion (roads/water/paths/M02/shell AABB).
 * Node mirror of compositionMask + proof placement rules for offline authoring.
 */

const ROADS = [
  { from: { x: 0, z: -24 }, to: { x: 0, z: 22 }, width: 6 },
  { from: { x: -24, z: -6 }, to: { x: 24, z: -6 }, width: 6 },
  { from: { x: -18, z: 8 }, to: { x: 18, z: 8 }, width: 6 },
  { from: { x: 0, z: 8 }, to: { x: 0, z: 20 }, width: 4 },
  { from: { x: -18, z: -6 }, to: { x: -18, z: -14 }, width: 4 },
  { from: { x: 18, z: -6 }, to: { x: 18, z: -14 }, width: 4 },
];

const PATHS = [
  { from: { x: -2, z: -8 }, to: { x: -14, z: 6 }, width: 1.6 },
  { from: { x: 2, z: -8 }, to: { x: 16, z: -4 }, width: 1.6 },
  { from: { x: -2, z: -12 }, to: { x: -14, z: -16 }, width: 1.4 },
  { from: { x: 2, z: -12 }, to: { x: 14, z: -16 }, width: 1.4 },
  { from: { x: 0, z: 20 }, to: { x: 0, z: 24 }, width: 1.2 },
];

const RIVER_POINTS = [
  { x: 34, z: -20 },
  { x: 32, z: -4 },
  { x: 34, z: 12 },
  { x: 32, z: 24 },
];

const RIVER_ENVELOPE_HALF = 16.0125;

const BUILDINGS = [
  { id: 'community-hall', position: { x: -14, z: -18 }, size: { width: 10, depth: 10 } },
  { id: 'clinic', position: { x: 14, z: -18 }, size: { width: 8, depth: 6 } },
  { id: 'house-1', position: { x: 16, z: -4 }, size: { width: 5, depth: 5 } },
  { id: 'house-2', position: { x: -16, z: -4 }, size: { width: 5, depth: 5 } },
  { id: 'store', position: { x: -14, z: 14 }, size: { width: 9, depth: 7 } },
  { id: 'workshop', position: { x: 4, z: 14 }, size: { width: 7, depth: 6 } },
  { id: 'cafe', position: { x: 16, z: 14 }, size: { width: 6, depth: 5 } },
];

const M02_ENTRANCES = [
  { x: 16, z: -6.4 },
  { x: -14, z: 10.8 },
  { x: 4, z: 10.8 },
];

const SQUARE_CENTER = { x: 0, z: -10 };

function distToSegment(px, pz, ax, az, bx, bz) {
  const dx = bx - ax;
  const dz = bz - az;
  const lenSq = dx * dx + dz * dz;
  if (lenSq < 1e-6) return Math.hypot(px - ax, pz - az);
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / lenSq));
  return Math.hypot(px - (ax + t * dx), pz - (az + t * dz));
}

function nearRoad(x, z, margin = 0.35) {
  for (const road of ROADS) {
    const half = road.width / 2 + margin;
    if (distToSegment(x, z, road.from.x, road.from.z, road.to.x, road.to.z) <= half) return true;
  }
  return false;
}

function nearPath(x, z, margin = 0.25) {
  for (const path of PATHS) {
    const half = path.width / 2 + margin;
    if (distToSegment(x, z, path.from.x, path.from.z, path.to.x, path.to.z) <= half) return true;
  }
  return false;
}

function nearRiver(x, z) {
  let best = Infinity;
  for (let i = 0; i < RIVER_POINTS.length - 1; i += 1) {
    const a = RIVER_POINTS[i];
    const b = RIVER_POINTS[i + 1];
    best = Math.min(best, distToSegment(x, z, a.x, a.z, b.x, b.z));
  }
  return best < RIVER_ENVELOPE_HALF;
}

function inSquareFountain(x, z, radius = 3.8) {
  return Math.hypot(x - SQUARE_CENTER.x, z - SQUARE_CENTER.z) < radius;
}

function nearM02Entrance(x, z, radius = 0.8) {
  for (const e of M02_ENTRANCES) {
    if (Math.hypot(x - e.x, z - e.z) <= radius) return true;
  }
  return false;
}

function nearBuilding(x, z, margin = 1.2) {
  for (const b of BUILDINGS) {
    const halfW = b.size.width / 2 + margin;
    const halfD = b.size.depth / 2 + margin;
    if (Math.abs(x - b.position.x) <= halfW && Math.abs(z - b.position.z) <= halfD) return true;
  }
  return false;
}

export function isChunkPartExcluded(x, z, buildingMargin = 1.2) {
  if (nearRiver(x, z)) return true;
  if (nearRoad(x, z)) return true;
  if (nearPath(x, z)) return true;
  if (inSquareFountain(x, z)) return true;
  if (nearM02Entrance(x, z)) return true;
  if (nearBuilding(x, z, buildingMargin)) return true;
  return false;
}

export function assignChunkId(x, z) {
  const inWest = x >= -30 && x <= 8 && z >= -22 && z <= 30;
  const inEast = x >= -8 && x <= 20 && z >= -16 && z <= 22;
  if (!inWest && !inEast) return null;
  const eastPreferred = (z >= 8 && z <= 19 && x >= -12) || x >= 13;
  if (eastPreferred && inEast) return 'east';
  if (inWest) return 'west';
  if (inEast) return 'east';
  return null;
}
