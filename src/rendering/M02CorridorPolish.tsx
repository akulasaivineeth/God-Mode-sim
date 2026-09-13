/**
 * M02 lived-in corridor polish — VIS-001 / TOWN_IMPLEMENTATION_ROADMAP M02 slice.
 *
 * Plain English: Concentrated presentation upgrades along Alex's home → store →
 * workshop route. Distinct facility silhouettes, crosswalks, curbs, grouped
 * landscaping, and signage — without rewriting the whole M01 town shell.
 */
import { useMemo } from 'react';
import { terrainHeightAt } from '@/world/townLayout';
import { FACILITY_POINTS } from '@/world/facilityPoints';
import { InstancedScatter, type ScatterPoint } from './InstancedScatter';
import { SCATTER_GEOM } from './scatterGeometries';
import { MAT } from './sharedMaterials';

function yAt(x: number, z: number, lift = 0.05) {
  return terrainHeightAt(x, z) + lift;
}

function HomeFacade() {
  const bx = 11;
  const bz = -10;
  const baseY = yAt(bx, bz);
  const fencePosts = useMemo<ScatterPoint[]>(
    () => [-1.8, -0.9, 0, 0.9, 1.8].map((fx) => ({ x: bx + fx, z: bz + 4.2, y: baseY + 0.45 })),
    [bx, bz, baseY],
  );

  return (
    <group position={[bx, baseY, bz]}>
      {/* Cottage gable accent — distinct from generic box */}
      <mesh position={[0, 5.1, 0]} castShadow>
        <boxGeometry args={[3.2, 0.18, 3.4]} />
        <primitive object={MAT.roofBrown} attach="material" />
      </mesh>
      <mesh position={[0, 5.5, 0.8]} rotation={[0.35, 0, 0]} castShadow>
        <boxGeometry args={[2.4, 0.12, 1.6]} />
        <primitive object={MAT.roofBrown} attach="material" />
      </mesh>
      {/* Bay window bump-out */}
      <mesh position={[2.35, 2.2, 1.2]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 1.8, 1.4]} />
        <primitive object={MAT.wallCream} attach="material" />
      </mesh>
      <mesh position={[2.6, 2.2, 1.2]} castShadow>
        <boxGeometry args={[0.08, 1.4, 1.1]} />
        <primitive object={MAT.window} attach="material" />
      </mesh>
      {/* Porch deck */}
      <mesh position={[0, 0.12, 2.8]} castShadow receiveShadow>
        <boxGeometry args={[4.2, 0.14, 1.6]} />
        <primitive object={MAT.woodLight} attach="material" />
      </mesh>
      {/* Porch roof */}
      <mesh position={[0, 2.6, 2.9]} castShadow>
        <boxGeometry args={[4.4, 0.1, 1.8]} />
        <primitive object={MAT.roofBrown} attach="material" />
      </mesh>
      <mesh position={[-1.6, 1.5, 2.85]} castShadow>
        <boxGeometry args={[0.12, 2.2, 0.12]} />
        <primitive object={MAT.trimWhite} attach="material" />
      </mesh>
      <mesh position={[1.6, 1.5, 2.85]} castShadow>
        <boxGeometry args={[0.12, 2.2, 0.12]} />
        <primitive object={MAT.trimWhite} attach="material" />
      </mesh>
      {/* Steps */}
      {[0, 1, 2].map((step) => (
        <mesh
          key={step}
          position={[0, 0.06 + step * 0.1, 3.5 + step * 0.25]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[2.2, 0.1, 0.35]} />
          <primitive object={MAT.wood} attach="material" />
        </mesh>
      ))}
      <InstancedScatter points={fencePosts} geometry={SCATTER_GEOM.fencePost} material={MAT.trimWhite} />
      <mesh position={[0, 0.72, 4.2]} castShadow>
        <boxGeometry args={[3.8, 0.06, 0.06]} />
        <primitive object={MAT.trimWhite} attach="material" />
      </mesh>
      {/* Planters + flowers */}
      {[-2.2, 2.2].map((px) => (
        <group key={px} position={[px, 0, 3.2]}>
          <mesh position={[0, 0.25, 0]} castShadow>
            <boxGeometry args={[0.5, 0.35, 0.5]} />
            <primitive object={MAT.woodDark} attach="material" />
          </mesh>
          <mesh position={[0, 0.55, 0]} castShadow>
            <sphereGeometry args={[0.28, 6, 6]} />
            <primitive object={px < 0 ? MAT.foliage : MAT.foliageLight} attach="material" />
          </mesh>
        </group>
      ))}
      {/* Chimney + welcome mat */}
      <mesh position={[1.5, 5.2, -0.5]} castShadow>
        <boxGeometry args={[0.6, 1.4, 0.6]} />
        <primitive object={MAT.wallBrick} attach="material" />
      </mesh>
      <mesh position={[0, 0.02, 3.1]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[0.9, 0.5]} />
        <primitive object={MAT.doorDark} attach="material" />
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
          <primitive object={i % 2 === 0 ? MAT.awningRed : MAT.awningCream} attach="material" />
        </mesh>
      ))}
      {/* Sign */}
      <mesh position={[0, 4.6, 4.25]} castShadow>
        <boxGeometry args={[3.2, 0.7, 0.12]} />
        <primitive object={MAT.sign} attach="material" />
      </mesh>
      <mesh position={[0, 4.6, 4.32]}>
        <boxGeometry args={[2.8, 0.45, 0.02]} />
        <primitive object={MAT.doorDark} attach="material" />
      </mesh>
      {/* Display windows */}
      {[-2, 2].map((wx) => (
        <mesh key={wx} position={[wx, 2.2, 3.55]} castShadow>
          <boxGeometry args={[2, 1.6, 0.1]} />
          <primitive object={MAT.window} attach="material" />
        </mesh>
      ))}
      {/* Bench */}
      <mesh position={[3.5, 0.35, 5]} castShadow>
        <boxGeometry args={[1.2, 0.12, 0.4]} />
        <primitive object={MAT.wood} attach="material" />
      </mesh>
      <mesh position={[3.2, 0.55, 5]} castShadow>
        <boxGeometry args={[0.1, 0.35, 0.1]} />
        <primitive object={MAT.woodDark} attach="material" />
      </mesh>
      <mesh position={[3.8, 0.55, 5]} castShadow>
        <boxGeometry args={[0.1, 0.35, 0.1]} />
        <primitive object={MAT.woodDark} attach="material" />
      </mesh>
      {/* Produce crates */}
      <mesh position={[-3.2, 0.25, 4.8]} castShadow>
        <boxGeometry args={[0.6, 0.45, 0.6]} />
        <primitive object={MAT.crate} attach="material" />
      </mesh>
      <mesh position={[-3.2, 0.55, 4.8]} castShadow>
        <boxGeometry args={[0.55, 0.35, 0.55]} />
        <primitive object={MAT.awningCream} attach="material" />
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
      {/* Sawtooth roof accent — industrial silhouette */}
      {[-1.5, 0, 1.5].map((rx) => (
        <mesh key={rx} position={[rx, 5.8, -0.5]} rotation={[0, 0, Math.PI / 4]} castShadow>
          <boxGeometry args={[1.8, 0.12, 2.2]} />
          <primitive object={MAT.roofSlate} attach="material" />
        </mesh>
      ))}
      {/* Exhaust stack */}
      <mesh position={[2.2, 6.2, -1]} castShadow>
        <cylinderGeometry args={[0.18, 0.22, 1.6, 6]} />
        <primitive object={MAT.metalDark} attach="material" />
      </mesh>
      {/* Garage bay door with hazard stripes */}
      <mesh position={[0, 1.8, 3.15]} castShadow>
        <boxGeometry args={[4.5, 3.2, 0.12]} />
        <primitive object={MAT.metalDark} attach="material" />
      </mesh>
      {[-1.1, 0, 1.1].map((dx) => (
        <mesh key={dx} position={[dx, 1.8, 3.2]}>
          <boxGeometry args={[0.06, 2.8, 0.02]} />
          <primitive object={MAT.metal} attach="material" />
        </mesh>
      ))}
      <mesh position={[0, 0.35, 3.18]} castShadow>
        <boxGeometry args={[4.2, 0.12, 0.04]} />
        <primitive object={MAT.hazard} attach="material" />
      </mesh>
      {/* Industrial accent band */}
      <mesh position={[0, 4.8, 3.1]} castShadow>
        <boxGeometry args={[5.5, 0.25, 0.15]} />
        <primitive object={MAT.industrial} attach="material" />
      </mesh>
      {/* Loading platform */}
      <mesh position={[0, 0.18, 4.2]} castShadow receiveShadow>
        <boxGeometry args={[3.5, 0.2, 1.2]} />
        <primitive object={MAT.stone} attach="material" />
      </mesh>
      {/* Tool rack + barrel */}
      <mesh position={[3, 0.8, 3.8]} castShadow>
        <boxGeometry args={[0.15, 1.2, 0.8]} />
        <primitive object={MAT.woodDark} attach="material" />
      </mesh>
      <mesh position={[3, 1.5, 3.6]} rotation={[0.3, 0, 0]} castShadow>
        <boxGeometry args={[0.08, 0.6, 0.08]} />
        <primitive object={MAT.metal} attach="material" />
      </mesh>
      <mesh position={[-2.8, 0.45, 4.5]} castShadow>
        <cylinderGeometry args={[0.35, 0.38, 0.7, 8]} />
        <primitive object={MAT.woodDark} attach="material" />
      </mesh>
      {/* Outdoor work light */}
      <mesh position={[2.5, 3.2, 4]} castShadow>
        <boxGeometry args={[0.12, 0.12, 0.4]} />
        <primitive object={MAT.metal} attach="material" />
      </mesh>
    </group>
  );
}

