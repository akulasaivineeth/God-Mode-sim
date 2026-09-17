/**
 * WF02 R7.1 presentation-only embankment skirts — does not modify terrainHeightAt.
 */
import { useMemo } from 'react';
import { Color, MeshStandardMaterial } from 'three';
import type { CameraView } from '../cameraPresets';
import { terrainHeightAt } from '@/world/townLayout';
import { getCompositionEnvelope, insetEnvelopePoly } from './compositionEnvelopes';

const embankmentMaterial = new MeshStandardMaterial({
  color: new Color('#b8a078'),
  roughness: 0.92,
});

const SKIRT_HEIGHT = 0.45;
const SKIRT_LIFT = 0.12;

interface SkirtSpec {
  id: string;
  poly: readonly (readonly [number, number])[];
}

function buildSkirtSpecs(cameraView: CameraView): SkirtSpec[] {
  if (cameraView === 'street') return [];
  return [
    { id: 'embankment-civic', poly: getCompositionEnvelope('embankment-civic').poly },
    {
      id: 'commercial-skirt',
      poly: insetEnvelopePoly(getCompositionEnvelope('commercial-frontage').poly, 1.5),
    },
  ];
}

function skirtMesh(spec: SkirtSpec) {
  const xs = spec.poly.map((p) => p[0]);
  const zs = spec.poly.map((p) => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minZ = Math.min(...zs);
  const maxZ = Math.max(...zs);
  const cx = (minX + maxX) / 2;
  const cz = (minZ + maxZ) / 2;
  const width = maxX - minX;
  const depth = maxZ - minZ;
  const y = terrainHeightAt(cx, cz) + SKIRT_LIFT + SKIRT_HEIGHT / 2;
  return (
    <mesh
      key={spec.id}
      position={[cx, y, cz]}
      material={embankmentMaterial}
      receiveShadow
      castShadow={false}
    >
      <boxGeometry args={[width, SKIRT_HEIGHT, depth]} />
    </mesh>
  );
}

export function PresentationTerrainLayer({ cameraView }: { cameraView: CameraView }) {
  const specs = useMemo(() => buildSkirtSpecs(cameraView), [cameraView]);
  if (specs.length === 0) return null;
  return <group name="presentation-terrain-layer">{specs.map(skirtMesh)}</group>;
}
