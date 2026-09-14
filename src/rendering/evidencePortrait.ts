/**
 * Evidence portrait camera — bounds-derived framing (M02 R12).
 *
 * Frames the live animated GLB from its world-space bounding box after the current
 * pose is applied. Presentation only — never simulation authority (ARCH-002).
 */
import {
  Box3,
  Mesh,
  Object3D,
  PerspectiveCamera,
  Raycaster,
  SkinnedMesh,
  Sphere,
  Vector3,
} from 'three';
import { getCitizenWorldBoundsFromRegistry } from './citizenBoundsRegistry';
import { TARGET_CITIZEN_HEIGHT } from './citizenModelScale';

export interface PortraitOpts {
  /** Minimum fraction of viewport area occupied by projected citizen bounds. */
  minScreenAreaFraction?: number;
  /** Multiplier on bounding-sphere distance for safety margin. */
  margin?: number;
  /** Optional azimuth bias (radians) for dual-angle static-pose proof (e.g. sit clip). */
  azimuthOffset?: number;
}

export interface ScreenProjection {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  areaFraction: number;
  /** True when projected bounds are not clipped by viewport edges. */
  fullyOnScreen: boolean;
}

export interface PortraitFrame {
  position: [number, number, number];
  target: [number, number, number];
  projection: ScreenProjection;
  /** True when raycasts from the lens to citizen sample points are unobstructed. */
  lineOfSightClear: boolean;
}

const BOX_CORNER_OFFSETS: [number, number, number][] = [
  [0, 0, 0],
  [1, 0, 0],
  [0, 1, 0],
  [1, 1, 0],
  [0, 0, 1],
  [1, 0, 1],
  [0, 1, 1],
  [1, 1, 1],
];

const _fallbackSize = new Vector3();
const _worldCenter = new Vector3();
const _ray = new Raycaster();
const _rayDir = new Vector3();

export function getCitizenWorldBounds(body: Object3D): Box3 {
  body.updateWorldMatrix(true, true);
  const box = new Box3();
  let hasSkinned = false;
  body.traverse((child) => {
    if (child instanceof SkinnedMesh) {
      child.computeBoundingBox();
      if (child.boundingBox) {
        const skinned = child.boundingBox.clone().applyMatrix4(child.matrixWorld);
        box.union(skinned);
        hasSkinned = true;
      }
    }
  });
  if (hasSkinned) {
    box.getSize(_fallbackSize);
    if (_fallbackSize.y >= TARGET_CITIZEN_HEIGHT * 0.25) {
      return box;
    }
  }
  box.setFromObject(body);
  box.getSize(_fallbackSize);
  if (_fallbackSize.y >= TARGET_CITIZEN_HEIGHT * 0.35) {
    return box;
  }
  body.getWorldPosition(_worldCenter);
  const halfW = 0.28;
  box.setFromCenterAndSize(
    _worldCenter.clone().add(new Vector3(0, TARGET_CITIZEN_HEIGHT * 0.5, 0)),
    new Vector3(halfW * 2, TARGET_CITIZEN_HEIGHT, halfW * 2),
  );
  return box;
}

export function samplePointsFromBounds(bounds: Box3): Vector3[] {
  const center = bounds.getCenter(new Vector3());
  const size = bounds.getSize(new Vector3());
  return [
    center.clone().add(new Vector3(0, size.y * 0.44, 0)),
    center.clone().add(new Vector3(0, size.y * 0.22, 0)),
    center.clone().add(new Vector3(0, size.y * 0.04, 0)),
  ];
}

function isDescendantOf(node: Object3D, ancestor: Object3D | null): boolean {
  if (!ancestor) return false;
  let current: Object3D | null = node;
  while (current) {
    if (current === ancestor) return true;
    current = current.parent;
  }
  return false;
}

