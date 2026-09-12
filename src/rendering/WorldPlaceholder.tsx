import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';
import type { RenderSnapshot } from './types';

interface WorldPlaceholderProps {
  renderSnapshot: RenderSnapshot | null;
}

export function WorldPlaceholder({ renderSnapshot }: WorldPlaceholderProps) {
  const meshRef = useRef<Mesh>(null);
  const phase = renderSnapshot?.visualPhase ?? 0;

  useFrame((_, delta) => {
    if (!meshRef.current) {
      return;
    }
    meshRef.current.rotation.y += delta * (0.5 + phase);
    meshRef.current.position.y = 0.5 + Math.sin(phase * Math.PI * 2) * 0.1;
  });

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#2f3b2f" />
      </mesh>
      <mesh ref={meshRef} castShadow position={[0, 0.5, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#6ea8d9" />
      </mesh>
      <ambientLight intensity={0.45} />
      <directionalLight position={[5, 8, 3]} intensity={1.1} castShadow />
    </group>
  );
}
