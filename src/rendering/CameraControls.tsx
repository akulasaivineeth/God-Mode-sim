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
import { Vector3 } from 'three';
import { useDiagnosticsStore } from '@/ui/stores/diagnosticsStore';
import { CAMERA_PRESETS, type CameraView } from './cameraPresets';

interface CameraControlsProps {
  view: CameraView;
  /** Bumping this re-applies the preset even if `view` is unchanged. */
  applyNonce: number;
}

export function CameraControls({ view, applyNonce }: CameraControlsProps) {
  const cameraOverride = useDiagnosticsStore((state) => state.cameraOverride);
  const cameraOverrideNonce = useDiagnosticsStore((state) => state.cameraOverrideNonce);
  const camera = useThree((state) => state.camera);
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
    const preset = cameraOverride ?? CAMERA_PRESETS[view];
    camera.position.set(...preset.position);
    controls.target.copy(new Vector3(...preset.target));
    controls.update();
  }, [view, applyNonce, cameraOverride, cameraOverrideNonce, camera, controls]);

  useFrame(() => {
    controls.update();
  });

  return null;
}
