/**
 * WF02 R15 Phase 0 — clipped district ground envelopes (zone-limited, not full-frame).
 */
import { useLayoutEffect, useMemo, useRef } from 'react';
import { BoxGeometry, type InstancedMesh, Matrix4, Quaternion, Vector3 } from 'three';
import { terrainHeightAt } from '@/world/townLayout';
import { buildOverlayCells } from '../compositionMask';
import { districtOverlayMaterial } from '@/rendering/palette/DistrictPalette';
import { buildProofGroundEnvelopes, type ProofGroundEnvelope } from './heroBlockPhase0ProofSpec';

function ProofGroundEnvelopeMesh({ envelope }: { envelope: ProofGroundEnvelope }) {
  const geometry = useMemo(() => new BoxGeometry(1, 0.06, 1), []);
  const material = useMemo(
    () => districtOverlayMaterial(envelope.color, envelope.opacity),
    [envelope.color, envelope.opacity],
  );
  const ref = useRef<InstancedMesh>(null);
  const cells = useMemo(
    () => buildOverlayCells(envelope.minX, envelope.maxX, envelope.minZ, envelope.maxZ, 2.4),
    [envelope.minX, envelope.maxX, envelope.minZ, envelope.maxZ],
  );

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh || cells.length === 0) return;
    const matrix = new Matrix4();
    const quat = new Quaternion();
    const pos = new Vector3();
    const scale = new Vector3();
    cells.forEach((cell, i) => {
      pos.set(cell.x, terrainHeightAt(cell.x, cell.z) + 0.03, cell.z);
      quat.identity();
      scale.set(cell.width, 1, cell.depth);
      matrix.compose(pos, quat, scale);
      mesh.setMatrixAt(i, matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [cells]);

  if (cells.length === 0) return null;

  return (
    <instancedMesh
      ref={ref}
      args={[geometry, material, cells.length]}
      name={`r15-proof-ground-${envelope.id}`}
      receiveShadow
      castShadow={false}
    />
  );
}

export function HeroBlockPhase0ProofGround() {
  const envelopes = useMemo(() => buildProofGroundEnvelopes(), []);

  return (
    <group name="r15-proof-ground-envelopes">
      {envelopes.map((envelope) => (
        <ProofGroundEnvelopeMesh key={envelope.id} envelope={envelope} />
      ))}
    </group>
  );
}
