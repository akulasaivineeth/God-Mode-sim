/**
 * Evidence portrait camera math — presentation only (M02 R11).
 *
 * Computes a close front/3-quarter framing from the live citizen transform so
 * capture harnesses can re-apply every frame while the citizen moves at 1×.
 */
export interface PortraitOpts {
  distance?: number;
  sideOffset?: number;
  eyeHeight?: number;
  chestHeight?: number;
  /**
   * When true, place the camera on a fixed world south-east arc so building
   * facing does not push the lens into walls or foliage (R11 evidence).
   */
  worldFixed?: boolean;
}

export interface PortraitCitizen {
  x: number;
  z: number;
  facingRadians: number;
}

export function computePortraitCamera(
  citizen: PortraitCitizen,
  opts: PortraitOpts = {},
): { position: [number, number, number]; target: [number, number, number] } {
  const distance = opts.distance ?? 2.0;
  const sideOffset = opts.sideOffset ?? 0.45;
  const eyeHeight = opts.eyeHeight ?? 2.0;
  const chestHeight = opts.chestHeight ?? 1.45;
  const { x, z, facingRadians } = citizen;

  if (opts.worldFixed) {
    // East-side elevated 3/4 view — avoids west-side building walls occluding west-side facilities.
    const camX = x + distance;
    const camZ = z + sideOffset;
    return {
      position: [camX, eyeHeight, camZ],
      target: [x, chestHeight, z],
    };
  }

  const fwdX = Math.sin(facingRadians);
  const fwdZ = Math.cos(facingRadians);
  const rightX = Math.cos(facingRadians);
  const rightZ = -Math.sin(facingRadians);
  const camX = x + fwdX * distance + rightX * sideOffset;
  const camZ = z + fwdZ * distance + rightZ * sideOffset;
  return {
    position: [camX, eyeHeight, camZ],
    target: [x, chestHeight, z],
  };
}
