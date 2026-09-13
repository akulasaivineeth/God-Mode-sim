/**
 * Free camera — VIS-002.
 */
import { useEffect, useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Vector3 } from 'three';
import { CAMERA_PRESETS, EVIDENCE_CAMERAS, type CameraView } from './cameraPresets';

interface CameraControlsProps {
  view: CameraView;
  applyNonce: number;
}

export function CameraControls({ view, applyNonce }: CameraControlsProps) {
  const camera = useThree((state) => state.camera);
  const domElement = useThree((state) => state.gl.domElement);

  const controls = useMemo(() => {
    const orbit = new OrbitControls(camera, domElement);
    orbit.enableDamping = true;
    orbit.dampingFactor = 0.08;
    orbit.minDistance = 6;
    orbit.maxDistance = 180;
    orbit.maxPolarAngle = Math.PI * 0.49;
    orbit.panSpeed = 0.8;
    return orbit;
  }, [camera, domElement]);

  useEffect(() => {
    return () => {
      controls.dispose();
    };
  }, [controls]);

  const applyPreset = (position: [number, number, number], target: [number, number, number]) => {
    camera.position.set(...position);
    controls.target.copy(new Vector3(...target));
    controls.update();
  };

  useEffect(() => {
    const preset = CAMERA_PRESETS[view];
    applyPreset(preset.position, preset.target);
  }, [view, applyNonce, camera, controls]);

  useEffect(() => {
    window.__GODMODE_SET_EVIDENCE_CAMERA__ = (name: string) => {
      const preset = EVIDENCE_CAMERAS[name];
      if (preset) applyPreset(preset.position, preset.target);
    };
    return () => {
      delete window.__GODMODE_SET_EVIDENCE_CAMERA__;
    };
  }, [camera, controls]);

  useFrame(() => {
    controls.update();
  });

  return null;
}