function CorridorLandscaping() {
  const shrubs = useMemo<ScatterPoint[]>(
    () => [
      { x: 8, z: -5, scale: 0.9 },
      { x: 9.5, z: -4, scale: 0.7 },
      { x: 5, z: -2, scale: 0.8 },
      { x: -5, z: 5, scale: 1.0 },
      { x: -7, z: 7, scale: 0.75 },
      { x: -8, z: 15, scale: 0.85 },
      { x: -14, z: 18, scale: 0.7 },
      { x: -6, z: 20, scale: 0.9 },
      { x: 14, z: -6, scale: 0.65 },
      { x: 0, z: 0, scale: 1.1 },
      { x: 2, z: -1, scale: 0.8 },
    ],
    [],
  );

  const shrubPoints = useMemo(
    () =>
      shrubs.map((shrub, i) => ({
        ...shrub,
        y: yAt(shrub.x, shrub.z) + 0.35,
        scale: shrub.scale,
        alt: i % 2,
      })),
    [shrubs],
  );

  const trunkPoints = useMemo(
    () =>
      shrubs.map((shrub) => ({
        x: shrub.x,
        z: shrub.z,
        y: yAt(shrub.x, shrub.z) + 0.1,
        scale: shrub.scale,
      })),
    [shrubs],
  );

  return (
    <group>
      <InstancedScatter points={shrubPoints} geometry={SCATTER_GEOM.shrub} material={MAT.foliage} />
      <InstancedScatter
        points={trunkPoints}
        geometry={SCATTER_GEOM.shrubTrunk}
        material={MAT.woodDark}
        castShadow={false}
      />
    </group>
  );
}

