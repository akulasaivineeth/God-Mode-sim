/**
 * WF02 R3 — vacant lot envelopes (presentation only).
 * Paver pads, fence-post perimeter and corner stakes make future lots read intentional.
 */
import { useMemo } from 'react';
import { CANONICAL_TOWN, terrainHeightAt } from '@/world/townLayout';
import { InstancedScatter, type ScatterPoint } from '../InstancedScatter';
import { SCATTER_GEOM } from '../scatterGeometries';
import { MAT } from '../sharedMaterials';

function buildLotPavers(): ScatterPoint[] {
  const points: ScatterPoint[] = [];
  for (const plot of CANONICAL_TOWN.vacantPlots) {
    const cols = 2;
    const rows = 2;
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const fx = (c - (cols - 1) / 2) * (plot.width * 0.22);
        const fz = (r - (rows - 1) / 2) * (plot.depth * 0.22);
        points.push({
          x: plot.center.x + fx,
          z: plot.center.z + fz,
          y: terrainHeightAt(plot.center.x + fx, plot.center.z + fz) + 0.04,
          rotY: ((plot.center.x + plot.center.z + r + c) % 4) * (Math.PI / 2),
          scale: 0.95 + (r % 2) * 0.05,
        });
      }
    }
  }
  return points;
}

function buildLotFencePosts(): ScatterPoint[] {
  const points: ScatterPoint[] = [];
  for (const plot of CANONICAL_TOWN.vacantPlots) {
    const halfW = plot.width * 0.42;
    const halfD = plot.depth * 0.42;
    const posts = [
      { x: plot.center.x - halfW, z: plot.center.z - halfD },
      { x: plot.center.x + halfW, z: plot.center.z - halfD },
      { x: plot.center.x - halfW, z: plot.center.z + halfD },
      { x: plot.center.x + halfW, z: plot.center.z + halfD },
      { x: plot.center.x, z: plot.center.z - halfD },
      { x: plot.center.x, z: plot.center.z + halfD },
    ];
    for (const post of posts) {
      points.push({
        x: post.x,
        z: post.z,
        y: terrainHeightAt(post.x, post.z) + 0.02,
        scale: 1.1,
        rotY: (plot.center.x + post.x) * 0.1,
      });
    }
  }
  return points;
}

export function FutureLotPresentation() {
  const pavers = useMemo(() => buildLotPavers(), []);
  const fencePosts = useMemo(() => buildLotFencePosts(), []);

  return (
    <group>
      <InstancedScatter
        points={pavers}
        geometry={SCATTER_GEOM.paver}
        material={MAT.path}
        yLift={0}
        castShadow={false}
      />
      <InstancedScatter
        points={fencePosts}
        geometry={SCATTER_GEOM.fencePost}
        material={MAT.woodDark}
        castShadow={false}
      />
    </group>
  );
}
