/**
 * Procedural stylized citizen mesh — VIS-001 / M02 shared humanoid pipeline.
 *
 * Plain English: One lightweight reusable body with idle/walk/sit/work poses,
 * path-facing travel orientation, and palette variation. Presentation only.
 */
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group, Mesh } from 'three';
import { terrainHeightAt } from '@/world/townLayout';
import type { CitizenPose } from './citizenPresentation';
import type { RenderCitizen } from './types';

interface CitizenMeshProps {
  citizen: RenderCitizen;
  animationsSuppressed: boolean;
  onSelect: (citizenId: string) => void;
}

interface LimbRefs {
  torso: Mesh | null;
  leftLeg: Mesh | null;
  rightLeg: Mesh | null;
  leftArm: Mesh | null;
  rightArm: Mesh | null;
  bodyGroup: Group | null;
}

function walkPhase(t: number): number {
  return Math.sin(t * Math.PI * 4);
}

function applyPose(
  refs: LimbRefs,
  pose: CitizenPose,
  t: number,
  baseTorsoY: number,
): void {
  const { torso, leftLeg, rightLeg, leftArm, rightArm, bodyGroup } = refs;
  if (!torso || !leftLeg || !rightLeg || !leftArm || !rightArm || !bodyGroup) return;

  bodyGroup.position.y = 0;
  torso.position.y = baseTorsoY;
  torso.rotation.x = 0;

  switch (pose) {
    case 'walk': {
      const phase = walkPhase(t);
      bodyGroup.position.y = Math.abs(phase) * 0.06;
      torso.rotation.x = 0.08;
      leftLeg.rotation.x = phase * 0.55;
      rightLeg.rotation.x = -phase * 0.55;
      leftArm.rotation.x = -phase * 0.35;
      rightArm.rotation.x = phase * 0.35;
      break;
    }
    case 'work': {
      const bob = Math.sin(t * 2.5) * 0.04;
      torso.rotation.x = 0.12 + bob;
      leftArm.rotation.x = -0.4 + bob;
      rightArm.rotation.x = -0.4 - bob;
      leftLeg.rotation.x = 0;
      rightLeg.rotation.x = 0;
      break;
    }
    case 'sit': {
      bodyGroup.position.y = -0.28;
      torso.position.y = baseTorsoY - 0.12;
      torso.rotation.x = -0.08;
      leftLeg.rotation.x = -1.35;
      rightLeg.rotation.x = -1.35;
      leftArm.rotation.x = -0.25;
      rightArm.rotation.x = -0.25;
      break;
    }
    default: {
      const breathe = Math.sin(t * 1.8) * 0.02;
      torso.rotation.x = breathe;
      leftLeg.rotation.x = 0;
      rightLeg.rotation.x = 0;
      leftArm.rotation.x = breathe * 0.5;
      rightArm.rotation.x = -breathe * 0.5;
      break;
    }
  }
}

function resetPose(refs: LimbRefs, baseTorsoY: number): void {
  const { torso, leftLeg, rightLeg, leftArm, rightArm, bodyGroup } = refs;
  if (!torso || !leftLeg || !rightLeg || !leftArm || !rightArm || !bodyGroup) return;
  bodyGroup.position.y = 0;
  torso.position.y = baseTorsoY;
  torso.rotation.x = 0;
  leftLeg.rotation.x = 0;
  rightLeg.rotation.x = 0;
  leftArm.rotation.x = 0;
  rightArm.rotation.x = 0;
}

export function CitizenMesh({ citizen, animationsSuppressed, onSelect }: CitizenMeshProps) {
  const rootRef = useRef<Group>(null);
  const bodyGroupRef = useRef<Group>(null);
  const torsoRef = useRef<Mesh>(null);
  const leftLegRef = useRef<Mesh>(null);
  const rightLegRef = useRef<Mesh>(null);
  const leftArmRef = useRef<Mesh>(null);
  const rightArmRef = useRef<Mesh>(null);
  const lastPoseRef = useRef<CitizenPose>('idle');

  const baseY = terrainHeightAt(citizen.x, citizen.z) + 0.05;
  const baseTorsoY = 0.95;
  const scale = citizen.selected ? 1.04 : 1;

  useFrame(() => {
    const root = rootRef.current;
    if (!root) return;

    root.position.y = baseY;
    root.rotation.y = citizen.facingRadians;

    const refs: LimbRefs = {
      torso: torsoRef.current,
      leftLeg: leftLegRef.current,
      rightLeg: rightLegRef.current,
      leftArm: leftArmRef.current,
      rightArm: rightArmRef.current,
      bodyGroup: bodyGroupRef.current,
    };

    if (animationsSuppressed) {
      resetPose(refs, baseTorsoY);
      return;
    }

    if (lastPoseRef.current !== citizen.pose) {
      resetPose(refs, baseTorsoY);
      lastPoseRef.current = citizen.pose;
    }

    applyPose(refs, citizen.pose, performance.now() * 0.001, baseTorsoY);
  });

  return (
    <group
      ref={rootRef}
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

      <group ref={bodyGroupRef}>
        <mesh ref={torsoRef} castShadow position={[0, baseTorsoY, 0]}>
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
    </group>
  );
}