function CorridorCurbs() {
  const segments = useMemo(
    () => [
      { from: { x: 3, z: -3 }, to: { x: 13, z: -10 } },
      { from: { x: -3, z: 3 }, to: { x: -11, z: 9 } },
      { from: { x: -11, z: 9 }, to: { x: -11, z: 20 } },
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
            <primitive object={MAT.curb} attach="material" />
          </mesh>
        );
      })}
    </group>
  );
}

function Crosswalks() {
  const stripes = useMemo<ScatterPoint[]>(() => {
    const points: ScatterPoint[] = [];
    const crossings = [
      { x: 0, z: 0, alongX: true },
      { x: -3, z: 3, alongX: false },
    ];
    for (const cw of crossings) {
      for (let i = -2; i <= 2; i += 1) {
        points.push({
          x: cw.alongX ? cw.x + i * 0.35 : cw.x,
          z: cw.alongX ? cw.z : cw.z + i * 0.35,
          y: yAt(cw.x, cw.z, 0.055),
          rotX: -Math.PI / 2,
          rotY: cw.alongX ? 0 : Math.PI / 2,
        });
      }
    }
    return points;
  }, []);

  return (
    <InstancedScatter
      points={stripes}
      geometry={SCATTER_GEOM.crossStripe}
      material={MAT.stoneLight}
      castShadow={false}
    />
  );
}

function EntrancePavers() {
  const pavers = useMemo<ScatterPoint[]>(
    () =>
      FACILITY_POINTS.map((point) => ({
        x: point.entrance.x,
        z: point.entrance.z,
        y: yAt(point.entrance.x, point.entrance.z, 0.06),
        rotX: -Math.PI / 2,
      })),
    [],
  );

  return (
    <InstancedScatter
      points={pavers}
      geometry={SCATTER_GEOM.paver}
      material={MAT.stone}
      castShadow={false}
    />
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
      <Crosswalks />
      <EntrancePavers />
    </group>
  );
}
