/**
 * Procedural stylized citizen mesh — VIS-001 / M02 shared humanoid pipeline.
 *
 * Plain English: Polished reusable body with idle/walk/sit/work poses, path-facing
 * travel, improved proportions/silhouette, and shared materials for performance.
 */
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshStandardMaterial } from 'three';
import type { Group, Mesh } from 'three';
import { terrainHeightAt } from '@/world/townLayout';
import type { CitizenPose } from './citizenPresentation';
import { MAT } from './sharedMaterials';
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
      bodyGroup.position.y = Math.abs(phase) * 0.05;
      torso.rotation.x = 0.06;
      leftLeg.rotation.x = phase * 0.6;
      rightLeg.rotation.x = -phase * 0.6;
      leftArm.rotation.x = -phase * 0.4;
      rightArm.rotation.x = phase * 0.4;
      break;
    }
    case 'work': {
      const bob = Math.sin(t * 2.5) * 0.03;
      torso.rotation.x = 0.1 + bob;
      leftArm.rotation.x = -0.5 + bob;
      rightArm.rotation.x = -0.5 - bob;
      leftLeg.rotation.x = 0;
      rightLeg.rotation.x = 0;
      break;
    }
    case 'sit': {
      bodyGroup.position.y = -0.32;
      torso.position.y = baseTorsoY - 0.14;
      torso.rotation.x = -0.1;
      leftLeg.rotation.x = -1.4;
      rightLeg.rotation.x = -1.4;
      leftArm.rotation.x = -0.3;
      rightArm.rotation.x = -0.3;
      break;
    }
    default: {
      const breathe = Math.sin(t * 1.8) * 0.015;
      torso.rotation.x = breathe;
      leftLeg.rotation.x = 0;
      rightLeg.rotation.x = 0;
      leftArm.rotation.x = breathe * 0.4;
      rightArm.rotation.x = -breathe * 0.4;
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

  const baseY = terrainHeightAt(citizen.x, citizen.z) + 0.02;
  const baseTorsoY = 1.08;
  const bodyScale = citizen.selected ? 1.28 : 1.22;

  const shirtMat = useMemo(
    () => new MeshStandardMaterial({ color: citizen.appearance.shirtColor, roughness: 0.8 }),
    [citizen.appearance.shirtColor],
  );
  const pantsMat = useMemo(
    () => new MeshStandardMaterial({ color: citizen.appearance.pantsColor, roughness: 0.85 }),
    [citizen.appearance.pantsColor],
  );
  const hairMat = useMemo(
    () => new MeshStandardMaterial({ color: citizen.appearance.hairColor, roughness: 0.9 }),
    [citizen.appearance.hairColor],
  );
  const skinMat = useMemo(() => {
    const mat = MAT.skin.clone();
    mat.color.set(citizen.appearance.skinColor);
    return mat;
  }, [citizen.appearance.skinColor]);

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
      scale={bodyScale}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(citizen.id);
      }}
    >
      {citizen.selected ? (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
            <ringGeometry args={[0.42, 0.52, 24]} />
            <primitive object={MAT.selectRing} attach="material" />
          </mesh>
          <mesh position={[0, 2.05, 0]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.18, 0.18, 0.18]} />
            <primitive object={MAT.selectRing} attach="material" />
          </mesh>
        </>
      ) : null}

      <group ref={bodyGroupRef}>
        {/* Torso — box for clearer silhouette */}
        <mesh ref={torsoRef} castShadow position={[0, baseTorsoY, 0]}>
          <boxGeometry args={[0.42, 0.72, 0.28]} />
          <primitive object={shirtMat} attach="material" />
        </mesh>

        {/* Legs */}
        <mesh ref={leftLegRef} castShadow position={[-0.11, 0.42, 0]}>
          <boxGeometry args={[0.14, 0.48, 0.16]} />
          <primitive object={pantsMat} attach="material" />
        </mesh>
        <mesh ref={rightLegRef} castShadow position={[0.11, 0.42, 0]}>
          <boxGeometry args={[0.14, 0.48, 0.16]} />
          <primitive object={pantsMat} attach="material" />
        </mesh>

        {/* Shoes — ground contact */}
        <mesh castShadow position={[-0.11, 0.06, 0.04]}>
          <boxGeometry args={[0.16, 0.1, 0.24]} />
          <primitive object={MAT.shoe} attach="material" />
        </mesh>
        <mesh castShadow position={[0.11, 0.06, 0.04]}>
          <boxGeometry args={[0.16, 0.1, 0.24]} />
          <primitive object={MAT.shoe} attach="material" />
        </mesh>

        {/* Arms */}
        <mesh ref={leftArmRef} castShadow position={[-0.3, 1.08, 0]} rotation={[0, 0, 0.12]}>
          <boxGeometry args={[0.12, 0.42, 0.14]} />
          <primitive object={shirtMat} attach="material" />
        </mesh>
        <mesh ref={rightArmRef} castShadow position={[0.3, 1.08, 0]} rotation={[0, 0, -0.12]}>
          <boxGeometry args={[0.12, 0.42, 0.14]} />
          <primitive object={shirtMat} attach="material" />
        </mesh>

        {/* Head */}
        <mesh castShadow position={[0, 1.68, 0]}>
          <sphereGeometry args={[0.22, 10, 10]} />
          <primitive object={skinMat} attach="material" />
        </mesh>

        {/* Hair */}
        <mesh castShadow position={[0, 1.82, -0.03]}>
          <boxGeometry args={[0.34, 0.14, 0.3]} />
          <primitive object={hairMat} attach="material" />
        </mesh>
      </group>
    </group>
  );
}