/** Raycast line-of-sight from camera to citizen sample points; reject world occluders. */
export function hasUnobstructedLineOfSight(
  cameraPos: Vector3,
  bounds: Box3,
  scene: Object3D,
  citizenBody: Object3D | null,
): boolean {
  if (!citizenBody) {
    return false;
  }

  const samples = samplePointsFromBounds(bounds);
  const meshes: Object3D[] = [];
  scene.updateMatrixWorld(true);
  scene.traverse((obj) => {
    if (obj instanceof Mesh && obj.visible) {
      meshes.push(obj);
    }
  });

  for (const target of samples) {
    const distToTarget = cameraPos.distanceTo(target);
    if (distToTarget < 0.05) {
      continue;
    }

    _ray.set(cameraPos, _rayDir.subVectors(target, cameraPos).normalize());
    _ray.far = distToTarget + 0.05;
    const hits = _ray.intersectObjects(meshes, true);
    if (hits.length === 0) {
      continue;
    }

    const first = hits[0];
    if (isDescendantOf(first.object, citizenBody)) {
      continue;
    }
    if (first.distance < distToTarget - 0.25) {
      return false;
    }
  }

  return true;
}

export function projectBoundsToScreen(
  bounds: Box3,
  camera: PerspectiveCamera,
  width: number,
  height: number,
): ScreenProjection {
  const min = bounds.min;
  const max = bounds.max;
  const corner = new Vector3();
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const [ox, oy, oz] of BOX_CORNER_OFFSETS) {
    corner.set(ox ? max.x : min.x, oy ? max.y : min.y, oz ? max.z : min.z);
    corner.project(camera);
    const sx = (corner.x * 0.5 + 0.5) * width;
    const sy = (-corner.y * 0.5 + 0.5) * height;
    minX = Math.min(minX, sx);
    maxX = Math.max(maxX, sx);
    minY = Math.min(minY, sy);
    maxY = Math.max(maxY, sy);
  }

  const clampedMinX = Math.max(0, minX);
  const clampedMaxX = Math.min(width, maxX);
  const clampedMinY = Math.max(0, minY);
  const clampedMaxY = Math.min(height, maxY);
  const visibleW = Math.max(0, clampedMaxX - clampedMinX);
  const visibleH = Math.max(0, clampedMaxY - clampedMinY);
  const areaFraction = (visibleW * visibleH) / Math.max(1, width * height);
  const fullyOnScreen = minX >= 0 && maxX <= width && minY >= 0 && maxY <= height;

  return {
    minX: clampedMinX,
    minY: clampedMinY,
    maxX: clampedMaxX,
    maxY: clampedMaxY,
    areaFraction,
    fullyOnScreen,
  };
}

function scoreCandidate(
  bounds: Box3,
  camera: PerspectiveCamera,
  scene: Object3D,
  citizenBody: Object3D | null,
  viewportWidth: number,
  viewportHeight: number,
  position: Vector3,
  target: Vector3,
): { score: number; projection: ScreenProjection; lineOfSightClear: boolean } | null {
  const savedPos = camera.position.clone();
  const savedQuat = camera.quaternion.clone();
  camera.position.copy(position);
  camera.lookAt(target);
  camera.updateMatrixWorld();

  const projection = projectBoundsToScreen(bounds, camera, viewportWidth, viewportHeight);
  const lineOfSightClear = hasUnobstructedLineOfSight(position, bounds, scene, citizenBody);

  camera.position.copy(savedPos);
  camera.quaternion.copy(savedQuat);
  camera.updateMatrixWorld();

  if (projection.areaFraction <= 0 || !lineOfSightClear) {
    return null;
  }

  const score =
    projection.areaFraction +
    (projection.fullyOnScreen ? 0.08 : 0) +
    Math.min(0.05, projection.maxY / Math.max(1, viewportHeight) * 0.05);

  return { score, projection, lineOfSightClear };
}

/**
 * Place the lens from live bounds + FOV, testing several azimuths with raycast occlusion.
 */
