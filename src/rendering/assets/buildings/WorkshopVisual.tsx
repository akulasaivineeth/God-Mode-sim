/**
 * M02 workshop — dedicated Kenney industrial building.
 */
import { terrainHeightAt } from '@/world/townLayout';
import { ModelAsset } from '../ModelAsset';
import { WorldSign } from '../WorldSign';
import { KENNEY_ASSETS } from '../EnvironmentAssetRegistry';

export function WorkshopVisual() {
  const x = -11;
  const z = 23;
  const y = terrainHeightAt(x, z);

  return (
    <group position={[x, y, z]}>
      <ModelAsset url="/assets/glb/kenney/workshop-industrial.glb" targetWidth={11} rotation={[0, Math.PI, 0]} />
      <WorldSign text="RIVERSIDE WORKSHOP" position={[0, 4.5, -4.8]} rotation={[0, Math.PI, 0]} width={3.8} height={0.65} fontSize={36} />
      <ModelAsset url={KENNEY_ASSETS.roadDriveway} position={[0, 0.02, -5.8]} rotation={[0, Math.PI, 0]} scale={1.6} castShadow={false} />
    </group>
  );
}
