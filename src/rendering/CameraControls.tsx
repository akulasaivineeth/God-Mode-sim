/**
 * Free camera — VIS-002.
 *
 * Plain English: Lets the player rotate, pan, and zoom the camera freely, plus
 * jump to preset framings (overview / angled / street). Camera movement is pure
 * presentation — it never affects simulation state (spec §4.2, ARCH-002), so it
 * keeps working even while the simulation is paused (UAT-TIME-001).
 *
 * Uses Three.js' built-in OrbitControls (shipped with the `three` package) to
 * avoid adding a dependency.
 */
import { useEffect, useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PerspectiveCamera, Vector3 } from 'three';
import { useDiagnosticsStore } from '@/ui/stores/diagnosticsStore';
import { getCitizenBody, getCitizenWorldBoundsFromRegistry } from './citizenBoundsRegistry';
import { registerEvidenceRendererContext } from './evidenceRendererRegistry';
import { computePortraitCameraFromBounds } from './evidencePortrait';
import { CAMERA_PRESETS, type CameraView } from './cameraPresets';

interface CameraControlsProps {
  view: CameraView;
  /** Bumping this re-applies the preset even if `view` is unchanged. */
  applyNonce: number;
}

export function CameraControls({ view, applyNonce }: CameraControlsProps) {
  const cameraOverride = useDiagnosticsStore((state) => state.cameraOverride);
  const cameraOverrideNonce = useDiagnosticsStore((state) => state.cameraOverrideNonce);
  const camera = useThree((state) => state.camera as PerspectiveCamera);
  const scene = useThree((state) => state.scene);
  const domElement = useThree((state) => state.gl.domElement);

  const controls = useMemo(() => {
    const orbit = new OrbitControls(camera, domElement);
    orbit.enableDamping = true;
    orbit.dampingFactor = 0.08;
    orbit.minDistance = 6;
    orbit.maxDistance = 180;
    // Keep the camera above ground for readable framing.
    orbit.maxPolarAngle = Math.PI * 0.49;
    orbit.panSpeed = 0.8;
    return orbit;
  }, [camera, domElement]);

  useEffect(() => {
    return () => {
      controls.dispose();
    };
  }, [controls]);

  useEffect(() => {
    const state = useDiagnosticsStore.getState();
    if (state.evidencePortraitMode && state.evidencePortraitOpts) {
      controls.minDistance = 1.2;
      return;
    }
    const preset = cameraOverride ?? CAMERA_PRESETS[view];
    // Evidence portrait framing needs <6 m; default OrbitControls minDistance would clamp it back out.
    controls.minDistance = cameraOverride ? 1.2 : 6;
    camera.position.set(...preset.position);
    controls.target.copy(new Vector3(...preset.target));
    controls.update();
  }, [view, applyNonce, cameraOverride, cameraOverrideNonce, camera, controls]);

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
      controls.minDistance = 1.2;
      controls.update();
      return;
    }
    // Re-apply every frame so Playwright portrait framing wins before screenshot capture.
    if (cameraOverride) {
      camera.position.set(...cameraOverride.position);
      controls.target.set(...cameraOverride.target);
      controls.update();
      return;
    }
    controls.update();
  });

  return null;
}
