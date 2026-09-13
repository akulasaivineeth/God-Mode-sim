/**
 * In-world signage — lightweight canvas texture planes (presentation only).
 */
import { useMemo } from 'react';
import { CanvasTexture, DoubleSide, MeshStandardMaterial } from 'three';

interface WorldSignProps {
  text: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  width?: number;
  height?: number;
  fontSize?: number;
  bg?: string;
  fg?: string;
}

export function WorldSign({
  text,
  position,
  rotation = [0, 0, 0],
  width = 2.4,
  height = 0.55,
  fontSize = 42,
  bg = '#f2e8d0',
  fg = '#3a3028',
}: WorldSignProps) {
  const material = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#8a7a68';
      ctx.lineWidth = 8;
      ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);
      ctx.fillStyle = fg;
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    }
    const tex = new CanvasTexture(canvas);
    tex.needsUpdate = true;
    return new MeshStandardMaterial({ map: tex, side: DoubleSide });
  }, [text, bg, fg, fontSize]);

  return (
    <mesh position={position} rotation={rotation} castShadow>
      <planeGeometry args={[width, height]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
