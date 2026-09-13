/**
 * Procedural stylized citizen mesh — VIS-001 / M02 shared humanoid pipeline.
 *
 * Plain English: One lightweight reusable body made from primitives with
 * palette variation. No heavyweight unique assets; instancing-ready structure.
 */
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import { terrainHeightAt } from '@/world/townLayout';
import type { RenderCitizen } from './types';

interface CitizenMeshProps {
  citizen: RenderCitizen;
  animationsSuppressed: boolean;
  onSelect: (citizenId: string) => void;
}

function walkCycle(progress: number): number {
  return Math.sin(progress * Math.PI * 4) * 0.35;
}

export function CitizenMesh({ citizen, animationsSuppressed, onSelect }: CitizenMeshProps) {
  const groupRef = useRef<Group>(null);
  const y = terrainHeightAt(citizen.x, citizen.z) + 0.05;
  const moving = citizen.action === 'travel';

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;
    if (moving && !animationsSuppressed) {
      group.position.y = y + Math.abs(walkCycle(performance.now() * 0.001)) * 0.08;
    } else {
      group.position.y = y;
    }
  });

  const scale = citizen.selected ? 1.05 : 1;

  return (
    <group
      ref={groupRef}
      position={[citizen.x, y, citizen.z]}
      scale={scale}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(citizen.id);
      }}
    >
      {citizen.selected ? (
        <mesh position={[0, 2.3, 0]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial color="#f0d060" emissive="#806820" emissiveIntensity={0.5} />
        </mesh>
      ) : null}

      <mesh castShadow position={[0, 0.9, 0]}>
        <capsuleGeometry args={[0.22, 0.9, 4, 8]} />
        <meshStandardMaterial color={citizen.appearance.shirtColor} />
      </mesh>

      <mesh castShadow position={[0, 0.35, 0]}>
        <capsuleGeometry args={[0.2, 0.45, 4, 8]} />
        <meshStandardMaterial color={citizen.appearance.pantsColor} />
      </mesh>

      <mesh castShadow position={[0, 1.55, 0]}>
        <sphereGeometry args={[0.22, 10, 10]} />
        <meshStandardMaterial color={citizen.appearance.skinColor} />
      </mesh>

      <mesh castShadow position={[0, 1.78, -0.02]}>
        <boxGeometry args={[0.34, 0.12, 0.28]} />
        <meshStandardMaterial color={citizen.appearance.hairColor} />
      </mesh>
    </group>
  );
}
