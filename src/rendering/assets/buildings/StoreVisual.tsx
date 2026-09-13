/**
 * M02 general store — dedicated Kenney commercial building.
 */
import { terrainHeightAt } from '@/world/townLayout';
import { ModelAsset } from '../ModelAsset';
import { WorldSign } from '../WorldSign';
import { KENNEY_ASSETS, QUATERNIUS_ASSETS } from '../EnvironmentAssetRegistry';

export function StoreVisual() {
  const x = -11;
  const z = 11;
  const y = terrainHeightAt(x, z);

  return (
    <group position={[x, y, z]}>
      <ModelAsset url="/assets/glb/kenney/store-general.glb" targetWidth={9.5} rotation={[0, Math.PI, 0]} />
      <WorldSign text="GENERAL STORE" position={[0, 4.2, -4.5]} rotation={[0, Math.PI, 0]} width={3.4} height={0.65} fontSize={40} />
      <ModelAsset url={KENNEY_ASSETS.pathShort} position={[0, 0.02, -5.5]} rotation={[0, Math.PI, 0]} scale={3} castShadow={false} />
      <ModelAsset url={QUATERNIUS_ASSETS.bush} position={[3.2, 0, -4.8]} scale={0.9} castShadow={false} />
    </group>
  );
}
