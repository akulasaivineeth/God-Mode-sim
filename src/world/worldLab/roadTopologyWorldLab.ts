/**
 * WF02 R9 — hero neighborhood road junction metadata.
 */
import { KENNEY_ASSETS } from '@/rendering/assets/EnvironmentAssetRegistry';
import type { RoadJunction } from '@/rendering/environment/roadTopology';

export const HERO_ROAD_JUNCTIONS: readonly RoadJunction[] = [
  {
    id: 'hero-center-crossing',
    position: { x: 0, z: -6 },
    exclusionRadius: 5.8,
    asset: KENNEY_ASSETS.roadCrossing,
    scale: 1.5,
    rotY: 0,
    yLift: 0.04,
  },
  {
    id: 'hero-commercial-tee',
    position: { x: 0, z: 8 },
    exclusionRadius: 4.8,
    asset: KENNEY_ASSETS.roadCurvePavement,
    scale: 1.5,
    rotY: Math.PI / 2,
    yLift: 0.04,
  },
  {
    id: 'hero-civic-west',
    position: { x: -18, z: -10 },
    exclusionRadius: 4.2,
    asset: KENNEY_ASSETS.roadBend,
    scale: 1.5,
    rotY: Math.PI * 0.75,
    yLift: 0.04,
  },
  {
    id: 'hero-civic-east',
    position: { x: 18, z: -10 },
    exclusionRadius: 4.2,
    asset: KENNEY_ASSETS.roadBend,
    scale: 1.5,
    rotY: -Math.PI * 0.75,
    yLift: 0.04,
  },
];
