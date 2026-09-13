/**
 * Citizen 3D figure — VIS-001 (spec §4.1, §30.9).
 *
 * Plain English: an original, lightweight low-poly humanoid assembled from shared
 * primitives (body, head, limbs). It reads the citizen's position/facing from the
 * read-only render snapshot and interpolates smoothly at low speed; at high speed
 * (animation suppressed) it snaps to the authoritative position. It never writes
 * simulation state (ARCH-002). Clicking it opens the inspector.
 */
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import { terrainHeightAt } from '@/world/townLayout';
import type { RenderCitizen } from './types';

interface CitizenProps {
  citizen: RenderCitizen;
  suppressed: boolean;
  selected: boolean;
  onSelect: () => void;
}

const SKIN = '#d8a07a';
const SHIRT = '#3f6f8f';
const PANTS = '#3a3f4a';
const HAIR = '#3b2a1d';

export function Citizen({ citizen, suppressed, selected, onSelect }: CitizenProps) {
  const groupRef = useRef<Group>(null);
  const walkClock = useRef(0);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const targetX = citizen.position.x;
    const targetZ = citizen.position.z;
    const y = terrainHeightAt(targetX, targetZ);

    if (suppressed) {
      group.position.set(targetX, y, targetZ);
    } else {
      const lerp = Math.min(1, delta * 8);
      const dx = targetX - group.position.x;
      const dz = targetZ - group.position.z;
      // Snap if the gap is large (e.g. first frame or a teleport), else ease.
      if (Math.hypot(dx, dz) > 6) {
        group.position.set(targetX, y, targetZ);
      } else {
        group.position.x += dx * lerp;
        group.position.z += dz * lerp;
        group.position.y = y;
      }
    }

    group.rotation.y = -citizen.facing;

    // Subtle walk bob only while travelling at normal speed.
    if (citizen.phase === 'travel' && !suppressed) {
      walkClock.current += delta * 8;
      group.position.y = y + Math.abs(Math.sin(walkClock.current)) * 0.08;
    }
  });

  return (
    <group
      ref={groupRef}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* Selection ring */}
      {selected && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.9, 1.15, 24]} />
          <meshStandardMaterial color="#e8c15a" emissive="#e8c15a" emissiveIntensity={0.5} />
        </mesh>
      )}
      {/* Legs */}
      <mesh position={[-0.16, 0.42, 0]} castShadow>
        <boxGeometry args={[0.22, 0.85, 0.26]} />
        <meshStandardMaterial color={PANTS} />
      </mesh>
      <mesh position={[0.16, 0.42, 0]} castShadow>
        <boxGeometry args={[0.22, 0.85, 0.26]} />
        <meshStandardMaterial color={PANTS} />
      </mesh>
      {/* Torso */}
      <mesh position={[0, 1.15, 0]} castShadow>
        <boxGeometry args={[0.6, 0.72, 0.34]} />
        <meshStandardMaterial color={SHIRT} />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.4, 1.15, 0]} castShadow>
        <boxGeometry args={[0.16, 0.66, 0.2]} />
        <meshStandardMaterial color={SHIRT} />
      </mesh>
      <mesh position={[0.4, 1.15, 0]} castShadow>
        <boxGeometry args={[0.16, 0.66, 0.2]} />
        <meshStandardMaterial color={SHIRT} />
      </mesh>
      {/* Head + hair */}
      <mesh position={[0, 1.72, 0]} castShadow>
        <boxGeometry args={[0.32, 0.34, 0.32]} />
        <meshStandardMaterial color={SKIN} />
      </mesh>
      <mesh position={[0, 1.92, -0.02]} castShadow>
        <boxGeometry args={[0.36, 0.12, 0.36]} />
        <meshStandardMaterial color={HAIR} />
      </mesh>
    </group>
  );
}
