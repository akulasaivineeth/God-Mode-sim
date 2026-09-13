/**
 * M02 workshop — dedicated Kenney industrial building (R8 street identity).
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
      <ModelAsset url={KENNEY_ASSETS.workshopIndustrial} targetWidth={11.5} />
      <WorldSign
        text="RIVERSIDE WORKSHOP"
        position={[0, 5.4, -5.4]}
        rotation={[0, Math.PI, 0]}
        width={4.4}
        height={0.75}
        fontSize={38}
      />
      <ModelAsset url={KENNEY_ASSETS.roadDriveway} position={[0, 0.02, -6.8]} scale={1.85} castShadow={false} />
      {/* Industrial yard props — readable at workshop-street camera */}
      <mesh position={[-3.2, 0.55, -5.2]} castShadow>
        <boxGeometry args={[1.0, 1.0, 1.0]} />
        <primitive object={MAT.crate} attach="material" />
      </mesh>
      <mesh position={[2.8, 0.45, -5.4]} castShadow>
        <cylinderGeometry args={[0.42, 0.48, 0.9, 10]} />
        <primitive object={MAT.metalDark} attach="material" />
      </mesh>
      <mesh position={[0.8, 0.35, -4.6]} castShadow>
        <boxGeometry args={[0.7, 0.7, 0.7]} />
        <primitive object={MAT.crate} attach="material" />
      </mesh>
      <mesh position={[-1.2, 0.3, -4.8]} castShadow>
        <cylinderGeometry args={[0.32, 0.36, 0.65, 8]} />
        <primitive object={MAT.metal} attach="material" />
      </mesh>
    </group>
  );
}
