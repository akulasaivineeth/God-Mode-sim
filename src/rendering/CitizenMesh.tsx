/**
 * Procedural stylized citizen mesh — VIS-001 / M02 shared humanoid pipeline.
 *
 * Plain English: One lightweight reusable body made from primitives with
 * palette variation and minimal idle/walk articulation. No heavyweight unique
 * assets; instancing-ready structure.
 */
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group, Mesh } from 'three';
import { terrainHeightAt } from '@/world/townLayout';
import type { RenderCitizen } from './types';

interface CitizenMeshProps {
  citizen: RenderCitizen;
  animationsSuppressed: boolean;
  onSelect: (citizenId: string) => void;
}

function walkPhase(t: number): number {
  return Math.sin(t * Math.PI * 4);
}

export function CitizenMesh({ citizen, animationsSuppressed, onSelect }: CitizenMeshProps) {
  const groupRef = useRef<Group>(null);
  const leftLegRef = useRef<Mesh>(null);
  const rightLegRef = useRef<Mesh>(null);
  const leftArmRef = useRef<Mesh>(null);
  const rightArmRef = useRef<Mesh>(null);
  const torsoRef = useRef<Mesh>(null);

  const baseY = terrainHeightAt(citizen.x, citizen.z) + 0.05;
  const moving = citizen.action === 'travel';
  const working = citizen.action === 'work';

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;

    group.position.y = baseY;

    if (animationsSuppressed) {
      return;
    }

    const t = performance.now() * 0.001;

    if (moving) {
      const phase = walkPhase(t);
      group.position.y = baseY + Math.abs(phase) * 0.06;
      if (torsoRef.current) torsoRef.current.rotation.x = 0.08;
      if (leftLegRef.current) leftLegRef.current.rotation.x = phase * 0.55;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -phase * 0.55;
      if (leftArmRef.current) leftArmRef.current.rotation.x = -phase * 0.35;
      if (rightArmRef.current) rightArmRef.current.rotation.x = phase * 0.35;
    } else if (working) {
      const bob = Math.sin(t * 2.5) * 0.04;
      if (torsoRef.current) torsoRef.current.rotation.x = 0.12 + bob;
      if (leftArmRef.current) leftArmRef.current.rotation.x = -0.4 + bob;
      if (rightArmRef.current) rightArmRef.current.rotation.x = -0.4 - bob;
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
    } else {
      const breathe = Math.sin(t * 1.8) * 0.02;
      if (torsoRef.current) torsoRef.current.rotation.x = breathe;
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
      if (leftArmRef.current) leftArmRef.current.rotation.x = breathe * 0.5;
      if (rightArmRef.current) rightArmRef.current.rotation.x = -breathe * 0.5;
    }
  });

  const scale = citizen.selected ? 1.04 : 1;

  return (
    <group
      ref={groupRef}
      position={[citizen.x, baseY, citizen.z]}
      scale={scale}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(citizen.id);
      }}
    >
      {citizen.selected ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
          <ringGeometry args={[0.42, 0.52, 24]} />
          <meshStandardMaterial color="#f0d060" emissive="#806820" emissiveIntensity={0.35} />
        </mesh>
      ) : null}

      <mesh ref={torsoRef} castShadow position={[0, 0.95, 0]}>
        <capsuleGeometry args={[0.2, 0.75, 4, 8]} />
        <meshStandardMaterial color={citizen.appearance.shirtColor} />
      </mesh>

      <mesh ref={leftLegRef} castShadow position={[-0.1, 0.38, 0]}>
        <capsuleGeometry args={[0.08, 0.38, 4, 6]} />
        <meshStandardMaterial color={citizen.appearance.pantsColor} />
      </mesh>
      <mesh ref={rightLegRef} castShadow position={[0.1, 0.38, 0]}>
        <capsuleGeometry args={[0.08, 0.38, 4, 6]} />
        <meshStandardMaterial color={citizen.appearance.pantsColor} />
      </mesh>

      <mesh ref={leftArmRef} castShadow position={[-0.28, 1.05, 0]} rotation={[0, 0, 0.15]}>
        <capsuleGeometry args={[0.06, 0.32, 4, 6]} />
        <meshStandardMaterial color={citizen.appearance.shirtColor} />
      </mesh>
      <mesh ref={rightArmRef} castShadow position={[0.28, 1.05, 0]} rotation={[0, 0, -0.15]}>
        <capsuleGeometry args={[0.06, 0.32, 4, 6]} />
        <meshStandardMaterial color={citizen.appearance.shirtColor} />
      </mesh>

      <mesh castShadow position={[0, 1.58, 0]}>
        <sphereGeometry args={[0.2, 10, 10]} />
        <meshStandardMaterial color={citizen.appearance.skinColor} />
      </mesh>

      <mesh castShadow position={[0, 1.8, -0.02]}>
        <boxGeometry args={[0.3, 0.1, 0.24]} />
        <meshStandardMaterial color={citizen.appearance.hairColor} />
      </mesh>
    </group>
  );
}