export function computePortraitCameraFromBounds(
  body: Object3D | null,
  camera: PerspectiveCamera,
  scene: Object3D,
  viewportWidth: number,
  viewportHeight: number,
  opts: PortraitOpts = {},
): PortraitFrame {
  const margin = opts.margin ?? 1.28;
  const azimuthOffset = opts.azimuthOffset ?? 0;
  const cached = getCitizenWorldBoundsFromRegistry();
  const bounds =
    body != null
      ? getCitizenWorldBounds(body)
      : cached && !cached.isEmpty()
        ? cached
        : null;
  if (!bounds || bounds.isEmpty()) {
    throw new Error('Citizen bounds are empty — animated body not ready');
  }

  const center = bounds.getCenter(new Vector3());
  const size = bounds.getSize(new Vector3());
  const sphere = bounds.getBoundingSphere(new Sphere());
  const radius = Math.max(sphere.radius, 0.35);

  const targetY = center.y + size.y * 0.12;
  const target = new Vector3(center.x, targetY, center.z);

  const fovRad = (camera.fov * Math.PI) / 180;
  const distance = (radius / Math.sin(fovRad / 2)) * margin;
  const elevation = Math.atan2(Math.max(size.y * 0.45, 0.6), distance);

  const azimuths = [
    Math.PI * 0.15,
    Math.PI * 0.35,
    Math.PI * 0.55,
    -Math.PI * 0.15,
    -Math.PI * 0.35,
    Math.PI,
    0,
  ];
  let best: {
    position: Vector3;
    projection: ScreenProjection;
    score: number;
    lineOfSightClear: boolean;
  } | null = null;

  for (const az of azimuths) {
    const biasedAz = az + azimuthOffset;
    const camX = center.x + Math.cos(biasedAz) * distance;
    const camZ = center.z + Math.sin(biasedAz) * distance;
    const camY = targetY + Math.tan(elevation) * distance * 0.35 + size.y * 0.25;
    const position = new Vector3(camX, camY, camZ);

    const candidate = scoreCandidate(
      bounds,
      camera,
      scene,
      body,
      viewportWidth,
      viewportHeight,
      position,
      target,
    );
    if (!candidate) continue;
    if (!best || candidate.score > best.score) {
      best = {
        position,
        projection: candidate.projection,
        score: candidate.score,
        lineOfSightClear: candidate.lineOfSightClear,
      };
    }
  }

  if (!best) {
    throw new Error('Unable to find unobstructed portrait camera for citizen bounds');
  }

  const minArea = opts.minScreenAreaFraction ?? 0;
  if (minArea > 0 && best.projection.areaFraction < minArea) {
    const dist = best.position.distanceTo(target);
    const dir = best.position.clone().sub(target).normalize();
    for (let tighten = 0; tighten < 8; tighten += 1) {
      const closer = target.clone().add(dir.clone().multiplyScalar(dist * 0.82 ** (tighten + 1)));
      const candidate = scoreCandidate(
        bounds,
        camera,
        scene,
        body,
        viewportWidth,
        viewportHeight,
        closer,
        target,
      );
      if (!candidate) break;
      best = {
        position: closer,
        projection: candidate.projection,
        score: candidate.score,
        lineOfSightClear: candidate.lineOfSightClear,
      };
      if (candidate.projection.areaFraction >= minArea && candidate.projection.fullyOnScreen) break;
    }
  }

  if (!best.lineOfSightClear) {
    throw new Error('Portrait camera failed line-of-sight contract after tightening');
  }

  return {
    position: [best.position.x, best.position.y, best.position.z],
    target: [target.x, target.y, target.z],
    projection: best.projection,
    lineOfSightClear: best.lineOfSightClear,
  };
}

export function assertCitizenVisibilityContract(
  projection: ScreenProjection,
  minAreaFraction = 0.045,
  minPixelHeight = 72,
): { ok: true } | { ok: false; reason: string } {
  if (projection.areaFraction < minAreaFraction) {
    return {
      ok: false,
      reason: `citizen projected area ${(projection.areaFraction * 100).toFixed(2)}% < ${(minAreaFraction * 100).toFixed(1)}% minimum`,
    };
  }
  const pixelHeight = projection.maxY - projection.minY;
  const pixelWidth = projection.maxX - projection.minX;
  if (pixelHeight < minPixelHeight) {
    return {
      ok: false,
      reason: `citizen projected height ${pixelHeight.toFixed(0)}px < ${minPixelHeight}px minimum`,
    };
  }
  if (pixelWidth < 8 || pixelHeight < 8) {
    return { ok: false, reason: 'citizen projected bounds too small in pixels' };
  }
  if (!projection.fullyOnScreen) {
    return { ok: false, reason: 'citizen projection clipped by viewport edges' };
  }
  return { ok: true };
}

/** @deprecated R11 fixed-offset helper — kept for type compatibility; prefer bounds path. */
export interface PortraitCitizen {
  x: number;
  z: number;
  facingRadians: number;
}

/** Legacy stub — R12 always uses bounds-derived framing. */
export function computePortraitCamera(
  _citizen: PortraitCitizen,
  opts: PortraitOpts = {},
): { position: [number, number, number]; target: [number, number, number] } {
  void opts;
  throw new Error('computePortraitCamera requires live bounds — use computePortraitCameraFromBounds');
}
