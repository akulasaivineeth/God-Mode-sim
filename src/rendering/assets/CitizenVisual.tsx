/**
 * M02 citizen presentation — Kenney CC0 character GLB (Quaternius blocked on itch.io).
 *
 * Plain English: One shared rig pipeline for Alex. Presentation poses from
 * citizenPresentation.ts; simulation truth stays in the worker.
 */
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useLoader } from '@react-three/fiber';
import { Mesh, type Group } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { terrainHeightAt } from '@/world/townLayout';
import type { CitizenPose } from '../citizenPresentation';
import { MAT } from '../sharedMaterials';
import type { RenderCitizen } from '../types';

import { KENNEY_ASSETS } from './EnvironmentAssetRegistry';

const ALEX_GLB = KENNEY_ASSETS.alexCharacter;

interface CitizenVisualProps {
  citizen: RenderCitizen;
  animationsSuppressed: boolean;
  onSelect: (citizenId: string) => void;
}

function applyPose(root: Group, pose: CitizenPose, t: number): void {
  root.position.y = 0;
  root.rotation.x = 0;
  switch (pose) {
    case 'walk': {
      const phase = Math.sin(t * Math.PI * 4);
      root.position.y = Math.abs(phase) * 0.04;
      root.rotation.x = 0.04;
      break;
    }
    case 'sit': {
      root.position.y = -0.35;
      root.rotation.x = -0.08;
      break;
    }
    case 'work': {
      root.rotation.x = 0.12 + Math.sin(t * 2.5) * 0.03;
      break;
    }
    default:
      root.rotation.x = Math.sin(t * 1.8) * 0.02;
  }
}

export function CitizenVisual({ citizen, animationsSuppressed, onSelect }: CitizenVisualProps) {
  const gltf = useLoader(GLTFLoader, ALEX_GLB);
  const bodyRef = useRef<Group>(null);
  const rootRef = useRef<Group>(null);
  const lastPose = useRef<CitizenPose>('idle');

  const model = useMemo(() => {
    const scene = gltf.scene.clone(true);
    scene.traverse((child) => {
      if (child instanceof Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return scene;
  }, [gltf]);

  const baseY = terrainHeightAt(citizen.x, citizen.z);
  const bodyScale = citizen.selected ? 1.05 : 1.0;

  useFrame(() => {
    const root = rootRef.current;
    const body = bodyRef.current;
    if (!root || !body) return;
    root.position.y = baseY;
    root.rotation.y = citizen.facingRadians;
    if (animationsSuppressed) {
      body.position.y = 0;
      body.rotation.x = 0;
      return;
    }
    if (lastPose.current !== citizen.pose) {
      body.position.y = 0;
      body.rotation.x = 0;
      lastPose.current = citizen.pose;
    }
    applyPose(body, citizen.pose, performance.now() * 0.001);
  });

  return (
    <group
      ref={rootRef}
      position={[citizen.x, baseY, citizen.z]}
      scale={bodyScale * 0.018}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(citizen.id);
      }}
    >
      {citizen.selected ? (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} scale={55}>
            <ringGeometry args={[0.42, 0.52, 24]} />
            <primitive object={MAT.selectRing} attach="material" />
          </mesh>
          <mesh position={[0, 95, 0]} rotation={[0, 0, Math.PI / 4]} scale={12}>
            <boxGeometry args={[0.18, 0.18, 0.18]} />
            <primitive object={MAT.selectRing} attach="material" />
          </mesh>
        </>
      ) : null}
      <group ref={bodyRef}>
        <primitive object={model} />
      </group>
    </group>
  );
}
