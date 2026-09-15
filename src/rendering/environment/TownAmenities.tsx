/**
 * Town square + park focal presentation — WF02 R3 composition envelopes.
 */
import { useLayoutEffect, useMemo, useRef } from 'react';
import { BoxGeometry, type InstancedMesh, Matrix4, Quaternion, Vector3 } from 'three';
import { CANONICAL_TOWN, terrainHeightAt } from '@/world/townLayout';
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
  return [0, 1, 2, 3, 4, 5].map((i) => {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    return { x: cx + Math.cos(a) * radius, z: cz + Math.sin(a) * radius, y: cy, rotY: -a + Math.PI };
  });
}

function AllBenches({ points }: { points: readonly { x: number; z: number; y: number; rotY: number }[] }) {
  return (
    <InstancedScatter points={points} geometry={SCATTER_GEOM.benchSeat} material={MAT.wood} castShadow={false} />
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
    </group>
  );
}

function InstancedFarmRows() {
  const { rowsA, rowsB } = useMemo(() => {
    const rowsA: Array<{ x: number; z: number; y: number; width: number; depth: number }> = [];
    const rowsB: Array<{ x: number; z: number; y: number; width: number; depth: number }> = [];
    for (const plot of CANONICAL_TOWN.farmPlots) {
      const isOrchard = plot.id === 'farm-3';
      const rowCount = isOrchard ? 3 : 4;
      for (let r = 0; r < rowCount; r += 1) {
        const offset = (r - (rowCount - 1) / 2) * (isOrchard ? 1.4 : 1.2);
        const entry = {
          x: plot.center.x,
          z: plot.center.z + offset,
          y: terrainHeightAt(plot.center.x, plot.center.z + offset) + 0.12,
          width: plot.width * 0.88,
          depth: isOrchard ? 0.28 : 0.35,
        };
        if (r % 2 === 0) rowsA.push(entry);
        else rowsB.push(entry);
      }
    }
    return { rowsA, rowsB };
  }, []);

  const geomA = useMemo(() => new BoxGeometry(1, 0.2, 1), []);
  const geomB = useMemo(() => new BoxGeometry(1, 0.2, 1), []);
  const refA = useRef<InstancedMesh>(null);
  const refB = useRef<InstancedMesh>(null);

  useLayoutEffect(() => {
    const apply = (mesh: InstancedMesh | null, rows: typeof rowsA) => {
      if (!mesh) return;
      const matrix = new Matrix4();
      const quat = new Quaternion();
      rows.forEach((row, i) => {
        matrix.compose(
          new Vector3(row.x, row.y, row.z),
          quat,
          new Vector3(row.width, 1, row.depth),
        );
        mesh.setMatrixAt(i, matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    };
    apply(refA.current, rowsA);
    apply(refB.current, rowsB);
  }, [rowsA, rowsB]);

  return (
    <group>
      {rowsA.length > 0 && (
        <instancedMesh ref={refA} args={[geomA, MAT.farmRowA, rowsA.length]} receiveShadow />
      )}
      {rowsB.length > 0 && (
        <instancedMesh ref={refB} args={[geomB, MAT.farmRowB, rowsB.length]} receiveShadow />
      )}
    </group>
  );
}

export function TownAmenities() {
  const sq = CANONICAL_TOWN.square;
  const park = CANONICAL_TOWN.park;
  const sqY = terrainHeightAt(sq.center.x, sq.center.z);
  const parkY = terrainHeightAt(park.center.x, park.center.z);

  const benchPoints = useMemo(
    () => ringBenchPoints(sq.center.x, sqY, sq.center.z, 5.2),
    [sq.center.x, sq.center.z, sqY],
  );

  return (
    <group>
      <mesh position={[sq.center.x, sqY + 0.06, sq.center.z]} receiveShadow>
        <cylinderGeometry args={[7.5, 7.5, 0.1, 32]} />
        <primitive object={MAT.stoneLight} attach="material" />
      </mesh>
      <Fountain x={sq.center.x} y={sqY} z={sq.center.z} />
      <AllBenches points={benchPoints} />
      <LampInstances cx={sq.center.x} cy={sqY} cz={sq.center.z} />

      <mesh position={[park.center.x, parkY + 0.05, park.center.z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[3.0, 8.5, 36]} />
        <primitive object={MAT.path} attach="material" />
      </mesh>
      <mesh position={[park.center.x, parkY + 0.04, park.center.z]} receiveShadow>
        <circleGeometry args={[9.0, 32]} />
        <primitive object={MAT.foliageLight} attach="material" />
      </mesh>

      <InstancedFarmRows />
    </group>
  );
}
