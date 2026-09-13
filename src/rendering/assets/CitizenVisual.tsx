/**
 * M02 citizen presentation — shared Kenney CC0 character GLB with real clips (VIS-001).
 *
 * Plain English: One shared rig. The character model is loaded once and its
 * embedded animation clips (idle / walk / sit / interact / …) are played via an
 * AnimationMixer, chosen from the citizen's presentation pose. Simulation truth
 * (position/facing/needs/decisions) stays in the worker; this only interpolates
 * and animates presentation (ARCH-002). At high simulation speed the animation is
 * paused/snapped while the authoritative position keeps updating.
 */
import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { AnimationMixer, type AnimationAction, type Group, LoopRepeat, Mesh } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { useDiagnosticsStore } from '@/ui/stores/diagnosticsStore';
import { terrainHeightAt } from '@/world/townLayout';
import { MAT } from '../sharedMaterials';
import type { CitizenPose } from '../citizenPresentation';
import type { RenderCitizen } from '../types';
import { registerCitizenBody } from '../citizenBoundsRegistry';
import { KENNEY_ASSETS } from './EnvironmentAssetRegistry';

const ALEX_GLB = KENNEY_ASSETS.alexCharacter;
/** Base Kenney Alex scale — accepted gameplay framing since R7. */
const MODEL_SCALE = 0.02;

interface CitizenVisualProps {
  citizen: RenderCitizen;
  selected: boolean;
  animationsSuppressed: boolean;
  onSelect: (citizenId: string) => void;
}

/**
 * Map presentation pose → Kenney Alex clip names (32 embedded clips).
 * Prefer exact names so walk/sit/work read clearly in screenshots (R8).
 */
function pickClip(names: string[], pose: CitizenPose): string | null {
  const has = (name: string) => (names.includes(name) ? name : null);
  const find = (re: RegExp) => names.find((n) => re.test(n)) ?? null;

  if (pose === 'walk') {
    return has('walk') ?? find(/^walk$/i) ?? has('idle') ?? has('static');
  }
  if (pose === 'sit') {
    return has('sit') ?? find(/^sit$/i) ?? has('idle');
  }
  if (pose === 'work') {
    return (
      has('interact-right') ??
      has('pick-up') ??
      has('holding-right') ??
      has('interact-left') ??
      has('idle')
    );
  }
  return has('idle') ?? has('static') ?? names[0] ?? null;
}

export function CitizenVisual({ citizen, selected, animationsSuppressed, onSelect }: CitizenVisualProps) {
  const gltf = useLoader(GLTFLoader, ALEX_GLB);
  const rootRef = useRef<Group>(null);
  const bodyRef = useRef<Group>(null);
  const currentAction = useRef<AnimationAction | null>(null);
  const activeClipName = useRef<string | null>(null);
  const walkPhase = useRef(0);
  const setCitizenPresentationClip = useDiagnosticsStore((s) => s.setCitizenPresentationClip);
  const setCitizenPresentationPose = useDiagnosticsStore((s) => s.setCitizenPresentationPose);
  const { scene, mixer, actions, clipNames } = useMemo(() => {
    const cloned = cloneSkeleton(gltf.scene) as Group;
    cloned.traverse((child) => {
      if (child instanceof Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    const mix = new AnimationMixer(cloned);
    const acts: Record<string, AnimationAction> = {};
    for (const clip of gltf.animations) {
      const action = mix.clipAction(clip);
      action.enabled = true;
      action.setLoop(LoopRepeat, Infinity);
      acts[clip.name] = action;
    }
    return { scene: cloned, mixer: mix, actions: acts, clipNames: gltf.animations.map((c) => c.name) };
  }, [gltf]);

  useEffect(() => {
    registerCitizenBody(bodyRef.current);
    return () => registerCitizenBody(null);
  }, [scene]);

  useEffect(() => {
    setCitizenPresentationPose(citizen.pose);
  }, [citizen.pose, setCitizenPresentationPose]);

  useFrame((_, delta) => {
    const root = rootRef.current;
    if (!root) return;
    const y = terrainHeightAt(citizen.x, citizen.z);
    root.position.set(citizen.x, y, citizen.z);
    root.rotation.y = citizen.facingRadians;

    const clipName = pickClip(clipNames, citizen.pose);
    if (clipName !== activeClipName.current) {
      activeClipName.current = clipName;
      setCitizenPresentationClip(clipName);
      const next = clipName ? actions[clipName] : null;
      if (next && next !== currentAction.current) {
        next.reset().fadeIn(0.25).play();
        currentAction.current?.fadeOut(0.25);
        currentAction.current = next;
      }
    }

    if (animationsSuppressed) {
      return;
    }
    mixer.update(delta);

    // Procedural fallback bob only if the model shipped without clips.
    if (clipNames.length === 0 && bodyRef.current) {
      if (citizen.pose === 'walk') {
        walkPhase.current += delta * 8;
        bodyRef.current.position.y = Math.abs(Math.sin(walkPhase.current)) * 4;
      } else {
        bodyRef.current.position.y = 0;
      }
    }
  });

  return (
    <group
      ref={rootRef}
      position={[citizen.x, 0, citizen.z]}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(citizen.id);
      }}
    >
      {selected && (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
            <ringGeometry args={[1.05, 1.35, 24]} />
            <primitive object={MAT.selectRing} attach="material" />
          </mesh>
          <mesh position={[0, 3.1, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.34, 0.8, 5]} />
            <primitive object={MAT.selectRing} attach="material" />
          </mesh>
        </>
      )}
      <group ref={bodyRef} scale={MODEL_SCALE}>
        <primitive object={scene} />
      </group>
    </group>
  );
}
