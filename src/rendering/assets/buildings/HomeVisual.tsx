/**
 * M02 home — dedicated Kenney suburban cottage (skips generic BuildingMesh).
 */
import { terrainHeightAt } from '@/world/townLayout';
import { ModelAsset } from '../ModelAsset';
import { WorldSign } from '../WorldSign';
import { KENNEY_ASSETS } from '../EnvironmentAssetRegistry';

export function HomeVisual() {
  const x = 11;
  const z = -10;
  const y = terrainHeightAt(x, z);

  return (
    <group position={[x, y, z]} rotation={[0, -Math.PI / 2, 0]}>
      <ModelAsset url={KENNEY_ASSETS.homeCottage} targetWidth={7.5} />
      <WorldSign text="11 Riverside Lane" position={[0, 3.8, 4.2]} width={2.8} height={0.5} fontSize={34} />
      <ModelAsset url={KENNEY_ASSETS.pathShort} position={[0, 0.02, 5.8]} scale={2.5} castShadow={false} />
      <ModelAsset url={KENNEY_ASSETS.fenceLow} position={[-2.2, 0, 4.5]} rotation={[0, Math.PI / 2, 0]} scale={2.0} castShadow={false} />
      <ModelAsset url={KENNEY_ASSETS.fenceLow} position={[2.2, 0, 4.5]} rotation={[0, Math.PI / 2, 0]} scale={2.0} castShadow={false} />
    </group>
  );
}
