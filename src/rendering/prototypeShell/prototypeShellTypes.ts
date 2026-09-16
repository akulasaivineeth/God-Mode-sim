/**
 * WF02 R13 — offline-authored prototype shell specs (presentation-only).
 */
export interface PrototypeShellDoorBinding {
  label: string;
  localX: number;
  localZ: number;
}

export interface PrototypeShellBounds {
  min: [number, number, number];
  max: [number, number, number];
  size: [number, number, number];
  triangles: number;
}

export interface PrototypeShellSpec {
  shellId: string;
  assetUrl: string;
  origin: { x: number; y: number; z: number };
  rotY: number;
  targetWidth: number;
  bounds: PrototypeShellBounds;
  doorBindings: PrototypeShellDoorBinding[];
  replacesBuildingIds: string[];
}
