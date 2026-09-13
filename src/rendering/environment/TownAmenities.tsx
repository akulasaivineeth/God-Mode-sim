/**
 * Town square + park focal presentation — M02 R6 (no simulation systems).
 */
import { useMemo } from 'react';
import { CANONICAL_TOWN, terrainHeightAt } from '@/world/townLayout';
import { InstancedScatter } from '../InstancedScatter';
import { SCATTER_GEOM } from '../scatterGeometries';
import { MAT } from '../sharedMaterials';
function Fountain({ x, y, z }: { x: number; y: number; z: number }) {
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0.15, 0]} receiveShadow>
        <cylinderGeometry args={[2.8, 2.8, 0.14, 24]} />
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

function BenchInstances({ cx, cy, cz }: { cx: number; cy: number; cz: number }) {
  const points = useMemo(
    () =>
      [0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        return { x: cx + Math.cos(a) * 4.5, z: cz + Math.sin(a) * 4.5, y: cy + 0.18, rotY: -a + Math.PI };
      }),
    [cx, cy, cz],
  );

  return (
    <group>
      {points.map((p, i) => (
        <group key={i} position={[p.x, p.y ?? cy, p.z]} rotation={[0, p.rotY ?? 0, 0]}>
          <mesh castShadow={false}>
            <boxGeometry args={[1.0, 0.12, 0.4]} />
            <primitive object={MAT.wood} attach="material" />
          </mesh>
          <mesh position={[0, 0.22, -0.12]} castShadow={false}>
            <boxGeometry args={[0.95, 0.35, 0.08]} />
            <primitive object={MAT.woodDark} attach="material" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function LampInstances({ cx, cy, cz }: { cx: number; cy: number; cz: number }) {
  const points = useMemo(
    () =>
      [0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2;
        return { x: cx + Math.cos(a) * 5.8, z: cz + Math.sin(a) * 5.8, y: cy + 0.1 };
      }),
    [cx, cy, cz],
  );

  return (
    <InstancedScatter
      points={points}
      geometry={SCATTER_GEOM.fencePost}
      material={MAT.metal}
      castShadow={false}
    />
  );
}

export function TownAmenities() {
  const sq = CANONICAL_TOWN.square;
  const park = CANONICAL_TOWN.park;
  const sqY = terrainHeightAt(sq.center.x, sq.center.z);
  const parkY = terrainHeightAt(park.center.x, park.center.z);

  return (
    <group>
      {/* Town square plaza */}
      <mesh position={[sq.center.x, sqY + 0.06, sq.center.z]} receiveShadow>
        <cylinderGeometry args={[6.2, 6.2, 0.1, 32]} />
        <primitive object={MAT.stoneLight} attach="material" />
      </mesh>
      <Fountain x={sq.center.x} y={sqY} z={sq.center.z} />
      <BenchInstances cx={sq.center.x} cy={sqY} cz={sq.center.z} />
      <LampInstances cx={sq.center.x} cy={sqY} cz={sq.center.z} />

      {/* Park */}
      <mesh position={[park.center.x, parkY + 0.05, park.center.z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[2.5, 7, 36]} />
        <primitive object={MAT.path} attach="material" />
      </mesh>
      <mesh position={[park.center.x, parkY + 0.04, park.center.z]} receiveShadow>
        <circleGeometry args={[7.5, 32]} />
        <primitive object={MAT.foliage} attach="material" />
      </mesh>
      <BenchInstances cx={park.center.x - 3} cy={parkY} cz={park.center.z + 2} />
      <BenchInstances cx={park.center.x + 3} cy={parkY} cz={park.center.z - 2} />

      {/* Farm plot rows */}
      {CANONICAL_TOWN.farmPlots.map((plot) => {
        const y = terrainHeightAt(plot.center.x, plot.center.z);
        const rows = [];
        for (let r = -2; r <= 2; r += 1) {
          rows.push(
            <mesh key={r} position={[plot.center.x, y + 0.12, plot.center.z + r * 1.2]} receiveShadow>
              <boxGeometry args={[plot.width * 0.85, 0.2, 0.35]} />
              <primitive object={r % 2 === 0 ? MAT.farmRowA : MAT.farmRowB} attach="material" />
            </mesh>,
          );
        }
        return <group key={plot.id}>{rows}</group>;
      })}
    </group>
  );
}
