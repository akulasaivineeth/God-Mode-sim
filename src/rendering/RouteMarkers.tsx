/**
 * Route markers for the M02 lived-in vertical slice — home/store/workplace path.
 */
import { CANONICAL_TOWN } from '@/world/townLayout';
import { FACILITY_POINTS, M02_CITIZEN_ASSIGNMENTS } from '@/world/facilityPoints';
import { terrainHeightAt } from '@/world/townLayout';

function markerPosition(facilityId: string): [number, number, number] {
  const point = FACILITY_POINTS.find((entry) => entry.facilityId === facilityId);
  if (!point) return [0, 0, 0];
  const y = terrainHeightAt(point.entrance.x, point.entrance.z) + 0.08;
  return [point.entrance.x, y, point.entrance.z];
}

export function RouteMarkers() {
  const routeIds = [
    M02_CITIZEN_ASSIGNMENTS.homeId,
    M02_CITIZEN_ASSIGNMENTS.storeId,
    M02_CITIZEN_ASSIGNMENTS.workplaceId,
  ];

  const colors: Record<string, string> = {
    'house-1': '#8ec5ff',
    store: '#ffd27a',
    workshop: '#b8a0ff',
  };

  return (
    <group>
      {routeIds.map((facilityId) => {
        const [x, y, z] = markerPosition(facilityId);
        const building = CANONICAL_TOWN.buildings.find((entry) => entry.id === facilityId);
        return (
          <group key={facilityId} position={[x, y, z]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.55, 0.85, 24]} />
              <meshStandardMaterial color={colors[facilityId] ?? '#ffffff'} transparent opacity={0.75} />
            </mesh>
            {building ? (
              <mesh position={[0, 0.05, -1.2]}>
                <boxGeometry args={[0.8, 0.08, 0.35]} />
                <meshStandardMaterial color={colors[facilityId] ?? '#ffffff'} />
              </mesh>
            ) : null}
          </group>
        );
      })}
    </group>
  );
}
