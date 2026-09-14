/**
 * Bridge-centric river evidence camera — presentation only (M02 R12).
 *
 * Derives a low oblique cross-river framing from authored river geometry so the
 * shot reads as water + both banks + bridge, not another town overview.
 */
import { bridgePlacementOnRiver } from './environment/riverGeometry';
import type { CameraPreset } from './cameraPresets';
import { CANONICAL_TOWN, terrainHeightAt } from '@/world/townLayout';

export interface RiverFrameVectors {
  bridge: { x: number; z: number; rotY: number };
  tangent: { x: number; z: number };
  normal: { x: number; z: number };
}

/** Tangent + outward normal at the bridge crossing on the authored polyline. */
export function riverFrameVectorsAtBridge(
  points: readonly { x: number; z: number }[],
  targetZ = 0,
): RiverFrameVectors {
  const bridge = bridgePlacementOnRiver(points, targetZ);
  let tangentX = 0;
  let tangentZ = 1;
  for (let i = 0; i < points.length - 1; i += 1) {
    const a = points[i];
    const b = points[i + 1];
    const spans =
      (a.z <= targetZ && b.z >= targetZ) || (a.z >= targetZ && b.z <= targetZ);
    if (!spans || a.z === b.z) continue;
    tangentX = b.x - a.x;
    tangentZ = b.z - a.z;
    break;
  }
  const tLen = Math.hypot(tangentX, tangentZ) || 1;
  tangentX /= tLen;
  tangentZ /= tLen;
  // Right-hand normal in XZ — positive X is the east / river-outward side for our layout.
  const normalX = tangentZ;
  const normalZ = -tangentX;
  return {
    bridge,
    tangent: { x: tangentX, z: tangentZ },
    normal: { x: normalX, z: normalZ },
  };
}

/** Dedicated bridge/river subject preset — lower than Overview/Angled altitude. */
export function computeRiverBridgePreset(
  points: readonly { x: number; z: number }[] = CANONICAL_TOWN.river.points,
): CameraPreset {
  const { bridge, tangent, normal } = riverFrameVectorsAtBridge(points, 0);
  const bridgeY = terrainHeightAt(bridge.x, bridge.z);

  // East-bank oblique derived from bridge frame — calibrated for readable water ribbon.
  const height = 22;
  const lateral = 9.5;
  const tangentOffset = 32;

  const camX = bridge.x + normal.x * lateral + tangent.x * tangentOffset;
  const camZ = bridge.z + normal.z * lateral + tangent.z * tangentOffset;
  const camY = bridgeY + height;

  const targetX = bridge.x - normal.x * 0.5;
  const targetZ = bridge.z;
  const targetY = bridgeY + 1.0;

  return {
    position: [camX, camY, camZ],
    target: [targetX, targetY, targetZ],
  };
}

/** True when preset materially differs from overview/angled and targets the bridge corridor. */
export function assertRiverEvidenceSemantics(
  river: CameraPreset,
  overview: CameraPreset,
  angled: CameraPreset,
  bridgeX: number,
  bridgeZ: number,
): { ok: true } | { ok: false; reason: string } {
  const delta = (a: CameraPreset, b: CameraPreset) =>
    Math.hypot(
      a.position[0] - b.position[0],
      a.position[1] - b.position[1],
      a.position[2] - b.position[2],
    ) +
    Math.hypot(
      a.target[0] - b.target[0],
      a.target[1] - b.target[1],
      a.target[2] - b.target[2],
    );

  if (delta(river, overview) < 12) {
    return { ok: false, reason: 'river preset too close to overview' };
  }
  if (delta(river, angled) < 12) {
    return { ok: false, reason: 'river preset too close to angled' };
  }
  if (river.position[1] > 35) {
    return { ok: false, reason: 'river preset altitude too high (overview-like)' };
  }
  const targetDist = Math.hypot(river.target[0] - bridgeX, river.target[2] - bridgeZ);
  if (targetDist > 18) {
    return { ok: false, reason: 'river target too far from bridge' };
  }
  return { ok: true };
}
