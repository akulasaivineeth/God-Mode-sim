/**
 * M02 general store — dedicated Kenney commercial building + awning (R8 street identity).
 */
import { terrainHeightAt } from '@/world/townLayout';
import { ModelAsset } from '../ModelAsset';
import { WorldSign } from '../WorldSign';
import { KENNEY_ASSETS } from '../EnvironmentAssetRegistry';

export function StoreVisual() {
  const x = -11;
  const z = 11;
  const y = terrainHeightAt(x, z);

  // Facade/awning/path authored on local -Z so the visible front faces the simulation
  // doorstep at z = center - 6 (south public side). Do not rotate π — that mirrored
  // the entrance onto the north/rear edge (M02-020).
  return (
    <group position={[x, y, z]}>
      <ModelAsset url={KENNEY_ASSETS.storeGeneral} targetWidth={9.5} />
      <ModelAsset url={KENNEY_ASSETS.storeAwning} position={[0, 3.1, -4.2]} scale={2.45} castShadow={false} />
      <WorldSign
        text="GENERAL STORE"
        position={[0, 5.2, -5.2]}
        rotation={[0, Math.PI, 0]}
        width={4.2}
        height={0.75}
        fontSize={44}
      />
      <ModelAsset url={KENNEY_ASSETS.pathShort} position={[0, 0.02, -6.2]} scale={3.2} castShadow={false} />
      <ModelAsset url={KENNEY_ASSETS.drivewayShort} position={[0, 0.02, -7.4]} scale={1.4} castShadow={false} />
    </group>
  );
}
