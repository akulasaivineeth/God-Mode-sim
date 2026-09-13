/**
 * Square, park, farm presentation upgrades — no new simulation systems.
 */
import { terrainHeightAt } from '@/world/townLayout';
import { CANONICAL_TOWN } from '@/world/townLayout';
import { InstancedScatter } from '../InstancedScatter';
import { SCATTER_GEOM } from '../scatterGeometries';
import { MAT } from '../sharedMaterials';

export function TownAmenities() {
  const sq = CANONICAL_TOWN.square;
  const park = CANONICAL_TOWN.park;
  const sqY = terrainHeightAt(sq.center.x, sq.center.z);
  const parkY = terrainHeightAt(park.center.x, park.center.z);

  return (
    <group>
      {/* Town square plaza */}
      <mesh position={[sq.center.x, sqY + 0.08, sq.center.z]} receiveShadow>
        <cylinderGeometry args={[5.5, 5.5, 0.12, 24]} />
        <primitive object={MAT.stoneLight} attach="material" />
      </mesh>
      <mesh position={[sq.center.x, sqY + 0.35, sq.center.z]} castShadow>
        <cylinderGeometry args={[0.8, 1.1, 0.5, 12]} />
        <primitive object={MAT.stone} attach="material" />
      </mesh>
      <InstancedScatter
        points={[0, 1, 2, 3].map((i) => {
          const a = (i / 4) * Math.PI * 2;
          return {
            x: sq.center.x + Math.cos(a) * 4.2,
            z: sq.center.z + Math.sin(a) * 4.2,
            y: sqY + 0.2,
          };
        })}
        geometry={SCATTER_GEOM.fencePost}
        material={MAT.wood}
        castShadow={false}
      />

      {/* Park path ring */}
      <mesh position={[park.center.x, parkY + 0.06, park.center.z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[3, 6.5, 32]} />
        <primitive object={MAT.path} attach="material" />
      </mesh>

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
