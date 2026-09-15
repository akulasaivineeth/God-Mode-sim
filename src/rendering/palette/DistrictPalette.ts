/**
 * WF02 R4.1 district palette roles — presentation-only ground/canopy/accent colors.
 * Roof tint removed (Kenney GLBs are single merged colormap meshes).
 */
import { Color, MeshStandardMaterial } from 'three';

export const DISTRICT_PALETTE = {
  groundMeadow: '#5a7348',
  groundResidential: '#c8b888',
  groundCommercial: '#d4bc94',
  groundFarm: '#b8a868',
  groundPark: '#6a9a58',
  canopyDeep: '#3d6b38',
  canopyLight: '#7aaa58',
  accentWarm: '#c87848',
  accentCool: '#6a8a9a',
} as const;

const materialCache = new Map<string, MeshStandardMaterial>();

export function districtOverlayMaterial(hex: string, opacity = 0.42): MeshStandardMaterial {
  const key = `${hex}:${opacity}`;
  let mat = materialCache.get(key);
  if (!mat) {
    mat = new MeshStandardMaterial({
      color: new Color(hex),
      transparent: true,
      opacity,
      depthWrite: false,
      roughness: 0.92,
    });
    materialCache.set(key, mat);
  }
  return mat;
}
