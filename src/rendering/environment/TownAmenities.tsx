/**
 * Town square + park focal presentation — WF02 plaza hierarchy + street-life modules.
 */
import { useMemo } from 'react';
import { CANONICAL_TOWN, terrainHeightAt } from '@/world/townLayout';
import { KENNEY_ASSETS } from '../assets/EnvironmentAssetRegistry';
import { InstancedGltfPlacements, type GltfInstancePlacement } from '../assets/InstancedGltfPlacements';
import { InstancedScatter } from '../InstancedScatter';
import { SCATTER_GEOM } from '../scatterGeometries';
import { MAT } from '../sharedMaterials';

function Fountain({ x, y, z }: { x: number; y: number; z: number }) {
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0.15, 0]} receiveShadow>
        <cylinderGeometry args={[3.1, 3.1, 0.14, 24]} />
        <primitive object={MAT.stoneLight} attach="material" />
      </mesh>
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.7, 0.95, 0.55, 16]} />
        <primitive object={MAT.stone} attach="material" />
      </mesh>
      <mesh position={[0, 0.95, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.35, 8]} />
        <primitive object={MAT.water} attach="material" />
      </mesh>
    </group>
  );
}

function ringBenchPoints(cx: number, cy: number, cz: number, radius = 4.5) {
  return [0, 1, 2, 3].map((i) => {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    return { x: cx + Math.cos(a) * radius, z: cz + Math.sin(a) * radius, y: cy, rotY: -a + Math.PI };
  });
}

function AllBenches({ points }: { points: readonly { x: number; z: number; y: number; rotY: number }[] }) {
  return (
    <group>
      <InstancedScatter points={points} geometry={SCATTER_GEOM.benchSeat} material={MAT.wood} castShadow={false} />
      <InstancedScatter points={points} geometry={SCATTER_GEOM.benchBack} material={MAT.woodDark} castShadow={false} />
    </group>
  );
}

function LampInstances({ cx, cy, cz }: { cx: number; cy: number; cz: number }) {
  const points = useMemo(
    () =>
      [0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2;
        const x = cx + Math.cos(a) * 6.4;
        const z = cz + Math.sin(a) * 6.4;
        return { x, z, y: cy + 0.1, rotY: -a };
      }),
    [cx, cy, cz],
  );

  return (
    <group>
      <InstancedScatter points={points} geometry={SCATTER_GEOM.lampPost} material={MAT.metalDark} castShadow={false} />
      <InstancedScatter
        points={points.map((p) => ({ ...p, y: p.y + 1.55 }))}
        geometry={SCATTER_GEOM.lampHead}
        material={MAT.sign}
        castShadow={false}
      />
    </group>
  );
}

function CivicPathSpokes({ cx, cz }: { cx: number; cz: number }) {
  const placements = useMemo((): GltfInstancePlacement[] => {
    const spokes: GltfInstancePlacement[] = [];
    for (let i = 0; i < 4; i += 1) {
      const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
      spokes.push({
        url: KENNEY_ASSETS.pathShort,
        x: cx + Math.cos(angle) * 5.2,
        z: cz + Math.sin(angle) * 5.2,
        rotY: angle + Math.PI / 2,
        scale: 2.4,
        yOffset: 0.02,
      });
    }
    return spokes;
  }, [cx, cz]);

  return <InstancedGltfPlacements placements={placements} />;
}

export function TownAmenities() {
  const sq = CANONICAL_TOWN.square;
  const park = CANONICAL_TOWN.park;
  const sqY = terrainHeightAt(sq.center.x, sq.center.z);
  const parkY = terrainHeightAt(park.center.x, park.center.z);

  const benchPoints = useMemo(
    () => [
      ...ringBenchPoints(sq.center.x, sqY, sq.center.z, 5.0),
      ...ringBenchPoints(park.center.x - 3, parkY, park.center.z + 2, 3.8),
      ...ringBenchPoints(park.center.x + 3, parkY, park.center.z - 2, 3.8),
    ],
    [sq.center.x, sq.center.z, sqY, park.center.x, park.center.z, parkY],
  );

  return (
    <group>
      <mesh position={[sq.center.x, sqY + 0.06, sq.center.z]} receiveShadow>
        <cylinderGeometry args={[7.0, 7.0, 0.1, 32]} />
        <primitive object={MAT.stoneLight} attach="material" />
      </mesh>
      <CivicPathSpokes cx={sq.center.x} cz={sq.center.z} />
      <Fountain x={sq.center.x} y={sqY} z={sq.center.z} />
      <AllBenches points={benchPoints} />
      <LampInstances cx={sq.center.x} cy={sqY} cz={sq.center.z} />

      <mesh position={[park.center.x, parkY + 0.05, park.center.z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[2.8, 7.5, 36]} />
        <primitive object={MAT.path} attach="material" />
      </mesh>
      <mesh position={[park.center.x, parkY + 0.04, park.center.z]} receiveShadow>
        <circleGeometry args={[8.0, 32]} />
        <primitive object={MAT.foliageLight} attach="material" />
      </mesh>

      {CANONICAL_TOWN.farmPlots.map((plot) => {
        const y = terrainHeightAt(plot.center.x, plot.center.z);
        const isOrchard = plot.id === 'farm-3';
        const rowCount = isOrchard ? 4 : 5;
        const rows = [];
        for (let r = 0; r < rowCount; r += 1) {
          const offset = (r - (rowCount - 1) / 2) * (isOrchard ? 1.4 : 1.2);
          rows.push(
            <mesh key={r} position={[plot.center.x, y + 0.12, plot.center.z + offset]} receiveShadow>
              <boxGeometry args={[plot.width * 0.88, 0.2, isOrchard ? 0.28 : 0.35]} />
              <primitive object={r % 2 === 0 ? MAT.farmRowA : MAT.farmRowB} attach="material" />
            </mesh>,
          );
        }
        return <group key={plot.id}>{rows}</group>;
      })}
    </group>
  );
}
