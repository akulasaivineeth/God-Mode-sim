/**
 * M02 general store — dedicated Kenney commercial building + awning.
 */
import { terrainHeightAt } from '@/world/townLayout';
import { ModelAsset } from '../ModelAsset';
import { WorldSign } from '../WorldSign';
import { KENNEY_ASSETS } from '../EnvironmentAssetRegistry';

export function StoreVisual() {
  const x = -11;
  const z = 11;
  const y = terrainHeightAt(x, z);

  return (
    <group position={[x, y, z]} rotation={[0, Math.PI, 0]}>
      <ModelAsset url={KENNEY_ASSETS.storeGeneral} targetWidth={9.5} />
      <ModelAsset url={KENNEY_ASSETS.storeAwning} position={[0, 2.8, -3.8]} scale={2.2} castShadow={false} />
      <WorldSign text="GENERAL STORE" position={[0, 4.5, -4.5]} width={3.4} height={0.65} fontSize={40} />
      <ModelAsset url={KENNEY_ASSETS.pathShort} position={[0, 0.02, -5.5]} scale={3} castShadow={false} />
    </group>
  );
}
