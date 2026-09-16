/**
 * WF02 bounds-anchored building dressing — derives sign/awning/path/fence transforms from
 * the shared modelLayout authority. Attachments remain render-only; simulation centers
 * and entrances are unchanged.
 */
import { KENNEY_ASSETS } from '../EnvironmentAssetRegistry';
import {
  facadeOffset,
  resolveFacadeDirection,
  resolveNormalizedLayout,
  resolveRotatedFootprint,
  resolveUniformScale,
  type FacadeDirection,
} from '../modelLayout';
import type { BuildingPrefabConfig } from './buildingPrefabConfig';
import { resolveVisualTransform as resolveVisualTransformFromLayout } from '../../environment/VisualTownLayout';

export type AnchorExtraKind =
  | 'awning'
  | 'path-short'
  | 'path-long'
  | 'driveway-short'
  | 'road-driveway'
  | 'fence-left'
  | 'fence-right'
  | 'fence-front'
  | 'parasol-right';

export interface ResolvedAnchorExtra {
  url: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  targetWidth?: number;
  castShadow?: boolean;
}

export interface BuildingPresentationAnchors {
  signPosition?: [number, number, number];
  signRotation: [number, number, number];
  extras: ResolvedAnchorExtra[];
}

export interface PresentationTransform {
  /** Render-only offset from authored center (simulation unchanged). */
  positionOffset: [number, number, number];
  /** Render-only Y rotation delta. */
  rotationDelta: number;
}

const EXTRA_ASSET: Record<AnchorExtraKind, string> = {
  awning: KENNEY_ASSETS.storeAwning,
  'path-short': KENNEY_ASSETS.pathShort,
  'path-long': KENNEY_ASSETS.pathLong,
  'driveway-short': KENNEY_ASSETS.drivewayShort,
  'road-driveway': KENNEY_ASSETS.roadDriveway,
  'fence-left': KENNEY_ASSETS.fenceLow,
  'fence-right': KENNEY_ASSETS.fenceLow,
  'fence-front': KENNEY_ASSETS.fenceLow,
  'parasol-right': KENNEY_ASSETS.cafeParasol,
};

/** Bounded presentation-only transforms — R7.1 VisualTownLayout authority. */
export function resolvePresentationTransform(buildingId: string): PresentationTransform {
  return resolveVisualTransformFromLayout(buildingId);
}

export function resolveVisualTransform(buildingId: string): PresentationTransform {
  return resolveVisualTransformFromLayout(buildingId);
}

function lateralOffset(facade: FacadeDirection, distance: number, side: 'left' | 'right'): [number, number, number] {
  const sign = side === 'left' ? -1 : 1;
  switch (facade) {
    case '+Z':
      return [sign * distance, 0, 0];
    case '-Z':
      return [sign * -distance, 0, 0];
    case '+X':
      return [0, 0, sign * -distance];
    case '-X':
      return [0, 0, sign * distance];
  }
}

function signRotationForFacade(facade: FacadeDirection): [number, number, number] {
  switch (facade) {
    case '+Z':
      return [0, 0, 0];
    case '-Z':
      return [0, Math.PI, 0];
    case '+X':
      return [0, -Math.PI / 2, 0];
    case '-X':
      return [0, Math.PI / 2, 0];
  }
}

function atFacade(
  facade: FacadeDirection,
  depth: number,
  y: number,
): [number, number, number] {
  const [x, , z] = facadeOffset(facade, depth);
  return [x, y, z];
}

function resolveExtra(
  kind: AnchorExtraKind,
  facade: FacadeDirection,
  layout: ReturnType<typeof resolveNormalizedLayout>,
  footprint: ReturnType<typeof resolveRotatedFootprint>,
  scaleMultiplier = 1,
): ResolvedAnchorExtra {
  const halfFacadeDepth = facade === '+Z' || facade === '-Z' ? footprint.halfWidthZ : footprint.halfWidthX;
  const url = EXTRA_ASSET[kind];
  const baseScale = resolveUniformScale(url);

  switch (kind) {
    case 'awning':
      return {
        url,
        position: atFacade(facade, halfFacadeDepth * 0.72, layout.localBounds.max[1] * 0.55),
        scale: baseScale * 2.45 * scaleMultiplier,
        castShadow: false,
      };
    case 'path-short':
      return {
        url,
        position: atFacade(facade, halfFacadeDepth + 0.55, 0.02),
        scale: baseScale * 2.8 * scaleMultiplier,
        castShadow: false,
      };
    case 'path-long':
      return {
        url,
        position: atFacade(facade, halfFacadeDepth + 0.75, 0.02),
        scale: baseScale * 3.0 * scaleMultiplier,
        castShadow: false,
      };
    case 'driveway-short':
      return {
        url,
        position: atFacade(facade, halfFacadeDepth + 0.45, 0.02),
        scale: baseScale * 2.0 * scaleMultiplier,
        castShadow: false,
      };
    case 'road-driveway':
      return {
        url,
        position: atFacade(facade, halfFacadeDepth + 0.65, 0.02),
        scale: baseScale * 1.85 * scaleMultiplier,
        castShadow: false,
      };
    case 'fence-left':
      return {
        url,
        position: lateralOffset(facade, halfFacadeDepth * 0.55, 'left'),
        rotation: [0, Math.PI / 2, 0],
        scale: baseScale * 2.2 * scaleMultiplier,
        castShadow: false,
      };
    case 'fence-right':
      return {
        url,
        position: lateralOffset(facade, halfFacadeDepth * 0.55, 'right'),
        rotation: [0, Math.PI / 2, 0],
        scale: baseScale * 2.2 * scaleMultiplier,
        castShadow: false,
      };
    case 'fence-front':
      return {
        url,
        position: atFacade(facade, halfFacadeDepth + 0.35, 0.02),
        rotation: [0, Math.PI / 2, 0],
        scale: baseScale * 2.4 * scaleMultiplier,
        castShadow: false,
      };
    case 'parasol-right':
      return {
        url,
        position: lateralOffset(facade, halfFacadeDepth * 0.35, 'right'),
        scale: baseScale * 1.8 * scaleMultiplier,
        castShadow: false,
      };
  }
}

export function resolveBuildingAnchors(config: BuildingPrefabConfig): BuildingPresentationAnchors {
  const presentation = resolveVisualTransformFromLayout(config.buildingId);
  const rotY = (config.rotationY ?? 0) + presentation.rotationDelta;
  const layout = resolveNormalizedLayout(config.assetUrl, config.targetWidth);
  const footprint = resolveRotatedFootprint(layout, rotY);
  const facade = resolveFacadeDirection(rotY);

  const extras: ResolvedAnchorExtra[] = (config.extras ?? []).map((extra) =>
    resolveExtra(extra.kind, facade, layout, footprint, extra.scaleMultiplier ?? 1),
  );

  let signPosition: [number, number, number] | undefined;
  if (config.sign) {
    const signY = layout.localBounds.max[1] * 0.92;
    const signDepth = halfFacadeDepthForSign(facade, footprint);
    signPosition = atFacade(facade, signDepth, signY);
  }

  return {
    signPosition,
    signRotation: signRotationForFacade(facade),
    extras,
  };
}

function halfFacadeDepthForSign(
  facade: FacadeDirection,
  footprint: ReturnType<typeof resolveRotatedFootprint>,
): number {
  const half = facade === '+Z' || facade === '-Z' ? footprint.halfWidthZ : footprint.halfWidthX;
  return half * 0.78;
}
