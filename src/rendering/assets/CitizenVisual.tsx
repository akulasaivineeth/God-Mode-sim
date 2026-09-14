/**
 * M02 citizen presentation — shared Kenney CC0 character GLB with real clips (VIS-001).
 *
 * Plain English: One shared rig. The character model is loaded once and its
 * embedded animation clips (idle / walk / sit / interact / …) are played via an
 * AnimationMixer, chosen from the citizen's presentation pose. Simulation truth
 * (position/facing/needs/decisions) stays in the worker; this only interpolates
 * and animates presentation (ARCH-002). At high simulation speed the animation is
 * paused/snapped while the authoritative position keeps updating.
 *
 * M02 closure: model scale is derived from the GLB bounding box (~1.8 m tall).
 * Selection chrome is a subtle ground ring only — the humanoid is the subject.
 */
import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import {
  AnimationMixer,
  type AnimationAction,
  type Group,
  LoopRepeat,
  Mesh,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { useDiagnosticsStore } from '@/ui/stores/diagnosticsStore';
import { terrainHeightAt } from '@/world/townLayout';
import { MAT } from '../sharedMaterials';
import type { CitizenPose } from '../citizenPresentation';
import { layoutCitizenModelFromObject } from '../citizenModelScale';
import { registerPresentationControls } from '../citizenPresentationControl';
import type { RenderCitizen } from '../types';
import { registerCitizenBody, setCitizenWorldBounds } from '../citizenBoundsRegistry';
import { getCitizenWorldBounds } from '../evidencePortrait';
import { KENNEY_ASSETS } from './EnvironmentAssetRegistry';

const ALEX_GLB = KENNEY_ASSETS.alexCharacter;

interface CitizenVisualProps {
  citizen: RenderCitizen;
  selected: boolean;
  animationsSuppressed: boolean;
  onSelect: (citizenId: string) => void;
}

function pickClip(names: string[], pose: CitizenPose): string | null {
  const has = (name: string) => (names.includes(name) ? name : null);
  const find = (re: RegExp) => names.find((n) => re.test(n)) ?? null;

  if (pose === 'walk') {
    return has('walk') ?? find(/^walk$/i) ?? has('idle') ?? has('static');
  }
  if (pose === 'sit') {
    // M02 vertical slice: seated/eating must read as sit, distinct from standing interact/work.
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
  const setCitizenPresentationClipTime = useDiagnosticsStore((s) => s.setCitizenPresentationClipTime);
  const setCitizenPresentationPose = useDiagnosticsStore((s) => s.setCitizenPresentationPose);
  const evidencePortraitMode = useDiagnosticsStore((s) => s.evidencePortraitMode);

  const { scene, mixer, actions, clipNames, modelScale, footOffsetY } = useMemo(() => {
    const cloned = cloneSkeleton(gltf.scene) as Group;
    cloned.traverse((child) => {
      if (child instanceof Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    const layout = layoutCitizenModelFromObject(cloned);
    const mix = new AnimationMixer(cloned);
    const acts: Record<string, AnimationAction> = {};
    for (const clip of gltf.animations) {
      const action = mix.clipAction(clip);
      action.enabled = true;
      action.setLoop(LoopRepeat, Infinity);
      acts[clip.name] = action;
    }
    return {
      scene: cloned,
      mixer: mix,
      actions: acts,
      clipNames: gltf.animations.map((c) => c.name),
      modelScale: layout.scale,
      footOffsetY: layout.footOffsetY,
    };
  }, [gltf]);

  useEffect(() => {
    registerPresentationControls({
      seekClipPhase: (phase) => {
        const action = currentAction.current;
        if (!action) return 0;
        const duration = action.getClip().duration || 1;
        const normalized = ((phase % 1) + 1) % 1;
        action.time = normalized * duration;
        action.paused = false;
        mixer.update(0);
        setCitizenPresentationClipTime(action.time);
        return action.time;
      },
      getActiveClipDuration: () => currentAction.current?.getClip().duration ?? 0,
      advanceMixer: (deltaSeconds) => {
        mixer.update(deltaSeconds);
        setCitizenPresentationClipTime(currentAction.current?.time ?? 0);
      },
    });
    return () => {
      registerPresentationControls(null);
      registerCitizenBody(null);
    };
  }, [mixer, setCitizenPresentationClipTime]);

  useEffect(() => {
    setCitizenPresentationPose(citizen.pose);
  }, [citizen.pose, setCitizenPresentationPose]);

  useFrame((_, delta) => {
    const root = rootRef.current;
    if (!root) return;
    const y = terrainHeightAt(citizen.x, citizen.z);
    root.position.set(citizen.x, y, citizen.z);
    root.rotation.y = citizen.facingRadians;

    // Read pose from the latest snapshot so clip selection keeps up during fast sim steps.
    const liveCitizen =
      useDiagnosticsStore.getState().renderSnapshot?.citizens?.[0] ?? citizen;
    const livePose = liveCitizen.pose ?? citizen.pose;
    const clipName = pickClip(clipNames, livePose);
    if (clipName && clipName !== activeClipName.current) {
      activeClipName.current = clipName;
      setCitizenPresentationClip(clipName);
      const next = actions[clipName];
      if (next && next !== currentAction.current) {
        next.reset().fadeIn(0.12).play();
        currentAction.current?.fadeOut(0.12);
        currentAction.current = next;
      }
    }

    if (!animationsSuppressed) {
      mixer.update(delta);
      setCitizenPresentationClipTime(currentAction.current?.time ?? 0);
    }

    if (bodyRef.current) {
      registerCitizenBody(bodyRef.current);
      setCitizenWorldBounds(getCitizenWorldBounds(bodyRef.current));
    }

    if (animationsSuppressed) {
      return;
    }

    if (clipNames.length === 0 && bodyRef.current) {
      if (citizen.pose === 'walk') {
        walkPhase.current += delta * 8;
        bodyRef.current.position.y = footOffsetY + Math.abs(Math.sin(walkPhase.current)) * 0.08;
      } else {
        bodyRef.current.position.y = footOffsetY;
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
      {selected && !evidencePortraitMode && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
          <ringGeometry args={[0.42, 0.58, 32]} />
          <primitive object={MAT.selectRing} attach="material" />
        </mesh>
      )}
      <group
        ref={(node) => {
          bodyRef.current = node;
          registerCitizenBody(node);
        }}
        scale={modelScale}
        position={[0, footOffsetY, 0]}
      >
        <primitive object={scene} />
      </group>
    </group>
  );
}
