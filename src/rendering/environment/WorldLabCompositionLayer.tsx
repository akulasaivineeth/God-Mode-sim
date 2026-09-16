/**
 * WF02 R9 World Lab — neighborhood composition density.
 * Civic plaza props, street trees, future-lot hedges, frame vegetation.
 */
import { Suspense, useMemo } from 'react';
import { CANONICAL_TOWN, terrainHeightAt } from '@/world/townLayout';
import { isWorldLabActive } from '@/world/resolver/worldResolver';
import { ModelAsset } from '../assets/ModelAsset';
import { KENNEY_ASSETS } from '../assets/EnvironmentAssetRegistry';
import { InstancedScatter } from '../InstancedScatter';
import { SCATTER_GEOM } from '../scatterGeometries';
import { MAT } from '../sharedMaterials';
import { FutureLotPresentation } from './FutureLotPresentation';
import { CommercialStreetLife } from './CommercialStreetLife';

function CivicPlazaProps() {
  const sq = CANONICAL_TOWN.square;
  const y = terrainHeightAt(sq.center.x, sq.center.z);
  const planters = useMemo(
    () =>
      [0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        return {
          x: sq.center.x + Math.cos(a) * 4.8,
          z: sq.center.z + Math.sin(a) * 4.8,
          rotY: -a,
        };
      }),
    [sq.center.x, sq.center.z],
  );

  return (
    <group>
      {planters.map((p, i) => (
        <ModelAsset
          key={`planter-${i}`}
          url={KENNEY_ASSETS.planter}
          position={[p.x, y + 0.02, p.z]}
          rotation={[0, p.rotY, 0]}
          scale={1.2}
          castShadow={false}
        />
      ))}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const a = (i / 8) * Math.PI * 2;
        const radius = 5.8 + (i % 2) * 0.4;
        const x = sq.center.x + Math.cos(a) * radius;
        const z = sq.center.z + Math.sin(a) * radius;
        return (
          <ModelAsset
            key={`path-stone-${i}`}
            url={i % 2 === 0 ? KENNEY_ASSETS.pathStonesShort : KENNEY_ASSETS.pathStonesMessy}
            position={[x, y + 0.03, z]}
            rotation={[0, a + Math.PI / 2, 0]}
            scale={1.15}
            castShadow={false}
          />
        );
      })}
    </group>
  );
}

function FrameTrees() {
  const points = useMemo(
    () =>
      CANONICAL_TOWN.trees.map((tree) => ({
        x: tree.position.x,
        z: tree.position.z,
        y: terrainHeightAt(tree.position.x, tree.position.z),
        scale: tree.scale,
        rotY: ((tree.position.x * 17 + tree.position.z * 13) % 8) * (Math.PI / 4),
      })),
    [],
  );

  return (
    <group>
      {points.map((p, i) => (
        <ModelAsset
          key={`frame-tree-${i}`}
          url={i % 3 === 0 ? KENNEY_ASSETS.treeLarge : KENNEY_ASSETS.treeSmall}
          position={[p.x, p.y, p.z]}
          rotation={[0, p.rotY, 0]}
          scale={p.scale * 1.35}
          castShadow={false}
        />
      ))}
    </group>
  );
}

function ResidentialHedgesWorldLab() {
  const points = useMemo(() => {
    const rows: Array<{ x: number; z: number; y: number; rotY: number }> = [];
    for (const house of CANONICAL_TOWN.buildings.filter((b) => b.type === 'house')) {
      const side = house.position.x > 0 ? 1 : -1;
      for (let i = 0; i < 3; i += 1) {
        rows.push({
          x: house.position.x + side * 3.2,
          z: house.position.z - 2 + i * 2,
          y: terrainHeightAt(house.position.x, house.position.z) + 0.02,
          rotY: side > 0 ? Math.PI / 2 : -Math.PI / 2,
        });
      }
    }
    return rows;
  }, []);

  return (
    <InstancedScatter
      points={points}
      geometry={SCATTER_GEOM.fencePost}
      material={MAT.woodDark}
      castShadow={false}
    />
  );
}

export function WorldLabCompositionLayer() {
  if (!isWorldLabActive()) return null;

  return (
    <group name="world-lab-composition">
      <Suspense fallback={null}>
        <CivicPlazaProps />
        <FrameTrees />
        <ResidentialHedgesWorldLab />
      </Suspense>
      <FutureLotPresentation />
      <CommercialStreetLife />
    </group>
  );
}
