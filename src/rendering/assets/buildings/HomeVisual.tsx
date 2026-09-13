/**
 * M02 home — dedicated Kenney suburban cottage (skips generic BuildingMesh).
 */
import { terrainHeightAt } from '@/world/townLayout';
import { ModelAsset } from '../ModelAsset';
import { WorldSign } from '../WorldSign';
import { KENNEY_ASSETS, QUATERNIUS_ASSETS } from '../EnvironmentAssetRegistry';

export function HomeVisual() {
  const x = 11;
  const z = -10;
  const y = terrainHeightAt(x, z);

  return (
    <group position={[x, y, z]}>
      <ModelAsset url="/assets/glb/kenney/home-cottage.glb" targetWidth={7.5} />
      <WorldSign text="11 Riverside Lane" position={[0, 3.8, 4.2]} width={2.8} height={0.5} fontSize={34} />
      <ModelAsset url={KENNEY_ASSETS.pathShort} position={[0, 0.02, 5.8]} scale={2.5} castShadow={false} />
      <ModelAsset url={QUATERNIUS_ASSETS.bushFlowers} position={[-2.5, 0, 3.8]} scale={0.8} castShadow={false} />
      <ModelAsset url={QUATERNIUS_ASSETS.commonTree1} position={[3.5, 0, 4.2]} scale={0.55} castShadow={false} />
    </group>
  );
}
