/**
 * M02 workshop — dedicated Kenney industrial building.
 */
import { terrainHeightAt } from '@/world/townLayout';
import { ModelAsset } from '../ModelAsset';
import { WorldSign } from '../WorldSign';
import { KENNEY_ASSETS } from '../EnvironmentAssetRegistry';
import { MAT } from '../../sharedMaterials';

export function WorkshopVisual() {
  const x = -11;
  const z = 23;
  const y = terrainHeightAt(x, z);

  return (
    <group position={[x, y, z]} rotation={[0, Math.PI, 0]}>
      <ModelAsset url={KENNEY_ASSETS.workshopIndustrial} targetWidth={11} />
      <WorldSign text="RIVERSIDE WORKSHOP" position={[0, 4.5, -4.8]} width={3.8} height={0.65} fontSize={36} />
      <ModelAsset url={KENNEY_ASSETS.roadDriveway} position={[0, 0.02, -5.8]} scale={1.6} castShadow={false} />
      {/* Industrial props */}
      <mesh position={[-2.5, 0.5, -4.2]} castShadow={false}>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <primitive object={MAT.crate} attach="material" />
      </mesh>
      <mesh position={[2.2, 0.35, -4.5]} castShadow={false}>
        <cylinderGeometry args={[0.35, 0.4, 0.7, 8]} />
        <primitive object={MAT.metalDark} attach="material" />
      </mesh>
      <mesh position={[0, 5.2, -2]} castShadow={false}>
        <cylinderGeometry args={[0.2, 0.25, 1.2, 6]} />
        <primitive object={MAT.metal} attach="material" />
      </mesh>
    </group>
  );
}
