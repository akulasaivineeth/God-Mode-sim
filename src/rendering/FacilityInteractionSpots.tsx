/**
 * Lightweight M02 facility presentation — doorway thresholds and shared props.
 *
 * Plain English: Authored interaction spots so home/store/workplace use is visible
 * at Angled/Street zoom without full interiors (VIS-003 deferred).
 */
import { useMemo } from 'react';
import { FACILITY_POINTS, type FacilityPresentationKind } from '@/world/facilityPoints';
import { terrainHeightAt } from '@/world/townLayout';
import { MAT } from './sharedMaterials';

function propForKind(kind: FacilityPresentationKind) {
  switch (kind) {
    case 'chair':
      return (
        <group>
          <mesh position={[0, 0.22, 0]} castShadow>
            <boxGeometry args={[0.42, 0.08, 0.42]} />
            <primitive object={MAT.wood} attach="material" />
          </mesh>
          <mesh position={[0, 0.5, -0.1]} castShadow>
            <boxGeometry args={[0.4, 0.48, 0.1]} />
            <primitive object={MAT.woodDark} attach="material" />
          </mesh>
        </group>
      );
    case 'counter':
      return (
        <group>
          <mesh position={[0, 0.55, 0]} castShadow>
            <boxGeometry args={[0.8, 0.95, 0.38]} />
            <primitive object={MAT.wood} attach="material" />
          </mesh>
          <mesh position={[0, 1.05, -0.1]} castShadow>
            <boxGeometry args={[0.7, 0.08, 0.3]} />
            <primitive object={MAT.woodDark} attach="material" />
          </mesh>
        </group>
      );
    case 'workbench':
      return (
        <group>
          <mesh position={[0, 0.42, 0]} castShadow>
            <boxGeometry args={[0.85, 0.14, 0.5]} />
            <primitive object={MAT.wood} attach="material" />
          </mesh>
          <mesh position={[0, 0.65, -0.18]} castShadow>
            <boxGeometry args={[0.55, 0.38, 0.14]} />
            <primitive object={MAT.metal} attach="material" />
          </mesh>
          <mesh position={[0.3, 0.72, 0.05]} rotation={[0.4, 0, -0.3]} castShadow>
            <boxGeometry args={[0.06, 0.5, 0.06]} />
            <primitive object={MAT.metal} attach="material" />
          </mesh>
        </group>
      );
  }
}

export function FacilityInteractionSpots() {
  const points = useMemo(() => FACILITY_POINTS, []);

  return (
    <group>
      {points.map((point) => {
        const entranceY = terrainHeightAt(point.entrance.x, point.entrance.z);
        const spotY = terrainHeightAt(point.presentationSpot.x, point.presentationSpot.z);

        return (
          <group key={point.facilityId}>
            <group position={[point.entrance.x, entranceY, point.entrance.z]}>
              <mesh position={[0, 0.55, 0]} castShadow>
                <boxGeometry args={[0.95, 1.15, 0.1]} />
                <primitive object={MAT.trimWhite} attach="material" />
              </mesh>
              <mesh position={[0, 0.02, 0.14]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[0.8, 0.38]} />
                <primitive object={MAT.doorDark} attach="material" />
              </mesh>
            </group>

            <group
              position={[point.presentationSpot.x, spotY, point.presentationSpot.z]}
              rotation={[0, point.indoorFacingRadians, 0]}
            >
              {propForKind(point.presentationKind)}
            </group>
          </group>
        );
      })}
    </group>
  );
}
