/**
 * M02 lived-in corridor polish — VIS-001 / TOWN_IMPLEMENTATION_ROADMAP M02 slice.
 *
 * Plain English: Concentrated presentation upgrades along Alex's home → store →
 * workshop route. Facade identity, crosswalks, curbs, grouped landscaping, and
 * signage — without rewriting the whole M01 town shell.
 */
import { useMemo } from 'react';
import { terrainHeightAt } from '@/world/townLayout';
import { FACILITY_POINTS } from '@/world/facilityPoints';

function yAt(x: number, z: number, lift = 0.05) {
  return terrainHeightAt(x, z) + lift;
}

/** Stone paver at facility threshold — replaces debug route rings. */
function EntrancePaver({ x, z }: { x: number; z: number }) {
  const y = yAt(x, z, 0.06);
  return (
    <group position={[x, y, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1.1, 0.7]} />
        <meshStandardMaterial color="#a8a29c" roughness={0.8} />
      </mesh>
    </group>
  );
}

/** Zebra crossing stripes across a road segment. */
function Crosswalk({ x, z, alongX }: { x: number; z: number; alongX: boolean }) {
  const y = yAt(x, z, 0.055);
  const stripes = [];
  for (let i = -2; i <= 2; i += 1) {
    stripes.push(
      <mesh
        key={i}
        position={alongX ? [x + i * 0.35, y, z] : [x, y, z + i * 0.35]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={alongX ? [0.22, 1.8] : [1.8, 0.22]} />
        <meshStandardMaterial color="#e8e4dc" />
      </mesh>,
    );
  }
  return <group>{stripes}</group>;
}

function HomeFacade() {
  const bx = 11;
  const bz = -10;
  const baseY = yAt(bx, bz);
  return (
    <group position={[bx, baseY, bz]}>
      {/* Porch deck */}
      <mesh position={[0, 0.12, 2.8]} castShadow receiveShadow>
        <boxGeometry args={[4.2, 0.14, 1.6]} />
        <meshStandardMaterial color="#9a8570" roughness={0.85} />
      </mesh>
      {/* Porch roof */}
      <mesh position={[0, 2.6, 2.9]} castShadow>
        <boxGeometry args={[4.4, 0.1, 1.8]} />
        <meshStandardMaterial color="#6a4a38" roughness={0.8} />
      </mesh>
      <mesh position={[-1.6, 1.5, 2.85]} castShadow>
        <boxGeometry args={[0.12, 2.2, 0.12]} />
        <meshStandardMaterial color="#d8cbb8" />
      </mesh>
      <mesh position={[1.6, 1.5, 2.85]} castShadow>
        <boxGeometry args={[0.12, 2.2, 0.12]} />
        <meshStandardMaterial color="#d8cbb8" />
      </mesh>
      {/* Steps */}
      {[0, 1, 2].map((step) => (
        <mesh key={step} position={[0, 0.06 + step * 0.1, 3.5 + step * 0.25]} castShadow receiveShadow>
          <boxGeometry args={[2.2, 0.1, 0.35]} />
          <meshStandardMaterial color="#8a7a68" />
        </mesh>
      ))}
      {/* Picket fence segment */}
      {[-1.8, -0.9, 0, 0.9, 1.8].map((fx) => (
        <mesh key={fx} position={[fx, 0.45, 4.2]} castShadow>
          <boxGeometry args={[0.08, 0.7, 0.08]} />
          <meshStandardMaterial color="#e8e0d0" />
        </mesh>
      ))}
      <mesh position={[0, 0.72, 4.2]} castShadow>
        <boxGeometry args={[3.8, 0.06, 0.06]} />
        <meshStandardMaterial color="#e8e0d0" />
      </mesh>
      {/* Planters */}
      <mesh position={[-2.2, 0.25, 3.2]} castShadow>
        <boxGeometry args={[0.5, 0.35, 0.5]} />
        <meshStandardMaterial color="#8a5a3a" />
      </mesh>
      <mesh position={[-2.2, 0.55, 3.2]} castShadow>
        <sphereGeometry args={[0.28, 6, 6]} />
        <meshStandardMaterial color="#4a8a3a" />
      </mesh>
      <mesh position={[2.2, 0.25, 3.2]} castShadow>
        <boxGeometry args={[0.5, 0.35, 0.5]} />
        <meshStandardMaterial color="#8a5a3a" />
      </mesh>
      <mesh position={[2.2, 0.55, 3.2]} castShadow>
        <sphereGeometry args={[0.28, 6, 6]} />
        <meshStandardMaterial color="#6a9a4a" />
      </mesh>
      {/* Chimney */}
      <mesh position={[1.5, 5.2, -0.5]} castShadow>
        <boxGeometry args={[0.6, 1.4, 0.6]} />
        <meshStandardMaterial color="#8a4a3a" />
      </mesh>
    </group>
  );
}

function StoreFacade() {
  const bx = -11;
  const bz = 11;
  const baseY = yAt(bx, bz);
  return (
    <group position={[bx, baseY, bz]}>
      {/* Striped awning */}
      {[-1.2, -0.4, 0.4, 1.2].map((ax, i) => (
        <mesh key={ax} position={[ax, 3.2, 4.2]} castShadow>
          <boxGeometry args={[0.7, 0.12, 2.2]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#b84a3a' : '#e8dcc8'} roughness={0.8} />
        </mesh>
      ))}
      {/* Sign */}
      <mesh position={[0, 4.6, 4.25]} castShadow>
        <boxGeometry args={[3.2, 0.7, 0.12]} />
        <meshStandardMaterial color="#f2e8d0" />
      </mesh>
      <mesh position={[0, 4.6, 4.32]}>
        <boxGeometry args={[2.8, 0.45, 0.02]} />
        <meshStandardMaterial color="#4a3828" />
      </mesh>
      {/* Display windows */}
      <mesh position={[-2, 2.2, 3.55]} castShadow>
        <boxGeometry args={[2, 1.6, 0.1]} />
        <meshStandardMaterial color="#b8d4e8" roughness={0.2} metalness={0.1} />
      </mesh>
      <mesh position={[2, 2.2, 3.55]} castShadow>
        <boxGeometry args={[2, 1.6, 0.1]} />
        <meshStandardMaterial color="#b8d4e8" roughness={0.2} metalness={0.1} />
      </mesh>
      {/* Bench */}
      <mesh position={[3.5, 0.35, 5]} castShadow>
        <boxGeometry args={[1.2, 0.12, 0.4]} />
        <meshStandardMaterial color="#7a5a42" />
      </mesh>
      <mesh position={[3.2, 0.55, 5]} castShadow>
        <boxGeometry args={[0.1, 0.35, 0.1]} />
        <meshStandardMaterial color="#5a4030" />
      </mesh>
      <mesh position={[3.8, 0.55, 5]} castShadow>
        <boxGeometry args={[0.1, 0.35, 0.1]} />
        <meshStandardMaterial color="#5a4030" />
      </mesh>
      {/* Produce crates */}
      <mesh position={[-3.2, 0.25, 4.8]} castShadow>
        <boxGeometry args={[0.6, 0.45, 0.6]} />
        <meshStandardMaterial color="#a08050" />
      </mesh>
      <mesh position={[-3.2, 0.55, 4.8]} castShadow>
        <boxGeometry args={[0.55, 0.35, 0.55]} />
        <meshStandardMaterial color="#c0a060" />
      </mesh>
    </group>
  );
}

function WorkshopFacade() {
  const bx = -11;
  const bz = 23;
  const baseY = yAt(bx, bz);
  return (
    <group position={[bx, baseY, bz]}>
      {/* Garage bay door */}
      <mesh position={[0, 1.8, 3.15]} castShadow>
        <boxGeometry args={[4.5, 3.2, 0.12]} />
        <meshStandardMaterial color="#5a5e64" metalness={0.4} roughness={0.5} />
      </mesh>
      {/* Door panels */}
      {[-1.1, 0, 1.1].map((dx) => (
        <mesh key={dx} position={[dx, 1.8, 3.2]}>
          <boxGeometry args={[0.06, 2.8, 0.02]} />
          <meshStandardMaterial color="#4a4e54" metalness={0.3} />
        </mesh>
      ))}
      {/* Industrial accent band */}
      <mesh position={[0, 4.8, 3.1]} castShadow>
        <boxGeometry args={[5.5, 0.25, 0.15]} />
        <meshStandardMaterial color="#8a7a60" />
      </mesh>
      {/* Loading platform */}
      <mesh position={[0, 0.18, 4.2]} castShadow receiveShadow>
        <boxGeometry args={[3.5, 0.2, 1.2]} />
        <meshStandardMaterial color="#7a7068" />
      </mesh>
      {/* Tool rack prop outside */}
      <mesh position={[3, 0.8, 3.8]} castShadow>
        <boxGeometry args={[0.15, 1.2, 0.8]} />
        <meshStandardMaterial color="#6a5a48" />
      </mesh>
      <mesh position={[3, 1.5, 3.6]} rotation={[0.3, 0, 0]} castShadow>
        <boxGeometry args={[0.08, 0.6, 0.08]} />
        <meshStandardMaterial color="#8a8a90" metalness={0.5} />
      </mesh>
      {/* Barrel */}
      <mesh position={[-2.8, 0.45, 4.5]} castShadow>
        <cylinderGeometry args={[0.35, 0.38, 0.7, 8]} />
        <meshStandardMaterial color="#5a4a38" />
      </mesh>
    </group>
  );
}

/** Grouped shrub clusters along the M02 corridor — not evenly scattered. */
function CorridorLandscaping() {
  const shrubs = useMemo(
    () => [
      { x: 8, z: -5, s: 0.9 },
      { x: 9.5, z: -4, s: 0.7 },
      { x: 5, z: -2, s: 0.8 },
      { x: -5, z: 5, s: 1.0 },
      { x: -7, z: 7, s: 0.75 },
      { x: -8, z: 15, s: 0.85 },
      { x: -14, z: 18, s: 0.7 },
      { x: -6, z: 20, s: 0.9 },
      { x: 14, z: -6, s: 0.65 },
      { x: 0, z: 0, s: 1.1 },
      { x: 2, z: -1, s: 0.8 },
    ],
    [],
  );

  return (
    <group>
      {shrubs.map((shrub, i) => {
        const y = yAt(shrub.x, shrub.z);
        return (
          <group key={i} position={[shrub.x, y, shrub.z]} scale={shrub.s}>
            <mesh position={[0, 0.35, 0]} castShadow>
              <sphereGeometry args={[0.55, 7, 7]} />
              <meshStandardMaterial color={i % 2 === 0 ? '#3d6b38' : '#5a8a4a'} roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.1, 0]}>
              <cylinderGeometry args={[0.08, 0.1, 0.2, 5]} />
              <meshStandardMaterial color="#4a3828" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/** Curb strips along key M02 corridor segments for road/sidewalk separation. */
function CorridorCurbs() {
  const segments = useMemo(
    () => [
      { from: { x: 3, z: -3 }, to: { x: 13, z: -10 }, offset: 0.9 },
      { from: { x: -3, z: 3 }, to: { x: -11, z: 9 }, offset: 0.9 },
      { from: { x: -11, z: 9 }, to: { x: -11, z: 20 }, offset: 0.7 },
    ],
    [],
  );

  return (
    <group>
      {segments.map((seg, i) => {
        const dx = seg.to.x - seg.from.x;
        const dz = seg.to.z - seg.from.z;
        const len = Math.hypot(dx, dz);
        const angle = Math.atan2(dz, dx);
        const cx = (seg.from.x + seg.to.x) / 2;
        const cz = (seg.from.z + seg.to.z) / 2;
        const y = yAt(cx, cz, 0.048);
        return (
          <mesh
            key={i}
            position={[cx, y, cz]}
            rotation={[0, -angle, 0]}
            receiveShadow
          >
            <boxGeometry args={[len, 0.08, 0.15]} />
            <meshStandardMaterial color="#8a8e94" roughness={0.85} />
          </mesh>
        );
      })}
    </group>
  );
}

export function M02CorridorPolish() {
  return (
    <group>
      <HomeFacade />
      <StoreFacade />
      <WorkshopFacade />
      <CorridorLandscaping />
      <CorridorCurbs />
      <Crosswalk x={0} z={0} alongX={true} />
      <Crosswalk x={-3} z={3} alongX={false} />
      {FACILITY_POINTS.map((point) => (
        <EntrancePaver key={point.facilityId} x={point.entrance.x} z={point.entrance.z} />
      ))}
    </group>
  );
}
