/**
 * Free camera — VIS-002.
 *
 * Orbit / pan / zoom for normal play plus preset jumps. Presentation only — never
 * affects simulation (ARCH-002). Evidence portrait mode is isolated: it may re-pin
 * the lens every frame; player mode never does after the user takes control.
 */
import { useEffect, useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MOUSE, PerspectiveCamera, TOUCH } from 'three';
import { useDiagnosticsStore } from '@/ui/stores/diagnosticsStore';
import { getCitizenBody, getCitizenWorldBoundsFromRegistry } from './citizenBoundsRegistry';
import {
  applyPlayerCameraLimits,
  clampOrbitTarget,
  configureOrbitControls,
  registerPlayerCameraControls,
} from './cameraPlayerControl';
import { registerEvidenceRendererContext } from './evidenceRendererRegistry';
import { computePortraitCameraFromBounds } from './evidencePortrait';
import { CAMERA_PRESETS, type CameraView } from './cameraPresets';

interface CameraControlsProps {
  view: CameraView;
  /** Bumping this re-applies the preset even if `view` is unchanged. */
  applyNonce: number;
}

export function CameraControls({ view, applyNonce }: CameraControlsProps) {
  const cameraOverrideNonce = useDiagnosticsStore((state) => state.cameraOverrideNonce);
  const camera = useThree((state) => state.camera as PerspectiveCamera);
  const scene = useThree((state) => state.scene);
  const domElement = useThree((state) => state.gl.domElement);

  const controls = useMemo(() => {
    const orbit = new OrbitControls(camera, domElement);
    configureOrbitControls(orbit);
    orbit.mouseButtons = {
      LEFT: MOUSE.ROTATE,
      MIDDLE: MOUSE.PAN,
      RIGHT: MOUSE.PAN,
    };
    orbit.touches = {
      ONE: TOUCH.ROTATE,
      TWO: TOUCH.DOLLY_PAN,
    };
    return orbit;
  }, [camera, domElement]);

  useEffect(() => {
    registerPlayerCameraControls(controls);
    return () => {
      registerPlayerCameraControls(null);
      controls.dispose();
    };
  }, [controls]);

  useEffect(() => {
    const state = useDiagnosticsStore.getState();
    if (state.evidencePortraitMode) {
      return;
    }

    const preset = state.cameraOverride ?? CAMERA_PRESETS[view];
    applyPlayerCameraLimits(controls, Boolean(state.cameraOverride));
    camera.position.set(...preset.position);
    controls.target.set(...preset.target);
    clampOrbitTarget(controls.target);
    controls.update();
  }, [view, applyNonce, cameraOverrideNonce, camera, controls]);

  useFrame(() => {
    registerEvidenceRendererContext({
      camera,
      scene,
      width: domElement.clientWidth,
      height: domElement.clientHeight,
    });

    const state = useDiagnosticsStore.getState();
    const body = getCitizenBody();
    const cachedBounds = getCitizenWorldBoundsFromRegistry();

    if (state.evidencePortraitMode && state.evidencePortraitOpts && (body || cachedBounds)) {
      const frame = computePortraitCameraFromBounds(
        body,
        camera,
        scene,
        domElement.clientWidth,
        domElement.clientHeight,
        state.evidencePortraitOpts,
      );
      camera.position.set(...frame.position);
      controls.target.set(...frame.target);
      applyPlayerCameraLimits(controls, true);
      controls.update();
      return;
    }

    applyPlayerCameraLimits(controls, false);
    clampOrbitTarget(controls.target);
    controls.update();
  });

  return null;
}
