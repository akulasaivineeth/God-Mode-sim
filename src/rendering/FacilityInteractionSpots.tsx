/**
 * Lightweight M02 facility presentation — doorway thresholds and shared props.
 *
 * Plain English: Small reusable cues so home/store/workplace use is visible at
 * Angled/Street zoom without full interiors (VIS-003 deferred).
 */
import { FACILITY_POINTS, type FacilityPresentationKind } from '@/world/facilityPoints';
import { terrainHeightAt } from '@/world/townLayout';

function propForKind(kind: FacilityPresentationKind, color: string) {
  switch (kind) {
    case 'chair':
      return (
        <group>
          <mesh position={[0, 0.22, 0]} castShadow>
            <boxGeometry args={[0.38, 0.08, 0.38]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh position={[0, 0.48, -0.08]} castShadow>
            <boxGeometry args={[0.36, 0.44, 0.08]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </group>
      );
    case 'counter':
      return (
        <mesh position={[0, 0.55, 0]} castShadow>
          <boxGeometry args={[0.7, 0.9, 0.35]} />
          <meshStandardMaterial color={color} />
        </mesh>
      );
    case 'workbench':
      return (
        <group>
          <mesh position={[0, 0.42, 0]} castShadow>
            <boxGeometry args={[0.75, 0.12, 0.45]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh position={[0, 0.62, -0.15]} castShadow>
            <boxGeometry args={[0.5, 0.35, 0.12]} />
            <meshStandardMaterial color="#6a5a48" />
          </mesh>
        </group>
      );
  }
}

const SPOT_COLORS: Record<string, string> = {
  'house-1': '#7a5a42',
  store: '#b08a5a',
  workshop: '#6a6258',
};

export function FacilityInteractionSpots() {
  return (
    <group>
      {FACILITY_POINTS.map((point) => {
        const entranceY = terrainHeightAt(point.entrance.x, point.entrance.z);
        const spotY = terrainHeightAt(point.presentationSpot.x, point.presentationSpot.z);
        const color = SPOT_COLORS[point.facilityId] ?? '#7a6a5a';

        return (
          <group key={point.facilityId}>
            <group position={[point.entrance.x, entranceY, point.entrance.z]}>
              <mesh position={[0, 0.55, 0]} castShadow>
                <boxGeometry args={[0.9, 1.1, 0.08]} />
                <meshStandardMaterial color="#d8cbb8" />
              </mesh>
              <mesh position={[0, 0.02, 0.12]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.75, 0.35]} />
                <meshStandardMaterial color="#4a4038" />
              </mesh>
            </group>

            <group
              position={[point.presentationSpot.x, spotY, point.presentationSpot.z]}
              rotation={[0, point.indoorFacingRadians, 0]}
            >
              {propForKind(point.presentationKind, color)}
            </group>
          </group>
        );
      })}
    </group>
  );
}
