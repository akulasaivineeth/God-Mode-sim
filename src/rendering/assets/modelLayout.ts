/**
 * WF02 single presentation layout authority — pure functions shared by ModelAsset and
 * buildingPresentationAnchors. Intrinsic bounds come from offline modelLayoutManifest.json
 * (generated from Kenney GLB rest-pose AABBs). Runtime never recomputes GLB bounds.
 */
import manifest from './modelLayoutManifest.json';

export interface Vec3Tuple {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface IntrinsicBounds {
  min: [number, number, number];
  max: [number, number, number];
  size: [number, number, number];
}

export interface NormalizedModelLayout {
  /** Uniform scale applied to fit targetWidth to max(x,z) footprint. */
  uniformScale: number;
  /** Local-space bounds after uniform scale (before parent rotation). */
  localBounds: {
    min: [number, number, number];
    max: [number, number, number];
    size: [number, number, number];
  };
  /** Footprint width used for normalization (max of local x/z). */
  footprintWidth: number;
}

export interface RotatedFootprint {
  halfWidthX: number;
  halfWidthZ: number;
  depthX: number;
  depthZ: number;
  height: number;
}

const FALLBACK_BOUNDS: IntrinsicBounds = {
  min: [-0.5, 0, -0.5],
  max: [0.5, 1, 0.5],
  size: [1, 1, 1],
};

export function getIntrinsicBounds(url: string): IntrinsicBounds {
  const entry = (manifest as unknown as Record<string, IntrinsicBounds>)[url];
  return entry ?? FALLBACK_BOUNDS;
}

/** Same rule as legacy ModelAsset.normalizeScale — max(x,z) footprint fit. */
export function resolveUniformScale(url: string, targetWidth?: number): number {
  if (!targetWidth) return 1;
  const { size } = getIntrinsicBounds(url);
  const footprint = Math.max(size[0], size[2], 0.001);
  return targetWidth / footprint;
}

export function resolveNormalizedLayout(url: string, targetWidth?: number): NormalizedModelLayout {
  const intrinsic = getIntrinsicBounds(url);
  const uniformScale = resolveUniformScale(url, targetWidth);
  const min: [number, number, number] = [
    intrinsic.min[0] * uniformScale,
    intrinsic.min[1] * uniformScale,
    intrinsic.min[2] * uniformScale,
  ];
  const max: [number, number, number] = [
    intrinsic.max[0] * uniformScale,
    intrinsic.max[1] * uniformScale,
    intrinsic.max[2] * uniformScale,
  ];
  const size: [number, number, number] = [
    max[0] - min[0],
    max[1] - min[1],
    max[2] - min[2],
  ];
  return {
    uniformScale,
    localBounds: { min, max, size },
    footprintWidth: Math.max(size[0], size[2]),
  };
}

/** Rotate local X/Z extents by rotationY around origin (building group convention). */
export function resolveRotatedFootprint(
  layout: NormalizedModelLayout,
  rotationY = 0,
): RotatedFootprint {
  const { min, max } = layout.localBounds;
  const corners: [number, number][] = [
    [min[0], min[2]],
    [min[0], max[2]],
    [max[0], min[2]],
    [max[0], max[2]],
  ];
  const cos = Math.cos(rotationY);
  const sin = Math.sin(rotationY);
  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  for (const [x, z] of corners) {
    const rx = x * cos - z * sin;
    const rz = x * sin + z * cos;
    minX = Math.min(minX, rx);
    maxX = Math.max(maxX, rx);
    minZ = Math.min(minZ, rz);
    maxZ = Math.max(maxZ, rz);
  }
  return {
    halfWidthX: (maxX - minX) / 2,
    halfWidthZ: (maxZ - minZ) / 2,
    depthX: maxX - minX,
    depthZ: maxZ - minZ,
    height: layout.localBounds.size[1],
  };
}

/** Facade convention: +Z when rotY=0; -Z when rotY=π; +X when rotY=-π/2. */
export type FacadeDirection = '+X' | '-X' | '+Z' | '-Z';

export function resolveFacadeDirection(rotationY: number): FacadeDirection {
  const normalized = ((rotationY % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  if (Math.abs(normalized - 0) < 0.01 || Math.abs(normalized - Math.PI * 2) < 0.01) return '+Z';
  if (Math.abs(normalized - Math.PI) < 0.01) return '-Z';
  if (Math.abs(normalized - Math.PI / 2) < 0.01) return '-X';
  if (Math.abs(normalized - (Math.PI * 3) / 2) < 0.01) return '+X';
  return '+Z';
}

export function facadeOffset(
  facade: FacadeDirection,
  distance: number,
): [number, number, number] {
  switch (facade) {
    case '+Z':
      return [0, 0, distance];
    case '-Z':
      return [0, 0, -distance];
    case '+X':
      return [distance, 0, 0];
    case '-X':
      return [-distance, 0, 0];
  }
}
