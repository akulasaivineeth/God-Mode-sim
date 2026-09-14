/**
 * M02 home — dedicated Kenney suburban cottage (R8 street identity).
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
      <ModelAsset url={KENNEY_ASSETS.homeCottage} targetWidth={7.8} />
      <WorldSign text="11 Riverside Lane" position={[0, 4.1, 4.5]} width={3.0} height={0.55} fontSize={36} />
      <ModelAsset url={KENNEY_ASSETS.pathShort} position={[0, 0.02, 6.2]} scale={2.8} castShadow={false} />
      <ModelAsset url={KENNEY_ASSETS.fenceLow} position={[-2.4, 0, 4.8]} rotation={[0, Math.PI / 2, 0]} scale={2.2} castShadow={false} />
      <ModelAsset url={KENNEY_ASSETS.fenceLow} position={[2.4, 0, 4.8]} rotation={[0, Math.PI / 2, 0]} scale={2.2} castShadow={false} />
    </group>
  );
}
