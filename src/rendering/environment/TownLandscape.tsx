/**
 * Overview landscape frame — terrain skirt, river banks, bridge (presentation only).
 */
import { useMemo } from 'react';
import { BufferAttribute, Color, PlaneGeometry } from 'three';
import { CANONICAL_TOWN, TERRAIN, terrainHeightAt } from '@/world/townLayout';
import { ModelAsset } from '../assets/ModelAsset';
import { KENNEY_ASSETS } from '../assets/EnvironmentAssetRegistry';
import { MAT } from '../sharedMaterials';

function LandscapeSkirt() {
  const geometry = useMemo(() => {
    const size = CANONICAL_TOWN.groundExtent * 2.6;
    const segments = 32;
    const geo = new PlaneGeometry(size, size, segments, segments);
    const pos = geo.attributes.position;
    const grass = new Color('#4a6a38');
    const slope = new Color('#6f713f');
    const hilltop = new Color('#b0995f');
    const colors = new Float32Array(pos.count * 3);
    const tmp = new Color();
    for (let i = 0; i < pos.count; i += 1) {
      const lx = pos.getX(i);
      const ly = pos.getY(i);
      const h = terrainHeightAt(lx, -ly) * 0.85;
      pos.setZ(i, h - 0.5);
      const t = Math.min(1, Math.max(0, h / (TERRAIN.maxHeight * 0.9)));
      if (t < 0.5) tmp.copy(grass).lerp(slope, t / 0.5);
      else tmp.copy(slope).lerp(hilltop, (t - 0.5) / 0.5);
      colors[i * 3] = tmp.r;
      colors[i * 3 + 1] = tmp.g;
      colors[i * 3 + 2] = tmp.b;
    }
    pos.needsUpdate = true;
    geo.setAttribute('color', new BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.15, 0]}>
      <meshStandardMaterial vertexColors flatShading />
    </mesh>
  );
}

function RiverBanks() {
  const { points, width, bankWidth } = CANONICAL_TOWN.river;
  const segments = [];
  for (let i = 0; i < points.length - 1; i += 1) {
    const from = points[i];
    const to = points[i + 1];
    const dx = to.x - from.x;
    const dz = to.z - from.z;
    const len = Math.hypot(dx, dz);
    const angle = Math.atan2(dz, dx);
    const cx = (from.x + to.x) / 2;
    const cz = (from.z + to.z) / 2;
    const y = terrainHeightAt(cx, cz);
    segments.push(
      <group key={i} position={[cx, y + 0.04, cz]} rotation={[0, -angle, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[len, 0.12, bankWidth]} />
          <primitive object={MAT.bank} attach="material" />
        </mesh>
      </group>,
    );
    segments.push(
      <group key={`${i}-water`} position={[cx, y + 0.1, cz]} rotation={[0, -angle, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[len * 0.92, 0.06, width]} />
          <primitive object={MAT.water} attach="material" />
        </mesh>
      </group>,
    );
  }
  return <group>{segments}</group>;
}

export function TownLandscape() {
  return (
    <group>
      <LandscapeSkirt />
      <RiverBanks />
      <ModelAsset url={KENNEY_ASSETS.roadBridge} position={[22, terrainHeightAt(22, 0), 0]} rotation={[0, Math.PI / 2, 0]} scale={2.2} castShadow={false} />
    </group>
  );
}
