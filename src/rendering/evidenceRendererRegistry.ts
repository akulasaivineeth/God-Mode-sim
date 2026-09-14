/**
 * Presentation-only registry for live renderer handles used by evidence harness (M02 R12).
 */
import type { Object3D, PerspectiveCamera } from 'three';

export interface EvidenceRendererContext {
  camera: PerspectiveCamera;
  scene: Object3D;
  width: number;
  height: number;
}

let rendererContext: EvidenceRendererContext | null = null;

export function registerEvidenceRendererContext(ctx: EvidenceRendererContext | null): void {
  rendererContext = ctx;
}

export function getEvidenceRendererContext(): EvidenceRendererContext | null {
  return rendererContext;
}
